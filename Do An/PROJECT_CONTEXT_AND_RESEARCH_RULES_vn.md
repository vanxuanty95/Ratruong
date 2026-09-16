# Bối cảnh và quy tắc nghiên cứu hiện hành

> **Cập nhật:** 16/09/2026  
> **Nguồn chân lý:** [`00_project/PHASE2_GRAPES_GFN_REC_SPEC_vn.md`](./00_project/PHASE2_GRAPES_GFN_REC_SPEC_vn.md) và [`00_project/PHASE2_RESEARCH_PLAN_vn.md`](./00_project/PHASE2_RESEARCH_PLAN_vn.md).
> **Thứ tự đọc bắt buộc mỗi phiên:** [`00_project/DECISION_LOG_vn.md`](./00_project/DECISION_LOG_vn.md) → spec → plan → file này.

## 1. Đề tài và method đang xây

Đề tài phát triển sampler graph cho GNN recommendation quy mô lớn. Method Phase 2 đang xây là **GRAPES-GFN-Rec**: GFlowNet học trajectory chọn node context cho Sampled LightGCN; feedback là BPR ranking loss đã detach. Đây là adaptation cho bipartite user--item ranking, không phải port GRAPES node classification.

Sampler phải có đủ checklist G1–G7 của spec §0: policy GNN có tham số, exact-k Gumbel action, trajectory log-likelihood, task signal detach, `log Z(V⁰)` học được, TB (hoặc REINFORCE cho ablation) và optimizer step thật sự cập nhật sampler. Thiếu một mục thì không được gọi là biến thể GRAPES.

So sánh bắt buộc: M0 uniform, M1 degree-importance và GRAPES-RL-Rec (matched sampler, chạy lại trên budget mới); Full LightGCN, MostPop, BPR-MF (reference). Research question không được thu hẹp nếu không có mục decision log được chủ đề tài xác nhận.

## 2. Dữ liệu và temporal boundary

- Dataset chính: Amazon Reviews'23 `Baby_Products`, rating-only 0-core.
- P4 biến rating 4--5 thành positive interaction; rating `0.0` được quarantine.
- Raw audit, graph manifest và exact evaluator hiện có là input đã kiểm toán.
- Training-side graph/statistic chỉ dùng interaction trước cutoff tương ứng; user/item mapping được tạo từ training side.
- Development mới phải nằm hoàn toàn trong pre-current-validation history.
- Current validation đã bị quan sát trong M0--M2 pilot và được giữ làm holdout sau freeze.
- Test target chưa đọc; chỉ mở dưới final-test protocol đã đăng ký.

## 3. Trạng thái evidence cũ

MostPop, BPR-MF, Full LightGCN, M0 uniform, M1 degree-aware và M2 frontier-normalized là evidence pipeline/pilot đã lưu. M2 là heuristic tĩnh `frontier_support / sqrt(training_degree)`, không có policy learning.

Không xóa các output, nhưng không được gọi M2 là final thesis method, GRAPES-GFN-Rec, hoặc bằng chứng method mới thất bại/thành công. Slide/report hiện có mang trạng thái `ARCHIVED PILOT NARRATIVE` cho tới khi được rebuild ở R6.

## 4. Comparator và metric

M0 uniform và M1 degree-aware là final matched static controls. MostPop, BPR-MF và Full LightGCN là sanity/reference. NDCG@20 là primary ranking metric; Recall@20, coverage, cohort head/body/tail, sampler/propagation time, wall time, peak GPU, effective sampled graph và failure rate được report cùng nhau.

Baby pure-ID không đo semantic relevance, semantic diversity hoặc content-based cold-start. Primary inference dùng full training graph/full catalog; method chỉ claim sampled-training behavior.

## 5. Quy tắc thực nghiệm

1. Không để validation/test edge đi vào graph, degree, candidate, feature, normalization hay training objective.
2. Không dùng current validation để phát triển, chọn alpha, learning rate, budget hoặc architecture.
3. Không đọc test để chọn method.
4. Tách parameter, optimizer và gradient của recommender khỏi sampler/GFlowNet; Top-k không có gradient trực tiếp.
5. Giữ matched BPR order, negative draws, initialization, budget, evaluator và profiler trong paired comparison.
6. Nếu result âm, loss không hữu hạn, sampler collapse hoặc run không hợp lệ, lưu và report nó thay vì đổi protocol sau holdout.
7. `ThucTap2` là nguồn tham khảo; không ghi output Phase 2 mới ở đó.

## 6. Tài liệu cần đọc trước khi thay đổi

- Design: [`00_project/PHASE2_GRAPES_GFN_REC_SPEC_vn.md`](./00_project/PHASE2_GRAPES_GFN_REC_SPEC_vn.md)
- Plan: [`00_project/PHASE2_RESEARCH_PLAN_vn.md`](./00_project/PHASE2_RESEARCH_PLAN_vn.md)
- Execution plan: [`../docs/superpowers/plans/2026-09-16-grapes-gfn-rec-rebuild.md`](../docs/superpowers/plans/2026-09-16-grapes-gfn-rec-rebuild.md)
- Code/artifact handoff: [`06_code/README_vn.md`](./06_code/README_vn.md)
