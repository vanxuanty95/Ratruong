# Script Thuyết Trình — GRAPES
**MSHV: 2470113 — Văn Xuân Tỷ**
**Thời lượng: ~15 phút | 21 slides**

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

## SLIDE 5 — Tại sao Aggregate gây ra Bùng nổ *(~60 giây)*

"Vấn đề bắt nguồn từ tính **đệ quy** của Bước Aggregate.

Để tính h_v^(L), ta phải tính h_u^(L-1) cho tất cả lân cận u của v — và để tính h_u^(L-1), ta lại cần lân cận của u, cứ thế nhân dần lên.

Ba dòng công thức trên slide minh họa điều này:
- **Tầng 1**: cần d̄ đỉnh lân cận trực tiếp
- **Tầng 2**: mỗi lân cận lại cần lân cận của nó → d̄² đỉnh
- **Tầng L**: số đỉnh phụ thuộc tăng theo **O(d̄ᴸ)** — cấp số nhân

Ví dụ thực tế ở dòng cảnh báo: mini-batch 512 đỉnh, bậc trung bình 10, 3 tầng → phải nạp gần **512 nghìn đỉnh** vào GPU cho một mini-batch nhỏ."

---

## SLIDE 6 — Vấn đề Bùng nổ lân cận *(~45 giây)*

"Biểu đồ bên phải cho thấy mức tăng theo hàm mũ: từ 5 nghìn đỉnh ở L=1 lên 51 nghìn ở L=2 và hơn 500 nghìn ở L=3.

Điểm quan trọng: **chia mini-batch nhỏ không giải quyết được vấn đề** nếu không có sampling, vì vẫn phải nạp toàn bộ lân cận L-hop vào bộ nhớ. Thực tế trên ogbn-arxiv với d̄≈13 và L=3, mini-batch 512 đỉnh cần ~1,2 triệu đỉnh phụ thuộc.

Đây là lý do ra đời của các phương pháp **graph sampling**."

---

## SLIDE 7 — Câu hỏi nghiên cứu *(~30 giây)*

"Từ vấn đề đó, báo cáo đặt câu hỏi trung tâm:

*'Có thể học được chính sách lấy mẫu đỉnh thích ứng — thay vì dùng heuristic tĩnh — để tối thiểu hóa chi phí bộ nhớ khi huấn luyện GNN mà vẫn giữ được chất lượng phân loại?'*

Ba từ khóa: **học được** — không phải cố định; **thích ứng** — theo từng đồ thị và tác vụ; **hiệu quả** — bộ nhớ thấp, kết quả ổn định."

---

## SLIDE 8 — Tổng quan phương pháp Sampling *(~60 giây)*

"Trước GRAPES, có 4 nhóm phương pháp chính mà em đã khảo sát.

**Theo đỉnh** — GraphSAGE, PinSage: chọn k lân cận ngẫu nhiên mỗi đỉnh — đơn giản nhưng vẫn bùng nổ theo số tầng.

**Theo tầng** — FastGCN, LADIES, AS-GCN: chọn k đỉnh dùng chung cho toàn bộ batch trong một tầng — không nhân lên theo từng đỉnh. AS-GCN tốt về chất lượng nhưng OOM trên đồ thị lớn; LADIES có độ lệch chuẩn rất cao — không ổn định.

**Theo đồ thị con** — ClusterGCN, GraphSAINT: hiệu quả bộ nhớ nhưng cắt đứt các cạnh nối giữa các cụm — mất thông tin kết nối quan trọng giữa các đỉnh thuộc cụm khác nhau.

**Embedding lịch sử** — GAS: tái dùng embedding cũ, hiệu năng cao nhưng chi phí lưu trữ lớn.

**Khoảng trống chung**: chưa có phương pháp nào học được chính sách lấy mẫu thích ứng theo mục tiêu tác vụ. Đây là điểm GRAPES giải quyết — hàng cuối được tô xanh."

---

## SLIDE 9 — GRAPES: Ý tưởng cốt lõi *(~45 giây)*

"GRAPES giải quyết khoảng trống bằng ý tưởng: **huấn luyện một GNN thứ hai chuyên học xác suất lấy mẫu**, tối ưu trực tiếp theo mục tiêu tác vụ đầu cuối.

Ba tính chất nổi bật mà em muốn nhấn mạnh:

Thứ nhất, **thích ứng học được** — không phải heuristic cố định, điều chỉnh theo từng đồ thị cụ thể.

Thứ hai, **hiệu quả bộ nhớ** — dùng ít hơn nhiều so với GAS, chạy được trên Tesla T4 chỉ 15GB với đồ thị 2,4 triệu đỉnh.

Thứ ba, **bền vững mẫu nhỏ** — duy trì F1 khi giảm kích thước mẫu, độ lệch chuẩn nhỏ nhất trong tất cả phương pháp so sánh."

