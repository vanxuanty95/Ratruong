# Script Thuyết Trình — GRAPES
**MSHV: 2470113 — Văn Xuân Tỷ**
**Thời lượng: ~15 phút | 23 slides**

---

## SLIDE 1 — Trang bìa *(~30 giây)*

*[Đứng thẳng, nhìn hội đồng, hít thở bình tĩnh trước khi nói]*

"Kính thưa Hội đồng, em xin phép được bắt đầu buổi bảo vệ.

Báo cáo của em có tựa đề: **Phát Triển Phương Pháp Lấy Mẫu Đồ Thị Cho Hệ Thống Gợi Ý Quy Mô Lớn Sử Dụng Mạng Nơ-ron Đồ Thị.**

GRAPES là viết tắt của *Graph Adaptive Sampling* — một phương pháp học máy trên đồ thị được công bố tại tạp chí TMLR năm 2024. Em xin mời Hội đồng theo dõi."

---

## SLIDE 2 — Nội dung trình bày *(~30 giây)*

"Báo cáo được cấu trúc thành 5 phần.

Phần 1 là **bối cảnh** — tại sao GNN gặp vấn đề bùng nổ lân cận khi ứng dụng vào gợi ý. Phần 2 là **tổng quan** các phương pháp sampling hiện có và khoảng trống nghiên cứu. Phần 3 — trọng tâm — là **kiến trúc và cơ chế của GRAPES**. Phần 4 là **kết quả thực nghiệm** trên 12 tập dữ liệu cùng kết quả tái hiện. Phần 5 là **kết luận và 3 hướng nghiên cứu** tiếp theo."

---

## SLIDE 3 — Bối cảnh & Động cơ *(~60 giây)*

"Xuất phát điểm của báo cáo là bài toán **hệ thống gợi ý**.

Dữ liệu tương tác user–item tự nhiên là một đồ thị hai phía, và GNN là công cụ phù hợp nhất để khai thác cấu trúc quan hệ bậc cao này. Minh chứng rõ nhất: Pinterest triển khai PinSage trên đồ thị 3 tỷ cạnh, và các mô hình NGCF, LightGCN được nghiên cứu và ứng dụng rộng rãi cho hệ thống gợi ý.

Nhưng chính ở quy mô đó, vấn đề xuất hiện. Sơ đồ bên phải mô tả chuỗi nhân quả: hệ thống gợi ý → GNN quy mô lớn → thách thức scalability → **bùng nổ lân cận**. Đây là điểm mà báo cáo này tập trung giải quyết."

---

## SLIDE 4 — GNN: Cơ chế Message Passing *(~60 giây)*

"Trước khi đi vào vấn đề, em xin giới thiệu ngắn gọn cơ chế hoạt động của GNN.

GNN học đặc trưng của đỉnh bằng cách lan truyền thông tin qua cấu trúc đồ thị qua nhiều tầng. Khung tổng quát nhất gọi là **MPNN — Message Passing Neural Network** — gồm 4 bước:

- **Bước 0 — Khởi tạo**: gán đặc trưng ban đầu cho từng đỉnh
- **Bước 1 — Aggregate**: gom thông điệp từ toàn bộ lân cận — đây là bước then chốt
- **Bước 2 — Update**: kết hợp thông tin hiện tại với thông điệp vừa gom
- **Bước 3 — Predict**: phân loại đỉnh hoặc thực hiện tác vụ đầu cuối

Sau L tầng, đặc trưng h_v^(L) mã hóa cấu trúc L-hop xung quanh đỉnh v — đây là sức mạnh của GNN. Nhưng cũng chính Bước Aggregate là nguồn gốc của bùng nổ lân cận."

---

## SLIDE 5 — Minh Hoạ MPNN: Thông Tin Lan Truyền Qua Từng Tầng *(~45 giây)*

"Để hình dung rõ hơn, hãy nhìn vào sơ đồ này.

Tôi có một đồ thị đơn giản — đỉnh **V** ở trung tâm, 4 lân cận trực tiếp A, B, C, D, và 4 đỉnh ở vòng ngoài E, F, G, H.

**Tầng 0 — Khởi tạo**: V chỉ biết chính mình — đặc trưng h_v^(0) là đặc trưng đầu vào.

