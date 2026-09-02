# Master's Thesis Project Context and Research Rules

> Canonical English continuity file for the Master's thesis project. Read this file and its synchronized Vietnamese counterpart at the beginning of every new session. Update both whenever a research decision, verified result, open question, or working rule changes.

**Last updated:** 2026-08-30
**Revision:** 21 — Gate-driven research structure reset
**User-facing discussion:** Vietnamese by default  
**Analytical working language:** English  
**Persistent artifact language:** Every language-bearing output must have a synchronized English version and Vietnamese version. English filenames end in `_en` and Vietnamese filenames end in `_vn`, immediately before the file extension.

## Canonical live-artifact pointers

- **Phase 2 research plan:** [`00_project/PHASE2_RESEARCH_PLAN_en.md`](./00_project/PHASE2_RESEARCH_PLAN_en.md) and its synchronized Vietnamese counterpart. This is the single source of truth for the 12-week sequence, gates, and dependencies.
- **Dataset portfolio and protocol candidates:** [`00_project/DATASET_PORTFOLIO_AND_ANALYSIS_PROTOCOL_en.md`](./00_project/DATASET_PORTFOLIO_AND_ANALYSIS_PROTOCOL_en.md).
- **Cumulative thesis report:** [`04_thesis/THESIS_REPORT_en.md`](./04_thesis/THESIS_REPORT_en.md).
- **Cumulative defense deck:** [`05_slides/THESIS_PRESENTATION_en.pptx`](./05_slides/THESIS_PRESENTATION_en.pptx).
- **Runnable source and Colab guidance:** [`06_code/README_en.md`](./06_code/README_en.md).
- **Current supervisor briefing:** [`03_reports/REPORT_TEACHER_en.md`](./03_reports/REPORT_TEACHER_en.md).

This continuity file records rules, evidence boundaries, and dated changes. It must point to, rather than duplicate, the active research plan.

## 1. Project identity and phase map

The project is a Master's thesis in Computer Science.

- `/Users/tyvan/Documents/Master/ThucTap2` is **Phase 1**. It contains the submitted research study, implementation work, reproduction work, presentation materials, and supporting notes.
- `/Users/tyvan/Documents/Master/Do An` is **Phase 2**. It is the working area for the official thesis research, including research planning, experiments, reports, slides, datasets or derived artifacts, and the synchronized continuity files.
- The official Phase 1 presentation is:
  [`GRAPES_Presentation_v2.pptx`](</Users/tyvan/Documents/Master/ThucTap2/GRAPES report/GRAPES_Presentation_v2.pptx>)
- `ThucTap2` is a read-only reference area for this collaboration. New or modified persistent deliverables must be written under `Do An` only.
- Disposable processing copies may be created in approved temporary directories. They are not project records and should be removed when they are no longer needed. They must never replace the persistent artifacts under `Do An`.

The high-level relationship is:

```text
Phase 1: topic exploration and GRAPES study/reproduction for node classification
        ↓
Phase 2: official thesis research — develop a graph-sampling method for large-scale GNN recommender systems
        ↓
Master's thesis: evidence-based method development, experiments, and conclusions
```

The user-defined working thesis title is **“Development of a Graph Sampling Method for Large-Scale Recommender Systems Using Graph Neural Networks (GNNs).”** Phase 1 is topic exploration and historical groundwork; it is not a chapter or continuation claim for the final thesis. GRAPES is a scientific foundation and reference implementation whose ideas may be tested, extended, modified, or rejected through evidence. It is not the name, pre-fixed implementation, or sole contribution of the Phase 2 method.

## 2. Phase 1 executive summary

### 2.1 Research context and motivation

The Phase 1 presentation starts from large-scale recommender systems. User–item interactions can be represented as graphs, and GNNs can exploit multi-hop relational information through message passing. Industrial-scale graph learning creates a scalability problem: an `L`-layer GNN may require information from an expanding `L`-hop neighborhood for each target node.

The presentation uses the approximation `O(d̄^L)` to explain the intuition behind **neighbor explosion**. This is a useful worst-case or illustrative argument, not a universal complexity law: actual cost also depends on degree heterogeneity, neighborhood overlap, graph density, caching, implementation, and the sampling strategy.

The presentation distinguishes neighbor explosion from two other GNN difficulties—oversmoothing and oversquashing—and deliberately focuses Phase 1 on neighbor explosion as the scalability bottleneck.

**Source evidence:** official deck, slides 3–8.

### 2.2 Research question

The Phase 1 research question is:

> Can a learned, graph- and task-adaptive node-sampling policy reduce the memory cost of GNN training while retaining downstream prediction quality, instead of relying only on static sampling heuristics?

The scope presented in Phase 1 is large-graph **node classification**. Recommendation and link prediction are motivation and future directions, not completed Phase 1 tasks.

**Source evidence:** official deck, slide 11; primary GRAPES paper listed in Section 8.

### 2.3 Landscape of approaches reviewed

The presentation groups scalable GNN approaches into three broad families:

1. **Sampling:** select a limited number of nodes or subgraphs per iteration. Examples include GraphSAGE, PinSage, VR-GCN, FastGCN, AS-GCN, LADIES, ClusterGCN, and GraphSAINT.
2. **Decoupling:** precompute graph propagation and train a separate predictor, reducing repeated message passing but changing the model structure.
3. **Historical embeddings:** reuse embeddings from previous iterations to reduce the computation graph, as in GNNAutoScale/GAS.

The stated motivation for selecting GRAPES is that it learns a task-oriented sampling policy rather than fixing the policy in advance. This should be described precisely: the literature already contains adaptive or learnable sampling-related methods, so the defensible distinction is the way GRAPES optimizes task-relevant sampling through a second GNN and a GFlowNet, not the claim that all earlier work is non-adaptive.

**Source evidence:** official deck, slides 9–12.  
**Scientific qualification:** compare against the primary papers rather than repeating a broad “no prior learned policy” claim.

### 2.4 GRAPES method as presented

GRAPES is an existing method studied in Phase 1; Phase 1 does not claim to invent it.

The high-level pipeline is:

1. Start with a target mini-batch `V⁰`.
2. A sampler GNN, shown as `GCN_S`, estimates sampling probabilities for candidate neighboring nodes.
3. Gumbel Top-k selects exactly `k` nodes without replacement for the next layer. The Top-k operation itself provides no functional gradient. GRAPES therefore trains the sampling policy with either REINFORCE or GFlowNet rather than differentiating directly through Top-k.
4. A classifier GNN, shown as `GCN_C`, runs on the sampled computation graph and produces the downstream node-classification loss.
5. A GFlowNet uses task feedback to learn a distribution over useful sampled subgraphs. The classifier loss defines a reward proportional to `exp(−α L_C)`, and the GRAPES-GFN variant uses a Trajectory Balance objective. Exact reward scaling and off-policy assumptions must be attributed to the paper version used.
6. Sampling is applied layer by layer. In GRAPES arXiv v3, `K⁰ = V⁰` and `Kˡ = Vˡ ∪ V⁰`; `Vˡ` contains exactly `k` nodes sampled from the candidate neighborhood of `Kˡ⁻¹`. This is not the cumulative union `V⁰ ∪ V¹ ∪ … ∪ Vˡ` suggested by the simplified deck graphic.
7. The classifier uses a layer-dependent adjacency between `Kˡ` and `Kˡ⁻¹`. The sampled adjacency changes across layers, and message passing is asymmetric under this formulation; it should not be described as one undifferentiated flat subgraph.

The core conceptual distinction is **learned adaptive node sampling**. GRAPES does not directly solve every memory problem in a graph: it samples nodes, and dense or high-degree bipartite graphs may still require explicit edge- and memory-budget analysis.

**Source evidence:** official deck, slides 13–16; GRAPES arXiv:2310.03399v3, Sections 3–4 and Algorithm 1, listed in Section 8.

### 2.5 Phase 1 experimental setup

The presentation reports two related evidence streams.

**Original benchmark results presented in the deck**

- 12 datasets: 7 described as homophily datasets and 5 as heterophily datasets.
- Homophily group: Cora, CiteSeer, PubMed, Reddit, ogbn-arxiv, ogbn-products, and DBLP.
- Heterophily group: Flickr, snap-patents, Yelp, ogbn-proteins, and BlogCat.
- Batch size: 256 nodes.
- Samples: 256 nodes per layer.
- Runs: 10, summarized as mean ± standard deviation.
- Hardware stated by the deck for the original study: NVIDIA RTX A6000, 48 GB.
- Evaluation: full-graph inference on the test set.
- Metrics: macro-F1 and micro-F1 are stated in the experimental setup; the visible result tables report F1 values.

**Independent reproduction presented in the deck**

- Google Colab on a Tesla T4 with 15.6 GB VRAM.
- PyTorch 2.11 and PyTorch Geometric 2.7 are stated.
- Four datasets: Cora, CiteSeer, ogbn-arxiv, and ogbn-products.
- Three runs per dataset are stated.
- The large ogbn-products run is reported as completing 9/10 epochs without out-of-memory failure.

**Source evidence:** official deck, slides 17 and 20. The current GRAPES arXiv v3 experimental appendix reports work across RTX A4000 16 GB, A100 40 GB, and RTX A6000 48 GB machines, each with 48 CPUs; it does not map every displayed result to one machine. Exact optimizer settings, learning rates, layer counts, reward coefficient, epoch schedule, and data splits should be taken from the versioned primary paper or raw run configuration, not inferred from the deck.

### 2.6 Results reported in the presentation

The safe interpretation of the visible tables is:

- GRAPES is not the universal winner on homophily datasets. The relative ranking depends on the dataset and baseline.
- On heterophily datasets, a GRAPES variant is marked as the best sampling method on 4/5 datasets in the presentation; AS-GCN is marked best on snap-patents.
- GAS has a high absolute score on Flickr but carries the storage cost of historical embeddings.
- The reproduction table reports the following comparisons against Random sampling:

| Dataset | GRAPES-GFN | Random | Difference or status |
|---|---:|---:|---:|
| Cora | 87.10 ± 0.17 | 86.77 ± 0.38 | +0.33 |
| CiteSeer | 78.57 ± 0.71 | 79.00 ± 0.82 | −0.43 |
| ogbn-arxiv | 62.04 ± 0.31 | 61.28 ± 0.29 | +0.76 |
| ogbn-products | 9/10 epochs completed | Not reported | No OOM reported on 15.6 GB |

- The reported resource trade-off is approximately **2.3–3.2× more GPU memory** and **1.4–1.8× more epoch time** for GRAPES-GFN than Random sampling in the measured examples.

**Source evidence:** official deck, slides 18–21. These are claims made by the presentation and should be cross-checked against raw logs and the primary paper before being used as final thesis results.

### 2.7 Phase 1 conclusion and limitations

The presentation’s conclusion is that learned adaptive sampling is promising for scalable GNN training, particularly when the graph is large, the sampling budget is small, and the data are heterophilous or multi-label. The principal trade-off is additional computation and memory for the sampler and GFlowNet.

The limitations identified or implied by the presentation and the two independent reviews are:

- GRAPES adds a second GNN and therefore costs more than simple Random sampling.
- GFlowNet behavior can depend on reward design and hyperparameters.
- The demonstrated task is node classification; recommendation and link prediction are not experimentally validated in Phase 1.
- Node sampling is not the same as direct edge sampling, so high-degree or dense graphs need separate edge and memory analysis.
- The reproduction is partial evidence, not a complete independent validation: it uses different hardware, four datasets, three runs, and an incomplete 9/10-epoch large-graph run.
- The `O(d̄^L)` argument is an intuition/worst-case approximation and must not be reported as an unconditional complexity theorem.

