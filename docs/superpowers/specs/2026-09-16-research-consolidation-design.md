# Research Narrative and Repository Consolidation Design

Date: 2026-09-16

## 1. Goal

Produce one coherent, defensible account of the project from the lecturer's questions to the experimental conclusion. The Vietnamese slide deck is the presentation artifact, while the Markdown files and saved results provide progressively deeper detail and traceability.

This consolidation must do four things together:

1. Explain the dataset, M0/M1/M2, metrics, results, limitations, and next decision in plain Vietnamese.
2. Answer the lecturer's questions inside the relevant slides rather than adding a separate checklist slide.
3. Make every active document agree with the frozen experimental evidence.
4. Remove superseded or generated files without deleting evidence needed to reproduce or audit the study.

## 2. Research statement

The study asks whether a task-conditioned graph sampler can give a better ranking-quality versus computation-cost trade-off than uniform and degree-aware sampling under the same Baby Products data, model, training budget, seeds, evaluator, and hardware.

The conclusion must remain narrow:

- M2 changed the sampled computation graph, so it was not an inert implementation.
- M2 did not improve the quality-cost trade-off over M1 under the registered smoke-budget protocol.
- M1 had the best mean validation quality across three seeds, but it did not beat M0 in every seed.
- No method produced a tail-item hit at top 20.
- The project must not claim statistical significance, universal superiority, semantic diversity, or cross-dataset scalability.

## 3. Evidence hierarchy

When files disagree, use this order of authority:

1. Raw audit JSON, graph manifest, run summaries, saved rank vectors, and frozen config files.
2. Validation reports stored beside those artifacts.
3. Code README and protocol documents.
4. Project overview, teacher report, thesis draft, and slide deck.
5. Old slide versions, build output, temporary exports, and working notes.

Narrative documents may simplify language, but they may not change values, denominators, evaluation scope, or claim boundaries from the evidence layer.

## 4. Dataset explanation

The deck will explain why `Baby_Products` is the primary dataset through two levels of comparison, not through a generic claim that it is "large".

### 4.1 Established non-Amazon benchmarks

The presentation will first place the project among established public recommendation datasets. These datasets are credible research benchmarks, but they are not interchangeable because they represent different recommendation tasks.

- **MovieLens 25M** is a stable GroupLens benchmark with 25,000,095 ratings from 162,541 users on 62,423 movies, plus tags and tag-genome relevance data. It is strong for conventional collaborative filtering and for evaluating content or semantic diversity. Its users have at least 20 ratings, so it does not preserve the extreme singleton-user structure that motivates this project's sampling analysis.
- **Gowalla** and **Yelp2018** are the closest methodological comparisons because the original LightGCN study evaluated graph collaborative filtering on them with Recall@20 and NDCG@20. In the LightGCN release, Gowalla has 1,027,370 interactions and Yelp2018 has 1,561,406. They are useful benchmark controls, but the released versions use filtered, processed interactions and a random 80/20 split rather than this project's raw-audit and temporal-split protocol.
- **MIND** contains behavior logs for about one million users and more than 160,000 news articles with title, abstract, and body text. It is appropriate for content understanding, rapidly changing items, and semantic relevance, but news recommendation is a different task from stable product recommendation.
- **KuaiRec** provides an almost fully observed user-item matrix for 1,411 users and 3,327 short videos. It is unusually valuable for studying exposure bias and offline-evaluation bias, but its small item catalog and dense matrix do not stress large sparse-graph sampling in the same way as Baby Products.

The benchmark sources used for this comparison are the official GroupLens MovieLens documentation, the original LightGCN paper and artifact, the ACL paper introducing MIND, and the CIKM paper introducing KuaiRec. The slide notes will link to those primary sources.

These external datasets will be described as considered alternatives, not as completed experiments. Adding one of them to the empirical study would create a separate registered validation branch rather than being inserted after observing the Baby results.

### 4.2 Audited Amazon alternatives

- `All_Beauty` has 693,929 rows. It is useful for developing and checking the pipeline, but its P4 warm-start validation population is too small for the main graph-sampling study.
- `Baby_Products` has 5,953,891 raw rows, strong sparsity and long-tail concentration, and remains feasible for the full paired experiment on Colab/Tesla T4. It is the main dataset because it gives enough graph scale to expose the sampling problem without making the registered experiment impractical.
- `Home_and_Kitchen` has 66,623,880 audited raw rows. It is about 11.19 times the size of Baby Products and is reserved for a bounded scale stress test if the thesis later requires a stronger scalability claim. It is not silently treated as completed evidence.