---

## SLIDE 10 — Kiến trúc GRAPES *(~90 giây)*

"Bây giờ em xin trình bày chi tiết kiến trúc. GRAPES gồm hai GNN chạy phối hợp.

**GCN_S — Sampler** (khung xanh bên trái): nhận đồ thị G, đầu ra là xác suất pᵢ cho từng đỉnh lân cận — đỉnh nào có khả năng cao là 'quan trọng' sẽ được xác suất cao hơn.

Xác suất này truyền vào **Gumbel Top-k** (hộp vàng trung tâm) — đây là kỹ thuật then chốt giúp mạng tự học được việc chọn đỉnh — bằng cách làm mượt phép chọn cố định (có/không) thành xác suất, để mạng biết điều chỉnh theo hướng nào. Đầu ra là đồ thị con G_s chỉ gồm k đỉnh quan trọng nhất mỗi hop.

**GCN_C — Classifier** (khung đỏ bên phải): nhận G_s, tính loss L_C và đưa ra dự đoán nhãn.

Điểm then chốt nhất là **vòng phản hồi GFlowNet** — mũi tên xanh lá phía dưới. L_C được dùng làm **reward** để cập nhật GCN_S thông qua thuật toán Trajectory Balance. Nhờ đó GCN_S dần học được: *'Đỉnh nào nên lấy mẫu để tác vụ phân loại đạt tốt nhất?'*

Đây là điểm khác biệt cốt lõi: lấy mẫu **học được** từ dữ liệu, không phải heuristic tĩnh."

---

## SLIDE 11 — GFlowNet: Subgraph Tốt Hơn → Được Chọn Nhiều Hơn *(~60 giây)*

"Hãy nhìn vào ví dụ trực quan này. Có 3 subgraph khả thi với chất lượng khác nhau: SG1=0,8 / SG2=0,6 / SG3=0,1.

Cách tiếp cận truyền thống — tìm max — có nghĩa là luôn chọn SG1, subgraph tốt nhất, và **bỏ qua hoàn toàn SG2 và SG3** — dù chúng cũng khá tốt. Nếu SG1 hóa ra không phù hợp trong một số tình huống cụ thể, mô hình không có gì để fallback.

GFlowNet làm khác: **phân bổ xác suất cho nhiều lựa chọn tỉ lệ với chất lượng** — SG1 được chọn 53% lần, SG2 vẫn được chọn 40%, SG3 thỉnh thoảng 7%. Không ai bị bỏ qua hoàn toàn.

Ý tưởng cốt lõi: **P(G_s) ∝ R(G_s)** — subgraph tốt hơn được chọn nhiều hơn, nhưng các lựa chọn khác vẫn được khám phá. Kết quả: mô hình bền vững hơn, không bị kẹt ở một cách lấy mẫu duy nhất.

Trong GRAPES, chất lượng được đo bằng R = exp(−α·L_C) — phân loại càng tốt thì subgraph đó càng được ưu tiên trong lần sau."

---

## SLIDE 12 — GFlowNet & Chính sách phân rã theo tầng *(~60 giây)*

"Tại sao cần GFlowNet?

Vì phép chọn đỉnh là **0 hoặc 1 — không có giá trị ở giữa**. Mạng không tính được "nên điều chỉnh theo hướng nào" — giống như không thể tối ưu khi hàm số chỉ có bước nhảy, không có độ dốc. GFlowNet giải quyết bằng cách học xác suất thay vì chọn cố định — ổn định hơn và khám phá nhiều cách lấy mẫu khác nhau.

Chính sách được **phân rã theo tầng**: q(V¹,...,Vᴸ | V⁰) = tích của q(Vˡ | V⁰,...,Vˡ⁻¹) theo từng tầng — cho phép học độc lập từng bước.

Cụ thể: V⁰ là tập đỉnh mini-batch. Tầng 1, GCN_S tính xác suất cho lân cận của V⁰ và chọn k đỉnh → V¹. Tầng 2 tương tự với lân cận của V¹. Cuối cùng, tập tích lũy K⁽ᴸ⁾ = V⁰ ∪ V¹ ∪ ... ∪ Vᴸ được nạp vào GCN_C."

---

## SLIDE 13 — Thiết lập thực nghiệm *(~45 giây)*

"Về thiết lập thực nghiệm.

GRAPES có **2 phiên bản**: **GRAPES-RL** dùng REINFORCE. **GRAPES-GFN** thay bằng GFlowNet. Bài báo trình bày cả hai để so sánh trực tiếp.

