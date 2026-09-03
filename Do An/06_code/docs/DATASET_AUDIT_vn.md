# Protocol Audit và Acceptance cho Dataset

> **Trạng thái:** `ĐÃ EXECUTE PERSISTENT RAW AUDIT — DATASET GATE G2 PASS`
> **Ghi nhận:** 2026-09-02
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

Project đã chạy lại exact streaming raw audit trên official Amazon rating-only 0-core artifact và lưu bền vững cả raw `.csv.gz` object lẫn JSON manifest trong private Google Drive folder `Phase2_Amazon_Audit` ngày 2026-09-02.

| Artifact | Kết quả persistent audit do project tạo | Mục còn mở |
|---|---|---|
| `All_Beauty` | 693,929 valid row; 631,986 user; 112,565 item; zero exact duplicate user–item row; 93.22% user singleton; 448 row tham gia timestamp tie | Hoàn chỉnh metadata G2-A và derived strict protocol |
| `Baby_Products` | 5,953,891 valid parsed row; 3,386,206 user; 217,654 item; zero exact duplicate user–item row; 70.01% user singleton; một rating `0.0` | Exact timestamp-tie audit, hoàn chỉnh metadata G2-A và derived strict protocol |

Persistent hash là `54b894e68ad965aa73cdb80d8695c1ed37679c46f38b6f97b21ab0fb585aab24` cho `All_Beauty` và `e2a8d0498afed767ee2615db7fac549559d82490b1a73c7241b84b5e9e8c279e` cho `Baby_Products`. Raw schema đã verify là `user_id`, `parent_asin`, `rating`, `timestamp`. File [`DATASET_AUDIT_RESULTS_vn.md`](./DATASET_AUDIT_RESULTS_vn.md) cũ phải được đồng bộ trước khi được xem là numerical record hiện hành. Persistent raw evidence đã có, nhưng final transformed benchmark chưa có.

Provider absolute split chỉ được audit như diagnostic. OOV coverage cao có nghĩa split này không thể được adopt âm thầm làm primary strict temporal warm-start task.

## 3. Source và provenance

| Field | Trạng thái hiện tại |
|---|---|
| Amazon source family | `SOURCE IDENTIFIED` — Amazon Reviews'23 |
| Raw schema/item key | `PERSISTENT AUDIT VERIFIED` — pure-ID schema với `parent_asin` |
| Persistent checksum và raw count | `RECORDED` trong private Drive JSON manifest; local result summary cần đồng bộ |
| Persistent raw artifact | `PRESENT IN PRIVATE GOOGLE DRIVE` — raw `.csv.gz` object được giữ ngoài Git |
| Access/usage note | `PARTIAL` — official page xác định McAuley Lab, citation, field và download; không thấy dataset-wide license grant tại đó, nên không gán repository MIT terms cho data |
| `Baby_Products` duplicate audit | `VERIFIED: 0` repeated row theo `(user_id, parent_asin)` |
| `Baby_Products` timestamp-tie audit | `OPEN` — exact counting bị tắt trong persistent run |
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

### Evidence package trong một lần chạy

Mỗi notebook trong cặp `01_amazon_dataset_audit_*` nay là self-contained: notebook nhúng toàn bộ analyzer và không gọi hay cần file `.py` riêng. Sau khi mount Drive, thao tác **Run all** xử lý tuần tự ba Amazon portfolio job. `All_Beauty` và `Baby_Products` chạy full protocol audit; output hợp lệ đã có được dùng lại trừ khi đặt `FORCE_RERUN = True`. `Home_and_Kitchen` chỉ chạy bounded provenance/schema/row-count audit ít tốn bộ nhớ; full scale stress vẫn bị khóa bởi G5-S. Notebook cũng ghi `dataset_portfolio_audit_index.json`. Mỗi full protocol result gồm:

- exact duplicate-pair count và timestamp-tie count;
- quarantine accounting cho rating ngoài `[1, 5]`;
- de-duplication deterministic theo earliest timestamp rồi stable source-row;
- semantic snapshot all-observed, P4 và P5;
- degree, singleton rate, density, temporal partition, user/item OOV, warm-start target retention, training negative availability và exact full-catalog candidate-count diagnostic cho từng snapshot; và
- artifact SHA-256, audit-configuration SHA-256, SHA-256 của audit logic nhúng trong notebook, notebook revision, retrieval metadata cùng access note.

