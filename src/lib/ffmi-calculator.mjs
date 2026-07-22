const BASE_PARAMS = {
  male: {
    natural: { rate: 0.3, ceiling: 25 },
    enhanced: { rate: 0.54, ceiling: 28 },
  },
  female: {
    natural: { rate: 0.18, ceiling: 20.5 },
    enhanced: { rate: 0.324, ceiling: 23 },
  },
};

export const TRAINING_LEVELS = {
  MAINTENANCE: {
    level: 0.0,
    label: "Maintenance",
    description: "Zero net change, just doing enough to not lose lean mass",
  },
  RECREATIONAL: {
    level: 0.33,
    label: "Recreational Lifter",
    description:
      "Steady gains, doing enough to gain muscle and getting started. Nutrition, sleep and recovery are not optimal.",
  },
  DEDICATED: {
    level: 0.66,
    label: "Dedicated Training",
    description: "Good training, good nutrition, good recovery",
  },
  ELITE: {
    level: 0.99,
    label: "Elite Programming",
    description:
      "Very good training, nutrition, recovery, sleep, and almost no injuries. Hard to pull off, takes a good amount of time per week.",
  },
};

export const FFMI_RANGE_LIMITS = {
  ENHANCED_ELITE: {
    label: "Very High FFMI Reference Range",
    maleFFMI: 30,
    femaleFFMI: 25,
    stroke: "#c026d3",
  },
  ENHANCED_TERRITORY: {
    label: "High FFMI Reference Range",
    maleFFMI: 27,
    femaleFFMI: 23,
    stroke: "#d946ef",
  },
  NATURAL_LIMIT: {
    label: "Traditional Male Natural-Limit Reference",
    maleFFMI: 25,
    femaleFFMI: 21,
    stroke: "#ff0000",
  },
  ADVANCED: {
    label: "Advanced Reference Range",
    maleFFMI: 23,
    femaleFFMI: 19,
    stroke: "#ff7300",
  },
  EXPERIENCED: {
    label: "Experienced Lifter",
    maleFFMI: 21,
    femaleFFMI: 17,
    stroke: "#eab308",
  },
  RECREATIONAL: {
    label: "Recreational Lifter",
    maleFFMI: 19,
    femaleFFMI: 15,
    stroke: "#22c55e",
  },
  UNTRAINED: {
    label: "Untrained Average",
    maleFFMI: 17,
    femaleFFMI: 13,
    stroke: "#0ea5e9",
  },
  BELOW_AVERAGE: {
    label: "Below Average",
    maleFFMI: 15,
    femaleFFMI: 11,
    stroke: "#3b82f6",
  },
  UNDERWEIGHT: {
    label: "Low FFMI Reference Range",
    maleFFMI: 13,
    femaleFFMI: 9,
    stroke: "#60a5fa",
  },
};

export const UNITS = {
  METRIC: "metric",
  IMPERIAL: "imperial",
};

export const WEIGHT_RANGES = {
  [UNITS.METRIC]: { min: 30, max: 450 },
  [UNITS.IMPERIAL]: { min: 66, max: 1000 },
};

export const BODY_FAT_RANGE = { min: 3, max: 75 };
export const TEE_MULTIPLIER_RANGE = { min: 0.75, max: 1.35 };

export const SEX = {
  MALE: "male",
  FEMALE: "female",
};

export const DEFAULT_METRICS = {
  weight: 219,
  height: 73.5,
  bodyFat: 31.7,
  age: 40,
  sex: SEX.MALE,
  unit: UNITS.IMPERIAL,
  feet: 6,
  inches: 1.5,
  enhanced: false,
  teeMultiplier: 1,
  barbieriFast: false,
  years: 4,
  trainingLevel: "DEDICATED",
};

export const convertWeightToMetric = (lbs) => lbs * 0.453592;
export const convertHeightToMetric = (inches) => inches * 2.54;
export const convertWeightToImperial = (kg) => kg * 2.20462;
export const convertHeightToImperial = (cm) => cm / 2.54;

