#!/usr/bin/env node
/**
 * ffmi — CLI front end for the FFMI calculator.
 *
 * Shares every formula with the web UI via src/lib/ffmi-calculator.mjs, so the
 * terminal and https://theontho.github.io/ffmi-calculator/ always agree.
 */

import {
  BODY_FAT_BANDS,
  BODY_FAT_RANGE,
  DEFAULT_METRICS,
  FFMI_RANGE_LIMITS,
  SEX,
  TEE_MULTIPLIER_RANGE,
  TRAINING_LEVELS,
  UNITS,
  WEIGHT_RANGES,
  calculateFatLossProjection,
  calculateLeanMassFromFFMI,
  calculateProjection,
  calculateTotalEnergyExpenditure,
  convertWeightForDisplay,
  convertWeightToMetric,
  getHeightInMeters,
  normalizeMetrics,
  parseMetrics,
  serializeMetrics,
  splitPoundsIntoStone,
  usesPoundWeight,
} from "../src/lib/ffmi-calculator.mjs";

const SITE_URL = "https://theontho.github.io/ffmi-calculator/";

const USAGE = `
ffmi — FFMI, muscle gain and fat loss calculator

Usage:
  node bin/ffmi.mjs [options]

Body inputs:
  -w, --weight <n>          Body weight (kg, lbs, or total lbs for uk).
      --stones <n>          UK weight, stones (pairs with --stone-pounds).
      --stone-pounds <n>    UK weight, remainder pounds.
  -H, --height <n>          Height in cm (metric) or inches (imperial/uk).
      --feet <n>            Imperial height, feet (pairs with --inches).
      --inches <n>          Imperial height, inches.
  -b, --body-fat <n>        Body fat percentage, ${BODY_FAT_RANGE.min}-${BODY_FAT_RANGE.max}.
  -a, --age <n>             Age in years.
  -s, --sex <male|female>   Biological sex.
  -u, --unit <metric|imperial|uk>
                            Unit system (uk = stone).

Muscle gain model:
  -t, --training <level>    maintenance | recreational | dedicated | elite
  -y, --years <n>           Projection length in years, 1-10.
  -e, --enhanced            Use enhanced (PED) parameters.

Fat loss model:
      --tee-multiplier <n>  Activity multiplier on expenditure, ${TEE_MULTIPLIER_RANGE.min}-${TEE_MULTIPLIER_RANGE.max}.
      --fast                Enable the aggressive fasting model.

Output:
      --section <all|gain|loss>
                            Which sections to print.            [all]
      --interval <n>        Months between gain table rows.     [6]
  -f, --format <table|json|csv>
                            Output format.                      [table]
      --url <query|url>     Load inputs from a shared calculator link.
      --share               Always print the shareable web URL.
      --no-chart            Hide the ASCII chart.
      --no-color            Disable ANSI colors.
  -h, --help                Show this help.

Examples:
  node bin/ffmi.mjs --feet 6 --inches 2 --weight 220 --body-fat 32 --age 40
  node bin/ffmi.mjs -u metric -w 82 -H 178 -b 22 -a 30 -t elite -y 5
  node bin/ffmi.mjs -u uk --stones 15 --stone-pounds 7 --feet 5 --inches 10 -b 28
  node bin/ffmi.mjs --section loss --format json | jq '.fatLoss.targets'
  node bin/ffmi.mjs --url "weight=200&bodyFat=25&age=35"
`;

const TRAINING_ALIASES = {
  maintenance: "MAINTENANCE",
  maint: "MAINTENANCE",
  recreational: "RECREATIONAL",
  rec: "RECREATIONAL",
  dedicated: "DEDICATED",
  ded: "DEDICATED",
  elite: "ELITE",
};

const UNIT_ALIASES = {
  metric: UNITS.METRIC,
  kg: UNITS.METRIC,
  si: UNITS.METRIC,
  imperial: UNITS.IMPERIAL,
  lbs: UNITS.IMPERIAL,
  us: UNITS.IMPERIAL,
  uk: UNITS.UK,
  stone: UNITS.UK,
  st: UNITS.UK,
};

const SEX_ALIASES = {
  m: SEX.MALE,
  male: SEX.MALE,
  f: SEX.FEMALE,
  female: SEX.FEMALE,
};

class UsageError extends Error {}

const round = (value, digits) => {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
};

const massUnitFor = (unit) =>
  unit === UNITS.METRIC ? "kg" : unit === UNITS.UK ? "st" : "lbs";

