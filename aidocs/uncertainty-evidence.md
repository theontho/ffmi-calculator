# Projection uncertainty evidence

## Scope

This report reviews evidence for uncertainty in body-fat measurements,
individual total energy expenditure (TEE), and fat-versus-lean tissue
partitioning during weight loss. It evaluates two proposed sensitivity
defaults:

- Body fat: +/-3 percentage points
- TEE multiplier: +/-0.10

These values should produce a **sensitivity envelope**, not a confidence
interval. They sweep plausible input errors without assigning probabilities to
outcomes. The calculator applies a matching envelope to the muscle projection
and to each of the four weight-loss speed curves.

## Conclusions

- **+/-3 body-fat percentage points is defensible as a lower-bound default**
  for DXA or professionally measured skinfold inputs. Consumer BIA and visual
  estimates commonly warrant +/-5 to +/-7 points or more.
- **+/-0.10 TEE multiplier is a defensible optimistic default.** Typical
  individual uncertainty from predicted resting metabolism, activity, and
  adaptive thermogenesis is closer to +/-0.15 to +/-0.25.
- The Forbes/Hall fat-lean partition is population-averaged. Protein intake,
  resistance training, starting leanness, loss rate, and individual physiology
  can materially change lean-mass retention.

## Body-fat measurement uncertainty

### DXA

DXA is among the strongest consumer-accessible methods, but it is not a
criterion method.

