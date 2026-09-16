# Research Consolidation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the accumulated working narrative with one evidence-backed Vietnamese presentation and a small, internally consistent set of research documents, then integrate the verified result into `main`.

**Architecture:** Saved JSON, manifests, configs, rank vectors, and validation reports form the evidence layer. A consistency checker derives and verifies headline claims from that layer. Markdown files provide the canonical narrative at different depths, and one reproducible JavaScript builder produces the canonical Vietnamese PPTX from the same frozen facts.

**Tech Stack:** Python 3 standard library plus bundled NumPy for tests, `unittest`, JavaScript ES modules, `@oai/artifact-tool`, bundled presentation finalizer and renderer, Git worktrees.

**Spec:** `docs/superpowers/specs/2026-09-16-research-consolidation-design.md`

## Global Constraints

- Do not add a lecturer-question checklist slide; answer each question where it belongs in the narrative.
- Do not claim semantic match or semantic diversity from the pure-ID rating-only artifact.
- Do not claim significance, universal superiority, cross-budget performance, cross-dataset performance, or completed test-set evaluation.
- Treat external datasets as considered benchmarks, not experiments run by this project.
- Preserve `Do An/cô dặn 3:09` unchanged and do not touch unrelated files in `ThucTap2`.
- Keep reproducibility evidence; delete only generated files, superseded narrative files, and duplicate transfer copies with a named canonical replacement.
- Use the bundled Node, Python, LibreOffice, and presentation tooling returned by `load_workspace_dependencies`.
- Stage explicit paths only; never use `git add .`, destructive reset, or bulk overwrite of unrelated untracked files.
- Execution choice is inline in the current isolated worktree, explicitly requested by the user on 2026-09-16.

---

## File structure

### Canonical narrative

- `Do An/README_vn.md`: short project entry point and file map.
- `Do An/PROJECT_CONTEXT_AND_RESEARCH_RULES_{vn,en}.md`: current question, frozen decisions, and claim boundaries.
- `Do An/00_project/PHASE2_RESEARCH_PLAN_{vn,en}.md`: chronological research record and next bounded action.
- `Do An/03_reports/REPORT_TEACHER_{vn,en}.md`: presentation-level explanation in prose.
- `Do An/04_thesis/THESIS_REPORT_{vn,en}.md`: thesis-depth account.
- `Do An/06_code/README_{vn,en}.md`: reproduction and artifact guide.
- `Do An/05_slides/THESIS_PRESENTATION_vn.pptx`: only current slide deck.
- `Do An/05_slides/build_thesis_presentation_vn.mjs`: reproducible deck builder.

### Verification

- `Do An/06_code/scripts/verify_research_consistency.py`: checks evidence values, active-document language, stale status text, and canonical file layout.
- `Do An/06_code/tests/test_research_consistency.py`: unit tests for the checker and repository-level acceptance checks.
- `.gitignore`: excludes machine-local and generated files.

### Removed as superseded or generated

- `Do An/PHASE2_DIRECTION_REVIEW_{vn,en}.md`: merged into the current timeline and report.
- `Do An/00_project/G1_RESEARCH_DESIGN_{vn,en}.md`: completed design history merged into the current plan and thesis method sections.
- `Do An/00_project/PHASE2_CONSTRAINTS_{vn,en}.md`: live constraints merged into project rules.
- `Do An/06_code/environment/ENVIRONMENT_LOCK_PENDING.txt`: obsolete after runtime and hashes were recorded in results.
- `Do An/05_slides/THESIS_PRESENTATION_en.pptx`: stale presentation not requested or maintained.
- `Do An/05_slides/THESIS_PRESENTATION_vn_v*.pptx`: numbered working exports.
- `Do An/06_code/notebooks/paired_sampling_validation_bundle.zip`: duplicate of the canonical result bundle.
- `.idea/`, `.DS_Store`, `.chart-data-*`, `.codex-build/`, caches, and generated render folders.

---

### Task 1: Canonical consistency checker

**Files:**
- Create: `Do An/06_code/scripts/verify_research_consistency.py`
- Create: `Do An/06_code/tests/test_research_consistency.py`
- Read: `Do An/06_code/results/*_audit.json`
- Read: `Do An/06_code/results/data_story/data_story_summary.json`
- Read: `Do An/06_code/results/paired_sampling_validation/paired_sampling_validation_summary.json`

