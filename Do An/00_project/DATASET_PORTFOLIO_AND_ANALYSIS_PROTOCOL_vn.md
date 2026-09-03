# Danh mục Dataset và Protocol Phân tích

> **Trạng thái:** `ĐÃ KHÓA PRIMARY DATASET VÀ PROTOCOL — DATASET GATE G2 PASS`
> **Ghi nhận:** 2026-08-26  
> **Cập nhật:** 2026-09-03 — Baby manifest mới đã ghi exact environment metadata, verify năm artifact và replay bounded G2-D với mọi invariant đã đăng ký đều đúng. Baby G2-A đến G2-D và E0-MIN pass. Full execution `Home_and_Kitchen` vẫn thuộc conditional G5-S.
> **Phạm vi:** Luận văn Thạc sĩ độc lập: *Phát triển phương pháp lấy mẫu đồ thị cho hệ thống gợi ý quy mô lớn sử dụng mạng nơ-ron đồ thị GNN.*  
> **Ranh giới claim:** Đây là record cho thiết kế nghiên cứu, không phải kết quả thực nghiệm hoặc đặc tả phương pháp cuối.

## 1. Các câu hỏi protocol này phải trả lời

1. Dataset user–item nào có ý nghĩa ngữ nghĩa, tái lập được và đủ lớn để đánh giá graph sampling trong GNN recommendation?
2. Raw dataset của mỗi nguồn cần được biến đổi như thế nào thành implicit-ranking task mà không dùng future interaction trong graph construction, filtering hoặc training negative?
3. Proposed sampler có duy trì ranking quality ở sampling/computation budget cố định trong khi giảm resource cost hoặc cải thiện trade-off accuracy–cost không?
4. Kết luận có đứng vững trên một e-commerce graph chính và một graph lớn hơn rõ rệt, thay vì chỉ trên pilot dataset thuận tiện không?

Phương pháp vẫn `OPEN`. GRAPES là tài liệu nền và comparator có cơ sở literature; nó không phải phương pháp luận văn đã cố định và kết quả của nó không tự động chuyển sang recommendation.

### 1.1 Dataset Gate G2 là gì

G2 là **cổng quyết định dataset và evaluation protocol trước khi train model**. Gate này phải xác lập exact bytes nào được dùng, interaction/anomaly/duplicate/negative có nghĩa gì, future information bị loại khỏi training graph thế nào, warm-start population nào được đánh giá, exact candidate được dựng ra sao và bounded path có thực thi được không. Bốn phần gồm G2-A về provenance; G2-B về interaction/duplicate/negative semantics; G2-C về temporal training-only graph, mapping, OOV cohort và exact candidate; G2-D về bounded feasibility không tạo headline result. G2 không chọn final sampler và không thể tạo claim về recommendation quality hoặc scalability.

## 2. Danh mục dataset có giới hạn

| Vai trò | Dataset và nguồn | Lý do đưa vào | Evidence cần có | Quyết định hiện tại |
|---|---|---|---|---|
| Chỉ development/diagnostic | Amazon Reviews'23 `All_Beauty`, pure-ID 0-core | Đã có exact audit; thuận tiện để validate deterministic preprocessing và sampler diagnostic trước các run tốn kém | Raw audit cho thấy 693,929 row, 631,986 user, 112,565 item và 93.22% user singleton | **Không dùng làm primary evidence.** Singleton rate khiến nó không phù hợp làm benchmark warm-start temporal chính. |
| Primary benchmark | Amazon Reviews'23 `Baby_Products` | Product-review domain; user–item rating có timestamp; retained scale đủ để kiểm tra trade-off accuracy–cost | Raw audit cùng full P4 temporal artifact: 3,868,654 training edge, 2,318,308 training user, 162,125 training item; exact OOV ledger/candidate và bounded environment replay | **Primary dataset; G2-A/G2-B/G2-C/G2-D PASS.** |
| Scale-stress candidate | Amazon Reviews'23 `Home_and_Kitchen` | Cùng source family và semantics với benchmark chính; artifact 0-core do project xác minh có 66,623,880 row (1,420,416,432 compressed bytes), còn metadata 5-core chính thức ghi 28.2M interaction, 2.9M user và 763.6K item | Provenance/schema/row-count audit đã `EXECUTED`; full protocol và bounded resource experiment vẫn bị gate | **Đã acquire provenance. Chỉ bắt buộc scale stress nếu luận văn giữ claim “large-scale”.** Không phải ablation suite đầy đủ thứ hai. |
| Controlled diagnostic tùy chọn | MovieLens 25M | Dataset nghiên cứu ổn định, có timestamp và checksum, gồm 25,000,095 rating từ 162,541 user trên 62,423 phim | Manifest và protocol audit riêng | **Tùy chọn.** Chỉ dùng sau khi có core Amazon evidence; nó không phải bằng chứng chính cho web-scale sparsity. |
| External-domain validation tùy chọn | Yelp Open Dataset | Domain doanh nghiệp địa phương khác; nguồn chính thức có review và business | Schema, terms và protocol audit riêng | **Tùy chọn.** Chỉ thêm nếu còn thời gian sau Amazon core; không được làm chậm evidence trung tâm. |

