#!/usr/bin/env python3
"""Stream an Amazon Reviews'23 pure-ID artifact and emit an audit summary.

The script deliberately uses the Python standard library so that acquisition and
schema checks can run before the final PyTorch/PyG environment is frozen. It
does not choose the implicit-positive threshold or silently filter the data.
"""

from __future__ import annotations

import argparse
import csv
import datetime as dt
import gzip
import hashlib
import io
import json
import math
import os
import sqlite3
import sys
import urllib.parse
import urllib.request
from collections import Counter
from pathlib import Path
from typing import Dict, Iterable, Iterator, Mapping, TextIO, Tuple


EXPECTED_COLUMNS = ("user_id", "parent_asin", "rating", "timestamp")
RATING_THRESHOLDS = (1.0, 2.0, 3.0, 4.0, 5.0)
DEFAULT_T1_MS = 1628643414042
DEFAULT_T2_MS = 1658002729837


def utc_now() -> str:
    return dt.datetime.now(dt.timezone.utc).replace(microsecond=0).isoformat()


def is_url(value: str) -> bool:
    return urllib.parse.urlparse(value).scheme in {"http", "https"}


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for block in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()


def download_to_cache(source: str, cache_dir: Path, force: bool = False) -> Tuple[Path, str]:
    """Download a URL once, preserving compressed bytes for hashing."""

    if not is_url(source):
        path = Path(source).expanduser().resolve()
        if not path.is_file():
            raise FileNotFoundError(f"Input artifact does not exist: {path}")
        return path, "local_input"

    cache_dir.mkdir(parents=True, exist_ok=True)
    name = Path(urllib.parse.urlparse(source).path).name or "amazon_artifact.csv.gz"
    destination = cache_dir / name
    if force or not destination.exists():
        request = urllib.request.Request(source, headers={"User-Agent": "GRAPES-Rec-Dataset-Audit/0.1"})
        with urllib.request.urlopen(request, timeout=120) as response, destination.open("wb") as output:
            while True:
                block = response.read(1024 * 1024)
                if not block:
                    break
                output.write(block)
        acquisition = "downloaded_now"
    else:
        acquisition = "cache_hit"
    return destination, acquisition


def open_text(path: Path) -> TextIO:
    binary = path.open("rb")
    if path.name.endswith(".gz"):
        binary = gzip.GzipFile(fileobj=binary)
    return io.TextIOWrapper(binary, encoding="utf-8", newline="")


def quantile(values: Iterable[int], probability: float) -> float:
    ordered = sorted(values)
    if not ordered:
        return 0.0
    if len(ordered) == 1:
        return float(ordered[0])
    position = probability * (len(ordered) - 1)
    lower = math.floor(position)
    upper = math.ceil(position)
    if lower == upper:
        return float(ordered[lower])
    fraction = position - lower
    return ordered[lower] + fraction * (ordered[upper] - ordered[lower])


def degree_summary(degrees: Mapping[str, int]) -> Dict[str, float | int]:
    values = list(degrees.values())
    return {
        "count": len(values),
        "min": min(values) if values else 0,
        "max": max(values) if values else 0,
        "mean": (sum(values) / len(values)) if values else 0.0,
        "p50": quantile(values, 0.50),
        "p90": quantile(values, 0.90),
        "p95": quantile(values, 0.95),
        "p99": quantile(values, 0.99),
        "singletons": sum(value == 1 for value in values),
    }


def split_name(timestamp_ms: int, t1_ms: int, t2_ms: int) -> str:
    if timestamp_ms < t1_ms:
        return "train_candidate"
    if timestamp_ms < t2_ms:
        return "validation_candidate"
    return "test_candidate"


def category_from_path(path: Path) -> str:
    name = path.name
    if name.endswith(".csv.gz"):
        return name[: -len(".csv.gz")]
    if name.endswith(".csv"):
        return name[: -len(".csv")]
    return path.stem


