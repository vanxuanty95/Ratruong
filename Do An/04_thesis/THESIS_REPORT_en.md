# Development of a Graph Sampling Method for Large-Scale Recommender Systems Using Graph Neural Networks

> **Status:** `CUMULATIVE WORKING THESIS — METHOD DEVELOPMENT, DATA AUDIT, AND RESEARCH PLAN`  
> **Last updated:** 2026-09-02
> **Phase 2 identity:** Independent Master's thesis; GRAPES is a scientific reference, not the pre-fixed thesis method  
> **Evidence boundary:** A dependency-free toy scaffold and ten local contract tests exist. Persistent checksummed raw-audit manifests for the two scoped Amazon categories now exist in Google Drive, but the interaction semantics, strict temporal warm-start dataset, Phase 2 PyTorch/PyG implementation, full oracle suite, benchmark, and recommendation results are not finalized.

This document is the English working thesis report. It is intentionally a living artifact: verified implementation, execution, and validation evidence will replace planned statements as the research progresses. The Vietnamese counterpart is [`THESIS_REPORT_vn.md`](./THESIS_REPORT_vn.md).

## 1. Executive summary

Large graph neural networks can require information from increasingly large multi-hop neighborhoods. The thesis develops and evaluates a graph-sampling method for large-scale GNN-based recommendation on a user–item graph. Phase 1 studied GRAPES, an existing learned-sampling method for node classification; it provides historical context and candidate mechanisms only.

The current GRAPES-informed reference design explores a sampler GNN, Gumbel Top-k selection, and policy-learning objectives alongside a LightGCN-style recommender and Bayesian Personalized Ranking (BPR). These are candidate components—not the final method by default. The final method will be defined through literature positioning, method rationale, data/protocol constraints, controlled comparisons, and ablations. A dependency-free scaffold tests a subset of reference contracts on toy inputs; no final Phase 2 method has yet been implemented or tested.

The current project state provides a controlled research foundation rather than a model-performance result: primary sources are pinned, the initial literature matrix and a GRAPES-informed reference design are recorded, a toy scaffold exists, and persistent raw dataset audits have been executed. Final interaction semantics, temporal warm-start construction, method definition, environment locking, model implementation, and performance evaluation remain open.

## 2. Scope and motivation

### 2.1 Phase 1 to Phase 2 boundary

Phase 1 selected/explored the topic through study and partial reproduction of GRAPES for node classification. Its official submitted presentation is a read-only historical reference. Phase 2 is the official thesis; it does not treat Phase 1 as a thesis chapter, as a source of recommendation results, or as a fixed implementation blueprint.

The thesis remains focused on developing graph sampling for large-scale GNN recommendation. Candidate mechanisms may be adopted, modified, or rejected based on evidence. Negative or null findings remain valid results, but they do not justify changing claims after inspecting outcomes.

### 2.2 Problem statement

In a user–item graph, graph collaborative filtering can benefit from multi-hop interactions but may become expensive when sampled neighborhoods grow. Uniform or static sampling can discard nodes that are useful for a particular recommendation target. The research problem is to develop and rigorously evaluate a graph-sampling method that can select useful computation-graph context for scalable recommendation, while measuring both recommendation quality and resource cost.

The thesis does not assume that any candidate sampling mechanism improves recommendation. It asks whether a carefully controlled project-developed method can be defined, implemented, and evaluated without conflating sampling effects with data, negative-sampling, inference, or hardware differences.

## 3. Research questions and hypotheses

### 3.1 Primary research question

> How can a graph-sampling method for large-scale GNN-based recommendation be developed and evaluated so that its quality and resource trade-offs are measured fairly against matched sampling baselines?

### 3.2 Secondary questions

1. How should recommendation targets and layer-wise candidate sets be constructed without leakage?
2. Which graph-sampling signals remain usable when a user–item graph has sparse or no semantic node features?
3. Which GRAPES-informed or alternative candidate mechanisms are justified by the closest-work review and controlled ablations?
4. How much memory and training-time overhead does learned sampling add at a matched layer-wise budget?

### 3.3 Hypotheses

The following are `HYPOTHESIS` statements, not results:

- **H1:** At the same declared sampling budget, a project-developed graph-sampling method may achieve a different NDCG@20/resource trade-off from matched random or static sampling baselines.
- **H2:** Any benefit of learned or task-aware sampling may be more visible at smaller budgets, where uniform sampling discards more potentially useful context.
- **H3:** Candidate sampling objectives and mechanisms may exhibit different stability, quality, and overhead profiles; none is assumed to dominate before measurement.
- **H4:** Learned sampling is expected to add measurable memory and runtime overhead; the quality trade-off must be measured rather than assumed acceptable.

## 4. Background and related work

