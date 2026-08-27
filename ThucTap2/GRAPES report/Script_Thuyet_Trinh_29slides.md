# Script Thuyết Trình — GRAPES
**MSHV: 2470113 — Văn Xuân Tỷ**
**Thời lượng: ~15–20 phút | 29 slides**

---

## SLIDE 1 — Trang bìa *(~30 giây)*

*[Đứng thẳng, nhìn hội đồng, hít thở bình tĩnh trước khi bắt đầu]*

"Kính thưa Hội đồng, em xin phép được bắt đầu buổi bảo vệ.

Báo cáo của em có tên là **Phát Triển Phương Pháp Lấy Mẫu Đồ Thị Cho Hệ Thống Gợi Ý Quy Mô Lớn Sử Dụng Mạng Nơ-ron Đồ Thị** — tập trung vào phương pháp GRAPES, viết tắt của *Graph Adaptive Sampling*, được công bố tại tạp chí TMLR năm 2024.

Em xin mời Hội đồng theo dõi."

---

## SLIDE 2 — Nội dung trình bày *(~30 giây)*

"Báo cáo được chia thành 5 phần chính.

Phần đầu là **bối cảnh** — tại sao GNN lại gặp khó khăn khi áp dụng vào dữ liệu quy mô lớn. Phần hai là **tổng quan** các phương pháp lấy mẫu hiện có và khoảng trống mà chúng để lại. Phần ba — trọng tâm của báo cáo — là **kiến trúc và cơ chế hoạt động của GRAPES**. Phần bốn là **kết quả thực nghiệm** gồm số liệu từ bài báo gốc và kết quả tái hiện của em. Và phần cuối là **kết luận cùng 3 hướng nghiên cứu tiếp theo**, trong đó hướng thứ nhất sẽ là nội dung chính của giai đoạn 2."

---

## SLIDE 3 — Bối cảnh & Động cơ *(~60 giây)*

"Điểm xuất phát của báo cáo là bài toán **hệ thống gợi ý**.

Dữ liệu tương tác giữa người dùng và sản phẩm tự nhiên hình thành một đồ thị hai phía — và GNN là công cụ rất phù hợp để khai thác loại cấu trúc quan hệ này. Ví dụ cụ thể: Pinterest triển khai PinSage trên đồ thị hơn 3 tỷ cạnh; các mô hình như NGCF và LightGCN cũng trở thành baseline tiêu chuẩn trong lĩnh vực gợi ý.

Nhưng khi quy mô đồ thị tăng lên đến hàng triệu, thậm chí hàng tỷ đỉnh, một vấn đề rất thực tế xuất hiện. Sơ đồ bên phải mô tả chuỗi nhân quả: hệ thống gợi ý kéo theo GNN quy mô lớn, GNN quy mô lớn kéo theo thách thức scalability, và thách thức scalability dẫn đến **bùng nổ lân cận** — đây là vấn đề trọng tâm mà báo cáo này đặt ra."

---

## SLIDE 4 — GNN: Cơ chế Message Passing *(~60 giây)*

"Trước khi đi vào vấn đề bùng nổ lân cận, em xin giới thiệu ngắn cách GNN hoạt động.

GNN học đặc trưng của mỗi đỉnh bằng cách lan truyền thông tin qua cấu trúc đồ thị, qua nhiều tầng. Khung tổng quát nhất gọi là **MPNN — Message Passing Neural Network** — gồm 4 bước lặp lại:

Bước đầu tiên là **khởi tạo** — gán đặc trưng ban đầu cho từng đỉnh. Bước hai là **Aggregate** — gom thông điệp từ toàn bộ lân cận xung quanh, đây là bước then chốt nhất. Bước ba là **Update** — kết hợp thông tin hiện tại của đỉnh với những gì vừa gom được. Và bước bốn là **Predict** — đưa ra dự đoán nhãn hoặc thực hiện tác vụ cuối.

Sau L tầng, đặc trưng của đỉnh v đã mã hóa toàn bộ cấu trúc L-hop xung quanh nó — đây chính là sức mạnh của GNN. Và cũng chính bước Aggregate là nguồn gốc của bùng nổ lân cận mà em sẽ giải thích ngay sau."

---

## SLIDE 5 — Minh hoạ MPNN: Thông Tin Lan Truyền Qua Từng Tầng *(~45 giây)*

"Để hình dung rõ hơn, hãy nhìn vào ví dụ nhỏ này.

Đỉnh V ở trung tâm có 4 lân cận trực tiếp A, B, C, D — và vòng ngoài là E, F, G, H.

