# Phát triển phương pháp lấy mẫu đồ thị cho hệ thống gợi ý quy mô lớn sử dụng mạng nơ-ron đồ thị GNN

> **Trạng thái:** `LUẬN VĂN BẢN LÀM VIỆC TÍCH LŨY — PHÁT TRIỂN PHƯƠNG PHÁP, DATA AUDIT VÀ KẾ HOẠCH NGHIÊN CỨU`  
> **Cập nhật lần cuối:** 2026-09-02
> **Định danh Phase 2:** Luận văn Thạc sĩ độc lập; GRAPES là tài liệu khoa học tham khảo, không phải phương pháp luận văn đã cố định  
> **Ranh giới evidence:** Đã có toy scaffold không dependency và mười local contract test. Persistent checksummed raw-audit manifest cho hai Amazon category trong phạm vi hiện đã tồn tại trên Google Drive, nhưng interaction semantics, strict temporal warm-start dataset, PyTorch/PyG implementation Phase 2, full oracle suite, benchmark và recommendation result chưa được chốt.

Đây là thesis report bản làm việc tiếng Việt. Đây là living artifact: evidence đã được xác minh về implementation, execution và validation sẽ thay các statement dạng kế hoạch khi nghiên cứu tiến triển. Bản tiếng Anh tương ứng là [`THESIS_REPORT_en.md`](./THESIS_REPORT_en.md).

## 1. Tóm tắt điều hành

Graph neural network trên đồ thị lớn có thể cần thông tin từ vùng lân cận nhiều hop ngày càng lớn. Luận văn phát triển và đánh giá một phương pháp lấy mẫu đồ thị cho hệ gợi ý quy mô lớn dùng GNN trên user–item graph. Phase 1 nghiên cứu GRAPES, một phương pháp learned sampling có sẵn cho node classification; nó chỉ cung cấp historical context và candidate mechanism.

GRAPES-informed reference design hiện tại khảo sát sampler GNN, Gumbel Top-k và policy-learning objective cùng recommender kiểu LightGCN và Bayesian Personalized Ranking (BPR). Đây là candidate component—không mặc định là phương pháp cuối. Phương pháp cuối sẽ được xác định thông qua literature positioning, method rationale, data/protocol constraint, controlled comparison và ablation. Một scaffold không dependency hiện test một phần reference contract trên toy input; chưa có phương pháp Phase 2 cuối nào được implementation hoặc test.

Trạng thái project hiện tạo nền tảng nghiên cứu có kiểm soát chứ chưa phải model-performance result: primary source đã pin, literature matrix ban đầu và GRAPES-informed reference design đã ghi, toy scaffold tồn tại và persistent raw dataset audit đã execute. Final interaction semantics, temporal warm-start construction, method definition, environment lock, model implementation và performance evaluation vẫn mở.

## 2. Phạm vi và động lực

### 2.1 Ranh giới Phase 1 đến Phase 2

Phase 1 chọn/khám phá đề tài thông qua nghiên cứu và tái lập một phần GRAPES cho node classification. Bản thuyết trình chính thức đã nộp là historical reference chỉ đọc. Phase 2 là luận văn chính thức; nó không xem Phase 1 là một chapter luận văn, nguồn recommendation result hay implementation blueprint đã cố định.

Luận văn vẫn tập trung phát triển graph sampling cho large-scale GNN recommendation. Candidate mechanism có thể được áp dụng, thay đổi hoặc loại bỏ dựa trên evidence. Negative hoặc null finding vẫn là kết quả hợp lệ, nhưng không được thay đổi claim sau khi đã xem outcome.

### 2.2 Phát biểu bài toán

Trong user–item graph, graph collaborative filtering có thể tận dụng interaction nhiều hop nhưng có thể trở nên tốn kém khi sampled neighborhood mở rộng. Uniform hoặc static sampling có thể bỏ các node hữu ích cho recommendation target cụ thể. Bài toán nghiên cứu là phát triển và đánh giá chặt chẽ một phương pháp lấy mẫu đồ thị có thể chọn computation-graph context hữu ích cho recommendation scalable, đồng thời đo cả recommendation quality và resource cost.

