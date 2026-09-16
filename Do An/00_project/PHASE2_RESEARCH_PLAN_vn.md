# Kế hoạch nghiên cứu theo timeline

> Trạng thái: paired validation đã hoàn thành, nhánh thiết kế sampler dừng ở M2
>
> Cập nhật: 16/09/2026

## 1. Câu hỏi xuyên suốt

Đồ án kiểm tra một thay đổi duy nhất: **cách chọn node ngữ cảnh để dựng computation graph khi huấn luyện LightGCN**.

> Ở cùng dataset, model, sampling budget, số bước huấn luyện, seed, evaluator và GPU, sampler sử dụng frontier của batch có tạo được trade-off tốt hơn giữa exact full-catalog NDCG@20 và chi phí tính toán so với uniform và degree-aware sampling hay không?

Nếu câu trả lời là không, nghiên cứu vẫn hoàn thành khi chỉ ra được sampler đã thay đổi điều gì, vì sao thay đổi không tạo gain và giới hạn của bằng chứng nằm ở đâu.

## 2. Timeline thực tế

| Giai đoạn | Câu hỏi cần trả lời | Bằng chứng | Kết quả |
|---|---|---|---|
| Phản hồi 03/09 | Dữ liệu có bao nhiêu user, item, rating; có nhiễu, mất cân bằng và long-tail không? | Exact audit, histogram, degree và concentration | Hoàn thành |
| Chọn dữ liệu | Vì sao dùng Baby Products thay vì dataset nhỏ hơn, lớn hơn hoặc ngoài Amazon? | Portfolio audit và benchmark comparison | Hoàn thành ở mức thiết kế |
| Dựng bài toán | Dùng quá khứ để train và tương lai để đánh giá như thế nào mà không leakage? | Temporal graph manifest, warm-start ledger | Hoàn thành |
| Sanity baseline | Evaluator và training pipeline có cho kết quả hợp lý không? | MostPop, BPR-MF và Full LightGCN | Hoàn thành |
| M0 | Uniform sampling thay full graph như thế nào? | Một smoke run có integrity checks | Hoàn thành |
| M1 | Ưu tiên node nhiều liên kết có hơn uniform không? | Matched M1 trừ M0 | Hoàn thành |
| M2 | Frontier-conditioned proposal có sửa nhược điểm của M1 không? | Matched M2 trừ M0/M1 | Không vượt M1 |
| Paired validation | Kết luận có giữ qua seed không? | s0, s1, s2; rank vector và summary | M2 thấp hơn M1 trong 3/3 seed |
| Tổng hợp | Đâu là kết luận đủ mạnh nhưng không vượt bằng chứng? | Slide, report, thesis và consistency gate | Đang hoàn thiện |

## 3. Lựa chọn dataset

### 3.1 Các benchmark ngoài Amazon đã cân nhắc

- **MovieLens 25M** là benchmark ổn định với 25 triệu rating, metadata phim, tag và tag genome. Nó phù hợp cho collaborative filtering và semantic diversity, nhưng mỗi user có ít nhất 20 rating nên không giữ tình trạng user singleton rất mạnh của dữ liệu hiện tại.
- **Gowalla** và **Yelp2018** là đối chứng gần nhất về phương pháp vì nghiên cứu LightGCN dùng chúng với Recall@20 và NDCG@20. Tuy nhiên các bản phổ biến đã được lọc và chia train/test ngẫu nhiên, khác protocol temporal từ raw data của đồ án.
- **MIND** có impression log và nội dung văn bản, phù hợp cho news recommendation và semantic relevance. Nó thay đổi cả miền bài toán lẫn cách hiểu item.
- **KuaiRec** gần fully observed nên rất tốt để nghiên cứu exposure bias. Catalog nhỏ và ma trận dày khiến nó không tạo cùng bài toán sparse-graph sampling.

Các dataset này chỉ đặt nghiên cứu vào bối cảnh. Đồ án chưa chạy thực nghiệm trên chúng.

### 3.2 Ba dataset Amazon đã kiểm toán

