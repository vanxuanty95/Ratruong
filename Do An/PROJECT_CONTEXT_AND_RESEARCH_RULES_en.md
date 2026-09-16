# Current research context and rules

> Updated: 2026-09-16

## Research question

The thesis studies computation-graph sampling for LightGCN recommendation:

> With the dataset, model, optimization steps, per-layer budget, seeds, evaluator, and GPU held fixed, does a batch-frontier-conditioned sampler provide a better ranking-quality versus computation-cost trade-off than uniform and degree-aware sampling?

Here, **context** means the neighboring nodes and edges used for propagation in the current batch and layer. It does not mean product semantics or a user's real-world situation.

## Data and population

- Primary dataset: Amazon Reviews'23 `Baby_Products`, 0-core rating-only.
- Fields: `user_id`, `parent_asin`, `rating`, `timestamp`.
- Positive interaction: rating 4 or 5.
- User/item mapping, graph degree, and cohorts use training data only.
- Validation and test are projected into the frozen mapping; evaluation is warm-start.
- Current model results are validation-only. Test targets remain unread.

The training graph contains 3,868,654 edges, 2,318,308 users, and 162,125 items. It is extremely sparse: 71.76% of training users have one interaction, item-degree Gini is 0.8584, and the top 1% of items receive 44.09% of training interactions.

## Samplers

- **M0, uniform:** every eligible context node receives equal sampling weight.
- **M1, degree-aware:** nodes with more training edges receive higher priority.
- **M2, frontier-normalized:** nodes receive more priority when they connect to the current frontier, with a penalty for high global degree.

All methods use the same layer budget `[65,536, 65,536, 65,536]`, batch size, five epochs, 300 optimizer steps, BPR negatives, evaluator, paired random inputs, and Tesla T4. Only the proposal changes.

## Metrics and meaning

- NDCG@20 is primary because rank position matters.
- Recall@20 records whether the held-out target appears in the first 20 items.
- Catalog Coverage@20 detects collapse to a small catalog subset.
- Head/body/tail exposure shows where recommendation slots are allocated.
- Cohort recall and hit counts show whether exposure becomes correct recommendation.
- Training time and peak GPU memory represent cost.
- Rank transitions diagnose mechanisms but do not replace NDCG or Recall.

Semantic relevance and intra-list semantic diversity are not measured. The artifact has no titles, categories, descriptions, images, or content embeddings. Catalog coverage is not semantic diversity.

## Locked result

| Method | NDCG@20 mean | Recall@20 mean | Coverage@20 mean |
|---|---:|---:|---:|
| M0 | 0.005706 | 0.014869 | **0.018132** |
| M1 | **0.005866** | **0.015296** | 0.017534 |
| M2 | 0.005721 | 0.014873 | 0.017513 |

M2 is lower than M1 in NDCG and Recall on all three validation seeds. By the three-seed means, M2 is 2.47% lower in NDCG and 2.77% lower in Recall. On the two new repeats it is 114.88 seconds slower on average, while peak GPU memory differs by only about 4.11 MiB. Tail hits are zero for all methods and seeds.

The bounded conclusion is: **M2 does not provide a better quality-cost trade-off than M1 under the registered protocol.** M1 has the highest mean validation quality but does not beat M0 on every seed.

## Claim boundaries

Do not claim significance, universal superiority, cross-budget or cross-dataset performance, test performance, cold-start capability, semantic diversity, or general scalability. Do not open M3 or use test data to rescue M2 after seeing validation results.

## Canonical files

- Timeline: [`00_project/PHASE2_RESEARCH_PLAN_en.md`](./00_project/PHASE2_RESEARCH_PLAN_en.md)
- Presentation narrative: [`03_reports/REPORT_TEACHER_en.md`](./03_reports/REPORT_TEACHER_en.md)
- Thesis draft: [`04_thesis/THESIS_REPORT_en.md`](./04_thesis/THESIS_REPORT_en.md)
- Experiments: [`06_code/README_en.md`](./06_code/README_en.md)
- Current deck: [`05_slides/THESIS_PRESENTATION_vn.pptx`](./05_slides/THESIS_PRESENTATION_vn.pptx)
