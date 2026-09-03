# Project-Derived Amazon Dataset Audit Results

> **Status:** `RAW AUDIT EXECUTED; DATASET GATE G2 PASSED AFTER G2-C/G2-D REVIEW`
>
> **Execution date:** 2026-08-26
> **Synchronized:** 2026-09-02 — added complete protocol results for `All_Beauty`/`Baby_Products`, the P4 decision, and bounded provenance for `Home_and_Kitchen`; see Section 2a and Section 7.
>
> **Scope:** Official Amazon Reviews'23 pure-ID 0-core rating-only artifacts

## 1. Execution provenance

The two official compressed artifacts were downloaded to a temporary local path solely for analysis. They are not stored as persistent project data. The exact source URLs, compressed byte sizes, and SHA-256 values below are the provenance anchors for this run. The streaming analyzer is [`analyze_amazon_dataset.py`](../scripts/analyze_amazon_dataset.py), and its configuration is represented by the paired audit notebooks.

| Category | Source URL | Compressed bytes | SHA-256 |
|---|---|---:|---|
| `All_Beauty` | [official rating-only artifact](https://mcauleylab.ucsd.edu/public_datasets/data/amazon_2023/benchmark/0core/rating_only/All_Beauty.csv.gz) | 21,954,519 | `54b894e68ad965aa73cdb80d8695c1ed37679c46f38b6f97b21ab0fb585aab24` |
| `Baby_Products` | [official rating-only artifact](https://mcauleylab.ucsd.edu/public_datasets/data/amazon_2023/benchmark/0core/rating_only/Baby_Products.csv.gz) | 148,609,233 | `e2a8d0498afed767ee2615db7fac549559d82490b1a73c7241b84b5e9e8c279e` |

These checksums identify the bytes used in this local run. The project must repeat and record the checksum from the persistent Colab acquisition location before the artifacts become final.

## 2. Raw schema and quality

Both files matched the exact header `user_id,parent_asin,rating,timestamp`. All rows had parseable IDs, ratings, and timestamps. `All_Beauty` had an exact SQLite duplicate-pair audit. The `Baby_Products` duplicate-pair audit was intentionally not completed in the original 2026-08-26 run because the SQLite approach was too slow at that temporary run's scale. A persistent protocol audit on 2026-09-02 (an exact SQLite pair audit on the same checksummed bytes, saved to Google Drive) completed it and confirmed **zero exact duplicate user–item rows** for `Baby_Products`; see Section 2a.

| Measure | `All_Beauty` | `Baby_Products` |
|---|---:|---:|
| Raw rows | 693,929 | 5,953,891 |
| Valid parsed rows | 693,929 | 5,953,891 |
| Unique users | 631,986 | 3,386,206 |
| Unique items (`parent_asin`) | 112,565 | 217,654 |
| Exact unique user–item pairs | 693,929 | 5,953,891 (persistent audit 2026-09-02) |
| Exact duplicate user–item rows | 0 | 0 (persistent audit 2026-09-02) |
| Missing/parse-invalid fields | 0 | 0 |
| Ratings outside expected 1–5 range | 0 | 1 (`rating = 0.0`) |
| Rows sharing a timestamp value | 448 | 32,050 |

The out-of-range Baby row is retained in the raw audit and is not silently discarded. Its handling must be explicitly decided before interaction conversion. The data are treated as `parent_asin`-keyed only because that is the key in the selected pure-ID artifact; raw review files with both `asin` and `parent_asin` must not be mixed into this pipeline.

### 2a. Persistent protocol-audit update (2026-09-02)

A persistent audit run on `Baby_Products_protocol_audit.json` (Google Drive, `sha256` `e2a8d0498afed767ee2615db7fac549559d82490b1a73c7241b84b5e9e8c279e`, `audit_config_sha256` `f72e6b62ae5210fb96078024177eb7e6d2bd6d9c0737acafcaea41007b1649e1`, `retrieved_at` 2026-09-02T11:49:02Z) confirms:

- **Duplicates:** `duplicate_user_item_rows = 0` (exact SQLite pair audit) — replacing the `UNKNOWN` status recorded in Section 2.
- **Timestamp ties:** 32,050 rows share a timestamp value with at least one other row (matches the count already in the table above; now re-measured and confirmed by a persistent, checksummed run).
- **Semantic snapshots** (denominator: 5,953,890 events after quarantining 1 `rating = 0.0` row): `all_observed` retains 100.00% (user singleton rate 70.01%, item singleton rate 31.65%); `P4` (rating ≥ 4) retains 78.20% (user singleton rate 71.64%, item singleton rate 33.13%); `P5` (rating = 5) retains 66.74% (user singleton rate 73.18%, item singleton rate 34.34%).
- **OOV/warm-start under the candidate split** (same `t1`/`t2` as Section 5 below): test-partition user OOV 83.23% / 85.14% / 86.22% and warm-start target retention 11.50% / 9.82% / 9.21% for `all_observed` / `P4` / `P5` respectively.

The full table (including the validation partition) and its interpretation boundary are canonical in [`00_project/DATASET_PORTFOLIO_AND_ANALYSIS_PROTOCOL_en.md`](../../00_project/DATASET_PORTFOLIO_AND_ANALYSIS_PROTOCOL_en.md) Section 2.1; it is not fully duplicated here to avoid two records drifting apart. The JSON's own status is `EXACT_PRE_MODEL_PROTOCOL_AUDIT; NO POLICY SELECTED` — no policy has been chosen yet.

## 3. Degree and sparsity profile

| Statistic | `All_Beauty` | `Baby_Products` |
|---|---:|---:|
| Mean interactions per user | 1.0980 | 1.7583 |
| User degree p50 / p90 / p95 / p99 | 1 / 1 / 2 / 3 | 1 / 3 / 5 / 10 |
| Maximum user degree | 164 | 531 |
| User singletons | 589,163 (93.22%) | 2,370,568 (70.01%) |
| Mean interactions per item | 6.1647 | 27.3548 |
| Item degree p50 / p90 / p95 / p99 | 2 / 11 / 21 / 72 | 3 / 36 / 84 / 450 |
| Maximum item degree | 1,952 | 27,956 |
| Item singletons | 47,947 (42.59%) | 68,888 (31.65%) |
| Binary-edge density | 9.7545e-06 | 8.0783e-06 |

The initial profile is highly sparse and user-singleton dominated. `Baby_Products` has substantially more interaction mass and item degree, but it is still sparse at the user level. This supports its role as a stress-test candidate, not an automatic claim of suitability.

## 4. Rating distribution

| Rating | `All_Beauty` | `Baby_Products` |
|---:|---:|---:|
| 0 | 0 | 1 |
| 1 | 100,862 (14.53%) | 555,424 (9.33%) |
| 2 | 42,594 (6.14%) | 309,591 (5.20%) |
| 3 | 55,704 (8.03%) | 433,032 (7.28%) |
| 4 | 78,579 (11.32%) | 681,977 (11.46%) |
| 5 | 416,190 (59.98%) | 3,973,866 (66.78%) |

Descriptive cumulative counts are:

| Rule | `All_Beauty` | `Baby_Products` |
|---|---:|---:|
| Observed rows with rating ≥ 1 | 693,929 | 5,953,890 |
| Rating ≥ 2 | 593,067 | 5,398,466 |
| Rating ≥ 3 | 550,473 | 5,088,875 |
| Rating ≥ 4 | 494,769 | 4,655,843 |
| Rating = 5 | 416,190 | 3,973,866 |

These counts are sensitivity evidence only. The implicit-positive rule remains open: the project must decide whether every observed interaction or a pre-declared threshold is scientifically appropriate before BPR triplets are generated.

## 5. Candidate absolute-temporal split

The official candidate cutoffs are `t1 = 1628643414042` and `t2 = 1658002729837` milliseconds, with training `< t1`, validation `[t1,t2)`, and test `≥ t2`.

| Category / partition | Rows | Unique users | Unique items | Users not in training | Items not in training |
|---|---:|---:|---:|---:|---:|
| `All_Beauty` train candidate | 583,190 | 534,801 | 95,431 | 0 | 0 |
| `All_Beauty` validation candidate | 71,784 | 68,386 | 24,730 | 63,008 (92.14%) | 12,210 (49.37%) |
| `All_Beauty` test candidate | 38,955 | 36,953 | 12,226 | 34,851 (94.31%) | 7,052 (57.68%) |
| `Baby_Products` train candidate | 4,886,113 | 2,789,765 | 180,415 | 0 | 0 |
| `Baby_Products` validation candidate | 517,373 | 401,145 | 49,390 | 301,130 (75.07%) | 18,032 (36.51%) |
| `Baby_Products` test candidate | 550,405 | 383,264 | 50,190 | 318,972 (83.23%) | 27,156 (54.11%) |

The published absolute split is therefore not directly compatible with the current warm-start specification. It may still be useful as a cold-start diagnostic, but adopting it as the primary protocol would require a clearly documented cold-start task or an explicit, pre-registered training-universe exclusion rule. The project must not remove these OOV interactions after inspecting test performance.

## 6. Negative-pool diagnostic

Using the observed row degree, the minimum and median candidate-item pool sizes are:

| Category | Minimum available items | Median available items | Interpretation |
|---|---:|---:|---|
| `All_Beauty` | 112,401 | 112,564 | Exact for this run because duplicate-pair count is zero |
| `Baby_Products` | 217,123 | 217,653 | Exact, since the duplicate-pair count is now confirmed zero (persistent audit 2026-09-02) |

This diagnostic does not freeze the negative policy. Negative validity must be checked against the declared positive universe, and the project must decide whether future validation/test positives are excluded from training-negative pools. The same triplets, negative items, and RNG protocol must be used when comparing baseline and learned samplers.

## 7. Conclusions and open decisions

1. `All_Beauty` is suitable for pipeline and schema validation, but its singleton rate and candidate temporal OOV make it unsuitable as primary recommendation evidence under the current warm-start design.
2. `Baby_Products` is the primary benchmark candidate; its exact duplicate-pair audit is closed (`VERIFIED 0`) and P4 (`rating >= 4`) is the selected primary interaction policy. Warm-start OOV remains high and must be reconciled in G2-C.
3. The official absolute split cannot be adopted as the primary warm-start split without a documented protocol revision.
4. P4, quarantine of the single `rating = 0.0` row, the deterministic duplicate fallback, and the negative rule are recorded decisions. Subsequent full temporal-graph and bounded-environment evidence closed Baby G2-A through G2-D on 2026-09-03; see the G2-C/G2-D execution guide and manifest.
5. `Home_and_Kitchen` provenance is executed: 1,420,416,432 compressed bytes, 66,623,880 rows, valid four-column schema, and SHA-256 `9be4e2dc8b3dc513c02521644b2ae55f722b2941767e539dcfe518f6bdd4f70b`. Full protocol and scale stress remain unexecuted.
6. No model was trained and no recommendation-quality, memory, runtime, or scalability claim follows from this audit.

## 8. Evidence sources

- [Amazon Reviews'23 project page](https://amazon-reviews-2023.github.io/main.html)
- [Amazon Reviews'23 0-core processing/statistics](https://amazon-reviews-2023.github.io/data_processing/0core.html)
- [Official benchmark processing README](https://github.com/hyp1231/AmazonReviews2023/blob/main/benchmark_scripts/README.md)
- [Amazon Reviews'23 dataset paper](https://arxiv.org/abs/2403.03952)
- [Recommender evaluation leakage study](https://arxiv.org/abs/2010.11060)
- [Sampled-metric analysis](https://arxiv.org/abs/1912.02263)
