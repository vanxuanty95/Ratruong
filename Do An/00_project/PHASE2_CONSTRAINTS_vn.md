# Hồ sơ constraint Phase 2

> **Trạng thái:** `ĐÃ GIẢI QUYẾT MỘT PHẦN — CÒN MỞ VIỆC ĐẶT GPU VÀ CHI TIẾT THỂ CHẾ`  
> **Ngày ghi:** 2026-08-26  
> **Phạm vi hiện tại:** phát triển phương pháp thuộc project cho graph sampling trong GNN recommendation. GRAPES là reference/comparator; trạng thái gate chỉ do [`PHASE2_RESEARCH_PLAN_vn.md`](./PHASE2_RESEARCH_PLAN_vn.md) quản trị.

## 1. Constraint đã khóa

| ID | Constraint | Trạng thái | Bằng chứng |
|---|---|---|---|
| C-001 | Phase 2 phát triển phương pháp graph-sampling thuộc project cho GNN recommendation; GRAPES là tài liệu reference/comparator | `LOCKED; THAY THẾ WORDING DIRECT-ADAPTATION` | Phạm vi luận văn hiện tại và continuity file đồng bộ |
| C-002 | `ThucTap2` là tài liệu tham khảo chỉ đọc | `LOCKED` | Project rule |
| C-003 | Mọi output lâu dài mới được lưu trong `Do An` | `LOCKED` | Project rule |
| C-004 | Output có nội dung ngôn ngữ phải có cặp file `_en` và `_vn` đồng bộ | `LOCKED` | Project rule |
| C-005 | Research/design task đáng kể cần hai agent độc lập và cross-critique | `LOCKED` | Project rule |
| C-006 | GRAPES-RL-Rec và GRAPES-GFN-Rec là reference variant tùy chọn, chỉ dùng nếu rationale G1 và gate sau đó biện minh | `REFERENCE CANDIDATES` | Kế hoạch chuẩn hiện tại |
| C-007 | Gate failure cần corrective loop, stop hoặc rescope request được ghi; không cho phép unsupported claim hay pivot sang đề tài không liên quan | `LOCKED` | Kế hoạch chuẩn hiện tại |
| C-008 | Phase 2 phải hoàn thành trong 12 tuần | `LOCKED` | Chỉ dẫn trực tiếp của người dùng ngày 2026-08-26 |
| C-009 | Ngôn ngữ implementation là Python | `LOCKED` | Chỉ dẫn trực tiếp của người dùng ngày 2026-08-26 |
| C-010 | Project dùng dữ liệu Amazon Reviews và phải tự source/chuẩn bị | `LOCKED DATA FAMILY` | Chỉ dẫn trực tiếp của người dùng ngày 2026-08-26 |
| C-011 | Tiêu chuẩn kỳ vọng cho luận văn ở mức cao | `LOCKED EXPECTATION; RUBRIC CÒN MỞ` | Chỉ dẫn trực tiếp của người dùng ngày 2026-08-26 |
| C-012 | Google Colab khả dụng cho cloud development và loại local-disk capacity khỏi feasibility gate | `LOCKED AVAILABILITY` | Chỉ dẫn trực tiếp của người dùng ngày 2026-08-26 |

## 2. Hạ tầng local đã kiểm chứng

| Hạng mục | Giá trị đã kiểm chứng | Hệ quả |
|---|---|---|
| Máy | Mac mini, Apple M4, 10 CPU core, 16 GB unified memory | Phù hợp cho tài liệu, code review và preprocessing/debugging có giới hạn |
| NVIDIA GPU | Không có; lệnh `nvidia-smi` không tồn tại | Không thể tạo final CUDA memory/runtime evidence trên máy local |
| System Python | Python 3.14.5 | Phải tạo project environment riêng; không cài vào system interpreter |
| PyTorch trong system Python | Chưa cài | Chưa thể chạy model local |
| Dung lượng trống | Khoảng 14 GiB trên workspace volume tại thời điểm audit | Không lưu dataset lớn ở local; đây không còn là feasibility blocker vì có Colab/cloud storage |
| Kích thước `Do An` hiện tại | Khoảng 136 KiB trước artifact Week 1 | Project output hiện còn nhỏ |
| Environment repository Phase 1 | Python 3.9.20, PyTorch 1.13.1, CUDA 11.7, PyG 2.5.2 trong `environment.yml` | Chỉ là historical manifest; chưa được phê duyệt làm Phase 2 environment |
| Colab reproduction Phase 1 | Tesla T4, PyTorch 2.11.0+cu128, PyG 2.7.0, OGB 1.3.6 | Historical executed environment; khác repository manifest |

