# Thesis draft

> **`ARCHIVED PILOT NARRATIVE — NOT FINAL THESIS EVIDENCE`** (DL-001, 2026-09-16). This document narrates the M0–M2 heuristic pilot. Phase 2 is now GRAPES-GFN-Rec; see the canonical Vietnamese spec `00_project/PHASE2_GRAPES_GFN_REC_SPEC_vn.md`.

## Abstract

This thesis studies computation-graph sampling for LightGCN recommendation. Three samplers are compared under the same temporal user-item graph, model, layer budget, optimizer steps, random inputs, evaluator, and Tesla T4: uniform M0, degree-aware M1, and frontier-normalized M2. The primary data are 5,953,891 raw Amazon Reviews'23 Baby Products ratings. After quarantining one out-of-range rating, keeping ratings 4–5, and applying a temporal warm-start protocol, the training graph contains 3,868,654 edges, 2,318,308 users, and 162,125 items. It is highly sparse and imbalanced.

Exact full-catalog NDCG@20 and Recall@20 measure ranking quality. Catalog coverage, popularity-cohort exposure, and cohort recall diagnose distribution. Training time and peak GPU memory measure cost. Across three validation seeds, M2 is lower than M1 in NDCG and Recall on every seed and is slower on the two new repeats. M2 changes sampled structure and many target ranks, but the changes do not create stable top-20 gains; tail hits remain zero. The registered hypothesis that M2 improves the quality-cost trade-off over M1 is therefore not supported.

## 1. Research problem

Graph recommenders propagate information through user-item interactions. On a large graph, sampling reduces the computation graph used for each batch, but it also determines which collaborative signals reach the model. A sampler may save memory, reinforce popular nodes, or expose more tail nodes. Those structural changes are useful only if they improve ranking under an acceptable resource cost.

The thesis asks whether a frontier-conditioned proposal provides a better NDCG@20-resource trade-off than uniform and degree-aware controls when all other experimental factors are matched.

The scope is warm-start pure-ID implicit ranking. It excludes rating prediction, content-based recommendation, cold-start, online serving, and knowledge-graph recommendation. Current results are validation-only on one dataset and one smoke budget.

## 2. Benchmarks and positioning

MovieLens 25M is a stable collaborative-filtering dataset with ratings, tags, and tag-genome relevance, but its activity-selected users reduce the extreme singleton setting. Gowalla and Yelp2018 are the closest graph-CF comparisons because the original LightGCN study uses them with Recall@20 and NDCG@20. MIND provides text and impressions for news recommendation. KuaiRec offers an almost fully observed matrix for exposure-bias research. These datasets establish benchmark context; the project has not run them.

GRAPES informs the broader idea of task-conditioned graph sampling. The thesis does not directly transfer GRAPES into recommendation. It evaluates one fixed, interpretable frontier-normalized heuristic after establishing uniform and degree-aware controls.

## 3. Dataset and task

### 3.1 Selection

The audited Amazon portfolio contains 693,929 All Beauty rows, 5,953,891 Baby Products rows, and 66,623,880 Home and Kitchen rows. Baby is selected before model results because it has meaningful scale, extreme sparsity, and a strong long tail while remaining feasible for paired experiments on a Tesla T4.

### 3.2 Provenance and quality

The primary artifact is the official 0-core rating-only `Baby_Products.csv.gz`, with 148,609,233 compressed bytes and SHA-256 `e2a8d0498afed767ee2615db7fac549559d82490b1a73c7241b84b5e9e8c279e`. Fields are user ID, parent ASIN, rating, and timestamp.

Exact audit finds one `0.0` rating outside the 1–5 range, no missing user/item IDs, no invalid timestamps, and no duplicate user-item rows. The invalid row is quarantined. P4 keeps ratings 4 and 5, retaining 4,655,843 interactions or 78.20% of raw data.

### 3.3 Temporal protocol

Interactions are divided into train `< t1`, validation `[t1,t2)`, and test `>= t2`. Mapping, graph degree, and popularity cohorts use training interactions only. Future targets are projected into the frozen mapping. Each target is ranked against the full eligible training catalog after removing prior positive history.

Validation retains 81,871 warm targets from 373,776 candidate rows, or 21.90%. Test retains 40,587 of 413,413, or 9.82%, and remains unread. The low retention is a pure-ID warm-start limitation, not a model score.

### 3.4 Graph distribution

