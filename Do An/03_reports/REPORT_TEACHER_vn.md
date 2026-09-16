# Nội dung trình bày nghiên cứu

> **`ARCHIVED PILOT NARRATIVE — NOT FINAL THESIS EVIDENCE`** (DL-001, 16/09/2026). Tài liệu này kể câu chuyện M0–M2 heuristic pilot. Phase 2 hiện là GRAPES-GFN-Rec; xem `00_project/PHASE2_GRAPES_GFN_REC_SPEC_vn.md`. Sẽ được viết lại ở gate R7.

> Bản này dùng để nói và trả lời câu hỏi. Chi tiết kỹ thuật đầy đủ nằm trong thesis và thư mục kết quả.

## 1. Bài toán em đang làm

Em nghiên cứu cách lấy mẫu node khi huấn luyện LightGCN cho recommendation. Khi graph lớn, mô hình không nhất thiết phải đưa toàn bộ hàng xóm vào mỗi lần tính. Sampler quyết định phần graph nào được dùng làm ngữ cảnh cho batch hiện tại.

Câu hỏi của em không phải “sampler nào cho điểm cao nhất” theo nghĩa chung. Em giữ nguyên dữ liệu, model, số bước huấn luyện, sampling budget, seed, evaluator và GPU, sau đó chỉ thay quy tắc chọn node. Em muốn biết sự thay đổi đó có cải thiện được chất lượng xếp hạng mà không làm chi phí tăng quá nhiều hay không.

## 2. Dataset nào thường được dùng cho recommendation

Ngoài Amazon còn có nhiều benchmark đáng tin cậy:

- **MovieLens 25M** có 25 triệu rating cùng tag và metadata phim. Nó phù hợp cho collaborative filtering và phân tích ngữ nghĩa, nhưng user đã được lọc để có ít nhất 20 rating nên không thể hiện rõ tình trạng user rất ít lịch sử.
- **Gowalla** và **Yelp2018** được dùng trong nghiên cứu LightGCN. Đây là hai đối chứng gần nhất cho graph recommendation, nhưng bản phổ biến đã được lọc và chia ngẫu nhiên thay vì temporal split từ raw data.
- **MIND** là dữ liệu news recommendation có title, abstract và impression log. Nó phù hợp với content-aware recommendation hơn bài toán pure-ID sản phẩm.
- **KuaiRec** gần fully observed, phù hợp để nghiên cứu exposure bias. Catalog nhỏ và rất dày nên không tạo cùng áp lực sampling trên sparse graph.

Những dataset này giúp đặt bài toán vào bối cảnh. Em chưa chạy thực nghiệm trên chúng, vì thêm một dataset sau khi đã thấy kết quả sẽ làm thay đổi phạm vi bằng chứng. Nếu cần kiểm tra tính khái quát ngoài Amazon, Yelp2018 là lựa chọn gần phương pháp nhất và phải có protocol riêng.

## 3. Vì sao chọn `Baby_Products`

Em đã kiểm toán ba tập Amazon Reviews’23 bằng cùng protocol:

| Dataset | Số dòng raw | Cách dùng |
|---|---:|---|
| `All_Beauty` | 693.929 | Kiểm tra pipeline trên quy mô nhỏ |
| `Baby_Products` | 5.953.891 | Dataset chính |
| `Home_and_Kitchen` | 66.623.880 | Tham chiếu scale, chưa chạy full experiment |

All Beauty chạy nhanh nhưng warm-start population nhỏ và user singleton quá nhiều. Home and Kitchen lớn gấp khoảng 11,19 lần Baby, phù hợp cho scale stress nhưng không phù hợp với ma trận paired experiment hiện tại trên Colab. Baby nằm ở giữa: graph đủ lớn, rất thưa, có long-tail rõ, nhưng vẫn chạy được toàn bộ M0–M2 trên Tesla T4.

Đây là lựa chọn dựa trên data audit và khả năng thực thi trước khi xem model result, không phải chọn dataset vì nó cho score đẹp.

## 4. Nguồn và đặc trưng dữ liệu

Dữ liệu đến từ Amazon Reviews’23 do McAuley Lab công bố. Artifact dùng trong đồ án là `Baby_Products.csv.gz`, bản 0-core rating-only. SHA-256 và kích thước byte đã được lưu trong audit JSON.

Mỗi dòng có bốn trường:

- `user_id`: mã người dùng ẩn danh;
- `parent_asin`: mã sản phẩm cha, dùng làm item;
- `rating`: điểm từ 1 đến 5;
- `timestamp`: thời điểm rating.

Dữ liệu này hỗ trợ collaborative filtering theo user–item interaction. Nó không có tên, mô tả, danh mục hoặc hình ảnh sản phẩm. Vì vậy em không dùng nó để kết luận hai sản phẩm có giống nhau về nghĩa hay danh sách gợi ý có đa dạng về nội dung.

## 5. Rating, nhiễu và quyết định positive interaction