Ở **tầng 0**, V chỉ biết chính mình — đặc trưng khởi đầu.

Sau **tầng 1**, V gom thông điệp từ A, B, C, D — V đã 'thấy' cấu trúc 1-hop.

Sau **tầng 2**, mỗi đỉnh A, B, C, D lại gom từ vòng ngoài rồi truyền vào V — V giờ 'thấy' cả E, F, G, H.

Quy luật rất rõ: **L tầng thì biết cấu trúc L-hop**. Sức mạnh lớn — nhưng cũng kéo theo chi phí tính toán tăng theo hàm mũ khi L và bậc đồ thị lớn dần lên."

---

## SLIDE 6 — GNN Gặp Những Vấn Đề Gì? *(~45 giây)*

"GNN mạnh nhưng khi mở rộng quy mô, ba vấn đề nổi lên rõ nhất.

**Oversmoothing** — xếp chồng nhiều tầng GNN khiến đặc trưng của các đỉnh dần hội tụ về cùng một giá trị, mất đi sự phân biệt, kết quả phân loại kém đi.

**Oversquashing** — thông tin từ các đỉnh xa bị 'nén' qua các cạnh cổ chai trên đồ thị, tín hiệu quan trọng bị suy giảm trước khi đến nơi cần.

Hai vấn đề trên liên quan đến chất lượng học. Nhưng vấn đề thứ ba mới là thách thức thực tế nhất, đặc biệt với đồ thị quy mô lớn: **Bùng nổ lân cận** — số đỉnh cần nạp vào bộ nhớ tăng theo cấp số nhân theo số tầng. Đây là điểm trọng tâm mà báo cáo này tập trung vào."

---

## SLIDE 7 — Tại sao Aggregate gây ra Bùng nổ *(~60 giây)*

"Vấn đề bắt nguồn từ tính đệ quy của Bước Aggregate.

Để tính đặc trưng của đỉnh v ở tầng L, ta phải tính đặc trưng của toàn bộ lân cận của v ở tầng L-1 — và để tính những đỉnh đó, lại phải mở rộng thêm một tầng nữa — cứ thế nhân dần lên.

Kết quả cụ thể: tầng 1 cần d̄ đỉnh; tầng 2 cần d̄ bình phương; tầng L cần **O(d̄ᴸ)** đỉnh — hàm mũ theo số tầng.

Ví dụ thực tế ngay trên slide: mini-batch chỉ 512 đỉnh, bậc trung bình 10, 3 tầng — vậy mà phải nạp gần **512 nghìn đỉnh** vào GPU cho một mini-batch nhỏ. Đây là lý do tại sao nhiều phương pháp bị out-of-memory trên đồ thị quy mô lớn."

---

## SLIDE 8 — Vấn đề Bùng nổ lân cận *(~45 giây)*

"Biểu đồ bên phải minh họa mức tăng đó rất trực quan: từ khoảng 5 nghìn đỉnh ở L=1, lên 51 nghìn ở L=2, và vượt 500 nghìn ở L=3 — tăng gấp 10 lần mỗi tầng.

Một điều quan trọng cần nhấn mạnh: **chia mini-batch nhỏ không giải quyết được vấn đề này** nếu không có sampling, vì dù batch nhỏ đến đâu cũng vẫn phải nạp toàn bộ lân cận L-hop vào bộ nhớ. Trên ogbn-arxiv với bậc trung bình khoảng 13 và 3 tầng, một mini-batch 512 đỉnh cần tới khoảng 1,2 triệu đỉnh phụ thuộc.

Chính vì vậy, các phương pháp **graph sampling** ra đời — và đây là bối cảnh để GRAPES xuất hiện."

---


## SLIDE 9 — Các Hướng Giải Quyết Neighbor Explosion *(~45 giây)*

"Vấn đề bùng nổ lân cận không phải chưa có giải pháp. Tài liệu hiện nay ghi nhận **ba hướng chính** [21, 27]:

**Hướng thứ nhất là Sampling** — lấy mẫu ngẫu nhiên k lân cận mỗi iteration, thay vì phải dùng toàn bộ. Đây là hướng trực tiếp nhất và có nhiều đại diện nổi bật: GraphSAGE [4], FastGCN [10], ClusterGCN [13], GraphSAINT [14].

**Hướng thứ hai là Decoupling** — tính trước toàn bộ phép lan truyền đồ thị offline, rồi chỉ huấn luyện một MLP đơn giản trên kết quả. Tiết kiệm chi phí nhưng đánh đổi mất tính phi tuyến giữa các tầng.

