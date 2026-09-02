# Phase 2 Canonical Research Plan

> **Status:** Active, single source of truth for the Phase 2 research plan.  
> **Project duration:** 12 weeks.  
> **Last updated:** 2026-08-30.
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

## 4. Canonical gate register and dependencies

This bilingual plan pair is the **only authoritative gate register**. Other artifacts may link to a gate or state a short snapshot, but must not redefine gate identity, status, exit criteria, or dependencies.

Gate status and evidence maturity are separate. Gate status uses `NOT_STARTED`, `IN_PROGRESS`, `READY_FOR_REVIEW`, `PASS`, `CORRECTIVE_LOOP`, `STOP`, `REOPENED`, or `WAIVED`. Evidence maturity continues to use `planned -> specified -> implemented -> executed -> validated`; a gate `PASS` does not imply that every linked artifact is validated.

### 4.1 Executable-environment prerequisites

| ID | Current status | Exit criterion | Blocks |
|---|---|---|---|
| E0-MIN — development execution | `IN_PROGRESS` | A recorded, rerunnable local/Colab environment can execute the data-audit and bounded test path with exact versions captured | G2-D executable feasibility work and G3/G4 execution |
| E0-FINAL — final profiling execution | `NOT_STARTED` | Final GPU class, software/CUDA lock, profiling procedure, and persistent output location are confirmed and smoke-tested | Resource claims in G5 and the representative G6 rerun |

E0 does not block literature work or the non-executable parts of G2-A through G2-C. The two levels prevent uncertainty about the final borrowed GPU from blocking governance, literature review, or protocol design.

### 4.2 Gate definitions

| Gate | Decision required | Evidence needed before closure | Blocks until closed |
|---|---|---|---|
| G0 — Governance | Scope, bilingual artifacts, and evidence boundaries | This canonical plan and synchronized continuity pointers | None; completed for planning purposes |
| G1 — Research-design rationale | Candidate sampling mechanisms and controlled comparison design | Primary RQ and falsifiable hypotheses; closest-work positioning; candidate mechanisms; matched-comparison design; predeclared method-selection rule | Selection and implementation of the proposed sampler |
| G2 — Dataset and evaluation protocol | Primary dataset and leakage-safe evaluation protocol | G2-A provenance; G2-B interaction/duplicate/negative semantics; G2-C temporal, warm-start/OOV, and exact-candidate rules; G2-D retained-graph statistics and bounded feasibility evidence | Scientific baseline training and headline evaluation |
| G3 — Shared baseline path | Data pipeline, exact evaluator, and matched baselines | Deterministic runs, sanity checks, and resource logging | Proposed-sampler experiments |
| G4 — Proposed-sampler readiness | Implemented candidate method and diagnostics | Unit/integration tests, finite losses, valid samples, and controlled development runs | Final comparison |
| G5 — Final evidence | Frozen experiment matrix and evidence package | Paired seeds, uncertainty analysis, resource traces, failures, and limitation analysis; G5-S bounded scale evidence if the thesis retains a large-scale claim | Results/conclusion claims |
| G6 — Reproducibility and submission | Reproducible representative run and complete artifacts | Manifest/configuration, regenerated tables/figures, report, slides, and runnable Colab source | Submission |

Failure at a gate does not authorize an unsupported conclusion or a switch to an unrelated topic. It requires diagnosis, a recorded decision, and an evidence-compatible revision of the remaining plan.

G2-D is a feasibility boundary, not a baseline result. It may use a bounded subset, non-GNN control, or fixed tiny baseline to test pipeline/evaluator execution and a rough resource envelope. It must record scale and hardware, must not tune models, compare samplers, report headline metrics, or generalize to the final run. The former G2-E scale-stress execution is now `G5-S`; before G5, `Home_and_Kitchen` work is limited to provenance, size, and feasibility planning.

### 4.3 Current gate status

| ID | Status | Prerequisites | Active evidence / gap | Decision date | Next review |
|---|---|---|---|---|---|
| G0 | `PASS` | None | Scope, bilingual governance, evidence boundaries, and this plan are recorded. Reopen if scope/title/deliverable rules change. | 2026-08-30 | On governance change |
| G1 | `IN_PROGRESS` | None; runs in parallel with G2 | Preliminary source anchors and a GRAPES-informed reference exist; closest-work positioning and a predeclared selection rule are incomplete. | — | After targeted closest-work review |
| G2 | `IN_PROGRESS` | E0-MIN for executable G2-D only | Temporary raw audits exist; persistent provenance, semantics, split/OOV/negative rules, retained graph, and bounded feasibility remain incomplete. | — | After G2-A–G2-C evidence package |
| G3 | `NOT_STARTED` | G2 `PASS`; E0-MIN `PASS` | No deterministic end-to-end baseline/evaluator/resource path exists. | — | After prerequisites pass |
| G4 | `NOT_STARTED` | G1 `PASS`; G2 `PASS`; G3 `PASS` | Final sampler is not selected or implemented. Reference-design toy tests do not satisfy this gate. | — | After prerequisites pass |
| G5 | `NOT_STARTED` | G4 `PASS`; experiment matrix/configuration/seeds frozen; E0-FINAL for resource claims | No matched final experiment evidence exists. | — | After G4 readiness review |
| G6 | `NOT_STARTED` | G5 `PASS`; E0-FINAL `PASS` | No clean representative rerun or regenerated final evidence package exists. | — | After G5 decision |

### 4.4 Go, corrective-loop, stop, waiver, and reopen rules

- `GO` to G3 only after G2 and E0-MIN pass; `GO` to G4 only after G1, G2, and G3 pass; `GO` to final experiments only after G4 passes and the matrix is frozen.
- Use `CORRECTIVE_LOOP` when evidence is insufficient but an in-scope repair is defined. `STOP` records an impasse and requires an explicit rescope decision; neither status authorizes a topic pivot or a positive claim.
- Reopen G2 when interaction semantics, split, negative eligibility, or training graph changes; invalidate or reopen affected G3–G6 evidence. Reopen G3 and downstream gates when the backbone, evaluator, budget, or resource logger changes materially. Reopen G1/G4 and downstream gates when the selected method changes.
- `WAIVED` is allowed only for optional or administrative scope with authority, rationale, expiry, and an impact statement. Provenance, leakage control, train/test separation, matched comparison, raw-result traceability, uncertainty disclosure, and representative reproducibility cannot be waived. Missing `G5-S` evidence requires narrowing the large-scale claim, not a silent waiver.

## 5. Twelve-week research schedule

| Week | Primary work | Exit artifact or decision |
|---|---|---|
| 1 | Consolidate scope, evidence records, and the dataset-audit starting point; establish this canonical plan. | G0 record; current status and open risks are explicit. |
| 2 | Run persistent Amazon provenance/audit work in Colab; pre-register interaction semantics, duplicate treatment, candidate temporal split, warm-start/OOV treatment, and negative eligibility. | G2 evidence package is ready for review; no model training yet. |
| 3 | Implement the leakage-safe data pipeline, training-only graph statistics, bounded evaluator feasibility path, and simple non-GNN control; continue G1 closest-work review in parallel. | G2 decision or a recorded corrective action; G1 evidence package ready for review. |
| 4 | Establish the shared GNN recommender baseline, deterministic configurations, logging, and resource measurement path. | G3 baseline path passes required sanity checks. |
| 5 | Implement and test bounded graph-sampling controls (for example, uniform and degree-aware sampling) under the same task and budget. | Matched sampling-control comparison is runnable. |
| 6 | Only after G1 and G3 pass, implement the selected proposed sampling mechanism without claiming success. | G4 readiness review. |
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