- A [DXA comparison with a four-compartment model](https://doi.org/10.1016/j.nut.2024.112494) included 45
  adults. DXA fat-free-mass constant error was 1.96 kg and RMSE was 2.45 kg.
  In a typical 70 kg adult, that magnitude can shift estimated body fat by
  roughly 2-3 percentage points.
- A [comparison of DXA- and underwater-weighing-based four-compartment models](https://doi.org/10.1123/ijsnem.2017-0076) included
  four-compartment models in 122 active adults. Body-fat SEE was 3.9-4.2
  points and 95% limits of agreement were approximately +/-8 points.

Practical interpretation: +/-2 to +/-4 points is reasonable for DXA, while
individual disagreement can be wider and systematic bias can vary by sex,
ethnicity, hydration, and machine.

### Bioelectrical impedance

- A [BIA and DXA comparison](https://pubmed.ncbi.nlm.nih.gov/28633874/) found substantial fixed and proportional bias between
  BIA and DXA across carbohydrate conditions, with larger bias in women.
- A [standardized smartphone visual-model comparison](https://doi.org/10.1038/s41746-022-00628-3) found mean
  mean absolute error of 2.16 +/-1.54 points and limits of agreement from -5.5
  to +4.7 points versus DXA. All five tested BIA methods had significantly
  wider limits and significant bias.

Practical interpretation: clinical BIA commonly warrants +/-3 to +/-5 points;
consumer scales often warrant +/-5 to +/-8 points or more.

### Skinfold and visual estimates

- A [four-site skinfold and DXA comparison](https://doi.org/10.1017/S136898002400209X) included
  in 218 adults. Durnin-Womersley had -3.65-point fixed bias and 6.74-point
  individual variability. A newly fitted equation still had 3.00-point SEE
  and 5.84-point individual variability.
- Even the [standardized computer-vision method](https://doi.org/10.1038/s41746-022-00628-3) had roughly
  +/-5-point limits of agreement. Informal human visual estimates should be
  treated as less precise.

### Practical ranges

| Input method | Useful sensitivity range |
|---|---:|
| DXA | +/-3 points |
| Professionally measured skinfold | +/-3 to +/-5 points |
| Clinical multi-frequency BIA | +/-4 to +/-6 points |
| Consumer BIA scale | +/-5 to +/-8 points |
| Visual estimate | +/-7 to +/-10 points |

## TEE uncertainty

### Prediction error

- A [review of resting-metabolic-rate equations](https://doi.org/10.1016/j.jada.2005.02.005) found Mifflin-St Jeor to be the most reliable
  common resting-metabolic-rate equation, but it was only within 10% of
  measured values for most people and retained important individual errors.
- A study of 51 male athletes reported 95% limits of agreement of about
  +/-200 to +/-300 kcal/day across seven resting-metabolism equations.
- A Pennington Biomedical Research Center analysis of 119 doubly labeled
  water observations reported adjusted R-squared values of 0.65-0.74 for TEE
  prediction models, leaving 26-35% of variance unexplained.
- A [doubly labeled water validation of ten equations](https://doi.org/10.1038/s41598-024-66767-7)
  in 56 adults and reported sizable individual errors despite acceptable
  group-level accuracy.
- In 21 colorectal-cancer patients, measured TEE was 2,473 +/-499 kcal/day and
  PAL was 1.43 +/-0.27. Even a recommendation using measured PAL had limits of
  agreement from -21.2% to +29.3%.

For a typical 2,000-2,500 kcal/day expenditure, ordinary individual
prediction error is often 200-400 kcal/day, approximately 10-20%.

### Adaptive thermogenesis

A [six-week metabolic-ward study](https://doi.org/10.1016/j.metabol.2020.154303) followed 11 overweight adults during 50%
caloric restriction in a metabolic ward. Adaptive thermogenesis after one week
averaged -178 +/-137 kcal/day. A 100 kcal/day difference predicted about 2 kg
less weight loss over six weeks. Starting TEE accuracy therefore does not
remove uncertainty during active loss.

### Multiplier interpretation

For resting expenditure around 1,700-1,900 kcal/day:

- +/-0.10 multiplier is approximately +/-170 to +/-190 kcal/day.
- +/-0.15 to +/-0.20 is more representative of ordinary equation and
  self-reported-activity uncertainty.
- +/-0.10 is best treated as a low-uncertainty minimum, not a population
  standard deviation.

## Fat-versus-lean partition uncertainty

- In the CALERIE-2 MRI ancillary study, actual restriction averaged 13.7% over
  24 months. Approximately 78% of lost tissue volume was adipose and 17.2% was
  skeletal muscle.
- Hall's 2008 treatment of the Forbes relationship predicts that leaner people
  lose a larger fraction of lean tissue. The energy density and composition of
  lost weight change as fat stores decline.
- A [dynamic body-weight model](https://doi.org/10.1016/S0140-6736(11)60812-X) shows that body-weight response has a
  long time constant and that loss composition changes over time.

Protein intake, resistance training, loss rate, hormonal state, and starting
body fat are not fully represented by a simple Forbes curve. The calculator
should not present its lean-loss output as an individualized prediction.

## Recommended UI behavior

Default controls:

- Body-fat sensitivity: +/-3 points
- TEE sensitivity: +/-0.10

Suggested presets:

| Preset | Body-fat range | TEE range |
|---|---:|---:|
| Measured / low uncertainty | +/-3 points | +/-0.10 |
| Consumer estimate | +/-5 points | +/-0.15 |
| Visual estimate / broad sensitivity | +/-7 points | +/-0.20 |

Suggested short label:

> Sensitivity range - not a confidence interval

Suggested explanation:

> The shaded band shows how projections change when body-fat and energy-output
> estimates vary by the selected amounts. It is a what-if envelope, not a
> probability statement or guarantee that an outcome will remain inside it.

## Caveats

1. DXA itself varies with machine, hydration, ethnicity, and analysis method.
2. Individual variation around the Forbes partition is not precisely captured
   by one authoritative standard deviation.
3. TEE changes during loss and adaptive thermogenesis varies substantially.
4. These findings describe generally healthy adults and may not transfer to
   athletes, older adults, medical conditions, or medications.

## Sources

| Finding | Direct source |
|---|---|
| DXA vs four-compartment FFM error | [Primary source](https://doi.org/10.1016/j.nut.2024.112494) |
| Four-compartment DXA agreement | [Primary source](https://doi.org/10.1123/ijsnem.2017-0076) |
| BIA fixed and proportional bias | [Primary source](https://pubmed.ncbi.nlm.nih.gov/28633874/) |
| Visual model and BIA vs DXA | [Primary source](https://doi.org/10.1038/s41746-022-00628-3) |
| Skinfold equations vs DXA | [Primary source](https://doi.org/10.1017/S136898002400209X) |
| Resting-metabolism equation review | [Primary source](https://doi.org/10.1016/j.jada.2005.02.005) |
| TEE prediction models | [Primary source](https://doi.org/10.1093/ajcn/nqy191) |
| Doubly labeled water equation validation | [Primary source](https://doi.org/10.1038/s41598-024-66767-7) |
| Individual TEE and PAL variability | [Primary source](https://pubmed.ncbi.nlm.nih.gov/31225583/) |
| Adaptive thermogenesis variability | [Primary source](https://doi.org/10.1016/j.metabol.2020.154303) |
| Forbes partition model | [Primary source](https://doi.org/10.1038/sj.ijo.0803720) |
| CALERIE tissue partition | [Primary source](https://doi.org/10.1093/ajcn/nqab151) |
| Dynamic weight-loss model | [Primary source](https://doi.org/10.1016/S0140-6736(11)60812-X) |
| Athlete RMR equation agreement | [Primary source](https://pubmed.ncbi.nlm.nih.gov/10573663/) |
