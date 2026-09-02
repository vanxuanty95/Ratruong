# Phát triển phương pháp lấy mẫu đồ thị cho hệ thống gợi ý quy mô lớn sử dụng mạng nơ-ron đồ thị GNN

> **Trạng thái:** `LUẬN VĂN BẢN LÀM VIỆC TÍCH LŨY — PHÁT TRIỂN PHƯƠNG PHÁP, DATA AUDIT VÀ KẾ HOẠCH NGHIÊN CỨU`  
> **Cập nhật lần cuối:** 2026-09-02
> **Định danh Phase 2:** Luận văn Thạc sĩ độc lập; GRAPES là tài liệu khoa học tham khảo, không phải phương pháp luận văn đã cố định  
> **Ranh giới evidence:** 13 local pure-Python test đã pass, full Baby P4 temporal artifact đã execute và G2-C được chấp nhận. Bounded G2-D traversal 100 target đã execute với hai candidate invariant đúng, nhưng exact environment fingerprint còn mở. Chưa có model PyTorch/PyG Phase 2, benchmark, recommendation result, final profiling hoặc scalability result.

Đây là thesis report bản làm việc tiếng Việt. Đây là living artifact: evidence đã được xác minh về implementation, execution và validation sẽ thay các statement dạng kế hoạch khi nghiên cứu tiến triển. Bản tiếng Anh tương ứng là [`THESIS_REPORT_en.md`](./THESIS_REPORT_en.md).

## 1. Tóm tắt điều hành

Graph neural network trên đồ thị lớn có thể cần thông tin từ vùng lân cận nhiều hop ngày càng lớn. Luận văn phát triển và đánh giá một phương pháp lấy mẫu đồ thị cho hệ gợi ý quy mô lớn dùng GNN trên user–item graph. Phase 1 nghiên cứu GRAPES, một phương pháp learned sampling có sẵn cho node classification; nó chỉ cung cấp historical context và candidate mechanism.

GRAPES-informed reference design hiện tại khảo sát sampler GNN, Gumbel Top-k và policy-learning objective cùng recommender kiểu LightGCN và Bayesian Personalized Ranking (BPR). Đây là candidate component—không mặc định là phương pháp cuối. Phương pháp cuối sẽ được xác định thông qua literature positioning, method rationale, data/protocol constraint, controlled comparison và ablation. Một scaffold không dependency hiện test một phần reference contract trên toy input; chưa có phương pháp Phase 2 cuối nào được implementation hoặc test.

Trạng thái project hiện tạo nền tảng nghiên cứu có kiểm soát chứ chưa phải model-performance result: primary source đã pin, literature matrix ban đầu và GRAPES-informed reference design đã ghi, persistent portfolio audit đã execute, còn Baby P4 temporal-graph construction đã implement và toy-check. Full-data temporal evidence, cutoff review, method definition, environment lock, model implementation và performance evaluation vẫn mở.

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

### 7.1.1 G2 là gì và dataset được phân loại theo tiêu chí nào

Dataset Gate **G2** là cổng quyết định dataset và evaluation protocol trước khi train model. G2-A định danh và truy vết exact source bytes; G2-B cố định interaction, anomaly, duplicate và negative semantics; G2-C chỉ dùng training information để dựng temporal graph/mapping, định nghĩa warm-start/OOV cohort và cố định exact candidate; G2-D kiểm tra bounded execution path mà không train hoặc so sánh recommender. G2 trả lời task đã được định nghĩa khoa học và có thực thi được không. Nó không trả lời sampler nào tốt nhất, recommendation quality có cao không hoặc method có scale ngoài setting đã test không.

