# Đặc tả chuẩn Phase 2: GRAPES-GFN-Rec

> **Trạng thái:** `CANONICAL — NGUỒN CHÂN LÝ DUY NHẤT CHO PHƯƠNG PHÁP PHASE 2` (từ 16/09/2026).
> **Phạm vi:** hiện thực một **biến thể GRAPES học được** cho bài toán gợi ý user–item, rồi so sánh nó với các phương pháp sampling/huấn luyện khác dưới cùng protocol.
> **Thay thế:** mọi narrative đặt heuristic M2 frontier-normalized vào vai trò method Phase 2, method cuối hoặc kết luận luận văn.
> **Hợp đồng thành phần chi tiết:** [`../02_protocol/GRAPES_RECOMMENDATION_SPEC_vn.md`](../02_protocol/GRAPES_RECOMMENDATION_SPEC_vn.md) (D1–D11, T01–T25) được **nâng lên thành normative** cho GRAPES-GFN-Rec. Nếu hai file khác nhau, file này thắng và sai khác phải được ghi vào decision log.
> **Vì sao có reset:** xem [`DECISION_LOG_vn.md`](./DECISION_LOG_vn.md), mục DL-001.

---

## 0. Định nghĩa một câu

GRAPES-GFN-Rec **không gợi ý item**. Nó là một **sampler học được**: một GNN phụ chọn node ngữ cảnh cho từng layer của Sampled LightGCN, và được huấn luyện bằng GFlowNet Trajectory Balance sao cho các computation graph làm BPR ranking loss thấp hơn được sample với xác suất cao hơn. Recommender vẫn là LightGCN; inference vẫn là full-graph, full-catalog.

Một phương pháp **chỉ được gọi là biến thể GRAPES** khi có đủ bảy thành phần sau. Thiếu bất kỳ thành phần nào thì nó là heuristic sampler, không phải GRAPES:

| # | Thành phần bắt buộc | Kiểm chứng |
|---|---|---|
| G1 | Sampler policy có tham số (`GCN_S` + sampler embedding `E_S`) | Có parameter group riêng, số tham số > 0 |
| G2 | Action exact-k bằng Gumbel Top-k trên xác suất của policy | T07, T10 |
| G3 | Log-likelihood trajectory `log q` (full Bernoulli, D11) | T16, T17, T21 |
| G4 | Task signal từ recommendation loss đã detach | T20, D5 |
| G5 | Normalizer `log Z(V⁰)` học được (`GCN_Z`) | T19 |
| G6 | Objective TB (hoặc REINFORCE cho ablation RL) | T18, T19 |
| G7 | Optimizer step thật sự cập nhật sampler; tham số sampler thay đổi qua training | log `‖ΔΘ_S‖ > 0`, gradient-ownership test |

## 1. Câu hỏi nghiên cứu

**RQ chính.** Trên graph user–item implicit với temporal split, khi giữ cố định recommender, graph, BPR pair order, negative draw, số bước tối ưu, ngân sách context node mỗi layer, seed, evaluator và phần cứng, sampler học theo task **GRAPES-GFN-Rec** có đạt trade-off NDCG@20–chi phí huấn luyện tốt hơn các sampler tĩnh (uniform, degree-importance) hay không?

**RQ phụ.**

- RQ2 — *Objective:* TB (GFlowNet) có ổn định/hiệu quả hơn REINFORCE (GRAPES-RL-Rec) trên tín hiệu BPR không?
- RQ3 — *Hành vi sampler:* sampler học được chọn node nào (degree, loại user/item, head/body/tail) và việc đó có khuếch đại popularity bias không?
- RQ4 — *Ngân sách:* lợi thế (nếu có) thay đổi thế nào khi `k_l` giảm (budget càng chặt, chọn node càng quan trọng)?

Kết quả âm là kết quả hợp lệ. Nghiên cứu hoàn thành khi trả lời được RQ với bằng chứng traceable, không phải khi GRAPES-GFN-Rec thắng.

## 2. Chuyển đổi từ GRAPES sang recommendation

GRAPES gốc (arXiv:2310.03399, code commit `71ecebe`) giải node classification. Bảng dưới là adaptation của đồ án; các dòng "Rec" là quyết định thiết kế, **không** phải kết quả GRAPES đã chứng minh.