Luận văn không giả định bất kỳ candidate sampling mechanism nào sẽ cải thiện recommendation. Câu hỏi là liệu một phương pháp do project phát triển, được kiểm soát chặt, có thể được định nghĩa, implement và evaluate mà không trộn lẫn sampling effect với khác biệt về data, negative sampling, inference hoặc hardware hay không.

## 3. Câu hỏi nghiên cứu và hypothesis

### 3.1 Câu hỏi nghiên cứu chính

> Có thể phát triển và đánh giá một phương pháp lấy mẫu đồ thị cho large-scale GNN-based recommendation như thế nào để quality và resource trade-off được đo công bằng trước các matched sampling baseline?

### 3.2 Câu hỏi phụ

1. Recommendation target và layer-wise candidate set nên được xây như thế nào mà không leakage?
2. Graph-sampling signal nào còn phù hợp khi user–item graph có ít hoặc không có semantic node feature?
3. GRAPES-informed hoặc candidate mechanism nào khác được closest-work review và controlled ablation biện minh?
4. Learned sampling thêm bao nhiêu memory và training-time overhead ở cùng layer-wise budget?

### 3.3 Hypothesis

Các statement sau là `HYPOTHESIS`, không phải result:

- **H1:** Ở cùng sampling budget đã khai báo, một phương pháp lấy mẫu đồ thị do project phát triển có thể tạo NDCG@20/resource trade-off khác với matched random hoặc static sampling baseline.
- **H2:** Nếu learned hoặc task-aware sampling có lợi, lợi ích có thể rõ hơn ở budget nhỏ, nơi uniform sampling loại bỏ nhiều context có thể hữu ích hơn.
- **H3:** Candidate sampling objective và mechanism có thể có stability, quality và overhead profile khác nhau; chưa giả định cơ chế nào tốt hơn trước khi đo.
- **H4:** Learned sampling được kỳ vọng thêm memory và runtime overhead có thể đo được; quality trade-off phải được đo thay vì giả định là chấp nhận được.

## 4. Nền tảng và nghiên cứu liên quan

| Nguồn | Mức liên quan với luận văn | Trạng thái evidence và ranh giới |
|---|---|---|
| GRAPES, arXiv:2310.03399v3 | Nguồn formal cho layer-wise learned sampling, Gumbel Top-k, REINFORCE, GFlowNet/Trajectory Balance và sampled computation graph | `VERIFIED PRIMARY SOURCE`; recommendation là adaptation target, không phải evaluation đã hoàn thành ở Phase 1 |
| BPR, arXiv:1205.2618 | Pairwise ranking loss và implicit-feedback triplet | `VERIFIED PRIMARY SOURCE`; không đặc tả GRAPES sampling |
| LightGCN, arXiv:2002.02126 | Graph collaborative-filtering propagation, layer aggregation và dot-product recommendation score | `VERIFIED PRIMARY SOURCE`; sampled block semantic cần adaptation contract rõ ràng |
| PinSage, arXiv:1806.01973 | Bối cảnh scalable graph recommendation và sampling | `VERIFIED PRIMARY SOURCE ANCHOR`; không phải policy kiểu GRAPES và không bắt buộc là primary baseline |
| DSKReG, arXiv:2108.11883 | Cảnh báo về learned sampling trong recommendation-related setting | `VERIFIED PRIMARY SOURCE ANCHOR`; khác knowledge-graph setting, vì vậy novelty phải hẹp và chính xác |
| Recommender leakage study, arXiv:2010.11060 | Hỗ trợ temporal và training-only preprocessing control | `VERIFIED PRIMARY SOURCE ANCHOR`; Amazon protocol cụ thể vẫn cần khóa |
| Sampled-metric analysis, arXiv:1912.02263 | Hỗ trợ exact full-catalog ranking cho primary evaluation | `VERIFIED PRIMARY SOURCE ANCHOR`; feasibility cuối cùng phụ thuộc scale đo được |

Literature review hiện vẫn sơ bộ. Nó đủ làm nền cho method và protocol section, nhưng chưa đủ cho exhaustive review hoặc novelty claim “learned sampler đầu tiên cho recommendation”.