| Source | Relevance to this thesis | Evidence status and boundary |
|---|---|---|
| GRAPES, arXiv:2310.03399v3 | Formal source for layer-wise learned sampling, Gumbel Top-k, REINFORCE, GFlowNet/Trajectory Balance, and sampled computation graphs | `VERIFIED PRIMARY SOURCE`; recommendation is an adaptation target, not a completed evaluation in Phase 1 |
| BPR, arXiv:1205.2618 | Pairwise ranking loss and implicit-feedback triplets | `VERIFIED PRIMARY SOURCE`; does not specify GRAPES sampling |
| LightGCN, arXiv:2002.02126 | Graph collaborative-filtering propagation, layer aggregation, and dot-product recommendation score | `VERIFIED PRIMARY SOURCE`; sampled block semantics require an explicit adaptation contract |
| PinSage, arXiv:1806.01973 | Scalable graph-recommendation and sampling context | `VERIFIED PRIMARY SOURCE ANCHOR`; not a GRAPES-style policy and not required as the primary baseline |
| DSKReG, arXiv:2108.11883 | Closest-work warning for learned sampling in recommendation-related settings | `VERIFIED PRIMARY SOURCE ANCHOR`; different knowledge-graph setting, so novelty must remain narrow |
| Recommender leakage study, arXiv:2010.11060 | Supports temporal and training-only preprocessing controls | `VERIFIED PRIMARY SOURCE ANCHOR`; exact Amazon protocol remains to be frozen |
| Sampled-metric analysis, arXiv:1912.02263 | Supports exact full-catalog ranking for the primary evaluation | `VERIFIED PRIMARY SOURCE ANCHOR`; final feasibility depends on measured scale |

The current literature review is preliminary. It supports a defensible starting point for the method and protocol sections, but it does not support an exhaustive review or a “first learned sampler for recommendation” novelty claim.

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

The evidence portfolio is deliberately bounded. `Baby_Products` is the mandatory primary Amazon candidate; `Home_and_Kitchen` is a required *bounded scale-stress test* if the thesis retains its large-scale claim. `All_Beauty` is development/diagnostic only, not primary evidence. MovieLens 25M and Yelp Open Dataset are optional additions after the Amazon core is complete; they must not delay the central experiment. All roles are `PROPOSED` until Dataset Gate G2 is closed.

The paired decision record, sources, exact audit questions, preprocessing sequence, comparison rules, and gates are in [`DATASET_PORTFOLIO_AND_ANALYSIS_PROTOCOL_en.md`](../00_project/DATASET_PORTFOLIO_AND_ANALYSIS_PROTOCOL_en.md). In particular, the official Amazon 5-core data are a reproducibility reference, not automatically the thesis's strict temporal training graph.

### 7.1.1 Why these datasets were selected

Amazon Reviews'23 is selected because the thesis studies graph sampling for recommendation and therefore needs timestamped user–item interactions that can be represented as a large bipartite graph. The pure-ID 0-core release preserves the sparse long tail instead of imposing a provider-side k-core population before the project defines its own training-only transformation. It also supplies rating values for testing alternative implicit-positive semantics and timestamps for temporal evaluation.

`Baby_Products` is the primary candidate because it combines a product-review domain, millions of events, more than three million users, and substantial degree imbalance. This scale is large enough to expose graph-construction and sampling pressure while remaining more bounded than the largest Amazon categories. `All_Beauty` is retained as a development control because it has the same schema and source family but is smaller; its very high singleton rate prevents it from serving as the main warm-start evidence. `Home_and_Kitchen` is reserved for a bounded scale-stress experiment if the thesis retains the large-scale claim. Dataset selection is thus role-based rather than based on which dataset later produces the best model score.

### 7.1.2 Purpose and method of the audit

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

### 7.1.3 Project-derived audit results and interpretation

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
| Timestamp-tie audit | 448 participating rows | `UNKNOWN` because exact tie counting was disabled | All Beauty needs a stable cutoff tie rule; Baby tie evidence remains incomplete and must not be inferred from All Beauty |

These findings demonstrate source identity, exact raw scale, strong bipartite sparsity, long-tail concentration, and severe mismatch between the provider's absolute split and a pure-ID warm-start estimand. They justify retaining `Baby_Products` as the primary candidate, limiting `All_Beauty` to development diagnostics, and constructing a new strict temporal task from training-only information. They do **not** demonstrate recommendation quality, sampling effectiveness, memory reduction, runtime improvement, novelty, or large-scale generalization.

The analysis follows the chain **observation → population and denominator → protocol consequence → action → excluded inference → gate status**. On current evidence, duplicate verification is resolved for both acquired files; the Baby `0.0` treatment, P4/P5/all-observed choice, exact Baby timestamp ties, strict temporal cutoffs, training-only filtering, negative eligibility, warm-start retention, and G2-D feasibility remain `OPEN`.

The detailed protocol and interpretation rules are recorded in [`DATASET_PORTFOLIO_AND_ANALYSIS_PROTOCOL_en.md`](../00_project/DATASET_PORTFOLIO_AND_ANALYSIS_PROTOCOL_en.md). The earlier local result record remains in [`DATASET_AUDIT_RESULTS_en.md`](../06_code/docs/DATASET_AUDIT_RESULTS_en.md); it must be synchronized with the persistent manifests before being treated as the current numerical summary.

### 7.2 Leakage-safe preparation

