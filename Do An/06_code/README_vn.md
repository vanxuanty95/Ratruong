# Code Scaffold cho Thesis Graph-Sampling

> **Trạng thái:** `DATASET GATE G2 PASS — BABY G2-C/G2-D ĐÃ EXECUTE VÀ REVIEW`
> **Mục đích:** tạo nơi executable đầu tiên cho reference contract, dataset control và graph sampler do project phát triển trong Phase 2.  
> **Chưa có:** PyTorch/PyG implementation, final profiling environment đã khóa, benchmark runner hoặc recommendation-quality result.

Package này cố ý chưa có dependency ngoài ở giai đoạn đầu để các contract test nhỏ có thể chạy trên local machine và clean Colab Python runtime. Đây chưa phải model implementation cuối cùng. E0-MIN, G1 và G2 nay đã pass nên có thể execute shared evaluator/baseline G3. Sampler implementation vẫn chờ G3. E0-FINAL được yêu cầu sau đó cho final resource evidence.

## Phạm vi hiện tại

Scaffold hiện encode các GRAPES-informed reference contract từ `02_protocol/GRAPES_RECOMMENDATION_SPEC_vn.md`; đây là comparator và verification candidate, không phải phương pháp luận văn đã cố định:

- user/item ID disjoint và ordered BPR triplet;
- initial target set `V⁰` được deduplicate nhưng không thay đổi triplet order;
- bipartite neighborhood và candidate construction không cumulative;
- exact-cardinality selection và full-Bernoulli log-likelihood hữu hạn;
- sampled block theo source-to-target và primitive prefix propagation tường minh;
- helper cho rectangular normalization;
- BPR loss, two-action REINFORCE gradient oracle và TB loss helper;
- tạm thời loại bỏ cả hai storage direction của current positive edge;
- truy vết từ decision đã freeze và test đã đăng ký tới source module.
- streaming audit bằng standard library cho official Amazon Reviews'23 pure-ID 0-core artifact, gồm checksum, schema, duplicate, rating, timestamp, degree, split coverage và negative-pool diagnostic.

## Ranh giới maturity

| Khu vực | Trạng thái hiện tại |
|---|---|
| Semantic contract | `SCAFFOLDED` |
| Toy correctness test | `IMPLEMENTED VÀ EXECUTED: 13/13 PASS TRÊN CPU` |
| Amazon acquisition/preprocessing | `FULL BABY G2-C/G2-D ĐÃ EXECUTE, READBACK VÀ PASS` |
| Amazon dataset audit | `PORTFOLIO AUDIT ĐÃ EXECUTE; BABY G2-A/G2-B PASS` |
| PyTorch/PyG recommender | `NOT STARTED` |
| Các learned reference variant có thông tin từ GRAPES | `NOT STARTED` |
| Colab launcher | `THIN SKELETON` |
| Environment lock | `E0-MIN PASS; E0-FINAL OPEN` |
| Recommendation metric và resource result | `NOT STARTED` |

## Cấu trúc

```text
06_code/
├── README_en.md / README_vn.md
├── pyproject.toml
├── environment/ENVIRONMENT_LOCK_PENDING.txt
├── notebooks/00_colab_setup_and_oracles_en.ipynb / _vn.ipynb
├── notebooks/01_amazon_dataset_audit_en.ipynb / _vn.ipynb
├── notebooks/02_baby_p4_temporal_graph_en.ipynb / _vn.ipynb
├── configs/toy_oracles.yaml
├── manifests/data_manifest.schema.json
├── src/grapes_rec/
│   ├── contracts.py
│   ├── sampling.py
│   ├── blocks.py
│   ├── objectives.py
│   ├── data_protocol.py
│   └── models.py
├── tests/test_week1_oracles.py / test_dataset_audit.py / test_g2c_notebook.py
├── scripts/analyze_amazon_dataset.py
└── docs/TRACEABILITY_* / DATASET_AUDIT_* / G2C_TEMPORAL_GRAPH_*
```

Notebook `01_amazon_dataset_audit_*` là ngoại lệ của trạng thái thin-launcher tổng quát: mỗi bản ngôn ngữ chứa toàn bộ audit implementation và chạy độc lập, không phụ thuộc `scripts/analyze_amazon_dataset.py`. Script local chỉ là source mirror có thể test; nó không phải dependency của Colab.

## Lệnh smoke local hoặc Colab

Từ thư mục `06_code`:

```bash
python -m unittest discover -s tests -v
```

Lệnh hiện chạy 13 pure-Python test: mười reference-contract test, hai audit test và một end-to-end toy test cho notebook G2-C/G2-D. Full Baby preprocessing đã execute riêng và được mirror tại `results/baby_p4_g2c_manifest.json`; cả hai nguồn vẫn không phải PyTorch/PyG model hoặc recommender result đã validate.

## Bước implementation dự kiến tiếp theo

1. Implement shared exact evaluator G3 và sanity baseline đơn giản nhất.
2. Thêm full-graph LightGCN reference cùng matched uniform/degree-aware control.
3. Dùng reviewed frozen artifact làm shared data interface; không dựng lại ID hoặc graph statistic từ validation/test data.
4. Ghi model environment riêng với bounded CPU/Colab E0-MIN record đã hoàn tất.
5. Freeze final PyTorch/PyG/CUDA profiling environment sau khi xác nhận target GPU.
6. Chỉ áp dụng quy tắc chọn phương pháp bằng validation của G1 sau khi G3 pass.

## Governance của source

Phase 2 implementation phải ghi rõ là port hay reimplement code từ pinned official GRAPES reference commit `71ecebeaac896800aa4dd1d0f38c57ec222ef396`. Phase 1 local snapshot là historical evidence và chỉ đọc.
