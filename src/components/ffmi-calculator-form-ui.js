"use client";
import React from 'react';
import { BODY_FAT_RANGE, FFMI_RANGE_LIMITS, SEX, TEE_MULTIPLIER_RANGE, UNITS, WEIGHT_RANGES, TRAINING_LEVELS, calculateFatLossProjection } from '@/lib/ffmi-calculator.mjs';
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

// Update the range input class to include a light mode background
const rangeInputClass = "w-full h-11 sm:h-2 rounded-lg appearance-none cursor-pointer bg-gray-200 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-gray-700 [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 sm:[&::-webkit-slider-thumb]:w-4 sm:[&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500 [&::-webkit-slider-thumb]:appearance-none [&::-moz-range-thumb]:w-6 [&::-moz-range-thumb]:h-6 sm:[&::-moz-range-thumb]:w-4 sm:[&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-blue-500 [&::-moz-range-thumb]:border-0";
export const renderWeightInput = (metrics, handleInputChange, disabled = false) => (
    <div>
        <label htmlFor="weight-input" className="block text-sm font-medium mb-1 dark:text-gray-100">
            Weight ({metrics.unit === UNITS.METRIC ? 'kg' : 'lbs'})
        </label>
        <div className="flex gap-4 items-center">
            <input
                type="range"
                id="weight-slider"
                name="weight"
                value={metrics.weight}
                onChange={handleInputChange}
                disabled={disabled}
                min={WEIGHT_RANGES[metrics.unit].min}
                max={WEIGHT_RANGES[metrics.unit].max}
                step="0.1"
                className={rangeInputClass} />
            <input
                type="number"
                id="weight-input"
                name="weight"
                value={metrics.weight}
                onChange={handleInputChange}
                disabled={disabled}
                inputMode="decimal"
                min={WEIGHT_RANGES[metrics.unit].min}
                max={WEIGHT_RANGES[metrics.unit].max}
                step="0.1"
                className="w-24 p-2 border rounded disabled:cursor-not-allowed disabled:opacity-40 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100" />
        </div>
    </div>
);
export const renderMetricHeight = (metrics, handleInputChange) => (
    <div>
        <label htmlFor="height-input" className="block text-sm font-medium mb-1 dark:text-gray-100">
            Height (cm)
        </label>
        <div className="flex gap-4 items-center">
            <input
                type="range"
                id="height-slider"
                name="height"
                value={metrics.height}
                onChange={handleInputChange}
                min="120"
                max="220"
                step="0.5"
                className={rangeInputClass} />
            <input
                type="number"
                id="height-input"
                name="height"
                value={metrics.height}
                onChange={handleInputChange}
                inputMode="decimal"
                min="120"
                max="220"
                step="0.5"
                className="w-24 p-2 border rounded dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100" />
        </div>
    </div>
);
export const renderImperialHeight = (metrics, handleInputChange) => (
    <div>
        <span className="block text-sm font-medium mb-1 dark:text-gray-100" id="imperial-height-label">
            Height (ft & in)
        </span>
        <div className="grid grid-cols-2 gap-2">
            <input
                type="number"
                aria-labelledby="imperial-height-label"
                aria-label="Height in feet"
                name="feet"
                value={metrics.feet}
                onChange={handleInputChange}
                placeholder="Feet"
                inputMode="decimal"
                min="4"
                max="8"
                step="1"
                className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100" />
            <input
                type="number"
                aria-labelledby="imperial-height-label"
                aria-label="Height in inches"
                name="inches"
                value={metrics.inches}
                onChange={handleInputChange}
                placeholder="Inches"
                step="0.1"
                inputMode="decimal"
                min="0"
                max="11.9"
                className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100" />
        </div>
    </div>
);
export const renderBodyFatInput = (metrics, handleInputChange, disabled = false) => (
    <div>
        <label htmlFor="body-fat-input" className="block text-sm font-medium mb-1 dark:text-gray-100">
            Body Fat %
        </label>
        <div className="flex gap-4 items-center">
            <input
                type="range"
                id="body-fat-slider"
                name="bodyFat"
                value={metrics.bodyFat}
                onChange={handleInputChange}
                disabled={disabled}
                min={BODY_FAT_RANGE.min}
                max={BODY_FAT_RANGE.max}
                step="0.1"
                className={rangeInputClass} />
            <input
                type="number"
                id="body-fat-input"
                name="bodyFat"
                value={metrics.bodyFat}
                onChange={handleInputChange}
                disabled={disabled}
                inputMode="decimal"
                min={BODY_FAT_RANGE.min}
                max={BODY_FAT_RANGE.max}
                step="0.1"
                className="w-24 p-2 border rounded disabled:cursor-not-allowed disabled:opacity-40 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100" />
        </div>
    </div>
);
export const renderFFMIInput = (ffmi, handleInputChange, disabled = false) => (
    <div>
        <label htmlFor="ffmi-input" className="block text-sm font-medium mb-1 dark:text-gray-100">
            FFMI
        </label>
        <div className="flex gap-4 items-center">
            <input
                type="range"
                id="ffmi-slider"
                name="ffmi"
                value={ffmi}
                onChange={handleInputChange}
                disabled={disabled}
                min="8"
                max="35"
                step="0.01"
                className={rangeInputClass} />
            <input
                type="number"
                id="ffmi-input"
                name="ffmi"
                value={ffmi}
                onChange={handleInputChange}
                disabled={disabled}
                inputMode="decimal"
                min="8"
                max="35"
                step="0.01"
                className="w-24 p-2 border rounded disabled:cursor-not-allowed disabled:opacity-40 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100" />
        </div>
    </div>
);
export const renderCompositionLock = (compositionLock, setCompositionLock) => {
    const options = [
        { value: null, label: 'None' },
        { value: 'ffmi', label: 'FFMI' },
        { value: 'weight', label: 'Weight' },
        { value: 'bodyFat', label: 'Body Fat %' },
    ];

    return (
        <div className="mb-4">
            <span className="block text-sm font-medium mb-2 dark:text-gray-100">
                Hold constant
            </span>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Hold one body composition value constant">
                {options.map((option) => (
                    <Button
                        key={option.label}
                        type="button"
                        size="sm"
                        variant={compositionLock === option.value ? 'default' : 'outline'}
                        aria-pressed={compositionLock === option.value}
                        onClick={() => setCompositionLock(option.value)}
                    >
                        {option.label}
                    </Button>
                ))}
            </div>
        </div>
    );
};
export const renderAgeInput = (metrics, handleInputChange) => (
    <div>
        <label htmlFor="age-input" className="block text-sm font-medium mb-1 dark:text-gray-100">
            Age
        </label>
        <div className="flex gap-4 items-center">
            <input
                type="range"
                id="age-slider"
                name="age"
                value={metrics.age}
                onChange={handleInputChange}
                min="18"
                max="100"
                className={rangeInputClass} />
            <input
                type="number"
                id="age-input"
                name="age"
                value={metrics.age}
                onChange={handleInputChange}
                inputMode="decimal"
                min="18"
                max="100"
                step="1"
                className="w-24 p-2 border rounded dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100" />
        </div>
    </div>
);
export const renderUnitSelect = (metrics, handleInputChange) => (
    <div>
        <label htmlFor="unit-select" className="block text-sm font-medium mb-1 dark:text-gray-100">
            Units
        </label>
        <select
            id="unit-select"
            name="unit"
            value={metrics.unit}
            onChange={handleInputChange}
            className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
        >
            <option value={UNITS.METRIC}>Metric (kg/cm)</option>
            <option value={UNITS.IMPERIAL}>Imperial (lbs/inches)</option>
        </select>
    </div>
);
export const renderSexSelect = (metrics, handleInputChange) => (
    <div>
        <label htmlFor="sex-select" className="block text-sm font-medium mb-1 dark:text-gray-100">
            Sex
        </label>
        <select
            id="sex-select"
            name="sex"
            value={metrics.sex}
            onChange={handleInputChange}
            className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
        >
            <option value={SEX.MALE}>Male</option>
            <option value={SEX.FEMALE}>Female</option>
        </select>
    </div>
);
export const renderProjectionYears = (metrics, handleInputChange) => (
    <div>
        <label htmlFor="projection-years-input" className="block text-sm font-medium mb-1 dark:text-gray-100">
            Projection Years
        </label>
        <div className="flex gap-4 items-center">
            <input
                type="range"
                id="projection-years-slider"
                name="years"
                value={metrics.years}
                onChange={handleInputChange}
                min="1"
                max="10"
                step="1"
                className={rangeInputClass} />
            <input
                type="number"
                id="projection-years-input"
                name="years"
                value={metrics.years}
                onChange={handleInputChange}
                min="1"
                max="10"
                step="1"
                inputMode="numeric"
                className="w-24 p-2 border rounded dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100" />
        </div>
    </div>
);
export const renderTrainingLevelInput = (metrics, handleInputChange) => (
    <div>
        <label htmlFor="training-level-select" className="block text-sm font-medium mb-1 dark:text-gray-100">
            Training Level
        </label>
        <select
            id="training-level-select"
            name="trainingLevel"
            value={metrics.trainingLevel}
            onChange={handleInputChange}
            className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
        >
            {Object.entries(TRAINING_LEVELS).map(([key, level]) => (
                <option key={key} value={key}>
                    {level.label}
                </option>
            ))}
        </select>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {TRAINING_LEVELS[metrics.trainingLevel]?.description}
        </p>
    </div>
);
export const renderOptions = (metrics, setMetrics) => {
    const updateTeeMultiplier = (event) => {
        setMetrics(prev => ({
            ...prev,
            teeMultiplier: event.target.value,
        }));
    };

    return (
        <div className="space-y-3">
            <label className="flex items-center space-x-2 cursor-pointer">
                <input
                    id="enhanced-athlete"
                    type="checkbox"
                    name="enhanced"
                    checked={Boolean(metrics.enhanced)}
                    onChange={(e) => setMetrics(prev => ({
                        ...prev,
                        enhanced: e.target.checked
                    }))}
                    className="w-6 h-6" />
                <span className="text-md dark:text-gray-100">
                    Performance-enhancing drug use
                </span>
            </label>
            <details className="rounded border p-3 dark:border-gray-700">
                <summary className="cursor-pointer font-medium">
                    Advanced fat-loss settings
                </summary>
                <div className="mt-3">
                    <label htmlFor="tee-multiplier-input" className="block text-sm font-medium mb-1">
                        TEE multiplier
                    </label>
                    <div className="flex gap-4 items-center">
                        <input
                            type="range"
                            id="tee-multiplier-slider"
                            name="teeMultiplier"
                            value={metrics.teeMultiplier}
                            onChange={updateTeeMultiplier}
                            min={TEE_MULTIPLIER_RANGE.min}
                            max={TEE_MULTIPLIER_RANGE.max}
                            step="0.01"
                            className={rangeInputClass}
                        />
                        <input
                            type="number"
                            id="tee-multiplier-input"
                            name="teeMultiplier"
                            value={metrics.teeMultiplier}
                            onChange={updateTeeMultiplier}
                            inputMode="decimal"
                            min={TEE_MULTIPLIER_RANGE.min}
                            max={TEE_MULTIPLIER_RANGE.max}
                            step="0.01"
                            className="w-24 p-2 border rounded dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                        />
                    </div>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        Scales average TEE for individual metabolism and activity. Use 1.00x unless you have expenditure data or want a sensitivity range.
                    </p>
                    <label className="mt-4 flex items-start gap-2 cursor-pointer">
                        <input
                            id="barbieri-fast"
                            type="checkbox"
                            name="barbieriFast"
                            checked={Boolean(metrics.barbieriFast)}
                            onChange={(event) => setMetrics(prev => ({
                                ...prev,
                                barbieriFast: event.target.checked,
                            }))}
                            className="mt-0.5 h-5 w-5"
                        />
                        <span>
                            <span className="block text-sm font-medium">
                                Fully medically supervised Barbieri-style fast
                            </span>
                            <span className="block text-xs text-gray-500 dark:text-gray-400">
                                Sets the intake floor to zero; the 100% curve then represents complete fasting.
                            </span>
                        </span>
                    </label>
                </div>
            </details>
        </div>
    );
};
const getFFMICategory = (ffmi, sex) =>
    Object.values(FFMI_RANGE_LIMITS)
        .find((range) => ffmi >= (sex === SEX.MALE ? range.maleFFMI : range.femaleFFMI))
        ?.label ?? 'Below Average';

