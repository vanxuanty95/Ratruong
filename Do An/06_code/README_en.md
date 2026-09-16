# Code and experimental evidence

> Status: all six additional paired runs are complete. Combined with design seed s0, the comparison covers three validation seeds for M0–M2. Test targets remain unread.

## No Colab rerun is required for the presentation

Notebooks 03–10 have completed and their required outputs are stored under `results/`. Rerun only for reproduction or artifact recovery, not to select a better seed or alter M2 after inspecting results.

## Notebook order

| Notebook | Purpose | Status |
|---|---|---|
| `00_colab_setup_and_oracles_*` | Toy graph, sampling, and objective oracles | Complete |
| `01_amazon_dataset_audit_*` | Exact Amazon portfolio audit | Complete |
| `02_baby_p4_temporal_graph_*` | Temporal graph and warm-start targets | Complete |
| `03_data_story_eda.ipynb` | Full-data EDA | Complete |
| `04_mostpop_validation_sanity.ipynb` | Popularity baseline | Complete |
| `05_bpr_mf_validation_sanity.ipynb` | Matrix-factorization baseline | Complete |
| `06_full_lightgcn_validation_sanity.ipynb` | Full-graph LightGCN | Complete |
| `07_uniform_sampling_validation_sanity.ipynb` | M0 | Complete |
| `08_degree_aware_sampling_validation_sanity.ipynb` | M1 | Complete |
| `09_frontier_normalized_sampling_validation_sanity.ipynb` | M2 | Complete |
| `10_paired_sampling_validation.ipynb` | Two additional paired seeds | 6/6 runs complete |

## Main evidence

Audit JSON and the temporal graph manifest are stored directly under `results/`. EDA, baseline, sampler, and paired outputs each have their own directory. Result-directory ZIP files are original transfer bundles; saved `.npz` rank vectors allow metric and transition recomputation. No model checkpoint is part of the registered validation bundle.

## Three-seed summary

| Method | NDCG@20 mean ± SD | Recall@20 mean ± SD | Coverage@20 mean ± SD |
|---|---:|---:|---:|
| M0 | 0.00570640 ± 0.00007324 | 0.01486892 ± 0.00048771 | **0.01813210 ± 0.00031820** |
| M1 | **0.00586598 ± 0.00024947** | **0.01529642 ± 0.00062009** | 0.01753380 ± 0.00062722 |
| M2 | 0.00572092 ± 0.00017933 | 0.01487299 ± 0.00057942 | 0.01751324 ± 0.00031838 |

M2 minus M1 is negative in NDCG and Recall for s0, s1, and s2. On the two new repeats, M2 is 114.88 seconds slower on average. Tail hits remain zero for every method and seed.

## Local verification

```bash
/Users/tyvan/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3 \
  -m unittest discover -s tests -p 'test_*.py' -v
```

```bash
/Users/tyvan/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3 \
  scripts/verify_research_consistency.py \
  --repo-root ../../
```

## Reproduction on Colab

If reproduction is required, keep the same Drive root, artifact hashes, configs, seeds, Tesla T4 class, and output paths. Notebook 10 validates completed runs and reports `SKIP_VERIFIED`; do not delete valid paired outputs before resuming. Do not run concurrent notebook copies into the same output folder.

## Claim boundary

- Validation-only; test targets are unread.
- M2 is not promoted and is not a learned sampler.
- M1 has the best mean quality but does not beat M0 on every seed.
- Three seeds do not establish significance or universal superiority.
- Semantic relevance, semantic diversity, and cold-start are not evaluated.
