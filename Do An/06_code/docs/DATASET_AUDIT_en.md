# Dataset Audit and Acceptance Protocol

> **Status:** `TEMPORARY RAW AUDIT EXECUTED — DATASET GATE G2 OPEN`  
> **Recorded:** 2026-08-27  
> **Scope:** Independent Master's thesis on graph sampling for large-scale GNN recommendation.  
> **Boundary:** This protocol governs data evidence; it does not select or validate the final sampling method.

## 1. Dataset roles

| Role | Dataset | Status |
|---|---|---|
| Development diagnostic | Amazon Reviews'23 `All_Beauty`, pure-ID 0-core | Retained for preprocessing and sampler diagnostics only; not primary evidence |
| Primary benchmark candidate | Amazon Reviews'23 `Baby_Products`, pure-ID 0-core | Must pass G2-A through G2-D before it is frozen |
| Conditional scale stress | Amazon Reviews'23 `Home_and_Kitchen` | One bounded stress configuration is required only if the thesis retains a large-scale claim |
| Optional validation | MovieLens 25M and Yelp Open Dataset | May be added only after the Amazon core is complete |

The full portfolio, reasons, sources, and gates are recorded in [`DATASET_PORTFOLIO_AND_ANALYSIS_PROTOCOL_en.md`](../../00_project/DATASET_PORTFOLIO_AND_ANALYSIS_PROTOCOL_en.md).

## 2. Current raw-audit evidence

The project executed a streaming raw audit on temporary official Amazon rating-only 0-core artifacts on 2026-08-26. The temporary raw copies have since been removed; the derived result record, URLs, and checksums remain available.

| Artifact | Project-derived temporary-audit result | Open item |
|---|---|---|
| `All_Beauty` | 693,929 valid rows; 631,986 users; 112,565 items; zero exact duplicate user–item pairs; 93.22% singleton users | Persistent acquisition/manifest and derived strict protocol |
| `Baby_Products` | 5,953,891 valid parsed rows; 3,386,206 users; 217,654 items; 70.01% singleton users; one rating `0.0` | Exact duplicate-pair count, persistent acquisition/manifest, and derived strict protocol |

The exact SHA-256 values, rating distributions, degree summaries, timestamp coverage, and OOV diagnostics are in [`DATASET_AUDIT_RESULTS_en.md`](./DATASET_AUDIT_RESULTS_en.md). The raw schema was verified as `user_id`, `parent_asin`, `rating`, `timestamp`. These are temporary-run findings, not proof that a durable, final benchmark artifact exists.

The provider absolute split was audited only as a diagnostic. Its high OOV coverage means it cannot be silently adopted as the primary strict temporal warm-start task.

## 3. Source and provenance

| Field | Current state |
|---|---|
| Amazon source family | `SOURCE IDENTIFIED` — Amazon Reviews'23 |
| Raw schema/item key | `TEMPORARY AUDIT VERIFIED` — pure ID schema with `parent_asin` |
| Temporary checksums and raw counts | `RECORDED` in the bilingual result record |
| Persistent raw artifact in `Do An` | `ABSENT BY DESIGN` — raw data must be acquired in persistent Colab/project storage before final use |
| Access/usage note | `OPEN` — record the applicable data terms with the persistent acquisition |
| `Baby_Products` duplicate audit | `OPEN` — do not infer it from the provider statement |
| Interaction semantics and split | `OPEN` — freeze before model training |

Canonical sources:

