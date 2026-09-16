# Decision log nghiên cứu

> Mỗi quyết định thay đổi scope, method, split, metric hoặc claim phải có một mục ở đây **trước** khi thực thi.
> Mục cũ không được sửa nội dung; nếu sai, thêm mục mới tham chiếu mục cũ.
> Đọc file này trước khi thay đổi bất kỳ tài liệu trung tâm nào.

---

## DL-001 — Reset Phase 2: từ heuristic M2 sang biến thể GRAPES học được

- **Ngày:** 16/09/2026
- **Người quyết định:** Ty (chủ đề tài), xác nhận trực tiếp.
- **Trạng thái:** `ACCEPTED`

### Mục tiêu đúng của Phase 2 (theo chủ đề tài)

> Phase 2 là **hiện thực một biến thể của GRAPES phù hợp với bài toán recommendation**, rồi **so sánh với các phương pháp khác**.

Giai đoạn 1 (ThucTap2) đã tái hiện GRAPES trên node classification. Hướng giảng viên giao cho giai đoạn 2: *"Develop graph sampling for large-scale recommendation system using GNN"* — đề xuất phương pháp cho bài toán gợi ý, chọn dataset, đường đi dữ liệu cụ thể.

### Điều đã sai

1. Từ khoảng G4, research question bị thu hẹp thành *"sampler dùng frontier của batch có tạo trade-off tốt hơn uniform/degree-aware không?"*. Phương pháp được thử (M2 `log(frontier_support) − 0,5·log(degree) + Gumbel`) là **heuristic tĩnh**: không có policy học được, không có `log q`, không có reward, không có TB/REINFORCE, không có optimizer cho sampler.
2. `02_protocol/GRAPES_RECOMMENDATION_SPEC_vn.md` — bản thiết kế GRAPES-for-Rec đầy đủ (D1–D11, T01–T25) — bị hạ xuống "reference design, superseded", phần RL/GFlowNet bị ghi "không còn nằm trong kế hoạch".
3. README, plan, report, thesis và slide kể câu chuyện "nghiên cứu dừng ở M2, negative result có kiểm soát" như kết luận luận văn.
4. Kết quả: bằng chứng hiện có không trả lời được câu hỏi của đề tài (biến thể GRAPES cho recommendation có hiệu quả không?).

### Nguyên nhân gốc

- Các quyết định thu hẹp scope được ghi vào plan như "đã khóa" mà không đối chiếu lại với mục tiêu đề tài do chủ đề tài xác nhận.
- Nhãn "GRAPES-informed" được dùng cho thứ chỉ mượn cơ chế action (Gumbel Top-k, `K^l = V⁰ ∪ V^l`) nên che mất việc thiếu phần *học sampler* — chính là đóng góp của GRAPES.
- Không có checklist định nghĩa "thế nào mới là biến thể GRAPES".

### Quyết định

1. Phase 2 = **GRAPES-GFN-Rec** (GFlowNet TB + BPR + Sampled LightGCN). Spec chuẩn: `PHASE2_GRAPES_GFN_REC_SPEC_vn.md`. D-contract trong `02_protocol` được nâng lại thành normative.
2. GRAPES-RL-Rec (REINFORCE) là ablation objective, không phải method chính.
3. So sánh với: M0 uniform, M1 degree-importance, GRAPES-RL-Rec (tầng A, chạy lại trên budget mới); Full LightGCN, MostPop, BPR-MF (tầng B).
4. M0/M1/M2 pilot và mọi slide/report hiện tại → `ARCHIVED PILOT`. Không xóa; không dùng để chọn cấu hình hoặc kết luận về method mới.
5. Tạo development split mới trong khoảng trước `t1`; current validation chỉ đọc sau freeze.
6. Pilot budget (batch 65.536, ~300 step) không được kế thừa, vì với chế độ này sampler học được chỉ nhận ~300 reward vô hướng và backbone Full LightGCN còn thua MostPop.

### Guardrail chống tái diễn

- **Checklist G1–G7** trong spec §0: phương pháp thiếu một mục không được gọi là biến thể GRAPES.
- Consistency checker từ chối file trung tâm mô tả M2 là method Phase 2/learned/GRAPES.
- Mọi thay đổi RQ phải có mục decision log với xác nhận của chủ đề tài; agent không tự thu hẹp RQ.
- Mỗi phiên làm việc mới: đọc `DECISION_LOG_vn.md` → spec → plan trước khi sửa docs hoặc code.

---

## DL-002 — Tài liệu sống, hạn nộp tháng 11, kế hoạch nén

- **Ngày:** 16/09/2026
- **Người quyết định:** Ty (chủ đề tài).
- **Trạng thái:** `ACCEPTED`

### Bối cảnh
Đồ án đã trễ tiến độ; hạn nộp trong tháng 11/2026 (tạm lấy **30/11/2026** cho kế hoạch, chỉnh nếu có mốc sớm hơn). Bản đề xuất riêng lẻ (deck + report) tách khỏi luận văn cuối gây làm lại nhiều lần.

### Quyết định
1. **Một slide và một report duy nhất, bồi đắp dần**: `05_slides/THESIS_vn.pptx` (build: `build_thesis_vn.js`) và `04_thesis/THESIS_vn.tex/.pdf`. Cấu trúc theo luận văn cuối; phần chưa có số đánh dấu `ĐANG CHỜ` kèm gate/nguồn sẽ điền. Mỗi gate xong: điền chương tương ứng, tăng số phiên bản, ghi nhật ký.
2. Bản đề xuất `PHASE2_PROPOSAL_GRAPES_GFN_REC_vn.*` bị thay thế và xóa khỏi repo (còn trong lịch sử git `bce6392`).
3. Chương dữ liệu mở rộng; thêm chương trả lời từng góp ý của giảng viên (3/9).
4. Phân tích sâu dataset chạy trên Colab bằng notebook 11 (môi trường Claude bị chặn tải dữ liệu); notebook 11 đồng thời tạo development split (R1). Phân tích phía target chỉ dùng cửa sổ development.
5. Kế hoạch nén: R1 tuần 16/9; R3 23/9–10/10; R4 freeze + gặp giảng viên 10–13/10; R5 14–27/10; R6 28/10–3/11; R7 4–17/11; dự phòng 18–30/11. Viết song song từ tuần đầu.
6. OD-2 (metadata cho đo ngữ nghĩa/đa dạng) chuyển thành **khuyến nghị có**, vì giảng viên hỏi trực tiếp; chờ giảng viên duyệt ở R4. Metadata không vào huấn luyện.

---

## Mẫu cho mục mới

```text
## DL-00X — <tiêu đề>
- Ngày / Người quyết định / Trạng thái
- Bối cảnh
- Lựa chọn đã cân nhắc
- Quyết định
- Hệ quả cho split/metric/claim
- Artifact liên quan
```
