"""Dependency-free sampling contracts for Week 1 toy tests."""

import math
from typing import Iterable, Mapping, Sequence, Tuple

from .contracts import BipartiteGraph


def candidate_nodes(graph: BipartiteGraph, previous_nodes: Iterable[int]) -> Tuple[int, ...]:
    r"""Implement ``C_l = N(K_(l-1)) \ K_(l-1)``."""

    previous = set(previous_nodes)
    return tuple(node for node in graph.neighbors(previous) if node not in previous)


def select_top_k(scores: Mapping[int, float], k: int) -> Tuple[int, ...]:
    """Deterministic top-k placeholder for the later Gumbel Top-k implementation."""

    if k < 0:
        raise ValueError("k must be non-negative")
    ordered = sorted(scores, key=lambda node: (-scores[node], node))
    return tuple(ordered[: min(k, len(ordered))])


def full_bernoulli_log_prob(logits: Sequence[float], selected: Iterable[int]) -> float:
    """Finite log-probability of a full binary mask under independent logits."""

    selected_set = set(selected)
    total = 0.0
    for index, logit in enumerate(logits):
        if index in selected_set:
            total += -math.log1p(math.exp(-logit)) if logit >= 0 else logit - math.log1p(math.exp(logit))
        else:
            total += -logit - math.log1p(math.exp(-logit)) if logit >= 0 else -math.log1p(math.exp(logit))
    return total
