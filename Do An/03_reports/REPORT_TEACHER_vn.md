# Bản Briefing Hiện tại cho Giảng viên Hướng dẫn

> **Dự án:** *Phát triển phương pháp lấy mẫu đồ thị cho hệ thống gợi ý quy mô lớn sử dụng mạng nơ-ron đồ thị GNN*  
> **Trạng thái:** `BRIEFING TÍCH LŨY — NỀN TẢNG NGHIÊN CỨU VÀ DATA-PROTOCOL GATE`  
> **Cập nhật lần cuối:** 2026-08-30
> **Cách dùng:** Đây là briefing hiện tại cho buổi trao đổi, không phải deliverable luận văn theo tuần. Lịch sử có ngày được giữ trong continuity record.

## 1. Định danh luận văn

Phase 2 là luận văn Thạc sĩ độc lập. Phase 1 là bối cảnh lịch sử chỉ đọc: giai đoạn này khám phá đề tài và nghiên cứu/tái lập GRAPES cho node classification. GRAPES được giữ lại như nền tảng khoa học, comparator và nguồn candidate mechanism; nó không phải phương pháp luận văn đã cố định hay tên luận văn.

Final sampler vẫn `OPEN`. GRAPES-informed reference design hiện có cùng các contract D1–D11/T01–T25 chỉ là reference-design và verification candidate. Các thành phần này có thể được chọn, thay đổi hoặc loại bỏ sau literature positioning, implementation check, ablation và experiment.

Registry gate chuẩn hiện ghi G0 `PASS`, G1/G2 `IN_PROGRESS` và G3–G6 `NOT_STARTED`. Environment readiness được tách riêng: E0-MIN `IN_PROGRESS`, E0-FINAL `NOT_STARTED`. G1 và G2 chạy song song; không bỏ qua baseline gate hoặc sampler gate.

## 2. Evidence và maturity hiện tại

| Khu vực | Trạng thái hiện tại | Ranh giới evidence |
|---|---|---|
| Research framing và source governance | `RECORDED` | Đã ghi thesis title, ranh giới Phase 1, primary-source anchor và claim rule |
| GRAPES-informed reference design | `REFERENCE DESIGN` | Candidate mechanism và toy verification contract; không phải final method |
| Code scaffold | `PARTIAL TOY EXECUTION` | Mười CPU contract test không dependency đã pass; chưa có PyTorch/PyG recommender hoặc end-to-end pipeline |
| Raw data audit | `TEMPORARY AUDIT EXECUTED` | Đã audit chính xác `All_Beauty` và `Baby_Products`; durable acquisition và protocol cuối vẫn mở |
| Recommendation experiment | `NOT STARTED` | Chưa có model training, Recall/NDCG, memory, throughput, scalability, novelty hoặc superiority result |

## 3. Danh mục dataset và finding hiện tại

| Vai trò | Dataset | Trạng thái hiện tại |
|---|---|---|
| Development diagnostic | Amazon Reviews'23 `All_Beauty` | Không phải primary evidence: raw audit có 693,929 row và 93.22% user singleton |
| Primary benchmark candidate | Amazon Reviews'23 `Baby_Products` | Candidate bắt buộc; raw audit có 5,953,891 row và 70.01% user singleton, nhưng duplicate verification và protocol cuối vẫn mở |
| Conditional scale evidence | Amazon Reviews'23 `Home_and_Kitchen` | Bounded scale-stress candidate nếu luận văn giữ “large-scale” claim; project chưa acquire hoặc audit |
| Optional validation | MovieLens 25M; Yelp Open Dataset | Chỉ xem xét sau khi core Amazon evidence hoàn thành |

Provider absolute-time split tạo user/item out-of-training-universe coverage cao trong raw audit. Đây là data-protocol finding, không phải model result. Điều đó có nghĩa là published split chưa thể được adopt trực tiếp làm primary strict warm-start protocol.

## 4. Protocol trước model training

Các quyết định cần hoàn tất tiếp theo là:

1. Giữ data provenance: official URL, usage/access note, persistent artifact, checksum, schema và manifest.
2. Freeze interaction semantics trước training: duplicate treatment, Baby rating `0.0`, một primary P4/P5/all-observed policy và targeted sensitivity policy nếu có rationale.
3. Định nghĩa strict temporal warm-start task: training-only graph, training-only filtering/statistic, validation/test retention tường minh và OOV exclusion được ghi lại.
4. Định nghĩa training negative và full-catalog evaluation candidate mà không âm thầm dùng future interaction.
5. Xác định retained graph của `Baby_Products` có vượt primary-feasibility Gate G2-D hay không trước khi implement final sampler.

Comparison protocol dự kiến dùng data, backbone, budget, optimizer, seed và negative rule giống nhau giữa non-GNN ranking reference, GNN backbone, simple sampling baseline, GRAPES-informed reference và sampler do project phát triển. Exact full-catalog Recall/NDCG và resource measure mới là kế hoạch; feasibility phải được chứng minh trước.

## 5. Rủi ro hiện tại và nội dung cần hướng dẫn

1. Xác nhận evidence boundary đề xuất—`Baby_Products` primary, bounded conditional scale test và external validation optional—có phù hợp yêu cầu luận văn không.
2. Xác nhận final GPU class/access window và report/deck template của trường.
3. Xác nhận project nên ưu tiên strict warm-start evaluation, còn cold start nằm ngoài luận văn trừ khi method hỗ trợ rõ ràng.
4. Xác nhận evidence package dự kiến—quality, resource cost, ablation, seed variation và failure analysis—có đủ trước final experiment không.

## 6. Đoạn trình bày ngắn

> Luận văn hiện được định hình là nghiên cứu phát triển phương pháp độc lập về graph sampling cho large-scale GNN recommendation. Phase 1 và GRAPES vẫn là bối cảnh khoa học và tài liệu so sánh, nhưng không định nghĩa phương pháp cuối. Chúng em đã hoàn tất raw audit tạm thời cho hai Amazon category và phát hiện rủi ro cao về sparsity cùng OOV trong protocol. Vì vậy, bước tiếp theo là freeze data protocol chống leakage và kiểm tra primary candidate còn khả thi sau filtering không. Chưa train recommendation model, do đó chưa có claim về accuracy, efficiency, scalability, novelty hay comparative result.

## 7. Record hỗ trợ

- [`PROJECT_CONTEXT_AND_RESEARCH_RULES_vn.md`](../PROJECT_CONTEXT_AND_RESEARCH_RULES_vn.md)
- [`DATASET_PORTFOLIO_AND_ANALYSIS_PROTOCOL_vn.md`](../00_project/DATASET_PORTFOLIO_AND_ANALYSIS_PROTOCOL_vn.md)
- [`DATASET_AUDIT_vn.md`](../06_code/docs/DATASET_AUDIT_vn.md)
- [`DATASET_AUDIT_RESULTS_vn.md`](../06_code/docs/DATASET_AUDIT_RESULTS_vn.md)
- [`THESIS_REPORT_vn.md`](../04_thesis/THESIS_REPORT_vn.md)

## 8. Nguồn

- [Amazon Reviews'23 documentation](https://amazon-reviews-2023.github.io/main.html) và [5-core processing statistics](https://amazon-reviews-2023.github.io/data_processing/5core.html)
- [Nghiên cứu về recommender-system leakage](https://arxiv.org/abs/2010.11060)
- [Nghiên cứu về sampled ranking metric](https://arxiv.org/abs/1912.02263)
