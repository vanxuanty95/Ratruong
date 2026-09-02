# Thesis Graph-Sampling Code Scaffold

> **Status:** `DATASET GATE — TEMPORARY RAW AUDIT EXECUTED; PERSISTENCE AND PROTOCOL OPEN`  
> **Purpose:** provide the first executable home for Phase 2 reference contracts, dataset controls, and the future project-developed graph sampler.  
> **Not yet provided:** finalized Amazon artifact/manifest, PyTorch/PyG implementation, locked environment, benchmark runner, or recommendation-quality result.

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
| Toy correctness tests | `IMPLEMENTED AND EXECUTED: 10/10 PASS ON CPU` |
| Amazon acquisition/preprocessing | `OPEN` |
| Amazon dataset audit | `IMPLEMENTED; LOCAL RAW AUDIT EXECUTED; PERSISTENT COLAB RUN OPEN` |
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
├── configs/toy_oracles.yaml
├── manifests/data_manifest.schema.json
├── src/grapes_rec/
│   ├── contracts.py
│   ├── sampling.py
│   ├── blocks.py
│   ├── objectives.py
│   ├── data_protocol.py
│   └── models.py
├── tests/test_week1_oracles.py
├── scripts/analyze_amazon_dataset.py
└── docs/TRACEABILITY_en.md / TRACEABILITY_vn.md / DATASET_AUDIT_en.md / _vn.md
```

## Local or Colab smoke command

From the `06_code` directory:

```bash
python -m unittest discover -s tests -v
```

The command tests only pure-Python contracts. The current 10/10 result must not be reported as a validated PyTorch/PyG implementation or an end-to-end Colab reproduction.

## Planned next implementation steps

1. Follow the bounded dataset portfolio in [`DATASET_PORTFOLIO_AND_ANALYSIS_PROTOCOL_en.md`](../00_project/DATASET_PORTFOLIO_AND_ANALYSIS_PROTOCOL_en.md): `All_Beauty` only for development diagnostics; audit `Baby_Products` as the primary candidate; then perform a bounded `Home_and_Kitchen` scale audit.
2. Resolve the high-OOV absolute-split result, then freeze the exact artifact, item key, duplicate policy, implicit-positive rule, temporal split, warm-start filtering, and negative-sampling policy from the audit evidence.
3. Confirm the final Python/PyTorch/PyG/CUDA lock and record it in `environment/`.
4. Replace the placeholder data interfaces with the authorized, checksummed Amazon artifact and leakage-safe preprocessing.
5. Implement the dependency tests T01–T11 and T16–T17 around the same contracts.
6. Implement and execute the high-risk oracles T12, T14, T18, T19, and T23.
7. Add matched baseline samplers, the GRAPES-informed reference, and the project-developed sampler only after the shared contracts pass.

## Source governance

The Phase 2 implementation must record whether it ports or reimplements code from the pinned official GRAPES reference commit `71ecebeaac896800aa4dd1d0f38c57ec222ef396`. The Phase 1 local snapshot is historical evidence and is read-only.
