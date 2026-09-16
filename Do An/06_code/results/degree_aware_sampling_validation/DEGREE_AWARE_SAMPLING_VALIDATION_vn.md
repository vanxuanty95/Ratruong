# M1 degree-aware sampled LightGCN — validation smoke

- Config: degree-aware-sampling-k65536-smoke-v1-2026-09-14
- Matched control ID: static-controls-k65536-smoke-v1
- Layer budget: [65536, 65536, 65536]
- NDCG@20: 0.006153
- Recall@20: 0.015989
- Catalog Coverage@20: 0.017783
- Training wall time: 795.10 s
- Training peak GPU memory: 2665.10 MB

## Matched comparison với M0 uniform

- ΔNDCG@20: +0.000426
- ΔRecall@20: +0.001331
- ΔHit@20: +109
- ΔCoverage@20: -0.000703

## Validation theo target item cohort

| Cohort | Target share | NDCG@20 | Recall@20 |
|---|---:|---:|---:|
| head | 35.82% | 0.016714 | 0.043787 |
| body | 48.79% | 0.000342 | 0.000626 |
| tail | 15.40% | 0.000000 | 0.000000 |

## Claim boundary

One fixed validation-only M1 training-degree-aware sampled-training smoke run at the predeclared k_l=65536 layer budget. This is an implementation and resource-envelope probe, not the middle point of a tested budget grid. No test access, hyperparameter search, method selection, learned sampler, sampled-inference claim, or comparison to full LightGCN as a budget-matched method.
