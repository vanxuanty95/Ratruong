# Báo cáo tiến độ khoảng 10 phút với giảng viên hướng dẫn

> **Đề tài:** *Phát triển phương pháp lấy mẫu đồ thị cho hệ thống gợi ý quy mô lớn sử dụng mạng nơ-ron đồ thị GNN*
> **Cập nhật:** 2026-09-03
> **Trạng thái:** G1, E0-MIN và Dataset Gate G2 đã pass. Project có thể bắt đầu baseline/evaluator G3. Chưa train model và chưa có kết quả Recall/NDCG.

## 1. Mở đầu — khoảng 1 phút

Phase 2 được xác định là một luận văn Thạc sĩ độc lập về graph sampling cho GNN recommendation. Công việc Phase 1 về GRAPES được giữ làm nền tảng khoa học, comparator và nguồn candidate mechanism, nhưng GRAPES không mặc định là phương pháp cuối của luận văn.

Mục tiêu nghiên cứu là phát triển một phương pháp lấy mẫu đồ thị, sau đó so sánh công bằng với các baseline trên hai mặt: chất lượng xếp hạng gợi ý và chi phí tính toán. Trước khi xây model, project phải chốt dataset và protocol chống leakage; phần này được quản lý bằng Dataset Gate G2.

## 2. Thiết kế nghiên cứu G1 — khoảng 1,5 phút

G1 trả lời sẽ kiểm tra điều gì và chọn phương pháp như thế nào trước khi có model result. Câu hỏi chính là: ở cùng ngân sách từng lớp và dưới cùng dữ liệu Baby P4, backbone kiểu LightGCN, BPR batch, negative, seed, evaluator và hardware, task-conditioned sampling có cải thiện exact full-catalog NDCG@20–resource trade-off so với uniform và degree-aware sampling không?

Closest-work review cho thấy luận văn không được claim learned sampler đầu tiên cho recommendation: PinSage đã dùng sampling riêng cho recommender, còn DSKReG học sampling cho knowledge-graph recommendation. Đóng góp tiềm năng hẹp hơn là controlled evidence cho sampler task-conditioned do đồ án phát triển trên plain implicit user–item graph.

Sáu vai trò cơ chế được đăng ký: uniform, degree-aware, layer-dependent structural importance, learned heuristic mixture, task-conditioned exact-k policy và biến thể RL/GFlowNet theo GRAPES tùy chọn. Uniform và degree-aware là matched control bắt buộc. Chỉ validation được dùng để chọn: learned candidate chỉ đi tiếp nếu vào Pareto set NDCG–memory–time và cải thiện ít nhất một trục so với cả hai static control ở cùng budget. Nếu không, kết luận hợp lệ là không chọn learned method. Không được dùng test result để thay phương pháp.

## 3. Tổng quan toàn bộ research gate — khoảng 1 phút

Các gate ngăn project chuyển sang bước tốn tài nguyên hoặc tạo claim khi prerequisite chưa đủ vững.

| Gate | Câu hỏi gate trả lời | Bằng chứng cần có để đi tiếp | Trạng thái hiện tại |
|---|---|---|---|
| G0 — Governance | Phạm vi luận văn, cấu trúc artifact, quy tắc song ngữ và claim boundary đã rõ chưa? | Canonical plan, constraint, ownership và evidence rule | `PASS` |
| G1 — Thiết kế nghiên cứu | Chính xác sẽ kiểm tra gì, so với gì và chọn phương pháp bằng cách nào? | Research question, giả thuyết bác bỏ được, closest work, cơ chế ứng viên, matched comparison và selection rule đăng ký trước | `PASS` |
| G2 — Dataset và protocol | Dữ liệu, split, graph, evaluation population, negative và candidate có hợp lệ, chống leakage không? | Provenance, semantics, temporal training-only graph, OOV ledger, exact candidate và bounded feasibility | `PASS` |
| G3 — Shared baseline path | Mọi phương pháp về sau có dùng chung training, evaluation và resource-measurement path đáng tin không? | Deterministic evaluator, sanity check, MostPop/BPR/LightGCN, uniform và degree-aware control cùng resource logging | `NOT STARTED` — gate tiếp theo |
| G4 — Proposed-sampler readiness | Candidate được chọn đã implement đúng và đủ ổn định để chạy final experiment chưa? | Unit/integration test, exact-k sample hợp lệ, finite loss, diagnostic và controlled development run | `NOT STARTED` |
| G5 — Final evidence | Phương pháp có thực sự cải thiện quality–resource trade-off đã tuyên bố không? | Frozen experiment matrix, paired seed, uncertainty, ablation, resource trace, failure, limitation và conditional Home scale stress | `NOT STARTED` |
| G6 — Reproducibility và submission | Có thể tái tạo representative result và nộp đủ hồ sơ truy vết không? | Clean rerun, manifest/configuration, bảng/hình regenerate, luận văn, slide và source chạy được | `NOT STARTED` |