| Dataset | Raw rows | Vai trò |
|---|---:|---|
| `All_Beauty` | 693.929 | Kiểm tra pipeline và protocol trên dữ liệu nhỏ |
| `Baby_Products` | 5.953.891 | Dataset chính |
| `Home_and_Kitchen` | 66.623.880 | Scale reference, khoảng 11,19 lần Baby; chưa chạy full experiment |

Baby Products được chọn vì đủ lớn để bộc lộ chi phí graph sampling, có sparsity và long-tail mạnh, nhưng vẫn cho phép chạy ma trận thí nghiệm M0–M2 trên Colab/Tesla T4. All Beauty quá nhỏ và warm-start retention thấp để làm bằng chứng chính. Home and Kitchen phù hợp cho một scale stress riêng, nhưng chạy toàn bộ ma trận hiện tại sẽ mở rộng chi phí và claim vượt quá câu hỏi đã đăng ký.

## 4. Dữ liệu sau xử lý

- Raw: 5.953.891 dòng; 3.386.206 user; 217.654 item.
- Có một rating `0.0` ngoài miền 1–5. Dòng này bị quarantine.
- Không có user ID hoặc item ID bị thiếu, timestamp sai hay user-item pair trùng trong exact audit.
- P4 giữ rating 4 và 5: 4.655.843 interaction, bằng 78,20% raw rows.
- Training graph: 3.868.654 cạnh; 2.318.308 user; 162.125 item.
- Validation: 81.871 warm target trên 373.776 candidate row, retention 21,90%.
- Test: 40.587 warm target trên 413.413 candidate row, retention 9,82%. Test chưa được đọc khi chọn phương pháp.

Ba con số item không được trộn lẫn: 217.654 item ở raw data, 194.722 item trong P4, và 162.125 item trong training catalog. Coverage dùng 162.125 làm mẫu số.

## 5. Phân phối và long-tail

- 71,76% user training chỉ có một interaction; user degree p50/p90/p99 là 1/3/9.
- 33,35% item training chỉ có một interaction; item degree p50/p90/p99 là 3/32/397.
- Item-degree Gini bằng 0,8584.
- Top 1% item giữ 44,09% training interaction; top 20% giữ 89,65%.
- Theo cohort khóa trước model result, head chiếm khoảng 1% item nhưng 44,16% cạnh; tail chiếm 80,07% item nhưng chỉ 10,39% cạnh.

Vì vậy score tổng có thể tăng chỉ bằng cách phục vụ tốt hơn item phổ biến. Mọi kết quả phải đọc cùng exposure và hit theo head/body/tail.

## 6. Ba phương pháp lấy mẫu

### M0: uniform

M0 chọn đúng `k` candidate node ở mỗi layer mà không hoàn lại, mọi candidate có cơ hội như nhau. Đây là câu trả lời cho câu hỏi: nếu sampler không có thiên kiến popularity hoặc frontier thì kết quả ra sao?

### M1: degree-aware

M1 dùng priority `log(training_degree) + Gumbel`. Node nhiều liên kết có cơ hội cao hơn. Lý do dùng M1 là collaborative signal thường ổn định hơn ở node có nhiều quan sát, nhưng cơ chế này có thể làm đồ thị tính toán nghiêng về item phổ biến.

### M2: frontier-normalized

M2 dùng priority:

```text
log(frontier_support) - 0,5 × log(training_degree) + Gumbel
```

`frontier_support` là số training edge nối candidate node vào frontier của layer trước. M2 ưu tiên liên kết có ích cho batch hiện tại, đồng thời dùng căn degree để giảm lợi thế của hub. Đây là một project candidate cố định, không phải learned sampler.

## 7. Vì sao dùng các metric này

