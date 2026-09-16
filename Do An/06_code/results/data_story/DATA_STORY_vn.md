# Data story — Amazon Baby Products

## Kết luận chính

Dữ liệu đủ lớn và sạch để nghiên cứu graph sampling, nhưng rất thưa và mất cân bằng. Bài toán hiện tại chỉ đánh giá warm-start recommendation; không đại diện cho cold-start.

## 1. Chất lượng và interaction semantics

- Raw rows: 5,953,891.
- Missing/parse-invalid: 0.
- Rating ngoài [1,5]: 1.
- Duplicate user–item: 0.
- P4 rows (rating >= 4): 4,655,843, giữ 78.20% parsed rows.

**Hệ quả:** P4 là project transformation từ explicit rating sang implicit positive, không phải thuộc tính có sẵn của nguồn.

## 2. Frozen training graph

- 3,868,654 edge; 2,318,308 user; 162,125 item.
- User degree p50/p90/p99: 1/3/9; singleton 71.76%.
- Item degree p50/p90/p99: 3/32/397; singleton 33.35%.
- Largest connected component: 96.50% số node.

**Hệ quả:** phần lớn graph có đường liên kết cho message passing, nhưng degree imbalance rất mạnh; model/sampler phải được phân tích theo popularity cohort, không chỉ mean degree hoặc aggregate NDCG.

## 3. Popularity concentration

- Item-degree Gini: 0.8584.
- Top 1% item giữ 44.09% training interaction.
- Top 5% item giữ 71.12%.
- Top 10% item giữ 81.33%.
- Top 20% item giữ 89.65%.

**Hệ quả:** khi có recommendation output, phải báo catalog coverage và head/middle/tail exposure để phát hiện gain do popularity concentration.

## 4. Temporal population

- Validation: giữ 81,871/373,776 warm target (21.90%).
- Test: giữ 40,587/413,413 warm target (9.82%).

**Hệ quả:** headline result chỉ mô tả user và item đã xuất hiện trong training graph. Cold-start nằm ngoài claim.

## 5. Giới hạn

Pure-ID rating-only không hỗ trợ semantic similarity hoặc intra-list semantic diversity. Muốn đo hai đại lượng này phải bổ sung metadata/category/text bằng một quyết định dữ liệu riêng.

## Integrity

Tất cả assertion checksum/count/degree reconciliation đều pass: True.
