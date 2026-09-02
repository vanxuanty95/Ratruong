# Bối cảnh dự án luận văn Thạc sĩ và quy tắc nghiên cứu

> File continuity tiếng Việt được đồng bộ cho dự án luận văn Thạc sĩ. Phải đọc file này và bản tiếng Anh tương ứng vào đầu mỗi session mới. Cập nhật cả hai khi có thay đổi về quyết định nghiên cứu, kết quả đã kiểm chứng, câu hỏi mở hoặc quy tắc làm việc.

**Cập nhật lần cuối:** 2026-08-30
**Revision:** 21 — Reset cấu trúc nghiên cứu theo gate-driven
**Ngôn ngữ trao đổi với người dùng:** mặc định là tiếng Việt  
**Ngôn ngữ làm việc phân tích:** tiếng Anh  
**Ngôn ngữ artifact lâu dài:** Mọi output có nội dung ngôn ngữ phải có một bản tiếng Anh và một bản tiếng Việt được đồng bộ. Filename tiếng Anh kết thúc bằng `_en`, filename tiếng Việt kết thúc bằng `_vn`, đặt ngay trước phần mở rộng.

## Liên kết đến các artifact đang hiệu lực

- **Kế hoạch nghiên cứu Phase 2:** [`00_project/PHASE2_RESEARCH_PLAN_vn.md`](./00_project/PHASE2_RESEARCH_PLAN_vn.md) và bản tiếng Anh đồng bộ. Đây là nguồn duy nhất cho tiến độ 12 tuần, các gate và dependency.
- **Danh mục dataset và protocol candidate:** [`00_project/DATASET_PORTFOLIO_AND_ANALYSIS_PROTOCOL_vn.md`](./00_project/DATASET_PORTFOLIO_AND_ANALYSIS_PROTOCOL_vn.md).
- **Thesis report tích lũy:** [`04_thesis/THESIS_REPORT_vn.md`](./04_thesis/THESIS_REPORT_vn.md).
- **Slide bảo vệ tích lũy:** [`05_slides/THESIS_PRESENTATION_vn.pptx`](./05_slides/THESIS_PRESENTATION_vn.pptx).
- **Source chạy được và hướng dẫn Colab:** [`06_code/README_vn.md`](./06_code/README_vn.md).
- **Briefing hiện tại cho giảng viên:** [`03_reports/REPORT_TEACHER_vn.md`](./03_reports/REPORT_TEACHER_vn.md).

File continuity này ghi quy tắc, evidence boundary và thay đổi theo ngày. File chỉ được trỏ đến, không sao chép lại kế hoạch nghiên cứu đang hiệu lực.

## 1. Định danh dự án và bản đồ các phase

Dự án là luận văn Thạc sĩ Khoa học máy tính.

- `/Users/tyvan/Documents/Master/ThucTap2` là **Phase 1**. Folder này chứa nghiên cứu đã nộp, phần triển khai, tái lập, tài liệu thuyết trình và ghi chú hỗ trợ.
- `/Users/tyvan/Documents/Master/Do An` là **Phase 2**. Đây là vùng làm việc cho nghiên cứu luận văn chính thức, gồm kế hoạch nghiên cứu, thí nghiệm, báo cáo, slide, dataset hoặc artifact dẫn xuất và hai file continuity được đồng bộ.
- Bản thuyết trình chính thức của Phase 1 là:
  [`GRAPES_Presentation_v2.pptx`](</Users/tyvan/Documents/Master/ThucTap2/GRAPES report/GRAPES_Presentation_v2.pptx>)
- `ThucTap2` là vùng tham khảo chỉ đọc trong quá trình cộng tác này. Mọi deliverable lâu dài mới hoặc được sửa phải nằm trong `Do An`.
- Có thể tạo bản sao xử lý tạm trong thư mục tạm được cho phép. Chúng không phải project record và nên được xóa khi không còn cần. Chúng không bao giờ được thay thế artifact lâu dài trong `Do An`.

Quan hệ tổng quát:

```text
Phase 1: khám phá đề tài cùng nghiên cứu/tái lập GRAPES cho node classification
        ↓
Phase 2: nghiên cứu luận văn chính thức — phát triển phương pháp lấy mẫu đồ thị cho hệ gợi ý quy mô lớn dùng GNN
        ↓
Luận văn Thạc sĩ: phát triển phương pháp, thí nghiệm và kết luận dựa trên bằng chứng
```

Tên đề tài luận văn làm việc do người dùng xác định là **“Phát triển phương pháp lấy mẫu đồ thị cho hệ thống gợi ý quy mô lớn sử dụng mạng nơ-ron đồ thị GNN.”** Phase 1 là khám phá đề tài và nền tảng lịch sử; nó không phải là một chapter hay claim tiếp nối trong luận văn cuối cùng. GRAPES là nền tảng khoa học và reference implementation mà các ý tưởng có thể được kiểm thử, mở rộng, sửa đổi hoặc loại bỏ bằng bằng chứng. Nó không phải tên, implementation đã cố định hay đóng góp duy nhất của phương pháp Phase 2.

## 2. Tóm tắt Phase 1

### 2.1 Bối cảnh và động lực nghiên cứu

Bản thuyết trình Phase 1 bắt đầu từ recommender system quy mô lớn. Interaction user–item có thể biểu diễn thành đồ thị, và GNN có thể khai thác thông tin quan hệ nhiều hop thông qua message passing. Học trên đồ thị quy mô công nghiệp gây ra vấn đề scalability: một GNN `L` layer có thể cần thông tin từ neighborhood `L`-hop ngày càng mở rộng cho mỗi target node.

Bản thuyết trình dùng xấp xỉ `O(d̄^L)` để minh họa trực giác về **neighbor explosion**. Đây là lập luận worst-case hoặc minh họa hữu ích, không phải định luật complexity áp dụng phổ quát: chi phí thực tế còn phụ thuộc degree heterogeneity, neighborhood overlap, graph density, caching, implementation và sampling strategy.

Bản trình bày phân biệt neighbor explosion với hai khó khăn khác của GNN—oversmoothing và oversquashing—và chủ ý tập trung Phase 1 vào neighbor explosion như bottleneck về scalability.

**Bằng chứng nguồn:** bản slide chính thức, slide 3–8.

### 2.2 Câu hỏi nghiên cứu

Câu hỏi nghiên cứu Phase 1 là:

> Liệu một policy lấy mẫu node được học, thích nghi theo graph và task, có thể giảm memory cost khi huấn luyện GNN mà vẫn duy trì downstream prediction quality, thay vì chỉ dựa vào static sampling heuristic hay không?

Phạm vi Phase 1 là **node classification** trên graph lớn. Recommendation và link prediction là động lực và hướng tương lai, không phải công việc đã hoàn thành trong Phase 1.

**Bằng chứng nguồn:** bản slide chính thức, slide 11; paper GRAPES chính trong Mục 8.

### 2.3 Các nhóm phương pháp được khảo sát

Bản trình bày chia các scalable-GNN approach thành ba nhóm lớn:

1. **Sampling:** chọn một số lượng node hoặc subgraph giới hạn trong mỗi iteration. Ví dụ: GraphSAGE, PinSage, VR-GCN, FastGCN, AS-GCN, LADIES, ClusterGCN và GraphSAINT.
2. **Decoupling:** precompute graph propagation và huấn luyện predictor riêng, giảm message passing lặp lại nhưng thay đổi model structure.
3. **Historical embeddings:** tái sử dụng embedding từ iteration trước để giảm computation graph, như GNNAutoScale/GAS.

Động lực được nêu cho việc chọn GRAPES là phương pháp này học task-oriented sampling policy thay vì cố định policy từ trước. Cần mô tả chính xác: literature đã có các phương pháp liên quan đến adaptive hoặc learnable sampling, vì vậy điểm khác biệt có thể bảo vệ là cách GRAPES tối ưu task-relevant sampling bằng GNN thứ hai và GFlowNet, không phải tuyên bố mọi công trình trước đó đều non-adaptive.

**Bằng chứng nguồn:** bản slide chính thức, slide 9–12.  
**Điều kiện khoa học:** so sánh với paper gốc thay vì lặp lại tuyên bố rộng “chưa có learned policy trước đó”.

### 2.4 Phương pháp GRAPES như được trình bày

GRAPES là phương pháp đã có được nghiên cứu trong Phase 1; Phase 1 không tuyên bố phát minh phương pháp này.

Pipeline tổng quát:

1. Bắt đầu với target mini-batch `V⁰`.
2. Sampler GNN, ký hiệu `GCN_S`, ước tính sampling probability cho candidate neighboring node.
3. Gumbel Top-k chọn chính xác `k` node không hoàn lại cho layer tiếp theo. Bản thân Top-k operation không cung cấp functional gradient. Vì vậy GRAPES huấn luyện sampling policy bằng REINFORCE hoặc GFlowNet thay vì đạo hàm trực tiếp qua Top-k.
4. Classifier GNN, ký hiệu `GCN_C`, chạy trên computation graph đã lấy mẫu và tạo downstream node-classification loss.
5. GFlowNet dùng task feedback để học distribution trên các sampled subgraph hữu ích. Classifier loss định nghĩa reward tỷ lệ với `exp(−α L_C)`, và biến thể GRAPES-GFN dùng Trajectory Balance objective. Reward scaling và off-policy assumption chính xác phải được gắn với phiên bản paper được dùng.
6. Sampling được áp dụng theo từng layer. Trong GRAPES arXiv v3, `K⁰ = V⁰` và `Kˡ = Vˡ ∪ V⁰`; `Vˡ` chứa chính xác `k` node lấy mẫu từ candidate neighborhood của `Kˡ⁻¹`. Đây không phải cumulative union `V⁰ ∪ V¹ ∪ … ∪ Vˡ` được gợi ý bởi graphic đơn giản hóa trong slide.
7. Classifier dùng adjacency phụ thuộc layer giữa `Kˡ` và `Kˡ⁻¹`. Sampled adjacency thay đổi theo layer, và message passing là bất đối xứng dưới formulation này; không nên mô tả nó như một flat subgraph duy nhất.

Khác biệt khái niệm cốt lõi là **learned adaptive node sampling**. GRAPES không trực tiếp giải quyết mọi vấn đề memory trong graph: nó lấy mẫu node, và graph hai phía dense hoặc degree cao vẫn cần phân tích edge và memory budget tường minh.

**Bằng chứng nguồn:** bản slide chính thức, slide 13–16; GRAPES arXiv:2310.03399v3, Mục 3–4 và Algorithm 1, được liệt kê trong Mục 8.

### 2.5 Thiết lập thực nghiệm Phase 1

Bản thuyết trình báo cáo hai luồng bằng chứng liên quan.

**Kết quả benchmark gốc trong slide**

- 12 dataset: 7 được mô tả là homophily dataset và 5 là heterophily dataset.
- Nhóm homophily: Cora, CiteSeer, PubMed, Reddit, ogbn-arxiv, ogbn-products và DBLP.
- Nhóm heterophily: Flickr, snap-patents, Yelp, ogbn-proteins và BlogCat.
- Batch size: 256 node.
- Samples: 256 node trên mỗi layer.
- Số run: 10, tóm tắt bằng mean ± standard deviation.
- Hardware được slide nêu cho nghiên cứu gốc: NVIDIA RTX A6000, 48 GB.
- Evaluation: full-graph inference trên test set.
- Metric: macro-F1 và micro-F1 được nêu trong experimental setup; bảng kết quả nhìn thấy báo cáo giá trị F1.

**Tái lập độc lập trong slide**

- Google Colab với Tesla T4 15.6 GB VRAM.
- PyTorch 2.11 và PyTorch Geometric 2.7 được nêu.
- Bốn dataset: Cora, CiteSeer, ogbn-arxiv và ogbn-products.
- Ba run trên mỗi dataset được nêu.
- Run lớn trên ogbn-products được báo cáo hoàn thành 9/10 epoch mà không bị out-of-memory.

**Bằng chứng nguồn:** bản slide chính thức, slide 17 và 20. Phụ lục thực nghiệm của GRAPES arXiv v3 hiện tại báo cáo công việc trên RTX A4000 16 GB, A100 40 GB và RTX A6000 48 GB, mỗi máy có 48 CPU; paper không ánh xạ mọi kết quả hiển thị tới một máy cụ thể. Optimizer setting, learning rate, layer count, reward coefficient, epoch schedule và data split chính xác phải lấy từ versioned primary paper hoặc raw run configuration, không được suy ra từ slide.

### 2.6 Kết quả được báo cáo trong slide

Cách diễn giải an toàn các bảng nhìn thấy:

- GRAPES không phải phương pháp thắng tuyệt đối trên homophily dataset. Thứ hạng tương đối phụ thuộc dataset và baseline.
- Trên heterophily dataset, một biến thể GRAPES được đánh dấu là sampling method tốt nhất trên 4/5 dataset trong slide; AS-GCN được đánh dấu tốt nhất trên snap-patents.
- GAS có absolute score cao trên Flickr nhưng có storage cost của historical embedding.
- Bảng reproduction báo cáo so sánh với Random sampling như sau:

| Dataset | GRAPES-GFN | Random | Chênh lệch hoặc trạng thái |
|---|---:|---:|---:|
| Cora | 87.10 ± 0.17 | 86.77 ± 0.38 | +0.33 |
| CiteSeer | 78.57 ± 0.71 | 79.00 ± 0.82 | −0.43 |
| ogbn-arxiv | 62.04 ± 0.31 | 61.28 ± 0.29 | +0.76 |
| ogbn-products | hoàn thành 9/10 epoch | Không báo cáo | Không báo OOM trên 15.6 GB |

- Resource trade-off được báo cáo là dùng khoảng **2.3–3.2× GPU memory** và **1.4–1.8× epoch time** so với Random sampling trong các ví dụ được đo.

