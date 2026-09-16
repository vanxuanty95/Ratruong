# Reference Design GRAPES-Informed cho Graph-Sampling Recommendation

> **Trạng thái:** `REFERENCE DESIGN — SUPERSEDED KHỎI VAI TRÒ PHƯƠNG PHÁP PHASE 2 CHUẨN`  
> **Ngày ghi nhận:** 2026-08-26  
> **Vai trò:** candidate mechanism và verification idea có nền tảng từ GRAPES; không phải phương pháp luận văn cuối cùng.

> **Lưu ý hiện hành 16/09/2026:** nghiên cứu thực tế đã dừng ở M2 frontier-normalized, một heuristic cố định. Các phần RL, GFlowNet và learned policy bên dưới không được implement, không tham gia paired validation và không còn nằm trong kế hoạch đang mở. Phương pháp thực tế xem tại [`../04_thesis/THESIS_REPORT_vn.md`](../04_thesis/THESIS_REPORT_vn.md).

## 1. Mục đích và quy tắc quản trị nguồn

Tài liệu này ghi nhận một candidate technical reference design. Nó có thể hướng dẫn baseline hoặc ablation path ban đầu, nhưng phương pháp luận văn cuối phải được xác định và kiểm chứng từ research problem, literature gap, data constraint và controlled experiment. Các nhãn lịch sử `ĐÃ KHÓA`, `GIỮ` và `THAY THẾ` bên dưới không ràng buộc phương pháp cuối trừ khi được chọn lại tường minh với rationale và verification.

**Diễn giải trạng thái:** D1–D11 và T01–T25 chỉ khóa semantic nội bộ của GRAPES-informed reference design này khi nó được sử dụng. Chúng không khóa phương pháp luận văn cuối cùng, baseline set cuối cùng, dataset protocol hay lịch thực nghiệm cuối cùng. Mọi nhãn tuần mang tính lịch sử, chỉ ghi nhận thời điểm một ý tưởng lần đầu được lập tài liệu.

Thứ tự ưu tiên nguồn:

1. phạm vi project và các quy tắc khoa học đã khóa;
2. GRAPES arXiv:2310.03399v3 cho ngữ nghĩa phương pháp chính thức;
3. commit GRAPES chính thức `71ecebeaac896800aa4dd1d0f38c57ec222ef396` cho bằng chứng implementation;
4. snapshot/notebook Phase 1 chỉ cho bằng chứng tái lập lịch sử;
5. các paper gốc BPR và LightGCN cho ngữ nghĩa recommendation.

Khi paper và code mâu thuẫn, sai khác phải được giữ ở trạng thái mở cho tới khi một unit/falsification test tối thiểu và một quyết định thành văn giải quyết nó.

## 2. Hợp đồng chuyển đổi

| GRAPES gốc | Chuyển đổi sang recommendation | Trạng thái |
|---|---|---|
| Batch node classification mục tiêu | Đa tập có thứ tự của các BPR triplet cộng tập endpoint mục tiêu đã khử trùng lặp | `PROPOSED REFERENCE CHOICE` |
| Đồ thị có thuộc tính tổng quát | Đồ thị hai phía user–item chỉ từ tập train | `PROPOSED REFERENCE CHOICE` |
| Node feature `X` | Sampler ID embedding riêng cộng node type, layer-history indicator và degree chỉ từ tập train | `PROPOSED REFERENCE CHOICE` |
| Policy `GCN_S` | Candidate layer-wise node scorer | `GRAPES-INFORMED CANDIDATE` |
| Gumbel Top-k | Candidate node selection không hoàn lại với cardinality chính xác | `GRAPES-INFORMED CANDIDATE` |
| Classifier `GCN_C` | Candidate recommender kiểu LightGCN `GNN_R` | `PROPOSED REFERENCE CHOICE` |
| Classification loss | Candidate mean BPR ranking loss | `PROPOSED REFERENCE CHOICE` |
| REINFORCE và TB | Candidate policy-learning objective với detached ranking signal | `GRAPES-INFORMED CANDIDATE` |
| Full-graph classification inference | Candidate recommendation embedding full-graph dùng chung và full-catalog ranking | `PROPOSED REFERENCE CHOICE` |

