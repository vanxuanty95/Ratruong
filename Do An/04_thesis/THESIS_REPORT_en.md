# Development of a Graph Sampling Method for Large-Scale Recommender Systems Using Graph Neural Networks

> **Status:** `CUMULATIVE WORKING THESIS — METHOD DEVELOPMENT, DATA AUDIT, AND RESEARCH PLAN`  
> **Last updated:** 2026-09-03
> **Phase 2 identity:** Independent Master's thesis; GRAPES is a scientific reference, not the pre-fixed thesis method  
> **Evidence boundary:** G1 passes with a frozen research question, closest-work boundary, candidate family, matched comparison, and validation-only selection/no-selection rule. Baby G2-A through G2-D and E0-MIN pass after the amended Drive manifest verified all artifacts, recorded the CPU/Colab environment, and reproduced the bounded traversal counts. No Phase 2 PyTorch/PyG model, recommendation result, final profiling, or scalability result exists.

This document is the English working thesis report. It is intentionally a living artifact: verified implementation, execution, and validation evidence will replace planned statements as the research progresses. The Vietnamese counterpart is [`THESIS_REPORT_vn.md`](./THESIS_REPORT_vn.md).

## 1. Executive summary

Large graph neural networks can require information from increasingly large multi-hop neighborhoods. The thesis develops and evaluates a graph-sampling method for large-scale GNN-based recommendation on a user–item graph. Phase 1 studied GRAPES, an existing learned-sampling method for node classification; it provides historical context and candidate mechanisms only.

The current GRAPES-informed reference design explores a sampler GNN, Gumbel Top-k selection, and policy-learning objectives alongside a LightGCN-style recommender and Bayesian Personalized Ranking (BPR). These are candidate components—not the final method by default. The final method will be defined through literature positioning, method rationale, data/protocol constraints, controlled comparisons, and ablations. A dependency-free scaffold tests a subset of reference contracts on toy inputs; no final Phase 2 method has yet been implemented or tested.

The current project state provides a controlled research foundation rather than a model-performance result. G1 freezes a testable question, representative closest-work position, candidate mechanisms, matched comparison, and a rule that may select no learned method. Persistent portfolio audits, the full Baby P4 temporal graph, and bounded environment replay have executed; G2 and E0-MIN pass. The shared baseline path, sampler selection/implementation, final GPU lock, and performance evaluation remain open.

## 2. Scope and motivation

### 2.1 Phase 1 to Phase 2 boundary

Phase 1 selected/explored the topic through study and partial reproduction of GRAPES for node classification. Its official submitted presentation is a read-only historical reference. Phase 2 is the official thesis; it does not treat Phase 1 as a thesis chapter, as a source of recommendation results, or as a fixed implementation blueprint.

The thesis remains focused on developing graph sampling for large-scale GNN recommendation. Candidate mechanisms may be adopted, modified, or rejected based on evidence. Negative or null findings remain valid results, but they do not justify changing claims after inspecting outcomes.

### 2.2 Problem statement

In a user–item graph, graph collaborative filtering can benefit from multi-hop interactions but may become expensive when sampled neighborhoods grow. Uniform or static sampling can discard nodes that are useful for a particular recommendation target. The research problem is to develop and rigorously evaluate a graph-sampling method that can select useful computation-graph context for scalable recommendation, while measuring both recommendation quality and resource cost.

The thesis does not assume that any candidate sampling mechanism improves recommendation. It asks whether a carefully controlled project-developed method can be defined, implemented, and evaluated without conflating sampling effects with data, negative-sampling, inference, or hardware differences.

## 3. Research questions and hypotheses — G1 frozen

### 3.1 Primary research question

> On the frozen, leakage-safe Amazon Baby P4 warm-start task, and at the same declared layer-wise sampling budget, can a task-conditioned sampler produce a better exact full-catalog NDCG@20–resource trade-off than matched uniform and degree-aware sampling with the same LightGCN-style recommender?

### 3.2 Secondary questions

1. Does the trade-off change across small, medium, and large per-layer budgets?
2. Does task conditioning improve tail-user or tail-item ranking without hiding a head-cohort loss?
3. What sampler time, memory, instability, and failure risk accompany each learned mechanism?
4. Which mechanism survives controlled development comparison strongly enough to justify G4 and final evaluation?

### 3.3 Hypotheses

The following are `HYPOTHESIS` statements, not results:

- **H1:** At at least one predeclared budget, a valid task-conditioned candidate has positive paired NDCG@20 change against the best matched static control.
- **H2:** At at least one budget, a task-conditioned candidate is non-dominated by static controls over validation NDCG@20, peak GPU memory, and epoch wall time.
- **H3:** Any quality benefit is larger at tighter budgets than at the largest budget; the budget-by-method interaction is reported even if it contradicts this expectation.
- **H4:** Aggregate gain does not conceal a negative paired change in the predeclared tail cohort; head, middle, and tail effects are reported separately.
- **H5:** Learned sampling has non-zero overhead, so quality without sampler/propagation time, memory, throughput, and failure evidence is insufficient.

The full estimand, negative-outcome rule, candidate family, and validation-only Pareto selection rule are frozen in the [`G1_RESEARCH_DESIGN_en.md`](../00_project/G1_RESEARCH_DESIGN_en.md) decision record. Passing G1 does not select a sampler; selection still waits for G2, E0-MIN, and G3.

