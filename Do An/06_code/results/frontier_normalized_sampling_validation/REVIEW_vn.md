# Đối soát độc lập M2 frontier-normalized

> Ngày đối soát: 2026-09-15  
> Kết luận: **run hợp lệ, nhưng M2 không vượt promotion gate so với M1**

## 1. Tính toàn vẹn

- ZIP giải nén không lỗi và chỉ chứa ba artifact đã đăng ký: summary JSON, báo cáo Markdown và một PNG.
- Bundle SHA-256: `93bb9b1b08ffc5e3feb2c19a400ff4426bf54678a381158a41a2327bf6a46d55`.
- Summary SHA-256: `26a1eb63db8d42582d955939623a0ef6a03082e22a1401b5255642d56021d0e3`.
- Config SHA-256 trong summary khớp file đã khóa: `b82651b29dd31a8eeaa279e2bc0c7612ee1daaa4c205f231dde39b65bef8563d`.
- M0 summary SHA-256 khớp: `f29ed8f15d50a6d585ecb9cdcfc160232b64f9936e83fc8db6dac442bf941474`.
- M1 summary SHA-256 khớp: `46d83f7e6938c94be3376a5e71387e6a1bf9e9db32043d4dbbd10378f9bd07da`.
- Cả 62/62 integrity assertion đều bằng `true`.
- Run dùng Tesla T4, đủ 5 epoch và 300 optimizer step, exact full-graph validation; test target không được đọc.

M2 giữ nguyên matched-control contract của M0–M1. Biến can thiệp duy nhất là priority:

`log(frontier_support) - 0,5 × log(training_degree) + Gumbel`

## 2. Kết quả matched

| Chỉ số | M0 uniform | M1 degree-aware | M2 frontier-normalized |
|---|---:|---:|---:|
| NDCG@20 | 0,005727 | **0,006153** | 0,005921 |
| Recall@20 | 1,4657% | **1,5989%** | 1,5317% |
| Hit@20 | 1.200 | **1.309** | 1.254 |
| Unique recommended item | **2.997** | 2.883 | 2.896 |
| Catalog Coverage@20 | **1,8486%** | 1,7783% | 1,7863% |
| Training time | **705,32 giây** | 795,10 giây | 868,63 giây |
| Training peak GPU | 3.482,90 MB | **2.665,10 MB** | 2.669,06 MB |

### M2 so với M0

- NDCG tăng 3,38%; Recall tăng 4,50%, tương đương thêm 54 hit.
- Coverage giảm 3,37%, tương đương ít hơn 101 unique item.
- Training chậm hơn 23,15%.
- Peak GPU giảm 23,37%.

M2 tốt hơn M0 về quality và peak memory, nhưng kém về time và coverage. Đây là trade-off hỗn hợp, không phải Pareto dominance.

### M2 so với M1

- NDCG giảm 3,78%; Recall giảm 4,20%, tương đương mất 55 hit.
- Coverage tăng 0,45%, chỉ thêm 13 unique item.
- Training chậm hơn 9,25%.
- Peak GPU tăng 3,96 MB, tương đương 0,15%; chênh lệch nhỏ này nên xem như cùng mức trong một smoke run.

M1 cao hơn M2 về NDCG, Recall và tốc độ, đồng thời có peak GPU hơi thấp hơn. Lợi ích duy nhất của M2 là 13 item coverage. Với objective quality–cost đã đăng ký, **M1 chi phối M2** ở seed hiện tại.

## 3. Gain vẫn chỉ đến từ head

| Target cohort | M0 hit | M1 hit | M2 hit | M2 − M0 | M2 − M1 |
|---|---:|---:|---:|---:|---:|
| Head | 1.175 | 1.284 | 1.229 | +54 | −55 |
| Body | 25 | 25 | 25 | 0 | 0 |
| Tail | 0 | 0 | 0 | 0 | 0 |

M2 tăng 54 hit so với M0 nhưng cả 54 đều thuộc head. So với M1, M2 mất 55 head hit. Body giữ nguyên 25 và tail vẫn 0 ở cả ba sampler. Công thức frontier-normalized chưa chuyển structural reweighting thành body/tail relevance.