| Khía cạnh | GRAPES gốc (đối chiếu snapshot `grapes-main/main.py`; snapshot không byte-identical với commit pin, xem `01_literature/GRAPES_SOURCE_VERSION_NOTE_vn.md`) | GRAPES-GFN-Rec |
|---|---|---|
| Graph | Graph có feature node | Bipartite `G_train` chỉ gồm positive P4 trước cutoff |
| Target batch | Node có nhãn | Đa tập có thứ tự BPR triplet `(u, i⁺, i⁻)`; `V⁰` = unique endpoint |
| Feature sampler | `data.x` + indicator hop | `E_S` riêng + one-hot type + degree train chuẩn hóa + history `L+1` kênh |
| Policy | `gcn_gf` trên `batch_nodes` | `GCN_S` hai layer trên subgraph `K^{l-1} ∪ C^l` |
| Action | `topk(log p + Gumbel, k)`; nếu `k ≥ n` lấy hết | Giống hệt, D11 cho nhánh ít/rỗng candidate |
| `log q` | `logsigmoid` của node chọn (code) | Full Bernoulli chọn + không chọn (paper, D11) — sai khác paper/code đã ghi |
| Classifier | `gcn_c` | Sampled LightGCN, block `K^l → K^{l-1}`, bi-norm chữ nhật, không self-loop (D1–D3) |
| Task loss | Cross-entropy | Mean BPR (D10); regularizer không vào reward (D5) |
| `log Z` | `gcn_z` trên target+neighbor, `mean − log_z_init` | `GCN_Z` chỉ trên `V⁰` (D6); legacy target+neighbor là ablation |
| TB | `(log_z + Σlog q + loss_coef·cost)²` | `(log Z(V⁰) + Σ log q + α·stopgrad(L_BPR))²` |
| Optimizer | `Adam(gcn_c)` và `Adam(gcn_gf ∪ gcn_z)` | `Θ_R` (SparseAdam/Adam) tách khỏi `Adam(Θ_S ∪ Θ_Z)` |
| Inference | Full-batch | Full `G_train` LightGCN + exact full-catalog ranking |

### 2.1 Những điểm recommendation-specific phải xử lý (không có trong GRAPES gốc)

Đây là lý do không thể "port nguyên". Mỗi điểm có quyết định hoặc gate đo trước khi chạy holdout.

**R-1. Credit assignment theo kích thước batch.** *(Bằng chứng DL-003: batch 65.536 triplet chạm 86,6% graph sau 1 bước khi không lấy mẫu; lưới R3 bắt đầu từ batch ≤ 4.096.)* GRAPES dùng batch 256–512 target, nên có hàng nghìn sampler update. Pilot M0–M2 dùng batch 65.536 triplet × 5 epoch ≈ 300 optimizer step: một reward vô hướng cho ~196k target node và chỉ ~300 update sampler — gần như chắc chắn không học được policy. **Quyết định:** budget regime (batch size, số step, `k_l`) được chọn lại trên development split cho *mọi* sampler cùng lúc (Gate R3). Pilot budget không được kế thừa.

**R-2. Scale của reward.** Mean BPR ≈ 0,69 lúc đầu và chênh lệch giữa các trajectory rất nhỏ. GRAPES chọn `loss_coef` từ ~6·10³ tới ~6·10⁵ bằng sweep. **Quyết định:** `α` và `log_z_init` được chọn trên development split từ grid log-scale đăng ký trước; log riêng `log q`, `log Z`, `α·L_task` và TB residual để phát hiện `log q` áp đảo reward.

**R-3. Reward không dừng (non-stationary).** Cùng một trajectory cho loss khác nhau khi recommender đã học thêm. GRAPES cũng có tính chất này. **Quyết định:** giữ nguyên như GRAPES trong phương án chính; không claim sampler hội tụ tới phân phối cố định. Log reward theo step để mô tả drift.

**R-4. Graph cực thưa, user singleton.** 71,76% user train có đúng một interaction; item degree Gini 0,8584. Candidate của user singleton gần như cố định, còn candidate của item head rất lớn. **Hệ quả:** lựa chọn có ý nghĩa chủ yếu nằm ở layer đi qua item. Bắt buộc log phân phối degree/type/cohort của node được chọn theo layer để trả lời RQ3 và phát hiện sampler sụp về hub.

**R-5. Chi phí sampler phải được tính vào cost.** `GCN_S` chạy trên `K^{l-1} ∪ C^l` có thể lớn hơn chính sampled LightGCN. Cost báo cáo gồm sampler forward/backward, `GCN_Z`, TB step — không chỉ propagation. Gate R3 có ngưỡng khả thi trên T4.