- [Amazon Reviews'23 documentation](https://amazon-reviews-2023.github.io/main.html)
- [0-core processing and statistics](https://amazon-reviews-2023.github.io/data_processing/0core.html)
- [5-core processing and statistics](https://amazon-reviews-2023.github.io/data_processing/5core.html)
- [Official processing README](https://github.com/hyp1231/AmazonReviews2023/blob/main/benchmark_scripts/README.md)
- [All_Beauty 0-core rating-only artifact](https://mcauleylab.ucsd.edu/public_datasets/data/amazon_2023/benchmark/0core/rating_only/All_Beauty.csv.gz)
- [Baby_Products 0-core rating-only artifact](https://mcauleylab.ucsd.edu/public_datasets/data/amazon_2023/benchmark/0core/rating_only/Baby_Products.csv.gz)

The repository MIT license applies to the repository code and scripts; it must not be assumed to license Amazon-derived data. Record the applicable data-access terms with the persistent download.

## 4. Required transformations and controls

1. **Raw validation:** validate schema, missing/invalid fields, duplicates, timestamp ties, rating distribution, degrees, density, connected components, and popularity.
2. **Deterministic duplicate treatment:** quarantine invalid rows and record all retained/removed counts. If repeated pairs exist, use a pre-declared earliest-timestamp rule with stable source-row order for ties.
3. **Interaction semantics:** inspect P4 (`rating >= 4`), P5 (`rating == 5`), and all-observed events. Select the primary positive policy before training based on semantic rationale and retained-graph feasibility, not test metrics. Record treatment of the `0.0` Baby rating.
4. **Strict temporal warm-start task:** select cutoffs before training; build the graph, mappings, filtering, statistics, and sampler features from training positives only; retain validation/test targets only inside the training universe; report exclusions.
5. **Negative and evaluation policy:** sample training negatives only from the training item universe after excluding positives observed at training time. Headline metrics use exact full-catalog ranking over the eligible training-item universe; state the treatment of future positives explicitly.
6. **Scale diagnostic:** log sampled nodes/edges, memory, sampling time, throughput, degree/popularity divergence, head–tail coverage, and connectivity from the training graph.

Provider processing, project interaction semantics, project temporal split, and project training-only filtering must be reported as distinct transformations. Provider 5-core data are a reproducibility setting, not automatically the thesis's strict temporal graph.

## 5. Dataset Gate G2

| Gate | Condition |
|---|---|
| G2-A: provenance | Official source, access note, persistent file, checksum, schema, and manifest complete |
| G2-B: semantics | Duplicate policy, `0.0` treatment, primary positive rule, and negative rule pre-registered |
| G2-C: evaluation validity | Temporal split, training-only graph/filtering, warm-start coverage, OOV exclusions, and exact candidate rule recorded |
| G2-D: primary feasibility | Bounded non-headline execution records retained-graph statistics and pipeline/evaluator feasibility; no tuning, sampler comparison, or final-metric claim |
| G5-S: conditional scale evidence | Actual `Home_and_Kitchen` stress execution occurs only after G3/G4 if the large-scale claim is retained; current work is provenance/size/planning only |
| Optional expansion | MovieLens or Yelp is considered only after the Amazon core gates pass |

## 6. What this protocol does not establish

- It does not freeze `Baby_Products` as the final benchmark.
- It does not establish that all Amazon ratings are implicit positives.
- It does not establish a cold-start capability for a pure-ID model.
- It does not establish model quality, efficiency, scalability, novelty, or superiority.
- It does not select GRAPES, LightGCN, BPR, RL, or GFlowNet as the final thesis method.

## 7. Scientific anchors

The temporal/training-only controls are motivated by [Ji et al., *A Critical Study on Data Leakage in Recommender System Offline Evaluation*](https://arxiv.org/abs/2010.11060). Headline ranking must not substitute sampled candidates for exact full-catalog ranking without disclosure, following [Rendle, *Evaluation Metrics for Item Recommendation under Sampling*](https://arxiv.org/abs/1912.02263). The intended pairwise-ranking control is [BPR](https://arxiv.org/abs/1205.2618); any GNN backbone or sampler remains subject to the final method-design process.

## 8. Next action

Persist the primary Amazon artifact and complete G2-A through G2-C for `Baby_Products`. In parallel, record only provenance and size information for `Home_and_Kitchen`. Do not train a final sampler or claim a benchmark until G2-D is decided.
