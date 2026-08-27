# Phát triển phương pháp lấy mẫu đồ thị cho hệ thống gợi ý quy mô lớn sử dụng mạng nơ-ron đồ thị GNN

> **Trạng thái:** `LUẬN VĂN BẢN LÀM VIỆC TÍCH LŨY — PHÁT TRIỂN PHƯƠNG PHÁP, DATA AUDIT VÀ KẾ HOẠCH NGHIÊN CỨU`  
> **Cập nhật lần cuối:** 2026-08-26  
> **Định danh Phase 2:** Luận văn Thạc sĩ độc lập; GRAPES là tài liệu khoa học tham khảo, không phải phương pháp luận văn đã cố định  
> **Ranh giới evidence:** Đã có toy scaffold không dependency và mười local contract test; temporary raw Amazon audit đã execute, nhưng chưa có persistent finalized dataset artifact, PyTorch/PyG implementation Phase 2, full oracle suite, benchmark hoặc recommendation result.

Đây là thesis report bản làm việc tiếng Việt. Đây là living artifact: evidence đã được xác minh về implementation, execution và validation sẽ thay các statement dạng kế hoạch khi nghiên cứu tiến triển. Bản tiếng Anh tương ứng là [`THESIS_REPORT_en.md`](./THESIS_REPORT_en.md).

## 1. Tóm tắt điều hành

Graph neural network trên đồ thị lớn có thể cần thông tin từ vùng lân cận nhiều hop ngày càng lớn. Luận văn phát triển và đánh giá một phương pháp lấy mẫu đồ thị cho hệ gợi ý quy mô lớn dùng GNN trên user–item graph. Phase 1 nghiên cứu GRAPES, một phương pháp learned sampling có sẵn cho node classification; nó chỉ cung cấp historical context và candidate mechanism.

GRAPES-informed reference design hiện tại khảo sát sampler GNN, Gumbel Top-k và policy-learning objective cùng recommender kiểu LightGCN và Bayesian Personalized Ranking (BPR). Đây là candidate component—không mặc định là phương pháp cuối. Phương pháp cuối sẽ được xác định thông qua literature positioning, method rationale, data/protocol constraint, controlled comparison và ablation. Một scaffold không dependency hiện test một phần reference contract trên toy input; chưa có phương pháp Phase 2 cuối nào được implementation hoặc test.

Trạng thái project hiện tạo nền tảng nghiên cứu có kiểm soát chứ chưa phải empirical result: primary source đã pin, literature matrix ban đầu và GRAPES-informed reference design đã ghi, toy scaffold tồn tại và raw dataset audit đã execute. Final method definition, persistent data protocol, environment lock, model implementation và performance evaluation vẫn mở.

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

### 7.1.1 Trạng thái dataset audit ban đầu

Audit local ngày 2026-08-26 không tìm thấy Amazon raw artifact trong `Do An` hoặc vùng tham khảo Phase 1. Tài liệu chính thức Amazon Reviews'23 xác định schema pure-ID 0-core rating-only là `user_id`, `parent_asin`, `rating` và `timestamp`, đồng thời công bố rounded pre-split count khoảng 632.0K user / 112.6K item / 693.9K rating cho `All_Beauty` và 3.4M / 217.7K / 6.0M cho `Baby_Products`. Đây là provider-published metadata, không phải project-derived result.

Project đã thêm streaming audit script bằng standard library và paired Colab notebook. Audit ghi exact source URL, acquisition state, compressed file size, SHA-256, schema, invalid row, duplicate user–item pair, rating distribution, timestamp range/tie, degree statistic, candidate absolute-split coverage, warm-start out-of-vocabulary count và negative-pool diagnostic. Official processing README nói repeated user–item review được de-duplicate bằng cách giữ review sớm nhất; behavior này phải được verify trên downloaded bytes thay vì giả định.

