# Danh mục Dataset và Protocol Phân tích

> **Trạng thái:** `DANH MỤC ĐỀ XUẤT — DATASET GATE G2 CÒN MỞ`  
> **Ghi nhận:** 2026-08-26  
> **Phạm vi:** Luận văn Thạc sĩ độc lập: *Phát triển phương pháp lấy mẫu đồ thị cho hệ thống gợi ý quy mô lớn sử dụng mạng nơ-ron đồ thị GNN.*  
> **Ranh giới claim:** Đây là record cho thiết kế nghiên cứu, không phải kết quả thực nghiệm hoặc đặc tả phương pháp cuối.

## 1. Các câu hỏi protocol này phải trả lời

1. Dataset user–item nào có ý nghĩa ngữ nghĩa, tái lập được và đủ lớn để đánh giá graph sampling trong GNN recommendation?
2. Raw dataset của mỗi nguồn cần được biến đổi như thế nào thành implicit-ranking task mà không dùng future interaction trong graph construction, filtering hoặc training negative?
3. Proposed sampler có duy trì ranking quality ở sampling/computation budget cố định trong khi giảm resource cost hoặc cải thiện trade-off accuracy–cost không?
4. Kết luận có đứng vững trên một e-commerce graph chính và một graph lớn hơn rõ rệt, thay vì chỉ trên pilot dataset thuận tiện không?

Phương pháp vẫn `OPEN`. GRAPES là tài liệu nền và comparator có cơ sở literature; nó không phải phương pháp luận văn đã cố định và kết quả của nó không tự động chuyển sang recommendation.

## 2. Danh mục dataset có giới hạn

| Vai trò | Dataset và nguồn | Lý do đưa vào | Evidence cần có | Quyết định hiện tại |
|---|---|---|---|---|
| Chỉ development/diagnostic | Amazon Reviews'23 `All_Beauty`, pure-ID 0-core | Đã có exact audit; thuận tiện để validate deterministic preprocessing và sampler diagnostic trước các run tốn kém | Raw audit cho thấy 693,929 row, 631,986 user, 112,565 item và 93.22% user singleton | **Không dùng làm primary evidence.** Singleton rate khiến nó không phù hợp làm benchmark warm-start temporal chính. |
| Primary benchmark candidate | Amazon Reviews'23 `Baby_Products` | Product-review domain; user–item rating có timestamp; raw scale đủ để kiểm tra trade-off accuracy–cost | Raw 0-core audit: 5,953,891 row, 3,386,206 user, 217,654 item; 70.01% user singleton; một rating `0.0`; duplicate count còn mở | **Primary candidate bắt buộc.** Chỉ freeze sau strict post-filter audit và các gate G2. |
| Scale-stress candidate | Amazon Reviews'23 `Home_and_Kitchen` | Cùng source family và semantics với benchmark chính, nhưng metadata 5-core chính thức ghi 28.2M interaction, 2.9M user và 763.6K item | Raw/provenance audit riêng và một resource experiment có giới hạn | **Bắt buộc nếu luận văn giữ claim “large-scale”.** Đây là stress test, không phải ablation suite đầy đủ thứ hai. |
| Controlled diagnostic tùy chọn | MovieLens 25M | Dataset nghiên cứu ổn định, có timestamp và checksum, gồm 25,000,095 rating từ 162,541 user trên 62,423 phim | Manifest và protocol audit riêng | **Tùy chọn.** Chỉ dùng sau khi có core Amazon evidence; nó không phải bằng chứng chính cho web-scale sparsity. |
| External-domain validation tùy chọn | Yelp Open Dataset | Domain doanh nghiệp địa phương khác; nguồn chính thức có review và business | Schema, terms và protocol audit riêng | **Tùy chọn.** Chỉ thêm nếu còn thời gian sau Amazon core; không được làm chậm evidence trung tâm. |

