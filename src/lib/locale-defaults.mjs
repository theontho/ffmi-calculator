import {
  DEFAULT_METRICS,
  SEX,
  UNITS,
  convertHeightToImperial,
  convertWeightToImperial,
  splitPoundsIntoStone,
  usesImperialHeight,
  usesPoundWeight,
} from "./ffmi-calculator.mjs";
import { LOCALE_POPULATION_DATA } from "./locale-population-data.mjs";

export const POPULATION_DEFAULT_AGE = 40;
export const POPULATION_HEIGHT_YEAR = 1996;
export const POPULATION_BMI_YEAR = 2016;

const IMPERIAL_REGIONS = new Set(["US", "LR", "CA"]);
const UK_MIXED_REGIONS = new Set(["GB", "IE"]);
const countryDisplayNames = new Intl.DisplayNames(["en"], { type: "region" });
const populationByRegion = new Map(
  LOCALE_POPULATION_DATA.map((entry) => [entry.region, entry]),
);
const round = (value, precision = 1) => {
  const multiplier = 10 ** precision;
  return Math.round(value * multiplier) / multiplier;
};
const getCountryDisplayName = (region, fallback) =>
  countryDisplayNames.of(region) ?? fallback;

export const estimateBodyFatFromBmi = (
  bmi,
  age,
  sex,
) => {
  const sexValue = sex === SEX.FEMALE ? 1 : 0;
  const bmiSquared = bmi ** 2;
  return round(
    -44.988 +
      0.503 * age +
      10.689 * sexValue +
      3.172 * bmi -
      0.026 * bmiSquared +
      0.181 * bmi * sexValue -
      0.02 * bmi * age -
      0.005 * bmiSquared * sexValue +
      0.00021 * bmiSquared * age,
  );
};

const derivePopulationValues = (values, sex, age) => {
  const heightM = values.heightCm / 100;
  const weightKg = values.bmi * heightM ** 2;
  return {
    heightCm: round(values.heightCm),
    weightKg: round(weightKg),
    bodyFat: estimateBodyFatFromBmi(values.bmi, age, sex),
    bmi: values.bmi,
  };
};

export const getLocaleRegion = (locale) => {
  try {
    return new Intl.Locale(locale || "en-US").maximize().region ?? "US";
  } catch {
    return "US";
  }
};

export const getDefaultUnitForRegion = (region) =>
  UK_MIXED_REGIONS.has(region)
    ? UNITS.UK
    : IMPERIAL_REGIONS.has(region)
      ? UNITS.IMPERIAL
      : UNITS.METRIC;

const toMetrics = (values, sex, age, unit) => {
  const heightInches = convertHeightToImperial(values.heightCm);
  const weightPounds = convertWeightToImperial(values.weightKg);
  const stoneParts = splitPoundsIntoStone(weightPounds);
  let feet = Math.floor(heightInches / 12);
  let inches = round(heightInches - feet * 12);
  if (inches >= 12) {
    feet += 1;
    inches = 0;
  }

  return {
    ...DEFAULT_METRICS,
    weight: usesPoundWeight(unit)
      ? round(weightPounds)
      : values.weightKg,
    height: usesImperialHeight(unit)
      ? round(heightInches)
      : values.heightCm,
    bodyFat: values.bodyFat,
    age,
    sex,
    unit,
    feet,
    inches,
    ...(unit === UNITS.UK
      ? {
          stones: stoneParts.stones,
          stonePounds: stoneParts.pounds,
        }
      : {}),
  };
};

export const getPopulationDefaultProfile = (
  region,
  sex = SEX.MALE,
  age = POPULATION_DEFAULT_AGE,
  locale = `und-${region}`,
) => {
  const normalizedRegion = String(region).toUpperCase();
  const population = populationByRegion.get(normalizedRegion);
  if (!population) {
    return {
      locale,
      region: normalizedRegion,
      country: "Custom fallback",
      matched: false,
      unit: DEFAULT_METRICS.unit,
      metrics: { ...DEFAULT_METRICS, age, sex },
      values: null,
    };
  }

  const unit = getDefaultUnitForRegion(normalizedRegion);
  const values = derivePopulationValues(population[sex], sex, age);
  return {
    locale,
    region: normalizedRegion,
    country: getCountryDisplayName(normalizedRegion, population.country),
    matched: true,
    unit,
    metrics: toMetrics(values, sex, age, unit),
    values,
  };
};

export const getLocaleDefaultProfile = (
  locale,
  sex = SEX.MALE,
  age = POPULATION_DEFAULT_AGE,
) => {
  const region = getLocaleRegion(locale);
  return {
    ...getPopulationDefaultProfile(region, sex, age, locale),
    detectedRegion: region,
  };
};

export const getLocaleLookupRows = (age = POPULATION_DEFAULT_AGE) =>
  LOCALE_POPULATION_DATA.map((population) => ({
    region: population.region,
    country: getCountryDisplayName(population.region, population.country),
    unit: getDefaultUnitForRegion(population.region),
    male: derivePopulationValues(population.male, SEX.MALE, age),
    female: derivePopulationValues(population.female, SEX.FEMALE, age),
  }));