## 3. Ngữ nghĩa đồ thị, ID và batch

### 3.1 Đồ thị train

```text
G_train = (U ∪ I, E_train)
```

Các invariant bắt buộc:

- `U` và `I` là hai miền global ID tách biệt; item dùng offset tường minh.
- Mỗi edge nối đúng một user và một item.
- `E_train` chỉ chứa positive interaction có sẵn trước training cutoff.
- Candidate expansion, normalization và propagation dùng `G_train` hoặc registered transient batch view từ D9; static sampler degree feature chỉ dùng `G_train`.
- Mọi edge/statistic từ validation và test đều bị cấm trong toàn bộ cấu trúc train.

Viết `E_work = E_train` cho primary retain protocol. Chỉ trong registered sensitivity ablation, D9 mới thay bằng transient batch-masked view.

### 3.2 BPR batch có thứ tự

```text
B = [(u_b, i_b+, i_b−)] for b = 1,...,M
```

`B` là một đa tập có thứ tự. Endpoint hoặc user trùng lặp đều được phép. Mapping từ từng vị trí triplet đến ba global ID tương ứng phải được giữ nguyên sau khi khử trùng lặp node.

### 3.3 Tập mục tiêu khởi đầu

```text
V⁰ = unique({u_b, i_b+, i_b− for every triplet in B})
K⁰ = V⁰
```

Phép unique tạo graph target set nhưng không được thay đổi số lần xuất hiện hoặc thứ tự trong BPR batch.

## 4. Ngữ nghĩa sampling theo layer

Với mỗi layer `l = 1,...,L`:

```text
Cˡ = N_Ework(Kˡ⁻¹) \ Kˡ⁻¹
n_l = |Cˡ|
k_l_effective = min(k_l, n_l)
```

Các invariant của candidate:

- mỗi candidate kề ít nhất một node trong `Kˡ⁻¹`;
- không candidate nào thuộc `Kˡ⁻¹`;
- candidate là các global node ID duy nhất;
- budget là global theo từng batch và layer, không phải theo từng triplet hoặc target node.

### 4.1 Xác suất policy và action

Với mỗi candidate `v`:

```text
logit_v = GCN_S(candidate subgraph, sampler features, layer state)_v
p_v = sigmoid(logit_v)
g_v ~ Gumbel(0, 1)
Vˡ = TopK_{v in Cˡ}(log(p_v) + g_v, k_l_effective)
```

Các invariant bắt buộc của action:

```text
|Vˡ| = min(k_l, |Cˡ|)
Vˡ contains no duplicates
Vˡ ∩ Kˡ⁻¹ = empty
Kˡ = V⁰ ∪ Vˡ
```

`Kˡ` không phải hợp tích lũy của tất cả sampled set trước đó.

`QUYẾT ĐỊNH D8`: Cho phép cross-layer re-entry. Chỉ `Kˡ⁻¹` bị loại, vì vậy một node từ `Vˡ⁻²` có thể đủ điều kiện trở lại. Điều này giữ đúng định nghĩa trong paper và hành vi của pinned/local code; không được dùng global mask kiểu “chỉ sample một lần”.

### 4.2 Unconditioned likelihood dùng để học

Đặt `m_v = 1` nếu `v ∈ Vˡ`, ngược lại bằng `0`. Unconditioned Bernoulli log-likelihood đề xuất theo đúng paper là:

```text
log q_l = sum_{v in Cˡ} [m_v log(p_v) + (1-m_v) log(1-p_v)]
log q_trajectory = sum_{l=1}^L log q_l
```

Biểu thức bao gồm cả candidate được chọn và không được chọn. Gumbel noise chỉ tác động đến action và không thuộc phần tính `log q_l`.

