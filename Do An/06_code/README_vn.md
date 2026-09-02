# Code Scaffold cho Thesis Graph-Sampling

> **Trạng thái:** `DATASET GATE — PORTFOLIO AUDIT HOÀN TẤT; BABY G2-C/G2-D ĐÃ IMPLEMENT, FULL RUN CÒN MỞ`
> **Mục đích:** tạo nơi executable đầu tiên cho reference contract, dataset control và graph sampler do project phát triển trong Phase 2.  
> **Chưa có:** full Baby G2-C artifact/cutoff freeze đã review, PyTorch/PyG implementation, final environment đã khóa, benchmark runner hoặc recommendation-quality result.

Package này cố ý chưa có dependency ngoài ở giai đoạn đầu để các contract test nhỏ có thể chạy trên local machine và clean Colab Python runtime. Đây chưa phải model implementation cuối cùng. Theo registry gate chuẩn, E0-MIN và G2 phải pass trước khi execute G3; sampler implementation còn phải chờ G1 và G3. E0-FINAL được yêu cầu sau đó cho final resource evidence.

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
| Amazon acquisition/preprocessing | `ĐÃ IMPLEMENT VÀ TOY-EXECUTE NOTEBOOK G2-C/G2-D; FULL BABY RUN CÒN MỞ` |
| Amazon dataset audit | `PORTFOLIO AUDIT ĐÃ EXECUTE; BABY G2-A/G2-B PASS` |
| PyTorch/PyG recommender | `NOT STARTED` |
| Các learned reference variant có thông tin từ GRAPES | `NOT STARTED` |
| Colab launcher | `THIN SKELETON` |
| Environment lock | `OPEN` |
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

Lệnh hiện chạy 13 pure-Python test: mười reference-contract test, hai audit test và một end-to-end toy test cho notebook G2-C/G2-D. Kết quả không được báo cáo như PyTorch/PyG implementation đã validated, full Baby preprocessing execution hoặc end-to-end model reproduction.

## Bước implementation dự kiến tiếp theo

1. Run all `02_baby_p4_temporal_graph_vn.ipynb` hoặc `_en.ipynb` trên Drive và đọc lại `baby_p4_g2c_manifest.json` cùng năm compressed artifact.
2. Verify reconciliation, candidate invariant, artifact hash, graph/component/OOV statistic và bounded resource measurement; sau đó chấp nhận hoặc sửa `t1`/`t2` rồi quyết định G2-C/G2-D.
3. Xác nhận E0-MIN Python/environment record chạy lại được trước G3; giữ final PyTorch/PyG/CUDA lock riêng cho profiling.
4. Dùng reviewed frozen artifact làm shared data interface; không dựng lại ID hoặc graph statistic từ validation/test data.
5. Sau khi G2 và E0-MIN pass, implement shared exact evaluator cùng baseline đơn giản nhất trong G3.
6. Chỉ thêm matched sampling control và GRAPES-informed reference theo dependency của canonical gate; sampler do project phát triển vẫn chờ G1–G3.

## Governance của source

Phase 2 implementation phải ghi rõ là port hay reimplement code từ pinned official GRAPES reference commit `71ecebeaac896800aa4dd1d0f38c57ec222ef396`. Phase 1 local snapshot là historical evidence và chỉ đọc.