**Tầng 1 — Aggregate**: V gom thông điệp từ A, B, C, D — sau bước này V đã 'biết' cấu trúc 1-hop xung quanh.

**Tầng 2 — Mở rộng**: A, B, C, D lần lượt gom từ vòng ngoài rồi truyền vào V — V giờ 'thấy' cấu trúc 2-hop, tức E, F, G, H.

Quy luật: **L tầng → V biết cấu trúc L-hop**. Đây là sức mạnh của GNN — nhưng cũng là nguyên nhân của bùng nổ lân cận khi L và bậc đồ thị tăng lớn."

---

## SLIDE 6 — GNN Gặp Những Vấn Đề Gì? *(~45 giây)*

"Nhưng GNN không phải không có giới hạn. Khi mở rộng quy mô, ba vấn đề nổi lên rõ nhất.

**Oversmoothing** — khi xếp chồng nhiều tầng GNN, các đặc trưng của đỉnh dần hội tụ về cùng một giá trị, mất đi sự phân biệt giữa các nút. Kết quả phân loại đỉnh trở nên kém chính xác.

**Oversquashing** — thông tin từ các đỉnh xa bị 'nén' qua các cạnh cổ chai trên đồ thị. Tín hiệu quan trọng từ xa bị suy giảm và mất mát trước khi đến nơi cần.

Hai vấn đề trên liên quan đến chất lượng học. Nhưng còn một vấn đề thứ ba nghiêm trọng hơn về mặt thực tế, đặc biệt với đồ thị quy mô lớn: **Bùng nổ lân cận** — số đỉnh cần nạp vào bộ nhớ tăng theo cấp số nhân theo số tầng. Đây là vấn đề trọng tâm mà báo cáo này tập trung giải quyết."

---

## SLIDE 7 — Tại sao Aggregate gây ra Bùng nổ *(~60 giây)*

"Vấn đề bắt nguồn từ tính **đệ quy** của Bước Aggregate.

Để tính h_v^(L), ta phải tính h_u^(L-1) cho tất cả lân cận u của v — và để tính h_u^(L-1), ta lại cần lân cận của u, cứ thế nhân dần lên.

Ba dòng công thức trên slide minh họa điều này:
- **Tầng 1**: cần d̄ đỉnh lân cận trực tiếp
- **Tầng 2**: mỗi lân cận lại cần lân cận của nó → d̄² đỉnh
- **Tầng L**: số đỉnh phụ thuộc tăng theo **O(d̄ᴸ)** — cấp số nhân

Ví dụ thực tế ở dòng cảnh báo: mini-batch 512 đỉnh, bậc trung bình 10, 3 tầng → phải nạp gần **512 nghìn đỉnh** vào GPU cho một mini-batch nhỏ."

---

## SLIDE 8 — Vấn đề Bùng nổ lân cận *(~45 giây)*

"Biểu đồ bên phải cho thấy mức tăng theo hàm mũ: từ 5 nghìn đỉnh ở L=1 lên 51 nghìn ở L=2 và hơn 500 nghìn ở L=3.

Điểm quan trọng: **chia mini-batch nhỏ không giải quyết được vấn đề** nếu không có sampling, vì vẫn phải nạp toàn bộ lân cận L-hop vào bộ nhớ. Thực tế trên ogbn-arxiv với d̄≈13 và L=3, mini-batch 512 đỉnh cần ~1,2 triệu đỉnh phụ thuộc.

Đây là lý do ra đời của các phương pháp **graph sampling**."

---

## SLIDE 9 — Câu hỏi nghiên cứu *(~30 giây)*

"Từ vấn đề đó, báo cáo đặt câu hỏi trung tâm:

*'Có thể học được chính sách lấy mẫu đỉnh thích ứng — thay vì dùng heuristic tĩnh — để tối thiểu hóa chi phí bộ nhớ khi huấn luyện GNN mà vẫn giữ được chất lượng phân loại?'*

Ba từ khóa: **học được** — không phải cố định; **thích ứng** — theo từng đồ thị và tác vụ; **hiệu quả** — bộ nhớ thấp, kết quả ổn định."

---

