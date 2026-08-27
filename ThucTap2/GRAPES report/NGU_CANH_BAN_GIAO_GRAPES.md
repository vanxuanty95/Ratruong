# NGỮ CẢNH BÀN GIAO — Báo cáo nghiên cứu về GRAPES (GNN)

> File này tóm tắt toàn bộ ngữ cảnh để một AI khác có thể tiếp tục công việc. Đọc kỹ phần "RÀNG BUỘC QUAN TRỌNG" trước khi viết bất cứ nội dung nào.

---

## 1. Người dùng đang làm gì

Người dùng (sinh viên) viết một **báo cáo khoa học**. Hành trình nghiên cứu (logic dẫn dắt của báo cáo):

1. Bắt đầu từ bài toán **recommendation** (hệ gợi ý).
2. Nhận thấy **GNN (Graph Neural Network)** là hướng tiếp cận tự nhiên (dữ liệu user–item là đồ thị).
3. Khảo sát các **problem của GNN**, chọn đi sâu vào **giảm bùng nổ cạnh và đỉnh** (= *neighbor explosion* / mở rộng trường tiếp nhận theo cấp số nhân).
4. Tìm hiểu các phương pháp giảm bùng nổ lân cận **từ quá khứ đến hiện tại**.
5. Được gợi ý phương pháp **GRAPES** → đi sâu: định nghĩa, lý thuyết.
6. Tái hiện **thực nghiệm** từ bài báo gốc GRAPES.
7. **Kết luận** kết quả.
8. **Nhận định cá nhân** về ưu/nhược điểm + **đề xuất cải tiến** GRAPES (định hướng tương lai, gắn lại với recommendation).

Phong cách yêu cầu: chính xác, **không bịa**, có tính xác thực, đào sâu, đúng trọng tâm, không dài dòng.

---

## 2. Trạng thái hiện tại (ĐÃ LÀM)

- Đã có **dàn bài 7 chương** (xem mục 4).
- Đã viết **báo cáo chi tiết bằng tiếng Việt** và ráp vào **template LaTeX** của người dùng (template gốc là báo cáo Bách Khoa, chủ đề cũ về phát hiện rò rỉ cấp nước — đã thay nội dung).
- Project LaTeX biên dịch sạch bằng **XeLaTeX** (34 trang, không lỗi tham chiếu/trích dẫn).
- Đã làm sạch danh mục tài liệu tham khảo còn **18 mục liên quan** (đã xác minh).

### Cấu trúc file LaTeX hiện tại
```
main.tex                      # đã rewire: input 7 chương grapes + reference
macros.sty
ieee.bst, splncs04.bst
component/
  cover.tex                   # ĐÃ sửa tiêu đề + để [HỌ VÀ TÊN] placeholder
  subsidiary-cover.tex, thesis-mission.tex, acknowledgement.tex,
  declaration.tex, profile.tex   # giữ khung front-matter, người dùng tự điền
  abstract-vi.tex, abstract-eng.tex   # ĐÃ viết lại cho chủ đề GRAPES
  reference.tex               # ĐÃ làm sạch, 18 \bibitem (xem mục 6)
  grapes/
    chuong1.tex ... chuong7.tex   # nội dung báo cáo
```

### Quy ước template (phải tuân theo khi viết tiếp)
- `\chapter{}` mở đầu mỗi chương; `\section{}`, `\subsection{}`.
- Hình: `\begin{figure}[H] \includegraphics[width=\textwidth]{path} \caption{} \label{} \end{figure}`.
- **Trích dẫn thủ công**: dùng `\cite{key}` trỏ tới `\bibitem{key}` trong `component/reference.tex` (KHÔNG dùng bibtex/biblatex).
- Tiếng Việt: `\usepackage[vietnamese]{babel}`, font `\setmainfont{Times New Roman}` (cần XeLaTeX). 13pt, giãn dòng 1.5.
- Gói toán đã thêm vào main.tex: `amsmath`, `booktabs`. Có sẵn `algorithm2e`, `longtable`, `multirow`, `subcaption`.

---

## 3. VIỆC CÒN PHẢI LÀM (TODO)

