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
    label: "Very High FFMI (Elite Steroid/Enhanced Range)",
    maleFFMI: 30,
    femaleFFMI: 25,
    stroke: "#c026d3",
  },
  ENHANCED_TERRITORY: {
    label: "High FFMI (Steroid/Enhanced Range)",
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
  UK: "uk",
};

export const WEIGHT_RANGES = {
  [UNITS.METRIC]: { min: 30, max: 450 },
  [UNITS.IMPERIAL]: { min: 66, max: 1000 },
  [UNITS.UK]: { min: 66, max: 1000 },
};

export const BODY_FAT_RANGE = { min: 3, max: 75 };
export const TEE_MULTIPLIER_RANGE = { min: 0.75, max: 1.35 };
export const BODY_FAT_UNCERTAINTY_RANGE = { min: 0, max: 10 };
export const TEE_UNCERTAINTY_RANGE = { min: 0, max: 0.3 };

export const SEX = {
  MALE: "male",
  FEMALE: "female",
};

export const DEFAULT_METRICS = {
  weight: 220,
  height: 74,
  bodyFat: 32,
  age: 40,
  sex: SEX.MALE,
  unit: UNITS.IMPERIAL,
  feet: 6,
  inches: 2,
  enhanced: false,
  teeMultiplier: 1,
  bodyFatUncertainty: 3,
  teeUncertainty: 0.1,
  barbieriFast: false,
  years: 4,
  trainingLevel: "DEDICATED",
};

export const convertWeightToMetric = (lbs) => lbs * 0.453592;
export const convertHeightToMetric = (inches) => inches * 2.54;
export const convertWeightToImperial = (kg) => kg * 2.20462;
export const convertHeightToImperial = (cm) => cm / 2.54;
export const usesImperialHeight = (unit) => unit !== UNITS.METRIC;
export const usesPoundWeight = (unit) => unit !== UNITS.METRIC;
export const convertWeightForDisplay = (kg, unit) => {
  if (unit === UNITS.METRIC) return kg;
  const pounds = convertWeightToImperial(kg);
  return unit === UNITS.UK ? pounds / 14 : pounds;
};
export const convertDisplayedWeightToMetric = (weight, unit) => {
  if (unit === UNITS.METRIC) return weight;
  return convertWeightToMetric(unit === UNITS.UK ? weight * 14 : weight);
};
export const splitPoundsIntoStone = (totalPounds) => {
  let stones = Math.floor(Number(totalPounds) / 14);
  let pounds = Math.round((Number(totalPounds) - stones * 14) * 10) / 10;
  if (pounds >= 14) {
    stones += 1;
    pounds = 0;
  }
  return { stones, pounds };
};

