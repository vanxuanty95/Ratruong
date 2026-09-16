#!/usr/bin/env python3
"""Deep Baby_Products analysis + development split (gates R1 and data chapter).

Runs on Colab (raw data lives on Google Drive). Single source for the notebook
``11_dataset_deep_analysis_and_dev_split.ipynb``.

Contamination rule (spec §3, DL-001):
- Rows with ``timestamp >= t1`` are used only for already-published volume
  counts (rows per year, rating counts). No validation/test target is read
  for any structural, reachability or design-informing statistic.
- Target-side analyses (reachability, target cohorts) use the new development
  window ``[t0, t1)`` against ``G_dev_train``.
"""

from __future__ import annotations

import argparse
import gzip
import hashlib
import json
import math
from collections import Counter
from pathlib import Path

import numpy as np
import pandas as pd
import scipy.sparse as sp

T1_MS = 1628643414042
T2_MS = 1658002729837
EXPECTED_RAW_SHA256 = "e2a8d0498afed767ee2615db7fac549559d82490b1a73c7241b84b5e9e8c279e"
EXPECTED_TRAIN = {"edges": 3868654, "users": 2318308, "items": 162125}
HEAD_MIN, TAIL_MAX = 397, 12  # cohorts_v1.json (frozen before model results)
DAY_MS = 86_400_000

ITEM_BUCKETS = [(1, 1), (2, 5), (6, 20), (21, 100), (101, 1000), (1001, 10**12)]
USER_BUCKETS = [(1, 1), (2, 5), (6, 20), (21, 10**12)]


def bucket_label(a, b):
    return f"{a}" if a == b else (f">{a - 1}" if b >= 10**12 else f"{a}-{b}")


def sha256_file(path, chunk=1 << 22):
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for block in iter(lambda: f.read(chunk), b""):
            h.update(block)
    return h.hexdigest()


def q(series, qs=(0.5, 0.9, 0.99)):
    if len(series) == 0:
        return {f"p{int(x * 100)}": None for x in qs}
    arr = np.asarray(series, dtype=float)
    return {f"p{int(x * 100)}": float(np.quantile(arr, x)) for x in qs} | {"mean": float(arr.mean()), "max": float(arr.max())}


def assign_bucket(values, buckets):
    labels = np.empty(len(values), dtype=object)
    for a, b in buckets:
        labels[(values >= a) & (values <= b)] = bucket_label(a, b)
    return labels


def cohort_of_degree(deg):
    return np.where(deg >= HEAD_MIN, "head", np.where(deg <= TAIL_MAX, "tail", "body"))


# ---------------------------------------------------------------- loading
def load_raw(path):
    df = pd.read_csv(path, dtype={"user_id": str, "parent_asin": str, "rating": np.float32, "timestamp": np.int64})
    df = df[(df.rating >= 1) & (df.rating <= 5)].reset_index(drop=True)  # quarantine out-of-range
    df["u"], users = pd.factorize(df.user_id)
    df["i"], items = pd.factorize(df.parent_asin)
    return df, users, items


# ---------------------------------------------------------------- S1 rating
def rating_analysis(df):
    pre = df[df.timestamp < T1_MS]
    item_deg = pre.groupby("i").size()
    user_deg = pre.groupby("u").size()
    pre = pre.assign(item_deg=pre.i.map(item_deg).values, user_deg=pre.u.map(user_deg).values)
    out = {"scope": "all ratings with timestamp < t1", "rows": int(len(pre))}
    rows = []
    pre_ib = assign_bucket(pre.item_deg.values, ITEM_BUCKETS)
    for a, b in ITEM_BUCKETS:
        lab = bucket_label(a, b)
        m = pre_ib == lab
        r = pre.rating.values[m]
        rows.append({"item_rating_count_bucket": lab, "rows": int(m.sum()), "mean_rating": float(r.mean()) if m.any() else None,
                     "share_5": float((r == 5).mean()) if m.any() else None, "share_le3": float((r <= 3).mean()) if m.any() else None})
    out["by_item_popularity"] = rows
    rows = []
    pre_ub = assign_bucket(pre.user_deg.values, USER_BUCKETS)
    for a, b in USER_BUCKETS:
        lab = bucket_label(a, b)
        m = pre_ub == lab
        r = pre.rating.values[m]
        rows.append({"user_rating_count_bucket": lab, "rows": int(m.sum()), "mean_rating": float(r.mean()) if m.any() else None,
                     "share_5": float((r == 5).mean()) if m.any() else None})
    out["by_user_activity"] = rows
    g = pre.groupby("u").rating.agg(["count", "std", "min", "max"])
    multi = g[g["count"] >= 2]
    out["users_with_2plus_ratings"] = int(len(multi))
    out["share_users_2plus_all_same_rating"] = float((multi["min"] == multi["max"]).mean()) if len(multi) else None
    out["share_users_5plus_only_5_star"] = float(((g["count"] >= 5) & (g["min"] == 5)).sum() / max((g["count"] >= 5).sum(), 1))
    out["per_user_rating_std_2plus"] = q(multi["std"].fillna(0).values)
    return out


