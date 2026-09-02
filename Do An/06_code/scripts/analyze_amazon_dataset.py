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
import subprocess
import sys
import urllib.parse
import urllib.request
from collections import Counter
from pathlib import Path
from typing import Dict, Iterable, Mapping, TextIO, Tuple


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


def value_summary(values: Iterable[int]) -> Dict[str, float | int]:
    materialized = list(values)
    return {
        "count": len(materialized),
        "min": min(materialized) if materialized else 0,
        "max": max(materialized) if materialized else 0,
        "mean": (sum(materialized) / len(materialized)) if materialized else 0.0,
        "p50": quantile(materialized, 0.50),
        "p90": quantile(materialized, 0.90),
        "p95": quantile(materialized, 0.95),
        "p99": quantile(materialized, 0.99),
        "singletons": sum(value == 1 for value in materialized),
        "singleton_rate": (
            sum(value == 1 for value in materialized) / len(materialized)
            if materialized
            else 0.0
        ),
    }


def fraction(numerator: int, denominator: int) -> float | None:
    return numerator / denominator if denominator else None


def detected_code_version() -> Dict[str, object]:
    """Return the current Git identity when the script runs inside a checkout."""

    try:
        root = subprocess.run(
            ["git", "rev-parse", "--show-toplevel"],
            check=True,
            capture_output=True,
            text=True,
        ).stdout.strip()
        commit = subprocess.run(
            ["git", "rev-parse", "HEAD"],
            cwd=root,
            check=True,
            capture_output=True,
            text=True,
        ).stdout.strip()
        dirty = bool(
            subprocess.run(
                ["git", "status", "--porcelain", "--untracked-files=no"],
                cwd=root,
                check=True,
                capture_output=True,
                text=True,
            ).stdout.strip()
        )
        return {"git_commit": commit, "tracked_worktree_dirty": dirty}
    except (OSError, subprocess.CalledProcessError):
        return {"git_commit": "UNKNOWN", "tracked_worktree_dirty": None}


def scalar(connection: sqlite3.Connection, query: str, parameters: tuple[object, ...] = ()) -> int:
    value = connection.execute(query, parameters).fetchone()[0]
    return int(value or 0)


