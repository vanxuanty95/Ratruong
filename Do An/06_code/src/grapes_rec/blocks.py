"""Sampled block and prefix-propagation primitives for toy validation."""

import math
from collections import defaultdict
from dataclasses import dataclass
from typing import Dict, Iterable, Mapping, Sequence, Tuple


@dataclass(frozen=True)
class SampledBlock:
    """A source-to-target bipartite/message-passing block."""

    source_nodes: Tuple[int, ...]
    target_nodes: Tuple[int, ...]
    edges: Tuple[Tuple[int, int], ...]

    def validate(self) -> None:
        source = set(self.source_nodes)
        target = set(self.target_nodes)
        for src, dst in self.edges:
            if src not in source or dst not in target:
                raise ValueError("every block edge must connect declared source and target sets")


def message_sum(block: SampledBlock, source_values: Mapping[int, float]) -> Dict[int, float]:
    """Unnormalized source-to-target sum used by the direction oracle."""

    block.validate()
    result = {node: 0.0 for node in block.target_nodes}
    for src, dst in block.edges:
        result[dst] += source_values.get(src, 0.0)
    return result


def rectangular_bi_normalization(block: SampledBlock) -> Dict[Tuple[int, int], float]:
    """Return ``1 / sqrt(deg_source * deg_target)`` for block-local degrees."""

    block.validate()
    source_degree = defaultdict(int)
    target_degree = defaultdict(int)
    for src, dst in block.edges:
        source_degree[src] += 1
        target_degree[dst] += 1
    return {
        (src, dst): 1.0 / math.sqrt(source_degree[src] * target_degree[dst])
        for src, dst in block.edges
    }


def message_sum_with_weights(
    block: SampledBlock, source_values: Mapping[int, float], weights: Mapping[Tuple[int, int], float]
) -> Dict[int, float]:
    """Weighted source-to-target sum for the minimal path oracle."""

    block.validate()
    result = {node: 0.0 for node in block.target_nodes}
    for src, dst in block.edges:
        result[dst] += source_values.get(src, 0.0) * weights[(src, dst)]
    return result