Action được lấy từ một phân phối exact-`k` có điều kiện, trong khi likelihood này là không điều kiện. Đây là off-policy mismatch tường minh được kế thừa từ GRAPES v3.

`QUYẾT ĐỊNH D11`: Dùng cùng một định nghĩa full Bernoulli cho mọi nhánh cardinality. Nếu `Cˡ` rỗng, `Vˡ` rỗng và `log q_l = 0` (tổng rỗng). Nếu `0 < |Cˡ| <= k_l`, chọn toàn bộ candidate và `log q_l = sum_{v in Cˡ} log(p_v)`. Phải implement bằng các phép log-sigmoid ổn định và kiểm thử output hữu hạn; không được âm thầm kế thừa ngữ nghĩa phụ thuộc nhánh.

### 4.3 Trạng thái trajectory của GFlowNet

Trạng thái lưu toàn bộ lịch sử:

```text
sˡ = (V⁰, V¹, ..., Vˡ)
```

Theo cách xây dựng của GRAPES, trạng thái này có đúng một parent nên xác suất chuyển lùi bằng một. Chỉ riêng `Kˡ` không đủ để biểu diễn trạng thái GFlowNet.

## 5. Sampler feature và quyền sở hữu parameter

### 5.1 Input chính đã khóa cho sampler

Đặt `N = |U| + |I|` và chiều sampler bằng chiều recommender: `d_S = d_R = d`. Nếu reference design này được sử dụng, giá trị số của `d` được chọn đúng một lần theo protocol resource/validation chung rồi giữ giống nhau cho mọi sampler; không tune riêng cho GRAPES. Hai sampler table tách biệt về type có thể được implement bằng một table dùng offset index:

```text
E_S in R^(N x d)
```

Tại policy step `l`, sampler input được gather là:

```text
X_S^l(v) = concat(E_S(v), onehot(type_v), degree_feature_v, history_v)
X_S^l in R^(|K^(l-1) union C^l| x (d + L + 4))
```

trong đó:

- `onehot(type_v)` có chiều hai cho user/item;
- `degree_feature_v = log(1 + degree_Gtrain(v)) / log(1 + d_max_train)` là scalar cố định chỉ tính từ `G_train`;
- `history_v` có chiều `L+1`: channel zero đánh dấu `V^0`, còn channel `j` ghi nhận membership trong sampled set `V^j`; vector có thể multi-hot theo quy tắc cross-layer re-entry D8;
- candidate chưa từng được chọn có mọi history channel bằng zero.

`GCN_S` chính là GCN hai layer với width `(d + L + 4) -> d -> 1`, có ReLU sau layer đầu, không output activation trước Bernoulli sigmoid và không dropout. Candidate subgraph là original-edge subgraph đã symmetrize trên `K^(l-1) union C^l`; standard GCN self-loop chỉ được phép trong auxiliary sampler này.

Recommender embedding đã detach vẫn chỉ là named input ablation, không phải input chính.

### 5.2 Hợp đồng optimization và quyền sở hữu đã khóa

- Recommender parameter `Theta_R` và sampler parameter `Theta_S` dùng storage tách biệt; các table không bao giờ alias hoặc copy cho nhau.
- Recommender parameter chỉ được update bởi optimization của `L_model`.
- `Theta_S` chứa `E_S` và `GCN_S`; `Theta_Z` chỉ chứa weight của `GCN_Z`.
- RL dùng một Adam optimizer trên `Theta_S`; GFN dùng một Adam optimizer trên `Theta_S union Theta_Z`. Mỗi shared tensor chỉ xuất hiện đúng một lần trong các parameter group.
- Sampler weight decay và explicit sampler-embedding regularization đều bằng zero trong protocol chính. Sampler learning rate được chọn trên validation từ grid đăng ký trước và không được chọn bằng test result.
- Khởi tạo từng thành phần sampler embedding theo Gaussian trung bình zero, variance `1/d`, tương đương standard deviation `1/sqrt(d)`, với experiment seed. Khởi tạo GCN weight bằng Glorot scheme đã được ghi nhận của framework và bias bằng zero.
- BPR task signal phải được detach trước khi đi vào sampler objective. Không gradient nào đi qua discrete Top-k.
- Một sampler optimizer step phải tạo gradient bằng zero/`None` cho `Theta_R`; recommender optimization không được update `Theta_S` hoặc `Theta_Z`.
- Model chỉ hỗ trợ warm-start: user/item universe được khóa từ training-only filtering protocol, validation/test interaction được project vào universe đó, mọi exclusion được báo cáo và bất kỳ out-of-vocabulary ID còn lại nào đều gây lỗi. Không có random/hash/`UNK` fallback.

