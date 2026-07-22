"use client";

import {
    POPULATION_BMI_YEAR,
    POPULATION_DEFAULT_AGE,
    POPULATION_HEIGHT_YEAR,
    getLocaleLookupRows,
} from '@/lib/locale-defaults.mjs';
import {
    UNITS,
    convertHeightToImperial,
    convertWeightToImperial,
    splitPoundsIntoStone,
} from '@/lib/ffmi-calculator.mjs';

const lookupRows = getLocaleLookupRows();

const formatHeight = (heightCm, unit) => {
    if (unit === UNITS.METRIC) return `${heightCm.toFixed(1)} cm`;

    const totalInches = convertHeightToImperial(heightCm);
    const feet = Math.floor(totalInches / 12);
    const inches = totalInches - feet * 12;
    return `${feet}'${inches.toFixed(1)}"`;
};

const formatWeight = (weightKg, unit) => {
    if (unit === UNITS.METRIC) return `${weightKg.toFixed(1)} kg`;
    const pounds = convertWeightToImperial(weightKg);
    if (unit === UNITS.UK) {
        const parts = splitPoundsIntoStone(pounds);
        return `${parts.stones} st ${parts.pounds.toFixed(1)} lb`;
    }
    return `${pounds.toFixed(1)} lb`;
};

const formatUnitSystem = (unit) => {
    if (unit === UNITS.UK) return 'st/lb, ft/in';
    if (unit === UNITS.IMPERIAL) return 'lb, ft/in';
    return 'kg, cm';
};

const getFlagEmoji = (region) =>
    [...region]
        .map((character) =>
            String.fromCodePoint(127397 + character.charCodeAt(0))
        )
        .join('');

const PopulationValues = ({ values, unit, region, country, sex, onApply }) => (
    <button
        type="button"
        onClick={() => onApply(region, sex)}
        className="whitespace-nowrap rounded px-1.5 py-1 text-left text-xs hover:bg-blue-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:hover:bg-blue-950"
        aria-label={`Apply ${sex} defaults for ${country}`}
        title={`Apply ${sex} defaults for ${country}`}
    >
        {formatHeight(values.heightCm, unit)} · {formatWeight(values.weightKg, unit)} · BF {values.bodyFat.toFixed(1)}%
    </button>
);