const parseNumber = (name, raw) => {
  const value = Number(raw);
  if (!Number.isFinite(value)) {
    throw new UsageError(`--${name} expects a number, got "${raw}"`);
  }
  return value;
};

const resolveAlias = (table, flag, raw) => {
  const resolved = table[String(raw).toLowerCase()];
  if (!resolved) {
    throw new UsageError(
      `--${flag} expects one of ${[...new Set(Object.values(table))].join(", ")}, got "${raw}"`,
    );
  }
  return resolved;
};

const parseArgs = (argv) => {
  const cli = {
    section: "all",
    interval: 6,
    format: "table",
    chart: true,
    color: process.stdout.isTTY === true && !process.env.NO_COLOR,
    share: false,
    help: false,
  };
  const overrides = {};
  let base = null;
  let feet = null;
  let inches = null;
  let stones = null;
  let stonePounds = null;

  const next = (index, flag) => {
    if (index + 1 >= argv.length) {
      throw new UsageError(`${flag} requires a value`);
    }
    return argv[index + 1];
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    switch (arg) {
      case "-h":
      case "--help":
        cli.help = true;
        break;
      case "--url": {
        const raw = String(next(i, arg));
        base = parseMetrics(
          raw.includes("?") ? raw.slice(raw.indexOf("?") + 1) : raw,
          false,
        );
        i += 1;
        break;
      }
      case "-w":
      case "--weight":
        overrides.weight = parseNumber("weight", next(i, arg));
        i += 1;
        break;
      case "-H":
      case "--height":
        overrides.height = parseNumber("height", next(i, arg));
        i += 1;
        break;
      case "--stones":
        stones = parseNumber("stones", next(i, arg));
        i += 1;
        break;
      case "--stone-pounds":
        stonePounds = parseNumber("stone-pounds", next(i, arg));
        i += 1;
        break;
      case "--feet":
        feet = parseNumber("feet", next(i, arg));
        i += 1;
        break;
      case "--inches":
        inches = parseNumber("inches", next(i, arg));
        i += 1;
        break;
      case "-b":
      case "--body-fat":
      case "--bodyfat":
        overrides.bodyFat = parseNumber("body-fat", next(i, arg));
        i += 1;
        break;
      case "-a":
      case "--age":
        overrides.age = parseNumber("age", next(i, arg));
        i += 1;
        break;
      case "-y":
      case "--years":
        overrides.years = parseNumber("years", next(i, arg));
        i += 1;
        break;
      case "-e":
      case "--enhanced":
        overrides.enhanced = true;
        break;
      case "--natural":
        overrides.enhanced = false;
        break;
      case "--fast":
        overrides.barbieriFast = true;
        break;
      case "--tee-multiplier":
        overrides.teeMultiplier = parseNumber("tee-multiplier", next(i, arg));
        i += 1;
        break;
      case "-s":
      case "--sex":
        overrides.sex = resolveAlias(SEX_ALIASES, "sex", next(i, arg));
        i += 1;
        break;
      case "-u":
      case "--unit":
      case "--units":
        overrides.unit = resolveAlias(UNIT_ALIASES, "unit", next(i, arg));
        i += 1;
        break;
      case "-t":
      case "--training":
      case "--training-level":
        overrides.trainingLevel = resolveAlias(
          TRAINING_ALIASES,
          "training",
          next(i, arg),
        );
        i += 1;
        break;
      case "--section": {
        const value = String(next(i, arg)).toLowerCase();
        if (!["all", "gain", "loss"].includes(value)) {
          throw new UsageError(
            `--section expects all, gain or loss, got "${value}"`,
          );
        }
        cli.section = value;
        i += 1;
        break;
      }
      case "-f":
      case "--format": {
        const value = String(next(i, arg)).toLowerCase();
        if (!["table", "json", "csv"].includes(value)) {
          throw new UsageError(
            `--format expects table, json or csv, got "${value}"`,
          );
        }
        cli.format = value;
        i += 1;
        break;
      }
      case "--interval":
        cli.interval = parseNumber("interval", next(i, arg));
        i += 1;
        break;
      case "--share":
        cli.share = true;
        break;
      case "--no-chart":
        cli.chart = false;
        break;
      case "--no-color":
        cli.color = false;
        break;
      case "--color":
        cli.color = true;
        break;
      default:
        throw new UsageError(`unknown option "${arg}" (try --help)`);
    }
  }

  if (cli.help) return { cli, metrics: DEFAULT_METRICS };

  const previous = base ?? DEFAULT_METRICS;
  const draft = { ...previous, ...overrides };

  // Unit switches must convert the carried-over defaults, not reuse raw numbers.
  if (overrides.unit && overrides.unit !== previous.unit) {
    if (overrides.height === undefined && feet === null && inches === null) {
      const heightM = getHeightInMeters(previous.height, previous.unit);
      draft.height =
        overrides.unit === UNITS.METRIC ? heightM * 100 : heightM / 0.0254;
    }
    if (overrides.weight === undefined) {
      const weightKg = usesPoundWeight(previous.unit)
        ? convertWeightToMetric(previous.weight)
        : previous.weight;
      // UK stores weight as total pounds, so only metric differs from imperial.
      draft.weight = round(
        overrides.unit === UNITS.METRIC
          ? weightKg
          : convertWeightForDisplay(weightKg, UNITS.IMPERIAL),
        2,
      );
    }
  }

  if (stones !== null || stonePounds !== null) {
    if (overrides.unit && overrides.unit !== UNITS.UK) {
      throw new UsageError(
        "--stones/--stone-pounds are UK units and cannot be combined with --unit " +
          `${String(overrides.unit).toLowerCase()}`,
      );
    }
    if (!overrides.unit) draft.unit = UNITS.UK;
    draft.stones = stones ?? draft.stones ?? 0;
    draft.stonePounds = stonePounds ?? draft.stonePounds ?? 0;
    draft.weight = round(draft.stones * 14 + draft.stonePounds, 2);
  }

  if (draft.unit === UNITS.UK && (stones === null && stonePounds === null)) {
    const split = splitPoundsIntoStone(draft.weight);
    draft.stones = split.stones;
    draft.stonePounds = split.pounds;
  }

  if (feet !== null || inches !== null) {
    if (overrides.unit === UNITS.METRIC) {
      throw new UsageError(
        "--feet/--inches are imperial units and cannot be combined with --unit metric; use --height for centimetres",
      );
    }
    if (!overrides.unit && draft.unit === UNITS.METRIC) {
      draft.unit = UNITS.IMPERIAL;
    }
    draft.feet = feet ?? draft.feet;
    draft.inches = inches ?? draft.inches;
    draft.height = draft.feet * 12 + draft.inches;
  } else if (draft.unit !== UNITS.METRIC) {
    draft.feet = Math.floor(draft.height / 12);
    draft.inches = round(draft.height % 12, 1);
  }

  const weightRange = WEIGHT_RANGES[draft.unit];
  if (draft.weight < weightRange.min || draft.weight > weightRange.max) {
    const bound = draft.weight < weightRange.min ? weightRange.min : weightRange.max;
    process.stderr.write(
      `warning: weight ${draft.weight} is outside ${weightRange.min}-${weightRange.max} ${draft.unit === UNITS.METRIC ? "kg" : "lbs"} and was clamped to ${bound}\n`,
    );
  }

  return { cli, metrics: normalizeMetrics(draft) };
};