## SLIDE 10 — Tổng quan phương pháp Sampling *(~60 giây)*

"Trước GRAPES, có 4 nhóm phương pháp chính mà em đã khảo sát.

**Theo đỉnh** — GraphSAGE, PinSage: chọn k lân cận ngẫu nhiên mỗi đỉnh — đơn giản nhưng vẫn bùng nổ theo số tầng.

**Theo tầng** — FastGCN, LADIES, AS-GCN: chọn k đỉnh dùng chung cho toàn bộ batch trong một tầng — không nhân lên theo từng đỉnh. AS-GCN tốt về chất lượng nhưng OOM trên đồ thị lớn; LADIES có độ lệch chuẩn rất cao — không ổn định.

**Theo đồ thị con** — ClusterGCN, GraphSAINT: hiệu quả bộ nhớ nhưng cắt đứt các cạnh nối giữa các cụm — mất thông tin kết nối quan trọng giữa các đỉnh thuộc cụm khác nhau.

**Embedding lịch sử** — GAS: tái dùng embedding cũ, hiệu năng cao nhưng chi phí lưu trữ lớn.

**Khoảng trống chung**: chưa có phương pháp nào học được chính sách lấy mẫu thích ứng theo mục tiêu tác vụ. Đây là điểm GRAPES giải quyết — hàng cuối được tô xanh."

---

## SLIDE 11 — GRAPES: Ý tưởng cốt lõi *(~45 giây)*

"GRAPES giải quyết khoảng trống bằng ý tưởng: **huấn luyện một GNN thứ hai chuyên học xác suất lấy mẫu**, tối ưu trực tiếp theo mục tiêu tác vụ đầu cuối.

Ba tính chất nổi bật mà em muốn nhấn mạnh:

Thứ nhất, **thích ứng học được** — không phải heuristic cố định, điều chỉnh theo từng đồ thị cụ thể.

Thứ hai, **hiệu quả bộ nhớ** — dùng ít hơn nhiều so với GAS, chạy được trên Tesla T4 chỉ 15GB với đồ thị 2,4 triệu đỉnh.

Thứ ba, **bền vững mẫu nhỏ** — duy trì F1 khi giảm kích thước mẫu, độ lệch chuẩn nhỏ nhất trong tất cả phương pháp so sánh."

---

## SLIDE 12 — Kiến trúc GRAPES *(~90 giây)*

"Bây giờ em xin trình bày chi tiết kiến trúc. GRAPES gồm hai GNN chạy phối hợp.

**GCN_S — Sampler** (khung xanh bên trái): nhận đồ thị G, đầu ra là xác suất pᵢ cho từng đỉnh lân cận — đỉnh nào có khả năng cao là 'quan trọng' sẽ được xác suất cao hơn.

Xác suất này truyền vào **Gumbel Top-k** (hộp vàng trung tâm) — đây là kỹ thuật then chốt giúp mạng tự học được việc chọn đỉnh — bằng cách làm mượt phép chọn cố định (có/không) thành xác suất, để mạng biết điều chỉnh theo hướng nào. Đầu ra là đồ thị con G_s chỉ gồm k đỉnh quan trọng nhất mỗi hop.

**GCN_C — Classifier** (khung đỏ bên phải): nhận G_s, tính loss L_C và đưa ra dự đoán nhãn.

Điểm then chốt nhất là **vòng phản hồi GFlowNet** — mũi tên xanh lá phía dưới. L_C được dùng làm **reward** để cập nhật GCN_S thông qua thuật toán Trajectory Balance. Nhờ đó GCN_S dần học được: *'Đỉnh nào nên lấy mẫu để tác vụ phân loại đạt tốt nhất?'*

Đây là điểm khác biệt cốt lõi: lấy mẫu **học được** từ dữ liệu, không phải heuristic tĩnh."

---

## SLIDE 13 — GFlowNet: Subgraph Tốt Hơn → Được Chọn Nhiều Hơn *(~60 giây)*

"Hãy nhìn vào ví dụ trực quan này. Có 3 subgraph khả thi với chất lượng khác nhau: SG1=0,8 / SG2=0,6 / SG3=0,1.