## 4. Background and related work

| Source | Relevance to this thesis | Evidence status and boundary |
|---|---|---|
| GRAPES, arXiv:2310.03399v3 | Formal source for layer-wise learned sampling, Gumbel Top-k, REINFORCE, GFlowNet/Trajectory Balance, and sampled computation graphs | `VERIFIED PRIMARY SOURCE`; recommendation is an adaptation target, not a completed evaluation in Phase 1 |
| BPR, arXiv:1205.2618 | Pairwise ranking loss and implicit-feedback triplets | `VERIFIED PRIMARY SOURCE`; does not specify GRAPES sampling |
| LightGCN, arXiv:2002.02126 | Graph collaborative-filtering propagation, layer aggregation, and dot-product recommendation score | `VERIFIED PRIMARY SOURCE`; sampled block semantics require an explicit adaptation contract |
| GraphSAGE; FastGCN; AS-GCN; LADIES | Node-wise, layer-wise, importance, and adaptive sampling foundations | `VERIFIED PRIMARY SOURCES`; mainly node-classification/general-graph settings rather than temporal full-catalog recommendation |
| Cluster-GCN; GraphSAINT | Cluster/subgraph sampling and normalization alternatives | `VERIFIED PRIMARY SOURCES`; different minibatch intervention from this thesis's primary exact-k layer-wise question |
| PinSage, arXiv:1806.01973 | Scalable graph-recommendation and sampling context | `VERIFIED PRIMARY SOURCE`; heuristic item–board sampling, not the matched plain bipartite task here |
| DSKReG, arXiv:2108.11883 | Learned sampling in knowledge-graph recommendation | `VERIFIED PRIMARY SOURCE`; prevents a “first learned sampler for recommendation” claim |
| Data-driven GraphSAGE; SubMix | Learned RL neighbor sampling and trainable heuristic mixtures | `VERIFIED PRIMARY SOURCES`; closest mechanism warnings outside this recommendation protocol |
| Recommender leakage study, arXiv:2010.11060 | Supports temporal and training-only preprocessing controls | `VERIFIED PRIMARY SOURCE ANCHOR`; exact Amazon protocol remains to be frozen |
| Sampled-metric analysis, arXiv:1912.02263 | Supports exact full-catalog ranking for the primary evaluation | `VERIFIED PRIMARY SOURCE ANCHOR`; final feasibility depends on measured scale |

The targeted G1 review is representative rather than exhaustive. It supports a narrow position: if evidence succeeds, the contribution is a project-owned task-conditioned sampler and controlled evidence for plain implicit bipartite recommendation under exact full-catalog ranking and matched resource measurement. It does not support a “first learned sampler for recommendation” claim.

## 5. Phase 1 evidence and source governance

The Phase 1 presentation motivates scalable GNN training, distinguishes neighbor explosion from oversmoothing and oversquashing, surveys sampling/decoupling/historical-embedding families, and presents GRAPES for node classification. Its visible reproduction evidence covers Cora, CiteSeer, ogbn-arxiv, and an incomplete large-graph run under a different Colab environment. These are Phase 1 historical evidence, not Phase 2 recommendation results.

The Phase 2 source order is:

1. project scope and scientific rules;
2. GRAPES arXiv:2310.03399v3 for formal semantics;
3. official GRAPES repository commit `71ecebeaac896800aa4dd1d0f38c57ec222ef396` for implementation evidence;
4. the Phase 1 local snapshot and notebook for historical provenance only;
5. BPR and LightGCN primary papers for recommendation semantics.

The exact original Phase 1 Git commit is not recoverable from the available local artifacts. The local snapshot is preserved with a content fingerprint and must not be treated as an exact version identifier. Paper/code discrepancies are recorded rather than silently resolved in favor of an implementation that might produce a better empirical result.

## 6. Current GRAPES-informed reference design

This section records a candidate reference design, not the final thesis method. Its components can be re-adopted only with literature-backed rationale and verification; it does not claim implementation.

### 6.1 Training graph and BPR batch

Let

```text
G_train = (U ∪ I, E_train)
```

be a user–item bipartite graph containing only training-period positive interactions. User and item ID spaces are disjoint; items use an explicit offset. A batch is an ordered multiset of BPR triplets:

```text
B = [(u_b, i_b+, i_b−)] for b = 1,...,M.
```

The initial target set is the unique union of every endpoint in the triplets:

```text
V⁰ = unique({u_b, i_b+, i_b− for every triplet in B})
K⁰ = V⁰.
```

Deduplication changes the graph target set but must preserve triplet ordering, multiplicity, and the mapping needed to gather user, positive-item, and negative-item embeddings.

### 6.2 Layer-wise learned sampling

For layer `l`, the candidate set is:

```text
Cˡ = N_Ework(Kˡ⁻¹) \ Kˡ⁻¹
n_l = |Cˡ|
k_l_effective = min(k_l, n_l).
```

Gumbel Top-k selects up to `k_l` distinct candidates without replacement. The formal set contract is:

```text
Vˡ = GumbelTopK(p_phi(Cˡ), k_l)
Kˡ = V⁰ ∪ Vˡ.
```

