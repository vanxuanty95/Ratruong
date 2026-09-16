#!/usr/bin/env python3
"""Verify that the research narrative matches the saved evidence.

The script intentionally uses only the Python standard library. It does not
recompute model metrics; it checks that the canonical narrative reads the
registered artifacts consistently and does not cross the frozen claim boundary.
"""

from __future__ import annotations

import argparse
import json
import re
import sys
import zipfile
from pathlib import Path
from typing import Any
from xml.etree import ElementTree


ACTIVE_MARKDOWN = (
    "Do An/README_vn.md",
    "Do An/PROJECT_CONTEXT_AND_RESEARCH_RULES_vn.md",
    "Do An/PROJECT_CONTEXT_AND_RESEARCH_RULES_en.md",
    "Do An/00_project/PHASE2_RESEARCH_PLAN_vn.md",
    "Do An/00_project/PHASE2_RESEARCH_PLAN_en.md",
    "Do An/03_reports/REPORT_TEACHER_vn.md",
    "Do An/03_reports/REPORT_TEACHER_en.md",
    "Do An/04_thesis/THESIS_REPORT_vn.md",
    "Do An/04_thesis/THESIS_REPORT_en.md",
    "Do An/06_code/README_vn.md",
    "Do An/06_code/README_en.md",
)

CANONICAL_SLIDE = "Do An/05_slides/THESIS_PRESENTATION_vn.pptx"

REQUIRED_PHRASES = {
    "Do An/README_vn.md": ("M0", "M1", "M2", "semantic diversity"),
    "Do An/03_reports/REPORT_TEACHER_vn.md": (
        "NDCG@20",
        "Recall@20",
        "Catalog Coverage@20",
        "All_Beauty",
        "Home_and_Kitchen",
    ),
    "Do An/04_thesis/THESIS_REPORT_vn.md": (
        "NDCG@20",
        "Recall@20",
        "Catalog Coverage@20",
        "M0",
        "M1",
        "M2",
    ),
}

SLIDE_REQUIRED_PHRASES = (
    "MovieLens 25M",
    "Gowalla",
    "Yelp2018",
    "MIND",
    "KuaiRec",
    "All_Beauty",
    "Baby_Products",
    "Home_and_Kitchen",
    "NDCG@20",
    "Recall@20",
    "Catalog Coverage@20",
    "M0",
    "M1",
    "M2",
)


def load_json(path: Path) -> dict[str, Any]:
    with path.open("r", encoding="utf-8") as handle:
        return json.load(handle)


def extract_pptx_text(path: Path) -> str:
    """Return visible text from slide XML in presentation order."""

    if not path.exists():
        return ""
    with zipfile.ZipFile(path) as archive:
        slide_names = sorted(
            (
                name
                for name in archive.namelist()
                if re.fullmatch(r"ppt/slides/slide\d+\.xml", name)
            ),
            key=lambda name: int(re.search(r"(\d+)", name).group(1)),
        )
        text_runs: list[str] = []
        for name in slide_names:
            root = ElementTree.fromstring(archive.read(name))
            for node in root.iter("{http://schemas.openxmlformats.org/drawingml/2006/main}t"):
                if node.text:
                    text_runs.append(node.text)
        return "\n".join(text_runs)


def narrative_violations(text: str, label: str) -> list[str]:
    """Find only claims that directly violate the registered boundaries."""

    compact = re.sub(r"\s+", " ", text).strip()
    lower = compact.lower()
    violations: list[str] = []

    semantic_measured = (
        "đã đo semantic diversity",
        "đo được semantic diversity",
        "semantic diversity was measured",
        "semantic diversity is measured",
    )
    if any(phrase in lower for phrase in semantic_measured):
        violations.append(f"{label}: semantic diversity is claimed as measured")

    if re.search(r"\bm2\s+(?:đã\s+)?(?:vượt|tốt hơn)\s+m1\b", lower):
        violations.append(f"{label}: M2 superiority over M1 is claimed")
    if re.search(r"\bm2\s+(?:outperforms|outperformed|beats|beat)\s+m1\b", lower):
        violations.append(f"{label}: M2 superiority over M1 is claimed")

    test_selection_patterns = (
        r"(?:test set|test target|tập test).{0,40}(?:đã được dùng|was used).{0,40}(?:chọn|select|tune|tuning)",
        r"(?:dùng|sử dụng|used?).{0,20}(?:test set|test target|tập test).{0,40}(?:chọn|select|tune|tuning)",
    )
    if any(re.search(pattern, lower) for pattern in test_selection_patterns):
        violations.append(f"{label}: test data is claimed as used for model selection")

    return violations