Cách tiếp cận truyền thống — tìm max — có nghĩa là luôn chọn SG1, subgraph tốt nhất, và **bỏ qua hoàn toàn SG2 và SG3** — dù chúng cũng khá tốt. Nếu SG1 hóa ra không phù hợp trong một số tình huống cụ thể, mô hình không có gì để fallback.

GFlowNet làm khác: **phân bổ xác suất cho nhiều lựa chọn tỉ lệ với chất lượng** — SG1 được chọn 53% lần, SG2 vẫn được chọn 40%, SG3 thỉnh thoảng 7%. Không ai bị bỏ qua hoàn toàn.

Ý tưởng cốt lõi: **P(G_s) ∝ R(G_s)** — subgraph tốt hơn được chọn nhiều hơn, nhưng các lựa chọn khác vẫn được khám phá. Kết quả: mô hình bền vững hơn, không bị kẹt ở một cách lấy mẫu duy nhất.

Trong GRAPES, chất lượng được đo bằng R = exp(−α·L_C) — phân loại càng tốt thì subgraph đó càng được ưu tiên trong lần sau."

---

## SLIDE 14 — GFlowNet & Chính sách phân rã theo tầng *(~60 giây)*

"Tại sao cần GFlowNet?

Vì phép chọn đỉnh là **0 hoặc 1 — không có giá trị ở giữa**. Mạng không tính được "nên điều chỉnh theo hướng nào" — giống như không thể tối ưu khi hàm số chỉ có bước nhảy, không có độ dốc. GFlowNet giải quyết bằng cách học xác suất thay vì chọn cố định — ổn định hơn và khám phá nhiều cách lấy mẫu khác nhau.

Chính sách được **phân rã theo tầng**: q(V¹,...,Vᴸ | V⁰) = tích của q(Vˡ | V⁰,...,Vˡ⁻¹) theo từng tầng — cho phép học độc lập từng bước.

Cụ thể: V⁰ là tập đỉnh mini-batch. Tầng 1, GCN_S tính xác suất cho lân cận của V⁰ và chọn k đỉnh → V¹. Tầng 2 tương tự với lân cận của V¹. Cuối cùng, tập tích lũy K⁽ᴸ⁾ = V⁰ ∪ V¹ ∪ ... ∪ Vᴸ được nạp vào GCN_C."

---

## SLIDE 15 — Thiết lập thực nghiệm *(~45 giây)*

"Về thiết lập thực nghiệm.

GRAPES có **2 phiên bản**: **GRAPES-RL** dùng REINFORCE. **GRAPES-GFN** thay bằng GFlowNet. Bài báo trình bày cả hai để so sánh trực tiếp.

Bài báo đánh giá trên **12 tập dữ liệu chuẩn**: 7 tập homophilous gồm Cora, CiteSeer, PubMed, Reddit, ogbn-arxiv, ogbn-products, DBLP — và 5 tập heterophilous gồm Flickr, snap-patents, Yelp, ogbn-proteins, BlogCat.

*(Giải thích nếu được hỏi — **homophily** là tính chất các nút có đặc trưng tương tự thường kết nối với nhau — ví dụ người cùng sở thích thường kết bạn với nhau. Đồ thị **homophilous** là đồ thị có tính chất này rõ rệt; đồ thị **heterophilous** thì ngược lại — các nút kết nối với nhau dù khác loại.)*

Giao thức đồng nhất cho tất cả phương pháp: batch size 256, 256 mẫu mỗi tầng, 10 lần chạy lấy mean ± std. GPU gốc là RTX A6000 48GB. Trong phần tái hiện của em, thiết bị là Tesla T4 15,6GB trên Google Colab — bằng 1/3 VRAM của thiết bị gốc. Metric là F1-score."

---

## SLIDE 16 — Kết quả Homophily *(~90 giây)*

"Kết quả trên đồ thị homophilous.

Em xin chú ý một số điểm nổi bật.

Hàng **LADIES** — màu vàng có ký hiệu ⚠: độ lệch chuẩn trên Cora là ±11,69 — hoàn toàn không ổn định trong thực tế. Đây là bằng chứng cho thấy không phải phương pháp nào cũng ổn định khi giảm kích thước mẫu.

