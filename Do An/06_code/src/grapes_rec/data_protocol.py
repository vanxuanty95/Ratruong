"""Leakage and transient-edge helpers for the Week 1 boundary tests."""

from typing import Iterable, Set, Tuple


Edge = Tuple[int, int]


def undirected_edges(edges: Iterable[Edge]) -> Set[Edge]:
    """Expand canonical edges into both storage directions."""

    expanded: Set[Edge] = set()
    for left, right in edges:
        expanded.add((left, right))
        expanded.add((right, left))
    return expanded


def mask_positive_edge(edges: Iterable[Edge], user: int, item: int) -> Set[Edge]:
    """Remove both storage directions of one positive edge for a transient view."""

    forbidden = {(user, item), (item, user)}
    return {edge for edge in edges if edge not in forbidden}
