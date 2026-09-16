# Danh mục dataset và protocol phân tích

> Trạng thái: Baby Products đã được chọn và kiểm toán; các dataset ngoài Amazon chỉ là bối cảnh benchmark, chưa phải experiment của đồ án.

## 1. Dataset đáng tin cậy nghĩa là gì

Một dataset phù hợp cho nghiên cứu recommendation cần nhiều hơn số dòng lớn. Đồ án xem xét:

1. nguồn phát hành và bài báo gốc có rõ ràng không;
2. một interaction có ý nghĩa gì;
3. có timestamp, version, checksum hoặc tài liệu đủ để tái lập không;
4. dữ liệu có phù hợp với câu hỏi graph sampling không;
5. cách lọc và chia train/validation/test có tạo leakage hay thay đổi population không;
6. quy mô có đủ lớn nhưng vẫn phù hợp với tài nguyên thực nghiệm không.

Một bản mirror trên Kaggle hoặc một dataset được dùng nhiều không tự động đáp ứng các điều kiện này.

## 2. Benchmark ngoài Amazon

| Dataset | Dữ liệu chính | Phù hợp nhất với | Hạn chế đối với đồ án này |
|---|---|---|---|
| MovieLens 25M | 25.000.095 rating, 162.541 user, 62.423 phim, tag và tag genome | Collaborative filtering, metadata và semantic diversity | User có ít nhất 20 rating; ít phản ánh user singleton |
| Gowalla | Implicit check-in user–location | Graph collaborative filtering | Miền địa điểm, bản LightGCN nhỏ hơn Baby và chia ngẫu nhiên |
| Yelp2018 | User–business interaction đã xử lý | Graph recommendation, đối chứng ngoài Amazon gần nhất | Bản benchmark đã lọc; metadata raw không tự động đi cùng interaction file |
| MIND | Click/impression và nội dung bài báo | News, context và semantic relevance | Item thay đổi nhanh, cold-start mạnh, khác recommendation sản phẩm |
| KuaiRec | Gần fully observed user–video matrix | Exposure bias và offline evaluation | 1.411 user, 3.327 item; catalog nhỏ và rất dày |

Nguồn chính:

- [MovieLens 25M, GroupLens](https://grouplens.org/datasets/movielens/25m/)
- [LightGCN, SIGIR 2020](https://hexiangnan.github.io/papers/sigir20-LightGCN.pdf)
- [LightGCN artifact](https://github.com/kuandeng/LightGCN)
- [MIND, ACL 2020](https://aclanthology.org/2020.acl-main.331/)
- [KuaiRec, CIKM 2022](https://arxiv.org/abs/2202.10842)

Gowalla và Yelp2018 gần phương pháp nhất nếu sau này cần một dataset thứ hai. MovieLens hoặc MIND phù hợp hơn nếu câu hỏi chuyển sang semantic diversity. Đây là hai mục tiêu khác nhau và phải có protocol riêng.

## 3. Portfolio Amazon đã kiểm toán

| Category | Raw rows | Raw users | Raw items | Vai trò |
|---|---:|---:|---:|---|
| `All_Beauty` | 693.929 | 631.986 | 112.565 | Pipeline/control nhỏ |
| `Baby_Products` | 5.953.891 | 3.386.206 | 217.654 | Primary dataset |
| `Home_and_Kitchen` | 66.623.880 | Chưa full-audit | Chưa full-audit | Raw scale reference |

### Vì sao không dùng All Beauty làm dataset chính

All Beauty phù hợp để kiểm acquisition, schema, timestamp và duplicate. Nhưng trong P4, training chỉ có 422.736 row, 391.574 user và 78.958 item. Validation warm-start retention chỉ 3,98%. Dữ liệu này nhỏ hơn Baby nhiều và user singleton còn cao hơn, nên không tạo cùng áp lực graph sampling.

### Vì sao chưa dùng Home and Kitchen

Raw artifact có 66.623.880 dòng và dung lượng nén 1.420.416.432 byte, lớn gấp khoảng 11,19 lần Baby về số dòng. Full protocol audit, temporal graph và toàn bộ paired matrix chưa chạy. Dataset này chỉ có thể hỗ trợ claim scale sau khi có một bounded stress protocol riêng; raw row count không đủ để gọi là scalability evidence.

### Vì sao chọn Baby Products

Baby Products có ba đặc điểm cần cho câu hỏi nghiên cứu:

- graph đủ lớn để sampling time và computation graph trở thành vấn đề thực tế;
- sparsity và long-tail rõ, giúp quan sát interaction giữa sampling và popularity;
- vẫn có thể chạy exact full-catalog validation và paired M0–M2 trên Tesla T4.

Quyết định này dựa trên audit và feasibility trước model result.

## 4. Provenance Baby Products

- Nguồn: Amazon Reviews’23, McAuley Lab.
- Artifact: `0core/rating_only/Baby_Products.csv.gz`.
- Kích thước nén: 148.609.233 byte.
- SHA-256: `e2a8d0498afed767ee2615db7fac549559d82490b1a73c7241b84b5e9e8c279e`.
- Schema: `user_id`, `parent_asin`, `rating`, `timestamp`.
- Raw rows: 5.953.891.

Nguồn chính thức:

- [Amazon Reviews’23 project page](https://amazon-reviews-2023.github.io/main.html)
- [0-core processing and statistics](https://amazon-reviews-2023.github.io/data_processing/0core.html)
- [Dataset paper](https://arxiv.org/abs/2403.03952)

## 5. Kiểm tra chất lượng

Exact audit cho Baby Products ghi nhận:

- một rating `0.0` ngoài miền 1–5;
- không có missing user ID;
- không có missing item ID;
- không có invalid timestamp;
- không có duplicate user-item row.

Dòng rating `0.0` bị quarantine trước khi tạo semantic snapshot. Không áp dụng thêm “làm sạch” dựa trên cảm giác. Nếu một quy tắc loại dữ liệu không thể viết thành điều kiện xác định và kiểm tra trước model result, quy tắc đó không được dùng.

## 6. Định nghĩa positive interaction

Protocol chính dùng P4:

```text
positive = 4 <= rating <= 5
```

P4 giữ 4.655.843 interaction, bằng 78,20% raw rows. Rating 1–3 không được dùng làm positive edge. Đây là implicit-ranking task; đồ án không dự đoán số sao.

## 7. Temporal protocol

1. Chia interaction theo timestamp thành train `< t1`, validation `[t1,t2)` và test `>= t2`.
2. Xây user/item mapping chỉ từ P4 training graph.
3. Tính degree, cohort và popularity chỉ từ training.
4. Chiếu validation/test target vào mapping đã khóa.
5. Ghi rõ target bị loại vì unseen user, unseen item hoặc cả hai.
6. Khi xếp hạng một target, loại các training positive đã quan sát trước target khỏi candidate set.
7. Dùng toàn bộ training-item catalog còn hợp lệ, không thay bằng sampled candidate khi báo NDCG/Recall.

Protocol này ngăn future interaction định nghĩa graph hoặc popularity. Tham khảo [nghiên cứu về leakage trong offline recommender evaluation](https://arxiv.org/abs/2010.11060).

## 8. Population sau protocol

| Population | Candidate rows | Warm rows | Retention |
|---|---:|---:|---:|
| Validation | 373.776 | 81.871 | 21,90% |
| Test | 413.413 | 40.587 | 9,82% |

Retention thấp là giới hạn của pure-ID warm-start evaluation. Không diễn giải những target bị loại là model prediction failure; chúng nằm ngoài population mà model có ID embedding.

## 9. Training graph và mất cân bằng

- 3.868.654 edge.
- 2.318.308 user.
- 162.125 item.
- Density: `1,0293 × 10^-5`.
- 71,76% user singleton.
- 33,35% item singleton.
- Item-degree Gini: 0,8584.
- Top 1% item giữ 44,09% edge.

EDA phải hiển thị rating distribution, degree distribution theo log scale, cumulative share và warm-start retention. Không dùng biểu đồ trung bình đơn lẻ để che mất long-tail.

## 10. Điều protocol này cho phép và không cho phép

Protocol cho phép đánh giá warm-start pure-ID recommendation trên một temporal training graph đã khóa.

Protocol không cho phép tự động kết luận:

- cold-start performance;
- semantic relevance hoặc semantic diversity;
- hiệu quả trên dataset ngoài Amazon;
- scalability từ Home and Kitchen khi chưa chạy;
- test performance khi test target chưa được đọc.

Mọi nhánh dataset mới phải ghi trước mục tiêu: kiểm tra graph-sampling generalization, semantic diversity hay scale. Không thêm dataset chỉ để tăng số lượng thí nghiệm.
