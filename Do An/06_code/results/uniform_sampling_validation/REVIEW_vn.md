# Đối soát M0 uniform sampled LightGCN

## Kết luận

Bundle hợp lệ cho một validation-only smoke run. Cả 46/46 integrity assertion đều `true`; config, dữ liệu và ba baseline summary khớp checksum; đủ 5 epoch, 300 optimizer step và 19.343.270 negative draw; test target không được đọc. Kết quả này mở M1 degree-aware dưới cùng matched-control contract, nhưng chưa cho phép kết luận về sampler đề xuất hoặc test set.

M0 cho tín hiệu chất lượng tốt hơn Full LightGCN ở run hiện tại và phân tán recommendation rộng hơn, nhưng đổi lại training chậm hơn rất nhiều. Vì Full LightGCN chỉ có 5 global optimizer step còn M0 có 300 mini-batch step, so sánh giữa hai run chỉ mang tính mô tả. So sánh nhân quả đầu tiên về proposal lấy mẫu phải là M1 degree-aware trừ M0 uniform.

## Provenance

- Bundle SHA-256: `95ed9c9629d15e350a3838248d6e772950a13724d6441bae1b027a2b97a361e6`.
- Summary SHA-256: `f29ed8f15d50a6d585ecb9cdcfc160232b64f9936e83fc8db6dac442bf941474`.
- Config M0 SHA-256: `b2b91b78262b562ad937be8a6328ebcd42f80b6a3b8e1695a988877e93c1b884`.
- Matched control ID: `static-controls-k65536-smoke-v1`.
- Runtime: Tesla T4, PyTorch 2.11.0 + CUDA 12.8.

## Chất lượng và độ phủ

| Chỉ số | MostPop | BPR-MF | Full LightGCN | M0 uniform |
|---|---:|---:|---:|---:|
| NDCG@20 | 0,005873 | 0,004054 | 0,004931 | 0,005727 |
| Recall@20 | 1,4596% | 1,0419% | 1,2373% | 1,4657% |
| Hit@20 | 1.195 | 853 | 1.013 | 1.200 |
| Unique recommended item | 25 | 5.434 | 1.032 | 2.997 |
| Catalog Coverage@20 | 0,0154% | 3,3517% | 0,6365% | 1,8486% |

So với Full LightGCN, M0 tăng 16,14% NDCG, 18,46% Recall và thêm 187 hit; coverage tăng 190,41% theo tỷ lệ tương đối. So với MostPop, M0 thêm 5 hit và tăng mạnh coverage, nhưng NDCG thấp hơn 2,47%. Điều này cho thấy M0 đưa thêm relevant item vào top 20 nhưng vị trí của các hit hơi thấp hơn popularity ranking.

Không gọi các chênh lệch trên là có ý nghĩa thống kê: bundle chỉ chứa aggregate/cohort summary của một seed, không chứa per-row rank để chạy paired bootstrap.

## Gain nằm ở đâu

| Target cohort | Full LightGCN | M0 uniform | M0 − Full |
|---|---:|---:|---:|
| Head hit | 1.012 | 1.175 | +163 |
| Body hit | 1 | 25 | +24 |
| Tail hit | 0 | 0 | 0 |

| User cohort | Full LightGCN | M0 uniform | M0 − Full |
|---|---:|---:|---:|
| Active hit | 208 | 270 | +62 |
| Repeat-light hit | 266 | 354 | +88 |
| Singleton hit | 539 | 576 | +37 |

M0 cải thiện cả ba user cohort và khôi phục body hit so với Full LightGCN. Exposure giảm từ 99,36% head xuống 95,18%; body chiếm 2,27% và tail 2,54%. Tuy vậy tail exposure khác 0 vẫn đi cùng 0 tail hit. M0 phân tán danh sách rộng hơn nhưng chưa tìm đúng relevant tail item.

## Tài nguyên và nút thắt

| Pha | Wall time | Peak GPU memory |
|---|---:|---:|
| M0 training | 705,32 giây | 3.482,90 MB |
| M0 exact validation | 7,22 giây | 4.487,66 MB |
| Full LightGCN training, tham chiếu | 38,01 giây | 6.559,05 MB |

M0 giảm 46,90% peak GPU memory trong training so với Full LightGCN, nhưng mất thời gian gấp 18,56 lần. Trong 705,32 giây training, sampler dùng 592,79 giây, tương đương 84,04%; propagation và update chỉ dùng 62,10 giây.

Mỗi batch/layer chỉ chọn khoảng 3,34% candidate node slot. Tuy nhiên, cộng qua một epoch, computation graph đã chạm đủ 2.480.433 node và sampled blocks đã chạm đủ 3.868.654 training edge ít nhất một lần. Kết quả này cho thấy budget cục bộ giảm memory tại một thời điểm, nhưng cách dựng candidate bằng NumPy/SciPy trên CPU đang lặp lại quá nhiều global neighborhood work. Đây là nút thắt implementation cần tách khỏi giá trị của proposal lấy mẫu.

## Quyết định tiếp theo

Chạy M1 degree-aware từ config đã khóa, giữ nguyên toàn bộ pipeline M0 và chỉ thay uniform Gumbel priority bằng `log(training_degree) + Gumbel`. M1 phải đọc và khóa hash summary M0, kiểm cùng GPU Tesla T4, ghi cùng resource fields và dùng full-graph exact validation.

Sau khi M1 hợp lệ, so sánh trực tiếp `M1 − M0` về NDCG, Recall, coverage, cohort exposure, sampler time và memory. Chỉ lúc đó mới quyết định có mở một sampler đề xuất hay cần sửa implementation của static controls trước.
