import assert from "node:assert/strict";
import test from "node:test";

import {
  DEFAULT_METRICS,
  calculateBodyFatFromFFMI,
  calculateCurrentFFMI,
  calculateFatLossProjection,
  calculateProjection,
  calculateWeightFromFFMI,
  calculateWeightLossChart,
  isFFMIValid,
  isMetricsValid,
  normalizeMetrics,
  parseMetrics,
  serializeMetrics,
} from "../src/lib/ffmi-calculator.mjs";

test("uses the existing desktop and mobile defaults", () => {
  assert.deepEqual(parseMetrics("", false), DEFAULT_METRICS);
  assert.deepEqual(parseMetrics("", true), {
    ...DEFAULT_METRICS,
    years: 2,
  });
});

test("preserves and clamps the complete shared-query contract", () => {
  const metrics = parseMetrics(
    "?weight=999&height=50&bodyFat=0&age=200&sex=invalid&unit=metric" +
      "&feet=3&inches=20&enhanced=TRUE&years=99&trainingLevel=invalid",
    false,
  );

  assert.deepEqual(metrics, {
    weight: 450,
    height: 120,
    bodyFat: 3,
    age: 100,
    sex: "male",
    unit: "metric",
    feet: 4,
    inches: 11.9,
    enhanced: true,
    teeMultiplier: 1,
    barbieriFast: false,
    years: 10,
    trainingLevel: "DEDICATED",
  });
});

test("derives imperial height from feet and inches and serializes every field", () => {
  const metrics = parseMetrics(
    "?weight=165.5&height=999&bodyFat=14.5&age=35&sex=female&unit=imperial" +
      "&feet=5&inches=7.5&enhanced=false&years=3&trainingLevel=ELITE",
    false,
  );

  assert.equal(metrics.height, 67.5);
  assert.equal(
    serializeMetrics(metrics),
    "weight=165.5&height=67.5&bodyFat=14.5&age=35&sex=female&unit=imperial" +
      "&feet=5&inches=7.5&enhanced=false&teeMultiplier=1&barbieriFast=false" +
      "&years=3&trainingLevel=ELITE",
  );
});

test("supports exceptional imperial weight and body-fat inputs", () => {
  const metrics = parseMetrics(
    "?unit=imperial&weight=2000&bodyFat=99&teeMultiplier=9&barbieriFast=true",
    false,
  );

  assert.equal(metrics.weight, 1000);
  assert.equal(metrics.bodyFat, 75);
  assert.equal(metrics.teeMultiplier, 1.35);
  assert.equal(metrics.barbieriFast, true);
});

test("keeps deterministic projection semantics", () => {
  const projection = calculateProjection(DEFAULT_METRICS);

  assert.equal(projection.length, 49);
  assert.deepEqual(projection[0], {
    month: 0,
    ffmi: "19.47",
    bmi: "28.50",
    leanMass: "149.6",
    leanMassDisplay: "149.6 ",
  });
  assert.deepEqual(projection.at(-1), {
    month: 48,
    ffmi: "22.74",
    bmi: "28.50",
    leanMass: "174.8",
    leanMassDisplay: "174.8 (+25.2 lbs)",
  });
});

test("maintenance training leaves lean mass unchanged", () => {
  const projection = calculateProjection({
    ...DEFAULT_METRICS,
    trainingLevel: "MAINTENANCE",
    years: 1,
  });

  assert.equal(projection.length, 13);
  assert.equal(projection[0].leanMass, projection.at(-1).leanMass);
  assert.equal(projection.at(-1).leanMassDisplay, "149.6 ");
});

test("normalizes invalid manual metric values before calculation", () => {
  const metrics = normalizeMetrics({
    ...DEFAULT_METRICS,
    weight: "not-a-number",
    bodyFat: 99,
    age: 10,
    feet: 9,
    inches: -2,
    years: 0,
    trainingLevel: "UNKNOWN",
  });

  assert.deepEqual(metrics, {
    ...DEFAULT_METRICS,
    weight: DEFAULT_METRICS.weight,
    bodyFat: 75,
    age: 18,
    feet: 8,
    inches: 0,
    height: 96,
    years: 1,
  });
});

