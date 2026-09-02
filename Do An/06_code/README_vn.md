# Code Scaffold cho Thesis Graph-Sampling

> **Trạng thái:** `DATASET GATE — ĐÃ CHẠY RAW AUDIT TẠM THỜI; PERSISTENCE VÀ PROTOCOL CÒN MỞ`  
> **Mục đích:** tạo nơi executable đầu tiên cho reference contract, dataset control và graph sampler do project phát triển trong Phase 2.  
> **Chưa có:** Amazon artifact/manifest đã finalized, PyTorch/PyG implementation, environment đã khóa, benchmark runner hoặc recommendation-quality result.

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
| Toy correctness test | `IMPLEMENTED VÀ EXECUTED: 10/10 PASS TRÊN CPU` |
| Amazon acquisition/preprocessing | `OPEN` |
| Amazon dataset audit | `IMPLEMENTED; LOCAL RAW AUDIT EXECUTED; PERSISTENT COLAB RUN OPEN` |
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
├── configs/toy_oracles.yaml
├── manifests/data_manifest.schema.json
├── src/grapes_rec/
│   ├── contracts.py
│   ├── sampling.py
│   ├── blocks.py
│   ├── objectives.py
│   ├── data_protocol.py
│   └── models.py
├── tests/test_week1_oracles.py
├── scripts/analyze_amazon_dataset.py
└── docs/TRACEABILITY_en.md / TRACEABILITY_vn.md / DATASET_AUDIT_en.md / _vn.md
```

## Lệnh smoke local hoặc Colab

Từ thư mục `06_code`:

```bash
python -m unittest discover -s tests -v
```

Lệnh này chỉ test pure-Python contract. Kết quả 10/10 hiện tại không được báo cáo như PyTorch/PyG implementation đã validated hoặc end-to-end Colab reproduction.

## Bước implementation dự kiến tiếp theo

1. Tuân theo bounded dataset portfolio trong [`DATASET_PORTFOLIO_AND_ANALYSIS_PROTOCOL_vn.md`](../00_project/DATASET_PORTFOLIO_AND_ANALYSIS_PROTOCOL_vn.md): `All_Beauty` chỉ cho development diagnostic; audit `Baby_Products` là primary candidate; sau đó thực hiện bounded scale audit trên `Home_and_Kitchen`.
2. Giải quyết kết quả absolute-split có OOV cao, sau đó freeze exact artifact, item key, duplicate policy, implicit-positive rule, temporal split, warm-start filtering và negative-sampling policy từ evidence của audit.
3. Xác nhận exact Python/PyTorch/PyG/CUDA lock và ghi trong `environment/`.
4. Thay data interface placeholder bằng Amazon artifact được authorize, checksum và preprocessing chống leakage.
5. Implement dependency test T01–T11 và T16–T17 quanh cùng contract.
6. Implement và execute oracle rủi ro cao T12, T14, T18, T19 và T23.
7. Chỉ thêm matched baseline sampler, GRAPES-informed reference và sampler do project phát triển sau khi shared contract pass.

## Governance của source

Phase 2 implementation phải ghi rõ là port hay reimplement code từ pinned official GRAPES reference commit `71ecebeaac896800aa4dd1d0f38c57ec222ef396`. Phase 1 local snapshot là historical evidence và chỉ đọc.