`INFERENCE`: Máy Mac local có thể hỗ trợ specification, phát triển unit test trên toy graph sau khi tạo environment tương thích và preprocessing nhỏ. Nó không thể hỗ trợ final NVIDIA/CUDA resource comparison theo plan.

## 3. Input đã cung cấp và còn chưa giải quyết

| ID | Input cần có | Trạng thái hiện tại | Lý do cần thiết |
|---|---|---|---|
| U-001 | Deadline luận văn | `ĐÃ BIẾT MỘT PHẦN: KHUNG 12 TUẦN` | Plan được nén còn 12 tuần; exact calendar date nộp/bảo vệ vẫn chưa biết |
| U-002 | Milestone và lịch gặp giảng viên | `UNKNOWN` | Xác định ngày review/freeze |
| U-003 | Yêu cầu novelty và evaluation của trường | `ĐÃ BIẾT MỘT PHẦN: KỲ VỌNG NGƯỜI DÙNG CAO` | Tiêu chuẩn bằng chứng nội bộ được định nghĩa dưới đây; rubric chính thức từ trường/giảng viên vẫn chưa biết |
| U-004 | Model NVIDIA GPU và VRAM khả dụng | `CÓ THỂ MƯỢN; EXACT DEVICE CHƯA BIẾT` | Đề nghị chuẩn là một A100 80 GB cố định; cần xác nhận availability |
| U-005 | GPU-hours và lịch truy cập | `UNKNOWN` | Profiling Week 3 phải thay estimate trước khi freeze final run matrix |
| U-006 | Cloud hoặc compute availability | `ĐÃ BIẾT MỘT PHẦN: CÓ GOOGLE COLAB` | Colab tier, compute unit, GPU availability và runtime continuity không được đảm bảo |
| U-007 | Persistent cloud storage | `DUNG LƯỢNG KHÔNG PHẢI LO NGẠI CỦA NGƯỜI DÙNG; SERVICE/RETENTION CÒN MỞ` | Raw data, manifest, checkpoint và result vẫn cần persistent location cùng retention policy |
| U-008 | Dataset access và licensing | `ĐÃ CHỌN AMAZON; ACCESS/USAGE NOTE CÒN MỞ` | Pin exact official artifact, category, hash, citation và usage/legal note trước acquisition |
| U-009 | Implementation và thesis format | `PYTHON ĐÃ KHÓA; THESIS FORMAT CHƯA BIẾT` | Python là implementation language; template, page limit và submission language vẫn chưa biết |
| U-010 | Success criterion | `KỲ VỌNG CAO; KHÔNG CÓ NUMERIC THRESHOLD` | Ngăn success claim post-hoc; dùng evidence package dưới đây thay vì bịa accuracy threshold |

## 4. Đề xuất compute đã phân xử

- **Yêu cầu hardware chuẩn cho final:** một NVIDIA A100 80 GB cố định. Dùng một process và một complete run trên mỗi GPU. A100 thứ hai hữu ích để chạy paired seed song song nhưng không bắt buộc sau khi tính thêm Colab.
- **Hardware final vận hành tối thiểu:** một NVIDIA RTX 6000 Ada 48 GB. GPU 24 GB chỉ dùng debugging, không dùng làm primary final resource evidence.
- **Vai trò Colab:** preprocessing, kiểm tra data pipeline, unit test, smoke test, development run và preliminary trial có checkpoint.
- **Loại trừ với Colab:** không so sánh runtime, peak memory hoặc sampler efficiency giữa các managed-Colab GPU allocation không đồng nhất. Colab công bố hardware availability, usage limit và VM lifetime thay đổi động.
- **Invariant cho final profiling:** mọi final resource comparison dùng cùng physical GPU class, software lock, precision và profiling procedure.
- **Persistent storage:** dùng cloud/object/Drive-backed storage cho immutable raw data, manifest, processed artifact, checkpoint và raw result. Stage active archive trên runtime-local disk rồi upload output theo cách atomic. Không bắt buộc local NVMe 4 TB.
- **Đề xuất environment:** Linux/amd64, Python 3.11 và manifest khóa version của PyTorch, PyG, CUDA, driver cùng dependency. Chỉ freeze exact version sau khi borrowed GPU được xác nhận.
- **Compute envelope:** không freeze GPU-hours bằng suy đoán. Yêu cầu đủ quota cho development cộng năm paired final seed, rồi thay provisional estimate bằng benchmark end-to-end đo được ở Week 3.

