"""Frozen degree-cohort rules selected before recommender results exist."""


def item_popularity_cohort(training_degree: int) -> str:
    """Classify one mapped item from its frozen training degree."""

    if training_degree < 1:
        raise ValueError("mapped training items must have positive degree")
    if training_degree >= 397:
        return "head"
    if training_degree >= 13:
        return "body"
    return "tail"


def user_activity_cohort(training_degree: int) -> str:
    """Classify one mapped user from its frozen training degree."""

    if training_degree < 1:
        raise ValueError("mapped training users must have positive degree")
    if training_degree == 1:
        return "singleton"
    if training_degree <= 3:
        return "repeat_light"
    return "active"
