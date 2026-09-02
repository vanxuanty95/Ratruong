# GRAPES-Informed Reference Design for Graph-Sampling Recommendation

> **Status:** `REFERENCE DESIGN — SUPERSEDED AS THE CANONICAL PHASE 2 METHOD`  
> **Recorded:** 2026-08-26  
> **Role:** candidate mechanisms and verification ideas informed by GRAPES; not the final thesis method.

## 1. Purpose and source governance

This document records a candidate technical reference design. It may guide an initial baseline or ablation path, but the final thesis method must be defined and validated from the thesis research problem, literature gap, data constraints, and controlled experiments. Historical `FROZEN`, `RETAINED`, and `REPLACED` labels below are not binding on the final method unless explicitly re-adopted with rationale and verification.

**Status interpretation:** D1–D11 and T01–T25 lock only the internal semantics of this GRAPES-informed reference design when it is exercised. They do not lock the final thesis method, final baseline set, dataset protocol, or final experimental schedule. Any historical week label is retained solely as a record of when an idea was first documented.

Source precedence:

1. locked project scope and scientific rules;
2. GRAPES arXiv:2310.03399v3 for formal method semantics;
3. official GRAPES commit `71ecebeaac896800aa4dd1d0f38c57ec222ef396` for implementation evidence;
4. Phase 1 snapshot/notebook for historical reproduction evidence only;
5. BPR and LightGCN primary papers for recommendation semantics.

When paper and code disagree, the discrepancy remains open until a minimal unit/falsification test and a written decision resolve it.

## 2. Adaptation contract

| Original GRAPES | Recommendation adaptation | State |
|---|---|---|
| Target-node classification batch | Ordered multiset of BPR triplets plus a deduplicated endpoint target set | `PROPOSED REFERENCE CHOICE` |
| General attributed graph | Training-only user–item bipartite graph | `PROPOSED REFERENCE CHOICE` |
| Node features `X` | Separate sampler ID embedding plus node type, layer-history indicator, and training-only degree | `PROPOSED REFERENCE CHOICE` |
| `GCN_S` policy | Candidate layer-wise node scorer | `GRAPES-INFORMED CANDIDATE` |
| Gumbel Top-k | Candidate exact-cardinality node selection without replacement | `GRAPES-INFORMED CANDIDATE` |
| `GCN_C` classifier | Candidate LightGCN-style recommender `GNN_R` | `PROPOSED REFERENCE CHOICE` |
| Classification loss | Candidate mean BPR ranking loss | `PROPOSED REFERENCE CHOICE` |
| REINFORCE and TB | Candidate policy-learning objectives with a detached ranking signal | `GRAPES-INFORMED CANDIDATE` |
| Full-graph classification inference | Candidate full-graph recommendation embeddings and full-catalog ranking | `PROPOSED REFERENCE CHOICE` |

## 3. Graph, IDs, and batch semantics

### 3.1 Training graph

```text
G_train = (U ∪ I, E_train)
```

Required invariants:

- `U` and `I` are disjoint global-ID ranges; items use an explicit offset.
- Every edge joins one user and one item.
- `E_train` contains only positive interactions available before the training cutoff.
- Candidate expansion, normalization, and propagation use `G_train` or the registered transient batch view from D9; static sampler degree features use `G_train` only.
- Validation and test edges/statistics are forbidden from every training structure.

Write `E_work = E_train` for the primary retain protocol. D9 replaces it with a transient batch-masked view only in the registered sensitivity ablation.

### 3.2 Ordered BPR batch

```text
B = [(u_b, i_b+, i_b−)] for b = 1,...,M
```

`B` is an ordered multiset. Duplicate endpoints and duplicate users are allowed. The mapping from every triplet position to its three global IDs must be preserved after node deduplication.

### 3.3 Initial target set

```text
V⁰ = unique({u_b, i_b+, i_b− for every triplet in B})
K⁰ = V⁰
```

The uniqueness operation creates the graph target set but must not alter BPR multiplicity or ordering.

## 4. Layer-wise sampling semantics

For each layer `l = 1,...,L`:

```text
Cˡ = N_Ework(Kˡ⁻¹) \ Kˡ⁻¹
n_l = |Cˡ|
k_l_effective = min(k_l, n_l)
```

Candidate invariants:

