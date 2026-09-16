# GRAPES Source and Version Note

> **Status:** `REFERENCE PIN RECORDED; PHASE 1 COMMIT UNKNOWN`
> **Recorded:** 2026-08-26  
> **Purpose:** define versioned GRAPES sources for scientific reference, comparator design, and historical provenance. This note does not select the thesis method or define canonical gates.

## 1. Version decision

### Paper pin

- `VERIFIED FACT`: The method reference is **GRAPES arXiv:2310.03399v3**, last revised 2025-07-15. [arXiv version record](https://arxiv.org/abs/2310.03399v3)
- Local reference PDF: [`2310.03399v3.pdf`](</Users/tyvan/Documents/Master/ThucTap2/GRAPES report/2310.03399v3.pdf>).
- Local PDF SHA-256: `53acf70a8cd721e279f2f3b0779a018b0f32e0f17d4ea02038099b8e9f6d35af`.

### Official code pin for Phase 2

- Official repository: [github.com/dfdazac/grapes](https://github.com/dfdazac/grapes).
- `VERIFIED FACT`: `refs/heads/main` resolved by read-only `git ls-remote` to commit:

```text
71ecebeaac896800aa4dd1d0f38c57ec222ef396
```

- Resolution date: 2026-08-26.
- `DECISION`: This commit is the pinned official-code reference for Phase 2. Future implementation must record whether it starts from this commit, ports selected components, or reimplements them under tests.
- No local Phase 2 code clone has been created yet.

## 2. Phase 1 local snapshot provenance

- Snapshot root: `/Users/tyvan/Documents/Master/ThucTap2/GRAPES report/grapes-main`.
- File count at audit: 49 files.
- `.git` metadata: absent.
- Content-manifest fingerprint, computed from sorted per-file SHA-256 values relative to the snapshot root:

```text
ea365d646d93e6801bb0c60d02b01d53db9af98dcf18310c1c2cdc1bc0bd1fcb
```

- `UNKNOWN`: exact commit, tag, branch, remote configuration, and byte identity with the Colab runtime clone.
- `VERIFIED FACT`: the local `main.py` has 390 lines, while the current official `main.py` at the pinned branch head has 352 lines. The local snapshot is therefore not byte-identical to the current official file.
- The snapshot is preserved as read-only Phase 1 evidence, not used as an unqualified version identifier.

## 3. Phase 1 executed-code provenance

The executed notebook records the following:

1. It cloned `https://github.com/dfdazac/grapes.git` without a branch, tag, or commit pin: [`GRAPES_Colab and result.ipynb`](</Users/tyvan/Documents/Master/ThucTap2/GRAPES report/GRAPES_Colab and result.ipynb:110>).
2. It patched SciPy indexing in `modules/utils.py` and patched installed OGB code before execution: [notebook patch section](</Users/tyvan/Documents/Master/ThucTap2/GRAPES report/GRAPES_Colab and result.ipynb:209>).
3. It ran GFlowNet and Random configurations for Cora, CiteSeer, ogbn-arxiv, and one incomplete ogbn-products run; it did not execute the RL configuration in the recorded reproduction.
4. The result record timestamp is 2026-05-30 and reports Tesla T4 with PyTorch `2.11.0+cu128`: [`grapes_results.json`](</Users/tyvan/Documents/Master/ThucTap2/GRAPES report/grapes_results.json:1>).

`CONCLUSION`: The Phase 1 reproduction cannot be attributed to an exact commit. Any reused numerical result must retain this provenance limitation.

## 4. Environment records

| Environment | Recorded versions | Status |
|---|---|---|
| Official repository manifest | Python 3.9.20; PyTorch 1.13.1; `pytorch-cuda=11.7`; PyG 2.5.2 | `VERIFIED LOCAL MANIFEST` |
| Executed Phase 1 Colab | Tesla T4; PyTorch 2.11.0+cu128; PyG 2.7.0; OGB 1.3.6 | `VERIFIED EXECUTION RECORD` |
| Current Mac system Python | Python 3.14.5; PyTorch absent; no NVIDIA GPU | `VERIFIED LOCAL STATE` |
| Phase 2 project environment | Not created | `OPEN` |

The repository manifest and executed Colab environment are materially different. Neither may be called the Phase 2 environment until an explicit environment decision and smoke test are recorded.

## 5. Local implementation entry points

| Component | Phase 1 local evidence | Adaptation relevance |
|---|---|---|
| CLI and training entry | [`main.py:23`](</Users/tyvan/Documents/Master/ThucTap2/GRAPES report/grapes-main/main.py:23>), [`main.py:57`](</Users/tyvan/Documents/Master/ThucTap2/GRAPES report/grapes-main/main.py:57>) | Replace node-target loader and classifier task loop |
| Sampler GNN | [`main.py:112`](</Users/tyvan/Documents/Master/ThucTap2/GRAPES report/grapes-main/main.py:112>), logits at [`main.py:210`](</Users/tyvan/Documents/Master/ThucTap2/GRAPES report/grapes-main/main.py:210>) | Preserve policy role; redesign inputs for user/item nodes |
| Gumbel Top-k utility | [`modules/utils.py:13`](</Users/tyvan/Documents/Master/ThucTap2/GRAPES report/grapes-main/modules/utils.py:13>) | Candidate for tested port; includes off-policy likelihood behavior |
| Candidate expansion | [`main.py:178`](</Users/tyvan/Documents/Master/ThucTap2/GRAPES report/grapes-main/main.py:178>) | Must be replaced by tested bipartite block construction |
| Sampled adjacency slicing | [`main.py:240`](</Users/tyvan/Documents/Master/ThucTap2/GRAPES report/grapes-main/main.py:240>) | Orientation discrepancy requires resolution |
| Classifier GNN/loss | [`main.py:109`](</Users/tyvan/Documents/Master/ThucTap2/GRAPES report/grapes-main/main.py:109>), [`main.py:120`](</Users/tyvan/Documents/Master/ThucTap2/GRAPES report/grapes-main/main.py:120>) | Replace with LightGCN-style recommender and BPR loss |
| `GCN_Z` normalizer | [`main.py:114`](</Users/tyvan/Documents/Master/ThucTap2/GRAPES report/grapes-main/main.py:114>), prediction at [`main.py:223`](</Users/tyvan/Documents/Master/ThucTap2/GRAPES report/grapes-main/main.py:223>) | Must be conditioned on mixed user/item target sets |
| RL and TB objectives | [`main.py:277`](</Users/tyvan/Documents/Master/ThucTap2/GRAPES report/grapes-main/main.py:277>) | Paper/code sign and semantics require explicit tests |
| Full-graph evaluation | [`eval.py:47`](</Users/tyvan/Documents/Master/ThucTap2/GRAPES report/grapes-main/eval.py:47>) | Supports the common full-graph inference decision |
| Dataset dispatcher | [`modules/data.py:252`](</Users/tyvan/Documents/Master/ThucTap2/GRAPES report/grapes-main/modules/data.py:252>) | Node-classification-specific; do not reuse as recommendation loader |

## 6. Verified paper/code discrepancies and cautions

### D-SRC-01 — REINFORCE sign

- Paper Equation 5 writes `L_C log q`.
- Local public-code snapshot minimizes `-log q × detached loss` at `main.py:279`.
- Status: `UNRESOLVED DISCREPANCY`.
- Required resolution: a toy two-action gradient-direction test plus inspection of the pinned commit before the RL objective is frozen.

### D-SRC-02 — training/evaluation block orientation

- Local training slices adjacency with `rows=batch_nodes, cols=previous_nodes` at `main.py:241–243`.
- Local sampled evaluation uses `rows=previous_nodes, cols=batch_nodes` at `eval.py:140–142`.
- Status: `UNRESOLVED DISCREPANCY`.
- Required resolution: define source/target convention and prove it with a two-layer toy graph.

### D-SRC-03 — likelihood versus conditioned action

- Paper v3 states that exact-`k` Gumbel Top-k actions are sampled from a distribution conditioned on cardinality `k`, while the optimization likelihood uses the unconditioned Bernoulli policy.
- Local utility returns `Bernoulli.log_prob(mask)` over selected and unselected candidates when `k < n`.
- Status: `VERIFIED OFF-POLICY MISMATCH`; do not call the conditioned-policy estimator unbiased without a derivation.

### D-SRC-04 — `k >= n` branch

- Local utility selects all candidates and returns only `logsigmoid(logits)` values when `k >= n`.
- The aggregation semantics differ in shape/content from the full binary-mask branch.
- Status: `NEEDS SPECIFICATION AND TEST`.

### D-SRC-05 — sampler features

- Paper v3 uses regular node embeddings/features plus a layer indicator.
- Separate sampler-only ID embeddings for recommendation are an adaptation choice, not unchanged GRAPES behavior.
- Status: `PROPOSED`; ownership and gradients must be specified.

## 7. Source-governance rule for Phase 2

Use this precedence:

1. explicit project scope and scientific rules;
2. GRAPES arXiv v3 for formal method semantics;
3. pinned official commit `71ecebeaac896800aa4dd1d0f38c57ec222ef396` for implementation evidence;
4. Phase 1 snapshot/notebook for historical reproduction evidence only.

When paper and code disagree, record the discrepancy, design a minimal falsification/unit test, and freeze the choice in the specification. Never silently choose whichever behavior produces a better result.

## 8. Current source status

- Paper version: `PINNED`.
- Official code reference: `PINNED`.
- Exact Phase 1 executed commit: `UNKNOWN` and not recoverable from current artifacts.
- The Phase 2 reference-design environment remains historical. The completed empirical branch is the fixed M0/M1/M2 comparison, documented in the [current research plan](../00_project/PHASE2_RESEARCH_PLAN_en.md).
