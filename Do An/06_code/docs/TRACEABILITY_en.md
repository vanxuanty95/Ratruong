# GRAPES-Informed Reference-Design Traceability

> **Current status, 2026-09-16:** this is a historical traceability record for the GRAPES-informed reference design. The completed empirical work is the fixed M0/M1/M2 comparison described in [`../../04_thesis/THESIS_REPORT_en.md`](../../04_thesis/THESIS_REPORT_en.md). No RL, GFlowNet, or learned sampler policy was implemented or evaluated.

This table maps reference-design decisions and the first executable toy tests. The decisions and tests are verification candidates, not a lock on the final thesis method. A test listed here is not evidence that a PyTorch/PyG implementation is correct; it is an initial contract boundary for a possible implementation.

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
| Dataset Gate G2-A/G2-B: provenance and protocol audit | `scripts/analyze_amazon_dataset.py`; `notebooks/01_amazon_dataset_audit_en.ipynb` | Portfolio audit executed and mirrored | `EXECUTED; BABY G2-A/G2-B PASS` |
| Dataset Gate G2-C/G2-D: training-only temporal graph and bounded traversal | `notebooks/02_baby_p4_temporal_graph_en.ipynb`; `results/baby_p4_g2c_manifest.json` | Toy contract plus full manifest arithmetic/hash/environment/replay readback | `G2-C PASS; G2-D PASS; G2 PASS` |
| T01–T03: target and graph IDs | `src/grapes_rec/contracts.py` | T01–T03 | `TOY TEST EXECUTED` |
| T05–T08: candidate and exact-k semantics | `src/grapes_rec/sampling.py` | T05–T08 | `TOY TEST EXECUTED` |

## Intentionally absent

The project includes reviewed Baby temporal artifacts and a complete bounded G2-D environment/replay record. It subsequently completed fixed-budget BPR/LightGCN baseline checks and the paired M0/M1/M2 validation with exact full-catalog validation ranking. This traceability table itself does not provide evidence for an RL, GFlowNet, or learned-policy implementation.
