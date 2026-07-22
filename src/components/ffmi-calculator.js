"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { renderWeightInput, renderMetricHeight, renderImperialHeight, renderBodyFatInput, renderFFMIInput, renderCompositionLock, renderAgeInput, renderUnitSelect, renderSexSelect, renderProjectionYears, renderTrainingLevelInput, renderOptions, renderCurrentStats, renderFatLossProjection, renderBackgroundAndSources, ShareButton } from './ffmi-calculator-form-ui';
import { renderLineChart, renderWeightLossChart } from './ffmi-calculator-chart-ui';
import {
    DEFAULT_METRICS,
    FFMI_RANGE_LIMITS,
    SEX,
    UNITS,
    calculateLeanMassFromFFMI,
    calculateProjection,
    calculateBodyFatFromFFMI,
    calculateCurrentFFMI,
    calculateWeightFromFFMI,
    convertHeightToImperial,
    convertHeightToMetric,
    convertWeightToImperial,
    convertWeightToMetric,
    getHeightInMeters,
    isFFMIValid,
    isMetricsValid,
    normalizeMetrics,
    parseMetrics,
    serializeMetrics,
} from '@/lib/ffmi-calculator.mjs';

// Original male formula: Monthly FFMI Increase = 0.3 × (25 − Current FFMI) ÷ 8 × (1.1 × e^(-0.0175 × (age - 18)))
// Modified female formula: Monthly FFMI Increase = 0.18 × (20.5 − Current FFMI) ÷ 8 × (1.1 × e^(-0.0175 × (age - 18)))
// Enhanced Male Monthly FFMI Increase = 0.54 × (28 − Current FFMI) ÷ 6 × (1.1 × e^(-0.0175 × (age - 18)))
// Enhanced Female Monthly FFMI Increase = 0.324 × (23 − Current FFMI) ÷ 6 × (1.1 × e^(-0.0175 × (age - 18)))

// TODO:
// Month slider on bottom for easier mobile UX
// Show ffmi category in tooltip (maybe with color edge highlight)



const getLeanMassInKg = (leanMass, unit) =>
    unit === UNITS.IMPERIAL ? convertWeightToMetric(leanMass) : leanMass;

const getRelevantFFMILimits = (sex, enhanced) => {
    return Object.values(FFMI_RANGE_LIMITS)
        .filter(line => enhanced ||
            (line !== FFMI_RANGE_LIMITS.ENHANCED_TERRITORY &&
                line !== FFMI_RANGE_LIMITS.ENHANCED_ELITE))
        .map(line => sex === SEX.MALE ? line.maleFFMI : line.femaleFFMI);
};

const calculateFFMIFromLeanMass = (leanMassKg, heightM) => {
    return leanMassKg / (heightM * heightM);
};

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

export const yAxisMin = (dataMin, metrics) => {
    const numericDataMin = Number(dataMin);
    const heightM = getHeightInMeters(metrics.height, metrics.unit);
    const leanMassKg = getLeanMassInKg(numericDataMin, metrics.unit);
    const currentFFMI = calculateFFMIFromLeanMass(leanMassKg, heightM);

    // if (currentFFMI <= 13) {
    //     return { leanMass: calculateLeanMassFromFFMI(currentFFMI, heightM, metrics.unit), ffmi: currentFFMI };
    // }
    // Get relevant FFMI limits based on sex and enhanced status
    const relevantLimits = getRelevantFFMILimits(metrics.sex, metrics.enhanced);

    const lowerLimits = relevantLimits.filter(ffmi => ffmi < currentFFMI);
    const closestLowerFFMI = lowerLimits.length > 0
        ? Math.max(...lowerLimits)
        : currentFFMI - 1;

    const resultLeanMass = calculateLeanMassFromFFMI(closestLowerFFMI, heightM, metrics.unit);
    const outLean = Math.floor(Math.min(resultLeanMass, numericDataMin) - 0.2);
    const outFFMI = calculateFFMIFromLeanMass(
        getLeanMassInKg(outLean, metrics.unit),
        heightM,
    )

    return { leanMass: outLean, ffmi: outFFMI };
};

export const yAxisMax = (dataMax, metrics) => {
    const numericDataMax = Number(dataMax);
    const heightM = getHeightInMeters(metrics.height, metrics.unit);
    const leanMassKg = getLeanMassInKg(numericDataMax, metrics.unit);
    const currentFFMI = calculateFFMIFromLeanMass(leanMassKg, heightM);

    // if (currentFFMI >= getCurrentBaseParams(metrics).ceiling) {
    //     return { leanMass: calculateLeanMassFromFFMI(currentFFMI, heightM, metrics.unit), ffmi: currentFFMI };
    // }

    // Get relevant FFMI limits based on sex and enhanced status
    const relevantLimits = getRelevantFFMILimits(metrics.sex, metrics.enhanced);

    const higherLimits = relevantLimits.filter(ffmi => ffmi > currentFFMI);
    const closestHigherFFMI = higherLimits.length > 0
        ? Math.min(...higherLimits)
        : currentFFMI + 1;

    const resultLeanMass = calculateLeanMassFromFFMI(closestHigherFFMI, heightM, metrics.unit);
    const outLean = Math.ceil(Math.max(resultLeanMass, numericDataMax) + 4);
    const outFFMI = calculateFFMIFromLeanMass(
        getLeanMassInKg(outLean, metrics.unit),
        heightM,
    )

    return { leanMass: outLean, ffmi: outFFMI };
};

const useIsMobile = () => {
    const [isMobile, setIsMobile] = useState(null);

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
        setInputs({
            metrics: parsedMetrics,
            ffmi: roundCompositionValue(calculateCurrentFFMI(parsedMetrics)),
        });
        setIsInitialized(true);
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
        <Card className="w-full max-w-none mx-0 rounded-none sm:rounded-lg dark:bg-gray-900 dark:text-gray-100">
            <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <CardTitle className="text-center sm:text-left" id="calculator-title">
                        Max Lean Mass Gained Per Month Calculator
                    </CardTitle>
                    <ShareButton
                        metrics={validMetrics ?? projectedMetrics}
                        disabled={!validMetrics}
                    />
                </div>
            </CardHeader>
            <CardContent aria-labelledby="calculator-title">
                <div className={validMetrics
                    ? "grid grid-cols-1 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] gap-6"
                    : "grid grid-cols-1 gap-6"
                }>
                    {renderLineChart(chartData, projectedMetrics, Boolean(validMetrics))}
                    {validMetrics && renderWeightLossChart(validMetrics)}
                </div>
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
            </CardContent>
        </Card>
    );
}
