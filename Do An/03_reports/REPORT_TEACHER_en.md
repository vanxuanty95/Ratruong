# Ten-Minute Progress Briefing for the Supervisor

> **Thesis:** *Development of a Graph Sampling Method for Large-Scale Recommender Systems Using Graph Neural Networks (GNNs)*
> **Updated:** 2026-09-03
> **Status:** G1, E0-MIN, and Dataset Gate G2 pass. The project may begin G3 baseline/evaluator work. No model or Recall/NDCG result exists.

## 1. Thesis framing — about 1 minute

Phase 2 is an independent Master's thesis on graph sampling for GNN recommendation. Phase 1 and GRAPES remain scientific background, a comparator, and a source of candidate mechanisms; they do not predefine the final thesis method.

The objective is to develop a graph-sampling method and compare it fairly on ranking quality and computational cost. Before modeling, the project freezes a leakage-safe dataset and evaluation protocol through Dataset Gate G2.

## 2. G1 research design — about 1.5 minutes

G1 answers what will be tested and how the method will be chosen before model results exist. The primary question is: at the same layer-wise budget and with the same Baby P4 data, LightGCN-style backbone, BPR batches, negatives, seeds, evaluator, and hardware, can task-conditioned sampling improve the exact full-catalog NDCG@20–resource trade-off over uniform and degree-aware sampling?

The closest-work review shows that the thesis must not claim the first learned sampler for recommendation: PinSage already uses recommender-specific sampling, while DSKReG learns sampling for knowledge-graph recommendation. The narrower potential contribution is controlled evidence for a project-owned task-conditioned sampler on a plain implicit user–item graph.

Six mechanism roles are registered: uniform, degree-aware, layer-dependent structural importance, a learned heuristic mixture, a task-conditioned exact-k policy, and optional GRAPES-informed RL/GFlowNet variants. Uniform and degree-aware are mandatory matched controls. Selection uses validation only: a learned candidate advances only if it enters the NDCG–memory–time Pareto set and improves at least one axis over both static controls at the same budget. Otherwise the valid conclusion is to select no learned method. Test results cannot be used to replace the selected method.

## 3. All research gates at a glance — about 1 minute

The gates prevent the project from moving to an expensive or claim-producing stage before its prerequisites are defensible.

| Gate | Question it answers | Evidence required to proceed | Current status |
|---|---|---|---|
| G0 — Governance | Is the thesis scope, artifact structure, bilingual rule, and claim boundary clear? | Canonical plan, constraints, ownership, and evidence rules | `PASS` |
| G1 — Research design | What exactly is being tested, against what, and how will a method be selected? | Research question, falsifiable hypotheses, closest work, candidate mechanisms, matched comparison, and a predeclared selection rule | `PASS` |
| G2 — Dataset and protocol | Are the data, split, graph, evaluation population, negatives, and candidates valid and leakage-safe? | Provenance, semantics, temporal training-only graph, OOV ledger, exact candidates, and bounded feasibility | `PASS` |
| G3 — Shared baseline path | Can every later method use the same trustworthy training, evaluation, and resource-measurement path? | Deterministic evaluator, sanity checks, MostPop/BPR/LightGCN, uniform and degree-aware controls, and resource logging | `NOT STARTED` — next gate |
| G4 — Proposed-sampler readiness | Is the selected candidate correctly implemented and stable enough for final experiments? | Unit/integration tests, valid exact-k samples, finite losses, diagnostics, and controlled development runs | `NOT STARTED` |
| G5 — Final evidence | Does the method actually improve the declared quality–resource trade-off? | Frozen experiment matrix, paired seeds, uncertainty, ablations, resource traces, failures, limitations, and conditional Home scale stress | `NOT STARTED` |
| G6 — Reproducibility and submission | Can a representative result be regenerated and submitted with complete traceability? | Clean rerun, manifests/configurations, regenerated tables/figures, thesis, slides, and runnable source | `NOT STARTED` |

G2 itself has four sub-gates: G2-A verifies exact source bytes/schema; G2-B fixes positive, anomaly, duplicate, and negative semantics; G2-C freezes the training-only temporal graph and warm/OOV evaluation cohort; G2-D checks bounded execution without comparing models.

Two environment prerequisites run beside the gates. `E0-MIN` records a rerunnable development/bounded environment and is now `PASS`. `E0-FINAL` locks the final GPU, CUDA/software, and profiling procedure before G5 resource claims and is `NOT STARTED`.

The dependency is: G0 governs everything; G1 and G2 define the study; G3 creates the common baseline path; G4 validates the selected sampler; G5 produces final evidence; and G6 proves reproducibility. A failed gate triggers correction, a narrower claim, or a recorded negative result—not permission to skip the control.

## 4. Dataset roles — about 0.5 minute