1. **Điền số liệu thực nghiệm**: Bảng `tab:ketqua_f1` và `tab:memory` trong `chuong5.tex` đang để placeholder `\dots`. Điền F1-score chính xác từ **Bảng 1 của bài GRAPES (arXiv 2310.03399)**. (Cố ý không điền để tránh bịa số.)
2. **Trang bìa**: thay `[HỌ VÀ TÊN]`; kiểm tra dòng "LUẬN VĂN THẠC SĨ" / chuyên ngành / mã số cho đúng loại báo cáo.
3. **Front-matter**: điền lời cảm ơn, cam đoan, nhiệm vụ đề tài (đang giữ khung gốc).
4. (Tùy chọn) Vẽ **sơ đồ kiến trúc GRAPES** (mạng phân loại + mạng lấy mẫu GFlowNet) bằng TikZ và nhúng vào `chuong4.tex`.
5. (Tùy chọn) Bổ sung phần chi tiết toán học của **GFlowNet flow-matching objective** và **hàm phần thưởng** nếu cần đào sâu lý thuyết.

---

## 4. DÀN BÀI 7 CHƯƠNG (đã triển khai)

- **Chương 1 — Mở đầu**: bối cảnh recommendation → GNN; PinSage là cầu nối (GNN quy mô lớn dùng sampling); phát biểu vấn đề bùng nổ lân cận; mục tiêu & phạm vi; cấu trúc báo cáo.
- **Chương 2 — Cơ sở lý thuyết**: GNN, khung message passing, GCN/GraphSAGE/GAT; **phát biểu hình thức** bùng nổ lân cận (O(b^L)); độ phức tạp full-batch; hướng giải quyết = sampling.
- **Chương 3 — Tổng quan phương pháp**: 4 nhóm — (i) theo đỉnh (GraphSAGE, VR-GCN, PinSage), (ii) theo tầng (FastGCN, LADIES, AS-GCN), (iii) theo đồ thị con (Cluster-GCN, GraphSAINT), (iv) embedding lịch sử (GAS). Có **bảng so sánh** `tab:sosanh_phuongphap`. Kết: khoảng trống → cần lấy mẫu thích ứng.
- **Chương 4 — GRAPES**: ý tưởng (lấy mẫu thích ứng, học tập đỉnh quan trọng); **kiến trúc 2 mạng** (mạng phân loại + mạng lấy mẫu); **GFlowNet** học xác suất lấy mẫu theo mục tiêu tác vụ; giải thuật huấn luyện (algorithm2e, nhãn `alg:grapes`).
- **Chương 5 — Thực nghiệm**: tập dữ liệu (homophily nhỏ + ogbn-arxiv + ogbn-products + heterophily đa nhãn); thiết lập (batch 256, 256 mẫu, 10 lần chạy, RTX A6000 48GB); kết quả (bảng placeholder + 3 phát hiện định tính).
- **Chương 6 — Kết luận & nhận định**: tổng hợp; ưu điểm (thích ứng, tiết kiệm bộ nhớ, bền vững mẫu nhỏ, mạnh trên heterophily/đa nhãn); nhược điểm (chi phí mạng thứ hai, ổn định GFlowNet, chỉ đánh giá node classification, lấy mẫu đỉnh chứ không kiểm soát cạnh).
- **Chương 7 — Định hướng tương lai**: mở sang link prediction/recommendation; giảm chi phí bộ lấy mẫu; kiểm soát trực tiếp số cạnh (edge sampling/lai GraphSAINT); cải thiện ổn định huấn luyện.

---

## 5. SỰ THẬT XÁC THỰC VỀ GRAPES (dùng để KHÔNG bịa)

Nguồn: Younesian, Thanapalasingam, van Krieken, Daza, Bloem. "GRAPES: Learning to Sample Graphs for Scalable Graph Neural Networks", TMLR 2024, arXiv:2310.03399.

- **Vấn đề nền**: GNN tăng độ sâu → trường tiếp nhận tăng theo cấp số nhân → chi phí bộ nhớ cao.
- **Bản chất GRAPES**: lấy mẫu **đỉnh** thích ứng (KHÔNG phải lấy mẫu cạnh trực tiếp). Học tập đỉnh quan trọng bằng cách huấn luyện **một GNN thứ hai** dự đoán xác suất lấy mẫu đỉnh, tối ưu theo mục tiêu downstream.
- **Cơ chế học**: dùng **GFlowNet** (Bengio et al. 2021) để học xác suất lấy mẫu theo mục tiêu phân loại. Lý do dùng GFlowNet: chọn tập con rời rạc là thao tác không khả vi → không backprop trực tiếp được.
- **Quy trình**: xử lý đỉnh đích → tính inclusion probability trên lân cận 1-hop → lấy mẫu → lặp theo hop.
- **3 tính chất tự nêu**: thích ứng; hiệu quả bộ nhớ; bền vững khi giảm mẫu theo cấp số mũ.
- **Kết quả định tính (đã xác minh, dùng được)**:
  - **AS-GCN**: baseline thích ứng tốt thứ nhì, nhưng chỉ thích ứng theo **phương sai lấy mẫu**, dùng attention nên tốn bộ nhớ → **OOM trên ogbn-products**.
  - **GRAPES** dùng bộ nhớ GPU **ít hơn nhiều bậc** so với baseline embedding lịch sử (GAS).
  - **GRAPES bền vững nhất**: độ lệch F1 nhỏ nhất khi thay đổi kích thước mẫu.
  - Đặc biệt hiệu quả trên **heterophily đa nhãn**.
