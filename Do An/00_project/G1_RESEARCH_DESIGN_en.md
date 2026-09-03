# G1 Research-Design Decision Record

> **Gate:** G1 — research-design rationale  
> **Decision:** `PASS`  
> **Decision date:** 2026-09-03  
> **Scope boundary:** This record freezes the question, candidate family, comparison design, and selection rule. It does **not** select a final sampler or claim that a learned sampler works.  
> **Vietnamese counterpart:** [`G1_RESEARCH_DESIGN_vn.md`](./G1_RESEARCH_DESIGN_vn.md)

## 1. Decision in one paragraph

The thesis will test whether task-conditioned graph sampling improves the ranking-quality–resource trade-off of GNN recommendation on a plain implicit user–item graph. The intervention is the computation-graph sampler; the data, LightGCN-style backbone, BPR batches, negative draws, propagation depth, layer budgets, optimizer opportunity, evaluator, seeds, and hardware are controlled. Uniform and degree-aware sampling are the required matched controls; full-graph LightGCN is a reference ceiling/floor but is not falsely described as budget matched. Candidate mechanisms remain open until G3 supplies a trustworthy shared baseline path. Selection uses validation evidence only and may explicitly select **no learned method**. Test results cannot be used to choose the method.

## 2. Primary question and estimand

### Primary research question

> On the frozen, leakage-safe Amazon Baby P4 warm-start task, and at the same declared layer-wise sampling budget, can a task-conditioned sampler produce a better exact full-catalog NDCG@20–resource trade-off than matched uniform and degree-aware sampling with the same LightGCN-style recommender?

The primary estimand is the paired change caused by replacing only the sampler:

```text
Delta_quality = NDCG@20(candidate) - NDCG@20(best matched static control)
Delta_memory  = peak GPU memory(candidate) - peak GPU memory(control)
Delta_time    = epoch wall time(candidate) - epoch wall time(control)
```

The target population is the frozen G2-C warm-start cohort. Conclusions do not automatically extend to cold-start users/items, sampled inference, knowledge graphs, or Home and Kitchen scale.

### Secondary questions

1. Does the trade-off change across small, medium, and large per-layer budgets?
2. Does task conditioning improve tail-user or tail-item ranking without hiding a head-cohort loss?
3. What additional sampler time, memory, instability, and failure risk accompany each learned mechanism?
4. Which mechanism survives a controlled development comparison strongly enough to justify G4 implementation and final evaluation?

## 3. Falsifiable hypotheses

These are prospective hypotheses, not findings.

- **H1 — matched-budget quality:** at least one predeclared budget yields a positive paired `Delta_quality` for a valid task-conditioned candidate against the best matched static control.
- **H2 — trade-off:** at least one budget yields a task-conditioned candidate that is non-dominated by the static controls over validation NDCG@20, peak GPU memory, and epoch wall time.
- **H3 — budget interaction:** any quality benefit is larger at tighter budgets than at the largest budget; the budget-by-method interaction is reported even if it contradicts this expectation.
- **H4 — cohort behavior:** a candidate's aggregate gain does not conceal a negative paired change for the predeclared tail cohort. Head, middle, and tail effects are reported separately.
- **H5 — overhead:** learned sampling has non-zero sampler overhead. A quality gain without its sampler time, propagation time, peak memory, throughput, and failed-run rate is insufficient evidence of a better trade-off.

The null/negative outcome is retained if no candidate improves the development Pareto set, if gains disappear under paired final seeds, or if correctness/stability checks fail.

## 4. Closest-work map and claim boundary