## 5. Evidence và source governance của Phase 1

Bản thuyết trình Phase 1 tạo động lực từ scalable GNN training, phân biệt neighbor explosion với oversmoothing và oversquashing, tổng quan sampling/decoupling/historical-embedding family và trình bày GRAPES cho node classification. Evidence reproduction nhìn thấy bao phủ Cora, CiteSeer, ogbn-arxiv và một large-graph run chưa hoàn thành trong Colab environment khác. Đây là historical evidence của Phase 1, không phải recommendation result của Phase 2.

Thứ tự nguồn của Phase 2 là:

1. project scope và scientific rule;
2. GRAPES arXiv:2310.03399v3 cho formal semantics;
3. official GRAPES repository commit `71ecebeaac896800aa4dd1d0f38c57ec222ef396` cho implementation evidence;
4. Phase 1 local snapshot và notebook chỉ cho historical provenance;
5. BPR và LightGCN primary paper cho recommendation semantics.

Exact original Phase 1 Git commit không thể khôi phục từ local artifact hiện có. Local snapshot được giữ với content fingerprint và không được xem là exact version identifier. Paper/code discrepancy được ghi lại thay vì âm thầm chọn implementation có thể tạo empirical result tốt hơn.

## 6. GRAPES-informed reference design hiện tại

Section này ghi candidate reference design, không phải phương pháp luận văn cuối. Component chỉ có thể được chọn lại khi có literature-backed rationale và verification; section không claim implementation.

### 6.1 Training graph và BPR batch

Gọi

```text
G_train = (U ∪ I, E_train)
```

là user–item bipartite graph chỉ chứa positive interaction trong training period. User và item ID space là disjoint; item dùng explicit offset. Một batch là ordered multiset của BPR triplet:

```text
B = [(u_b, i_b+, i_b−)] for b = 1,...,M.
```

Initial target set là unique union của mọi endpoint trong triplet:

```text
V⁰ = unique({u_b, i_b+, i_b− for every triplet in B})
K⁰ = V⁰.
```

Deduplication làm thay đổi graph target set nhưng phải giữ triplet order, multiplicity và mapping cần thiết để gather embedding của user, positive-item và negative-item.

### 6.2 Layer-wise learned sampling

Ở layer `l`, candidate set là:

```text
Cˡ = N_Ework(Kˡ⁻¹) \ Kˡ⁻¹
n_l = |Cˡ|
k_l_effective = min(k_l, n_l).
```

Gumbel Top-k chọn tối đa `k_l` candidate distinct không replacement. Formal set contract là:

```text
Vˡ = GumbelTopK(p_phi(Cˡ), k_l)
Kˡ = V⁰ ∪ Vˡ.
```

Set này không phải cumulative union của toàn bộ sampled node trước đó. Sampling mở rộng outward, trong khi recommender propagate message qua layer-dependent block từ source `Kˡ` tới destination `Kˡ⁻¹`. Cross-layer node re-entry được specification cho phép.

### 6.3 Sampled recommender và loss

Classifier GNN của GRAPES được thay bằng LightGCN-style recommender. Sampled implementation phải giữ cùng số layer và combination coefficient giữa các method, không thêm recommender self-loop, feature transformation hoặc nonlinearity vào primary sampled variant.

Recommendation score và primary task loss là:

```text
s(u, i) = z_uᵀ z_i

L_BPR = −mean log sigmoid(s(u, i+) − s(u, i−)) + regularization.
```

Primary direct-policy reward tỷ lệ với:

```text
R(S, B) = exp(−alpha * L_BPR(S, B)).
```

Ranking signal được detach khi dùng để update reference sampler. Hai learned reference variant có thể được xem xét: `GRAPES-RL-Rec` dùng REINFORCE và `GRAPES-GFN-Rec` dùng GRAPES Trajectory Balance. Gradient direction, likelihood, normalizer conditioning và credit-assignment semantic được bảo vệ bởi reference oracle đã đăng ký. Không variant nào được chọn trước làm phương pháp luận văn cuối cùng.