const hexToAnsi = (hex, enabled) => {
  if (!enabled) return (text) => text;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (text) => `\x1b[38;2;${r};${g};${b}m${text}\x1b[0m`;
};

const bold = (text, enabled) => (enabled ? `\x1b[1m${text}\x1b[0m` : text);
const dim = (text, enabled) => (enabled ? `\x1b[2m${text}\x1b[0m` : text);

const ffmiBandFor = (ffmi, sex) =>
  Object.values(FFMI_RANGE_LIMITS)
    .map((band) => ({
      ...band,
      threshold: sex === SEX.MALE ? band.maleFFMI : band.femaleFFMI,
    }))
    .sort((a, b) => b.threshold - a.threshold)
    .find((band) => ffmi >= band.threshold) ?? null;

const bodyFatBandFor = (bodyFat, sex) => {
  const bands = BODY_FAT_BANDS[sex];
  return (
    bands.find((band) => bodyFat >= band.min && bodyFat < band.max) ??
    bands[bands.length - 1]
  );
};

/** Formats a value that is already expressed in the unit's display scale. */
const formatMass = (value, unit) => {
  if (unit !== UNITS.UK) return `${value.toFixed(1)} ${massUnitFor(unit)}`;
  const { stones, pounds } = splitPoundsIntoStone(value * 14);
  return `${stones}st ${pounds.toFixed(1)}lb`;
};