- every candidate is adjacent to at least one node in `Kˡ⁻¹`;
- no candidate belongs to `Kˡ⁻¹`;
- candidates are unique global node IDs;
- the budget is global per batch and layer, not per triplet or per target node.

### 4.1 Policy probabilities and action

For each candidate `v`:

```text
logit_v = GCN_S(candidate subgraph, sampler features, layer state)_v
p_v = sigmoid(logit_v)
g_v ~ Gumbel(0, 1)
Vˡ = TopK_{v in Cˡ}(log(p_v) + g_v, k_l_effective)
```

Required action invariants:

```text
|Vˡ| = min(k_l, |Cˡ|)
Vˡ contains no duplicates
Vˡ ∩ Kˡ⁻¹ = empty
Kˡ = V⁰ ∪ Vˡ
```

`Kˡ` is not the cumulative union of all earlier sampled sets.

`DECISION D8`: Cross-layer re-entry is allowed. Only `Kˡ⁻¹` is excluded, so a node from `Vˡ⁻²` may become eligible again. This preserves the paper definition and the pinned/local code behavior; no global "sampled once" mask is permitted.

### 4.2 Unconditioned likelihood used for learning

Let `m_v = 1` if `v ∈ Vˡ`, otherwise `0`. The proposed paper-faithful unconditioned Bernoulli log-likelihood is:

```text
log q_l = sum_{v in Cˡ} [m_v log(p_v) + (1-m_v) log(1-p_v)]
log q_trajectory = sum_{l=1}^L log q_l
```

It includes selected and unselected candidates. Gumbel noise affects the action only and is not part of evaluated `log q_l`.

The action is drawn from an exact-`k` conditioned distribution while this likelihood is unconditioned. This is an explicit off-policy mismatch inherited from GRAPES v3.

`DECISION D11`: Use the same full Bernoulli definition in every cardinality branch. If `Cˡ` is empty, `Vˡ` is empty and `log q_l = 0` (the empty sum). If `0 < |Cˡ| <= k_l`, all candidates are selected and `log q_l = sum_{v in Cˡ} log(p_v)`. Implement with stable log-sigmoid operations and test finite outputs; do not inherit branch-dependent semantics silently.

### 4.3 GFlowNet trajectory state

The state stores full history:

```text
sˡ = (V⁰, V¹, ..., Vˡ)
```

This state has one parent under the GRAPES construction, so the backward transition probability is one. `Kˡ` alone is not a sufficient GFlowNet state representation.

## 5. Sampler feature and parameter ownership

### 5.1 Frozen primary sampler input

Let `N = |U| + |I|`, and let the sampler width equal the recommender width: `d_S = d_R = d`. If this reference design is exercised, the numerical value of `d` is selected once by the shared resource/validation protocol and is then identical for every sampler; it is not tuned separately for GRAPES. Two logically typed sampler tables may be implemented as one offset-indexed table:

```text
E_S in R^(N x d)
```

For policy step `l`, the gathered sampler input is:

```text
X_S^l(v) = concat(E_S(v), onehot(type_v), degree_feature_v, history_v)
X_S^l in R^(|K^(l-1) union C^l| x (d + L + 4))
```

where:

- `onehot(type_v)` has width two for user/item;
- `degree_feature_v = log(1 + degree_Gtrain(v)) / log(1 + d_max_train)` is a fixed scalar computed from `G_train` only;
- `history_v` has width `L+1`: channel zero marks `V^0`, and channel `j` records membership in sampled set `V^j`; it may be multi-hot under the D8 cross-layer re-entry rule;
- a never-selected candidate has zero history channels.

The primary `GCN_S` is a two-layer GCN with widths `(d + L + 4) -> d -> 1`, ReLU after the first layer, no output activation before the Bernoulli sigmoid, and no dropout. Its candidate subgraph is the symmetrized original-edge subgraph on `K^(l-1) union C^l`; standard GCN self-loops are allowed in this auxiliary sampler only.

Detached recommender embeddings remain a named input ablation, not the primary input.

### 5.2 Frozen ownership and optimization contract

