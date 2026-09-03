# Dataset Audit and Acceptance Protocol

> **Status:** `PERSISTENT RAW AUDIT EXECUTED — DATASET GATE G2 PASS`
> **Recorded:** 2026-09-02
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

The project re-executed the exact streaming raw audit on official Amazon rating-only 0-core artifacts and persisted both raw `.csv.gz` objects and JSON manifests in the private Google Drive folder `Phase2_Amazon_Audit` on 2026-09-02.

| Artifact | Project-derived persistent-audit result | Open item |
|---|---|---|
| `All_Beauty` | 693,929 valid rows; 631,986 users; 112,565 items; zero exact duplicate user–item rows; 93.22% singleton users; 448 rows participating in timestamp ties | Complete G2-A metadata and derived strict protocol |
| `Baby_Products` | 5,953,891 valid parsed rows; 3,386,206 users; 217,654 items; zero exact duplicate user–item rows; 70.01% singleton users; one rating `0.0` | Exact timestamp-tie audit, complete G2-A metadata, and derived strict protocol |

The persistent hashes are `54b894e68ad965aa73cdb80d8695c1ed37679c46f38b6f97b21ab0fb585aab24` for `All_Beauty` and `e2a8d0498afed767ee2615db7fac549559d82490b1a73c7241b84b5e9e8c279e` for `Baby_Products`. The raw schema was verified as `user_id`, `parent_asin`, `rating`, `timestamp`. The earlier [`DATASET_AUDIT_RESULTS_en.md`](./DATASET_AUDIT_RESULTS_en.md) must be synchronized before it is treated as the current numerical record. Persistent raw evidence exists, but the final transformed benchmark does not.

The provider absolute split was audited only as a diagnostic. Its high OOV coverage means it cannot be silently adopted as the primary strict temporal warm-start task.

## 3. Source and provenance

| Field | Current state |
|---|---|
| Amazon source family | `SOURCE IDENTIFIED` — Amazon Reviews'23 |
| Raw schema/item key | `PERSISTENT AUDIT VERIFIED` — pure ID schema with `parent_asin` |
| Persistent checksums and raw counts | `RECORDED` in private Drive JSON manifests; local result summary needs synchronization |
| Persistent raw artifact | `PRESENT IN PRIVATE GOOGLE DRIVE` — raw `.csv.gz` objects retained outside Git |
| Access/usage note | `PARTIAL` — official pages identify McAuley Lab, citation, fields, and downloads; no dataset-wide license grant was found there, so repository MIT terms are not attributed to the data |
| `Baby_Products` duplicate audit | `VERIFIED: 0` repeated rows under `(user_id, parent_asin)` |
| `Baby_Products` timestamp-tie audit | `OPEN` — exact counting was disabled in the persistent run |
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

### One-run evidence package

Each paired `01_amazon_dataset_audit_*` notebook is now self-contained: it embeds the complete analyzer and does not call or require a separate `.py` file. After Drive is mounted, **Run all** processes three Amazon portfolio jobs in sequence. `All_Beauty` and `Baby_Products` receive the full protocol audit; valid existing outputs are reused unless `FORCE_RERUN = True`. `Home_and_Kitchen` receives only a bounded low-memory provenance/schema/row-count audit; its full scale stress remains gated by G5-S. The notebook also writes `dataset_portfolio_audit_index.json`. Each full protocol result contains:

- exact duplicate-pair and timestamp-tie counts;
- quarantine accounting for ratings outside `[1, 5]`;
- deterministic earliest-timestamp/stable-row de-duplication;
- all-observed, P4, and P5 semantic snapshots;
- per-snapshot degrees, singleton rates, density, temporal partitions, user/item OOV, warm-start target retention, training negative availability, and exact full-catalog candidate-count diagnostics; and
- artifact SHA-256, audit-configuration SHA-256, embedded audit-logic SHA-256, notebook revision, retrieval metadata, and the access note.

The notebook uses a temporary SQLite database beside the cached artifact and deletes it after the JSON is complete. Disk space must cover the compressed source plus the temporary event tables and indexes. A failed or interrupted run may leave the temporary `.protocol_audit.sqlite` file for diagnosis; a new run replaces it. The three snapshots are evidence for choosing a policy, not three model experiments, and the notebook deliberately does not select the primary policy.

The first self-contained Baby run completed on 2026-09-02. Its original output recorded the source URL with an unexpanded `{DATASET_NAME}` placeholder while reading the correct persistent `Baby_Products.csv.gz` bytes. The output and notebook were corrected transparently: category, byte size, and SHA-256 already identified the artifact, all numerical results were left unchanged, and the JSON now includes a `provenance_correction` record.

The first portfolio run completed the two full protocol jobs but received HTTP 404 for `Home_and_Kitchen` because a partial mirror URL was extrapolated beyond the files verified there. The notebook now uses the exact host/path exposed by the official 0-core download link, `https://mcauleylab.ucsd.edu/public_datasets/data/...`, and records a `DOWNLOAD_FAILED` job while still writing the portfolio index if a future acquisition fails.

The corrected rerun completed all three governed jobs and wrote the portfolio index. `Home_and_Kitchen` provenance records 1,420,416,432 compressed bytes, 66,623,880 rows, the expected four-column schema, and SHA-256 `9be4e2dc8b3dc513c02521644b2ae55f722b2941767e539dcfe518f6bdd4f70b`. These are exact-byte/source facts only; the full protocol and scale-stress measurements remain unexecuted.

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

The subsequent Baby P4 temporal graph and bounded environment replay completed these steps; G2-A through G2-D now pass. Proceed to the shared G3 evaluator/baselines without treating any G2 measurement as a model benchmark.