# ---------------------------------------------------------------- S2 temporal
def temporal_analysis(df):
    years = pd.to_datetime(df.timestamp, unit="ms", utc=True).dt.year
    df = df.assign(year=years.values)
    first_u = df.groupby("u").timestamp.transform("min")
    first_i = df.groupby("i").timestamp.transform("min")
    yearly = []
    for y, part in df.groupby("year"):
        yearly.append({
            "year": int(y), "rows": int(len(part)), "users": int(part.u.nunique()), "items": int(part.i.nunique()),
            "new_user_rows_share": float((first_u.loc[part.index] == part.timestamp).mean()),
            "new_item_rows_share": float((first_i.loc[part.index] == part.timestamp).mean()),
            "mean_rating": float(part.rating.mean()), "share_5": float((part.rating == 5).mean()),
        })
    out = {"yearly_volume_all_rows": yearly, "note": "yearly volume/rating uses all rows (already-published EDA granularity); structural stats below use timestamp < t1"}
    pre = df[df.timestamp < T1_MS]
    span = pre.groupby("i").timestamp.agg(["min", "max", "count"])
    span = span[span["count"] >= 2]
    out["item_active_span_days_2plus"] = q(((span["max"] - span["min"]) / DAY_MS).values)
    ps = pre.sort_values(["u", "timestamp"])
    gaps = ps.groupby("u").timestamp.diff().dropna() / DAY_MS
    out["user_inter_event_gap_days"] = q(gaps.values)
    out["share_consecutive_events_same_day"] = float((gaps < 1).mean()) if len(gaps) else None
    drift = []
    top_prev = None
    for y in range(2014, int(pd.to_datetime(T1_MS, unit="ms", utc=True).year) + 1):
        part = pre[pre.year == y]
        if len(part) == 0:
            continue
        cnt = part.groupby("i").size().sort_values(ascending=False)
        k = max(1, int(math.ceil(0.01 * len(cnt))))
        top = set(cnt.index[:k])
        rec = {"year": y, "items_active": int(len(cnt)), "top1pct_items": k, "top1pct_row_share": float(cnt.iloc[:k].sum() / cnt.sum())}
        if top_prev is not None:
            rec["jaccard_with_prev_year_top1pct"] = float(len(top & top_prev) / len(top | top_prev))
            rec["row_share_on_prev_year_top1pct"] = float(part.i.isin(top_prev).mean())
        drift.append(rec)
        top_prev = top
    out["popularity_drift_top1pct"] = drift
    return out


# ---------------------------------------------------------------- S3 anomalies
def anomaly_analysis(df):
    pre = df[df.timestamp < T1_MS]
    day = pre.timestamp // DAY_MS
    ud = pre.groupby([pre.u, day]).size()
    out = {"scope": "timestamp < t1; report only, nothing removed"}
    for thr in (5, 10, 20, 50):
        heavy = ud[ud >= thr]
        out[f"user_days_ge_{thr}"] = {"user_days": int(len(heavy)), "users": int(heavy.index.get_level_values(0).nunique()),
                                      "row_share": float(heavy.sum() / len(pre))}
    out["max_ratings_by_one_user_in_one_day"] = int(ud.max())
    same_ts = pre.groupby(["u", "timestamp"]).size()
    out["user_identical_timestamp_groups_ge2"] = {"groups": int((same_ts >= 2).sum()), "rows": int(same_ts[same_ts >= 2].sum()), "max_group": int(same_ts.max())}
    idd = pre.groupby([pre.i, day]).size().rename("n").reset_index()
    med = idd.groupby("i").n.transform("median")
    spikes = idd[(idd.n >= 50) & (idd.n >= 10 * med)]
    out["item_day_spikes_ge50_and_10x_median"] = {"item_days": int(len(spikes)), "items": int(spikes.i.nunique()), "rows": int(spikes.n.sum())}
    g = pre.groupby("u").rating.agg(["count", "min", "max"])
    out["users_ge10_ratings_constant_value"] = {"users": int(((g["count"] >= 10) & (g["min"] == g["max"])).sum()), "of_users_ge10": int((g["count"] >= 10).sum())}
    return out