The training graph contains 3,868,654 edges, 2,318,308 users, and 162,125 items, with density `1.0293e-05`. User singleton rate is 71.76%; item singleton rate is 33.35%. User degree p50/p90/p99 is 1/3/9 and item degree is 3/32/397. Item-degree Gini is 0.8584. The top 1% of items receive 44.09% of interactions.

Tie-aware popularity cohorts are frozen before model results. Head contains roughly 1% of items and 44.16% of edges; tail contains 80.07% of items and 10.39% of edges.

## 4. Methods

All samplers use the same LightGCN-style recommender, BPR objective, three layers, batch size 65,536, per-layer budget `[65,536, 65,536, 65,536]`, five epochs, 300 optimizer steps, paired initialization, pair order, negative draws, evaluator, and GPU.

M0 samples eligible nodes uniformly without replacement. M1 uses `log(training_degree) + Gumbel`, favoring highly observed nodes. M2 uses:

```text
log(frontier_support) - 0.5 * log(training_degree) + Gumbel
```

Frontier support counts training edges from a candidate to the previous layer's frontier. The first term captures batch-local relevance; the degree term reduces generic hub advantage. M2 is fixed and heuristic, not learned.

## 5. Evaluation

NDCG@20 is primary because a target ranked first is more useful than the same target at rank 20. Recall@20 records target retrieval. Catalog Coverage@20 is the fraction of 162,125 training items that appear at least once across top-20 lists. Exposure by head/body/tail records where slots are allocated; cohort Recall/NDCG and hit counts record correctness. Training wall time and peak GPU memory measure cost. Rank transitions explain mechanisms.

Coverage and popularity exposure are structural diversity diagnostics. Semantic relevance and intra-list semantic diversity are not measured because the artifact contains no content metadata.

Three validation seeds are reported individually and by mean/sample standard deviation. This is descriptive uncertainty, not a significance test.

## 6. Results

### 6.1 Baselines

| Model | NDCG@20 | Recall@20 | Coverage@20 |
|---|---:|---:|---:|
| MostPop | 0.005873 | 0.014596 | 0.000154 |
| BPR-MF | 0.004054 | 0.010419 | 0.033517 |
| Full LightGCN | 0.004931 | 0.012373 | 0.006365 |

MostPop recommends only 25 items and allocates all exposure to head. BPR-MF expands the catalog but lowers accuracy. Full LightGCN recovers quality over BPR-MF while returning 99.36% of exposure to head. Accuracy, catalog breadth, and long-tail relevance do not move together.

### 6.2 Sampler means

| Method | NDCG@20 mean ± SD | Recall@20 mean ± SD | Coverage@20 mean ± SD |
|---|---:|---:|---:|
| M0 | 0.00570640 ± 0.00007324 | 0.01486892 ± 0.00048771 | **0.01813210 ± 0.00031820** |
| M1 | **0.00586598 ± 0.00024947** | **0.01529642 ± 0.00062009** | 0.01753380 ± 0.00062722 |
| M2 | 0.00572092 ± 0.00017933 | 0.01487299 ± 0.00057942 | 0.01751324 ± 0.00031838 |

M2 minus M1 is negative for both quality metrics on s0, s1, and s2. M2 is 2.47% lower in mean NDCG and 2.77% lower in mean Recall. On the two new repeats it is 114.88 seconds slower on average, with only about 4.11 MiB mean peak-memory difference.

M2 changes rankings substantially: relative to M1 it has 191 gained and 238 lost top-20 hits on s1, and 242 gained and 244 lost hits on s2. Its proposal is active, but gains do not compensate for losses. Tail hits are zero for all methods and seeds, and M2 does not exceed M1 in body hits on any seed.

## 7. Discussion

M2 successfully changes sampled structure and shifts item context toward tail nodes, but structural exposure is insufficient. A tail node connected to the frontier may still provide weak target-ranking signal in an extremely sparse graph. The degree penalty can also remove useful high-degree collaborative signal. Computing frontier support adds CPU overhead.

The result shows that computation-graph diversity is not recommendation relevance. The negative finding is informative because the design was motivated by M1's head-focused gains, tested under a matched contract, and repeated without altering M2 after observing s0.

## 8. Limitations and next boundaries

Evidence covers one dataset, one budget, three validation seeds, and a Tesla T4 runner. It does not establish test performance, significance, cross-dataset or cross-budget behavior, semantic diversity, cold-start, or deployment scalability. The result does not reject all adaptive or learned samplers.

No new sampler is opened after validation. A future registered branch may address one purpose: final test, Yelp2018/Gowalla generalization, metadata-based semantic diversity, or bounded Home and Kitchen scale stress.