| Recommendation exposure | M0 | M1 | M2 |
|---|---:|---:|---:|
| Head | 95,18% | 94,34% | 94,90% |
| Body | 2,27% | 3,33% | 2,64% |
| Tail | 2,54% | 2,33% | 2,47% |

Exposure M2 nằm giữa M0 và M1. Mức dịch chuyển nhỏ không thay đổi hit ở body/tail.

Theo user cohort, M2 hơn M0 23 active hit, 5 repeat-light hit và 26 singleton hit. So với M1, M2 thấp hơn 5 active hit, 25 repeat-light hit và 25 singleton hit. M2 không tạo một cohort user mới có lợi thế rõ.

## 4. Trace cơ chế giải thích vì sao M2 không tiến lên

Cả ba sampler đều chọn đúng 58.982.400 context-node slot. Khác biệt nằm ở loại node được chọn và số edge được kéo vào sampled blocks.

| Trace | M0 | M1 | M2 |
|---|---:|---:|---:|
| Item-context slot | 555.087 | 3.456.498 | 290.606 |
| Head trong item-context | 0,17% | 0,24% | 0,20% |
| Body trong item-context | 39,31% | 68,29% | 31,20% |
| Tail trong item-context | 60,52% | 31,48% | 68,60% |
| Directed block entry | 512.953.091 | 628.507.026 | 553.267.420 |
| Sampler time | 592,79 giây | 657,58 giây | 702,72 giây |
| Sampler share của training | 84,04% | 82,70% | 80,90% |

M2 chọn ít item-context hơn M0 47,65% và ít hơn M1 91,59%. Trong phần item-context còn lại, tỷ trọng tail tăng lên 68,60%. Trace này phù hợp với một sự điều chỉnh mạnh về low-degree candidate, nhưng không chứng minh quan hệ nhân quả từ một seed.

M2 tạo ít directed block entry hơn M1 11,97% nhưng sampler vẫn tốn thêm 45,14 giây. Việc đếm frontier support và tính priority đã tăng overhead nhiều hơn phần computation graph tiết kiệm được. So với M0, candidate slot gần như bằng nhau, block entry tăng 7,86% và sampler time tăng 18,54%.

Kết quả cơ chế hợp lý nhất là: chuẩn hóa bằng căn degree đã kéo proposal ra khỏi body-heavy regime của M1 và làm item-context nghiêng về tail, nhưng tín hiệu đó không tạo tail hit; đồng thời frontier-support computation làm training chậm nhất trong ba phương pháp.

## 5. Quyết định nghiên cứu

1. **Không promote M2** làm phương pháp cuối ở thời điểm này.
2. **Không mở M3 hoặc learned sampler** sau khi đã xem validation score.
3. **Không dùng test split** để cứu hoặc chọn phương pháp.
4. Giữ M2 như negative result: một task-conditioned structural proposal hợp lệ nhưng không vượt degree-aware control.
5. Bước bằng chứng kế tiếp, nếu còn ngân sách chạy, là khóa hai seed bổ sung và lặp lại M0–M1–M2 theo paired protocol. Mục tiêu là kiểm tra dominance của M1 và mức biến động time/memory, không phải tìm công thức mới.

Nếu M1 tiếp tục chi phối M2 qua seed, kết luận luận văn phải nói thẳng rằng frontier normalization không cải thiện Pareto trade-off. Đóng góp khi đó nằm ở protocol temporal, exact full-catalog evaluation, matched resource accounting và failure analysis có kiểm soát.

## 6. Câu nói ngắn khi trình bày

> M2 chạy hợp lệ và tốt hơn uniform về quality, nhưng kém degree-aware: NDCG thấp hơn 3,78%, Recall thấp hơn 4,20% và training chậm hơn 9,25%, trong khi chỉ thêm 13 item coverage. Body vẫn 25 hit và tail vẫn 0. Vì vậy em dừng mở sampler mới, giữ đây là negative result và chỉ kiểm lại bằng paired seeds trước khi dùng test.