Vì vậy, bộ evidence tối thiểu dự kiến là **`Baby_Products` cùng một bounded scale stress test trên `Home_and_Kitchen`**. `All_Beauty` chỉ hữu ích cho development control. Không lên kế hoạch benchmark đầy đủ thứ ba trước khi hai dataset core vượt qua gate.

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

## 5. Protocol phương pháp và comparison

Luận văn đánh giá một **graph sampler do project phát triển** như module trong cùng GNN recommender backbone và fixed resource budget. Cơ chế sampling cuối chưa freeze trước literature positioning và ablation.

Comparison family tối thiểu:

- MostPop và BPR-MF làm non-GNN reference;
- fixed GNN collaborative-filtering backbone (LightGCN-style là candidate);
- uniform và degree-aware sampling;
- established random-walk/subgraph baseline khi tương thích;
- GRAPES-informed reference design làm comparator; và
- sampler do project phát triển.

Mọi sampler phải dùng cùng split, training graph, ranking loss, negative rule, backbone depth/width, optimizer/tuning budget, random seed và sampling budget. Report Recall@10/20 và NDCG@10/20 từ exact full-catalog ranking, cùng peak GPU VRAM, CPU RAM, sampler time, train time, throughput, sampled graph size, seed variation và accuracy–cost Pareto curve. Report theo item-popularity stratum cùng aggregate.

## 6. Decision gate

| Gate | Evidence cần có trước khi tiếp tục |
|---|---|
| G2-A: provenance | Official source, access note, exact file checksum, schema và manifest hoàn chỉnh |
| G2-B: semantics | Duplicate policy, xử lý `0.0`, primary P4/P5/all-observed policy và negative rule được pre-register |
| G2-C: evaluation validity | Temporal cutoff, training-only filtering, warm-start coverage, OOV exclusion và exact evaluation candidate được ghi lại |
| G2-D: primary feasibility | Retained graph của `Baby_Products` hỗ trợ baseline và full-catalog evaluation trong compute budget đã xác nhận |
| G2-E: scale evidence | Manifest/audit `Home_and_Kitchen` hoàn chỉnh và một bounded scale-stress configuration đã pre-register được chạy |
| G2-F: optional expansion | Chỉ thêm MovieLens hoặc Yelp sau khi G2-A đến G2-E hoàn thành |

## 7. Multi-agent review và adjudication

Đã dùng hai reviewer độc lập, sau đó cho cross-critique.

- **Hilbert** (`01a03ed0-ca78-7d92-b83e-92a13469608a`) review dataset role và source suitability. Reviewer này ưu tiên `Baby_Products`, `Home_and_Kitchen` và MovieLens 25M, với Yelp là tùy chọn.
- **Feynman** (`01a03ed0-ca4d-7c72-a247-301358b176d9`) review leakage-safe preprocessing và experimental validity. Reviewer này ưu tiên `Baby_Products` làm primary, `All_Beauty` cho diagnostic work và Yelp chỉ làm optional external validation.

Hai reviewer thống nhất raw 0-core `All_Beauty` và provider absolute split không thể được adopt làm primary warm-start evidence nếu chưa transformation và report coverage. Họ khác nhau về việc MovieLens 25M hay `Home_and_Kitchen` nên bắt buộc trong 12 tuần. Adjudication là yêu cầu **bounded `Home_and_Kitchen` scale stress test** nếu luận văn giữ large-scale claim, còn MovieLens và Yelp là tùy chọn. Cách này bảo toàn evidence trực tiếp về scale mà không cam kết experimental matrix đầy đủ thứ hai.

## 8. Hành động tiếp theo

Audit `Baby_Products` theo P4/P5/all-observed candidate semantics và strict training-only temporal protocol, sau đó quyết định retained graph có vượt G2-D không. Song song, chỉ acquire provenance/size audit cho `Home_and_Kitchen`; chưa xây final sampling method hoặc chạy full ablation cho đến khi G2-A đến G2-C được ghi record.