Vì vậy, bộ evidence tối thiểu dự kiến là **`Baby_Products` cùng một bounded scale stress test trên `Home_and_Kitchen`**. `All_Beauty` chỉ hữu ích cho development control. Không lên kế hoạch benchmark đầy đủ thứ ba trước khi hai dataset core vượt qua gate.

### 2.1 Tiêu chí phân loại vai trò dataset

Vai trò được gán trước khi có downstream model score và mỗi vai trò trả lời một câu hỏi nghiên cứu khác nhau:

| Vai trò | Tiêu chí phân loại | Mức xử lý bắt buộc | Dataset hiện tại và lý do |
|---|---|---|---|
| Primary benchmark | Semantics khớp task luận văn; retained graph đủ lớn và có cấu trúc không tầm thường; còn warm-start cohort có thể bảo vệ; full preprocessing/evaluation khả thi và tái lập; được dùng cho headline quality–cost evidence | Full G2-A đến G2-D, sau đó matched experiment G3–G5 | `Baby_Products`: hàng triệu event, user/item universe lớn hơn rõ rệt All Beauty, singleton burden thấp hơn và vẫn đủ giới hạn cho repeated controlled run |
| Development/diagnostic | Schema/semantics tương đương; đủ nhỏ để debug nhanh; bộc lộ edge case hoặc lỗi implementation; population không đủ đại diện cho primary estimand | Full audit và targeted pipeline check; không bắt buộc thành headline benchmark thứ hai | `All_Beauty`: cùng source family/schema nhưng raw user singleton rate 93.22% và candidate warm-target retention cực thấp làm primary estimand quá hẹp |
| Scale stress | Lớn hơn primary graph rõ rệt; semantics đủ so sánh; dùng kiểm tra resource behavior và ranh giới large-scale claim; execution cost đủ cao để hoãn tới khi task/method ổn định và có compute | Provenance/size trước; chỉ bounded G5-S execution nếu luận văn giữ large-scale claim | `Home_and_Kitchen`: 66,623,880 row, khoảng 11.19 lần Baby theo raw row; full processing bị gate để tránh tốn tài nguyên scale-run khi protocol và method chưa ổn định |
| External/control tùy chọn | Bổ sung domain hoặc benchmark diversity nhưng không cần cho core claim và không được làm chậm Amazon evidence bắt buộc | Audit riêng và chỉ targeted experiment nếu còn thời gian | MovieLens/Yelp vẫn tùy chọn |

Phân loại này giải thích phạm vi notebook. Portfolio-audit notebook xử lý cả ba Amazon category được quản trị; full G2-C/G2-D notebook hiện chỉ có Baby vì G2 đóng trên primary task. All Beauty có thể tái sử dụng path parameterized cho diagnostic về sau nhưng không cần để đóng G2. Home không được âm thầm chạy cùng full path trước quyết định conditional G5-S. Chỉ được đổi vai trò qua gate review có record dựa trên pre-model validity/feasibility evidence; không được dùng model score về sau để đổi nhãn dataset hồi tố.

### 2.2 Bằng chứng protocol audit persistent cho `Baby_Products` (ghi nhận 2026-09-02)

