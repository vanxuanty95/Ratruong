# Đồ thị thời gian Baby P4: hướng dẫn thực thi G2-C/G2-D

Cặp notebook self-contained `02_baby_p4_temporal_graph_en.ipynb` và `_vn.ipynb` implement bước tiếp theo của Dataset Gate. Implementation và toy fixture đã execute; full run `Baby_Products` cùng gate review vẫn mở.

## Notebook làm gì và tại sao

1. Notebook đọc Baby 0-core file đã có checksum, quarantine rating `0.0`, giữ P4 positive (`4 <= rating <= 5`) và xử lý repeated user-item pair bằng timestamp sớm nhất rồi source order ổn định. Bước này bảo toàn ý nghĩa interaction đã chọn tại G2-B.
2. Notebook áp candidate global cutoff theo interval nghiêm ngặt: training `< t1`, validation `[t1,t2)` và test `>= t2`. Cutoff vẫn là candidate cho tới khi evidence tạo ra được review.
3. Mọi degree filter chỉ áp trên training positive; user/item mapping theo thứ tự từ điển cũng chỉ sinh từ filtered training graph. Nhờ đó activity tương lai ở validation/test không định nghĩa graph hoặc ID universe.
4. Target về sau được project vào frozen mapping. Mỗi target được phân loại thành warm retained, chỉ unseen user, chỉ unseen item hoặc cả hai unseen; ledger phải đối soát chính xác.
5. Với mỗi retained target, candidate set là toàn bộ frozen training-item universe trừ mapped P4 positive của user có timestamp nhỏ hơn nghiêm ngặt timestamp target. Event cùng timestamp không được xem là prior history và target phải còn trong candidate set.
6. Notebook ghi deterministic compressed edge, mapping, target artifact cùng `baby_p4_g2c_manifest.json`, rồi chạy bounded chunked catalog traversal mà không train recommender.

## Chỉ số và cách diễn giải

- Training edge/user/item, density, degree quantile và connected component mô tả graph thật sự model được phép thấy. Chúng không đo recommendation quality.
- Filter iteration và số node/edge bị loại công khai mức activity filtering làm thay đổi estimand. Degree threshold mặc định là `1`, nên full run ban đầu không thêm k-core restriction ngoài membership trong training positive.
- OOV count và warm-target retention định nghĩa population mà kết quả pure-ID tương lai bao phủ. Exclusion cao nghĩa là claim warm-start hẹp, không phải model yếu.
- Candidate count, removed-prior-history count, target-presence check và chunk count xác minh cách dựng exact ranking task. Chúng không phải NDCG hay Recall.
- Dry-run wall time, process peak RSS, số target traversed và candidate comparison chỉ mô tả bounded execution envelope. Chúng không phải final profiling hoặc scalability evidence.
- SHA-256 và byte count định danh từng generated artifact. `implementation_sha256` định danh embedded implementation cell; manifest không cố chứa hash tự tham chiếu của chính nó.

## Cách chạy và ranh giới quyết định

Mở notebook Drive tiếng Việt hoặc tiếng Anh và chọn **Run all**. Output dự kiến nằm tại `MyDrive/Phase2_Amazon_Audit/g2c_baby_p4/baby_p4_g2c_manifest.json` cùng năm compressed artifact. Run thành công chỉ đưa evidence sang bước review; G2-C/G2-D chỉ pass sau khi manifest được đọc lại, arithmetic và invariant được kiểm tra, candidate cutoff được chấp nhận hoặc sửa, và environment record được đánh giá đủ. Không được suy ra model comparison hoặc headline metric từ notebook này.