export const getHeightInMeters = (height, unit) =>
  usesImperialHeight(unit) ? height * 0.0254 : height / 100;

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

  const hasValidHeight = usesImperialHeight(metrics.unit)
    ? isNumberInRange(metrics.feet, 4, 8, true) &&
      isNumberInRange(metrics.inches, 0, 11.9)
    : isNumberInRange(metrics.height, 120, 220);
  const hasValidUKWeight = metrics.unit !== UNITS.UK ||
    (
      isNumberInRange(metrics.stones, 4, 71, true) &&
      isNumberInRange(metrics.stonePounds, 0, 13.9) &&
      Math.abs(
        Number(metrics.weight) -
          (Number(metrics.stones) * 14 + Number(metrics.stonePounds)),
      ) < 0.11
    );

  return (
    isNumberInRange(
      metrics.weight,
      WEIGHT_RANGES[metrics.unit].min,
      WEIGHT_RANGES[metrics.unit].max,
    ) &&
    hasValidHeight &&
    hasValidUKWeight &&
    isNumberInRange(metrics.bodyFat, BODY_FAT_RANGE.min, BODY_FAT_RANGE.max) &&
    isNumberInRange(metrics.age, 18, 100, true) &&
    isNumberInRange(
      metrics.teeMultiplier,
      TEE_MULTIPLIER_RANGE.min,
      TEE_MULTIPLIER_RANGE.max,
    ) &&
    isNumberInRange(
      metrics.bodyFatUncertainty,
      BODY_FAT_UNCERTAINTY_RANGE.min,
      BODY_FAT_UNCERTAINTY_RANGE.max,
    ) &&
    isNumberInRange(
      metrics.teeUncertainty,
      TEE_UNCERTAINTY_RANGE.min,
      TEE_UNCERTAINTY_RANGE.max,
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
  const height = usesImperialHeight(unit)
    ? feet * 12 + inches
    : clamp(toFiniteNumber(metrics.height, fallback.height), 120, 220);
  const weight = clamp(
    toFiniteNumber(metrics.weight, fallback.weight),
    WEIGHT_RANGES[unit].min,
    WEIGHT_RANGES[unit].max,
  );
  const stoneParts = splitPoundsIntoStone(weight);

  return {
    weight,
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
    ...(unit === UNITS.UK
      ? {
          stones: stoneParts.stones,
          stonePounds: stoneParts.pounds,
        }
      : {}),
    enhanced: Boolean(metrics.enhanced),
    teeMultiplier: clamp(
      toFiniteNumber(metrics.teeMultiplier, fallback.teeMultiplier),
      TEE_MULTIPLIER_RANGE.min,
      TEE_MULTIPLIER_RANGE.max,
    ),
    bodyFatUncertainty: clamp(
      toFiniteNumber(
        metrics.bodyFatUncertainty,
        fallback.bodyFatUncertainty,
      ),
      BODY_FAT_UNCERTAINTY_RANGE.min,
      BODY_FAT_UNCERTAINTY_RANGE.max,
    ),
    teeUncertainty: clamp(
      toFiniteNumber(metrics.teeUncertainty, fallback.teeUncertainty),
      TEE_UNCERTAINTY_RANGE.min,
      TEE_UNCERTAINTY_RANGE.max,
    ),
    barbieriFast: Boolean(metrics.barbieriFast),
    years: clamp(toFiniteNumber(metrics.years, fallback.years), 1, 10),
    trainingLevel: Object.hasOwn(TRAINING_LEVELS, metrics.trainingLevel)
      ? metrics.trainingLevel
      : fallback.trainingLevel,
  };
};

export const calculateCurrentFFMI = (metrics) => {
  const weightKg = usesPoundWeight(metrics.unit)
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
  return usesPoundWeight(metrics.unit)
    ? convertWeightToImperial(weightKg)
    : weightKg;
};

export const calculateBodyFatFromFFMI = (ffmi, metrics) => {
  const weightKg = usesPoundWeight(metrics.unit)
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
  const weightKg = usesPoundWeight(normalized.unit)
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

const createFatLossSimulationInputs = (normalized) => {
  const weightKg = usesPoundWeight(normalized.unit)
    ? convertWeightToMetric(normalized.weight)
    : normalized.weight;
  const fatMassKg = weightKg * normalized.bodyFat / 100;
  const leanMassKg = weightKg - fatMassKg;
  const initialTee = calculateTotalEnergyExpenditure(normalized);
  const minimumDailyIntake = normalized.barbieriFast
    ? 0
    : MINIMUM_DAILY_INTAKE_KCAL;
  const stageLeanBand = BODY_FAT_BANDS[normalized.sex]
    .find((band) => band.label === "Stage lean");
  if (!stageLeanBand) {
    throw new Error(`No Stage lean band configured for ${normalized.sex}`);
  }
  const targetBodyFats = BODY_FAT_BANDS[normalized.sex]
    .map((band) => band.min)
    .filter((bodyFat) =>
      bodyFat >= stageLeanBand.min && bodyFat < normalized.bodyFat
    )
    .sort((a, b) => b - a);

  return {
    weightKg,
    fatMassKg,
    leanMassKg,
    initialTee,
    minimumDailyIntake,
    targetBodyFats,
    fluidShiftPotentialKg: clamp(weightKg * 0.015, 1.5, 3.6),
  };
};

const fatLossProjectionCache = new Map();

export const calculateFatLossProjection = (metrics) => {
  const normalized = normalizeMetrics(metrics);
  const cacheKey = JSON.stringify(normalized);
  if (fatLossProjectionCache.has(cacheKey)) {
    return fatLossProjectionCache.get(cacheKey);
  }

  const {
    weightKg,
    fatMassKg,
    leanMassKg,
    initialTee,
    minimumDailyIntake,
    targetBodyFats,
    fluidShiftPotentialKg,
  } = createFatLossSimulationInputs(normalized);
  const fatMassLb = convertWeightToImperial(fatMassKg);
  const averageTee = initialTee / normalized.teeMultiplier;
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
      targetWeight: convertWeightForDisplay(
        moderateState.scaleWeightKg,
        normalized.unit,
      ),
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
    if (bodyFat === normalized.bodyFat) {
      return convertWeightForDisplay(weightKg, normalized.unit);
    }
    const targetState = moderateSimulation.targetStates[bodyFat];
    if (targetState) {
      return convertWeightForDisplay(
        targetState.scaleWeightKg,
        normalized.unit,
      );
    }

    const referenceState = moderateSimulation.finalState;
    const targetFraction = bodyFat / 100;
    const extrapolatedFatMassKg =
      referenceState.leanMassKg * targetFraction / (1 - targetFraction);
    const scaleWeightKg =
      referenceState.leanMassKg +
      extrapolatedFatMassKg -
      referenceState.fluidLossKg;
    return convertWeightForDisplay(scaleWeightKg, normalized.unit);
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
      fluidShiftPotential: convertWeightForDisplay(
        fluidShiftPotentialKg,
        normalized.unit,
      ),
    },
    simulations,
  };
  fatLossProjectionCache.set(cacheKey, result);
  if (fatLossProjectionCache.size > 12) {
    fatLossProjectionCache.delete(fatLossProjectionCache.keys().next().value);
  }
  return result;
};