def _facts(repo_root: Path) -> dict[str, Any]:
    results = repo_root / "Do An" / "06_code" / "results"
    all_beauty = load_json(results / "All_Beauty_protocol_audit.json")
    baby = load_json(results / "Baby_Products_protocol_audit.json")
    home = load_json(results / "Home_and_Kitchen_raw_audit.json")
    story = load_json(results / "data_story" / "data_story_summary.json")
    paired = load_json(
        results / "paired_sampling_validation" / "paired_sampling_validation_summary.json"
    )
    graph = story["training_graph"]
    quality = paired["quality_statistics"]
    return {
        "all_beauty_rows": all_beauty["row_count"],
        "baby_rows": baby["row_count"],
        "home_and_kitchen_rows": home["row_count"],
        "p4_rows": story["positive_policy"]["p4_rows"],
        "train_edges": graph["edges"],
        "train_users": graph["users"],
        "train_items": graph["items"],
        "item_gini": graph["item_degree"]["gini"],
        "m0_ndcg_mean": quality["M0"]["ndcg_at_20"]["mean"],
        "m1_ndcg_mean": quality["M1"]["ndcg_at_20"]["mean"],
        "m2_ndcg_mean": quality["M2"]["ndcg_at_20"]["mean"],
        "m0_recall_mean": quality["M0"]["recall_at_20"]["mean"],
        "m1_recall_mean": quality["M1"]["recall_at_20"]["mean"],
        "m2_recall_mean": quality["M2"]["recall_at_20"]["mean"],
        "paired_completed_runs": paired["completed_runs"],
        "test_targets_read": paired["test_targets_read"],
    }


def build_report(repo_root: Path, *, skip_slides: bool = False) -> dict[str, Any]:
    repo_root = repo_root.resolve()
    required_paths = [*ACTIVE_MARKDOWN, CANONICAL_SLIDE]
    if skip_slides:
        required_paths.remove(CANONICAL_SLIDE)
    missing_paths = [path for path in required_paths if not (repo_root / path).exists()]

    forbidden_paths: list[str] = []
    forbidden_paths.extend(
        str(path.relative_to(repo_root))
        for path in sorted((repo_root / "Do An" / "05_slides").glob("THESIS_PRESENTATION_vn_v*.pptx"))
    )
    duplicate_bundle = repo_root / "Do An" / "06_code" / "notebooks" / "paired_sampling_validation_bundle.zip"
    if duplicate_bundle.exists():
        forbidden_paths.append(str(duplicate_bundle.relative_to(repo_root)))

    claim_violations: list[str] = []
    missing_required_phrases: list[str] = []
    for relative in ACTIVE_MARKDOWN:
        path = repo_root / relative
        if not path.exists():
            continue
        text = path.read_text(encoding="utf-8")
        claim_violations.extend(narrative_violations(text, relative))
        for phrase in REQUIRED_PHRASES.get(relative, ()):
            if phrase.casefold() not in text.casefold():
                missing_required_phrases.append(f"{relative}: missing phrase {phrase!r}")

    slide_text = ""
    if not skip_slides:
        slide_path = repo_root / CANONICAL_SLIDE
        slide_text = extract_pptx_text(slide_path)
        claim_violations.extend(narrative_violations(slide_text, CANONICAL_SLIDE))
        for phrase in SLIDE_REQUIRED_PHRASES:
            if phrase.casefold() not in slide_text.casefold():
                missing_required_phrases.append(f"{CANONICAL_SLIDE}: missing phrase {phrase!r}")

    return {
        "facts": _facts(repo_root),
        "missing_paths": missing_paths,
        "forbidden_paths": forbidden_paths,
        "narrative_violations": claim_violations,
        "missing_required_phrases": missing_required_phrases,
        "slides_checked": not skip_slides,
    }


def validate_report(report: dict[str, Any]) -> list[str]:
    violations: list[str] = []
    violations.extend(f"missing canonical path: {path}" for path in report.get("missing_paths", []))
    violations.extend(f"superseded path still present: {path}" for path in report.get("forbidden_paths", []))
    violations.extend(report.get("narrative_violations", []))
    violations.extend(report.get("missing_required_phrases", []))
    facts = report.get("facts", {})
    if facts and facts.get("test_targets_read") is not False:
        violations.append("paired summary does not confirm test_targets_read=false")
    if facts and facts.get("paired_completed_runs") != 6:
        violations.append("paired summary does not contain six completed repeat runs")
    return violations


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--repo-root",
        type=Path,
        default=Path(__file__).resolve().parents[3],
        help="Repository root. Defaults to the root containing 'Do An'.",
    )
    parser.add_argument("--skip-slides", action="store_true")
    args = parser.parse_args(argv)

    report = build_report(args.repo_root, skip_slides=args.skip_slides)
    report["violations"] = validate_report(report)
    print(json.dumps(report, ensure_ascii=False, indent=2, sort_keys=True))
    return 1 if report["violations"] else 0


if __name__ == "__main__":
    sys.exit(main())