Trong 5.953.891 dòng raw có đúng một rating `0.0` ngoài miền 1–5. Em quarantine dòng này. Exact audit không tìm thấy missing user ID, missing item ID, timestamp sai hoặc user-item pair trùng.

Rating 4 và 5 được xem là positive interaction. Chính sách P4 giữ 4.655.843 dòng, tương đương 78,20% raw data. Lý do là bài toán đang dự đoán sản phẩm người dùng thể hiện tín hiệu tích cực, thay vì coi mọi rating, kể cả rating 1, là sở thích.

Mức nhiễu theo các lỗi cấu trúc đã kiểm tra là thấp. Tuy nhiên rating vẫn là feedback quan sát được, không phải sở thích hoàn hảo. Em không xóa thêm các dòng “trông lạ” nếu không có quy tắc đăng ký trước, vì như vậy có thể làm đẹp dữ liệu theo cảm tính.

## 6. Dữ liệu được chia như thế nào

Em dùng temporal split:

1. Tương tác trước `t1` tạo training graph.
2. Khoảng `[t1, t2)` tạo validation candidate.
3. Tương tác từ `t2` trở đi tạo test candidate.

User/item mapping, degree và popularity cohort chỉ được tính từ training graph. Một target chỉ được giữ nếu user và item đều đã xuất hiện trong training. Đây là warm-start evaluation.

Training graph có 3.868.654 cạnh, 2.318.308 user và 162.125 item. Validation giữ 81.871 warm target trên 373.776 candidate row, tức 21,90%. Test giữ 40.587 trên 413.413 row, tức 9,82%. Retention thấp cho thấy pure-ID model chỉ bao phủ một phần population tương lai; nó không tự động có khả năng cold-start.

## 7. Mất cân bằng và long-tail

Phân phối interaction rất lệch:

- 71,76% user training chỉ có một interaction;
- 33,35% item training chỉ có một interaction;
- user degree p50/p90/p99 là 1/3/9;
- item degree p50/p90/p99 là 3/32/397;
- item-degree Gini bằng 0,8584;
- top 1% item giữ 44,09% training interaction.

Không thể vẽ một histogram riêng cho 162.125 sản phẩm mà vẫn đọc được. Em dùng degree histogram theo thang log, CCDF, quantile và cumulative interaction share. Các biểu diễn này trả lời đúng hơn ba câu hỏi: phần lớn item có bao nhiêu interaction, mức đuôi dài tới đâu và lượng tương tác dồn vào nhóm đầu lớn đến mức nào.

Em khóa head/body/tail trước khi nhìn model result. Head chiếm khoảng 1% item nhưng giữ 44,16% cạnh; tail chiếm khoảng 80,07% item nhưng chỉ giữ 10,39% cạnh.

## 8. M0, M1 và M2 là gì

### M0: chọn đều

M0 cho mọi candidate node cơ hội như nhau. Nó là đối chứng trung lập và cho biết sampling tự thân ảnh hưởng đến kết quả như thế nào khi không thêm thiên kiến.

### M1: ưu tiên node có nhiều liên kết

M1 tăng xác suất của node có training degree lớn. Lý do là node có nhiều quan sát thường mang tín hiệu collaborative ổn định hơn. Mặt trái là sampler có thể tiếp tục tập trung vào phần phổ biến của graph.

### M2: ưu tiên liên kết với frontier nhưng giảm lợi thế của hub

Frontier là tập node đang cần thêm hàng xóm ở một layer. M2 ưu tiên candidate có nhiều training edge nối vào frontier, rồi chia bớt trọng số theo căn degree. Ý tưởng là chọn node có ích cho batch hiện tại thay vì node nổi tiếng nói chung.

Cả ba dùng cùng số node được chọn ở mỗi layer. M0, M1 và M2 không phải ba model khác nhau; chúng là ba cách dựng computation graph cho cùng model.

## 9. Tại sao dùng NDCG, Recall, coverage và cohort

**NDCG@20** là metric chính vì recommendation là danh sách có thứ tự. Nếu target ở rank 1, hệ thống hữu ích hơn khi target chỉ xuất hiện ở rank 20.

**Recall@20** trả lời câu hỏi đơn giản hơn: target có nằm trong 20 item đầu không? Mỗi dòng validation có một target, nên Recall@20 chính là tỷ lệ dòng có hit.

**Catalog Coverage@20** đo phần training catalog từng xuất hiện trong recommendation. Nó cho biết model có dồn mọi người vào vài item hay không. Coverage cao không đảm bảo recommendation đúng và cũng không có nghĩa sản phẩm khác nhau về ngữ nghĩa.

**Exposure theo head/body/tail** cho biết các recommendation slot được phân bổ vào nhóm phổ biến nào. **Recall và hit theo cohort** kiểm tra exposure đó có tạo đúng target hay không.

**Training time và peak GPU memory** cần thiết vì mục tiêu là trade-off. Một sampler có NDCG tăng rất ít nhưng training chậm hơn nhiều chưa chắc là lựa chọn tốt.

