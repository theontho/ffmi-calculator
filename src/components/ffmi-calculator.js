"use client";
import React, { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { renderWeightInput, renderMetricHeight, renderImperialHeight, renderBodyFatInput, renderFFMIInput, renderCompositionLock, renderAgeInput, renderUnitSelect, renderSexSelect, renderProjectionYears, renderTrainingLevelInput, renderOptions, renderCurrentStats, renderFatLossProjection, ShareButton } from './ffmi-calculator-form-ui';
import { renderBackgroundAndSources } from './ffmi-background-sources';
import { LocaleDefaultsTable } from './locale-defaults-table';
import {
    getLocaleDefaultProfile,
    getPopulationDefaultProfile,
} from '@/lib/locale-defaults.mjs';
import {
    DEFAULT_METRICS,
    SEX,
    UNITS,
    calculateProjection,
    calculateProjectionSensitivity,
    calculateBodyFatFromFFMI,
    calculateCurrentFFMI,
    calculateWeightFromFFMI,
    convertHeightToImperial,
    convertHeightToMetric,
    convertWeightToImperial,
    convertWeightToMetric,
    isFFMIValid,
    isMetricsValid,
    normalizeMetrics,
    parseMetrics,
    serializeMetrics,
    splitPoundsIntoStone,
    usesImperialHeight,
    usesPoundWeight,
} from '@/lib/ffmi-calculator.mjs';

const CalculatorCharts = dynamic(
    () => import('./ffmi-calculator-charts'),
    {
        ssr: false,
        loading: () => (
            <div className="h-96 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
        ),
    },
);

/** @typedef {typeof DEFAULT_METRICS & {
 *   stones?: number | string,
 *   stonePounds?: number | string
 * }} CalculatorMetrics
 */

const roundCompositionValue = (value) => Math.round(value * 100) / 100;
const synchronizeStoneWeight = (metrics, weight) => {
    if (metrics.unit !== UNITS.UK) return { ...metrics, weight };
    const parts = splitPoundsIntoStone(weight);
    return {
        ...metrics,
        weight,
        stones: parts.stones,
        stonePounds: parts.pounds,
    };
};
const DEFAULT_FFMI = roundCompositionValue(calculateCurrentFFMI(DEFAULT_METRICS));

const getValidCompositionMetrics = (metrics, ffmi) => {
    if (!isMetricsValid(metrics) || !isFFMIValid(ffmi)) return null;

    const normalized = normalizeMetrics(metrics);
    const derivedFFMI = calculateCurrentFFMI(normalized);
    return Math.abs(derivedFFMI - Number(ffmi)) <= 0.03 ? normalized : null;
};

const useDebouncedValidValue = (value, delay, initialValue) => {
    const [debouncedValue, setDebouncedValue] = useState(initialValue);

    useEffect(() => {
        if (!value) return;

        const timeout = window.setTimeout(() => setDebouncedValue(value), delay);
        return () => window.clearTimeout(timeout);
    }, [delay, value]);

    return debouncedValue;
};

const useIsMobile = () => {
    const [isMobile, setIsMobile] = useState(
        /** @type {boolean | null} */ (null),
    );

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 640); // 640px is Tailwind's sm breakpoint
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    return isMobile;
};

