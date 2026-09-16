# Trạng thái bàn giao cho agent tiếp theo

> **Cập nhật lần cuối:** 16/09/2026, sau khi xử lý kết quả notebook 11 (tài liệu sống v0.4, DL-003).
> **Cập nhật file này ở cuối mỗi phiên làm việc** (commit cuối, việc đang dở, việc kế tiếp). Đây là nơi đầu tiên agent mới đọc sau `AGENTS.md`.

## 1. Mục tiêu một câu

Hiện thực **GRAPES-GFN-Rec** — biến thể GRAPES có sampler học được (GFlowNet Trajectory Balance) cho Sampled LightGCN với phần thưởng từ BPR — rồi so sánh với M0 uniform, M1 degree, GRAPES-RL-Rec, Full LightGCN, MostPop, BPR-MF trên Amazon Reviews'23 Baby_Products. **Hạn nộp 30/11/2026.**

## 2. Đọc theo thứ tự (bắt buộc trước khi sửa gì)

1. `Do An/00_project/DECISION_LOG_vn.md` — DL-001 (reset scope, checklist G1–G7), DL-002 (tài liệu sống, hạn tháng 11).
2. `Do An/00_project/PHASE2_GRAPES_GFN_REC_SPEC_vn.md` — spec chuẩn: RQ, adaptation R-1…R-8, split §3.1, comparator, metric, gate R0–R7, OD-1…OD-4.
3. `Do An/02_protocol/GRAPES_RECOMMENDATION_SPEC_vn.md` — hợp đồng thành phần D1–D11, oracle T01–T25.
4. `Do An/00_project/PHASE2_RESEARCH_PLAN_vn.md` — bảng gate có lịch.
5. `docs/superpowers/plans/2026-09-16-grapes-gfn-rec-rebuild.md` — plan thao tác chi tiết từng task.
6. `Do An/cô dặn 3:09` — ghi chú góp ý giảng viên (nguồn các câu hỏi chương 3).

## 3. Trạng thái gate

| Gate | Trạng thái | Commit / artifact |
|---|---|---|
| R0 governance | Xong | `b122d1d` |
| R2 primitives | **Lõi xong**; còn việc ở §5.2 | `85307b7`: `src/grapes_rec/{torch_graph,gfn_sampler,sampled_lightgcn,gfn_trainer}.py`, `tests/test_gfn_rec_torch.py` (28 test) |
| R1 dev split + phân tích sâu | **Xong** | Notebook `0c8d724`; kết quả `results/dataset_deep_analysis/` (summary, figures D1–D6, bundle), `results/grapes_gfn_rec_development/development_graph_manifest.json`; test `tests/test_grapes_gfn_rec_protocol.py`; kết luận DL-003 |
| Tài liệu sống **v0.4** | Xong | `05_slides/THESIS_vn.pptx` (44 slide), `04_thesis/THESIS_vn.tex/.pdf` (24 trang); chương 2 và 3 không còn chỗ chờ notebook 11 |
| R3, R4, R5, R6, R7 | Chưa | Lịch: R3 23/9–10/10 · R4 10–13/10 · R5 14–27/10 · R6 28/10–3/11 · R7 4–17/11 · dự phòng đến 30/11 |

## 4. Đang chờ người dùng

- **Xác nhận hạn nộp** (đang giả định 30/11/2026).
- **Gặp giảng viên trước R4 (~10–13/10)** để chốt OD-1…OD-4; OD-2 (metadata đo ngữ nghĩa/đa dạng) khuyến nghị "có" — metadata đủ (title ~100%, danh mục 93%).
- Khi notebook 12 sẵn sàng: chạy trên Colab **GPU T4**, dữ liệu dev ở Drive `MyDrive/Phase2_Amazon_Audit/grapes_gfn_rec_dev_v1/`.

## 5. Việc kế tiếp, theo thứ tự

### 5.1 Kết quả notebook 11 — ĐÃ XỬ LÝ (tham khảo)
Các con số chính và quyết định rút ra nằm trong `DECISION_LOG_vn.md` DL-003. Lưu ý kỹ thuật: file `dev_user_ids`/`dev_item_ids` chứa mã factorize nội bộ, không phải ID gốc (xem DL-003).

### 5.2 Hoàn tất R2 (làm được ngay, không cần dữ liệu)
- T04: batch sampler với negative đồng nhất, reject positive train; test.
- T23 + D9: transient mask positive edge (xóa cả hai chiều khỏi candidate, GCN_S/GCN_Z adjacency, block, normalization; giữ degree feature tĩnh).
- D6 legacy: `log Z` trên target+neighbour như code GRAPES gốc (ablation).
- R-5: embedding thưa cho sampler 2,48 triệu node (`nn.Embedding(sparse=True)` + optimizer phù hợp) và chỉ chạy GCN_S trên ứng viên; đo bộ nhớ.
- Vectorize `graph.edges_between` / `local_edges` cho quy mô thật (hiện đúng nhưng dùng `torch.isin` trên toàn bộ neighbor list).

