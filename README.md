# FFMI Calculator

A static [Next.js](https://nextjs.org) calculator for linked FFMI, weight, and
body-fat estimates; muscle-gain projections; and dynamic fat-loss timelines
with configurable uncertainty, expenditure, and medically supervised fasting.

Use the calculator at [theontho.github.io/ffmi-calculator](https://theontho.github.io/ffmi-calculator/).

## Scope and assumptions

The calculator is educational rather than medical, nutritional, or training advice. Its projected rate of lean-mass gain is a heuristic that slows as FFMI rises; it is not an individual prediction. FFMI depends on the entered body-fat estimate, which can have meaningful error.

On a fresh load, browser locale selects sex-specific population defaults from [global adult-height](https://doi.org/10.7554/eLife.13410) and [mean-BMI](https://doi.org/10.1016/S0140-6736(17)32129-3) datasets. Weight is derived as mean BMI × mean height², and BF uses the [CUN-BAE BMI/age/sex estimator](https://pmc.ncbi.nlm.nih.gov/articles/PMC3263863/) at age 40. Personal units follow common local usage, including lb + ft/in for Canada and stone/lb + ft/in for the UK and Ireland. The compact in-app lookup puts the detected country first, exposes all 190 rows, and lets either sex-specific profile be applied directly. Shared URL values override locale defaults; an unmatched locale uses the custom 6 ft 2 in, 220 lb, 32% male fallback. See [`aidocs/locale-population-defaults.md`](aidocs/locale-population-defaults.md).

The displayed ranges are contextual reference values, not a diagnosis or proof of drug use. When enhanced mode is enabled, the male 27+ High and 30+ Very High bands (female 23+ and 25+) are explicitly labeled as steroid/enhanced-user reference ranges, restoring the calculator's original terminology. The male thresholds extend above the natural-versus-steroid comparison in the [original FFMI study](https://pubmed.ncbi.nlm.nih.gov/7496846/); the female thresholds are heuristic reference values rather than validated detection cutoffs.

Fat-loss timelines use the body-fat region thresholds as milestones and target the lower edge of the sex-specific Stage lean range (6% for men and 14% for women). The dynamic projection follows a [dynamic body-weight model](https://pmc.ncbi.nlm.nih.gov/articles/PMC3880593/), an [energy-balance model](https://pmc.ncbi.nlm.nih.gov/articles/PMC2266991/), and the [Forbes fat/lean partition](https://pubmed.ncbi.nlm.nih.gov/10865771/): expenditure declines as fat and lean tissue change, some lost mass comes from lean tissue, adaptive thermogenesis develops over 14 days, and the first week includes a bounded fluid/glycogen shift.

A synthetic [CALERIE Phase 1](https://pmc.ncbi.nlm.nih.gov/articles/PMC2692623/) comparison uses published pooled-male baseline values and the mixed-sex calorie-restriction endpoint: the 25%-maximum curve predicts 8.4 kg loss at day 183 versus 9.2 kg observed. Because those values are not from one matched cohort, this is an operating-point check rather than validation. Published long-duration and lean exercise-heavy comparisons also expose expected divergence from sustained adherence and the adipose-flux cap; see [`aidocs/weight-loss-validation.md`](aidocs/weight-loss-validation.md).

The daily deficit is capped at the lower of estimated TEE minus the [NIDDK Body Weight Planner](https://www.niddk.nih.gov/bwp) 1,000 kcal/day intake floor and the [adipose-energy-transfer ceiling](https://pubmed.ncbi.nlm.nih.gov/15615615/). Initial TEE uses a published [fat-free-mass expenditure power law](https://pubmed.ncbi.nlm.nih.gov/34385400/). The [ExFatLoss adipose](https://app.exfatloss.com/adipose) and [TEE](https://app.exfatloss.com/tee) tools provide comparison implementations of those two inputs. Initial rapid scale changes can exceed fat-energy arithmetic because glycogen, water, sodium, and gut contents also change; the fluid term is informed by [very-low-calorie diet observations](https://pubmed.ncbi.nlm.nih.gov/1615908/).

An advanced TEE multiplier scales the Pontzer average from 0.75x to 1.35x for activity, metabolic variation, and sensitivity analysis. This interval is an approximate visual fit to the DLW scatter described in the [ExFatLoss TEE methodology](https://www.exfatloss.com/p/introducing-exfatloss-tee-and-macro), not a fixed percentile interval. Exercise is represented through total expenditure rather than added calorie-for-calorie because activity can produce partial expenditure compensation.

Both graphs include sensitivity envelopes. The muscle band recalculates from the selected body-fat error; each of the four weight-loss curves sweeps the selected body-fat and TEE range. Defaults are +/-3 body-fat percentage points and +/-0.10 TEE multiplier, with broader consumer and visual-estimate presets. These are what-if envelopes, not confidence intervals or outcome probabilities. The evidence review is archived in [`aidocs/uncertainty-evidence.md`](aidocs/uncertainty-evidence.md).

A fully medically supervised Barbieri-style mode sets the modeled intake floor to zero, so the 100% curve represents complete fasting and the other curves remain fractions of that maximum. It exists to compare the projection with the documented 382-day case; ordinary mode retains the 1,000 kcal/day floor.

For historical scale, the medically monitored [382-day Angus Barbieri fast](https://pmc.ncbi.nlm.nih.gov/articles/PMC2495396/) reduced weight from 456 to 180 lb, averaging about 5.1 lb/week. This is a scale-weight observation that includes changing fat, lean tissue, glycogen, water, sodium, and gut contents.

Body-fat regions use sex-specific, irregular fitness and aesthetic ranges synthesized from the widely used [ACE categories](http://web.archive.org/web/20220402002602/https://www.acefitness.org/education-and-resources/lifestyle/tools-calculators/percent-body-fat-calculator/), athletic ranges summarized in [sports-nutrition literature](https://en.wikipedia.org/wiki/Body_fat_percentage#Typical_body_fat_amounts), a [measured male physiological floor](https://pubmed.ncbi.nlm.nih.gov/8002550/), and [appearance-based practitioner guidance](https://www.builtlean.com/body-fat-percentage-men-women/). Additional casual visual regions extend through 75% body fat to represent exceptional real-world high-weight cases. These upper labels are extrapolated estimates; the 75% input ceiling reflects evidence that excess weight retains a substantial lean component in [measured body-composition studies](https://pubmed.ncbi.nlm.nih.gov/6469707/).

## Getting Started

Use Node.js 24, as specified in `.node-version`.

Install the locked dependencies and run the development server:

```bash
npm ci
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Validation

```bash
npm test
npm run lint
npm run typecheck
npm run build
npm run test:pages
npm run test:e2e
```

`npm run build` writes the production static export to `out/`.

Unit tests cover calculation and URL semantics. Playwright runs the interactive
calculator suite and serious/critical axe accessibility checks in desktop and
mobile Chromium. CI also validates that every GitHub Pages asset is emitted
beneath the repository base path.

## Optional analytics

The static site includes an inactive-by-default Cloudflare Web Analytics hook.
To enable aggregate, cookie-free traffic measurement for the Pages deployment,
set the repository Actions variable `CF_WEB_ANALYTICS_TOKEN` to the site beacon
token. No token is stored in the repository, and no analytics script is emitted
when the variable is absent.

## License

[MIT](LICENSE)