**PASS** bị OOM trên Reddit và ogbn-products — xác nhận vấn đề scalability.

**GRAPES-RL** đứng đầu trên Cora với 87,62%, **GRAPES-GFN** đứng đầu trên DBLP với 77,14% — cả hai đều vượt Random rõ rệt.

Tuy nhiên, em xin trung thực: **GAS** vẫn dẫn đầu trên Reddit (94,75) và ogbn-arxiv (68,36). Sức mạnh của GRAPES không phải ở điểm tuyệt đối trên mọi dataset, mà ở sự **ổn định, hiệu quả bộ nhớ, và khả năng chạy được** trên dataset lớn mà AS-GCN hay PASS không thể.

Ghi chú dưới bảng cũng nhắc: AS-GCN thực ra tốt nhất trên CiteSeer và PubMed — em đã giữ thông tin này để đảm bảo tính trung thực với hội đồng."

---

## SLIDE 17 — Kết quả Heterophily *(~75 giây)*

"Đây là phần kết quả ấn tượng nhất của GRAPES.

**GRAPES-GFN xếp hạng #1 trên 4/5 dataset heterophilous**: BlogCat, Yelp, Flickr, ogbn-proteins. Điều này cho thấy lấy mẫu thích ứng đặc biệt có lợi trên đồ thị dị phương — nơi không phải lân cận nào cũng mang tín hiệu hữu ích. GFlowNet học được cách ưu tiên đúng lân cận mang thông tin.

Ngoại lệ duy nhất là **snap-patents** — ký hiệu ① đặt tại cột AS-GCN (31,04), không phải GRAPES-GFN (29,58). Em đã sửa lỗi này khi đọc lại bảng từ LaTeX so với bản trình bày ban đầu để phản ánh đúng kết quả.

Tóm lại: GRAPES đặc biệt nổi trội trên đồ thị heterophilous đa nhãn với homophily thấp — đây là bằng chứng thực nghiệm mạnh nhất của phương pháp."

---

## SLIDE 18 — Tái hiện thực nghiệm *(~90 giây)*

"Phần này là kết quả **tái hiện của em** trên Google Colab — không phải số liệu từ bài báo gốc.

Trước khi vào kết quả, em giải thích tại sao cần tái hiện — vì đây không phải bước thừa:

**Lý do 1 — Kiểm chứng độc lập trên phần cứng khác:** Bài báo gốc dùng RTX A6000 49GB — phần cứng không phổ biến. Em dùng Tesla T4 15,6GB trên Google Colab, bằng ⅓ VRAM. Câu hỏi: kết quả có giữ được không khi tài nguyên giảm đáng kể?

**Lý do 2 — Kiểm tra scalability thực tế:** Bài báo claim GRAPES scalable nhưng không có số OOM/không OOM trên phần cứng tiêu chuẩn. ogbn-products với 2,4M đỉnh và 61,9M cạnh là test case cực đoan — nếu chạy được trên T4 15GB thì claim scalability có cơ sở thực nghiệm độc lập.

**Lý do 3 — Cơ sở cho giai đoạn 2:** Tái hiện thành công = nắm rõ codebase GCN_S, GFlowNet, Gumbel Top-k. Đây là điều kiện tiên quyết để mở rộng sang bài toán gợi ý mà không phải viết lại từ đầu.

---

Về kết quả: 4 tập dữ liệu, mỗi tập 3 lần chạy. Cora: +0,33. CiteSeer: −0,43 (xấp xỉ bằng nhau). ogbn-arxiv: +0,76.

Và **phát hiện quan trọng nhất**: GRAPES-GFN chạy không OOM trên ogbn-products — 2,4M đỉnh, 61,9M cạnh — trên Tesla T4 15,6GB. 9/10 epoch hoàn thành ổn định. Tất cả |Δ| ≤ 0,76 F1 → tái hiện được xác nhận."

---

## SLIDE 19 — Chi phí bộ nhớ & thời gian *(~45 giây)*

"Tuy nhiên, lấy mẫu thích ứng có chi phí đi kèm.

Bảng cho thấy GRAPES tốn thêm **2,3–3,2 lần bộ nhớ GPU** và **1,4–1,8 lần thời gian** mỗi epoch so với Random, vì phải duy trì mạng lấy mẫu GCN_S chạy song song.

