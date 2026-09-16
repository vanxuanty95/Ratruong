# Paired sampling validation

Trạng thái: PAIRED_VALIDATION_COMPLETE

Hoàn thành 6/6 run mới.

| Run | NDCG@20 | Recall@20 | Train (s) | Peak GPU (MB) |
|---|---:|---:|---:|---:|
| s1_M0 | 0.00562498 | 0.01452285 | 731.01 | 2669.93 |
| s1_M1 | 0.00570429 | 0.01479156 | 795.35 | 2665.29 |
| s1_M2 | 0.00557387 | 0.01421749 | 946.07 | 2669.27 |
| s2_M2 | 0.00566818 | 0.01508471 | 883.82 | 2669.19 |
| s2_M0 | 0.00576692 | 0.01542671 | 711.71 | 2677.61 |
| s2_M1 | 0.00574037 | 0.01510914 | 804.78 | 2664.95 |

## Paired M2 − M1

| Seed | ΔNDCG | ΔRecall | ΔTrain (s) | Pairing |
|---|---:|---:|---:|---|
| s1 | -0.00013042 | -0.00057407 | +150.72 | pass |
| s2 | -0.00007218 | -0.00002443 | +79.04 | pass |

## Giới hạn

Hai seed validation bổ sung ở cùng 5 epoch/300 optimizer step. M2 giữ nguyên công thức đã chọn sau khi xem s0; đây là kiểm chứng sau thiết kế, không phải holdout độc lập của quá trình chọn phương pháp. Báo cáo từng seed và quality mean/sample SD, không chọn best seed, không significance claim, không đổi objective, không đọc test và không tự promote M2. Ba seed không chứng minh hiệu quả ở budget huấn luyện khác hoặc dataset khác.

Training wall time gồm các integrity/trace audit, fingerprint đầu vào mỗi epoch và CPU sampler; không gồm đọc dữ liệu, checksum embedding ban đầu, validation hoặc lưu kết quả. Sampled training peak GPU được reset riêng trước training, full-graph validation peak reset riêng sau khi dựng inference graph. So sánh resource ưu tiên paired run mới trong cùng seed/môi trường. Resource s0 chỉ là legacy context, không gộp mean/SD với run mới vì có instrumentation bổ sung; quality có thể tổng hợp ba seed nếu core/data/evaluator và các runtime field đã ghi giữ nguyên. Process peak RSS là lifetime high-water mark, không phải peak CPU riêng của từng run.

JSON chứa rank transitions head/body/tail; quality chỉ gộp s0 khi các runtime field đã ghi khớp.
Seed s0 không có row-level rank artifact, nên không suy diễn target overlap cho s0.
Không chọn best seed, không p-value/significance claim, không đọc test và không auto-promote M2.