export const getHeightInMeters = (height, unit) =>
  unit === UNITS.IMPERIAL ? height * 0.0254 : height / 100;

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const toFiniteNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const isNumberInRange = (value, min, max, integer = false) => {
  if (value === "" || value === null || value === undefined) return false;

  const parsed = Number(value);
  return (
    Number.isFinite(parsed) &&
    parsed >= min &&
    parsed <= max &&
    (!integer || Number.isInteger(parsed))
  );
};

export const isMetricsValid = (metrics) => {
  if (
    !Object.values(UNITS).includes(metrics.unit) ||
    !Object.values(SEX).includes(metrics.sex) ||
    !Object.hasOwn(TRAINING_LEVELS, metrics.trainingLevel)
  ) {
    return false;
  }

  const hasValidHeight = metrics.unit === UNITS.IMPERIAL
    ? isNumberInRange(metrics.feet, 4, 8, true) &&
      isNumberInRange(metrics.inches, 0, 11.9)
    : isNumberInRange(metrics.height, 120, 220);

  return (
    isNumberInRange(
      metrics.weight,
      WEIGHT_RANGES[metrics.unit].min,
      WEIGHT_RANGES[metrics.unit].max,
    ) &&
    hasValidHeight &&
    isNumberInRange(metrics.bodyFat, BODY_FAT_RANGE.min, BODY_FAT_RANGE.max) &&
    isNumberInRange(metrics.age, 18, 100, true) &&
    isNumberInRange(
      metrics.teeMultiplier,
      TEE_MULTIPLIER_RANGE.min,
      TEE_MULTIPLIER_RANGE.max,
    ) &&
    isNumberInRange(metrics.years, 1, 10, true)
  );
};

export const isFFMIValid = (value) => isNumberInRange(value, 8, 35);

export const normalizeMetrics = (metrics, fallback = DEFAULT_METRICS) => {
  const unit = Object.values(UNITS).includes(metrics.unit)
    ? metrics.unit
    : fallback.unit;
  const sex = Object.values(SEX).includes(metrics.sex) ? metrics.sex : fallback.sex;
  const feet = clamp(toFiniteNumber(metrics.feet, fallback.feet), 4, 8);
  const inches = clamp(toFiniteNumber(metrics.inches, fallback.inches), 0, 11.9);
  const height = unit === UNITS.IMPERIAL
    ? feet * 12 + inches
    : clamp(toFiniteNumber(metrics.height, fallback.height), 120, 220);

  return {
    weight: clamp(
      toFiniteNumber(metrics.weight, fallback.weight),
      WEIGHT_RANGES[unit].min,
      WEIGHT_RANGES[unit].max,
    ),
    height,
    bodyFat: clamp(
      toFiniteNumber(metrics.bodyFat, fallback.bodyFat),
      BODY_FAT_RANGE.min,
      BODY_FAT_RANGE.max,
    ),
    age: clamp(toFiniteNumber(metrics.age, fallback.age), 18, 100),
    sex,
    unit,
    feet,
    inches,
    enhanced: Boolean(metrics.enhanced),
    teeMultiplier: clamp(
      toFiniteNumber(metrics.teeMultiplier, fallback.teeMultiplier),
      TEE_MULTIPLIER_RANGE.min,
      TEE_MULTIPLIER_RANGE.max,
    ),
    barbieriFast: Boolean(metrics.barbieriFast),
    years: clamp(toFiniteNumber(metrics.years, fallback.years), 1, 10),
    trainingLevel: Object.hasOwn(TRAINING_LEVELS, metrics.trainingLevel)
      ? metrics.trainingLevel
      : fallback.trainingLevel,
  };
};

export const calculateCurrentFFMI = (metrics) => {
  const weightKg = metrics.unit === UNITS.IMPERIAL
    ? convertWeightToMetric(Number(metrics.weight))
    : Number(metrics.weight);
  const heightM = getHeightInMeters(Number(metrics.height), metrics.unit);
  const leanMassKg = weightKg * (1 - Number(metrics.bodyFat) / 100);
  return leanMassKg / (heightM * heightM);
};