`QUYẾT ĐỊNH D7`: Sampler representation, quy tắc buộc chung dimension, initialization distribution, optimizer ownership, zero regularization và OOV behavior ở trên là các engineering decision đã khóa. Chúng không phải claim suy ra từ GRAPES.

## 6. Sampled block và ngữ nghĩa LightGCN

Với mỗi layer, định nghĩa source set và destination set:

```text
S_l = K^l
T_l = K^(l-1)
E_l-> = {(s,t): s in S_l, t in T_l, {s,t} in E_work}
```

`E_work` là `G_train` trong retain protocol và transient batch graph từ D9 trong mask protocol. Chỉ cho phép original bipartite edge.

Các yêu cầu LightGCN:

- không có synthetic self-loop;
- không có feature transformation matrix;
- không có nonlinear activation;
- user/item initial embedding riêng hoặc một typed global table tương đương;
- representation cuối kết hợp depth zero đến `L` bằng hệ số đồng đều `alpha_r = 1/(L+1)`, được khóa giống nhau trong mọi so sánh sampler;
- chấm điểm user–item bằng dot product.

Việc đưa `V⁰` vào mỗi `Kˡ` giúp target luôn hiện diện nhưng không được tạo self-loop edge.

### 6.1 Hướng block và cách xây dựng theo depth

Định nghĩa propagation matrix chữ nhật:

```text
P_l in R^(|T_l| x |S_l|)
```

Theo dạng PyG `source_to_target`, `edge_index_l` có shape `[2, |E_l->|]`: row zero index source trong `S_l`, row one index destination trong `T_l`, và `size = (|S_l|, |T_l|)`. Các block được xây dựng hướng ra ngoài với `l = 1,...,L` rồi thực thi hướng vào trong.

Vì GRAPES dùng `K^l = V^0 union V^l` không tích lũy, canonical LightGCN depth không thể lấy từ intermediate target row của một deepest pass duy nhất. Với mỗi depth `r`, tính độc lập:

```text
H_(r,r)^0 = E_R[K^r]                         in R^(|K^r| x d)
H_(r,l-1)^(r-l+1) = P_l H_(r,l)^(r-l)       for l = r,...,1
e_V0^r = H_(r,0)^r                          in R^(|V^0| x d)
e_V0^0 = E_R[V^0]
z_V0 = sum_(r=0)^L alpha_r e_V0^r
```

Như vậy depth `r` thực thi các prefix block `P_r,...,P_1`. Chỉ cho phép fused implementation nếu output bằng số với các explicit prefix product này tại mọi depth. Mọi phép gather đều dùng global-ID map; không bao giờ căn tensor từ các tập `K^l` khác nhau theo local row position.

`QUYẾT ĐỊNH D1`: Hướng chính tắc là `K^l -> K^(l-1)` trong PyG và cách xây dựng LightGCN chính tắc dùng các inward prefix product độc lập. Cách này chuyển vị cách đọc row/column literal của GRAPES Eq. (2), nhưng khớp receptive-field dependency, quy ước được tài liệu PyG xác nhận và hướng local training. Sampled-evaluation slice ngược hướng trong Phase 1 bị loại.

