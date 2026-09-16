# Bản thảo luận văn

## Tóm tắt

Luận văn nghiên cứu ảnh hưởng của graph sampling đối với recommendation dựa trên LightGCN. Trên cùng temporal user–item graph, mô hình, sampling budget, số bước huấn luyện, negative draw, seed, evaluator và phần cứng, ba sampler được so sánh: M0 chọn đều, M1 ưu tiên node có training degree lớn và M2 ưu tiên node nối tốt vào frontier hiện tại sau khi giảm lợi thế của hub. Dữ liệu chính là Amazon Reviews’23 Baby Products với 5.953.891 rating raw. Sau khi quarantine một rating ngoài miền, giữ rating 4–5 và áp dụng temporal warm-start protocol, training graph có 3.868.654 cạnh, 2.318.308 user và 162.125 item. Graph rất thưa và mất cân bằng: 71,76% user chỉ có một interaction; item-degree Gini bằng 0,8584; top 1% item giữ 44,09% training interaction.

Chất lượng được đánh giá bằng exact full-catalog NDCG@20 và Recall@20. Catalog coverage, exposure và recall theo popularity cohort giải thích phân bổ recommendation. Training wall time và peak GPU memory đại diện cho chi phí. Qua ba validation seed, M1 có mean NDCG@20 cao nhất nhưng không thắng M0 ở mọi seed. M2 thấp hơn M1 về NDCG và Recall trong cả ba seed, đồng thời chậm hơn ở hai repeat mới. M2 vẫn làm thay đổi sampled graph và rank của nhiều target, nhưng thay đổi đó không tạo top-20 gain ổn định; tail hit vẫn bằng 0. Kết quả không ủng hộ giả thuyết M2 tạo trade-off chất lượng–chi phí tốt hơn degree-aware control dưới protocol đã đăng ký. Đây là negative result có giới hạn, không phải bằng chứng chống lại mọi frontier-conditioned sampler.

## Chương 1. Vấn đề nghiên cứu

### 1.1 Bối cảnh

Graph neural networks biểu diễn recommendation như một đồ thị hai phía. User và item là node, interaction là edge. LightGCN lan truyền embedding qua các cạnh để học collaborative signal từ nhiều bậc lân cận.

Khi graph lớn, huấn luyện trên toàn bộ adjacency có thể tốn bộ nhớ. Sampling tạo một computation graph nhỏ hơn cho mỗi batch. Tuy nhiên sampler không chỉ thay đổi chi phí; nó còn quyết định signal nào được đưa vào quá trình học. Nếu sampler luôn chọn node phổ biến, mô hình có thể nhận nhiều tín hiệu ổn định nhưng tiếp tục bỏ qua long-tail. Nếu sampler cố tình chọn nhiều node hiếm, computation graph có thể đa dạng hơn nhưng chưa chắc liên quan đến target của batch.

### 1.2 Câu hỏi nghiên cứu

> Ở cùng dataset, LightGCN backbone, layer budget, số bước huấn luyện, seed, exact evaluator và GPU, sampler có điều kiện theo frontier có tạo được trade-off tốt hơn giữa NDCG@20 và chi phí tính toán so với uniform và degree-aware sampling hay không?

“Trade-off tốt hơn” không đồng nghĩa chỉ có NDCG cao hơn. Phương pháp phải được đọc đồng thời theo chất lượng, coverage, phân bổ cohort, thời gian và bộ nhớ.

### 1.3 Phạm vi

Luận văn tập trung vào warm-start implicit ranking trên pure-ID bipartite graph. Không nghiên cứu rating prediction, content-based recommendation, cold-start, knowledge graph hoặc online serving. Kết quả hiện tại là validation-only trên một dataset và một smoke budget.

### 1.4 Đóng góp

Các đóng góp có thể bảo vệ gồm:

1. một temporal, leakage-safe, exact full-catalog protocol cho Amazon Baby Products;
2. phân tích đầy đủ về sparsity, imbalance, long-tail và warm-start retention;
3. so sánh matched giữa uniform, degree-aware và frontier-normalized sampling;
4. bằng chứng cơ chế cho negative result của M2;
5. phân biệt rõ ranking accuracy, catalog breadth, popularity exposure và semantic diversity.

Luận văn không claim sampler học được đầu tiên, không claim phương pháp tốt nhất nói chung và không claim semantic diversity từ dữ liệu pure-ID.