**Hướng thứ ba là Historical Embeddings** — như GNNAutoScale [15], tái dùng embedding đã tính từ vòng lặp trước để xấp xỉ các lân cận chưa tính. Hiệu quả nhưng embedding cũ có thể lỗi thời theo thời gian.

Vậy tại sao báo cáo chọn hướng Sampling? Vì Sampling **giữ nguyên tính phi tuyến** qua từng tầng GNN — phù hợp với bài toán phức tạp — và quan trọng hơn, nó cho phép tích hợp cơ chế **học cách sample**, tức là adaptive sampling, mà GRAPES sẽ khai thác."

---
## SLIDE 10 — Câu hỏi nghiên cứu *(~30 giây)*

"Từ vấn đề đó, báo cáo đặt ra câu hỏi trung tâm:

*'Có thể học được một chính sách lấy mẫu đỉnh thích ứng — thay vì dùng heuristic tĩnh — để tối thiểu hóa chi phí bộ nhớ khi huấn luyện GNN, trong khi vẫn giữ được chất lượng dự đoán?'*

Ba từ khóa quan trọng ở đây là: **học được** — không phải cố định sẵn; **thích ứng** — điều chỉnh theo từng đồ thị và từng tác vụ; và **hiệu quả** — bộ nhớ thấp, kết quả ổn định."

---

## SLIDE 11 — Tổng quan phương pháp Sampling *(~60 giây)*

"Trước GRAPES, có 4 nhóm phương pháp chính.

**Sampling theo đỉnh** như GraphSAGE và PinSage — chọn k lân cận ngẫu nhiên cho mỗi đỉnh, đơn giản nhưng vẫn bùng nổ theo số tầng vì mỗi đỉnh đều tự mở rộng.

**Sampling theo tầng** như FastGCN, LADIES, AS-GCN — chọn k đỉnh dùng chung cho toàn batch trong một tầng. AS-GCN cho chất lượng tốt nhưng bị OOM trên đồ thị lớn; LADIES có độ lệch chuẩn rất cao — không ổn định trong thực tế.

**Sampling theo đồ thị con** như ClusterGCN, GraphSAINT — hiệu quả bộ nhớ nhưng cắt mất các cạnh nối giữa các cụm, gây mất thông tin kết nối.

**Embedding lịch sử** như GAS — tái dùng embedding cũ, F1 cao nhưng chi phí lưu trữ rất lớn.

**Điểm chung của tất cả**: không ai học được chính sách lấy mẫu thích ứng theo mục tiêu tác vụ. Đây là khoảng trống mà GRAPES lấp vào."

---

## SLIDE 12 — GRAPES: Ý tưởng cốt lõi *(~45 giây)*

"Ý tưởng của GRAPES khá trực tiếp: **huấn luyện một mạng thứ hai chuyên học xem đỉnh nào đáng lấy mẫu**, và tối ưu mạng đó trực tiếp theo mục tiêu tác vụ đầu cuối — không phải theo heuristic cố định.

Ba điểm mà bài báo nhấn mạnh là: **thích ứng học được** — xác suất lấy mẫu thay đổi theo từng đồ thị; **hiệu quả bộ nhớ** — chạy được trên Tesla T4 15GB với đồ thị 2,4 triệu đỉnh, điều mà GAS không làm được; và **bền vững** — F1 ổn định khi giảm kích thước mẫu, độ lệch chuẩn thấp nhất trong các phương pháp so sánh."

---

## SLIDE 13 — Kiến trúc GRAPES *(~90 giây)*

"Bây giờ em xin trình bày kiến trúc chi tiết. GRAPES gồm hai GNN chạy song song và phối hợp với nhau.

**GCN_S — Sampler** là mạng thứ nhất, đóng vai trò học xác suất. Nó nhận đồ thị G làm đầu vào và xuất ra xác suất p_v cho từng đỉnh lân cận — đỉnh nào được đánh giá quan trọng hơn sẽ có xác suất cao hơn.

Xác suất đó được đưa vào **Gumbel Top-k** — đây là kỹ thuật then chốt cho phép gradient lan truyền ngược qua bước chọn rời rạc. Ý tưởng là thêm nhiễu Gumbel vào log-xác suất và chọn top-k — biến phép chọn cứng 'có hoặc không' thành phép toán khả vi mà mạng có thể học được. Đầu ra là đồ thị con G_s chỉ giữ k đỉnh quan trọng nhất mỗi hop.

