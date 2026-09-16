"""GRAPES-style layer-wise sampler for recommendation (GRAPES-GFN-Rec, gate R2).

One code path serves three samplers so that tier-A comparisons differ only in
how candidate priorities are produced:

- ``learned``: ``GCN_S`` logits -> ``logsigmoid`` priority, full Bernoulli
  ``log q`` (D11) and a target-only ``GCN_Z`` normalizer (D6).
- ``uniform`` (M0): constant priority, no parameters, ``log q = 0``.
- ``degree`` (M1): ``log(training degree)`` priority, no parameters.

Action is always exact-k Gumbel Top-k over the candidates
``C^l = N(K^(l-1)) \\ K^(l-1)`` and the state is ``K^l = V0 ∪ V^l`` (D8).
"""

from __future__ import annotations

import math
from dataclasses import dataclass, field
from typing import List, Optional, Sequence

import torch
from torch import nn
import torch.nn.functional as F

from .torch_graph import TorchBipartiteGraph

MODES = ("learned", "uniform", "degree")


def candidate_set(graph: TorchBipartiteGraph, previous_nodes: torch.Tensor) -> torch.Tensor:
    """``C^l = unique(N(K^(l-1))) \\ K^(l-1)`` (T05, T06)."""

    neighbors = graph.unique_neighbors(previous_nodes)
    return neighbors[~torch.isin(neighbors, previous_nodes)]


def gumbel_topk(priority: torch.Tensor, k: int, generator: torch.Generator) -> torch.Tensor:
    """Exact ``min(k, n)`` indices without replacement via Gumbel Top-k (T07, T09, T10).

    ``priority`` is a log-weight (``log p`` for the learned policy). When
    ``k >= n`` every candidate is taken, as in the official GRAPES code.
    """

    n = priority.numel()
    k = min(int(k), n)
    if k <= 0:
        return torch.zeros(0, dtype=torch.long, device=priority.device)
    if k == n:
        return torch.arange(n, device=priority.device)
    uniform = torch.rand(n, generator=generator, device=generator.device).to(priority.device)
    uniform = uniform.clamp(1e-12, 1.0 - 1e-12)
    gumbel = -torch.log(-torch.log(uniform))
    return torch.topk(priority.detach() + gumbel, k, sorted=True).indices


def bernoulli_log_prob(logits: torch.Tensor, selected_mask: torch.Tensor) -> torch.Tensor:
    """Full Bernoulli log-likelihood over selected and unselected candidates (T16, T21)."""

    if logits.numel() == 0:
        return logits.new_zeros(())
    return torch.where(selected_mask, F.logsigmoid(logits), F.logsigmoid(-logits)).sum()


class LocalGCN(nn.Module):
    """Two-layer GCN on an induced subgraph with self-loops (auxiliary sampler only)."""

    def __init__(self, in_dim: int, hidden_dim: int, out_dim: int = 1):
        super().__init__()
        self.lin1 = nn.Linear(in_dim, hidden_dim)
        self.lin2 = nn.Linear(hidden_dim, out_dim)
        for lin in (self.lin1, self.lin2):
            nn.init.xavier_uniform_(lin.weight)
            nn.init.zeros_(lin.bias)

    @staticmethod
    def propagate(x: torch.Tensor, src: torch.Tensor, dst: torch.Tensor) -> torch.Tensor:
        n = x.shape[0]
        loop = torch.arange(n, device=x.device)
        src = torch.cat([src, loop])
        dst = torch.cat([dst, loop])
        deg = torch.bincount(dst, minlength=n).to(x.dtype)
        weight = deg[src].rsqrt() * deg[dst].rsqrt()
        out = torch.zeros_like(x)
        out.index_add_(0, dst, x[src] * weight.unsqueeze(-1))
        return out

    def forward(self, x: torch.Tensor, src: torch.Tensor, dst: torch.Tensor) -> torch.Tensor:
        h = F.relu(self.lin1(self.propagate(x, src, dst)))
        return self.lin2(self.propagate(h, src, dst))


def local_edges(graph: TorchBipartiteGraph, nodes: torch.Tensor):
    """Local (src, dst) indices of original edges induced by ``nodes`` (both directions)."""

    s, t = graph.edges_between(nodes, nodes)
    order = torch.argsort(nodes)
    sorted_nodes = nodes[order]
    s_local = order[torch.searchsorted(sorted_nodes, s)]
    t_local = order[torch.searchsorted(sorted_nodes, t)]
    return s_local, t_local


@dataclass
class SamplerConfig:
    mode: str = "learned"
    embedding_dim: int = 64
    num_layers: int = 2
    log_z_init: float = 0.0

    def __post_init__(self):
        if self.mode not in MODES:
            raise ValueError(f"mode must be one of {MODES}")


