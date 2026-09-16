# GRAPES-GFN-Rec Rebuild Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:executing-plans. Checkbox (`- [ ]`) tracking.
> **Before any edit:** read `Do An/00_project/DECISION_LOG_vn.md` → `PHASE2_GRAPES_GFN_REC_SPEC_vn.md` → this plan.

**Goal:** Implement a learned GRAPES variant for recommendation (GRAPES-GFN-Rec) and compare it with other sampling/training methods under one matched protocol.

**Architecture:** Sampler `GCN_S` + `GCN_Z` (Θ_S ∪ Θ_Z, Adam, TB loss) chooses exact-k context per layer for Sampled LightGCN (Θ_R, BPR). Development split inside pre-`t1` history for all design choices; current validation is holdout after freeze; test unread.

**Tech stack:** Python 3, PyTorch (CPU for oracle tests, Colab T4 for runs), NumPy, JSON manifests, Jupyter.

**Spec:** `Do An/00_project/PHASE2_GRAPES_GFN_REC_SPEC_vn.md` · **Component contract:** `Do An/02_protocol/GRAPES_RECOMMENDATION_SPEC_vn.md` (D1–D11, T01–T25)

## Global constraints

- No deletion of pilot evidence; label archived.
- Never read current validation/test before R4 freeze manifest exists.
- Graph, degree, candidate, sampler feature, normalization: training side only.
- A method is a "GRAPES variant" only if G1–G7 hold.
- Torch oracle tests run where torch is installed (cloud workspace or Colab); pure-Python contract tests run locally with `unittest`.

---

### Task R0: Governance reset — DONE 16/09/2026

- [x] Canonical spec with G1–G7, recommendation-specific issues R-1..R-8, dev split rule, comparator tiers, open decisions OD-1..OD-4.
- [x] `DECISION_LOG_vn.md` DL-001 with root cause and guardrails.
- [x] Central docs rewritten; 02_protocol contract promoted to normative; archived banners on report/thesis/EN/slides.
- [x] Consistency checker rejects "M2 is Phase 2/learned/GRAPES method"; requires `GRAPES-GFN-Rec` in canonical docs; repo integration test.

### Task R2: Primitives + oracles (local/cloud, CPU)

**Files:**
- Create `Do An/06_code/src/grapes_rec/gfn_sampler.py`
- Create `Do An/06_code/src/grapes_rec/sampled_lightgcn.py`
- Create `Do An/06_code/src/grapes_rec/gfn_trainer.py`
- Create `Do An/06_code/tests/test_gfn_sampler_torch.py`, `test_sampled_lightgcn_torch.py`, `test_gfn_trainer_torch.py`

**Interfaces:**
- `TorchBipartiteGraph(num_users, num_items, edges)` → CSR neighbors, `degree`, `neighbors(nodes)`, `induced_edges(nodes)`
- `candidate_set(graph, prev_nodes) -> LongTensor` (T05, T06)
- `gumbel_topk(logits, k, generator) -> LongTensor` (T07, T10, D11)
- `bernoulli_log_prob(logits, mask) -> Tensor` (T16, T17, T21)
- `SamplerGCN`, `LogZGCN` modules; `GRAPESSampler.sample(v0, graph, k_per_layer, generator) -> SampleTrace(layers, log_q, log_z, stats)`
- `build_block(graph, sources, targets, norm="sampled_bi"|"full") -> Block` (D1, D2, T11, T13)
- `SampledLightGCN.forward(trace, v0) -> z_v0` prefix-depth (T12, T14, T15)
- `bpr_loss`, `trajectory_balance_loss`, `reinforce_loss` (T18, T19, T22)
- `GFNTrainStep(recommender, sampler, opt_r, opt_s, alpha, mode="tb"|"rl"|"uniform"|"degree")` (T20, G7)

Implemented files (16/09/2026): `torch_graph.py`, `gfn_sampler.py`, `sampled_lightgcn.py`, `gfn_trainer.py`, `tests/test_gfn_rec_torch.py` (28 torch oracle tests; skipped where torch is absent).

Steps:
- [x] Failing tests first for T01–T03, T05–T10, T16, T17, T21, D8 re-entry; implement sampler primitives (one code path for learned/uniform/degree).
- [x] T11–T15: path oracle unit weights = 1, full-degree = 1/2, sampled bi-norm = 1/√2 (hand-derived: `a` also receives from `t ∈ K²`); full receptive field equals full LightGCN for a single-user target.
- [x] Documented property test: non-cumulative `K^l = V0 ∪ V^l` is **not** full-LightGCN-equivalent for mixed user+item targets (V¹ nodes drop out of K²). Must be stated in report.
- [x] T18 exact-enumeration REINFORCE gradient −0.5; T19 manual TB, `log Z` permutation/outside invariance, isolated finite; T20 ownership both directions; G7 sampler parameters change; deterministic replay; T22; T25 holdout guard.
- [x] Mutation check (cloud, torch 2.14 CPU): removing TB detach, dropping unselected terms from `log q`, cumulative-union state, wrong RL sign → each killed by the suite.
- [ ] Remaining for R2 close: T04 negative validity in batch sampler; T23 + D9 transient positive-edge mask; D6 legacy target+neighbour `log Z` ablation; sparse/partitioned sampler embedding option for 2.48M nodes on T4 (R-5).

