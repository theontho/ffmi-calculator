# FFMI Calculator

A static [Next.js](https://nextjs.org) calculator for linked FFMI, weight, and
body-fat estimates; muscle-gain projections; and dynamic fat-loss timelines
with configurable uncertainty and expenditure.

Use the calculator at [theontho.github.io/ffmi-calculator](https://theontho.github.io/ffmi-calculator/).

## Features

- Linked FFMI, weight, and body-fat inputs
- Muscle-gain and dynamic weight-loss projections
- Optional sensitivity bands for body-fat and energy-expenditure uncertainty
- Sex-specific body-fat and FFMI reference ranges
- Selectable population defaults for 190 locale regions
- Metric, imperial, and UK stone/pound input modes
- Shareable URLs that preserve calculator settings
- Terminal CLI sharing the same calculation module as the web UI
- Static GitHub Pages deployment with optional privacy-focused analytics

## Scope

The calculator is an educational scenario tool, not an individualized medical,
nutrition, or training prediction. Results depend on estimated body fat,
expenditure, adherence, and population-averaged model assumptions. Sensitivity
bands can be enabled under advanced fat-loss settings to show how selected input
ranges change the output; they are not confidence intervals or outcome
probabilities.

On a fresh load, the browser locale selects a sex-specific population profile
and common local units. Shared URL values take priority, and every supported
country profile remains selectable from the in-app table.

## Research and methodology

- [Model methodology and reference ranges](aidocs/model-methodology.md)
- [Locale population defaults](aidocs/locale-population-defaults.md)
- [Projection uncertainty evidence](aidocs/uncertainty-evidence.md)
- [Published weight-loss validation](aidocs/weight-loss-validation.md)
- [Accessibility and usability review](aidocs/accessibility-usability-review.md)

See the [`aidocs/` index](aidocs/README.md) for the complete research archive.

## Development

Use Node.js 24, as specified in `.node-version`.

```bash
npm ci
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## CLI

The same calculations are available in the terminal. The CLI imports
`src/lib/ffmi-calculator.mjs` directly, so it always agrees with the web UI and
needs no build step.

```bash
npm run ffmi -- --help
# or
node bin/ffmi.mjs --help
```

```bash
# Imperial, 6'2" 220 lbs at 32% body fat
node bin/ffmi.mjs --feet 6 --inches 2 --weight 220 --body-fat 32 --age 40

# Metric, elite programming, 5 year projection
node bin/ffmi.mjs -u metric -w 82 -H 178 -b 22 -a 30 -t elite -y 5

# UK stone input
node bin/ffmi.mjs -u uk --stones 15 --stone-pounds 7 --feet 5 --inches 10 -b 28

# Load a shared calculator link, or emit machine readable output
node bin/ffmi.mjs --url "weight=200&bodyFat=25&age=35"
node bin/ffmi.mjs --section loss --format json | jq '.fatLoss.targets'
node bin/ffmi.mjs --format csv > projection.csv
```

| Flag | Description | Default |
| --- | --- | --- |
| `-w, --weight <n>` | Body weight (kg, lbs, or total lbs for `uk`) | `220` lbs |
| `-H, --height <n>` | Height in cm, or inches for imperial/uk | `74` in |
| `--feet` / `--inches` | Imperial height parts | `6` / `2` |
| `--stones` / `--stone-pounds` | UK weight parts | — |
| `-b, --body-fat <n>` | Body fat percentage | `32` |
| `-a, --age <n>` | Age in years | `40` |
| `-s, --sex <male\|female>` | Biological sex | `male` |
| `-u, --unit <metric\|imperial\|uk>` | Unit system | `imperial` |
| `-t, --training <level>` | `maintenance`, `recreational`, `dedicated`, `elite` | `dedicated` |
| `-y, --years <n>` | Projection length, 1–10 | `4` |
| `-e, --enhanced` | Enhanced (PED) parameters | off |
| `--tee-multiplier <n>` | Activity multiplier on expenditure | `1` |
| `--fast` | Aggressive fasting model | off |
| `--section <all\|gain\|loss>` | Which sections to print | `all` |
| `--interval <n>` | Months between gain table rows | `6` |
| `-f, --format <table\|json\|csv>` | Output format | `table` |
| `--url <query\|url>` | Load inputs from a shared link | — |
| `--share` | Always print the shareable URL | — |
| `--no-chart` / `--no-color` | Disable the ASCII chart / ANSI colors | — |

Output covers current stats (lean and fat mass, FFMI, BMI, expenditure, maximum
deficit), an ASCII muscle-gain chart with FFMI reference bands, a month-by-month
gain table, and a fat-loss timeline giving the time to reach each leaner body-fat
band at four deficit speeds. Formulas are documented in
[`aidocs/model-methodology.md`](aidocs/model-methodology.md).

## Validation

```bash
npm test
npm run lint
npm run typecheck
npm run build
npm run test:pages
npm run test:e2e
```

Unit tests cover calculation, CLI, and URL semantics. Playwright runs the interactive
calculator suite and serious/critical axe accessibility checks in desktop and
mobile Chromium. CI also validates that every GitHub Pages asset is emitted
beneath the repository base path. `npm run build` writes the static export to
`out/`.

## Optional analytics

The static site includes an inactive-by-default Cloudflare Web Analytics hook.
To enable aggregate, cookie-free traffic measurement for the Pages deployment,
set the repository Actions variable `CF_WEB_ANALYTICS_TOKEN` to the site beacon
token. No token is stored in the repository, and no analytics script is emitted
when the variable is absent.

## License

[MIT](LICENSE)