Official absolute split với `t1 = 1628643414042` và `t2 = 1658002729837` milliseconds được giữ làm candidate reference. Split, item-key handling, rule chuyển rating thành implicit-positive, warm-start filtering và negative eligibility vẫn mở cho đến khi raw audit được execute. Không được dùng blind official leave-last-out vì singleton handling được document có thể để user/item nằm ngoài training universe.

### 7.1.2 Kết quả audit do project tạo ra

Raw audit đã được execute thành công cho hai artifact trong scope. `All_Beauty` có 693,929 valid row, 631,986 user và 112,565 item; exact duplicate-pair count bằng zero. `Baby_Products` có 5,953,891 valid parsed row, 3,386,206 user và 217,654 item; một row có rating `0.0`, ngoài expected range 1–5, và exact duplicate-pair count vẫn mở vì SQLite scan quy mô lớn chưa hoàn thành. Cả hai artifact không có missing hoặc parse-invalid field.

Cả hai category đều rất sparse và bị chi phối bởi user singleton: 93.22% user của `All_Beauty` và 70.01% user của `Baby_Products` chỉ có một observed row. Candidate absolute split do provider công bố tạo OOV cao so với training partition. Với `All_Beauty`, validation/test OOV user là 63,008/34,851; với `Baby_Products` là 301,130/318,972. Đây là protocol finding, không phải model result: published absolute split chưa thể dùng trực tiếp làm primary warm-start split hiện tại nếu chưa có protocol decision rõ.

Bảng đầy đủ, checksum, rating distribution, degree summary, split diagnostic và negative-pool diagnostic được ghi trong [`DATASET_AUDIT_RESULTS_vn.md`](../06_code/docs/DATASET_AUDIT_RESULTS_vn.md) và bản tiếng Anh tương ứng. `All_Beauty` chỉ còn vai trò development/diagnostic, còn `Baby_Products` vẫn là primary candidate nhưng chưa finalized. Rating-to-implicit-positive rule, duplicate handling, cold-start treatment và negative eligibility vẫn mở.

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

Dataset-audit utility hiện được implement như pre-model gate dạng streaming, dependency-free. Utility đã được check trên toy CSV fixture của project và execute trên temporary raw artifact `All_Beauty` và `Baby_Products`. Evidence kết quả được ghi riêng; persistent Colab acquisition, protocol closure và post-filter training-universe statistics vẫn mở.

Exact Python/PyTorch/PyG/CUDA lock và final GPU class chưa biết. Colab sẵn sàng cho development và smoke run, nhưng temporary Colab hardware không phải nền tảng profiling comparable cuối cùng.

## 9. Rủi ro và giới hạn hiện tại

- Positive edge `(u, i+)` có thể tạo shortcut trong sampled recommendation; retention/masking comparison đã preregister nhưng chưa chạy.
- Negative sample khác nhau có thể tạo sampler advantage giả; cần matched negative/RNG control.
- GFlowNet likelihood và normalizer semantic cần test implementation tường minh.
- Learned sampler có thể cải thiện ranking nhưng tăng memory/runtime; phải report cả hai phía của trade-off.
- Exact Phase 1 commit provenance không có, làm giới hạn attribution của historical reproduction result.
- Persistent Amazon artifact acquisition, license/access note, protocol decision và post-filter training-universe scale chưa khóa; temporary-run checksum và pre-filter diagnostic đã được ghi.
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
| Amazon data | `RAW AUDIT EXECUTED / G2 OPEN` | Đã checksum temporary run và ghi derived result; persistent acquisition và protocol closure vẫn mở |
| Environment/GPU | `OPEN` | Colab available; final lock chưa xác nhận |
| Recommendation result | `NOT STARTED` | Chưa có NDCG, Recall, runtime, memory hoặc scalability result |

Gate tiếp theo là executable environment và data/provenance package, sau đó là toy correctness test. Không bắt đầu learned-policy experiment khi semantic hoặc data-leakage control còn mơ hồ.

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