# ---------------------------------------------------------------- graph helpers
def build_graph(pos, user_col="u", item_col="i"):
    users, u_idx = np.unique(pos[user_col].values, return_inverse=True)
    items, i_idx = np.unique(pos[item_col].values, return_inverse=True)
    R = sp.csr_matrix((np.ones(len(pos), dtype=np.float32), (u_idx, i_idx)), shape=(len(users), len(items)))
    R.data[:] = 1.0
    R.sum_duplicates()
    R.data[:] = 1.0
    return R, users, items, u_idx, i_idx


def neighbourhood_explosion(R, rng, batch_sizes=(1024, 4096, 16384, 65536), layers=3, repeats=3):
    """Unsampled candidate sizes |C^l| for BPR batches, with K^l = V0 ∪ C^l (full sampling)."""
    nU, nI = R.shape
    N = nU + nI
    rows, cols = R.nonzero()
    A = sp.bmat([[None, R], [R.T, None]], format="csr")
    item_deg = np.asarray(R.sum(0)).ravel()
    res = []
    for b in batch_sizes:
        per = []
        for _ in range(repeats):
            e = rng.integers(0, len(rows), size=b)
            neg = rng.integers(0, nI, size=b)
            v0 = np.unique(np.concatenate([rows[e], nU + cols[e], nU + neg]))
            k_prev = np.zeros(N, dtype=bool)
            k_prev[v0] = True
            union = k_prev.copy()
            sizes, reach_union = [], []
            for _ in range(layers):
                reach = (A @ k_prev.astype(np.float32)) > 0
                cand = reach & ~k_prev
                sizes.append(int(cand.sum()))
                union |= reach
                reach_union.append(int(union.sum()))
                k_prev = cand.copy()
                k_prev[v0] = True
            per.append({"v0": int(len(v0)), "candidates_per_layer": sizes, "cumulative_reach": reach_union})
        res.append({"batch_triplets": b, "node_universe": int(N),
                    "v0_mean": float(np.mean([p["v0"] for p in per])),
                    "candidates_mean": [float(np.mean([p["candidates_per_layer"][l] for p in per])) for l in range(layers)],
                    "candidates_share_of_nodes": [float(np.mean([p["candidates_per_layer"][l] for p in per]) / N) for l in range(layers)],
                    "cumulative_reach_share_of_nodes": [float(np.mean([p["cumulative_reach"][l] for p in per]) / N) for l in range(layers)]})
    return res


def user_reach(R, user_ids, chunk=512):
    """|items 1-hop|, |users 2-hop|, |items 3-hop| per user (unsampled)."""
    Rt = R.T.tocsr()
    out = {"items_1hop": [], "users_2hop": [], "items_3hop": []}
    for s in range(0, len(user_ids), chunk):
        U = R[user_ids[s:s + chunk]]
        two = (U @ Rt)
        three = (two @ R)
        out["items_1hop"].extend(np.diff(U.indptr))
        out["users_2hop"].extend(np.diff(two.indptr))
        out["items_3hop"].extend(np.diff(three.indptr))
    return {k: q(v) for k, v in out.items()}