- **Thiết lập**: batch size 256, 256 mẫu, trung bình ± độ lệch chuẩn qua 10 lần chạy; GPU Nvidia RTX A6000 48GB; đánh giá test trên toàn đồ thị.
- **CHƯA có (đừng bịa)**: các con số F1 cụ thể của Bảng 1 — phải tra trực tiếp bài báo.

---

## 6. DANH MỤC 18 TÀI LIỆU THAM KHẢO (đã xác minh, key = lệnh \cite)

| key | Tài liệu |
|---|---|
| `Scarselli2009` | The Graph Neural Network Model, IEEE TNN 2009 |
| `Kipf2017` | GCN — Semi-supervised classification with GCN, arXiv:1609.02907 |
| `Velickovic2018` | GAT — Graph Attention Networks, arXiv:1710.10903 |
| `Hamilton2017` | GraphSAGE — Inductive representation learning, NeurIPS 2017, arXiv:1706.02216 |
| `Gilmer2017MPNN` | Neural Message Passing for Quantum Chemistry, ICML 2017, arXiv:1704.01212 |
| `Ying2018PinSage` | PinSage — Web-Scale Recommender Systems, KDD 2018, arXiv:1806.01973 |
| `Wang2019NGCF` | Neural Graph Collaborative Filtering, SIGIR 2019, arXiv:1905.08108 |
| `He2020LightGCN` | LightGCN, SIGIR 2020, arXiv:2002.02126 |
| `ChenZhu2018VRGCN` | VR-GCN — Stochastic Training with Variance Reduction, ICML 2018, arXiv:1710.10568 |
| `ChenFastGCN2018` | FastGCN, ICLR 2018, arXiv:1801.10247 |
| `Huang2018ASGCN` | AS-GCN — Adaptive Sampling, NeurIPS 2018, arXiv:1809.05343 |
| `Zou2019LADIES` | LADIES — Layer-Dependent Importance Sampling, NeurIPS 2019, arXiv:1911.07323 |
| `Chiang2019ClusterGCN` | Cluster-GCN, KDD 2019, arXiv:1905.07953 |
| `Zeng2020GraphSAINT` | GraphSAINT, ICLR 2020, arXiv:1907.04931 |
| `Fey2021GNNAutoScale` | GNNAutoScale (GAS), ICML 2021, arXiv:2106.05609 |
| `Bengio2021GFlowNet` | GFlowNet — Flow Network based Generative Models, NeurIPS 2021, arXiv:2106.04399 |
| `Hu2020OGB` | Open Graph Benchmark, NeurIPS 2020, arXiv:2005.00687 |
| `Younesian2023GRAPES` | GRAPES, TMLR 2024, arXiv:2310.03399 |

---

## 7. RÀNG BUỘC QUAN TRỌNG (cho AI tiếp nối)

1. **KHÔNG bịa số liệu, tên tác giả, arXiv ID, hay kết quả.** Nếu chưa có, để placeholder và ghi rõ nguồn cần tra. Ưu tiên kiểm chứng bằng tìm kiếm web với bài báo gốc.
2. **Thuật ngữ chuẩn**: gọi vấn đề là *"neighbor explosion"* (bùng nổ lân cận); làm rõ "bùng nổ cạnh và đỉnh" là cách diễn đạt cùng hiện tượng. Nhấn mạnh GRAPES lấy mẫu **đỉnh**, không phải cạnh.
3. **Bám quy ước template**: `\cite`/`\bibitem` thủ công; chương dùng `\chapter`; biên dịch bằng **XeLaTeX** (vì fontspec + Times New Roman).
4. **Giữ logic xuyên suốt**: recommendation → GNN → bùng nổ lân cận → sampling → GRAPES → cải tiến quay lại recommendation.
5. Văn phong tiếng Việt học thuật, súc tích, có trích dẫn.