## 3. Phase 1 versus Phase 2 boundary

Slides 23–29 are **proposals and a roadmap for Phase 2**, not completed Phase 1 evidence. They motivate the thesis topic but do not define its final method. The Phase 1 deck's Amazon Reviews'23, 5-core, temporal split, BPR, Recall@K, NDCG@K, and baseline suggestions remain candidate ingredients that require independent scientific validation.

### What Phase 2 should preserve from Phase 1

- Explicit memory and runtime measurement.
- Strong baselines, including simple Random sampling and established recommendation models where relevant.
- Reproducible seeds, software versions, hardware details, and raw experiment logs.
- Controlled ablations for sampling budget, reward design, sampler overhead, and model architecture.
- Strict train/validation/test separation and leakage prevention, especially with temporal recommendation data.
- A clear distinction between accuracy, scalability, memory, and wall-clock cost.

### What Phase 2 must not assume

- That GCN, Gumbel Top-k, or `exp(−α L_BPR)` is already validated for recommendation.
- That node sampling alone controls memory on a high-degree bipartite graph.
- That 5-core filtering, batch size 512, or the proposed Amazon categories are optimal.
- That success on node classification transfers automatically to link prediction or recommendation.
- That a direct transfer is already validated or guaranteed to improve recommendation.

Phase 2 is a genuine method-development research problem: define, justify, implement, and evaluate a graph-sampling method for a user–item recommendation graph. Literature review determines which established ideas are adopted, extended, or excluded. Unsupported hypotheses and unsuccessful design choices remain valid negative findings within this thesis topic.

## 4. Evidence cautions recorded for future work

These points must remain visible so that they are not accidentally repeated as established facts:

1. **“GRAPES-GFN outperforms GRAPES-RL on 10/12 datasets.”** Slide 29 states this, but the claim is `CONTRADICTED BY PRIMARY SOURCE v3`. Comparing mean F1 values in Tables 1–2 of GRAPES arXiv v3, GFN is higher on 6/12 datasets, equal on CiteSeer, and lower on 5/12. These are comparisons of reported means, not claims of statistical significance. Preserve 10/12 only as a documented deck discrepancy.
2. **OOM comparisons.** The presentation contains OOM statements under particular experimental conditions. Do not generalize them to all hardware, implementations, or datasets without recording the exact configuration.
3. **Bibliographic year.** The deck labels GRAPES as “TMLR 2024.” The primary publication metadata currently lists the Transactions on Machine Learning Research publication as May 2025, while the arXiv preprint is from 2023. Future thesis citations must use the verified publication record and retain the preprint identifier where useful.
4. **Adaptive sampling claim.** Do not state that all earlier methods are fixed or non-learned. Compare GRAPES with adaptive or learnable baselines discussed in the primary paper, including AS-GCN, PASS, GNN-BS, SubMix, and DSKReG where relevant.
5. **Gumbel Top-k claim.** Gumbel Top-k samples exactly `k` nodes without replacement but does not provide a functional gradient through Top-k. GRAPES uses REINFORCE or GFlowNet to train the policy and documents an off-policy mismatch between conditioned sampling and the distribution used in the learning objective.
6. **Sampling-set notation.** The current primary paper defines `K⁰ = V⁰` and `Kˡ = Vˡ ∪ V⁰`, with a layer-dependent adjacency between `Kˡ` and `Kˡ⁻¹`. Do not reuse the cumulative-union simplification from the deck as the formal algorithm.
7. **Source versions.** The submitted deck may reflect an earlier GRAPES version. Numerical results and algorithm details used in future work must identify the source version; the current paper source reviewed here is arXiv:2310.03399v3, revised 2025-07-15.
8. **Missing experimental details.** If a number, setting, or formula is not in a primary source or raw experiment record, label it `UNKNOWN` or `NEEDS VERIFICATION`; never fill it by intuition.

## 5. Working rules for every future prompt

These rules are part of the project specification.

1. **Language and bilingual-output rule.** User-facing discussion must be in Vietnamese by default, while analytical reasoning must be conducted in English. Every persistent language-bearing output—including reports, papers, slides, Markdown files, prose-bearing tables, captions, and experiment notes—must be created as a synchronized English/Vietnamese pair. Place `_en` immediately before the extension for the English version and `_vn` immediately before the extension for the Vietnamese version; for example, `REPORT_en.md` and `REPORT_vn.md`. The two versions must have the same evidence, decisions, claim labels, structure, tables, citations, and substantive meaning. Code, raw data, machine-generated logs, model checkpoints, environment lockfiles, bibliographic databases, and other language-neutral or tool-constrained files do not require duplicate translation unless explicitly requested. If a format permits only one technical filename, create paired human-readable documentation instead of duplicating machine artifacts.
2. **Continuity rule.** `PROJECT_CONTEXT_AND_RESEARCH_RULES_en.md` is the canonical English continuity record and `PROJECT_CONTEXT_AND_RESEARCH_RULES_vn.md` is its synchronized Vietnamese counterpart. Both must be read first and updated after every substantive change to project state, including a research decision, verified or contradicted claim, unresolved issue, experiment result, or next action. Handoff entries are appended; current-status sections may be edited in place. If a task is explicitly read-only or writing is unavailable, disclose that the update is deferred and perform it in the next writable session. System, safety, and task-specific restrictions take precedence over this update rule.
3. **Scientific-evidence rule.** Every substantive claim in a report, presentation, implementation rationale, or discussion must have appropriate evidence. Prefer the original scientific paper, official dataset documentation, official benchmark, or raw experiment record. Use recent and directly relevant papers whenever possible.
4. **No-fabrication rule.** Do not invent data, citations, authors, years, equations, hyperparameters, experimental outcomes, or explanations. If uncertain, stop and verify; if verification is not yet possible, mark the item `UNKNOWN`, `NEEDS VERIFICATION`, or `PROPOSED`.
5. **Multi-agent discussion rule.** For every substantive research, writing, or design prompt, create at least two agents with distinct independent roles. After their independent passes, run a cross-critique or rebuttal round, then have the main agent adjudicate disagreements against primary sources or reproducible evidence. Record agent roles, material disagreements, and the reason for the final decision. If agents are unavailable, disclose the limitation and do not finalize high-impact research conclusions as though multi-agent review occurred. Routine status checks and purely mechanical file operations do not require this protocol.
6. **Phase-boundary, title, and method-ownership rule.** Treat Phase 1 as topic exploration plus study/reproduction of GRAPES for node classification. Phase 2 is the official thesis, with the user-defined working title **“Development of a Graph Sampling Method for Large-Scale Recommender Systems Using Graph Neural Networks (GNNs).”** Develop the thesis method as a project-owned research contribution from first principles, grounded in literature and controlled experiments. GRAPES is a foundation, comparator, and source of candidate mechanisms—not a pre-fixed method to be copied, not the thesis title, and not a claim that Phase 2 merely continues Phase 1. Do not make an unsupported novelty claim; state exactly which components are adopted, changed, newly designed, or rejected and justify each with evidence. Baselines, ablations, literature comparisons, failure analysis, and task-specific design changes are required parts of method development.
7. **Researcher-workflow rule.** Work like a careful PhD researcher: define the problem, review literature, state hypotheses, plan controlled experiments, establish baselines, track confounders, analyze uncertainty, document limitations, and only then draw conclusions.
8. **File-organization rule.** Keep all new or modified persistent content under `Do An`. Treat `ThucTap2` as read-only reference material. Disposable processing files may use approved temporary directories but are not project records. Organize outputs so that source data, code, experiments, reports, slides, and decisions can be traced without ambiguity. Apply `_en`/`_vn` suffixes to the basename before the final extension, including compound formats where appropriate, and never leave an unsuffixed language-bearing output as the sole project record.
9. **Supervisor-briefing rule.** Maintain `03_reports/REPORT_TEACHER_en.md` and `03_reports/REPORT_TEACHER_vn.md` as one synchronized, current supervisor briefing—not a sequence of separate weekly reports. Refresh it before a supervisor meeting or when material evidence changes. It must present the current thesis objective, evidence-linked progress, decisions, open risks, prioritized questions, next actions, and a concise oral update. A dated decision log may preserve provenance, but weekly sections must not replace or fragment the cumulative thesis narrative. Distinguish a recorded artifact from implemented, executed, or validated work. A claim may advance through `planned -> specified -> implemented -> executed -> validated` only when the corresponding evidence exists.
10. **Cumulative thesis-deliverable rule.** The project has three mandatory living outputs: (a) one cumulative university-submission thesis report, (b) one cumulative presentation/defense slide deck, and (c) source code runnable from a clean Google Colab runtime. Maintain the report and slides as synchronized English/Vietnamese artifact pairs under `04_thesis` and `05_slides`; they are continuously refined toward the final thesis, not recreated or titled by week. Do not use week numbers as the title, primary narrative, filename, or slide footer of these deliverables. Weekly work only supplies verified evidence that is integrated into the same living report and deck. Keep one language-neutral technical source under `06_code`, with paired `_en`/`_vn` README or operating documentation. The Colab code package must ultimately install from a pinned dependency/environment lock, use versioned data and configuration manifests, expose deterministic commands and tests, support checkpoint/resume where appropriate, and reproduce every executable thesis claim from a clean runtime. After each substantive discussion, decision, source correction, implementation change, experiment, or supervisor response, assess its impact on all three outputs and update every affected artifact in the same task. If an update cannot yet be made, record the exact deferred artifact, reason, evidence gap, and next action in both continuity files. Keep report methods/results/limitations, slide summaries, and code/configuration/tests mutually consistent; never advance an artifact beyond the evidence maturity `planned -> specified -> implemented -> executed -> validated`.

### 5.1 Evidence labels

Use these labels for consequential research statements:

- `VERIFIED FACT`: directly supported by a versioned primary source, official documentation, or reproducible raw result.
- `INFERENCE`: a reasoned interpretation derived from stated evidence; list the supporting evidence and assumptions.
- `HYPOTHESIS`: a testable expectation that still requires an experiment or analysis.
- `PROPOSAL`: a candidate method, dataset, metric, or plan that has not been selected or validated.
- `UNKNOWN`: information not currently available.
- `NEEDS VERIFICATION`: a concrete claim for which evidence should exist but has not yet been checked.
- `CONTRADICTED`: a claim that conflicts with stronger or newer evidence; preserve the discrepancy and cite both sources.

### 5.2 Verification register

Track only unresolved claims that could materially affect the thesis.