test("calculates a finite projection from invalid manual values", () => {
  const projection = calculateProjection({
    ...DEFAULT_METRICS,
    weight: Number.NaN,
    height: Number.NaN,
    bodyFat: Number.NaN,
    age: Number.NaN,
    years: Number.NaN,
  });

  assert.equal(projection.length, 49);
  assert.ok(projection.every((month) =>
    Number.isFinite(Number(month.ffmi)) &&
    Number.isFinite(Number(month.leanMass)),
  ));
});

test("treats intermediate typed numbers as invalid without normalizing them", () => {
  assert.equal(isMetricsValid({ ...DEFAULT_METRICS, weight: "" }), false);
  assert.equal(isMetricsValid({ ...DEFAULT_METRICS, weight: "1" }), false);
  assert.equal(isMetricsValid({ ...DEFAULT_METRICS, weight: "18" }), false);
  assert.equal(isMetricsValid({ ...DEFAULT_METRICS, weight: "180" }), true);
});

test("validates the visible height fields for the selected unit", () => {
  assert.equal(
    isMetricsValid({ ...DEFAULT_METRICS, feet: "", inches: "1.5" }),
    false,
  );
  assert.equal(
    isMetricsValid({
      ...DEFAULT_METRICS,
      unit: "metric",
      weight: "80",
      height: "180",
    }),
    true,
  );
  assert.equal(
    isMetricsValid({
      ...DEFAULT_METRICS,
      unit: "metric",
      weight: "80",
      height: "18",
    }),
    false,
  );
});

test("solves weight when FFMI is held constant and body fat changes", () => {
  const ffmi = calculateCurrentFFMI(DEFAULT_METRICS);
  const lowerBodyFat = { ...DEFAULT_METRICS, bodyFat: 20 };
  const weight = calculateWeightFromFFMI(ffmi, lowerBodyFat);

  assert.ok(weight < DEFAULT_METRICS.weight);
  assert.ok(
    Math.abs(calculateCurrentFFMI({ ...lowerBodyFat, weight }) - ffmi) < 1e-3,
  );
});

test("solves body fat when weight is held constant and FFMI changes", () => {
  const targetFFMI = calculateCurrentFFMI(DEFAULT_METRICS) + 1;
  const bodyFat = calculateBodyFatFromFFMI(targetFFMI, DEFAULT_METRICS);

  assert.ok(bodyFat < DEFAULT_METRICS.bodyFat);
  assert.ok(
    Math.abs(
      calculateCurrentFFMI({ ...DEFAULT_METRICS, bodyFat }) - targetFFMI,
    ) < 1e-10,
  );
});

test("validates editable FFMI values", () => {
  assert.equal(isFFMIValid(""), false);
  assert.equal(isFFMIValid("20"), true);
  assert.equal(isFFMIValid("40"), false);
});

