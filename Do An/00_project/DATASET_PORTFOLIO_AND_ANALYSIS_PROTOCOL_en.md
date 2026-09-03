# Dataset Portfolio and Analysis Protocol

> **Status:** `PRIMARY DATASET AND PROTOCOL FROZEN — DATASET GATE G2 PASS`
> **Recorded:** 2026-08-26  
> **Updated:** 2026-09-03 — the amended Baby manifest records exact environment metadata, verifies all five artifacts, and replays bounded G2-D with every registered invariant true. Baby G2-A through G2-D and E0-MIN pass. Full `Home_and_Kitchen` execution remains conditional G5-S.
> **Scope:** Independent Master's thesis: *Development of a Graph Sampling Method for Large-Scale Recommender Systems Using Graph Neural Networks (GNNs).*  
> **Claim boundary:** This is a research-design decision record, not an experimental result or a final method specification.

## 1. Questions this protocol must answer

1. Which user–item datasets are semantically valid, reproducible, and sufficiently large for evaluating graph sampling in GNN recommendation?
2. How must each raw dataset be transformed into an implicit-ranking task without using future interactions in graph construction, filtering, or training negatives?
3. Does the proposed sampler preserve ranking quality at a fixed sampling/computation budget while reducing resource cost or improving the accuracy–cost trade-off?
4. Does the conclusion hold on a primary e-commerce graph and on a materially larger graph, rather than only on a convenient pilot dataset?

The method remains `OPEN`. GRAPES is a literature-grounded reference and comparator; it is neither the fixed thesis method nor a result that transfers automatically to recommendation.

### 1.1 What Dataset Gate G2 means

G2 is the **pre-model dataset and evaluation-protocol decision gate**. It must establish which exact bytes are used, what an interaction, anomaly, duplicate, and negative mean, how future information is excluded from the training graph, which warm-start population is evaluated, how exact candidates are formed, and whether the bounded path is executable. Its four parts are G2-A provenance; G2-B interaction/duplicate/negative semantics; G2-C temporal training-only graph, mappings, OOV cohort, and exact candidates; and G2-D bounded non-headline feasibility. G2 does not select the final sampler and cannot produce a recommendation-quality or scalability claim.

## 2. Bounded dataset portfolio

| Role | Dataset and source | Why it is included | Required evidence | Current decision |
|---|---|---|---|---|
| Development/diagnostic only | Amazon Reviews'23 `All_Beauty`, pure-ID 0-core | Existing exact audit; convenient for validating deterministic preprocessing and sampler diagnostics before expensive runs | Exact raw audit already shows 693,929 rows, 631,986 users, 112,565 items, and 93.22% singleton users | **Do not use as primary evidence.** Its singleton rate makes it unsuitable for the main temporal warm-start benchmark. |
| Primary benchmark | Amazon Reviews'23 `Baby_Products` | Product-review domain; timestamped user–item ratings; enough retained scale to test the accuracy–cost trade-off | Raw audit plus full P4 temporal artifact: 3,868,654 training edges, 2,318,308 training users, 162,125 training items; exact OOV ledger/candidates and bounded environment replay | **Primary dataset; G2-A/G2-B/G2-C/G2-D PASS.** |
| Scale-stress candidate | Amazon Reviews'23 `Home_and_Kitchen` | Same source family and semantics as the primary benchmark; the project-verified 0-core artifact contains 66,623,880 rows (1,420,416,432 compressed bytes), while official 5-core metadata report 28.2M interactions, 2.9M users, and 763.6K items | Provenance/schema/row-count audit `EXECUTED`; full protocol and bounded resource experiment remain gated | **Provenance acquired. Required scale stress only if the thesis keeps the “large-scale” claim.** It is not a second exhaustive ablation suite. |
| Optional controlled diagnostic | MovieLens 25M | Stable, timestamped, checksummed research dataset with 25,000,095 ratings from 162,541 users on 62,423 movies | Separate manifest and protocol audit | **Optional.** Use only after the core Amazon evidence is complete; it is not the primary proof of web-scale sparsity. |
| Optional external-domain validation | Yelp Open Dataset | Different local-business domain; official data include reviews and businesses | Separate schema, terms, and protocol audit | **Optional.** Add only if time remains after the Amazon core; it must not delay the central evidence. |