Toy oracle: với đường `b--a--t`, `V^0={t}`, `V^1={a}`, `V^2={b}`, initial scalar `e_b=1`, `e_t=0` và edge weight bằng một, `P_2` phải truyền `b -> a`, rồi `P_1` truyền `a -> t`; vì vậy depth-two target output chính xác bằng một. Đảo hướng một trong hai block đều không thể truyền `b` tới `t`.

### 6.2 Normalization cho block chữ nhật

Đặt `B_l in {0,1}^(|T_l| x |S_l|)` là binary block. Degree và weight sampled-local chính là:

```text
d_dst_l(t) = sum_s B_l[t,s]
d_src_l(s) = sum_t B_l[t,s]
P_l[t,s] = B_l[t,s] / sqrt(d_dst_l(t) d_src_l(s))
```

Inverse degree tại zero được định nghĩa bằng zero. Đây là rectangular bi-normalization; dùng một degree matrix chung ở hai phía là sai dimension khi source space và destination space khác nhau.

Mandatory full-degree ablation dùng:

```text
P_l_full[t,s] = B_l[t,s] / sqrt(degree_Ework(t) degree_Ework(s))
```

`QUYẾT ĐỊNH D2`: Sampled-block bi-normalization là phương án chính. Full-graph LightGCN normalization là named mandatory ablation. Chỉ claim tương đương chính xác với full LightGCN khi có đầy đủ receptive-field node/edge cần thiết, dùng prefix-depth construction và degree lấy từ cùng working graph. Chỉ full sampling không làm sampled-local degree trở nên tương đương.

Numeric oracle: trên `t--a--b`, với full-graph degree `(1,2,1)` và initial `(e_t,e_a,e_b)=(0,0,1)`, full-degree depth-two target value là `(1/sqrt(2))*(1/sqrt(2))=1/2`.

`QUYẾT ĐỊNH D3`: Không cho phép synthetic self-loop trong LightGCN recommender.

## 7. Recommendation objective

Với mỗi triplet có thứ tự:

```text
s(u, i) = z_u^T z_i
delta_b = s(u_b, i_b+) - s(u_b, i_b−)
L_rank = -mean_b log sigmoid(delta_b)
```

`QUYẾT ĐỊNH D10`: Dùng mean batch reduction để scale của task signal không đổi theo batch size.

Dùng endpoint-only ego-embedding regularization:

```text
L_reg = mean_b [||e_u_b^0||^2 + ||e_i_b+^0||^2 + ||e_i_b-^0||^2]
L_model = L_rank + lambda_R * L_reg
L_task = stopgrad(L_rank)
```

`QUYẾT ĐỊNH D5`: Có đúng một sampler trajectory chung cho BPR batch nên cost của trajectory là mean `L_rank` đã detach của batch đó. `L_reg` vẫn thuộc recommender optimization nhưng bị loại khỏi RL/TB: với triplet cố định, nó không phụ thuộc action và sẽ thêm variance hoặc batch-dependent offset mà không cung cấp sampling credit. RL objective chính theo paper không dùng baseline; action-independent baseline chỉ được phép làm named variance-reduction ablation.

### Protocol cho positive edge

- Protocol chính: giữ `(u, i+)` như một LightGCN training edge thông thường.
- Mandatory sensitivity ablation: khử trùng lặp batch positive và tạo `M_B = {{u_b,i_b+}}`; chỉ xóa cả hai directed storage arc của từng phần tử khỏi transient `E_work = E_train minus M_B`.
- Tạo transient graph sau khi chọn triplet/negative và trước candidate expansion. Dùng graph này cho candidate enumeration, `GCN_S` adjacency, target-induced `GCN_Z` adjacency, sampled block, propagation-normalization degree và mọi recommender propagation depth.
- Giữ static sampler degree feature cố định từ `G_train` gốc; thay đổi feature này sẽ thêm intervention thứ hai. Negative validity cũng được kiểm tra theo original declared positive set.
- Positive trùng lặp chỉ làm binary graph degree giảm một lần. Hủy transient view sau batch; không bao giờ sửa `G_train` vĩnh viễn.
- Cả model retain và mask đều dùng `G_train` đầy đủ cho deterministic inference chung. Mọi so sánh sampler dùng cùng điều kiện retain/mask.

