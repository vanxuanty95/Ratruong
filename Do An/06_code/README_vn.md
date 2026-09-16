# Mã nguồn và bằng chứng thực nghiệm

> **Trạng thái:** `RESET (DL-001)`. Method đang xây: **GRAPES-GFN-Rec**. Gate hiện tại R0–R2.
> Spec: [`../00_project/PHASE2_GRAPES_GFN_REC_SPEC_vn.md`](../00_project/PHASE2_GRAPES_GFN_REC_SPEC_vn.md)

## 1. Bố cục

| Thư mục | Nội dung |
|---|---|
| `src/grapes_rec/` | Primitive thuần Python: contract bipartite/BPR, block + bi-norm, candidate/Top-k/Bernoulli log-prob, BPR/REINFORCE/TB oracle, evaluator, cohort. R2 bổ sung sampler GFlowNet và Sampled LightGCN. |
| `tests/` | Unit/oracle test và notebook-contract test. |
| `configs/` | Config đã đăng ký. `*_smoke_v1.json`, `paired_sampling_validation_v1.json` thuộc pilot. |
| `notebooks/` | Colab notebook. 00–02 là nền dữ liệu; 03–10 thuộc pilot; 11–13 dành cho GRAPES-GFN-Rec. |
| `results/` | Summary JSON, rank vector, bundle. |
| `scripts/verify_research_consistency.py` | Checker narrative ↔ evidence ↔ claim boundary. |

## 2. Notebook

| Notebook | Vai trò | Trạng thái |
|---|---|---|
| `00_colab_setup_and_oracles_*` | Toy oracle graph/sampling/objective | Nền, dùng lại |
| `01_amazon_dataset_audit_*` | Exact audit dataset | Nền, dùng lại |
| `02_baby_p4_temporal_graph_*` | Temporal graph `t1/t2`, mapping, warm target | Nền, dùng lại |
| `03_data_story_eda.ipynb` | EDA | Nền, dùng lại |
| `04`–`06` | MostPop, BPR-MF, Full LightGCN (5 epoch) | Sanity cũ; chạy lại ở budget mới |
| `07`–`10` | M0, M1, M2, paired validation | `ARCHIVED PILOT` |
| `11_dataset_deep_analysis_and_dev_split.ipynb` | Phân tích sâu dataset + development split (R1); nhúng `scripts/deep_dataset_analysis.py` | Đã chạy 16/09; kết quả `results/dataset_deep_analysis/`, `results/grapes_gfn_rec_development/` |
| `12_grapes_gfn_rec_development.ipynb` | Backbone adequacy, budget, sweep, feasibility (R3) | Chưa tạo |
| `13_grapes_gfn_rec_paired_holdout.ipynb` | Holdout matrix (R5) | Chưa tạo |

## 3. Artifact dữ liệu nền (trên Google Drive)

`/content/drive/MyDrive/Phase2_Amazon_Audit/g2c_baby_p4/`: `baby_p4_train_edges.csv.gz` (3.868.654 dòng), user/item mapping, `baby_p4_validation_targets.csv.gz` (81.871), `baby_p4_test_targets.csv.gz` (40.587, chưa đọc). SHA-256 trong `results/baby_p4_g2c_manifest.json`.

## 4. Archived pilot

`results/{uniform,degree_aware,frontier_normalized}_sampling_validation/` và `results/paired_sampling_validation/` được giữ nguyên. Không dùng để chọn cấu hình GRAPES-GFN-Rec, không trích như kết quả Phase 2. Bài học được ghi trong spec §2.1 (R-1, R-6).

## 5. Kiểm tra local

Từ `Do An/06_code`, không cần pytest:

```bash
PYTHONPATH=src python3 -m unittest discover -s tests -p 'test_*.py'
python3 scripts/verify_research_consistency.py --repo-root ../..
```

## 6. Quy tắc khi thêm code/notebook

- Viết oracle test trước implementation (T01–T25, G1–G7).
- Notebook development không được đọc current validation/test; checker contract test phải khẳng định điều đó.
- Sampler và recommender dùng optimizer riêng; test gradient ownership bắt buộc.
- Không ghi output mới vào thư mục pilot.
