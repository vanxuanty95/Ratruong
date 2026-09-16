# BPR-MF validation sanity

- Config: bpr-mf-sanity-v1-2026-09-13
- Epochs: 5 fixed
- NDCG@20: 0.004054
- Recall@20: 0.010419
- Catalog Coverage@20: 0.033517
- ΔNDCG@20 vs MostPop: -0.001819
- ΔRecall@20 vs MostPop: -0.004177

## Validation theo target item cohort

| Cohort | Target share | NDCG@20 | Recall@20 |
|---|---:|---:|---:|
| head | 35.82% | 0.011011 | 0.028304 |
| body | 48.79% | 0.000225 | 0.000576 |
| tail | 15.40% | 0.000000 | 0.000000 |

## Exposure

- Unique item@20: 5,434/162,125
- Head/body/tail share: 92.96% / 7.03% / 0.01%

## Ranh giới claim

One fixed validation-only sanity run. No test access, hyperparameter search, final baseline, sampler comparison, or scalability claim.