- **NDCG@20:** metric chính vì vị trí trong top 20 có ý nghĩa. Hit ở rank 1 được tính cao hơn rank 20.
- **Recall@20:** cho biết target có nằm trong top 20 hay không. Với một target mỗi dòng, đây là tỷ lệ user-target được hit.
- **Catalog Coverage@20:** cho biết phần catalog từng được xuất hiện trong recommendation. Nó phát hiện collapse nhưng không đo semantic diversity.
- **Exposure head/body/tail:** cho biết recommendation slot dồn vào nhóm nào.
- **Recall và hit theo cohort:** cho biết exposure có chuyển thành gợi ý đúng cho item ít phổ biến hay không.
- **Training time và peak GPU memory:** hai trục chi phí cần thiết để đánh giá trade-off.
- **Rank transition:** giải thích sampler đã thay đổi ranking ra sao, nhất là khi top-20 score không tăng.

Không đo semantic relevance hoặc intra-list semantic diversity vì artifact không có nội dung sản phẩm.

## 8. Kết quả chính

### 8.1 Sanity baselines

| Model | NDCG@20 | Recall@20 | Coverage@20 | Diễn giải |
|---|---:|---:|---:|---|
| MostPop | 0,005873 | 0,014596 | 0,000154 | Chỉ recommend 25 item, 100% exposure ở head |
| BPR-MF | 0,004054 | 0,010419 | 0,033517 | Coverage rộng hơn nhưng accuracy thấp hơn |
| Full LightGCN | 0,004931 | 0,012373 | 0,006365 | Message passing tăng so với BPR-MF, gain lại tập trung vào head |

Các baseline xác nhận evaluator và cho thấy accuracy–coverage tension đã tồn tại trước khi thay sampler.

### 8.2 Smoke seed s0

| Phương pháp | NDCG@20 | Recall@20 | Coverage@20 | Training time |
|---|---:|---:|---:|---:|
| M0 | 0,005727 | 0,014657 | 0,018486 | 705,32 s |
| M1 | **0,006153** | **0,015989** | 0,017783 | 795,11 s |
| M2 | 0,005921 | 0,015317 | 0,017863 | 868,63 s |

M1 tăng quality so với M0 ở s0 nhưng toàn bộ 109 hit tăng thêm thuộc head. M2 đưa item-context về phía tail nhiều hơn M1, nhưng tail hit vẫn bằng 0 và chi phí đếm frontier support làm sampler chậm hơn.

### 8.3 Paired validation ba seed

| Phương pháp | NDCG@20 mean ± SD | Recall@20 mean ± SD | Coverage@20 mean ± SD |
|---|---:|---:|---:|
| M0 | 0,005706 ± 0,000073 | 0,014869 ± 0,000488 | **0,018132 ± 0,000318** |
| M1 | **0,005866 ± 0,000249** | **0,015296 ± 0,000620** | 0,017534 ± 0,000627 |
| M2 | 0,005721 ± 0,000179 | 0,014873 ± 0,000579 | 0,017513 ± 0,000318 |

M2 trừ M1 âm về NDCG và Recall trong cả ba seed. M2 vẫn tạo hàng trăm gained/lost hit và thay đổi rank rộng, nên implementation không phải “không có tác dụng”. Vấn đề là thay đổi không tạo top-20 gain ổn định và phải trả thêm CPU sampler time.

## 9. Quyết định

1. Không promote M2.
2. Không mở M3 sau khi đã nhìn validation result.
3. Không dùng test để chọn lại phương pháp.
4. Giữ M2 như negative result: local frontier relevance cùng degree penalty chưa đủ để cải thiện ranking trong dữ liệu rất thưa và popularity-dominated này.
5. Nếu luận văn cần thêm bằng chứng, chỉ mở một nhánh đăng ký trước: Yelp2018/Gowalla để kiểm tra tính khái quát của graph sampling, hoặc metadata dataset để đo semantic diversity. Hai mục tiêu này không được trộn vào cùng một thí nghiệm.

## 10. Việc còn lại

- Hoàn thiện slide, báo cáo và thesis từ số liệu đã khóa.
- Giữ một deck chuẩn, một timeline và một bộ tài liệu hiện hành.
- Chạy consistency gate và toàn bộ test trước khi commit vào `main`.
- Chỉ chạy test split nếu deliverable chính thức đòi hỏi một final-test result đã đăng ký trước.