The set is not a cumulative union of all previous sampled nodes. Sampling expands outward, while the recommender propagates messages through layer-dependent blocks from source `Kˡ` to destination `Kˡ⁻¹`. Cross-layer node re-entry is allowed by the specification.

### 6.3 Sampled recommender and loss

The classifier GNN in GRAPES is replaced by a LightGCN-style recommender. The sampled implementation must preserve the same layer count and combination coefficients across methods and must not add recommender self-loops, feature transformations, or nonlinearities to the primary sampled variant.

The recommendation score and primary task loss are:

```text
s(u, i) = z_uᵀ z_i

L_BPR = −mean log sigmoid(s(u, i+) − s(u, i−)) + regularization.
```

The primary direct-policy reward is proportional to:

```text
R(S, B) = exp(−alpha * L_BPR(S, B)).
```

The ranking signal is detached when used to update a reference sampler. Two learned reference variants may be examined: `GRAPES-RL-Rec` using REINFORCE and `GRAPES-GFN-Rec` using the GRAPES Trajectory Balance formulation. Their gradient direction, likelihood, normalizer conditioning, and credit-assignment semantics are protected by the registered reference oracles. Neither variant is preselected as the final thesis method.

### 6.4 Training and inference boundary

Training uses the sampler to construct a layered graph and the recommender to compute BPR loss on the same triplets. Recommender and sampler updates are separated and logged. Random-Sampling-Rec and Degree-Sampling-Rec must use matched budgets, triplets, negatives, data split, backbone, and optimization search budget.

Primary inference is common deterministic full-graph LightGCN propagation followed by chunked full-catalog ranking. Test interactions are not inserted into the training graph. Consequently, the thesis may claim sampled-training behavior if supported by measurements, but may not claim sampled-inference scalability from this protocol.

## 7. Proposed experimental plan — protocol incomplete

### 7.1 Dataset scope

The evidence portfolio is deliberately bounded. `Baby_Products` is the frozen primary Amazon dataset; `Home_and_Kitchen` is a required *bounded scale-stress test* if the thesis retains its large-scale claim. `All_Beauty` is development/diagnostic only, not primary evidence. MovieLens 25M and Yelp Open Dataset are optional additions after the Amazon core is complete; they must not delay the central experiment. Dataset Gate G2 is closed; optional roles remain conditional.

The paired decision record, sources, exact audit questions, preprocessing sequence, comparison rules, and gates are in [`DATASET_PORTFOLIO_AND_ANALYSIS_PROTOCOL_en.md`](../00_project/DATASET_PORTFOLIO_AND_ANALYSIS_PROTOCOL_en.md). In particular, the official Amazon 5-core data are a reproducibility reference, not automatically the thesis's strict temporal training graph.

### 7.1.1 What G2 is and how dataset roles are classified

Dataset Gate **G2** is the pre-model decision gate for the dataset and evaluation protocol. G2-A identifies and traces the exact source bytes; G2-B fixes interaction, anomaly, duplicate, and negative semantics; G2-C constructs the temporal graph and mappings from training information only, defines the warm-start/OOV cohort, and fixes exact candidates; G2-D checks a bounded execution path without training or comparing recommenders. G2 answers whether the task is scientifically defined and executable. It does not answer which sampler is best, whether recommendation quality is high, or whether the method scales beyond the tested setting.

Dataset roles are assigned before model scores using five criteria: semantic fit to the thesis task; retained graph size and structural difficulty; defensible warm-start coverage; reproducible processing and compute feasibility; and the research claim the dataset is intended to support. A **primary benchmark** must satisfy all five strongly enough for headline quality–cost evidence. A **development/diagnostic dataset** should be comparable and cheap enough for debugging but may have a population too narrow for the main estimand. A **scale-stress dataset** must be materially larger and is used to test resource limits only after the task and method are stable. Optional controls add diversity but cannot delay the core evidence.

Applying those criteria, `Baby_Products` is primary; `All_Beauty` is diagnostic because its 93.22% raw user-singleton rate and very low candidate warm-target retention create an extremely narrow primary cohort; and `Home_and_Kitchen` is scale stress because its 66,623,880 raw rows are about 11.19 times Baby and make premature full runs expensive. Therefore the portfolio-audit notebook covers all three categories, but the current complete G2-C/G2-D notebook is intentionally Baby-only. All Beauty may later reuse the path for targeted diagnostics; full Home execution waits for conditional G5-S. Roles may change only by recorded pre-model validity/feasibility review, never because a later model obtains a favorable score.

### 7.1.2 Why these datasets were selected

Amazon Reviews'23 is selected because the thesis studies graph sampling for recommendation and therefore needs timestamped user–item interactions that can be represented as a large bipartite graph. The pure-ID 0-core release preserves the sparse long tail instead of imposing a provider-side k-core population before the project defines its own training-only transformation. It also supplies rating values for testing alternative implicit-positive semantics and timestamps for temporal evaluation.

`Baby_Products` is the primary candidate because it combines a product-review domain, millions of events, more than three million users, and substantial degree imbalance. This scale is large enough to expose graph-construction and sampling pressure while remaining more bounded than the largest Amazon categories. `All_Beauty` is retained as a development control because it has the same schema and source family but is smaller; its very high singleton rate prevents it from serving as the main warm-start evidence. `Home_and_Kitchen` is reserved for a bounded scale-stress experiment if the thesis retains the large-scale claim. Dataset selection is thus role-based rather than based on which dataset later produces the best model score.