**GCN_C — Classifier** là mạng thứ hai, nhận G_s làm đầu vào, tính loss L_C và đưa ra dự đoán.

Nhưng điểm quan trọng nhất là **vòng phản hồi GFlowNet** — L_C được dùng làm reward để cập nhật GCN_S qua thuật toán Trajectory Balance. Nhờ đó GCN_S dần học được: *đỉnh nào nên lấy để tác vụ phân loại đạt tốt nhất*. Đây là điểm khác biệt cốt lõi so với tất cả phương pháp trước — lấy mẫu được học từ chính mục tiêu, không phải từ heuristic."

---

## SLIDE 14 — GFlowNet: Subgraph Tốt Hơn → Được Chọn Nhiều Hơn *(~60 giây)*

"Hãy nhìn ví dụ trực quan trên slide. Có 3 subgraph khả thi với chất lượng khác nhau: SG1=0,8 — SG2=0,6 — SG3=0,1.

Cách tiếp cận truyền thống là tìm max — tức là luôn chọn SG1, và bỏ qua hoàn toàn SG2 và SG3. Nếu SG1 hóa ra không phù hợp trong một số tình huống cụ thể, mô hình không có fallback.

GFlowNet làm khác: **phân bổ xác suất tỉ lệ với chất lượng** — SG1 được chọn 53% lần, SG2 vẫn được chọn 40%, SG3 thỉnh thoảng 7%. Không ai bị bỏ qua hoàn toàn, mô hình luôn khám phá nhiều lựa chọn.

Nguyên tắc cốt lõi: P(G_s) tỉ lệ với R(G_s) — subgraph tốt hơn được chọn nhiều hơn, nhưng vẫn duy trì sự đa dạng. Trong GRAPES, reward được tính bằng R = exp(−α·L_C) — phân loại càng tốt thì subgraph đó càng được ưu tiên ở vòng sau."

---

## SLIDE 15 — GFlowNet & Chính sách phân rã theo tầng *(~60 giây)*

"Tại sao lại cần GFlowNet thay vì một cách đơn giản hơn?

Vì phép chọn đỉnh là **rời rạc — 0 hoặc 1**. Gradient không thể truyền qua bước chọn cứng đó. GFlowNet giải quyết bằng cách học một phân phối xác suất trên các tập con thay vì một lựa chọn duy nhất — ổn định hơn REINFORCE về phương sai, và khám phá nhiều subgraph hơn.

Về mặt kỹ thuật, chính sách được **phân rã theo từng tầng**: xác suất của cả trajectory bằng tích của xác suất từng tầng, cho phép học độc lập từng bước.

Cụ thể trong GRAPES: V⁰ là tập mini-batch ban đầu. Tầng 1, GCN_S tính xác suất cho lân cận của V⁰ và chọn k đỉnh → được V¹. Tầng 2 tương tự với lân cận của V¹. Cuối cùng toàn bộ các đỉnh tích lũy qua các tầng được nạp vào GCN_C để dự đoán."

---

## SLIDE 16 — Thiết lập thực nghiệm *(~45 giây)*

"Về thiết lập thực nghiệm.

GRAPES có **hai phiên bản** để so sánh: **GRAPES-RL** dùng thuật toán REINFORCE cổ điển, và **GRAPES-GFN** thay bằng GFlowNet. Bài báo trình bày cả hai để làm rõ lợi ích của GFlowNet.

Đánh giá trên **12 tập dữ liệu chuẩn**: 7 tập homophilous gồm Cora, CiteSeer, PubMed, Reddit, ogbn-arxiv, ogbn-products, DBLP — và 5 tập heterophilous gồm Flickr, snap-patents, Yelp, ogbn-proteins, BlogCat.

Giao thức đồng nhất cho tất cả phương pháp: batch size 256, 256 mẫu mỗi tầng, 10 lần chạy lấy trung bình và độ lệch chuẩn. Thiết bị gốc của bài báo là RTX A6000 48GB. Trong phần tái hiện của em, em dùng Tesla T4 15,6GB trên Google Colab — bằng khoảng 1/3 VRAM so với thiết bị gốc."

---

## SLIDE 17 — Kết quả Homophily *(~90 giây)*

"Kết quả trên các đồ thị homophilous — nơi các đỉnh tương tự thường kết nối với nhau.

Một số điểm nổi bật em muốn chú ý.