### 6.4 Ranh giới training và inference

Training dùng sampler để tạo layered graph và recommender để tính BPR loss trên cùng triplet. Recommender update và sampler update tách riêng và được log. Random-Sampling-Rec và Degree-Sampling-Rec phải dùng matched budget, triplet, negative, data split, backbone và optimization search budget.

Primary inference là deterministic full-graph LightGCN propagation chung cho mọi method, sau đó chunked full-catalog ranking. Test interaction không được đưa vào training graph. Vì vậy luận văn chỉ có thể claim sampled-training behavior nếu có measurement; không được claim sampled-inference scalability từ protocol này.

## 7. Proposed experimental plan — protocol chưa hoàn chỉnh

### 7.1 Phạm vi dataset

Evidence portfolio được giới hạn có chủ đích. `Baby_Products` là Amazon primary candidate bắt buộc; `Home_and_Kitchen` là *bounded scale-stress test* bắt buộc nếu luận văn giữ large-scale claim. `All_Beauty` chỉ dành cho development/diagnostic, không phải primary evidence. MovieLens 25M và Yelp Open Dataset là các bổ sung tùy chọn sau khi Amazon core hoàn thành; chúng không được làm chậm central experiment. Mọi vai trò là `PROPOSED` cho đến khi Dataset Gate G2 đóng.

Decision record song ngữ, source, câu hỏi audit chính xác, preprocessing sequence, comparison rule và gate nằm trong [`DATASET_PORTFOLIO_AND_ANALYSIS_PROTOCOL_vn.md`](../00_project/DATASET_PORTFOLIO_AND_ANALYSIS_PROTOCOL_vn.md). Đặc biệt, official Amazon 5-core data là reproducibility reference, không tự động là strict temporal training graph của luận văn.

### 7.1.1 Tại sao chọn các dataset này

Amazon Reviews'23 được chọn vì luận văn nghiên cứu graph sampling cho recommendation, do đó cần interaction user–item có timestamp và có thể biểu diễn thành bipartite graph quy mô lớn. Bản pure-ID 0-core giữ lại long tail thưa thay vì áp đặt population đã k-core từ phía provider trước khi project định nghĩa transformation chỉ dựa trên training. Dataset cũng có rating để kiểm tra các interaction semantics dạng implicit-positive và có timestamp để đánh giá theo thời gian.

`Baby_Products` là primary candidate vì kết hợp product-review domain, hàng triệu event, hơn ba triệu user và degree imbalance đáng kể. Quy mô này đủ lớn để bộc lộ graph-construction và sampling pressure nhưng vẫn giới hạn hơn các Amazon category lớn nhất. `All_Beauty` được giữ làm development control vì cùng schema và source family nhưng nhỏ hơn; singleton rate rất cao khiến nó không thể làm primary warm-start evidence. `Home_and_Kitchen` dành cho bounded scale-stress experiment nếu luận văn tiếp tục giữ large-scale claim. Như vậy, dataset được chọn theo vai trò nghiên cứu, không phải theo dataset nào về sau cho model score tốt nhất.

### 7.1.2 Audit để làm gì và dùng phương pháp nào

Audit là phương pháp nghiên cứu trước model. Mục tiêu là xác định downloaded bytes có tái lập được không, semantics có hỗ trợ recommendation task dự kiến không, population nào còn lại sau leakage-safe temporal transformation, và graph kết quả có thực sự kiểm tra sampling method được không. Audit ngăn source error, hidden filtering, future-information leakage, negative không được định nghĩa và evaluation cohort mà pure-ID model không thể biểu diễn.

Project dùng **exact streaming descriptive audit kết hợp candidate temporal-split diagnostic**. Các row được parse tuần tự để kiểm tra toàn bộ compressed source mà không cần nạp cả table vào RAM. Exact counter và persistent keyed state được dùng khi cần cho ID, user–item pair, degree và split membership. Audit deterministic và ghi source URL, retrieval time, compressed size, SHA-256, schema, anomaly count, rating distribution, degree distribution, duplicate pair, timestamp diagnostic và candidate-split OOV coverage.