`QUYẾT ĐỊNH D9`: Phương án chính giữ current positive edge. Mandatory mask sensitivity xóa chúng khỏi mọi candidate/message-passing structure theo batch, gồm cả `GCN_Z`, nhưng giữ static train-degree feature không đổi. Ablation này kiểm tra propagation shortcut; không claim rằng positive interaction bị che hoàn toàn về mặt thông tin.

## 8. Sampler objective

### 8.1 GRAPES-RL-Rec

Ứng viên theo paper:

```text
L_RL = stopgrad(L_task) * log q_trajectory
```

Local public-code snapshot lại dùng:

```text
L_RL_code = -stopgrad(L_task) * log q_trajectory
```

`QUYẾT ĐỊNH D4`: Tối thiểu hóa objective theo paper với dấu dương và không dùng baseline trong phương án chính:

```text
L_RL = stopgrad(L_task) * log q_trajectory
```

Với `q(a)=sigmoid(theta)`, loss `L(a)=1`, `L(b)=3` và `theta=0`, exact expected-cost gradient là `-2q(1-q)=-0.5`; gradient descent vì vậy làm tăng `q(a)`. Dấu âm đứng đầu trong local code cho hướng ngược lại khi đại lượng là cost và bị loại. Quyết định này không loại bỏ mismatch mà GRAPES đã ghi nhận giữa exact-`k` sampling và unconditioned Bernoulli learning likelihood.

### 8.2 GRAPES-GFN-Rec

```text
R = exp(-alpha * L_task)
L_TB = [log Z(V⁰) + log q_trajectory + alpha * stopgrad(L_task)]^2
```

Các yêu cầu:

- `Z(V⁰)` dương và được condition theo target set;
- một `GCN_Z` có thể học hoặc thành phần tương đương được giải trình tường minh dự đoán `log Z(V⁰)`;
- reward coefficient `alpha` chỉ được chọn trên validation;
- log-probability, reward, `log Z` và TB term được log riêng;
- numerical stabilization không được âm thầm thay đổi objective.

Với `n_0=|V^0|`, đặt `A_0` là adjacency induced bởi `V^0` trong `E_work` hiện tại. Chỉ thêm self-loop bên trong auxiliary normalizer này và tính standard symmetric GCN normalization. Định nghĩa:

```text
X_Z = concat(E_S[V^0], onehot(type), fixed_train_degree_feature)
X_Z in R^(n_0 x (d + 3))
H_Z = ReLU(GCN_Z1(X_Z, A_0 + I))             in R^(n_0 x d)
r_Z = GCN_Z2(H_Z, A_0 + I)                    in R^(n_0 x 1)
log Z(V^0) = mean_v r_Z[v,0]                  scalar
```

`log Z` không bị constrain; về khái niệm `Z=exp(log Z)` là dương và không cần materialize. Không có candidate node hay edge đi ra ngoài `V^0`. Khi `A_0` không có non-self edge, network này đúng nghĩa giảm thành shared per-target transform cộng permutation-invariant mean pooling; không claim structural conditioning trong trường hợp đó. `E_S` vẫn là shared input thuộc sampler, weight `GCN_Z` thuộc `Theta_Z`, và TB optimizer chỉ update `Theta_S union Theta_Z`.

`QUYẾT ĐỊNH D6`: Cách xây dựng target-only ở trên là phương án chính và theo đúng conditioning `Z(V^0)` của paper. Cách xây dựng target-cộng-candidate trong local code chỉ được phép làm named legacy ablation. Oracle bắt buộc gồm target-order permutation invariance, invariance với thay đổi ngoài `V^0`, scalar hữu hạn cho isolated target và zero recommender gradient.

## 9. Training và inference

### Một training iteration