Project đã chạy self-contained Colab notebook (`notebook_revision: self-contained-protocol-audit-v1-2026-09-02`) trên exact downloaded bytes của `Baby_Products` 0-core (SHA-256 `e2a8d0498afed767ee2615db7fac549559d82490b1a73c7241b84b5e9e8c279e`, `audit_config_sha256` `f72e6b62ae5210fb96078024177eb7e6d2bd6d9c0737acafcaea41007b1649e1`) và lưu kết quả tại `Baby_Products_protocol_audit.json` trong Google Drive riêng của người dùng (`retrieved_at` 2026-09-02T11:49:02Z). Trạng thái do chính JSON ghi là `EXACT_PRE_MODEL_PROTOCOL_AUDIT; NO POLICY SELECTED` và `post_filter_counts.status = NOT APPLIED`: đây là evidence chẩn đoán trước quyết định, không phải primary policy, duplicate/`0.0` treatment hay temporal split đã chọn.

**Duplicate và timestamp.** Exact SQLite pair audit xác nhận `duplicate_user_item_rows = 0` cho toàn bộ `Baby_Products` (trước đây `UNKNOWN`). Một audit timestamp riêng — đo được lần đầu ở persistent run này — cho thấy 32.050 row chia sẻ giá trị timestamp với ít nhất một row khác; đây là shared-timestamp-value count, khác với duplicate-pair count (vẫn là zero). Một row có `rating = 0.0` (ngoài range 1–5) bị quarantine bởi `anomaly_policy: quarantine_outside_rating_range_1_to_5` trước khi tính ba semantic snapshot bên dưới; đây là quarantine rule dùng để tạo con số chẩn đoán, chưa phải quyết định treatment cuối cùng cho `0.0`.

**Retention và sparsity theo candidate policy** (denominator: 5.953.890 event sau quarantine):

| Policy | Event giữ lại | % giữ lại | User singleton rate | Item singleton rate | Bipartite density |
|---|---:|---:|---:|---:|---:|
| `all_observed` (rating 1–5) | 5,953,890 | 100.00% | 70.01% | 31.65% | 8.0783e-06 |
| `P4` (rating ≥ 4) | 4,655,843 | 78.20% | 71.64% | 33.13% | 8.6340e-06 |
| `P5` (rating = 5) | 3,973,866 | 66.74% | 73.18% | 34.34% | 8.8074e-06 |

**OOV và warm-start retention dưới candidate absolute split** (provider-style cutoff `t1`/`t2` — cùng cutoff candidate đã ghi trong `DATASET_AUDIT_RESULTS_vn.md`, `status: CANDIDATE; NOT FROZEN`, chưa phải split chính thức của luận văn):

| Policy | Test user OOV | Test item OOV | Test warm-start retention | Validation user OOV | Validation item OOV | Validation warm-start retention |
|---|---:|---:|---:|---:|---:|---:|
| `all_observed` | 83.23% | 54.11% | 11.50% | 75.07% | 36.51% | 24.50% |
| `P4` | 85.14% | 54.20% | 9.82% | 77.43% | 36.70% | 21.90% |
| `P5` | 86.22% | 54.25% | 9.21% | 78.88% | 36.75% | 20.34% |

Dưới cả ba policy, `training_negative_pool.users_with_zero_available_negatives = 0`: không user nào trong training universe thiếu negative item khả dụng.

**Ranh giới evidence.** Ba snapshot trên là input cho một quyết định pre-registered, không phải bản thân quyết định: không được chọn policy chỉ vì retention cao nhất hoặc OOV thấp nhất (Mục 5, quy tắc 2). Số liệu chỉ mô tả candidate split/candidate policy trên `Baby_Products` 0-core; không suy ra cho `Home_and_Kitchen`, `All_Beauty` hay bất kỳ model/scalability claim nào. `G2-A` hiện có checksum, schema, manifest và `audit_config_sha256` ở mức `VERIFIED` cho `Baby_Products`; `license_or_access_note` vẫn `PARTIAL`/`NEEDS VERIFICATION` vì official page không có dataset-wide license grant tường minh, nên `G2-A` chưa đóng. `G2-B` (duplicate policy, xử lý `0.0`, primary P4/P5/all-observed policy, negative rule) hiện có đủ raw evidence để quyết định nhưng vẫn `MỞ` vì chưa policy nào được pre-register.

