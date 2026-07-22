"use client";
import React from 'react';
import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Line, ReferenceArea, ReferenceLine } from 'recharts';
import { getLeanMassAxisMaximum, getLeanMassAxisMinimum } from '@/lib/chart-domains.mjs';
import { UNITS, FFMI_RANGE_LIMITS, getHeightInMeters, SEX, calculateLeanMassFromFFMI, calculateWeightLossChart } from '@/lib/ffmi-calculator.mjs';

/**
 * @typedef {{ payload?: Record<string, string | number> }} ChartTooltipEntry
 * @typedef {{ id: string, label: string, color: string }} FatLossSpeed
 */

/**
 * @param {{
 *   active?: boolean,
 *   payload?: readonly ChartTooltipEntry[],
 *   label?: string | number,
 *   unit: string
 * }} props
 */
const MuscleGainTooltip = ({ active = false, payload = [], label = '', unit }) => {
    const point = payload?.[0]?.payload;
    if (!active || !point) return null;
    const ffmiGain = Number(point.ffmi) - Number(point.initialFFMI);

    return (
        <div className="rounded-md border border-gray-600 bg-gray-800 p-2 text-sm text-gray-100">
            <p className="font-medium">Month {label}</p>
            <p>Lean Mass ({unit}): {point.leanMassDisplay ?? point.leanMass}</p>
            <p>FFMI: {point.ffmi} ({ffmiGain >= 0 ? '+' : ''}{ffmiGain.toFixed(2)} points)</p>
        </div>
    );
};

/**
 * @param {{
 *   active?: boolean,
 *   payload?: readonly ChartTooltipEntry[],
 *   label?: string | number,
 *   unit: string,
 *   speeds: readonly FatLossSpeed[]
 * }} props
 */
const WeightLossTooltip = ({ active = false, payload = [], label = '', unit, speeds }) => {
    const point = payload?.[0]?.payload;
    if (!active || !point) return null;

    return (
        <div className="rounded-md border border-gray-600 bg-gray-800 p-2 text-sm text-gray-100">
            <p className="font-medium">Month {label}</p>
            {speeds.map((speed) => (
                <p key={speed.id} style={{ color: speed.color }}>
                    {speed.label} max: {Number(point[speed.id]).toFixed(1)} {unit}
                    {' · '}{Math.round(Number(point[`${speed.id}Deficit`]))} kcal/day
                </p>
            ))}
        </div>
    );
};