- Recommender parameters `Theta_R` and sampler parameters `Theta_S` use disjoint storage; tables are never aliased or copied.
- Recommender parameters are updated only by `L_model` optimization.
- `Theta_S` contains `E_S` and `GCN_S`; `Theta_Z` contains only `GCN_Z` weights.
- RL uses one Adam optimizer over `Theta_S`; GFN uses one Adam optimizer over `Theta_S union Theta_Z`. Each shared tensor appears in exactly one parameter group.
- Sampler weight decay and explicit sampler-embedding regularization are zero in the primary protocol. The sampler learning rate is selected on validation from a pre-registered grid and is not selected using test results.
- Initialize each sampler-embedding component with zero-mean Gaussian variance `1/d`, equivalently standard deviation `1/sqrt(d)`, using the experiment seed. Initialize GCN weights with the framework's recorded Glorot scheme and biases to zero.
- The BPR task signal is detached before entering the sampler objective. No gradient passes through discrete Top-k.
- A sampler optimizer step must produce zero/`None` gradient for `Theta_R`, and recommender optimization must not update `Theta_S` or `Theta_Z`.
- The model is warm-start only: the user/item universe is frozen from the training-only filtering protocol, validation/test interactions are projected into that universe, exclusions are reported, and any remaining out-of-vocabulary ID raises an error. There is no random/hash/`UNK` fallback.

`DECISION D7`: The sampler representation, dimension tie, initialization distribution, optimizer ownership, zero regularization, and OOV behavior above are frozen engineering decisions. They are not claims derived from GRAPES.

## 6. Sampled blocks and LightGCN semantics

For each layer, define source and destination sets:

```text
S_l = K^l
T_l = K^(l-1)
E_l-> = {(s,t): s in S_l, t in T_l, {s,t} in E_work}
```

`E_work` is `G_train` in the retain protocol and the transient batch graph from D9 in the mask protocol. Only original bipartite edges are allowed.

LightGCN requirements:

- no synthetic self-loops;
- no feature transformation matrices;
- no nonlinear activation;
- separate user/item initial embeddings or an equivalent typed global table;
- final representation combines depths zero through `L` with uniform coefficients `alpha_r = 1/(L+1)`, frozen across all sampler comparisons;
- dot-product user–item scoring.

Including `V⁰` in each `Kˡ` preserves target availability but must not create self-loop edges.

### 6.1 Block orientation and depth construction

Define the rectangular propagation matrix:

```text
P_l in R^(|T_l| x |S_l|)
```

In PyG `source_to_target` form, `edge_index_l` has shape `[2, |E_l->|]`: row zero indexes sources in `S_l`, row one indexes destinations in `T_l`, and `size = (|S_l|, |T_l|)`. Blocks are constructed outward for `l = 1,...,L` and executed inward.

Because GRAPES uses non-cumulative `K^l = V^0 union V^l`, canonical LightGCN depths cannot be taken from intermediate target rows of one deepest pass. For each depth `r` independently:

```text
H_(r,r)^0 = E_R[K^r]                         in R^(|K^r| x d)
H_(r,l-1)^(r-l+1) = P_l H_(r,l)^(r-l)       for l = r,...,1
e_V0^r = H_(r,0)^r                          in R^(|V^0| x d)
e_V0^0 = E_R[V^0]
z_V0 = sum_(r=0)^L alpha_r e_V0^r
```

Thus depth `r` executes the prefix blocks `P_r,...,P_1`. A fused implementation is allowed only if it is numerically identical to these explicit prefix products at every depth. Every gather uses global-ID maps; tensors from different `K^l` sets are never aligned by local row position.

`DECISION D1`: The canonical direction is `K^l -> K^(l-1)` in PyG and the canonical LightGCN construction uses independent inward prefix products. This transposes the literal row/column reading of GRAPES Eq. (2), but matches the receptive-field dependency, PyG's documented convention, and the local training direction. The opposite sampled-evaluation slice in Phase 1 is rejected.

Toy oracle: with path `b--a--t`, `V^0={t}`, `V^1={a}`, `V^2={b}`, scalar initial values `e_b=1`, `e_t=0`, and unit edge weights, `P_2` must send `b -> a` and then `P_1` must send `a -> t`; therefore the depth-two target output is exactly one. Reversing either block cannot transmit `b` to `t`.

### 6.2 Rectangular normalization

Let `B_l in {0,1}^(|T_l| x |S_l|)` be the binary block. Primary sampled-local degrees and weights are:

```text
d_dst_l(t) = sum_s B_l[t,s]
d_src_l(s) = sum_t B_l[t,s]
P_l[t,s] = B_l[t,s] / sqrt(d_dst_l(t) d_src_l(s))
```

Zero inverse degrees are defined as zero. This is rectangular bi-normalization; one shared degree matrix on both sides is dimensionally invalid when source and destination spaces differ.

The mandatory full-degree ablation uses:

```text
P_l_full[t,s] = B_l[t,s] / sqrt(degree_Ework(t) degree_Ework(s))
```

`DECISION D2`: Sampled-block bi-normalization is primary. Full-graph LightGCN normalization is a named mandatory ablation. Exact equivalence to full LightGCN is claimed only when all required receptive-field nodes/edges are present, prefix-depth construction is used, and degrees come from the same working graph. Full sampling alone does not make sampled-local degrees equivalent.

Numeric oracle: on `t--a--b`, with full-graph degrees `(1,2,1)` and initial `(e_t,e_a,e_b)=(0,0,1)`, the full-degree depth-two target value is `(1/sqrt(2))*(1/sqrt(2))=1/2`.

`DECISION D3`: No synthetic self-loop is allowed in the LightGCN recommender.

## 7. Recommendation objective

For each ordered triplet:

```text
s(u, i) = z_u^T z_i
delta_b = s(u_b, i_b+) - s(u_b, i_b−)
L_rank = -mean_b log sigmoid(delta_b)
```

`DECISION D10`: Use mean batch reduction so task-signal scale is not changed by batch size.

Use endpoint-only ego-embedding regularization:

```text
L_reg = mean_b [||e_u_b^0||^2 + ||e_i_b+^0||^2 + ||e_i_b-^0||^2]
L_model = L_rank + lambda_R * L_reg
L_task = stopgrad(L_rank)
```

`DECISION D5`: The one sampler trajectory is global to the BPR batch, so its cost is the detached mean `L_rank` for that batch. `L_reg` remains in recommender optimization but is excluded from RL/TB: for fixed triplets it is action-independent and would add variance or a batch-dependent offset without sampling credit. The primary paper-faithful RL objective uses no baseline; an action-independent baseline may only be a named variance-reduction ablation.

### Positive-edge protocol

- Primary protocol: retain `(u, i+)` as a standard LightGCN training edge.
- Mandatory sensitivity ablation: deduplicate the batch positives and construct `M_B = {{u_b,i_b+}}`; remove both directed storage arcs of every member only from a transient `E_work = E_train minus M_B`.
- Construct the transient graph after triplet/negative selection and before candidate expansion. Use it for candidate enumeration, `GCN_S` adjacency, target-induced `GCN_Z` adjacency, sampled blocks, propagation-normalization degrees, and every recommender propagation depth.
- Keep the static sampler degree feature fixed from the original `G_train`; changing it would add a second intervention. Negative validity is also checked against the original declared positive set.
- Duplicate positives decrement binary graph degree once. Discard the transient view after the batch; never modify `G_train` permanently.
- Both retain and mask models use the complete `G_train` for common deterministic inference. Every sampler comparison uses the same retain/mask condition.

`DECISION D9`: The primary retains current positive edges. The mandatory mask sensitivity removes them from all batch message-passing/candidate structures, including `GCN_Z`, while leaving static train-degree features unchanged. It tests a propagation shortcut; it does not claim to make the positive interaction information-theoretically invisible.

## 8. Sampler objectives

### 8.1 GRAPES-RL-Rec

Paper-form candidate:

```text
L_RL = stopgrad(L_task) * log q_trajectory
```

The local public-code snapshot instead uses:

```text
L_RL_code = -stopgrad(L_task) * log q_trajectory
```

`DECISION D4`: Minimize the paper-form objective with the positive sign and no primary baseline:

```text
L_RL = stopgrad(L_task) * log q_trajectory
```

For `q(a)=sigmoid(theta)`, losses `L(a)=1`, `L(b)=3`, and `theta=0`, the exact expected-cost gradient is `-2q(1-q)=-0.5`; gradient descent therefore increases `q(a)`. The local code's leading minus sign gives the opposite direction when the quantity is a cost and is rejected. This decision does not remove GRAPES's documented mismatch between exact-`k` sampling and the unconditioned Bernoulli learning likelihood.

### 8.2 GRAPES-GFN-Rec