### 4.3 Counts and data quality

The explanation will distinguish three item counts when they appear:

- 217,654 valid raw items.
- 194,722 P4 items after keeping ratings 4 and 5.
- 162,125 training-catalog items used by the recommender and coverage denominator.

The data-quality account will state that there was one out-of-range rating, no missing user/item IDs, no invalid timestamps, and no duplicated user-item rows in the exact audit. The single invalid rating is quarantined rather than used. The project will not exaggerate this as a major denoising stage.

## 5. Plain-language method explanation

The method names stay M0/M1/M2 so they remain traceable to configs and results, but every first use includes a normal-language explanation.

- **M0, uniform sampling:** every eligible context node has the same chance of being selected. It is the neutral control that shows what happens when the sampler has no popularity preference.
- **M1, degree-aware sampling:** nodes with more training connections receive higher sampling priority. It is a strong static control because popular, well-connected nodes often carry stable collaborative signal, but it may reinforce popularity bias.
- **M2, frontier-normalized sampling:** a node receives more priority when it connects strongly to the current computation frontier, while its global training degree is used as a penalty. It tries to keep nodes that are locally relevant to the current batch without automatically favoring generic hubs.

"Context" will have one explicit meaning in the method section: the neighboring nodes and edges available to propagate information for the current batch and layer. The project will not use the word as an undefined synonym for user intent or product semantics.

## 6. Metric explanation

The deck will explain both what each metric measures and why it belongs in this study.

- **NDCG@20** is primary because the task returns a ranked list. A correct item near the top is more useful than the same item near rank 20.
- **Recall@20** makes the result easier to interpret: with one held-out target per evaluated user, it is the share of users whose target appears anywhere in the first 20 recommendations.
- **Catalog Coverage@20** checks whether recommendations collapse onto a tiny set of products. It measures how much of the training catalog appears at least once, not whether products are semantically diverse.
- **Head/body/tail exposure** shows where recommendation slots are distributed. It is necessary because aggregate accuracy can improve while the system keeps concentrating recommendations on popular items.
- **Recall and hits by item cohort** show whether wider exposure leads to correct recommendations for less-popular products. Exposure and successful recommendation are reported separately.
- **Training time and peak GPU memory** represent computation cost. They are required because the research question is a quality-cost trade-off, not ranking quality alone.
- **Rank transitions and gained/lost hits** diagnose how a sampler changed the ranking. They explain a negative result but do not replace NDCG@20 or Recall@20.

The deck will state that semantic match, intra-list semantic diversity, and content-based novelty are not measured. The pure-ID rating-only file contains no title, category, description, image, or text embedding. Catalog coverage and popularity-cohort exposure are structural diversity diagnostics only.

## 7. Slide narrative

The final Vietnamese deck will use one continuous argument. It will not include a separate "lecturer question checklist" table.

1. Research title and scope.
2. The practical research question and why sampling matters.
3. Established public recommendation benchmarks and what each is designed to measure.
4. Why Baby Products was selected over the audited Amazon alternatives.
5. Data source, schema, provenance, and what the fields can support.
6. Cleaning, temporal split, warm-start boundary, and leakage control.
7. Rating distribution and the decision to use ratings 4–5 as positive interactions.
8. Graph scale and user/item history distribution.
9. Imbalance, concentration, and long-tail evidence.
10. What the dataset can and cannot say about diversity and semantics.
11. Baselines and the fixed experimental contract.
12. M0, M1, and M2 in plain language, with the node-selection intuition.
13. Why NDCG, Recall, coverage, cohort metrics, time, and memory are used.
14. Baseline results and the accuracy-coverage tension.
15. The first matched M0/M1/M2 comparison and its mechanism evidence.
16. Three-seed paired validation.
17. Why M2 failed to improve the trade-off despite changing the sampled graph.
18. What the study establishes, what remains unmeasured, and the next bounded step.

Each slide will have one job and will carry its own source in speaker notes. Charts remain native/editable when they present quantitative evidence.

## 8. Writing style

Vietnamese is the canonical presentation language. Sentences should sound like an informed student explaining the work to a lecturer:

- use a technical term only when it changes the meaning;
- define the term on first use;
- prefer concrete subjects and verbs;
- avoid slogans, inflated claims, and decorative academic phrasing;
- separate observation, interpretation, and limitation;
- never hide an unmeasured question behind a related metric.

English mirrors may keep technical terminology, but their facts and claim boundaries must match the Vietnamese canonical documents.

## 9. Repository roles

### Active narrative files

These files must tell the same current story and will be rewritten or reconciled:

- `Do An/README_vn.md`
- `Do An/PROJECT_CONTEXT_AND_RESEARCH_RULES_{vn,en}.md`
- `Do An/00_project/PHASE2_RESEARCH_PLAN_{vn,en}.md`
- `Do An/03_reports/REPORT_TEACHER_{vn,en}.md`
- `Do An/04_thesis/THESIS_REPORT_{vn,en}.md`
- `Do An/06_code/README_{vn,en}.md`
- `Do An/05_slides/THESIS_PRESENTATION_vn.pptx`

### Protocol and reference files

Dataset protocol, research design, recommendation specification, traceability, audit documentation, literature matrix, source-version note, and graph manifest remain as supporting references. They will be corrected if they contain stale status statements, but they will not duplicate the presentation narrative.

### Reproducibility evidence

Final configs, notebooks, source modules, tests, raw summaries, rank vectors, manifests, audit JSON, validation reports, and result bundles remain when they uniquely prove how an experiment ran. A bundle and an extracted directory may both remain only when one is the original transfer artifact and the other is the readable working copy. Duplicate transfer copies with no unique provenance will be removed.

### Generated or superseded files

The cleanup will remove:

- `.DS_Store`, temporary chart-data folders, private build output, caches, and generated render directories;
- obsolete numbered Vietnamese slide versions after the accepted deck is promoted to the canonical filename;
- duplicate notebook-level bundle copies when the canonical result bundle already exists;
- repository IDE metadata and other machine-local files after an appropriate root `.gitignore` is added;
- a document only when its current function is fully covered by a named canonical replacement and it contains no unique evidence.

The original lecturer note `Do An/cô dặn 3:09` is retained unchanged as source material. Unrelated personal files in the main worktree remain untouched.

## 10. Consistency audit

Before deletion, every Markdown, notebook description, config, result report, and slide will be checked for:

- current research question and method names;
- dataset row/item/user counts and denominator definitions;
- M0/M1/M2 formulas and fixed-control claims;
- validation-only versus test usage;
- seed count and paired-run status;
- NDCG, Recall, coverage, cohort, time, and memory values;
- the negative M2 conclusion;
- semantic-diversity and scalability limitations;
- stale instructions that still ask the user to rerun an already completed experiment.

Any discrepancy will be resolved against the evidence hierarchy. A deletion ledger will be kept during the refactor so every removed file has a reason and, where applicable, a canonical replacement.

## 11. Verification and integration

Completion requires:

1. Automated tests for the research code and notebooks that can run locally.
2. Recalculation or schema checks for headline values from saved JSON and rank vectors.
3. Link and path checks in active Markdown files.
4. PPTX validation, rendering, and visual inspection for overflow, overlap, readability, source notes, and editable evidence.
5. A repository search confirming that removed slide versions, stale statuses, and superseded instructions are no longer referenced.
6. A clean diff review that excludes personal and unrelated files.

After verification, only the reviewed project paths will be copied or applied to the main worktree. They will be staged explicitly and committed on `main`. No bulk add, destructive reset, or overwrite of unrelated untracked files is allowed.

## 12. Acceptance criteria

- A lecturer can understand M0/M1/M2 and the metric choices without reading code.
- The dataset choice is defended with exact audited alternatives and practical constraints.
- The data-analysis slides explain scale, rating distribution, sparsity, imbalance, long tail, noise handling, and warm-start retention.
- Coverage, exposure diversity, cohort relevance, and semantic diversity are clearly distinguished.
- The negative M2 result is presented as a useful, bounded finding.
- Active documents and slides contain the same values and claim boundaries.
- Superseded and machine-generated files are removed, while reproducibility evidence remains.
- The final deck and source documents live under canonical filenames on `main`.

## 13. Primary sources for external benchmark context

- GroupLens, MovieLens 25M dataset and README: <https://grouplens.org/datasets/movielens/25m/>
- He et al., *LightGCN: Simplifying and Powering Graph Convolution Network for Recommendation*, SIGIR 2020: <https://hexiangnan.github.io/papers/sigir20-LightGCN.pdf>
- Official LightGCN artifact with processed Gowalla, Yelp2018, and Amazon-Book data: <https://github.com/kuandeng/LightGCN>
- Wu et al., *MIND: A Large-scale Dataset for News Recommendation*, ACL 2020: <https://aclanthology.org/2020.acl-main.331/>
- Gao et al., *KuaiRec: A Fully-observed Dataset and Insights for Evaluating Recommender Systems*, CIKM 2022: <https://arxiv.org/abs/2202.10842>
