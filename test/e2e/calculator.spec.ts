import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("restores shared inputs and keeps linked projections responsive", async ({ page }) => {
  const browserErrors: Error[] = [];
  page.on("pageerror", (error) => browserErrors.push(error));

  await page.goto(
    "./?weight=539.2&height=75&bodyFat=75&age=40&sex=male&unit=imperial" +
      "&feet=6&inches=3&enhanced=false&teeMultiplier=1.2&barbieriFast=false" +
      "&years=4&trainingLevel=DEDICATED",
  );

  await expect(page.locator("#weight-input")).toHaveValue("539.2");
  await expect(page.locator("#body-fat-input")).toHaveValue("75");
  await expect(page.getByText("Fat-loss energy model")).toBeVisible();
  await expect(page.getByText(/Max modeled deficit:/)).toBeVisible();

  for (const value of ["500", "610", "450", "539.2"]) {
    await page.locator("#weight-input").fill(value);
  }
  for (const value of ["65", "72", "68", "75"]) {
    await page.locator("#body-fat-input").fill(value);
  }

  await expect(page.getByText("Invalid numbers")).toHaveCount(0);
  await expect(page.getByRole("img", { name: /Projected lean mass/ })).toBeVisible();
  expect(browserErrors).toEqual([]);
});

test("switches units and exposes the supervised fasting floor", async ({ page }) => {
  await page.goto("./");

  await page.locator("#unit-select").selectOption("metric");
  await expect(page.locator("#height-input")).toBeVisible();
  await expect(page.locator("#weight-input")).toHaveAttribute("max", "450");

  await page.locator("#unit-select").selectOption("uk");
  await expect(page.locator("#weight-stones-input")).toHaveValue("14");
  await expect(page.locator("#weight-pounds-input")).toHaveValue("3.3");
  await expect(page.getByRole("img", { name: /Projected weight in st/ }))
    .toBeVisible();

  await page.getByText("Advanced fat-loss settings", { exact: true }).click();
  await page.locator("#barbieri-fast").check();
  await expect(page).toHaveURL(/barbieriFast=true/);
  await expect(page.getByText(/current 0 kcal\/day intake floor/)).toBeVisible();
});

test("shows FFMI and calorie rates in chart tooltips", async ({ page }) => {
  await page.goto("./");

  const muscleChart = page.getByRole("img", { name: /Projected lean mass/ });
  await expect(muscleChart).toBeVisible();
  const musclePlot = muscleChart.locator(".recharts-wrapper");
  const muscleBox = await musclePlot.boundingBox();
  expect(muscleBox).not.toBeNull();
  await page.mouse.move(
    muscleBox!.x + muscleBox!.width * 0.55,
    muscleBox!.y + muscleBox!.height * 0.5,
  );
  await expect(page.getByText(/^FFMI:/)).toBeVisible();

  const weightChart = page.getByRole("img", { name: /Projected weight/ });
  const weightPoint = await weightChart
    .locator("path.recharts-line-curve")
    .first()
    .evaluate((path) => {
      const curve = path as SVGPathElement;
      const point = curve.getPointAtLength(curve.getTotalLength() / 2);
      const matrix = curve.getScreenCTM();
      return matrix
        ? {
            x: point.x * matrix.a + point.y * matrix.c + matrix.e,
            y: point.x * matrix.b + point.y * matrix.d + matrix.f,
          }
        : null;
    });
  expect(weightPoint).not.toBeNull();
  await page.mouse.move(weightPoint!.x, weightPoint!.y);
  await expect(weightChart.getByText(/kcal\/day/).first()).toBeVisible();
});