The provisional minimum evidence set is therefore **`Baby_Products` plus one bounded `Home_and_Kitchen` scale stress test**. `All_Beauty` is useful only for development controls. No third full benchmark is planned until the two core datasets pass their gates.

### 2.1 Dataset-role classification criteria

Roles are assigned before downstream model scores are available and answer different research questions:

| Role | Classification criteria | Required processing | Current assignment and rationale |
|---|---|---|---|
| Primary benchmark | Semantics match the thesis task; retained graph is large and structurally nontrivial; a defensible warm-start cohort remains; full preprocessing/evaluation is feasible and reproducible; intended to support headline quality–cost evidence | Full G2-A through G2-D, then matched G3–G5 experiments | `Baby_Products`: millions of events, a materially larger user/item universe than All Beauty, lower singleton burden, and bounded enough for repeated controlled runs |
| Development/diagnostic | Comparable schema/semantics; small enough for fast debugging; exposes edge cases or implementation errors; population is not sufficiently representative for the primary estimand | Full audit and targeted pipeline checks; no second complete headline benchmark required | `All_Beauty`: same source family/schema, but 93.22% raw user singleton rate and extremely low candidate warm-target retention make its primary estimand too narrow |
| Scale stress | Clearly larger than the primary graph; comparable semantics; used to test resource behavior and the boundary of the large-scale claim; costly enough to defer until task/method stability and compute availability | Provenance/size first; bounded G5-S execution only if the thesis retains a large-scale claim | `Home_and_Kitchen`: 66,623,880 rows, about 11.19 times Baby by raw rows; full processing is gated to avoid spending scale-run resources before protocol and method stability |
| Optional external/control | Adds domain or benchmark diversity without being necessary for the core claim and cannot delay mandatory Amazon evidence | Separate audit and targeted experiments only if time remains | MovieLens/Yelp remain optional |

This classification explains the notebook scope. The portfolio-audit notebook covers all three governed Amazon categories; the current full G2-C/G2-D notebook is Baby-only because G2 closes on the primary task. All Beauty may later reuse a parameterized diagnostic path, but that is not required to close G2. Home must not silently run the same full path before the conditional G5-S decision. A role may change only through a recorded gate review using pre-model validity/feasibility evidence; later model scores cannot relabel a dataset retrospectively.

### 2.2 Persistent protocol-audit evidence for `Baby_Products` (recorded 2026-09-02)

The project ran a self-contained Colab notebook (`notebook_revision: self-contained-protocol-audit-v1-2026-09-02`) against the exact downloaded bytes of `Baby_Products` 0-core (SHA-256 `e2a8d0498afed767ee2615db7fac549559d82490b1a73c7241b84b5e9e8c279e`, `audit_config_sha256` `f72e6b62ae5210fb96078024177eb7e6d2bd6d9c0737acafcaea41007b1649e1`) and saved the result as `Baby_Products_protocol_audit.json` in the user's private Google Drive (`retrieved_at` 2026-09-02T11:49:02Z). The JSON's own status is `EXACT_PRE_MODEL_PROTOCOL_AUDIT; NO POLICY SELECTED`, and `post_filter_counts.status = NOT APPLIED`: this is pre-decision diagnostic evidence, not a chosen primary policy, duplicate/`0.0` treatment, or temporal split.

**Duplicates and timestamps.** An exact SQLite pair audit confirms `duplicate_user_item_rows = 0` for all of `Baby_Products` (previously `UNKNOWN`). A separate timestamp audit — measured for the first time in this persistent run — found that 32,050 rows share a timestamp value with at least one other row; this is a shared-timestamp-value count, distinct from the (still zero) duplicate-pair count. One row with `rating = 0.0` (outside the 1–5 range) was quarantined by `anomaly_policy: quarantine_outside_rating_range_1_to_5` before the three semantic snapshots below were computed; this is the quarantine rule used to produce the diagnostic numbers, not yet a final adopted treatment for `0.0`.