export const calculateWeightFromFFMI = (ffmi, metrics) => {
  const heightM = getHeightInMeters(Number(metrics.height), metrics.unit);
  const leanMassKg = Number(ffmi) * heightM * heightM;
  const weightKg = leanMassKg / (1 - Number(metrics.bodyFat) / 100);
  return metrics.unit === UNITS.IMPERIAL
    ? convertWeightToImperial(weightKg)
    : weightKg;
};

export const calculateBodyFatFromFFMI = (ffmi, metrics) => {
  const weightKg = metrics.unit === UNITS.IMPERIAL
    ? convertWeightToMetric(Number(metrics.weight))
    : Number(metrics.weight);
  const heightM = getHeightInMeters(Number(metrics.height), metrics.unit);
  const leanMassKg = Number(ffmi) * heightM * heightM;
  return (1 - leanMassKg / weightKg) * 100;
};

export const FAT_LOSS_SPEEDS = [
  { id: "conservative", label: "25%", fraction: 0.25, color: "#2563eb" },
  { id: "moderate", label: "50%", fraction: 0.5, color: "#0891b2" },
  { id: "fast", label: "75%", fraction: 0.75, color: "#d97706" },
  { id: "maximum", label: "100%", fraction: 1, color: "#dc2626" },
];

const MAX_DAILY_KCAL_PER_POUND_OF_FAT = 32;
const FORBES_CONSTANT_KG = 1.9908;
const ENERGY_DENSITY_FAT_KCAL_PER_KG = 9440;
const ENERGY_DENSITY_LEAN_KCAL_PER_KG = 1807;
const LEAN_METABOLIC_RATE_KCAL_PER_KG = 22;
const FAT_METABOLIC_RATE_KCAL_PER_KG = 3.2;
const MINIMUM_DAILY_INTAKE_KCAL = 1000;
const MINIMUM_TEE_KCAL = 500;
const ADAPTIVE_THERMOGENESIS_FRACTION = 0.14;
const ADAPTIVE_THERMOGENESIS_DAYS = 14;
const FLUID_SHIFT_DAYS = 7;
const DAYS_PER_MONTH = 30.4375;
const MAX_SIMULATION_DAYS = 36525;
const MIN_DAILY_DEFICIT_KCAL = 1;

export const BODY_FAT_BANDS = {
  [SEX.MALE]: [
    { min: 2, max: 6, range: "2-5%", label: "Essential fat", description: "Competition-level leanness with deep separation and vascularity.", color: "#8b5cf6" },
    { min: 6, max: 10, range: "6-9%", label: "Stage lean", description: "Sharp abs and extensive muscle definition.", color: "#6366f1" },
    { min: 10, max: 14, range: "10-13%", label: "Visible abs", description: "Abs are usually visible with a lean athletic outline.", color: "#0ea5e9" },
    { min: 14, max: 18, range: "14-17%", label: "Flat stomach", description: "A flat waist with some ab outline.", color: "#22c55e" },
    { min: 18, max: 25, range: "18-24%", label: "Average", description: "A softer midsection with little ab definition.", color: "#eab308" },
    { min: 25, max: 30, range: "25-29%", label: "Overfat", description: "The waist thickens and a belly becomes noticeable.", color: "#f97316" },
    { min: 30, max: 35, range: "30-34%", label: "Obese", description: "A prominent belly, with side or lower-back rolls starting to appear.", color: "#ef4444" },
    { min: 35, max: 40, range: "35-39%", label: "Very obese", description: "A belly overhang and multiple torso rolls become common.", color: "#dc2626" },
    { min: 40, max: 50, range: "40-49%", label: "Pronounced folds", description: "A hanging abdomen and deeper folds across the torso are common.", color: "#b91c1c" },
    { min: 50, max: 60, range: "50-59%", label: "Extreme obesity", description: "A very large abdomen and extensive folds dominate the silhouette.", color: "#991b1b" },
    { min: 60, max: 75, range: "60%+", label: "Exceptional obesity", description: "Exceptional high-weight territory with a very large hanging abdomen and extensive folds.", color: "#7f1d1d" },
  ],
  [SEX.FEMALE]: [
    { min: 10, max: 14, range: "10-13%", label: "Essential fat", description: "Competition-level leanness with pronounced definition.", color: "#8b5cf6" },
    { min: 14, max: 17, range: "14-16%", label: "Stage lean", description: "Very lean with sharp athletic definition.", color: "#6366f1" },
    { min: 17, max: 21, range: "17-20%", label: "Visible abs", description: "Ab definition is often visible with an athletic outline.", color: "#0ea5e9" },
    { min: 21, max: 25, range: "21-24%", label: "Flat stomach", description: "A flat waist with mild abdominal definition.", color: "#22c55e" },
    { min: 25, max: 32, range: "25-31%", label: "Average", description: "A softer waist with natural hip and thigh curves.", color: "#eab308" },
    { min: 32, max: 37, range: "32-36%", label: "Overfat", description: "The waist is less defined and a lower-belly fold may appear.", color: "#f97316" },
    { min: 37, max: 42, range: "37-41%", label: "Obese", description: "A prominent belly, with side or back rolls starting to appear.", color: "#ef4444" },
    { min: 42, max: 47, range: "42-46%", label: "Very obese", description: "Multiple torso rolls and a belly overhang become common.", color: "#dc2626" },
    { min: 47, max: 55, range: "47-54%", label: "Pronounced folds", description: "A hanging abdomen and deeper folds across the torso are common.", color: "#b91c1c" },
    { min: 55, max: 65, range: "55-64%", label: "Extreme obesity", description: "A very large abdomen and extensive folds dominate the silhouette.", color: "#991b1b" },
    { min: 65, max: 75, range: "65%+", label: "Exceptional obesity", description: "Exceptional high-weight territory with a very large hanging abdomen and extensive folds.", color: "#7f1d1d" },
  ],
};

