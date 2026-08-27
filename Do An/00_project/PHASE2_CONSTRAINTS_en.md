# Phase 2 Constraint Record

> **Status:** `PARTIALLY RESOLVED — GPU RESERVATION AND INSTITUTIONAL DETAILS OPEN`  
> **Week:** 1  
> **Recorded:** 2026-08-26  
> **Scope:** direct adaptation of GRAPES to graph-based recommendation only.

## 1. Locked constraints

| ID | Constraint | Status | Evidence |
|---|---|---|---|
| C-001 | Phase 2 has one direction only: directly adapt GRAPES to recommendation | `LOCKED` | Direct user instruction and synchronized continuity files |
| C-002 | `ThucTap2` is read-only reference material | `LOCKED` | Project rule |
| C-003 | All new persistent outputs are stored under `Do An` | `LOCKED` | Project rule |
| C-004 | Language-bearing outputs require synchronized `_en` and `_vn` files | `LOCKED` | Project rule |
| C-005 | Substantive research/design work requires two independent agents and cross-critique | `LOCKED` | Project rule |
| C-006 | Main task variants are GRAPES-RL-Rec and GRAPES-GFN-Rec | `LOCKED SCOPE` | Phase 2 plan; implementation details remain proposed |
| C-007 | Failure does not authorize a new direction | `LOCKED` | Direct user scope decision |
| C-008 | Phase 2 must finish within 12 weeks | `LOCKED` | Direct user instruction on 2026-08-26 |
| C-009 | The implementation language is Python | `LOCKED` | Direct user instruction on 2026-08-26 |
| C-010 | The project uses Amazon Reviews data and must source/prepare it independently | `LOCKED DATA FAMILY` | Direct user instruction on 2026-08-26 |
| C-011 | The expected thesis standard is high | `LOCKED EXPECTATION; RUBRIC OPEN` | Direct user instruction on 2026-08-26 |
| C-012 | Google Colab is available for cloud development and removes local-disk capacity from the feasibility gate | `LOCKED AVAILABILITY` | Direct user instruction on 2026-08-26 |

## 2. Verified local infrastructure

| Item | Verified value | Consequence |
|---|---|---|
| Machine | Mac mini, Apple M4, 10 CPU cores, 16 GB unified memory | Suitable for documentation, code review, and bounded preprocessing/debugging |
| NVIDIA GPU | Not present; `nvidia-smi` is unavailable | Final CUDA memory/runtime evidence cannot be produced locally |
| System Python | Python 3.14.5 | A project environment must be created separately; do not install into the system interpreter |
| PyTorch in system Python | Not installed | No local model run is currently ready |
| Free disk space | Approximately 14 GiB on the workspace volume at audit time | Large datasets must not be stored locally; this is no longer a feasibility blocker because Colab/cloud storage is available |
| Current `Do An` size | Approximately 136 KiB before Week 1 artifacts | Project outputs are currently small |
| Phase 1 repository environment | Python 3.9.20, PyTorch 1.13.1, CUDA 11.7, PyG 2.5.2 in `environment.yml` | Historical manifest only; not yet approved as the Phase 2 environment |
| Phase 1 Colab reproduction | Tesla T4, PyTorch 2.11.0+cu128, PyG 2.7.0, OGB 1.3.6 | Historical executed environment; differs from the repository manifest |

`INFERENCE`: The local Mac can support specification, unit-test development on toy graphs after a compatible environment is created, and small preprocessing. It cannot support the final NVIDIA/CUDA resource comparison required by the plan.

## 3. Supplied and unresolved inputs

| ID | Required input | Current status | Why it matters |
|---|---|---|---|
| U-001 | Thesis deadline | `PARTIALLY KNOWN: 12-WEEK WINDOW` | The plan is compressed to 12 weeks; exact calendar submission/defense dates remain unknown |
| U-002 | Supervisor milestones and meeting cadence | `UNKNOWN` | Determines review/freeze dates |
| U-003 | University novelty and evaluation requirements | `PARTIALLY KNOWN: HIGH USER EXPECTATION` | The internal evidence standard is defined below; the formal university/supervisor rubric remains unknown |
| U-004 | Available NVIDIA GPU model(s) and VRAM | `BORROWING POSSIBLE; EXACT DEVICE UNKNOWN` | Canonical request is one fixed A100 80 GB; availability must be confirmed |
| U-005 | Available GPU-hours and access schedule | `UNKNOWN` | Week 3 profiling must replace estimates before the final run matrix is frozen |
| U-006 | Cloud or compute availability | `PARTIALLY KNOWN: GOOGLE COLAB AVAILABLE` | Colab tier, compute units, GPU availability, and runtime continuity are not guaranteed |
| U-007 | Persistent cloud storage | `CAPACITY NOT A USER CONCERN; SERVICE/RETENTION OPEN` | Raw data, manifests, checkpoints, and results still require a persistent location and retention policy |
| U-008 | Dataset access and licensing | `AMAZON SELECTED; ACCESS/USAGE NOTE OPEN` | Pin the exact official artifact, category, hash, citation, and usage/legal note before acquisition |
| U-009 | Implementation and thesis format | `PYTHON LOCKED; THESIS FORMAT UNKNOWN` | Python is the implementation language; template, page limit, and submission language remain unknown |
| U-010 | Success criterion | `HIGH EXPECTATION; NO NUMERIC THRESHOLD` | Prevent post-hoc success claims; use the evidence package below rather than inventing an accuracy threshold |

