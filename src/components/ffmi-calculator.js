"use client";
import React, { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { renderWeightInput, renderMetricHeight, renderImperialHeight, renderBodyFatInput, renderFFMIInput, renderCompositionLock, renderAgeInput, renderUnitSelect, renderSexSelect, renderProjectionYears, renderTrainingLevelInput, renderOptions, renderCurrentStats, renderFatLossProjection, ShareButton } from './ffmi-calculator-form-ui';
import { renderBackgroundAndSources } from './ffmi-background-sources';
import {
    DEFAULT_METRICS,
    UNITS,
    calculateProjection,
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

const roundCompositionValue = (value) => Math.round(value * 100) / 100;
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
        metrics: { ...DEFAULT_METRICS },
        ffmi: DEFAULT_FFMI,
    });
    const [compositionLock, setCompositionLock] = useState(null);
    const [isInitialized, setIsInitialized] = useState(false);
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

        const parsedMetrics = parseMetrics(window.location.search, isMobile);
        /* eslint-disable react-hooks/set-state-in-effect -- URL initialization requires browser-only state after hydration. */
        setInputs({
            metrics: parsedMetrics,
            ffmi: roundCompositionValue(calculateCurrentFFMI(parsedMetrics)),
        });
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
        () => calculateProjection(projectedMetrics),
        [projectedMetrics],
    );

    const handleInputChange = (event) => {
        const { name, value } = event.target;

        setInputs(prev => {
            if (compositionLock === name) return prev;

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
                    next.metrics = {
                        ...prev.metrics,
                        weight: roundCompositionValue(
                            calculateWeightFromFFMI(value, normalized),
                        ),
                    };
                }
                return next;
            }

            const updates = {
                ...prev.metrics,
                [name]: value,
            };

            if (name === 'feet' || name === 'inches') {
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
                if (value === UNITS.IMPERIAL) {
                    updates.height = convertHeightToImperial(normalized.height);
                    updates.weight = convertWeightToImperial(normalized.weight);
                    updates.feet = Math.floor(updates.height / 12);
                    updates.inches = Math.round((updates.height % 12) * 100) / 100;
                } else {
                    updates.height = convertHeightToMetric(normalized.height);
                    updates.weight = convertWeightToMetric(normalized.weight);
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
            if (!compositionFields.includes(name) || !isMetricsValid(nextMetrics)) {
                return { ...prev, metrics: nextMetrics };
            }

            let normalized = normalizeMetrics(nextMetrics);
            if (compositionLock === 'ffmi' && isFFMIValid(prev.ffmi)) {
                if (name === 'weight') {
                    nextMetrics.bodyFat = roundCompositionValue(
                        calculateBodyFatFromFFMI(prev.ffmi, normalized),
                    );
                } else {
                    nextMetrics.weight = roundCompositionValue(
                        calculateWeightFromFFMI(prev.ffmi, normalized),
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
                    <CardTitle className="text-center sm:text-left" id="calculator-title">
                        Max Lean Mass Gained Per Month Calculator
                    </CardTitle>
                    <ShareButton
                        metrics={validMetrics ?? projectedMetrics}
                        disabled={!isInitialized || !validMetrics}
                    />
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
                                ...DEFAULT_METRICS,
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
                {renderBackgroundAndSources()}
                </fieldset>
            </CardContent>
        </Card>
    );
}
