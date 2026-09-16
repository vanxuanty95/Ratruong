# Đối soát Full LightGCN validation sanity

> Ngày đối soát: 2026-09-14  
> Bundle SHA-256: `13aacae23727d643b722a015d773064fbc1b5ef079e85a46400cdf9c1398b9fc`

## Kết luận gate

Run hợp lệ cho mục đích **full-graph feasibility sanity**:

- archive có đúng ba artifact đã khai báo và không chứa checkpoint;
- 33/33 integrity assertion pass;
- config SHA-256 khớp `6456b3d992903d77f69c1e0a4efad6398492ea6efcdad57561009b4d6d17651a`;
- 3.868.654 training edge tạo đúng 7.737.308 directed adjacency entry;
- đủ 5 epoch, mỗi epoch nhìn đủ toàn bộ training edge, tổng 5 optimizer step;
- 19.343.270 negative draw khớp `5 × 3.868.654`;
- validation có đủ 81.871 target, không đọc test.

Các phép đối soát độc lập cho tổng hit/row theo item cohort và user cohort, `rows × K`, coverage, exposure share và Recall đều khớp summary.

## Kết quả

| Chỉ số | MostPop | BPR-MF | Full LightGCN | Full − BPR |
|---|---:|---:|---:|---:|
| NDCG@20 | 0,005873 | 0,004054 | 0,004931 | +0,000878 |
| Recall@20 | 1,4596% | 1,0419% | 1,2373% | +0,1954 điểm % |
| Hit@20 | 1.195 | 853 | 1.013 | +160 |
| Catalog Coverage@20 | 0,0154% | 3,3517% | 0,6365% | −2,7152 điểm % |
| Unique recommended item | 25 | 5.434 | 1.032 | −4.402 |

So với BPR-MF, Full LightGCN tăng 21,65% NDCG và 18,76% Recall theo tỷ lệ tương đối, nhưng coverage giảm 81,01%. Nó vẫn thấp hơn MostPop 16,03% NDCG và 15,23% Recall.

## Gain nằm ở đâu

| Phân rã hit | BPR-MF | Full LightGCN | Chênh lệch |
|---|---:|---:|---:|
| Head target | 830 | 1.012 | +182 |
| Body target | 23 | 1 | −22 |
| Tail target | 0 | 0 | 0 |
| Active user | 245 | 208 | −37 |
| Repeat-light user | 244 | 266 | +22 |
| Singleton user | 364 | 539 | +175 |

Aggregate gain chủ yếu đến từ head target và singleton user. Exposure của Full LightGCN gồm 99,36% head, 0,64% body và 0% tail. Vì vậy message passing có thêm validation signal so với BPR-MF ở fixed sanity run, nhưng đồng thời kéo ranking trở lại phía popular item; nó chưa giải quyết body/tail failure.

## Tài nguyên

| Pha | Wall time | Peak GPU memory |
|---|---:|---:|
| Full LightGCN training | 38,01 giây | 6.559,0 MB |
| Full LightGCN validation | 7,20 giây | 3.841,8 MB |
| BPR-MF training, để tham chiếu | 24,83 giây | 2.051,5 MB |

Full LightGCN training dùng khoảng 1,53 lần thời gian và 3,20 lần peak GPU memory của BPR-MF. Đây chỉ là mô tả feasibility trên cùng Tesla T4. Hai run khác optimizer và số optimizer step, nên các tỷ lệ này không phải so sánh hiệu quả cùng ngân sách.

## Quyết định tiếp theo

Baseline gate đã đủ rõ để mở sampling controls. Run kế tiếp là M0 uniform sampled-training smoke ở budget từng layer `[65.536, 65.536, 65.536]`; M1 degree-aware đã được đăng ký trước cùng `matched_control_id = static-controls-k65536-smoke-v1` để ngăn việc sửa đối chứng sau khi xem M0. Đây là một global context-node budget cho mỗi batch/layer, đặt bằng training batch size trong smoke run, không phải mức giữa của một lưới budget đã kiểm chứng.

Full LightGCN tiếp tục là full-graph reference. So sánh matched đầu tiên chỉ hình thành sau khi cả M0 và M1 chạy cùng budget, seed, BPR batch/negative, backbone, evaluator và phần cứng.