| ID | Claim or issue | Status | Evidence required | Next action |
|---|---|---|---|---|
| V-001 | Deck claim: GRAPES-GFN outperforms GRAPES-RL on 10/12 datasets | `CONTRADICTED` | GRAPES v3 Tables 1–2 and, if needed, raw result files | Do not repeat as a result; retain as a deck discrepancy |
| V-002 | Phase 1 reproduction values and resource ratios are complete and reproducible | `NEEDS VERIFICATION` | Raw logs, seeds, configs, run completion status, and measurement code | Locate and audit Phase 1 raw artifacts before reusing the numbers in the thesis |
| V-003 | Exact Amazon Reviews'23 release, category, and post-filter counts for Phase 2 | `PARTIAL: TEMPORARY RAW AUDIT EXECUTED; POST-FILTER UNKNOWN` | Persistent acquisition manifest/checksum, protocol decisions, and preprocessing output | Re-run in Colab, resolve OOV/split policy, and close Gate G2 |
| V-004 | Phase 2 institutional, time, compute, storage, and success constraints | `PARTIALLY RESOLVED` | User and supervisor requirements plus measured infrastructure | The 12-week window, Python, Amazon, Colab, and high expectation are known; collect the remaining supervisor/template details |
| V-005 | The project-developed graph-sampling method has an accurately bounded scientific contribution | `NEEDS VERIFICATION` | Closest-work matrix covering graph type, sampler, recommendation task, loss/reward, datasets, and evaluation protocol | Define method components and complete the closest-work review before making a novelty claim |
| V-006 | Exact Git commit used by the Phase 1 reproduction | `UNKNOWN; UNRECOVERABLE FROM CURRENT ARTIFACTS` | Original clone metadata, `.git` directory, or contemporaneous commit record | Preserve the local content fingerprint and never present the current official pin as the Phase 1 commit |
| V-007 | Correct Phase 2 interpretation of the paper/code discrepancies in REINFORCE sign, `log Z` conditioning, and sampled-block orientation | `DECISION RESOLVED; ORACLES REGISTERED` | Written gradient/message-passing oracles against the frozen decisions | Implement T12, T18, and T19 before learned-policy implementation |
| V-008 | Executable Phase 2 software/GPU environment and experiment capacity | `PROPOSED; AVAILABILITY UNKNOWN` | Version-locked environment, fixed borrowed GPU, measured pilot runtime, and persistent cloud location | Request one fixed A100 80 GB; use Colab for development; freeze versions and compute after confirmation/profiling |

## 6. Standard research workflow for Phase 2

Unless a later decision explicitly changes it, use this order:

1. Read this continuity file and identify the current open questions.
2. Define one primary research question and a small number of testable hypotheses.
3. Perform a targeted literature review using primary papers and record the evidence matrix in `Do An`.
4. Audit the candidate data, graph construction, labels/interactions, temporal split, negative sampling, and leakage risks.
5. Implement or verify simple baselines before adding adaptive sampling.
6. Define resource metrics in advance: peak GPU memory, wall-clock time, throughput, number of sampled nodes/edges, and task quality.
7. Implement the proposed method as a controlled change, with ablations and fixed seeds.
8. Run repeated experiments, retain raw outputs, report uncertainty, and investigate failures rather than hiding them.
9. Compare the result with the hypothesis and with the strongest justified baselines.
10. Update both synchronized continuity files with the decision, evidence, limitations, and next step before ending the session.

## 7. Current status and open questions

### Completed or established

- Official Phase 1 deck located and reviewed: 29 slides.
- Deck rendered and visually inspected from a temporary copy; the source file in `ThucTap2` was not modified.
- Two independent agent reviews completed and reconciled.
- Phase 1 identified as study/reproduction of GRAPES, focused on scalable GNN node classification.
- The thesis topic is the development of a graph-sampling method for large-scale GNN recommender systems. It is an independent Phase 2 thesis project, not a continuation chapter of Phase 1.
- Two independent scope/governance reviews and a cross-critique round confirmed that GRAPES is a scientific foundation, comparator, and source of candidate mechanisms only.
- Older `PHASE2_DIRECTION_REVIEW_*` files and direct-adaptation scope locks are historical records and are superseded as canonical scope by this Revision 16 decision.
- The current GRAPES sampler + LightGCN-style recommender + BPR + RL/GFlowNet path is a `GRAPES-INFORMED REFERENCE DESIGN`, not the required or final thesis method. D1–D11 and T01–T25 are reference design/verification candidates pending method selection.
- The research must remain focused on graph sampling for large-scale GNN recommendation; component choices, baselines, ablations, and method revisions are decided by literature, data constraints, and experimental evidence.
- If a candidate design fails, the project records the result and its analysis within the same thesis topic; it does not silently claim transfer, effectiveness, or novelty.
- Week 1 has started. GRAPES paper semantics are pinned to arXiv:2310.03399v3 and the current official code reference is pinned to commit `71ecebeaac896800aa4dd1d0f38c57ec222ef396`, accessed 2026-08-26.
- The exact Phase 1 code commit is not recoverable from the current artifacts; its unversioned local snapshot is preserved only by a recorded content-manifest fingerprint and is not the Phase 2 canonical source.
- Bilingual constraint, source-version, literature-matrix, and draft recommendation-specification artifacts now exist under `00_project`, `01_literature`, and `02_protocol`.
- The recommendation specification marks D1–D11 as `REFERENCE-SPECIFIED` for the GRAPES-informed reference design. These decisions do not select or close the thesis method.
- Canonical G1 is `IN_PROGRESS` for closest-work positioning, research-design rationale, matched comparison, and a predeclared method-selection rule. Environment execution is tracked separately as E0-MIN/E0-FINAL.
- The current local machine is an Apple M4 Mac mini with 16 GB unified memory and no NVIDIA CUDA device. It is suitable for documentation and toy correctness tests after an environment is created, but it is not treated as the final benchmark platform.
- User-supplied execution constraints are now recorded: 12 weeks, Python implementation, Amazon Reviews data sourced by the project, borrowable GPU capacity, Google Colab availability, and high expected thesis quality.
- The active data proposal is Amazon-only: `All_Beauty` 0-core validates the pipeline and `Baby_Products` 0-core is the proposed primary thesis category. MovieLens is retired from the active plan.
- Colab removes local disk capacity from the feasibility gate and supports development runs, but temporary Colab VMs are not the canonical source for final runtime/memory comparisons.
- The canonical final-hardware request is one fixed A100 80 GB; a second GPU is optional seed-parallel capacity. Exact access and measured GPU-hours remain open.
- The synchronized supervisor briefing now exists at `03_reports/REPORT_TEACHER_en.md` and `03_reports/REPORT_TEACHER_vn.md`; it is a current supporting record, not a weekly thesis deliverable.
- The three mandatory living thesis outputs are now fixed: the university-submission report, presentation/defense slides, and Google-Colab-runnable source code. They must evolve throughout the project and remain synchronized with verified project state rather than being assembled only at the end.
- The Week 1 deliverable audit initially found that `04_thesis`, `05_slides`, and `06_code` did not yet exist. Existing evidence was sufficient to initialize the report and a working slide deck at the scope/background/method-design/evaluation-plan level. The code was semantic-contract ready only at that audit point.
- The cumulative thesis deliverables are initialized: bilingual working thesis reports under `04_thesis`, bilingual PowerPoint decks under `05_slides`, and a bilingual-documented Python/Colab scaffold under `06_code`. The scaffold passes 10/10 pure-Python toy contract tests locally; this is not validation of a final Phase 2 method, Amazon pipeline, full oracle suite, or benchmark.
- Both presentation decks were rendered and passed the overflow check. Their speaker notes contain `[Sources]` blocks. The decks are working evidence-boundary artifacts and must be updated when implementation or experiment evidence changes the narrative.
- The Week 2 dataset audit has progressed from setup to a temporary local raw execution. `All_Beauty` and `Baby_Products` were downloaded from the exact official URLs; their compressed sizes, SHA-256 values, raw schema, quality counts, degree summaries, candidate absolute-split OOV diagnostics, and negative-pool diagnostics are recorded in `06_code/docs/DATASET_AUDIT_RESULTS_*`. The raw files are not stored persistently.
- The local audit found 693,929 valid `All_Beauty` rows with zero exact duplicate pairs, and 5,953,891 parsed `Baby_Products` rows with one out-of-range `rating=0.0`; the large-scale Baby duplicate-pair count remains unknown because the SQLite scan was not completed. The published absolute split has high validation/test OOV, so it is not accepted as the primary warm-start protocol yet.
- The dependency-free streaming analyzer and paired Colab notebooks now cover provenance, SHA-256, schema, duplicate pairs, rating/timestamp checks, degree summaries, candidate absolute-split coverage, and negative-pool diagnostics. Persistent Colab acquisition, protocol closure, and post-filter training-universe statistics remain open.
- Gate identity, status, dependencies, and blocking rules are governed only by the bilingual canonical plan. Active constraint/source/spec records now point to that registry; dated historical log entries remain historical evidence.

### Open questions within the locked Phase 2 direction

- Do the executable T01–T25 tests reproduce every frozen semantic oracle, especially prefix-depth propagation, `log Z` conditioning, and the two-action RL gradient?
- Which shared embedding width, sampler learning rate, `k`, `alpha`, and batch size survive the Week 3 resource/validation protocol without sampler-specific test tuning?
- Which exact version and post-filter statistics of Amazon Reviews'23, if selected, will be used?
- What negative-sampling and temporal-evaluation protocol is scientifically defensible?
- Which exact Python/PyTorch/PyG/CUDA lock is compatible with both Colab development and the confirmed final GPU?
- Which Phase 1 reproduction values and resource measurements can be traced to complete raw logs, configurations, seeds, and finished runs?

### Phase 2 constraints still open

- Exact calendar submission/defense dates inside the 12-week window: `UNKNOWN`.
- Supervisor milestones, meeting cadence, and formal novelty/evaluation rubric: `UNKNOWN`.
- Exact borrowed GPU, exclusive profiling window, and measured GPU-hours: `UNKNOWN`; one fixed A100 80 GB is `PROPOSED`.
- Colab tier/compute units and persistent cloud location/retention policy: `UNKNOWN`; Colab availability and non-local storage capacity are known.
- Exact Amazon `Baby_Products` artifact hash, access/usage note, split cutoffs, and post-filter counts: `UNKNOWN`.
- Required thesis template, length, and submission language: `UNKNOWN`; Python is only the locked implementation language.
- A numerical success threshold is intentionally not invented. “High expectations” means complete specification/tests, controlled baselines, leakage-safe data, uncertainty/resource reporting, and clean reproducibility.

These remaining constraints do not reopen the research direction. Experiment scale freezes only after the Amazon audit and measured Week 3 pilot.

### Next executable action

Advance G1 and G2 in parallel. For G1, complete the targeted closest-work review and predeclare the method-selection rule without selecting a sampler prematurely. For G2, complete persistent provenance and pre-register interaction, duplicate, split/OOV, and negative rules. In parallel, satisfy E0-MIN. Do not start G3 until G2 and E0-MIN pass, or G4 until G1–G3 pass.

## 8. Reference anchors

These are starting points, not a substitute for checking the exact version and citation metadata before a final thesis submission.

