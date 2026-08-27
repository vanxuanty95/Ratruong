# Phase 2 Canonical Research Plan

> **Status:** Active, single source of truth for the Phase 2 research plan.  
> **Project duration:** 12 weeks.  
> **Last updated:** 2026-08-27.  
> **Language pair:** Vietnamese counterpart: [`PHASE2_RESEARCH_PLAN_vn.md`](./PHASE2_RESEARCH_PLAN_vn.md).

## 1. Purpose and governance

This file is the only canonical plan for Phase 2. It defines the research sequence, decision gates, dependencies, and the 12-week schedule. Other project records must link here rather than reproduce the plan.

It is not a weekly thesis report. The thesis report, defense slides, and Colab/Python source are cumulative deliverables; they are updated in place when verified evidence changes their content.

When this plan changes, update both language versions and add a concise pointer/change record to the bilingual continuity rules. Do not raise a scientific maturity label without evidence.

## 2. Thesis scope and fixed boundaries

- **Working thesis title:** *Development of a Graph Sampling Method for Large-Scale Recommender Systems Using Graph Neural Networks (GNNs).* 
- **Phase relationship:** Phase 2 is an independent Master's thesis. Phase 1 is read-only historical topic exploration and a GRAPES study.
- **Research objective:** Develop and evaluate a graph-sampling method for GNN recommender systems under controlled ranking-quality and computational-cost evaluation.
- **GRAPES role:** Scientific foundation, comparator, and source of candidate mechanisms only; it is not the preselected final method.
- **Open items:** The final sampler, final model configuration, interaction semantics, dataset/protocol closure, and all effectiveness/scalability results remain open.
- **Out of scope:** A claim that the thesis merely transfers GRAPES to recommendation, a claim of superiority before results, and any hidden use of validation/test information in the training graph.

## 3. Current verified starting position

| Area | Current status | Boundary |
|---|---|---|
| Thesis framing and living deliverables | Established | No final method or empirical result is claimed. |
| Source scaffold and toy tests | 10 pure-Python toy contract tests passed locally | This is not a PyTorch/PyG recommender implementation or benchmark. |
| Amazon raw-data audit | Preliminary raw audits recorded | Persistent data provenance and Dataset Gate G2 remain open. |
| Dataset portfolio | `Baby_Products` primary candidate; `All_Beauty` diagnostic; `Home_and_Kitchen` conditional scale stress | No dataset is finalized. |
| Environment and compute | Python and Google Colab are available | Final environment/GPU configuration is not locked. |

## 4. Decision gates and dependencies

| Gate | Decision required | Evidence needed before closure | Blocks until closed |
|---|---|---|---|
| G0 — Governance | Scope, bilingual artifacts, and evidence boundaries | This canonical plan and synchronized continuity pointers | None; completed for planning purposes |
| G1 — Research-design rationale | Candidate sampling mechanisms and controlled comparison design | Current literature positioning, explicit rationale, and a falsifiable comparison statement | Selection of the proposed sampler |
| G2 — Dataset and evaluation protocol | Primary dataset and leakage-safe evaluation protocol | Persistent provenance/manifest, interaction semantics, duplicate rule, temporal split, warm-start/OOV treatment, negative eligibility, and training-only graph statistics | Recommender training and headline evaluation |
| G3 — Shared baseline path | Data pipeline, exact evaluator, and matched baselines | Deterministic runs, sanity checks, and resource logging | Proposed-sampler experiments |
| G4 — Proposed-sampler readiness | Implemented candidate method and diagnostics | Unit/integration tests, finite losses, valid samples, and controlled development runs | Final comparison |
| G5 — Final evidence | Frozen experiment matrix and evidence package | Paired seeds, uncertainty analysis, resource traces, failures, and limitation analysis | Results/conclusion claims |
| G6 — Reproducibility and submission | Reproducible representative run and complete artifacts | Manifest/configuration, regenerated tables/figures, report, slides, and runnable Colab source | Submission |

Failure at a gate does not authorize an unsupported conclusion or a switch to an unrelated topic. It requires diagnosis, a recorded decision, and an evidence-compatible revision of the remaining plan.

## 5. Twelve-week research schedule

