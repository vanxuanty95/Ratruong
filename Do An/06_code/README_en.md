# Thesis Graph-Sampling Code Scaffold

> **Status:** `DATASET GATE G2 PASS — BABY G2-C/G2-D EXECUTED AND REVIEWED`
> **Purpose:** provide the first executable home for Phase 2 reference contracts, dataset controls, and the future project-developed graph sampler.  
> **Not yet provided:** PyTorch/PyG implementation, locked final profiling environment, benchmark runner, or recommendation-quality result.

The package is intentionally dependency-free at this early stage so the small contract tests can run on the local machine and in a clean Colab Python runtime. This is not the final model implementation. E0-MIN, G1, and G2 now pass, so G3 shared evaluator/baseline execution may begin. Sampler implementation still waits for G3. E0-FINAL is required later for final resource evidence.

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
| Amazon acquisition/preprocessing | `FULL BABY G2-C/G2-D EXECUTED, READ BACK, AND PASSED` |
| Amazon dataset audit | `PORTFOLIO AUDIT EXECUTED; BABY G2-A/G2-B PASS` |
| PyTorch/PyG recommender | `NOT STARTED` |
| GRAPES-informed learned reference variants | `NOT STARTED` |
| Colab launcher | `THIN SKELETON` |
| Environment lock | `E0-MIN PASS; E0-FINAL OPEN` |
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

The command currently runs 13 pure-Python tests: ten reference-contract tests, two audit tests, and one end-to-end toy G2-C/G2-D notebook test. Full Baby preprocessing has separately executed and is mirrored in `results/baby_p4_g2c_manifest.json`; neither source is a validated PyTorch/PyG model or recommender result.

## Planned next implementation steps

1. Implement the G3 shared exact evaluator and simplest sanity baselines.
2. Add the full-graph LightGCN reference and matched uniform/degree-aware controls.
3. Use the reviewed frozen artifacts as the shared data interface; do not reconstruct IDs or graph statistics from validation/test data.
4. Record the model environment separately from the completed bounded CPU/Colab E0-MIN record.
5. Freeze the final PyTorch/PyG/CUDA profiling environment after the target GPU is confirmed.
6. Apply the G1 validation-only method-selection rule only after G3 passes.

## Source governance

The Phase 2 implementation must record whether it ports or reimplements code from the pinned official GRAPES reference commit `71ecebeaac896800aa4dd1d0f38c57ec222ef396`. The Phase 1 local snapshot is historical evidence and is read-only.
