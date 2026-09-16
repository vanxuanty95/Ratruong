# Research plan and actual timeline

> Status: paired validation is complete and the sampler-design branch ends at M2.

## Research question

At the same data, LightGCN backbone, sampling budget, optimization steps, seeds, evaluator, and GPU, can a frontier-conditioned sampler provide a better exact full-catalog NDCG@20 versus computation-cost trade-off than uniform and degree-aware sampling?

## Timeline

| Stage | Question | Evidence | Outcome |
|---|---|---|---|
| Lecturer feedback, 03/09 | What are the data scale, noise, imbalance, and long-tail properties? | Exact audit and EDA | Complete |
| Dataset selection | Why Baby Products rather than another Amazon or public benchmark? | Portfolio audit and benchmark comparison | Complete at design level |
| Task construction | How can future targets be evaluated without leakage? | Temporal graph and warm-start ledger | Complete |
| Sanity baselines | Do training and exact ranking behave coherently? | MostPop, BPR-MF, Full LightGCN | Complete |
| M0 | What does neutral sampling change? | Uniform smoke run | Complete |
| M1 | Does degree priority improve the matched control? | M1 minus M0 | Complete |
| M2 | Does frontier relevance with a hub penalty improve M1? | M2 minus M0/M1 | No |
| Paired validation | Does the conclusion persist across seeds? | s0, s1, s2 | M2 below M1 on all seeds |
| Consolidation | What conclusion can be defended without exceeding evidence? | Canonical documents and deck | In progress |

## Dataset decision

Established non-Amazon benchmarks include MovieLens 25M, Gowalla, Yelp2018, MIND, and KuaiRec. MovieLens supports metadata and semantic analysis; Gowalla and Yelp2018 are closest to LightGCN graph-CF evaluation; MIND supports content-aware news recommendation; KuaiRec supports exposure-bias research. They are considered benchmarks, not experiments completed by this project.

The audited Amazon portfolio contains 693,929 All Beauty rows, 5,953,891 Baby Products rows, and 66,623,880 Home and Kitchen rows. Baby is primary because it is large, sparse, and strongly long-tailed while remaining feasible for the paired M0–M2 matrix on a Tesla T4. All Beauty is a pipeline control. Home and Kitchen is an unexecuted scale reference, about 11.19 times Baby by raw rows.

## Data after preprocessing

- One out-of-range `0.0` rating is quarantined; exact audit finds no missing IDs, invalid timestamps, or duplicate user-item rows.
- P4 keeps ratings 4 and 5: 4,655,843 interactions, or 78.20% of raw rows.
- Training graph: 3,868,654 edges, 2,318,308 users, 162,125 items.
- Warm validation: 81,871 of 373,776 candidate rows, 21.90% retention.
- Warm test: 40,587 of 413,413 candidate rows, 9.82% retention; test is unread.

The raw, P4, and training item counts are different universes: 217,654, 194,722, and 162,125 respectively. Coverage uses the training catalog.

## Imbalance

User singleton rate is 71.76%; item singleton rate is 33.35%. User degree p50/p90/p99 is 1/3/9, while item degree is 3/32/397. Item-degree Gini is 0.8584 and the top 1% of items receive 44.09% of training interactions.

## Methods

- M0 samples eligible context nodes uniformly without replacement.
- M1 uses `log(training_degree) + Gumbel` priority.
- M2 uses `log(frontier_support) - 0.5 log(training_degree) + Gumbel` priority.

M2 tries to preserve batch-local graph relevance while reducing generic hub advantage. It is fixed and heuristic, not learned.

## Metrics

NDCG@20 is primary because rank position matters. Recall@20 records target retrieval. Catalog Coverage@20 detects catalog collapse. Exposure and target metrics by popularity cohort distinguish visibility from correct recommendation. Training time and peak GPU memory measure cost. Semantic diversity is not measured because the current artifact has no content metadata.

## Results

| Method | NDCG@20 mean ± SD | Recall@20 mean ± SD | Coverage@20 mean ± SD |
|---|---:|---:|---:|
| M0 | 0.005706 ± 0.000073 | 0.014869 ± 0.000488 | **0.018132 ± 0.000318** |
| M1 | **0.005866 ± 0.000249** | **0.015296 ± 0.000620** | 0.017534 ± 0.000627 |
| M2 | 0.005721 ± 0.000179 | 0.014873 ± 0.000579 | 0.017513 ± 0.000318 |

M2 minus M1 is negative for both quality metrics on all three seeds. M2 changes many ranks and top-20 hits, so the proposal is active, but the changes do not create stable top-20 gain. Tail hits are zero for all methods and seeds.

## Decision and next boundary

Do not promote M2, open M3, or use test data to select a replacement. Preserve M2 as a controlled negative result. Any new evidence branch must be registered for one specific purpose: final test, external graph-sampling generalization, semantic diversity with metadata, or bounded Home and Kitchen scale stress.
