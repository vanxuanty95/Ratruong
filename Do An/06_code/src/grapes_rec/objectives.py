"""Scalar objective helpers for Week 1 oracle tests."""

import math
from typing import Sequence


def bpr_loss(margins: Sequence[float]) -> float:
    """Mean ``-log sigmoid(margin)`` without regularization."""

    if not margins:
        raise ValueError("at least one BPR margin is required")
    values = []
    for margin in margins:
        values.append(math.log1p(math.exp(-margin)) if margin >= 0 else -margin + math.log1p(math.exp(margin)))
    return sum(values) / len(values)


def two_action_reinforce_gradient(action_losses: Sequence[float]) -> float:
    """Exact expected gradient at zero logit for a two-action cost objective.

    The first action is parameterized by a scalar logit. At ``theta=0`` the
    actions have probability one half. For losses ``[1, 3]`` the expected
    gradient is ``-0.5``, matching T18.
    """

    if len(action_losses) != 2:
        raise ValueError("the Week 1 oracle expects exactly two actions")
    probability = 0.5
    return probability * action_losses[0] * (1.0 - probability) + probability * action_losses[1] * (-probability)


def trajectory_balance_loss(log_z: float, log_q: float, alpha: float, task_loss: float) -> float:
    """Squared scalar TB residual used by the manual T19 oracle."""

    residual = log_z + log_q + alpha * task_loss
    return residual * residual