Phương pháp này khác các cách liên quan ở những điểm quan trọng:

- Provider metadata hữu ích cho provenance nhưng chỉ có aggregate claim đã làm tròn; project audit tính exact count từ acquired bytes và verify thay vì giả định provider behavior.
- Exploratory in-memory analysis thuận tiện nhưng có thể vượt RAM hoặc âm thầm dùng sample; streaming analysis bao phủ mọi row với bounded working memory, dù exact high-cardinality check vẫn có thể cần disk-backed state.
- Random sampling hoặc approximate sketch giảm chi phí nhưng tạo estimation error, nên không phù hợp cho checksum, anomaly, duplicate và gate-closing count nếu approximation không được khai báo tường minh.
- Provider 5-core hoặc global pre-filtering tạo population dày hơn nhưng có thể dùng future activity trước temporal split. Project audit raw event 0-core trước rồi mới filtering từ training positive.
- Model evaluation trả lời recommender đã train xếp hạng item tốt đến đâu. Dataset audit trả lời task, cohort, graph và evidence có hợp lệ không; nó không thể chứng minh NDCG, Recall, sampler superiority hoặc scalability.

Các chỉ số audit chính được định nghĩa như sau:

| Chỉ số | Định nghĩa và ý nghĩa nghiên cứu |
|---|---|
| Valid-row rate | Số parsed row thỏa constraint bắt buộc về ID, rating và timestamp chia cho tổng row; đo schema conformity, không đo positive-feedback validity |
| Duplicate-pair rate | Số row vượt quá occurrence đầu tiên của cùng `(user_id, parent_asin)` chia cho valid row; phát hiện repeated-pair ambiguity cần policy deterministic |
| P4/P5 retention | Số row có `rating >= 4` hoặc `rating == 5` chia cho valid row; đo hệ quả về quy mô của candidate implicit-positive semantics |
| User/item degree | Số retained interaction incident trên mỗi user/item; quantile, mean, maximum và singleton rate mô tả bipartite sparsity cùng head–tail imbalance |
| Singleton rate | Số node thuộc loại tương ứng có degree một chia cho tổng node loại đó; cho biết bao nhiêu population không đủ lịch sử cho warm-start split thông thường |
| Bipartite density | `|E| / (|U| × |I|)` khi mỗi valid pair được xem là một edge; mô tả occupancy nhưng tự thân không chứng minh độ khó hay quy mô |
| OOV rate | Số validation/test user hoặc item không có trong training universe chia cho unique validation/test user hoặc item tương ứng; đo mức không tương thích của cohort với pure-ID warm-start evaluation |
| Warm-start retention | Số evaluation target có cả user và item thuộc frozen training universe chia cho tổng candidate target; định nghĩa retained estimand và phải report cùng OOV |
| Timestamp-tie count | Số row tham gia các shared timestamp value ở resolution đã khai báo; phát hiện ambiguity tại temporal cutoff và nhu cầu stable tie rule |
| Provenance identity | Exact URL, retrieval time, byte size và SHA-256; xác định artifact đã phân tích, không chứng minh semantics khoa học của nó đúng |

### 7.1.3 Kết quả audit do project tạo ra và cách diễn giải

Persistent JSON manifest đã được ghi vào Google Drive ngày 2026-09-02 từ exact downloaded bytes. `All_Beauty` có SHA-256 `54b894e68ad965aa73cdb80d8695c1ed37679c46f38b6f97b21ab0fb585aab24`; `Baby_Products` có SHA-256 `e2a8d0498afed767ee2615db7fac549559d82490b1a73c7241b84b5e9e8c279e`. Các hash này định danh artifact đã audit. G2-A vẫn cần access/usage note, source version, preprocessing configuration và code commit đầy đủ trong immutable manifest.

