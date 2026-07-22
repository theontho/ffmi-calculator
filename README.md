# FFMI Calculator

A static [Next.js](https://nextjs.org) calculator for linked FFMI, weight, and
body-fat estimates; muscle-gain projections; and dynamic fat-loss timelines
with configurable expenditure and medically supervised fasting sensitivity.

Use the calculator at [theontho.github.io/ffmi-calculator](https://theontho.github.io/ffmi-calculator/).

## Scope and assumptions

The calculator is educational rather than medical, nutritional, or training advice. Its projected rate of lean-mass gain is a heuristic that slows as FFMI rises; it is not an individual prediction. FFMI depends on the entered body-fat estimate, which can have meaningful error.

The displayed ranges are contextual reference values, not a diagnosis, a health assessment, or evidence of performance-enhancing drug use. For background, see [Kouri et al.'s FFMI study](https://pubmed.ncbi.nlm.nih.gov/7496846/).

Fat-loss timelines use the body-fat region thresholds as milestones and target the lower edge of the sex-specific Stage lean range (6% for men and 14% for women). The dynamic projection follows [Hall et al.](https://pmc.ncbi.nlm.nih.gov/articles/PMC3880593/), [Chow and Hall](https://pmc.ncbi.nlm.nih.gov/articles/PMC2266991/), and the [Forbes fat/lean partition](https://pubmed.ncbi.nlm.nih.gov/10865771/): expenditure declines as fat and lean tissue change, some lost mass comes from lean tissue, adaptive thermogenesis develops over 14 days, and the first week includes a bounded fluid/glycogen shift.

The daily deficit is capped at the lower of estimated TEE minus the [NIDDK Body Weight Planner](https://www.niddk.nih.gov/bwp) 1,000 kcal/day intake floor and the [Alpert adipose-energy-transfer ceiling](https://pubmed.ncbi.nlm.nih.gov/15615615/). Initial TEE uses the fat-free-mass power law reported by [Pontzer et al.](https://pubmed.ncbi.nlm.nih.gov/34385400/). The [ExFatLoss adipose](https://app.exfatloss.com/adipose) and [TEE](https://app.exfatloss.com/tee) tools provide comparison implementations of those two inputs. Initial rapid scale changes can exceed fat-energy arithmetic because glycogen, water, sodium, and gut contents also change; the fluid term is informed by [very-low-calorie diet observations](https://pubmed.ncbi.nlm.nih.gov/1615908/).

An advanced TEE multiplier scales the Pontzer average from 0.75x to 1.35x for activity, metabolic variation, and sensitivity analysis. This interval is an approximate visual fit to the DLW scatter described in the [ExFatLoss TEE methodology](https://www.exfatloss.com/p/introducing-exfatloss-tee-and-macro), not a fixed percentile interval. Exercise is represented through total expenditure rather than added calorie-for-calorie because activity can produce partial expenditure compensation.

A fully medically supervised Barbieri-style mode sets the modeled intake floor to zero, so the 100% curve represents complete fasting and the other curves remain fractions of that maximum. It exists to compare the projection with the documented 382-day case; ordinary mode retains the 1,000 kcal/day floor.

For historical scale, the medically monitored [382-day Angus Barbieri fast](https://pmc.ncbi.nlm.nih.gov/articles/PMC2495396/) reduced weight from 456 to 180 lb, averaging about 5.1 lb/week. This is a scale-weight observation that includes changing fat, lean tissue, glycogen, water, sodium, and gut contents.

Body-fat regions use sex-specific, irregular fitness and aesthetic ranges synthesized from the widely used [ACE categories](http://web.archive.org/web/20220402002602/https://www.acefitness.org/education-and-resources/lifestyle/tools-calculators/percent-body-fat-calculator/), athletic ranges summarized in [sports-nutrition literature](https://en.wikipedia.org/wiki/Body_fat_percentage#Typical_body_fat_amounts), the male physiological floor studied by [Friedl et al.](https://pubmed.ncbi.nlm.nih.gov/8002550/), and [appearance-based practitioner guidance](https://www.builtlean.com/body-fat-percentage-men-women/). Additional casual visual regions extend through 75% body fat to represent exceptional real-world high-weight cases. These upper labels are extrapolated estimates; the 75% input ceiling reflects evidence that excess weight retains a substantial lean component in [measured body-composition studies](https://pubmed.ncbi.nlm.nih.gov/6469707/).

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
calculator suite in desktop and mobile Chromium. CI also validates that every
GitHub Pages asset is emitted beneath the repository base path.

## License

[MIT](LICENSE)
