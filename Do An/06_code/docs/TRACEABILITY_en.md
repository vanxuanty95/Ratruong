# GRAPES-Informed Reference-Design Traceability

This table maps reference-design decisions and the first executable toy tests. The decisions and tests are verification candidates, not a lock on the final thesis method. A test listed here is not evidence that the future PyTorch/PyG implementation is correct; it is an initial contract boundary for a possible implementation.

| Decision / contract | Module | Initial test coverage | Maturity |
|---|---|---|---|
| D1, D8: block direction and cross-layer re-entry | `src/grapes_rec/blocks.py` | T11, T12 | `TOY TEST EXECUTED` |
| D2: rectangular block normalization | `src/grapes_rec/blocks.py` | T14 helper check | `TOY TEST EXECUTED` |
| D4: positive cost-times-log-probability sign | `src/grapes_rec/objectives.py` | T18 | `TOY TEST EXECUTED` |
| D5, D10: detached ranking signal and mean reduction boundary | `src/grapes_rec/objectives.py` | T22; full gradient isolation pending | `PARTIAL` |
| D6: target-conditioned TB scalar | `src/grapes_rec/objectives.py` | T19 scalar boundary | `TOY TEST EXECUTED` |
| D7: sampler ownership | `src/grapes_rec/models.py` | contract validation pending | `SPECIFIED` |
| D9: transient positive-edge masking | `src/grapes_rec/data_protocol.py` | T23 | `TOY TEST EXECUTED` |
| D11: full Bernoulli likelihood for small/empty cases | `src/grapes_rec/sampling.py` | T09 and edge cases pending | `PARTIAL TOY TEST` |
| Dataset Gate G2: provenance and graph audit | `scripts/analyze_amazon_dataset.py`; `notebooks/01_amazon_dataset_audit_en.ipynb` | Toy fixture smoke check; local raw audit executed; persistent Colab rerun/protocol closure open | `IMPLEMENTED; RAW AUDIT EXECUTED / G2 OPEN` |
| T01–T03: target and graph IDs | `src/grapes_rec/contracts.py` | T01–T03 | `TOY TEST EXECUTED` |
| T05–T08: candidate and exact-k semantics | `src/grapes_rec/sampling.py` | T05–T08 | `TOY TEST EXECUTED` |

## Intentionally absent

The scaffold includes a streaming dataset-audit utility and local raw audit evidence. It does not yet include finalized persistent Amazon acquisition evidence, project-frozen temporal splitting, negative sampling, PyTorch/PyG message passing, GRAPES policy training, checkpointed experiments, full-catalog evaluation, or any recommendation result.
