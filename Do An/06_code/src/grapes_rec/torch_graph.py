"""Torch bipartite training graph for GRAPES-GFN-Rec.

Global node IDs: users ``0..U-1``, items ``U..U+I-1`` (explicit offset, T03).
The graph stores training positives only; ``assert_disjoint_from`` is the
leakage guard for validation/test pairs (T25).
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Iterable, Sequence, Tuple

import torch


@dataclass
class TorchBipartiteGraph:
    num_users: int
    num_items: int
    indptr: torch.Tensor  # [N+1]
    indices: torch.Tensor  # [2E] symmetric neighbor list, sorted within row
    pairs: Tuple[Tuple[int, int], ...] = field(default=(), repr=False)

    @classmethod
    def from_pairs(cls, num_users: int, num_items: int, pairs: Sequence[Tuple[int, int]]) -> "TorchBipartiteGraph":
        tensor = torch.as_tensor(list(pairs), dtype=torch.long).view(-1, 2)
        return cls.from_tensor(num_users, num_items, tensor, keep_pairs=True)

    @classmethod
    def from_tensor(
        cls, num_users: int, num_items: int, pairs: torch.Tensor, keep_pairs: bool = False
    ) -> "TorchBipartiteGraph":
        """Build from ``[E, 2]`` (user_index, item_index) with local item indices."""

        pairs = pairs.to(torch.long).view(-1, 2)
        if pairs.numel():
            u, i = pairs[:, 0], pairs[:, 1]
            if int(u.min()) < 0 or int(u.max()) >= num_users:
                raise ValueError("user index outside [0, num_users)")
            if int(i.min()) < 0 or int(i.max()) >= num_items:
                raise ValueError("item index outside [0, num_items)")
            pairs = torch.unique(pairs, dim=0)
        n = num_users + num_items
        u = pairs[:, 0]
        gi = pairs[:, 1] + num_users
        src = torch.cat([u, gi])
        dst = torch.cat([gi, u])
        order = torch.argsort(src * n + dst)
        src, dst = src[order], dst[order]
        counts = torch.bincount(src, minlength=n)
        indptr = torch.zeros(n + 1, dtype=torch.long)
        indptr[1:] = torch.cumsum(counts, 0)
        kept = tuple(map(tuple, pairs.tolist())) if keep_pairs else ()
        return cls(num_users, num_items, indptr, dst, kept)

    @property
    def num_nodes(self) -> int:
        return self.num_users + self.num_items

    @property
    def degree(self) -> torch.Tensor:
        return self.indptr[1:] - self.indptr[:-1]

    def is_item(self, nodes: torch.Tensor) -> torch.Tensor:
        return nodes >= self.num_users

    def edge_index(self) -> Tuple[torch.Tensor, torch.Tensor]:
        src = torch.repeat_interleave(torch.arange(self.num_nodes), self.degree)
        return src, self.indices

    def neighbor_pairs(self, nodes: torch.Tensor) -> Tuple[torch.Tensor, torch.Tensor]:
        """Return (owner, neighbor) for every neighbor of every node in ``nodes``."""

        nodes = nodes.to(torch.long)
        starts = self.indptr[nodes]
        lengths = self.indptr[nodes + 1] - starts
        total = int(lengths.sum())
        if total == 0:
            empty = torch.zeros(0, dtype=torch.long)
            return empty, empty
        owner = torch.repeat_interleave(nodes, lengths)
        offsets = torch.arange(total) - torch.repeat_interleave(torch.cumsum(lengths, 0) - lengths, lengths)
        neighbor = self.indices[torch.repeat_interleave(starts, lengths) + offsets]
        return owner, neighbor

    def unique_neighbors(self, nodes: torch.Tensor) -> torch.Tensor:
        _, neighbor = self.neighbor_pairs(nodes)
        return torch.unique(neighbor)

    def edges_between(self, sources: torch.Tensor, targets: torch.Tensor) -> Tuple[torch.Tensor, torch.Tensor]:
        """Return global (source, target) pairs with an original edge, source in S, target in T."""

        target, neighbor = self.neighbor_pairs(targets)
        in_source = torch.isin(neighbor, sources)
        return neighbor[in_source], target[in_source]

    def assert_disjoint_from(self, holdout_pairs: torch.Tensor) -> None:
        """Raise if any (user_index, item_index) holdout pair is a training edge (T25)."""

        holdout_pairs = holdout_pairs.to(torch.long).view(-1, 2)
        if holdout_pairs.numel() == 0:
            return
        users = holdout_pairs[:, 0]
        items = holdout_pairs[:, 1] + self.num_users
        owner, neighbor = self.neighbor_pairs(torch.unique(users))
        n = self.num_nodes
        train_keys = owner * n + neighbor
        holdout_keys = users * n + items
        if bool(torch.isin(holdout_keys, train_keys).any()):
            raise ValueError("holdout pair found in training graph: temporal leakage")


def unique_targets(
    users: torch.Tensor, positives: torch.Tensor, negatives: torch.Tensor
) -> Tuple[torch.Tensor, torch.Tensor, torch.Tensor, torch.Tensor]:
    """``V0 = unique(endpoints)`` plus index maps preserving triplet order (T01, T02)."""

    stacked = torch.cat([users, positives, negatives]).to(torch.long)
    v0, inverse = torch.unique(stacked, return_inverse=True)
    m = users.numel()
    return v0, inverse[:m], inverse[m : 2 * m], inverse[2 * m :]