Đầu tiên là **LADIES** — hàng màu vàng có ký hiệu cảnh báo. Độ lệch chuẩn trên Cora lên tới ±11,69 — hoàn toàn không ổn định trong thực tế. Đây là bằng chứng rõ ràng rằng không phải phương pháp nào cũng đáng tin cậy khi giảm kích thước mẫu.

**PASS** bị OOM trên Reddit và ogbn-products — xác nhận vấn đề scalability vẫn là rào cản thực tế.

**GRAPES-RL** dẫn đầu trên Cora với 87,62%, **GRAPES-GFN** dẫn đầu trên DBLP với 77,14%.

Tuy nhiên, em xin trung thực với Hội đồng: **GAS** vẫn cao hơn trên Reddit (94,75) và ogbn-arxiv (68,36). Điểm mạnh của GRAPES không phải là luôn đạt F1 cao nhất — mà là **ổn định, hiệu quả bộ nhớ, và chạy được trên dataset lớn** mà AS-GCN hay PASS không thể. AS-GCN thực ra dẫn đầu trên CiteSeer và PubMed — em giữ nguyên thông tin này để đảm bảo tính trung thực."

---

## SLIDE 18 — Kết quả Heterophily *(~75 giây)*

"Đây là phần kết quả ấn tượng nhất của GRAPES.

Trên đồ thị heterophilous — nơi các đỉnh kết nối với nhau dù khác loại — **GRAPES-GFN xếp hạng số 1 trên 4 trong 5 dataset**: BlogCat, Yelp, Flickr, ogbn-proteins.

Điều này có thể giải thích được: trên đồ thị dị phương, không phải lân cận nào cũng mang tín hiệu có ích. GCN truyền thống tổng hợp đồng đều từ tất cả, trong khi GCN_S học được cách ưu tiên đúng những lân cận mang thông tin phân biệt nhãn.

Ngoại lệ duy nhất là **snap-patents**, nơi AS-GCN (31,04) vẫn cao hơn GRAPES-GFN (29,58). snap-patents có cấu trúc đặc biệt — rất thưa và phân phối bậc khác thường — nên attention-based sampling của AS-GCN phù hợp hơn trong trường hợp này.

Nhìn chung, kết quả heterophily là bằng chứng thực nghiệm mạnh nhất cho GRAPES."

---

## SLIDE 19 — Tái hiện thực nghiệm *(~90 giây)*

"Phần này là kết quả **tái hiện của em** trên Google Colab — hoàn toàn độc lập với số liệu bài báo gốc.

Trước khi vào kết quả, em xin giải thích tại sao tái hiện lại cần thiết — vì đây không phải bước thừa.

**Lý do thứ nhất**: bài báo dùng RTX A6000 48GB — phần cứng ít người có. Câu hỏi thực tế là: kết quả có giữ được trên Tesla T4 15,6GB — tức 1/3 VRAM — hay không?

**Lý do thứ hai**: bài báo claim GRAPES scalable, nhưng không có số liệu OOM/không OOM trên phần cứng phổ thông. ogbn-products với 2,4 triệu đỉnh và 61,9 triệu cạnh là test case cực đoan — nếu chạy được trên T4 thì claim scalability có cơ sở thực nghiệm độc lập.

**Lý do thứ ba**: tái hiện thành công đồng nghĩa với việc em đã nắm rõ codebase GCN_S, GFlowNet, Gumbel Top-k — đây là điều kiện tiên quyết để mở rộng sang bài toán gợi ý trong giai đoạn 2.

Về kết quả: 4 dataset, 3 lần chạy mỗi dataset. Cora chênh +0,33, CiteSeer chênh −0,43 — xấp xỉ bằng nhau, ogbn-arxiv chênh +0,76.

Và **phát hiện quan trọng nhất**: GRAPES-GFN chạy không OOM trên ogbn-products — 2,4 triệu đỉnh, 61,9 triệu cạnh — trên Tesla T4 15,6GB, với 9/10 epoch hoàn thành ổn định. Tất cả độ chênh lệch ≤ 0,76 F1 — tái hiện được xác nhận."

---

## SLIDE 20 — Chi phí bộ nhớ & thời gian *(~45 giây)*

"Tuy nhiên, lấy mẫu thích ứng đi kèm với chi phí thực tế.

Bảng cho thấy GRAPES tốn thêm **2,3 đến 3,2 lần bộ nhớ GPU** và **1,4 đến 1,8 lần thời gian** mỗi epoch so với Random Sampling đơn giản — vì phải duy trì GCN_S chạy song song với GCN_C.