export const renderLineChart = (ffmiData, metrics, isValid = true) => {
    if (!isValid) {
        return (
            <section className="h-96 p-3 flex flex-col bg-gray-200 text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                <h3 className="font-bold text-base">Muscle gain graph</h3>
                <div
                    className="flex flex-1 items-center justify-center"
                    role="img"
                    aria-label="Invalid numbers. The muscle gain graph is unavailable."
                >
                    <p className="text-lg font-semibold">Invalid numbers</p>
                </div>
            </section>
        );
    }

    const leanMassValues = ffmiData
        .map((point) => Number(point.leanMass))
        .filter(Number.isFinite);
    const tooltipData = ffmiData.map((point) => ({
        ...point,
        initialFFMI: ffmiData[0].ffmi,
    }));
    const leanMassDomain = [
        getLeanMassAxisMinimum(Math.min(...leanMassValues), metrics).leanMass,
        getLeanMassAxisMaximum(Math.max(...leanMassValues), metrics).leanMass,
    ];
    const heightM = getHeightInMeters(metrics.height, metrics.unit);
    const ffmiRanges = Object.values(FFMI_RANGE_LIMITS).filter((line) =>
        metrics.enhanced ||
        (line !== FFMI_RANGE_LIMITS.ENHANCED_TERRITORY &&
            line !== FFMI_RANGE_LIMITS.ENHANCED_ELITE)
    );

    return (
        <section className="h-96 p-3 flex flex-col bg-gray-100 dark:bg-gray-900 rounded" aria-labelledby="muscle-gain-chart-title">
            <div className="shrink-0 flex items-center justify-between gap-3">
                <h3 className="font-bold text-base" id="muscle-gain-chart-title">
                    Muscle gain graph
                </h3>
                <span className="inline-flex items-center gap-1 text-xs">
                    <span
                        className="inline-block h-0.5 w-3 bg-emerald-600"
                        aria-hidden="true"
                    />
                    Lean Mass
                </span>
            </div>
            <div
                className="mt-1 min-h-0 flex-1"
                role="img"
                aria-label={`Projected lean mass over ${metrics.years} years`}
            >
            <ResponsiveContainer width="100%" height="100%">
            <LineChart
                data={tooltipData}
                margin={{
                    top: 15,
                    right: 20,
                    left: 5,
                    bottom: 25
                }}
            >
                <defs>
                    <pattern id="grid" width="8" height="8" patternUnits="userSpaceOnUse">
                        <path d="M 8 0 L 0 0 0 8" fill="none" stroke="rgba(0, 0, 0, 0.1)" strokeWidth="0.5" />
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="rgb(243 244 246)" className="dark:fill-gray-900" />
                <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(0, 0, 0, 0.2)"
                    className="dark:stroke-gray-700" />
                <XAxis
                    dataKey="month"
                    label={{
                        value: 'Months',
                        position: 'insideBottom',
                        offset: -15
                    }}
                    padding={{ left: 0, right: 0 }}
                    stroke="#666666"
                    className="dark:text-gray-300" />
                <YAxis
                    yAxisId="leanMass"
                    orientation="left"
                    label={{
                        value: `Lean Mass (${metrics.unit === UNITS.METRIC ? 'kg' : 'lbs'})`,
                        angle: -90,
                        position: 'insideLeft',
                        offset: 10,
                        style: {
                            textAnchor: 'middle',
                        }
                    }}
                    domain={leanMassDomain}
                    className="dark:text-gray-300" />
                <Tooltip
                    content={(tooltipProps) => (
                        <MuscleGainTooltip
                            {...tooltipProps}
                            unit={metrics.unit === UNITS.METRIC ? 'kg' : 'lbs'}
                        />
                    )}
                />
                <Line
                    yAxisId="leanMass"
                    type="monotone"
                    dataKey="leanMass"
                    stroke="#059669"
                    strokeWidth={2}
                    name={`Lean Mass (${metrics.unit === UNITS.METRIC ? 'kg' : 'lbs'})`}
                    isAnimationActive={false} />
                {ffmiRanges.map((line, index, ranges) => {
                    const ffmiValue = metrics.sex === SEX.MALE ? line.maleFFMI : line.femaleFFMI;
                    const leanMassValue = calculateLeanMassFromFFMI(ffmiValue, heightM, metrics.unit);
                    const nextLine = ranges[index - 1];
                    const rangeStart = index === ranges.length - 1
                        ? leanMassDomain[0]
                        : Math.max(leanMassValue, leanMassDomain[0]);
                    const rangeEnd = index === 0
                        ? leanMassDomain[1]
                        : Math.min(
                            calculateLeanMassFromFFMI(
                                metrics.sex === SEX.MALE ? nextLine.maleFFMI : nextLine.femaleFFMI,
                                heightM,
                                metrics.unit,
                            ),
                            leanMassDomain[1],
                        );
                    if (rangeEnd <= rangeStart) return null;

                    return (
                        <ReferenceArea
                            key={`lean-mass-range-${line.label}`}
                            yAxisId="leanMass"
                            y1={rangeStart}
                            y2={rangeEnd}
                            fill={line.stroke}
                            fillOpacity={0.1}
                            stroke="none"
                            label={{
                                value: line.label,
                                position: 'insideRight',
                                fill: line.stroke,
                                fontSize: 12
                            }} />
                    );
                })}

                {Array.from({ length: metrics.years }, (_, i) => (
                    <ReferenceLine
                        key={`year-${i + 1}`}
                        x={(i + 1) * 12}
                        yAxisId="leanMass"
                        stroke="#666666"
                        className="dark:stroke-gray-500"
                        strokeDasharray="3 3"
                        label={{
                            value: `Year ${i + 1}`,
                            position: 'top',
                            fill: '#666666',
                            className: "dark:fill-gray-300",
                            fontSize: 12
                        }} />
                ))}

            </LineChart>
            </ResponsiveContainer>
            </div>
        </section>
    );
};