### 2.3 Quyết định primary interaction policy cho `Baby_Products` (2026-09-02)

**Quyết định:** Primary interaction-positive policy là **`P4` (`rating >= 4`)**. Row `rating = 0.0` (n=1, ngoài range 1–5) bị loại vĩnh viễn khỏi mọi snapshot. Duplicate policy giữ nguyên rule đã pre-register trước khi có kết quả (earliest-timestamp, sau đó stable source-row order — hiện moot cho `Baby_Products` vì duplicate count đã xác nhận bằng 0). Negative rule giữ nguyên đặc tả đã pre-register ở Mục 4 (training negative từ training item universe sau khi loại positive đã biết; evaluation dùng full eligible-item-universe, loại item đã observed).

**Quy trình quyết định.** Hai independent reviewer được giao vai trò khác nhau: **Fisher** lập luận từ semantic/literature (positive edge trong BPR/GNN phải mã hoá affinity, không phải "có interaction"; rating 1–3 sao là trải nghiệm trung lập/tiêu cực nên không nên là positive; `P5` loại bỏ oan positive hợp lệ ở 4 sao). **Neyman** lập luận từ feasibility/experimental-design (warm-start test cohort đã scarce ở cả ba policy, 9.2–11.5%; `P5` co cohort thêm và đe doạ độ ổn định của per-popularity-stratum reporting dưới exact full-catalog ranking; `all_observed` trộn positive thật với trải nghiệm tiêu cực, làm yếu chính premise mà sampler được đánh giá dựa trên). Cả hai độc lập đề xuất `P4`. Cross-critique xác nhận đây là hai luận cứ thực sự khác nhau hội tụ, không phải anchoring vào cùng một con số — nhưng cũng chỉ ra **giới hạn phương pháp**: cả hai reviewer đều được cho xem bảng retention/OOV *trước khi* lập luận (không phải blind hoàn toàn với evidence), nên "độc lập" ở đây mô tả chuỗi lập luận, không phải việc không tiếp xúc với số liệu. Quyết định vẫn hợp lệ theo quy tắc "không dựa trên downstream model result" của project vì đây là feasibility diagnostic trên raw/candidate data, không phải model metric, và được chốt trước khi xây temporal graph hay train bất kỳ model nào.

**Trạng thái gate tại thời điểm quyết định này:** `G2-A` và `G2-B` = `PASS`. Mục 2.4 ghi full execution và review G2-C/G2-D tiếp theo.

### 2.4 Full Baby G2-C/G2-D execution và diễn giải (2026-09-02)

Manifest Drive `baby_p4_g2c_manifest.json` (file ID `1sOUhOCFugfATnDrzwnULcaaakRLPCyHu`) đã được đọc lại cùng folder listing của năm artifact. Mọi Drive byte size khớp manifest, source checksum khớp governed Baby artifact và embedded implementation hash khớp notebook song ngữ local.

| Evidence | Kết quả execute | Diễn giải |
|---|---:|---|
| P4 temporal partition | 3,868,654 train (83.09%); 373,776 validation candidate (8.03%); 413,413 test candidate (8.88%) | Candidate cutoff tạo later period deterministic và không dùng model result |
| Frozen training graph | 2,318,308 user; 162,125 item; 3,868,654 edge; density `1.0293e-05` | Đây là graph model tương lai được phép thấy; graph lớn và rất thưa |
| User degree | p50 1, p90 3, p99 9; 71.76% singleton | User activity long-tail cực mạnh nên sampling/coverage analysis phải chia theo degree |
| Item degree | p50 3, p90 32, p99 397, max 21,348; 33.35% singleton | Item popularity tập trung mạnh; average degree sẽ che head–tail imbalance |
| Connectivity | 34,288 component; largest component 2,393,587 node = 96.50%; zero singleton component | Phần lớn retained node liên thông qua một giant component cho message passing, nhưng fragmentation vẫn phải report |
| Validation warm cohort | 81,871/373,776 = 21.90%; 291,905 exclusion đối soát đúng | Primary claim chỉ bao phủ user/item đã biết trong training; không bao phủ cold-start target bị loại |
| Test warm cohort | 40,587/413,413 = 9.82%; 372,826 exclusion đối soát đúng | Test coverage hẹp nhưng còn absolute target count đáng kể; headline wording phải nói rõ warm-start |
| Exact-candidate dry traversal | 100 target × 162,125 item = 16,212,500 comparison; 16,209,544 eligible; hai invariant đúng | Chunked full-catalog candidate construction thực thi được và target-safe trên bounded sample |
| Bounded resource | 1.098 giây wall time; 158.24 MiB process peak RSS; chunk size 16,384 | Chỉ mô tả traversal này, không phải model runtime, final profiling hoặc scalability |