Đây là đánh đổi thực tế cần cân nhắc khi triển khai trên hệ thống bị giới hạn tài nguyên. Nhưng như dòng ghi chú phía dưới nhắc lại: ngay cả với chi phí đó, GRAPES vẫn chạy được trên ogbn-products 2,4 triệu đỉnh trên T4 15GB — đây là điều các phương pháp nặng hơn như AS-GCN không làm được."

---

## SLIDE 20 — Kết luận *(~60 giây)*

"Tổng hợp lại toàn bộ báo cáo.

**Ưu điểm** của GRAPES: lấy mẫu thích ứng học được giúp tổng quát hóa tốt hơn qua các đồ thị; chạy được trên đồ thị hàng triệu đỉnh nơi full-graph GCN và GAS bị OOM; bền vững khi giảm kích thước mẫu; đặc biệt hiệu quả trên đồ thị heterophily đa nhãn.

**Nhược điểm** cần nhìn nhận thẳng thắn: chi phí huấn luyện tăng do mạng GCN_S thứ hai — tốn 2–3x bộ nhớ và 1.4–1.8x thời gian so với Random sampling; GFlowNet nhạy cảm với thiết kế hàm phần thưởng và siêu tham số; chỉ mới đánh giá trên node classification — chưa kiểm chứng link prediction; lấy mẫu đỉnh chưa kiểm soát trực tiếp số cạnh.

Kết luận: GRAPES là bước tiến theo hướng lấy mẫu thích ứng có cơ sở lý thuyết. Scalability so với full-graph training là điểm mạnh rõ ràng; đánh đổi là chi phí cao hơn so với sampling đơn giản. Các nhược điểm này chính là xuất phát điểm cho 3 hướng nghiên cứu mà em sẽ trình bày ngay sau."

---

## SLIDE 21 — Hướng 1: Áp Dụng Cho Hệ Thống Gợi Ý *(~45 giây)*

"Hướng thứ nhất — và là hướng em sẽ triển khai trong giai đoạn 2.

**Tại sao hướng này?** GRAPES chỉ kiểm chứng node classification trong bài báo gốc, chưa bao giờ test recommendation. Tuy nhiên hệ thống gợi ý là ứng dụng GNN phổ biến nhất thực tế. Bài báo xác nhận phương pháp applicable to link prediction.

**Đề xuất cụ thể:** Chuyển sang đồ thị hai phía user–item, thay Softmax bằng BPR Loss, điều chỉnh reward GFlowNet thành R = exp(−α·L_BPR). GCN_S và GFlowNet giữ nguyên.

**Tính khả thi:** Codebase đã nắm từ giai đoạn 1. Amazon Reviews'23 public. BPR Loss chuẩn — 5 dòng PyTorch. Baselines LightGCN, NGCF, PinSage đều open-source."

---

## SLIDE 22 — Hướng 2: Khi Nào Nên Dùng GRAPES? *(~45 giây)*

"Hướng thứ hai xuất phát từ câu hỏi thực hành.

**Tại sao hướng này?** Sau 12 dataset, ΔF1 dao động từ −3,7 đến +3,0 — không có quy luật. Người dùng phải thử-sai, tốn tài nguyên. Dữ liệu giai đoạn 1 đã đủ để phân tích ngay.

**Đề xuất:** Trích đặc trưng đồ thị (homophily ratio, bậc TB, phân phối bậc), tính tương quan với ΔF1(GRAPES−Random), xây dựng decision rule: 'nếu homophily < 0.3 → dùng GRAPES'.

**Tính khả thi cao nhất trong 3 hướng:** Dữ liệu và kết quả đã có từ giai đoạn 1. Không cần train mới. Chỉ cần pandas và scipy. Ước tính 2–3 tuần."

---

## SLIDE 23 — Hướng 3: Tối Ưu Cho Đồ Thị Kết Nối Đa Dạng *(~45 giây)*

"Hướng thứ ba xuất phát từ quan sát trong giai đoạn 1.

