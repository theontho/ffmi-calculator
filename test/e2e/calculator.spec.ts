import { expect, test } from "@playwright/test";

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

  await page.getByText("Advanced fat-loss settings").click();
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
  const weightPlot = weightChart.locator(".recharts-wrapper");
  const weightBox = await weightPlot.boundingBox();
  expect(weightBox).not.toBeNull();
  await page.mouse.move(
    weightBox!.x + weightBox!.width * 0.55,
    weightBox!.y + weightBox!.height * 0.5,
  );
  await expect(page.getByText(/kcal\/day/).last()).toBeVisible();
});
