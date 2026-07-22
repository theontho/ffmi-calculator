# Locale population defaults

## Purpose

On a fresh load, the calculator uses the browser's BCP 47 locale to select a
country and apply sex-specific population estimates for height, weight, body
fat, and display units. Shared URL parameters take priority. If no country row
matches, the custom fallback remains male, age 40, 6 ft 2 in, 220 lb, and 32%
body fat.

## Data and derivation

- Country/sex height uses the latest cohort in the [global adult-height
  dataset](https://ourworldindata.org/grapher/average-height-by-year-of-birth.csv):
  people born in 1996. The underlying [adult-height
  analysis](https://doi.org/10.7554/eLife.13410) pools measured population
  studies.
- Country/sex BMI uses the 2016 rows from the [male](https://ourworldindata.org/grapher/mean-body-mass-index-bmi-in-adult-males.csv)
  and [female](https://ourworldindata.org/grapher/mean-body-mass-index-bmi-in-adult-women.csv)
  global mean-BMI datasets. The underlying [BMI
  analysis](https://doi.org/10.1016/S0140-6736(17)32129-3) is age-standardized.
- Estimated weight is `mean BMI x mean height^2`. It is a consistent derived
  estimate, not a directly measured national mean weight.
- Estimated BF uses the [CUN-BAE BMI/age/sex
  estimator](https://pmc.ncbi.nlm.nih.gov/articles/PMC3263863/):
  `-44.988 + 0.503 x age + 10.689 x female + 3.172 x BMI - 0.026 x BMI^2
  + 0.181 x BMI x female - 0.02 x BMI x age - 0.005 x BMI^2 x female
  + 0.00021 x BMI^2 x age`. Defaults use age 40. CUN-BAE was developed and
  validated in White adults aged 18-80 against air-displacement
  plethysmography, with an individual standard error of about 4.7 percentage
  points. Population-specific bias remains possible.
- Locale regions come from `Intl.Locale(...).maximize()`. Personal-unit defaults
  reflect common self-reporting conventions rather than only official SI policy:
  the United States, Liberia, and Canada use lb with ft/in; the United Kingdom
  and Ireland use stone/lb with ft/in; all other supported rows use kg/cm.
  This mixed-use distinction is reflected by the [NHS BMI calculator's
  stone/lb and ft/in options](https://www.nhs.uk/health-assessment-tools/calculate-your-body-mass-index/)
  and documented [Canadian everyday measurement
  usage](https://en.wikipedia.org/wiki/Metrication_in_Canada#Common_usage_today).

## Coverage and refresh

The generated lookup contains 190 country rows where 1996 height, 2016 male and
female BMI, and ISO alpha-2 mapping all exist. Regenerate
`src/lib/locale-population-data.mjs` with:

```bash
npm run generate:locale-data
```

The generator downloads the three public datasets, joins by ISO alpha-3 code,
maps to ISO alpha-2 locale regions, and writes deterministic static data. The
production site does not fetch population data at runtime.

The detected locale country is always moved to the first table row. Selecting
another profile changes the calculator settings and active-row highlight without
moving the originally detected country from that first position.

## Interpretation

These values are neutral starting inputs, not recommendations or individualized
estimates. Height and BMI come from different pooled datasets and years;
applying CUN-BAE to a population mean does not produce a directly measured
national BF average. A higher-BMI population also carries more structural and
supporting lean mass, so its average FFMI can fall in a higher reference range
without proving training experience. The UI retains practical lifter-oriented
FFMI labels, explains this limitation and the derivation, and exposes every
country/sex profile as a selectable table value.