**Retention and sparsity by candidate policy** (denominator: 5,953,890 events after quarantine):

| Policy | Retained events | % retained | User singleton rate | Item singleton rate | Bipartite density |
|---|---:|---:|---:|---:|---:|
| `all_observed` (rating 1–5) | 5,953,890 | 100.00% | 70.01% | 31.65% | 8.0783e-06 |
| `P4` (rating ≥ 4) | 4,655,843 | 78.20% | 71.64% | 33.13% | 8.6340e-06 |
| `P5` (rating = 5) | 3,973,866 | 66.74% | 73.18% | 34.34% | 8.8074e-06 |

**OOV and warm-start retention under the candidate absolute split** (provider-style `t1`/`t2` cutoffs — the same candidate cutoffs already recorded in `DATASET_AUDIT_RESULTS_en.md`, `status: CANDIDATE; NOT FROZEN`, not yet the thesis's official split):

| Policy | Test user OOV | Test item OOV | Test warm-start retention | Validation user OOV | Validation item OOV | Validation warm-start retention |
|---|---:|---:|---:|---:|---:|---:|
| `all_observed` | 83.23% | 54.11% | 11.50% | 75.07% | 36.51% | 24.50% |
| `P4` | 85.14% | 54.20% | 9.82% | 77.43% | 36.70% | 21.90% |
| `P5` | 86.22% | 54.25% | 9.21% | 78.88% | 36.75% | 20.34% |

Under all three policies, `training_negative_pool.users_with_zero_available_negatives = 0`: no user in the training universe lacks an available negative item.

**Evidence boundary.** The three snapshots above are inputs to a pre-registered decision, not the decision itself: a policy must not be chosen merely because it has the highest retention or lowest OOV (Section 5, rule 2). These numbers describe only the candidate split/candidate policies on `Baby_Products` 0-core; they do not extend to `Home_and_Kitchen`, `All_Beauty`, or any model/scalability claim. `G2-A` now has checksum, schema, manifest, and `audit_config_sha256` at `VERIFIED` for `Baby_Products`; `license_or_access_note` remains `PARTIAL`/`NEEDS VERIFICATION` because the official pages carry no explicit dataset-wide license grant, so `G2-A` is not yet closed. `G2-B` (duplicate policy, `0.0` treatment, primary P4/P5/all-observed policy, negative rule) now has enough raw evidence to decide but remains `OPEN` because no policy has been pre-registered yet.

### 2.3 Primary interaction-policy decision for `Baby_Products` (2026-09-02)

**Decision:** The primary interaction-positive policy is **`P4` (`rating >= 4`)**. The `rating = 0.0` row (n=1, outside the 1-5 range) is permanently excluded from every snapshot. The duplicate policy keeps the rule pre-registered before results were seen (earliest timestamp, then stable source-row order — currently moot for `Baby_Products` since the duplicate count is confirmed zero). The negative rule keeps the specification pre-registered in Section 4 (training negatives drawn from the training item universe excluding already-known positives; evaluation uses the full eligible item universe, excluding previously observed items).

**Decision process.** Two independent reviewers were assigned different roles: **Fisher** argued from semantics/literature (a positive edge in BPR/GNN training must encode affinity, not "an interaction occurred"; 1-3 star ratings reflect a neutral-to-negative experience and should not count as positive; `P5` wrongly discards valid 4-star positives). **Neyman** argued from feasibility/experimental design (the warm-start test cohort is already scarce under all three policies, 9.2-11.5%; `P5` shrinks that cohort further and threatens the stability of per-popularity-stratum reporting under exact full-catalog ranking; `all_observed` mixes genuine positives with negative experiences, weakening the very premise the sampler is evaluated against). Both independently proposed `P4`. Cross-critique confirmed these are genuinely different arguments converging, not anchoring on the same number — but it also flagged a **methodological limitation**: both reviewers were shown the retention/OOV table *before* reasoning (not fully blind to the evidence), so "independent" here describes the reasoning chains, not an absence of exposure to the numbers. The decision remains valid under the project's "not based on downstream model results" rule because this is a feasibility diagnostic on raw/candidate data, not a model metric, and it was frozen before any temporal graph was built or any model trained.

**Gate status at this decision point:** `G2-A` and `G2-B` = `PASS`. Section 2.4 records the subsequent full G2-C/G2-D execution and review.

### 2.4 Full Baby G2-C/G2-D execution and interpretation (2026-09-02)

The Drive manifest `baby_p4_g2c_manifest.json` (file ID `1sOUhOCFugfATnDrzwnULcaaakRLPCyHu`) was read back together with the folder listing for its five artifacts. All Drive byte sizes match the manifest, the source checksum matches the governed Baby artifact, and the embedded implementation hash matches the local bilingual notebook.

| Evidence | Executed result | Interpretation |
|---|---:|---|
| P4 temporal partition | 3,868,654 train (83.09%); 373,776 validation candidates (8.03%); 413,413 test candidates (8.88%) | The candidate cutoffs create deterministic nonempty later periods without using model results |
| Frozen training graph | 2,318,308 users; 162,125 items; 3,868,654 edges; density `1.0293e-05` | This is the graph available to future models; it is large and very sparse |
| User degree | p50 1, p90 3, p99 9; 71.76% singleton | User activity remains extremely long-tailed, so sampling/coverage analysis must be degree-stratified |
| Item degree | p50 3, p90 32, p99 397, max 21,348; 33.35% singleton | Item popularity is highly concentrated; average degree alone would hide head–tail imbalance |
| Connectivity | 34,288 components; largest component 2,393,587 nodes = 96.50%; zero singleton components | Most retained nodes are message-passing connected through one giant component, while fragmentation still must be reported |
| Validation warm cohort | 81,871/373,776 = 21.90%; 291,905 exclusions reconcile exactly | The primary claim covers only training-known users/items; it does not cover excluded cold-start targets |
| Test warm cohort | 40,587/413,413 = 9.82%; 372,826 exclusions reconcile exactly | Test coverage is narrow but contains a substantial absolute target count; all headline wording must explicitly say warm-start |
| Exact-candidate dry traversal | 100 targets × 162,125 items = 16,212,500 comparisons; 16,209,544 eligible; both invariants true | Chunked full-catalog candidate construction is executable and target-safe for the bounded sample |
| Bounded resources | 1.098 s wall time; 158.24 MiB process peak RSS; chunk size 16,384 | These numbers describe only this traversal, not model runtime, final profiling, or scalability |

Arithmetic review confirms that train + validation + test equals all 4,655,843 P4 events; every warm/excluded ledger and each exclusion-reason sum reconciles; mapping/edge/target artifact row counts match the graph and partition counts; component nodes equal users plus items; and the dry traversal averages 29.56 prior-history removals per tested target.

**Decision:** G2-C and G2-D = `PASS`; therefore Dataset Gate G2 and E0-MIN close on 2026-09-03. The cutoffs `t1 = 1628643414042` and `t2 = 1658002729837`, half-open tie rule, minimum degree 1, training-only mappings, warm-start cohort, and full eligible training-item candidate rule remain frozen. The amended manifest verifies the byte size and SHA-256 of all five artifacts. It records CPython 3.13.15, Linux 6.6.122, Intel Xeon 2 logical CPUs, 12,975.53 MiB RAM, no GPU, Google Colab 1.0.0, and ipykernel 6.17.1. The 100-target replay reproduces 16,212,500 catalog comparisons and 16,209,544 eligible candidates with all four replay invariants true. This establishes reproducible bounded pipeline/evaluator feasibility only; it is not model-quality, comparative profiling, GPU, or scalability evidence.

## 3. Official sources and data meaning

- **Amazon Reviews'23:** use the official [dataset documentation](https://amazon-reviews-2023.github.io/main.html), [0-core processing page](https://amazon-reviews-2023.github.io/data_processing/0core.html), and [5-core processing page](https://amazon-reviews-2023.github.io/data_processing/5core.html). The pure-ID rating-only schema is `user_id`, `parent_asin`, `rating`, `timestamp`; do not substitute variant-level `asin` for `parent_asin`.
- **Amazon role boundary:** a review/rating is an observed explicit-feedback event. It is not evidence of a purchase, click, or implicit positive by itself. The conversion to ranking positives is a project transformation that must be declared before training.
- **MovieLens 25M:** the [official GroupLens release](https://grouplens.org/datasets/movielens/25m/) is stable and provides 25 million ratings, timestamps, a checksum, and a research-use README. It is a strong controlled benchmark but has an activity-selected population and different sparsity from Amazon.
- **Yelp Open Dataset:** the [official Yelp page](https://business.yelp.com/data/resources/open-dataset/) describes an educational-use subset with 6,990,280 reviews and 150,346 businesses. Its business-review semantics and separate terms require an independent audit; it must not be treated as interchangeable with Amazon.

Official Amazon 5-core data are useful for reproducibility comparisons, but provider k-core processing occurs before the published split. It must not be silently described as the thesis's strict temporally filtered training graph.

## 4. Analysis and preprocessing protocol

For every candidate dataset, create an immutable manifest with URL, retrieval date, file size, checksum, access/usage note, schema, source version, preprocessing configuration, and code commit.

1. **Audit raw data.** Validate IDs, ratings, timestamps, duplicates, timestamp ties, row/user/item/pair counts, rating distribution, degree quantiles, singleton rates, density, connected components, and head–tail popularity.
2. **Resolve repeated interactions deterministically.** Quarantine invalid data. If duplicate pairs exist, use a pre-declared deterministic tie-breaker (earliest timestamp, then stable source-row order) and report every removed/retained count. The provider's stated policy is evidence to verify, not a substitute for the audit.
3. **Freeze interaction semantics before model training.** Audit `rating >= 4` (P4), `rating == 5` (P5), and all-observed events. Select one primary policy for semantic and feasibility reasons before results are inspected; run at most one targeted sensitivity analysis. The raw `0.0` Baby rating requires an explicit, recorded treatment.
4. **Create the primary strict temporal warm-start task.** Choose cutoffs before training; construct the graph only from training positives; derive filtering, mappings, degrees, normalization, popularity features, and sampler statistics only from that graph. Retain a validation/test target only when its user and item belong to the frozen training universe, and report all exclusions.
5. **Keep cold-start separate.** OOV users/items are a secondary diagnostic only if the eventual method has a specified cold-start mechanism. A pure-ID embedding model cannot claim cold-start ability.
6. **Define negatives and candidates explicitly.** Training negatives are drawn from the training item universe excluding a user's positives known at the training time. Evaluation ranks the full eligible training-item universe, removing the user's previously observed items. Do not make sampled-candidate metrics the headline result; sampled candidates can change metric rankings across models.
7. **Audit sampling pressure.** On the training graph, log sampling time, sampled users/items/edges, GPU/CPU memory, throughput, degree/popularity divergence, head–tail coverage, connectivity, batch overlap, and inclusion frequency. These show whether the graph actually tests the sampling method.

The raw-audit result that the provider absolute split has high OOV rates is a protocol finding, not a rejection of Amazon. It means that the published split cannot automatically be the primary warm-start protocol.

## 5. Research interpretation guide for the dataset audit

The audit is a sequence of research decisions, not a checklist that converts raw counts directly into dataset acceptance. Every reported statistic must name the **analysis population** to which it applies: (a) raw valid events, (b) events retained by each candidate positive policy, (c) the frozen training graph after training-only filtering, or (d) the warm-start validation/test cohort. Do not compare numbers across these populations as if they described the same graph.

| Audit evidence | Defensible interpretation | Decision it can inform | What it does **not** establish |
|---|---|---|---|
| Invalid IDs, ratings, or timestamps | Measures source/schema conformity and identifies records that need deterministic quarantine | G2-A provenance quality and a recorded invalid-row policy | That all unflagged events are semantically valid positives |
| Repeated user–item pairs and timestamp ties | Shows ambiguity in event identity or ordering; sensitivity depends on how many users/items and temporal targets are affected, not only the row count | Duplicate/tie rule under G2-B and whether a targeted sensitivity check is needed | That repeated reviews are accidental duplicates, or that the provider already resolved them as required by this project |
| Rating distribution and retention under P4/P5/all-observed | Quantifies the semantic and scale consequences of each candidate positive definition | Pre-result selection of the primary interaction policy, using domain meaning and retained feasibility together | That the policy with the largest graph or best later metric is the most valid one |
| User/item degree quantiles, singleton rates, and head–tail concentration | Characterizes sparsity, activity imbalance, and likely sampling pressure; report both sides of the bipartite graph | Whether a warm-start ranking task remains meaningful and which popularity-stratified diagnostics are required | That sparsity alone makes a dataset large-scale, difficult, or favorable to the proposed sampler |
| Density and connected components | Describes graph fragmentation and the reachable structure available to message passing after each transformation | Component handling, isolated-node reporting, and feasibility of the chosen GNN backbone | Recommendation quality, sampler superiority, or effective multi-hop signal |
| Temporal coverage, ties at cutoffs, and activity drift | Tests whether the chosen split represents an ordered prediction task and whether periods differ materially | Cutoff/tie rules, temporal strata, and limitations on generalization across time | Causality or absence of all temporal bias |
| Warm-start retention and user/item OOV exclusions | Quantifies the estimand produced by a pure-ID warm-start protocol and how much of the future cohort is excluded | G2-C acceptance, cohort definition, and the need to narrow claims or add a separate cold-start method | Performance on excluded users/items or the acceptability of hiding a low-coverage cohort |
| Eligible item-universe size and positive/negative exclusions | Defines the ranking task's difficulty and verifies that candidates and negatives obey time and knowledge boundaries | Exact evaluation feasibility and the registered negative/candidate policy | That unobserved items are true negatives, or that sampled-candidate metrics are comparable with full-catalog metrics |
| Retained nodes/edges plus measured evaluator time and memory in the bounded dry-run | Establishes only whether the declared pipeline and evaluator path are executable under the recorded configuration | G2-D feasibility and later compute planning | Model quality, sampler ranking, scalability beyond the tested configuration, or permission to tune at G2-D |
| Sampling-pressure diagnostics on the frozen training graph | Reveals exposure bias, coverage, overlap, and structural distortion introduced by a sampler | Later sampler ablation and accuracy–cost interpretation after the relevant gates pass | A benefit unless it is linked to matched downstream quality and resource evidence |

Apply these interpretation rules:

1. **Use denominators and attrition paths.** Report both counts and rates, with the denominator stated. Reconcile the path from downloaded rows to valid events, semantic positives, training edges, and retained evaluation targets; unexplained loss is a failed audit check.
2. **Do not invent universal pass thresholds.** A high singleton, OOV, tail, or component rate is a warning whose consequence depends on the intended estimand and model. Acceptance criteria must be pre-registered and justified from task validity and compute feasibility, not chosen after observing model results.
3. **Separate source facts, project transformations, and derived findings.** Provider documentation, checksum/schema observations, transformation rules, and computed statistics must be labeled separately. A project-derived count does not verify a provider claim unless the definitions match.
4. **Treat comparisons as descriptive until controlled.** Differences between datasets or P4/P5/all-observed snapshots may reflect semantics, filtering, time coverage, and population composition. They do not isolate a causal effect of scale or sparsity.
5. **Propagate uncertainty and unresolved checks.** Mark incomplete duplicate scans, anomalous records, approximate counts, or unverified source behavior as `OPEN`, `UNKNOWN`, or `NEEDS VERIFICATION`. Do not let downstream tables silently convert them into exact facts.
6. **Match claim scope to the retained cohort.** The primary result may describe only the frozen warm-start population. Cold-start, full raw-population, cross-domain, and large-scale claims require their own evidence; otherwise narrow the thesis wording.
7. **Keep G2 non-comparative.** Audit and the bounded G2-D dry-run may select a valid task and establish feasibility. They must not be used to select the final sampler, tune models, report headline ranking metrics, or claim accuracy/resource improvement.

An audit interpretation is complete only when it records: **observation → analysis population and denominator → plausible protocol consequence → chosen action → excluded inference → gate status**. If more than one action remains scientifically defensible, keep the decision `OPEN` and pre-register the evidence that will resolve it.

## 6. Method and comparison protocol

The thesis evaluates a **project-developed graph sampler** as a module under a matched GNN recommender backbone and a fixed resource budget. The final sampling mechanism is not frozen before literature positioning and ablation.

Minimum comparison family:

- MostPop and BPR-MF as non-GNN references;
- a fixed GNN collaborative-filtering backbone (LightGCN-style is a candidate);
- uniform and degree-aware sampling;
- an established random-walk/subgraph baseline where compatible;
- the GRAPES-informed reference design as a comparator; and
- the project-developed sampler.

All samplers must share the same split, training graph, ranking loss, negative rule, backbone depth/width, optimizer/tuning budget, random seeds, and sampling budget. Report Recall@10/20 and NDCG@10/20 from exact full-catalog ranking, along with peak GPU VRAM, CPU RAM, sampler time, train time, throughput, sampled graph size, seed variation, and accuracy–cost Pareto curves. Report results by item-popularity stratum as well as the aggregate.

## 7. Decision gates

| Gate | Required evidence before proceeding |
|---|---|
| G2-A: provenance | Official source, access note, exact file checksum, schema, and manifest complete |
| G2-B: semantics | Duplicate policy, `0.0` treatment, primary P4/P5/all-observed policy, and negative rule pre-registered |
| G2-C: evaluation validity | Temporal cutoffs, training-only filtering, warm-start coverage, OOV exclusions, and exact evaluation candidates recorded |
| G2-D: primary feasibility | A bounded, explicitly non-headline dry-run records retained-graph statistics and shows that the pipeline/evaluator path is feasible; no tuning or sampler comparison is allowed |
| G5-S: conditional scale evidence | If the thesis retains a large-scale claim, execute one pre-registered bounded `Home_and_Kitchen` scale-stress configuration after G3/G4; before then, only provenance/size/feasibility planning is allowed |
| Optional expansion | MovieLens or Yelp may be added only after the Amazon core gates pass and must not block them |

**Update 2026-09-03:** See Sections 2.2–2.4. Baby G2-A/G2-B/G2-C/G2-D and E0-MIN are `PASS`; Dataset Gate G2 is closed. Home full scale remains conditional G5-S.

## 8. Multi-agent review and adjudication

Two independent reviewers were used, then cross-critiqued each other.

- **Hilbert** (`01a03ed0-ca78-7d92-b83e-92a13469608a`) reviewed dataset roles and source suitability. It preferred `Baby_Products`, `Home_and_Kitchen`, and MovieLens 25M, with Yelp optional.
- **Feynman** (`01a03ed0-ca4d-7c72-a247-301358b176d9`) reviewed leakage-safe preprocessing and experimental validity. It preferred `Baby_Products` as primary, `All_Beauty` for diagnostic work, and Yelp only as optional external validation.

They agreed that raw 0-core `All_Beauty` and the provider absolute split cannot be adopted as primary warm-start evidence without transformation and coverage reporting. They disagreed over whether MovieLens 25M or `Home_and_Kitchen` should be mandatory in twelve weeks. The adjudication is to require the **bounded `Home_and_Kitchen` scale stress test** if the thesis retains a large-scale claim, while keeping MovieLens and Yelp optional. This preserves direct scale evidence without committing to a second full experimental matrix.

## 9. Next action

Baby G2 is frozen from the reviewed full-data artifacts and amended environment-completion record. G3 baseline work may now begin under the shared exact evaluator and matched controls. No sampler conclusion follows from G2; full Home processing remains deferred to conditional G5-S.
