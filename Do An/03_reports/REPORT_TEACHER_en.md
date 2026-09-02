# Current Supervisor Briefing

> **Project:** *Development of a Graph Sampling Method for Large-Scale Recommender Systems Using Graph Neural Networks (GNNs)*  
> **Status:** `CUMULATIVE BRIEFING — RESEARCH FOUNDATION AND DATA-PROTOCOL GATE`  
> **Last updated:** 2026-08-30
> **Use:** This is a current meeting brief, not a weekly thesis deliverable. Dated history is preserved in the continuity records.

## 1. Thesis identity

Phase 2 is an independent Master's thesis. Phase 1 is read-only historical context: it explored the topic and studied/reproduced GRAPES for node classification. GRAPES is retained as a scientific reference, comparator, and source of candidate mechanisms; it is not the fixed thesis method or the thesis title.

The final sampler remains `OPEN`. The existing GRAPES-informed reference design and its D1–D11/T01–T25 contracts are reference-design and verification candidates only. They can be adopted, changed, or rejected after literature positioning, implementation checks, ablations, and experiments.

The canonical gate register currently records G0 `PASS`, G1/G2 `IN_PROGRESS`, and G3–G6 `NOT_STARTED`. Environment readiness is separate: E0-MIN is `IN_PROGRESS` and E0-FINAL is `NOT_STARTED`. G1 and G2 proceed in parallel; no baseline or sampler gate is bypassed.

## 2. Current evidence and maturity

| Area | Current status | Evidence boundary |
|---|---|---|
| Research framing and source governance | `RECORDED` | Thesis title, Phase 1 boundary, primary-source anchors, and claim rules are documented |
| GRAPES-informed reference design | `REFERENCE DESIGN` | Candidate mechanisms and toy verification contracts; not the final method |
| Code scaffold | `PARTIAL TOY EXECUTION` | Ten dependency-free CPU contract tests passed; no PyTorch/PyG recommender or end-to-end pipeline exists |
| Raw data audit | `TEMPORARY AUDIT EXECUTED` | Exact audits completed for `All_Beauty` and `Baby_Products`; durable acquisition and final protocol are still open |
| Recommendation experiment | `NOT STARTED` | No model training, Recall/NDCG, memory, throughput, scalability, novelty, or superiority result exists |

## 3. Dataset portfolio and current finding

| Role | Dataset | Current status |
|---|---|---|
| Development diagnostic | Amazon Reviews'23 `All_Beauty` | Not primary evidence: the raw audit found 693,929 rows and 93.22% singleton users |
| Primary benchmark candidate | Amazon Reviews'23 `Baby_Products` | Mandatory candidate; the raw audit found 5,953,891 rows and 70.01% singleton users, but duplicate verification and the final protocol remain open |
| Conditional scale evidence | Amazon Reviews'23 `Home_and_Kitchen` | A bounded scale-stress candidate if the thesis retains its “large-scale” claim; not yet acquired or audited by this project |
| Optional validation | MovieLens 25M; Yelp Open Dataset | Consider only after the core Amazon evidence is complete |

The provider absolute-time split generated high user/item out-of-training-universe coverage in the raw audit. This is a data-protocol finding, not a model result. It means that the published split cannot be adopted directly as the primary strict warm-start protocol.

## 4. Protocol before model training

The next required decisions are:

1. Preserve data provenance: official URL, usage/access note, persistent artifact, checksum, schema, and manifest.
2. Freeze interaction semantics before training: duplicate treatment, the `0.0` Baby rating, one primary P4/P5/all-observed policy, and a targeted sensitivity policy if justified.
3. Define the strict temporal warm-start task: training-only graph, training-only filtering/statistics, explicit validation/test retention, and recorded OOV exclusions.
4. Define training negatives and full-catalog evaluation candidates without silently using future interactions.
5. Determine whether the retained `Baby_Products` graph passes primary-feasibility Gate G2-D before implementing the final sampler.

The intended comparison protocol uses matched data, backbone, budget, optimizer, seeds, and negative rules across a non-GNN ranking reference, GNN backbone, simple sampling baselines, the GRAPES-informed reference, and the project-developed sampler. Exact full-catalog Recall/NDCG and resource measures are planned only; feasibility must be demonstrated first.

## 5. Current risks and requests for guidance

1. Confirm whether the proposed evidence boundary—primary `Baby_Products`, bounded conditional scale test, and optional external validation—is suitable for the thesis requirements.
2. Confirm the available final GPU class/access window and the institution's report/deck template requirements.
3. Confirm whether the project should prioritize strict warm-start evaluation only, with cold start left outside the thesis unless a method explicitly supports it.
4. Confirm whether the anticipated evidence package—quality, resource cost, ablations, seed variation, and failure analysis—is sufficient before final experiments begin.

## 6. Short oral update

> The thesis is now framed as an independent method-development study for graph sampling in large-scale GNN recommendation. Phase 1 and GRAPES remain scientific context and comparison material, but they do not define the final method. We have completed temporary raw audits of two Amazon categories and found a high-sparsity and high-OOV protocol risk. The next work is therefore to freeze a leakage-safe data protocol and test whether the primary candidate remains feasible after filtering. No recommendation model has been trained, and no accuracy, efficiency, scalability, novelty, or comparative claim is being made.

## 7. Supporting records

- [`PROJECT_CONTEXT_AND_RESEARCH_RULES_en.md`](../PROJECT_CONTEXT_AND_RESEARCH_RULES_en.md)
- [`DATASET_PORTFOLIO_AND_ANALYSIS_PROTOCOL_en.md`](../00_project/DATASET_PORTFOLIO_AND_ANALYSIS_PROTOCOL_en.md)
- [`DATASET_AUDIT_en.md`](../06_code/docs/DATASET_AUDIT_en.md)
- [`DATASET_AUDIT_RESULTS_en.md`](../06_code/docs/DATASET_AUDIT_RESULTS_en.md)
- [`THESIS_REPORT_en.md`](../04_thesis/THESIS_REPORT_en.md)

## 8. Sources

- [Amazon Reviews'23 documentation](https://amazon-reviews-2023.github.io/main.html) and [5-core processing statistics](https://amazon-reviews-2023.github.io/data_processing/5core.html)
- [Recommender-system leakage study](https://arxiv.org/abs/2010.11060)
- [Sampled ranking-metric study](https://arxiv.org/abs/1912.02263)