**Bằng chứng nguồn:** bản slide chính thức, slide 18–21. Đây là các claim của bản thuyết trình và cần đối chiếu raw log cùng primary paper trước khi dùng làm kết quả cuối của luận văn.

### 2.7 Kết luận và giới hạn Phase 1

Kết luận của slide là learned adaptive sampling có triển vọng cho huấn luyện GNN scalable, đặc biệt khi graph lớn, sampling budget nhỏ và dữ liệu heterophilous hoặc multi-label. Trade-off chính là computation và memory bổ sung cho sampler và GFlowNet.

Các giới hạn được xác định hoặc hàm ý trong slide và hai review độc lập:

- GRAPES thêm GNN thứ hai nên tốn kém hơn Random sampling đơn giản.
- Hành vi GFlowNet có thể phụ thuộc reward design và hyperparameter.
- Task đã chứng minh là node classification; recommendation và link prediction chưa được kiểm chứng thực nghiệm trong Phase 1.
- Node sampling không tương đương direct edge sampling, nên graph degree cao hoặc dense cần phân tích edge và memory riêng.
- Reproduction chỉ là bằng chứng một phần, không phải independent validation đầy đủ: dùng hardware khác, bốn dataset, ba run và một large-graph run dừng ở 9/10 epoch.
- Lập luận `O(d̄^L)` là trực giác/worst-case approximation và không được báo cáo như unconditional complexity theorem.

## 3. Ranh giới Phase 1 và Phase 2

Slide 23–29 là **proposal và roadmap cho Phase 2**, không phải bằng chứng đã hoàn thành trong Phase 1. Chúng tạo động lực cho đề tài nhưng không định nghĩa phương pháp cuối cùng. Các gợi ý Amazon Reviews'23, 5-core, temporal split, BPR, Recall@K, NDCG@K và baseline trong slide vẫn là candidate ingredient cần scientific validation độc lập.

### Điều Phase 2 nên giữ từ Phase 1

- Đo memory và runtime tường minh.
- Baseline mạnh, gồm Random sampling đơn giản và recommender model đã được xác lập khi phù hợp.
- Seed có thể tái lập, software version, hardware detail và raw experiment log.
- Ablation có kiểm soát cho sampling budget, reward design, sampler overhead và model architecture.
- Train/validation/test separation nghiêm ngặt và ngăn leakage, đặc biệt với temporal recommendation data.
- Phân biệt rõ accuracy, scalability, memory và wall-clock cost.

### Điều Phase 2 không được giả định

- GCN, Gumbel Top-k hoặc `exp(−α L_BPR)` đã được kiểm chứng cho recommendation.
- Node sampling tự thân kiểm soát memory trên user–item graph có degree cao.
- 5-core filtering, batch size 512 hoặc proposed Amazon category là tối ưu.
- Thành công trên node classification tự động chuyển sang link prediction hoặc recommendation.
- Direct transfer đã được kiểm chứng hoặc chắc chắn cải thiện recommendation.

Phase 2 là bài toán nghiên cứu phát triển phương pháp thực sự: xác định, biện minh, implement và evaluate một phương pháp lấy mẫu đồ thị cho user–item recommendation graph. Literature review quyết định ý tưởng đã có nào được áp dụng, mở rộng hoặc loại bỏ. Hypothesis không được hỗ trợ và lựa chọn thiết kế thất bại vẫn là negative finding hợp lệ trong cùng đề tài.

## 4. Các cảnh báo bằng chứng cho công việc tương lai

Các điểm này phải luôn hiển thị để tránh lặp lại nhầm như established fact:

1. **“GRAPES-GFN vượt GRAPES-RL trên 10/12 dataset.”** Slide 29 nêu điều này, nhưng claim có trạng thái `CONTRADICTED BY PRIMARY SOURCE v3`. So sánh mean F1 trong Bảng 1–2 của GRAPES arXiv v3, GFN cao hơn trên 6/12 dataset, bằng nhau trên CiteSeer và thấp hơn trên 5/12. Đây là so sánh mean được báo cáo, không phải claim về statistical significance. Chỉ giữ 10/12 như một discrepancy của slide.
2. **So sánh OOM.** Slide có các phát biểu OOM trong những điều kiện thực nghiệm cụ thể. Không khái quát cho mọi hardware, implementation hoặc dataset nếu chưa ghi exact configuration.
3. **Năm thư mục.** Slide ghi GRAPES là “TMLR 2024”. Publication metadata chính hiện liệt kê Transactions on Machine Learning Research vào tháng 5/2025, trong khi arXiv preprint từ năm 2023. Citation trong luận văn phải dùng publication record đã kiểm chứng và giữ preprint identifier khi hữu ích.
4. **Claim adaptive sampling.** Không được nói mọi phương pháp trước đều fixed hoặc non-learned. So sánh GRAPES với adaptive hoặc learnable baseline trong paper chính, gồm AS-GCN, PASS, GNN-BS, SubMix và DSKReG khi phù hợp.
5. **Claim Gumbel Top-k.** Gumbel Top-k lấy chính xác `k` node không hoàn lại nhưng không cung cấp functional gradient qua Top-k. GRAPES dùng REINFORCE hoặc GFlowNet để huấn luyện policy và ghi nhận off-policy mismatch giữa conditioned sampling và distribution trong learning objective.
6. **Ký hiệu sampling set.** Paper chính hiện định nghĩa `K⁰ = V⁰` và `Kˡ = Vˡ ∪ V⁰`, với layer-dependent adjacency giữa `Kˡ` và `Kˡ⁻¹`. Không tái sử dụng cumulative-union simplification từ slide như formal algorithm.
7. **Phiên bản nguồn.** Slide đã nộp có thể phản ánh phiên bản GRAPES cũ hơn. Numerical result và algorithm detail dùng sau này phải ghi source version; nguồn paper hiện đã review là arXiv:2310.03399v3, sửa ngày 2025-07-15.
8. **Chi tiết thực nghiệm thiếu.** Nếu number, setting hoặc formula không có trong primary source hay raw experiment record, gắn nhãn `UNKNOWN` hoặc `NEEDS VERIFICATION`; không điền bằng trực giác.

## 5. Quy tắc làm việc cho mọi prompt tương lai

Các quy tắc này là một phần của project specification.

1. **Quy tắc ngôn ngữ và output song ngữ.** Trao đổi với người dùng mặc định bằng tiếng Việt, trong khi analytical reasoning phải thực hiện bằng tiếng Anh. Mọi output lâu dài có nội dung ngôn ngữ—gồm report, paper, slide, Markdown file, table có prose, caption và experiment note—phải được tạo thành cặp tiếng Anh/tiếng Việt đồng bộ. Đặt `_en` ngay trước extension cho bản tiếng Anh và `_vn` ngay trước extension cho bản tiếng Việt; ví dụ `REPORT_en.md` và `REPORT_vn.md`. Hai bản phải có cùng evidence, decision, claim label, structure, table, citation và substantive meaning. Code, raw data, machine-generated log, model checkpoint, environment lockfile, bibliographic database và các file language-neutral hoặc bị ràng buộc bởi tool không cần bản dịch trùng lặp trừ khi được yêu cầu rõ. Nếu format chỉ cho phép một technical filename, tạo paired human-readable documentation thay vì nhân đôi machine artifact.
2. **Quy tắc continuity.** `PROJECT_CONTEXT_AND_RESEARCH_RULES_en.md` là continuity record tiếng Anh chuẩn và `PROJECT_CONTEXT_AND_RESEARCH_RULES_vn.md` là bản tiếng Việt được đồng bộ. Phải đọc cả hai trước và cập nhật sau mọi thay đổi quan trọng của project state, gồm research decision, verified hoặc contradicted claim, unresolved issue, experiment result hoặc next action. Handoff entry được append; current-status section có thể sửa tại chỗ. Nếu task chỉ đọc hoặc không thể ghi, phải nêu rõ update bị hoãn và thực hiện trong session có quyền ghi tiếp theo. System, safety và task-specific restriction có ưu tiên cao hơn quy tắc update này.
3. **Quy tắc bằng chứng khoa học.** Mọi substantive claim trong report, presentation, implementation rationale hoặc discussion phải có bằng chứng phù hợp. Ưu tiên original scientific paper, official dataset documentation, official benchmark hoặc raw experiment record. Dùng paper gần đây và liên quan trực tiếp khi có thể.
4. **Quy tắc không bịa đặt.** Không được bịa data, citation, author, year, equation, hyperparameter, experimental outcome hoặc explanation. Nếu không chắc, dừng và kiểm chứng; nếu chưa thể kiểm chứng, gắn `UNKNOWN`, `NEEDS VERIFICATION` hoặc `PROPOSED`.
5. **Quy tắc thảo luận multi-agent.** Với mọi prompt nghiên cứu, viết hoặc thiết kế có nội dung đáng kể, tạo ít nhất hai agent có vai trò độc lập khác nhau. Sau independent pass, chạy cross-critique hoặc rebuttal, rồi main agent phân xử disagreement dựa trên primary source hoặc reproducible evidence. Ghi lại vai trò agent, disagreement quan trọng và lý do quyết định cuối. Nếu không có agent, công khai giới hạn và không finalize high-impact research conclusion như thể đã review multi-agent. Status check thường lệ và file operation thuần cơ học không cần protocol này.
6. **Quy tắc ranh giới phase, tên đề tài và quyền sở hữu phương pháp.** Xem Phase 1 là khám phá đề tài cùng nghiên cứu/tái lập GRAPES cho node classification. Phase 2 là luận văn chính thức, với tên đề tài làm việc do người dùng xác định: **“Phát triển phương pháp lấy mẫu đồ thị cho hệ thống gợi ý quy mô lớn sử dụng mạng nơ-ron đồ thị GNN.”** Phát triển phương pháp luận văn như một đóng góp nghiên cứu thuộc project từ nền tảng đầu tiên, dựa trên literature và controlled experiment. GRAPES là nền tảng, comparator và nguồn candidate mechanism—không phải phương pháp đã cố định để sao chép, không phải tên đề tài và không phải claim rằng Phase 2 chỉ tiếp tục Phase 1. Không đưa ra novelty claim không có bằng chứng; phải nêu rõ component nào được áp dụng, thay đổi, thiết kế mới hoặc loại bỏ và biện minh từng component bằng evidence. Baseline, ablation, literature comparison, failure analysis và task-specific design change là phần bắt buộc của phát triển phương pháp.
7. **Quy tắc workflow của researcher.** Làm việc như một nghiên cứu sinh cẩn thận: định nghĩa vấn đề, review literature, nêu hypothesis, lập controlled experiment, xác lập baseline, theo dõi confounder, phân tích uncertainty, ghi limitation và chỉ sau đó mới kết luận.
8. **Quy tắc tổ chức file.** Giữ mọi nội dung lâu dài mới hoặc được sửa trong `Do An`. Xem `ThucTap2` là tài liệu tham khảo chỉ đọc. File xử lý tạm có thể dùng approved temporary directory nhưng không phải project record. Tổ chức output để source data, code, experiment, report, slide và decision có thể truy vết rõ ràng. Áp dụng hậu tố `_en`/`_vn` vào basename ngay trước extension cuối, gồm compound format khi phù hợp, và không để output có nội dung ngôn ngữ không hậu tố làm project record duy nhất.
9. **Quy tắc briefing cho giảng viên.** Duy trì `03_reports/REPORT_TEACHER_en.md` và `03_reports/REPORT_TEACHER_vn.md` như một briefing hiện tại, song ngữ và đồng bộ cho giảng viên—không phải chuỗi báo cáo theo tuần riêng biệt. Cập nhật trước buổi gặp giảng viên hoặc khi evidence thay đổi đáng kể. Briefing phải trình bày mục tiêu luận văn hiện tại, tiến độ gắn evidence, quyết định, rủi ro mở, câu hỏi ưu tiên, next action và oral update ngắn. Dated decision log có thể giữ provenance, nhưng section theo tuần không được thay thế hoặc làm phân mảnh narrative tích lũy của luận văn. Phân biệt artifact đã ghi với công việc đã implement, executed hoặc validated. Claim chỉ được chuyển qua `planned -> specified -> implemented -> executed -> validated` khi có evidence tương ứng.
10. **Quy tắc deliverable luận văn tích lũy.** Project có ba living output bắt buộc: (a) một thesis report nộp trường tích lũy, (b) một slide deck trình bày/bảo vệ tích lũy và (c) source code chạy được từ clean Google Colab runtime. Duy trì report và slide thành các cặp artifact tiếng Anh/tiếng Việt đồng bộ trong `04_thesis` và `05_slides`; chúng được hoàn thiện liên tục hướng tới luận văn cuối cùng, không được tạo lại hoặc đặt tên theo tuần. Không dùng số tuần trong title, primary narrative, filename hoặc slide footer của các deliverable này. Công việc theo tuần chỉ tạo evidence đã kiểm chứng để tích hợp vào cùng report và deck đang sống. Giữ một technical source language-neutral trong `06_code`, kèm README hoặc tài liệu vận hành thành cặp `_en`/`_vn`. Colab code package cuối cùng phải cài được từ dependency/environment lock đã pin, dùng data manifest và configuration manifest có version, cung cấp command cùng test deterministic, hỗ trợ checkpoint/resume khi phù hợp và tái lập mọi executable claim của luận văn từ clean runtime. Sau mọi thảo luận quan trọng, quyết định, sửa nguồn, thay đổi implementation, experiment hoặc phản hồi của giảng viên, phải đánh giá ảnh hưởng tới cả ba output và cập nhật mọi artifact bị ảnh hưởng trong cùng task. Nếu chưa thể cập nhật, phải ghi chính xác artifact bị hoãn, lý do, evidence gap và next action vào cả hai continuity file. Giữ methods/results/limitations trong report, summary trong slide và code/configuration/test nhất quán với nhau; không nâng artifact vượt quá evidence maturity `planned -> specified -> implemented -> executed -> validated`.

