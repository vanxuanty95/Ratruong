# Dataset Portfolio and Analysis Protocol

> **Status:** `PROPOSED PORTFOLIO — DATASET GATE G2 OPEN`  
> **Recorded:** 2026-08-26  
> **Scope:** Independent Master's thesis: *Development of a Graph Sampling Method for Large-Scale Recommender Systems Using Graph Neural Networks (GNNs).*  
> **Claim boundary:** This is a research-design decision record, not an experimental result or a final method specification.

## 1. Questions this protocol must answer

1. Which user–item datasets are semantically valid, reproducible, and sufficiently large for evaluating graph sampling in GNN recommendation?
2. How must each raw dataset be transformed into an implicit-ranking task without using future interactions in graph construction, filtering, or training negatives?
3. Does the proposed sampler preserve ranking quality at a fixed sampling/computation budget while reducing resource cost or improving the accuracy–cost trade-off?
4. Does the conclusion hold on a primary e-commerce graph and on a materially larger graph, rather than only on a convenient pilot dataset?

The method remains `OPEN`. GRAPES is a literature-grounded reference and comparator; it is neither the fixed thesis method nor a result that transfers automatically to recommendation.

## 2. Bounded dataset portfolio

| Role | Dataset and source | Why it is included | Required evidence | Current decision |
|---|---|---|---|---|
| Development/diagnostic only | Amazon Reviews'23 `All_Beauty`, pure-ID 0-core | Existing exact audit; convenient for validating deterministic preprocessing and sampler diagnostics before expensive runs | Exact raw audit already shows 693,929 rows, 631,986 users, 112,565 items, and 93.22% singleton users | **Do not use as primary evidence.** Its singleton rate makes it unsuitable for the main temporal warm-start benchmark. |
| Primary benchmark candidate | Amazon Reviews'23 `Baby_Products` | Product-review domain; timestamped user–item ratings; enough raw scale to test the accuracy–cost trade-off | Raw 0-core audit: 5,953,891 rows, 3,386,206 users, 217,654 items; 70.01% singleton users; one rating `0.0`; duplicate count still open | **Mandatory primary candidate.** Freeze only after the strict post-filter audit and G2 gates. |
| Scale-stress candidate | Amazon Reviews'23 `Home_and_Kitchen` | Same source family and semantics as the primary benchmark, but official 5-core metadata report 28.2M interactions, 2.9M users, and 763.6K items | Separate raw/provenance audit plus a bounded resource experiment | **Required if the thesis keeps the “large-scale” claim.** It is a stress test, not a second exhaustive ablation suite. |
| Optional controlled diagnostic | MovieLens 25M | Stable, timestamped, checksummed research dataset with 25,000,095 ratings from 162,541 users on 62,423 movies | Separate manifest and protocol audit | **Optional.** Use only after the core Amazon evidence is complete; it is not the primary proof of web-scale sparsity. |
| Optional external-domain validation | Yelp Open Dataset | Different local-business domain; official data include reviews and businesses | Separate schema, terms, and protocol audit | **Optional.** Add only if time remains after the Amazon core; it must not delay the central evidence. |

The provisional minimum evidence set is therefore **`Baby_Products` plus one bounded `Home_and_Kitchen` scale stress test**. `All_Beauty` is useful only for development controls. No third full benchmark is planned until the two core datasets pass their gates.

## 3. Official sources and data meaning

