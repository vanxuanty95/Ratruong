# Kế hoạch nghiên cứu Phase 2 chính thức

> **Trạng thái:** Đang hiệu lực; đây là nguồn kế hoạch duy nhất của Phase 2.  
> **Thời lượng dự án:** 12 tuần.  
> **Cập nhật lần cuối:** 2026-09-03.
> **Cặp ngôn ngữ:** Bản tiếng Anh: [`PHASE2_RESEARCH_PLAN_en.md`](./PHASE2_RESEARCH_PLAN_en.md).

## 1. Mục đích và cách quản trị

Đây là file kế hoạch chuẩn duy nhất của Phase 2. File xác định trình tự nghiên cứu, cổng quyết định, phụ thuộc và tiến độ 12 tuần. Những project record khác chỉ liên kết đến file này, không sao chép lại kế hoạch.

Đây không phải báo cáo luận văn theo tuần. Thesis report, slide bảo vệ và source Colab/Python là các deliverable tích lũy; chúng được cập nhật tại chỗ khi có bằng chứng đã kiểm chứng làm thay đổi nội dung.

Khi kế hoạch thay đổi, phải cập nhật cả hai bản ngôn ngữ và thêm một record/pointer ngắn vào hai file continuity. Không được nâng mức maturity khoa học nếu chưa có bằng chứng.

## 2. Phạm vi luận văn và ranh giới đã xác định

- **Tên đề tài làm việc:** *Phát triển phương pháp lấy mẫu đồ thị cho hệ thống gợi ý quy mô lớn sử dụng mạng nơ-ron đồ thị GNN.*
- **Quan hệ giữa các phase:** Phase 2 là luận văn Thạc sĩ độc lập. Phase 1 là quá trình khám phá đề tài và nghiên cứu GRAPES trong lịch sử, chỉ được đọc để tham khảo.
- **Mục tiêu nghiên cứu:** Phát triển và đánh giá một phương pháp lấy mẫu đồ thị cho hệ gợi ý dùng GNN, với đánh giá có kiểm soát về chất lượng xếp hạng và chi phí tính toán.
- **Vai trò của GRAPES:** Nền tảng khoa học, comparator và nguồn ý tưởng cho các thành phần ứng viên; không phải phương pháp cuối cùng đã được chọn.
- **Các mục còn mở:** Sampler cuối cùng, cấu hình mô hình cuối cùng, ý nghĩa interaction, việc chốt dataset/protocol và mọi kết quả về hiệu quả/khả năng mở rộng đều còn mở.
- **Ngoài phạm vi:** Claim rằng luận văn chỉ chuyển GRAPES sang recommendation, claim về tính vượt trội khi chưa có kết quả, hoặc bất cứ việc đưa thông tin validation/test vào training graph.

## 3. Điểm xuất phát đã được kiểm chứng

| Hạng mục | Trạng thái hiện tại | Ranh giới |
|---|---|---|
| Định hướng luận văn và các deliverable đang phát triển | Đã thiết lập | Chưa claim phương pháp cuối cùng hoặc kết quả thực nghiệm. |
| Source scaffold và toy test | 13 pure-Python test đã pass local; path Baby G2-C/G2-D self-contained đã implement, full-data execute và readback | Đây không phải recommender PyTorch/PyG hoặc benchmark. |
| Amazon data và protocol | Baby G2-A đến G2-D pass; Dataset Gate G2 đã đóng | Điều này khóa primary pre-model task, không khóa sampler hoặc kết quả performance. |
| Danh mục dataset | `Baby_Products` là primary; `All_Beauty` là diagnostic; `Home_and_Kitchen` là scale stress có điều kiện | Vai trò primary đã khóa; full Home execution vẫn thuộc conditional G5-S. |
| Environment và compute | Có Python và Google Colab | Chưa khóa cấu hình environment/GPU cuối. |

## 4. Registry gate chuẩn và dependency

Cặp kế hoạch song ngữ này là **registry gate có thẩm quyền duy nhất**. Artifact khác có thể liên kết đến gate hoặc nêu snapshot ngắn, nhưng không được định nghĩa lại định danh, trạng thái, tiêu chí thoát hay dependency của gate.

Trạng thái gate và maturity của bằng chứng là hai trục riêng. Trạng thái gate dùng `NOT_STARTED`, `IN_PROGRESS`, `READY_FOR_REVIEW`, `PASS`, `CORRECTIVE_LOOP`, `STOP`, `REOPENED` hoặc `WAIVED`. Maturity của bằng chứng tiếp tục dùng `planned -> specified -> implemented -> executed -> validated`; gate `PASS` không có nghĩa mọi artifact liên kết đều đã validated.