### 5.1 Nhãn bằng chứng

Dùng các nhãn sau cho research statement có hệ quả:

- `VERIFIED FACT`: được hỗ trợ trực tiếp bởi versioned primary source, official documentation hoặc raw result có thể tái lập.
- `INFERENCE`: diễn giải có lý dựa trên evidence đã nêu; liệt kê evidence và assumption.
- `HYPOTHESIS`: kỳ vọng có thể kiểm chứng nhưng vẫn cần experiment hoặc analysis.
- `PROPOSAL`: method, dataset, metric hoặc plan ứng viên chưa được chọn hay kiểm chứng.
- `UNKNOWN`: thông tin hiện chưa có.
- `NEEDS VERIFICATION`: claim cụ thể đáng lẽ có evidence nhưng chưa được kiểm tra.
- `CONTRADICTED`: claim xung đột với evidence mạnh hơn hoặc mới hơn; giữ discrepancy và dẫn cả hai nguồn.

### 5.2 Verification register

Chỉ theo dõi claim chưa giải quyết có thể ảnh hưởng đáng kể đến luận văn.

| ID | Claim hoặc vấn đề | Trạng thái | Bằng chứng cần có | Hành động tiếp theo |
|---|---|---|---|---|
| V-001 | Claim trong slide: GRAPES-GFN vượt GRAPES-RL trên 10/12 dataset | `CONTRADICTED` | GRAPES v3 Bảng 1–2 và raw result file nếu cần | Không lặp lại như kết quả; giữ làm discrepancy của slide |
| V-002 | Giá trị reproduction và resource ratio Phase 1 đầy đủ và có thể tái lập | `NEEDS VERIFICATION` | Raw log, seed, config, run completion status và measurement code | Tìm và audit raw artifact Phase 1 trước khi tái sử dụng số liệu trong luận văn |
| V-003 | Exact Amazon Reviews'23 release, category và post-filter count cho Phase 2 | `PARTIAL: ĐÃ EXECUTE TEMPORARY RAW AUDIT; POST-FILTER CHƯA BIẾT` | Persistent acquisition manifest/checksum, protocol decision và preprocessing output | Chạy lại trên Colab, giải quyết OOV/split policy và đóng Gate G2 |
| V-004 | Constraint về thể chế, thời gian, compute, storage và success của Phase 2 | `ĐÃ GIẢI QUYẾT MỘT PHẦN` | Yêu cầu từ người dùng/giảng viên cùng hạ tầng đo được | Đã biết khung 12 tuần, Python, Amazon, Colab và kỳ vọng cao; thu thập chi tiết giảng viên/template còn lại |
| V-005 | Phương pháp lấy mẫu đồ thị do project phát triển có scientific contribution được giới hạn chính xác | `NEEDS VERIFICATION` | Closest-work matrix bao phủ graph type, sampler, recommendation task, loss/reward, dataset và evaluation protocol | Xác định method component và hoàn thành closest-work review trước novelty claim |
| V-006 | Exact Git commit được dùng trong Phase 1 reproduction | `UNKNOWN; KHÔNG THỂ KHÔI PHỤC TỪ ARTIFACT HIỆN CÓ` | Clone metadata gốc, thư mục `.git` hoặc commit record cùng thời điểm | Giữ local content fingerprint và không bao giờ trình bày current official pin như Phase 1 commit |
| V-007 | Cách diễn giải đúng cho Phase 2 đối với sai khác paper/code về dấu REINFORCE, `log Z` conditioning và hướng sampled block | `ĐÃ GIẢI QUYẾT QUYẾT ĐỊNH; ĐÃ ĐĂNG KÝ ORACLE` | Written gradient/message-passing oracle theo các quyết định đã khóa | Implement T12, T18 và T19 trước learned-policy implementation |
| V-008 | Software/GPU environment có thể chạy cho Phase 2 và experiment capacity | `PROPOSED; AVAILABILITY CHƯA BIẾT` | Environment được lock version, fixed borrowed GPU, measured pilot runtime và persistent cloud location | Yêu cầu một A100 80 GB cố định; dùng Colab cho development; freeze version và compute sau xác nhận/profiling |

## 6. Workflow nghiên cứu chuẩn cho Phase 2

Trừ khi quyết định sau thay đổi rõ, dùng thứ tự sau:

1. Đọc hai file continuity và xác định open question hiện tại.
2. Định nghĩa một primary research question và một số ít testable hypothesis.
3. Thực hiện targeted literature review bằng primary paper và ghi evidence matrix trong `Do An`.
4. Audit candidate data, graph construction, label/interaction, temporal split, negative sampling và leakage risk.
5. Implement hoặc verify baseline đơn giản trước khi thêm adaptive sampling.
6. Định nghĩa trước resource metric: peak GPU memory, wall-clock time, throughput, số sampled node/edge và task quality.
7. Implement proposed method như controlled change, có ablation và fixed seed.
8. Chạy repeated experiment, giữ raw output, báo uncertainty và điều tra failure thay vì che giấu.
9. So sánh result với hypothesis và strongest justified baseline.
10. Cập nhật cả hai file continuity với decision, evidence, limitation và next step trước khi kết thúc session.

## 7. Trạng thái hiện tại và câu hỏi mở

### Đã hoàn thành hoặc xác lập

- Đã tìm và review official Phase 1 deck gồm 29 slide.
- Đã render và kiểm tra trực quan slide từ bản sao tạm; source file trong `ThucTap2` không bị sửa.
- Đã hoàn thành và hòa giải hai independent agent review.
- Xác định Phase 1 là nghiên cứu/tái lập GRAPES, tập trung scalable GNN node classification.
- Đề tài luận văn là phát triển phương pháp lấy mẫu đồ thị cho hệ gợi ý quy mô lớn dùng GNN. Đây là luận văn Phase 2 độc lập, không phải chapter tiếp nối của Phase 1.
- Hai scope/governance review độc lập và một vòng cross-critique xác nhận GRAPES chỉ là nền tảng khoa học, comparator và nguồn candidate mechanism.
- Các file `PHASE2_DIRECTION_REVIEW_*` cũ và scope lock direct-adaptation là historical record, được supersede làm phạm vi chuẩn bởi quyết định Revision 16 này.
- Path GRAPES sampler + LightGCN-style recommender + BPR + RL/GFlowNet hiện tại là `GRAPES-INFORMED REFERENCE DESIGN`, không phải phương pháp bắt buộc hoặc cuối cùng của luận văn. D1–D11 và T01–T25 là candidate cho reference design/verification, chờ chọn phương pháp.
- Nghiên cứu vẫn tập trung vào graph sampling cho large-scale GNN recommendation; component choice, baseline, ablation và method revision do literature, data constraint và experimental evidence quyết định.
- Nếu một candidate design thất bại, project ghi kết quả cùng phân tích trong cùng đề tài; không âm thầm claim transfer, effectiveness hoặc novelty.
- Week 1 đã bắt đầu. Ngữ nghĩa paper GRAPES được pin vào arXiv:2310.03399v3 và current official code reference được pin vào commit `71ecebeaac896800aa4dd1d0f38c57ec222ef396`, truy cập ngày 2026-08-26.
- Exact Phase 1 code commit không thể khôi phục từ artifact hiện có; unversioned local snapshot chỉ được giữ bằng content-manifest fingerprint đã ghi và không phải nguồn chuẩn của Phase 2.
- Các artifact song ngữ về constraint, source version, literature matrix và bản nháp recommendation specification hiện đã có trong `00_project`, `01_literature` và `02_protocol`.
- Recommendation specification đánh dấu D1–D11 là `REFERENCE-SPECIFIED` cho GRAPES-informed reference design. Các quyết định này không chọn hoặc đóng phương pháp luận văn.
- G1 chuẩn đang `IN_PROGRESS` cho closest-work positioning, rationale thiết kế nghiên cứu, matched comparison và quy tắc chọn phương pháp đăng ký trước. Environment execution được theo dõi riêng bằng E0-MIN/E0-FINAL.
- Máy local hiện tại là Mac mini Apple M4 với 16 GB unified memory và không có NVIDIA CUDA device. Máy phù hợp cho documentation và toy correctness test sau khi tạo environment, nhưng không được xem là final benchmark platform.
- Các execution constraint do người dùng cung cấp đã được ghi: 12 tuần, implementation bằng Python, dữ liệu Amazon Reviews do project tự source, có thể mượn GPU, có Google Colab và kỳ vọng chất lượng luận văn cao.
- Active data proposal chỉ dùng Amazon: `All_Beauty` 0-core validate pipeline và `Baby_Products` 0-core là proposed primary thesis category. MovieLens được loại khỏi active plan.
- Colab loại local disk capacity khỏi feasibility gate và hỗ trợ development run, nhưng temporary Colab VM không phải nguồn chuẩn cho final runtime/memory comparison.
- Yêu cầu final hardware chuẩn là một A100 80 GB cố định; GPU thứ hai là optional seed-parallel capacity. Exact access và measured GPU-hours vẫn còn mở.
- Supervisor briefing song ngữ hiện đã có tại `03_reports/REPORT_TEACHER_en.md` và `03_reports/REPORT_TEACHER_vn.md`; đây là supporting record hiện tại, không phải deliverable luận văn theo tuần.
- Ba living output bắt buộc của luận văn hiện đã được khóa: report nộp trường, slide trình bày/bảo vệ và source code chạy được trên Google Colab. Các output này phải phát triển xuyên suốt project và đồng bộ với project state đã được kiểm chứng thay vì chỉ được lắp ráp ở cuối.
- Audit deliverable Tuần 1 ban đầu xác nhận `04_thesis`, `05_slides` và `06_code` chưa tồn tại. Evidence khi đó đủ để khởi tạo report và working slide deck ở mức scope/background/method design/evaluation plan. Tại thời điểm audit, code mới chỉ semantic-contract ready.
- Các deliverable luận văn tích lũy đã được khởi tạo: bilingual working thesis report trong `04_thesis`, bilingual PowerPoint deck trong `05_slides` và Python/Colab scaffold có tài liệu song ngữ trong `06_code`. Scaffold pass 10/10 pure-Python toy contract test tại local; điều này không phải validation của phương pháp Phase 2 cuối cùng, Amazon pipeline, full oracle suite hoặc benchmark.
- Cả hai presentation deck đã được render và pass overflow check. Speaker notes của deck có các block `[Sources]`. Đây là working artifact có evidence boundary và phải được cập nhật khi implementation hoặc experiment evidence làm thay đổi narrative.
- Dataset audit Week 2 đã chuyển từ setup sang temporary local raw execution. `All_Beauty` và `Baby_Products` được download từ exact official URL; compressed size, SHA-256, raw schema, quality count, degree summary, candidate absolute-split OOV diagnostic và negative-pool diagnostic đã ghi trong `06_code/docs/DATASET_AUDIT_RESULTS_*`. Raw file không được lưu persistent.
- Local audit cho 693,929 valid `All_Beauty` row với zero exact duplicate pair, và 5,953,891 parsed `Baby_Products` row với một `rating=0.0` ngoài range; duplicate-pair count quy mô lớn của Baby vẫn unknown vì SQLite scan chưa hoàn tất. Official absolute split có validation/test OOV cao nên chưa được chấp nhận làm primary warm-start protocol.
- Streaming analyzer dependency-free và paired Colab notebook hiện cover provenance, SHA-256, schema, duplicate pair, rating/timestamp check, degree summary, candidate absolute-split coverage và negative-pool diagnostic. Persistent Colab acquisition, protocol closure và post-filter training-universe statistic vẫn mở.
- Định danh, trạng thái, dependency và blocking rule của gate chỉ do cặp kế hoạch chuẩn quản trị. Các constraint/source/spec record đang hoạt động nay trỏ về registry đó; dated historical log vẫn được giữ làm bằng chứng lịch sử.

### Câu hỏi mở trong hướng Phase 2 đã khóa

- Các executable test T01–T25 có tái hiện mọi semantic oracle đã khóa, đặc biệt là prefix-depth propagation, `log Z` conditioning và two-action RL gradient hay không?
- Shared embedding width, sampler learning rate, `k`, `alpha` và batch size nào vượt qua resource/validation protocol Tuần 3 mà không tune riêng sampler trên test?
- Exact version và post-filter statistic nào của Amazon Reviews'23 sẽ được dùng nếu chọn?
- Negative-sampling và temporal-evaluation protocol nào có cơ sở khoa học?
- Exact Python/PyTorch/PyG/CUDA lock nào tương thích với cả Colab development và final GPU đã xác nhận?
- Giá trị reproduction và resource measurement Phase 1 nào có thể truy về complete raw log, config, seed và finished run?

### Constraint Phase 2 vẫn còn mở

- Exact calendar date nộp/bảo vệ trong khung 12 tuần: `UNKNOWN`.
- Supervisor milestone, meeting cadence và formal novelty/evaluation rubric: `UNKNOWN`.
- Exact borrowed GPU, exclusive profiling window và measured GPU-hours: `UNKNOWN`; một A100 80 GB cố định là `PROPOSED`.
- Colab tier/compute unit và persistent cloud location/retention policy: `UNKNOWN`; đã biết có Colab và non-local storage capacity.
- Exact Amazon `Baby_Products` artifact hash, access/usage note, split cutoff và post-filter count: `UNKNOWN`.
- Thesis template, length và submission language bắt buộc: `UNKNOWN`; Python chỉ là implementation language đã khóa.
- Cố ý không bịa numerical success threshold. “Kỳ vọng cao” nghĩa là specification/test đầy đủ, controlled baseline, leakage-safe data, uncertainty/resource reporting và clean reproducibility.