## 10. Baseline cho thấy gì

| Model | NDCG@20 | Recall@20 | Coverage@20 |
|---|---:|---:|---:|
| MostPop | 0,005873 | 0,014596 | 0,000154 |
| BPR-MF | 0,004054 | 0,010419 | 0,033517 |
| Full LightGCN | 0,004931 | 0,012373 | 0,006365 |

MostPop có accuracy cao nhất trong ba sanity baseline nhưng chỉ recommend 25 item và 100% exposure thuộc head. BPR-MF mở rộng coverage lên 5.434 item nhưng accuracy giảm. Full LightGCN tốt hơn BPR-MF về aggregate score, song exposure trở lại 99,36% head. Kết quả này cho thấy accuracy và độ rộng catalog không di chuyển cùng nhau.

## 11. Kết quả M0–M2

Ở seed thiết kế ban đầu, M1 có NDCG/Recall cao nhất. Tuy nhiên 109 hit tăng thêm so với M0 đều thuộc head, body không tăng và tail vẫn bằng 0. M2 làm item-context nghiêng về tail nhiều hơn, nhưng tail hit vẫn bằng 0. Chi phí tính `frontier_support` làm M2 chậm hơn M1.

Mean trên ba validation seed:

| Phương pháp | NDCG@20 | Recall@20 | Coverage@20 |
|---|---:|---:|---:|
| M0 | 0,005706 | 0,014869 | **0,018132** |
| M1 | **0,005866** | **0,015296** | 0,017534 |
| M2 | 0,005721 | 0,014873 | 0,017513 |

M2 thấp hơn M1 về NDCG và Recall ở cả ba seed. M2 vẫn tạo nhiều gained hit, lost hit và rank change, nên sampler đã ảnh hưởng đến computation. Nhưng ảnh hưởng đó không chuyển thành top-20 gain ổn định. Trong hai repeat mới, M2 chậm hơn M1 trung bình 114,88 giây; peak GPU gần như bằng nhau.

## 12. Kết luận có thể bảo vệ

M2 không tạo trade-off chất lượng–chi phí tốt hơn M1 trong protocol hiện tại. Kết quả âm này có ý nghĩa vì nó cho thấy “chọn context gần frontier” và “đưa sampling về phía tail” chưa đủ để cải thiện recommendation trên graph rất thưa. Signal cấu trúc phải chuyển thành target relevance, và trong dữ liệu này điều đó không xảy ra.

M1 có mean validation cao nhất nhưng không thắng M0 trong mọi seed. Vì vậy em không nói M1 luôn tốt hơn uniform và không suy ra significance từ ba seed.

## 13. Những gì chưa đo được

- Chưa đo semantic match giữa sản phẩm và sở thích người dùng.
- Chưa đo intra-list semantic diversity.
- Chưa đánh giá cold-start user/item.
- Chưa chạy test split.
- Chưa kiểm tra dataset ngoài Amazon hoặc budget khác.
- Chưa chứng minh scalability chỉ từ row count và một Tesla T4.

Nếu cần semantic diversity, phải thêm metadata hoặc chuyển sang dataset như MovieLens/MIND. Nếu cần tính khái quát của graph sampling, phải đăng ký và chạy một dataset thứ hai như Yelp2018. Hai hướng này trả lời hai câu hỏi khác nhau.

## 14. Bước tiếp theo

Trước mắt, em khóa narrative và artifact cho kết quả validation hiện tại. Không mở sampler mới. Một bước thực nghiệm mới chỉ được thêm khi nó tạo một claim cần thiết cho luận văn:

- final test đã đăng ký trước cho quyết định hiện tại;
- một dataset ngoài Amazon để kiểm tra tính khái quát;
- hoặc một nhánh metadata riêng để đo semantic diversity.

## Bản nói ngắn

Em dùng Amazon Baby Products vì dataset này đủ lớn để tạo sparse user–item graph có long-tail rõ, nhưng vẫn chạy được paired experiment trên Colab. Em kiểm toán gần 5,95 triệu dòng và chỉ loại một rating ngoài miền. Sau temporal split, training graph có 3,87 triệu cạnh với mất cân bằng rất mạnh. Em so sánh ba sampler trong cùng một LightGCN: M0 chọn đều, M1 ưu tiên node nhiều liên kết, M2 ưu tiên node nối tốt vào frontier nhưng giảm lợi thế của hub. Em đánh giá bằng NDCG và Recall cho chất lượng, coverage và cohort cho phân bổ, cùng thời gian và bộ nhớ cho chi phí. Qua ba seed, M2 thấp hơn M1 về NDCG và Recall, chậm hơn, và không tạo tail hit dù đã thay đổi sampled graph. Vì vậy kết luận của em là M2 không cải thiện trade-off trong protocol này; đây là negative result có bằng chứng, không phải thất bại cần che đi.