Hardware fact chính thức dùng để lập kế hoạch capacity: A100 80 GB PCIe có 80 GB HBM2e và memory bandwidth khoảng 1,94 TB/s; RTX 6000 Ada có 48 GB GDDR6 ECC. Nguồn: [NVIDIA A100 data sheet](https://www.nvidia.com/content/dam/en-zz/Solutions/Data-Center/a100/pdf/nvidia-a100-datasheet-nvidia-us-2188504-web.pdf) và [thông số NVIDIA RTX 6000 Ada](https://www.nvidia.com/en-us/products/workstations/rtx-6000/).

## 5. Đề xuất dữ liệu Amazon

- **Dataset family:** chỉ Amazon Reviews 2023; MovieLens được loại khỏi active plan.
- **Category kiểm thử pipeline:** pure-ID 0-core `All_Beauty`, chỉ dùng kiểm thử acquisition và preprocessing.
- **Category chính của luận văn:** pure-ID 0-core `Baby_Products`, vẫn là `PROPOSED` cho đến khi audit artifact, size, hash, split và post-filter statistic.
- **Phạm vi acquisition:** chỉ download ratings/pure-ID artifact theo category cần dùng. Không tải toàn bộ 33 category hoặc text/image metadata không dùng.
- **Thứ tự chuẩn bị chính:** validate schema và duplicate; định nghĩa implicit positive; tạo global chronological split; chạy iterative core filtering chỉ trên training positive; freeze user/item universe; project validation/test vào universe đó; chỉ tính mọi graph statistic từ training.
- **Provenance:** giữ canonical URL, retrieval time, ETag/Last-Modified khi có, compressed/decompressed byte size, SHA-256, schema, split cutoff, preprocessing-config hash và code commit.

Official release báo cáo tổng cộng 571,54 triệu review. Raw `Baby_Products` có khoảng 3,4 triệu user, 217,7 nghìn item và 6,0 triệu rating trước split/filter protocol của chúng ta. Đây là planning statistic, không phải final thesis count. Nguồn: [tài liệu chính thức Amazon Reviews 2023](https://amazon-reviews-2023.github.io/main.html).

## 6. Ý nghĩa vận hành của kỳ vọng cao

- giữ D1–D11/T01–T25 làm GRAPES-informed reference oracle và chỉ áp dụng test liên quan nếu component được chọn;
- đóng gói implementation Python được pin, modular, có deterministic configuration và automated test;
- tạo Amazon data package immutable, định danh bằng checksum, rerunnable và leakage-safe;
- chạy baseline/comparator set được freeze qua G1/G3 dưới controlled budget; GRAPES variant là reference comparator có điều kiện, không phải phương pháp cuối bắt buộc;
- dùng exact full-catalog NDCG@20 làm primary quality metric và Recall@20 làm secondary;
- dùng một smoke seed, ba fixed development seed và năm paired final seed cho primary comparison khi measured compute cho phép;
- báo cáo effect size, uncertainty, failed run, peak memory, wall-clock time, sampler/propagation time và throughput;
- hoàn thành một clean-environment representative rerun và tái tạo table/figure từ raw result;
- báo cáo rigorous negative result nếu GRAPES không cải thiện recommendation; không bịa arbitrary success threshold.

## 7. Quyết định còn lại trước khi freeze experiment scale

- xác nhận borrowed GPU model, access window và khả năng exclusive profiling;
- xác định persistent cloud storage location và retention policy;
- đo pilot end-to-end Week 3 trước khi freeze GPU-hours, batch size, embedding dimension, budget và trial count;
- audit và pin exact artifact `Baby_Products` cùng post-filter scale;
- lấy supervisor milestone, thesis template/language/page limit và formal evaluation rubric;
- pass G1 chuẩn trước khi chọn sampler, pass G2 và E0-MIN trước khi execute G3, và chỉ thỏa reference oracle liên quan cho component được chọn.

Google công bố managed Colab resource limit, VM lifetime và GPU type thay đổi và không được đảm bảo; runtime VM là tạm thời. Vì vậy Colab loại local-disk blocker nhưng không thay thế provenance, persistent storage, environment lock hoặc final profiling trên cùng hardware. Nguồn: [Google Colab FAQ](https://research.google.com/colaboratory/faq.html).