Bài báo đánh giá trên **12 tập dữ liệu chuẩn**: 7 tập homophilous gồm Cora, CiteSeer, PubMed, Reddit, ogbn-arxiv, ogbn-products, DBLP — và 5 tập heterophilous gồm Flickr, snap-patents, Yelp, ogbn-proteins, BlogCat.

*(Giải thích nếu được hỏi — **homophily** là tính chất các nút có đặc trưng tương tự thường kết nối với nhau — ví dụ người cùng sở thích thường kết bạn với nhau. Đồ thị **homophilous** là đồ thị có tính chất này rõ rệt; đồ thị **heterophilous** thì ngược lại — các nút kết nối với nhau dù khác loại.)*

Giao thức đồng nhất cho tất cả phương pháp: batch size 256, 256 mẫu mỗi tầng, 10 lần chạy lấy mean ± std. GPU gốc là RTX A6000 48GB. Trong phần tái hiện của em, thiết bị là Tesla T4 15,6GB trên Google Colab — bằng 1/3 VRAM của thiết bị gốc. Metric là F1-score."

---

## SLIDE 14 — Kết quả Homophily *(~90 giây)*

"Kết quả trên đồ thị homophilous.

Em xin chú ý một số điểm nổi bật.

Hàng **LADIES** — màu vàng có ký hiệu ⚠: độ lệch chuẩn trên Cora là ±11,69 — hoàn toàn không ổn định trong thực tế. Đây là bằng chứng cho thấy không phải phương pháp nào cũng ổn định khi giảm kích thước mẫu.

**PASS** bị OOM trên Reddit và ogbn-products — xác nhận vấn đề scalability.

**GRAPES-RL** đứng đầu trên Cora với 87,62%, **GRAPES-GFN** đứng đầu trên DBLP với 77,14% — cả hai đều vượt Random rõ rệt.

Tuy nhiên, em xin trung thực: **GAS** vẫn dẫn đầu trên Reddit (94,75) và ogbn-arxiv (68,36). Sức mạnh của GRAPES không phải ở điểm tuyệt đối trên mọi dataset, mà ở sự **ổn định, hiệu quả bộ nhớ, và khả năng chạy được** trên dataset lớn mà AS-GCN hay PASS không thể.

Ghi chú dưới bảng cũng nhắc: AS-GCN thực ra tốt nhất trên CiteSeer và PubMed — em đã giữ thông tin này để đảm bảo tính trung thực với hội đồng."

---

## SLIDE 15 — Kết quả Heterophily *(~75 giây)*

"Đây là phần kết quả ấn tượng nhất của GRAPES.

**GRAPES-GFN xếp hạng #1 trên 4/5 dataset heterophilous**: BlogCat, Yelp, Flickr, ogbn-proteins. Điều này cho thấy lấy mẫu thích ứng đặc biệt có lợi trên đồ thị dị phương — nơi không phải lân cận nào cũng mang tín hiệu hữu ích. GFlowNet học được cách ưu tiên đúng lân cận mang thông tin.

Ngoại lệ duy nhất là **snap-patents** — ký hiệu ① đặt tại cột AS-GCN (31,04), không phải GRAPES-GFN (29,58). Em đã sửa lỗi này khi đọc lại bảng từ LaTeX so với bản trình bày ban đầu để phản ánh đúng kết quả.

Tóm lại: GRAPES đặc biệt nổi trội trên đồ thị heterophilous đa nhãn với homophily thấp — đây là bằng chứng thực nghiệm mạnh nhất của phương pháp."

---

## SLIDE 16 — Tái hiện thực nghiệm *(~60 giây)*

"Phần này là kết quả **tái hiện của em** trên Google Colab — không phải số liệu từ bài báo gốc.

Em tái hiện 4 tập dữ liệu với Tesla T4 15,6GB, mỗi tập chạy 3 lần. So sánh GRAPES-GFN và Random sampling:
- Cora: GRAPES tốt hơn +0,33
- CiteSeer: chênh lệch nhỏ −0,43 — xấp xỉ bằng nhau
- ogbn-arxiv: GRAPES tốt hơn +0,76

Và **phát hiện quan trọng nhất**: GRAPES-GFN chạy được 9/10 epoch trên **ogbn-products — 2,4 triệu đỉnh, 61,9 triệu cạnh — không bị OOM** trên Tesla T4 chỉ 15,6GB, bằng 1/3 VRAM so với thiết bị gốc. Tất cả |Δ| ≤ 0,76 F1 so với bài báo — xác nhận tái hiện thành công."

---

## SLIDE 17 — Chi phí bộ nhớ & thời gian *(~45 giây)*

"Tuy nhiên, lấy mẫu thích ứng có chi phí đi kèm.

Bảng cho thấy GRAPES tốn thêm **2,3–3,2 lần bộ nhớ GPU** và **1,4–1,8 lần thời gian** mỗi epoch so với Random, vì phải duy trì mạng lấy mẫu GCN_S chạy song song.

