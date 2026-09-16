# M0 uniform sampled LightGCN — validation smoke

- Config: uniform-sampling-k65536-smoke-v1-2026-09-14
- Matched control ID: static-controls-k65536-smoke-v1
- Layer budget: [65536, 65536, 65536]
- NDCG@20: 0.005727
- Recall@20: 0.014657
- Catalog Coverage@20: 0.018486
- Training wall time: 705.32 s
- Training peak GPU memory: 3482.90 MB

## Validation theo target item cohort

| Cohort | Target share | NDCG@20 | Recall@20 |
|---|---:|---:|---:|
| head | 35.82% | 0.015631 | 0.040070 |
| body | 48.79% | 0.000264 | 0.000626 |
| tail | 15.40% | 0.000000 | 0.000000 |

## Claim boundary

One fixed validation-only M0 uniform sampled-training smoke run at the predeclared k_l=65536 layer budget. This is an implementation and resource-envelope probe, not the middle point of a tested budget grid. No test access, hyperparameter search, method selection, learned sampler, sampled-inference claim, or comparison to full LightGCN as a budget-matched method.