```text
R = exp(-alpha * L_task)
L_TB = [log Z(V⁰) + log q_trajectory + alpha * stopgrad(L_task)]^2
```

Requirements:

- `Z(V⁰)` is positive and conditioned on the target set;
- a trainable `GCN_Z` or explicitly justified equivalent predicts `log Z(V⁰)`;
- reward coefficient `alpha` is selected on validation only;
- log-probability, reward, `log Z`, and TB terms are logged separately;
- numerical stabilization cannot silently change the objective.

For `n_0=|V^0|`, let `A_0` be the adjacency induced by `V^0` in the current `E_work`. Add self-loops only inside this auxiliary normalizer and compute its standard symmetric GCN normalization. Define:

```text
X_Z = concat(E_S[V^0], onehot(type), fixed_train_degree_feature)
X_Z in R^(n_0 x (d + 3))
H_Z = ReLU(GCN_Z1(X_Z, A_0 + I))             in R^(n_0 x d)
r_Z = GCN_Z2(H_Z, A_0 + I)                    in R^(n_0 x 1)
log Z(V^0) = mean_v r_Z[v,0]                  scalar
```

`log Z` is unconstrained; `Z=exp(log Z)` is positive conceptually and need not be materialized. There are no candidate nodes or edges leaving `V^0`. When `A_0` has no non-self edge, this network correctly reduces to a shared per-target transform plus permutation-invariant mean pooling; no structural-conditioning claim is made in that case. `E_S` remains sampler-owned shared input, `GCN_Z` weights are `Theta_Z`, and the TB optimizer updates `Theta_S union Theta_Z` only.

`DECISION D6`: The target-only construction above is primary and follows the paper's `Z(V^0)` conditioning. The local target-plus-candidate construction is permitted only as a named legacy ablation. Required oracles are target-order permutation invariance, invariance to changes outside `V^0`, a finite scalar for isolated targets, and zero recommender gradients.

## 9. Training and inference

### Training iteration

1. Obtain ordered BPR triplets and fixed negatives.
2. Build `V⁰` while retaining the triplet-to-node index map.
3. Sample outward for layers `1...L` with GRAPES.
4. Build typed sampled blocks.
5. Execute LightGCN propagation in the frozen block order.
6. Gather `u`, `i+`, and `i−` embeddings via the preserved triplet map.
7. Compute `L_model`; update `Theta_R`.
8. Compute detached task signal; update either GRAPES-RL-Rec or GRAPES-GFN-Rec parameters.
9. Log quality, policy, candidate, sample, gradient, memory, and timing diagnostics.

### Primary inference

- Freeze trained model parameters.
- Use the full training graph only.
- Perform deterministic full-graph LightGCN propagation with the same initial embeddings, layer count, and layer-combination coefficients.
- Score the eligible full item catalog in chunks.
- Exclude previously observed items under the frozen evaluation protocol.
- The sampler is not used for the primary inference claim.

Therefore, Phase 2 may claim sampled-training behavior only, not sampled-inference scalability.

## 10. GRAPES-informed reference-design decisions

These decisions are `REFERENCE-SPECIFIED`: they close ambiguity inside this comparator/reference design only. They do not select the thesis method and do not close canonical Gate G1.

| ID | Decision | State | Required closure evidence |
|---|---|---|---|
| D1 | Block orientation and execution order | `REFERENCE-SPECIFIED: SOURCE K^l TO TARGET K^(l-1); PREFIX DEPTHS` | Two-layer toy derivation and test oracle |
| D2 | Exact sampled-local normalization | `REFERENCE-SPECIFIED: RECTANGULAR BI-NORMALIZATION` | Formula plus full-coverage equivalence test |
| D3 | Self-loop semantics | `REFERENCE-SPECIFIED: NONE` | LightGCN source and adjacency test |
| D4 | REINFORCE sign | `REFERENCE-SPECIFIED: POSITIVE COST TIMES LOG-PROBABILITY` | Two-action gradient-direction test |
| D5 | Ranking-only or regularized sampler signal | `REFERENCE-SPECIFIED: DETACHED MEAN RANKING LOSS` | Credit-assignment rationale and invariance test |
| D6 | `GCN_Z` recommendation construction | `REFERENCE-SPECIFIED: TARGET-INDUCED GCN AND MEAN SCALAR` | Input/pooling/output specification |
| D7 | Sampler embedding details | `REFERENCE-SPECIFIED: SEPARATE SAMPLER-OWNED TABLES` | Ownership, initialization, optimizer, and OOV specification |
| D8 | Cross-layer node re-entry | `REFERENCE-SPECIFIED: ALLOWED` | Paper/code audit and explicit invariant |
| D9 | Positive-edge masking stage | `REFERENCE-SPECIFIED: RETAIN PRIMARY; TRANSIENT FULL-PIPELINE MASK ABLATION` | Candidate/propagation pseudocode |
| D10 | BPR batch reduction | `REFERENCE-SPECIFIED: MEAN` | Batch-scale invariance test |
| D11 | Empty/small candidate likelihood | `REFERENCE-SPECIFIED: FULL BERNOULLI` | Finite-likelihood definition and tests |

