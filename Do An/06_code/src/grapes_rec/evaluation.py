"""Small, exact ranking primitives used by the sanity baselines.

The functions deliberately avoid model and framework dependencies.  They make
the candidate-set policy testable before BPR-MF or LightGCN is introduced.
"""

from __future__ import annotations

from math import log2
from typing import Iterable, Sequence


def popularity_order(item_degrees: Sequence[int]) -> list[int]:
    """Return item indices ordered by degree descending, then index ascending."""

    if any(degree < 0 for degree in item_degrees):
        raise ValueError("item degrees must be non-negative")
    return sorted(range(len(item_degrees)), key=lambda item: (-item_degrees[item], item))


def ranks_from_order(order: Sequence[int], item_count: int | None = None) -> list[int]:
    """Build a one-based rank lookup and reject duplicate or missing items."""

    count = len(order) if item_count is None else item_count
    if count < 0 or len(order) != count:
        raise ValueError("order must contain every item exactly once")

    ranks = [0] * count
    for position, item in enumerate(order, start=1):
        if item < 0 or item >= count or ranks[item] != 0:
            raise ValueError("order must be a permutation of item indices")
        ranks[item] = position
    if any(rank == 0 for rank in ranks):
        raise ValueError("order must contain every item exactly once")
    return ranks


def exact_rank_after_history(
    target_item: int,
    prior_items: Iterable[int],
    global_ranks: Sequence[int],
) -> int:
    """Rank one target after removing prior positives from the full catalog.

    ``global_ranks`` is one-based.  Removing an item only changes the target
    rank when that item was globally ahead of the target.  This gives the exact
    full-catalog rank without constructing a score vector for every target.
    """

    if target_item < 0 or target_item >= len(global_ranks):
        raise IndexError("target item is outside the frozen catalog")
    target_rank = global_ranks[target_item]
    if target_rank <= 0:
        raise ValueError("global ranks must be one-based positive integers")

    prior = set(prior_items)
    if target_item in prior:
        raise ValueError("target item must not be present in strict prior history")
    if any(item < 0 or item >= len(global_ranks) for item in prior):
        raise IndexError("prior item is outside the frozen catalog")

    better_seen = sum(global_ranks[item] < target_rank for item in prior)
    return target_rank - better_seen


def top_k_unseen(order: Sequence[int], prior_items: Iterable[int], k: int) -> list[int]:
    """Return the first ``k`` globally ordered items not present in history."""

    if k <= 0:
        raise ValueError("k must be positive")
    prior = set(prior_items)
    result: list[int] = []
    for item in order:
        if item not in prior:
            result.append(item)
            if len(result) == k:
                break
    return result


def row_ranking_metrics(ranks: Iterable[int], k: int = 20) -> dict[str, float | int]:
    """Compute row-weighted Recall@k and NDCG@k for one target per row."""

    if k <= 0:
        raise ValueError("k must be positive")
    values = list(ranks)
    if not values or any(rank <= 0 for rank in values):
        raise ValueError("ranks must be a non-empty sequence of positive integers")

    hits = sum(rank <= k for rank in values)
    ndcg = sum(1.0 / log2(rank + 1) for rank in values if rank <= k) / len(values)
    return {
        "rows": len(values),
        "hits_at_k": hits,
        "recall_at_k": hits / len(values),
        "ndcg_at_k": ndcg,
        "k": k,
    }