**R-6. Backbone phải đủ tốt để so sánh sampler có nghĩa.** Trong pilot, Full LightGCN (NDCG@20 0,004931) thua MostPop (0,005873) sau 5 epoch: backbone đang under-trained, nên khác biệt giữa sampler có thể chỉ là nhiễu của chế độ huấn luyện ngắn. **Quyết định:** Gate R3 yêu cầu Full LightGCN vượt MostPop trên development split trước khi so sánh sampler.

**R-7. Negative item cũng là target.** `i⁻` được đưa vào `V⁰` nên sampler cũng chọn ngữ cảnh cho negative. Giữ như reference design (D-contract §3.3); ablation "chỉ user + positive trong `V⁰`" không thuộc phương án chính.

**R-9. Bằng chứng collaborative hạn chế (DL-003).** Chỉ 29,0% target development có đường độ dài 3 từ user (tail 4,5%); 20,7% sản phẩm không có sản phẩm đồng mua. **Quyết định:** R5 báo thêm kết quả theo nhóm target có/không có đường ≤ 3 trong graph train; không claim sampler cải thiện nhóm không có bằng chứng nếu số liệu không cho thấy.

**R-8. Positive edge leakage trong propagation.** Giữ edge `(u,i⁺)` là phương án chính; mask transient là sensitivity ablation bắt buộc (D9) nhưng chạy sau primary matrix.

## 3. Dữ liệu và temporal protocol

- Dataset chính: Amazon Reviews'23 `Baby_Products`, P4 (rating 4–5), rating `0.0` bị quarantine, cutoff `t1_ms = 1628643414042`, `t2_ms = 1658002729837` (từ `baby_p4_g2c_manifest.json`).
- `G_train` hiện có: 3.868.654 cạnh, 2.318.308 user, 162.125 item.
- Validation hiện có (81.871 warm target) **đã bị quan sát** qua M0–M2 pilot. Test (40.587 warm target) chưa đọc.

### 3.1 Development split (đăng ký trước, tạo ở Gate R1)

Quy tắc, không phải con số chọn sau khi nhìn dữ liệu:

1. `Δ_val = t2 − t1`. Đặt `t0 = t1 − Δ_val` (development window có cùng độ dài validation window).
2. `G_dev_train` = P4 event có `timestamp < t0`; mapping user/item chỉ từ phần này.
3. `D_dev` = P4 event trong `[t0, t1)`, chỉ giữ warm-start theo mapping `G_dev_train`; loại item đã tương tác trước target như evaluator hiện có.
4. Nếu `D_dev` có dưới 20.000 warm target hoặc `G_dev_train` mất quá 50% cạnh của `G_train`, dùng quy tắc dự phòng đã đăng ký: `t0` = quantile thời gian sao cho `|G_dev_train| = 80% |G_train|`. Việc dùng quy tắc nào được ghi trong manifest trước khi train bất kỳ model nào.
5. Mọi file dev phải chứng minh: `max(ts G_dev_train) < min(ts D_dev)`, `max(ts D_dev) < t1`, không có row nào của current validation/test.

### 3.2 Vai trò split

| Split | Được dùng cho | Cấm |
|---|---|---|
| `G_dev_train` / `D_dev` | Chọn budget regime, `α`, `log_z_init`, lr sampler, kiến trúc sampler, sanity backbone | Claim cuối |
| `G_train` / current validation | Holdout paired comparison **sau** freeze R4 | Bất kỳ tuning nào |
| Test | Chỉ một lần, nếu có final-test protocol riêng | Chọn method |

## 4. Phương pháp GRAPES-GFN-Rec (tóm tắt normative)

Ký hiệu và invariant đầy đủ ở D-contract. Vòng lặp một training step:

```text
1. Lấy M triplet (u, i⁺, i⁻) theo thứ tự seeded; negative đồng nhất, reject positive train.
2. V⁰ = unique(endpoints); giữ map triplet → global ID.
3. for l = 1..L:
       C^l   = N_{G_train}(K^{l-1}) \ K^{l-1}
       X     = [E_S(v), onehot(type), deg_feat(v), history(v)]   for v in K^{l-1} ∪ C^l
       logit = GCN_S(X, subgraph(K^{l-1} ∪ C^l))[C^l]
       V^l   = TopK(logsigmoid(logit) + Gumbel, min(k_l, |C^l|))
       log q_l = Σ_{C^l} [m·logsigmoid(logit) + (1−m)·logsigmoid(−logit)]
       K^l   = V⁰ ∪ V^l
4. log Z = mean_v GCN_Z(X_Z[V⁰], A_{V⁰} + I) − log_z_init
5. z = Sampled-LightGCN prefix-depth (block K^l → K^{l-1}, bi-norm chữ nhật, α_r = 1/(L+1))
6. L_BPR = −mean log σ(z_u·z_{i⁺} − z_u·z_{i⁻});  L_model = L_BPR + λ_R·L_reg
7. step Θ_R bằng ∇L_model                       # sampler không nhận gradient này
8. L_TB = (log Z + Σ_l log q_l + α·stopgrad(L_BPR))²
9. step Θ_S ∪ Θ_Z bằng ∇L_TB                    # recommender không nhận gradient này
10. log: L_BPR, L_TB, Σlog q, log Z, α·L_BPR, |C^l|, |V^l|, degree/type/cohort của V^l,
        entropy Bernoulli, p_min/p_max, thời gian sampler/propagation/TB, peak GPU.
```

Ghi chú bắt buộc:

- Step 7 dùng `L_BPR` trên computation graph vừa sample; step 8 dùng **cùng** giá trị đó đã detach, đúng như `cost_gfn = loss_c.detach()` trong GRAPES.
- Off-policy mismatch (exact-k action vs Bernoulli likelihood) được kế thừa từ GRAPES v3 và phải được nêu trong report.
- `k_l` là ngân sách **toàn cục theo batch và layer**, giống hệt cho mọi sampler trong matrix.

## 5. Phương pháp so sánh

"So sánh với các phương pháp khác" được chia tầng để mỗi so sánh trả lời đúng một câu hỏi:

| Tầng | Phương pháp | Vai trò | Trả lời |
|---|---|---|---|
| A — matched sampler | **M0 Uniform** (`logit` hằng; tương đương `random_sampling` của GRAPES) | Control trung lập | Học có hơn không học? |
| A — matched sampler | **M1 Degree-importance** (`log deg + Gumbel`, họ FastGCN/LADIES-style importance tĩnh) | Control tĩnh mạnh | Học có hơn prior popularity? |
| A — matched sampler | **GRAPES-RL-Rec** (cùng policy, REINFORCE D4) | Ablation objective | TB có cần thiết? (RQ2) |
| B — reference | **Full LightGCN** (full graph, cùng số step/epoch) | Trần chất lượng không sampling | Sampling mất bao nhiêu? |
| B — reference | **MostPop**, **BPR-MF** | Sanity | Graph/propagation có giá trị không? |
| C — tùy chọn (OD-1) | GraphSAGE-style per-node fan-out neighbor sampling ở cùng số node trung bình | Sampler node-wise phổ biến | Layer-wise học được so với node-wise |
| Appendix | M2 frontier-normalized pilot | Lịch sử | Không nằm trong primary matrix |

Mọi phương pháp tầng A chạy lại trên budget regime mới (R-1); số liệu M0/M1 pilot không được tái sử dụng.

## 6. Metric và phân tích

- **Primary:** paired Δ NDCG@20 = GRAPES-GFN-Rec − control tầng A tốt nhất (theo mean dev), trên từng seed.
- **Chất lượng:** Recall@20, NDCG@20; rank vector lưu để tính lại.
- **Phân bổ/đa dạng:** Catalog Coverage@20, exposure và hit theo head/body/tail (cohort đã khóa `cohorts_v1.json`), Gini exposure.
- **Chi phí:** thời gian sampler, `GCN_Z`+TB, propagation, wall time/epoch, peak GPU, số node/edge thực tế trong block.
- **Hành vi sampler (RQ3):** phân phối degree/type/cohort của `V^l`, entropy, `p_min/p_max`, `‖ΔΘ_S‖`, so với phân phối của M0/M1 ở cùng candidate.
- **Ổn định:** tỷ lệ run fail, loss không hữu hạn, TB residual theo step.
- **Thống kê:** ≥ 3 seed paired (số seed chốt ở R4); báo cáo từng seed, mean ± SD, số seed có Δ > 0. Không claim significance nếu protocol không đăng ký kiểm định.
- **Ngữ nghĩa (OD-2):** mức khớp ngữ nghĩa và đa dạng sản phẩm (yêu cầu của giảng viên) chỉ đo được nếu nối metadata `meta_Baby_Products` (title/category). Chưa đo thì không claim.

