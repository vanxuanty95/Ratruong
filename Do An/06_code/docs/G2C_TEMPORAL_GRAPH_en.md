# Baby P4 temporal graph: G2-C/G2-D execution guide

The paired self-contained notebooks `02_baby_p4_temporal_graph_en.ipynb` and `_vn.ipynb` implement the next Dataset Gate step. The implementation and its toy fixture have executed; the full `Baby_Products` run and gate review remain open.

## What the notebook does and why

1. It reads the checksummed Baby 0-core file, quarantines rating `0.0`, keeps P4 positives (`4 <= rating <= 5`), and resolves repeated user-item pairs by earliest timestamp then stable source order. This preserves the interaction meaning selected in G2-B.
2. It applies the candidate global cutoffs with strict intervals: training `< t1`, validation `[t1,t2)`, and test `>= t2`. The cutoffs remain candidates until the generated evidence is reviewed.
3. It applies any degree filter only to training positives and creates lexicographic user/item mappings only from that filtered training graph. This prevents future validation/test activity from defining the graph or ID universe.
4. It projects later targets into the frozen mappings. Every target is classified as warm retained, unseen-user only, unseen-item only, or both unseen; the ledger must reconcile exactly.
5. For each retained target, it defines the candidate set as the complete frozen training-item universe minus that user's mapped P4 positives with timestamps strictly earlier than the target. Same-timestamp events are not prior history, and the target must remain present.
6. It writes deterministic compressed edge, mapping, and target artifacts plus `baby_p4_g2c_manifest.json`, then performs a bounded chunked catalog traversal without training a recommender.

## Indicators and interpretation

- Training edges/users/items, density, degree quantiles, and connected components describe the graph actually available to a model. They do not measure recommendation quality.
- Filter iterations and removed nodes/edges disclose how activity filtering changes the estimand. The default degree thresholds are `1`, so the initial full run adds no k-core restriction beyond membership in training positives.
- OOV counts and warm-target retention define the population covered by the future pure-ID result. High exclusion means a narrow warm-start claim, not a weak model.
- Candidate count, removed-prior-history count, target-presence checks, and chunk count verify the exact ranking-task construction. They are not NDCG or Recall.
- Dry-run wall time, process peak RSS, traversed targets, and candidate comparisons describe only the bounded execution envelope. They are not final profiling or scalability evidence.
- SHA-256 and byte counts identify each generated artifact. `implementation_sha256` identifies the embedded implementation cell; the manifest does not attempt to contain a self-referential hash of itself.

## Run and decision boundary

Open the Vietnamese or English Drive notebook and use **Run all**. Expected output is `MyDrive/Phase2_Amazon_Audit/g2c_baby_p4/baby_p4_g2c_manifest.json` plus five compressed artifacts. A successful run moves the evidence to review; G2-C/G2-D pass only after the manifest is read back, arithmetic and invariants are checked, candidate cutoffs are accepted or revised, and the environment record is judged adequate. No model comparison or headline metric may be inferred from this notebook.