Đây là đánh đổi thực tế cần cân nhắc khi triển khai trên hệ thống bị giới hạn tài nguyên. Nhưng như dòng ghi chú phía dưới nhắc lại: ngay cả với chi phí đó, GRAPES vẫn chạy được trên ogbn-products 2,4 triệu đỉnh trên T4 15GB — đây là điều các phương pháp nặng hơn như AS-GCN không làm được."

---

## SLIDE 18 — Kết luận *(~60 giây)*

"Tổng hợp lại toàn bộ báo cáo.

**Ưu điểm** của GRAPES: lấy mẫu thích ứng học được giúp tổng quát hóa tốt hơn qua các đồ thị; chạy được trên đồ thị hàng triệu đỉnh nơi full-graph GCN và GAS bị OOM; bền vững khi giảm kích thước mẫu; đặc biệt hiệu quả trên đồ thị heterophily đa nhãn.

**Nhược điểm** cần nhìn nhận thẳng thắn: chi phí huấn luyện tăng do mạng GCN_S thứ hai — tốn 2–3x bộ nhớ và 1.4–1.8x thời gian so với Random sampling; GFlowNet nhạy cảm với thiết kế hàm phần thưởng và siêu tham số; chỉ mới đánh giá trên node classification — chưa kiểm chứng link prediction; lấy mẫu đỉnh chưa kiểm soát trực tiếp số cạnh.

Kết luận: GRAPES là bước tiến theo hướng lấy mẫu thích ứng có cơ sở lý thuyết. Scalability so với full-graph training là điểm mạnh rõ ràng; đánh đổi là chi phí cao hơn so với sampling đơn giản. Các nhược điểm này chính là xuất phát điểm cho 3 hướng nghiên cứu mà em sẽ trình bày ngay sau."

---

## SLIDE 19 — Hướng 1: Áp Dụng Cho Hệ Thống Gợi Ý *(~30 giây)*

"Hướng thứ nhất đóng vòng lặp từ động cơ ban đầu của báo cáo: bài toán **gợi ý**.

GRAPES hiện chỉ được kiểm chứng trên phân loại đỉnh. Nhưng bài toán thực tế là dự đoán user sẽ thích item nào — tác giả GRAPES đã xác nhận phương pháp có thể áp dụng cho bài toán này.

Cần thay hàm đánh giá từ phân loại sang đo độ phù hợp user–item, và xử lý đồ thị hai chiều user→item. GFlowNet vẫn dùng chất lượng gợi ý làm phần thưởng để học — cơ chế không thay đổi.

So sánh với LightGCN, NGCF, PinSage — các mô hình gợi ý phổ biến nhất hiện tại."

---

## SLIDE 20 — Hướng 2: Khi Nào Nên Dùng GRAPES? *(~30 giây)*

"Hướng thứ hai trả lời câu hỏi thực tế: đồ thị nào thì GRAPES thực sự tốt hơn Random? Hiện tại chỉ biết qua thực nghiệm từng dataset — không có quy luật chung.

Em đề xuất: từ 12 dataset đã có, tìm đặc trưng đồ thị nào dự đoán được khi nào GRAPES có lợi.

Kỳ vọng: mạng xã hội với kết nối đa dạng và nhiều nhãn thì GRAPES tốt hơn rõ. Đồ thị trích dẫn khoa học đồng nhất một nhãn thì Random là đủ.

Nếu thành công: người dùng có tiêu chí rõ ràng để chọn phương pháp, không cần thử-sai."

---

## SLIDE 21 — Hướng 3: Tối Ưu Cho Đồ Thị Kết Nối Đa Dạng + Cảm ơn *(~45 giây)*

"Hướng thứ ba xuất phát từ quan sát: GRAPES đã thắng rõ trên đồ thị kết nối đa dạng, nhưng mạng GCN bên trong chưa được thiết kế riêng cho loại đồ thị này.

Hướng này thay GCN_C bằng kiến trúc tổng hợp thông tin từ nhiều bậc lân cận cùng lúc — thay vì chỉ nhìn lân cận gần, mạng học được cả lân cận xa và gần đồng thời.

Lộ trình: bước đầu thay bằng GAT — đơn giản, đã có sẵn trong code — test trên BlogCat, Yelp, ogbn-proteins. Bước hai chuyển sang kiến trúc phức tạp hơn nếu kết quả tốt.

Mục tiêu: phương pháp vừa xử lý được đồ thị lớn vừa khai thác tốt đồ thị kết nối đa dạng.

---

Đó là toàn bộ nội dung báo cáo. **Em xin cảm ơn Hội đồng đã lắng nghe và rất mong nhận được góp ý từ các Thầy Cô.**"

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
