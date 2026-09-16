# Đối soát độc lập M1 degree-aware sampling

## 1. Kết luận kiểm tra

Bundle hợp lệ và đủ đúng ba artifact đã khai báo. SHA-256 của bundle là `bc6ccfb41006a5164d01c0e27ccd52f293d02ec52b7c02a1322d8b5b3c19d45c`.

- `degree_aware_sampling_validation_summary.json`: `46d83f7e6938c94be3376a5e71387e6a1bf9e9db32043d4dbbd10378f9bd07da`.
- `DEGREE_AWARE_SAMPLING_VALIDATION_vn.md`: `f556b7206e3ed38cc90c877b6dc57c5448a673ea4ef2a05274c1997aa82198ff`.
- `01_degree_aware_sampling_validation_smoke.png`: `27f4d83f5b06e88e2bcb46e265bebbecbbe34392c49d38efe524668aac00394e`.

Cả 57/57 integrity assertion đều bằng `true`. Config M1, M0 summary, ba baseline summary, row count và data checksum đều khớp. Run dùng Tesla T4, đủ 5 epoch, 300 optimizer step, exact-k ở mọi layer và full-graph exact validation. Không có test access hay checkpoint.

## 2. So sánh matched M1 với M0

| Chỉ số | M0 uniform | M1 degree-aware | M1 − M0 |
|---|---:|---:|---:|
| NDCG@20 | 0,005727 | 0,006153 | +0,000426; +7,44% |
| Recall@20 | 1,4657% | 1,5989% | +0,1331 điểm %; +9,08% |
| Hit@20 | 1.200 | 1.309 | +109 |
| Unique recommended item | 2.997 | 2.883 | −114 |
| Catalog Coverage@20 | 1,8486% | 1,7783% | −3,80% tương đối |
| Training wall time | 705,32 giây | 795,10 giây | +89,78 giây; +12,73% |
| Training peak GPU | 3.482,90 MB | 2.665,10 MB | −817,80 MB; −23,48% |

Đây là so sánh matched đầu tiên: model, training, evaluator, seed, budget và GPU giữ nguyên; proposal đổi từ uniform sang training-degree proportional.

## 3. Gain nằm ở đâu

Toàn bộ 109 hit tăng thêm thuộc head: head tăng từ 1.175 lên 1.284, body giữ nguyên 25 và tail vẫn 0. Theo user cohort, active tăng 28 hit, repeat-light tăng 30 và singleton tăng 51.

Exposure head giảm 0,84 điểm phần trăm, body tăng 1,05 điểm và tail giảm 0,21 điểm. Vì vậy M1 không đơn giản là đưa thêm recommendation vào head. Tuy nhiên phần utility tăng thêm vẫn chỉ đến từ head target; coverage còn giảm. Kết quả đúng là degree proposal cải thiện aggregate ranking tại smoke seed này nhưng chưa cải thiện body/tail relevance.

## 4. Proposal đã thay computation graph thế nào

Hai run đều chọn tổng cộng 58.982.400 context-node slot. M1 chọn item context nhiều gấp 6,23 lần M0. Trong item context đã chọn, tỷ trọng body tăng từ 39,31% lên 68,29%, còn tail giảm từ 60,52% xuống 31,48%. Số directed block entry tăng 22,53%, đi cùng sampler time tăng 10,93%.

Peak GPU của M1 thấp hơn dù block entry nhiều hơn. Một run không đủ để gán chênh lệch memory này cho proposal; cần paired repeats trước khi dùng làm claim ổn định.

## 5. Quyết định bước tiếp theo

M0 và M1 đã hoàn tất vai trò static controls. Chỉ mở một project candidate M2, không mở cả họ phương pháp:

```text
frontier_support_l(v) = số training edge từ candidate v vào K_(l-1)
weight_l(v) = frontier_support_l(v) / sqrt(training_degree(v))
priority_l(v) = log(weight_l(v)) + Gumbel
```

M2 dùng exact-k không hoàn lại. Công thức ưu tiên node liên quan tới frontier của batch hiện tại và giảm ảnh hưởng của global hub theo cùng căn bậc hai xuất hiện trong LightGCN normalization. M2 giữ nguyên toàn bộ contract M0/M1; chưa dùng learned policy và chưa đọc test.

## 6. Ranh giới kết luận

- Đây là một validation-only smoke seed, chưa có uncertainty interval hay significance claim.
- MostPop, BPR-MF và Full LightGCN vẫn chỉ là context reference, không phải budget-matched controls.
- Chưa dùng test split để chọn phương pháp.
- M2 chỉ được đánh giá bằng chênh lệch matched với cả M0 và M1.