| Finding | `All_Beauty` | `Baby_Products` | Diễn giải nghiên cứu |
|---|---:|---:|---|
| Valid row | 693,929 | 5,953,891 | Exact acquired-byte count phù hợp expected source scale; cả hai file không có missing required ID hoặc invalid timestamp |
| Unique user / item | 631,986 / 112,565 | 3,386,206 / 217,654 | `Baby_Products` cung cấp primary graph lớn hơn rõ rệt; raw size tự thân không đóng G2 |
| Exact repeated user–item row | 0 | 0 | Acquired release đã có một row trên mỗi user–item pair theo audited key; vẫn phải ghi deterministic policy để tái lập |
| Rating anomaly | không có | một row `0.0` | Baby anomaly có tần suất không đáng kể nhưng là ngoại lệ schema/semantics cần quarantine hoặc xử lý bằng rule đã pre-register |
| P4 / P5 retained row | 494,769 / 416,190 | 4,655,843 / 3,973,866 | Cả hai semantics giữ lại lượng event đáng kể; chọn P4 hay P5 phải theo feedback meaning và post-filter feasibility, không theo downstream score |
| User singleton rate | 93.22% | 70.01% | Phần lớn user có quá ít raw history cho warm-start temporal evaluation thông thường; kết quả loại `All_Beauty` khỏi primary evidence và bắt buộc report retention cho Baby |
| Item singleton rate | 42.59% | 31.65% | Cả hai graph có item tail lớn, tạo diagnostic có ý nghĩa cho coverage và sampling bias |
| User degree p50 / p90 / p99 | 1 / 1 / 3 | 1 / 3 / 10 | Activity có long tail mạnh, đặc biệt phía user; aggregate average sẽ che population degree thấp chiếm ưu thế |
| Item degree p50 / p90 / p99 | 2 / 11 / 72 | 3 / 36 / 450 | Item popularity tập trung mạnh, vì vậy sampler analysis về sau phải report head–tail exposure thay vì chỉ aggregate accuracy |
| Candidate validation user OOV | 63,008/68,386 = 92.14% | 301,130/401,145 = 75.07% | Provider absolute split không tương thích với direct pure-ID warm-start evaluation cho phần lớn validation user |
| Candidate test user OOV | 34,851/36,953 = 94.31% | 318,972/383,264 = 83.23% | Mức không tương thích tiếp tục hoặc tăng ở test; chỉ report retained user sẽ che severe cohort attrition |
| Candidate validation/test item OOV | 49.37% / 57.68% | 36.51% / 54.11% | Future partition cũng có nhiều unseen item; primary pure-ID task phải loại và report chúng hoặc thêm cold-start mechanism riêng |
| Timestamp-tie audit | 448 participating row | `UNKNOWN` vì exact tie counting bị tắt | All Beauty cần stable cutoff tie rule; Baby tie evidence chưa hoàn chỉnh và không được suy từ All Beauty |

Các finding này chứng minh source identity, exact raw scale, bipartite sparsity mạnh, long-tail concentration và mức mismatch nghiêm trọng giữa provider absolute split với pure-ID warm-start estimand. Chúng biện minh cho việc giữ `Baby_Products` làm primary candidate, giới hạn `All_Beauty` ở development diagnostic và xây strict temporal task mới chỉ từ training information. Chúng **không** chứng minh recommendation quality, sampling effectiveness, memory reduction, runtime improvement, novelty hoặc large-scale generalization.

Phân tích tuân theo chuỗi **observation → population và denominator → protocol consequence → action → excluded inference → gate status**. Theo evidence hiện tại, duplicate verification đã được giải quyết cho cả hai acquired file; cách xử lý Baby `0.0`, lựa chọn P4/P5/all-observed, exact Baby timestamp tie, strict temporal cutoff, training-only filtering, negative eligibility, warm-start retention và G2-D feasibility vẫn `OPEN`.

Protocol chi tiết và quy tắc diễn giải nằm trong [`DATASET_PORTFOLIO_AND_ANALYSIS_PROTOCOL_vn.md`](../00_project/DATASET_PORTFOLIO_AND_ANALYSIS_PROTOCOL_vn.md). Result record local cũ vẫn nằm trong [`DATASET_AUDIT_RESULTS_vn.md`](../06_code/docs/DATASET_AUDIT_RESULTS_vn.md); file đó phải được đồng bộ với persistent manifest trước khi được xem là numerical summary hiện hành.