- `Baby_Products`: primary dataset—large enough to stress graph construction but bounded enough for repeated controlled runs.
- `All_Beauty`: development diagnostic—same schema, but 93.22% raw singleton users and extremely narrow warm retention.
- `Home_and_Kitchen`: conditional scale stress—66,623,880 rows, about 11.19 times Baby; full execution waits for G5-S if the thesis retains a large-scale claim.

Roles are assigned from semantic fit, retained structure, warm coverage, reproducibility/compute, and intended claim—not later model scores.

## 5. Completed audit — about 1.5 minutes

The project created self-contained Colab auditing with persistent checksummed JSON manifests. All Beauty has 693,929 events and zero duplicate pairs. Baby has 5,953,891 raw rows, one quarantined rating `0.0`, and zero duplicate pairs. P4 (`rating >= 4`) was selected because it encodes plausible affinity while retaining more valid positives than P5; all-observed would treat low ratings as positive. Home provenance, schema, checksum, and exact row count are recorded.

The audit establishes data identity, quality, sparsity, long-tail structure, and cohort coverage. It does not establish recommendation quality, sampler superiority, or scalability.

## 6. Completed Baby temporal graph — about 1.5 minutes

The full P4 path produced 3,868,654 training edges, 2,318,308 users, and 162,125 items. User degrees are highly long-tailed (p50 1, p90 3, p99 9; 71.76% singleton); item degrees have p50 3, p90 32, and p99 397. The largest component contains 96.50% of nodes.

Validation retains 81,871/373,776 = 21.90% warm targets. Test retains 40,587/413,413 = 9.82%. Every exclusion reconciles as unseen user, unseen item, or both. The narrow cohort is disclosed explicitly and still contains a substantial absolute test set, so the cutoffs and G2-C protocol are accepted.

## 7. Feasibility and claim boundary — about 1 minute

The amended Drive manifest was read back on 2026-09-03. All five artifact byte sizes and SHA-256 values match. The bounded evaluator traversed 100 targets over 162,125 items: 16,212,500 comparisons and 16,209,544 eligible candidates. The original checks and all four replay invariants pass.

The recorded environment is CPython 3.13.15 on Linux 6.6.122, Intel Xeon with 2 logical CPUs, 12,975.53 MiB RAM, no GPU, Google Colab 1.0.0, and ipykernel 6.17.1. The original traversal took 1.667 seconds and reported 158.24 MiB peak process RSS; the count-only replay took 0.00387 seconds. These timings are not interchangeable. They establish bounded CPU pipeline/evaluator feasibility only—not model runtime, GPU profiling, or scalability. G2-D and E0-MIN therefore pass, closing Dataset Gate G2.

## 8. What exists and what does not — about 1 minute

Completed: bilingual governance; G1 research question, falsifiable hypotheses, closest-work boundary, candidate mechanism family, matched-comparison design, and validation-only Pareto selection/no-selection rule; portfolio audit; P4 semantics; frozen Baby graph and candidates; and 13/13 local pure-Python tests.

Not completed: final sampler selection, PyTorch/PyG recommender, matched baselines, Recall/NDCG results, final GPU profiling, scalability, or novelty claims.

## 9. Next work and supervisor questions — about 0.5 minute

Next: begin G3 shared evaluator and MostPop/BPR/LightGCN plus uniform/degree-aware controls. After G3 passes, the validation-only G1 rule will choose one candidate—or explicitly choose no learned method—for G4.

Questions: Is the 40,587-target warm-start test cohort appropriate? Is the Baby-primary/All-Beauty-diagnostic/Home-scale boundary suitable? What final GPU, thesis template, and defense requirements apply?

## Short fallback script

> I first froze both the research design and the data task before training. G1 defines a matched test of task-conditioned sampling against uniform and degree-aware controls and permits the conclusion that no learned method should be selected. For Baby P4, the temporal training graph has 3.87 million edges, 2.32 million users, and 162 thousand items; the warm-start test cohort has 40,587 targets. The new manifest verifies every artifact and records a reproducible bounded CPU replay, so G2 and E0-MIN now pass. Next is G3 shared evaluator and baseline implementation. No Recall, NDCG, model comparison, GPU profiling, or scalability result exists yet.

## Supporting records

- [`DATASET_PORTFOLIO_AND_ANALYSIS_PROTOCOL_en.md`](../00_project/DATASET_PORTFOLIO_AND_ANALYSIS_PROTOCOL_en.md)
- [`G1_RESEARCH_DESIGN_en.md`](../00_project/G1_RESEARCH_DESIGN_en.md)
- [`THESIS_REPORT_en.md`](../04_thesis/THESIS_REPORT_en.md)
- [`baby_p4_g2c_manifest.json`](../06_code/results/baby_p4_g2c_manifest.json)
- [`G2C_TEMPORAL_GRAPH_en.md`](../06_code/docs/G2C_TEMPORAL_GRAPH_en.md)