test("projects body-fat targets to the sex-specific stage-lean floor", () => {
  const male = calculateFatLossProjection(DEFAULT_METRICS);
  const female = calculateFatLossProjection({
    ...DEFAULT_METRICS,
    sex: "female",
  });

  assert.deepEqual(male.targets.map((target) => target.bodyFat), [
    30, 25, 18, 14, 10, 6,
  ]);
  assert.deepEqual(female.targets.map((target) => target.bodyFat), [
    25, 21, 17, 14,
  ]);
  assert.deepEqual(male.targets.map((target) => target.label), [
    "Obese", "Overfat", "Average", "Flat stomach", "Visible abs", "Stage lean",
  ]);
  assert.deepEqual(female.targets.map((target) => target.label), [
    "Average", "Flat stomach", "Visible abs", "Stage lean",
  ]);
  assert.deepEqual(male.bodyFatBands.map((band) => band.max), [
    6, 10, 14, 18, 25, 30, 35,
  ]);
  assert.deepEqual(female.bodyFatBands.map((band) => band.max), [
    14, 17, 21, 25, 32,
  ]);
  assert.deepEqual(male.bodyFatBands.map((band) => band.range), [
    "2-5%", "6-9%", "10-13%", "14-17%", "18-24%", "25-29%", "30-34%",
  ]);
  assert.deepEqual(female.bodyFatBands.map((band) => band.range), [
    "10-13%", "14-16%", "17-20%", "21-24%", "25-31%",
  ]);
  assert.deepEqual(
    calculateFatLossProjection({ ...DEFAULT_METRICS, bodyFat: 8 })
      .targets.map((target) => target.bodyFat),
    [6],
  );
  assert.deepEqual(
    calculateFatLossProjection({
      ...DEFAULT_METRICS,
      bodyFat: 16,
      sex: "female",
    }).targets.map((target) => target.bodyFat),
    [14],
  );
  assert.ok(
    male.targets.every((target) => target.targetWeight < DEFAULT_METRICS.weight),
  );
  assert.ok(
    male.targets.every((target, index, targets) =>
      index === 0 || target.maxDailyDeficit < targets[index - 1].maxDailyDeficit,
    ),
  );
});

test("scales dynamic fat-loss timelines by the selected speed", () => {
  const projection = calculateFatLossProjection(DEFAULT_METRICS);
  const target = projection.targets.at(-1);
  const maximumDays = target.daysBySpeed.maximum;

  assert.ok(projection.maxDailyDeficit > 0);
  assert.ok(projection.model.minimumIntakeToStayWithinAdiposeFlux > 0);
  assert.equal(
    projection.model.minimumIntakeToStayWithinAdiposeFlux,
    projection.model.initialTee - projection.model.adiposeFluxCeiling,
  );
  assert.ok(Math.abs(target.daysBySpeed.conservative / maximumDays - 4) < 0.02);
  assert.ok(Math.abs(target.daysBySpeed.moderate / maximumDays - 2) < 0.02);
  assert.ok(Math.abs(target.daysBySpeed.fast / maximumDays - 4 / 3) < 0.02);
});

test("caps extreme-obesity deficits by TEE rather than adipose flux", () => {
  const projection = calculateFatLossProjection({
    ...DEFAULT_METRICS,
    weight: 539.2,
    bodyFat: 75,
  });

  assert.ok(projection.model.adiposeFluxCeiling > 12000);
  assert.ok(projection.model.initialTee > 2900);
  assert.ok(projection.model.initialTee < 3100);
  assert.ok(
    projection.maxDailyDeficit <=
      projection.model.initialTee - projection.model.minimumDailyIntake,
  );
  assert.ok(projection.maxDailyDeficit < 2000);
  assert.ok(projection.model.fluidShiftPotential > 7);
  assert.equal(projection.model.minimumIntakeToStayWithinAdiposeFlux, 0);
});

test("scales TEE and supports a zero-intake Barbieri-style fast", () => {
  const metrics = {
    ...DEFAULT_METRICS,
    weight: 456,
    bodyFat: 65,
    age: 27,
    height: 73,
    feet: 6,
    inches: 1,
    teeMultiplier: 1.2,
    barbieriFast: true,
  };
  const projection = calculateFatLossProjection(metrics);
  const chart = calculateWeightLossChart(metrics);
  const monthFraction = 382 / 30.4375 - 12;
  const modeledWeight =
    chart.data[12].maximum +
    (chart.data[13].maximum - chart.data[12].maximum) * monthFraction;
  const modeledLoss = metrics.weight - modeledWeight;

  assert.equal(projection.model.minimumDailyIntake, 0);
  assert.equal(projection.model.teeMultiplier, 1.2);
  assert.ok(Math.abs(projection.model.initialTee / projection.model.averageTee - 1.2) < 1e-10);
  assert.ok(Math.abs(modeledLoss - 276) < 3);
});

