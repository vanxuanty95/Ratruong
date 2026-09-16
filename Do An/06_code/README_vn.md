# Mã nguồn và bằng chứng thực nghiệm

> Trạng thái: 6/6 paired repeat đã hoàn thành; cùng với seed thiết kế s0 tạo ba validation seed cho M0–M2. Test target chưa được đọc.

## 1. Không cần chạy lại Colab để hoàn thiện bản trình bày

Các notebook 03–10 đã chạy và output cần thiết đã được lưu trong `results/`. Slide, báo cáo và thesis phải đọc các output này. Chỉ chạy lại notebook khi cần kiểm tra khả năng tái lập hoặc khi artifact gốc bị thiếu; không chạy lại để chọn seed đẹp hơn hoặc thay đổi M2 sau khi đã xem kết quả.

## 2. Thứ tự notebook

| Notebook | Vai trò | Trạng thái |
|---|---|---|
| `00_colab_setup_and_oracles_*` | Toy oracle cho graph, sampling và objective | Hoàn thành |
| `01_amazon_dataset_audit_*` | Exact audit All Beauty và Baby Products | Hoàn thành |
| `02_baby_p4_temporal_graph_*` | Temporal graph, mapping và warm-start target | Hoàn thành |
| `03_data_story_eda.ipynb` | Full-data EDA và biểu đồ | Hoàn thành |
| `04_mostpop_validation_sanity.ipynb` | Popularity baseline | Hoàn thành |
| `05_bpr_mf_validation_sanity.ipynb` | Matrix-factorization baseline | Hoàn thành |
| `06_full_lightgcn_validation_sanity.ipynb` | Full-graph LightGCN | Hoàn thành |
| `07_uniform_sampling_validation_sanity.ipynb` | M0 uniform | Hoàn thành |
| `08_degree_aware_sampling_validation_sanity.ipynb` | M1 degree-aware | Hoàn thành |
| `09_frontier_normalized_sampling_validation_sanity.ipynb` | M2 frontier-normalized | Hoàn thành |
| `10_paired_sampling_validation.ipynb` | Hai seed bổ sung, resume-safe | Hoàn thành 6/6 run |

## 3. Các artifact chính

- Data audit: `results/All_Beauty_protocol_audit.json`, `Baby_Products_protocol_audit.json`, `Home_and_Kitchen_raw_audit.json`
- Temporal graph: `results/baby_p4_g2c_manifest.json`
- EDA: `results/data_story/`
- Baselines: `results/mostpop_validation/`, `bpr_mf_validation/`, `full_lightgcn_validation/`
- M0–M2: `results/uniform_sampling_validation/`, `degree_aware_sampling_validation/`, `frontier_normalized_sampling_validation/`
- Paired validation: `results/paired_sampling_validation/`

Mỗi thư mục kết quả có summary JSON và báo cáo đọc được. Bundle ZIP trong thư mục kết quả là bản chuyển giao gốc. Rank vector `.npz` được giữ để tính lại metric và transition. Không lưu model checkpoint vì mục tiêu là validation evidence và bundle đã đăng ký không chứa checkpoint.

## 4. Kết quả M0–M2

### Seed thiết kế s0

| Chỉ số | M0 | M1 | M2 |
|---|---:|---:|---:|
| NDCG@20 | 0,005727 | **0,006153** | 0,005921 |
| Recall@20 | 0,014657 | **0,015989** | 0,015317 |
| Catalog Coverage@20 | **0,018486** | 0,017783 | 0,017863 |
| Training wall time | 705,32 s | 795,11 s | 868,63 s |
| Peak GPU memory | 3.482,90 MiB | 2.665,10 MiB | 2.669,06 MiB |

M1 tăng 109 hit so với M0, nhưng tất cả đều là head target. M2 thấp hơn M1 55 hit, body/tail không tăng và coverage chỉ hơn M1 13 item. M2 có ít directed block entry hơn M1 nhưng chậm hơn vì phải tính frontier support.

### Ba validation seed

| Phương pháp | NDCG@20 mean ± SD | Recall@20 mean ± SD | Coverage@20 mean ± SD |
|---|---:|---:|---:|
| M0 | 0,00570640 ± 0,00007324 | 0,01486892 ± 0,00048771 | **0,01813210 ± 0,00031820** |
| M1 | **0,00586598 ± 0,00024947** | **0,01529642 ± 0,00062009** | 0,01753380 ± 0,00062722 |
| M2 | 0,00572092 ± 0,00017933 | 0,01487299 ± 0,00057942 | 0,01751324 ± 0,00031838 |

