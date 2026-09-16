# M2 frontier-normalized sampled LightGCN — validation smoke

- Config: frontier-normalized-sampling-k65536-smoke-v1-2026-09-15
- Matched control ID: static-controls-k65536-smoke-v1
- Layer budget: [65536, 65536, 65536]
- NDCG@20: 0.005921
- Recall@20: 0.015317
- Catalog Coverage@20: 0.017863
- Training wall time: 868.63 s
- Training peak GPU memory: 2669.06 MB

## Matched comparison với M0 uniform

- ΔNDCG@20: +0.000193
- ΔRecall@20: +0.000660
- ΔHit@20: +54
- ΔCoverage@20: -0.000623

## Matched comparison với M1 degree-aware

- ΔNDCG@20: -0.000233
- ΔRecall@20: -0.000672
- ΔHit@20: -55
- ΔCoverage@20: +0.000080

## Validation theo target item cohort

| Cohort | Target share | NDCG@20 | Recall@20 |
|---|---:|---:|---:|
| head | 35.82% | 0.016108 | 0.041911 |
| body | 48.79% | 0.000310 | 0.000626 |
| tail | 15.40% | 0.000000 | 0.000000 |

## Claim boundary

One fixed validation-only M2 frontier-normalized sampled-training smoke run at the predeclared k_l=65536 layer budget. This project-candidate probe tests one formula selected after reading the M0-M1 validation controls. No test access, hyperparameter search, learned policy, sampled-inference claim, or comparison to full LightGCN as a budget-matched method.