const CurrentStats = ({ ffmiData, metrics, onReset }) => {
    const weight = parseFloat(metrics.weight);
    const bodyFat = parseFloat(metrics.bodyFat);
    const fatMassKg = metrics.unit === UNITS.METRIC
        ? (weight * bodyFat / 100)
        : (weight * bodyFat / 100 * 0.453592); // Convert lbs to kg
    const fatLossProjection = calculateFatLossProjection(metrics);
    const maxDailyDeficit = Math.round(fatLossProjection.maxDailyDeficit);
    const adiposeFlux = Math.round(fatLossProjection.model.adiposeFluxCeiling);
    const totalEnergyExpenditure = Math.round(fatLossProjection.model.initialTee);
    const currentIntakeFloor = Math.round(fatLossProjection.model.minimumDailyIntake);
    const minimumIntakeToStayWithinAdiposeFlux = Math.ceil(
        fatLossProjection.model.minimumIntakeToStayWithinAdiposeFlux,
    );
    const fatMassInMatchingUnit = Math.round((metrics.unit === UNITS.METRIC ? fatMassKg : (fatMassKg * 2.2)) * 100) / 100;
    const leanMassInMatchingUnit = Math.round(ffmiData[0]?.leanMass * 100) / 100;
    const unit = metrics.unit === UNITS.METRIC ? 'kg' : 'lbs';
    const sex = metrics.sex === 'male' ? 'm' : 'f';
    const initialLeanMass = Number(ffmiData[0]?.leanMass);
    const milestones = [6, 12, 24]
        .filter((month) => month <= metrics.years * 12)
        .map((month) => {
            const projectedLeanMass = Number(ffmiData[month]?.leanMass);
            return `Month ${month}: ${projectedLeanMass.toFixed(1)} ${unit} (${projectedLeanMass - initialLeanMass >= 0 ? '+' : ''}${(projectedLeanMass - initialLeanMass).toFixed(1)} ${unit})`;
        });

    return (
        <div className="p-4 bg-gray-100 dark:bg-gray-900 rounded">
            <h3 className="font-bold mb-2">Current estimate</h3>
            <p>Lean Mass: {leanMassInMatchingUnit} {unit}</p>
            <p>Fat Mass: {fatMassInMatchingUnit} {unit}</p>
            <p>FFMI (Fat Free Mass Index): {ffmiData[0]?.ffmi}</p>
            <p>FFMI range: {getFFMICategory(Number(ffmiData[0]?.ffmi), metrics.sex)}</p>
            <p>BMI (Body Mass Index): {ffmiData[0]?.bmi}</p>
            {milestones.length > 0 && (
                <div className="mt-3 border-t pt-3 dark:border-gray-700">
                    <h4 className="font-semibold">Projection milestones</h4>
                    {milestones.map((milestone) => <p key={milestone}>{milestone}</p>)}
                </div>
            )}
            <div className="mt-3 border-t pt-3 space-y-3 dark:border-gray-700">
                <h4 className="font-semibold">Fat-loss energy model</h4>
                <div>
                    <p>Max modeled deficit: {maxDailyDeficit} kcal/day</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        The smaller of available fat energy and adjusted TEE after the current {currentIntakeFloor} kcal/day intake floor.
                    </p>
                </div>
                <div>
                    <p><a href={`https://app.exfatloss.com/adipose?unit=${unit}&fm=${fatMassInMatchingUnit}&la=18`} className="text-blue-500 hover:text-blue-700 underline" target="_blank" rel="noopener">Adipose-flux ceiling</a>: {adiposeFlux} kcal/day</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        The theoretical maximum energy current fat stores can release per day.
                    </p>
                </div>
                <div>
                    <p><a href={`https://app.exfatloss.com/tee?unit=${unit}&protein=0.5&sex=${sex}&met=${metrics.teeMultiplier}&ffm=${leanMassInMatchingUnit}`} className="text-blue-500 hover:text-blue-700 underline" target="_blank" rel="noopener">Total Energy Expenditure</a> ({Number(metrics.teeMultiplier).toFixed(2)}x): {totalEnergyExpenditure} kcal/day</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        Estimated calories burned per day after applying the metabolism and activity multiplier.
                    </p>
                </div>
                <div>
                    <p>Minimum intake before fat stores fall short: {minimumIntakeToStayWithinAdiposeFlux} kcal/day</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        Keeps the modeled deficit within the adipose-flux ceiling, but cannot guarantee zero lean-mass loss.
                    </p>
                </div>
            </div>
            <Button type="button" variant="secondary" onClick={onReset} className="mt-4 w-full">
                Reset inputs
            </Button>
        </div>
    );
};
const InvalidStats = ({ onReset }) => (
    <div
        className="p-4 bg-gray-100 dark:bg-gray-900 rounded"
        role="status"
        aria-live="polite"
    >
        <h3 className="font-bold mb-2">Invalid numbers</h3>
        <p>Enter values within the allowed ranges to restore the projection.</p>
        <Button type="button" variant="secondary" onClick={onReset} className="mt-4 w-full">
            Reset inputs
        </Button>
    </div>
);
export const renderCurrentStats = (ffmiData, metrics, onReset, isValid = true) => (
    isValid
        ? <CurrentStats ffmiData={ffmiData} metrics={metrics} onReset={onReset} />
        : <InvalidStats onReset={onReset} />
);
const formatFatLossDuration = (days) => {
    if (!Number.isFinite(days)) return 'Not reached';
    if (days < 14) return `${Math.ceil(days)} days`;
    if (days < 60) return `${(days / 7).toFixed(1)} weeks`;
    return `${(days / 30.4375).toFixed(1)} months`;
};
const FatLossProjection = ({ metrics }) => {
    const projection = calculateFatLossProjection(metrics);
    const unit = metrics.unit === UNITS.METRIC ? 'kg' : 'lbs';

    return (
        <details className="group mt-6 p-4 bg-gray-100 dark:bg-gray-900 rounded">
            <summary className="cursor-pointer font-bold text-lg">
                Detailed fat-loss target table
            </summary>
            <div className="mt-3 hidden group-open:block">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                    Initial modeled maximum: {Math.round(projection.maxDailyDeficit)} kcal/day, capped by {Math.round(projection.model.initialTee)} kcal/day TEE minus a {projection.model.minimumDailyIntake} kcal/day intake floor. The uncapped adipose-flux ceiling is {Math.round(projection.model.adiposeFluxCeiling)} kcal/day.
                    {' '}TEE uses the selected {projection.model.teeMultiplier.toFixed(2)}x multiplier.
                    {projection.model.barbieriFast && ' Barbieri-style fasting mode sets the intake floor to zero.'}
                </p>
                {projection.targets.length > 0 ? (
                    <div className="mt-4 overflow-x-auto">
                        <table className="w-full min-w-[760px] border-collapse text-sm">
                        <caption className="sr-only">
                            Estimated time and weight at body-fat targets
                        </caption>
                        <thead>
                            <tr className="border-b dark:border-gray-700">
                                <th scope="col" className="p-2 text-left">Target</th>
                                <th scope="col" className="p-2 text-left">Target weight</th>
                                {projection.speeds.map((speed) => (
                                    <th scope="col" className="p-2 text-left" key={speed.id}>
                                        <span className="block">{speed.label} max</span>
                                        <span className="block text-xs font-normal text-gray-500 dark:text-gray-400">
                                            {Math.round(speed.initialDailyDeficit)} kcal/day initially
                                        </span>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {projection.targets.map((target) => (
                                <tr className="border-b last:border-0 dark:border-gray-800" key={target.bodyFat}>
                                    <th scope="row" className="p-2 text-left">
                                        <span className="inline-flex items-center gap-1.5">
                                            <span
                                                className="inline-block h-2.5 w-2.5 rounded-sm"
                                                style={{ backgroundColor: target.color }}
                                                aria-hidden="true"
                                            />
                                            {target.bodyFat}% BF
                                        </span>
                                        <span className="block text-xs font-normal text-gray-500 dark:text-gray-400">
                                            {target.label} ({target.range})
                                        </span>
                                        <span className="block max-w-64 text-xs font-normal text-gray-500 dark:text-gray-400">
                                            {target.description}
                                        </span>
                                        <span className="block text-xs font-normal text-gray-500 dark:text-gray-400">
                                            {Math.round(target.maxDailyDeficit)} kcal/day max
                                        </span>
                                    </th>
                                    <td className="p-2">{target.targetWeight.toFixed(1)} {unit}</td>
                                    {projection.speeds.map((speed) => (
                                        <td className="p-2" key={speed.id}>
                                            {formatFatLossDuration(target.daysBySpeed[speed.id])}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr className="border-t dark:border-gray-700">
                                <th scope="row" className="p-2 text-left">
                                    Below {projection.targets.at(-1).bodyFat}% BF
                                </th>
                                <td className="p-2 text-gray-500 dark:text-gray-400" colSpan={5}>
                                    Not projected
                                </td>
                            </tr>
                        </tfoot>
                        </table>
                    </div>
                ) : (
                    <p className="mt-3 text-sm">No lower standard target is shown for the current body-fat percentage.</p>
                )}
                <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                    Uses a dynamic Hall/Forbes-style model: TEE declines with fat and lean tissue, tissue loss is partitioned between fat and lean mass, adaptive thermogenesis develops over two weeks, and an initial fluid/glycogen shift is included. The 100% line is the model&apos;s bounded maximum.
                </p>
            </div>
        </details>
    );
};
export const renderFatLossProjection = (metrics) => (
    <FatLossProjection metrics={metrics} />
);
export const ShareButton = ({ metrics, disabled = false }) => {
    const shareUrl = typeof window !== 'undefined'
        ? `${window.location.origin}${window.location.pathname}?${new URLSearchParams(metrics).toString()}`
        : '';
    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl);
            toast.success("Link copied to clipboard!");
        } catch {
            toast.error("Failed to copy link");
        }
    };

    return (
        <Button
            variant="secondary"
            onClick={copyToClipboard}
            disabled={disabled}
            className="whitespace-nowrap dark:text-gray-100 dark:bg-gray-700"
        >
            Share / Copy Link
        </Button>
    );
};