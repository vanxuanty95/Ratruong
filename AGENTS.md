# Hướng dẫn cho agent (Claude, Codex, …)

Repo luận văn **GRAPES-GFN-Rec**: học lấy mẫu đồ thị cho hệ gợi ý dùng GNN. Hạn nộp 30/11/2026.

**Bắt đầu mỗi phiên:** đọc [`Do An/00_project/HANDOFF_STATUS_vn.md`](./Do%20An/00_project/HANDOFF_STATUS_vn.md) — trạng thái hiện tại, việc đang chờ, việc kế tiếp, lệnh build/test và thứ tự đọc tài liệu.

**Kết thúc mỗi phiên:** cập nhật lại `HANDOFF_STATUS_vn.md` (commit cuối, việc dở, việc kế tiếp) và commit.

Quy tắc không đổi:
1. Phase 2 là biến thể GRAPES **học được** (đủ G1–G7) cho recommendation + so sánh với phương pháp khác (DL-001).
2. Một slide sống `Do An/05_slides/THESIS_vn.pptx` và một luận văn sống `Do An/04_thesis/THESIS_vn.tex` được bồi đắp theo gate (DL-002).
3. Không dùng validation/test hiện tại để thiết kế; mọi tuning trên development split.
4. Mọi con số trong tài liệu phải truy được về artifact đã lưu trong `Do An/06_code/results/`.
5. Trả lời người dùng bằng tiếng Việt.
