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

## Validation

```bash
npm test
npm run lint
npm run typecheck
npm run build
npm run test:pages
npm run test:e2e
```

Unit tests cover calculation and URL semantics. Playwright runs the interactive
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