### 7.2 Chuẩn bị chống leakage

Sequence dự kiến là: validate schema và duplicate; định nghĩa implicit positive; tạo global chronological split khi timestamp tin cậy; iterative filtering chỉ trên training positive; freeze user/item universe; project validation/test vào universe; và tính graph statistic, degree, popularity, normalization chỉ từ training. Rating threshold, repeated-interaction policy, temporal cutoff, core threshold và negative eligibility cụ thể vẫn mở. Provider processing, project interaction semantics, project split và project warm-start filtering sẽ được report như các transformation tách biệt.

### 7.3 Baseline và comparison

Planned comparison family gồm MostPop, BPR matrix factorization, full-graph LightGCN, random sampling, degree-aware sampling và GRAPES-informed learned reference variant. Baseline set cuối cùng và project-developed method phải được freeze từ evidence record trước final experiment. Mọi learned variant sẽ được so với matched non-learned sampling, không so với implementation có điều kiện khác nhau.

### 7.4 Metric và thống kê

Primary quality là exact full-catalog NDCG@20; Recall@20 là secondary. Resource measurement dự kiến gồm peak GPU/CPU memory, epoch time, time to best validation score, throughput, sampler và propagation time, sampled nodes/edges, policy diagnostic và failure. Seed structure dự kiến là một smoke seed, ba development seed và năm paired final seed nếu capacity đo được cho phép. Final report nên có mean, standard deviation, effect size, confidence interval và giải thích failed run. Đây là plan, chưa phải measurement.

### 7.5 Ablation

Registered ablation bao phủ layer-wise budget `k`, recommendation depth, sampler input, reward coefficient và stabilization, update frequency, frozen so với active sampler training, degree cohort, full-graph so với sampled training, sampled-local so với full-graph normalization và retention so với transient masking của current positive edge.

## 8. Kế hoạch verification và reproducibility

Semantic decision D1–D11 được ghi trong GRAPES-informed reference specification. Expected behavior T01–T25 đã đăng ký như executable reference acceptance criteria. Scaffold hiện đã execute mười pure-Python toy test, gồm các check nhỏ liên quan tới T01–T03, T05–T09, T11–T12, T14, T18–T19, T22 và T23. Các test này không validate PyTorch/PyG implementation tương lai. Khi project-developed method và data protocol được chọn, các primitive liên quan về graph, ID, candidate, sampling, likelihood và gradient isolation sẽ được implement, và high-risk reference oracle sẽ được chạy lại khi phù hợp.

Code deliverable được dự kiến là modular Python package có CPU toy-graph path, deterministic configuration và seed handling, truy vết D-ID tới module tới T-ID, data/checksum manifest interface, logging và checkpoint contract, paired human-readable documentation và thin Colab launcher. Notebook chỉ nên install package, thu runtime metadata, chạy test và lưu log; không chứa implementation logic chính.

Dataset-audit utility hiện được implement như pre-model gate dạng streaming, dependency-free. Utility đã được check trên toy CSV fixture của project và execute trên exact acquired bytes của `All_Beauty` và `Baby_Products`. Persistent checksummed JSON manifest hiện đã tồn tại trên Google Drive; các manifest field G2-A đầy đủ, protocol closure và post-filter training-universe statistic vẫn mở.

Exact Python/PyTorch/PyG/CUDA lock và final GPU class chưa biết. Colab sẵn sàng cho development và smoke run, nhưng temporary Colab hardware không phải nền tảng profiling comparable cuối cùng.

## 9. Rủi ro và giới hạn hiện tại

- Positive edge `(u, i+)` có thể tạo shortcut trong sampled recommendation; retention/masking comparison đã preregister nhưng chưa chạy.
- Negative sample khác nhau có thể tạo sampler advantage giả; cần matched negative/RNG control.
- GFlowNet likelihood và normalizer semantic cần test implementation tường minh.
- Learned sampler có thể cải thiện ranking nhưng tăng memory/runtime; phải report cả hai phía của trade-off.
- Exact Phase 1 commit provenance không có, làm giới hạn attribution của historical reproduction result.
- Persistent checksummed Amazon audit manifest đã có, nhưng license/access note, source/code/configuration manifest field, protocol decision và post-filter training-universe scale chưa hoàn chỉnh.
- Thesis template, submission language, page limit, defense format và formal rubric của trường chưa biết.