def protocol_snapshot(
    connection: sqlite3.Connection,
    name: str,
    rating_predicate: str,
    t1_ms: int,
    t2_ms: int,
) -> Dict[str, object]:
    """Derive one exact pre-model semantic and warm-start snapshot."""

    connection.execute("DROP TABLE IF EXISTS selected_events")
    connection.execute(
        f"""
        CREATE TEMP TABLE selected_events AS
        SELECT user_id, parent_asin, rating, timestamp_ms, source_row
        FROM deduplicated_events
        WHERE {rating_predicate}
        """
    )
    connection.execute("CREATE INDEX selected_user_idx ON selected_events(user_id)")
    connection.execute("CREATE INDEX selected_item_idx ON selected_events(parent_asin)")
    connection.execute("CREATE INDEX selected_time_idx ON selected_events(timestamp_ms)")

    event_count = scalar(connection, "SELECT COUNT(*) FROM selected_events")
    user_count = scalar(connection, "SELECT COUNT(DISTINCT user_id) FROM selected_events")
    item_count = scalar(connection, "SELECT COUNT(DISTINCT parent_asin) FROM selected_events")
    user_degrees = [
        row[0]
        for row in connection.execute(
            "SELECT COUNT(*) FROM selected_events GROUP BY user_id"
        )
    ]
    item_degrees = [
        row[0]
        for row in connection.execute(
            "SELECT COUNT(*) FROM selected_events GROUP BY parent_asin"
        )
    ]

    connection.execute("DROP TABLE IF EXISTS training_users")
    connection.execute("DROP TABLE IF EXISTS training_items")
    connection.execute("DROP TABLE IF EXISTS training_user_degrees")
    connection.execute(
        "CREATE TEMP TABLE training_users AS "
        "SELECT DISTINCT user_id FROM selected_events WHERE timestamp_ms < ?",
        (t1_ms,),
    )
    connection.execute("CREATE UNIQUE INDEX training_users_idx ON training_users(user_id)")
    connection.execute(
        "CREATE TEMP TABLE training_items AS "
        "SELECT DISTINCT parent_asin FROM selected_events WHERE timestamp_ms < ?",
        (t1_ms,),
    )
    connection.execute("CREATE UNIQUE INDEX training_items_idx ON training_items(parent_asin)")
    connection.execute(
        "CREATE TEMP TABLE training_user_degrees AS "
        "SELECT user_id, COUNT(*) AS degree FROM selected_events "
        "WHERE timestamp_ms < ? GROUP BY user_id",
        (t1_ms,),
    )
    connection.execute("CREATE UNIQUE INDEX training_degree_idx ON training_user_degrees(user_id)")
    training_items = scalar(connection, "SELECT COUNT(*) FROM training_items")

    partition_bounds = {
        "train_candidate": ("timestamp_ms < ?", (t1_ms,)),
        "validation_candidate": ("timestamp_ms >= ? AND timestamp_ms < ?", (t1_ms, t2_ms)),
        "test_candidate": ("timestamp_ms >= ?", (t2_ms,)),
    }
    partitions: Dict[str, object] = {}
    for partition_name, (where, parameters) in partition_bounds.items():
        rows = scalar(connection, f"SELECT COUNT(*) FROM selected_events WHERE {where}", parameters)
        users = scalar(connection, f"SELECT COUNT(DISTINCT user_id) FROM selected_events WHERE {where}", parameters)
        items = scalar(connection, f"SELECT COUNT(DISTINCT parent_asin) FROM selected_events WHERE {where}", parameters)
        entry: Dict[str, object] = {"rows": rows, "unique_users": users, "unique_items": items}
        if partition_name != "train_candidate":
            user_oov = scalar(
                connection,
                f"SELECT COUNT(DISTINCT e.user_id) FROM selected_events e "
                f"WHERE {where} AND NOT EXISTS "
                "(SELECT 1 FROM training_users u WHERE u.user_id = e.user_id)",
                parameters,
            )
            item_oov = scalar(
                connection,
                f"SELECT COUNT(DISTINCT e.parent_asin) FROM selected_events e "
                f"WHERE {where} AND NOT EXISTS "
                "(SELECT 1 FROM training_items i WHERE i.parent_asin = e.parent_asin)",
                parameters,
            )
            warm_rows = scalar(
                connection,
                f"SELECT COUNT(*) FROM selected_events e WHERE {where} "
                "AND EXISTS (SELECT 1 FROM training_users u WHERE u.user_id = e.user_id) "
                "AND EXISTS (SELECT 1 FROM training_items i WHERE i.parent_asin = e.parent_asin)",
                parameters,
            )
            candidate_counts = (
                row[0]
                for row in connection.execute(
                    f"SELECT ? - d.degree FROM selected_events e "
                    "JOIN training_user_degrees d ON d.user_id = e.user_id "
                    f"WHERE {where} AND EXISTS "
                    "(SELECT 1 FROM training_items i WHERE i.parent_asin = e.parent_asin)",
                    (training_items, *parameters),
                )
            )
            entry.update({
                "users_not_in_training": user_oov,
                "user_oov_rate": fraction(user_oov, users),
                "items_not_in_training": item_oov,
                "item_oov_rate": fraction(item_oov, items),
                "warm_start_target_rows": warm_rows,
                "warm_start_target_retention": fraction(warm_rows, rows),
                "eligible_full_catalog_candidates_after_training_history": value_summary(candidate_counts),
            })
        partitions[partition_name] = entry

    training_degrees = [row[0] for row in connection.execute("SELECT degree FROM training_user_degrees")]
    available_negatives = [training_items - degree for degree in training_degrees]
    result = {
        "policy": name,
        "rating_predicate": rating_predicate,
        "event_count": event_count,
        "retention_from_clean_deduplicated_events": None,
        "unique_users": user_count,
        "unique_items": item_count,
        "user_degree": value_summary(user_degrees),
        "item_degree": value_summary(item_degrees),
        "bipartite_density": fraction(event_count, user_count * item_count),
        "partitions": partitions,
        "training_negative_pool": {
            "training_item_universe": training_items,
            "available_items_after_excluding_training_positives": value_summary(available_negatives),
            "users_with_zero_available_negatives": sum(value == 0 for value in available_negatives),
        },
    }
    return result