const getBodyFatBand = (bodyFat, sex) => {
  const bands = BODY_FAT_BANDS[sex];
  const matchingBand = bands.find(
    (band) => bodyFat >= band.min && bodyFat < band.max,
  );
  if (matchingBand) return matchingBand;

  const edgeBand = bodyFat < (bands[0]?.min ?? 0) ? bands[0] : bands.at(-1);
  if (!edgeBand) {
    throw new Error(`No body-fat bands configured for ${sex}`);
  }
  return edgeBand;
};

export const calculateTotalEnergyExpenditure = (metrics) => {
  const normalized = normalizeMetrics(metrics);
  const weightKg = normalized.unit === UNITS.IMPERIAL
    ? convertWeightToMetric(normalized.weight)
    : normalized.weight;
  const leanMassKg = weightKg * (1 - normalized.bodyFat / 100);
  return (
    238.85 *
    0.677 *
    Math.pow(leanMassKg, 0.708) *
    normalized.teeMultiplier
  );
};

const createSimulationState = ({
  day,
  fatMassKg,
  leanMassKg,
  fluidLossKg,
  tee,
  maxDailyDeficit,
  dailyDeficit,
}) => ({
  day,
  fatMassKg,
  leanMassKg,
  fluidLossKg,
  tee,
  maxDailyDeficit,
  dailyDeficit,
  bodyFat: fatMassKg / (fatMassKg + leanMassKg) * 100,
  scaleWeightKg: fatMassKg + leanMassKg - fluidLossKg,
});