export function MuscleGainCalculator() {
    const isMobile = useIsMobile();
    const [inputs, setInputs] = useState({
        metrics: /** @type {CalculatorMetrics} */ ({ ...DEFAULT_METRICS }),
        ffmi: DEFAULT_FFMI,
    });
    const [compositionLock, setCompositionLock] = useState(null);
    const [isInitialized, setIsInitialized] = useState(false);
    const [localeProfile, setLocaleProfile] = useState(
        /** @type {ReturnType<typeof getLocaleDefaultProfile> | null} */ (null),
    );
    const metrics = inputs.metrics;
    const ffmiInput = inputs.ffmi;
    const setMetrics = (updater) => {
        setInputs(prev => ({
            ...prev,
            metrics: typeof updater === 'function'
                ? updater(prev.metrics)
                : updater,
        }));
    };
    const validMetrics = useMemo(
        () => getValidCompositionMetrics(metrics, ffmiInput),
        [ffmiInput, metrics],
    );
    const projectedMetrics = useDebouncedValidValue(
        validMetrics,
        100,
        DEFAULT_METRICS,
    );

    useEffect(() => {
        if (isMobile === null || isInitialized) return;

        const urlParams = new URLSearchParams(window.location.search);
        const requestedSex = urlParams.get('sex');
        const initialSex =
            requestedSex === SEX.MALE || requestedSex === SEX.FEMALE
            ? requestedSex
            : DEFAULT_METRICS.sex;
        const browserLocale =
            navigator.languages?.[0] ?? navigator.language ?? 'en-US';
        const initialLocaleProfile = getLocaleDefaultProfile(
            browserLocale,
            initialSex,
        );
        const parsedMetrics = parseMetrics(
            window.location.search,
            isMobile,
            initialLocaleProfile.metrics,
        );
        /* eslint-disable react-hooks/set-state-in-effect -- URL initialization requires browser-only state after hydration. */
        setInputs({
            metrics: parsedMetrics,
            ffmi: roundCompositionValue(calculateCurrentFFMI(parsedMetrics)),
        });
        setLocaleProfile(initialLocaleProfile);
        setIsInitialized(true);
        /* eslint-enable react-hooks/set-state-in-effect */
    }, [isInitialized, isMobile]);

    useEffect(() => {
        if (!isInitialized) return;

        const newUrl = `${window.location.pathname}?${serializeMetrics(projectedMetrics)}`;
        window.history.replaceState({}, '', newUrl);
    }, [isInitialized, projectedMetrics]);

    const ffmiData = useMemo(
        () => validMetrics ? calculateProjection(validMetrics) : [],
        [validMetrics],
    );
    const chartData = useMemo(
        () => calculateProjectionSensitivity(projectedMetrics),
        [projectedMetrics],
    );

    const applyLocaleDefaults = (region, sex) => {
        if (!localeProfile) return;

        const nextProfile = {
            ...getPopulationDefaultProfile(
            region,
            sex,
            undefined,
            localeProfile.locale,
            ),
            detectedRegion: localeProfile.detectedRegion ?? localeProfile.region,
        };
        const nextMetrics = {
            ...nextProfile.metrics,
            years: isMobile ? 2 : nextProfile.metrics.years,
        };
        setLocaleProfile(nextProfile);
        setCompositionLock(null);
        setInputs({
            metrics: nextMetrics,
            ffmi: roundCompositionValue(calculateCurrentFFMI(nextMetrics)),
        });
    };

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        const compositionFieldName =
            name === 'stones' || name === 'stonePounds' ? 'weight' : name;

        setInputs(prev => {
            if (compositionLock === compositionFieldName) return prev;

            if (name === 'ffmi') {
                const next = { ...prev, ffmi: value };
                if (!isFFMIValid(value) || !isMetricsValid(prev.metrics)) return next;

                const normalized = normalizeMetrics(prev.metrics);
                if (compositionLock === 'weight') {
                    next.metrics = {
                        ...prev.metrics,
                        bodyFat: roundCompositionValue(
                            calculateBodyFatFromFFMI(value, normalized),
                        ),
                    };

                } else {
                    const weight = roundCompositionValue(
                        calculateWeightFromFFMI(value, normalized),
                    );
                    next.metrics = {
                        ...synchronizeStoneWeight(prev.metrics, weight),
                    };
                }
                return next;
            }

            const updates = {
                ...prev.metrics,
                [name]: value,
            };

            if (name === 'stones' || name === 'stonePounds') {
                const stones = Number(updates.stones);
                const stonePounds = Number(updates.stonePounds);
                if (Number.isFinite(stones) && Number.isFinite(stonePounds)) {
                    updates.weight = stones * 14 + stonePounds;
                }
            }
            else if (name === 'weight' && prev.metrics.unit === UNITS.UK) {
                const parts = splitPoundsIntoStone(Number(value));
                updates.stones = parts.stones;
                updates.stonePounds = parts.pounds;
            }
            else if (name === 'feet' || name === 'inches') {
                const feet = Number(updates.feet);
                const inches = Number(updates.inches);
                if (Number.isFinite(feet) && Number.isFinite(inches)) {
                    updates.height = feet * 12 + inches;
                }
            }
            else if (name === 'unit') {
                if (!isMetricsValid(prev.metrics)) {
                    return { ...prev, metrics: updates };
                }

                const normalized = normalizeMetrics(prev.metrics);
                const heightCm = usesImperialHeight(normalized.unit)
                    ? convertHeightToMetric(normalized.height)
                    : normalized.height;
                const weightKg = usesPoundWeight(normalized.unit)
                    ? convertWeightToMetric(normalized.weight)
                    : normalized.weight;
                if (value === UNITS.METRIC) {
                    updates.height = heightCm;
                    updates.weight = weightKg;
                    updates.stones = undefined;
                    updates.stonePounds = undefined;
                } else {
                    updates.height = convertHeightToImperial(heightCm);
                    updates.weight = convertWeightToImperial(weightKg);
                    updates.feet = Math.floor(updates.height / 12);
                    updates.inches = Math.round((updates.height % 12) * 100) / 100;
                    if (value === UNITS.UK) {
                        const parts = splitPoundsIntoStone(updates.weight);
                        updates.stones = parts.stones;
                        updates.stonePounds = parts.pounds;
                    } else {
                        updates.stones = undefined;
                        updates.stonePounds = undefined;
                    }
                }
            }

            const nextMetrics = {
                ...updates,
                weight: typeof updates.weight === 'number'
                    ? Math.round(updates.weight * 100) / 100
                    : updates.weight,
                height: typeof updates.height === 'number'
                    ? Math.round(updates.height * 100) / 100
                    : updates.height,
            };

            const compositionFields = ['weight', 'bodyFat', 'height', 'feet', 'inches'];
            if (
                !compositionFields.includes(compositionFieldName) ||
                !isMetricsValid(nextMetrics)
            ) {
                return { ...prev, metrics: nextMetrics };
            }

            let normalized = normalizeMetrics(nextMetrics);
            if (compositionLock === 'ffmi' && isFFMIValid(prev.ffmi)) {
                if (compositionFieldName === 'weight') {
                    nextMetrics.bodyFat = roundCompositionValue(
                        calculateBodyFatFromFFMI(prev.ffmi, normalized),
                    );
                } else {
                    const weight = roundCompositionValue(
                        calculateWeightFromFFMI(prev.ffmi, normalized),
                    );
                    Object.assign(
                        nextMetrics,
                        synchronizeStoneWeight(nextMetrics, weight),
                    );
                }
                return { ...prev, metrics: nextMetrics };
            }

            normalized = normalizeMetrics(nextMetrics);
            return {
                metrics: nextMetrics,
                ffmi: roundCompositionValue(calculateCurrentFFMI(normalized)),
            };
        });
    };

    return (
        <Card
            aria-busy={!isInitialized}
            inert={!isInitialized ? true : undefined}
            className="w-full max-w-none mx-0 rounded-none sm:rounded-lg dark:bg-gray-900 dark:text-gray-100"
        >
            <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <CardTitle className="text-center sm:text-left" id="calculator-title">
                            FFMI, Muscle Gain &amp; Fat-Loss Calculator
                        </CardTitle>
                        <p className="mt-1 max-w-2xl text-center text-sm text-gray-600 sm:text-left dark:text-gray-300">
                            Estimate current body composition, then explore evidence-based muscle-gain and dynamic weight-loss projections.
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-end">
                        <Button asChild variant="outline" size="icon">
                            <a
                                href="https://github.com/theontho/ffmi-calculator"
                                target="_blank"
                                rel="noopener"
                                aria-label="View source on GitHub"
                                title="View source on GitHub"
                            >
                                <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                                    <path d="M8 0C3.58 0 0 3.67 0 8.2c0 3.62 2.29 6.69 5.47 7.77.4.08.55-.18.55-.39 0-.19-.01-.84-.01-1.52-2.01.38-2.53-.5-2.69-.96-.09-.23-.48-.96-.82-1.15-.28-.16-.68-.56-.01-.57.63-.01 1.08.59 1.23.83.72 1.23 1.87.88 2.33.67.07-.53.28-.88.51-1.08-1.78-.21-3.64-.91-3.64-4.05 0-.89.31-1.63.82-2.2-.08-.21-.36-1.04.08-2.17 0 0 .67-.22 2.2.84A7.4 7.4 0 0 1 8 3.93c.68 0 1.36.09 2 .27 1.53-1.07 2.2-.84 2.2-.84.44 1.13.16 1.96.08 2.17.51.57.82 1.3.82 2.2 0 3.15-1.87 3.84-3.65 4.05.29.25.54.74.54 1.5 0 1.08-.01 1.95-.01 2.22 0 .21.15.47.55.39A8.2 8.2 0 0 0 16 8.2C16 3.67 12.42 0 8 0Z" />
                                </svg>
                            </a>
                        </Button>
                        <ShareButton
                            metrics={validMetrics ?? projectedMetrics}
                            disabled={!isInitialized || !validMetrics}
                        />
                    </div>
                </div>
            </CardHeader>
            <CardContent aria-labelledby="calculator-title">
                <fieldset disabled={!isInitialized} className="contents">
                <CalculatorCharts
                    chartData={chartData}
                    projectedMetrics={projectedMetrics}
                    validMetrics={validMetrics}
                />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 mt-6">
                    <div className="space-y-4 md:col-span-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                {renderCompositionLock(compositionLock, setCompositionLock)}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {renderFFMIInput(ffmiInput, handleInputChange, compositionLock === 'ffmi')}
                                    {renderWeightInput(metrics, handleInputChange, compositionLock === 'weight')}
                                    {renderBodyFatInput(metrics, handleInputChange, compositionLock === 'bodyFat')}
                                </div>
                            </div>
                            {metrics.unit === UNITS.METRIC
                                ? renderMetricHeight(metrics, handleInputChange)
                                : renderImperialHeight(metrics, handleInputChange)}
                            {renderAgeInput(metrics, handleInputChange)}
                            {renderUnitSelect(metrics, handleInputChange)}
                            {renderSexSelect(metrics, handleInputChange)}
                            {renderProjectionYears(metrics, handleInputChange)}
                            {renderTrainingLevelInput(metrics, handleInputChange)}
                            {renderOptions(metrics, setMetrics)}
                        </div>
                    </div>
                    <div className="space-y-4">
                        {renderCurrentStats(ffmiData, validMetrics, () => {
                            const resetMetrics = {
                                ...(localeProfile?.metrics ?? DEFAULT_METRICS),
                                years: isMobile ? 2 : DEFAULT_METRICS.years,
                            };
                            setInputs({
                                metrics: resetMetrics,
                                ffmi: roundCompositionValue(
                                    calculateCurrentFFMI(resetMetrics),
                                ),
                            });
                        }, Boolean(validMetrics))}
                    </div>
                </div>
                {validMetrics && renderFatLossProjection(validMetrics)}
                <LocaleDefaultsTable
                    profile={localeProfile}
                    onApply={applyLocaleDefaults}
                />
                {renderBackgroundAndSources()}
                </fieldset>
            </CardContent>
        </Card>
    );
}