Vai trò dataset được gán trước khi có model score bằng năm tiêu chí: semantic fit với task luận văn; retained graph size và structural difficulty; warm-start coverage có thể bảo vệ; processing/compute khả thi và tái lập; cùng research claim mà dataset được dùng để hỗ trợ. **Primary benchmark** phải đáp ứng đủ mạnh cả năm để tạo headline quality–cost evidence. **Development/diagnostic dataset** cần đủ tương đồng và rẻ để debug nhưng population có thể quá hẹp cho primary estimand. **Scale-stress dataset** phải lớn hơn rõ rệt và chỉ dùng kiểm tra resource limit sau khi task/method ổn định. Optional control bổ sung diversity nhưng không được làm chậm core evidence.

Áp các tiêu chí này, `Baby_Products` là primary; `All_Beauty` là diagnostic vì raw user-singleton rate 93.22% cùng candidate warm-target retention rất thấp tạo primary cohort cực hẹp; `Home_and_Kitchen` là scale stress vì có 66,623,880 raw row, khoảng 11.19 lần Baby, nên full run quá sớm sẽ tốn tài nguyên. Vì vậy portfolio-audit notebook bao phủ cả ba category, nhưng complete G2-C/G2-D notebook hiện chỉ có Baby một cách có chủ đích. All Beauty có thể tái sử dụng path cho targeted diagnostic về sau; full Home execution chờ conditional G5-S. Chỉ được đổi vai trò bằng pre-model validity/feasibility review có record, không được đổi vì model về sau cho score thuận lợi.

### 7.1.2 Tại sao chọn các dataset này

Amazon Reviews'23 được chọn vì luận văn nghiên cứu graph sampling cho recommendation, do đó cần interaction user–item có timestamp và có thể biểu diễn thành bipartite graph quy mô lớn. Bản pure-ID 0-core giữ lại long tail thưa thay vì áp đặt population đã k-core từ phía provider trước khi project định nghĩa transformation chỉ dựa trên training. Dataset cũng có rating để kiểm tra các interaction semantics dạng implicit-positive và có timestamp để đánh giá theo thời gian.

`Baby_Products` là primary candidate vì kết hợp product-review domain, hàng triệu event, hơn ba triệu user và degree imbalance đáng kể. Quy mô này đủ lớn để bộc lộ graph-construction và sampling pressure nhưng vẫn giới hạn hơn các Amazon category lớn nhất. `All_Beauty` được giữ làm development control vì cùng schema và source family nhưng nhỏ hơn; singleton rate rất cao khiến nó không thể làm primary warm-start evidence. `Home_and_Kitchen` dành cho bounded scale-stress experiment nếu luận văn tiếp tục giữ large-scale claim. Như vậy, dataset được chọn theo vai trò nghiên cứu, không phải theo dataset nào về sau cho model score tốt nhất.

### 7.1.3 Audit để làm gì và dùng phương pháp nào

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

### 7.1.4 Kết quả audit do project tạo ra và cách diễn giải

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
| Timestamp-tie audit | 448 participating row | 32,050 participating row; không có row đúng tại hai candidate cutoff | Shared timestamp tồn tại, nhưng candidate cutoff hiện tại không cắt ngang một exact timestamp value; vẫn cần deterministic tie rule nếu đổi cutoff về sau |

Complete protocol run `Baby_Products` đã quarantine một row `0.0`, còn lại 5,953,890 clean event, và tạo controlled semantic comparison sau:

| Pre-model policy | Event giữ lại | User / item | User / item singleton rate | Training item universe | Validation warm-target retention | Test warm-target retention |
|---|---:|---:|---:|---:|---:|---:|
| Mọi observed rating trong `[1,5]` | 5,953,890 (100.00%) | 3,386,206 / 217,654 | 70.01% / 31.65% | 180,415 | 126,760 / 517,373 = 24.50% | 63,287 / 550,405 = 11.50% |
| P4: `rating >= 4` | 4,655,843 (78.20%) | 2,769,312 / 194,722 | 71.64% / 33.13% | 162,125 | 81,871 / 373,776 = 21.90% | 40,587 / 413,413 = 9.82% |
| P5: `rating == 5` | 3,973,866 (66.74%) | 2,476,012 / 182,226 | 73.18% / 34.34% | 151,490 | 66,409 / 326,444 = 20.34% | 32,810 / 356,303 = 9.21% |