@dataclass
class LayerTrace:
    candidates: torch.Tensor
    selected: torch.Tensor
    nodes: torch.Tensor  # K^l = cat(V0, V^l)
    logits: Optional[torch.Tensor] = None


@dataclass
class SampleTrace:
    layers: List[LayerTrace]
    log_q: torch.Tensor
    log_z: torch.Tensor
    stats: dict = field(default_factory=dict)

    def fingerprint(self):
        return tuple((tuple(l.candidates.tolist()), tuple(l.selected.tolist())) for l in self.layers)


class GRAPESSampler(nn.Module):
    def __init__(self, graph: TorchBipartiteGraph, config: SamplerConfig):
        super().__init__()
        self.graph = graph
        self.config = config
        deg = graph.degree.to(torch.float32)
        max_deg = float(deg.max()) if deg.numel() else 1.0
        self.register_buffer("degree_feature", torch.log1p(deg) / math.log1p(max(max_deg, 1.0)))
        self.register_buffer("log_degree", torch.log(deg.clamp_min(1.0)))
        d, L = config.embedding_dim, config.num_layers
        if config.mode == "learned":
            self.embedding = nn.Embedding(graph.num_nodes, d)
            nn.init.normal_(self.embedding.weight, mean=0.0, std=1.0 / math.sqrt(d))
            self.gcn_s = LocalGCN(d + 2 + 1 + (L + 1), d, 1)
            self.gcn_z = LocalGCN(d + 2 + 1, d, 1)

    # -- features ---------------------------------------------------------
    def _base_features(self, nodes: torch.Tensor) -> torch.Tensor:
        type_onehot = F.one_hot(self.graph.is_item(nodes).long(), 2).to(torch.float32)
        return torch.cat(
            [self.embedding(nodes), type_onehot, self.degree_feature[nodes].unsqueeze(-1)], dim=-1
        )

    def _history(self, nodes: torch.Tensor, history: Sequence[torch.Tensor]) -> torch.Tensor:
        channels = torch.zeros(nodes.numel(), self.config.num_layers + 1, device=nodes.device)
        for j, members in enumerate(history):
            channels[:, j] = torch.isin(nodes, members).to(torch.float32)
        return channels

    # -- normalizer -------------------------------------------------------
    def log_z(self, v0: torch.Tensor) -> torch.Tensor:
        if self.config.mode != "learned":
            return torch.zeros(())
        src, dst = local_edges(self.graph, v0)
        out = self.gcn_z(self._base_features(v0), src, dst)
        return out.mean() - self.config.log_z_init

    # -- trajectory -------------------------------------------------------
    def _priority(self, prev: torch.Tensor, cand: torch.Tensor, history: Sequence[torch.Tensor]):
        mode = self.config.mode
        if mode == "uniform":
            return torch.zeros(cand.numel()), None
        if mode == "degree":
            return self.log_degree[cand], None
        nodes = torch.cat([prev, cand])
        x = torch.cat([self._base_features(nodes), self._history(nodes, history)], dim=-1)
        src, dst = local_edges(self.graph, nodes)
        logits = self.gcn_s(x, src, dst).squeeze(-1)[prev.numel():]
        return F.logsigmoid(logits), logits

    def sample(self, v0: torch.Tensor, k_per_layer: Sequence[int], generator: torch.Generator) -> SampleTrace:
        if len(k_per_layer) != self.config.num_layers:
            raise ValueError("k_per_layer must have one budget per layer")
        v0 = v0.to(torch.long)
        prev = v0
        history: List[torch.Tensor] = [v0]
        layers: List[LayerTrace] = []
        log_q = torch.zeros(())
        for k in k_per_layer:
            cand = candidate_set(self.graph, prev)
            priority, logits = self._priority(prev, cand, history)
            idx = gumbel_topk(priority, k, generator)
            selected = cand[idx]
            if logits is not None:
                mask = torch.zeros(cand.numel(), dtype=torch.bool)
                mask[idx] = True
                log_q = log_q + bernoulli_log_prob(logits, mask)
            nodes = torch.cat([v0, selected])
            layers.append(LayerTrace(cand, selected, nodes, logits))
            history.append(selected)
            prev = nodes
        stats = {
            "candidates": [int(l.candidates.numel()) for l in layers],
            "selected": [int(l.selected.numel()) for l in layers],
            "selected_item_share": [
                float(self.graph.is_item(l.selected).float().mean()) if l.selected.numel() else 0.0 for l in layers
            ],
            "selected_mean_log_degree": [
                float(self.log_degree[l.selected].mean()) if l.selected.numel() else 0.0 for l in layers
            ],
        }
        return SampleTrace(layers, log_q, self.log_z(v0), stats)