**Interfaces:**
- Consumes: repository root path and saved JSON artifacts.
- Produces: `build_report(repo_root: Path) -> dict[str, object]`, `validate_report(report: dict[str, object]) -> list[str]`, and exit status 0 only when no violations remain.

- [ ] **Step 1: Write failing unit tests**

Create tests that require the checker to extract these exact evidence facts:

```python
EXPECTED = {
    "all_beauty_rows": 693_929,
    "baby_rows": 5_953_891,
    "home_and_kitchen_rows": 66_623_880,
    "p4_rows": 4_655_843,
    "train_edges": 3_868_654,
    "train_users": 2_318_308,
    "train_items": 162_125,
    "item_gini": 0.8584238309483749,
    "m1_ndcg_mean": 0.005865983054867427,
    "m2_ndcg_mean": 0.005720915314706386,
}
```

Also test that the checker rejects an active narrative which calls semantic diversity measured, says the test set was used, or says M2 beat M1.

- [ ] **Step 2: Run the focused tests and confirm failure**

Run:

```bash
RUNTIME_PYTHON -m unittest tests.test_research_consistency -v
```

Expected: import failure because `verify_research_consistency.py` does not exist.

- [ ] **Step 3: Implement the checker**

Use `json`, `pathlib`, `re`, and `zipfile` only. Read the evidence files, derive the headline values, scan the canonical Markdown files, extract slide text from `ppt/slides/slide*.xml`, and report:

- evidence facts;
- missing required phrases;
- forbidden stale claims;
- missing canonical files;
- numbered slide versions or duplicate notebook bundle still present.

The CLI prints JSON and returns nonzero when violations exist.

- [ ] **Step 4: Run focused tests**

Run the same `unittest` command. Expected: all checker unit tests pass; repository acceptance may still report narrative violations until Tasks 2–5 finish.

- [ ] **Step 5: Commit the checker**

Stage only the two new files and commit with `test: add research consistency gate`.

---

### Task 2: Repository inventory and safe cleanup

**Files:**
- Create: `.gitignore`
- Modify: `Do An/README_vn.md`
- Delete: the superseded and generated files listed under “Removed” above.
- Preserve: all configs, notebooks 00–10, source modules, tests, result JSON, rank vectors, validation reports, result images, and result-folder bundles.

**Interfaces:**
- Consumes: the canonical file roles from the design spec.
- Produces: a small navigable project entry point and no ambiguous slide/document versions.

- [ ] **Step 1: Record a deletion ledger before deletion**

Add a “Tài liệu nào dùng cho việc gì” section to `Do An/README_vn.md`. For every removed narrative file, name the canonical replacement. Do not add a separate archival directory.

- [ ] **Step 2: Add ignore rules**

Create a root `.gitignore` covering:

```gitignore
.DS_Store
.idea/
.codex-build/
.chart-data-*/
__pycache__/
*.py[cod]
.pytest_cache/
Do An/05_slides/rendered*/
Do An/05_slides/*.validation.json
```

- [ ] **Step 3: Remove exact superseded targets**

Delete only the paths listed in the file structure. Before removing each narrative file, confirm its current unique content is represented in the replacement document. Leave `ThucTap2`, result bundles, raw summaries, and the lecturer note untouched.

- [ ] **Step 4: Verify the tree**

Run:

```bash
rg --files 'Do An' | sort
git status --short
```

Expected: one Vietnamese PPTX target remains after Task 5; no numbered PPTX versions or duplicate notebook bundle remain.

- [ ] **Step 5: Commit cleanup**

Stage explicit cleanup paths and commit with `chore: consolidate research artifacts`.

---

### Task 3: Rewrite the Vietnamese canonical narrative

**Files:**
- Modify: `Do An/README_vn.md`
- Modify: `Do An/PROJECT_CONTEXT_AND_RESEARCH_RULES_vn.md`
- Modify: `Do An/00_project/PHASE2_RESEARCH_PLAN_vn.md`
- Modify: `Do An/00_project/DATASET_PORTFOLIO_AND_ANALYSIS_PROTOCOL_vn.md`
- Modify: `Do An/02_protocol/GRAPES_RECOMMENDATION_SPEC_vn.md`
- Modify: `Do An/03_reports/REPORT_TEACHER_vn.md`
- Modify: `Do An/04_thesis/THESIS_REPORT_vn.md`
- Modify: `Do An/06_code/README_vn.md`
- Modify only if stale: `Do An/06_code/docs/*_vn.md`