So sánh cho thấy feasibility giảm đơn điệu khi định nghĩa positive nghiêm ngặt hơn: P4 loại 21.80% clean event, còn P5 loại 33.26%; user singleton rate tăng và warm-target retention giảm. All-observed có coverage cao nhất, nhưng xem rating 1–2 là positive preference sẽ làm sai lệch ý nghĩa implicit feedback dự kiến nên không thể chọn chỉ vì coverage. P5 chặt về semantic nhưng mất thêm 681,977 event so với P4 và tạo warm-start cohort nhỏ nhất. Theo independent semantic review và feasibility review đã ghi trong protocol chuẩn, **P4 được chọn và freeze làm primary interaction policy**, còn P5 dành cho sensitivity analysis nếu cần. Quyết định này đóng G2-B cho `Baby_Products`; đây là quyết định data/task, không phải model-performance finding.

Trong cả ba snapshot, mọi training user đều có ít nhất một eligible negative theo candidate training-item-universe rule đã audit. Minimum available negative lần lượt là 180,057, 161,785 và 151,176; median thấp hơn relevant catalog size đúng một item. Kết quả chứng minh negative generation khả thi về mặt số lượng theo candidate rule; nó không chứng minh cách xử lý future positive đã đúng, sampled negative không bias hoặc final evaluator chống leakage.

Complete protocol run `All_Beauty` tiếp theo xác nhận vai trò diagnostic-only của category này. P4 giữ 494,769/693,929 = 71.30% event và P5 giữ 416,190/693,929 = 59.98%, nhưng user singleton rate tăng từ 93.22% (all observed) lên 94.16% (P4) và 94.76% (P5). Candidate validation/test warm-target retention chỉ còn 4.77%/2.28% cho all observed, 3.98%/1.91% cho P4 và 3.24%/1.65% cho P5. Exact duplicate row vẫn bằng zero; 448 row tham gia shared timestamp value và không candidate cutoff nào trùng timestamp của row. Kết quả validate batch pipeline trên category thứ hai và chứng minh warm-start estimand cực hẹp; nó không biện minh cho việc dùng `All_Beauty` làm primary evidence.

Bounded provenance job `Home_and_Kitchen` cũng đã hoàn tất. Exact 0-core compressed artifact có 1,420,416,432 bytes, SHA-256 `9be4e2dc8b3dc513c02521644b2ae55f722b2941767e539dcfe518f6bdd4f70b`, chứa 66,623,880 row và khớp schema bốn cột bắt buộc (`user_id`, `parent_asin`, `rating`, `timestamp`). Kết quả xác minh byte identity, schema và raw event scale lớn hơn đáng kể so với Baby (khoảng 11.19 lần số row). Nó **không** cung cấp unique-user/item count do project tính, semantic snapshot, duplicate/timestamp evidence, frozen training graph, runtime/memory feasibility hoặc scalability result. Full scale stress vẫn bị khóa bởi G5-S.

Các finding này chứng minh source identity, exact raw scale, bipartite sparsity mạnh, long-tail concentration và mức mismatch nghiêm trọng giữa provider absolute split với pure-ID warm-start estimand. Chúng biện minh cho việc giữ `Baby_Products` làm primary candidate, giới hạn `All_Beauty` ở development diagnostic và xây strict temporal task mới chỉ từ training information. Chúng **không** chứng minh recommendation quality, sampling effectiveness, memory reduction, runtime improvement, novelty hoặc large-scale generalization.