## 7. Tiêu chí hợp lệ và điều kiện fail

Một run **không hợp lệ** nếu vi phạm: temporal isolation, exact-k/uniqueness, candidate rule, block direction/normalization oracle, finite objective, parameter/gradient ownership, deterministic replay batch đầu, hoặc thiếu resource log. Run không hợp lệ được lưu kèm lý do, không bị xóa, không bị thay thế âm thầm.

Kết luận được phép:

- "GRAPES-GFN-Rec cải thiện trade-off" chỉ khi Δ NDCG@20 > 0 ở mọi seed holdout **và** chi phí báo cáo đầy đủ.
- Nếu không, báo cáo kết quả âm cùng phân tích hành vi sampler (RQ3) và nguyên nhân khả dĩ (R-1..R-6).

Không bao giờ: đổi method, `α`, budget hay seed sau khi đọc holdout; dùng test chọn method; gọi heuristic là GRAPES; claim sampled inference, cold-start, semantic diversity (khi chưa đo) hay generalization ngoài Baby.

## 8. Gate thực thi

| Gate | Nội dung | Điều kiện qua gate | Chạy ở |
|---|---|---|---|
| R0 | Governance: spec, decision log, docs, archive pilot, checker | Không còn file trung tâm gọi M2 là method; checker pass | Local |
| R1 | Development split theo §3.1 (xong 16/09: t0 = 05/09/2020, 105.401 target) | Manifest + SHA-256; test isolation pass | Colab |
| R2 | Primitive + oracle GRAPES-GFN-Rec (G1–G7, T01–T25 áp dụng) | Toàn bộ oracle test pass trên CPU | Local |
| R3 | Development: backbone adequacy (R-6), budget regime (R-1), sweep `α`/`log_z_init`/lr (R-2), feasibility T4 (R-5), sampler thực sự học (G7) | Full LightGCN > MostPop trên `D_dev`; loss hữu hạn; replay xác định; cấu hình chọn chỉ từ `D_dev` | Colab |
| R4 | Freeze: config hash, seed, budget, evaluator hash, analysis script, matrix | `current_validation_read = false` lúc tạo manifest | Local + Colab |
| R5 | Holdout paired matrix: tầng A + B trên `G_train`/validation | Hash khớp freeze; metric tính lại được từ rank vector | Colab |
| R6 | Phân tích RQ1–RQ4 + ablation D9/D6 | Mọi bảng truy được về JSON | Local |
| R7 | Rebuild report, slide, README; pilot vào appendix | Consistency checker pass; không claim vượt evidence | Local |

Không qua gate bằng cách viết claim. Gate fail → ghi lý do, artifact, hành động khắc phục vào decision log.

## 9. Quyết định còn mở (phải chốt trước gate ghi bên cạnh)

| ID | Câu hỏi | Mặc định nếu không có chỉ đạo khác | Chốt trước |
|---|---|---|---|
| OD-1 | Có đưa GraphSAGE fan-out (tầng C) vào matrix? | Không; chỉ tầng A+B | R4 |
| OD-2 | Có nối metadata để đo semantic match/diversity? | Không trong primary; đăng ký như phân tích phụ nếu thêm | R4 |
| OD-3 | Budget grid cho RQ4 (vd. `k_l ∈ {V⁰/4, V⁰, 4·V⁰}` tương đối) | Một budget chính + một budget chặt | R3 |
| OD-4 | Số seed holdout | 3 | R4 |

## 10. Nguồn

- GRAPES: Younesian et al., *GRAPES: Learning to Sample Graphs for Scalable Graph Neural Networks*, arXiv:2310.03399 (v3); code `github.com/dfdazac/grapes` commit `71ecebeaac896800aa4dd1d0f38c57ec222ef396` (bản local: `ThucTap2/GRAPES report/grapes-main`).
- GFlowNet Trajectory Balance: Malkin et al., *Trajectory Balance: Improved Credit Assignment in GFlowNets*, arXiv:2201.13259.
- LightGCN: He et al., arXiv:2002.02126. BPR: Rendle et al., arXiv:1205.2618.
- Gumbel Top-k: Kool et al., *Stochastic Beams and Where to Find Them*, arXiv:1903.06059.
- Comparator families: FastGCN (arXiv:1801.10247), LADIES (arXiv:1911.07323), GraphSAGE (arXiv:1706.02216), PinSage (arXiv:1806.01973).
