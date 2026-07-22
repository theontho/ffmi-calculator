import {
  FFMI_RANGE_LIMITS,
  SEX,
  calculateLeanMassFromFFMI,
  convertDisplayedWeightToMetric,
  getHeightInMeters,
} from "./ffmi-calculator.mjs";

const getLeanMassInKg = (leanMass, unit) =>
  convertDisplayedWeightToMetric(leanMass, unit);

const getRelevantFFMILimits = (sex, enhanced) =>
  Object.values(FFMI_RANGE_LIMITS)
    .filter((range) =>
      enhanced ||
      (range !== FFMI_RANGE_LIMITS.ENHANCED_TERRITORY &&
        range !== FFMI_RANGE_LIMITS.ENHANCED_ELITE)
    )
    .map((range) => sex === SEX.MALE ? range.maleFFMI : range.femaleFFMI);

const calculateFFMIFromLeanMass = (leanMassKg, heightM) =>
  leanMassKg / (heightM * heightM);

export const getLeanMassAxisMinimum = (dataMin, metrics) => {
  const numericDataMin = Number(dataMin);
  const heightM = getHeightInMeters(metrics.height, metrics.unit);
  const leanMassKg = getLeanMassInKg(numericDataMin, metrics.unit);
  const currentFFMI = calculateFFMIFromLeanMass(leanMassKg, heightM);
  const lowerLimits = getRelevantFFMILimits(metrics.sex, metrics.enhanced)
    .filter((ffmi) => ffmi < currentFFMI);
  const closestLowerFFMI = lowerLimits.length > 0
    ? Math.max(...lowerLimits)
    : currentFFMI - 1;
  const resultLeanMass = calculateLeanMassFromFFMI(
    closestLowerFFMI,
    heightM,
    metrics.unit,
  );
  const leanMass = Math.floor(Math.min(resultLeanMass, numericDataMin) - 0.2);

  return {
    leanMass,
    ffmi: calculateFFMIFromLeanMass(
      getLeanMassInKg(leanMass, metrics.unit),
      heightM,
    ),
  };
};

export const getLeanMassAxisMaximum = (dataMax, metrics) => {
  const numericDataMax = Number(dataMax);
  const heightM = getHeightInMeters(metrics.height, metrics.unit);
  const leanMassKg = getLeanMassInKg(numericDataMax, metrics.unit);
  const currentFFMI = calculateFFMIFromLeanMass(leanMassKg, heightM);
  const higherLimits = getRelevantFFMILimits(metrics.sex, metrics.enhanced)
    .filter((ffmi) => ffmi > currentFFMI);
  const closestHigherFFMI = higherLimits.length > 0
    ? Math.min(...higherLimits)
    : currentFFMI + 1;
  const resultLeanMass = calculateLeanMassFromFFMI(
    closestHigherFFMI,
    heightM,
    metrics.unit,
  );
  const leanMass = Math.ceil(Math.max(resultLeanMass, numericDataMax) + 4);

  return {
    leanMass,
    ffmi: calculateFFMIFromLeanMass(
      getLeanMassInKg(leanMass, metrics.unit),
      heightM,
    ),
  };
};