Phân tích tuân theo chuỗi **observation → population và denominator → protocol consequence → action → excluded inference → gate status**. Baby G2-A/G2-B/G2-C nay đã `PASS`. Full training-only graph, exact OOV ledger/candidate construction, deterministic artifact cùng bounded traversal đã execute và readback. G2-D chỉ còn mở vì E0-MIN environment fingerprint; hiện không có lý do rebuild data hoặc sửa cutoff.

Frozen graph có 3,868,654 edge giữa 2,318,308 user và 162,125 item. User degree long-tail mạnh (p50 1, p90 3, p99 9; singleton 71.76%), còn item degree tập trung hơn (p50 3, p90 32, p99 397, maximum 21,348; singleton 33.35%). Largest trong 34,288 component chứa 96.50% của toàn bộ 2,480,433 node. Các chỉ số cho thấy message-passing graph thưa, mất cân bằng nhưng chủ yếu liên thông; chúng không chứng minh recommendation performance hoặc sampler superiority.

Validation giữ 81,871/373,776 = 21.90% warm target và test giữ 40,587/413,413 = 9.82%. Mọi exclusion đối soát chính xác vào chỉ unseen user, chỉ unseen item hoặc cả hai. Test retention thấp giới hạn headline estimand tương lai vào pure-ID warm-start cohort hẹp; đây không phải evidence model yếu. Trong bounded traversal, 100 target đi qua catalog 162,125 item với 16,212,500 comparison, đếm 16,209,544 eligible candidate và pass cả chunked-count lẫn target-not-in-prior-history invariant. Measurement 1.098 giây và 158.24 MiB peak RSS chỉ mô tả traversal này.

Protocol chi tiết và quy tắc diễn giải nằm trong [`DATASET_PORTFOLIO_AND_ANALYSIS_PROTOCOL_vn.md`](../00_project/DATASET_PORTFOLIO_AND_ANALYSIS_PROTOCOL_vn.md). Machine-readable mirror được lưu tại [`Baby_Products_protocol_audit.json`](../06_code/results/Baby_Products_protocol_audit.json), [`All_Beauty_protocol_audit.json`](../06_code/results/All_Beauty_protocol_audit.json), [`Home_and_Kitchen_raw_audit.json`](../06_code/results/Home_and_Kitchen_raw_audit.json) và [`dataset_portfolio_audit_index.json`](../06_code/results/dataset_portfolio_audit_index.json).

### 7.1.5 Các bước G2 còn lại và cách diễn giải evidence