/** UK metrics store scale weight as total pounds, unlike derived stone values. */
const formatInputWeight = (metrics) =>
  metrics.unit === UNITS.UK
    ? `${metrics.stones}st ${Number(metrics.stonePounds).toFixed(1)}lb`
    : formatMass(metrics.weight, metrics.unit);

const formatDuration = (days) => {
  if (days === null || days === undefined) return "—";
  if (days < 31) return `${Math.round(days)}d`;
  const months = days / 30.4375;
  if (months < 18) return `${months.toFixed(1)}mo`;
  return `${(days / 365.25).toFixed(1)}y`;
};

const buildResult = (metrics) => {
  const projection = calculateProjection(metrics);
  const fatLoss = calculateFatLossProjection(metrics);
  const heightM = getHeightInMeters(metrics.height, metrics.unit);
  const weightKg = usesPoundWeight(metrics.unit)
    ? convertWeightToMetric(metrics.weight)
    : metrics.weight;
  const leanMassKg = weightKg * (1 - metrics.bodyFat / 100);
  const fatMassKg = weightKg - leanMassKg;
  const ffmi = leanMassKg / (heightM * heightM);
  const first = projection[0];
  const last = projection[projection.length - 1];

  return {
    input: { ...metrics, massUnit: massUnitFor(metrics.unit) },
    current: {
      leanMass: round(convertWeightForDisplay(leanMassKg, metrics.unit), 2),
      fatMass: round(convertWeightForDisplay(fatMassKg, metrics.unit), 2),
      heightM: round(heightM, 4),
      ffmi: round(ffmi, 2),
      bmi: round(weightKg / (heightM * heightM), 2),
      ffmiCategory: ffmiBandFor(ffmi, metrics.sex)?.label ?? "Below all ranges",
      bodyFatCategory: bodyFatBandFor(metrics.bodyFat, metrics.sex).label,
      totalEnergyExpenditureKcal: Math.round(
        calculateTotalEnergyExpenditure(metrics),
      ),
      maxDailyDeficitKcal: Math.round(fatLoss.maxDailyDeficit),
    },
    gain: {
      months: projection.map((row) => ({
        month: row.month,
        ffmi: Number(row.ffmi),
        bmi: Number(row.bmi),
        leanMass: Number(row.leanMass),
        gained: round(Number(row.leanMass) - Number(first.leanMass), 1),
        category:
          ffmiBandFor(Number(row.ffmi), metrics.sex)?.label ??
          "Below all ranges",
      })),
      summary: {
        startLeanMass: Number(first.leanMass),
        endLeanMass: Number(last.leanMass),
        gained: round(Number(last.leanMass) - Number(first.leanMass), 1),
        startFFMI: Number(first.ffmi),
        endFFMI: Number(last.ffmi),
      },
    },
    fatLoss: {
      model: fatLoss.model,
      speeds: fatLoss.speeds,
      targets: fatLoss.targets,
    },
    shareUrl: `${SITE_URL}?${serializeMetrics(metrics)}`,
  };
};

const renderChart = (result, cli, width = 60, height = 15) => {
  const rows = result.gain.months;
  const values = rows.map((row) => row.leanMass);
  let min = Math.min(...values);
  let max = Math.max(...values);
  if (max - min < 1e-9) {
    // Flat projection (maintenance): pad so the line renders centered.
    min -= 1;
    max += 1;
  }
  const span = max - min;
  const { unit, sex, enhanced, years } = result.input;

  const grid = Array.from({ length: height }, () => Array(width).fill(" "));
  for (let x = 0; x < width; x += 1) {
    const index = Math.round((x / (width - 1)) * (rows.length - 1));
    const y =
      height -
      1 -
      Math.round(((rows[index].leanMass - min) / span) * (height - 1));
    grid[y][x] = "*";
  }

  const bandByRow = new Map();
  Object.values(FFMI_RANGE_LIMITS)
    .filter(
      (band) =>
        enhanced ||
        (band !== FFMI_RANGE_LIMITS.ENHANCED_TERRITORY &&
          band !== FFMI_RANGE_LIMITS.ENHANCED_ELITE),
    )
    .map((band) => {
      const ffmi = sex === SEX.MALE ? band.maleFFMI : band.femaleFFMI;
      return {
        ...band,
        ffmi,
        leanMass: calculateLeanMassFromFFMI(ffmi, result.current.heightM, unit),
      };
    })
    .filter((band) => band.leanMass >= min && band.leanMass <= max)
    .forEach((band) => {
      const y =
        height - 1 - Math.round(((band.leanMass - min) / span) * (height - 1));
      if (!bandByRow.has(y)) bandByRow.set(y, band);
    });

  const lines = [
    `  Lean mass (${massUnitFor(unit)}) over ${years} year${years === 1 ? "" : "s"}`,
  ];
  for (let y = 0; y < height; y += 1) {
    const label = (max - (y / (height - 1)) * span).toFixed(1).padStart(6);
    const band = bandByRow.get(y);
    if (band) {
      const paint = hexToAnsi(band.stroke, cli.color);
      const row = grid[y].map((cell) => (cell === " " ? "·" : cell)).join("");
      lines.push(
        `${paint(`${label} |${row}`)} ${paint(`${band.label} (FFMI ${band.ffmi})`)}`,
      );
    } else {
      lines.push(`${label} |${grid[y].join("")}`);
    }
  }
  lines.push(`${" ".repeat(6)} +${"-".repeat(width)}`);
  const endLabel = `month ${rows[rows.length - 1].month}`;
  lines.push(
    `${" ".repeat(7)} month 0${" ".repeat(Math.max(1, width - 7 - endLabel.length))}${endLabel}`,
  );
  return lines.join("\n");
};

