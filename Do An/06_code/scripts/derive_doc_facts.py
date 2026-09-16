#!/usr/bin/env python3
"""Derive every computed number quoted in the living deck/thesis from saved artifacts.

Rule (AGENTS.md #4): numbers in documents must trace to Do An/06_code/results/.
This script only reads saved JSON artifacts and writes results/doc_facts/doc_facts.json,
recording for each fact its value and source path. Reference inputs from phase 1
(ThucTap2) are first copied into results/reference_sources/ with provenance.
"""

from __future__ import annotations

import json
import re
from pathlib import Path

CODE = Path(__file__).resolve().parents[1]
RES = CODE / "results"
REPO = CODE.parents[1]


def load(rel):
    return json.loads((RES / rel).read_text(encoding="utf-8"))


def copy_reference_sources():
    out = RES / "reference_sources"
    out.mkdir(exist_ok=True)
    src = REPO / "ThucTap2" / "GRAPES report" / "grapes_results.json"
    if src.exists():
        data = json.loads(src.read_text())
        (out / "phase1_grapes_results.json").write_text(json.dumps({"provenance": "copied verbatim from ThucTap2/GRAPES report/grapes_results.json (phase 1 reproduction)", "data": data}, indent=2))
    cfg_dir = REPO / "ThucTap2" / "GRAPES report" / "grapes-main" / "configs"
    if cfg_dir.exists():
        rows = []
        for f in sorted(cfg_dir.glob("*/*.txt")):
            text = f.read_text()
            get = lambda k: (re.search(rf"--{k}[= ]+([^\s]+)", text) or [None, None])[1]
            rows.append({"objective_dir": f.parent.name, "dataset": f.stem, "loss_coef": get("loss_coef"), "batch_size": get("batch_size"), "num_samples": get("num_samples"), "lr_gf": get("lr_gf")})
        (out / "grapes_official_configs.json").write_text(json.dumps({"provenance": "parsed from local snapshot ThucTap2/GRAPES report/grapes-main/configs/*/*.txt (not byte-identical to pinned commit, see 01_literature/GRAPES_SOURCE_VERSION_NOTE_vn.md)", "configs": rows}, indent=2))