test("persists sensitivity presets and describes both projection bands", async ({ page }) => {
  await page.goto("./");

  await expect(page.getByRole("img", { name: /Projected lean mass/ })
    .locator(".recharts-area-area")).toHaveCount(0);
  await expect(page.getByRole("img", { name: /Projected weight/ })
    .locator(".recharts-area-area")).toHaveCount(0);
  await page.getByText("Advanced fat-loss settings", { exact: true }).click();
  await expect(page.getByRole("button", { name: "Consumer" })).toHaveCount(0);
  await page.locator("#sensitivity-enabled").check();
  await page.getByRole("button", { name: "Consumer" }).click();

  await expect(page).toHaveURL(/sensitivityEnabled=true/);
  await expect(page).toHaveURL(/bodyFatUncertainty=5/);
  await expect(page).toHaveURL(/teeUncertainty=0.15/);
  await expect(page.getByRole("img", {
    name: /lean mass.*plus or minus 5 body-fat percentage points/i,
  })).toBeVisible();
  await expect(page.getByRole("img", {
    name: /weight.*plus or minus 5 body-fat percentage points and 0.15 TEE multiplier/i,
  })).toBeVisible();
  await expect(page.getByRole("img", { name: /Projected lean mass/ })
    .locator(".recharts-area-area")).toHaveCount(1);
  await expect(page.getByRole("img", { name: /Projected weight/ })
    .locator(".recharts-area-area")).toHaveCount(4);
});

test("applies locale population defaults and exposes the lookup table", async ({ page }) => {
  await page.goto("./");

  await expect(page.getByRole("link", { name: "View source on GitHub" }))
    .toHaveAttribute("href", "https://github.com/theontho/ffmi-calculator");
  await expect(page.getByRole("button", { name: "Copy calculator link" }))
    .toBeVisible();
  await expect(page.locator("#weight-input")).toHaveValue("199.3");
  await expect(page.locator("#body-fat-input")).toHaveValue("28.8");
  await expect(page.locator('input[name="feet"]')).toHaveValue("5");
  await expect(page.locator('input[name="inches"]')).toHaveValue("9.7");

  await page.getByText("Locale population-default lookup").click();
  await expect(page.getByText(/Active profile:/)).toBeVisible();
  const localeTable = page.getByRole("table", {
    name: "Sex-specific population defaults by browser locale region",
  });
  await expect(localeTable.getByRole("row").nth(1))
    .toContainText("United States");
  await expect(page.getByRole("table").getByText("🇺🇸", { exact: true }))
    .toBeVisible();
  await page.getByRole("button", {
    name: "Apply female defaults for United States",
  }).click();
  await expect(page.locator("#sex-select")).toHaveValue("female");
  await expect(page.locator("#weight-input")).toHaveValue("170.4");
  await expect(page.locator("#body-fat-input")).toHaveValue("40.7");

  await page.getByRole("button", {
    name: "Apply male defaults for Japan",
  }).click();
  await expect(page.locator("#sex-select")).toHaveValue("male");
  await expect(page.locator("#unit-select")).toHaveValue("metric");
  await expect(page.locator("#weight-input")).toHaveValue("68.9");
  await expect(page.locator("#body-fat-input")).toHaveValue("21.3");
  await expect(page.getByRole("table").getByText("🇯🇵", { exact: true }))
    .toBeVisible();
  await expect(localeTable.getByRole("row").nth(1))
    .toContainText("United States");

  await page.getByRole("button", {
    name: "Apply male defaults for United Kingdom",
  }).click();
  await expect(page.locator("#unit-select")).toHaveValue("uk");
  await expect(page.locator("#weight-stones-input")).toHaveValue("13");
  await expect(page.locator("#weight-pounds-input")).toHaveValue("7.6");

  await expect(page.getByText(/^This is an educational/)).toBeHidden();
  await page.getByText("Background and sources").click();
  await expect(page.getByText(/^This is an educational/)).toBeVisible();
});

test("shows steroid FFMI ranges only when enhanced mode is enabled", async ({ page }) => {
  await page.goto(
    "./?weight=250&height=74&bodyFat=10&age=40&sex=male&unit=imperial" +
      "&feet=6&inches=2&enhanced=false&years=2&trainingLevel=DEDICATED",
  );

  await expect(page.getByText(
    "FFMI range: Traditional Male Natural-Limit Reference",
  )).toBeVisible();
  await page.locator("#enhanced-athlete").check();
  await expect(page.getByText(
    "FFMI range: High FFMI (Steroid/Enhanced Range)",
  )).toBeVisible();
});

test("has no serious or critical accessibility violations", async ({ page }) => {
  await page.goto("./");
  await expect(page.getByRole("img", { name: /Projected lean mass/ })).toBeVisible();

  const results = await new AxeBuilder({ page })
    .include("main")
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  const severeViolations = results.violations.filter(
    (violation) =>
      violation.impact === "serious" || violation.impact === "critical",
  );

  expect(severeViolations).toEqual([]);
});