### 7.1.3 Purpose and method of the audit

The audit is a pre-model research method. Its purpose is to determine whether the downloaded bytes are reproducible, whether their semantics can support the intended recommendation task, what population would remain after a leakage-safe temporal transformation, and whether the resulting graph is capable of testing a sampling method. It prevents source errors, hidden filtering, future-information leakage, undefined negatives, and an evaluation cohort that a pure-ID model cannot represent.

The project uses an **exact streaming descriptive audit with a candidate temporal-split diagnostic**. Rows are parsed sequentially so the full compressed source can be examined without loading the whole table into RAM. Exact counters and persistent keyed state are used where necessary for IDs, user–item pairs, degrees, and split membership. The audit is deterministic and records the source URL, retrieval time, compressed size, SHA-256, schema, anomaly counts, rating distribution, degree distribution, duplicate pairs, timestamp diagnostics, and candidate-split OOV coverage.

This method differs from related alternatives in important ways:

- Provider metadata is useful for provenance but contains rounded aggregate claims; the project audit derives exact counts from the acquired bytes and verifies rather than assumes provider behavior.
- Exploratory in-memory analysis is convenient but may exceed RAM or silently use a sample; streaming analysis covers every row with bounded working memory, although exact high-cardinality checks can still require disk-backed state.
- Random sampling or approximate sketches reduce cost but introduce estimation error, so they are unsuitable for checksum, anomaly, duplicate, and gate-closing counts unless approximation is explicitly declared.
- Provider 5-core or global pre-filtering creates a denser population but can use future activity before the temporal split. The project first audits 0-core raw events and will apply filtering from training positives only.
- Model evaluation answers whether a trained recommender ranks items well. Dataset audit instead answers whether the task, cohort, graph, and evidence are valid; it cannot establish NDCG, Recall, sampler superiority, or scalability.

The principal audit indicators are defined as follows:

| Indicator | Definition and research meaning |
|---|---|
| Valid-row rate | Parsed rows satisfying required ID, rating, and timestamp constraints divided by all rows; measures schema conformity, not positive-feedback validity |
| Duplicate-pair rate | Rows beyond the first occurrence of the same `(user_id, parent_asin)` divided by valid rows; detects repeated-pair ambiguity requiring a deterministic policy |
| P4/P5 retention | Rows with `rating >= 4` or `rating == 5`, divided by valid rows; measures the scale consequence of candidate implicit-positive semantics |
| User/item degree | Number of retained incident interactions per user/item; quantiles, mean, maximum, and singleton rate describe bipartite sparsity and head–tail imbalance |
| Singleton rate | Nodes of the relevant type with degree one divided by all nodes of that type; indicates how much of the population has insufficient history for common warm-start splitting |
| Bipartite density | `|E| / (|U| × |I|)` when each valid pair is treated as one edge; describes occupancy but does not by itself prove difficulty or scale |
| OOV rate | Validation/test users or items absent from the training universe divided by the corresponding unique validation/test users or items; measures cohort incompatibility with pure-ID warm-start evaluation |
| Warm-start retention | Evaluation targets whose user and item both occur in the frozen training universe divided by all candidate targets; defines the retained estimand and must accompany OOV reporting |
| Timestamp-tie count | Rows participating in shared timestamp values at a declared resolution; identifies ambiguity at temporal cutoffs and the need for a stable tie rule |
| Provenance identity | Exact URL, retrieval time, byte size, and SHA-256; establishes which artifact was analyzed, not whether its scientific semantics are correct |

### 7.1.4 Project-derived audit results and interpretation

Persistent JSON manifests were written to Google Drive on 2026-09-02 from exact downloaded bytes. `All_Beauty` has SHA-256 `54b894e68ad965aa73cdb80d8695c1ed37679c46f38b6f97b21ab0fb585aab24`; `Baby_Products` has SHA-256 `e2a8d0498afed767ee2615db7fac549559d82490b1a73c7241b84b5e9e8c279e`. These hashes identify the audited artifacts. G2-A still requires a complete access/usage note, source version, preprocessing configuration, and code commit in the immutable manifest.