Notebook dùng temporary SQLite database cạnh cached artifact rồi xóa sau khi JSON hoàn tất. Disk space phải đủ cho compressed source cùng temporary event table và index. Run thất bại hoặc bị ngắt có thể để lại file `.protocol_audit.sqlite` để chẩn đoán; run mới sẽ thay file đó. Ba snapshot là evidence để chọn policy, không phải ba model experiment, và notebook chủ ý không tự chọn primary policy.

Self-contained Baby run đầu tiên đã hoàn tất ngày 2026-09-02. Output ban đầu ghi source URL với placeholder `{DATASET_NAME}` chưa expand dù đã đọc đúng persistent bytes `Baby_Products.csv.gz`. Output và notebook đã được sửa minh bạch: category, byte size và SHA-256 vốn đã định danh artifact, mọi numerical result giữ nguyên, và JSON nay có record `provenance_correction`.

Portfolio run đầu tiên hoàn tất hai full protocol job nhưng nhận HTTP 404 cho `Home_and_Kitchen` vì notebook ngoại suy một partial mirror URL sang file chưa được verify trên mirror đó. Notebook nay dùng đúng host/path do official 0-core download link cung cấp, `https://mcauleylab.ucsd.edu/public_datasets/data/...`, và sẽ ghi job `DOWNLOAD_FAILED` nhưng vẫn lưu portfolio index nếu acquisition về sau thất bại.

Corrected rerun đã hoàn tất cả ba governed job và ghi portfolio index. Provenance `Home_and_Kitchen` ghi 1,420,416,432 compressed bytes, 66,623,880 row, schema bốn cột đúng yêu cầu và SHA-256 `9be4e2dc8b3dc513c02521644b2ae55f722b2941767e539dcfe518f6bdd4f70b`. Đây chỉ là exact-byte/source fact; full protocol và scale-stress measurement vẫn chưa execute.

## 5. Dataset Gate G2

| Gate | Điều kiện |
|---|---|
| G2-A: provenance | Official source, access note, persistent file, checksum, schema và manifest hoàn chỉnh |
| G2-B: semantics | Duplicate policy, xử lý `0.0`, primary positive rule và negative rule được pre-register |
| G2-C: evaluation validity | Temporal split, training-only graph/filtering, warm-start coverage, OOV exclusion và exact candidate rule đã ghi |
| G2-D: primary feasibility | Bounded execution không tạo headline result ghi retained-graph statistic và feasibility của pipeline/evaluator; không tune, so sánh sampler hay claim final metric |
| G5-S: conditional scale evidence | Chỉ execute stress trên `Home_and_Kitchen` sau G3/G4 nếu giữ claim large-scale; hiện tại chỉ làm provenance/size/planning |
| Optional expansion | Chỉ xét MovieLens hoặc Yelp sau khi các gate Amazon core pass |

## 6. Protocol này không xác lập điều gì

- Không freeze `Baby_Products` làm final benchmark.
- Không xác lập rằng mọi Amazon rating là implicit positive.
- Không xác lập cold-start capability cho pure-ID model.
- Không xác lập model quality, efficiency, scalability, novelty hay superiority.
- Không chọn GRAPES, LightGCN, BPR, RL hay GFlowNet làm final thesis method.

## 7. Scientific anchor

Temporal/training-only control được thúc đẩy bởi [Ji et al., *A Critical Study on Data Leakage in Recommender System Offline Evaluation*](https://arxiv.org/abs/2010.11060). Headline ranking không được thay exact full-catalog ranking bằng sampled candidate mà không công bố, theo [Rendle, *Evaluation Metrics for Item Recommendation under Sampling*](https://arxiv.org/abs/1912.02263). Pairwise-ranking control dự kiến là [BPR](https://arxiv.org/abs/1205.2618); mọi GNN backbone hoặc sampler vẫn thuộc final method-design process.

## 8. Hành động tiếp theo

Baby P4 temporal graph cùng bounded environment replay về sau đã hoàn tất các bước này; G2-A đến G2-D nay đều pass. Tiếp tục shared evaluator/baseline G3 mà không xem measurement G2 là model benchmark.