### 4.1 Prerequisite về environment thực thi

| ID | Trạng thái hiện tại | Tiêu chí thoát | Việc bị chặn |
|---|---|---|---|
| E0-MIN — thực thi development | `PASS` | Environment local/Colab được ghi version chính xác, có thể chạy lại data-audit và bounded test path | Phần thực thi G2-D và việc execute G3/G4 |
| E0-FINAL — thực thi profiling cuối | `NOT_STARTED` | GPU cuối, software/CUDA lock, profiling procedure và nơi lưu output lâu dài đã được xác nhận và smoke-test | Resource claim ở G5 và representative rerun G6 |

E0 không chặn literature work hoặc phần không cần thực thi của G2-A đến G2-C. Hai mức này ngăn việc chưa xác nhận GPU mượn cuối cùng làm chặn governance, literature review hoặc thiết kế protocol.

### 4.2 Định nghĩa gate

| Cổng | Quyết định cần có | Bằng chứng cần có trước khi đóng | Việc bị chặn khi chưa đóng |
|---|---|---|---|
| G0 — Governance | Phạm vi, artifact song ngữ và ranh giới bằng chứng | Kế hoạch chính thức này và continuity pointer đã đồng bộ | Không có; hoàn tất cho mục đích lập kế hoạch |
| G1 — Lý do thiết kế nghiên cứu | Các cơ chế lấy mẫu ứng viên và thiết kế so sánh có kiểm soát | RQ chính và hypothesis có thể bác bỏ; định vị closest work; cơ chế ứng viên; thiết kế matched comparison; quy tắc chọn phương pháp đăng ký trước | Chọn và implement sampler được đề xuất |
| G2 — Dataset và evaluation protocol | Dataset chính và protocol chống leakage | G2-A provenance; G2-B interaction/duplicate/negative semantics; G2-C temporal, warm-start/OOV và exact-candidate rule; G2-D retained-graph statistic và bounded feasibility evidence | Huấn luyện baseline khoa học và headline evaluation |
| G3 — Shared baseline path | Data pipeline, exact evaluator và các baseline tương ứng | Run xác định, sanity check và resource logging | Thí nghiệm sampler được đề xuất |
| G4 — Proposed-sampler readiness | Phương pháp ứng viên đã implement và có diagnostic | Unit/integration test, loss hữu hạn, sample hợp lệ và development run có kiểm soát | So sánh cuối |
| G5 — Final evidence | Experiment matrix và evidence package đã freeze | Paired seed, phân tích uncertainty, resource trace, failure và limitation; G5-S bounded scale evidence nếu luận văn giữ claim large-scale | Claim ở phần Results/Conclusion |
| G6 — Reproducibility và submission | Representative run tái lập được và artifact đầy đủ | Manifest/configuration, table/figure tái tạo, report, slide và source Colab chạy được | Nộp bài |

Không đạt một gate không cho phép kết luận không có bằng chứng hoặc chuyển sang đề tài không liên quan. Cần chẩn đoán, ghi quyết định và sửa phần kế hoạch còn lại sao cho phù hợp bằng chứng.

G2-D là ranh giới feasibility, không phải kết quả baseline. Có thể dùng bounded subset, non-GNN control hoặc fixed tiny baseline để kiểm tra pipeline/evaluator và resource envelope thô. Phải ghi scale và hardware; không được tune model, so sánh sampler, báo headline metric hoặc khái quát sang final run. Phần execute scale stress từng gọi là G2-E nay là `G5-S`; trước G5, công việc `Home_and_Kitchen` chỉ gồm provenance, size và lập kế hoạch feasibility.

### 4.3 Trạng thái gate hiện tại