Đây là đánh đổi cần cân nhắc khi triển khai thực tế. Nhưng ngay cả với chi phí đó, GRAPES vẫn chạy được trên ogbn-products 2,4 triệu đỉnh với T4 15GB — trong khi AS-GCN thì không. Vậy nên 'đắt hơn Random' không có nghĩa là 'không khả thi'."

---

## SLIDE 21 — Kết luận *(~60 giây)*

"Nhìn lại toàn bộ nội dung phần 1.

**Ưu điểm của GRAPES**: lấy mẫu thích ứng học được giúp tổng quát hóa tốt hơn qua các loại đồ thị khác nhau; chạy được trên đồ thị hàng triệu đỉnh nơi full-graph GCN và GAS bị OOM; bền vững khi giảm kích thước mẫu; và đặc biệt hiệu quả trên đồ thị heterophily đa nhãn.

**Nhược điểm** cần nhìn nhận thẳng thắn: chi phí cao hơn 2–3 lần bộ nhớ và 1,4–1,8 lần thời gian so với Random — do GCN_S chạy song song; GFlowNet nhạy cảm với thiết kế hàm reward và các siêu tham số; và GRAPES mới chỉ được kiểm chứng trên node classification, chưa có kết quả trên link prediction hay recommendation.

Nhược điểm cuối cùng đó chính là lý do có 3 hướng nghiên cứu tiếp theo mà em sẽ trình bày ngay bây giờ."

---

## SLIDE 22 — Hướng 1: Áp Dụng Cho Hệ Thống Gợi Ý *(~60 giây)*

"Hướng thứ nhất — và là hướng em sẽ triển khai trong giai đoạn 2.

**Tại sao hướng này?** Đơn giản là bài báo gốc chưa bao giờ test GRAPES trên recommendation. Nhưng hệ thống gợi ý là ứng dụng GNN phổ biến nhất trong thực tế — Spotify, Amazon, Pinterest đều dùng GNN ở core. Bài báo cũng tự xác nhận rằng phương pháp 'applicable to link prediction tasks'. Hơn nữa, các nhược điểm em đo được ở giai đoạn 1 — chi phí bộ nhớ và thời gian — cần được kiểm chứng lại trên bài toán thực tế hơn.

**Đề xuất cụ thể:** Chuyển đồ thị đầu vào sang dạng hai phía user–item, thay Softmax bằng BPR Loss cho link prediction, và điều chỉnh reward GFlowNet thành R = exp(−α·L_BPR). GCN_S và toàn bộ GFlowNet giữ nguyên — đây là đóng góp cốt lõi không cần thay đổi.

**Tính khả thi:** Codebase đã nắm rõ từ giai đoạn 1, Amazon Reviews'23 là dataset public chuẩn benchmark, BPR Loss chỉ cần 5 dòng PyTorch, các baseline đều open-source."

---

## SLIDE 23 — Hướng 2: Khi Nào Nên Dùng GRAPES? *(~60 giây)*

"Hướng thứ hai xuất phát từ một câu hỏi rất thực tế.

Sau 12 dataset, ΔF1 dao động từ −3,7 đến +3,0 — không có quy luật nào rõ ràng. Người dùng muốn áp dụng GRAPES hiện tại phải thử-sai, tốn tài nguyên và thời gian. Nhưng dữ liệu từ giai đoạn 1 đã đủ để phân tích ngay — không cần train thêm gì.

**Đề xuất:** Trích đặc trưng cấu trúc từ 12 dataset — homophily ratio, bậc trung bình, phương sai bậc, số lớp nhãn. Tính ΔF1 = F1_GRAPES − F1_Random trên từng dataset. Tìm tương quan (Pearson, Spearman) giữa đặc trưng và ΔF1. Từ đó xây dựng decision rule đơn giản như 'nếu homophily < 0.3 thì nên dùng GRAPES'.

**Tính khả thi cao nhất trong 3 hướng:** Không cần train mới, chỉ cần pandas và scipy, ước tính 2–3 tuần. Kết quả dù đơn giản nhưng có giá trị thực hành ngay lập tức."

---

## SLIDE 24 — Hướng 3: Tối Ưu Cho Đồ Thị Kết Nối Đa Dạng *(~60 giây)*

"Hướng thứ ba xuất phát từ quan sát trong kết quả giai đoạn 1.

GRAPES thắng rõ trên 4/5 heterophily dataset — tức là lấy mẫu thích ứng đặc biệt có lợi ở đây. Nhưng câu hỏi thú vị là: nếu GCN_C hiện tại vẫn tổng hợp thông tin đồng đều từ mọi lân cận, liệu thay nó bằng một kiến trúc thiết kế riêng cho heterophily có giúp GRAPES cải thiện thêm không?