The planned sequence is: validate schema and duplicates; define implicit positives; create a global chronological split when timestamps are reliable; apply iterative filtering to training positives only; freeze the user/item universe; project validation and test into that universe; and compute graph statistics, degrees, popularity, and normalization from training data only. Exact rating threshold, repeated-interaction policy, temporal cutoffs, core threshold, and negative eligibility remain open. Provider processing, project interaction semantics, project split, and project warm-start filtering will be reported as separate transformations.

### 7.3 Baselines and comparisons

The planned comparison family includes MostPop, BPR matrix factorization, full-graph LightGCN, random sampling, degree-aware sampling, and GRAPES-informed learned reference variants. The final baseline set and any project-developed method must be frozen from the evidence record before final experiments. Any learned variant will be compared against matched non-learned sampling, not against an unconstrained implementation.

### 7.4 Metrics and statistics

Primary quality is exact full-catalog NDCG@20; Recall@20 is secondary. Planned resource measurements include peak GPU/CPU memory, epoch time, time to best validation score, throughput, sampler and propagation time, sampled nodes/edges, policy diagnostics, and failures. The planned seed structure is one smoke seed, three development seeds, and five paired final seeds if measured capacity permits. Final reporting should include means, standard deviations, effect sizes, confidence intervals, and failed-run explanations. These are plans, not measurements.

### 7.5 Ablations

The registered ablations cover layer-wise budget `k`, recommendation depth, sampler inputs, reward coefficient and stabilization, update frequency, frozen versus active sampler training, degree cohorts, full-graph versus sampled training, sampled-local versus full-graph normalization, and retention versus transient masking of the current positive edge.

## 8. Verification and reproducibility plan

Semantic decisions D1–D11 are recorded in the GRAPES-informed reference specification. Expected behaviors T01–T25 are registered as executable reference acceptance criteria. The current scaffold has executed ten pure-Python toy tests, including small checks related to T01–T03, T05–T09, T11–T12, T14, T18–T19, T22, and T23. These do not validate a future PyTorch/PyG implementation. Once the project-developed method and data protocol are selected, the relevant lower-level graph, ID, candidate, sampling, likelihood, and gradient-isolation primitives will be implemented and the high-risk reference oracles will be re-run where applicable.

The code deliverable is planned as a modular Python package with a CPU toy-graph path, deterministic configuration and seed handling, D-ID-to-module-to-T-ID traceability, data/checksum manifest interfaces, logging and checkpoint contracts, paired human-readable documentation, and a thin Colab launcher. The notebook should install the package, capture runtime metadata, run tests, and persist logs; it should not contain the main implementation logic.

The dataset-audit utility is implemented as a streaming, dependency-free pre-model gate. It has been checked on a project toy CSV fixture and executed on exact acquired `All_Beauty` and `Baby_Products` bytes. Persistent checksummed JSON manifests now exist in Google Drive; complete G2-A manifest fields, protocol closure, and post-filter training-universe statistics remain open.

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
| Literature and source pins | `VERIFIED ARTIFACT / PRELIMINARY` | Primary-paper anchors and source note |
| GRAPES-informed reference design D1–D11 | `REFERENCE DESIGN; NOT CANONICAL METHOD` | Bilingual reference specification |
| Reference verification candidates T01–T25 | `PARTIAL TOY EXECUTION` | 10 toy checks pass; final verification plan remains open |
| Report and slide working content | `CUMULATIVE DRAFT` | This living report and defense deck |
| Python/Colab source | `SCAFFOLDED AND TOY-TESTED` | 10/10 pure-Python tests pass locally; no benchmark implementation |
| Amazon data | `PERSISTENT RAW AUDIT / G2 OPEN` | Checksummed Drive manifests exist; G2-A fields, semantic/split decisions, post-filter graph, and G2-D remain open |
| Environment/GPU | `E0-MIN IN_PROGRESS; E0-FINAL NOT_STARTED` | Colab available; rerunnable development lock and final profiling lock remain incomplete |
| Recommendation results | `NOT STARTED` | No NDCG, Recall, runtime, memory, or scalability result |

The canonical register has G0 `PASS`, G1/G2 `IN_PROGRESS`, and G3–G6 `NOT_STARTED`. G1 closest-work/rationale and G2 protocol evidence proceed in parallel with E0-MIN. Scientific baseline work waits for G2 and E0-MIN; proposed-sampler implementation waits for G1–G3. Existing toy tests are reference evidence and do not satisfy G4.

## 11. References

1. GRAPES, arXiv:2310.03399v3. <https://arxiv.org/abs/2310.03399v3>
2. Rendle et al., “BPR: Bayesian Personalized Ranking from Implicit Feedback,” arXiv:1205.2618. <https://arxiv.org/abs/1205.2618>
3. He et al., “LightGCN: Simplifying and Powering Graph Convolution Network for Recommendation,” arXiv:2002.02126. <https://arxiv.org/abs/2002.02126>
4. Ying et al., “Graph Convolutional Neural Networks for Web-Scale Recommender Systems,” arXiv:1806.01973. <https://arxiv.org/abs/1806.01973>
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