| ID | Trạng thái | Prerequisite | Bằng chứng/khoảng trống hiện tại | Ngày quyết định | Lần review tiếp |
|---|---|---|---|---|---|
| G0 | `PASS` | Không | Scope, quản trị song ngữ, ranh giới bằng chứng và kế hoạch này đã được ghi. Mở lại nếu scope/title/deliverable rule thay đổi. | 2026-08-30 | Khi governance thay đổi |
| G1 | `PASS` | Không; chạy song song với G2 | RQ/estimand chính, giả thuyết bác bỏ được, bản đồ closest work đại diện, cơ chế ứng viên, matched comparison và quy tắc Pareto chỉ dùng validation để chọn/không chọn đã được khóa trong [biên bản G1](./G1_RESEARCH_DESIGN_vn.md). Điều này chưa chọn sampler cuối. | 2026-09-03 | Mở lại nếu RQ, biến can thiệp, matched control hoặc selection rule thay đổi |
| G2 | `PASS` | Chỉ phần thực thi G2-D cần E0-MIN | Baby G2-A/G2-B/G2-C/G2-D đều pass. Drive manifest đã bổ sung xác minh hash/size của năm artifact, ghi exact CPU/Colab environment và replay bounded traversal 100 target với mọi invariant đã đăng ký đều đúng. Full scale Home vẫn là conditional G5-S. | 2026-09-03 | Chỉ mở lại nếu data byte, semantics, split, graph, cohort, candidate hoặc bounded-path contract thay đổi |
| G3 | `NOT_STARTED` | G2 `PASS`; E0-MIN `PASS` | Chưa có baseline/evaluator/resource path end-to-end deterministic. | — | Sau khi prerequisite pass |
| G4 | `NOT_STARTED` | G1 `PASS`; G2 `PASS`; G3 `PASS` | Chưa chọn hoặc implement sampler cuối. Toy test của reference design không thỏa gate này. | — | Sau khi prerequisite pass |
| G5 | `NOT_STARTED` | G4 `PASS`; đã freeze experiment matrix/configuration/seed; resource claim cần E0-FINAL | Chưa có matched final experiment evidence. | — | Sau G4 readiness review |
| G6 | `NOT_STARTED` | G5 `PASS`; E0-FINAL `PASS` | Chưa có clean representative rerun hoặc final evidence package được tái tạo. | — | Sau quyết định G5 |

### 4.4 Quy tắc go, corrective loop, stop, waiver và reopen

- Chỉ `GO` sang G3 khi G2 và E0-MIN pass; chỉ `GO` sang G4 khi G1, G2 và G3 pass; chỉ `GO` sang final experiment khi G4 pass và matrix đã freeze.
- Dùng `CORRECTIVE_LOOP` khi evidence chưa đủ nhưng có cách sửa trong phạm vi. `STOP` ghi nhận impasse và cần quyết định rescope tường minh; không trạng thái nào tự cho phép đổi đề tài hoặc đưa positive claim.
- Mở lại G2 khi interaction semantics, split, negative eligibility hoặc training graph thay đổi; invalidate hoặc mở lại evidence G3–G6 bị ảnh hưởng. Mở lại G3 và gate sau nó khi backbone, evaluator, budget hoặc resource logger thay đổi đáng kể. Mở lại G1/G4 và gate sau nó khi phương pháp được chọn thay đổi.
- Chỉ cho `WAIVED` với phạm vi tùy chọn/hành chính, có authority, rationale, expiry và impact statement. Không được waive provenance, leakage control, train/test separation, matched comparison, raw-result traceability, uncertainty disclosure hay representative reproducibility. Thiếu evidence `G5-S` phải làm hẹp claim large-scale, không được silent waiver.

## 5. Tiến độ nghiên cứu 12 tuần