**Tại sao hướng này?** GRAPES thắng rõ trên 4/5 heterophily dataset. GCN tổng hợp đồng đều từ mọi lân cận — mất tín hiệu phân biệt trên heterophily. Câu hỏi: nếu thay GCN_C bằng kiến trúc phù hợp hơn, GRAPES có cải thiện thêm không?

**Đề xuất:** Bước 1 thay GCN_C bằng GAT, test trên BlogCat/Yelp/ogbn-proteins. Bước 2 nếu tốt thì thử H2GCN, FAGCN, MixHop.

**Tính khả thi:** GAT có sẵn trong PyTorch Geometric. GCN_C là module độc lập — thay không ảnh hưởng GCN_S. Rủi ro thấp: ngay cả khi GAT không cải thiện, đó tự nó đã là đóng góp mới."

---

## SLIDE 24 — Giai Đoạn 2: Tổng Quan & Dữ Liệu *(~60 giây)*

"Chuyển sang phần cuối — **kế hoạch giai đoạn 2**.

Giai đoạn 2 áp dụng GRAPES cho bài toán gợi ý, với bộ dữ liệu **Amazon Reviews 2023** từ McAuley Lab, UCSD. Quy mô thực tế: 10–23 triệu user, 1.6–7.2 triệu item, 29–66 triệu tương tác.

Em chọn ba danh mục: **Books** — thưa, văn bản phong phú; **Clothing** — phân phối long-tail; **Electronics** — tương tác dày, bậc cao hơn.

Về kiến trúc: **GCN_S và GFlowNet giữ nguyên hoàn toàn**. Chỉ thích nghi ba thành phần: đầu vào sang đồ thị hai phía; GCN_C sang BPR Loss; metric sang Recall@K, NDCG@K."

---

## SLIDE 25 — Roadmap Triển Khai Giai Đoạn 2 *(~45 giây)*

"Slide này trình bày lịch trình triển khai giai đoạn 2 dưới dạng Gantt chart — 6 pha trên tổng khoảng 16 tuần.

**Pha 1 (tuần 0–2.5):** Thu thập và tiền xử lý Amazon Reviews'23 — 5-core filter, ID mapping.

**Pha 2 (tuần 2.5–4):** Xây dựng đồ thị hai phía user–item, timestamp split.

**Pha 3 (tuần 4–7.5):** Thích nghi GCN_C — link predictor, BPR Loss. Đây là phần tốn thời gian nhất.

**Pha 4 (tuần 7.5–10):** Thiết kế và kiểm thử reward R = exp(−α·L_BPR), theo dõi hội tụ TB Loss.

**Pha 5 (tuần 10–12.5):** Chạy baselines: LightGCN, NGCF, PinSage, Random Sampling.

**Pha 6 (tuần 12.5–16):** Đánh giá Recall@K / NDCG@K, phân tích bộ nhớ và thời gian, viết báo cáo.

Tổng: 3.5 đến 4 tháng."

---

## SLIDE 26 — Luồng Dữ Liệu Chi Tiết *(~90 giây)*

"Slide này trình bày toàn bộ pipeline từ dữ liệu thô đến đánh giá.

**Bước 1 — Dữ liệu nguồn:** Ba danh mục Amazon Reviews 2023 đưa vào song song.

**Bước 2 — Tiền xử lý:** 5-core filter giữ user/item ≥ 5 tương tác. Chia theo timestamp: train 80% / val 10% / test 10%.

**Bước 3 — Đồ thị hai phía:** G = (U ∪ I, E) — đỉnh là user và item, cạnh là tương tác rating.

**Bước 4 — Mini-batch:** Lấy batch 512 user, xác định L-hop neighborhood, tập ứng viên C.

**Bước 5 — GCN_S:** 2-layer GCN xuất ra xác suất p_v cho từng ứng viên.

**Bước 6 — Gumbel Top-k:** Chọn k đỉnh quan trọng nhất — gradient truyền ngược qua bước rời rạc nhờ nhiễu Gumbel.

**Bước 7 — GCN_C:** Tính e_u · e_i = ŷ_ui, tối thiểu L_BPR = −∑ log σ(ŷ_u,i⁺ − ŷ_u,i⁻).

**Bước 8 — GFlowNet feedback:** R = exp(−α·L_BPR) → TB Loss → cập nhật θ_GCN_S.