| Finding | `All_Beauty` | `Baby_Products` | Research interpretation |
|---|---:|---:|---|
| Valid rows | 693,929 | 5,953,891 | Exact acquired-byte counts agree with the expected source scale; neither file has missing required IDs or invalid timestamps |
| Unique users / items | 631,986 / 112,565 | 3,386,206 / 217,654 | `Baby_Products` supplies the materially larger primary graph; raw size alone does not close G2 |
| Exact repeated user–item rows | 0 | 0 | The acquired releases already contain one row per user–item pair under the audited key; a deterministic policy must still be recorded for reproducibility |
| Rating anomaly | none | one `0.0` row | The Baby anomaly is negligible in frequency but is a schema/semantic exception that must be quarantined or handled by a pre-registered rule |
| P4 / P5 retained rows | 494,769 / 416,190 | 4,655,843 / 3,973,866 | Both semantics retain substantial event counts; choosing P4 versus P5 must follow feedback meaning and post-filter feasibility, not downstream scores |
| User singleton rate | 93.22% | 70.01% | Most users have too little raw history for ordinary warm-start temporal evaluation; this rules out `All_Beauty` as primary evidence and requires explicit retention reporting for Baby |
| Item singleton rate | 42.59% | 31.65% | A large item tail exists on both graphs, creating a meaningful coverage and sampling-bias diagnostic |
| User degree p50 / p90 / p99 | 1 / 1 / 3 | 1 / 3 / 10 | Activity is strongly long-tailed, particularly on the user side; aggregate averages would hide the dominant low-degree population |
| Item degree p50 / p90 / p99 | 2 / 11 / 72 | 3 / 36 / 450 | Item popularity is highly concentrated, so later sampler analysis must report head–tail exposure rather than aggregate accuracy alone |
| Candidate validation user OOV | 63,008/68,386 = 92.14% | 301,130/401,145 = 75.07% | The provider absolute split is incompatible with direct pure-ID warm-start evaluation for most validation users |
| Candidate test user OOV | 34,851/36,953 = 94.31% | 318,972/383,264 = 83.23% | The same incompatibility persists or increases at test time; reporting only retained users would otherwise conceal severe cohort attrition |
| Candidate validation/test item OOV | 49.37% / 57.68% | 36.51% / 54.11% | Future partitions also contain many unseen items; the primary pure-ID task must exclude and report them or introduce a separate cold-start mechanism |
| Timestamp-tie audit | 448 participating rows | 32,050 participating rows; zero rows exactly at either candidate cutoff | Shared timestamps exist, but the current candidate cutoffs do not split an exact timestamp value; a deterministic tie rule is still required for any later cutoff change |

The complete `Baby_Products` protocol run quarantined the single `0.0` row, leaving 5,953,890 clean events, and produced the following controlled semantic comparison:

| Pre-model policy | Events retained | Users / items | User / item singleton rate | Training item universe | Validation warm-target retention | Test warm-target retention |
|---|---:|---:|---:|---:|---:|---:|
| All observed ratings in `[1,5]` | 5,953,890 (100.00%) | 3,386,206 / 217,654 | 70.01% / 31.65% | 180,415 | 126,760 / 517,373 = 24.50% | 63,287 / 550,405 = 11.50% |
| P4: `rating >= 4` | 4,655,843 (78.20%) | 2,769,312 / 194,722 | 71.64% / 33.13% | 162,125 | 81,871 / 373,776 = 21.90% | 40,587 / 413,413 = 9.82% |
| P5: `rating == 5` | 3,973,866 (66.74%) | 2,476,012 / 182,226 | 73.18% / 34.34% | 151,490 | 66,409 / 326,444 = 20.34% | 32,810 / 356,303 = 9.21% |

This comparison shows a monotonic feasibility cost as the positive definition becomes stricter: P4 discards 21.80% of clean events and P5 discards 33.26%; user singleton rates rise and warm-target retention falls. All-observed has the strongest coverage, but treating ratings 1–2 as positive preference would change the intended implicit-feedback meaning and is therefore not justified by coverage alone. P5 is semantically strict but loses another 681,977 events relative to P4 and produces the weakest warm-start cohort. Following the independent semantic and feasibility reviews recorded in the canonical protocol, **P4 is selected and frozen as the primary interaction policy**, with P5 reserved as a possible sensitivity analysis. This closes G2-B for `Baby_Products`; it is a data/task decision, not a model-performance finding.

For all three snapshots, every training user has at least one eligible negative under the audited training-item-universe rule. The minimum available negative counts are 180,057, 161,785, and 151,176 respectively, and the median is one below the relevant catalog size. This demonstrates that negative generation is numerically feasible under the candidate rule; it does not establish that future positives are handled correctly, that sampled negatives are unbiased, or that the final evaluator is leakage-free.

The subsequent complete `All_Beauty` protocol run confirms its diagnostic-only role. P4 retains 494,769/693,929 = 71.30% of events and P5 retains 416,190/693,929 = 59.98%, but user singleton rates rise from 93.22% (all observed) to 94.16% (P4) and 94.76% (P5). Candidate validation/test warm-target retention is only 4.77%/2.28% for all observed, 3.98%/1.91% for P4, and 3.24%/1.65% for P5. Exact duplicate rows remain zero; 448 rows participate in shared timestamp values and neither candidate cutoff coincides with a row timestamp. The result validates the batch pipeline on a second category and demonstrates an extremely narrow warm-start estimand; it does not justify using `All_Beauty` as primary evidence.

The bounded `Home_and_Kitchen` provenance job also completed. The exact 0-core compressed artifact is 1,420,416,432 bytes, has SHA-256 `9be4e2dc8b3dc513c02521644b2ae55f722b2941767e539dcfe518f6bdd4f70b`, contains 66,623,880 rows, and matches the required four-column schema (`user_id`, `parent_asin`, `rating`, `timestamp`). This verifies byte identity, schema, and materially larger raw event scale relative to Baby (about 11.19× as many rows). It does **not** provide unique-user/item counts derived by this project, semantic snapshots, duplicate/timestamp evidence, a frozen training graph, runtime/memory feasibility, or a scalability result. Full scale stress remains gated by G5-S.

These findings demonstrate source identity, exact raw scale, strong bipartite sparsity, long-tail concentration, and severe mismatch between the provider's absolute split and a pure-ID warm-start estimand. They justify retaining `Baby_Products` as the primary candidate, limiting `All_Beauty` to development diagnostics, and constructing a new strict temporal task from training-only information. They do **not** demonstrate recommendation quality, sampling effectiveness, memory reduction, runtime improvement, novelty, or large-scale generalization.