const simulateFatLossSpeed = ({
  fatMassKg: initialFatMassKg,
  leanMassKg: initialLeanMassKg,
  initialTee,
  fluidShiftPotentialKg,
  minimumDailyIntake,
  targetBodyFats,
  speed,
}) => {
  let fatMassKg = initialFatMassKg;
  let leanMassKg = initialLeanMassKg;
  let targetIndex = 0;
  let nextMonth = 1;
  const targetStates = {};
  const monthly = [];
  const initialAdiposeCeiling =
    convertWeightToImperial(fatMassKg) * MAX_DAILY_KCAL_PER_POUND_OF_FAT;
  const initialMaxDailyDeficit = Math.max(
    0,
    Math.min(initialAdiposeCeiling, initialTee - minimumDailyIntake),
  );
  const initialState = createSimulationState({
    day: 0,
    fatMassKg,
    leanMassKg,
    fluidLossKg: 0,
    tee: initialTee,
    maxDailyDeficit: initialMaxDailyDeficit,
    dailyDeficit: initialMaxDailyDeficit * speed.fraction,
  });
  monthly.push(initialState);
  let finalState = initialState;

  for (let day = 1; day <= MAX_SIMULATION_DAYS; day += 1) {
    const tissueTee = Math.max(
      MINIMUM_TEE_KCAL,
      initialTee +
        LEAN_METABOLIC_RATE_KCAL_PER_KG *
          (leanMassKg - initialLeanMassKg) +
        FAT_METABOLIC_RATE_KCAL_PER_KG *
          (fatMassKg - initialFatMassKg),
    );
    const adiposeCeiling =
      convertWeightToImperial(fatMassKg) * MAX_DAILY_KCAL_PER_POUND_OF_FAT;
    const preAdaptationMaximum = Math.max(
      0,
      Math.min(adiposeCeiling, tissueTee - minimumDailyIntake),
    );
    const adaptation =
      preAdaptationMaximum *
      speed.fraction *
      ADAPTIVE_THERMOGENESIS_FRACTION *
      (1 - Math.exp(-day / ADAPTIVE_THERMOGENESIS_DAYS));
    const tee = Math.max(MINIMUM_TEE_KCAL, tissueTee - adaptation);
    const maxDailyDeficit = Math.max(
      0,
      Math.min(adiposeCeiling, tee - minimumDailyIntake),
    );
    const dailyDeficit = maxDailyDeficit * speed.fraction;
    const leanFraction =
      FORBES_CONSTANT_KG / (FORBES_CONSTANT_KG + fatMassKg);
    const energyDensity =
      ENERGY_DENSITY_FAT_KCAL_PER_KG * (1 - leanFraction) +
      ENERGY_DENSITY_LEAN_KCAL_PER_KG * leanFraction;
    const tissueLossKg = dailyDeficit / energyDensity;
    fatMassKg = Math.max(
      0,
      fatMassKg - tissueLossKg * (1 - leanFraction),
    );
    leanMassKg = Math.max(
      0,
      leanMassKg - tissueLossKg * leanFraction,
    );
    const fluidLossKg =
      fluidShiftPotentialKg *
      (1 - Math.exp(-day / FLUID_SHIFT_DAYS));
    finalState = createSimulationState({
      day,
      fatMassKg,
      leanMassKg,
      fluidLossKg,
      tee,
      maxDailyDeficit,
      dailyDeficit,
    });

    while (
      targetIndex < targetBodyFats.length &&
      finalState.bodyFat <= targetBodyFats[targetIndex]
    ) {
      targetStates[targetBodyFats[targetIndex]] = finalState;
      targetIndex += 1;
    }
    while (day >= nextMonth * DAYS_PER_MONTH) {
      monthly[nextMonth] = finalState;
      nextMonth += 1;
    }
    if (
      targetIndex === targetBodyFats.length ||
      maxDailyDeficit < MIN_DAILY_DEFICIT_KCAL
    ) {
      break;
    }
  }

  return { initialState, finalState, monthly, targetStates };
};

let fatLossProjectionCacheKey;
let fatLossProjectionCacheValue;