| Week | Primary work | Exit artifact or decision |
|---|---|---|
| 1 | Consolidate scope, evidence records, and the dataset-audit starting point; establish this canonical plan. | G0 record; current status and open risks are explicit. |
| 2 | Run persistent Amazon provenance/audit work in Colab; pre-register interaction semantics, duplicate treatment, candidate temporal split, warm-start/OOV treatment, and negative eligibility. | G2 evidence package is ready for review; no model training yet. |
| 3 | Implement the leakage-safe data pipeline, training-only graph statistics, exact full-catalog evaluator, and simple non-GNN controls. | G2 decision or a recorded corrective action. |
| 4 | Establish the shared GNN recommender baseline, deterministic configurations, logging, and resource measurement path. | G3 baseline path passes required sanity checks. |
| 5 | Implement and test bounded graph-sampling controls (for example, uniform and degree-aware sampling) under the same task and budget. | Matched sampling-control comparison is runnable. |
| 6 | Complete literature-informed candidate-method rationale and implement the selected proposed sampling mechanism without claiming success. | G1 and G4 readiness review. |
| 7 | Diagnose the proposed sampler through controlled development runs; repair only evidence-supported issues. | Candidate configuration, diagnostics, and planned ablations are frozen for development. |
| 8 | Run development comparisons and essential ablations at fixed task/budget; update the design only with recorded justification. | Final experiment matrix, seeds, and analysis plan are frozen. |
| 9 | Run the primary matched experiments and capture quality, resource, and failure traces. | Partial final-evidence package. |
| 10 | Complete primary evidence and, only if G2/G3 are valid, run the bounded `Home_and_Kitchen` scale-stress configuration. | G5 evidence package or a documented negative/insufficient result. |
| 11 | Perform uncertainty analysis, inspect failure cases, and execute a representative clean rerun from the recorded configuration. | G6 reproducibility package. |
| 12 | Complete and reconcile the cumulative thesis report, defense slides, Colab source, appendices, and supervisor-feedback revisions. | Submission-ready bilingual artifacts and runnable source. |

Writing, citation management, experiment logs, and reproducibility metadata are continuous work across all weeks. If time or compute becomes constrained, reduce optional datasets and secondary ablations before weakening leakage controls, matched comparisons, uncertainty reporting, or the representative rerun.

## 6. Cumulative deliverable update rules

After every verified gate closure or measured experiment, update the affected artifacts in place:

| Deliverable | Update when |
|---|---|
| Thesis report | Scope, literature positioning, method rationale, protocol, results, or limitations change. |
| Defense slides | The report has a defendable change that needs a concise visual explanation. |
| Colab/Python source | A protocol, implementation, configuration, test, manifest, or executable result changes. |
| Supervisor briefing | The current decision, risk, evidence boundary, or question for the supervisor changes. |

Every persistent narrative artifact must remain synchronized as `_en` and `_vn`. Technical source code remains language-neutral, with synchronized English and Vietnamese documentation.

## 7. Canonical record index

- [Project constraints](./PHASE2_CONSTRAINTS_en.md): user-provided operating constraints and compute assumptions.
- [Dataset portfolio and analysis protocol](./DATASET_PORTFOLIO_AND_ANALYSIS_PROTOCOL_en.md): dataset roles and detailed protocol candidates.
- [Bilingual continuity rules](../PROJECT_CONTEXT_AND_RESEARCH_RULES_en.md): working rules and dated change log; this document is linked there, not duplicated.
- [Thesis report](../04_thesis/THESIS_REPORT_en.md): cumulative academic narrative.
- [GRAPES-informed reference specification](../02_protocol/GRAPES_RECOMMENDATION_SPEC_en.md): reference design only, not the canonical thesis method.
- [Python/Colab README](../06_code/README_en.md): executable scaffold, environment, and run instructions.
- [Current supervisor briefing](../03_reports/REPORT_TEACHER_en.md): current discussion record for the supervisor.

## 8. Superseded planning record

`PHASE2_DIRECTION_REVIEW_en.md` is retained only as a brief historical redirect. Its former direct-GRAPES-adaptation plan is superseded and must not be used to guide Phase 2 work.