def audit_artifact(
    path: Path,
    source: str,
    acquisition: str,
    t1_ms: int,
    t2_ms: int,
    pair_audit: str,
    timestamp_audit: bool,
) -> Dict[str, object]:
    user_degree: Counter[str] = Counter()
    item_degree: Counter[str] = Counter()
    rating_counts: Counter[str] = Counter()
    threshold_counts: Counter[str] = Counter()
    split_rows: Counter[str] = Counter()
    split_users: Dict[str, set[str]] = {name: set() for name in ("train_candidate", "validation_candidate", "test_candidate")}
    split_items: Dict[str, set[str]] = {name: set() for name in ("train_candidate", "validation_candidate", "test_candidate")}

    missing_or_invalid = Counter({
        "missing_user_id": 0,
        "missing_parent_asin": 0,
        "invalid_rating": 0,
        "rating_out_of_expected_range_1_to_5": 0,
        "invalid_timestamp": 0,
    })
    total_rows = 0
    duplicate_pairs = 0
    timestamp_ties = 0
    timestamp_counts: Counter[int] = Counter()
    pair_db: sqlite3.Connection | None = None
    pair_cursor: sqlite3.Cursor | None = None
    pair_db_path: Path | None = None

    if pair_audit == "sqlite":
        pair_db_path = path.with_suffix(path.suffix + ".pair_audit.sqlite")
        if pair_db_path.exists():
            pair_db_path.unlink()
        pair_db = sqlite3.connect(pair_db_path)
        pair_db.execute("PRAGMA journal_mode=MEMORY")
        pair_db.execute("PRAGMA synchronous=OFF")
        pair_db.execute("CREATE TABLE IF NOT EXISTS pairs (user_id TEXT NOT NULL, parent_asin TEXT NOT NULL, PRIMARY KEY (user_id, parent_asin))")
        pair_cursor = pair_db.cursor()
    elif pair_audit == "memory":
        seen_pairs: set[tuple[str, str]] = set()
    elif pair_audit != "none":
        raise ValueError(f"Unknown pair audit mode: {pair_audit}")

    with open_text(path) as handle:
        reader = csv.DictReader(handle)
        header = tuple(reader.fieldnames or ())
        if header != EXPECTED_COLUMNS:
            raise ValueError(f"Expected header {EXPECTED_COLUMNS}, found {header}")

        for row_index, row in enumerate(reader, start=2):
            total_rows += 1
            user_id = (row.get("user_id") or "").strip()
            item_id = (row.get("parent_asin") or "").strip()
            if not user_id:
                missing_or_invalid["missing_user_id"] += 1
            if not item_id:
                missing_or_invalid["missing_parent_asin"] += 1
            if not user_id or not item_id:
                continue

            try:
                rating = float(row.get("rating", ""))
                if not math.isfinite(rating):
                    raise ValueError
            except (TypeError, ValueError):
                missing_or_invalid["invalid_rating"] += 1
                continue
            if not 1.0 <= rating <= 5.0:
                missing_or_invalid["rating_out_of_expected_range_1_to_5"] += 1

            try:
                timestamp_ms = int(row.get("timestamp", ""))
            except (TypeError, ValueError):
                missing_or_invalid["invalid_timestamp"] += 1
                continue

            user_degree[user_id] += 1
            item_degree[item_id] += 1
            rating_counts[str(rating)] += 1
            for threshold in RATING_THRESHOLDS:
                if rating >= threshold:
                    threshold_counts[str(int(threshold))] += 1

            if pair_audit == "sqlite":
                assert pair_cursor is not None and pair_db is not None
                pair_cursor.execute("INSERT OR IGNORE INTO pairs(user_id, parent_asin) VALUES (?, ?)", (user_id, item_id))
                if pair_cursor.rowcount == 0:
                    duplicate_pairs += 1
                if row_index % 50000 == 0:
                    pair_db.commit()
            elif pair_audit == "memory":
                pair = (user_id, item_id)
                if pair in seen_pairs:
                    duplicate_pairs += 1
                else:
                    seen_pairs.add(pair)

            if timestamp_audit:
                timestamp_counts[timestamp_ms] += 1

            split = split_name(timestamp_ms, t1_ms, t2_ms)
            split_rows[split] += 1
            split_users[split].add(user_id)
            split_items[split].add(item_id)

    if pair_db is not None:
        pair_db.commit()
        pair_db.close()
    if timestamp_audit:
        timestamp_ties = sum(count for count in timestamp_counts.values() if count > 1)

    train_users = split_users["train_candidate"]
    train_items = split_items["train_candidate"]
    split_summary: Dict[str, object] = {}
    for name in ("train_candidate", "validation_candidate", "test_candidate"):
        users = split_users[name]
        items = split_items[name]
        split_summary[name] = {
            "rows": split_rows[name],
            "unique_users": len(users),
            "unique_items": len(items),
            "users_not_in_training_candidate": len(users - train_users),
            "items_not_in_training_candidate": len(items - train_items),
        }

    valid_rows = sum(split_rows.values())
    users = len(user_degree)
    items = len(item_degree)
    unique_pairs = valid_rows - duplicate_pairs if pair_audit != "none" else None
    result: Dict[str, object] = {
        "status": "ACQUIRED",
        "dataset_family": "Amazon Reviews'23",
        "category": category_from_path(path),
        "artifact_url": source,
        "retrieved_at": utc_now(),
        "preprocessing_config_sha256": "UNKNOWN — audit only; no preprocessing lock yet",
        "raw_schema": {"columns": list(EXPECTED_COLUMNS), "item_key": "parent_asin"},
        "temporal_cutoffs": {"t1_ms": t1_ms, "t2_ms": t2_ms, "status": "CANDIDATE; NOT FROZEN"},
        "post_filter_counts": {"status": "NOT APPLIED"},
        "license_or_access_note": "Not yet verified; the source repository license is not assumed to cover Amazon-derived data.",
        "audit_status": "PROJECT_DERIVED_FROM_EXACT_DOWNLOADED_BYTES",
        "source": source,
        "local_artifact": str(path),
        "acquisition": acquisition,
        "retrieved_or_reused_at_utc": utc_now(),
        "compressed_bytes": path.stat().st_size,
        "sha256": sha256_file(path),
        "schema": list(EXPECTED_COLUMNS),
        "row_count": total_rows,
        "valid_row_count": valid_rows,
        "unique_users": users,
        "unique_items": items,
        "unique_user_item_pairs": unique_pairs,
        "duplicate_user_item_rows": duplicate_pairs if pair_audit != "none" else None,
        "invalid_or_missing": dict(missing_or_invalid),
        "rating_counts": dict(sorted(rating_counts.items(), key=lambda pair: float(pair[0]))),
        "rows_at_or_above_rating_threshold": dict(sorted(threshold_counts.items(), key=lambda pair: int(pair[0]))),
        "user_degree": degree_summary(user_degree),
        "item_degree": degree_summary(item_degree),
        "graph_density_if_valid_rows_are_binary_edges": (valid_rows / (users * items)) if users and items else 0.0,
        "timestamp_audit": {
            "enabled": timestamp_audit,
            "min_ms": min(timestamp_counts) if timestamp_counts else None,
            "max_ms": max(timestamp_counts) if timestamp_counts else None,
            "rows_in_shared_timestamp_values": timestamp_ties if timestamp_audit else None,
        },
        "candidate_absolute_split": {
            "t1_ms": t1_ms,
            "t2_ms": t2_ms,
            "partitions": split_summary,
            "note": "Candidate split only; not a frozen Phase 2 protocol until warm-start and filtering decisions are recorded.",
        },
        "negative_pool_diagnostic": {
            "definition": "item_count minus observed row degree per user; exact when duplicate_user_item_rows is zero",
            "minimum_available_items_across_users": min((items - degree for degree in user_degree.values()), default=0),
            "median_available_items_across_users": quantile((items - degree for degree in user_degree.values()), 0.50),
        },
        "pair_audit_mode": pair_audit,
        "timestamp_audit_mode": "exact_counter" if timestamp_audit else "disabled",
    }
    if pair_db_path is not None and pair_db_path.exists():
        os.unlink(pair_db_path)
    return result


