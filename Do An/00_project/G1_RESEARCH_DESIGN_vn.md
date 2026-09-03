# Biên bản quyết định thiết kế nghiên cứu G1

> **Gate:** G1 — lý do thiết kế nghiên cứu  
> **Quyết định:** `PASS`  
> **Ngày quyết định:** 2026-09-03  
> **Ranh giới:** Tài liệu này khóa câu hỏi, họ phương pháp ứng viên, thiết kế so sánh và quy tắc chọn. Nó **không** chọn sampler cuối và không tuyên bố learned sampler có hiệu quả.  
> **Bản tiếng Anh:** [`G1_RESEARCH_DESIGN_en.md`](./G1_RESEARCH_DESIGN_en.md)

## 1. Quyết định tóm tắt

Luận văn sẽ kiểm tra liệu graph sampling có điều kiện theo nhiệm vụ có cải thiện đánh đổi giữa chất lượng xếp hạng và tài nguyên của GNN recommendation trên đồ thị user–item implicit thuần hay không. Biến can thiệp là sampler tạo computation graph; dữ liệu, backbone kiểu LightGCN, BPR batch, mẫu âm, độ sâu lan truyền, ngân sách từng lớp, cơ hội tối ưu, evaluator, seed và phần cứng đều được kiểm soát. Uniform và degree-aware sampling là hai đối chứng matched bắt buộc; full-graph LightGCN là mốc tham chiếu nhưng không được gọi sai là cùng ngân sách. Cơ chế cuối vẫn mở đến khi G3 tạo được đường baseline đáng tin cậy. Chỉ dùng validation để chọn và được phép kết luận **không chọn learned method nào**. Không dùng test để chọn phương pháp.

## 2. Câu hỏi chính và đại lượng cần ước lượng

### Câu hỏi nghiên cứu chính

> Trên bài toán Amazon Baby P4 warm-start đã đóng băng và chống leakage, với cùng ngân sách lấy mẫu theo lớp, sampler có điều kiện theo nhiệm vụ có tạo ra đánh đổi exact full-catalog NDCG@20–tài nguyên tốt hơn uniform và degree-aware sampling dưới cùng recommender kiểu LightGCN hay không?

Đại lượng chính là sai khác ghép cặp khi chỉ thay sampler:

```text
Delta_quality = NDCG@20(ứng viên) - NDCG@20(đối chứng tĩnh tốt nhất)
Delta_memory  = peak GPU memory(ứng viên) - peak GPU memory(đối chứng)
Delta_time    = epoch wall time(ứng viên) - epoch wall time(đối chứng)
```

Quần thể đích là cohort warm-start đã khóa ở G2-C. Kết luận không tự động mở rộng sang cold-start, sampled inference, knowledge graph hoặc quy mô Home and Kitchen.

### Câu hỏi phụ

1. Đánh đổi có thay đổi giữa ngân sách từng lớp nhỏ, vừa và lớn không?
2. Task conditioning có cải thiện xếp hạng cho user/item đuôi mà không che giấu suy giảm ở nhóm head không?
3. Mỗi cơ chế học thêm bao nhiêu sampler time, bộ nhớ, bất ổn và rủi ro thất bại?
4. Cơ chế nào vượt qua so sánh development có kiểm soát để xứng đáng đi tiếp sang G4 và đánh giá cuối?

## 3. Giả thuyết có thể bác bỏ

Đây là giả thuyết đặt trước, không phải kết quả.