export const renderWeightLossChart = (metrics) => {
    const projection = calculateWeightLossChart(metrics);
    if (projection.data.length === 0) return null;

    const unit = metrics.unit === UNITS.METRIC ? 'kg' : 'lbs';
    const projectedWeights = projection.data.flatMap((point) =>
        projection.speeds.map((speed) => Number(point[speed.id]))
    );
    const weightDomain = [
        Math.floor(Math.min(
            ...projectedWeights,
            projection.bodyFatBands[0].lowerWeight,
        ) - 3),
        Math.ceil(Math.max(
            ...projectedWeights,
            projection.bodyFatBands.at(-1).upperWeight,
        ) + 3),
    ];
    return (
        <section className="h-96 p-3 flex flex-col bg-gray-100 dark:bg-gray-900 rounded" aria-labelledby="weight-loss-chart-title">
            <div className="shrink-0">
                <h3 className="font-bold text-base" id="weight-loss-chart-title">
                    Weight-loss projection
                </h3>
                <div
                    className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs"
                    aria-label="Weight-loss speed legend"
                >
                    {projection.speeds.map((speed) => (
                        <span className="inline-flex items-center gap-1" key={speed.id}>
                            <span
                                className="inline-block h-0.5 w-3"
                                style={{ backgroundColor: speed.color }}
                                aria-hidden="true"
                            />
                            {speed.label} max
                        </span>
                    ))}
                </div>
            </div>
            <div
                className="mt-1 min-h-0 flex-1"
                role="img"
                aria-label={`Projected weight in ${unit} at four dynamic fat-loss speeds`}
            >
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                        data={projection.data}
                        margin={{ top: 15, right: 25, left: 5, bottom: 25 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" className="dark:stroke-gray-700" />
                        <XAxis
                            dataKey="month"
                            label={{ value: 'Months', position: 'insideBottom', offset: -15 }}
                        />
                        <YAxis
                            yAxisId="weight"
                            domain={weightDomain}
                            label={{
                                value: `Weight (${unit})`,
                                angle: -90,
                                position: 'insideLeft',
                            }}
                        />
                        <Tooltip
                            content={(tooltipProps) => (
                                <WeightLossTooltip
                                    {...tooltipProps}
                                    unit={unit}
                                    speeds={projection.speeds}
                                />
                            )}
                        />
                        {projection.bodyFatBands.map((band, index, bands) => {
                            const rangeStart = index === 0
                                ? weightDomain[0]
                                : band.lowerWeight;
                            const rangeEnd = index === bands.length - 1
                                ? weightDomain[1]
                                : band.upperWeight;
                            const estimatedHeight =
                                (rangeEnd - rangeStart) /
                                (weightDomain[1] - weightDomain[0]) *
                                240;

                            return (
                                <ReferenceArea
                                    key={`body-fat-band-${band.label}`}
                                    yAxisId="weight"
                                    y1={rangeStart}
                                    y2={rangeEnd}
                                    fill={band.color}
                                    fillOpacity={0.1}
                                    stroke="none"
                                    ifOverflow="extendDomain"
                                    label={estimatedHeight >= 15
                                        ? {
                                            value: `${band.label} (${band.range})`,
                                            position: 'insideRight',
                                            fill: band.color,
                                            fontSize: 10,
                                        }
                                        : undefined
                                    }
                                />
                            );
                        })}
                        {projection.targets.map((target) => (
                            <ReferenceLine
                                key={target.bodyFat}
                                yAxisId="weight"
                                y={target.targetWeight}
                                stroke="#6b7280"
                                strokeDasharray="3 3"
                            />
                        ))}
                        {projection.speeds.map((speed) => (
                            <Line
                                key={speed.id}
                                yAxisId="weight"
                                type="monotone"
                                dataKey={speed.id}
                                name={`${speed.label} max`}
                                stroke={speed.color}
                                strokeWidth={2}
                                dot={false}
                                isAnimationActive={false}
                            />
                        ))}
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </section>
    );
};
