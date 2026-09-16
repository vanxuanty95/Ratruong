"""One GRAPES-GFN-Rec training step with explicit parameter ownership (T18-T20, G4-G7).

Order matches the official GRAPES loop: recommender step on the sampled graph,
then sampler step using the same BPR value detached as the cost.
"""

from __future__ import annotations

import time
from dataclasses import dataclass, field
from typing import List, Optional, Sequence, Tuple

import torch

from .gfn_sampler import GRAPESSampler
from .sampled_lightgcn import SampledLightGCN, bpr_loss
from .torch_graph import TorchBipartiteGraph, unique_targets

OBJECTIVES = ("tb", "rl", "none")


def trajectory_balance_loss(log_z: torch.Tensor, log_q: torch.Tensor, alpha: float, task_loss: torch.Tensor) -> torch.Tensor:
    """``(log Z(V0) + log q + alpha * stopgrad(L_task))^2``."""

    return (log_z + log_q + alpha * task_loss.detach()) ** 2


def reinforce_loss(task_loss: torch.Tensor, log_q: torch.Tensor) -> torch.Tensor:
    """Paper-sign REINFORCE: minimise ``stopgrad(L_task) * log q`` (D4)."""

    return task_loss.detach() * log_q


@dataclass
class TrainConfig:
    objective: str = "tb"
    alpha: float = 1e4
    k_per_layer: List[int] = field(default_factory=lambda: [256, 256])
    reg_lambda: float = 1e-6
    norm: str = "sampled_bi"

    def __post_init__(self):
        if self.objective not in OBJECTIVES:
            raise ValueError(f"objective must be one of {OBJECTIVES}")


def _grads_are_empty(params) -> bool:
    return all(p.grad is None or float(p.grad.detach().abs().sum()) == 0.0 for p in params)


def train_step(
    graph: TorchBipartiteGraph,
    recommender: SampledLightGCN,
    sampler: GRAPESSampler,
    opt_r: torch.optim.Optimizer,
    opt_s: Optional[torch.optim.Optimizer],
    cfg: TrainConfig,
    batch: Tuple[torch.Tensor, torch.Tensor, torch.Tensor],
    generator: torch.Generator,
) -> dict:
    users, positives, negatives = batch
    v0, iu, ip, ineg = unique_targets(users, positives, negatives)

    t0 = time.perf_counter()
    trace = sampler.sample(v0, cfg.k_per_layer, generator)
    t_sample = time.perf_counter() - t0

    t0 = time.perf_counter()
    node_sets = [v0] + [layer.nodes for layer in trace.layers]
    blocks = recommender.build_blocks(graph, trace, v0, norm=cfg.norm)
    z = recommender(blocks, node_sets)
    bpr = bpr_loss(z, iu, ip, ineg)
    ego = recommender.embedding(v0)
    reg = (ego[iu].pow(2).sum(-1) + ego[ip].pow(2).sum(-1) + ego[ineg].pow(2).sum(-1)).mean()
    model_loss = bpr + cfg.reg_lambda * reg

    opt_r.zero_grad(set_to_none=True)
    sampler.zero_grad(set_to_none=True)
    model_loss.backward()
    ownership_ok = _grads_are_empty(sampler.parameters())
    opt_r.step()
    t_model = time.perf_counter() - t0

    logs = {
        "bpr": float(bpr.detach()),
        "reg": float(reg.detach()),
        "log_q": float(trace.log_q.detach()),
        "log_z": float(trace.log_z.detach()),
        "tb": 0.0,
        "sampler_param_delta": 0.0,
        "time_sample_s": t_sample,
        "time_model_s": t_model,
        "time_sampler_update_s": 0.0,
        "block_edges": [int(b.weight.numel()) for b in blocks],
        "trace_fingerprint": trace.fingerprint(),
        **{f"trace_{k}": v for k, v in trace.stats.items()},
    }

    if cfg.objective != "none":
        if opt_s is None:
            raise ValueError("learned objective requires a sampler optimizer")
        t0 = time.perf_counter()
        before = [p.detach().clone() for p in sampler.parameters()]
        if cfg.objective == "tb":
            sampler_loss = trajectory_balance_loss(trace.log_z, trace.log_q, cfg.alpha, bpr)
        else:
            sampler_loss = reinforce_loss(bpr, trace.log_q)
        recommender.zero_grad(set_to_none=True)
        opt_s.zero_grad(set_to_none=True)
        sampler_loss.backward()
        ownership_ok = ownership_ok and _grads_are_empty(recommender.parameters())
        opt_s.step()
        delta = sum(float((p.detach() - b).pow(2).sum()) for p, b in zip(sampler.parameters(), before)) ** 0.5
        logs.update(
            tb=float(sampler_loss.detach()),
            alpha_cost=cfg.alpha * logs["bpr"],
            sampler_param_delta=delta,
            time_sampler_update_s=time.perf_counter() - t0,
        )
    logs["ownership_ok"] = bool(ownership_ok)
    return logs
