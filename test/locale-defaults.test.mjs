import assert from "node:assert/strict";
import test from "node:test";

import {
  DEFAULT_METRICS,
  isMetricsValid,
} from "../src/lib/ffmi-calculator.mjs";
import {
  estimateBodyFatFromBmi,
  getDefaultUnitForRegion,
  getLocaleDefaultProfile,
  getLocaleLookupRows,
  getLocaleRegion,
  getPopulationDefaultProfile,
} from "../src/lib/locale-defaults.mjs";

test("keeps the requested custom fallback profile", () => {
  assert.deepEqual(
    {
      weight: DEFAULT_METRICS.weight,
      height: DEFAULT_METRICS.height,
      bodyFat: DEFAULT_METRICS.bodyFat,
      age: DEFAULT_METRICS.age,
      sex: DEFAULT_METRICS.sex,
      unit: DEFAULT_METRICS.unit,
      feet: DEFAULT_METRICS.feet,
      inches: DEFAULT_METRICS.inches,
    },
    {
      weight: 220,
      height: 74,
      bodyFat: 32,
      age: 40,
      sex: "male",
      unit: "imperial",
      feet: 6,
      inches: 2,
    },
  );
});

test("derives sex-specific US defaults from population height and BMI", () => {
  const male = getLocaleDefaultProfile("en-US", "male");
  const female = getLocaleDefaultProfile("en-US", "female");

  assert.equal(male.region, "US");
  assert.equal(male.country, "United States");
  assert.equal(male.unit, "imperial");
  assert.equal(male.metrics.height, 69.7);
  assert.equal(male.metrics.weight, 199.3);
  assert.equal(male.metrics.bodyFat, 28.8);
  assert.equal(female.metrics.height, 64.4);
  assert.equal(female.metrics.weight, 170.4);
  assert.equal(female.metrics.bodyFat, 40.7);
});

test("uses maximized locale regions and common personal-unit defaults", () => {
  assert.equal(getLocaleRegion("ja"), "JP");
  assert.equal(getLocaleDefaultProfile("ja").unit, "metric");
  assert.equal(getLocaleDefaultProfile("de-DE").country, "Germany");
  assert.equal(getLocaleDefaultProfile("en-GB").country, "United Kingdom");
  assert.equal(getDefaultUnitForRegion("US"), "imperial");
  assert.equal(getDefaultUnitForRegion("LR"), "imperial");
  assert.equal(getDefaultUnitForRegion("CA"), "imperial");
  assert.equal(getDefaultUnitForRegion("GB"), "uk");
  assert.equal(getDefaultUnitForRegion("IE"), "uk");
  assert.equal(getDefaultUnitForRegion("MM"), "metric");
  const uk = getLocaleDefaultProfile("en-GB");
  assert.equal(uk.metrics.stones, 13);
  assert.equal(uk.metrics.stonePounds, 7.6);
  assert.equal(uk.metrics.weight, 189.6);
});

test("uses the published CUN-BAE body-fat estimate consistently", () => {
  assert.equal(estimateBodyFatFromBmi(28.8, 40, "male"), 28.8);
  assert.equal(estimateBodyFatFromBmi(28.9, 40, "female"), 40.7);
});

test("exposes a complete country lookup table", () => {
  const rows = getLocaleLookupRows();
  const unitedStates = rows.find((row) => row.region === "US");

  assert.equal(rows.length, 190);
  assert.equal(unitedStates.male.heightCm, 177.1);
  assert.equal(unitedStates.country, "United States");
  assert.equal(unitedStates.female.bmi, 28.9);
  assert.ok(rows.every((row) =>
    row.male.weightKg > 30 &&
    row.female.weightKg > 30 &&
    row.male.bodyFat > 5 &&
    row.female.bodyFat > 10
  ));
  assert.ok(rows.every((row) =>
    ["male", "female"].every((sex) => {
      const profile = getPopulationDefaultProfile(row.region, sex);
      return profile.matched &&
        profile.region === row.region &&
        profile.metrics.sex === sex &&
        isMetricsValid(profile.metrics);
    })
  ));
});