| Bước | Sẽ làm gì | Tại sao cần làm | Chỉ số và ý nghĩa | Điều kiện hoàn thành |
|---|---|---|---|---|
| G2-A — hoàn chỉnh provenance | Thêm định danh release/page chính thức, retrieval timestamp, raw Drive file ID, byte size, SHA-256, schema, access/usage note, audit configuration và exact code commit vào một immutable manifest | Nhà nghiên cứu khác phải xác định được cùng bytes và đúng chương trình đã tạo mọi derived count | Checksum trùng xác lập byte identity; manifest đầy đủ xác lập traceability. Cả hai không tự chứng minh semantic validity | Mọi required field không còn `UNKNOWN`, hai raw Drive object khớp size/hash và manifest được read-back thành công |
| G2-B1 — policy cho anomaly và duplicate | Quarantine một Baby row `0.0`; ghi nhận zero repeated pair quan sát được; giữ fallback earliest-timestamp/stable-row deterministic cho repeated pair tương lai | Invalid hoặc repeated event có thể đổi positive count và temporal ordering; rule phải có trước modeling | Removed-row count/rate đo mức ảnh hưởng; affected-user/item count cho biết anomaly ít row có tác động rộng lên cohort không | Rule, count và rationale được đăng ký trước graph construction |
| G2-B2 — chọn interaction semantics | Tạo descriptive snapshot P4, P5 và all-observed mà không train model; so retained scale, activity coverage và temporal warm-start feasibility | Rating là explicit feedback. Chuyển chúng thành implicit positive làm thay đổi research task và không được chọn theo test performance | Event retention, retained user/item, degree quantile, singleton rate, time coverage, warm-start target retention và eligible catalog size thể hiện hệ quả semantic và feasibility | Chọn một primary policy từ domain meaning cộng pre-model feasibility; pre-register tối đa một sensitivity policy |
| G2-B3 — đăng ký negative | Định nghĩa training item universe và known positive nào bị loại tại mỗi training time; định nghĩa cách xử lý later positive và evaluation candidate | Xem future hoặc observed positive là negative tạo label contamination và có thể đổi thứ hạng model | Eligible-negative count trên mỗi user, zero-negative user rate, candidate catalog size và collision/contamination check cho biết rule có chạy được và chống leakage không | Negative rule deterministic pass toy check và được freeze trước baseline training |
| G2-C1 — freeze temporal cutoff và tie | Chọn chronological cutoff theo rule đã khai báo, chạy exact Baby timestamp-tie audit và gán mọi event tại tied cutoff về một phía theo cách deterministic | Temporal evaluation phải mô phỏng học từ quá khứ để dự đoán event về sau mà không tạo boundary leakage tùy ý | Row/user/item theo period, duration, cutoff-tie count và activity drift định lượng temporal coverage cùng population change | Cutoff và tie rule được pre-register; chạy lại tạo partition giống hệt |
| G2-C2 — chỉ xây từ training | Áp dụng semantic selection và iterative activity filter nếu có chỉ trên training positive; sau đó freeze ID mapping, degree, normalization, popularity và sampler statistic | Global hoặc post-split filtering có thể làm rò future activity vào graph và khiến task dễ hơn | Training node/edge, filter iteration, attrition theo lý do, degree quantile, density, component và head–tail share mô tả graph thật model nhìn thấy | Không có validation/test information đóng góp vào graph construction hoặc derived feature, và attrition ledger đối soát đầy đủ |
| G2-C3 — định nghĩa warm-start cohort | Project validation/test target vào frozen training user/item universe và report mọi exclusion; tách cold-start khỏi primary pure-ID claim | Pure-ID recommender không score được unseen ID, nhưng âm thầm bỏ chúng làm thay đổi estimand | User/item OOV rate, target warm-start retention, user có evaluable target và exclusion theo lý do định nghĩa coverage của primary claim | Retained cộng excluded count đối soát với mọi candidate target, và wording của claim nêu đúng retained cohort |
| G2-C4 — exact candidate | Xếp hạng mỗi target trên full eligible training-item universe sau khi loại item đã observed trước đó theo time rule đã đăng ký | Sampled-candidate evaluation có thể thay đổi relative model ranking và thổi phồng performance | Eligible catalog size, candidate trên mỗi target, removed-history count, target-presence check và evaluator chunk count định nghĩa exact ranking task | Candidate construction pass invariant và giống nhau cho mọi method về sau |
| G2-D — bounded feasibility | Chạy một pipeline/evaluator dry-run không tạo headline result, đã pre-register, trên retained graph hoặc bounded subset được khai báo với setting cố định | Bước này kiểm tra data construction và exact evaluation có thực thi được trong environment đã ghi trước các research run tốn kém | Wall time, peak CPU/GPU memory, throughput, graph size, evaluated user/target, candidate comparison và failure status chỉ mô tả resource envelope đã test | Path hoàn thành tái lập được hoặc tạo scope/compute decision có record; không tune, so sánh sampler hoặc claim performance |

Thứ tự này có chủ đích. G2-A cố định *đã phân tích cái gì*; G2-B cố định *interaction và negative có nghĩa gì*; G2-C cố định *model được phép biết và đánh giá ai/cái gì*; G2-D kiểm tra *task đã freeze có chạy được không*. Bước sau không thể sửa ambiguity của bước trước. Cách diễn giải executable và hướng dẫn chạy nằm trong [`G2C_TEMPORAL_GRAPH_vn.md`](../06_code/docs/G2C_TEMPORAL_GRAPH_vn.md).