export function LocaleDefaultsTable({ profile, onApply }) {
    if (!profile) return null;
    const detectedRegion = profile.detectedRegion ?? profile.region;
    const orderedRows = [
        ...lookupRows.filter((row) => row.region === detectedRegion),
        ...lookupRows.filter((row) => row.region !== detectedRegion),
    ];

    return (
        <details className="group mt-6 rounded bg-gray-100 p-4 dark:bg-gray-900">
            <summary className="cursor-pointer font-bold text-lg">
                Locale population-default lookup
            </summary>
            <div className="mt-2 hidden group-open:block">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                    {profile.matched ? (
                        <>
                            Active profile:{' '}
                            <strong>
                                <span aria-hidden="true">{getFlagEmoji(profile.region)} </span>
                                {profile.country}
                            </strong>{' '}
                            ({profile.region}).
                        </>
                    ) : (
                        <>
                            Browser locale <strong>{profile.locale}</strong> has no
                            matched country row ({profile.region}).
                        </>
                    )}{' '}
                    On a fresh load, the matched estimate or custom fallback is applied
                    automatically; shared URL values always take priority.
                </p>
                {!profile.matched && (
                    <p className="mt-2 text-sm">
                        No matched country row was available, so the custom fallback
                        profile (male, age 40, 6&apos;2&quot;, 220 lb, 32% body fat) was used.
                    </p>
                )}
                <p className="mt-2 text-xs text-gray-600 dark:text-gray-300">
                    Height is the NCD-RisC {POPULATION_HEIGHT_YEAR} birth-cohort mean.
                    Weight is estimated as {POPULATION_BMI_YEAR} mean BMI × height².
                    BF uses CUN-BAE at age {POPULATION_DEFAULT_AGE}; its individual
                    standard error is about 4.7 percentage points and it was developed
                    in White adults, so population bias remains possible. Select any
                    male or female value below to apply that profile. Canada uses
                    lb and ft/in; the UK and Ireland use st/lb and ft/in; the US and
                    Liberia use lb and ft/in; other rows use metric.
                </p>
                <div className="mt-3 max-h-96 overflow-auto rounded border border-gray-300 dark:border-gray-700">
                    <table className="w-full min-w-[680px] border-collapse text-xs">
                        <caption className="sr-only">
                            Sex-specific population defaults by browser locale region
                        </caption>
                        <thead className="sticky top-0 bg-gray-200 dark:bg-gray-800">
                            <tr className="border-b dark:border-gray-700">
                                <th scope="col" className="p-1.5 text-left">Country</th>
                                <th scope="col" className="p-1.5 text-left">Units</th>
                                <th scope="col" className="p-1.5 text-left">Male default</th>
                                <th scope="col" className="p-1.5 text-left">Female default</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orderedRows.map((row) => (
                                <tr
                                    key={row.region}
                                    className={`border-b last:border-0 dark:border-gray-800 ${
                                        row.region === profile.region
                                            ? 'bg-blue-50 dark:bg-blue-950/40'
                                            : ''
                                    }`}
                                >
                                    <th scope="row" className="whitespace-nowrap p-1.5 text-left font-medium">
                                        <span aria-hidden="true">{getFlagEmoji(row.region)} </span>
                                        {row.country}{' '}
                                        <span className="font-normal text-gray-500 dark:text-gray-400">
                                            ({row.region})
                                        </span>
                                    </th>
                                    <td className="whitespace-nowrap p-1.5">
                                        {formatUnitSystem(row.unit)}
                                    </td>
                                    <td className="p-0.5">
                                        <PopulationValues
                                            values={row.male}
                                            unit={row.unit}
                                            region={row.region}
                                            country={row.country}
                                            sex="male"
                                            onApply={onApply}
                                        />
                                    </td>
                                    <td className="p-0.5">
                                        <PopulationValues
                                            values={row.female}
                                            unit={row.unit}
                                            region={row.region}
                                            country={row.country}
                                            sex="female"
                                            onApply={onApply}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <p className="mt-3 text-xs text-gray-600 dark:text-gray-300">
                    Sources:{' '}
                    <a
                        href="https://doi.org/10.7554/eLife.13410"
                        target="_blank"
                        rel="noopener"
                        className="text-blue-500 underline hover:text-blue-700"
                    >
                        NCD-RisC adult height
                    </a>
                    ,{' '}
                    <a
                        href="https://doi.org/10.1016/S0140-6736(17)32129-3"
                        target="_blank"
                        rel="noopener"
                        className="text-blue-500 underline hover:text-blue-700"
                    >
                        NCD-RisC adult BMI
                    </a>
                    , and{' '}
                    <a
                        href="https://pmc.ncbi.nlm.nih.gov/articles/PMC3263863/"
                        target="_blank"
                        rel="noopener"
                        className="text-blue-500 underline hover:text-blue-700"
                    >
                        CUN-BAE body-fat estimator
                    </a>
                    . Personal-unit defaults also reflect common usage documented
                    by the{' '}
                    <a
                        href="https://www.nhs.uk/health-assessment-tools/calculate-your-body-mass-index/"
                        target="_blank"
                        rel="noopener"
                        className="text-blue-500 underline hover:text-blue-700"
                    >
                        NHS BMI calculator
                    </a>
                    {' '}and{' '}
                    <a
                        href="https://en.wikipedia.org/wiki/Metrication_in_Canada#Common_usage_today"
                        target="_blank"
                        rel="noopener"
                        className="text-blue-500 underline hover:text-blue-700"
                    >
                        Canadian measurement usage
                    </a>.
                </p>
            </div>
        </details>
    );
}
