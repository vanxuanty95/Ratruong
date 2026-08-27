# Protocol Audit và Acceptance cho Dataset

> **Trạng thái:** `ĐÃ EXECUTE TEMPORARY RAW AUDIT — DATASET GATE G2 CÒN MỞ`  
> **Ghi nhận:** 2026-08-27  
> **Phạm vi:** Luận văn Thạc sĩ độc lập về graph sampling cho large-scale GNN recommendation.  
> **Ranh giới:** Protocol này kiểm soát data evidence; nó không chọn hoặc validate final sampling method.

## 1. Vai trò dataset

| Vai trò | Dataset | Trạng thái |
|---|---|---|
| Development diagnostic | Amazon Reviews'23 `All_Beauty`, pure-ID 0-core | Chỉ giữ cho preprocessing và sampler diagnostic; không phải primary evidence |
| Primary benchmark candidate | Amazon Reviews'23 `Baby_Products`, pure-ID 0-core | Phải vượt G2-A đến G2-D trước khi freeze |
| Conditional scale stress | Amazon Reviews'23 `Home_and_Kitchen` | Chỉ cần một bounded stress configuration nếu luận văn vẫn giữ large-scale claim |
| Optional validation | MovieLens 25M và Yelp Open Dataset | Chỉ được thêm sau khi Amazon core hoàn thành |

Portfolio đầy đủ, lý do, source và gate được ghi trong [`DATASET_PORTFOLIO_AND_ANALYSIS_PROTOCOL_vn.md`](../../00_project/DATASET_PORTFOLIO_AND_ANALYSIS_PROTOCOL_vn.md).

## 2. Raw-audit evidence hiện có

Project đã execute streaming raw audit trên temporary official Amazon rating-only 0-core artifact ngày 2026-08-26. Temporary raw copy đã được xóa; result record, URL và checksum derived vẫn còn.

| Artifact | Kết quả temporary audit do project tạo | Mục còn mở |
|---|---|---|
| `All_Beauty` | 693,929 valid row; 631,986 user; 112,565 item; zero exact duplicate user–item pair; 93.22% user singleton | Persistent acquisition/manifest và derived strict protocol |
| `Baby_Products` | 5,953,891 valid parsed row; 3,386,206 user; 217,654 item; 70.01% user singleton; một rating `0.0` | Exact duplicate-pair count, persistent acquisition/manifest và derived strict protocol |

Exact SHA-256, rating distribution, degree summary, timestamp coverage và OOV diagnostic nằm trong [`DATASET_AUDIT_RESULTS_vn.md`](./DATASET_AUDIT_RESULTS_vn.md). Raw schema đã verify là `user_id`, `parent_asin`, `rating`, `timestamp`. Đây là temporary-run finding, không chứng minh durable final benchmark artifact đã tồn tại.

Provider absolute split chỉ được audit như diagnostic. OOV coverage cao có nghĩa split này không thể được adopt âm thầm làm primary strict temporal warm-start task.

## 3. Source và provenance

| Field | Trạng thái hiện tại |
|---|---|
| Amazon source family | `SOURCE IDENTIFIED` — Amazon Reviews'23 |
| Raw schema/item key | `TEMPORARY AUDIT VERIFIED` — pure-ID schema với `parent_asin` |
| Temporary checksum và raw count | `RECORDED` trong bilingual result record |
| Persistent raw artifact trong `Do An` | `ABSENT BY DESIGN` — cần acquire raw data vào persistent Colab/project storage trước khi dùng chính thức |
| Access/usage note | `OPEN` — ghi data terms áp dụng cùng persistent acquisition |
| `Baby_Products` duplicate audit | `OPEN` — không suy ra từ provider statement |
| Interaction semantics và split | `OPEN` — freeze trước model training |

Canonical source:

- [Amazon Reviews'23 documentation](https://amazon-reviews-2023.github.io/main.html)
- [0-core processing và statistics](https://amazon-reviews-2023.github.io/data_processing/0core.html)
- [5-core processing và statistics](https://amazon-reviews-2023.github.io/data_processing/5core.html)
- [Official processing README](https://github.com/hyp1231/AmazonReviews2023/blob/main/benchmark_scripts/README.md)
- [All_Beauty 0-core rating-only artifact](https://mcauleylab.ucsd.edu/public_datasets/data/amazon_2023/benchmark/0core/rating_only/All_Beauty.csv.gz)
- [Baby_Products 0-core rating-only artifact](https://mcauleylab.ucsd.edu/public_datasets/data/amazon_2023/benchmark/0core/rating_only/Baby_Products.csv.gz)

Repository MIT license chỉ áp dụng cho code/script trong repository; không được giả định nó license Amazon-derived data. Ghi data-access terms áp dụng cùng persistent download.

## 4. Transformation và control bắt buộc

1. **Raw validation:** validate schema, missing/invalid field, duplicate, timestamp tie, rating distribution, degree, density, connected component và popularity.
2. **Deterministic duplicate treatment:** quarantine invalid row và ghi mọi retained/removed count. Nếu repeated pair tồn tại, dùng earliest-timestamp rule đã khai báo trước cùng stable source-row order cho tie.
3. **Interaction semantics:** audit P4 (`rating >= 4`), P5 (`rating == 5`) và all-observed event. Chọn primary positive policy trước training dựa trên semantic rationale và retained-graph feasibility, không dựa trên test metric. Ghi treatment của Baby rating `0.0`.
4. **Strict temporal warm-start task:** chọn cutoff trước training; chỉ xây graph, mapping, filtering, statistic và sampler feature từ training positive; chỉ giữ validation/test target trong training universe; report exclusion.
5. **Negative và evaluation policy:** lấy training negative chỉ từ training item universe sau khi loại positive đã quan sát tại training time. Headline metric dùng exact full-catalog ranking trên eligible training-item universe; nêu tường minh treatment của future positive.
6. **Scale diagnostic:** log sampled node/edge, memory, sampling time, throughput, degree/popularity divergence, head–tail coverage và connectivity từ training graph.

Provider processing, project interaction semantics, project temporal split và project training-only filtering phải được report như transformation riêng. Provider 5-core data là reproducibility setting, không tự động là strict temporal graph của luận văn.

## 5. Dataset Gate G2

| Gate | Điều kiện |
|---|---|
| G2-A: provenance | Official source, access note, persistent file, checksum, schema và manifest hoàn chỉnh |
| G2-B: semantics | Duplicate policy, xử lý `0.0`, primary positive rule và negative rule được pre-register |
| G2-C: evaluation validity | Temporal split, training-only graph/filtering, warm-start coverage, OOV exclusion và exact candidate rule đã ghi |
| G2-D: primary feasibility | Retained graph `Baby_Products` hỗ trợ baseline dự kiến và exact evaluation trong compute budget đã xác nhận |
| G2-E: scale evidence | `Home_and_Kitchen` provenance/size audit hoàn chỉnh và một bounded stress configuration đã pre-register được execute |
| G2-F: optional expansion | Chỉ xét MovieLens hoặc Yelp sau khi core gate hoàn thành |

## 6. Protocol này không xác lập điều gì

- Không freeze `Baby_Products` làm final benchmark.
- Không xác lập rằng mọi Amazon rating là implicit positive.
- Không xác lập cold-start capability cho pure-ID model.
- Không xác lập model quality, efficiency, scalability, novelty hay superiority.
- Không chọn GRAPES, LightGCN, BPR, RL hay GFlowNet làm final thesis method.

## 7. Scientific anchor

Temporal/training-only control được thúc đẩy bởi [Ji et al., *A Critical Study on Data Leakage in Recommender System Offline Evaluation*](https://arxiv.org/abs/2010.11060). Headline ranking không được thay exact full-catalog ranking bằng sampled candidate mà không công bố, theo [Rendle, *Evaluation Metrics for Item Recommendation under Sampling*](https://arxiv.org/abs/1912.02263). Pairwise-ranking control dự kiến là [BPR](https://arxiv.org/abs/1205.2618); mọi GNN backbone hoặc sampler vẫn thuộc final method-design process.

## 8. Hành động tiếp theo

Lưu persistent primary Amazon artifact và hoàn thành G2-A đến G2-C cho `Baby_Products`. Song song, chỉ ghi provenance và size cho `Home_and_Kitchen`. Không train final sampler hoặc claim benchmark cho đến khi G2-D được quyết định.
