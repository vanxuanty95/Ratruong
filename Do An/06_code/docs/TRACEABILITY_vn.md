# Truy vết GRAPES-informed Reference Design

Bảng này ánh xạ các quyết định của reference design và các toy test executable đầu tiên. Các quyết định và test là verification candidate, không khóa phương pháp luận văn cuối cùng. Test được liệt kê không phải evidence rằng PyTorch/PyG implementation tương lai đã đúng; đây là contract boundary ban đầu cho một implementation có thể có.

| Decision / contract | Module | Test ban đầu | Maturity |
|---|---|---|---|
| D1, D8: block direction và cross-layer re-entry | `src/grapes_rec/blocks.py` | T11, T12 | `TOY TEST EXECUTED` |
| D2: rectangular block normalization | `src/grapes_rec/blocks.py` | T14 helper check | `TOY TEST EXECUTED` |
| D4: positive cost-times-log-probability sign | `src/grapes_rec/objectives.py` | T18 | `TOY TEST EXECUTED` |
| D5, D10: detached ranking signal và mean reduction boundary | `src/grapes_rec/objectives.py` | T22; gradient isolation đầy đủ còn mở | `PARTIAL` |
| D6: target-conditioned TB scalar | `src/grapes_rec/objectives.py` | T19 scalar boundary | `TOY TEST EXECUTED` |
| D7: sampler ownership | `src/grapes_rec/models.py` | contract validation còn mở | `SPECIFIED` |
| D9: transient positive-edge masking | `src/grapes_rec/data_protocol.py` | T23 | `TOY TEST EXECUTED` |
| D11: full Bernoulli likelihood cho small/empty case | `src/grapes_rec/sampling.py` | T09 và edge case còn mở | `PARTIAL TOY TEST` |
| Dataset Gate G2: provenance và graph audit | `scripts/analyze_amazon_dataset.py`; `notebooks/01_amazon_dataset_audit_vn.ipynb` | Toy fixture smoke check; local raw audit đã execute; persistent Colab rerun/protocol closure còn mở | `IMPLEMENTED; RAW AUDIT EXECUTED / G2 OPEN` |
| T01–T03: target và graph ID | `src/grapes_rec/contracts.py` | T01–T03 | `TOY TEST EXECUTED` |
| T05–T08: candidate và exact-k semantic | `src/grapes_rec/sampling.py` | T05–T08 | `TOY TEST EXECUTED` |

## Cố ý chưa có

Scaffold hiện có streaming dataset-audit utility và local raw audit evidence. Vẫn chưa có persistent Amazon acquisition evidence đã finalized, temporal split do project freeze, negative sampling, PyTorch/PyG message passing, GRAPES policy training, checkpointed experiment, full-catalog evaluation hoặc recommendation result nào.