Riêng G2 có bốn gate con: G2-A xác minh exact source bytes/schema; G2-B khóa positive, anomaly, duplicate và negative semantics; G2-C khóa temporal graph chỉ từ training cùng warm/OOV evaluation cohort; G2-D kiểm tra bounded execution mà không so sánh model.

Hai prerequisite môi trường chạy song song với các gate. `E0-MIN` ghi environment development/bounded có thể chạy lại và hiện đã `PASS`. `E0-FINAL` khóa final GPU, CUDA/software và profiling procedure trước resource claim G5, hiện `NOT STARTED`.

Dependency có thể nói ngắn gọn: G0 quản trị toàn bộ; G1 và G2 định nghĩa nghiên cứu; G3 tạo đường baseline chung; G4 xác minh sampler được chọn; G5 tạo final evidence; G6 chứng minh reproducibility. Nếu một gate fail thì phải sửa, thu hẹp claim hoặc ghi negative result—không được bỏ qua control.

## 4. Dataset đã chọn và vai trò — khoảng 0,5 phút

- `Baby_Products` là primary dataset: đủ lớn, vẫn có thể chạy lặp lại và có retained warm-start cohort.
- `All_Beauty` là development/diagnostic: cùng schema nhưng quá nhiều user chỉ có một interaction, nên cohort warm-start quá hẹp để làm bằng chứng chính.
- `Home_and_Kitchen` là conditional scale stress: 66,623,880 row, lớn khoảng 11.19 lần Baby; chỉ full-run ở G5-S nếu luận văn giữ large-scale claim.

Vai trò được phân loại theo semantic fit, retained graph scale, warm-start coverage, compute/reproducibility và loại claim cần hỗ trợ; không phân loại theo dataset nào cho model score cao hơn.

## 5. Audit dữ liệu đã làm — khoảng 1,5 phút

Project xây notebook Colab self-contained để một lần chạy có thể tải hoặc dùng lại raw file, tính checksum, kiểm tra schema, rating, timestamp, duplicate, degree, temporal coverage, OOV và negative-pool feasibility. Kết quả được ghi thành JSON manifest trên Google Drive và mirror trong source project.

- `All_Beauty`: 693,929 event; exact duplicate pair bằng 0; raw user singleton rate 93.22%. Dataset phù hợp để debug nhưng không phù hợp làm primary warm-start evidence.
- `Baby_Products`: 5,953,891 raw row; một rating `0.0` bị quarantine; exact duplicate pair bằng 0.
- So sánh all-observed, P4 và P5 cho thấy policy càng nghiêm thì graph và warm cohort càng nhỏ. Project chọn P4 (`rating >= 4`) vì rating 4–5 biểu thị affinity hợp lý, trong khi P5 loại quá nhiều positive hợp lệ và all-observed xem cả rating thấp là positive.
- `Home_and_Kitchen`: exact compressed artifact 1,420,416,432 byte, 66,623,880 row, schema đúng và checksum đã lưu. Đây mới là provenance/scale evidence, chưa phải scalability result.

Audit chứng minh byte identity, data quality, sparsity, long tail và cohort coverage. Nó không chứng minh model tốt, sampler tốt hoặc hệ thống scale tốt.

## 6. Temporal graph Baby đã hoàn tất — khoảng 1,5 phút

Notebook G2-C/G2-D thứ hai đã chạy trên toàn bộ Baby P4. Graph chỉ dùng interaction trước `t1`; validation nằm trong `[t1,t2)` và test từ `t2` trở đi. Mapping user/item, degree và component đều chỉ sinh từ training positive.

| Chỉ số | Kết quả | Ý nghĩa ngắn |
|---|---:|---|
| Training edge | 3,868,654 | Quy mô graph model được phép thấy |
| Training user / item | 2,318,308 / 162,125 | User side rất lớn và thưa |
| User degree p50 / p90 / p99 | 1 / 3 / 9 | Long tail mạnh; 71.76% user singleton |
| Item degree p50 / p90 / p99 | 3 / 32 / 397 | Popularity tập trung, có head–tail imbalance |
| Largest component | 96.50% node | Phần lớn graph liên thông cho message passing |
| Validation warm target | 81,871 / 373,776 = 21.90% | Chỉ đánh giá user/item đã xuất hiện trong training |
| Test warm target | 40,587 / 413,413 = 9.82% | Primary claim phải ghi rõ là warm-start cohort hẹp |