M2 trừ M1 âm về NDCG và Recall trong s0, s1 và s2. Trong hai repeat mới, M2 chậm hơn M1 trung bình 114,88 giây, tương đương 14,36%. Peak GPU chỉ lệch khoảng 4,11 MiB. Tail hit bằng 0 cho mọi sampler và seed.

## 5. Kiểm tra local

Dùng Python đóng gói có NumPy:

```bash
/Users/tyvan/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3 \
  -m unittest discover -s tests -p 'test_*.py' -v
```

Kiểm tra narrative và số liệu:

```bash
/Users/tyvan/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3 \
  scripts/verify_research_consistency.py \
  --repo-root ../../
```

Checker đọc JSON kết quả, kiểm tra con số chính, tìm phát biểu vượt claim boundary, đọc text trong PPTX và phát hiện bản slide cũ còn sót.

## 6. Tái tạo trên Colab khi thật sự cần

Nếu cần chạy lại, thực hiện theo thứ tự notebook và dùng cùng thư mục Drive, config, data hash, seed, Tesla T4 và output name đã ghi. Với notebook 10, các run hợp lệ sẽ được nhận diện và `SKIP_VERIFIED`; không xóa thư mục paired result trước khi resume.

Không chạy nhiều bản notebook 10 đồng thời vào cùng output folder. Không sửa proposal, budget, negative draw, evaluator hoặc seed rồi gộp kết quả mới với summary hiện tại.

Dữ liệu cần còn trên Drive:

- raw `Baby_Products.csv.gz` đúng SHA-256;
- graph artifact và manifest trong `g2c_baby_p4/`;
- baseline summaries;
- M0, M1, M2 summaries;
- paired run folders và rank vectors.

## 7. Ranh giới kết luận

- Kết quả hiện tại là validation-only.
- M2 không được promote.
- M1 có mean cao nhất nhưng không thắng M0 ở mọi seed.
- Ba seed không đủ cho significance hoặc universal claim.
- Resource s0 là context cũ; so sánh resource ưu tiên các run cùng instrumentation trong từng seed.
- Không claim cold-start, semantic relevance hoặc semantic diversity.
- Không gọi M2 là learned sampler.

## 8. Handoff để tiếp tục sau này

Tại commit `bea2422`, evidence được trình bày qua cùng một narrative trong:

- `../05_slides/THESIS_PRESENTATION_vn.pptx`: deck 21 slide; có slide riêng giải thích context, frontier và M0/M1/M2.
- `../04_thesis/THESIS_REPORT_vn.tex` và `../04_thesis/THESIS_REPORT_vn.pdf`: report tổng hợp về nguồn, schema, P4, temporal split, long tail, metric, result và giới hạn.
- `../04_thesis/THESIS_REFERENCES.bib`: nguồn ngoài dự án của report.

Trước khi thay đổi code hoặc chạy Colab, đọc lại `../PROJECT_CONTEXT_AND_RESEARCH_RULES_vn.md` và `../00_project/PHASE2_RESEARCH_PLAN_vn.md`. Việc cần làm kế tiếp không phải chạy lại toàn bộ pipeline: chọn một claim mới, đăng ký protocol riêng và chỉ chạy artifact tối thiểu để trả lời claim đó.

Các nhánh hợp lệ là final test của quyết định đã khóa; benchmark graph-CF ngoài Amazon; nghiên cứu semantic trên data có metadata; hoặc bounded scale test. Không dùng test target, extra seed, dataset mới hay M3--M5 để cứu M2 sau khi đã thấy validation.

## 9. Kiểm tra lại trước khi bàn giao

Ở máy có `pytest` và `numpy`, từ thư mục `06_code` chạy:

```bash
PYTHONPATH=src python3 -m pytest -q
PYTHONPATH=src python3 scripts/verify_research_consistency.py
```

Kết quả đã kiểm tra tại handoff này là `96 passed`; checker không có `violations`. Không cài dependency hay ghi output test vào repository chỉ để chạy hai lệnh trên.
