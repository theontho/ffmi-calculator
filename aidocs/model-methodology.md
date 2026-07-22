# Model methodology and reference ranges

## Scope

This note records the main calculation assumptions and contextual ranges behind
the calculator. The outputs are educational scenarios, not individualized
medical, nutrition, or training predictions.

## Muscle-gain projection and FFMI ranges

The projected lean-mass gain rate is a heuristic that slows as FFMI rises. It is
not an individual prediction, and its starting point depends on the entered
body-fat estimate.

Displayed FFMI bands are contextual reference values, not diagnoses or proof of
drug use. With enhanced mode enabled, the male 27+ and 30+ bands and female 23+
and 25+ bands use explicit steroid/enhanced-user labels. The male thresholds
extend above the natural-versus-steroid comparison in the [original FFMI
study](https://pubmed.ncbi.nlm.nih.gov/7496846/). The female thresholds are
heuristic references rather than validated detection cutoffs.

## Dynamic weight-loss model

Weight-loss timelines use body-fat regions as milestones and target the lower
edge of the sex-specific Stage lean range: 6% for men and 14% for women.

The projection combines a [dynamic body-weight
model](https://pmc.ncbi.nlm.nih.gov/articles/PMC3880593/), an [energy-balance
model](https://pmc.ncbi.nlm.nih.gov/articles/PMC2266991/), and the [Forbes
fat/lean partition](https://pubmed.ncbi.nlm.nih.gov/10865771/). Expenditure
declines as fat and lean tissue change, some lost mass comes from lean tissue,
adaptive thermogenesis develops over 14 days, and the first week includes a
bounded fluid and glycogen shift.

The daily deficit is capped at the lower of:

1. Estimated TEE minus the [NIDDK Body Weight
   Planner](https://www.niddk.nih.gov/bwp) 1,000 kcal/day intake floor.
2. The modeled [adipose-energy-transfer
   ceiling](https://pubmed.ncbi.nlm.nih.gov/15615615/).

Initial TEE uses a [fat-free-mass expenditure power
law](https://pubmed.ncbi.nlm.nih.gov/34385400/). The [ExFatLoss adipose
tool](https://app.exfatloss.com/adipose) and [TEE
tool](https://app.exfatloss.com/tee) provide comparison implementations of
those inputs.

Initial scale changes can exceed fat-energy arithmetic because glycogen, water,
sodium, and gut contents also change. The bounded fluid term is informed by
[very-low-calorie diet observations](https://pubmed.ncbi.nlm.nih.gov/1615908/).

## Expenditure controls

The advanced TEE multiplier scales the model average from 0.75x to 1.35x for
activity, metabolic variation, and sensitivity analysis. The interval is an
approximate visual fit to the doubly labeled water scatter discussed in the
[ExFatLoss TEE methodology](https://www.exfatloss.com/p/introducing-exfatloss-tee-and-macro),
not a fixed percentile interval. Exercise is represented through total
expenditure rather than added calorie-for-calorie because activity can produce
partial expenditure compensation.

## Sensitivity envelopes

Sensitivity is disabled by default and can be enabled under advanced fat-loss
settings. When enabled, the muscle projection recalculates across the selected
body-fat error and each weight-loss curve sweeps the selected body-fat and TEE
ranges. The initial preset is +/-3 body-fat percentage points and +/-0.10 TEE
multiplier, with broader consumer and visual-estimate presets.

These are what-if envelopes, not confidence intervals or outcome probabilities.
See the [projection uncertainty evidence](uncertainty-evidence.md) for the
supporting review.

## Supervised-fasting comparison

The medically supervised Barbieri-style mode removes the modeled intake floor.
Its 100% curve represents complete fasting, while the other curves remain
fractions of that recalculated maximum. Ordinary mode retains the 1,000 kcal/day
floor.

The mode exists to compare model scale with the documented [382-day Angus
Barbieri fast](https://pmc.ncbi.nlm.nih.gov/articles/PMC2495396/), which reduced
weight from 456 to 180 lb. That observation includes changing fat, lean tissue,
glycogen, water, sodium, and gut contents. It is not a general fasting
validation. See the [published weight-loss validation](weight-loss-validation.md)
for the full comparison.

## Body-fat regions

Body-fat regions use sex-specific, irregular fitness and aesthetic ranges
synthesized from archived [ACE
categories](http://web.archive.org/web/20220402002602/https://www.acefitness.org/education-and-resources/lifestyle/tools-calculators/percent-body-fat-calculator/),
athletic ranges summarized in [sports-nutrition
literature](https://en.wikipedia.org/wiki/Body_fat_percentage#Typical_body_fat_amounts),
a [measured male physiological
floor](https://pubmed.ncbi.nlm.nih.gov/8002550/), and [appearance-based
practitioner guidance](https://www.builtlean.com/body-fat-percentage-men-women/).

Additional visual regions extend through 75% body fat for exceptional
high-weight cases. These upper labels are extrapolated estimates. The 75% input
ceiling reflects evidence that excess weight retains a substantial lean
component in [measured body-composition
studies](https://pubmed.ncbi.nlm.nih.gov/6469707/).