## 11. Required unit tests

### Target and graph construction

- `T01`: `V⁰` equals the unique union of all triplet endpoints.
- `T02`: Triplet multiplicity and ordering survive node deduplication.
- `T03`: User/item global ID spaces are disjoint and every edge is bipartite.
- `T04`: A negative item is not an observed positive for its user in `E_train`.

### Sampling

- `T05`: `Cˡ` matches brute-force neighborhood construction on a toy graph.
- `T06`: `Vˡ ∩ Kˡ⁻¹` is empty.
- `T07`: `|Vˡ| = min(k_l, |Cˡ|)` and samples are unique.
- `T08`: `Kˡ = V⁰ ∪ Vˡ`, not a cumulative union.
- `T09`: Empty and smaller-than-`k` candidate sets do not crash and yield finite likelihoods.
- `T10`: Equal probabilities yield uniform exact-`k` selection within a pre-declared statistical tolerance.

### Blocks and LightGCN

- `T11`: Every sampled block contains only registered edges between its declared node sets.
- `T12`: The `b--a--t` two-layer oracle gives depth-two target value one under unit weights and source-to-target inward blocks.
- `T13`: No synthetic self-loop exists.
- `T14`: Full receptive-field sampling with full-graph normalization and prefix-depth products matches full LightGCN target embeddings at every depth within tolerance; the weighted path oracle gives `1/2` at depth two.
- `T15`: Final embeddings equal the uniform combination of explicit depth-prefix outputs; local-ID row alignment is never used across node sets.

### Policy objectives

- `T16`: `log q_l` matches a manual calculation including selected and unselected candidates.
- `T17`: Gumbel noise affects actions but not evaluated `log q_l`.
- `T18`: Exact enumeration at `theta=0` for action losses one and three gives gradient `-0.5`; one RL descent step increases probability of the lower-loss action.
- `T19`: TB loss matches a manual `log Z + sum log q + alpha L_task` calculation; `log Z` is permutation-invariant and unaffected by nodes outside `V^0`.
- `T20`: Sampler backward leaves recommender gradients zero/`None`; recommender backward has no gradient through Top-k.
- `T21`: `log q`, reward, and TB loss remain finite near probabilities zero and one.

### Recommendation boundary

- `T22`: BPR loss decreases when `s(u,i+) - s(u,i−)` increases.
- `T23`: Both storage directions of every deduplicated target-positive edge are absent from all transient candidate/message-passing structures, normalization degrees update once, and static sampler degree features remain unchanged.
- `T24`: Full-graph inference is deterministic across repeated runs.
- `T25`: Injecting a validation/test edge or statistic into training fails immediately.

## 12. Reference-design readiness boundary

All semantic decisions D1–D11 are specified for this reference design. They become executable acceptance criteria only if the relevant components are adopted. Canonical G1 is the research-design rationale gate in the [Phase 2 research plan](../00_project/PHASE2_RESEARCH_PLAN_en.md); environment readiness is tracked separately as E0-MIN/E0-FINAL.

This reference design is ready for an implementation-gate review when:

- the registered D1–D11 test oracles remain frozen as executable acceptance criteria for the implementation gates;
- the applicable executable environment prerequisite is satisfied;
- primary and ablation protocols cannot be selected using test performance;
- the already pinned source versions and the executable environment are recorded together;
- the bilingual specification remains semantically synchronized.

Implementation must not begin from ambiguous semantics merely to discover which interpretation yields the best result.