const renderRows = (header, body, cli, leftAlign = []) => {
  const widths = header.map((cell, index) =>
    Math.max(cell.length, ...body.map((row) => row[index].length)),
  );
  const line = (cells) =>
    cells
      .map((cell, index) =>
        leftAlign.includes(index)
          ? cell.padEnd(widths[index])
          : cell.padStart(widths[index]),
      )
      .join("  ")
      .trimEnd();
  const total = widths.reduce((sum, value) => sum + value + 2, 0) - 2;
  return [bold(line(header), cli.color), dim("-".repeat(total), cli.color)]
    .concat(body.map(line))
    .join("\n");
};

const renderGainTable = (result, cli) => {
  const rows = result.gain.months;
  const lastMonth = rows[rows.length - 1].month;
  const unit = result.input.massUnit;
  return renderRows(
    ["Month", "Year", `Lean (${unit})`, `Gain (${unit})`, "FFMI", "Category"],
    rows
      .filter(
        (row) => row.month % cli.interval === 0 || row.month === lastMonth,
      )
      .map((row) => [
        String(row.month),
        (row.month / 12).toFixed(2).replace(/\.00$/, ""),
        row.leanMass.toFixed(1),
        `${row.gained > 0 ? "+" : ""}${row.gained.toFixed(1)}`,
        row.ffmi.toFixed(2),
        row.category,
      ]),
    cli,
    [5],
  );
};

const renderFatLossTable = (result, cli) => {
  const { targets, speeds } = result.fatLoss;
  if (!targets.length) {
    return "  No leaner body fat targets are reachable from these inputs.";
  }
  return renderRows(
    [
      "Body fat",
      "Band",
      `Weight (${result.input.massUnit})`,
      ...speeds.map((speed) => speed.label),
    ],
    targets.map((target) => [
      `${target.bodyFat}%`,
      target.label,
      target.targetWeight.toFixed(1),
      ...speeds.map((speed) => formatDuration(target.daysBySpeed[speed.id])),
    ]),
    cli,
    [1],
  );
};