- Younesian, T., Daza, D., van Krieken, E., Thanapalasingam, T., and Bloem, P. “GRAPES: Learning to Sample Graphs for Scalable Graph Neural Networks.” *Transactions on Machine Learning Research*, publication metadata lists May 2025. Current paper source reviewed here: [arXiv:2310.03399v3](https://arxiv.org/abs/2310.03399v3), revised 2025-07-15; publication record: [OpenReview PDF](https://openreview.net/pdf?id=QI0l842vSq).
- Bengio, E., Jain, M., Korablyov, M., Precup, D., and Bengio, Y. “Flow Network based Generative Models for Non-Iterative Diverse Candidate Generation.” NeurIPS 2021; arXiv: [2106.04399](https://arxiv.org/abs/2106.04399).
- Ying, R., He, R., Chen, K., Eksombatchai, P., Hamilton, W. L., and Leskovec, J. “Graph Convolutional Neural Networks for Web-Scale Recommender Systems.” KDD 2018; arXiv: [1806.01973](https://arxiv.org/abs/1806.01973).
- Fey, M., Lenssen, J. E., Weichert, F., and Leskovec, J. “GNNAutoScale: Scalable and Expressive Graph Neural Networks via Historical Embeddings.” ICML 2021; arXiv: [2106.05609](https://arxiv.org/abs/2106.05609).
- Hamilton, W. L., Ying, Z., and Leskovec, J. “Inductive Representation Learning on Large Graphs.” NeurIPS 2017; arXiv: [1706.02216](https://arxiv.org/abs/1706.02216).
- Hu, W. et al. “Open Graph Benchmark: Datasets for Machine Learning on Graphs.” NeurIPS 2020; arXiv: [2005.00687](https://arxiv.org/abs/2005.00687).
- Hou, Y., Li, J., Fu, X., He, Z., Yan, A., Chen, X., and McAuley, J. “Bridging Language and Items for Retrieval and Recommendation: Benchmarking LLMs as Semantic Encoders.” Source paper for the Amazon Reviews 2023 dataset and the BLaIR benchmark. Current source reviewed here: [arXiv:2403.03952v2](https://arxiv.org/abs/2403.03952v2), revised 2026-04-20; metadata notes ACL 2026. Phase 2 must still pin the exact dataset release and derived statistics used.
- Xu, X. et al. DSKReG, a differentiable-sampling method for knowledge-graph recommendation. [arXiv:2108.11883](https://arxiv.org/abs/2108.11883). This prevents any unsupported “first learned sampler for recommendation” claim.
- He, X. et al. “LightGCN: Simplifying and Powering Graph Convolution Network for Recommendation.” SIGIR 2020; [arXiv:2002.02126](https://arxiv.org/abs/2002.02126).
- Rendle, S., Freudenthaler, C., Gantner, Z., and Schmidt-Thieme, L. “BPR: Bayesian Personalized Ranking from Implicit Feedback.” UAI 2009; [arXiv:1205.2618](https://arxiv.org/abs/1205.2618).
- The evaluation protocol must account for primary evidence on temporal leakage and metric sampling; starting anchors are the recommender [data-leakage study](https://arxiv.org/abs/2010.11060) and [sampled-metric analysis](https://arxiv.org/abs/1912.02263).

Additional baselines—GCN, GAT, FastGCN, AS-GCN, LADIES, ClusterGCN, GraphSAINT, NGCF, LightGCN, and related methods—must be cited from their original papers when they appear in future artifacts.

## 9. Session handoff template

At the end of each substantial session, update this file with:

```text
Date:
Decision or result:
Evidence/source:
Agents consulted, roles, and identifiers:
Independent findings:
Cross-critique and disagreement:
Adjudication and rationale:
Claims added, verified, contradicted, or retired:
What remains uncertain:
Next action:
Files created or changed in Do An:
```

### Initial handoff — 2026-08-25

- **Decision or result:** Created this canonical English continuity file after reviewing the 29-slide official Phase 1 deck.
- **Evidence/source:** Official deck at `ThucTap2/GRAPES report/GRAPES_Presentation_v2.pptx`; primary-paper anchors and publication metadata are linked in Section 8.
- **Agents consulted and consensus/disagreement:** Two independent reviews were used. They agreed that Phase 1 is a study/reproduction of GRAPES for scalable node classification and that Phase 2 must be treated as a new research problem. Both flagged the unverified “10/12” claim and the need to distinguish deck claims from primary evidence.
- **What remains uncertain:** The final Phase 2 research question, complete raw-result reconciliation, exact bibliographic metadata to use in the thesis, and the data/evaluation protocol for any recommendation extension.
- **Next action:** Conduct a targeted Phase 2 literature review and compare candidate research directions before fixing the method, dataset, or loss.
- **Files created or changed in Do An:** `PROJECT_CONTEXT_AND_RESEARCH_RULES_en.md` (originally created without a suffix; later renamed under the bilingual-output rule).

### Model-switch audit — 2026-08-25

- **Decision or result:** Re-audited the continuity file after a model change and corrected factual and operational gaps.
- **Evidence/source:** Official Phase 1 deck; GRAPES arXiv:2310.03399v3; Amazon Reviews 2023/BLaIR arXiv:2403.03952v2.
- **Agents consulted, roles, and identifiers:** Euler (`01a03973-f323-79d3-89cf-6da7c1c5ef85`) audited continuity, rules, and handoff quality. Banach (`01a0397c-e61e-77f3-afa7-c507beb6de52`) audited scientific claims and citations. Socrates (`01a03973-f34d-7290-acd1-a70ffbda2ecd`) was started for scientific review but did not return a usable result and was closed; none of its output was used.
- **Independent findings:** Euler identified ambiguity in the language policy, insufficient claim-status taxonomy, weak agent traceability, missing Phase 2 constraints, and an incomplete multi-agent discussion protocol. Banach identified the false 10/12 summary claim, incomplete hardware attribution, incorrect Amazon paper title, incorrect cumulative sampling-set description, and an oversimplified Gumbel Top-k explanation.
- **Cross-critique and disagreement:** Both completed agents reviewed the other audit's proposed changes. They agreed on the scientific corrections, language boundary, lightweight verification register, cross-critique requirement, and explicit unknown constraints. They agreed that mandatory checksums, exhaustive temporary-file logs, and per-prompt changelog entries would overcomplicate this canonical file.
- **Adjudication and rationale:** Accepted changes that prevent scientific misreporting or loss of project state. Rejected administrative overhead that does not materially improve research validity or session continuity.
- **Claims added, verified, contradicted, or retired:** Marked the deck's 10/12 claim `CONTRADICTED`; corrected the Amazon Reviews 2023 citation; versioned GRAPES and Amazon sources; corrected GRAPES layer-set notation and Gumbel Top-k behavior; separated deck-reported hardware from the broader primary-paper hardware record.
- **What remains uncertain:** Phase 1 raw reproduction traceability; the final Phase 2 direction; institutional requirements; deadline; compute, storage, and dataset-access constraints; success criteria.
- **Next action:** Collect the missing Phase 2 constraints and produce `PHASE2_DIRECTION_REVIEW_en.md` with a source-backed comparison and recommendation.
- **Files created or changed in Do An:** `PROJECT_CONTEXT_AND_RESEARCH_RULES_en.md` (renamed in the subsequent bilingual-output update).

### Phase 2 planning handoff — 2026-08-25 (`SUPERSEDED`)

- **Decision or result:** `SUPERSEDED BY THE LATER USER SCOPE LOCK.` This historical handoff produced a resource-constrained adaptive-sampling recommendation and an empirical fallback. Neither remains an active Phase 2 direction.
- **Evidence/source:** Primary anchors include GRAPES arXiv:2310.03399v3, DSKReG arXiv:2108.11883, LightGCN arXiv:2002.02126, UltraGCN arXiv:2110.15114, SimRec arXiv:2303.08537, PinSage arXiv:1806.01973, the recommender leakage study arXiv:2010.11060, and the sampled-metric analysis arXiv:1912.02263. These support the plan but do not yet prove novelty; V-005 remains open.
- **Agents consulted, roles, and identifiers:** Bernoulli (`01a0398a-5433-7740-8b2c-e7e8bd0f2947`) independently reviewed research direction and novelty. Hubble (`01a0398a-54d2-7bb2-afa0-2a8f3ceebad8`) independently designed the experimental and reproducibility protocol. Each then cross-reviewed the other's proposal.
- **Independent findings:** Both agents rejected a direct GRAPES port as the central novelty and recommended an explicit resource budget, matched-budget sampler baselines, leakage-safe temporal splitting, full-catalog primary evaluation, end-to-end memory/time measurement, and an early bottleneck gate. Both supported empirical characterization as a valid fallback.
- **Cross-critique and disagreement:** Bernoulli warned that temporal modeling would over-scope the project, LightGCN alone is not a sufficient sampling-compatible comparator, and numerical success thresholds are not scientifically justified constants. Hubble warned against optimizing noisy hardware memory/runtime directly, against adding typed-path complexity prematurely, and against causal claims from correlated dataset-level graph properties.
- **Adjudication and rationale:** Temporal information is restricted to leakage-safe evaluation rather than temporal policy modeling. Sampled edges are the primary controllable proxy; measured memory/runtime remain independent outcomes. The baseline plan now includes full-graph LightGCN plus one validated sampling-compatible mini-batch backbone. Numerical thresholds are retained only as revisable `PROPOSED` engineering gates and cannot substitute for uncertainty estimates or Pareto evidence.
- **Claims added, verified, contradicted, or retired:** Added V-005 for the unresolved novelty claim. Recorded the recommended direction as `PROPOSAL`, not a verified contribution. Retired the idea that a recommendation adaptation alone is sufficient novelty.
- **What remains uncertain:** Deadline, supervisor criteria, compute/storage/data access, exact dataset release/category, mini-batch backbone, baseline-derived non-inferiority margin, and the final closest-work novelty judgment.
- **Next action:** Collect constraints and complete Gate G1 through `01_literature/LITERATURE_MATRIX_en.csv` and its synchronized `_vn` counterpart before implementing the adaptive sampler.
- **Files created or changed in Do An:** `PHASE2_DIRECTION_REVIEW_en.md`; `PROJECT_CONTEXT_AND_RESEARCH_RULES_en.md`. Synchronized `_vn` counterparts were added in the subsequent bilingual-output update.

### Bilingual-output rule update — 2026-08-25

- **Decision or result:** Replaced the English-only artifact rule with mandatory synchronized English/Vietnamese output pairs. English basenames end in `_en`; Vietnamese basenames end in `_vn`; the suffix appears immediately before the extension.
- **Evidence/source:** Direct user instruction in the current session.
- **Agents consulted, roles, and identifiers:** None. This was a mechanical naming, translation, and continuity operation; the multi-agent research-review rule does not apply.
- **Independent findings:** Not applicable.
- **Cross-critique and disagreement:** Not applicable.
- **Adjudication and rationale:** The English version remains the canonical terminology and citation reference, while the Vietnamese version provides a synchronized working translation. Language-neutral technical artifacts are exempt to prevent unsafe or invalid duplication of code, logs, checkpoints, and lockfiles.
- **Claims added, verified, contradicted, or retired:** Retired the rule requiring English-only persistent artifacts. Added semantic-parity and synchronized-update requirements for bilingual outputs.
- **What remains uncertain:** Whether the university will require a specific language for the final submitted thesis or defense slides.
- **Next action:** Apply the bilingual convention to every new language-bearing artifact and keep both continuity files synchronized.
- **Files created or changed in Do An:** `PROJECT_CONTEXT_AND_RESEARCH_RULES_en.md`; `PROJECT_CONTEXT_AND_RESEARCH_RULES_vn.md`; `PHASE2_DIRECTION_REVIEW_en.md`; `PHASE2_DIRECTION_REVIEW_vn.md`.

### Direct GRAPES-to-recommendation scope lock — 2026-08-25 (`SUPERSEDED`)

- **Decision or result:** Historical scope decision only. It was superseded on 2026-08-26 by the user-defined independent-thesis identity: develop a graph-sampling method for large-scale GNN recommender systems. GRAPES remains a research foundation and reference design, not the pre-fixed thesis method.
- **Evidence/source:** Direct user instruction; GRAPES arXiv:2310.03399v3; BPR arXiv:1205.2618; LightGCN arXiv:2002.02126; DSKReG arXiv:2108.11883; recommender evaluation anchors arXiv:2010.11060 and arXiv:1912.02263.
- **Agents consulted, roles, and identifiers:** Erdos (`01a039ad-3a63-7542-b87e-c074d3c758ba`) independently mapped GRAPES components to recommendation. Heisenberg (`01a039ad-3a39-73c1-8991-bdc94724a0b0`) independently designed the locked-direction experimental protocol. Each cross-reviewed the other's proposal.
- **Independent findings:** Both retained layer-wise node sampling, Gumbel Top-k, REINFORCE, and GFlowNet/Trajectory Balance; both replaced the target batch, recommender, loss, reward semantics, and evaluation with a BPR-triplet, LightGCN-style, top-K recommendation formulation. Both required matched random/static sampling, full-catalog metrics, leakage control, and negative-result reporting without a pivot.
- **Cross-critique and disagreement:** Erdos initially considered deterministic sampled inference, while Heisenberg recommended deterministic full-graph LightGCN inference as the common primary evaluator. Review also identified the need to avoid arbitrary fixed hyperparameters, control the positive-edge shortcut, separate sampler embeddings from recommender gradients, and distinguish sampled-local from full-graph normalization.
- **Adjudication and rationale:** Primary inference is full-graph and all scalability claims are limited to training. The primary sampler input uses separate sampler ID embeddings plus node type, layer, and train-only degree; detached recommender embeddings are only an ablation. Primary propagation uses GRAPES-style sampled-local normalization. The positive edge is retained in the LightGCN-compatible primary protocol and batch-masked in a pre-declared sensitivity ablation. No numerical improvement threshold or fixed `k` is treated as scientific fact.
- **Claims added, verified, contradicted, or retired:** Retired the active resource-constrained direction, backbone-redesign possibility, and empirical fallback. Added the locked method track: GRAPES sampler + LightGCN-style recommender + BPR signal, with GRAPES-RL-Rec and GRAPES-GFN-Rec. V-005 now tracks accurate contribution wording rather than permission to change direction.
- **What remains uncertain:** Deadline and compute constraints; exact GRAPES code version; exact Amazon category/release; sampler embedding design details; reward scaling; validated budgets and hyperparameters.
- **Next action:** Create synchronized `GRAPES_RECOMMENDATION_SPEC_en.md` and `GRAPES_RECOMMENDATION_SPEC_vn.md`, pin the GRAPES source/code version, and freeze the BPR-triplet-to-GRAPES mapping at Gate G1.
- **Files created or changed in Do An:** `PHASE2_DIRECTION_REVIEW_en.md`; `PHASE2_DIRECTION_REVIEW_vn.md`; `PROJECT_CONTEXT_AND_RESEARCH_RULES_en.md`; `PROJECT_CONTEXT_AND_RESEARCH_RULES_vn.md`.

### Week 1 kickoff — 2026-08-26

- **Decision or result:** Started Week 1 and completed the source/provenance audit, local constraint audit, initial literature matrix, and bilingual draft adaptation specification. Gate G1 remains `OPEN`; implementation has not been authorized from unresolved semantics.
- **Evidence/source:** GRAPES arXiv:2310.03399v3; official repository commit `71ecebeaac896800aa4dd1d0f38c57ec222ef396`, resolved on 2026-08-26; local Phase 1 snapshot, notebook, paper PDF, configs, and result file; primary BPR, LightGCN, PinSage, DSKReG, leakage, and sampled-metric papers recorded in the literature matrix.
- **Agents consulted, roles, and identifiers:** Ohm (`01a039bd-31b9-7132-935a-2563c9515858`) independently audited Phase 1 code provenance, environment, executed configurations, and local/official-code differences. Curie (`01a039bd-3187-7280-b60e-d29374919e67`) independently audited the GRAPES-to-BPR/LightGCN semantic mapping, invariants, Gate G1 decisions, and unit-test obligations. Each then cross-reviewed the other's findings.
- **Independent findings:** Ohm found that Phase 1 cloned the public repository without a recorded ref, patched local files, retained no `.git` metadata, ran GFN and Random but not RL, and used a Colab environment different from the repository manifest. Curie defined the ordered-triplet/endpoint mapping, full-Bernoulli probability accounting, trajectory state, parameter ownership, LightGCN boundary, eleven decision points, and 25 required tests.
- **Cross-critique and disagreement:** Ohm separated decisions already supported by paper/code from recommendation-specific unresolved choices and identified direct contradictions in REINFORCE sign, `log Z` conditioning, and sampled-evaluation orientation. Curie confirmed that the official current commit may be the Phase 2 reference but cannot be retroactively attributed to Phase 1; recommendation-specific components must be reimplemented rather than inherited blindly.
- **Adjudication and rationale:** The source hierarchy is project scope, GRAPES v3 semantics, pinned official commit, and then the local snapshot as historical evidence. Paper-faithful behavior is primary when paper and code conflict, but a minimal falsification test remains mandatory. D8 was closed as allowing cross-layer re-entry and D11 as one stable full-Bernoulli definition across all candidate cardinalities. D1, D2, D4, D5, D6, D7, and D9 remain genuine Gate G1 blockers.
- **Claims added, verified, contradicted, or retired:** Added V-006–V-008. Verified the current official commit and GRAPES v3 paper pin. Recorded the exact Phase 1 commit as unrecoverable from current artifacts. Recorded paper/code discrepancies without silently selecting the implementation that gives better empirical results.
- **What remains uncertain:** User/supervisor deadlines and milestones; available GPU/VRAM/GPU-hours, cloud and storage budgets; dataset access/licensing; required thesis template/language/length; success criteria; exact Phase 2 environment; dataset release/category; and the open Gate G1 decisions.
- **Next action:** Obtain the missing project constraints, close D1/D2/D4/D5/D6/D7/D9 through equations and toy-test oracles, and then lock the executable environment and dataset audit plan.
- **Files created or changed in Do An:** `00_project/PHASE2_CONSTRAINTS_en.md`; `00_project/PHASE2_CONSTRAINTS_vn.md`; `01_literature/GRAPES_SOURCE_VERSION_NOTE_en.md`; `01_literature/GRAPES_SOURCE_VERSION_NOTE_vn.md`; `01_literature/LITERATURE_MATRIX_en.csv`; `01_literature/LITERATURE_MATRIX_vn.csv`; `02_protocol/GRAPES_RECOMMENDATION_SPEC_en.md`; `02_protocol/GRAPES_RECOMMENDATION_SPEC_vn.md`; `PROJECT_CONTEXT_AND_RESEARCH_RULES_en.md`; `PROJECT_CONTEXT_AND_RESEARCH_RULES_vn.md`.

### Week 1 constraint resolution and 12-week compression — 2026-08-26

- **Decision or result:** Recorded a 12-week deadline, Python implementation, Amazon-only active data plan, borrowable GPU, Google Colab availability, and high expected quality. Compressed the active plan from 16 to 12 weeks without removing GRAPES-RL-Rec, GRAPES-GFN-Rec, required baselines, leakage controls, five paired primary seeds, or representative clean reproduction.
- **Evidence/source:** Direct user instructions; [Amazon Reviews 2023 official documentation](https://amazon-reviews-2023.github.io/main.html); [NVIDIA A100 data sheet](https://www.nvidia.com/content/dam/en-zz/Solutions/Data-Center/a100/pdf/nvidia-a100-datasheet-nvidia-us-2188504-web.pdf); [NVIDIA RTX 6000 Ada specifications](https://www.nvidia.com/en-us/products/workstations/rtx-6000/); [Google Colab FAQ](https://research.google.com/colaboratory/faq.html); PyTorch reproducibility documentation.
- **Agents consulted, roles, and identifiers:** Ohm (`01a039bd-31b9-7132-935a-2563c9515858`) independently estimated GPU, CPU/RAM, storage, parallel-seed, and 12-week compute requirements. Curie (`01a039bd-3187-7280-b60e-d29374919e67`) independently operationalized high expectations, designed the leakage-safe Amazon acquisition/split protocol, and compressed the scientific schedule. Each cross-reviewed the other's proposal and then revised its recommendation after Colab became available.
- **Independent findings:** Ohm initially recommended two A100 80 GB GPUs and a large local-storage envelope because irregular candidate expansion and repeated seeds create substantial uncertainty. Curie recommended `Baby_Products` 0-core, global chronological splitting before train-only iterative filtering, Python 3.11, checkpointable runs, and a deliverable-based rather than arbitrary numerical definition of high quality.
- **Cross-critique and disagreement:** The agents disagreed materially on 150–250 versus roughly 1,000–1,200 GPU-hours, 40–48 versus 80 GB preferred VRAM, Gate G1 timing, and local storage. Both agreed that an unmeasured total must not be presented as fact, Amazon raw data must be pinned and filtered without future leakage, and final resource comparisons require one consistent GPU/software stack. After the Colab update, both removed large local disk from the feasibility gate and restricted Colab to development rather than canonical profiling.
- **Adjudication and rationale:** Request one fixed A100 80 GB for final profiling; treat a second GPU as optional seed-parallel capacity and RTX 6000 Ada 48 GB as the minimum operational final device. Use Colab for preprocessing, smoke tests, and development runs with resumable checkpoints. Replace speculative GPU-hour totals with a Week 3 measured pilot. Store canonical data/results persistently in cloud storage, not the temporary Colab VM. Retire MovieLens and keep the active plan Amazon-only. Use `All_Beauty` only for pipeline validation and propose `Baby_Products` as the primary category.
- **Claims added, verified, contradicted, or retired:** V-003 is now a category proposal with counts still unknown; V-004 is partially resolved; V-008 is a hardware/environment proposal pending confirmation. Retired the 16-week active schedule, MovieLens pilot, mandatory 4 TB local disk, and any claim that managed Colab guarantees a fixed GPU or runtime.
- **What remains uncertain:** Exact calendar deadline; supervisor/template rubric; A100 availability/access window; Colab tier/compute units; persistent cloud path; Python/PyTorch/PyG/CUDA lock; exact Amazon artifact/license note/hash; post-filter statistics; and measured compute demand.
- **Next action:** Close the seven open Gate G1 decisions, request the fixed A100, identify persistent cloud storage, create the locked Python/Colab launcher, and then audit/checksum the two scoped Amazon artifacts.
- **Files created or changed in Do An:** `00_project/PHASE2_CONSTRAINTS_en.md`; `00_project/PHASE2_CONSTRAINTS_vn.md`; `PHASE2_DIRECTION_REVIEW_en.md`; `PHASE2_DIRECTION_REVIEW_vn.md`; `PROJECT_CONTEXT_AND_RESEARCH_RULES_en.md`; `PROJECT_CONTEXT_AND_RESEARCH_RULES_vn.md`.

### Initial GRAPES-informed semantic decision record — 2026-08-26 (`SUPERSEDED AS CANONICAL METHOD`)

- **Decision or result:** Historical record. Revision 16 reclassifies D1–D11 and their oracles as a GRAPES-informed reference design and reference verification candidates. They remain useful only where the final thesis method explicitly re-adopts them with scientific rationale and verification.
- **Evidence/source:** GRAPES [arXiv:2310.03399v3](https://arxiv.org/abs/2310.03399v3), especially Eqs. (2), (5), and (6) plus Appendix F; LightGCN [arXiv:2002.02126](https://arxiv.org/abs/2002.02126); official PyG [`MessagePassing` documentation](https://pytorch-geometric.readthedocs.io/en/stable/generated/torch_geometric.nn.conv.MessagePassing.html); pinned GRAPES commit `71ecebeaac896800aa4dd1d0f38c57ec222ef396`; and the read-only Phase 1 `main.py`, `eval.py`, `modules/gcn.py`, and `modules/utils.py` snapshots.
- **Agents consulted, roles, and identifiers:** Kierkegaard (`01a03ba9-30b3-7a72-b455-a435a6e5c0a1`) independently resolved D1/D2/D9 and supplied block/normalization/masking oracles. Feynman (`01a03ba9-30e9-7401-b195-e25b77871ba5`) independently resolved D4/D5/D6/D7 and supplied gradient, normalizer, ownership, and OOV oracles. Each then cross-critiqued the other's decisions. Earlier resumed agent attempts did not return usable output and were shut down; none of that incomplete work was used.
- **Independent findings:** Both reviews supported PyG source `K^l` to destination `K^(l-1)`, two-sided degrees for rectangular blocks, the paper's positive REINFORCE cost sign, ranking-only detached sampler cost, target-conditioned scalar `log Z`, disjoint sampler embeddings, and a transient mask applied before all batch candidate/message-passing construction.
- **Cross-critique and disagreement:** The material disagreement was whether LightGCN layer terms could be gathered from one deepest inward pass or required separate outward-prefix products. Cross-review showed that a one-pass intermediate target row uses the wrong outer block when GRAPES sets are non-cumulative. Additional cautions concerned an optional RL baseline, candidate context for `GCN_Z`, initialization variance notation, OOV universe scope, and whether the static degree feature should change under positive-edge masking.
- **Adjudication and rationale:** Canonical target depth `r` is computed by the explicit prefix `P_r,...,P_1`, giving `L(L+1)/2` block applications unless a fused implementation is numerically identical. Primary sampled normalization is rectangular local bi-normalization; full-graph degrees are a mandatory ablation and equivalence oracle. Primary RL uses no baseline and minimizes `stopgrad(L_rank) * log q`. `GCN_Z` uses only the target-induced working graph plus auxiliary self-loops and mean pooling. Sampler embeddings have variance `1/d` (`std=1/sqrt(d)`), remain disjoint from recommender embeddings, and follow the warm-start universe already locked by the data protocol. In the positive-edge mask ablation, propagation degrees change with the transient graph while the static train-degree feature does not.
- **Claims added, verified, contradicted, or retired:** V-007 moved from `NEEDS VERIFICATION` to `DECISION RESOLVED; ORACLES REGISTERED`. The literal outward row/column reading of GRAPES Eq. (2), the local code's negative REINFORCE sign, the local candidate-conditioned `log Z`, and the Phase 1 sampled-evaluation edge orientation are rejected as Phase 2 primary semantics. No empirical performance claim was added.
- **What remains uncertain:** Whether every T01–T25 oracle passes in code; exact locked Python/PyTorch/PyG/CUDA versions; final GPU access; persistent cloud location; Amazon artifact hashes and post-filter statistics; measured batch/embedding/sample-budget capacity.
- **Next action:** Create the locked Python project skeleton, implement T01–T25 beginning with T12/T14/T18/T19/T23, and freeze the executable environment before learned-policy experiments.
- **Files created or changed in Do An:** `02_protocol/GRAPES_RECOMMENDATION_SPEC_en.md`; `02_protocol/GRAPES_RECOMMENDATION_SPEC_vn.md`; `PROJECT_CONTEXT_AND_RESEARCH_RULES_en.md`; `PROJECT_CONTEXT_AND_RESEARCH_RULES_vn.md`.

### Initial supervisor-briefing creation — 2026-08-26 (`SUPERSEDED AS WEEKLY-DELIVERABLE MODEL`)

- **Decision or result:** Historical record. Revision 16 replaces the weekly-deliverable model with one current supervisor briefing plus a dated continuity log; the thesis report and defense deck remain cumulative final artifacts.
- **Evidence/source:** Existing Week 1 artifacts under `00_project`, `01_literature`, and `02_protocol`; direct user instruction to prepare a weekly teacher report; the project evidence labels and no-fabrication rule.
- **Agents consulted, roles, and identifiers:** Curie (`01a03e2d-90dd-78e2-8abe-8636d5195d5b`) independently designed the report from a supervisor-facing communication perspective. Hegel (`01a03e2d-9121-7cb0-8941-9b32fbaea939`) independently audited scientific claim maturity, overclaim risks, missing evidence, and the weekly-maintenance rule. Each then cross-critiqued the other's proposal.
- **Independent findings:** Curie recommended reporting the 12-week plan, source audit, preliminary literature matrix, D1–D11, 25 oracles, dataset/compute proposals, honest limitations, prioritized questions, Week 2 deliverables, and a two-minute script. Hegel required explicit separation among recorded decisions, specified oracles, proposed resources, and missing executable/empirical evidence.
- **Cross-critique and disagreement:** Hegel considered “exact mapping,” “closed semantics,” and broad compute statements vulnerable to overclaim unless their maturity was stated. Curie agreed with the status separation but warned that a full audit taxonomy would make the supervisor report unreadable. The agents also differed on whether Week 2 should promise all 25 executable tests and an end-to-end smoke run.
- **Adjudication and rationale:** The report uses a compact status vocabulary, treats D1–D11 as recorded design decisions and T01–T25 as unexecuted oracle specifications, and labels dataset/A100 choices as proposals. Week 2 prioritizes the environment lock, dataset provenance, project skeleton, and five highest-risk executable oracles; a smoke check is conditional and cannot be reported as a benchmark. Detailed audit history remains in continuity rather than the oral report.
- **Claims added, verified, contradicted, or retired:** Added no scientific or empirical claim. Added the reporting lifecycle `planned -> specified -> implemented -> executed -> validated`; wording may advance only with corresponding evidence.
- **What remains uncertain:** Supervisor acceptance of the scope, provenance mitigation, dataset roles, evaluation package, GPU access, and institutional reporting/thesis requirements.
- **Next action:** Use the Week 1 report in the supervisor meeting, record answers to its five questions, and append a synchronized Week 2 entry with evidence rather than overwriting Week 1.
- **Files created or changed in Do An:** `03_reports/REPORT_TEACHER_en.md`; `03_reports/REPORT_TEACHER_vn.md`; `PROJECT_CONTEXT_AND_RESEARCH_RULES_en.md`; `PROJECT_CONTEXT_AND_RESEARCH_RULES_vn.md`.

### Core thesis deliverable rule — 2026-08-26

- **Decision or result:** Fixed three mandatory living outputs for Phase 2: the university-submission thesis report, the presentation/defense slide deck, and source code runnable on Google Colab. Added a rule requiring affected outputs to be updated continuously as the research evolves.
- **Evidence/source:** Direct user instruction on required thesis outputs and continuous maintenance.
- **Agents consulted, roles, and identifiers:** None. This was a direct operational rule update and therefore falls under the mechanical-update exception to the multi-agent protocol.
- **Independent findings:** Not applicable.
- **Cross-critique and disagreement:** Not applicable.
- **Adjudication and rationale:** The report and slides remain synchronized `_en`/`_vn` pairs. The code remains one language-neutral technical source with bilingual operating documentation. Each verified change must propagate consistently across the report's full account, the slides' concise defensible summary, and the code/configuration/tests that reproduce executable claims.
- **Claims added, verified, contradicted, or retired:** Added no scientific or empirical claim. Added only the deliverable lifecycle and synchronization rule.
- **What remains uncertain:** Required university thesis template, submission language, report length, defense-slide format, and the exact final Google Colab/Python/PyTorch/PyG/CUDA environment lock.
- **Next action:** As implementation begins, initialize the canonical `04_thesis`, `05_slides`, and `06_code` output structures and update every affected deliverable after each substantive project change.
- **Files created or changed in Do An:** `PROJECT_CONTEXT_AND_RESEARCH_RULES_en.md`; `PROJECT_CONTEXT_AND_RESEARCH_RULES_vn.md`.

### Week 1 thesis-deliverable readiness audit — 2026-08-26

- **Decision or result:** Confirmed that Week 1 already provides evidence-backed material for an initial thesis report and working defense slides, while source-code readiness is limited to frozen semantic contracts and planned test oracles. The canonical output directories and artifacts have not yet been created.
- **Evidence/source:** `PHASE2_DIRECTION_REVIEW_en.md`; `00_project/PHASE2_CONSTRAINTS_en.md`; `01_literature/GRAPES_SOURCE_VERSION_NOTE_en.md`; `01_literature/LITERATURE_MATRIX_en.csv`; `02_protocol/GRAPES_RECOMMENDATION_SPEC_en.md`; and `03_reports/REPORT_TEACHER_en.md`, with their synchronized Vietnamese counterparts.
- **Agents consulted, roles, and identifiers:** Copernicus (`01a03e3c-9fd1-7b10-a628-41551ddc94ee`) audited report/slide content and claim maturity. McClintock (`01a03e3c-9fab-7f43-807b-3bab12ee7eb0`) audited code/Colab readiness, implementation contracts, and oracle dependencies. Each then cross-critiqued the other's audit.
- **Independent findings:** Copernicus found report-ready material for scope, research questions and hypotheses, preliminary related work, provenance, specified method, proposed evaluation plan, verification strategy, risks, and timeline, plus a working slide narrative with no result claims. McClintock found D1–D11, T01–T25, graph/sampling/model/objective contracts, and Colab boundaries sufficient for a package skeleton and toy-test implementation, but found no existing code, lockfile, notebook, data manifest, or executable evidence.
- **Cross-critique and disagreement:** Both agents accepted the other's mapping but narrowed its maturity. “Experimental protocol” must remain “proposed experimental plan — protocol incomplete”; “specified method” means frozen design, not implemented behavior; “code-ready” means semantic-contract ready for scaffolding and toy graphs, not clean-Colab or experiment ready. High-risk tests T12/T14/T18/T19/T23 require lower-level dependency primitives and tests first.
- **Adjudication and rationale:** The report may now contain scope, RQs/H1–H4, preliminary evidence base, source provenance, the specified adaptation, proposed evaluation plan, oracle strategy, risks, and schedule. Slides may summarize the same narrative with local status labels such as `SPECIFIED — NOT IMPLEMENTED`. Code may be initialized with a modular package, bilingual documentation, deterministic configuration, traceability from D-IDs to modules and T-IDs, CPU toy-test path, checksum/manifest interfaces, logging/checkpoint contracts, and a thin Colab launcher. No artifact may claim implementation, execution, validation, reproducibility, performance, scalability, finalized data, or a locked environment.
- **Claims added, verified, contradicted, or retired:** Added no scientific or empirical claim. Verified only artifact readiness and absence: report/slide content is available at design/planning maturity; implementation, test execution, and experimental evidence are absent.
- **What remains uncertain:** University template/language/defense format; exact environment lock and GPU; persistent storage; exact Amazon artifacts, schema, cutoffs, filtering, and negative protocol; experiment configurations; and whether any oracle passes after implementation.
- **Next action:** On an explicit build request, initialize synchronized report and slide artifacts plus the `06_code` skeleton, migrate only evidence-compatible Week 1 content, and separately correct the recorded status drift in older planning/source artifacts.
- **Files created or changed in Do An:** `PROJECT_CONTEXT_AND_RESEARCH_RULES_en.md`; `PROJECT_CONTEXT_AND_RESEARCH_RULES_vn.md`.

### Week 1 deliverables initialized and toy tests executed — 2026-08-26

- **Decision or result:** Initialized three groups of living deliverables: bilingual thesis reports in `04_thesis`, bilingual working defense decks in `05_slides`, and a Python/Colab source scaffold in `06_code`. The scaffold was tested with 10/10 pure-Python toy contract tests passing on CPU.
- **Evidence/source:** `04_thesis/THESIS_REPORT_en.md`; `04_thesis/THESIS_REPORT_vn.md`; `05_slides/THESIS_PRESENTATION_en.pptx`; `05_slides/THESIS_PRESENTATION_vn.pptx`; `06_code/README_en.md`; `06_code/README_vn.md`; source under `06_code/src`; tests at `06_code/tests/test_week1_oracles.py`; output of `python3 -m unittest discover -s tests -v`.
- **Agents consulted, roles, and identifiers:** Copernicus (`01a03e3c-9fd1-7b10-a628-41551ddc94ee`) audited report/slide readiness. McClintock (`01a03e3c-9fab-7f43-807b-3bab12ee7eb0`) audited code/Colab readiness. Both cross-critiqued and the main agent adjudicated the maturity boundary.
- **Independent findings:** Report/slide content can cover scope, RQ/H1–H4, preliminary evidence, provenance, specified adaptation, proposed plan, oracle strategy, risks, and timeline. Code can begin with pure-Python graph/sampling/block/objective/masking contracts and dependency tests.
- **Cross-critique and disagreement:** The agents agreed that 10 passing tests raise only the toy-contract subset to `EXECUTED`; they do not raise the full adaptation to `IMPLEMENTED`, `VALIDATED`, `Colab-ready`, or `reproducible`. Full data, environment, model, and benchmark remain open.
- **Adjudication and rationale:** Keep the report and slides at design-and-plan maturity and show the boundary inside the artifacts. Keep code dependency-free at this stage and use the thin Colab notebook only as a launcher; do not place the main implementation in the notebook. Both decks were checked by rendering every slide and by overflow testing.
- **Claims added, verified, contradicted, or retired:** Verified the existence of the three deliverable groups and 10/10 toy-test execution. Added no scientific or empirical claim. Full recommendation adaptation, full oracle suite, and performance evidence remain absent.
- **What remains uncertain:** Exact environment lock, final GPU, Amazon artifact/checksum/schema/cutoff/filter, negative protocol, university format, and results from the actual implementation.
- **Next action:** Complete the Week 2 environment/data package, extend dependency tests, and update the report, slides, source documentation, and teacher report after every verified change.
- **Files created or changed in Do An:** Files under `04_thesis`, `05_slides`, and `06_code` listed above; `03_reports/REPORT_TEACHER_en.md`; `03_reports/REPORT_TEACHER_vn.md`; `PROJECT_CONTEXT_AND_RESEARCH_RULES_en.md`; `PROJECT_CONTEXT_AND_RESEARCH_RULES_vn.md`.

### Week 1 final QA and toy-likelihood correction — 2026-08-26

- **Decision or result:** Corrected the numerically stable branch for unselected negative logits in the dependency-free Bernoulli log-probability helper. The 10/10 toy contract tests still pass locally after the correction.
- **Evidence/source:** `06_code/src/grapes_rec/sampling.py`; `06_code/tests/test_week1_oracles.py`; output of `PYTHONDONTWRITEBYTECODE=1 python3 -m unittest discover -s tests -v`.
- **Claim boundary:** This is a local toy-contract correctness correction only. It does not change the maturity boundary: the PyTorch/PyG recommendation adaptation, full T01–T25 execution, Amazon data pipeline, environment lock, and benchmark remain open.
- **Next action:** Begin Week 2 by locking the Colab-compatible environment and auditing the project-sourced Amazon artifacts, then extend the executable oracle suite before learned-policy implementation.
- **Files created or changed in Do An:** `06_code/src/grapes_rec/sampling.py`; `06_code/tests/test_week1_oracles.py`; both continuity files.

### Dataset audit pipeline initialized — 2026-08-26

- **Decision or result:** Start Dataset Gate G2 before model training. Keep `All_Beauty` as the validation/pipeline artifact and `Baby_Products` as the proposed primary artifact. Neither is finalized until exact bytes, checksum, access note, and post-download audit evidence exist.
- **Evidence/source:** [Amazon Reviews'23 project page](https://amazon-reviews-2023.github.io/main.html); [0-core processing/statistics](https://amazon-reviews-2023.github.io/data_processing/0core.html); [official processing README](https://github.com/hyp1231/AmazonReviews2023/blob/main/benchmark_scripts/README.md); `06_code/docs/DATASET_AUDIT_en.md`; `06_code/scripts/analyze_amazon_dataset.py`; paired notebooks under `06_code/notebooks`.
- **Independent findings:** Peirce (`01a03e67-ef94-7d20-99bb-3e381e19ca77`) found no local Amazon artifact, confirmed the pure-ID schema and provider de-duplication statement, and recommended separate validation/primary roles. Kant (`01a03e67-efc0-7eb1-be6c-d5af909a68b9`) identified item-key, implicit-positive, duplicate, temporal, warm-start, negative-eligibility, and exact-catalog checks. Both recommended the same audit order and warned against mixing `parent_asin` with `asin` or treating future positives as negatives without a recorded policy.
- **Cross-critique and adjudication:** The source audit and protocol audit are compatible. Provider processing, project interaction semantics, temporal split, and project training-only filtering must be reported as separate transformations. The official absolute split remains a candidate reference; leave-last-out is not adopted blindly because documented singleton handling can violate the warm-start universe.
- **Claims added, verified, contradicted, or retired:** Verified local absence of raw Amazon files and verified the existence of the streaming analyzer, paired audit notebooks, and toy fixture smoke result. Recorded provider-published counts only as external metadata. Added no project-derived Amazon statistic and no model-performance claim.
- **What remains uncertain:** Exact downloaded SHA-256, compressed/decompressed sizes, license/access note, duplicate count, rating-to-positive rule, split/cold-start handling, negative eligibility, post-filter graph statistics, and feasibility of the primary category.
- **Next action:** Re-run both audits in Colab and persist the JSON manifests, then resolve the high-OOV split, implicit-positive, duplicate, warm-start, and negative-eligibility policies before freezing Dataset Gate G2.
- **Files created or changed in Do An:** `06_code/docs/DATASET_AUDIT_en.md`; `06_code/docs/DATASET_AUDIT_vn.md`; `06_code/scripts/analyze_amazon_dataset.py`; `06_code/tests/fixtures/toy_amazon.csv`; paired notebooks `00_colab_setup_and_oracles_*` and `01_amazon_dataset_audit_*`; both READMEs; both traceability files; both thesis reports; both supervisor reports; both presentation decks; both continuity files.

### Raw Amazon audit executed — 2026-08-26

- **Decision or result:** Executed the streaming analyzer on the exact temporary bytes for both scoped official artifacts. `All_Beauty` produced 693,929 valid rows, 631,986 users, 112,565 items, and zero exact duplicate user–item pairs. `Baby_Products` produced 5,953,891 valid parsed rows, 3,386,206 users, and 217,654 items; one row has rating `0.0` outside the expected 1–5 range, while exact duplicate-pair verification remains open because the large SQLite scan was not completed.
- **Evidence/source:** `06_code/docs/DATASET_AUDIT_RESULTS_en.md`; `06_code/docs/DATASET_AUDIT_RESULTS_vn.md`; `06_code/scripts/analyze_amazon_dataset.py`; temporary-run SHA-256 values recorded in the result files; official [0-core statistics](https://amazon-reviews-2023.github.io/data_processing/0core.html) and [processing README](https://github.com/hyp1231/AmazonReviews2023/blob/main/benchmark_scripts/README.md).
- **Independent findings:** Peirce audited provenance and source boundaries; Kant audited the protocol and leakage risks. Both agreed that the raw evidence is useful but does not close the dataset gate, and that future positives must not silently enter training-negative pools.
- **Cross-critique and adjudication:** The raw counts are project-derived; provider-published counts and de-duplication behavior remain external source claims. The official absolute split was measured as a diagnostic, not adopted: validation/test user OOV is 92.14%/94.31% for `All_Beauty` and 75.07%/83.23% for `Baby_Products`. This is a protocol warning, not a model-performance result.
- **Claims added, verified, contradicted, or retired:** Added raw schema, checksum, rating, timestamp, degree, sparsity, and candidate-split diagnostics. Verified that no recommendation model, benchmark, or resource measurement was produced. Did not finalize category, positive threshold, duplicate handling, split, cold-start treatment, or negative eligibility.
- **What remains uncertain:** Persistent Colab checksum/access record, exact Baby duplicate count, treatment of the one out-of-range rating, implicit-positive rule, project-frozen split, training-only filtering, negative eligibility, and post-filter graph scale.
- **Next action:** Persist both audit manifests in Colab; decide the split/positive/duplicate/negative protocol from pre-registered rules; then run training-only graph statistics before implementing the recommender.
- **Files created or changed in Do An:** `06_code/docs/DATASET_AUDIT_RESULTS_en.md`; `06_code/docs/DATASET_AUDIT_RESULTS_vn.md`; both README files; both traceability files; both thesis reports; both supervisor reports; both presentation decks; both continuity files.

### Phase 2 thesis identity and cumulative-deliverable correction — 2026-08-26

- **Decision or result:** The user clarified that Phase 2 is the official, independent Master's thesis titled **“Development of a Graph Sampling Method for Large-Scale Recommender Systems Using Graph Neural Networks (GNNs).”** Phase 1 selected/explored the topic and studied GRAPES; it is read-only historical material, not a continuation chapter or source of Phase 2 results. GRAPES is now explicitly a scientific foundation, comparator, and source of candidate mechanisms.
- **Independent findings:** Hegel (`01a03ebc-97eb-7bb3-809f-eb9dcf171de5`) audited the scope framing. Nietzsche (`01a03ebc-980f-74e0-8c9b-5b074c595d24`) audited deliverable governance. Both identified the same direct-adaptation and week-based framing drift across the continuity rules, thesis report, supervisor briefing, reference specification, code documentation, and defense deck.
- **Cross-critique and adjudication:** Both reviewers agreed that the thesis report and defense deck must be single cumulative final artifacts with no Week 1/Week 2 narrative. They agreed that D1–D11/T01–T25 remain useful only as a GRAPES-informed reference design and reference verification candidates. The reviewers differed only on retaining weekly supervisor entries; the direct user instruction governs, so the project maintains one continuously refreshed supervisor briefing with a dated continuity log rather than weekly thesis deliverables.
- **Claims added, verified, contradicted, or retired:** Retired the active claim that Phase 2 is a direct GRAPES-to-recommendation adaptation. Retired the weekly report/deck delivery model. No claim of novelty, effectiveness, scalability, or final architecture is added. The final thesis method remains `OPEN` until literature positioning, method rationale, controlled ablations, and experiments support it.
- **Next action:** Reframe the bilingual thesis report, defense deck, supervisor briefing, protocol headers, and code documentation around the final thesis title; keep raw dataset-audit findings unchanged; then re-validate artifact consistency.
- **Files created or changed in Do An:** both continuity files and every affected bilingual living deliverable listed in the next synchronization task.

### Dataset portfolio and analysis protocol — 2026-08-26

- **Decision or result:** Recorded a bounded dataset portfolio and leakage-safe analysis protocol. `Baby_Products` is the mandatory primary Amazon candidate. `All_Beauty` is development/diagnostic only. If the thesis retains “large-scale,” it requires one bounded `Home_and_Kitchen` scale-stress experiment after the primary pipeline is valid. MovieLens 25M and Yelp Open Dataset are optional and cannot delay the Amazon core. Dataset Gate G2 remains open; this is not a final dataset freeze or a performance claim.
- **Evidence/source:** Project-derived raw audits in `06_code/docs/DATASET_AUDIT_RESULTS_en.md`; official [Amazon documentation](https://amazon-reviews-2023.github.io/main.html), [0-core](https://amazon-reviews-2023.github.io/data_processing/0core.html), and [5-core](https://amazon-reviews-2023.github.io/data_processing/5core.html); [MovieLens 25M](https://grouplens.org/datasets/movielens/25m/); [Yelp Open Dataset](https://business.yelp.com/data/resources/open-dataset/); [recommender leakage](https://arxiv.org/abs/2010.11060); [sampled metrics](https://arxiv.org/abs/1912.02263); [BPR](https://arxiv.org/abs/1205.2618); [GraphSAINT](https://arxiv.org/abs/1907.04931); and [PinSage](https://arxiv.org/abs/1806.01973).
- **Agents consulted, roles, and identifiers:** Hilbert (`01a03ed0-ca78-7d92-b83e-92a13469608a`) reviewed dataset roles, scale, semantics, sources, and access. Feynman (`01a03ed0-ca4d-7c72-a247-301358b176d9`) reviewed preprocessing, temporal evaluation, negatives, sampler diagnostics, and gates. Both cross-critiqued the other's proposal.
- **Independent findings:** Both rejected raw 0-core `All_Beauty` as core warm-start evidence because its singleton rate is 93.22%. Both retained `Baby_Products` as primary but required strict post-filter evidence because the raw audit has 70.01% singleton users and high provider-split OOV. Both required a training-only graph, pre-registered rating semantics, explicit negative eligibility, and exact full-catalog headline evaluation.
- **Cross-critique and disagreement:** Hilbert preferred mandatory `Home_and_Kitchen` scale evidence and optional MovieLens. Feynman preferred MovieLens plus `Baby_Products` as the mandatory minimum and conditional `Home_and_Kitchen`. Both agreed that Yelp is optional.
- **Adjudication and rationale:** Because the title includes “large-scale,” require a minimal pre-registered `Home_and_Kitchen` stress configuration once `Baby_Products` passes G2-D, but do not require a second full ablation matrix. MovieLens 25M and Yelp remain optional. The final sampling method remains open; GRAPES is a reference/comparator, not the dataset-selection rationale.
- **Claims added, verified, contradicted, or retired:** Added a bilingual portfolio/protocol record. Retired the implicit idea that Amazon 0-core or the provider absolute split can be used directly as the primary warm-start benchmark. No claim of novelty, scalability, recommendation quality, resource efficiency, or final method was added.
- **What remains uncertain:** Baby duplicate count; `0.0` treatment; primary P4/P5/all-observed semantics; strict temporal cutoffs; training-only retention; negative policy; `Home_and_Kitchen` audit/run feasibility; compute lock; and optional MovieLens/Yelp use.
- **Next action:** Complete G2-A through G2-C for `Baby_Products`, then decide G2-D before implementing the final sampler. Acquire only the provenance/size audit for `Home_and_Kitchen` in parallel.
- **Files created or changed in Do An:** `00_project/DATASET_PORTFOLIO_AND_ANALYSIS_PROTOCOL_en.md`; `00_project/DATASET_PORTFOLIO_AND_ANALYSIS_PROTOCOL_vn.md`; both continuity files; both thesis reports; both code READMEs.

### Independent-thesis deliverable synchronization and QA — 2026-08-27

- **Decision or result:** Synchronized the living bilingual thesis report, supervisor briefing, GRAPES-informed reference specification, code documentation, and cumulative defense decks with the independent-thesis framing. The decks now use the official thesis scope, distinguish historical Phase 1 from Phase 2 method development, retain GRAPES only as a scientific reference/comparator, and omit weekly titles, footers, and narrative. No thesis method is selected and no performance claim is made.
- **Evidence/source:** `04_thesis/THESIS_REPORT_en.md`; `03_reports/REPORT_TEACHER_en.md`; `02_protocol/GRAPES_RECOMMENDATION_SPEC_en.md`; `06_code/README_en.md`; `06_code/docs/TRACEABILITY_en.md`; `05_slides/THESIS_PRESENTATION_en.pptx`; and synchronized `_vn` counterparts. Both decks were rendered slide-by-slide; overflow checks and template-fidelity checks passed.
- **Agents consulted, roles, and identifiers:** Archimedes (`01a04076-ac11-77c1-bfc3-08cca266448d`) independently reviewed continuity, scope, and evidence boundaries. Lagrange (`01a04076-ac40-7dc3-9816-bdf8f29d5131`) independently reviewed the deck narrative, dataset-role wording, and deliverable governance. Each cross-critiqued the other review.
- **Independent findings and cross-critique:** Both reviewers required the same core boundary: `Baby_Products` remains an unfinalized primary candidate, `All_Beauty` remains diagnostic only, and `Home_and_Kitchen` is a bounded conditional scale-stress candidate if the large-scale title claim is retained. Raw audit evidence is temporary and does not close the dataset gate; interaction semantics, duplicate handling, split, OOV treatment, and negative eligibility remain open. No substantive disagreement remained after cross-critique.
- **Adjudication and rationale:** D1–D11/T01–T25 are reference-design semantics and verification candidates, not the final method. The report, deck, source, and briefing are cumulative final deliverables that will be revised in place. The supervisor artifact is one current briefing with continuity history, not a weekly thesis deliverable.
- **Claims added, verified, contradicted, or retired:** Retired residual direct-transfer and weekly-deck wording. Verified only artifact synchronization and QA, ten existing CPU toy tests, and the already-recorded temporary raw audit. No model training, recommendation quality, memory, runtime, throughput, scalability, novelty, superiority, final dataset, final protocol, or final method claim was added.
- **What remains uncertain:** Persistent data provenance/manifests, Baby duplicate handling and the `0.0` rating treatment, interaction semantics, temporal warm-start split, negative eligibility, G2-D closure, environment/GPU lock, final sampler design, baseline set, and experimental results.
- **Next action:** Close Dataset Gate G2 from pre-registered evidence, then implement the selected data pipeline and matched baselines before choosing or claiming a project-developed sampler.
- **Files created or changed in Do An:** both thesis reports; both supervisor briefings; both reference specifications; both code READMEs; both traceability files; both presentation decks; both continuity files.

### Vietnamese defense-deck language polish — 2026-08-27

- **Decision or result:** Rewrote the visible copy in `THESIS_PRESENTATION_vn.pptx` for a Vietnamese academic audience. Literal or mixed-language wording was replaced with clearer Vietnamese, while standard identifiers such as GRAPES, BPR, LightGCN, NDCG, Recall, OOV, PyTorch/PyG, and dataset names were retained where useful.
- **Evidence/source:** The existing deck and its speaker notes were preserved as the scientific source record. No external source, scientific claim, method, dataset role, evaluation condition, or reported result was added or changed in this language-only revision.
- **Review and scope control:** No new research review was needed because this was a copy-only revision with no scientific decision. The independent reviews recorded in Revision 18 remain the scope and evidence-boundary review for the deck.
- **Verification:** Rendered every slide after editing; visual review found no clipping or layout break. The presentation overflow test and the imported-template fidelity check both passed.
- **Claims added, verified, contradicted, or retired:** No scientific or empirical claim was added, changed, or retired. The deck continues to state that the final method, dataset/protocol closure, model training, and measured results remain open.
- **Files created or changed in Do An:** `05_slides/THESIS_PRESENTATION_vn.pptx`; both continuity files.

### Canonical Phase 2 research plan centralized — 2026-08-27

- **Decision or result:** Centralized the active 12-week plan, gates, dependencies, current status, and cumulative-deliverable update rules in `00_project/PHASE2_RESEARCH_PLAN_en.md` and `_vn.md`. The continuity rules now contain pointers only, rather than a second copy of the plan.
- **Scope control:** The plan preserves the independent-thesis scope: GRAPES is a reference/comparator, not a preselected final method; Dataset Gate G2, final sampler selection, evaluation closure, and empirical results remain open.
- **Historical-record handling:** Replaced `PHASE2_DIRECTION_REVIEW_en.md` and `_vn.md` with clear historical redirects. Their prior direct-GRAPES-adaptation plan is not an active decision record.
- **Review and claim boundary:** This was an information-governance correction, not a new scientific, method, dataset, or performance decision. No new research review was required; the independent scope/evidence reviews in Revision 18 remain applicable.
- **Files created or changed in Do An:** `00_project/PHASE2_RESEARCH_PLAN_en.md`; `00_project/PHASE2_RESEARCH_PLAN_vn.md`; both superseded direction-review redirects; both continuity files; both thesis reports.

### Gate-driven research-structure reset — 2026-08-30

- **Decision or result:** Reset Phase 2 governance around one bilingual canonical gate register. Gate status is now separate from evidence maturity. Current status is G0 `PASS`, G1/G2 `IN_PROGRESS`, G3–G6 `NOT_STARTED`; E0-MIN and E0-FINAL separately track development and final-profiling execution readiness.
- **Evidence/source:** Existing project artifacts and their internal consistency; no new external scientific source or experiment was introduced. The canonical evidence is `00_project/PHASE2_RESEARCH_PLAN_en.md` and its synchronized Vietnamese counterpart.
- **Agents consulted, roles, and identifiers:** `gate_architecture` (`/root/gate_architecture`) independently audited gate identity, dependencies, exit criteria, and stop/go rules. `artifact_drift` (`/root/artifact_drift`) independently audited cross-artifact contradictions and evidence-maturity drift.
- **Independent findings:** Both reviewers found that G1 had two conflicting meanings, G2-E created a circular dependency by requiring a scale run before training was authorized, and active legacy records still implied direct GRAPES adaptation.
- **Cross-critique and disagreement:** The reviewers agreed on the single register, moving scale execution to G5-S, and relabeling D1–D11 as reference-specified. The main refinement from cross-critique was to split E0 into E0-MIN and E0-FINAL, tightly bound G2-D to non-headline feasibility, and defer literature expansion or a deep thesis rewrite because those require new research evidence.
- **Adjudication and rationale:** Applied only changes that affect gate identity, status, dependency, blocking, or evidence boundaries. Literature expansion, sampler selection, environment locking, dataset decisions, new tests, and experiments remain future gated work. G5-S is conditional on retaining the large-scale claim; absence requires claim narrowing rather than silent waiver.
- **Claims added, verified, contradicted, or retired:** No scientific, novelty, performance, or scalability claim was added. Retired active environment-as-G1 and mandatory-direct-GRAPES wording. Preserved GRAPES contracts as reference evidence only.
- **What remains uncertain:** G1 closest-work completeness and method-selection rule; G2 provenance/semantics/split/negative/retained-graph evidence; E0 environment locks; final sampler, baseline configuration, and all empirical results.
- **Next action:** Run G1 targeted closest-work review and G2-A–G2-C protocol work in parallel while completing E0-MIN. Do not start G3 before G2/E0-MIN pass or G4 before G1–G3 pass.
- **Files created or changed in Do An:** both canonical plans; both continuity files; both constraint records; both dataset portfolio records; both GRAPES source notes; both GRAPES-informed reference specifications; both dataset-audit protocols; both thesis reports; both supervisor briefings; and both code READMEs.