## 10. Trạng thái hiện tại và research gate tiếp theo

| Hạng mục | Maturity hiện tại | Ranh giới evidence |
|---|---|---|
| Scope và kế hoạch 12 tuần | `LOCKED / RECORDED` | [Kế hoạch nghiên cứu Phase 2 chính thức](../00_project/PHASE2_RESEARCH_PLAN_vn.md) |
| Literature và source pin | `VERIFIED ARTIFACT / PRELIMINARY` | Primary-paper anchor và source note |
| GRAPES-informed reference design D1–D11 | `REFERENCE DESIGN; NOT CANONICAL METHOD` | Bilingual reference specification |
| Reference verification candidate T01–T25 | `PARTIAL TOY EXECUTION` | 10 toy check pass; final verification plan vẫn mở |
| Report và slide working content | `CUMULATIVE DRAFT` | Living report và defense deck này |
| Python/Colab source | `SCAFFOLDED AND TOY-TESTED` | 10/10 pure-Python test pass local; chưa benchmark implementation |
| Amazon data | `PERSISTENT RAW AUDIT / G2 OPEN` | Đã có checksummed Drive manifest; G2-A field, semantic/split decision, post-filter graph và G2-D vẫn mở |
| Environment/GPU | `E0-MIN IN_PROGRESS; E0-FINAL NOT_STARTED` | Có Colab; development lock chạy lại được và final profiling lock chưa hoàn tất |
| Recommendation result | `NOT STARTED` | Chưa có NDCG, Recall, runtime, memory hoặc scalability result |

Registry chuẩn hiện có G0 `PASS`, G1/G2 `IN_PROGRESS` và G3–G6 `NOT_STARTED`. Closest-work/rationale G1 và protocol evidence G2 chạy song song với E0-MIN. Baseline khoa học chờ G2 cùng E0-MIN; implement proposed sampler chờ G1–G3. Toy test hiện có là reference evidence và không thỏa G4.

## 11. Tài liệu tham khảo

1. GRAPES, arXiv:2310.03399v3. <https://arxiv.org/abs/2310.03399v3>
2. Rendle et al., “BPR: Bayesian Personalized Ranking from Implicit Feedback,” arXiv:1205.2618. <https://arxiv.org/abs/1205.2618>
3. He et al., “LightGCN: Simplifying and Powering Graph Convolution Network for Recommendation,” arXiv:2002.02126. <https://arxiv.org/abs/2002.02126>
4. Ying et al., “Graph Convolutional Neural Networks for Web-Scale Recommender Systems,” arXiv:1806.01973. <https://arxiv.org/abs/1806.01973>
5. DSKReG, arXiv:2108.11883. <https://arxiv.org/abs/2108.11883>
6. Amazon Reviews 2023 official documentation. <https://amazon-reviews-2023.github.io/main.html>
7. Recommender evaluation leakage study, arXiv:2010.11060. <https://arxiv.org/abs/2010.11060>
8. Sampled-metric analysis, arXiv:1912.02263. <https://arxiv.org/abs/1912.02263>

### Local project records

- [`PHASE2_DIRECTION_REVIEW_vn.md`](../PHASE2_DIRECTION_REVIEW_vn.md)
- [`GRAPES_SOURCE_VERSION_NOTE_vn.md`](../01_literature/GRAPES_SOURCE_VERSION_NOTE_vn.md)
- [`GRAPES_RECOMMENDATION_SPEC_vn.md`](../02_protocol/GRAPES_RECOMMENDATION_SPEC_vn.md)
- [`REPORT_TEACHER_vn.md`](../03_reports/REPORT_TEACHER_vn.md)
- Official Phase 1 deck: [`GRAPES_Presentation_v2.pptx`](</Users/tyvan/Documents/Master/ThucTap2/GRAPES%20report/GRAPES_Presentation_v2.pptx>)