### 7.2 Chuẩn bị chống leakage

Path Baby đã execute validate schema và duplicate, áp P4, dùng frozen global chronological cutoff, áp minimum training degree `1` chỉ trên training positive, freeze lexicographic training mapping, project validation/test vào universe đó và ghi degree/component cùng exact-candidate statistic. Cutoff được chấp nhận là `t1 = 1628643414042`, `t2 = 1658002729837` với strict half-open interval. Provider processing, project semantics, project split và project warm-start filtering vẫn được ghi như các transformation tách biệt.

### 7.3 Baseline và comparison

Planned comparison family gồm MostPop, BPR matrix factorization, full-graph LightGCN, random sampling, degree-aware sampling và GRAPES-informed learned reference variant. Baseline set cuối cùng và project-developed method phải được freeze từ evidence record trước final experiment. Mọi learned variant sẽ được so với matched non-learned sampling, không so với implementation có điều kiện khác nhau.

### 7.4 Metric và thống kê

Primary quality là exact full-catalog NDCG@20; Recall@20 là secondary. Resource measurement dự kiến gồm peak GPU/CPU memory, epoch time, time to best validation score, throughput, sampler và propagation time, sampled nodes/edges, policy diagnostic và failure. Seed structure dự kiến là một smoke seed, ba development seed và năm paired final seed nếu capacity đo được cho phép. Final report nên có mean, standard deviation, effect size, confidence interval và giải thích failed run. Đây là plan, chưa phải measurement.

### 7.5 Ablation

Registered ablation bao phủ layer-wise budget `k`, recommendation depth, sampler input, reward coefficient và stabilization, update frequency, frozen so với active sampler training, degree cohort, full-graph so với sampled training, sampled-local so với full-graph normalization và retention so với transient masking của current positive edge.

## 8. Kế hoạch verification và reproducibility

Semantic decision D1–D11 được ghi trong GRAPES-informed reference specification. Expected behavior T01–T25 đã đăng ký như executable reference acceptance criteria. 13 pure-Python test đã pass và full Baby manifest độc lập đối soát các graph/OOV/candidate invariant tương ứng. Các evidence này vẫn không validate PyTorch/PyG implementation tương lai hoặc recommender result.

Model-training deliverable được dự kiến là modular Python package có CPU toy-graph path, deterministic configuration và seed handling, truy vết D-ID tới module tới T-ID, data/checksum manifest interface, logging và checkpoint contract, paired human-readable documentation và thin Colab launcher. Theo yêu cầu trực tiếp của người dùng, dataset-audit notebook là ngoại lệ có phạm vi: notebook nhúng toàn bộ standard-library audit implementation để portfolio audit chạy từ một file Colab mà không cần Drive script riêng.

Portfolio-audit utility đã execute trên các governed artifact. Một notebook standard-library/SQLite self-contained thứ hai nay implement path Baby G2-C/G2-D và ghi deterministic mapping, edge, warm target, artifact hash, graph/OOV statistic cùng bounded traversal measurement. Hiện mới toy fixture của path này đã execute; full-data statistic và feasibility measurement vẫn mở.

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
| Reference verification candidate T01–T25 | `PARTIAL TOY EXECUTION` | Các reference check trước cùng G2-C toy path pass; final verification plan vẫn mở |
| Report và slide working content | `CUMULATIVE DRAFT` | Living report và defense deck này |
| Python/Colab source | `G2-C FULL EXECUTION; G2-D BOUNDED EXECUTION` | 13/13 local test pass; full Baby artifact đã readback; chưa có model benchmark |
| Amazon data | `BABY G2-A/G2-B/G2-C PASS; G2 IN_PROGRESS` | Cutoff, graph, mapping, warm/OOV ledger và candidate rule đã freeze; G2-D chỉ chờ exact environment fingerprint |
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