- **H1 — chất lượng cùng ngân sách:** ở ít nhất một ngân sách đã khai báo, một ứng viên task-conditioned hợp lệ có `Delta_quality` ghép cặp dương so với đối chứng tĩnh matched tốt nhất.
- **H2 — đánh đổi:** ở ít nhất một ngân sách, ứng viên task-conditioned không bị các đối chứng tĩnh thống trị đồng thời trên validation NDCG@20, peak GPU memory và epoch wall time.
- **H3 — tương tác với ngân sách:** lợi ích chất lượng, nếu có, lớn hơn ở ngân sách chặt so với ngân sách lớn nhất; tương tác budget-by-method vẫn phải báo cáo nếu trái kỳ vọng.
- **H4 — hành vi theo cohort:** cải thiện tổng không che giấu sai khác ghép cặp âm ở cohort tail đã khai báo trước. Kết quả head, middle và tail được báo cáo riêng.
- **H5 — overhead:** learned sampling có sampler overhead khác 0. Chỉ có tăng chất lượng mà thiếu sampler time, propagation time, peak memory, throughput và failed-run rate thì chưa đủ chứng minh trade-off tốt hơn.

Giữ nguyên kết quả null/âm nếu không ứng viên nào cải thiện Pareto set development, nếu lợi ích mất đi dưới paired final seeds, hoặc nếu kiểm tra correctness/stability thất bại.

## 4. Bản đồ closest work và ranh giới claim

| Họ phương pháp | Công trình gốc đại diện | Điều đã được thiết lập | Khác với câu hỏi của luận văn |
|---|---|---|---|
| Lấy mẫu hàng xóm theo node | GraphSAGE | Neighborhood kích thước cố định cho phép mini-batch GNN | Uniform/local sampling là đối chứng, không phải task-conditioned recommendation sampling |
| Importance sampling theo lớp | FastGCN; AS-GCN; LADIES | Proposal toàn cục hoặc phụ thuộc lớp giảm bùng nổ/variance | Chủ yếu node classification; importance không tối ưu cho full-catalog recommendation ranking |
| Lấy mẫu subgraph/cluster | Cluster-GCN; GraphSAINT | Subgraph đặc có thể cải thiện hiệu quả huấn luyện | Thay đổi đơn vị mini-batch và normalization; không phải can thiệp exact-k theo lớp chính ở đây |
| Sampling heuristic cho recommender | PinSage | Random-walk importance và GCN aggregation có thể chạy ở quy mô recommender công nghiệp | Bối cảnh item–board và heuristic khác; không phải kiểm thử LightGCN user–item thuần được matched |
| Learned sampling cho recommendation | DSKReG | Differentiable sampling có thể học chung trong knowledge-graph recommendation | Dùng knowledge graph giàu relation và side information cho cold-start, không phải pure-ID bipartite graph |
| Learned/adaptive GNN sampling | data-driven GraphSAGE; SubMix; GRAPES | RL, mixture khả vi hoặc policy theo task loss có thể học thứ cần lấy mẫu | Chủ yếu đánh giá node classification/đồ thị tổng quát, chưa phải temporal warm-start ranking protocol này |

Vì vậy luận văn **không** claim “learned sampler đầu tiên cho recommendation”. Đóng góp có thể bảo vệ, nếu có bằng chứng, hẹp hơn: sampler task-conditioned do đồ án phát triển và bằng chứng có kiểm soát cho implicit bipartite recommendation dưới exact full-catalog ranking và phép đo tài nguyên matched. GRAPES cung cấp cơ chế ứng viên và comparator, không mặc định là phương pháp cuối.

## 5. Tập cơ chế ứng viên

| ID | Cơ chế | Vai trò trước G3/G4 | Chẩn đoán bắt buộc |
|---|---|---|---|
| M0 | Uniform sampling không hoàn lại | Đối chứng matched bắt buộc | inclusion count, node/edge duy nhất, effective budget |
| M1 | Importance sampling theo training degree | Đối chứng tĩnh matched bắt buộc | khối xác suất theo degree cohort; mọi statistic chỉ từ train |
| M2 | Structural importance phụ thuộc lớp | Cầu nối từ static sang adaptive | proposal entropy, effective sample size, kiểm tra estimator/normalization |
| M3 | Mixture học được của các heuristic cố định | Ứng viên learned ít phức tạp | mixture weight, collapse, incremental overhead |
| M4 | Task-conditioned exact-k policy | Họ ứng viên chính của đồ án; chỉ chọn parameterization sau G3 | logit/xác suất, entropy, exact-k không trùng, quan hệ reward–quality |
| M5 | Biến thể RL hoặc GFlowNet/TB theo GRAPES | Reference comparator tùy chọn, không bắt buộc là phương pháp cuối | policy loss, log-probability, reward scale, normalizer, gradient và stability oracle |