def parse_args(argv: Iterable[str]) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--input", required=True, help="Local .csv/.csv.gz path or official artifact URL")
    parser.add_argument("--source", default=None, help="Provenance URL to record; defaults to --input")
    parser.add_argument("--cache-dir", default=".cache/amazon_reviews_2023", help="Persistent cache directory for URL inputs")
    parser.add_argument("--output", default="-", help="JSON output path, or '-' for stdout")
    parser.add_argument("--t1-ms", type=int, default=DEFAULT_T1_MS)
    parser.add_argument("--t2-ms", type=int, default=DEFAULT_T2_MS)
    parser.add_argument("--pair-audit", choices=("sqlite", "memory", "none"), default="sqlite")
    parser.add_argument("--timestamp-audit", action="store_true", help="Track exact timestamp tie rows; uses additional memory")
    parser.add_argument("--force-download", action="store_true")
    return parser.parse_args(list(argv))


def main(argv: Iterable[str] | None = None) -> int:
    args = parse_args(sys.argv[1:] if argv is None else argv)
    if args.t2_ms <= args.t1_ms:
        raise SystemExit("t2-ms must be greater than t1-ms")
    path, acquisition = download_to_cache(args.input, Path(args.cache_dir), args.force_download)
    result = audit_artifact(
        path=path,
        source=args.source or args.input,
        acquisition=acquisition,
        t1_ms=args.t1_ms,
        t2_ms=args.t2_ms,
        pair_audit=args.pair_audit,
        timestamp_audit=args.timestamp_audit,
    )
    payload = json.dumps(result, ensure_ascii=False, indent=2, sort_keys=True) + "\n"
    if args.output == "-":
        sys.stdout.write(payload)
    else:
        output = Path(args.output)
        output.parent.mkdir(parents=True, exist_ok=True)
        output.write_text(payload, encoding="utf-8")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
