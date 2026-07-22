# Citation audit

## Scope

On 2026-07-22, every external source link in `README.md` and `aidocs/*.md` was
checked for semantic support, not only HTTP availability. Paper titles,
populations, methods, and quoted numerical results were compared with PubMed
abstracts, publisher abstracts, or full primary-source text.

## Corrections

Three links resolved successfully but pointed to unrelated papers:

| Claim | Incorrect target | Verified source |
|---|---|---|
| Eight-week Army training weight loss | Sheep smoke-inhalation experiment | [Friedl et al., 1994](https://pubmed.ncbi.nlm.nih.gov/8002550/) |
| Pennington TEE prediction models | Sedentary-time and adiposity study | [Plucker et al., 2018](https://pubmed.ncbi.nlm.nih.gov/30026590/) |
| CALERIE tissue partition | Vitamin D and COVID-19 study | [Shen et al., 2021](https://pubmed.ncbi.nlm.nih.gov/34159359/) |

The Army study directly reports 55 men, an eight-week course, a 5.0 +/-2.0
MJ/day energy deficit, 15.7% weight loss, and body fat declining from 14.3% to
5.8%. The corrected CALERIE paper directly reports 13.7% achieved restriction,
78% adipose tissue, and 17.2% skeletal muscle among lost tissue volume. The
corrected Pennington paper directly reports 119 observations and adjusted
R-squared values from 0.65 to 0.74.

## Additional checks

- The scanned [382-day therapeutic-fast case
  report](https://pmc.ncbi.nlm.nih.gov/articles/PMC2495396/) states that weight
  declined from 456 to 180 lb, a 276 lb loss.
- The [CALERIE Phase 2 endpoint](https://pubmed.ncbi.nlm.nih.gov/31303390/)
  reports 11.9% achieved calorie restriction and 7.5 kg sustained weight loss.
- A DXA comparison used to discuss measurement error studied colorectal-cancer
  patients; the uncertainty report now identifies that population rather than
  implying a general healthy-adult sample.

Secondary sources remain only where they are explicitly identified as
appearance guidance or everyday measurement convention, not as primary support
for calculation formulas.