**Interfaces:**
- Consumes: evidence facts returned by `build_report()` and the approved 18-slide narrative.
- Produces: one current Vietnamese account at overview, presentation, thesis, and reproduction depth.

- [ ] **Step 1: Write the dataset-selection section**

Explain the external benchmark landscape using primary sources: MovieLens 25M, Gowalla, Yelp2018, MIND, and KuaiRec. State that the project did not run these datasets. Then compare the audited Amazon datasets and defend Baby Products with exact row counts, sparsity, long-tail structure, and Colab feasibility.

- [ ] **Step 2: Rewrite M0/M1/M2 in normal language**

Use the names and meanings locked in the spec. Define “context” as neighboring nodes and edges used for propagation in the current batch/layer. Keep formulas only after the plain explanation.

- [ ] **Step 3: Explain every metric and limitation**

Explain why NDCG@20 is primary, how Recall@20 is interpreted with one target per row, why coverage and cohort exposure are diagnostic, and why time/memory are part of the objective. Explicitly separate structural diversity from semantic diversity.

- [ ] **Step 4: Rebuild the research timeline**

Present the actual order: lecturer feedback, exact data audit, temporal graph, baselines, M0, M1, M2, paired validation, negative conclusion. Remove instructions that tell the user to rerun already completed paired experiments; keep reproduction commands under a clearly labeled optional section.

- [ ] **Step 5: Run the consistency checker on Markdown-only state**

Run the checker with slide checks disabled through `--skip-slides`. Expected: zero evidence and Markdown violations.

- [ ] **Step 6: Commit Vietnamese narrative**

Stage only the Vietnamese documents and commit with `docs: align Vietnamese research narrative`.

---

### Task 4: Reconcile English mirrors and references

**Files:**
- Modify: `Do An/PROJECT_CONTEXT_AND_RESEARCH_RULES_en.md`
- Modify: `Do An/00_project/PHASE2_RESEARCH_PLAN_en.md`
- Modify: `Do An/00_project/DATASET_PORTFOLIO_AND_ANALYSIS_PROTOCOL_en.md`
- Modify: `Do An/02_protocol/GRAPES_RECOMMENDATION_SPEC_en.md`
- Modify: `Do An/03_reports/REPORT_TEACHER_en.md`
- Modify: `Do An/04_thesis/THESIS_REPORT_en.md`
- Modify: `Do An/06_code/README_en.md`
- Modify only if stale: `Do An/06_code/docs/*_en.md`

**Interfaces:**
- Consumes: the Vietnamese canonical facts and claim boundaries.
- Produces: English references that do not contradict the Vietnamese narrative.

- [ ] **Step 1: Synchronize statuses and numbers**

Update completed-run status, three-seed means, M2 negative conclusion, dataset-selection rationale, and semantic-diversity boundary.

- [ ] **Step 2: Remove stale future-tense instructions**

Replace “run paired validation next” with the completed status. Keep only optional reproduction guidance.

- [ ] **Step 3: Search all Markdown for contradictions**

Run targeted searches for “pending”, “next run”, “M2 proposed”, “test result”, “semantic diversity measured”, old seed counts, and obsolete deck filenames. Inspect each match rather than replacing blindly.

- [ ] **Step 4: Run Markdown consistency checks**

Run the checker with `--skip-slides`. Expected: zero violations across Vietnamese and English active documents.

- [ ] **Step 5: Commit English reconciliation**

Stage only English/reference updates and commit with `docs: reconcile research references`.

---

### Task 5: Build the 18-slide canonical Vietnamese deck

**Files:**
- Create: `Do An/05_slides/build_thesis_presentation_vn.mjs`
- Replace: `Do An/05_slides/THESIS_PRESENTATION_vn.pptx`
- Read: `Do An/06_code/results/**/*.json`
- Read: `Do An/06_code/results/data_story/*.png`
- Private build only: `.codex-build/thesis-presentation/`

**Interfaces:**
- Consumes: saved evidence JSON and the 18-slide order in the design spec.
- Produces: a 16:9 PPTX with editable charts/tables, Vietnamese text, and primary-source speaker notes.