const renderCsv = (result, cli) => {
  const unit = result.input.massUnit;
  if (cli.section === "loss") {
    const { speeds, targets } = result.fatLoss;
    return [
      [
        "bodyFat",
        "band",
        `targetWeight_${unit}`,
        ...speeds.map((speed) => `days_${speed.id}`),
      ],
      ...targets.map((target) => [
        target.bodyFat,
        `"${target.label}"`,
        target.targetWeight.toFixed(1),
        ...speeds.map((speed) => target.daysBySpeed[speed.id] ?? ""),
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");
  }
  return [
    ["month", "ffmi", "bmi", `leanMass_${unit}`, `gained_${unit}`, "category"],
    ...result.gain.months.map((row) => [
      row.month,
      row.ffmi.toFixed(2),
      row.bmi.toFixed(2),
      row.leanMass.toFixed(1),
      row.gained.toFixed(1),
      `"${row.category}"`,
    ]),
  ]
    .map((row) => row.join(","))
    .join("\n");
};

const renderReport = (result, cli) => {
  const { input, current, gain, fatLoss } = result;
  const unit = input.massUnit;
  const show = (section) => cli.section === "all" || cli.section === section;
  const heightLabel =
    input.unit === UNITS.METRIC
      ? `${round(input.height, 1)} cm`
      : `${Math.floor(input.height / 12)}' ${round(input.height % 12, 1)}" (${round(input.height, 1)} in)`;

  const out = [bold("FFMI Calculator", cli.color), ""];

  out.push(bold("Inputs", cli.color));
  out.push(`  Weight            ${formatInputWeight(input)}`);
  out.push(`  Height            ${heightLabel}`);
  out.push(`  Body fat          ${input.bodyFat}%  (${current.bodyFatCategory})`);
  out.push(`  Age / Sex         ${input.age} / ${input.sex}`);
  out.push(
    `  Status            ${input.enhanced ? "Enhanced (PEDs)" : "Natural"}`,
  );
  out.push(
    `  Training level    ${TRAINING_LEVELS[input.trainingLevel].label} (${TRAINING_LEVELS[input.trainingLevel].level})`,
  );
  out.push(
    `  Projection        ${input.years} year${input.years === 1 ? "" : "s"}`,
  );
  out.push("");

  out.push(bold("Current Stats", cli.color));
  out.push(`  Lean mass         ${formatMass(current.leanMass, input.unit)}`);
  out.push(`  Fat mass          ${formatMass(current.fatMass, input.unit)}`);
  out.push(
    `  FFMI              ${current.ffmi.toFixed(2)}  (${current.ffmiCategory})`,
  );
  out.push(`  BMI               ${current.bmi.toFixed(2)}`);
  out.push(`  Expenditure       ${current.totalEnergyExpenditureKcal} kcal/day`);
  out.push(
    `  Max fat loss      ${current.maxDailyDeficitKcal} kcal/day deficit`,
  );
  out.push("");

  if (show("gain")) {
    if (cli.chart) {
      out.push(bold("Muscle Gain Projection", cli.color));
      out.push(renderChart(result, cli));
      out.push("");
    }
    out.push(
      bold(
        `Muscle Gain (every ${cli.interval} month${cli.interval === 1 ? "" : "s"})`,
        cli.color,
      ),
    );
    out.push(renderGainTable(result, cli));
    out.push("");
    out.push(
      `  ${formatMass(gain.summary.startLeanMass, input.unit)} -> ${formatMass(gain.summary.endLeanMass, input.unit)} lean mass ` +
        `(${gain.summary.gained >= 0 ? "+" : ""}${gain.summary.gained} ${unit}), FFMI ${gain.summary.startFFMI.toFixed(2)} -> ${gain.summary.endFFMI.toFixed(2)}`,
    );
    out.push("");
  }

  if (show("loss")) {
    out.push(bold("Fat Loss Timeline", cli.color));
    out.push(
      dim(
        `  ${fatLoss.model.name} · expenditure ${Math.round(fatLoss.model.averageTee)} kcal/day · adipose ceiling ${Math.round(fatLoss.model.adiposeFluxCeiling)} kcal/day`,
        cli.color,
      ),
    );
    out.push(
      dim(
        "  Speed columns are the deficit as a share of the maximum safe rate.",
        cli.color,
      ),
    );
    out.push(renderFatLossTable(result, cli));
    out.push("");
  }

  if (cli.share || cli.section === "all") {
    out.push(bold("Share", cli.color));
    out.push(`  ${result.shareUrl}`);
    out.push("");
  }

  out.push(
    dim(
      "Educational scenario tool, not individualized medical or nutrition advice.",
      cli.color,
    ),
  );
  return out.join("\n");
};

const main = () => {
  let parsed;
  try {
    parsed = parseArgs(process.argv.slice(2));
  } catch (error) {
    if (error instanceof UsageError) {
      process.stderr.write(`error: ${error.message}\n${USAGE}`);
      process.exit(2);
    }
    throw error;
  }

  const { cli, metrics } = parsed;
  if (cli.help) {
    process.stdout.write(USAGE);
    return;
  }

  cli.interval = Math.max(1, Math.round(cli.interval));
  const result = buildResult(metrics);

  if (cli.format === "json") {
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
    return;
  }
  if (cli.format === "csv") {
    process.stdout.write(`${renderCsv(result, cli)}\n`);
    return;
  }
  process.stdout.write(`${renderReport(result, cli)}\n`);
};

main();
