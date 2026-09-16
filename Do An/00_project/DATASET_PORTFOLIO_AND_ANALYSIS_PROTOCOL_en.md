# Dataset portfolio and analysis protocol

> Status: Baby Products is the audited primary dataset. Non-Amazon datasets provide benchmark context only and have not been run in this project.

## Dataset reliability criteria

A useful recommendation dataset needs clear provenance, interaction semantics, version or checksum information, a leakage-safe split, and a scale that matches the research question and compute envelope. Popularity alone or a third-party mirror is not sufficient.

## Established non-Amazon benchmarks

| Dataset | Main value | Limitation for this thesis |
|---|---|---|
| MovieLens 25M | 25,000,095 ratings, 162,541 users, 62,423 movies, tags, and tag genome | Users have at least 20 ratings, weakening the singleton-user setting |
| Gowalla | Implicit user-location graph used by LightGCN | Different domain and processed random split |
| Yelp2018 | Closest external graph-CF benchmark | Filtered benchmark; raw metadata is not automatically retained |
| MIND | One million users, more than 160,000 news items, text and impressions | News, item churn, and cold-start change the task |
| KuaiRec | Almost fully observed user-video matrix | Small, dense catalog does not stress sparse-graph sampling |

Primary sources: [MovieLens 25M](https://grouplens.org/datasets/movielens/25m/), [LightGCN](https://hexiangnan.github.io/papers/sigir20-LightGCN.pdf), [MIND](https://aclanthology.org/2020.acl-main.331/), and [KuaiRec](https://arxiv.org/abs/2202.10842).

Gowalla or Yelp2018 would be the nearest second dataset for graph-sampling generalization. MovieLens or MIND would address semantic diversity instead. Those are separate research questions.

## Audited Amazon portfolio

| Dataset | Raw rows | Raw users | Raw items | Role |
|---|---:|---:|---:|---|
| All Beauty | 693,929 | 631,986 | 112,565 | Pipeline control |
| Baby Products | 5,953,891 | 3,386,206 | 217,654 | Primary dataset |
| Home and Kitchen | 66,623,880 | Not fully audited | Not fully audited | Raw scale reference |

All Beauty is convenient for pipeline development but too small and has very low P4 warm-start retention. Home and Kitchen is about 11.19 times Baby by raw rows; it has not received the full protocol or experiment matrix. Baby provides meaningful graph-sampling pressure while remaining feasible for paired validation on a Tesla T4.

## Baby Products provenance

- Source: Amazon Reviews'23, McAuley Lab.
- Artifact: `0core/rating_only/Baby_Products.csv.gz`.
- Compressed bytes: 148,609,233.
- SHA-256: `e2a8d0498afed767ee2615db7fac549559d82490b1a73c7241b84b5e9e8c279e`.
- Schema: `user_id`, `parent_asin`, `rating`, `timestamp`.

Official sources: [Amazon Reviews'23](https://amazon-reviews-2023.github.io/main.html), [0-core statistics](https://amazon-reviews-2023.github.io/data_processing/0core.html), and the [dataset paper](https://arxiv.org/abs/2403.03952).

## Quality and interaction policy

Exact audit finds one out-of-range `0.0` rating and no missing IDs, invalid timestamps, or duplicate user-item rows. The invalid row is quarantined. No subjective outlier removal is applied.

P4 defines positive interactions as ratings 4 and 5. It retains 4,655,843 rows, or 78.20% of raw data. Ratings 1–3 do not create positive edges. The task is implicit top-N ranking rather than rating prediction.

## Temporal protocol

Interactions are divided into train `< t1`, validation `[t1,t2)`, and test `>= t2`. User/item mapping, degree, popularity cohorts, and the graph use training interactions only. Future targets are projected into the frozen mapping. Exact ranking uses every eligible training-catalog item after removing observed prior positives.

| Split | Candidate rows | Warm rows | Retention |
|---|---:|---:|---:|
| Validation | 373,776 | 81,871 | 21.90% |
| Test | 413,413 | 40,587 | 9.82% |

The low retention defines a warm-start pure-ID population and does not establish cold-start performance.

## Training graph

The graph contains 3,868,654 edges, 2,318,308 users, and 162,125 items, with density `1.0293e-05`. User singleton rate is 71.76%, item singleton rate is 33.35%, item-degree Gini is 0.8584, and the top 1% of items receive 44.09% of training interactions.

## Claim boundary

This protocol supports warm-start pure-ID evaluation on Baby Products. It does not establish semantic relevance, semantic diversity, cold-start capability, cross-dataset generalization, Home and Kitchen scalability, or test performance. A new dataset branch must declare which one of those questions it is intended to answer before execution.