**Đề xuất:** Bước 1 — thay GCN_C bằng GAT, Graph Attention Network, và test trên 5 heterophily dataset. Bước 2 — nếu GAT cho kết quả khả quan, tiếp tục thử H2GCN, FAGCN, MixHop.

**Tính khả thi:** GAT có sẵn trong PyTorch Geometric, 2 dòng import. GCN_C là module hoàn toàn độc lập trong codebase — thay thế không ảnh hưởng GCN_S hay GFlowNet. Và điểm quan trọng: ngay cả nếu GAT không cải thiện được, kết quả đó tự nó đã là đóng góp mới — một đánh giá có kiểm soát về giới hạn của hướng này."

---

## SLIDE 25 — Giai Đoạn 2: Tổng Quan & Dữ Liệu *(~60 giây)*

"Chuyển sang phần cuối — kế hoạch cụ thể cho giai đoạn 2.

Giai đoạn 2 sẽ áp dụng GRAPES vào bài toán gợi ý, với bộ dữ liệu **Amazon Reviews 2023** từ McAuley Lab, UCSD. Đây là dataset quy mô thực tế: 10 đến 23 triệu user, 1,6 đến 7,2 triệu item, 29 đến 66 triệu tương tác tùy danh mục.

Em chọn 3 danh mục để so sánh đặc điểm: **Books** — thưa, dữ liệu văn bản phong phú; **Clothing** — phân phối long-tail điển hình; **Electronics** — tương tác dày, bậc đỉnh cao hơn nhiều.

Về kiến trúc: **GCN_S và GFlowNet giữ nguyên hoàn toàn** — đây là phần cốt lõi không cần thay đổi. Chỉ thích nghi 3 thành phần: đầu vào chuyển sang đồ thị hai phía; GCN_C thay bằng BPR Loss; metric chuyển sang Recall@K và NDCG@K."

---

## SLIDE 26 — Luồng Dữ Liệu Chi Tiết *(~90 giây)*

"Slide này trình bày toàn bộ pipeline từ dữ liệu thô đến bước đánh giá.

**Bước 1 — Tiền xử lý:** 5-core filter giữ lại các user và item có ít nhất 5 tương tác. Chia theo timestamp: 80% train, 10% validation, 10% test — để tránh data leakage theo thời gian.

**Bước 2 — Đồ thị hai phía:** Xây dựng G = (U ∪ I, E) — đỉnh là user và item, cạnh là tương tác rating thực tế.

**Bước 3 — Mini-batch:** Lấy batch 512 user, xác định lân cận L-hop, hình thành tập ứng viên C.

**Bước 4 — GCN_S:** 2 tầng GCN tính xác suất p_v cho từng đỉnh trong C.

**Bước 5 — Gumbel Top-k:** Chọn k đỉnh quan trọng nhất — nhiễu Gumbel cho phép gradient truyền ngược qua bước rời rạc này.

**Bước 6 — GCN_C:** Tính tích vô hướng embedding user và item, tối thiểu BPR Loss.

**Bước 7 — GFlowNet feedback:** Reward R = exp(−α·L_BPR) được dùng qua TB Loss để cập nhật trọng số GCN_S — vòng lặp này giúp GCN_S dần học được đỉnh nào cần lấy mẫu để cải thiện gợi ý.

**Bước 8 — Đánh giá:** Recall@K, NDCG@K, Precision@K — so sánh với LightGCN, NGCF, PinSage, Random Sampling."

---

## SLIDE 27 — Roadmap Triển Khai Giai Đoạn 2 *(~45 giây)*

"Và đây là lịch trình triển khai giai đoạn 2 — 6 pha trên tổng khoảng 16 tuần.

**Pha 1** — 2 đến 3 tuần: thu thập và tiền xử lý Amazon Reviews 2023, áp 5-core filter, ID mapping.

**Pha 2** — khoảng 11 ngày: xây dựng đồ thị hai phía user–item, chia theo timestamp.

**Pha 3** — 3 đến 4 tuần — pha tốn thời gian nhất: thích nghi GCN_C thành link predictor với BPR Loss và bipartite embedding.

**Pha 4** — 2 đến 3 tuần: thiết kế reward R = exp(−α·L_BPR), theo dõi hội tụ TB Loss.

**Pha 5** — 2 đến 3 tuần: chạy các baseline LightGCN, NGCF, PinSage, Random Sampling.