The analysis follows the chain **observation → population and denominator → protocol consequence → action → excluded inference → gate status**. Baby G2-A/G2-B/G2-C/G2-D and E0-MIN now `PASS`. The full training-only graph, exact OOV ledger/candidate construction, deterministic artifacts, bounded traversal, environment fingerprint, and replay were read back. No data reconstruction or cutoff revision is justified.

The frozen graph contains 3,868,654 edges between 2,318,308 users and 162,125 items. User degree is strongly long-tailed (p50 1, p90 3, p99 9; 71.76% singleton), while item degree is more concentrated (p50 3, p90 32, p99 397, maximum 21,348; 33.35% singleton). The largest of 34,288 components contains 96.50% of all 2,480,433 nodes. These indicators show a sparse, imbalanced but predominantly connected message-passing graph; they do not show recommendation performance or sampler superiority.

Validation retains 81,871/373,776 = 21.90% warm targets and test retains 40,587/413,413 = 9.82%. Every exclusion reconciles exactly into unseen-user only, unseen-item only, or both. The low test retention restricts the future headline estimand to a narrow pure-ID warm-start cohort; it is not evidence of a weak model. In the bounded traversal, 100 targets crossed the 162,125-item catalog in 16,212,500 comparisons, counted 16,209,544 eligible candidates, and passed both original invariants. The amended manifest verifies all artifact hashes and adds four successful replay invariants under CPython 3.13.15, Linux 6.6.122, two logical Xeon CPUs, 12,975.53 MiB RAM, and no GPU. The original 1.667-second traversal and 158.24 MiB peak RSS describe bounded CPU feasibility only; the 0.00387-second count-only replay is a different operation and is not a performance comparison.

The detailed protocol and interpretation rules are recorded in [`DATASET_PORTFOLIO_AND_ANALYSIS_PROTOCOL_en.md`](../00_project/DATASET_PORTFOLIO_AND_ANALYSIS_PROTOCOL_en.md). Machine-readable mirrors are retained as [`Baby_Products_protocol_audit.json`](../06_code/results/Baby_Products_protocol_audit.json), [`All_Beauty_protocol_audit.json`](../06_code/results/All_Beauty_protocol_audit.json), [`Home_and_Kitchen_raw_audit.json`](../06_code/results/Home_and_Kitchen_raw_audit.json), and [`dataset_portfolio_audit_index.json`](../06_code/results/dataset_portfolio_audit_index.json).

### 7.1.5 G2 stages and how their evidence is interpreted

| Step | What will be done | Why it is necessary | Indicators and what they mean | Exit condition |
|---|---|---|---|---|
| G2-A — complete provenance | Add the official release/page identity, retrieval timestamp, raw Drive file ID, byte size, SHA-256, schema, access/usage note, audit configuration, and exact code commit to one immutable manifest | Another researcher must be able to identify the same bytes and the exact program that produced every derived count | A checksum match establishes byte identity; manifest completeness establishes traceability. Neither establishes semantic validity | Every required field is non-`UNKNOWN`, the two raw Drive objects match the recorded sizes/hashes, and the manifest is read back successfully |
| G2-B1 — anomaly and duplicate policy | Quarantine the single Baby `0.0` row; record zero observed repeated pairs; retain a deterministic earliest-timestamp/stable-row fallback for any future repeated pair | Invalid or repeated events can change positive counts and temporal ordering; the rule must precede modeling | Removed-row count/rate measures impact; affected-user/item count shows whether a small row anomaly has wider cohort consequences | Rule, counts, and rationale are registered before graph construction |
| G2-B2 — choose interaction semantics | Construct descriptive P4, P5, and all-observed snapshots without training models; compare their retained scale, activity coverage, and temporal warm-start feasibility | Ratings are explicit feedback. Converting them into implicit positives changes the research task and must not be selected by test performance | Event retention, retained users/items, degree quantiles, singleton rates, time coverage, warm-start target retention, and eligible catalog size show semantic and feasibility consequences | One primary policy is selected from domain meaning plus pre-model feasibility; at most one sensitivity policy is pre-registered |
| G2-B3 — register negatives | Define the training item universe and which known positives are excluded at each training time; define treatment of later positives and evaluation candidates | Treating future or observed positives as negatives creates label contamination and can change model rankings | Eligible-negative count per user, zero-negative user rate, candidate catalog size, and collision/contamination checks describe whether the rule is executable and leakage-safe | A deterministic negative rule passes toy checks and is frozen before baseline training |
| G2-C1 — freeze temporal cutoffs and ties | Select chronological cutoffs from a declared rule, run the exact Baby timestamp-tie audit, and assign all events at a tied cutoff deterministically to one side | Temporal evaluation must simulate learning from the past and predicting later events without arbitrary boundary leakage | Rows/users/items per period, duration, cutoff-tie count, and activity drift quantify temporal coverage and population change | Cutoffs and tie rule are pre-registered and rerunning them yields identical partitions |
| G2-C2 — build from training only | Apply semantic selection and any iterative activity filter to training positives only; then freeze ID mappings, degrees, normalization, popularity, and sampler statistics | Global or post-split filtering can leak future activity into the graph and make the task easier | Training nodes/edges, filter iterations, attrition by reason, degree quantiles, density, components, and head–tail shares describe the actual graph seen by the model | No validation/test information contributes to graph construction or derived features, and the full attrition ledger reconciles |
| G2-C3 — define warm-start cohort | Project validation/test targets into the frozen training user/item universe and report every exclusion; keep cold-start outside the primary pure-ID claim | A pure-ID recommender cannot score unseen IDs, but silently dropping them changes the estimand | User/item OOV rates, target warm-start retention, users with evaluable targets, and exclusions by reason define coverage of the primary claim | Retained and excluded counts reconcile to every candidate target, and claim wording names the retained cohort |
| G2-C4 — exact candidates | Rank each target against the full eligible training-item universe after removing previously observed items under the registered time rule | Sampled-candidate evaluation can alter relative model rankings and overstate performance | Eligible catalog size, candidates per target, removed-history count, target-presence checks, and evaluator chunk count define the exact ranking task | Candidate construction passes invariants and is identical for every later method |
| G2-D — bounded feasibility | Run one pre-registered, non-headline pipeline/evaluator dry-run on the retained graph or a declared bounded subset with fixed settings | This checks that data construction and exact evaluation are executable within the recorded environment before expensive research runs | Wall time, peak CPU/GPU memory, throughput, graph size, evaluated users/targets, candidate comparisons, and failure status describe only the tested resource envelope | The path completes reproducibly or yields a documented scope/compute decision; no tuning, sampler comparison, or performance claim is made |

