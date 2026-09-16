# Đồ án: bắt đầu từ đây

> Cập nhật: 16/09/2026
> Đề tài: **Lấy mẫu đồ thị cho hệ thống gợi ý sử dụng GNN**

## Câu hỏi nghiên cứu

Khi giữ nguyên dữ liệu, mô hình LightGCN, số bước huấn luyện, ngân sách lấy mẫu, seed, cách đánh giá và GPU, cách chọn node ngữ cảnh có làm thay đổi chất lượng gợi ý và chi phí tính toán hay không?

Nghiên cứu so sánh ba cách lấy mẫu:

- **M0, uniform:** mọi node ứng viên có cơ hội được chọn như nhau.
- **M1, degree-aware:** node có nhiều liên kết trong training graph được ưu tiên hơn.
- **M2, frontier-normalized:** ưu tiên node kết nối tốt với vùng đồ thị đang được tính cho batch hiện tại, đồng thời giảm lợi thế của các hub phổ biến.

## Kết quả hiện tại

M2 đã làm thay đổi computation graph, nhưng thay đổi đó không tạo ra trade-off chất lượng–chi phí tốt hơn M1 ở protocol đã đăng ký. Trong ba seed, chênh lệch NDCG@20 và Recall@20 của M2 so với M1 đều âm. M1 có mean validation cao nhất, nhưng không thắng M0 ở mọi seed. Vì vậy nghiên cứu dừng ở M2 và giữ kết quả này như một negative result có kiểm soát.

Test target chưa được đọc. Chưa có claim về significance, hiệu quả ở budget khác, dataset khác hoặc semantic diversity.

## Các tệp đang có hiệu lực

1. [`00_project/PHASE2_RESEARCH_PLAN_vn.md`](./00_project/PHASE2_RESEARCH_PLAN_vn.md) ghi lại nghiên cứu theo timeline và quyết định ở từng giai đoạn.
2. [`03_reports/REPORT_TEACHER_vn.md`](./03_reports/REPORT_TEACHER_vn.md) là bản giải thích dùng khi trình bày hoặc trao đổi với giảng viên.
3. [`04_thesis/THESIS_REPORT_vn.md`](./04_thesis/THESIS_REPORT_vn.md) là bản viết ở độ sâu luận văn.
4. [`05_slides/THESIS_PRESENTATION_vn.pptx`](./05_slides/THESIS_PRESENTATION_vn.pptx) là slide duy nhất đang có hiệu lực.
5. [`06_code/README_vn.md`](./06_code/README_vn.md) mô tả notebook, config, output và cách tái tạo khi thật sự cần.
6. [`PROJECT_CONTEXT_AND_RESEARCH_RULES_vn.md`](./PROJECT_CONTEXT_AND_RESEARCH_RULES_vn.md) khóa câu hỏi, trạng thái và ranh giới phát biểu.

Các bản tiếng Anh đi kèm là bản đối chiếu nội dung, không phải một nhánh nghiên cứu khác.

## Bằng chứng thực nghiệm

- Kiểm toán dữ liệu: [`06_code/results/`](./06_code/results/)
- EDA đầy đủ: [`06_code/results/data_story/`](./06_code/results/data_story/)
- MostPop: [`06_code/results/mostpop_validation/`](./06_code/results/mostpop_validation/)
- BPR-MF: [`06_code/results/bpr_mf_validation/`](./06_code/results/bpr_mf_validation/)
- Full LightGCN: [`06_code/results/full_lightgcn_validation/`](./06_code/results/full_lightgcn_validation/)
- M0: [`06_code/results/uniform_sampling_validation/`](./06_code/results/uniform_sampling_validation/)
- M1: [`06_code/results/degree_aware_sampling_validation/`](./06_code/results/degree_aware_sampling_validation/)
- M2: [`06_code/results/frontier_normalized_sampling_validation/`](./06_code/results/frontier_normalized_sampling_validation/)
- Ba-seed paired validation: [`06_code/results/paired_sampling_validation/`](./06_code/results/paired_sampling_validation/)

Các thư mục kết quả giữ raw summary, rank vector, báo cáo đối soát và bundle gốc. Chúng có thể lặp lại một phần nội dung, nhưng phục vụ tái lập và không phải các bản trình bày cạnh tranh nhau.

## Những tệp đã được hợp nhất

- `PHASE2_DIRECTION_REVIEW_*` chỉ là redirect lịch sử; nội dung hiện hành nằm trong kế hoạch nghiên cứu.
- `G1_RESEARCH_DESIGN_*` mô tả họ ứng viên M0–M5 trước khi có kết quả; phần thiết kế còn đúng đã được nhập vào kế hoạch và thesis, còn M3–M5 không còn là hướng đang mở.
- `PHASE2_CONSTRAINTS_*` chứa giả định phần cứng và số run trước thực nghiệm; ràng buộc còn đúng đã được nhập vào project rules và code README.
- `ENVIRONMENT_LOCK_PENDING.txt` là placeholder trước khi runtime thực tế được ghi trong output.
- Slide tiếng Anh và các bản `THESIS_PRESENTATION_vn_v*` là bản làm việc đã được thay bằng tên slide chuẩn.
- `notebooks/paired_sampling_validation_bundle.zip` trùng với bundle được giữ trong thư mục kết quả paired validation.

File ghi chú phản hồi ban đầu `cô dặn 3:09` được giữ nguyên làm nguồn lịch sử.

## Ranh giới cần nhớ

- `Catalog Coverage@20` cho biết bao nhiêu item từng xuất hiện trong danh sách gợi ý. Chỉ số này không đo sự khác nhau về ý nghĩa giữa các sản phẩm.
- Phân bổ exposure theo head, body và tail cho biết vị trí recommendation slot tập trung. Nó không tự chứng minh hệ thống gợi ý đúng cho item ít phổ biến.
- Semantic diversity chưa đo được vì artifact hiện tại chỉ có user ID, item ID, rating và timestamp; không có title, category, mô tả hoặc embedding nội dung.
- `Baby_Products` là dataset chính. Các benchmark ngoài Amazon chỉ dùng để đặt nghiên cứu vào bối cảnh, chưa phải bằng chứng thực nghiệm của đồ án.

## Bước tiếp theo

Hoàn thiện slide và bản viết từ bằng chứng validation đã khóa. Chỉ mở thêm một dataset hoặc chạy test khi yêu cầu đầu ra của luận văn thực sự cần một claim mới; không dùng test để sửa hoặc cứu M2.