Các constraint còn lại không mở lại research direction. Experiment scale chỉ freeze sau Amazon audit và measured pilot Week 3.

### Hành động có thể thực thi tiếp theo

Tiến hành G1 và G2 song song. Với G1, hoàn tất targeted closest-work review và đăng ký trước quy tắc chọn phương pháp, chưa chọn sampler sớm. Với G2, hoàn tất persistent provenance và pre-register interaction, duplicate, split/OOV cùng negative rule. Song song, thỏa E0-MIN. Không bắt đầu G3 trước khi G2 và E0-MIN pass, hoặc G4 trước khi G1–G3 pass.

## 8. Các nguồn tham chiếu khởi đầu

Đây là điểm xuất phát, không thay thế việc kiểm tra exact version và citation metadata trước khi nộp luận văn cuối.

- Younesian, T., Daza, D., van Krieken, E., Thanapalasingam, T., và Bloem, P. “GRAPES: Learning to Sample Graphs for Scalable Graph Neural Networks.” *Transactions on Machine Learning Research*, publication metadata ghi tháng 5/2025. Nguồn paper hiện đã review: [arXiv:2310.03399v3](https://arxiv.org/abs/2310.03399v3), sửa ngày 2025-07-15; publication record: [OpenReview PDF](https://openreview.net/pdf?id=QI0l842vSq).
- Bengio, E., Jain, M., Korablyov, M., Precup, D., và Bengio, Y. “Flow Network based Generative Models for Non-Iterative Diverse Candidate Generation.” NeurIPS 2021; arXiv: [2106.04399](https://arxiv.org/abs/2106.04399).
- Ying, R., He, R., Chen, K., Eksombatchai, P., Hamilton, W. L., và Leskovec, J. “Graph Convolutional Neural Networks for Web-Scale Recommender Systems.” KDD 2018; arXiv: [1806.01973](https://arxiv.org/abs/1806.01973).
- Fey, M., Lenssen, J. E., Weichert, F., và Leskovec, J. “GNNAutoScale: Scalable and Expressive Graph Neural Networks via Historical Embeddings.” ICML 2021; arXiv: [2106.05609](https://arxiv.org/abs/2106.05609).
- Hamilton, W. L., Ying, Z., và Leskovec, J. “Inductive Representation Learning on Large Graphs.” NeurIPS 2017; arXiv: [1706.02216](https://arxiv.org/abs/1706.02216).
- Hu, W. và cộng sự. “Open Graph Benchmark: Datasets for Machine Learning on Graphs.” NeurIPS 2020; arXiv: [2005.00687](https://arxiv.org/abs/2005.00687).
- Hou, Y., Li, J., Fu, X., He, Z., Yan, A., Chen, X., và McAuley, J. “Bridging Language and Items for Retrieval and Recommendation: Benchmarking LLMs as Semantic Encoders.” Paper nguồn cho Amazon Reviews 2023 dataset và BLaIR benchmark. Nguồn hiện đã review: [arXiv:2403.03952v2](https://arxiv.org/abs/2403.03952v2), sửa ngày 2026-04-20; metadata ghi ACL 2026. Phase 2 vẫn phải pin exact dataset release và derived statistic.
- Xu, X. và cộng sự. DSKReG, phương pháp differentiable sampling cho knowledge-graph recommendation. [arXiv:2108.11883](https://arxiv.org/abs/2108.11883). Nguồn này ngăn claim thiếu căn cứ “learned sampler đầu tiên cho recommendation”.
- He, X. và cộng sự. “LightGCN: Simplifying and Powering Graph Convolution Network for Recommendation.” SIGIR 2020; [arXiv:2002.02126](https://arxiv.org/abs/2002.02126).
- Rendle, S., Freudenthaler, C., Gantner, Z., và Schmidt-Thieme, L. “BPR: Bayesian Personalized Ranking from Implicit Feedback.” UAI 2009; [arXiv:1205.2618](https://arxiv.org/abs/1205.2618).
- Evaluation protocol phải tính đến primary evidence về temporal leakage và metric sampling; nguồn khởi đầu là [nghiên cứu data leakage](https://arxiv.org/abs/2010.11060) và [phân tích sampled metric](https://arxiv.org/abs/1912.02263).

Các baseline bổ sung—GCN, GAT, FastGCN, AS-GCN, LADIES, ClusterGCN, GraphSAINT, NGCF, LightGCN và phương pháp liên quan—phải được dẫn từ paper gốc khi xuất hiện trong artifact tương lai.

## 9. Template bàn giao session

Cuối mỗi session có nội dung đáng kể, cập nhật cả hai file bằng:

```text
Date:
Decision or result:
Evidence/source:
Agents consulted, roles, and identifiers:
Independent findings:
Cross-critique and disagreement:
Adjudication and rationale:
Claims added, verified, contradicted, or retired:
What remains uncertain:
Next action:
Files created or changed in Do An:
```

### Handoff ban đầu — 2026-08-25

- **Quyết định hoặc kết quả:** Tạo continuity file tiếng Anh chuẩn sau khi review official Phase 1 deck gồm 29 slide.
- **Bằng chứng/nguồn:** Official deck tại `ThucTap2/GRAPES report/GRAPES_Presentation_v2.pptx`; primary-paper anchor và publication metadata được liên kết trong Mục 8.
- **Agent được tham vấn và consensus/disagreement:** Dùng hai independent review. Họ đồng ý Phase 1 là nghiên cứu/tái lập GRAPES cho scalable node classification và Phase 2 phải được xem là research problem mới. Cả hai đánh dấu claim “10/12” chưa kiểm chứng và cần phân biệt deck claim với primary evidence.
- **Điều còn chưa chắc:** Final Phase 2 research question, reconciliation đầy đủ của raw result, exact bibliographic metadata cho luận văn và data/evaluation protocol cho bất kỳ recommendation extension nào.
- **Hành động tiếp theo:** Thực hiện targeted Phase 2 literature review và so sánh candidate direction trước khi cố định method, dataset hoặc loss.
- **File được tạo hoặc sửa trong Do An:** `PROJECT_CONTEXT_AND_RESEARCH_RULES_en.md` (ban đầu được tạo không hậu tố; sau đó đổi tên theo bilingual-output rule).

### Model-switch audit — 2026-08-25

- **Quyết định hoặc kết quả:** Audit lại continuity file sau khi đổi model và sửa các lỗ hổng factual cùng operational.
- **Bằng chứng/nguồn:** Official Phase 1 deck; GRAPES arXiv:2310.03399v3; Amazon Reviews 2023/BLaIR arXiv:2403.03952v2.
- **Agent được tham vấn, vai trò và ID:** Euler (`01a03973-f323-79d3-89cf-6da7c1c5ef85`) audit continuity, rule và handoff quality. Banach (`01a0397c-e61e-77f3-afa7-c507beb6de52`) audit scientific claim và citation. Socrates (`01a03973-f34d-7290-acd1-a70ffbda2ecd`) được bắt đầu cho scientific review nhưng không trả usable result và đã đóng; không output nào của agent này được dùng.
- **Independent finding:** Euler xác định ambiguity trong language policy, claim-status taxonomy chưa đủ, agent traceability yếu, thiếu Phase 2 constraint và multi-agent discussion protocol chưa hoàn chỉnh. Banach xác định 10/12 summary claim sai, hardware attribution thiếu, Amazon paper title sai, cumulative sampling-set description sai và Gumbel Top-k explanation quá đơn giản.
- **Cross-critique và disagreement:** Hai agent hoàn thành đã review change proposal của nhau. Họ đồng ý về scientific correction, language boundary, lightweight verification register, cross-critique requirement và explicit unknown constraint. Họ cũng đồng ý mandatory checksum, exhaustive temporary-file log và per-prompt changelog entry sẽ làm canonical file phức tạp quá mức.
- **Phân xử và lý do:** Chấp nhận thay đổi ngăn scientific misreporting hoặc mất project state. Từ chối administrative overhead không cải thiện đáng kể research validity hay session continuity.
- **Claim được thêm, verify, contradict hoặc retire:** Đánh dấu deck's 10/12 claim là `CONTRADICTED`; sửa Amazon Reviews 2023 citation; version GRAPES và Amazon source; sửa GRAPES layer-set notation và Gumbel Top-k behavior; tách deck-reported hardware khỏi broader primary-paper hardware record.
- **Điều còn chưa chắc:** Phase 1 raw reproduction traceability; final Phase 2 direction; institutional requirement; deadline; compute, storage và dataset-access constraint; success criteria.
- **Hành động tiếp theo:** Thu thập missing Phase 2 constraint và tạo `PHASE2_DIRECTION_REVIEW_en.md` có source-backed comparison và recommendation.
- **File được tạo hoặc sửa trong Do An:** `PROJECT_CONTEXT_AND_RESEARCH_RULES_en.md` (đổi tên trong bilingual-output update sau đó).

### Handoff lập kế hoạch Phase 2 — 2026-08-25 (`SUPERSEDED`)

- **Quyết định hoặc kết quả:** `SUPERSEDED BY THE LATER USER SCOPE LOCK.` Handoff lịch sử này đề xuất resource-constrained adaptive sampling và empirical fallback. Không hướng nào còn là active Phase 2 direction.
- **Bằng chứng/nguồn:** Primary anchor gồm GRAPES arXiv:2310.03399v3, DSKReG arXiv:2108.11883, LightGCN arXiv:2002.02126, UltraGCN arXiv:2110.15114, SimRec arXiv:2303.08537, PinSage arXiv:1806.01973, recommender leakage study arXiv:2010.11060 và sampled-metric analysis arXiv:1912.02263. Các nguồn hỗ trợ plan nhưng chưa chứng minh novelty; V-005 vẫn mở.
- **Agent được tham vấn, vai trò và ID:** Bernoulli (`01a0398a-5433-7740-8b2c-e7e8bd0f2947`) review độc lập research direction và novelty. Hubble (`01a0398a-54d2-7bb2-afa0-2a8f3ceebad8`) thiết kế độc lập experimental và reproducibility protocol. Mỗi agent sau đó cross-review proposal của agent còn lại.
- **Independent finding:** Cả hai agent từ chối direct GRAPES port làm central novelty và khuyến nghị explicit resource budget, matched-budget sampler baseline, leakage-safe temporal splitting, full-catalog primary evaluation, end-to-end memory/time measurement và early bottleneck gate. Cả hai ủng hộ empirical characterization làm fallback hợp lệ.
- **Cross-critique và disagreement:** Bernoulli cảnh báo temporal modeling sẽ over-scope project, LightGCN một mình không đủ làm sampling-compatible comparator và numerical success threshold không phải scientific constant có căn cứ. Hubble cảnh báo không tối ưu trực tiếp noisy hardware memory/runtime, không thêm typed-path complexity quá sớm và không claim causality từ graph property tương quan ở cấp dataset.
- **Phân xử và lý do:** Temporal information chỉ dùng cho leakage-safe evaluation thay vì temporal policy modeling. Sampled edge là primary controllable proxy; memory/runtime đo được là independent outcome. Baseline plan gồm full-graph LightGCN cộng một validated sampling-compatible mini-batch backbone. Numerical threshold chỉ giữ làm revisable `PROPOSED` engineering gate và không thay thế uncertainty estimate hay Pareto evidence.
- **Claim được thêm, verify, contradict hoặc retire:** Thêm V-005 cho unresolved novelty claim. Ghi recommended direction là `PROPOSAL`, không phải verified contribution. Loại ý tưởng recommendation adaptation tự thân đủ novelty.
- **Điều còn chưa chắc:** Deadline, supervisor criteria, compute/storage/data access, exact dataset release/category, mini-batch backbone, baseline-derived non-inferiority margin và final closest-work novelty judgment.
- **Hành động tiếp theo:** Thu thập constraint và hoàn thành Gate G1 qua `01_literature/LITERATURE_MATRIX_en.csv` cùng bản `_vn` trước khi implement adaptive sampler.
- **File được tạo hoặc sửa trong Do An:** `PHASE2_DIRECTION_REVIEW_en.md`; `PROJECT_CONTEXT_AND_RESEARCH_RULES_en.md`. Bản `_vn` đồng bộ được thêm trong bilingual-output update sau đó.

### Cập nhật quy tắc output song ngữ — 2026-08-25

- **Quyết định hoặc kết quả:** Thay quy tắc artifact chỉ bằng tiếng Anh bằng yêu cầu bắt buộc tạo cặp output tiếng Anh/tiếng Việt đồng bộ. Basename tiếng Anh kết thúc bằng `_en`; basename tiếng Việt kết thúc bằng `_vn`; hậu tố nằm ngay trước extension.
- **Bằng chứng/nguồn:** Chỉ dẫn trực tiếp của người dùng trong session hiện tại.
- **Agent được tham vấn, vai trò và ID:** Không có. Đây là thao tác cơ học về naming, translation và continuity; không thuộc multi-agent research-review rule.
- **Independent finding:** Không áp dụng.
- **Cross-critique và disagreement:** Không áp dụng.
- **Phân xử và lý do:** Bản tiếng Anh giữ vai trò reference chuẩn về terminology và citation, còn bản tiếng Việt là working translation đồng bộ. Language-neutral technical artifact được miễn để tránh nhân đôi code, log, checkpoint và lockfile theo cách không an toàn hoặc không hợp lệ.
- **Claim được thêm, verify, contradict hoặc retire:** Loại quy tắc yêu cầu artifact lâu dài chỉ bằng tiếng Anh. Thêm yêu cầu semantic parity và synchronized update cho output song ngữ.
- **Điều còn chưa chắc:** Trường có yêu cầu ngôn ngữ cụ thể cho luận văn nộp cuối hoặc defense slide hay không.
- **Hành động tiếp theo:** Áp dụng bilingual convention cho mọi language-bearing artifact mới và giữ hai continuity file đồng bộ.
- **File được tạo hoặc sửa trong Do An:** `PROJECT_CONTEXT_AND_RESEARCH_RULES_en.md`; `PROJECT_CONTEXT_AND_RESEARCH_RULES_vn.md`; `PHASE2_DIRECTION_REVIEW_en.md`; `PHASE2_DIRECTION_REVIEW_vn.md`.

### Khóa phạm vi direct GRAPES-to-recommendation — 2026-08-25 (`SUPERSEDED`)

- **Quyết định hoặc kết quả:** Chỉ là scope decision lịch sử. Quyết định này được supersede ngày 2026-08-26 bởi định danh luận văn độc lập do người dùng xác định: phát triển phương pháp lấy mẫu đồ thị cho hệ gợi ý quy mô lớn dùng GNN. GRAPES vẫn là research foundation và reference design, không phải phương pháp luận văn đã cố định.
- **Bằng chứng/nguồn:** Chỉ dẫn trực tiếp của người dùng; GRAPES arXiv:2310.03399v3; BPR arXiv:1205.2618; LightGCN arXiv:2002.02126; DSKReG arXiv:2108.11883; nguồn đánh giá recommender arXiv:2010.11060 và arXiv:1912.02263.
- **Agent được tham vấn, vai trò và ID:** Erdos (`01a039ad-3a63-7542-b87e-c074d3c758ba`) độc lập mapping thành phần GRAPES sang recommendation. Heisenberg (`01a039ad-3a39-73c1-8991-bdc94724a0b0`) độc lập thiết kế experimental protocol cho locked direction. Mỗi agent cross-review proposal của agent còn lại.
- **Independent finding:** Cả hai giữ layer-wise node sampling, Gumbel Top-k, REINFORCE và GFlowNet/Trajectory Balance; cả hai thay target batch, recommender, loss, reward semantic và evaluation bằng formulation BPR-triplet, LightGCN-style, top-K recommendation. Cả hai yêu cầu matched random/static sampling, full-catalog metric, leakage control và negative-result reporting không pivot.
- **Cross-critique và disagreement:** Erdos ban đầu xem xét deterministic sampled inference, còn Heisenberg khuyến nghị deterministic full-graph LightGCN inference làm primary evaluator chung. Review cũng xác định cần tránh arbitrary fixed hyperparameter, kiểm soát positive-edge shortcut, tách sampler embedding khỏi recommender gradient và phân biệt sampled-local với full-graph normalization.
- **Phân xử và lý do:** Primary inference là full-graph và mọi scalability claim giới hạn ở training. Primary sampler input dùng separate sampler ID embedding cộng node type, layer và train-only degree; detached recommender embedding chỉ làm ablation. Primary propagation dùng GRAPES-style sampled-local normalization. Positive edge được giữ trong primary protocol tương thích LightGCN và batch-mask trong sensitivity ablation đăng ký trước. Không numerical improvement threshold hay fixed `k` nào được xem là scientific fact.
- **Claim được thêm, verify, contradict hoặc retire:** Loại active resource-constrained direction, khả năng backbone redesign và empirical fallback. Thêm locked method track: GRAPES sampler + LightGCN-style recommender + BPR signal, với GRAPES-RL-Rec và GRAPES-GFN-Rec. V-005 hiện theo dõi contribution wording chính xác thay vì quyền đổi direction.
- **Điều còn chưa chắc:** Deadline và compute constraint; exact GRAPES code version; exact Amazon category/release; chi tiết sampler embedding design; reward scaling; budget và hyperparameter đã validate.
- **Hành động tiếp theo:** Tạo đồng bộ `GRAPES_RECOMMENDATION_SPEC_en.md` và `GRAPES_RECOMMENDATION_SPEC_vn.md`, pin GRAPES source/code version và freeze BPR-triplet-to-GRAPES mapping tại Gate G1.
- **File được tạo hoặc sửa trong Do An:** `PHASE2_DIRECTION_REVIEW_en.md`; `PHASE2_DIRECTION_REVIEW_vn.md`; `PROJECT_CONTEXT_AND_RESEARCH_RULES_en.md`; `PROJECT_CONTEXT_AND_RESEARCH_RULES_vn.md`.

### Khởi động Week 1 — 2026-08-26

- **Quyết định hoặc kết quả:** Bắt đầu Week 1 và hoàn tất source/provenance audit, local constraint audit, literature matrix ban đầu và bản nháp đặc tả chuyển đổi song ngữ. Gate G1 vẫn `MỞ`; chưa cho phép implementation từ ngữ nghĩa chưa được giải quyết.
- **Bằng chứng/nguồn:** GRAPES arXiv:2310.03399v3; official repository commit `71ecebeaac896800aa4dd1d0f38c57ec222ef396`, được resolve ngày 2026-08-26; local Phase 1 snapshot, notebook, paper PDF, config và result file; các paper gốc BPR, LightGCN, PinSage, DSKReG, leakage và sampled metric được ghi trong literature matrix.
- **Agent được tham vấn, vai trò và ID:** Ohm (`01a039bd-31b9-7132-935a-2563c9515858`) audit độc lập Phase 1 code provenance, environment, config đã chạy và khác biệt giữa local/official code. Curie (`01a039bd-3187-7280-b60e-d29374919e67`) audit độc lập semantic mapping từ GRAPES sang BPR/LightGCN, invariant, quyết định Gate G1 và nghĩa vụ unit test. Sau đó mỗi agent cross-review kết quả của agent còn lại.
- **Independent finding:** Ohm phát hiện Phase 1 clone public repository mà không ghi ref, patch local file, không giữ `.git` metadata, chạy GFN và Random nhưng không chạy RL, đồng thời dùng Colab environment khác repository manifest. Curie định nghĩa ordered-triplet/endpoint mapping, full-Bernoulli probability accounting, trajectory state, parameter ownership, ranh giới LightGCN, mười một decision point và 25 test bắt buộc.
- **Cross-critique và disagreement:** Ohm tách các quyết định đã được paper/code hỗ trợ khỏi recommendation-specific unresolved choice và xác định mâu thuẫn trực tiếp về dấu REINFORCE, `log Z` conditioning cùng sampled-evaluation orientation. Curie xác nhận current official commit có thể làm Phase 2 reference nhưng không thể gán ngược cho Phase 1; các thành phần đặc thù recommendation phải được reimplement thay vì kế thừa mù quáng.
- **Phân xử và lý do:** Thứ tự nguồn là project scope, ngữ nghĩa GRAPES v3, pinned official commit, rồi local snapshot làm bằng chứng lịch sử. Hành vi paper-faithful là phương án chính khi paper và code xung đột, nhưng minimal falsification test vẫn bắt buộc. D8 được đóng theo hướng cho phép cross-layer re-entry và D11 theo một định nghĩa full-Bernoulli ổn định cho mọi candidate cardinality. D1, D2, D4, D5, D6, D7 và D9 vẫn là blocker thực sự của Gate G1.
- **Claim được thêm, verify, contradict hoặc retire:** Thêm V-006–V-008. Verify current official commit và pin paper GRAPES v3. Ghi exact Phase 1 commit là không thể khôi phục từ artifact hiện có. Ghi lại sai khác paper/code mà không âm thầm chọn implementation cho empirical result tốt hơn.
- **Điều còn chưa chắc:** Deadline và milestone từ người dùng/giảng viên; GPU/VRAM/GPU-hour khả dụng, cloud và storage budget; dataset access/licensing; thesis template/language/length bắt buộc; success criteria; exact Phase 2 environment; dataset release/category; và các quyết định Gate G1 còn mở.
- **Hành động tiếp theo:** Thu thập project constraint còn thiếu, đóng D1/D2/D4/D5/D6/D7/D9 bằng công thức và toy-test oracle, rồi lock executable environment cùng dataset audit plan.
- **File được tạo hoặc sửa trong Do An:** `00_project/PHASE2_CONSTRAINTS_en.md`; `00_project/PHASE2_CONSTRAINTS_vn.md`; `01_literature/GRAPES_SOURCE_VERSION_NOTE_en.md`; `01_literature/GRAPES_SOURCE_VERSION_NOTE_vn.md`; `01_literature/LITERATURE_MATRIX_en.csv`; `01_literature/LITERATURE_MATRIX_vn.csv`; `02_protocol/GRAPES_RECOMMENDATION_SPEC_en.md`; `02_protocol/GRAPES_RECOMMENDATION_SPEC_vn.md`; `PROJECT_CONTEXT_AND_RESEARCH_RULES_en.md`; `PROJECT_CONTEXT_AND_RESEARCH_RULES_vn.md`.

### Giải quyết constraint Week 1 và nén plan 12 tuần — 2026-08-26

- **Quyết định hoặc kết quả:** Ghi deadline 12 tuần, implementation bằng Python, active data plan chỉ Amazon, có thể mượn GPU, có Google Colab và kỳ vọng chất lượng cao. Nén active plan từ 16 còn 12 tuần mà không bỏ GRAPES-RL-Rec, GRAPES-GFN-Rec, required baseline, leakage control, năm paired primary seed hoặc representative clean reproduction.
- **Bằng chứng/nguồn:** Chỉ dẫn trực tiếp của người dùng; [tài liệu chính thức Amazon Reviews 2023](https://amazon-reviews-2023.github.io/main.html); [NVIDIA A100 data sheet](https://www.nvidia.com/content/dam/en-zz/Solutions/Data-Center/a100/pdf/nvidia-a100-datasheet-nvidia-us-2188504-web.pdf); [thông số NVIDIA RTX 6000 Ada](https://www.nvidia.com/en-us/products/workstations/rtx-6000/); [Google Colab FAQ](https://research.google.com/colaboratory/faq.html); tài liệu PyTorch về reproducibility.
- **Agent được tham vấn, vai trò và ID:** Ohm (`01a039bd-31b9-7132-935a-2563c9515858`) ước tính độc lập yêu cầu GPU, CPU/RAM, storage, parallel seed và compute 12 tuần. Curie (`01a039bd-3187-7280-b60e-d29374919e67`) độc lập operationalize kỳ vọng cao, thiết kế Amazon acquisition/split protocol chống leakage và nén scientific schedule. Mỗi agent cross-review proposal của agent còn lại rồi sửa recommendation sau khi biết có Colab.
- **Independent finding:** Ohm ban đầu đề xuất hai A100 80 GB và local-storage envelope lớn vì irregular candidate expansion cùng repeated seed tạo uncertainty đáng kể. Curie đề xuất `Baby_Products` 0-core, global chronological split trước train-only iterative filtering, Python 3.11, checkpointable run và định nghĩa chất lượng cao dựa trên deliverable thay vì arbitrary numerical threshold.
- **Cross-critique và disagreement:** Hai agent khác nhau đáng kể về 150–250 so với khoảng 1.000–1.200 GPU-hours, preferred VRAM 40–48 so với 80 GB, thời điểm Gate G1 và local storage. Cả hai đồng ý không được trình bày tổng compute chưa đo như fact, Amazon raw data phải được pin và filter không dùng future leakage, final resource comparison cần cùng một GPU/software stack. Sau cập nhật Colab, cả hai loại large local disk khỏi feasibility gate và giới hạn Colab ở development thay vì canonical profiling.
- **Phân xử và lý do:** Yêu cầu một A100 80 GB cố định cho final profiling; xem GPU thứ hai là optional seed-parallel capacity và RTX 6000 Ada 48 GB là minimum operational final device. Dùng Colab cho preprocessing, smoke test và development run có resumable checkpoint. Thay speculative GPU-hour total bằng measured pilot Week 3. Lưu canonical data/result lâu dài trên cloud storage, không trên temporary Colab VM. Loại MovieLens và giữ active plan chỉ Amazon. Chỉ dùng `All_Beauty` để validate pipeline và đề xuất `Baby_Products` làm primary category.
- **Claim được thêm, verify, contradict hoặc retire:** V-003 hiện là category proposal với count vẫn chưa biết; V-004 đã giải quyết một phần; V-008 là hardware/environment proposal chờ xác nhận. Loại active schedule 16 tuần, MovieLens pilot, yêu cầu bắt buộc local disk 4 TB và mọi claim rằng managed Colab đảm bảo GPU hoặc runtime cố định.
- **Điều còn chưa chắc:** Exact calendar deadline; supervisor/template rubric; A100 availability/access window; Colab tier/compute unit; persistent cloud path; Python/PyTorch/PyG/CUDA lock; exact Amazon artifact/license note/hash; post-filter statistic và measured compute demand.
- **Hành động tiếp theo:** Đóng bảy quyết định Gate G1 còn mở, yêu cầu fixed A100, xác định persistent cloud storage, tạo locked Python/Colab launcher, rồi audit/checksum hai Amazon artifact trong phạm vi.
- **File được tạo hoặc sửa trong Do An:** `00_project/PHASE2_CONSTRAINTS_en.md`; `00_project/PHASE2_CONSTRAINTS_vn.md`; `PHASE2_DIRECTION_REVIEW_en.md`; `PHASE2_DIRECTION_REVIEW_vn.md`; `PROJECT_CONTEXT_AND_RESEARCH_RULES_en.md`; `PROJECT_CONTEXT_AND_RESEARCH_RULES_vn.md`.

### Ghi nhận semantic decision GRAPES-informed ban đầu — 2026-08-26 (`SUPERSEDED AS CANONICAL METHOD`)

- **Quyết định hoặc kết quả:** Đây là historical record. Revision 16 chuyển D1–D11 và oracle của chúng thành GRAPES-informed reference design cùng reference verification candidate. Chúng chỉ hữu ích khi phương pháp luận văn cuối cùng chọn lại một cách tường minh, có scientific rationale và verification.
- **Bằng chứng/nguồn:** GRAPES [arXiv:2310.03399v3](https://arxiv.org/abs/2310.03399v3), đặc biệt Eq. (2), (5), (6) và Phụ lục F; LightGCN [arXiv:2002.02126](https://arxiv.org/abs/2002.02126); tài liệu chính thức PyG [`MessagePassing`](https://pytorch-geometric.readthedocs.io/en/stable/generated/torch_geometric.nn.conv.MessagePassing.html); pinned GRAPES commit `71ecebeaac896800aa4dd1d0f38c57ec222ef396`; cùng snapshot Phase 1 read-only `main.py`, `eval.py`, `modules/gcn.py` và `modules/utils.py`.
- **Agent được tham vấn, vai trò và ID:** Kierkegaard (`01a03ba9-30b3-7a72-b455-a435a6e5c0a1`) giải quyết độc lập D1/D2/D9 và cung cấp block/normalization/masking oracle. Feynman (`01a03ba9-30e9-7401-b195-e25b77871ba5`) giải quyết độc lập D4/D5/D6/D7 và cung cấp gradient, normalizer, ownership cùng OOV oracle. Sau đó mỗi agent cross-critique quyết định của agent còn lại. Các lần resume agent trước đó không trả usable output và đã bị shutdown; không phần incomplete work nào được dùng.
- **Independent finding:** Cả hai review ủng hộ PyG source `K^l` tới destination `K^(l-1)`, degree hai phía cho rectangular block, dấu positive REINFORCE cost theo paper, ranking-only detached sampler cost, target-conditioned scalar `log Z`, sampler embedding tách biệt và transient mask được áp dụng trước mọi candidate/message-passing construction theo batch.
- **Cross-critique và disagreement:** Bất đồng đáng kể là có thể gather LightGCN layer term từ một deepest inward pass duy nhất hay cần các outward-prefix product riêng. Cross-review cho thấy intermediate target row trong một pass dùng sai outer block khi tập GRAPES không tích lũy. Các cảnh báo bổ sung liên quan optional RL baseline, candidate context cho `GCN_Z`, ký hiệu initialization variance, phạm vi OOV universe và việc static degree feature có nên đổi dưới positive-edge masking hay không.
- **Phân xử và lý do:** Canonical target depth `r` được tính bằng explicit prefix `P_r,...,P_1`, tạo `L(L+1)/2` block application trừ khi fused implementation bằng số. Primary sampled normalization là rectangular local bi-normalization; full-graph degree là mandatory ablation và equivalence oracle. Primary RL không dùng baseline và tối thiểu hóa `stopgrad(L_rank) * log q`. `GCN_Z` chỉ dùng target-induced working graph cộng auxiliary self-loop và mean pooling. Sampler embedding có variance `1/d` (`std=1/sqrt(d)`), tách khỏi recommender embedding và theo warm-start universe đã khóa trong data protocol. Trong positive-edge mask ablation, propagation degree đổi theo transient graph còn static train-degree feature không đổi.
- **Claim được thêm, verify, contradict hoặc retire:** V-007 chuyển từ `NEEDS VERIFICATION` sang `ĐÃ GIẢI QUYẾT QUYẾT ĐỊNH; ĐÃ ĐĂNG KÝ ORACLE`. Cách đọc literal row/column hướng ra ngoài của GRAPES Eq. (2), dấu negative REINFORCE trong local code, `log Z` condition theo candidate của local code và sampled-evaluation edge orientation Phase 1 bị loại khỏi primary semantic Phase 2. Không thêm empirical performance claim.
- **Điều còn chưa chắc:** Mọi oracle T01–T25 có pass trong code hay không; exact locked Python/PyTorch/PyG/CUDA version; final GPU access; persistent cloud location; Amazon artifact hash và post-filter statistic; measured batch/embedding/sample-budget capacity.
- **Hành động tiếp theo:** Tạo locked Python project skeleton, implement T01–T25 bắt đầu bằng T12/T14/T18/T19/T23 và freeze executable environment trước learned-policy experiment.
- **File được tạo hoặc sửa trong Do An:** `02_protocol/GRAPES_RECOMMENDATION_SPEC_en.md`; `02_protocol/GRAPES_RECOMMENDATION_SPEC_vn.md`; `PROJECT_CONTEXT_AND_RESEARCH_RULES_en.md`; `PROJECT_CONTEXT_AND_RESEARCH_RULES_vn.md`.

### Tạo supervisor briefing ban đầu — 2026-08-26 (`SUPERSEDED AS WEEKLY-DELIVERABLE MODEL`)

- **Quyết định hoặc kết quả:** Đây là historical record. Revision 16 thay weekly-deliverable model bằng một supervisor briefing hiện tại và dated continuity log; thesis report cùng defense deck vẫn là các artifact cuối tích lũy.
- **Bằng chứng/nguồn:** Artifact Tuần 1 hiện có trong `00_project`, `01_literature` và `02_protocol`; chỉ dẫn trực tiếp của người dùng về weekly teacher report; evidence label và no-fabrication rule của project.
- **Agent được tham vấn, vai trò và ID:** Curie (`01a03e2d-90dd-78e2-8abe-8636d5195d5b`) độc lập thiết kế báo cáo từ góc nhìn giao tiếp với giảng viên. Hegel (`01a03e2d-9121-7cb0-8941-9b32fbaea939`) độc lập audit scientific claim maturity, overclaim risk, missing evidence và weekly-maintenance rule. Sau đó mỗi agent cross-critique proposal của agent còn lại.
- **Independent finding:** Curie đề xuất báo cáo plan 12 tuần, source audit, preliminary literature matrix, D1–D11, 25 oracle, dataset/compute proposal, limitation trung thực, câu hỏi ưu tiên, deliverable Tuần 2 và script hai phút. Hegel yêu cầu tách tường minh recorded decision, specified oracle, proposed resource và executable/empirical evidence còn thiếu.
- **Cross-critique và disagreement:** Hegel xem các cách viết “exact mapping,” “closed semantics” và statement compute rộng là có nguy cơ overclaim nếu không nêu maturity. Curie đồng ý tách status nhưng cảnh báo audit taxonomy đầy đủ sẽ làm supervisor report khó đọc. Hai agent cũng khác nhau về việc Tuần 2 có nên hứa toàn bộ 25 executable test và end-to-end smoke run hay không.
- **Phân xử và lý do:** Báo cáo dùng status vocabulary gọn, xem D1–D11 là recorded design decision, T01–T25 là oracle specification chưa thực thi và gắn dataset/A100 choice là proposal. Tuần 2 ưu tiên environment lock, dataset provenance, project skeleton và năm executable oracle rủi ro cao; smoke check là có điều kiện và không được báo như benchmark. Detailed audit history tiếp tục nằm trong continuity thay vì oral report.
- **Claim được thêm, verify, contradict hoặc retire:** Không thêm scientific hoặc empirical claim. Thêm reporting lifecycle `planned -> specified -> implemented -> executed -> validated`; wording chỉ được nâng mức khi có evidence tương ứng.
- **Điều còn chưa chắc:** Supervisor có chấp nhận scope, provenance mitigation, dataset role, evaluation package, GPU access và institutional reporting/thesis requirement hay không.
- **Hành động tiếp theo:** Dùng báo cáo Tuần 1 trong buổi gặp giảng viên, ghi câu trả lời cho năm câu hỏi và append entry Tuần 2 đồng bộ bằng evidence thay vì overwrite Tuần 1.
- **File được tạo hoặc sửa trong Do An:** `03_reports/REPORT_TEACHER_en.md`; `03_reports/REPORT_TEACHER_vn.md`; `PROJECT_CONTEXT_AND_RESEARCH_RULES_en.md`; `PROJECT_CONTEXT_AND_RESEARCH_RULES_vn.md`.

### Thêm quy tắc output cốt lõi của luận văn — 2026-08-26

- **Quyết định hoặc kết quả:** Khóa ba living output bắt buộc cho Phase 2: thesis report nộp trường, slide deck trình bày/bảo vệ và source code chạy được trên Google Colab. Thêm quy tắc yêu cầu cập nhật liên tục mọi output bị ảnh hưởng khi nghiên cứu phát triển.
- **Bằng chứng/nguồn:** Chỉ dẫn trực tiếp của người dùng về output bắt buộc của luận văn và việc duy trì liên tục.
- **Agent được tham vấn, vai trò và ID:** Không có. Đây là direct operational rule update nên thuộc ngoại lệ mechanical-update của multi-agent protocol.
- **Independent finding:** Không áp dụng.
- **Cross-critique và disagreement:** Không áp dụng.
- **Phân xử và lý do:** Report và slide tiếp tục là các cặp `_en`/`_vn` được đồng bộ. Code giữ một technical source language-neutral kèm tài liệu vận hành song ngữ. Mỗi thay đổi đã kiểm chứng phải được truyền nhất quán sang phần trình bày đầy đủ trong report, phần tóm tắt ngắn gọn và có thể bảo vệ trong slide, cùng code/configuration/test tái lập executable claim.
- **Claim được thêm, verify, contradict hoặc retire:** Không thêm scientific hoặc empirical claim. Chỉ thêm lifecycle và synchronization rule cho deliverable.
- **Điều còn chưa chắc:** Thesis template của trường, ngôn ngữ nộp, độ dài report, format slide bảo vệ và exact final Google Colab/Python/PyTorch/PyG/CUDA environment lock.
- **Hành động tiếp theo:** Khi bắt đầu implementation, khởi tạo cấu trúc output chuẩn `04_thesis`, `05_slides` và `06_code`, rồi cập nhật mọi deliverable bị ảnh hưởng sau mỗi thay đổi quan trọng của project.
- **File được tạo hoặc sửa trong Do An:** `PROJECT_CONTEXT_AND_RESEARCH_RULES_en.md`; `PROJECT_CONTEXT_AND_RESEARCH_RULES_vn.md`.

### Audit mức sẵn sàng của thesis deliverable Tuần 1 — 2026-08-26

- **Quyết định hoặc kết quả:** Xác nhận Tuần 1 đã cung cấp material có evidence cho thesis report ban đầu và working defense slide, trong khi source-code readiness chỉ giới hạn ở semantic contract đã khóa và test oracle đã lập kế hoạch. Các output directory và artifact chuẩn vẫn chưa được tạo.
- **Bằng chứng/nguồn:** `PHASE2_DIRECTION_REVIEW_en.md`; `00_project/PHASE2_CONSTRAINTS_en.md`; `01_literature/GRAPES_SOURCE_VERSION_NOTE_en.md`; `01_literature/LITERATURE_MATRIX_en.csv`; `02_protocol/GRAPES_RECOMMENDATION_SPEC_en.md`; và `03_reports/REPORT_TEACHER_en.md`, cùng các bản tiếng Việt đồng bộ.
- **Agent được tham vấn, vai trò và ID:** Copernicus (`01a03e3c-9fd1-7b10-a628-41551ddc94ee`) audit nội dung report/slide và claim maturity. McClintock (`01a03e3c-9fab-7f43-807b-3bab12ee7eb0`) audit mức sẵn sàng của code/Colab, implementation contract và dependency giữa các oracle. Sau đó mỗi agent cross-critique audit của agent còn lại.
- **Independent finding:** Copernicus tìm thấy material sẵn sàng cho report gồm scope, research question và hypothesis, preliminary related work, provenance, specified method, proposed evaluation plan, verification strategy, risk và timeline, cùng working slide narrative không có result claim. McClintock xác định D1–D11, T01–T25, graph/sampling/model/objective contract và Colab boundary đủ cho package skeleton cùng toy-test implementation, nhưng chưa có code, lockfile, notebook, data manifest hoặc executable evidence.
- **Cross-critique và disagreement:** Cả hai agent chấp nhận mapping của agent còn lại nhưng hạ maturity. “Experimental protocol” phải giữ ở mức “proposed experimental plan — protocol incomplete”; “specified method” nghĩa là frozen design chứ không phải implemented behavior; “code-ready” nghĩa là semantic-contract ready để dựng scaffold và toy graph, không phải clean-Colab hoặc experiment ready. Các test rủi ro cao T12/T14/T18/T19/T23 cần primitive và dependency test cấp thấp trước.
- **Phân xử và lý do:** Report hiện có thể chứa scope, RQ/H1–H4, preliminary evidence base, source provenance, specified adaptation, proposed evaluation plan, oracle strategy, risk và schedule. Slide có thể tóm tắt cùng narrative với local status label như `SPECIFIED — NOT IMPLEMENTED`. Code có thể được khởi tạo với modular package, tài liệu song ngữ, deterministic configuration, truy vết từ D-ID tới module và T-ID, CPU toy-test path, checksum/manifest interface, logging/checkpoint contract và thin Colab launcher. Không artifact nào được claim implementation, execution, validation, reproducibility, performance, scalability, finalized data hoặc locked environment.
- **Claim được thêm, verify, contradict hoặc retire:** Không thêm scientific hoặc empirical claim. Chỉ verify mức sẵn sàng và sự vắng mặt của artifact: nội dung report/slide có ở maturity design/planning; implementation, test execution và experimental evidence chưa có.
- **Điều còn chưa chắc:** University template/language/defense format; exact environment lock và GPU; persistent storage; exact Amazon artifact, schema, cutoff, filtering và negative protocol; experiment configuration; cùng việc oracle có pass sau implementation hay không.
- **Hành động tiếp theo:** Khi có yêu cầu build rõ ràng, khởi tạo report và slide artifact song ngữ cùng `06_code` skeleton, chuyển only nội dung Tuần 1 phù hợp evidence, rồi sửa riêng status drift đã ghi trong các planning/source artifact cũ.
- **File được tạo hoặc sửa trong Do An:** `PROJECT_CONTEXT_AND_RESEARCH_RULES_en.md`; `PROJECT_CONTEXT_AND_RESEARCH_RULES_vn.md`.

### Khởi tạo ba deliverable Tuần 1 và execute toy test — 2026-08-26

- **Quyết định hoặc kết quả:** Khởi tạo ba nhóm living deliverable: bilingual thesis report trong `04_thesis`, bilingual working defense deck trong `05_slides`, và Python/Colab source scaffold trong `06_code`. Chạy test scaffold với kết quả 10/10 pure-Python toy contract tests pass trên CPU.
- **Bằng chứng/nguồn:** `04_thesis/THESIS_REPORT_en.md`; `04_thesis/THESIS_REPORT_vn.md`; `05_slides/THESIS_PRESENTATION_en.pptx`; `05_slides/THESIS_PRESENTATION_vn.pptx`; `06_code/README_en.md`; `06_code/README_vn.md`; source dưới `06_code/src`; test tại `06_code/tests/test_week1_oracles.py`; output lệnh `python3 -m unittest discover -s tests -v`.
- **Agent được tham vấn, vai trò và ID:** Copernicus (`01a03e3c-9fd1-7b10-a628-41551ddc94ee`) audit report/slide readiness. McClintock (`01a03e3c-9fab-7f43-807b-3bab12ee7eb0`) audit code/Colab readiness. Hai agent đã cross-critique và main agent đã adjudicate maturity boundary.
- **Independent finding:** Report/slide có thể chứa scope, RQ/H1–H4, preliminary evidence, provenance, specified adaptation, proposed plan, oracle strategy, risk và timeline. Code có thể bắt đầu từ pure-Python graph/sampling/block/objective/masking contract cùng dependency test.
- **Cross-critique và disagreement:** Hai agent thống nhất rằng 10 test pass chỉ nâng toy-contract subset lên `EXECUTED`; không nâng full adaptation lên `IMPLEMENTED`, `VALIDATED`, `Colab-ready` hoặc `reproducible`. Full data, environment, model và benchmark vẫn mở.
- **Phân xử và lý do:** Giữ report/slide ở design-and-plan maturity và hiển thị boundary ngay trong artifact. Giữ code dependency-free ở giai đoạn này và chỉ dùng thin Colab notebook làm launcher; không đưa implementation chính vào notebook. Hai deck đã được kiểm tra bằng cách render từng slide và overflow test.
- **Claim được thêm, verify, contradict hoặc retire:** Verify sự tồn tại của ba nhóm deliverable và việc 10/10 toy test được execute. Không thêm scientific hoặc empirical claim. Full recommendation adaptation, full oracle suite và performance evidence vẫn chưa có.
- **Điều còn chưa chắc:** Exact environment lock, final GPU, Amazon artifact/checksum/schema/cutoff/filter, negative protocol, university format và result từ implementation thật.
- **Hành động tiếp theo:** Hoàn thiện Week 2 environment/data package, mở rộng dependency test và cập nhật report, slide, source documentation cùng teacher report sau mỗi thay đổi đã kiểm chứng.
- **File được tạo hoặc sửa trong Do An:** Các file trong `04_thesis`, `05_slides` và `06_code` nêu trên; `03_reports/REPORT_TEACHER_en.md`; `03_reports/REPORT_TEACHER_vn.md`; `PROJECT_CONTEXT_AND_RESEARCH_RULES_en.md`; `PROJECT_CONTEXT_AND_RESEARCH_RULES_vn.md`.

### QA cuối Tuần 1 và sửa toy likelihood — 2026-08-26

- **Quyết định hoặc kết quả:** Sửa nhánh tính ổn định số cho negative logit không được chọn trong helper Bernoulli log-probability dependency-free. Sau khi sửa, 10/10 toy contract test vẫn pass tại local.
- **Bằng chứng/nguồn:** `06_code/src/grapes_rec/sampling.py`; `06_code/tests/test_week1_oracles.py`; output của `PYTHONDONTWRITEBYTECODE=1 python3 -m unittest discover -s tests -v`.
- **Ranh giới claim:** Đây chỉ là correction về tính đúng của toy contract local. Maturity boundary không thay đổi: PyTorch/PyG recommendation adaptation, execute đầy đủ T01–T25, Amazon data pipeline, environment lock và benchmark vẫn chưa hoàn thành.
- **Hành động tiếp theo:** Bắt đầu Week 2 bằng việc lock environment tương thích Colab và audit artifact Amazon do project tự source, sau đó mở rộng executable oracle suite trước khi implement learned policy.
- **File được tạo hoặc sửa trong Do An:** `06_code/src/grapes_rec/sampling.py`; `06_code/tests/test_week1_oracles.py`; hai continuity file.

### Khởi tạo dataset audit pipeline — 2026-08-26

- **Quyết định hoặc kết quả:** Bắt đầu Dataset Gate G2 trước model training. Giữ `All_Beauty` làm validation/pipeline artifact và `Baby_Products` làm primary artifact được đề xuất. Chưa artifact nào finalized cho đến khi có exact bytes, checksum, access note và audit evidence sau download.
- **Bằng chứng/nguồn:** [Amazon Reviews'23 project page](https://amazon-reviews-2023.github.io/main.html); [0-core processing/statistics](https://amazon-reviews-2023.github.io/data_processing/0core.html); [official processing README](https://github.com/hyp1231/AmazonReviews2023/blob/main/benchmark_scripts/README.md); `06_code/docs/DATASET_AUDIT_vn.md`; `06_code/scripts/analyze_amazon_dataset.py`; paired notebook dưới `06_code/notebooks`.
- **Independent finding:** Peirce (`01a03e67-ef94-7d20-99bb-3e381e19ca77`) không tìm thấy Amazon artifact local, xác nhận pure-ID schema và statement về provider de-duplication, đồng thời đề xuất tách validation/primary role. Kant (`01a03e67-efc0-7eb1-be6c-d5af909a68b9`) xác định item-key, implicit-positive, duplicate, temporal, warm-start, negative-eligibility và exact-catalog check. Hai agent thống nhất audit order và cảnh báo không trộn `parent_asin` với `asin` hoặc coi future positive là negative nếu chưa ghi policy.
- **Cross-critique và phân xử:** Source audit và protocol audit tương thích. Provider processing, project interaction semantics, temporal split và project training-only filtering phải được report như transformation tách biệt. Official absolute split vẫn là candidate reference; không dùng blind leave-last-out vì singleton handling được document có thể vi phạm warm-start universe.
- **Claim được thêm, verify, contradict hoặc retire:** Verify local không có raw Amazon file và verify sự tồn tại của streaming analyzer, paired audit notebook cùng toy fixture smoke result. Chỉ ghi provider-published count như external metadata. Không thêm project-derived Amazon statistic hoặc model-performance claim.
- **Điều còn chưa chắc:** Exact downloaded SHA-256, compressed/decompressed size, license/access note, duplicate count, rating-to-positive rule, split/cold-start handling, negative eligibility, post-filter graph statistic và feasibility của primary category.
- **Hành động tiếp theo:** Chạy lại cả hai audit trên Colab và lưu persistent JSON manifest, sau đó giải quyết policy về split OOV cao, implicit-positive, duplicate, warm-start và negative eligibility trước khi freeze Dataset Gate G2.
- **File được tạo hoặc sửa trong Do An:** `06_code/docs/DATASET_AUDIT_en.md`; `06_code/docs/DATASET_AUDIT_vn.md`; `06_code/scripts/analyze_amazon_dataset.py`; `06_code/tests/fixtures/toy_amazon.csv`; paired notebook `00_colab_setup_and_oracles_*` và `01_amazon_dataset_audit_*`; hai README; hai traceability file; hai thesis report; hai supervisor report; hai presentation deck; hai continuity file.

### Đã execute raw Amazon audit — 2026-08-26

- **Quyết định hoặc kết quả:** Execute streaming analyzer trên exact temporary bytes của cả hai official artifact trong scope. `All_Beauty` cho 693,929 valid row, 631,986 user, 112,565 item và zero exact duplicate user–item pair. `Baby_Products` cho 5,953,891 valid parsed row, 3,386,206 user và 217,654 item; một row có rating `0.0` ngoài expected range 1–5, còn exact duplicate-pair verification vẫn mở vì large SQLite scan chưa hoàn tất.
- **Bằng chứng/nguồn:** `06_code/docs/DATASET_AUDIT_RESULTS_en.md`; `06_code/docs/DATASET_AUDIT_RESULTS_vn.md`; `06_code/scripts/analyze_amazon_dataset.py`; temporary-run SHA-256 được ghi trong result file; [0-core statistics](https://amazon-reviews-2023.github.io/data_processing/0core.html) và [processing README](https://github.com/hyp1231/AmazonReviews2023/blob/main/benchmark_scripts/README.md).
- **Finding độc lập:** Peirce audit provenance và source boundary; Kant audit protocol và leakage risk. Cả hai thống nhất raw evidence hữu ích nhưng chưa đóng dataset gate, và future positive không được âm thầm đi vào training-negative pool.
- **Cross-critique và phân xử:** Raw count là project-derived; provider-published count và de-duplication behavior vẫn là external source claim. Official absolute split được đo như diagnostic, chưa adopt: validation/test user OOV là 92.14%/94.31% cho `All_Beauty` và 75.07%/83.23% cho `Baby_Products`. Đây là protocol warning, không phải model-performance result.
- **Claim được thêm, verify, contradict hoặc retire:** Bổ sung raw schema, checksum, rating, timestamp, degree, sparsity và candidate-split diagnostic. Verify chưa tạo recommendation model, benchmark hoặc resource measurement. Chưa finalize category, positive threshold, duplicate handling, split, cold-start treatment hoặc negative eligibility.
- **Điều còn chưa chắc:** Persistent Colab checksum/access record, exact Baby duplicate count, cách xử lý một rating ngoài range, implicit-positive rule, project-frozen split, training-only filtering, negative eligibility và post-filter graph scale.
- **Hành động tiếp theo:** Lưu persistent cả hai audit manifest trong Colab; quyết định split/positive/duplicate/negative protocol từ pre-registered rule; sau đó chạy training-only graph statistic trước khi implement recommender.
- **File được tạo hoặc sửa trong Do An:** `06_code/docs/DATASET_AUDIT_RESULTS_en.md`; `06_code/docs/DATASET_AUDIT_RESULTS_vn.md`; hai README; hai traceability file; hai thesis report; hai supervisor report; hai presentation deck; hai continuity file.

### Sửa định danh luận văn Phase 2 và deliverable tích lũy — 2026-08-26

- **Quyết định hoặc kết quả:** Người dùng làm rõ Phase 2 là luận văn Thạc sĩ chính thức, độc lập với tên **“Phát triển phương pháp lấy mẫu đồ thị cho hệ thống gợi ý quy mô lớn sử dụng mạng nơ-ron đồ thị GNN.”** Phase 1 chọn/khám phá đề tài và nghiên cứu GRAPES; nó là tài liệu lịch sử chỉ đọc, không phải chapter tiếp nối hoặc nguồn kết quả Phase 2. GRAPES từ đây được xác định tường minh là nền tảng khoa học, comparator và nguồn candidate mechanism.
- **Finding độc lập:** Hegel (`01a03ebc-97eb-7bb3-809f-eb9dcf171de5`) audit scope framing. Nietzsche (`01a03ebc-980f-74e0-8c9b-5b074c595d24`) audit deliverable governance. Cả hai đều phát hiện direct-adaptation framing và week-based framing drift trong continuity rule, thesis report, supervisor briefing, reference specification, code documentation và defense deck.
- **Cross-critique và phân xử:** Hai reviewer thống nhất thesis report và defense deck phải là artifact cuối tích lũy duy nhất, không có Week 1/Week 2 narrative. Họ cũng thống nhất D1–D11/T01–T25 chỉ còn hữu ích như GRAPES-informed reference design và reference verification candidate. Hai reviewer chỉ khác về việc giữ weekly supervisor entry; chỉ dẫn trực tiếp của người dùng được ưu tiên, vì vậy project duy trì một supervisor briefing được refresh liên tục kèm dated continuity log thay vì weekly thesis deliverable.
- **Claim được thêm, verify, contradict hoặc retire:** Retire active claim rằng Phase 2 là direct GRAPES-to-recommendation adaptation. Retire weekly report/deck delivery model. Không thêm claim về novelty, effectiveness, scalability hoặc final architecture. Final thesis method vẫn `OPEN` cho đến khi literature positioning, method rationale, controlled ablation và experiment hỗ trợ.
- **Hành động tiếp theo:** Reframe thesis report, defense deck, supervisor briefing, protocol header và code documentation song ngữ quanh tên đề tài cuối; giữ nguyên raw dataset-audit finding; sau đó re-validate artifact consistency.
- **File được tạo hoặc sửa trong Do An:** hai continuity file và mọi bilingual living deliverable bị ảnh hưởng trong synchronization task kế tiếp.

### Danh mục dataset và protocol phân tích — 2026-08-26

- **Quyết định hoặc kết quả:** Đã ghi một danh mục dataset có giới hạn và protocol phân tích chống leakage. `Baby_Products` là Amazon primary candidate bắt buộc. `All_Beauty` chỉ dành cho development/diagnostic. Nếu luận văn vẫn giữ “large-scale,” cần một bounded `Home_and_Kitchen` scale-stress experiment sau khi primary pipeline hợp lệ. MovieLens 25M và Yelp Open Dataset là tùy chọn, không được làm chậm Amazon core. Dataset Gate G2 vẫn mở; đây không phải dataset freeze cuối hoặc performance claim.
- **Evidence/source:** Raw audit do project tạo ở `06_code/docs/DATASET_AUDIT_RESULTS_vn.md`; official [Amazon documentation](https://amazon-reviews-2023.github.io/main.html), [0-core](https://amazon-reviews-2023.github.io/data_processing/0core.html) và [5-core](https://amazon-reviews-2023.github.io/data_processing/5core.html); [MovieLens 25M](https://grouplens.org/datasets/movielens/25m/); [Yelp Open Dataset](https://business.yelp.com/data/resources/open-dataset/); [recommender leakage](https://arxiv.org/abs/2010.11060); [sampled metrics](https://arxiv.org/abs/1912.02263); [BPR](https://arxiv.org/abs/1205.2618); [GraphSAINT](https://arxiv.org/abs/1907.04931); và [PinSage](https://arxiv.org/abs/1806.01973).
- **Agent đã tham vấn, vai trò và identifier:** Hilbert (`01a03ed0-ca78-7d92-b83e-92a13469608a`) review dataset role, scale, semantics, source và access. Feynman (`01a03ed0-ca4d-7c72-a247-301358b176d9`) review preprocessing, temporal evaluation, negative, sampler diagnostic và gate. Hai agent đã cross-critique proposal của nhau.
- **Kết quả độc lập:** Cả hai loại raw 0-core `All_Beauty` khỏi core warm-start evidence vì singleton rate là 93.22%. Cả hai giữ `Baby_Products` làm primary nhưng yêu cầu strict post-filter evidence vì raw audit có 70.01% singleton user và provider-split OOV cao. Cả hai yêu cầu training-only graph, rating semantics được pre-register, negative eligibility tường minh và exact full-catalog headline evaluation.
- **Cross-critique và disagreement:** Hilbert muốn `Home_and_Kitchen` là scale evidence bắt buộc và MovieLens là optional. Feynman muốn MovieLens cùng `Baby_Products` là mức tối thiểu bắt buộc, còn `Home_and_Kitchen` là conditional. Cả hai đồng ý Yelp là optional.
- **Adjudication và rationale:** Vì tên đề tài có “large-scale,” yêu cầu một `Home_and_Kitchen` stress configuration tối thiểu đã pre-register sau khi `Baby_Products` vượt G2-D, nhưng không yêu cầu ablation matrix đầy đủ thứ hai. MovieLens 25M và Yelp vẫn optional. Final sampling method vẫn mở; GRAPES là reference/comparator, không phải dataset-selection rationale.
- **Claim được thêm, verify, contradict hoặc retire:** Đã thêm portfolio/protocol record song ngữ. Retire suy nghĩ ngầm rằng Amazon 0-core hoặc provider absolute split có thể dùng trực tiếp làm primary warm-start benchmark. Không thêm claim về novelty, scalability, recommendation quality, resource efficiency hoặc final method.
- **Điều còn chưa chắc chắn:** Baby duplicate count; cách xử lý `0.0`; primary P4/P5/all-observed semantics; strict temporal cutoff; training-only retention; negative policy; audit/run feasibility của `Home_and_Kitchen`; compute lock; và optional MovieLens/Yelp use.
- **Hành động tiếp theo:** Hoàn tất G2-A đến G2-C cho `Baby_Products`, rồi quyết định G2-D trước khi implement final sampler. Song song, chỉ acquire provenance/size audit cho `Home_and_Kitchen`.
- **File được tạo hoặc sửa trong Do An:** `00_project/DATASET_PORTFOLIO_AND_ANALYSIS_PROTOCOL_en.md`; `00_project/DATASET_PORTFOLIO_AND_ANALYSIS_PROTOCOL_vn.md`; hai continuity file; hai thesis report; hai code README.

### Đồng bộ deliverable luận văn độc lập và QA — 2026-08-27

- **Quyết định hoặc kết quả:** Đã đồng bộ thesis report song ngữ đang phát triển, supervisor briefing, GRAPES-informed reference specification, code documentation và defense deck tích lũy với định danh luận văn độc lập. Deck hiện sử dụng phạm vi luận văn chính thức, phân biệt Phase 1 lịch sử với quá trình phát triển phương pháp Phase 2, giữ GRAPES chỉ ở vai trò scientific reference/comparator, và bỏ title, footer cùng narrative theo tuần. Chưa có phương pháp luận văn nào được chọn, và chưa có performance claim.
- **Evidence/source:** `04_thesis/THESIS_REPORT_vn.md`; `03_reports/REPORT_TEACHER_vn.md`; `02_protocol/GRAPES_RECOMMENDATION_SPEC_vn.md`; `06_code/README_vn.md`; `06_code/docs/TRACEABILITY_vn.md`; `05_slides/THESIS_PRESENTATION_vn.pptx`; cùng các counterpart `_en` đã đồng bộ. Cả hai deck đã được render từng slide; kiểm tra overflow và template fidelity đều pass.
- **Agent được tham vấn, vai trò và định danh:** Archimedes (`01a04076-ac11-77c1-bfc3-08cca266448d`) review độc lập về continuity, scope và evidence boundary. Lagrange (`01a04076-ac40-7dc3-9816-bdf8f29d5131`) review độc lập về narrative của deck, cách diễn đạt vai trò dataset và quản trị deliverable. Mỗi agent đã cross-critique review của agent còn lại.
- **Phát hiện độc lập và cross-critique:** Cả hai reviewer yêu cầu cùng ranh giới cốt lõi: `Baby_Products` vẫn là primary candidate chưa finalized, `All_Beauty` chỉ là diagnostic, và `Home_and_Kitchen` là bounded conditional scale-stress candidate nếu giữ large-scale title claim. Raw audit chỉ là evidence tạm thời và không đóng dataset gate; interaction semantics, duplicate handling, split, OOV treatment và negative eligibility vẫn mở. Không còn bất đồng đáng kể sau cross-critique.
- **Adjudication và rationale:** D1–D11/T01–T25 là semantic và verification candidate của reference design, không phải final method. Report, deck, source và briefing là các final deliverable tích lũy, sẽ được sửa tại chỗ. Supervisor artifact là một briefing hiện tại có history trong continuity, không phải deliverable luận văn theo tuần.
- **Claim được thêm, xác minh, bác bỏ hoặc hủy:** Đã loại wording còn sót về direct transfer và weekly deck. Chỉ xác minh đồng bộ artifact và QA, mười CPU toy test hiện có, cùng temporary raw audit đã được ghi trước đó. Không thêm claim về model training, recommendation quality, memory, runtime, throughput, scalability, novelty, superiority, final dataset, final protocol hay final method.
- **Điều còn chưa chắc chắn:** Persistent data provenance/manifest, Baby duplicate handling và xử lý rating `0.0`, interaction semantics, temporal warm-start split, negative eligibility, G2-D closure, environment/GPU lock, final sampler design, baseline set và experimental result.
- **Hành động tiếp theo:** Đóng Dataset Gate G2 từ evidence đã được pre-register, sau đó implement data pipeline và matched baseline được chọn trước khi chọn hoặc claim một project-developed sampler.
- **File được tạo hoặc sửa trong Do An:** cả hai thesis report; cả hai supervisor briefing; cả hai reference specification; cả hai code README; cả hai traceability file; cả hai presentation deck; cả hai continuity file.

### Chỉnh ngôn ngữ slide bảo vệ tiếng Việt — 2026-08-27

- **Quyết định hoặc kết quả:** Đã viết lại phần chữ hiển thị trong `THESIS_PRESENTATION_vn.pptx` cho tự nhiên và rõ ràng hơn với người nghe học thuật Việt Nam. Wording dịch sát hoặc pha trộn ngôn ngữ được thay bằng tiếng Việt dễ hiểu; các định danh chuẩn như GRAPES, BPR, LightGCN, NDCG, Recall, OOV, PyTorch/PyG và tên dataset được giữ lại khi cần thiết.
- **Bằng chứng/nguồn:** Giữ nguyên deck hiện có cùng speaker note của nó như source record khoa học. Không thêm hoặc sửa external source, scientific claim, phương pháp, vai trò dataset, điều kiện đánh giá hay kết quả trong lần chỉnh ngôn ngữ này.
- **Review và kiểm soát phạm vi:** Không cần research review mới vì đây chỉ là sửa wording, không có quyết định khoa học mới. Independent review ở Revision 18 vẫn là review về scope và evidence boundary cho deck.
- **Kiểm chứng:** Đã render toàn bộ slide sau khi sửa; kiểm tra trực quan không thấy chữ bị cắt hay vỡ bố cục. Overflow test của slide và template-fidelity check của deck import đều pass.
- **Claim được thêm, xác minh, bác bỏ hoặc hủy:** Không thêm, đổi hay hủy claim khoa học hoặc thực nghiệm. Deck vẫn nêu rõ final method, việc chốt dataset/protocol, model training và measured result đều còn mở.
- **File được tạo hoặc sửa trong Do An:** `05_slides/THESIS_PRESENTATION_vn.pptx`; cả hai continuity file.

### Đã tập trung kế hoạch nghiên cứu Phase 2 chính thức — 2026-08-27

- **Quyết định hoặc kết quả:** Đã tập trung tiến độ 12 tuần, gate, dependency, trạng thái hiện tại và quy tắc cập nhật deliverable tích lũy vào `00_project/PHASE2_RESEARCH_PLAN_en.md` và `_vn.md`. Continuity rule từ nay chỉ giữ pointer, không giữ thêm một bản sao kế hoạch.
- **Kiểm soát phạm vi:** Kế hoạch giữ đúng phạm vi luận văn độc lập: GRAPES là reference/comparator, không phải phương pháp cuối đã chọn; Dataset Gate G2, việc chọn sampler cuối, protocol đánh giá và empirical result vẫn mở.
- **Xử lý record lịch sử:** Đã thay `PHASE2_DIRECTION_REVIEW_en.md` và `_vn.md` bằng redirect lịch sử rõ ràng. Kế hoạch direct-GRAPES-adaptation cũ không còn là decision record hiệu lực.
- **Review và ranh giới claim:** Đây là chỉnh về quản trị thông tin, không phải quyết định khoa học, phương pháp, dataset hoặc performance mới. Không cần research review mới; independent review về scope/evidence ở Revision 18 vẫn áp dụng.
- **File được tạo hoặc sửa trong Do An:** `00_project/PHASE2_RESEARCH_PLAN_en.md`; `00_project/PHASE2_RESEARCH_PLAN_vn.md`; hai direction-review redirect đã thay thế; hai continuity file; hai thesis report.

### Reset cấu trúc nghiên cứu theo gate-driven — 2026-08-30

- **Quyết định hoặc kết quả:** Reset quản trị Phase 2 quanh một registry gate chuẩn song ngữ. Trạng thái gate nay tách khỏi maturity của bằng chứng. Trạng thái hiện tại là G0 `PASS`, G1/G2 `IN_PROGRESS`, G3–G6 `NOT_STARTED`; E0-MIN và E0-FINAL theo dõi riêng readiness cho development execution và final profiling.
- **Bằng chứng/nguồn:** Tính nhất quán nội bộ của artifact project hiện có; không thêm external scientific source hoặc experiment mới. Bằng chứng chuẩn là `00_project/PHASE2_RESEARCH_PLAN_vn.md` và bản tiếng Anh đồng bộ.
- **Agent được tham vấn, vai trò và định danh:** `gate_architecture` (`/root/gate_architecture`) audit độc lập định danh gate, dependency, exit criteria và stop/go rule. `artifact_drift` (`/root/artifact_drift`) audit độc lập mâu thuẫn giữa artifact và drift về evidence maturity.
- **Phát hiện độc lập:** Cả hai reviewer đều phát hiện G1 đang có hai nghĩa xung đột, G2-E tạo dependency vòng vì đòi scale run trước khi cho phép training, và active legacy record vẫn ngụ ý direct GRAPES adaptation.
- **Cross-critique và disagreement:** Hai reviewer đồng ý về single registry, chuyển scale execution sang G5-S và đổi D1–D11 thành reference-specified. Điều chỉnh chính sau cross-critique là tách E0 thành E0-MIN/E0-FINAL, giới hạn chặt G2-D ở feasibility không tạo headline result, đồng thời hoãn literature expansion hoặc deep thesis rewrite vì chúng cần evidence nghiên cứu mới.
- **Phân xử và lý do:** Chỉ áp dụng thay đổi ảnh hưởng tới định danh, trạng thái, dependency, blocking hoặc evidence boundary của gate. Literature expansion, chọn sampler, khóa environment, quyết định dataset, test mới và experiment vẫn là công việc tương lai theo gate. G5-S có điều kiện theo việc giữ claim large-scale; nếu thiếu phải làm hẹp claim thay vì silent waiver.
- **Claim được thêm, xác minh, bác bỏ hoặc hủy:** Không thêm claim khoa học, novelty, performance hoặc scalability. Retire wording environment-as-G1 và mandatory-direct-GRAPES đang hoạt động. Giữ contract GRAPES chỉ làm reference evidence.
- **Điều còn chưa chắc chắn:** Mức đầy đủ closest-work và quy tắc chọn phương pháp của G1; provenance/semantics/split/negative/retained-graph evidence của G2; environment lock E0; sampler cuối, baseline configuration và toàn bộ empirical result.
- **Hành động tiếp theo:** Chạy targeted closest-work review G1 và protocol work G2-A–G2-C song song trong khi hoàn tất E0-MIN. Không bắt đầu G3 trước khi G2/E0-MIN pass hoặc G4 trước khi G1–G3 pass.
- **File được tạo hoặc sửa trong Do An:** hai kế hoạch chuẩn; hai continuity file; hai constraint record; hai dataset portfolio record; hai GRAPES source note; hai GRAPES-informed reference specification; hai dataset-audit protocol; hai thesis report; hai supervisor briefing; và hai code README.