The order is deliberate. G2-A fixes *what was analyzed*; G2-B fixes *what an interaction and a negative mean*; G2-C fixes *who and what the model is allowed to know and evaluate*; G2-D checks *whether the frozen task is executable*. A later step cannot repair ambiguity in an earlier one. The executable interpretation and run instructions are recorded in [`G2C_TEMPORAL_GRAPH_en.md`](../06_code/docs/G2C_TEMPORAL_GRAPH_en.md).

### 7.2 Leakage-safe preparation

The executed Baby path validates schema and duplicates, applies P4, uses the frozen global chronological cutoffs, applies minimum training degree `1` only to training positives, freezes lexicographic training mappings, projects validation/test into that universe, and records degree/component and exact-candidate statistics. The accepted cutoffs are `t1 = 1628643414042` and `t2 = 1658002729837` with strict half-open intervals. Provider processing, project semantics, project split, and project warm-start filtering remain separate recorded transformations.

### 7.3 Baselines and comparisons

The planned comparison family includes MostPop, BPR matrix factorization, full-graph LightGCN, random sampling, degree-aware sampling, and GRAPES-informed learned reference variants. The final baseline set and any project-developed method must be frozen from the evidence record before final experiments. Any learned variant will be compared against matched non-learned sampling, not against an unconstrained implementation.

### 7.4 Metrics and statistics

Primary quality is exact full-catalog NDCG@20; Recall@20 is secondary. Planned resource measurements include peak GPU/CPU memory, epoch time, time to best validation score, throughput, sampler and propagation time, sampled nodes/edges, policy diagnostics, and failures. The planned seed structure is one smoke seed, three development seeds, and five paired final seeds if measured capacity permits. Final reporting should include means, standard deviations, effect sizes, confidence intervals, and failed-run explanations. These are plans, not measurements.

### 7.5 Ablations

The registered ablations cover layer-wise budget `k`, recommendation depth, sampler inputs, reward coefficient and stabilization, update frequency, frozen versus active sampler training, degree cohorts, full-graph versus sampled training, sampled-local versus full-graph normalization, and retention versus transient masking of the current positive edge.

## 8. Verification and reproducibility plan

Semantic decisions D1–D11 are recorded in the GRAPES-informed reference specification. Expected behaviors T01–T25 are registered as executable reference acceptance criteria. Thirteen pure-Python tests pass, and the full Baby manifest independently reconciles the corresponding graph/OOV/candidate invariants. These still do not validate a future PyTorch/PyG implementation or recommender result.

The model-training deliverable is planned as a modular Python package with a CPU toy-graph path, deterministic configuration and seed handling, D-ID-to-module-to-T-ID traceability, data/checksum manifest interfaces, logging and checkpoint contracts, paired human-readable documentation, and a thin Colab launcher. By direct user requirement, the dataset-audit notebook is a scoped exception: it embeds its complete standard-library audit implementation so the portfolio audit can run from one Colab file without a separate Drive script.

The portfolio-audit utility has executed on the governed artifacts. A second self-contained standard-library/SQLite notebook implements the Baby G2-C/G2-D path and writes deterministic mappings, edges, warm targets, artifact hashes, graph/OOV statistics, bounded traversal measurements, and the environment completion record. Its toy fixture and full Baby path have executed; the amended manifest has been read back and accepted for G2.

The exact Python/PyTorch/PyG/CUDA lock and final GPU class are not yet known. Colab is available for development and smoke runs, but temporary Colab hardware is not the final comparable profiling platform.

## 9. Risks and current limitations