| Family | Representative primary work | What it establishes | Difference from this thesis question |
|---|---|---|---|
| Node-wise neighbor sampling | GraphSAGE | Fixed-size sampled neighborhoods make mini-batch GNN training possible | Uniform/local sampling is a control, not task-conditioned recommendation sampling |
| Layer-wise importance sampling | FastGCN; AS-GCN; LADIES | Global or layer-dependent importance proposals reduce expansion/variance | Primarily node classification; importance is not optimized for full-catalog recommendation ranking |
| Subgraph/cluster sampling | Cluster-GCN; GraphSAINT | Dense sampled subgraphs can improve training efficiency | Changes the mini-batch unit and normalization; not the primary exact-k layer-wise intervention here |
| Recommender-specific heuristic sampling | PinSage | Random-walk importance and GCN aggregation scale to industrial recommendation graphs | Uses a different item–board setting and heuristic sampling; not a matched plain user–item LightGCN test |
| Learned recommendation sampling | DSKReG | Differentiable sampling can be jointly learned for knowledge-graph recommendation | Uses relation-rich knowledge graphs and cold-start side information, not a pure-ID bipartite graph |
| Learned/adaptive GNN sampling | data-driven GraphSAGE; SubMix; GRAPES | RL, differentiable mixtures, or task-loss-conditioned policies can learn what to sample | Evaluated mainly on node-classification/general graph tasks, not this temporal warm-start ranking protocol |

Therefore the thesis will **not** claim “the first learned sampler for recommendation.” Its defensible contribution, if supported, is narrower: a project-owned task-conditioned sampler and controlled evidence for plain implicit bipartite recommendation under exact full-catalog ranking and matched resource measurement. GRAPES supplies candidate mechanisms and a comparator, not ownership of the final method.

## 5. Candidate mechanism set

| ID | Mechanism | Role before G3/G4 | Required diagnostic |
|---|---|---|---|
| M0 | Uniform sampling without replacement | Mandatory matched control | inclusion counts, unique nodes/edges, effective budget |
| M1 | Training-degree-aware importance sampling | Mandatory matched static control | probability mass by degree cohort; all statistics training-only |
| M2 | Layer-dependent structural importance | Candidate bridge from static to adaptive sampling | proposal entropy, effective sample size, estimator/normalization check |
| M3 | Learned mixture of fixed heuristics | Low-complexity learned candidate | mixture weights, collapse, incremental overhead |
| M4 | Task-conditioned exact-k policy | Main project candidate family; exact parameterization selected only after G3 | logits/probabilities, entropy, duplicate-free exact-k, reward–quality association |
| M5 | GRAPES-informed RL or GFlowNet/TB variant | Optional reference comparator, not mandatory final method | policy loss, log-probability, reward scale, normalizer, gradient and stability oracles |

M0 and M1 must exist before a learned candidate is evaluated. M2–M5 are alternatives, not a promise to implement every method. G4 may select one simple and one learned mechanism, or no learned mechanism, according to Section 7.

## 6. Matched-comparison design

### Held constant

- frozen Baby P4 training graph, validation/test cohorts, and exact candidate rules from G2;
- LightGCN-style propagation and BPR objective;
- training triplets and negative samples, paired by seed and logged;
- embedding size, layer count, optimizer family, early-stopping rule, search budget, and checkpoint rule;
- per-layer requested budget and reported effective sampled nodes/edges;
- exact full-catalog evaluator, metric implementation, precision, device class, and profiling procedure.

### Allowed to vary

Only the sampler and parameters intrinsic to it may differ. Sampler-specific parameters receive the same predeclared tuning opportunity; extra search cannot be hidden inside one candidate.

### Comparison blocks

1. **Sanity references:** MostPop and BPR-MF check task/evaluator behavior.
2. **Backbone reference:** full-graph LightGCN measures the unsampled implementation; it is not budget matched.
3. **Matched sampling controls:** M0 uniform and M1 degree-aware at identical budgets.
4. **Candidate comparison:** selected M2–M5 variants at the same budgets and paired random inputs.

Development uses one smoke seed and three fixed paired seeds. Method selection uses validation NDCG@20 only. After the method/configuration is frozen, the primary comparison uses five paired final seeds if the measured compute envelope permits; any reduction must be recorded before test inspection. The test cohort is evaluated for final evidence, not method choice.

## 7. Predeclared method-selection rule

The rule selects what proceeds to G4/G5; it is not itself a claim of superiority.