M0 và M1 phải tồn tại trước khi đánh giá ứng viên learned. M2–M5 là các phương án, không phải cam kết implement tất cả. Theo Mục 7, G4 có thể chọn một cơ chế đơn giản và một cơ chế learned, hoặc không chọn learned mechanism nào.

## 6. Thiết kế so sánh matched

### Giữ cố định

- training graph Baby P4, validation/test cohort và exact-candidate rule đã khóa ở G2;
- LightGCN-style propagation và BPR objective;
- training triplet và negative sample, ghép cặp theo seed và có log;
- embedding size, layer count, optimizer family, early-stopping rule, search budget và checkpoint rule;
- requested budget từng lớp và số sampled node/edge thực tế;
- exact full-catalog evaluator, metric implementation, precision, loại thiết bị và profiling procedure.

### Được phép thay đổi

Chỉ sampler và tham số nội tại của nó được khác. Sampler-specific parameter nhận cùng cơ hội tuning đặt trước; không được giấu thêm search vào một ứng viên.

### Các khối so sánh

1. **Mốc sanity:** MostPop và BPR-MF kiểm tra task/evaluator.
2. **Mốc backbone:** full-graph LightGCN đo implementation không sampling; không gọi là budget matched.
3. **Đối chứng sampling matched:** M0 uniform và M1 degree-aware ở ngân sách giống nhau.
4. **So sánh ứng viên:** các biến thể M2–M5 được chọn ở cùng ngân sách và random input ghép cặp.

Development dùng một smoke seed và ba fixed paired seed. Chỉ validation NDCG@20 được dùng để chọn phương pháp. Sau khi khóa phương pháp/cấu hình, so sánh chính dùng năm paired final seed nếu compute envelope đo được cho phép; mọi cắt giảm phải ghi trước khi xem test. Test cohort dùng cho bằng chứng cuối, không dùng chọn phương pháp.

## 7. Quy tắc chọn phương pháp đăng ký trước

Quy tắc này chọn thứ đi tiếp sang G4/G5; bản thân nó không phải claim vượt trội.

1. **Loại run không hợp lệ trước.** Phương pháp không đủ điều kiện nếu vi phạm leakage, exact-k/uniqueness, candidate, normalization, finite-loss, deterministic replay hoặc resource-log contract.
2. **Chỉ dùng validation.** Ở mỗi ngân sách cố định, tổng hợp ba paired development seed cho NDCG@20, peak GPU memory, epoch time, sampler time, throughput, sampled node/edge và failure.
3. **Lập Pareto set development.** Tối đa NDCG@20, tối thiểu peak GPU memory và epoch time. Một phương pháp chỉ bị dominated khi phương pháp hợp lệ khác không kém trên cả ba development mean và tốt hơn nghiêm ngặt ít nhất một trục.
4. **Chỉ đưa learned/project candidate đi tiếp nếu nó vào Pareto set và cải thiện ít nhất một trục so với cả M0 và M1 ở cùng ngân sách.** Nếu không, chọn không learned method nào và giữ kết quả như negative design finding.
5. **Nếu nhiều ứng viên đạt, chọn theo thứ tự từ điển:** mean validation NDCG@20 cao nhất tại ngân sách chặt nhất mà mỗi ứng viên đạt; rồi peak GPU memory thấp hơn; rồi epoch time thấp hơn; rồi sampler complexity/parameter count thấp hơn. Hòa chưa giải được thì mặc định chọn cơ chế đơn giản hơn.
6. **Khóa trước test.** Ghi method, budget, configuration hash, seed và analysis code trước final test. Test có thể xác nhận hoặc bác bỏ lựa chọn development nhưng không được kích hoạt thay phương pháp.

