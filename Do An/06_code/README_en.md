# Thesis Graph-Sampling Code Scaffold

> **Status:** `DATASET GATE — PORTFOLIO AUDIT COMPLETE; BABY G2-C/G2-D IMPLEMENTED, FULL RUN OPEN`
> **Purpose:** provide the first executable home for Phase 2 reference contracts, dataset controls, and the future project-developed graph sampler.  
> **Not yet provided:** reviewed full Baby G2-C artifacts/cutoff freeze, PyTorch/PyG implementation, locked final environment, benchmark runner, or recommendation-quality result.

The package is intentionally dependency-free at this early stage so the small contract tests can run on the local machine and in a clean Colab Python runtime. This is not the final model implementation. Under the canonical gate register, E0-MIN and G2 must pass before G3 execution; sampler implementation additionally waits for G1 and G3. E0-FINAL is required later for final resource evidence.

## Current scope

The scaffold currently encodes GRAPES-informed reference contracts from `02_protocol/GRAPES_RECOMMENDATION_SPEC_en.md`; they are comparators and verification candidates, not the pre-fixed thesis method:

- disjoint user/item IDs and ordered BPR triplets;
- deduplicated initial target set `V⁰` without changing triplet order;
- bipartite neighborhood and non-cumulative candidate construction;
- exact-cardinality selection and finite full-Bernoulli log-likelihood;
- source-to-target sampled blocks and explicit prefix propagation primitives;
- rectangular normalization helper;
- BPR loss, two-action REINFORCE gradient oracle, and TB loss helper;
- transient removal of both storage directions of the current positive edge;
- traceability from the frozen decisions and registered tests to source modules.
- a standard-library streaming audit for the official Amazon Reviews'23 pure-ID 0-core artifacts, including checksum, schema, duplicate, rating, timestamp, degree, split-coverage, and negative-pool diagnostics.

## Maturity boundary

| Area | Current status |
|---|---|
| Semantic contracts | `SCAFFOLDED` |
| Toy correctness tests | `IMPLEMENTED AND EXECUTED: 13/13 PASS ON CPU` |
| Amazon acquisition/preprocessing | `G2-C/G2-D NOTEBOOK IMPLEMENTED AND TOY-EXECUTED; FULL BABY RUN OPEN` |
| Amazon dataset audit | `PORTFOLIO AUDIT EXECUTED; BABY G2-A/G2-B PASS` |
| PyTorch/PyG recommender | `NOT STARTED` |
| GRAPES-informed learned reference variants | `NOT STARTED` |
| Colab launcher | `THIN SKELETON` |
| Environment lock | `OPEN` |
| Recommendation metrics and resource results | `NOT STARTED` |

## Layout

```text
06_code/
├── README_en.md / README_vn.md
├── pyproject.toml
├── environment/ENVIRONMENT_LOCK_PENDING.txt
├── notebooks/00_colab_setup_and_oracles_en.ipynb / _vn.ipynb
├── notebooks/01_amazon_dataset_audit_en.ipynb / _vn.ipynb
├── notebooks/02_baby_p4_temporal_graph_en.ipynb / _vn.ipynb
├── configs/toy_oracles.yaml
├── manifests/data_manifest.schema.json
├── src/grapes_rec/
│   ├── contracts.py
│   ├── sampling.py
│   ├── blocks.py
│   ├── objectives.py
│   ├── data_protocol.py
│   └── models.py
├── tests/test_week1_oracles.py / test_dataset_audit.py / test_g2c_notebook.py
├── scripts/analyze_amazon_dataset.py
└── docs/TRACEABILITY_* / DATASET_AUDIT_* / G2C_TEMPORAL_GRAPH_*
```

The `01_amazon_dataset_audit_*` notebook is an exception to the general thin-launcher status: each language version contains the complete audit implementation and runs independently without `scripts/analyze_amazon_dataset.py`. The local script remains a testable source mirror; it is not a Colab dependency.

## Local or Colab smoke command

From the `06_code` directory:

```bash
python -m unittest discover -s tests -v
```

The command currently runs 13 pure-Python tests: ten reference-contract tests, two audit tests, and one end-to-end toy G2-C/G2-D notebook test. The result must not be reported as a validated PyTorch/PyG implementation, a full Baby preprocessing execution, or an end-to-end model reproduction.

## Planned next implementation steps

1. Run all cells in `02_baby_p4_temporal_graph_vn.ipynb` or `_en.ipynb` on Drive and read back `baby_p4_g2c_manifest.json` plus its five compressed artifacts.
2. Verify reconciliation, candidate invariants, artifact hashes, graph/component/OOV statistics, and bounded resource measurements; then accept or revise `t1`/`t2` and decide G2-C/G2-D.
3. Confirm the rerunnable E0-MIN Python/environment record before G3; retain a separate final PyTorch/PyG/CUDA lock for profiling.
4. Use the reviewed frozen artifacts as the shared data interface; do not reconstruct IDs or graph statistics from validation/test data.
5. After G2 and E0-MIN pass, implement the shared exact evaluator and simplest baselines under G3.
6. Add matched sampling controls and the GRAPES-informed reference only under the canonical gate dependencies; the project-developed sampler still waits for G1–G3.

## Source governance

The Phase 2 implementation must record whether it ports or reimplements code from the pinned official GRAPES reference commit `71ecebeaac896800aa4dd1d0f38c57ec222ef396`. The Phase 1 local snapshot is historical evidence and is read-only.