Mọi target bị loại đều được đối soát theo ba lý do: unseen user, unseen item hoặc cả hai. Vì còn 40,587 test target và exclusion được công khai, cutoff được chấp nhận; G2-C `PASS`.

## 7. Feasibility và ranh giới kết luận — khoảng 1 phút

Manifest Drive mới đã được đọc lại ngày 2026-09-03. Byte size và SHA-256 của cả năm artifact đều khớp. Bounded evaluator chạy 100 target trên 162,125 item, tương đương 16,212,500 comparison và 16,209,544 eligible candidate. Hai kiểm tra gốc và cả bốn replay invariant đều đúng.

Environment được ghi là CPython 3.13.15 trên Linux 6.6.122, Intel Xeon với 2 logical CPU, RAM 12,975.53 MiB, không GPU, Google Colab 1.0.0 và ipykernel 6.17.1. Traversal gốc mất 1.667 giây với process peak RSS 158.24 MiB; count-only replay mất 0.00387 giây. Hai thời gian này không được so trực tiếp. Chúng chỉ chứng minh bounded CPU pipeline/evaluator feasibility—không phải model runtime, GPU profiling hoặc scalability. Vì vậy G2-D và E0-MIN pass, Dataset Gate G2 được đóng.

## 8. Hiện tại đã có và chưa có — khoảng 1 phút

Đã có:

- Scope, gate và claim boundary song ngữ.
- RQ, giả thuyết bác bỏ được, ranh giới closest work, họ cơ chế ứng viên, matched-comparison design và quy tắc Pareto chỉ dùng validation để chọn/không chọn của G1.
- Literature/source anchor và GRAPES-informed reference design.
- Portfolio audit có checksum và persistent manifest.
- P4 semantics, anomaly/duplicate/negative rule.
- Frozen Baby temporal graph, mapping, OOV ledger và exact-candidate rule.
- 13/13 local pure-Python test pass.

Chưa có:

- Final sampler được chọn.
- PyTorch/PyG recommender và matched baseline hoàn chỉnh.
- Recall@20, NDCG@20 hoặc comparative result.
- Final GPU profiling, scalability hoặc novelty claim.

## 9. Bước tiếp theo và nội dung xin ý kiến — khoảng 0,5 phút

1. Bắt đầu G3: shared evaluator cùng MostPop/BPR, sau đó LightGCN và uniform/degree-aware control dưới cùng data/candidate rule.
2. Sau khi G3 pass, áp dụng quy tắc G1 chỉ dùng validation để chọn một candidate—hoặc kết luận không chọn learned method—cho G4.

Các điểm cần xin ý kiến giảng viên:

- Warm-start primary cohort với 40,587 test target có phù hợp phạm vi luận văn không?
- Evidence boundary Baby primary, All Beauty diagnostic và Home conditional scale stress có hợp lý không?
- GPU cuối cùng, template báo cáo và yêu cầu bảo vệ của trường là gì?

## Bản nói cực ngắn nếu bị giới hạn thời gian

> Em đã khóa cả thiết kế nghiên cứu lẫn bài toán dữ liệu trước khi train. G1 định nghĩa phép thử matched giữa task-conditioned sampling với uniform và degree-aware control, đồng thời cho phép kết luận không chọn learned method. Với Baby P4, temporal training graph có 3.87 triệu edge, 2.32 triệu user và 162 nghìn item; warm-start test cohort có 40,587 target. Manifest mới verify mọi artifact và ghi bounded CPU replay tái lập được, nên G2 và E0-MIN đã pass. Bước tiếp theo là shared evaluator và baseline G3. Hiện chưa có Recall, NDCG, model comparison, GPU profiling hoặc scalability result.

## Hồ sơ hỗ trợ

- [`DATASET_PORTFOLIO_AND_ANALYSIS_PROTOCOL_vn.md`](../00_project/DATASET_PORTFOLIO_AND_ANALYSIS_PROTOCOL_vn.md)
- [`G1_RESEARCH_DESIGN_vn.md`](../00_project/G1_RESEARCH_DESIGN_vn.md)
- [`THESIS_REPORT_vn.md`](../04_thesis/THESIS_REPORT_vn.md)
- [`baby_p4_g2c_manifest.json`](../06_code/results/baby_p4_g2c_manifest.json)
- [`G2C_TEMPORAL_GRAPH_vn.md`](../06_code/docs/G2C_TEMPORAL_GRAPH_vn.md)