### 5.3 R3 — notebook 12 (xem plan Task R3)
Đọc `dev_train_edges.csv.gz`, `dev_targets.csv.gz` trên Drive (kiểm SHA-256 theo manifest); **lưới batch bắt đầu từ ≤ 4.096 triplet** (DL-003); R3a Full LightGCN vs MostPop theo epoch trên `D_dev`; R3b budget chung (batch × k); R3c quét α (log-grid, GRAPES gốc dùng ~10³–10⁵), log_z_init, lr_S; R3d bằng chứng G7; R3e chi phí sampler. Tuyệt đối không đọc `baby_p4_validation_targets` / `baby_p4_test_targets`.

## 6. Quy trình cập nhật tài liệu sống

- Slide quan trọng mới (v0.4): `s1` rating, `s2` thời gian, `s3` bất thường, `s4x` bùng nổ lân cận, `reach` đồng mua/bằng chứng target, `dev` R1, `meta` metadata.
- Deck: `Do An/05_slides/build_thesis_vn.js`. Hằng `VERSION`, `UPDATED` ở đầu; slide chờ dùng hàm `pending(...)`; `REG[id]` lưu số slide để bảng đối chiếu góp ý (slide 4) tự điền. Chỗ chờ notebook 11: slide `deep` (bảng S1–S6/R1), ghi chú đỏ ở slide `time`, card vàng ở slide `graph`, bảng ở slide `sem`.
- Report: `Do An/04_thesis/THESIS_vn.tex`. Macro `\docversion`, `\docdate`; hộp chờ `\pending{nguồn}{nội dung}` (tìm chuỗi `\pending{Notebook 11`). Nhật ký ở chương "Trạng thái tài liệu". Hình dữ liệu sâu sẽ đặt ở `06_code/results/dataset_deep_analysis/figures/` (đã có trong `\graphicspath`).
- Mỗi lần cập nhật: sửa cả deck và report, tăng phiên bản, thêm dòng nhật ký (cả hai nơi), rebuild, render kiểm tra, chạy checker, commit.

## 7. Môi trường và lệnh

| Việc | Lệnh | Ghi chú |
|---|---|---|
| Test thuần Python | `cd "Do An/06_code" && PYTHONPATH=src python3 -m unittest discover -s tests -p 'test_*.py'` | 140 test; 28 test torch bị skip nếu thiếu PyTorch |
| Test torch | `PYTHONPATH=src python3 -m unittest tests.test_gfn_rec_torch` | Cần PyTorch (Colab hoặc môi trường có `pip install torch`) |
| Checker narrative | `python3 scripts/verify_research_consistency.py --repo-root ../..` | `violations` phải rỗng; slide chuẩn là `THESIS_vn.pptx` |
| Build deck | `cd "Do An/05_slides" && node build_thesis_vn.js` | Cần `pptxgenjs`; VM trên máy Ty hiện **không có** gói này — build ở môi trường có sẵn hoặc `npm install pptxgenjs` ngoài repo |
| Build report | `cd "Do An/04_thesis" && xelatex THESIS_vn.tex` (chạy 3 lần) | Font Liberation Serif, gói tcolorbox, pgfplots |
| Dữ liệu | Google Drive `MyDrive/Phase2_Amazon_Audit/` | Môi trường cloud của Claude và VM bị proxy chặn tải từ UCSD/HuggingFace → mọi thứ cần raw data chạy trên Colab |

- Git author: `Ty Van Xuan <vanxuanty95@gmail.com>`; thêm dòng `Co-Authored-By` theo quy ước của agent.
- Không commit: `Claude outputs/` (bản sao ứng dụng tải về), `.~lock.*`, hai file ghi chú của giảng viên (giữ untracked như cũ).

## 8. Không được làm

- Không gọi M2 hoặc bất kỳ heuristic nào là biến thể GRAPES (checklist G1–G7).
- Không đọc current validation/test để thiết kế/tune; test chỉ đọc một lần với protocol riêng.
- Không tự thu hẹp câu hỏi nghiên cứu; đổi scope phải có mục decision log được Ty xác nhận.
- Không xóa evidence pilot; không ghi output mới vào `ThucTap2/`.
- Không điền số vào tài liệu sống nếu không truy được về JSON/rank vector đã lưu.