1. Lấy các BPR triplet có thứ tự cùng fixed negative.
2. Xây dựng `V⁰` nhưng giữ lại triplet-to-node index map.
3. Sample hướng ra ngoài cho các layer `1...L` bằng GRAPES.
4. Xây dựng typed sampled block.
5. Thực hiện LightGCN propagation theo thứ tự block đã khóa.
6. Truy xuất embedding `u`, `i+` và `i−` bằng triplet map được bảo toàn.
7. Tính `L_model`; update `Theta_R`.
8. Tính task signal đã detach; update parameter của GRAPES-RL-Rec hoặc GRAPES-GFN-Rec.
9. Log quality, policy, candidate, sample, gradient, memory và timing diagnostic.

### Inference chính

- Freeze các model parameter đã train.
- Chỉ dùng full training graph.
- Chạy deterministic full-graph LightGCN propagation với cùng initial embedding, layer count và layer-combination coefficient.
- Chấm điểm full item catalog đủ điều kiện theo từng chunk.
- Loại item đã quan sát theo evaluation protocol đã khóa.
- Sampler không được dùng cho primary inference claim.

Vì vậy Phase 2 chỉ được claim sampled-training behavior, không được claim sampled-inference scalability.

## 10. Các quyết định của GRAPES-informed reference design

Các quyết định này có trạng thái `REFERENCE-SPECIFIED`: chúng chỉ đóng ambiguity bên trong comparator/reference design này. Chúng không chọn phương pháp luận văn và không đóng Gate G1 chuẩn.

| ID | Quyết định | Trạng thái | Bằng chứng cần để đóng |
|---|---|---|---|
| D1 | Hướng block và thứ tự thực thi | `REFERENCE-SPECIFIED: SOURCE K^l TỚI TARGET K^(l-1); PREFIX DEPTH` | Toy derivation hai layer và test oracle |
| D2 | Sampled-local normalization chính xác | `REFERENCE-SPECIFIED: RECTANGULAR BI-NORMALIZATION` | Công thức cộng full-coverage equivalence test |
| D3 | Ngữ nghĩa self-loop | `REFERENCE-SPECIFIED: KHÔNG CÓ` | Nguồn LightGCN và adjacency test |
| D4 | Dấu REINFORCE | `REFERENCE-SPECIFIED: POSITIVE COST NHÂN LOG-PROBABILITY` | Gradient-direction test có hai action |
| D5 | Ranking-only hay regularized sampler signal | `REFERENCE-SPECIFIED: DETACHED MEAN RANKING LOSS` | Lập luận credit assignment và invariance test |
| D6 | Cách xây dựng `GCN_Z` cho recommendation | `REFERENCE-SPECIFIED: TARGET-INDUCED GCN VÀ MEAN SCALAR` | Đặc tả input/pooling/output |
| D7 | Chi tiết sampler embedding | `REFERENCE-SPECIFIED: TABLE RIÊNG THUỘC SAMPLER` | Đặc tả ownership, initialization, optimizer và OOV |
| D8 | Cross-layer node re-entry | `REFERENCE-SPECIFIED: CHO PHÉP` | Paper/code audit và invariant tường minh |
| D9 | Positive-edge masking stage | `REFERENCE-SPECIFIED: RETAIN LÀ PHƯƠNG ÁN CHÍNH; TRANSIENT FULL-PIPELINE MASK ABLATION` | Candidate/propagation pseudocode |
| D10 | BPR batch reduction | `REFERENCE-SPECIFIED: MEAN` | Batch-scale invariance test |
| D11 | Likelihood khi candidate rỗng/ít | `REFERENCE-SPECIFIED: FULL BERNOULLI` | Định nghĩa likelihood hữu hạn và test |

## 11. Unit test bắt buộc

### Xây dựng target và graph

