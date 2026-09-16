# Research presentation narrative

## What the project studies

The project examines how context-node sampling changes LightGCN recommendation. The data, model, training steps, layer budget, random inputs, evaluator, and GPU stay fixed. Only the rule used to select context nodes changes.

The goal is not to find a large score by any means. The question is whether a sampler improves ranked recommendation without unacceptable time, memory, catalog-concentration, or cohort costs.

## Dataset landscape

Public recommendation research also uses MovieLens, Gowalla, Yelp2018, MIND, and KuaiRec. MovieLens is strong for collaborative filtering and metadata. Gowalla and Yelp2018 are the closest LightGCN benchmarks. MIND supports content-aware news recommendation. KuaiRec supports exposure-bias analysis. The project has not run these datasets; they explain the alternatives and why dataset choice depends on the research question.

Within Amazon Reviews'23, the project audited All Beauty (693,929 rows), Baby Products (5,953,891), and Home and Kitchen (66,623,880). Baby is primary because it is sparse and long-tailed at a meaningful graph scale while remaining feasible for the full paired experiment on Colab/Tesla T4. All Beauty is a pipeline control. Home and Kitchen is a separate unexecuted scale reference.

## Source and fields

The Baby Products artifact is the official 0-core rating-only release. Each row contains anonymized user ID, parent product ID, rating, and timestamp. The artifact supports collaborative interaction analysis but not product-semantic similarity because it has no title, category, description, image, or content embedding.

## Data quality and positive interactions

Among 5,953,891 raw rows, one rating is `0.0`, outside the expected 1–5 range; it is quarantined. Exact audit finds no missing IDs, invalid timestamps, or duplicate user-item rows. Ratings 4 and 5 form positive interactions, retaining 4,655,843 rows or 78.20% of raw data.

The data are temporally split. Mapping, degree, and cohorts use training interactions only. The training graph contains 3,868,654 edges, 2,318,308 users, and 162,125 items. Validation retains 81,871 warm targets, or 21.90% of candidate rows. Test retains 40,587 warm targets but remains unread.

## Imbalance and long tail

The graph is highly imbalanced. 71.76% of users and 33.35% of items have one training interaction. Item-degree Gini is 0.8584. The top 1% of items receive 44.09% of interactions. Degree histograms, log-scale tails, quantiles, and cumulative shares are more informative than a separate bar for every item.

Popularity cohorts are frozen before model results. Head contains roughly 1% of items and 44.16% of edges; tail contains 80.07% of items and only 10.39% of edges.

## M0, M1, and M2

- M0 samples uniformly and is the neutral control.
- M1 prioritizes high-degree training nodes. It can preserve stable collaborative signal but may reinforce popularity.
- M2 prioritizes nodes connected to the current frontier, then penalizes global degree. It tries to retain batch-local relevance without automatically selecting generic hubs.

Context here means graph neighbors used for propagation in the current batch and layer. M0–M2 are three computation-graph rules for the same recommender, not three unrelated models.

## Why these metrics

NDCG@20 is primary because position matters. Recall@20 records whether the held-out target appears in the first 20 recommendations. Catalog Coverage@20 detects collapse to a small catalog subset. Exposure by head/body/tail shows where recommendation slots go, while cohort recall and hit counts show whether those slots are correct. Training time and peak GPU memory measure the resource side of the trade-off.

Coverage and exposure are structural diagnostics. They do not measure semantic diversity.

## Baselines

| Model | NDCG@20 | Recall@20 | Coverage@20 |
|---|---:|---:|---:|
| MostPop | 0.005873 | 0.014596 | 0.000154 |
| BPR-MF | 0.004054 | 0.010419 | 0.033517 |
| Full LightGCN | 0.004931 | 0.012373 | 0.006365 |

MostPop recommends only 25 items and places all exposure in head. BPR-MF expands catalog coverage but lowers aggregate accuracy. Full LightGCN recovers quality over BPR-MF while concentrating 99.36% of exposure in head. Accuracy, catalog breadth, and long-tail relevance are therefore distinct questions.

## Paired result

| Method | NDCG@20 mean | Recall@20 mean | Coverage@20 mean |
|---|---:|---:|---:|
| M0 | 0.005706 | 0.014869 | **0.018132** |
| M1 | **0.005866** | **0.015296** | 0.017534 |
| M2 | 0.005721 | 0.014873 | 0.017513 |

M2 is below M1 in NDCG and Recall on every seed. It still changes many ranks and top-20 outcomes, so its implementation is active. The changes simply do not create stable top-20 gains. M2 is also slower on the two new repeats, while its peak GPU memory is effectively the same as M1. Tail hits remain zero.

## Defensible conclusion

M2 does not improve the quality-cost trade-off over M1 under the registered protocol. The negative result suggests that moving sampled structure toward tail items does not automatically create target relevance in a very sparse graph. M1 has the highest mean validation quality but does not beat M0 on every seed, so the evidence does not support universal superiority or significance.

## What remains unmeasured

The project has not measured semantic match, intra-list semantic diversity, cold-start, test performance, another dataset, another sampling budget, or deployment scalability. A future branch must choose one purpose: final test, external graph-sampling generalization, metadata-based semantic analysis, or bounded scale stress.