- [ ] **Step 1: Inspect and freeze the visual system**

Render the current canonical deck and inspect all slides. Retain its restrained cream background, dark ink, blue/green/orange evidence colors, Aptos typography, page numbering, and source-note pattern. Remove dashboard-like card clutter and keep body text at 17 pt or larger.

- [ ] **Step 2: Mark the edit operation once**

Immediately before the first authoring command, run exactly once:

```bash
RUNTIME_NODE SKILL_DIR/container_tools/mark_artifact_operation_started.mjs --operation-kind edit --expected-output-count 1 --output-format pptx
```

- [ ] **Step 3: Refactor the builder**

Move the useful layout helpers from the private v12 builder into the canonical script. Read numeric evidence from JSON instead of duplicating headline values where practical. Produce the 18 slides in the approved order, including one external-benchmark slide and one audited-Amazon selection slide.

- [ ] **Step 4: Build editable evidence**

Use native PowerPoint charts for rating distribution, degree/popularity concentration, warm-start retention, baseline comparison, sampler means, and resource trade-off. Use native tables for benchmark comparison, M0/M1/M2 definitions, and metric rationale. Put source URLs and artifact paths in speaker notes.

- [ ] **Step 5: Finalize to a new candidate**

Use `finalizePresentation` with `explicitTotalSlideCount: 18`, the actual native chart/table slide owners, `materializeLiteralChartWorkbooks: true`, Aptos as a design font, Artifact Tool import verification, and 16:9 expected slide geometry.

- [ ] **Step 6: Render and inspect every slide**

Render all 18 slides with the bundled `render_slides.py`. Inspect each full-size PNG and a contact sheet. Fix overlap, clipping, crowded text, inaccurate labels, inconsistent page markers, and source-note omissions in the builder, then generate a new finalized output.

- [ ] **Step 7: Promote the accepted output**

Copy the verified final file unchanged to `Do An/05_slides/THESIS_PRESENTATION_vn.pptx`. Do not keep numbered working exports in `Do An/05_slides/`.

- [ ] **Step 8: Run slide consistency checks**

Run the consistency checker without `--skip-slides`, package-integrity validation, layout validation, and an Artifact Tool re-import. Expected: 18 slides, zero critical layout errors, required terms present, and no stale claims.

- [ ] **Step 9: Commit the deck and builder**

Stage the canonical builder and PPTX only; commit with `docs: rebuild thesis presentation`.

---

### Task 6: Full verification and main integration

**Files:**
- Verify: all project code, notebooks, Markdown, results, and PPTX.
- Integrate into: `/Users/tyvan/Documents/Master/Ratruong` on `main`.

**Interfaces:**
- Consumes: all prior task outputs.
- Produces: one reviewed commit on `main` containing only project changes.

- [ ] **Step 1: Run the full code test suite**

Run:

```bash
RUNTIME_PYTHON -m unittest discover -s 'Do An/06_code/tests' -p 'test_*.py' -v
```

Expected: all tests pass, including NumPy-dependent paired-validation tests.

- [ ] **Step 2: Run consistency and link checks**

Run the canonical consistency checker, `git diff --check`, Markdown link/path checks, and searches for deleted filenames and stale conclusions. Expected: no violations.

- [ ] **Step 3: Review the final diff and cleanup ledger**

Confirm every deleted file has a replacement or is generated/duplicate, no result evidence was lost, and no `ThucTap2` or personal untracked file appears in the diff.

- [ ] **Step 4: Synchronize explicit project paths to main**

Copy only the reviewed `Do An`, `.gitignore`, and `docs/superpowers` changes into the main worktree. Preserve `Do An/cô dặn 3:09`, `.DS_Store` outside the staged paths, and all unrelated `ThucTap2` files.

- [ ] **Step 5: Re-run verification in main**

Run the full test suite, consistency checker, Git diff check, PPTX package/layout validation, and confirm `main` is the checked-out branch.

- [ ] **Step 6: Commit on main**

Stage explicit paths and commit with `docs: consolidate recommendation research`.

- [ ] **Step 7: Report the commit and canonical outputs**

Return the main commit hash, the canonical slide link, the canonical report links, verification counts, and any remaining limitation that affects presentation use.