### Task R1: Development split (Colab)

**Files:** `configs/grapes_gfn_rec_development_protocol_v1.json`, `notebooks/11_grapes_gfn_rec_development_graph.ipynb`, `tests/test_grapes_gfn_rec_protocol.py`

- [ ] Register rule of spec §3.1 in config (t0 = t1 − (t2 − t1); fallback 80% edge quantile; thresholds 20.000 targets / 50% edges).
- [ ] Contract test: notebook never opens `baby_p4_validation_targets` / `baby_p4_test_targets`; reads raw P4 only with `timestamp < t1`.
- [ ] Notebook outputs `dev_train_edges.csv.gz`, `dev_user_mapping`, `dev_item_mapping`, `dev_targets.csv.gz`, `development_graph_manifest.json` (counts, degree stats, retention, SHA-256, which rule fired).
- [ ] Copy manifest to `results/grapes_gfn_rec_development/`; test asserts timestamp ordering and isolation fields.

### Task R3: Development experiments (Colab)

**Files:** `notebooks/12_grapes_gfn_rec_development.ipynb`, `configs/grapes_gfn_rec_development_v1.json`, `tests/test_grapes_gfn_rec_dev_notebook.py`, `results/grapes_gfn_rec_development/`

- [ ] R3a Backbone adequacy: MostPop vs Full LightGCN on `D_dev` across an epoch grid registered in config; pick smallest budget where Full LightGCN > MostPop. Fail → decision log entry before continuing.
- [ ] R3b Budget regime shared by all samplers: batch size grid (e.g. 1024/4096/16384) × `k_l` relative to |V⁰|; record sampler updates per run, wall time, memory on T4.
- [ ] R3c Sampler sweep (dev only): `α` log-grid, `log_z_init`, `lr_S`; select by dev NDCG@20 with cost reported; one seed for sweep, second seed to confirm.
- [ ] R3d Learning evidence (G7): selected-node degree/type/cohort distribution differs from M0 at same candidates; `‖ΔΘ_S‖>0`; TB residual decreases.
- [ ] R3e Feasibility: sampler overhead ≤ registered ceiling per epoch; else reduce `GCN_S` width or candidate subgraph and log decision.

### Task R4: Freeze

**Files:** `configs/grapes_gfn_rec_holdout_matrix_v1.json`, `results/grapes_gfn_rec_freeze_manifest.json`, `tests/test_grapes_gfn_rec_freeze.py`

- [ ] Decide OD-1..OD-4 with Ty; record in decision log.
- [ ] Hash method code, configs, graph artifacts, evaluator, analysis script; seeds; `current_validation_read=false`.
- [ ] Test rejects any holdout run whose hashes/seeds differ from freeze.

### Task R5: Holdout paired matrix (Colab)

**Files:** `notebooks/13_grapes_gfn_rec_paired_holdout.ipynb`, `results/grapes_gfn_rec_paired_holdout/`, `tests/test_grapes_gfn_rec_holdout.py`

- [ ] Methods: GRAPES-GFN-Rec, GRAPES-RL-Rec, M0, M1 (tier A); Full LightGCN, MostPop, BPR-MF (tier B) × registered seeds; resume-safe, one writer.
- [ ] Contract tests: matched BPR order/negatives/init per seed; no test read; complete resource and sampler logs.
- [ ] Verify hashes, rank-vector lengths, metric recomputation.

### Task R6: Analysis

- [ ] RQ1 paired Δ table + cost; RQ2 TB vs RL stability; RQ3 sampler behaviour and exposure/hit by cohort; RQ4 tight budget; ablations D9 mask, D6 legacy log Z.
- [ ] Failure records; no significance unless registered.

### Task R7: Thesis communication

**Files:** `04_thesis/THESIS_REPORT_vn.{md,tex}`, `05_slides/build_thesis_presentation_vn.mjs`, `THESIS_PRESENTATION_vn.pptx`, `03_reports/REPORT_TEACHER_vn.md`, EN mirrors

- [ ] Narrative: data audit → why sampling → GRAPES → adaptation (R-1..R-8) → protocol → results → behaviour → limits → future work; M2 in appendix "archived frontier heuristic pilot".
- [ ] Teacher feedback items covered: data imbalance/long-tail, why dataset, neighbour explosion, reproducibility reasons, step-by-step Phase 2 workload, summary slide.
- [ ] Update checker required phrases for the new deck; compile, render, run checker and full suite.
