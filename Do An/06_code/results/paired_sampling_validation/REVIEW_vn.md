# Đối soát paired sampling validation

> Đối soát ngày 2026-09-16. Nguồn là bundle Colab, không phải số chép từ bảng báo cáo.

## Kết luận ngắn

Bundle hợp lệ và đủ 6/6 run mới. Cả ba seed `s0`, `s1`, `s2` đều cho cùng dấu: M2 thấp hơn M1 về NDCG@20 và Recall@20. Ở hai paired seed mới, M2 cũng chậm hơn M1 lần lượt 150,72 và 79,04 giây. Vì vậy giả thuyết rằng frontier-normalized M2 tạo trade-off quality–cost tốt hơn static degree-aware M1 **không được dữ liệu này ủng hộ**.

Đây là negative result ở một dataset, một smoke budget và ba validation seed; không phải chứng minh phổ quát hay significance claim.

## Gate đã kiểm độc lập

- ZIP có đúng 15 entry trong whitelist, CRC sạch, không path traversal, checkpoint hoặc raw data.
- Protocol trong bundle khớp byte-for-byte với protocol đã đăng ký; SHA-256 là `69de31ebe2a25da4b6000663f0dfee3ca0cd903dd2a767c6ac187174d86ec689`.
- Đủ sáu identity `s1_M0`, `s1_M1`, `s1_M2`, `s2_M2`, `s2_M0`, `s2_M1`; config, source hash, target order, runtime và seed khớp.
- Trong từng seed, checksum embedding khởi tạo, training-pair order và negative draw của cả 5 epoch giống nhau giữa M0–M1–M2.
- Mỗi run có 5 epoch, 300 optimizer step và mọi integrity assertion là boolean `true`.
- Sáu `validation_ranks.npz` đều là `int32[81871]`, chỉ có key `ranks`, không dùng pickle. Hit, Recall@20 và NDCG@20 được tính lại trực tiếp từ rank vector và khớp summary.
- Overall gained/lost hit và rank-improved/worsened được tính lại cho M2–M1 và M2–M0 ở cả hai seed, khớp aggregate.
- Ba summary s0 cục bộ khớp SHA đã pin. Mean và sample SD ba seed được tính lại, khớp aggregate. Python/Torch/CUDA/GPU khớp nên chỉ quality được gộp; resource s0 vẫn để riêng do instrumentation khác.
- Bốn run sau hotfix ghi 0 CUDA tensor còn sống và 8,125 MiB native workspace. Hai run trước hotfix vẫn qua identity/integrity gate; protocol, engine và dữ liệu không đổi.
- `test_targets_read = false`; không có automatic promotion.

## Kết quả theo seed: M2 − M1

| Seed | ΔNDCG@20 | ΔRecall@20 | ΔHit@20 | ΔTraining time |
|---|---:|---:|---:|---:|
| s0 | −0,00023260 | −0,00067179 | −55 | +73,53 s |
| s1 | −0,00013042 | −0,00057407 | −47 | +150,72 s |
| s2 | −0,00007218 | −0,00002443 | −2 | +79,04 s |

Dấu NDCG/Recall đều âm ở 3/3 seed. Ở s1, M2 đổi 191 target từ miss thành hit nhưng làm mất 238 hit của M1; ở s2 là 242 gained và 244 lost. Rank movement rộng không chuyển thành top-20 gain ổn định.

Tail hit bằng 0 ở cả M0, M1 và M2 trên cả ba seed. Body hit của M2 so với M1 lần lượt là 25/25, 23/24 và 28/29. M2 không tạo bằng chứng long-tail relevance.

## Tổng hợp quality ba seed

| Method | NDCG@20 mean ± sample SD | Recall@20 mean ± sample SD | Coverage@20 mean ± sample SD |
|---|---:|---:|---:|
| M0 | 0,00570640 ± 0,00007324 | 0,01486892 ± 0,00048771 | **0,01813210 ± 0,00031820** |
| M1 | **0,00586598 ± 0,00024947** | **0,01529642 ± 0,00062009** | 0,01753380 ± 0,00062722 |
| M2 | 0,00572092 ± 0,00017933 | 0,01487299 ± 0,00057942 | 0,01751324 ± 0,00031838 |

So với M1 theo mean ba seed, M2 thấp hơn 2,47% NDCG, 2,77% Recall và 0,12% coverage. M1 có mean quality cao nhất nhưng không thắng M0 ở mọi seed; vì vậy chỉ gọi M1 là **static reference mạnh nhất theo mean validation**, không claim superiority hay significance.

Ở hai run mới, M2 mất trung bình 914,95 giây training, M1 mất 800,07 giây: M2 chậm hơn 114,88 giây, tương đương 14,36%. Peak GPU trung bình chỉ lệch khoảng 4,11 MiB, không phải khác biệt thực chất.

## Quyết định nghiên cứu

1. Đóng nhánh thiết kế sampler sau M2; không mở M3 để đuổi validation score.
2. Giữ M2 như negative result có kiểm soát: structural shift có xảy ra nhưng không tạo quality/long-tail gain và tăng CPU sampler overhead.
3. Không dùng test để chọn lại sampler. Nếu luận văn cần một lần final test, protocol phải được khóa trước: mục đích là báo cáo generalization của quyết định đã chốt, không tiếp tục tuning.
4. Bước tiếp theo là thống nhất với giảng viên cách trình bày negative result và phạm vi final test; không cần chạy lại paired validation.

## Artifact identity

- Bundle SHA-256: `22313fa86b3e2ba263bb70c07793855a8d509a37ae43f824fdf4677eb37dfd09`
- Aggregate summary SHA-256: `daee295a66faede6c1a763d66398d85bc7e8927464e2053ca302f8555f786147`
- Protocol SHA-256: `69de31ebe2a25da4b6000663f0dfee3ca0cd903dd2a767c6ac187174d86ec689`