const calculateWeightLossChartBase = (metrics) => {
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
      point[speed.id] = convertWeightForDisplay(
        state.scaleWeightKg,
        normalized.unit,
      );
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

const createSensitivitySamples = (minimum, maximum, center, count = 9) => {
  if (minimum === maximum) return [minimum];

  return [...new Set([
    ...Array.from(
      { length: count },
      (_, index) => minimum + (maximum - minimum) * index / (count - 1),
    ),
    center,
  ])].sort((a, b) => a - b);
};

const simulateSensitivityScenario = (normalized) => {
  const inputs = createFatLossSimulationInputs(normalized);
  return Object.fromEntries(
    FAT_LOSS_SPEEDS.map((speed) => [
      speed.id,
      simulateFatLossSpeed({ ...inputs, speed }),
    ]),
  );
};

const weightLossChartCache = new Map();

export const calculateWeightLossChart = (metrics) => {
  const normalized = normalizeMetrics(metrics);
  const cacheKey = JSON.stringify(normalized);
  if (weightLossChartCache.has(cacheKey)) {
    return weightLossChartCache.get(cacheKey);
  }

  const chart = calculateWeightLossChartBase(normalized);
  if (chart.data.length === 0) {
    const emptyResult = {
      ...chart,
      sensitivity: {
        bodyFat: normalized.bodyFatUncertainty,
        tee: normalized.teeUncertainty,
      },
    };
    weightLossChartCache.set(cacheKey, emptyResult);
    if (weightLossChartCache.size > 12) {
      weightLossChartCache.delete(weightLossChartCache.keys().next().value);
    }
    return emptyResult;
  }

  const bodyFatMinimum = clamp(
    normalized.bodyFat - normalized.bodyFatUncertainty,
    BODY_FAT_RANGE.min,
    BODY_FAT_RANGE.max,
  );
  const bodyFatMaximum = clamp(
    normalized.bodyFat + normalized.bodyFatUncertainty,
    BODY_FAT_RANGE.min,
    BODY_FAT_RANGE.max,
  );
  const teeMinimum = clamp(
    normalized.teeMultiplier - normalized.teeUncertainty,
    TEE_MULTIPLIER_RANGE.min,
    TEE_MULTIPLIER_RANGE.max,
  );
  const teeMaximum = clamp(
    normalized.teeMultiplier + normalized.teeUncertainty,
    TEE_MULTIPLIER_RANGE.min,
    TEE_MULTIPLIER_RANGE.max,
  );
  const bodyFatSamples = createSensitivitySamples(
    bodyFatMinimum,
    bodyFatMaximum,
    normalized.bodyFat,
    Math.ceil((bodyFatMaximum - bodyFatMinimum) / 0.5) + 1,
  );
  const teeSamples = createSensitivitySamples(
    teeMinimum,
    teeMaximum,
    normalized.teeMultiplier,
    3,
  );
  const scenarios = bodyFatSamples.flatMap((bodyFat) =>
    teeSamples.map((teeMultiplier) =>
      simulateSensitivityScenario({
        ...normalized,
        bodyFat,
        teeMultiplier,
      }),
    ),
  );

  const result = {
    ...chart,
    data: chart.data.map((point) => {
      const sensitivityRanges = Object.fromEntries(
        FAT_LOSS_SPEEDS.map((speed) => {
          const weights = [
            Number(point[speed.id]),
            ...scenarios.map((scenario) => {
              const simulation = scenario[speed.id];
              const state =
                simulation.monthly[point.month] ?? simulation.finalState;
              return convertWeightForDisplay(
                state.scaleWeightKg,
                normalized.unit,
              );
            }),
          ];
          return [
            `${speed.id}Sensitivity`,
            [Math.min(...weights), Math.max(...weights)],
          ];
        }),
      );
      return {
        ...point,
        ...sensitivityRanges,
      };
    }),
    sensitivity: {
      bodyFat: normalized.bodyFatUncertainty,
      tee: normalized.teeUncertainty,
    },
  };
  weightLossChartCache.set(cacheKey, result);
  if (weightLossChartCache.size > 12) {
    weightLossChartCache.delete(weightLossChartCache.keys().next().value);
  }
  return result;
};

export const calculateLeanMassFromFFMI = (ffmi, heightM, unit) => {
  const leanMassKg = ffmi * (heightM * heightM);
  return convertWeightForDisplay(leanMassKg, unit);
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

export const parseMetrics = (
  search,
  isMobile,
  defaults = DEFAULT_METRICS,
) => {
  const urlParams = new URLSearchParams(search);
  const fallback = { ...DEFAULT_METRICS, ...defaults };
  const unit = getUrlParam(
    urlParams,
    "unit",
    fallback.unit,
    (value) =>
      Object.values(UNITS).includes(value) ? value : fallback.unit,
  );
  const fallbackHeightCm = usesImperialHeight(fallback.unit)
    ? convertHeightToMetric(fallback.height)
    : fallback.height;
  const fallbackHeightInches = convertHeightToImperial(fallbackHeightCm);
  const fallbackHeight = unit === fallback.unit
    ? fallback.height
    : usesImperialHeight(unit)
      ? fallbackHeightInches
      : fallbackHeightCm;
  const fallbackWeightKg = usesPoundWeight(fallback.unit)
    ? convertWeightToMetric(fallback.weight)
    : fallback.weight;
  const fallbackWeight = unit === fallback.unit
    ? fallback.weight
    : usesPoundWeight(unit)
      ? convertWeightToImperial(fallbackWeightKg)
      : fallbackWeightKg;
  const fallbackFeet = fallback.feet;
  const fallbackInches = fallback.inches;
  const feet = getUrlParam(
    urlParams,
    "feet",
    fallbackFeet,
    (value) => Math.max(4, Math.min(8, value)),
  );
  const inches = getUrlParam(
    urlParams,
    "inches",
    fallbackInches,
    (value) => Math.max(0, Math.min(11.9, value)),
  );
  const height =
    usesImperialHeight(unit)
      ? feet * 12 + inches
      : getUrlParam(
          urlParams,
          "height",
          fallbackHeight,
          (value) => Math.max(120, Math.min(220, value)),
        );

  const parsedWeight = getUrlParam(
    urlParams,
    "weight",
    fallbackWeight,
    (value) =>
      Math.max(
        WEIGHT_RANGES[unit].min,
        Math.min(WEIGHT_RANGES[unit].max, value),
      ),
  );
  const fallbackStoneParts = splitPoundsIntoStone(parsedWeight);
  const stones = getUrlParam(
    urlParams,
    "stones",
    fallbackStoneParts.stones,
    (value) => Math.max(4, Math.min(71, Math.trunc(value))),
  );
  const stonePounds = getUrlParam(
    urlParams,
    "stonePounds",
    fallbackStoneParts.pounds,
    (value) => Math.max(0, Math.min(13.9, value)),
  );
  const weight = unit === UNITS.UK &&
      (urlParams.has("stones") || urlParams.has("stonePounds"))
    ? Math.max(
        WEIGHT_RANGES[unit].min,
        Math.min(WEIGHT_RANGES[unit].max, stones * 14 + stonePounds),
      )
    : parsedWeight;
  const synchronizedStoneParts = splitPoundsIntoStone(weight);

  return {
    weight,
    height,
    bodyFat: getUrlParam(
      urlParams,
      "bodyFat",
      fallback.bodyFat,
      (value) =>
        Math.max(BODY_FAT_RANGE.min, Math.min(BODY_FAT_RANGE.max, value)),
    ),
    age: getUrlParam(
      urlParams,
      "age",
      fallback.age,
      (value) => Math.max(18, Math.min(100, value)),
    ),
    sex: getUrlParam(
      urlParams,
      "sex",
      fallback.sex,
      (value) => (Object.values(SEX).includes(value) ? value : fallback.sex),
    ),
    unit,
    feet,
    inches,
    ...(unit === UNITS.UK
      ? {
          stones: synchronizedStoneParts.stones,
          stonePounds: synchronizedStoneParts.pounds,
        }
      : {}),
    enhanced: getUrlParam(urlParams, "enhanced", fallback.enhanced),
    teeMultiplier: getUrlParam(
      urlParams,
      "teeMultiplier",
      fallback.teeMultiplier,
      (value) =>
        Math.max(
          TEE_MULTIPLIER_RANGE.min,
          Math.min(TEE_MULTIPLIER_RANGE.max, value),
        ),
    ),
    bodyFatUncertainty: getUrlParam(
      urlParams,
      "bodyFatUncertainty",
      fallback.bodyFatUncertainty,
      (value) =>
        Math.max(
          BODY_FAT_UNCERTAINTY_RANGE.min,
          Math.min(BODY_FAT_UNCERTAINTY_RANGE.max, value),
        ),
    ),
    teeUncertainty: getUrlParam(
      urlParams,
      "teeUncertainty",
      fallback.teeUncertainty,
      (value) =>
        Math.max(
          TEE_UNCERTAINTY_RANGE.min,
          Math.min(TEE_UNCERTAINTY_RANGE.max, value),
        ),
    ),
    barbieriFast: getUrlParam(
      urlParams,
      "barbieriFast",
      fallback.barbieriFast,
    ),
    years: getUrlParam(
      urlParams,
      "years",
      isMobile ? 2 : fallback.years,
      (value) => Math.max(1, Math.min(10, value)),
    ),
    trainingLevel: getUrlParam(
      urlParams,
      "trainingLevel",
      fallback.trainingLevel,
      (value) =>
        Object.keys(TRAINING_LEVELS).includes(value)
          ? value
          : fallback.trainingLevel,
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
    usesPoundWeight(metrics.unit)
      ? convertWeightToMetric(metrics.weight)
      : metrics.weight;
  const heightM = getHeightInMeters(metrics.height, metrics.unit);
  const leanMass = weightKg * (1 - metrics.bodyFat / 100);
  const bmi = weightKg / (heightM * heightM);
  let currentFfmi = leanMass / (heightM * heightM);
  const initialLeanMassKg = currentFfmi * (heightM * heightM);
  const initialLeanMass = convertWeightForDisplay(
    initialLeanMassKg,
    metrics.unit,
  );
  const data = [];

  for (let month = 0; month <= metrics.years * 12; month += 1) {
    const leanMassKg = currentFfmi * (heightM * heightM);
    const projectedLeanMass = convertWeightForDisplay(
      leanMassKg,
      metrics.unit,
    );
    const gained = projectedLeanMass - initialLeanMass;
    const unit = metrics.unit === UNITS.METRIC
      ? "kg"
      : metrics.unit === UNITS.UK
        ? "st"
        : "lbs";

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

export const calculateProjectionSensitivity = (metrics) => {
  const normalized = normalizeMetrics(metrics);
  const projection = calculateProjection(normalized);
  const scenarios = [
    clamp(
      normalized.bodyFat - normalized.bodyFatUncertainty,
      BODY_FAT_RANGE.min,
      BODY_FAT_RANGE.max,
    ),
    clamp(
      normalized.bodyFat + normalized.bodyFatUncertainty,
      BODY_FAT_RANGE.min,
      BODY_FAT_RANGE.max,
    ),
  ].map((bodyFat) =>
    calculateProjection({
      ...normalized,
      bodyFat,
    }),
  );

  return projection.map((point, index) => {
    const leanMassValues = [
      Number(point.leanMass),
      ...scenarios.map((scenario) => Number(scenario[index].leanMass)),
    ];
    const ffmiValues = [
      Number(point.ffmi),
      ...scenarios.map((scenario) => Number(scenario[index].ffmi)),
    ];

    return {
      ...point,
      leanMassSensitivity: [
        Math.min(...leanMassValues),
        Math.max(...leanMassValues),
      ],
      ffmiSensitivity: [
        Math.min(...ffmiValues),
        Math.max(...ffmiValues),
      ],
    };
  });
};
