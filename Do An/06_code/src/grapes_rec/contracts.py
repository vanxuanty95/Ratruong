"""Graph and batch contracts from the Week 1 recommendation specification."""

from dataclasses import dataclass
from typing import Iterable, List, Sequence, Tuple


@dataclass(frozen=True)
class BPRTriplet:
    """One ordered implicit-feedback training triplet using global node IDs."""

    user: int
    positive_item: int
    negative_item: int

    def endpoints(self) -> Tuple[int, int, int]:
        return self.user, self.positive_item, self.negative_item


@dataclass(frozen=True)
class BipartiteGraph:
    """Small immutable graph contract used by the toy tests.

    ``positive_edges`` stores canonical ``(user_id, item_node_id)`` pairs.
    Item node IDs must be offset by ``num_users``.
    """

    num_users: int
    num_items: int
    positive_edges: Tuple[Tuple[int, int], ...]

    def validate(self) -> None:
        for user_id, item_node_id in self.positive_edges:
            if not 0 <= user_id < self.num_users:
                raise ValueError(f"user ID is outside the user range: {user_id}")
            if not self.num_users <= item_node_id < self.num_users + self.num_items:
                raise ValueError(f"item ID is outside the offset item range: {item_node_id}")

    def neighbors(self, nodes: Iterable[int]) -> Tuple[int, ...]:
        """Return deterministic unique neighbors of a node set."""

        node_set = set(nodes)
        result = set()
        for user_id, item_node_id in self.positive_edges:
            if user_id in node_set:
                result.add(item_node_id)
            if item_node_id in node_set:
                result.add(user_id)
        return tuple(sorted(result))


def item_node_id(num_users: int, item_index: int) -> int:
    """Map a local item index into the disjoint global node-ID range."""

    if item_index < 0:
        raise ValueError("item index must be non-negative")
    return num_users + item_index


def initial_target_nodes(batch: Sequence[BPRTriplet]) -> Tuple[int, ...]:
    """Implement ``V0 = unique(all ordered triplet endpoints)``."""

    ordered_unique: List[int] = []
    seen = set()
    for triplet in batch:
        for node_id in triplet.endpoints():
            if node_id not in seen:
                seen.add(node_id)
                ordered_unique.append(node_id)
    return tuple(ordered_unique)
