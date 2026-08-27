# Development of a Graph Sampling Method for Large-Scale Recommender Systems Using Graph Neural Networks

> **Status:** `CUMULATIVE WORKING THESIS — METHOD DEVELOPMENT, DATA AUDIT, AND RESEARCH PLAN`  
> **Last updated:** 2026-08-26  
> **Phase 2 identity:** Independent Master's thesis; GRAPES is a scientific reference, not the pre-fixed thesis method  
> **Evidence boundary:** A dependency-free toy scaffold and ten local contract tests exist; a temporary raw Amazon audit has executed, but no persistent finalized dataset artifact, Phase 2 PyTorch/PyG implementation, full oracle suite, benchmark, or recommendation result exists yet.

This document is the English working thesis report. It is intentionally a living artifact: verified implementation, execution, and validation evidence will replace planned statements as the research progresses. The Vietnamese counterpart is [`THESIS_REPORT_vn.md`](./THESIS_REPORT_vn.md).

## 1. Executive summary

Large graph neural networks can require information from increasingly large multi-hop neighborhoods. The thesis develops and evaluates a graph-sampling method for large-scale GNN-based recommendation on a user–item graph. Phase 1 studied GRAPES, an existing learned-sampling method for node classification; it provides historical context and candidate mechanisms only.

The current GRAPES-informed reference design explores a sampler GNN, Gumbel Top-k selection, and policy-learning objectives alongside a LightGCN-style recommender and Bayesian Personalized Ranking (BPR). These are candidate components—not the final method by default. The final method will be defined through literature positioning, method rationale, data/protocol constraints, controlled comparisons, and ablations. A dependency-free scaffold tests a subset of reference contracts on toy inputs; no final Phase 2 method has yet been implemented or tested.

The current project state provides a controlled research foundation rather than an empirical result: primary sources are pinned, the initial literature matrix and a GRAPES-informed reference design are recorded, a toy scaffold exists, and a raw dataset audit has been executed. Final method definition, persistent data protocol, environment locking, model implementation, and performance evaluation remain open.

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

### 7.1.1 Initial dataset-audit status

The local audit on 2026-08-26 found no Amazon raw artifact in `Do An` or the Phase 1 reference area. The official Amazon Reviews'23 documentation identifies the pure-ID 0-core rating-only schema as `user_id`, `parent_asin`, `rating`, and `timestamp`, and publishes rounded pre-split counts of approximately 632.0K users / 112.6K items / 693.9K ratings for `All_Beauty` and 3.4M / 217.7K / 6.0M for `Baby_Products`. These are provider-published metadata, not project-derived results.

The project has now added a standard-library streaming audit script and paired Colab notebooks. The audit records the exact source URL, acquisition state, compressed file size, SHA-256, schema, invalid rows, duplicate user–item pairs, rating distribution, timestamp range/ties, degree statistics, candidate absolute-split coverage, warm-start out-of-vocabulary counts, and a negative-pool diagnostic. The official processing README states that repeated user–item reviews are de-duplicated by keeping the earliest review; this behavior must be verified against the downloaded bytes rather than assumed.

The official absolute split with `t1 = 1628643414042` and `t2 = 1658002729837` milliseconds is retained as a candidate reference. The split, item-key handling, rating-to-implicit-positive rule, warm-start filtering, and negative eligibility remain open until the raw audit is executed. The official leave-last-out option is not adopted blindly because its documented singleton handling can leave users/items outside the training universe.

### 7.1.2 Project-derived audit result

The raw audit executed successfully for both scoped artifacts. `All_Beauty` contains 693,929 valid rows, 631,986 users, and 112,565 items; its exact duplicate-pair count is zero. `Baby_Products` contains 5,953,891 valid parsed rows, 3,386,206 users, and 217,654 items; one row has rating `0.0`, outside the expected 1–5 range, and its exact duplicate-pair count remains open because the large-scale SQLite scan was not completed. No missing or parse-invalid fields were observed in either artifact.

Both categories are highly sparse and user-singleton dominated: 93.22% of `All_Beauty` users and 70.01% of `Baby_Products` users have one observed row. The provider's absolute split candidate produces high OOV coverage relative to the training partition. For `All_Beauty`, validation/test OOV users are 63,008/34,851; for `Baby_Products`, they are 301,130/318,972. This is a protocol finding, not a model result: the published absolute split cannot be used directly as the current warm-start primary split without an explicit protocol decision.

The complete tables, checksums, rating distributions, degree summaries, split diagnostics, and negative-pool diagnostics are recorded in [`DATASET_AUDIT_RESULTS_en.md`](../06_code/docs/DATASET_AUDIT_RESULTS_en.md) and its Vietnamese counterpart. `All_Beauty` remains development/diagnostic only; `Baby_Products` remains the primary candidate but is not finalized. The rating-to-implicit-positive rule, duplicate handling, cold-start treatment, and negative eligibility remain open.

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

The dataset-audit utility is implemented as a streaming, dependency-free pre-model gate. It has been checked on a project toy CSV fixture and executed on temporary raw `All_Beauty` and `Baby_Products` artifacts. The resulting evidence is recorded separately; persistent Colab acquisition, protocol closure, and post-filter training-universe statistics remain open.

The exact Python/PyTorch/PyG/CUDA lock and final GPU class are not yet known. Colab is available for development and smoke runs, but temporary Colab hardware is not the final comparable profiling platform.

## 9. Risks and current limitations

- The positive `(u, i+)` edge may create a shortcut in sampled recommendation; the retention/masking comparison is pre-registered but unexecuted.
- Different negative samples can create a false sampler advantage; matched negative/RNG controls are required.
- GFlowNet likelihood and normalizer semantics require explicit implementation tests.
- A learned sampler may improve ranking while increasing memory or runtime; both sides of the trade-off must be reported.
- Exact Phase 1 commit provenance is unavailable, limiting attribution of historical reproduction results.
- Persistent Amazon artifact acquisition, license/access note, protocol decisions, and post-filter training-universe scale are not yet fixed; temporary-run checksums and pre-filter diagnostics are recorded.
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
| Amazon data | `RAW AUDIT EXECUTED / G2 OPEN` | Checksummed temporary run and derived result record; persistent acquisition and protocol closure remain open |
| Environment/GPU | `OPEN` | Colab available; final lock unconfirmed |
| Recommendation results | `NOT STARTED` | No NDCG, Recall, runtime, memory, or scalability result |

The next gate is an executable environment and data/provenance package, followed by toy correctness tests. The project must not start learned-policy experiments while semantic or data leakage controls remain ambiguous.

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