def main():
    copy_reference_sources()
    facts = {}

    def put(key, value, source, note=""):
        facts[key] = {"value": value, "source": source, **({"note": note} if note else {})}

    story = load("data_story/data_story_summary.json")
    g = story["training_graph"]
    for side in ("item_degree", "user_degree"):
        h = {int(k): v for k, v in g[side]["histogram"].items()}
        s1 = sum(k * v for k, v in h.items())
        s2 = sum(k * k * v for k, v in h.items())
        put(f"{side}_size_biased_mean", round(s2 / s1, 1), "data_story/data_story_summary.json training_graph histogram", "sum d^2 / sum d")
        buckets = [(1, 1), (2, 5), (6, 20), (21, 100), (101, 1000), (1001, 10**12)] if side == "item_degree" else [(1, 1), (2, 5), (6, 20), (21, 10**12)]
        tot = sum(h.values())
        put(f"{side}_bucket_share_nodes_pct", {f"{a}-{b}": round(100 * sum(v for k, v in h.items() if a <= k <= b) / tot, 2) for a, b in buckets}, "data_story_summary.json histogram")
        put(f"{side}_bucket_share_edges_pct", {f"{a}-{b}": round(100 * sum(k * v for k, v in h.items() if a <= k <= b) / s1, 2) for a, b in buckets}, "data_story_summary.json histogram")
    man = load("baby_p4_g2c_manifest.json")["training_graph"]
    put("item_degree_mean", round(man["item_degree"]["mean"], 2), "baby_p4_g2c_manifest.json training_graph")
    put("user_degree_mean", round(man["user_degree"]["mean"], 3), "baby_p4_g2c_manifest.json training_graph")
    put("item_degree_max", man["item_degree"]["max"], "baby_p4_g2c_manifest.json training_graph")

    rc = story["source"]["rating_counts"]
    valid = sum(v for k, v in rc.items() if k != "0")
    put("rating_share_pct", {k: round(100 * v / valid, 2) for k, v in rc.items() if k != "0"}, "data_story_summary.json source.rating_counts")
    put("rating_le3_pct", round(100 * sum(rc[k] for k in ("1", "2", "3")) / valid, 2), "data_story_summary.json")
    put("rating_mean", round(sum(int(k) * v for k, v in rc.items()) / valid, 3), "data_story_summary.json")

    audit = load("Baby_Products_protocol_audit.json")
    sn = audit["protocol_analysis"]["semantic_snapshots"]
    put("p5_vs_p4_interaction_loss_pct", round(100 * (sn["p4"]["event_count"] - sn["p5"]["event_count"]) / sn["p4"]["event_count"], 2), "Baby_Products_protocol_audit.json semantic_snapshots")

    tp = story["temporal_population"]["validation"]
    c = tp["candidate_rows"]
    put("validation_composition_pct", {"warm": round(100 * tp["warm_rows"] / c, 2), "unseen_user_only": round(100 * tp["excluded_unseen_user_only"] / c, 2), "unseen_user_and_item": round(100 * tp["excluded_unseen_user_and_item"] / c, 2), "unseen_item_only": round(100 * tp["excluded_unseen_item_only"] / c, 2), "any_unseen_user": round(100 * (tp["excluded_unseen_user_only"] + tp["excluded_unseen_user_and_item"]) / c, 2)}, "data_story_summary.json temporal_population.validation")

    monthly = story["source"]["monthly_p4"]
    yearly = {}
    for m, v in monthly.items():
        yearly[int(m[:4])] = yearly.get(int(m[:4]), 0) + v
    put("p4_rows_per_year", yearly, "data_story_summary.json source.monthly_p4")

    p1 = load("reference_sources/phase1_grapes_results.json")["data"]["results"]
    put("phase1_time_overhead_pct", {d: round(100 * (p1[f"{d}_grapes"]["time_s"] / p1[f"{d}_random"]["time_s"] - 1), 1) for d in ("cora", "citeseer", "ogbn_arxiv")}, "reference_sources/phase1_grapes_results.json")

    cfg = load("reference_sources/grapes_official_configs.json")["configs"]
    for obj in ("gflownet", "rl"):
        vals = [float(r["loss_coef"]) for r in cfg if r["objective_dir"] == obj and r["loss_coef"]]
        if vals:
            put(f"grapes_config_loss_coef_range_{obj}", [round(min(vals), 1), round(max(vals), 1)], "reference_sources/grapes_official_configs.json")
    put("grapes_config_batch_sizes", sorted({r["batch_size"] for r in cfg if r["batch_size"]}), "reference_sources/grapes_official_configs.json", "main.py default batch_size = 512")

    deep = load("dataset_deep_analysis/deep_analysis_summary.json")
    yl = [y for y in deep["S2_temporal"]["yearly_volume_all_rows"] if 2014 <= y["year"] <= 2023]
    put("new_user_rows_share_2014_2023_pct", [round(100 * min(y["new_user_rows_share"] for y in yl), 1), round(100 * max(y["new_user_rows_share"] for y in yl), 1)], "deep_analysis_summary.json S2")
    drift = [d for d in deep["S2_temporal"]["popularity_drift_top1pct"] if "jaccard_with_prev_year_top1pct" in d]
    put("top1pct_jaccard_range", [round(min(d["jaccard_with_prev_year_top1pct"] for d in drift), 3), round(max(d["jaccard_with_prev_year_top1pct"] for d in drift), 3)], "deep_analysis_summary.json S2")
    put("top1pct_overlap_share_of_current_year_pct", {d["year"]: round(100 * 2 * d["jaccard_with_prev_year_top1pct"] / (1 + d["jaccard_with_prev_year_top1pct"]), 1) for d in drift}, "deep_analysis_summary.json S2", "approximation |A∩B|/|A| = 2J/(1+J), exact only when both years have the same top-1% size")
    put("row_share_prev_year_top1pct_range_pct", [round(100 * min(d["row_share_on_prev_year_top1pct"] for d in drift), 1), round(100 * max(d["row_share_on_prev_year_top1pct"] for d in drift), 1)], "deep_analysis_summary.json S2")
    allrows = [d for d in deep["S2_temporal"]["popularity_drift_top1pct"] if d["year"] >= 2015]
    put("row_share_own_year_top1pct_range_pct", [round(100 * min(d["top1pct_row_share"] for d in allrows), 1), round(100 * max(d["top1pct_row_share"] for d in allrows), 1)], "deep_analysis_summary.json S2")
    an = deep["S3_anomalies"]
    put("users_ge10_constant_rating_pct", round(100 * an["users_ge10_ratings_constant_value"]["users"] / an["users_ge10_ratings_constant_value"]["of_users_ge10"], 1), "deep_analysis_summary.json S3")
    meta = deep["S6_metadata"]
    put("main_category_baby_pct", round(100 * meta["main_category_top"]["Baby"] / meta["train_items"], 1), "deep_analysis_summary.json S6")
    put("metadata_price_note", "price medians computed only on the 22.6% of train items with a parseable price", "deep_analysis_summary.json S6")

    out = RES / "doc_facts"
    out.mkdir(exist_ok=True)
    (out / "doc_facts.json").write_text(json.dumps(facts, indent=2, ensure_ascii=False))
    print(json.dumps(facts, indent=1, ensure_ascii=False))


if __name__ == "__main__":
    main()
