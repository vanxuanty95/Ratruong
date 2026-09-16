# Kế hoạch Phase 2: GRAPES-GFN-Rec

> **Cập nhật:** 16/09/2026
> **Trạng thái:** `RESET (DL-001)`, `LIVING DOCS + HẠN 30/11 (DL-002)`. Gate hiện tại: hoàn tất **R2** → viết notebook 12 (**R3**). R1 xong.
> **Spec chuẩn:** [`PHASE2_GRAPES_GFN_REC_SPEC_vn.md`](./PHASE2_GRAPES_GFN_REC_SPEC_vn.md) · **Vì sao reset:** [`DECISION_LOG_vn.md`](./DECISION_LOG_vn.md) · **Plan thao tác:** [`../../docs/superpowers/plans/2026-09-16-grapes-gfn-rec-rebuild.md`](../../docs/superpowers/plans/2026-09-16-grapes-gfn-rec-rebuild.md)

## 1. Mục tiêu

Hiện thực **GRAPES-GFN-Rec** — biến thể GRAPES có sampler học được (GFlowNet Trajectory Balance) chọn node ngữ cảnh cho Sampled LightGCN, nhận tín hiệu từ BPR ranking loss — và so sánh với các phương pháp khác dưới cùng protocol.

> **RQ chính:** với graph user–item temporal, GRAPES-GFN-Rec có cải thiện paired NDCG@20–chi phí so với uniform và degree-importance sampling khi recommender, graph, BPR order, budget, seed, evaluator và phần cứng giữ cố định hay không?

RQ phụ: TB vs REINFORCE (RQ2), hành vi sampler và popularity bias (RQ3), độ nhạy theo budget (RQ4).

## 2. Trạng thái artifact sau reset

| Artifact | Vai trò mới | Được dùng cho |
|---|---|---|
| Raw audit All_Beauty/Baby/Home_and_Kitchen, EDA | Input đã kiểm toán | Motivation dữ liệu, chọn dataset |
| P4 policy, temporal graph `t1/t2`, mapping, evaluator exact | Input đã kiểm toán | Holdout protocol; nền cho development split |
| Code `grapes_rec` (contracts, blocks, sampling, objectives, evaluation) | Nền primitive | Mở rộng ở R2 |
| MostPop, BPR-MF, Full LightGCN validation | Sanity cũ (5 epoch) | Chỉ tham chiếu; chạy lại trên budget mới |
| M0, M1, M2 và paired validation | `ARCHIVED PILOT` | Appendix; bài học budget/credit assignment |
| Slide, REPORT_TEACHER, THESIS_REPORT hiện tại | `ARCHIVED PILOT NARRATIVE` | Không dùng làm báo cáo Phase 2 |

## 3. Gate

| Gate | Việc | Điều kiện qua | Nơi chạy | Lịch (DL-002) | Trạng thái |
|---|---|---|---|---|---|
| R0 | Spec, decision log, docs trung tâm, archive pilot, checker | Checker pass; không file trung tâm gọi M2 là method | Local | 16/9 | Xong (`b122d1d`) |
| R1 | Development split theo spec §3.1 | Manifest + hash; isolation test pass | Colab | 16–22/9 | **Xong** (DL-003): t0 = 05/09/2020; 3.315.497 cạnh; 105.401 target |
| R2 | Primitive + oracle GRAPES-GFN-Rec (G1–G7) | Oracle test pass trên CPU | Local | 16–22/9 | Đang làm: core 28 oracle pass; còn T04, T23/D9, D6 legacy, embedding cho scale |
| R3 | Development: backbone adequacy, budget regime, sweep `α`/`log_z_init`/lr, feasibility T4, sampler học thật | Full LightGCN > MostPop trên `D_dev`; loss hữu hạn; replay xác định | Colab | 23/9–10/10 | Chưa |
| R4 | Freeze config/seed/budget/evaluator/analysis; chốt OD-1..OD-4 | `current_validation_read=false` khi tạo | Local+Colab | 10–13/10 | Chưa |
| R5 | Holdout paired matrix tầng A+B | Hash khớp; metric tính lại được | Colab | 14–27/10 | Chưa |
| R6 | Phân tích RQ1–RQ4, ablation D9/D6 | Bảng truy về JSON | Local | 28/10–3/11 | Chưa |
| R7 | Rebuild report/slide/README; pilot vào appendix | Checker pass | Local | 4–17/11 | Chưa |

Dự phòng 18–30/11; nộp 30/11/2026.

**Tài liệu sống (DL-002):** [`../05_slides/THESIS_vn.pptx`](../05_slides/THESIS_vn.pptx) và [`../04_thesis/THESIS_vn.pdf`](../04_thesis/THESIS_vn.pdf). Mỗi gate xong điền vào chương tương ứng, tăng phiên bản, ghi nhật ký.

## 4. Khối lượng công việc giai đoạn 2 (step by step)

1. **R0** — khóa lại scope và guardrail (tài liệu này, spec, decision log, checker).
2. **R1** — notebook `11_dataset_deep_analysis_and_dev_split.ipynb`: phân tích sâu dataset + tạo `G_dev_train`, `D_dev`, manifest, hash.
3. **R2** — `src/grapes_rec/gfn_sampler.py`, `sampled_lightgcn.py`, `trainer.py` + oracle test T01–T25 và G1–G7.
4. **R3** — notebook `12_grapes_gfn_rec_development.ipynb`: (a) backbone adequacy Full LightGCN vs MostPop; (b) budget regime chung; (c) sweep sampler; (d) đo feasibility; (e) chứng minh sampler thay đổi phân phối chọn so với M0.
5. **R4** — `configs/grapes_gfn_rec_holdout_matrix_v1.json` + freeze manifest.
6. **R5** — notebook `13_grapes_gfn_rec_paired_holdout.ipynb`: GFN-Rec, RL-Rec, M0, M1, Full LightGCN, MostPop, BPR-MF × seed.
7. **R6** — phân tích chất lượng, chi phí, cohort, hành vi sampler, failure.
8. **R7** — viết lại thesis/report/slide từ evidence cuối.

## 5. Quy tắc không được phá

1. Validation/test edge không vào graph, degree, candidate, feature sampler, normalization hay objective train.
2. Mọi tuning chỉ trên `D_dev`; current validation chỉ đọc sau R4; test chỉ đọc với final-test protocol riêng.
3. Recommender và sampler có parameter/optimizer riêng; Top-k không truyền gradient; TB không chạm `Θ_R`.
4. Matrix final giữ matched graph, BPR order, negative draw, init, budget, evaluator, profiler.
5. Kết quả âm/không ổn định vẫn báo cáo; không đổi method sau holdout.
6. Không gọi phương pháp nào là biến thể GRAPES nếu thiếu một mục G1–G7.
7. Không tự thu hẹp RQ; thay đổi scope cần mục decision log có xác nhận của chủ đề tài.