- **Amazon Reviews'23:** use the official [dataset documentation](https://amazon-reviews-2023.github.io/main.html), [0-core processing page](https://amazon-reviews-2023.github.io/data_processing/0core.html), and [5-core processing page](https://amazon-reviews-2023.github.io/data_processing/5core.html). The pure-ID rating-only schema is `user_id`, `parent_asin`, `rating`, `timestamp`; do not substitute variant-level `asin` for `parent_asin`.
- **Amazon role boundary:** a review/rating is an observed explicit-feedback event. It is not evidence of a purchase, click, or implicit positive by itself. The conversion to ranking positives is a project transformation that must be declared before training.
- **MovieLens 25M:** the [official GroupLens release](https://grouplens.org/datasets/movielens/25m/) is stable and provides 25 million ratings, timestamps, a checksum, and a research-use README. It is a strong controlled benchmark but has an activity-selected population and different sparsity from Amazon.
- **Yelp Open Dataset:** the [official Yelp page](https://business.yelp.com/data/resources/open-dataset/) describes an educational-use subset with 6,990,280 reviews and 150,346 businesses. Its business-review semantics and separate terms require an independent audit; it must not be treated as interchangeable with Amazon.

Official Amazon 5-core data are useful for reproducibility comparisons, but provider k-core processing occurs before the published split. It must not be silently described as the thesis's strict temporally filtered training graph.

## 4. Analysis and preprocessing protocol

For every candidate dataset, create an immutable manifest with URL, retrieval date, file size, checksum, access/usage note, schema, source version, preprocessing configuration, and code commit.

1. **Audit raw data.** Validate IDs, ratings, timestamps, duplicates, timestamp ties, row/user/item/pair counts, rating distribution, degree quantiles, singleton rates, density, connected components, and head–tail popularity.
2. **Resolve repeated interactions deterministically.** Quarantine invalid data. If duplicate pairs exist, use a pre-declared deterministic tie-breaker (earliest timestamp, then stable source-row order) and report every removed/retained count. The provider's stated policy is evidence to verify, not a substitute for the audit.
3. **Freeze interaction semantics before model training.** Audit `rating >= 4` (P4), `rating == 5` (P5), and all-observed events. Select one primary policy for semantic and feasibility reasons before results are inspected; run at most one targeted sensitivity analysis. The raw `0.0` Baby rating requires an explicit, recorded treatment.
4. **Create the primary strict temporal warm-start task.** Choose cutoffs before training; construct the graph only from training positives; derive filtering, mappings, degrees, normalization, popularity features, and sampler statistics only from that graph. Retain a validation/test target only when its user and item belong to the frozen training universe, and report all exclusions.
5. **Keep cold-start separate.** OOV users/items are a secondary diagnostic only if the eventual method has a specified cold-start mechanism. A pure-ID embedding model cannot claim cold-start ability.
6. **Define negatives and candidates explicitly.** Training negatives are drawn from the training item universe excluding a user's positives known at the training time. Evaluation ranks the full eligible training-item universe, removing the user's previously observed items. Do not make sampled-candidate metrics the headline result; sampled candidates can change metric rankings across models.
7. **Audit sampling pressure.** On the training graph, log sampling time, sampled users/items/edges, GPU/CPU memory, throughput, degree/popularity divergence, head–tail coverage, connectivity, batch overlap, and inclusion frequency. These show whether the graph actually tests the sampling method.

The raw-audit result that the provider absolute split has high OOV rates is a protocol finding, not a rejection of Amazon. It means that the published split cannot automatically be the primary warm-start protocol.

## 5. Research interpretation guide for the dataset audit

The audit is a sequence of research decisions, not a checklist that converts raw counts directly into dataset acceptance. Every reported statistic must name the **analysis population** to which it applies: (a) raw valid events, (b) events retained by each candidate positive policy, (c) the frozen training graph after training-only filtering, or (d) the warm-start validation/test cohort. Do not compare numbers across these populations as if they described the same graph.

| Audit evidence | Defensible interpretation | Decision it can inform | What it does **not** establish |
|---|---|---|---|
| Invalid IDs, ratings, or timestamps | Measures source/schema conformity and identifies records that need deterministic quarantine | G2-A provenance quality and a recorded invalid-row policy | That all unflagged events are semantically valid positives |
| Repeated user–item pairs and timestamp ties | Shows ambiguity in event identity or ordering; sensitivity depends on how many users/items and temporal targets are affected, not only the row count | Duplicate/tie rule under G2-B and whether a targeted sensitivity check is needed | That repeated reviews are accidental duplicates, or that the provider already resolved them as required by this project |
| Rating distribution and retention under P4/P5/all-observed | Quantifies the semantic and scale consequences of each candidate positive definition | Pre-result selection of the primary interaction policy, using domain meaning and retained feasibility together | That the policy with the largest graph or best later metric is the most valid one |
| User/item degree quantiles, singleton rates, and head–tail concentration | Characterizes sparsity, activity imbalance, and likely sampling pressure; report both sides of the bipartite graph | Whether a warm-start ranking task remains meaningful and which popularity-stratified diagnostics are required | That sparsity alone makes a dataset large-scale, difficult, or favorable to the proposed sampler |
| Density and connected components | Describes graph fragmentation and the reachable structure available to message passing after each transformation | Component handling, isolated-node reporting, and feasibility of the chosen GNN backbone | Recommendation quality, sampler superiority, or effective multi-hop signal |
| Temporal coverage, ties at cutoffs, and activity drift | Tests whether the chosen split represents an ordered prediction task and whether periods differ materially | Cutoff/tie rules, temporal strata, and limitations on generalization across time | Causality or absence of all temporal bias |
| Warm-start retention and user/item OOV exclusions | Quantifies the estimand produced by a pure-ID warm-start protocol and how much of the future cohort is excluded | G2-C acceptance, cohort definition, and the need to narrow claims or add a separate cold-start method | Performance on excluded users/items or the acceptability of hiding a low-coverage cohort |
| Eligible item-universe size and positive/negative exclusions | Defines the ranking task's difficulty and verifies that candidates and negatives obey time and knowledge boundaries | Exact evaluation feasibility and the registered negative/candidate policy | That unobserved items are true negatives, or that sampled-candidate metrics are comparable with full-catalog metrics |
| Retained nodes/edges plus measured evaluator time and memory in the bounded dry-run | Establishes only whether the declared pipeline and evaluator path are executable under the recorded configuration | G2-D feasibility and later compute planning | Model quality, sampler ranking, scalability beyond the tested configuration, or permission to tune at G2-D |
| Sampling-pressure diagnostics on the frozen training graph | Reveals exposure bias, coverage, overlap, and structural distortion introduced by a sampler | Later sampler ablation and accuracy–cost interpretation after the relevant gates pass | A benefit unless it is linked to matched downstream quality and resource evidence |

Apply these interpretation rules:

1. **Use denominators and attrition paths.** Report both counts and rates, with the denominator stated. Reconcile the path from downloaded rows to valid events, semantic positives, training edges, and retained evaluation targets; unexplained loss is a failed audit check.
2. **Do not invent universal pass thresholds.** A high singleton, OOV, tail, or component rate is a warning whose consequence depends on the intended estimand and model. Acceptance criteria must be pre-registered and justified from task validity and compute feasibility, not chosen after observing model results.
3. **Separate source facts, project transformations, and derived findings.** Provider documentation, checksum/schema observations, transformation rules, and computed statistics must be labeled separately. A project-derived count does not verify a provider claim unless the definitions match.
4. **Treat comparisons as descriptive until controlled.** Differences between datasets or P4/P5/all-observed snapshots may reflect semantics, filtering, time coverage, and population composition. They do not isolate a causal effect of scale or sparsity.
5. **Propagate uncertainty and unresolved checks.** Mark incomplete duplicate scans, anomalous records, approximate counts, or unverified source behavior as `OPEN`, `UNKNOWN`, or `NEEDS VERIFICATION`. Do not let downstream tables silently convert them into exact facts.
6. **Match claim scope to the retained cohort.** The primary result may describe only the frozen warm-start population. Cold-start, full raw-population, cross-domain, and large-scale claims require their own evidence; otherwise narrow the thesis wording.
7. **Keep G2 non-comparative.** Audit and the bounded G2-D dry-run may select a valid task and establish feasibility. They must not be used to select the final sampler, tune models, report headline ranking metrics, or claim accuracy/resource improvement.

An audit interpretation is complete only when it records: **observation → analysis population and denominator → plausible protocol consequence → chosen action → excluded inference → gate status**. If more than one action remains scientifically defensible, keep the decision `OPEN` and pre-register the evidence that will resolve it.

## 6. Method and comparison protocol

The thesis evaluates a **project-developed graph sampler** as a module under a matched GNN recommender backbone and a fixed resource budget. The final sampling mechanism is not frozen before literature positioning and ablation.

Minimum comparison family:

- MostPop and BPR-MF as non-GNN references;
- a fixed GNN collaborative-filtering backbone (LightGCN-style is a candidate);
- uniform and degree-aware sampling;
- an established random-walk/subgraph baseline where compatible;
- the GRAPES-informed reference design as a comparator; and
- the project-developed sampler.

All samplers must share the same split, training graph, ranking loss, negative rule, backbone depth/width, optimizer/tuning budget, random seeds, and sampling budget. Report Recall@10/20 and NDCG@10/20 from exact full-catalog ranking, along with peak GPU VRAM, CPU RAM, sampler time, train time, throughput, sampled graph size, seed variation, and accuracy–cost Pareto curves. Report results by item-popularity stratum as well as the aggregate.

## 7. Decision gates

| Gate | Required evidence before proceeding |
|---|---|
| G2-A: provenance | Official source, access note, exact file checksum, schema, and manifest complete |
| G2-B: semantics | Duplicate policy, `0.0` treatment, primary P4/P5/all-observed policy, and negative rule pre-registered |
| G2-C: evaluation validity | Temporal cutoffs, training-only filtering, warm-start coverage, OOV exclusions, and exact evaluation candidates recorded |
| G2-D: primary feasibility | A bounded, explicitly non-headline dry-run records retained-graph statistics and shows that the pipeline/evaluator path is feasible; no tuning or sampler comparison is allowed |
| G5-S: conditional scale evidence | If the thesis retains a large-scale claim, execute one pre-registered bounded `Home_and_Kitchen` scale-stress configuration after G3/G4; before then, only provenance/size/feasibility planning is allowed |
| Optional expansion | MovieLens or Yelp may be added only after the Amazon core gates pass and must not block them |

## 8. Multi-agent review and adjudication

Two independent reviewers were used, then cross-critiqued each other.

- **Hilbert** (`01a03ed0-ca78-7d92-b83e-92a13469608a`) reviewed dataset roles and source suitability. It preferred `Baby_Products`, `Home_and_Kitchen`, and MovieLens 25M, with Yelp optional.
- **Feynman** (`01a03ed0-ca4d-7c72-a247-301358b176d9`) reviewed leakage-safe preprocessing and experimental validity. It preferred `Baby_Products` as primary, `All_Beauty` for diagnostic work, and Yelp only as optional external validation.

They agreed that raw 0-core `All_Beauty` and the provider absolute split cannot be adopted as primary warm-start evidence without transformation and coverage reporting. They disagreed over whether MovieLens 25M or `Home_and_Kitchen` should be mandatory in twelve weeks. The adjudication is to require the **bounded `Home_and_Kitchen` scale stress test** if the thesis retains a large-scale claim, while keeping MovieLens and Yelp optional. This preserves direct scale evidence without committing to a second full experimental matrix.

## 9. Next action

Audit `Baby_Products` under P4/P5/all-observed candidate semantics and a strict training-only temporal protocol, then decide whether its retained graph passes G2-D. In parallel, acquire only the provenance/size audit for `Home_and_Kitchen`; do not build the final sampling method or start full ablations until G2-A through G2-C are recorded.