## Chương 2. Benchmark và khoảng trống

### 2.1 Các dataset recommendation ngoài Amazon

MovieLens là benchmark lâu đời cho collaborative filtering. Bản 25M có 25.000.095 rating, 162.541 user và 62.423 phim, đồng thời có tag và tag-genome relevance. Đây là lựa chọn tốt để nghiên cứu metadata và semantic diversity. Tuy nhiên user đã có ít nhất 20 rating, nên phân phối không còn giống graph có rất nhiều user singleton.

Gowalla và Yelp2018 được dùng trong nghiên cứu LightGCN. Bản LightGCN có 1.027.370 interaction cho Gowalla và 1.561.406 cho Yelp2018. Chúng là benchmark gần nhất nếu cần kiểm tra graph collaborative filtering ngoài Amazon. Dù vậy, các bản đã xử lý dùng filtering và random split, khác temporal protocol của luận văn.

MIND cung cấp click/impression log của khoảng một triệu user và hơn 160.000 bài báo có nội dung văn bản. KuaiRec cung cấp ma trận user–video gần fully observed, thích hợp để nghiên cứu exposure bias. Hai dataset này có giá trị nhưng trả lời các câu hỏi khác với sparse product graph sampling.

Nguồn chính gồm [MovieLens 25M](https://grouplens.org/datasets/movielens/25m/), [LightGCN](https://hexiangnan.github.io/papers/sigir20-LightGCN.pdf), [MIND](https://aclanthology.org/2020.acl-main.331/) và [KuaiRec](https://arxiv.org/abs/2202.10842).

### 2.2 Khoảng trống được kiểm tra

Nhiều nghiên cứu graph recommendation báo Recall/NDCG trên các graph đã xử lý. Ít hơn các nghiên cứu trình bày đồng thời raw-data provenance, temporal leakage control, exact full-catalog ranking, computation-graph diagnostics và resource cost khi chỉ thay sampler. Luận văn không cố giải quyết toàn bộ khoảng trống của recommender systems; nó kiểm tra một câu hỏi hẹp về ảnh hưởng của sampler dưới matched control.

### 2.3 Vai trò của GRAPES

GRAPES cung cấp nền tảng về task-conditioned graph sampling và các ý tưởng kiểm tra policy. Trong luận văn này, GRAPES là nguồn tham khảo, không phải phương pháp được chuyển nguyên sang recommendation. Sau M0 và M1, dự án chọn một heuristic M2 đơn giản để kiểm tra frontier conditioning mà không mở thêm RL hoặc GFlowNet branch sau khi đã nhìn validation result.

## Chương 3. Dữ liệu

### 3.1 Vì sao chọn Baby Products

Ba tập Amazon Reviews’23 được kiểm toán:

| Dataset | Raw rows | Vai trò |
|---|---:|---|
| All Beauty | 693.929 | Pipeline control |
| Baby Products | 5.953.891 | Primary dataset |
| Home and Kitchen | 66.623.880 | Raw scale reference |

All Beauty nhỏ hơn nhiều và P4 warm-start retention thấp. Home and Kitchen lớn gấp khoảng 11,19 lần Baby theo số dòng nhưng chưa có full protocol hoặc paired experiment. Baby cho một điểm cân bằng giữa quy mô, long-tail và khả năng thực thi trên Tesla T4. Dataset được chọn trước khi xem model result.

### 3.2 Nguồn và schema

Artifact chính là Amazon Reviews’23 `Baby_Products.csv.gz`, bản 0-core rating-only do McAuley Lab công bố. File nén có 148.609.233 byte và SHA-256:

```text
e2a8d0498afed767ee2615db7fac549559d82490b1a73c7241b84b5e9e8c279e
```

Schema gồm `user_id`, `parent_asin`, `rating` và `timestamp`. `parent_asin` là item key. Không có title, category, description hoặc image.

### 3.3 Chất lượng và nhiễu

Raw audit ghi nhận 5.953.891 dòng, 3.386.206 user và 217.654 item. Có một rating `0.0` ngoài miền 1–5; dòng này bị quarantine. Không có missing ID, invalid timestamp hoặc duplicate user-item row.

Mức lỗi cấu trúc quan sát được thấp. Tuy nhiên rating vẫn là feedback có selection bias. Luận văn không dùng quy tắc loại outlier tùy ý và không giả định mọi non-observed pair là dislike thật.

### 3.4 Positive policy

P4 định nghĩa positive interaction là rating 4 hoặc 5. P4 giữ 4.655.843 row, bằng 78,20% raw data. Rating 1–3 không tạo positive edge. Nghiên cứu giải bài toán implicit top-N ranking, không dự đoán rating.

### 3.5 Temporal split và chống leakage

Interaction được chia theo timestamp: train `< t1`, validation `[t1,t2)` và test `>= t2`. Mapping, degree, cohort và training graph chỉ dùng train. Validation/test target được chiếu vào mapping đã khóa. User hoặc item chưa xuất hiện trong train được ghi vào OOV ledger và loại khỏi warm-start population.

Với mỗi target, candidate là toàn bộ 162.125 training item trừ positive history quan sát trước target. Exact full-catalog evaluator không thay candidate bằng một negative sample nhỏ. Cách làm này giảm sai lệch metric do sampled evaluation và ngăn future information ảnh hưởng graph construction.

### 3.6 Population

| Split | Candidate rows | Warm rows | Retention |
|---|---:|---:|---:|
| Validation | 373.776 | 81.871 | 21,90% |
| Test | 413.413 | 40.587 | 9,82% |

Test target chưa được đọc trong quá trình chọn M0–M2. Kết luận hiện tại chỉ áp dụng cho 81.871 warm validation target.

### 3.7 Training graph và phân phối

Training graph có 3.868.654 edge, 2.318.308 user và 162.125 item; density bằng `1,0293 × 10^-5`.

- User degree p50/p90/p99: 1/3/9.
- Item degree p50/p90/p99: 3/32/397.
- User singleton: 71,76%.
- Item singleton: 33,35%.
- Item-degree Gini: 0,8584.
- Top 1/5/10/20% item giữ 44,09/71,12/81,33/89,65% interaction.

Degree histogram theo log scale cho thấy phần lớn node có rất ít interaction trong khi một nhóm nhỏ có degree rất lớn. Cumulative share cho biết model có thể đạt score tổng bằng cách tiếp tục khai thác head. Vì vậy aggregate metric phải đi cùng cohort analysis.

### 3.8 Cohort

Popularity cohort được khóa từ training degree trước model result. Tie-aware boundaries tạo ba nhóm:

- head: khoảng 1% item, 44,16% training edge;
- body: 18,92% item, 45,45% edge;
- tail: 80,07% item, 10,39% edge.

Exposure theo cohort đo nơi recommendation slot được phân bổ. Hit/Recall theo cohort đo sự liên quan. Hai khái niệm không được dùng thay nhau.

## Chương 4. Phương pháp

### 4.1 Hệ thống cố định

Ba sampler dùng cùng LightGCN-style recommender, BPR objective, embedding dimension, ba propagation layer, batch 65.536, layer budget `[65.536, 65.536, 65.536]`, 5 epoch, 300 optimizer step, negative draw, normalization, validation evaluator và Tesla T4. Trong từng paired seed, embedding initialization, pair order và negative draw được fingerprint để xác nhận ghép cặp.

### 4.2 M0: uniform sampling

M0 chọn đúng `k` candidate node ở mỗi layer, không hoàn lại, với trọng số bằng nhau. M0 là matched control không dùng popularity hoặc frontier signal.

### 4.3 M1: degree-aware sampling

M1 dùng:

```text
priority(v) = log(training_degree(v)) + Gumbel(v)
```

Node có nhiều training edge được chọn thường xuyên hơn. Đây là static importance control. Nó có thể ưu tiên signal ổn định nhưng cũng có nguy cơ củng cố popularity concentration.

### 4.4 M2: frontier-normalized sampling

M2 dùng:

```text
priority_l(v) = log(frontier_support_l(v))
                - 0,5 × log(training_degree(v))
                + Gumbel(v)
```

`frontier_support_l(v)` là số training edge nối candidate `v` vào frontier từ layer trước. Tử số giữ local relevance cho batch; degree penalty giảm lợi thế của hub. M2 được khóa sau khi phân tích M0/M1 và không thay đổi trong paired repeats.

M2 không phải learned sampler. Không có policy network, reward learning hoặc RL update.

## Chương 5. Đánh giá

### 5.1 NDCG@20

NDCG@20 là metric chính vì thứ tự có ý nghĩa. Với một target mỗi dòng, điểm của hit ở rank `r <= 20` là `1/log2(r+1)`; miss có điểm 0. Metric trung bình ưu tiên target xuất hiện sớm.

### 5.2 Recall@20

Recall@20 cho biết target có nằm trong top 20. Với một target mỗi dòng, recall là hit rate trên population đánh giá. Metric dễ hiểu nhưng không phân biệt rank 1 và rank 20, nên không thay NDCG.

### 5.3 Catalog Coverage@20

Coverage là số unique item xuất hiện trong tất cả top-20 list chia cho 162.125 training item. Nó phát hiện collapse vào một catalog rất nhỏ. Coverage không đo item similarity, semantic diversity hoặc relevance.

### 5.4 Cohort và exposure

Recommendation exposure share đo tỷ lệ top-20 slot thuộc head/body/tail. Target-cohort Recall/NDCG và hit count đo model có tìm đúng target của từng nhóm hay không. Tail exposure khác 0 cùng tail hit bằng 0 có nghĩa sampler đã đưa tail item vào danh sách nhưng chưa xếp đúng target tail.

### 5.5 Resource

Training wall time gồm sampling và propagation/update trong boundary đã ghi. Peak GPU memory được reset theo phase. M1/M2 resource so sánh trong cùng seed/runtime; s0 giữ làm context vì runner sau có thêm instrumentation. Chênh lệch khoảng 4 MiB không được diễn giải là khác biệt thực chất.

### 5.6 Uncertainty

Ba validation seed được báo bằng từng seed, mean và sample standard deviation. Ba seed không đủ để claim significance. Dấu của M2 trừ M1 qua seed được dùng như bằng chứng lặp lại có giới hạn.

## Chương 6. Kết quả

### 6.1 Sanity baselines

| Model | NDCG@20 | Recall@20 | Coverage@20 | Hit pattern |
|---|---:|---:|---:|---|
| MostPop | 0,005873 | 0,014596 | 0,000154 | 1.195 hit; body/tail bằng 0 |
| BPR-MF | 0,004054 | 0,010419 | 0,033517 | 23 body hit; tail bằng 0 |
| Full LightGCN | 0,004931 | 0,012373 | 0,006365 | 1 body hit; tail bằng 0 |

MostPop chỉ recommend 25 item và 100% exposure ở head. BPR-MF mở rộng catalog lên 5.434 item nhưng aggregate accuracy thấp hơn. Full LightGCN lấy lại quality so với BPR-MF nhưng exposure trở lại 99,36% head. Baseline cho thấy accuracy, coverage và long-tail relevance là ba câu hỏi khác nhau.

### 6.2 Smoke seed s0

| Phương pháp | NDCG@20 | Recall@20 | Coverage@20 | Wall time | Peak GPU |
|---|---:|---:|---:|---:|---:|
| M0 | 0,005727 | 0,014657 | **0,018486** | 705,32 s | 3.482,90 MiB |
| M1 | **0,006153** | **0,015989** | 0,017783 | 795,11 s | 2.665,10 MiB |
| M2 | 0,005921 | 0,015317 | 0,017863 | 868,63 s | 2.669,06 MiB |

M0 có coverage cao nhất. M1 tăng 109 hit so với M0, nhưng toàn bộ gain thuộc head; body giữ 25 hit và tail bằng 0. M2 thấp hơn M1 55 head hit, body và tail không đổi.

M1 chuyển item-context từ 60,52% tail ở M0 xuống 31,48% và tăng body lên 68,29%. M2 chỉ giữ 290.606 item-context slot và 68,60% số đó thuộc tail. Tuy vậy tail hit vẫn bằng 0. M2 có ít directed block entry hơn M1 11,97% nhưng sampler chậm hơn 45,14 giây do frontier-support computation.

### 6.3 Paired validation

| Phương pháp | NDCG@20 mean ± SD | Recall@20 mean ± SD | Coverage@20 mean ± SD |
|---|---:|---:|---:|
| M0 | 0,00570640 ± 0,00007324 | 0,01486892 ± 0,00048771 | **0,01813210 ± 0,00031820** |
| M1 | **0,00586598 ± 0,00024947** | **0,01529642 ± 0,00062009** | 0,01753380 ± 0,00062722 |
| M2 | 0,00572092 ± 0,00017933 | 0,01487299 ± 0,00057942 | 0,01751324 ± 0,00031838 |

M2 trừ M1 âm về NDCG và Recall ở s0, s1 và s2. Theo mean, M2 thấp hơn M1 2,47% NDCG và 2,77% Recall. Trong hai repeat mới, M2 chậm hơn M1 trung bình 114,88 giây, tương đương 14,36%; peak GPU trung bình chỉ khác khoảng 4,11 MiB.

M2 tạo 191 gained hit và 238 lost hit so với M1 ở s1; ở s2 là 242 và 244. Vì vậy M2 đã thay đổi ranking. Negative result xuất hiện vì gained hit không bù được lost hit trong top 20, không phải vì hai sampler cho output giống nhau.

Tail hit bằng 0 cho M0, M1 và M2 ở cả ba seed. Body hit của M2 không vượt M1 ở seed nào.

## Chương 7. Thảo luận

### 7.1 Vì sao M2 không đạt mục tiêu

M2 giải quyết một vấn đề cấu trúc: nó tránh để global degree quyết định toàn bộ proposal và đưa item-context về phía tail. Nhưng sparse graph không đảm bảo một tail node nối vào frontier mang signal đủ mạnh để xếp đúng target. Degree penalty cũng có thể loại bớt các hub đang truyền collaborative signal hữu ích. Cuối cùng, frontier support phải được tính lại, làm tăng CPU sampler cost.

Kết quả cho thấy thay đổi phân phối sampled node là điều kiện chưa đủ. Sampler cần tạo context có ích cho objective ranking, không chỉ context ít phổ biến hơn.

### 7.2 Accuracy, coverage và diversity

MostPop có accuracy tương đối tốt nhưng catalog collapse. BPR-MF có coverage rộng nhất trong baseline nhưng accuracy thấp. M0 có coverage cao hơn M1/M2, trong khi M1 có mean quality cao nhất. Không có một metric đơn lẻ mô tả đầy đủ hệ thống.

Catalog coverage và cohort exposure là structural diversity diagnostics. Semantic diversity cần item representation hoặc taxonomy. Luận văn không dùng từ “đa dạng” nếu không chỉ rõ đang nói về catalog breadth, popularity distribution hay semantic distance.

### 7.3 Ý nghĩa của negative result

M2 là một giả thuyết hợp lý từ phân tích M1: degree-aware sampling tăng quality nhưng không cải thiện body/tail hit. Thử frontier-normalized sampling kiểm tra liệu local relevance cùng hub penalty có cải thiện trade-off hay không. Kết quả lặp lại qua seed cho câu trả lời âm. Giữ kết quả này tránh mở liên tiếp sampler mới sau khi nhìn score và cung cấp một failure mechanism có thể kiểm chứng.

## Chương 8. Giới hạn

- Một dataset chính, một sampling budget và ba validation seed.
- Không có test result.
- Không có dataset ngoài Amazon.
- Không có metadata để đo semantic relevance/diversity.
- Warm-start population nhỏ hơn nhiều so với temporal candidate population.
- Resource evidence trên Tesla T4 và runner cụ thể; không suy ra deployment scalability.
- M2 là một công thức frontier-conditioned cố định; kết quả không bác bỏ mọi adaptive hoặc learned sampler.

## Chương 9. Kết luận và hướng tiếp theo

Trong protocol hiện tại, M2 không cải thiện trade-off chất lượng–chi phí so với M1. M1 có mean validation quality cao nhất nhưng không thắng M0 ở mọi seed, và cả ba sampler đều thất bại với tail target ở top 20. Kết quả nhấn mạnh rằng computation-graph diversity không tự động tạo recommendation relevance.

Không mở thêm sampler sau khi đã quan sát validation result. Một thí nghiệm tiếp theo chỉ hợp lệ khi có mục tiêu mới được đăng ký trước:

1. final test cho quyết định đã khóa;
2. Yelp2018 hoặc Gowalla để kiểm tra graph-sampling generalization ngoài Amazon;
3. MovieLens hoặc metadata-rich dataset để nghiên cứu semantic diversity;
4. Home and Kitchen bounded stress test để hỗ trợ một claim scale cụ thể.

Mỗi hướng tạo một câu hỏi khác nhau và không được gộp chỉ để tăng số lượng thí nghiệm.