export const calculateFatLossProjection = (metrics) => {
  const normalized = normalizeMetrics(metrics);
  const cacheKey = JSON.stringify(normalized);
  if (cacheKey === fatLossProjectionCacheKey) {
    return fatLossProjectionCacheValue;
  }

  const weightKg = normalized.unit === UNITS.IMPERIAL
    ? convertWeightToMetric(normalized.weight)
    : normalized.weight;
  const fatMassKg = weightKg * normalized.bodyFat / 100;
  const leanMassKg = weightKg - fatMassKg;
  const fatMassLb = convertWeightToImperial(fatMassKg);
  const initialTee = calculateTotalEnergyExpenditure(normalized);
  const averageTee = initialTee / normalized.teeMultiplier;
  const minimumDailyIntake = normalized.barbieriFast
    ? 0
    : MINIMUM_DAILY_INTAKE_KCAL;
  const stageLeanBand = BODY_FAT_BANDS[normalized.sex]
    .find((band) => band.label === "Stage lean");
  if (!stageLeanBand) {
    throw new Error(`No Stage lean band configured for ${normalized.sex}`);
  }
  const minimumTarget = stageLeanBand.min;
  const targetBodyFats = BODY_FAT_BANDS[normalized.sex]
    .map((band) => band.min)
    .filter((bodyFat) =>
      bodyFat >= minimumTarget && bodyFat < normalized.bodyFat
    )
    .sort((a, b) => b - a);
  const fluidShiftPotentialKg = clamp(weightKg * 0.015, 1.5, 3.6);
  const simulations = Object.fromEntries(
    FAT_LOSS_SPEEDS.map((speed) => [
      speed.id,
      simulateFatLossSpeed({
        fatMassKg,
        leanMassKg,
        initialTee,
        fluidShiftPotentialKg,
        minimumDailyIntake,
        targetBodyFats,
        speed,
      }),
    ]),
  );
  const moderateSimulation = simulations.moderate;
  const reachedTargetBodyFats = targetBodyFats.filter(
    (bodyFat) => moderateSimulation.targetStates[bodyFat],
  );
  const targets = reachedTargetBodyFats.map((bodyFat) => {
    const band = getBodyFatBand(bodyFat, normalized.sex);
    const moderateState = moderateSimulation.targetStates[bodyFat];
    return {
      bodyFat,
      label: band.label,
      range: band.range,
      description: band.description,
      color: band.color,
      targetWeight: normalized.unit === UNITS.IMPERIAL
        ? convertWeightToImperial(moderateState.scaleWeightKg)
        : moderateState.scaleWeightKg,
      maxDailyDeficit: moderateState.maxDailyDeficit,
      daysBySpeed: Object.fromEntries(
        FAT_LOSS_SPEEDS.map((speed) => [
          speed.id,
          simulations[speed.id].targetStates[bodyFat]?.day ?? null,
        ]),
      ),
    };
  });

  const getModerateWeightAtBodyFat = (bodyFat) => {
    if (bodyFat === normalized.bodyFat) return normalized.weight;
    const targetState = moderateSimulation.targetStates[bodyFat];
    if (targetState) {
      return normalized.unit === UNITS.IMPERIAL
        ? convertWeightToImperial(targetState.scaleWeightKg)
        : targetState.scaleWeightKg;
    }

    const referenceState = moderateSimulation.finalState;
    const targetFraction = bodyFat / 100;
    const extrapolatedFatMassKg =
      referenceState.leanMassKg * targetFraction / (1 - targetFraction);
    const scaleWeightKg =
      referenceState.leanMassKg +
      extrapolatedFatMassKg -
      referenceState.fluidLossKg;
    return normalized.unit === UNITS.IMPERIAL
      ? convertWeightToImperial(scaleWeightKg)
      : scaleWeightKg;
  };

  const bodyFatBands = BODY_FAT_BANDS[normalized.sex]
    .map((band) => ({
      ...band,
      lowerBodyFat: band.min,
      upperBodyFat: Math.min(band.max, normalized.bodyFat),
    }))
    .filter((band) => band.upperBodyFat > band.lowerBodyFat)
    .map((band) => ({
      ...band,
      lowerWeight: getModerateWeightAtBodyFat(band.lowerBodyFat),
      upperWeight: getModerateWeightAtBodyFat(band.upperBodyFat),
    }));

  const adiposeFluxCeiling =
    fatMassLb * MAX_DAILY_KCAL_PER_POUND_OF_FAT;
  const minimumIntakeToStayWithinAdiposeFlux = Math.max(
    0,
    initialTee - adiposeFluxCeiling,
  );
  const maxDailyDeficit = Math.max(
    0,
    Math.min(adiposeFluxCeiling, initialTee - minimumDailyIntake),
  );
  const result = {
    maxDailyDeficit,
    speeds: FAT_LOSS_SPEEDS.map((speed) => ({
      ...speed,
      initialDailyDeficit: maxDailyDeficit * speed.fraction,
    })),
    targets,
    bodyFatBands,
    model: {
      name: "Hall/Forbes dynamic model",
      averageTee,
      initialTee,
      teeMultiplier: normalized.teeMultiplier,
      adiposeFluxCeiling,
      minimumDailyIntake,
      minimumIntakeToStayWithinAdiposeFlux,
      barbieriFast: normalized.barbieriFast,
      fluidShiftPotential: normalized.unit === UNITS.IMPERIAL
        ? convertWeightToImperial(fluidShiftPotentialKg)
        : fluidShiftPotentialKg,
    },
    simulations,
  };
  fatLossProjectionCacheKey = cacheKey;
  fatLossProjectionCacheValue = result;
  return result;
};

