# Ghi chú source và version GRAPES

> **Trạng thái:** `WEEK 1 PIN RECORDED; PHASE 1 COMMIT UNKNOWN`  
> **Ngày ghi:** 2026-08-26  
> **Mục đích:** định nghĩa nguồn có thẩm quyền cho direct GRAPES-to-recommendation adaptation.

## 1. Quyết định version

### Pin paper

- `VERIFIED FACT`: Method reference là **GRAPES arXiv:2310.03399v3**, sửa lần cuối ngày 2025-07-15. [Lịch sử version trên arXiv](https://arxiv.org/abs/2310.03399v3)
- Local reference PDF: [`2310.03399v3.pdf`](</Users/tyvan/Documents/Master/ThucTap2/GRAPES report/2310.03399v3.pdf>).
- SHA-256 của local PDF: `53acf70a8cd721e279f2f3b0779a018b0f32e0f17d4ea02038099b8e9f6d35af`.

### Pin official code cho Phase 2

- Official repository: [github.com/dfdazac/grapes](https://github.com/dfdazac/grapes).
- `VERIFIED FACT`: `refs/heads/main` được read-only `git ls-remote` resolve tới commit:

```text
71ecebeaac896800aa4dd1d0f38c57ec222ef396
```

- Ngày resolve: 2026-08-26.
- `DECISION`: Commit này là pinned official-code reference cho Phase 2. Future implementation phải ghi rõ bắt đầu từ commit này, port một số component hay reimplement dưới unit test.
- Chưa tạo local Phase 2 code clone.

## 2. Provenance của local snapshot Phase 1

- Snapshot root: `/Users/tyvan/Documents/Master/ThucTap2/GRAPES report/grapes-main`.
- Số file tại thời điểm audit: 49.
- `.git` metadata: không có.
- Content-manifest fingerprint, tính từ per-file SHA-256 đã sort tương đối với snapshot root:

```text
ea365d646d93e6801bb0c60d02b01d53db9af98dcf18310c1c2cdc1bc0bd1fcb
```

- `UNKNOWN`: exact commit, tag, branch, remote configuration và byte identity với Colab runtime clone.
- `VERIFIED FACT`: local `main.py` có 390 dòng, trong khi official `main.py` hiện tại tại pinned branch head có 352 dòng. Vì vậy local snapshot không byte-identical với official file hiện tại.
- Snapshot được giữ làm read-only Phase 1 evidence, không dùng như version identifier thiếu điều kiện.

## 3. Provenance của code đã chạy trong Phase 1

Executed notebook ghi:

1. Clone `https://github.com/dfdazac/grapes.git` mà không pin branch, tag hoặc commit: [`GRAPES_Colab and result.ipynb`](</Users/tyvan/Documents/Master/ThucTap2/GRAPES report/GRAPES_Colab and result.ipynb:110>).
2. Patch SciPy indexing trong `modules/utils.py` và patch installed OGB code trước khi chạy: [phần patch trong notebook](</Users/tyvan/Documents/Master/ThucTap2/GRAPES report/GRAPES_Colab and result.ipynb:209>).
3. Chạy GFlowNet và Random configuration trên Cora, CiteSeer, ogbn-arxiv và một run ogbn-products chưa hoàn chỉnh; không chạy RL configuration trong reproduction đã ghi.
4. Result record có timestamp 2026-05-30 và ghi Tesla T4 với PyTorch `2.11.0+cu128`: [`grapes_results.json`](</Users/tyvan/Documents/Master/ThucTap2/GRAPES report/grapes_results.json:1>).

`CONCLUSION`: Phase 1 reproduction không thể gán cho exact commit. Mọi numerical result được tái sử dụng phải giữ provenance limitation này.

## 4. Environment record

| Environment | Version được ghi | Trạng thái |
|---|---|---|
| Official repository manifest | Python 3.9.20; PyTorch 1.13.1; `pytorch-cuda=11.7`; PyG 2.5.2 | `VERIFIED LOCAL MANIFEST` |
| Executed Phase 1 Colab | Tesla T4; PyTorch 2.11.0+cu128; PyG 2.7.0; OGB 1.3.6 | `VERIFIED EXECUTION RECORD` |
| System Python trên Mac hiện tại | Python 3.14.5; không có PyTorch; không có NVIDIA GPU | `VERIFIED LOCAL STATE` |
| Phase 2 project environment | Chưa tạo | `OPEN` |

Repository manifest và executed Colab environment khác nhau đáng kể. Không environment nào được gọi là Phase 2 environment cho đến khi có quyết định tường minh và smoke test.

## 5. Local implementation entry point

| Component | Bằng chứng local Phase 1 | Liên quan đến adaptation |
|---|---|---|
| CLI và training entry | [`main.py:23`](</Users/tyvan/Documents/Master/ThucTap2/GRAPES report/grapes-main/main.py:23>), [`main.py:57`](</Users/tyvan/Documents/Master/ThucTap2/GRAPES report/grapes-main/main.py:57>) | Thay node-target loader và classifier task loop |
| Sampler GNN | [`main.py:112`](</Users/tyvan/Documents/Master/ThucTap2/GRAPES report/grapes-main/main.py:112>), logits tại [`main.py:210`](</Users/tyvan/Documents/Master/ThucTap2/GRAPES report/grapes-main/main.py:210>) | Giữ policy role; thiết kế lại input cho user/item node |
| Gumbel Top-k utility | [`modules/utils.py:13`](</Users/tyvan/Documents/Master/ThucTap2/GRAPES report/grapes-main/modules/utils.py:13>) | Ứng viên port có test; chứa off-policy likelihood behavior |
| Candidate expansion | [`main.py:178`](</Users/tyvan/Documents/Master/ThucTap2/GRAPES report/grapes-main/main.py:178>) | Phải thay bằng tested bipartite block construction |
| Sampled adjacency slicing | [`main.py:240`](</Users/tyvan/Documents/Master/ThucTap2/GRAPES report/grapes-main/main.py:240>) | Orientation discrepancy cần giải quyết |
| Classifier GNN/loss | [`main.py:109`](</Users/tyvan/Documents/Master/ThucTap2/GRAPES report/grapes-main/main.py:109>), [`main.py:120`](</Users/tyvan/Documents/Master/ThucTap2/GRAPES report/grapes-main/main.py:120>) | Thay bằng LightGCN-style recommender và BPR loss |
| `GCN_Z` normalizer | [`main.py:114`](</Users/tyvan/Documents/Master/ThucTap2/GRAPES report/grapes-main/main.py:114>), prediction tại [`main.py:223`](</Users/tyvan/Documents/Master/ThucTap2/GRAPES report/grapes-main/main.py:223>) | Phải condition trên mixed user/item target set |
| RL và TB objective | [`main.py:277`](</Users/tyvan/Documents/Master/ThucTap2/GRAPES report/grapes-main/main.py:277>) | Paper/code sign và semantic cần explicit test |
| Full-graph evaluation | [`eval.py:47`](</Users/tyvan/Documents/Master/ThucTap2/GRAPES report/grapes-main/eval.py:47>) | Hỗ trợ quyết định common full-graph inference |
| Dataset dispatcher | [`modules/data.py:252`](</Users/tyvan/Documents/Master/ThucTap2/GRAPES report/grapes-main/modules/data.py:252>) | Đặc thù node classification; không tái sử dụng làm recommendation loader |

## 6. Discrepancy và cảnh báo paper/code đã kiểm chứng

### D-SRC-01 — Dấu REINFORCE

- Paper Equation 5 viết `L_C log q`.
- Local public-code snapshot minimize `-log q × detached loss` tại `main.py:279`.
- Trạng thái: `UNRESOLVED DISCREPANCY`.
- Cách giải quyết bắt buộc: toy two-action gradient-direction test cộng kiểm tra pinned commit trước khi freeze RL objective.

### D-SRC-02 — Block orientation trong training/evaluation

- Local training slice adjacency với `rows=batch_nodes, cols=previous_nodes` tại `main.py:241–243`.
- Local sampled evaluation dùng `rows=previous_nodes, cols=batch_nodes` tại `eval.py:140–142`.
- Trạng thái: `UNRESOLVED DISCREPANCY`.
- Cách giải quyết bắt buộc: định nghĩa source/target convention và chứng minh bằng two-layer toy graph.

### D-SRC-03 — Likelihood so với conditioned action

- Paper v3 nêu exact-`k` Gumbel Top-k action được lấy từ distribution conditioned trên cardinality `k`, trong khi optimization likelihood dùng unconditioned Bernoulli policy.
- Local utility trả `Bernoulli.log_prob(mask)` trên cả selected và unselected candidate khi `k < n`.
- Trạng thái: `VERIFIED OFF-POLICY MISMATCH`; không gọi conditioned-policy estimator là unbiased nếu chưa có derivation.

### D-SRC-04 — Nhánh `k >= n`

- Local utility chọn toàn bộ candidate và chỉ trả các giá trị `logsigmoid(logits)` khi `k >= n`.
- Aggregation semantic khác về shape/content so với full binary-mask branch.
- Trạng thái: `NEEDS SPECIFICATION AND TEST`.

### D-SRC-05 — Sampler feature

- Paper v3 dùng regular node embedding/feature cộng layer indicator.
- Separate sampler-only ID embedding cho recommendation là adaptation choice, không phải GRAPES behavior không đổi.
- Trạng thái: `PROPOSED`; phải đặc tả ownership và gradient.

## 7. Source-governance rule cho Phase 2

Dùng thứ tự ưu tiên:

1. project scope và scientific rule tường minh;
2. GRAPES arXiv v3 cho formal method semantic;
3. pinned official commit `71ecebeaac896800aa4dd1d0f38c57ec222ef396` cho implementation evidence;
4. Phase 1 snapshot/notebook chỉ cho historical reproduction evidence.

Khi paper và code không khớp, ghi discrepancy, thiết kế minimal falsification/unit test và freeze lựa chọn trong specification. Không bao giờ âm thầm chọn behavior tạo result tốt hơn.

## 8. Trạng thái source Week 1

- Paper version: `PINNED`.
- Official code reference: `PINNED`.
- Exact Phase 1 executed commit: `UNKNOWN` và không thể khôi phục từ artifact hiện tại.
- Phase 2 environment: `OPEN`.
- Gate G1: vẫn `OPEN` chờ specification decision và test.