- The positive `(u, i+)` edge may create a shortcut in sampled recommendation; the retention/masking comparison is pre-registered but unexecuted.
- Different negative samples can create a false sampler advantage; matched negative/RNG controls are required.
- GFlowNet likelihood and normalizer semantics require explicit implementation tests.
- A learned sampler may improve ranking while increasing memory or runtime; both sides of the trade-off must be reported.
- Exact Phase 1 commit provenance is unavailable, limiting attribution of historical reproduction results.
- Persistent checksummed Amazon audit manifests exist, but the license/access note, source/code/configuration manifest fields, protocol decisions, and post-filter training-universe scale are not yet complete.
- University thesis template, submission language, page limit, defense format, and formal rubric are unknown.

## 10. Current status and next research gate

| Work item | Current maturity | Evidence boundary |
|---|---|---|
| Scope and 12-week plan | `LOCKED / RECORDED` | [Canonical Phase 2 research plan](../00_project/PHASE2_RESEARCH_PLAN_en.md) |
| G1 research design and literature position | `PASS / FROZEN BEFORE MODEL RESULTS` | RQ, hypotheses, closest-work map, candidate family, matched comparison, and validation-only selection rule |
| GRAPES-informed reference design D1–D11 | `REFERENCE DESIGN; NOT CANONICAL METHOD` | Bilingual reference specification |
| Reference verification candidates T01–T25 | `PARTIAL TOY EXECUTION` | Earlier reference checks plus the G2-C toy path pass; final verification plan remains open |
| Report and slide working content | `CUMULATIVE DRAFT` | This living report and defense deck |
| Python/Colab source | `G2-C/G2-D FULL EXECUTION AND READBACK` | 13/13 local tests pass; full Baby artifacts and environment completion read back; no model benchmark |
| Amazon data | `BABY G2-A/G2-B/G2-C/G2-D PASS; G2 PASS` | Primary P4 task, cutoffs, graph, mappings, warm/OOV ledger, candidate rule, and bounded feasibility are frozen |
| Environment/GPU | `E0-MIN PASS; E0-FINAL NOT_STARTED` | CPU/Colab bounded environment recorded; final model/GPU profiling lock remains incomplete |
| Recommendation results | `NOT STARTED` | No NDCG, Recall, runtime, memory, or scalability result |

The canonical register has G0, G1, G2, and E0-MIN `PASS`; G3–G6 remain `NOT_STARTED`. G3 shared evaluator and baseline execution may begin. Proposed-sampler implementation still waits for G3. Existing toy tests are reference evidence and do not satisfy G4.

## 11. References

1. GRAPES, arXiv:2310.03399v3. <https://arxiv.org/abs/2310.03399v3>
2. Rendle et al., “BPR: Bayesian Personalized Ranking from Implicit Feedback,” arXiv:1205.2618. <https://arxiv.org/abs/1205.2618>
3. He et al., “LightGCN: Simplifying and Powering Graph Convolution Network for Recommendation,” arXiv:2002.02126. <https://arxiv.org/abs/2002.02126>
4. Ying et al., “Graph Convolutional Neural Networks for Web-Scale Recommender Systems,” arXiv:1806.01973. <https://arxiv.org/abs/1806.01973>
5. Hamilton et al., “Inductive Representation Learning on Large Graphs,” arXiv:1706.02216. <https://arxiv.org/abs/1706.02216>
6. Chen et al., “FastGCN,” ICLR 2018. <https://openreview.net/pdf?id=rytstxWAW>
7. Huang et al., “Adaptive Sampling Towards Fast Graph Representation Learning,” NeurIPS 2018. <https://proceedings.neurips.cc/paper/2018/hash/01eee509ee2f68dc6014898c309e86bf-Abstract.html>
8. Zou et al., “LADIES,” NeurIPS 2019. <https://proceedings.neurips.cc/paper/2019/hash/91ba4a4478a66bee9812b0804b6f9d1b-Abstract.html>
9. Zeng et al., “GraphSAINT,” ICLR 2020. <https://openreview.net/forum?id=BJe8pkHFwS>
10. Wang et al., “DSKReG,” arXiv:2108.11883. <https://arxiv.org/abs/2108.11883>
11. Abu-El-Haija et al., “SubMix,” UAI 2023. <https://proceedings.mlr.press/v216/abu-el-haija23a.html>
5. DSKReG, arXiv:2108.11883. <https://arxiv.org/abs/2108.11883>
6. Amazon Reviews 2023 official documentation. <https://amazon-reviews-2023.github.io/main.html>
7. Recommender evaluation leakage study, arXiv:2010.11060. <https://arxiv.org/abs/2010.11060>
8. Sampled-metric analysis, arXiv:1912.02263. <https://arxiv.org/abs/1912.02263>

### Local project records

- [`PHASE2_DIRECTION_REVIEW_en.md`](../PHASE2_DIRECTION_REVIEW_en.md)
- [`GRAPES_SOURCE_VERSION_NOTE_en.md`](../01_literature/GRAPES_SOURCE_VERSION_NOTE_en.md)
- [`GRAPES_RECOMMENDATION_SPEC_en.md`](../02_protocol/GRAPES_RECOMMENDATION_SPEC_en.md)
- [`REPORT_TEACHER_en.md`](../03_reports/REPORT_TEACHER_en.md)
- Official Phase 1 deck: [`GRAPES_Presentation_v2.pptx`](</Users/tyvan/Documents/Master/ThucTap2/GRAPES%20report/GRAPES_Presentation_v2.pptx>)