test("truncates targets when the modeled deficit stalls", () => {
  const projection = calculateFatLossProjection({
    ...DEFAULT_METRICS,
    weight: 176,
    bodyFat: 75,
    height: 68,
    feet: 5,
    inches: 8,
  });

  assert.equal(projection.targets.at(-1).bodyFat, 14);
  assert.ok(
    projection.targets.every((target) =>
      Object.values(target.daysBySpeed).every(Number.isFinite)
    ),
  );
});

test("uses researched sex-specific fitness and aesthetic bands", () => {
  const male = calculateFatLossProjection({
    ...DEFAULT_METRICS,
    bodyFat: 75,
  });
  const female = calculateFatLossProjection({
    ...DEFAULT_METRICS,
    bodyFat: 75,
    sex: "female",
  });

  assert.deepEqual(male.bodyFatBands.map((band) => band.label), [
    "Essential fat", "Stage lean", "Visible abs", "Flat stomach",
    "Average", "Overfat", "Obese", "Very obese", "Pronounced folds",
    "Extreme obesity", "Exceptional obesity",
  ]);
  assert.deepEqual(female.bodyFatBands.map((band) => band.label), [
    "Essential fat", "Stage lean", "Visible abs", "Flat stomach",
    "Average", "Overfat", "Obese", "Very obese", "Pronounced folds",
    "Extreme obesity", "Exceptional obesity",
  ]);
  assert.deepEqual(
    male.bodyFatBands.map((band) => [band.min, band.max]),
    [
      [2, 6], [6, 10], [10, 14], [14, 18], [18, 25], [25, 30],
      [30, 35], [35, 40], [40, 50], [50, 60], [60, 75],
    ],
  );
  assert.deepEqual(
    female.bodyFatBands.map((band) => [band.min, band.max]),
    [
      [10, 14], [14, 17], [17, 21], [21, 25], [25, 32], [32, 37],
      [37, 42], [42, 47], [47, 55], [55, 65], [65, 75],
    ],
  );
  assert.ok(
    male.bodyFatBands.every((band) => band.description.length > 20),
  );
  assert.ok(
    female.bodyFatBands.every((band) => band.description.length > 20),
  );
});

test("builds ordered weight-loss curves through the moderate-speed cutoff", () => {
  const chart = calculateWeightLossChart(DEFAULT_METRICS);
  const projection = calculateFatLossProjection(DEFAULT_METRICS);
  const first = chart.data[0];
  const second = chart.data[1];
  const last = chart.data.at(-1);
  const targetWeight = chart.targets.at(-1).targetWeight;
  const expectedCutoff = Math.ceil(
    projection.targets.at(-1).daysBySpeed.moderate / 30.4375 + 1,
  );

  chart.speeds.forEach((speed) => {
    assert.ok(Math.abs(first[speed.id] - DEFAULT_METRICS.weight) < 0.01);
    assert.ok(
      chart.data.every((point, index, data) =>
        index === 0 || point[speed.id] <= data[index - 1][speed.id],
      ),
    );
  });
  assert.ok(second.maximum < second.fast);
  assert.ok(second.fast < second.moderate);
  assert.ok(second.moderate < second.conservative);
  assert.ok(second.maximumDeficit < first.maximumDeficit);
  assert.ok(second.maximumDeficit > 0);
  assert.ok(Math.abs(last.month - expectedCutoff) < 1e-10);
  assert.ok(last.conservative > targetWeight);
  assert.ok(Math.abs(last.moderate - targetWeight) < 0.01);
  assert.ok(Math.abs(last.fast - targetWeight) < 0.05);
  assert.ok(Math.abs(last.maximum - targetWeight) < 0.05);
  assert.equal(last.maximumDeficit, 0);
  assert.ok(
    chart.speeds.every((speed) =>
      projection.simulations[speed.id].finalState.bodyFat <=
        chart.targets.at(-1).bodyFat
    ),
  );
});