| Tuần | Công việc chính | Artifact hoặc quyết định khi kết thúc |
|---|---|---|
| 1 | Hợp nhất scope, evidence record và điểm xuất phát của dataset audit; lập kế hoạch chính thức này. | Record G0; trạng thái và rủi ro đang mở được nêu rõ. |
| 2 | Thực hiện Amazon provenance/audit có thể lưu lâu dài trên Colab; pre-register interaction semantics, cách xử lý duplicate, temporal split ứng viên, xử lý warm-start/OOV và negative eligibility. | Gói bằng chứng G2 sẵn sàng để review; chưa huấn luyện mô hình. |
| 3 | Đóng G1 và G2 từ evidence đã review; bắt đầu shared exact evaluator và simple non-GNN control. | Biên bản quyết định G1/G2; initial implementation path G3. |
| 4 | Thiết lập GNN recommender baseline dùng chung, configuration xác định, logging và đường đo resource. | Baseline path G3 vượt sanity check cần thiết. |
| 5 | Implement và kiểm thử các sampling control có giới hạn (ví dụ uniform và degree-aware) trong cùng task và budget. | So sánh sampling control tương ứng có thể chạy. |
| 6 | Chỉ sau khi G1 và G3 pass, implement cơ chế lấy mẫu được chọn, không claim thành công. | Review mức sẵn sàng G4. |
| 7 | Chẩn đoán proposed sampler bằng development run có kiểm soát; chỉ sửa các vấn đề có bằng chứng. | Configuration ứng viên, diagnostic và ablation dự kiến được freeze cho development. |
| 8 | Chạy development comparison và ablation thiết yếu với task/budget cố định; chỉ thay thiết kế khi có lý do được ghi lại. | Final experiment matrix, seed và analysis plan được freeze. |
| 9 | Chạy primary matched experiment và ghi quality, resource, failure trace. | Gói bằng chứng cuối một phần. |
| 10 | Hoàn tất primary evidence và chỉ khi G2/G3 hợp lệ thì chạy scale-stress `Home_and_Kitchen` có giới hạn. | Gói bằng chứng G5 hoặc negative/insufficient result đã ghi. |
| 11 | Phân tích uncertainty, kiểm tra failure case và chạy lại một representative run sạch từ configuration đã ghi. | Gói reproducibility G6. |
| 12 | Hoàn thiện và đối chiếu thesis report, slide bảo vệ, source Colab, appendix và các chỉnh sửa theo giảng viên. | Artifact song ngữ sẵn sàng nộp cùng source chạy được. |

Viết báo cáo, quản lý citation, experiment log và reproducibility metadata là việc liên tục trong toàn bộ 12 tuần. Nếu thiếu thời gian hoặc compute, giảm dataset tùy chọn và ablation phụ trước khi làm yếu leakage control, matched comparison, uncertainty reporting hoặc representative rerun.

## 6. Quy tắc cập nhật deliverable tích lũy

Sau mỗi gate được đóng hoặc experiment đã được kiểm chứng, cập nhật tại chỗ các artifact bị ảnh hưởng:

| Deliverable | Cập nhật khi |
|---|---|
| Thesis report | Scope, literature positioning, method rationale, protocol, result hoặc limitation thay đổi. |
| Slide bảo vệ | Report có thay đổi có thể bảo vệ và cần được giải thích trực quan, ngắn gọn. |
| Source Colab/Python | Protocol, implementation, configuration, test, manifest hoặc executable result thay đổi. |
| Briefing cho giảng viên | Quyết định, rủi ro, evidence boundary hoặc câu hỏi dành cho giảng viên thay đổi. |

Mọi artifact lâu dài có nội dung ngôn ngữ phải đồng bộ cặp `_en` và `_vn`. Source code kỹ thuật giữ trung lập về ngôn ngữ, kèm tài liệu tiếng Anh và tiếng Việt đồng bộ.

## 7. Chỉ mục các record chính thức

- [Project constraints](./PHASE2_CONSTRAINTS_vn.md): constraint vận hành do người dùng cung cấp và compute assumption.
- [Danh mục dataset và protocol phân tích](./DATASET_PORTFOLIO_AND_ANALYSIS_PROTOCOL_vn.md): vai trò dataset và các protocol candidate chi tiết.
- [Quyết định thiết kế nghiên cứu G1](./G1_RESEARCH_DESIGN_vn.md): RQ, ranh giới closest work, họ ứng viên, matched comparison và quy tắc chọn phương pháp đã khóa.
- [Continuity rules song ngữ](../PROJECT_CONTEXT_AND_RESEARCH_RULES_vn.md): quy tắc làm việc và log thay đổi theo ngày; file này chỉ được liên kết ở đó, không bị sao chép.
- [Thesis report](../04_thesis/THESIS_REPORT_vn.md): narrative học thuật tích lũy.
- [GRAPES-informed reference specification](../02_protocol/GRAPES_RECOMMENDATION_SPEC_vn.md): reference design, không phải phương pháp luận văn chính thức.
- [Python/Colab README](../06_code/README_vn.md): scaffold chạy được, environment và hướng dẫn sử dụng.
- [Briefing hiện tại cho giảng viên](../03_reports/REPORT_TEACHER_vn.md): record thảo luận hiện tại với giảng viên.

## 8. Planning record đã được thay thế

`PHASE2_DIRECTION_REVIEW_vn.md` chỉ được giữ lại như một redirect lịch sử ngắn. Kế hoạch direct-GRAPES-adaptation cũ trong file đó đã bị thay thế và không được dùng để dẫn hướng công việc Phase 2.
