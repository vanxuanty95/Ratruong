# Bối cảnh và quy tắc nghiên cứu hiện hành

> Cập nhật: 16/09/2026

## 1. Đề tài

Đồ án nghiên cứu cách lấy mẫu computation graph khi huấn luyện mô hình gợi ý dựa trên LightGCN. Câu hỏi chính là:

> Khi giữ nguyên dữ liệu, mô hình, số bước tối ưu, ngân sách mỗi lớp, seed, evaluator và GPU, một sampler có sử dụng ngữ cảnh của batch có tạo được trade-off tốt hơn giữa chất lượng xếp hạng và chi phí tính toán so với uniform và degree-aware sampling hay không?

Trong tài liệu này, **ngữ cảnh** là các node và cạnh lân cận được dùng để truyền thông tin cho batch ở một layer. Nó không có nghĩa là ngữ nghĩa sản phẩm hoặc hoàn cảnh đời thực của người dùng.

## 2. Dữ liệu và phạm vi đánh giá

- Dataset chính là Amazon Reviews’23 `Baby_Products`, bản 0-core rating-only.
- Mỗi dòng gồm `user_id`, `parent_asin`, `rating` và `timestamp`.
- Rating 4 hoặc 5 được xem là positive interaction.
- Training graph chỉ dùng tương tác trước mốc thời gian `t1`.
- Validation và test được chiếu vào user/item mapping tạo từ training graph. Chỉ warm-start target được đánh giá.
- Exact full-catalog ranking loại các item người dùng đã tương tác trước target.
- Test target chưa được đọc. Tất cả kết quả hiện tại là validation-only.

Training graph có 3.868.654 cạnh, 2.318.308 user và 162.125 item. Validation có 81.871 warm target. Dữ liệu rất thưa, 71,76% user training chỉ có một interaction. Item-degree Gini bằng 0,8584 và top 1% item giữ 44,09% training interaction.

## 3. Ba sampler

- **M0, uniform:** chọn không hoàn lại, mọi candidate node có cơ hội như nhau. Đây là đối chứng trung lập.
- **M1, degree-aware:** ưu tiên node có training degree lớn. Đây là đối chứng tĩnh mạnh nhưng có thể củng cố popularity bias.
- **M2, frontier-normalized:** ưu tiên node nối nhiều vào frontier hiện tại, sau đó chia bớt lợi thế của node có global degree lớn. Mục đích là giữ tín hiệu gần batch mà không để các hub luôn thắng.

Cả ba dùng cùng layer budget `[65.536, 65.536, 65.536]`, batch 65.536, 5 epoch, 300 optimizer step, BPR negative draw, evaluator, khởi tạo trong từng seed và Tesla T4. Chỉ quy tắc chọn node khác nhau.

## 4. Vì sao dùng các metric hiện tại

- **NDCG@20** là chỉ số chính vì bài toán trả về danh sách có thứ tự. Target xuất hiện ở vị trí đầu được tính tốt hơn vị trí 20.
- **Recall@20** cho biết target có xuất hiện trong 20 recommendation đầu hay không. Mỗi dòng đánh giá có một target, nên Recall@20 cũng là tỷ lệ dòng được hit.
- **Catalog Coverage@20** cho biết có bao nhiêu item trong training catalog từng được recommend. Nó phát hiện hiện tượng danh sách dồn vào một nhóm item rất nhỏ.
- **Exposure và hit theo head/body/tail** tách “được xuất hiện” khỏi “được gợi ý đúng”. Exposure rộng hơn không đồng nghĩa long-tail relevance tốt hơn.
- **Training time và peak GPU memory** là hai trục chi phí vì câu hỏi nghiên cứu là trade-off chất lượng–tài nguyên.
- **Rank transition, gained hit và lost hit** chỉ dùng để giải thích cơ chế; chúng không thay NDCG hoặc Recall.

Semantic relevance và intra-list semantic diversity chưa đo được. File hiện tại không có title, category, mô tả, ảnh hoặc text embedding. Coverage chỉ là độ rộng catalog, không phải đa dạng ngữ nghĩa.

## 5. Kết quả đã khóa

Mean trên ba validation seed:

| Phương pháp | NDCG@20 | Recall@20 | Catalog Coverage@20 |
|---|---:|---:|---:|
| M0 | 0,005706 | 0,014869 | 0,018132 |
| M1 | **0,005866** | **0,015296** | 0,017534 |
| M2 | 0,005721 | 0,014873 | 0,017513 |

M2 thấp hơn M1 về NDCG và Recall trong cả ba seed. Theo mean, M2 thấp hơn M1 2,47% NDCG và 2,77% Recall. Trong hai repeat mới, M2 chậm hơn M1 trung bình 114,88 giây, còn peak GPU chỉ khác khoảng 4,11 MiB. M2 thay đổi rank của nhiều target nhưng không chuyển thay đổi đó thành top-20 gain ổn định. Tail hit bằng 0 cho cả ba sampler ở cả ba seed.

Kết luận hiện hành: **M2 không tạo trade-off chất lượng–chi phí tốt hơn M1 dưới protocol đã đăng ký.** M1 có mean validation cao nhất nhưng không thắng M0 trong mọi seed, nên không kết luận M1 luôn tốt hơn.

## 6. Quy tắc phát biểu

Được phép nói:

- Baby Products có mất cân bằng và long-tail mạnh trong training graph.
- M0, M1 và M2 làm thay đổi coverage, exposure, rank và chi phí theo những cách khác nhau.
- M2 là một negative result có cơ chế giải thích.

Không được nói:

- M1 hoặc M2 tốt hơn một cách phổ quát.
- Ba seed tạo ra kiểm định significance.
- Kết quả đã được xác nhận trên test, budget khác hoặc dataset khác.
- Dataset pure-ID cho phép đo semantic diversity hoặc cold-start bằng nội dung.
- Runtime của một notebook chứng minh scalability nói chung.

## 7. Quy tắc làm việc

1. Số liệu trong báo cáo phải truy được về JSON, rank vector hoặc manifest đã lưu.
2. Không thay sampler, metric chính hoặc protocol sau khi nhìn validation result.
3. Không dùng test để chọn lại hoặc cứu M2.
4. Không mở M3 khi chưa có một câu hỏi nghiên cứu mới và protocol đăng ký trước.
5. `ThucTap2` là nguồn tham khảo, không phải nơi ghi output mới.
6. Bản trình bày hiện hành chỉ có một tên: `05_slides/THESIS_PRESENTATION_vn.pptx`.

## 8. Tệp vào việc

- Timeline: [`00_project/PHASE2_RESEARCH_PLAN_vn.md`](./00_project/PHASE2_RESEARCH_PLAN_vn.md)
- Bản trình bày: [`03_reports/REPORT_TEACHER_vn.md`](./03_reports/REPORT_TEACHER_vn.md)
- Bản luận văn: [`04_thesis/THESIS_REPORT_vn.md`](./04_thesis/THESIS_REPORT_vn.md)
- Thực nghiệm: [`06_code/README_vn.md`](./06_code/README_vn.md)
- Slide: [`05_slides/THESIS_PRESENTATION_vn.pptx`](./05_slides/THESIS_PRESENTATION_vn.pptx)