Arithmetic review xác nhận train + validation + test bằng toàn bộ 4,655,843 P4 event; mọi warm/excluded ledger và tổng exclusion-reason đều đối soát; mapping/edge/target artifact row count khớp graph/partition count; component node bằng user cộng item; dry traversal loại trung bình 29.56 prior-history item trên mỗi target được test.

**Quyết định:** G2-C và G2-D = `PASS`; do đó Dataset Gate G2 và E0-MIN đóng ngày 2026-09-03. Cutoff `t1 = 1628643414042`, `t2 = 1658002729837`, half-open tie rule, minimum degree 1, training-only mapping, warm-start cohort và full eligible training-item candidate rule tiếp tục được freeze. Manifest mới verify byte size và SHA-256 của cả năm artifact. Environment ghi CPython 3.13.15, Linux 6.6.122, Intel Xeon 2 logical CPU, RAM 12,975.53 MiB, không GPU, Google Colab 1.0.0 và ipykernel 6.17.1. Replay 100 target tái lập 16,212,500 catalog comparison và 16,209,544 eligible candidate với cả bốn replay invariant đúng. Bằng chứng này chỉ xác lập bounded pipeline/evaluator feasibility có thể tái lập; không phải model-quality, comparative profiling, GPU hoặc scalability evidence.

## 3. Nguồn chính thức và ý nghĩa dữ liệu