- `T01`: `V⁰` bằng unique union của mọi triplet endpoint.
- `T02`: Số lần xuất hiện và thứ tự triplet được giữ nguyên sau khi khử trùng lặp node.
- `T03`: Global ID space của user/item tách biệt và mọi edge đều là bipartite.
- `T04`: Negative item không phải observed positive của user tương ứng trong `E_train`.

### Sampling

- `T05`: `Cˡ` khớp với brute-force neighborhood construction trên toy graph.
- `T06`: `Vˡ ∩ Kˡ⁻¹` rỗng.
- `T07`: `|Vˡ| = min(k_l, |Cˡ|)` và sample không trùng lặp.
- `T08`: `Kˡ = V⁰ ∪ Vˡ`, không phải cumulative union.
- `T09`: Candidate set rỗng hoặc nhỏ hơn `k` không gây crash và cho likelihood hữu hạn.
- `T10`: Các xác suất bằng nhau tạo uniform exact-`k` selection trong statistical tolerance được khai báo trước.

### Block và LightGCN

- `T11`: Mỗi sampled block chỉ chứa registered edge giữa các node set đã khai báo.
- `T12`: Oracle hai layer `b--a--t` cho depth-two target value bằng một với unit weight và source-to-target inward block.
- `T13`: Không tồn tại synthetic self-loop.
- `T14`: Full receptive-field sampling với full-graph normalization và prefix-depth product khớp full LightGCN target embedding tại mọi depth trong tolerance; weighted path oracle cho `1/2` ở depth hai.
- `T15`: Final embedding bằng uniform combination của explicit depth-prefix output; không bao giờ dùng local-ID row alignment giữa các node set.

### Policy objective

- `T16`: `log q_l` khớp phép tính thủ công bao gồm candidate được chọn và không được chọn.
- `T17`: Gumbel noise ảnh hưởng action nhưng không ảnh hưởng `log q_l` được đánh giá.
- `T18`: Exact enumeration tại `theta=0` cho action loss một và ba cho gradient `-0.5`; một RL descent step làm tăng xác suất action có loss thấp hơn.
- `T19`: TB loss khớp phép tính thủ công `log Z + sum log q + alpha L_task`; `log Z` permutation-invariant và không bị ảnh hưởng bởi node ngoài `V^0`.
- `T20`: Sampler backward để gradient của recommender bằng zero/`None`; recommender backward không có gradient đi qua Top-k.
- `T21`: `log q`, reward và TB loss vẫn hữu hạn khi xác suất gần zero hoặc one.

### Biên recommendation

- `T22`: BPR loss giảm khi `s(u,i+) - s(u,i−)` tăng.
- `T23`: Cả hai storage direction của mọi target-positive edge đã khử trùng lặp đều vắng khỏi mọi transient candidate/message-passing structure, normalization degree update đúng một lần và static sampler degree feature không đổi.
- `T24`: Full-graph inference là deterministic qua các lần chạy lặp lại.
- `T25`: Việc đưa validation/test edge hoặc statistic vào training phải fail ngay.

## 12. Ranh giới sẵn sàng của reference design

Mọi semantic decision D1–D11 đã được specified cho reference design này. Chúng chỉ trở thành executable acceptance criteria nếu component liên quan được chọn. G1 chuẩn là gate rationale thiết kế nghiên cứu trong [kế hoạch Phase 2](../00_project/PHASE2_RESEARCH_PLAN_vn.md); environment readiness được theo dõi riêng bằng E0-MIN/E0-FINAL.

Reference design này sẵn sàng cho review ở implementation gate khi:

- các test oracle D1–D11 đã đăng ký tiếp tục được khóa làm executable acceptance criteria cho các implementation gate;
- prerequisite về executable environment áp dụng đã được thỏa;
- primary và ablation protocol không thể được chọn dựa trên test performance;
- source version đã pin và executable environment được ghi cùng nhau;
- hai bản đặc tả song ngữ tiếp tục đồng bộ về ngữ nghĩa.

Không được bắt đầu implementation từ ngữ nghĩa mơ hồ chỉ để khám phá interpretation nào cho kết quả tốt nhất.
