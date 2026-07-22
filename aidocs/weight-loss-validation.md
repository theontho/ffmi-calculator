# Published weight-loss validation

## Scope

This report compares the calculator's Hall/Forbes-style projection with
published group endpoints and clearly separates matched evidence, synthetic
operating points, and operating-range checks. Matching scale weight does not
validate the fat-versus-lean partition.

## Calculator behavior under test

- Maximum daily deficit is the lower of estimated TEE minus the active intake
  floor and 32 kcal/day per pound of starting fat mass.
- The four displayed speeds use 25%, 50%, 75%, and 100% of the recalculated
  maximum deficit.
- Tissue loss follows a Forbes-style partition, TEE changes with tissue, adaptive
  thermogenesis approaches 14% of the active deficit, and scale weight includes
  a bounded early fluid shift.
- A selected speed is sustained until the Stage lean target or a model stall.
  It does not model declining dietary adherence or an intentional maintenance
  phase.

## Results

| Dataset | Published endpoint | Comparable calculator scenario | Result | Interpretation |
|---|---:|---:|---:|---|
| CALERIE Phase 1 synthetic operating point | 9.2 kg mixed-sex CR endpoint at 6 months | Pooled-male baseline; 25%-maximum curve, 8.4 kg at day 183 | -0.8 kg (-8.8%) | Illustrative comparison, not validation |
| CALERIE Phase 1 synthetic lean-mass comparison | 3.3 kg mixed-sex CR FFM loss | Pooled-male baseline; 0.67 kg modeled lean loss | -80% | Illustrates sensitivity to the Forbes partition, not a matched estimate |
| CALERIE Phase 2 mixed CR cohort | 7.5 kg loss at 24 months | 25%-maximum curve reaches the female Stage lean target after 644 days, 19.6 kg loss | +12.1 kg | Sustained-speed scenario overpredicts a long trial with 11.9% achieved restriction and adherence decay |
| Friedl Army training cohort | 12.6 kg loss in 56 days | 100%-maximum curve, 6.4 kg at day 61 | -49% | Lean, exercise-heavy semi-starvation exceeds the adipose-flux cap |
| Angus Barbieri case report | 276 lb loss in 382 days | Supervised-fast, 1.20x TEE, interpolated 100%-maximum curve | within 3 lb | Extreme-obesity scale-weight comparison, not a general fasting validation |

### CALERIE Phase 1

The [CALERIE Phase 1 trial](https://pmc.ncbi.nlm.nih.gov/articles/PMC2692623/) randomized overweight adults to control, calorie restriction,
calorie restriction plus exercise, or a very-low-calorie diet. The 88.6 kg
starting weight, 24.7% DXA body fat, age 37, and BMI 27.8 describe pooled male
participants across interventions; the 10.4% weight and 5% FFM reductions
describe the mixed-sex calorie-restriction arm.

The calculator fixture intentionally combines those values into a synthetic
195.3 lb, 24.7% body-fat, 70.3 in, age-37 male operating point. At day 183, the
25%-maximum curve loses 8.40 kg versus the mixed-sex arm's published 10.4% or
9.21 kg. The 9% difference is descriptive only because the inputs and endpoint
are not a matched cohort.

The synthetic model point loses 0.67 kg lean mass while the mixed-sex arm's
reported FFM decline is about 3.3 kg. This mismatch cannot estimate partition
error quantitatively, but it reinforces that the Forbes partition should remain
described as population-averaged and not an individualized lean-mass forecast.

### CALERIE Phase 2

The two-year CALERIE trial achieved about 11.9% calorie restriction rather than
the 25% target and reported 7.5 kg sustained weight loss. A representative
female fixture can only be approximate because baseline body-fat percentage is
not directly available in the abstracts. At the calculator's lowest displayed
speed, the scenario continues imposing a deficit and reaches the female Stage
lean boundary before two years.

This mismatch is expected from a sustained-capacity scenario applied to a trial
with incomplete and declining adherence. It shows why the curves should not be
read as forecasts of what a diet assignment will produce.

### Friedl Army training cohort

Friedl and colleagues' [Army combat leadership training
study](https://pubmed.ncbi.nlm.nih.gov/8002550/) observed 55 young men during
eight weeks of strenuous exercise and low energy intake. Body fat fell from
14.3% to 5.8% and body weight by 15.7%, with an estimated 5.0 MJ/day
(approximately 1,195 kcal/day) energy deficit. At a representative 176 lb
starting weight, the calculator's adipose-flux ceiling is about 805 kcal/day.
Its maximum curve therefore loses only about half the observed scale weight.

This is an operating-range boundary, not evidence that the cap is a universal
physiological hard limit. Semi-starvation combined with heavy exercise in lean
people is outside the calculator's intended dynamic scenario.

## Excluded as strict fixtures

- **CALERIE very-low-calorie arm:** it changes from an 890 kcal/day diet to
  maintenance after 15% loss, which cannot be represented by one sustained
  speed.
- **Biggest Loser competition:** very high and incompletely measured exercise
  expenditure makes a TEE multiplier and tissue partition speculative.
- **Minnesota Starvation Experiment:** subjects began near 14% body fat and the
  observed deficit substantially exceeded the calculator's adipose-flux cap.

## Sources

| Dataset | Direct source |
|---|---|
| CALERIE Phase 1 | [Primary source](https://pmc.ncbi.nlm.nih.gov/articles/PMC2692623/) |
| CALERIE Phase 2 feasibility | [Primary source](https://pubmed.ncbi.nlm.nih.gov/26187233/) |
| CALERIE Phase 2 endpoint | [Primary source](https://doi.org/10.1016/S2213-8587(19)30151-2) |
| Army combat leadership training | [Friedl et al., 1994](https://pubmed.ncbi.nlm.nih.gov/8002550/) |
| Barbieri fast | [Primary source](https://pmc.ncbi.nlm.nih.gov/articles/PMC2495396/) |
