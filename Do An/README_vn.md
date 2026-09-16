# Đồ án: bắt đầu từ đây

> **Cập nhật:** 16/09/2026
> **Đề tài:** Lấy mẫu đồ thị cho hệ thống gợi ý quy mô lớn sử dụng GNN
> **Trạng thái:** `RESET (DL-001)` — Phase 2 đang xây **GRAPES-GFN-Rec**; chưa có kết quả method.

## Phase 2 làm gì

Hiện thực một **biến thể GRAPES học được cho recommendation** rồi so sánh với các phương pháp khác:

- **GRAPES-GFN-Rec (method):** một GNN phụ học chọn node ngữ cảnh cho từng layer của Sampled LightGCN; được huấn luyện bằng GFlowNet Trajectory Balance với reward từ BPR ranking loss. Inference vẫn full-graph, full-catalog.
- **So sánh tầng A (cùng budget):** M0 uniform, M1 degree-importance, GRAPES-RL-Rec (REINFORCE).
- **So sánh tầng B (reference):** Full LightGCN, MostPop, BPR-MF.

Một phương pháp chỉ được gọi là biến thể GRAPES khi có đủ checklist G1–G7 (spec §0).

## Đọc theo thứ tự

1. [`00_project/DECISION_LOG_vn.md`](./00_project/DECISION_LOG_vn.md) — vì sao Phase 2 bị reset, guardrail chống lặp lại.
2. [`00_project/PHASE2_GRAPES_GFN_REC_SPEC_vn.md`](./00_project/PHASE2_GRAPES_GFN_REC_SPEC_vn.md) — spec chuẩn: RQ, adaptation, split, comparator, metric, gate.
3. [`02_protocol/GRAPES_RECOMMENDATION_SPEC_vn.md`](./02_protocol/GRAPES_RECOMMENDATION_SPEC_vn.md) — hợp đồng thành phần D1–D11 và oracle T01–T25 (normative).
4. [`00_project/PHASE2_RESEARCH_PLAN_vn.md`](./00_project/PHASE2_RESEARCH_PLAN_vn.md) — gate R0–R7 và khối lượng công việc.
5. [`PROJECT_CONTEXT_AND_RESEARCH_RULES_vn.md`](./PROJECT_CONTEXT_AND_RESEARCH_RULES_vn.md) — quy tắc thực nghiệm và ranh giới claim.
6. [`06_code/README_vn.md`](./06_code/README_vn.md) — code, notebook, artifact, cách kiểm tra.

Bản tiếng Việt là bản chuẩn. Các file `_en` chưa đồng bộ sau DL-001 và mang banner `SUPERSEDED`.

## Đã có và vẫn dùng được

- Kiểm toán dữ liệu Amazon Reviews'23 (All_Beauty, Baby_Products, Home_and_Kitchen) và EDA đầy đủ: `06_code/results/`, `06_code/results/data_story/`.
- Baby_Products P4 temporal graph: 3.868.654 cạnh, 2.318.308 user, 162.125 item; 71,76% user có một interaction; item-degree Gini 0,8584.
- Evaluator exact full-catalog (NDCG@20, Recall@20, Catalog Coverage@20, cohort head/body/tail).

## Archived pilot (không phải kết quả luận văn)

M0/M1/M2 sampling validation, paired validation ba seed, deck `05_slides/THESIS_PRESENTATION_vn.pptx`, `03_reports/REPORT_TEACHER_*` và `04_thesis/THESIS_REPORT_*` kể câu chuyện "dừng ở M2 frontier-normalized". M2 là heuristic tĩnh, không có sampler học được. Các file này được giữ làm lịch sử và bài học (budget ~300 step quá ít cho credit assignment; backbone Full LightGCN còn thua MostPop), sẽ được viết lại ở gate R7.

## Ranh giới cần nhớ

- Semantic match/diversity chưa đo được từ dữ liệu pure-ID; muốn đo cần nối metadata sản phẩm (quyết định mở OD-2).
- Coverage đo độ rộng catalog, không đo đa dạng ngữ nghĩa.
- Current validation đã bị quan sát bởi pilot → mọi tuning dùng development split mới; test chưa đọc.