## 4. Adjudicated compute proposal

- **Canonical final hardware request:** one fixed NVIDIA A100 80 GB. Use one process and one complete run per GPU. A second A100 is useful for paired-seed parallelism but is not required after Colab is included.
- **Minimum operational final hardware:** one NVIDIA RTX 6000 Ada 48 GB. A 24 GB GPU is for debugging only, not the primary final resource evidence.
- **Colab role:** preprocessing, data-pipeline checks, unit tests, smoke tests, development runs, and checkpointable preliminary trials.
- **Colab exclusion:** do not compare runtime, peak memory, or sampler efficiency across heterogeneous managed-Colab GPU allocations. Colab reports dynamic hardware availability, usage limits, and VM lifetimes.
- **Final profiling invariant:** all final resource comparisons use the same physical GPU class, software lock, precision, and profiling procedure.
- **Persistent storage:** use cloud/object/Drive-backed storage for immutable raw data, manifests, processed artifacts, checkpoints, and raw results. Stage active archives on runtime-local disk and upload outputs atomically. Local 4 TB NVMe is not required.
- **Environment proposal:** Linux/amd64, Python 3.11, and version-locked PyTorch, PyG, CUDA, driver, and dependency manifests. Freeze exact versions only after the borrowed GPU is confirmed.
- **Compute envelope:** do not freeze GPU-hours by speculation. Request enough quota for development plus five paired final seeds, and replace the provisional estimate with a measured Week 3 end-to-end benchmark.

Official hardware facts used for capacity planning: A100 80 GB PCIe has 80 GB HBM2e and approximately 1.94 TB/s memory bandwidth; RTX 6000 Ada has 48 GB GDDR6 ECC. Sources: [NVIDIA A100 data sheet](https://www.nvidia.com/content/dam/en-zz/Solutions/Data-Center/a100/pdf/nvidia-a100-datasheet-nvidia-us-2188504-web.pdf) and [NVIDIA RTX 6000 Ada specifications](https://www.nvidia.com/en-us/products/workstations/rtx-6000/).

## 5. Amazon data proposal

- **Dataset family:** Amazon Reviews 2023 only; MovieLens is retired from the active plan.
- **Pipeline-validation category:** `All_Beauty` pure-ID 0-core, used only to test acquisition and preprocessing.
- **Primary thesis category:** `Baby_Products` pure-ID 0-core, still `PROPOSED` until its artifact, size, hash, split, and post-filter statistics are audited.
- **Acquisition scope:** download only the required per-category ratings/pure-ID artifact. Do not download all 33 categories or unused text/image metadata.
- **Primary preparation order:** validate schema and duplicates; define implicit positives; make a global chronological split; run iterative core filtering on training positives only; freeze the user/item universe; project validation/test into that universe; compute every graph statistic from training only.
- **Provenance:** retain canonical URL, retrieval time, ETag/Last-Modified when present, compressed/decompressed byte size, SHA-256, schema, split cutoff, preprocessing-config hash, and code commit.

The official release reports 571.54 million reviews overall. Raw `Baby_Products` has approximately 3.4 million users, 217.7 thousand items, and 6.0 million ratings before our split/filter protocol. These are planning statistics, not final thesis counts. Source: [Amazon Reviews 2023 official documentation](https://amazon-reviews-2023.github.io/main.html).

## 6. Operational meaning of high expectations

- close D1–D11 with equations, tensor shapes, and test oracles; pass T01–T25;
- package a pinned, modular Python implementation with deterministic configuration and automated tests;
- produce an immutable, checksum-addressed, rerunnable, leakage-safe Amazon data package;
- execute MostPop, BPR-MF, full LightGCN, Random-Sampling-Rec, Degree-Sampling-Rec, GRAPES-RL-Rec, and GRAPES-GFN-Rec under controlled budgets;
- use exact full-catalog NDCG@20 as the primary quality metric and report Recall@20 as secondary;
- use one smoke seed, three fixed development seeds, and five paired final seeds for primary comparisons when measured compute permits;
- report effect sizes, uncertainty, failed runs, peak memory, wall-clock time, sampler/propagation time, and throughput;
- complete a clean-environment representative rerun and regenerate tables/figures from raw results;
- report a rigorous negative result if GRAPES does not improve recommendation; do not invent an arbitrary success threshold.

## 7. Remaining decisions before experiment scale freezes

- confirm the borrowed GPU model, access window, and whether exclusive profiling is possible;
- identify the persistent cloud storage location and retention policy;
- measure a Week 3 end-to-end pilot before freezing GPU-hours, batch size, embedding dimension, budgets, and trial count;
- audit and pin the exact `Baby_Products` artifact and post-filter scale;
- obtain supervisor milestones, thesis template/language/page limit, and formal evaluation rubric;
- close D1, D2, D4, D5, D6, D7, and D9 before implementation of the learned variants.

Google states that managed Colab resource limits, VM lifetimes, and GPU types vary and are not guaranteed; runtime VMs are temporary. Therefore Colab removes the local-disk blocker but does not replace provenance, persistent storage, environment locks, or same-hardware final profiling. Source: [Google Colab FAQ](https://research.google.com/colaboratory/faq.html).