export const calculateWeightLossChart = (metrics) => {
  const normalized = normalizeMetrics(metrics);
  const projection = calculateFatLossProjection(normalized);
  if (projection.targets.length === 0) {
    return {
      data: [],
      targets: [],
      speeds: FAT_LOSS_SPEEDS,
      bodyFatBands: projection.bodyFatBands,
    };
  }

  const cutoffMonth = Math.ceil(
    projection.targets.at(-1).daysBySpeed.moderate / DAYS_PER_MONTH + 1,
  );
  const months = Array.from({ length: cutoffMonth + 1 }, (_, month) => month);
  const data = [];

  months.forEach((month) => {
    const point = { month };

    FAT_LOSS_SPEEDS.forEach((speed) => {
      const simulation = projection.simulations[speed.id];
      const state = simulation.monthly[month] ?? simulation.finalState;
      point[speed.id] = normalized.unit === UNITS.IMPERIAL
        ? convertWeightToImperial(state.scaleWeightKg)
        : state.scaleWeightKg;
      point[`${speed.id}Deficit`] =
        month * DAYS_PER_MONTH >= simulation.finalState.day
          ? 0
          : state.dailyDeficit;
    });

    data.push(point);
  });

  return {
    data,
    targets: projection.targets,
    speeds: FAT_LOSS_SPEEDS,
    bodyFatBands: projection.bodyFatBands,
    model: projection.model,
  };
};

export const calculateLeanMassFromFFMI = (ffmi, heightM, unit) => {
  const leanMassKg = ffmi * (heightM * heightM);
  return unit === UNITS.IMPERIAL
    ? convertWeightToImperial(leanMassKg)
    : leanMassKg;
};

const getUrlParam = (urlParams, param, defaultValue, validate) => {
  const value = urlParams.get(param);
  if (!value) return defaultValue;

  let parsed;
  try {
    if (typeof defaultValue === "boolean") {
      parsed = value.toLowerCase() === "true";
    } else if (typeof defaultValue === "number") {
      parsed = parseFloat(value);
      if (Number.isNaN(parsed)) return defaultValue;
    } else {
      parsed = value;
    }

    return validate ? validate(parsed) : parsed;
  } catch {
    return defaultValue;
  }
};

