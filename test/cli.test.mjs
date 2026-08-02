import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { promisify } from "node:util";

import {
  calculateCurrentFFMI,
  calculateProjection,
  normalizeMetrics,
} from "../src/lib/ffmi-calculator.mjs";

const execFileAsync = promisify(execFile);
const CLI = fileURLToPath(new URL("../bin/ffmi.mjs", import.meta.url));

const runCli = async (args) => {
  const { stdout } = await execFileAsync(process.execPath, [CLI, ...args]);
  return stdout;
};

const runCliJson = async (args) =>
  JSON.parse(await runCli([...args, "--format", "json"]));

test("prints usage without running a projection", async () => {
  const stdout = await runCli(["--help"]);
  assert.match(stdout, /FFMI, muscle gain and fat loss calculator/);
  assert.match(stdout, /--body-fat/);
});

test("exits with a usage error for unknown options", async () => {
  await assert.rejects(runCli(["--bogus"]), (error) => {
    assert.equal(error.code, 2);
    assert.match(error.stderr, /unknown option/);
    return true;
  });
});

test("exits with a usage error for invalid enum values", async () => {
  await assert.rejects(runCli(["--sex", "alien"]), (error) => {
    assert.equal(error.code, 2);
    return true;
  });
});

test("matches the shared library for imperial input", async () => {
  const result = await runCliJson([
    "--unit", "imperial",
    "--weight", "220",
    "--feet", "6",
    "--inches", "2",
    "--body-fat", "32",
    "--age", "40",
  ]);
  const metrics = normalizeMetrics({
    unit: "imperial",
    weight: 220,
    height: 74,
    feet: 6,
    inches: 2,
    bodyFat: 32,
    age: 40,
  });

  assert.equal(
    result.current.ffmi,
    Math.round(calculateCurrentFFMI(metrics) * 100) / 100,
  );
  assert.equal(
    result.gain.months.at(-1).ffmi,
    Number(calculateProjection(metrics).at(-1).ffmi),
  );
});

test("matches the shared library for metric input", async () => {
  const result = await runCliJson([
    "--unit", "metric",
    "--weight", "82",
    "--height", "178",
    "--body-fat", "22",
    "--age", "30",
  ]);
  const metrics = normalizeMetrics({
    unit: "metric",
    weight: 82,
    height: 178,
    bodyFat: 22,
    age: 30,
  });

  assert.equal(
    result.current.ffmi,
    Math.round(calculateCurrentFFMI(metrics) * 100) / 100,
  );
});

test("treats uk stone input as total pounds internally", async () => {
  const result = await runCliJson([
    "--unit", "uk",
    "--stones", "15",
    "--stone-pounds", "7",
    "--feet", "5",
    "--inches", "10",
    "--body-fat", "28",
  ]);

  assert.equal(result.input.weight, 217);
  assert.equal(result.input.stones, 15);
  assert.equal(result.input.stonePounds, 7);
  assert.equal(
    result.current.ffmi,
    Math.round(
      calculateCurrentFFMI(
        normalizeMetrics({
          unit: "uk",
          weight: 217,
          height: 70,
          feet: 5,
          inches: 10,
          stones: 15,
          stonePounds: 7,
          bodyFat: 28,
        }),
      ) * 100,
    ) / 100,
  );
});

test("round trips metrics through the shareable url", async () => {
  const original = await runCliJson([
    "--unit", "metric",
    "--weight", "82",
    "--height", "178",
    "--body-fat", "22",
    "--age", "30",
    "--training", "elite",
    "--years", "5",
  ]);
  const reloaded = await runCliJson(["--url", original.shareUrl]);

  assert.deepEqual(reloaded.input, original.input);
  assert.equal(reloaded.shareUrl, original.shareUrl);
});

test("reports reachable fat loss targets with per speed durations", async () => {
  const result = await runCliJson(["--section", "loss"]);

  assert.ok(result.fatLoss.targets.length > 0);
  for (const target of result.fatLoss.targets) {
    assert.ok(target.bodyFat < result.input.bodyFat);
    for (const speed of result.fatLoss.speeds) {
      const days = target.daysBySpeed[speed.id];
      assert.ok(days === null || days > 0);
    }
  }

  const [conservative, moderate] = result.fatLoss.speeds;
  const first = result.fatLoss.targets[0];
  assert.ok(
    first.daysBySpeed[conservative.id] >= first.daysBySpeed[moderate.id],
    "a smaller deficit should never be faster",
  );
});

test("keeps lean mass flat on the maintenance training level", async () => {
  const result = await runCliJson(["--training", "maintenance"]);

  assert.equal(result.gain.summary.gained, 0);
  assert.equal(
    result.gain.summary.startFFMI,
    result.gain.summary.endFFMI,
  );
});

test("emits csv headers for both sections", async () => {
  const gain = await runCli(["--format", "csv", "--years", "1"]);
  assert.match(gain.split("\n")[0], /^month,ffmi,bmi,leanMass_lbs/);

  const loss = await runCli(["--format", "csv", "--section", "loss"]);
  assert.match(loss.split("\n")[0], /^bodyFat,band,targetWeight_lbs/);
});
