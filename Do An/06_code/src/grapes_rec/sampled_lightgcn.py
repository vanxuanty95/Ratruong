"""Sampled LightGCN on GRAPES layer traces (D1-D3, T11-T15, T22).

Block ``P_l`` maps sources ``K^l`` to targets ``K^(l-1)``. Depth ``r`` is the
prefix product ``P_1 ... P_r`` applied to ``E[K^r]``; the final embedding of
``V0`` is the uniform mean of depths ``0..L``. No self-loops, no feature
transforms, no nonlinearity.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import List, Sequence

import torch
from torch import nn
import torch.nn.functional as F

from .torch_graph import TorchBipartiteGraph

NORMS = ("sampled_bi", "full", "none")


@dataclass
class Block:
    src_local: torch.Tensor
    dst_local: torch.Tensor
    weight: torch.Tensor
    num_src: int
    num_dst: int

    def apply(self, h: torch.Tensor) -> torch.Tensor:
        out = h.new_zeros(self.num_dst, h.shape[-1])
        out.index_add_(0, self.dst_local, h[self.src_local] * self.weight.unsqueeze(-1).to(h.dtype))
        return out


def _local_index(nodes: torch.Tensor, query: torch.Tensor) -> torch.Tensor:
    order = torch.argsort(nodes)
    return order[torch.searchsorted(nodes[order], query)]


def build_block(graph: TorchBipartiteGraph, sources: torch.Tensor, targets: torch.Tensor, norm: str) -> Block:
    if norm not in NORMS:
        raise ValueError(f"norm must be one of {NORMS}")
    s, t = graph.edges_between(sources, targets)
    s_local = _local_index(sources, s)
    t_local = _local_index(targets, t)
    if norm == "none":
        weight = torch.ones(s.numel())
    elif norm == "full":
        deg = graph.degree.to(torch.float32)
        weight = (deg[s] * deg[t]).rsqrt()
    else:  # rectangular sampled-local bi-normalization (D2)
        d_src = torch.bincount(s_local, minlength=sources.numel()).to(torch.float32)
        d_dst = torch.bincount(t_local, minlength=targets.numel()).to(torch.float32)
        weight = (d_src[s_local] * d_dst[t_local]).rsqrt()
    return Block(s_local, t_local, weight, int(sources.numel()), int(targets.numel()))


class SampledLightGCN(nn.Module):
    def __init__(self, num_nodes: int, dim: int = 64, num_layers: int = 3, init_std: float = 0.01):
        super().__init__()
        self.num_layers = num_layers
        self.embedding = nn.Embedding(num_nodes, dim)
        nn.init.normal_(self.embedding.weight, std=init_std)

    def build_blocks(self, graph: TorchBipartiteGraph, trace, v0: torch.Tensor, norm: str = "sampled_bi") -> List[Block]:
        node_sets = [v0] + [layer.nodes for layer in trace.layers]
        return [build_block(graph, node_sets[l + 1], node_sets[l], norm) for l in range(len(trace.layers))]

    def depth_outputs(self, blocks: Sequence[Block], node_sets: Sequence[torch.Tensor]) -> List[torch.Tensor]:
        if len(blocks) != len(node_sets) - 1:
            raise ValueError("need one block per sampled layer")
        outputs = [self.embedding(node_sets[0])]
        for r in range(1, len(blocks) + 1):
            h = self.embedding(node_sets[r])
            for l in range(r, 0, -1):
                h = blocks[l - 1].apply(h)
            outputs.append(h)
        return outputs

    def forward(self, blocks: Sequence[Block], node_sets: Sequence[torch.Tensor]) -> torch.Tensor:
        return torch.stack(self.depth_outputs(blocks, node_sets)).mean(0)


def full_lightgcn_embeddings(graph: TorchBipartiteGraph, embedding: torch.Tensor, num_layers: int) -> torch.Tensor:
    """Deterministic full-graph LightGCN used for inference and the T14 oracle."""

    src, dst = graph.edge_index()
    deg = graph.degree.to(embedding.dtype).clamp_min(1.0)
    weight = (deg[src] * deg[dst]).rsqrt()
    h = embedding
    layers = [h]
    for _ in range(num_layers):
        nxt = torch.zeros_like(h)
        nxt.index_add_(0, dst, h[src] * weight.unsqueeze(-1))
        h = nxt
        layers.append(h)
    return torch.stack(layers).mean(0)


def bpr_loss(z: torch.Tensor, users: torch.Tensor, positives: torch.Tensor, negatives: torch.Tensor) -> torch.Tensor:
    """Mean ``-log sigmoid(s(u,i+) - s(u,i-))`` over ordered triplets (D10)."""

    zu = z[users]
    margin = (zu * z[positives]).sum(-1) - (zu * z[negatives]).sum(-1)
    return F.softplus(-margin).mean()
