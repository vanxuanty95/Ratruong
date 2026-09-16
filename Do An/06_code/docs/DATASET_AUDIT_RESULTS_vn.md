# Kết quả Audit Dataset Amazon do Project tạo ra

> **Trạng thái:** `ĐÃ EXECUTE RAW AUDIT; DATASET GATE G2 PASS SAU REVIEW G2-C/G2-D`
>
> **Ngày execute:** 2026-08-26
> **Đồng bộ:** 2026-09-02 — bổ sung complete protocol result cho `All_Beauty`/`Baby_Products`, quyết định P4 và bounded provenance cho `Home_and_Kitchen`; xem Mục 2a và Mục 7.
>
> **Phạm vi:** Official Amazon Reviews'23 pure-ID 0-core rating-only artifact

## 1. Provenance của lần execute

Hai compressed artifact chính thức được tải vào temporary local path chỉ để phân tích. Chúng không được lưu như project data lâu dài. Exact source URL, compressed byte size và SHA-256 dưới đây là provenance anchor của lần chạy này. Streaming analyzer là [`analyze_amazon_dataset.py`](../scripts/analyze_amazon_dataset.py), configuration được thể hiện trong paired audit notebook.

| Category | Source URL | Compressed bytes | SHA-256 |
|---|---|---:|---|
| `All_Beauty` | [official rating-only artifact](https://mcauleylab.ucsd.edu/public_datasets/data/amazon_2023/benchmark/0core/rating_only/All_Beauty.csv.gz) | 21,954,519 | `54b894e68ad965aa73cdb80d8695c1ed37679c46f38b6f97b21ab0fb585aab24` |
| `Baby_Products` | [official rating-only artifact](https://mcauleylab.ucsd.edu/public_datasets/data/amazon_2023/benchmark/0core/rating_only/Baby_Products.csv.gz) | 148,609,233 | `e2a8d0498afed767ee2615db7fac549559d82490b1a73c7241b84b5e9e8c279e` |

Checksum này định danh bytes đã dùng trong local run. Project phải lặp lại và ghi checksum tại persistent Colab location trước khi artifact được xem là final.

## 2. Schema raw và chất lượng

Cả hai file đều khớp exact header `user_id,parent_asin,rating,timestamp`. Mọi row đều có ID, rating và timestamp parse được. `All_Beauty` đã được exact SQLite duplicate-pair audit. `Baby_Products` ban đầu (2026-08-26) chưa hoàn thành duplicate-pair audit vì SQLite quá chậm ở quy mô raw run tạm thời đó. Persistent protocol audit ngày 2026-09-02 (exact SQLite pair audit trên cùng checksum bytes, lưu tại Google Drive) đã hoàn tất và xác nhận **zero exact duplicate user–item row** cho `Baby_Products`; xem Mục 2a.

| Measure | `All_Beauty` | `Baby_Products` |
|---|---:|---:|
| Raw row | 693,929 | 5,953,891 |
| Valid parsed row | 693,929 | 5,953,891 |
| Unique user | 631,986 | 3,386,206 |
| Unique item (`parent_asin`) | 112,565 | 217,654 |
| Exact unique user–item pair | 693,929 | 5,953,891 (persistent audit 2026-09-02) |
| Exact duplicate user–item row | 0 | 0 (persistent audit 2026-09-02) |
| Missing/parse-invalid field | 0 | 0 |
| Rating ngoài expected range 1–5 | 0 | 1 (`rating = 0.0`) |
| Row share timestamp value | 448 | 32,050 |

Baby row ngoài range được giữ trong raw audit và không bị silently discard. Cách xử lý phải được quyết định rõ trước interaction conversion. Data được xem là key theo `parent_asin` vì đó là key trong pure-ID artifact đã chọn; raw review file có cả `asin` và `parent_asin` không được trộn vào pipeline này.

### 2a. Cập nhật persistent protocol audit (2026-09-02)

Persistent audit chạy trên `Baby_Products_protocol_audit.json` (Google Drive, `sha256` `e2a8d0498afed767ee2615db7fac549559d82490b1a73c7241b84b5e9e8c279e`, `audit_config_sha256` `f72e6b62ae5210fb96078024177eb7e6d2bd6d9c0737acafcaea41007b1649e1`, `retrieved_at` 2026-09-02T11:49:02Z) xác nhận:

- **Duplicate:** `duplicate_user_item_rows = 0` (exact SQLite pair audit) — thay thế trạng thái `UNKNOWN` ở Mục 2.
- **Timestamp tie:** 32,050 row chia sẻ timestamp value với ít nhất một row khác (khớp con số đã ghi ở Mục 2 trong bảng trên; nay được đo lại và xác nhận bằng persistent, checksummed run).
- **Semantic snapshot** (denominator 5,953,890 event sau khi quarantine 1 row `rating = 0.0`): `all_observed` giữ 100.00% (user singleton 70.01%, item singleton 31.65%); `P4` (rating ≥ 4) giữ 78.20% (user singleton 71.64%, item singleton 33.13%); `P5` (rating = 5) giữ 66.74% (user singleton 73.18%, item singleton 34.34%).
- **OOV/warm-start dưới candidate split** (cùng `t1`/`t2` ở Mục 5 bên dưới): test-partition user OOV 83.23% / 85.14% / 86.22% và warm-start target retention 11.50% / 9.82% / 9.21% cho `all_observed` / `P4` / `P5` tương ứng.

Bảng đầy đủ (bao gồm validation-partition) và ranh giới diễn giải là canonical tại [`00_project/DATASET_PORTFOLIO_AND_ANALYSIS_PROTOCOL_vn.md`](../../00_project/DATASET_PORTFOLIO_AND_ANALYSIS_PROTOCOL_vn.md) Mục 2.1; không lặp lại đầy đủ ở đây để tránh hai bản ghi trôi lệch nhau. Trạng thái do chính JSON ghi là `EXACT_PRE_MODEL_PROTOCOL_AUDIT; NO POLICY SELECTED` — chưa policy nào được chọn.

## 3. Degree và sparsity profile

| Statistic | `All_Beauty` | `Baby_Products` |
|---|---:|---:|
| Mean interaction mỗi user | 1.0980 | 1.7583 |
| User degree p50 / p90 / p95 / p99 | 1 / 1 / 2 / 3 | 1 / 3 / 5 / 10 |
| Maximum user degree | 164 | 531 |
| User singleton | 589,163 (93.22%) | 2,370,568 (70.01%) |
| Mean interaction mỗi item | 6.1647 | 27.3548 |
| Item degree p50 / p90 / p95 / p99 | 2 / 11 / 21 / 72 | 3 / 36 / 84 / 450 |
| Maximum item degree | 1,952 | 27,956 |
| Item singleton | 47,947 (42.59%) | 68,888 (31.65%) |
| Binary-edge density | 9.7545e-06 | 8.0783e-06 |

Profile ban đầu rất sparse và bị chi phối bởi user singleton. `Baby_Products` có interaction mass và item degree lớn hơn đáng kể, nhưng vẫn sparse ở user level. Điều này ủng hộ vai trò stress-test candidate, không tự động chứng minh dataset phù hợp.

## 4. Phân phối rating

| Rating | `All_Beauty` | `Baby_Products` |
|---:|---:|---:|
| 0 | 0 | 1 |
| 1 | 100,862 (14.53%) | 555,424 (9.33%) |
| 2 | 42,594 (6.14%) | 309,591 (5.20%) |
| 3 | 55,704 (8.03%) | 433,032 (7.28%) |
| 4 | 78,579 (11.32%) | 681,977 (11.46%) |
| 5 | 416,190 (59.98%) | 3,973,866 (66.78%) |

| Rule | `All_Beauty` | `Baby_Products` |
|---|---:|---:|
| Observed row rating ≥ 1 | 693,929 | 5,953,890 |
| Rating ≥ 2 | 593,067 | 5,398,466 |
| Rating ≥ 3 | 550,473 | 5,088,875 |
| Rating ≥ 4 | 494,769 | 4,655,843 |
| Rating = 5 | 416,190 | 3,973,866 |

Các count tích lũy chỉ là sensitivity evidence. Implicit-positive rule vẫn mở: project phải quyết định mọi observed interaction hay threshold được khai báo trước mới có thể tạo BPR triplet.

## 5. Candidate absolute-temporal split

Official candidate cutoff là `t1 = 1628643414042` và `t2 = 1658002729837` milliseconds, với train `< t1`, validation `[t1,t2)` và test `≥ t2`.

| Category / partition | Rows | Unique users | Unique items | Users not in training | Items not in training |
|---|---:|---:|---:|---:|---:|
| `All_Beauty` train candidate | 583,190 | 534,801 | 95,431 | 0 | 0 |
| `All_Beauty` validation candidate | 71,784 | 68,386 | 24,730 | 63,008 (92.14%) | 12,210 (49.37%) |
| `All_Beauty` test candidate | 38,955 | 36,953 | 12,226 | 34,851 (94.31%) | 7,052 (57.68%) |
| `Baby_Products` train candidate | 4,886,113 | 2,789,765 | 180,415 | 0 | 0 |
| `Baby_Products` validation candidate | 517,373 | 401,145 | 49,390 | 301,130 (75.07%) | 18,032 (36.51%) |
| `Baby_Products` test candidate | 550,405 | 383,264 | 50,190 | 318,972 (83.23%) | 27,156 (54.11%) |

Official absolute split vì vậy chưa tương thích trực tiếp với warm-start specification hiện tại. Split vẫn có thể dùng làm cold-start diagnostic, nhưng nếu dùng làm primary protocol phải có cold-start task được ghi rõ hoặc warm-start exclusion rule đã preregister. Không được xóa các OOV interaction sau khi xem test performance.

## 6. Negative-pool diagnostic

Dùng observed row degree, kích thước candidate-item pool minimum và median là:

| Category | Minimum available items | Median available items | Diễn giải |
|---|---:|---:|---|
| `All_Beauty` | 112,401 | 112,564 | Exact vì duplicate-pair count bằng zero trong run này |
| `Baby_Products` | 217,123 | 217,653 | Exact vì duplicate-pair count đã xác nhận bằng zero (persistent audit 2026-09-02) |

Diagnostic này không freeze negative policy. Negative validity phải check với declared positive universe; project phải quyết định future validation/test positive có bị loại khỏi training-negative pool hay không. Mọi baseline và learned sampler phải dùng cùng triplet, negative item và RNG protocol.

## 7. Kết luận và quyết định mở

1. `All_Beauty` phù hợp validate pipeline và schema, nhưng singleton rate và temporal OOV khiến nó không phù hợp làm primary recommendation evidence theo warm-start design hiện tại.
2. `Baby_Products` đã được chọn làm primary benchmark; exact duplicate-pair audit đã đóng (`VERIFIED 0`) và P4 (`rating >= 4`) là primary interaction policy. Warm-start OOV đã được đối soát trong G2-C và được giữ như giới hạn population.
3. Official absolute split chưa thể adopt làm primary warm-start split nếu chưa revision protocol có ghi nhận.
4. P4, quarantine một row `rating = 0.0`, deterministic duplicate fallback và negative rule là các quyết định đã ghi. Full temporal-graph và bounded-environment evidence về sau đã đóng Baby G2-A đến G2-D ngày 2026-09-03; xem G2-C/G2-D execution guide và manifest.
5. Provenance `Home_and_Kitchen` đã execute: 1,420,416,432 compressed bytes, 66,623,880 row, schema bốn cột hợp lệ và SHA-256 `9be4e2dc8b3dc513c02521644b2ae55f722b2941767e539dcfe518f6bdd4f70b`. Full protocol và scale stress vẫn chưa execute.
6. Bản audit này tự nó không tạo claim về recommendation quality, memory, runtime hoặc scalability. Các model result chạy sau đó nằm trong các thư mục validation riêng.

## 8. Evidence source

- [Amazon Reviews'23 project page](https://amazon-reviews-2023.github.io/main.html)
- [Amazon Reviews'23 0-core processing/statistics](https://amazon-reviews-2023.github.io/data_processing/0core.html)
- [Official benchmark processing README](https://github.com/hyp1231/AmazonReviews2023/blob/main/benchmark_scripts/README.md)
- [Amazon Reviews'23 dataset paper](https://arxiv.org/abs/2403.03952)
- [Recommender evaluation leakage study](https://arxiv.org/abs/2010.11060)
- [Sampled-metric analysis](https://arxiv.org/abs/1912.02263)