def graph_analysis(df, rng):
    pos = df[(df.timestamp < T1_MS) & (df.rating >= 4)]
    R, users, items, _, _ = build_graph(pos)
    item_deg = np.asarray(R.sum(0)).ravel()
    user_deg = np.asarray(R.sum(1)).ravel()
    out = {"train_graph": {"edges": int(R.nnz), "users": int(R.shape[0]), "items": int(R.shape[1])},
           "matches_registered_manifest": {"edges": int(R.nnz) == EXPECTED_TRAIN["edges"], "users": int(R.shape[0]) == EXPECTED_TRAIN["users"], "items": int(R.shape[1]) == EXPECTED_TRAIN["items"]}}
    C = (R.T @ R).tocsr()
    C.setdiag(0)
    C.eliminate_zeros()
    co_deg = np.diff(C.indptr)
    out["item_item_cooccurrence"] = {
        "unique_item_pairs": int(C.nnz // 2),
        "items_with_no_cooccurring_item": int((co_deg == 0).sum()),
        "share_items_with_no_cooccurring_item": float((co_deg == 0).mean()),
        "cooccurring_items_per_item": q(co_deg),
        "by_cohort_share_no_cooccurrence": {c: float((co_deg[cohort_of_degree(item_deg) == c] == 0).mean()) for c in ("head", "body", "tail")},
        "pair_weight_distribution": q(C.data),
    }
    single_user_mask = user_deg == 1
    items_only_singletons = np.asarray(R[~single_user_mask].sum(0)).ravel() == 0
    out["items_reached_only_by_single_interaction_users"] = {"items": int(items_only_singletons.sum()), "share": float(items_only_singletons.mean())}
    sample = rng.choice(R.shape[0], size=min(5000, R.shape[0]), replace=False)
    out["unsampled_user_reach_random_users"] = user_reach(R, sample)
    active = np.flatnonzero(user_deg >= 5)
    if len(active):
        out["unsampled_user_reach_users_deg_ge5"] = user_reach(R, rng.choice(active, size=min(2000, len(active)), replace=False))
    out["neighbourhood_explosion_unsampled"] = neighbourhood_explosion(R, rng)
    cohort = cohort_of_degree(item_deg)
    out["cohort_check"] = {c: {"items": int((cohort == c).sum()), "edge_share": float(item_deg[cohort == c].sum() / item_deg.sum())} for c in ("head", "body", "tail")}
    return out, (R, users, items)


# ---------------------------------------------------------------- R1 development split
def development_split(df, out_dir):
    pos = df[(df.rating >= 4) & (df.timestamp < T1_MS)].copy()
    rule = "t0 = t1 - (t2 - t1)"
    t0 = T1_MS - (T2_MS - T1_MS)

    def make(t0):
        tr = pos[pos.timestamp < t0]
        dv = pos[(pos.timestamp >= t0) & (pos.timestamp < T1_MS)]
        warm = dv[dv.u.isin(tr.u.unique()) & dv.i.isin(tr.i.unique())]
        return tr, dv, warm

    tr, dv, warm = make(t0)
    fallback = len(warm) < 20000 or len(tr) < 0.5 * len(pos)
    primary_counts = {"dev_train_edges": int(len(tr)), "dev_window_rows": int(len(dv)), "dev_warm_targets": int(len(warm))}
    if fallback:
        rule = "fallback: t0 = 80% edge quantile of P4 rows before t1"
        t0 = int(np.quantile(pos.timestamp.values, 0.8))
        tr, dv, warm = make(t0)
    u_ids, u_idx = np.unique(tr.u.values, return_inverse=True)
    i_ids, i_idx = np.unique(tr.i.values, return_inverse=True)
    umap = pd.Series(np.arange(len(u_ids)), index=u_ids)
    imap = pd.Series(np.arange(len(i_ids)), index=i_ids)
    assert tr.timestamp.max() < warm.timestamp.min() if len(warm) else True
    assert (warm.timestamp < T1_MS).all() and (tr.timestamp < t0).all()
    out_dir.mkdir(parents=True, exist_ok=True)
    files = {}

    def save(name, frame):
        path = out_dir / name
        frame.to_csv(path, index=False, compression="gzip")
        files[name] = {"rows": int(len(frame)), "sha256": sha256_file(path), "bytes": path.stat().st_size}

    save("dev_train_edges.csv.gz", pd.DataFrame({"user_idx": u_idx, "item_idx": i_idx, "timestamp": tr.timestamp.values}))
    save("dev_targets.csv.gz", pd.DataFrame({"user_idx": umap[warm.u.values].values, "item_idx": imap[warm.i.values].values, "timestamp": warm.timestamp.values}))
    manifest = {
        "gate": "R1", "spec": "PHASE2_GRAPES_GFN_REC_SPEC_vn.md §3.1", "rule_used": rule, "fallback_triggered": bool(fallback),
        "primary_rule_counts": primary_counts, "t0_ms": int(t0), "t1_ms": T1_MS, "t2_ms": T2_MS,
        "dev_train": {"edges": int(len(tr)), "users": int(len(u_ids)), "items": int(len(i_ids)), "share_of_current_train_edges": float(len(tr) / len(pos))},
        "dev_window": {"rows": int(len(dv)), "warm_targets": int(len(warm)), "warm_retention": float(len(warm) / max(len(dv), 1)),
                       "excluded_unseen_user": int((~dv.u.isin(u_ids)).sum()), "excluded_unseen_item_only": int((dv.u.isin(u_ids) & ~dv.i.isin(i_ids)).sum())},
        "isolation": {"max_dev_train_ts_lt_min_dev_target_ts": bool(len(warm) == 0 or tr.timestamp.max() < warm.timestamp.min()),
                      "all_dev_rows_before_t1": True, "current_validation_or_test_rows_used": False},
        "user_mapping_note": "user_idx/item_idx are positions in sorted internal factor codes of this run; original IDs are written to dev_user_ids/dev_item_ids",
        "files": files,
    }
    save("dev_user_ids.csv.gz", pd.DataFrame({"user_idx": np.arange(len(u_ids)), "user_code": u_ids}))
    save("dev_item_ids.csv.gz", pd.DataFrame({"item_idx": np.arange(len(i_ids)), "item_code": i_ids}))
    manifest["files"] = files
    return manifest, tr, warm


def dev_target_analysis(tr, warm, rng, sample=20000):
    R, users, items, _, _ = build_graph(tr)
    item_deg = np.asarray(R.sum(0)).ravel()
    user_deg = np.asarray(R.sum(1)).ravel()
    upos = pd.Series(np.arange(len(users)), index=users)
    ipos = pd.Series(np.arange(len(items)), index=items)
    tu = upos[warm.u.values].values
    ti = ipos[warm.i.values].values
    cohort = cohort_of_degree(item_deg)
    out = {"scope": "development window targets vs G_dev_train (no current validation/test)",
           "targets": int(len(warm)),
           "target_item_cohort_share": {c: float((cohort[ti] == c).mean()) for c in ("head", "body", "tail")},
           "catalog_item_cohort_share": {c: float((cohort == c).mean()) for c in ("head", "body", "tail")},
           "target_user_train_degree_bucket_share": {bucket_label(a, b): float(((user_deg[tu] >= a) & (user_deg[tu] <= b)).mean()) for a, b in USER_BUCKETS}}
    idx = rng.choice(len(tu), size=min(sample, len(tu)), replace=False)
    Rt = R.T.tocsr()
    hit1 = hit3 = 0
    by_c = Counter()
    tot_c = Counter()
    for s in range(0, len(idx), 512):
        b = idx[s:s + 512]
        U = R[tu[b]]
        three = (U @ Rt) @ R
        for k, j in enumerate(b):
            row = three.indices[three.indptr[k]:three.indptr[k + 1]]
            r3 = np.isin(ti[j], row)
            hit3 += r3
            c = cohort[ti[j]]
            tot_c[c] += 1
            by_c[c] += r3
    out["target_reachable_within_3_hops"] = {"sampled_targets": int(len(idx)), "share": float(hit3 / len(idx)),
                                             "by_target_cohort": {c: float(by_c[c] / tot_c[c]) for c in tot_c}}
    return out


# ---------------------------------------------------------------- S6 metadata
def metadata_analysis(meta_path, df, items):
    pre = df[(df.timestamp < T1_MS) & (df.rating >= 4)]
    asin_counts = pre.groupby("parent_asin").size()
    train_asins = set(asin_counts.index)
    recs = []
    opener = gzip.open if str(meta_path).endswith(".gz") else open
    with opener(meta_path, "rt", encoding="utf-8") as f:
        for line in f:
            o = json.loads(line)
            a = o.get("parent_asin")
            if a not in train_asins:
                continue
            cats = o.get("categories") or []
            price = o.get("price")
            try:
                price = float(str(price).replace("$", "").replace(",", "")) if price not in (None, "", "None") else None
            except ValueError:
                price = None
            recs.append({"parent_asin": a, "has_title": bool(o.get("title")), "n_categories": len(cats),
                         "cat_l2": cats[1] if len(cats) > 1 else (cats[0] if cats else None),
                         "cat_leaf": cats[-1] if cats else None, "price": price, "has_store": bool(o.get("store")),
                         "n_features": len(o.get("features") or []), "desc_chars": len(" ".join(o.get("description") or [])),
                         "main_category": o.get("main_category")})
    m = pd.DataFrame(recs)
    m["deg"] = m.parent_asin.map(asin_counts).values
    m["cohort"] = cohort_of_degree(m.deg.values)
    n_train = len(train_asins)
    out = {"train_items": n_train, "train_items_with_metadata": int(len(m)), "coverage": float(len(m) / n_train),
           "field_coverage": {"title": float(m.has_title.mean()), "categories_nonempty": float((m.n_categories > 0).mean()),
                              "price": float(m.price.notna().mean()), "store": float(m.has_store.mean()),
                              "features_nonempty": float((m.n_features > 0).mean()), "description_nonempty": float((m.desc_chars > 0).mean())},
           "category_depth": {str(k): int(v) for k, v in m.n_categories.value_counts().sort_index().items()},
           "distinct_level2_categories": int(m.cat_l2.nunique()), "distinct_leaf_categories": int(m.cat_leaf.nunique()),
           "main_category_top": {str(k): int(v) for k, v in m.main_category.value_counts().head(8).items()}}
    top = m.groupby("cat_l2").agg(items=("parent_asin", "size"), interactions=("deg", "sum")).sort_values("interactions", ascending=False)
    out["level2_category_top12"] = [{"category": str(c), "item_share": float(r["items"] / len(m)), "interaction_share": float(r["interactions"] / m.deg.sum())} for c, r in top.head(12).iterrows()]
    out["by_cohort"] = {c: {"items": int((m.cohort == c).sum()), "price_median": float(m.price[m.cohort == c].median()) if m.price[m.cohort == c].notna().any() else None,
                            "categories_nonempty": float((m.n_categories[m.cohort == c] > 0).mean()),
                            "distinct_leaf_categories": int(m.cat_leaf[m.cohort == c].nunique())} for c in ("head", "body", "tail")}
    out["price_quantiles"] = q(m.price.dropna().values)
    return out


# ---------------------------------------------------------------- figures
def figures(summary, fig_dir):
    import matplotlib
    matplotlib.use("Agg")
    import matplotlib.pyplot as plt
    fig_dir.mkdir(parents=True, exist_ok=True)
    made = []
    teal, amber, coral, gray = "#0F4C4F", "#E89B2D", "#C8553D", "#9AA5A6"

    def done(name):
        plt.tight_layout(); plt.savefig(fig_dir / name, dpi=160); plt.close(); made.append(name)

    r = summary["S1_rating"]["by_item_popularity"]
    fig, ax = plt.subplots(figsize=(7, 3.6))
    labs = [x["item_rating_count_bucket"] for x in r]
    s5 = [x["share_5"] or 0 for x in r]
    ax.bar(labs, s5, color=teal, label="5★")
    ax.bar(labs, [x["share_le3"] or 0 for x in r], bottom=s5, color=coral, label="≤3★")
    ax.set_ylabel("tỷ lệ rating"); ax.set_xlabel("số rating của sản phẩm (trước t1)"); ax.legend(frameon=False)
    ax.set_title("Rating theo độ phổ biến sản phẩm")
    done("D1_rating_by_item_popularity.png")

    y = summary["S2_temporal"]["yearly_volume_all_rows"]
    fig, ax = plt.subplots(figsize=(7, 3.6))
    ax.bar([v["year"] for v in y], [v["rows"] for v in y], color=teal)
    ax2 = ax.twinx(); ax2.plot([v["year"] for v in y], [v["new_user_rows_share"] for v in y], color=amber, marker="o")
    ax.set_ylabel("số rating"); ax2.set_ylabel("tỷ lệ rating từ user mới", color=amber)
    ax.axvline(pd.to_datetime(T1_MS, unit="ms").year + 0.6, color=gray, ls="--")
    ax.set_title("Khối lượng theo năm và tỷ lệ user mới")
    done("D2_yearly_volume_new_users.png")

    d = summary["S2_temporal"]["popularity_drift_top1pct"]
    dd = [v for v in d if "jaccard_with_prev_year_top1pct" in v]
    if dd:
        fig, ax = plt.subplots(figsize=(7, 3.2))
        ax.plot([v["year"] for v in dd], [v["jaccard_with_prev_year_top1pct"] for v in dd], marker="o", color=teal, label="Jaccard top-1% với năm trước")
        ax.plot([v["year"] for v in dd], [v["row_share_on_prev_year_top1pct"] for v in dd], marker="s", color=amber, label="tỷ lệ rating vào top-1% năm trước")
        ax.set_ylim(0, 1); ax.legend(frameon=False); ax.set_title("Độ trôi của sản phẩm phổ biến")
        done("D3_popularity_drift.png")

    ex = summary["S4_graph"]["neighbourhood_explosion_unsampled"]
    fig, ax = plt.subplots(figsize=(7, 3.6))
    for e, col in zip(ex, [gray, teal, amber, coral]):
        ax.plot([1, 2, 3], [s * 100 for s in e["cumulative_reach_share_of_nodes"]], marker="o", color=col, label=f"batch {e['batch_triplets']:,} triplet")
    ax.set_xticks([1, 2, 3]); ax.set_xlabel("số bước lan truyền"); ax.set_ylabel("% node của graph bị chạm tới"); ax.legend(frameon=False)
    ax.set_title("Bùng nổ lân cận khi không lấy mẫu")
    done("D4_neighbourhood_explosion.png")

    t = summary["R1_dev_target_analysis"]
    fig, ax = plt.subplots(figsize=(6, 3.4))
    cs = ["head", "body", "tail"]
    x = np.arange(3)
    ax.bar(x - 0.2, [t["catalog_item_cohort_share"][c] for c in cs], 0.4, color=gray, label="% sản phẩm trong catalog")
    ax.bar(x + 0.2, [t["target_item_cohort_share"][c] for c in cs], 0.4, color=teal, label="% target (development)")
    ax.set_xticks(x); ax.set_xticklabels(cs); ax.legend(frameon=False); ax.set_title("Target rơi vào nhóm nào")
    done("D5_target_cohorts.png")

    meta = summary.get("S6_metadata")
    if meta and "level2_category_top12" in meta:
        top = meta["level2_category_top12"]
        fig, ax = plt.subplots(figsize=(7, 4.2))
        yy = np.arange(len(top))[::-1]
        ax.barh(yy + 0.2, [c["item_share"] for c in top], 0.4, color=gray, label="% sản phẩm")
        ax.barh(yy - 0.2, [c["interaction_share"] for c in top], 0.4, color=teal, label="% tương tác")
        ax.set_yticks(yy); ax.set_yticklabels([c["category"][:28] for c in top], fontsize=8); ax.legend(frameon=False)
        ax.set_title("Danh mục cấp 2 (metadata)")
        done("D6_metadata_categories.png")
    return made


# ---------------------------------------------------------------- main
def run(raw_path, out_dir, dev_dir, meta_path=None, seed=20260916, skip_hash=False):
    rng = np.random.default_rng(seed)
    out_dir = Path(out_dir); dev_dir = Path(dev_dir)
    out_dir.mkdir(parents=True, exist_ok=True)
    summary = {"seed": seed, "raw_path": str(raw_path)}
    if not skip_hash:
        h = sha256_file(raw_path)
        summary["raw_sha256"] = h
        summary["raw_sha256_matches_audit"] = h == EXPECTED_RAW_SHA256
    df, users, items = load_raw(raw_path)
    summary["rows_after_quarantine"] = int(len(df))
    print("S1"); summary["S1_rating"] = rating_analysis(df)
    print("S2"); summary["S2_temporal"] = temporal_analysis(df)
    print("S3"); summary["S3_anomalies"] = anomaly_analysis(df)
    print("S4"); summary["S4_graph"], _ = graph_analysis(df, rng)
    print("R1"); manifest, tr, warm = development_split(df, dev_dir)
    (dev_dir / "development_graph_manifest.json").write_text(json.dumps(manifest, indent=2))
    summary["R1_dev_manifest"] = manifest
    print("R1 targets"); summary["R1_dev_target_analysis"] = dev_target_analysis(tr, warm, rng)
    if meta_path and Path(meta_path).exists():
        print("S6"); summary["S6_metadata"] = metadata_analysis(meta_path, df, items)
    else:
        summary["S6_metadata"] = {"status": "metadata file not available"}
    (out_dir / "deep_analysis_summary.json").write_text(json.dumps(summary, indent=2, ensure_ascii=False))
    summary["figures"] = figures(summary, out_dir / "figures")
    (out_dir / "deep_analysis_summary.json").write_text(json.dumps(summary, indent=2, ensure_ascii=False))
    return summary


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--raw", required=True)
    ap.add_argument("--out", required=True)
    ap.add_argument("--dev-out", required=True)
    ap.add_argument("--meta")
    ap.add_argument("--skip-hash", action="store_true")
    a = ap.parse_args()
    run(a.raw, a.out, a.dev_out, a.meta, skip_hash=a.skip_hash)