**Pha 6** — 3 đến 4 tuần: đánh giá Recall@K và NDCG@K, phân tích chi phí bộ nhớ và thời gian, viết báo cáo tổng kết.

Tổng dự kiến: 3,5 đến 4 tháng."

---

## SLIDE 28 — Tổng Kết & Cảm Ơn *(~60 giây)*

"Nhìn lại toàn bộ hai giai đoạn.

**Giai đoạn 1 đã hoàn thành:** Em đã khảo sát 28 công trình từ NeurIPS, ICML, ICLR và TMLR trong giai đoạn 2017 đến 2024. Tái hiện GRAPES trên 12 dataset và xác nhận GRAPES-GFN vượt GRAPES-RL trên 10 trong 12 dataset. Quan trọng hơn — GRAPES chạy không OOM trên ogbn-products 2,4 triệu đỉnh với Tesla T4 15,6GB, trong khi GAS và AS-GCN bị OOM. Đánh đổi thực tế: bộ nhớ tăng 2–3 lần, thời gian tăng 1,4–1,8 lần so với Random.

**Giai đoạn 2** sẽ áp dụng GRAPES vào hệ thống gợi ý trên Amazon Reviews 2023, theo lộ trình 6 pha vừa trình bày, dự kiến 3,5 đến 4 tháng.

---

*[Nhìn thẳng vào hội đồng, nói chậm rãi]*

Em xin cảm ơn Hội đồng đã lắng nghe. Em rất mong nhận được góp ý từ các Thầy Cô để hoàn thiện báo cáo."

---

## Câu hỏi thường gặp & Gợi ý trả lời

**Q: Tại sao dùng GFlowNet mà không phải REINFORCE?**
> GFlowNet có phương sai thấp hơn và khám phá đa dạng hơn trong không gian các tập con. Bài báo so sánh trực tiếp GRAPES-RL (REINFORCE) và GRAPES-GFN — GFN ổn định hơn đặc biệt trên dataset lớn. Đây cũng là lý do bài báo đề xuất GFN như là cải tiến chính so với baseline RL.

**Q: Tại sao GAS vẫn tốt hơn GRAPES ở một số dataset?**
> GAS lưu toàn bộ embedding lịch sử, cho phép GCN nhận thông tin gần bằng full-graph mà không cần sampling thật sự. Điều này cho F1 cao trên dataset đơn giản như Reddit, nhưng chi phí lưu trữ embedding tăng tuyến tính theo số đỉnh — không khả thi khi đồ thị vượt hàng triệu đỉnh hoặc bị giới hạn VRAM.

**Q: Gumbel Top-k hoạt động như thế nào?**
> Ý tưởng là thêm nhiễu Gumbel vào log-xác suất của từng đỉnh, sau đó chọn k phần tử có giá trị cao nhất. Nhiễu Gumbel đóng vai trò làm mượt phép argmax — chuyển từ chọn cứng thành phép toán có gradient. Điều này cho phép backpropagation qua bước chọn tập con rời rạc mà về mặt lý thuyết không có gradient.

**Q: Tại sao snap-patents AS-GCN lại tốt hơn GRAPES?**
> snap-patents là đồ thị patent với cấu trúc đặc biệt — rất thưa và phân phối bậc rất không đều. AS-GCN dùng attention để học trọng số lân cận, phù hợp hơn cho đồ thị dạng này. GRAPES tổng quát hơn nhưng không được tối ưu cho từng loại cấu trúc cụ thể.

**Q: Chi phí bộ nhớ tăng gấp 3 lần — thực tế có dùng được không?**
> Hoàn toàn dùng được. Ngay cả với chi phí gấp 3 lần, GRAPES vẫn chạy được trên ogbn-products 2,4 triệu đỉnh với Tesla T4 15,6GB — GPU phổ thông trên Colab, không phải high-end. Chi phí tăng chủ yếu đến từ GCN_S — một GCN tiêu chuẩn, không quá nặng. Vấn đề không phải GRAPES đắt mà là các phương pháp khác như AS-GCN còn đắt hơn và bị OOM trước.

**Q: Tại sao chọn Amazon Reviews 2023 mà không phải dataset khác?**
> Ba lý do: quy mô thực tế (10–23 triệu user), metadata đầy đủ và đã được preprocessing tốt, và đây là chuẩn benchmark phổ biến nhất trong cộng đồng GNN recommendation từ 2023–2024 — dễ so sánh với các công trình liên quan.