export const parseMetrics = (search, isMobile) => {
  const urlParams = new URLSearchParams(search);
  const unit = getUrlParam(
    urlParams,
    "unit",
    DEFAULT_METRICS.unit,
    (value) =>
      Object.values(UNITS).includes(value) ? value : UNITS.IMPERIAL,
  );
  const feet = getUrlParam(
    urlParams,
    "feet",
    DEFAULT_METRICS.feet,
    (value) => Math.max(4, Math.min(8, value)),
  );
  const inches = getUrlParam(
    urlParams,
    "inches",
    DEFAULT_METRICS.inches,
    (value) => Math.max(0, Math.min(11.9, value)),
  );
  const height =
    unit === UNITS.IMPERIAL
      ? feet * 12 + inches
      : getUrlParam(
          urlParams,
          "height",
          DEFAULT_METRICS.height,
          (value) => Math.max(120, Math.min(220, value)),
        );

  return {
    weight: getUrlParam(
      urlParams,
      "weight",
      DEFAULT_METRICS.weight,
      (value) =>
        Math.max(
          WEIGHT_RANGES[unit].min,
          Math.min(WEIGHT_RANGES[unit].max, value),
        ),
    ),
    height,
    bodyFat: getUrlParam(
      urlParams,
      "bodyFat",
      DEFAULT_METRICS.bodyFat,
      (value) =>
        Math.max(BODY_FAT_RANGE.min, Math.min(BODY_FAT_RANGE.max, value)),
    ),
    age: getUrlParam(
      urlParams,
      "age",
      DEFAULT_METRICS.age,
      (value) => Math.max(18, Math.min(100, value)),
    ),
    sex: getUrlParam(
      urlParams,
      "sex",
      DEFAULT_METRICS.sex,
      (value) => (Object.values(SEX).includes(value) ? value : SEX.MALE),
    ),
    unit,
    feet,
    inches,
    enhanced: getUrlParam(urlParams, "enhanced", DEFAULT_METRICS.enhanced),
    teeMultiplier: getUrlParam(
      urlParams,
      "teeMultiplier",
      DEFAULT_METRICS.teeMultiplier,
      (value) =>
        Math.max(
          TEE_MULTIPLIER_RANGE.min,
          Math.min(TEE_MULTIPLIER_RANGE.max, value),
        ),
    ),
    barbieriFast: getUrlParam(
      urlParams,
      "barbieriFast",
      DEFAULT_METRICS.barbieriFast,
    ),
    years: getUrlParam(
      urlParams,
      "years",
      isMobile ? 2 : DEFAULT_METRICS.years,
      (value) => Math.max(1, Math.min(10, value)),
    ),
    trainingLevel: getUrlParam(
      urlParams,
      "trainingLevel",
      DEFAULT_METRICS.trainingLevel,
      (value) =>
        Object.keys(TRAINING_LEVELS).includes(value) ? value : "DEDICATED",
    ),
  };
};

export const serializeMetrics = (metrics) => {
  const params = new URLSearchParams();
  Object.entries(metrics).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      params.set(key, value.toString());
    }
  });
  return params.toString();
};

const calculateFFMIChange = ({
  gender,
  pedUse,
  trainingLevelKey,
  currentFFMI,
  age,
}) => {
  const params = BASE_PARAMS[gender][pedUse ? "enhanced" : "natural"];
  const divisor = pedUse ? 6 : 8;
  const trainingLevel = TRAINING_LEVELS[trainingLevelKey].level;

  return (
    (trainingLevel *
      params.rate *
      (params.ceiling - currentFFMI) *
      1.1 *
      Math.exp(-0.0175 * (age - 18))) /
    divisor
  );
};

export const calculateProjection = (metrics) => {
  metrics = normalizeMetrics(metrics);
  const weightKg =
    metrics.unit === UNITS.IMPERIAL
      ? convertWeightToMetric(metrics.weight)
      : metrics.weight;
  const heightM = getHeightInMeters(metrics.height, metrics.unit);
  const leanMass = weightKg * (1 - metrics.bodyFat / 100);
  const bmi = weightKg / (heightM * heightM);
  let currentFfmi = leanMass / (heightM * heightM);
  const initialLeanMassKg = currentFfmi * (heightM * heightM);
  const initialLeanMass =
    metrics.unit === UNITS.IMPERIAL
      ? convertWeightToImperial(initialLeanMassKg)
      : initialLeanMassKg;
  const data = [];

  for (let month = 0; month <= metrics.years * 12; month += 1) {
    const leanMassKg = currentFfmi * (heightM * heightM);
    const projectedLeanMass =
      metrics.unit === UNITS.IMPERIAL
        ? convertWeightToImperial(leanMassKg)
        : leanMassKg;
    const gained = projectedLeanMass - initialLeanMass;
    const unit = metrics.unit === UNITS.METRIC ? "kg" : "lbs";

    data.push({
      month,
      ffmi: currentFfmi.toFixed(2),
      bmi: bmi.toFixed(2),
      leanMass: projectedLeanMass.toFixed(1),
      leanMassDisplay: `${projectedLeanMass.toFixed(1)} ${
        gained === 0
          ? ""
          : `(${gained > 0 ? "+" : ""}${gained.toFixed(1)} ${unit})`
      }`,
    });

    currentFfmi += calculateFFMIChange({
      gender: metrics.sex,
      pedUse: metrics.enhanced,
      trainingLevelKey: metrics.trainingLevel,
      currentFFMI: currentFfmi,
      age: metrics.age,
    });
  }

  return data;
};