def run_protocol_audit(
    connection: sqlite3.Connection,
    t1_ms: int,
    t2_ms: int,
) -> Dict[str, object]:
    """Produce exact duplicate, timestamp, and P4/P5/all-observed evidence."""

    total_events = scalar(connection, "SELECT COUNT(*) FROM events")
    duplicate_rows = scalar(
        connection,
        "SELECT COALESCE(SUM(pair_count - 1), 0) FROM "
        "(SELECT COUNT(*) AS pair_count FROM events GROUP BY user_id, parent_asin HAVING pair_count > 1)",
    )
    timestamp_ties = scalar(
        connection,
        "SELECT COALESCE(SUM(timestamp_count), 0) FROM "
        "(SELECT COUNT(*) AS timestamp_count FROM events GROUP BY timestamp_ms HAVING timestamp_count > 1)",
    )
    connection.execute("DROP TABLE IF EXISTS deduplicated_events")
    connection.execute(
        """
        CREATE TABLE deduplicated_events AS
        SELECT user_id, parent_asin, rating, timestamp_ms, source_row
        FROM (
            SELECT user_id, parent_asin, rating, timestamp_ms, source_row,
                   ROW_NUMBER() OVER (
                       PARTITION BY user_id, parent_asin
                       ORDER BY timestamp_ms ASC, source_row ASC
                   ) AS pair_rank
            FROM events
            WHERE rating BETWEEN 1.0 AND 5.0
        )
        WHERE pair_rank = 1
        """
    )
    connection.execute("CREATE INDEX dedup_time_idx ON deduplicated_events(timestamp_ms)")
    clean_count = scalar(connection, "SELECT COUNT(*) FROM deduplicated_events")
    snapshots = {
        "all_observed": protocol_snapshot(connection, "all_observed", "rating BETWEEN 1.0 AND 5.0", t1_ms, t2_ms),
        "p4": protocol_snapshot(connection, "P4", "rating >= 4.0 AND rating <= 5.0", t1_ms, t2_ms),
        "p5": protocol_snapshot(connection, "P5", "rating = 5.0", t1_ms, t2_ms),
    }
    for snapshot in snapshots.values():
        snapshot["retention_from_clean_deduplicated_events"] = fraction(snapshot["event_count"], clean_count)
    return {
        "status": "EXACT_PRE_MODEL_PROTOCOL_AUDIT; NO POLICY SELECTED",
        "anomaly_policy": "Quarantine ratings outside [1, 5] before semantic snapshots",
        "duplicate_policy": "Earliest timestamp, then stable source-row order",
        "syntactically_valid_events": total_events,
        "duplicate_user_item_rows": duplicate_rows,
        "clean_deduplicated_events": clean_count,
        "timestamp_audit": {
            "mode": "exact_sqlite",
            "rows_in_shared_timestamp_values": timestamp_ties,
            "rows_exactly_at_t1": scalar(connection, "SELECT COUNT(*) FROM events WHERE timestamp_ms = ?", (t1_ms,)),
            "rows_exactly_at_t2": scalar(connection, "SELECT COUNT(*) FROM events WHERE timestamp_ms = ?", (t2_ms,)),
            "min_ms": connection.execute("SELECT MIN(timestamp_ms) FROM events").fetchone()[0],
            "max_ms": connection.execute("SELECT MAX(timestamp_ms) FROM events").fetchone()[0],
        },
        "semantic_snapshots": snapshots,
        "selection_boundary": "Choose the primary policy from semantics and pre-model feasibility, never downstream test metrics.",
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
    protocol_audit: bool = False,
    access_note: str | None = None,
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
    protocol_db: sqlite3.Connection | None = None
    protocol_db_path: Path | None = None

    if protocol_audit:
        protocol_db_path = path.with_suffix(path.suffix + ".protocol_audit.sqlite")
        if protocol_db_path.exists():
            protocol_db_path.unlink()
        protocol_db = sqlite3.connect(protocol_db_path)
        protocol_db.execute("PRAGMA journal_mode=OFF")
        protocol_db.execute("PRAGMA synchronous=OFF")
        protocol_db.execute("PRAGMA temp_store=FILE")
        protocol_db.execute(
            "CREATE TABLE events ("
            "user_id TEXT NOT NULL, parent_asin TEXT NOT NULL, rating REAL NOT NULL, "
            "timestamp_ms INTEGER NOT NULL, source_row INTEGER NOT NULL)"
        )

    if pair_audit == "sqlite" and not protocol_audit:
        pair_db_path = path.with_suffix(path.suffix + ".pair_audit.sqlite")
        if pair_db_path.exists():
            pair_db_path.unlink()
        pair_db = sqlite3.connect(pair_db_path)
        pair_db.execute("PRAGMA journal_mode=MEMORY")
        pair_db.execute("PRAGMA synchronous=OFF")
        pair_db.execute("CREATE TABLE IF NOT EXISTS pairs (user_id TEXT NOT NULL, parent_asin TEXT NOT NULL, PRIMARY KEY (user_id, parent_asin))")
        pair_cursor = pair_db.cursor()
    elif pair_audit == "memory" and not protocol_audit:
        seen_pairs: set[tuple[str, str]] = set()
    elif pair_audit != "none" and not protocol_audit:
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

            if protocol_db is not None:
                protocol_db.execute(
                    "INSERT INTO events(user_id, parent_asin, rating, timestamp_ms, source_row) "
                    "VALUES (?, ?, ?, ?, ?)",
                    (user_id, item_id, rating, timestamp_ms, row_index),
                )
                if row_index % 50000 == 0:
                    protocol_db.commit()

            user_degree[user_id] += 1
            item_degree[item_id] += 1
            rating_counts[str(rating)] += 1
            for threshold in RATING_THRESHOLDS:
                if rating >= threshold:
                    threshold_counts[str(int(threshold))] += 1

            if pair_audit == "sqlite" and not protocol_audit:
                assert pair_cursor is not None and pair_db is not None
                pair_cursor.execute("INSERT OR IGNORE INTO pairs(user_id, parent_asin) VALUES (?, ?)", (user_id, item_id))
                if pair_cursor.rowcount == 0:
                    duplicate_pairs += 1
                if row_index % 50000 == 0:
                    pair_db.commit()
            elif pair_audit == "memory" and not protocol_audit:
                pair = (user_id, item_id)
                if pair in seen_pairs:
                    duplicate_pairs += 1
                else:
                    seen_pairs.add(pair)

            if timestamp_audit and not protocol_audit:
                timestamp_counts[timestamp_ms] += 1

            split = split_name(timestamp_ms, t1_ms, t2_ms)
            split_rows[split] += 1
            split_users[split].add(user_id)
            split_items[split].add(item_id)

    if pair_db is not None:
        pair_db.commit()
        pair_db.close()
    if timestamp_audit and not protocol_audit:
        timestamp_ties = sum(count for count in timestamp_counts.values() if count > 1)

    protocol_result: Dict[str, object] | None = None
    if protocol_db is not None:
        protocol_db.commit()
        protocol_db.execute("CREATE INDEX events_pair_idx ON events(user_id, parent_asin)")
        protocol_db.execute("CREATE INDEX events_time_idx ON events(timestamp_ms)")
        protocol_result = run_protocol_audit(protocol_db, t1_ms, t2_ms)
        duplicate_pairs = int(protocol_result["duplicate_user_item_rows"])

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
    exact_pair_audit = protocol_audit or pair_audit != "none"
    exact_timestamp_audit = protocol_audit or timestamp_audit
    config = {
        "t1_ms": t1_ms,
        "t2_ms": t2_ms,
        "pair_audit": "exact_sqlite" if protocol_audit else pair_audit,
        "timestamp_audit": "exact_sqlite" if protocol_audit else ("exact_memory" if timestamp_audit else "disabled"),
        "protocol_audit": protocol_audit,
        "anomaly_policy": "quarantine_outside_rating_range_1_to_5" if protocol_audit else "report_only",
        "semantic_snapshots": ["all_observed", "P4", "P5"] if protocol_audit else [],
    }
    config_payload = json.dumps(config, sort_keys=True, separators=(",", ":")).encode("utf-8")
    unique_pairs = valid_rows - duplicate_pairs if exact_pair_audit else None
    result: Dict[str, object] = {
        "status": "ACQUIRED",
        "dataset_family": "Amazon Reviews'23",
        "category": category_from_path(path),
        "artifact_url": source,
        "retrieved_at": utc_now(),
        "audit_config": config,
        "audit_config_sha256": hashlib.sha256(config_payload).hexdigest(),
        "code_version": detected_code_version(),
        "raw_schema": {"columns": list(EXPECTED_COLUMNS), "item_key": "parent_asin"},
        "temporal_cutoffs": {"t1_ms": t1_ms, "t2_ms": t2_ms, "status": "CANDIDATE; NOT FROZEN"},
        "post_filter_counts": {"status": "NOT APPLIED"},
        "license_or_access_note": access_note or (
            "Official Amazon Reviews'23 pages identify McAuley Lab, citation, fields, and downloads; "
            "no dataset-wide license grant was found there. Repository MIT terms are not attributed to the data."
        ),
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
        "duplicate_user_item_rows": duplicate_pairs if exact_pair_audit else None,
        "invalid_or_missing": dict(missing_or_invalid),
        "rating_counts": dict(sorted(rating_counts.items(), key=lambda pair: float(pair[0]))),
        "rows_at_or_above_rating_threshold": dict(sorted(threshold_counts.items(), key=lambda pair: int(pair[0]))),
        "user_degree": degree_summary(user_degree),
        "item_degree": degree_summary(item_degree),
        "graph_density_if_valid_rows_are_binary_edges": (valid_rows / (users * items)) if users and items else 0.0,
        "timestamp_audit": {
            "enabled": exact_timestamp_audit,
            "min_ms": (
                protocol_result["timestamp_audit"]["min_ms"]
                if protocol_result is not None
                else (min(timestamp_counts) if timestamp_counts else None)
            ),
            "max_ms": (
                protocol_result["timestamp_audit"]["max_ms"]
                if protocol_result is not None
                else (max(timestamp_counts) if timestamp_counts else None)
            ),
            "rows_in_shared_timestamp_values": (
                protocol_result["timestamp_audit"]["rows_in_shared_timestamp_values"]
                if protocol_result is not None
                else (timestamp_ties if timestamp_audit else None)
            ),
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
        "pair_audit_mode": "exact_sqlite_protocol" if protocol_audit else pair_audit,
        "timestamp_audit_mode": "exact_sqlite_protocol" if protocol_audit else ("exact_counter" if timestamp_audit else "disabled"),
        "protocol_analysis": protocol_result,
    }
    if pair_db_path is not None and pair_db_path.exists():
        os.unlink(pair_db_path)
    if protocol_db is not None:
        protocol_db.close()
    if protocol_db_path is not None and protocol_db_path.exists():
        os.unlink(protocol_db_path)
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
    parser.add_argument(
        "--protocol-audit",
        action="store_true",
        help=(
            "Run one disk-backed exact audit covering duplicate pairs, timestamp ties, "
            "anomaly quarantine, and all-observed/P4/P5 temporal warm-start snapshots"
        ),
    )
    parser.add_argument("--access-note", default=None, help="Access/usage note to persist in the manifest")
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
        protocol_audit=args.protocol_audit,
        access_note=args.access_note,
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