- **Amazon Reviews'23:** dùng [dataset documentation](https://amazon-reviews-2023.github.io/main.html), [0-core processing page](https://amazon-reviews-2023.github.io/data_processing/0core.html) và [5-core processing page](https://amazon-reviews-2023.github.io/data_processing/5core.html) chính thức. Schema pure-ID rating-only là `user_id`, `parent_asin`, `rating`, `timestamp`; không thay `parent_asin` bằng `asin` ở mức biến thể.
- **Ranh giới vai trò Amazon:** review/rating là observed explicit-feedback event. Nó không phải bằng chứng về purchase, click hay implicit positive. Việc chuyển thành ranking positive là project transformation và phải được khai báo trước training.
- **MovieLens 25M:** [official GroupLens release](https://grouplens.org/datasets/movielens/25m/) ổn định và có 25 triệu rating, timestamp, checksum cùng README cho research use. Đây là controlled benchmark mạnh nhưng có population được chọn theo activity và sparsity khác Amazon.
- **Yelp Open Dataset:** [official Yelp page](https://business.yelp.com/data/resources/open-dataset/) mô tả subset dùng cho giáo dục với 6,990,280 review và 150,346 business. Semantics business-review cùng điều khoản riêng đòi hỏi audit độc lập; không được xem như tương đương Amazon.

Amazon 5-core chính thức hữu ích cho comparison có thể tái lập, nhưng provider k-core processing diễn ra trước split đã công bố. Không được âm thầm mô tả nó là strict temporally filtered training graph của luận văn.

## 4. Protocol phân tích và preprocessing

Với mọi candidate dataset, tạo immutable manifest gồm URL, ngày tải, file size, checksum, access/usage note, schema, source version, preprocessing configuration và code commit.

1. **Audit raw data.** Validate ID, rating, timestamp, duplicate, timestamp tie, số row/user/item/pair, rating distribution, degree quantile, singleton rate, density, connected component và head–tail popularity.
2. **Xử lý repeated interaction một cách deterministic.** Quarantine data không hợp lệ. Nếu có duplicate pair, dùng tie-breaker đã khai báo trước (timestamp sớm nhất, sau đó stable source-row order) và report toàn bộ số row removed/retained. Policy provider nêu ra là evidence cần verify, không thay thế audit.
3. **Freeze interaction semantics trước model training.** Audit `rating >= 4` (P4), `rating == 5` (P5) và all-observed event. Chọn một policy chính theo lý do semantic và feasibility trước khi xem result; chỉ chạy tối đa một targeted sensitivity analysis. Baby rating `0.0` cần một cách xử lý tường minh đã ghi record.
4. **Tạo strict temporal warm-start task chính.** Chọn cutoff trước training; chỉ xây graph từ training positive; chỉ suy ra filtering, mapping, degree, normalization, popularity feature và sampler statistic từ graph đó. Chỉ giữ validation/test target khi user và item thuộc training universe đã freeze, đồng thời report mọi exclusion.
5. **Tách cold-start.** OOV user/item chỉ là diagnostic phụ nếu method cuối có cold-start mechanism được đặc tả. Pure-ID embedding model không thể claim cold-start ability.
6. **Định nghĩa negative và candidate tường minh.** Training negative được lấy từ training item universe sau khi loại positive của user đã biết tại training time. Evaluation xếp hạng full eligible training-item universe và loại item user đã observed trước đó. Không dùng sampled-candidate metric làm headline result vì sampled candidate có thể đổi ranking giữa các model.
7. **Audit sampling pressure.** Trên training graph, log sampling time, sampled user/item/edge, GPU/CPU memory, throughput, degree/popularity divergence, head–tail coverage, connectivity, batch overlap và inclusion frequency. Các chỉ số này cho biết graph có thực sự kiểm tra sampling method hay không.

Raw-audit finding rằng provider absolute split có OOV rate cao là protocol finding, không phải lý do loại Amazon. Nó cho thấy published split không thể tự động là primary warm-start protocol.

## 5. Hướng dẫn diễn giải nghiên cứu cho dataset audit

Audit là một chuỗi quyết định nghiên cứu, không phải checklist biến trực tiếp raw count thành quyết định chấp nhận dataset. Mỗi statistic được báo cáo phải nêu rõ **analysis population** mà nó mô tả: (a) raw valid event, (b) event được giữ theo từng candidate positive policy, (c) frozen training graph sau training-only filtering, hoặc (d) warm-start validation/test cohort. Không so sánh số liệu giữa các population này như thể chúng mô tả cùng một graph.

| Evidence từ audit | Diễn giải có thể bảo vệ | Quyết định có thể được hỗ trợ | Điều **không** được suy ra |
|---|---|---|---|
| ID, rating hoặc timestamp không hợp lệ | Đo mức phù hợp với source/schema và xác định record cần quarantine theo cách deterministic | Chất lượng provenance G2-A và policy xử lý invalid row được ghi lại | Mọi event không bị flag đều là positive hợp lệ về mặt ngữ nghĩa |
| User–item pair lặp và timestamp tie | Cho thấy sự mơ hồ về định danh hoặc thứ tự event; độ nhạy phụ thuộc số user/item và temporal target bị ảnh hưởng, không chỉ row count | Quy tắc duplicate/tie ở G2-B và nhu cầu targeted sensitivity check | Repeated review chắc chắn là duplicate do lỗi, hoặc provider đã xử lý đúng yêu cầu của project |
| Rating distribution và mức giữ lại theo P4/P5/all-observed | Định lượng hệ quả về ngữ nghĩa và quy mô của từng candidate positive definition | Chọn primary interaction policy trước khi xem result, dựa đồng thời trên domain meaning và retained feasibility | Policy tạo graph lớn nhất hoặc metric tốt nhất về sau là policy hợp lệ nhất |
| Degree quantile của user/item, singleton rate và head–tail concentration | Mô tả sparsity, activity imbalance và sampling pressure có khả năng xuất hiện; phải report cho cả hai phía của bipartite graph | Warm-start ranking task có còn ý nghĩa không và cần diagnostic theo popularity stratum nào | Chỉ riêng sparsity đã chứng minh dataset là large-scale, khó, hoặc thuận lợi cho proposed sampler |
| Density và connected component | Mô tả fragmentation và cấu trúc reachable cho message passing sau mỗi transformation | Cách xử lý component, report isolated node và feasibility của GNN backbone đã chọn | Recommendation quality, sampler superiority hoặc multi-hop signal hữu hiệu |
| Temporal coverage, tie tại cutoff và activity drift | Kiểm tra split đã chọn có đại diện cho ordered prediction task không và các period có khác nhau đáng kể không | Quy tắc cutoff/tie, temporal stratum và giới hạn khi generalize qua thời gian | Quan hệ nhân quả hoặc hoàn toàn không có temporal bias |
| Warm-start retention và exclusion do user/item OOV | Định lượng estimand do pure-ID warm-start protocol tạo ra và tỷ lệ future cohort bị loại | Quyết định G2-C, định nghĩa cohort và nhu cầu thu hẹp claim hoặc thêm cold-start method riêng | Performance trên user/item bị loại hoặc quyền che giấu cohort có coverage thấp |
| Kích thước eligible item universe và exclusion positive/negative | Định nghĩa độ khó của ranking task và xác minh candidate/negative tuân thủ ranh giới thời gian và thông tin | Feasibility của exact evaluation và negative/candidate policy đã đăng ký | Unobserved item là true negative, hoặc sampled-candidate metric có thể so sánh với full-catalog metric |
| Retained node/edge cùng evaluator time và memory đo trong bounded dry-run | Chỉ xác lập pipeline và evaluator path đã khai báo có chạy được dưới configuration đã ghi hay không | G2-D feasibility và compute planning về sau | Model quality, thứ hạng sampler, scalability ngoài configuration đã test hoặc quyền tune ở G2-D |
| Sampling-pressure diagnostic trên frozen training graph | Cho thấy exposure bias, coverage, overlap và structural distortion do sampler tạo ra | Sampler ablation và diễn giải accuracy–cost sau khi các gate liên quan pass | Lợi ích nếu chưa liên kết với downstream quality và resource evidence trong matched comparison |

Áp dụng các quy tắc diễn giải sau:

1. **Dùng denominator và attrition path.** Report cả count và rate, đồng thời nêu denominator. Đối soát đường đi từ downloaded row đến valid event, semantic positive, training edge và retained evaluation target; phần hao hụt không giải thích được là audit check thất bại.
2. **Không tự đặt universal pass threshold.** Singleton, OOV, tail hoặc component rate cao là cảnh báo; hệ quả phụ thuộc estimand và model dự kiến. Acceptance criterion phải được pre-register và biện minh bằng task validity cùng compute feasibility, không được chọn sau khi xem model result.
3. **Tách source fact, project transformation và derived finding.** Provider documentation, quan sát checksum/schema, transformation rule và computed statistic phải được gắn nhãn riêng. Count do project tính không verify provider claim nếu definition không trùng khớp.
4. **Xem comparison là mô tả cho đến khi được kiểm soát.** Khác biệt giữa dataset hoặc snapshot P4/P5/all-observed có thể do semantics, filtering, time coverage và population composition. Chúng không cô lập causal effect của scale hay sparsity.
5. **Lan truyền uncertainty và unresolved check.** Đánh dấu duplicate scan chưa hoàn tất, anomalous record, approximate count hoặc source behavior chưa verify bằng `OPEN`, `UNKNOWN` hoặc `NEEDS VERIFICATION`. Không để downstream table âm thầm biến chúng thành exact fact.
6. **Khớp phạm vi claim với retained cohort.** Primary result chỉ có thể mô tả frozen warm-start population. Claim về cold-start, toàn bộ raw population, cross-domain và large-scale cần evidence riêng; nếu không phải thu hẹp wording của luận văn.
7. **Giữ G2 không mang tính so sánh phương pháp.** Audit và bounded G2-D dry-run có thể chọn task hợp lệ và xác lập feasibility. Không được dùng chúng để chọn final sampler, tune model, report headline ranking metric hoặc claim cải thiện accuracy/resource.

Một diễn giải audit chỉ hoàn chỉnh khi ghi: **observation → analysis population và denominator → protocol consequence hợp lý → action đã chọn → inference bị loại trừ → gate status**. Nếu còn nhiều hơn một action có thể bảo vệ về mặt khoa học, giữ quyết định là `OPEN` và pre-register evidence sẽ dùng để phân xử.

## 6. Protocol phương pháp và comparison

Luận văn đánh giá một **graph sampler do project phát triển** như module trong cùng GNN recommender backbone và fixed resource budget. Cơ chế sampling cuối chưa freeze trước literature positioning và ablation.

Comparison family tối thiểu:

- MostPop và BPR-MF làm non-GNN reference;
- fixed GNN collaborative-filtering backbone (LightGCN-style là candidate);
- uniform và degree-aware sampling;
- established random-walk/subgraph baseline khi tương thích;
- GRAPES-informed reference design làm comparator; và
- sampler do project phát triển.

Mọi sampler phải dùng cùng split, training graph, ranking loss, negative rule, backbone depth/width, optimizer/tuning budget, random seed và sampling budget. Report Recall@10/20 và NDCG@10/20 từ exact full-catalog ranking, cùng peak GPU VRAM, CPU RAM, sampler time, train time, throughput, sampled graph size, seed variation và accuracy–cost Pareto curve. Report theo item-popularity stratum cùng aggregate.

## 7. Decision gate

| Gate | Evidence cần có trước khi tiếp tục |
|---|---|
| G2-A: provenance | Official source, access note, exact file checksum, schema và manifest hoàn chỉnh |
| G2-B: semantics | Duplicate policy, xử lý `0.0`, primary P4/P5/all-observed policy và negative rule được pre-register |
| G2-C: evaluation validity | Temporal cutoff, training-only filtering, warm-start coverage, OOV exclusion và exact evaluation candidate được ghi lại |
| G2-D: primary feasibility | Một bounded dry-run được ghi rõ là không tạo headline result, ghi retained-graph statistic và chứng minh pipeline/evaluator path khả thi; không được tune hoặc so sánh sampler |
| G5-S: conditional scale evidence | Nếu luận văn giữ claim large-scale, chạy một bounded `Home_and_Kitchen` scale-stress configuration đã pre-register sau G3/G4; trước đó chỉ làm provenance/size/feasibility planning |
| Optional expansion | Chỉ thêm MovieLens hoặc Yelp sau khi các gate Amazon core pass và không được để chúng chặn core |

**Cập nhật 2026-09-03:** Xem Mục 2.2–2.4. Baby G2-A/G2-B/G2-C/G2-D và E0-MIN đều `PASS`; Dataset Gate G2 đã đóng. Full scale Home vẫn là conditional G5-S.

## 8. Multi-agent review và adjudication

Đã dùng hai reviewer độc lập, sau đó cho cross-critique.

- **Hilbert** (`01a03ed0-ca78-7d92-b83e-92a13469608a`) review dataset role và source suitability. Reviewer này ưu tiên `Baby_Products`, `Home_and_Kitchen` và MovieLens 25M, với Yelp là tùy chọn.
- **Feynman** (`01a03ed0-ca4d-7c72-a247-301358b176d9`) review leakage-safe preprocessing và experimental validity. Reviewer này ưu tiên `Baby_Products` làm primary, `All_Beauty` cho diagnostic work và Yelp chỉ làm optional external validation.

Hai reviewer thống nhất raw 0-core `All_Beauty` và provider absolute split không thể được adopt làm primary warm-start evidence nếu chưa transformation và report coverage. Họ khác nhau về việc MovieLens 25M hay `Home_and_Kitchen` nên bắt buộc trong 12 tuần. Adjudication là yêu cầu **bounded `Home_and_Kitchen` scale stress test** nếu luận văn giữ large-scale claim, còn MovieLens và Yelp là tùy chọn. Cách này bảo toàn evidence trực tiếp về scale mà không cam kết experimental matrix đầy đủ thứ hai.

## 9. Hành động tiếp theo

Baby G2 đã freeze từ full-data artifact được review và environment-completion record mới. Có thể bắt đầu baseline G3 dưới shared exact evaluator và matched control. Không có kết luận nào về sampler được suy ra từ G2; full Home processing vẫn hoãn tới conditional G5-S.