Claim cuối phải có paired difference, giá trị từng seed, mean/standard deviation, uncertainty interval, resource trace và failure. Statistical uncertainty là bằng chứng mô tả, không phải ngưỡng pass đặt hậu nghiệm. Không dùng weighted composite score vì trọng số tùy ý có thể tạo ra phương pháp “tốt nhất” theo ý muốn.

## 8. Chỉ số và cách hiểu

| Chỉ số | Ý nghĩa | Một mình nó không chứng minh |
|---|---|---|
| Exact full-catalog NDCG@20 | Utility top-20 có xét vị trí; item relevant đứng sớm được điểm cao hơn | scalability, calibration hoặc user satisfaction |
| Recall@20 | Tỷ lệ item relevant giữ lại được tìm thấy trong top 20 | thứ tự đúng bên trong top 20 |
| Peak GPU/CPU memory | Mức cấp phát process/device cao nhất dưới profiler cố định | tốc độ hoặc chất lượng |
| Epoch wall time | Thời gian huấn luyện end-to-end mỗi epoch, gồm sampling | chất lượng hội tụ hoặc time-to-target |
| Time to best validation | Thời gian tới checkpoint validation được chọn | hiệu quả tiệm cận ổn định |
| Throughput | Số target/interaction xử lý mỗi giây | useful work nếu budget/candidate khác nhau |
| Sampler/propagation time | Tách overhead chọn mẫu khỏi message passing | total application latency |
| Sampled node/edge và effective budget | Kích thước computation graph thực và mức tuân thủ budget | mức hữu ích của context được chọn |
| Failure rate và finite-loss check | Độ ổn định vận hành | chất lượng xếp hạng |
| Metric head/middle/tail | Vị trí phân phối của gain/loss theo training degree | fairness ngoài cohort đã audit |

## 9. Audit điều kiện thoát G1

| Bằng chứng thoát gate | Trạng thái | Vị trí |
|---|---|---|
| RQ chính và estimand | `COMPLETE` | Mục 2–3 |
| Giả thuyết bác bỏ được và kết quả âm | `COMPLETE` | Mục 3 |
| Closest-work positioning và claim hẹp | `COMPLETE` | Mục 4 và literature matrix |
| Họ cơ chế ứng viên | `COMPLETE` | Mục 5 |
| Thiết kế so sánh matched | `COMPLETE` | Mục 6 |
| Quy tắc chọn/không chọn đăng ký trước | `COMPLETE` | Mục 7 |

**Quyết định G1: `PASS`.** Điều này chỉ cho phép chọn sampler về sau khi G2, E0-MIN và G3 đã đạt prerequisite riêng. Nó không cho phép implement ngay, claim thực nghiệm hoặc sửa quy tắc sau khi xem test.

## 10. Nguồn gốc

- Hamilton, Ying và Leskovec, [GraphSAGE](https://arxiv.org/abs/1706.02216).
- Chen, Ma và Xiao, [FastGCN](https://openreview.net/pdf?id=rytstxWAW).
- Huang và cộng sự, [AS-GCN](https://proceedings.neurips.cc/paper/2018/hash/01eee509ee2f68dc6014898c309e86bf-Abstract.html).
- Zou và cộng sự, [LADIES](https://proceedings.neurips.cc/paper/2019/hash/91ba4a4478a66bee9812b0804b6f9d1b-Abstract.html).
- Chiang và cộng sự, [Cluster-GCN](https://arxiv.org/abs/1905.07953).
- Zeng và cộng sự, [GraphSAINT](https://openreview.net/forum?id=BJe8pkHFwS).
- Ying và cộng sự, [PinSage](https://arxiv.org/abs/1806.01973).
- Wang và cộng sự, [DSKReG](https://arxiv.org/abs/2108.11883).
- Oh, Cho và Bruna, [data-driven GraphSAGE sampling](https://arxiv.org/abs/1904.12935).
- Abu-El-Haija và cộng sự, [SubMix](https://proceedings.mlr.press/v216/abu-el-haija23a.html).
- Younesian và cộng sự, [GRAPES](https://arxiv.org/abs/2310.03399v3).