**Bước 9 — Đánh giá:** Recall@K, NDCG@K, Precision@K. So sánh LightGCN, NGCF, PinSage, Random."

---

## SLIDE 27 — Kế Hoạch Triển Khai Giai Đoạn 2 *(~45 giây)*

"Kế hoạch gồm 6 bước, dự kiến 3.5–4 tháng:

**Bước 1:** Thu thập và tiền xử lý Amazon Reviews 2023 — 2–3 tuần.
**Bước 2:** Xây dựng đồ thị hai phía, 5-core filter, timestamp split — 1–2 tuần.
**Bước 3:** Thích nghi GCN_C thành link predictor với BPR Loss — 3–4 tuần.
**Bước 4:** Thiết kế và kiểm thử reward R = exp(−α·L_BPR) trong GFlowNet — 2–3 tuần.
**Bước 5:** Chạy baselines LightGCN, NGCF, PinSage, Random Sampling — 2–3 tuần.
**Bước 6:** Đánh giá Recall@K / NDCG@K, phân tích bộ nhớ và thời gian, viết báo cáo — 3–4 tuần."

---

## SLIDE 28 — Tổng Kết & Cảm Ơn *(~60 giây)*

"Nhìn lại toàn bộ hai giai đoạn:

**Giai đoạn 1 đã hoàn thành:** Khảo sát 28 công trình từ NeurIPS, ICML, ICLR, TMLR giai đoạn 2017–2024. Tái hiện GRAPES trên 12 dataset. Xác nhận GRAPES-GFN vượt GRAPES-RL trên 10/12 dataset. Scalability trên Amazon 2M đỉnh 61M cạnh — GAS và AS-GCN OOM, GRAPES chạy được. Đánh đổi: bộ nhớ tăng 2–3 lần, thời gian tăng 1.4–1.8 lần so với Random.

**Giai đoạn 2:** 6 bước, 3.5–4 tháng.

---

**Em xin cảm ơn Hội đồng đã lắng nghe và rất mong nhận được góp ý từ các Thầy Cô.**"

---

## Gợi ý câu trả lời câu hỏi thường gặp

**Q: Tại sao dùng GFlowNet mà không phải REINFORCE?**
> GFlowNet có phương sai thấp hơn và khám phá đa dạng hơn trong không gian tập con. Bài báo cũng so sánh trực tiếp GRAPES-RL (REINFORCE) và GRAPES-GFN — GFN thường ổn định hơn, đặc biệt trên dataset lớn.

**Q: Tại sao GAS vẫn tốt hơn GRAPES ở một số dataset?**
> GAS lưu toàn bộ embedding lịch sử, giúp GCN nhận thông tin full-graph gần đúng mà không cần sampling. Điều này cho F1 cao hơn trên dataset đơn giản như Reddit, nhưng chi phí bộ nhớ lưu trữ rất lớn — không khả thi trên đồ thị thực tế bị giới hạn VRAM.

**Q: Gumbel Top-k hoạt động thế nào?**
> Gumbel Top-k thêm nhiễu Gumbel vào log-probabilities và chọn top-k phần tử. Kỹ thuật này tạo gradient xấp xỉ cho phép backprop qua bước chọn tập con rời rạc — về bản chất là một relaxation của argmax thành phép toán khả vi.

**Q: Tại sao snap-patents AS-GCN tốt hơn GRAPES?**
> snap-patents là đồ thị patent với cấu trúc đặc biệt — rất thưa và phân phối bậc khác thường. AS-GCN dùng attention để trọng số hóa lân cận, phù hợp hơn trong trường hợp này. GRAPES tổng quát hơn nhưng không tối ưu trên mọi loại đồ thị.

**Q: Chi phí bộ nhớ GRAPES tăng gấp 3 lần thì có dùng được thực tế không?**
> Thực tế, ngay cả với chi phí gấp 3 lần, GRAPES vẫn chạy được trên ogbn-products 2,4 triệu đỉnh với Tesla T4 15,6GB. Đây là GPU phổ thông, không phải high-end. Chi phí tăng chủ yếu do GCN_S — một GCN tiêu chuẩn, không quá nặng.
