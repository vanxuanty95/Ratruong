# Full LightGCN validation sanity

- Config: full-lightgcn-sanity-v1-2026-09-14
- Epochs: 5 fixed full-graph epoch
- NDCG@20: 0.004931
- Recall@20: 0.012373
- Catalog Coverage@20: 0.006365
- ΔNDCG@20 vs BPR-MF: +0.000878
- ΔRecall@20 vs BPR-MF: +0.001954

## Validation theo target item cohort

| Cohort | Target share | NDCG@20 | Recall@20 |
|---|---:|---:|---:|
| head | 35.82% | 0.013759 | 0.034511 |
| body | 48.79% | 0.000006 | 0.000025 |
| tail | 15.40% | 0.000000 | 0.000000 |

## Claim boundary

One fixed validation-only full-graph LightGCN sanity run. No test access, hyperparameter search, final baseline, sampled training, sampler comparison, or scalability claim.