1. **Reject invalid runs first.** A method is ineligible if it violates leakage, exact-k/uniqueness, candidate, normalization, finite-loss, deterministic-replay, or resource-log contracts.
2. **Use validation only.** For every fixed budget, summarize three paired development seeds for NDCG@20, peak GPU memory, epoch time, sampler time, throughput, sampled nodes/edges, and failures.
3. **Build the development Pareto set.** Maximize NDCG@20 and minimize peak GPU memory and epoch time. A method is dominated only when another valid method is no worse on all three development means and strictly better on at least one.
4. **Advance a learned/project candidate only if it enters that Pareto set and improves at least one axis over both M0 and M1 at a matched budget.** Otherwise select no learned method and preserve the result as a negative design finding.
5. **If several candidates qualify, choose lexicographically:** highest mean validation NDCG@20 at the tightest budget where each qualifies; then lower peak GPU memory; then lower epoch time; then lower sampler complexity/parameter count. An unresolved tie defaults to the simpler mechanism.
6. **Freeze before test.** Record method, budgets, configuration hash, seeds, and analysis code before final test evaluation. Test evidence may confirm or refute the development choice but cannot trigger a replacement.

Final claims report paired differences, per-seed values, mean/standard deviation, uncertainty intervals, resource traces, and failures. Statistical uncertainty is descriptive evidence, not a post-hoc pass threshold. No weighted composite score is used because an arbitrary weight could manufacture a preferred method.

## 8. Metrics and interpretation

| Metric | Meaning | What it does not prove alone |
|---|---|---|
| Exact full-catalog NDCG@20 | Rank-sensitive top-20 utility, with larger credit for earlier relevant items | scalability, calibration, or user satisfaction |
| Recall@20 | Fraction of held-out relevant items recovered in the top 20 | correct ordering inside the top 20 |
| Peak GPU/CPU memory | Maximum observed process/device allocation under the fixed profiler | speed or quality |
| Epoch wall time | End-to-end training time per epoch, including sampling | convergence quality or time to a target score |
| Time to best validation | Training time until the selected validation checkpoint | stable asymptotic efficiency |
| Throughput | processed targets/interactions per second | useful work if budgets or candidates differ |
| Sampler/propagation time | Separates selection overhead from GNN message passing | total application latency |
| Sampled nodes/edges and effective budget | Actual computation-graph size and budget compliance | informativeness of selected context |
| Failure rate and finite-loss checks | Operational stability | ranking quality |
| Head/middle/tail metrics | Distributional location of gains/losses by training degree | fairness beyond the audited cohorts |

## 9. G1 exit audit

| Exit evidence | Status | Location |
|---|---|---|
| Primary RQ and estimand | `COMPLETE` | Sections 2–3 |
| Falsifiable hypotheses and negative outcome | `COMPLETE` | Section 3 |
| Closest-work positioning and narrow claim | `COMPLETE` | Section 4 and literature matrix |
| Candidate mechanism family | `COMPLETE` | Section 5 |
| Matched-comparison design | `COMPLETE` | Section 6 |
| Predeclared selection/no-selection rule | `COMPLETE` | Section 7 |

**G1 decision: `PASS`.** This authorizes later sampler selection only after G2, E0-MIN, and G3 satisfy their own prerequisites. It does not authorize immediate implementation, empirical claims, or changing the rule after test inspection.

## 10. Primary sources

- Hamilton, Ying, and Leskovec, [GraphSAGE](https://arxiv.org/abs/1706.02216).
- Chen, Ma, and Xiao, [FastGCN](https://openreview.net/pdf?id=rytstxWAW).
- Huang et al., [AS-GCN](https://proceedings.neurips.cc/paper/2018/hash/01eee509ee2f68dc6014898c309e86bf-Abstract.html).
- Zou et al., [LADIES](https://proceedings.neurips.cc/paper/2019/hash/91ba4a4478a66bee9812b0804b6f9d1b-Abstract.html).
- Chiang et al., [Cluster-GCN](https://arxiv.org/abs/1905.07953).
- Zeng et al., [GraphSAINT](https://openreview.net/forum?id=BJe8pkHFwS).
- Ying et al., [PinSage](https://arxiv.org/abs/1806.01973).
- Wang et al., [DSKReG](https://arxiv.org/abs/2108.11883).
- Oh, Cho, and Bruna, [data-driven GraphSAGE sampling](https://arxiv.org/abs/1904.12935).
- Abu-El-Haija et al., [SubMix](https://proceedings.mlr.press/v216/abu-el-haija23a.html).
- Younesian et al., [GRAPES](https://arxiv.org/abs/2310.03399v3).
