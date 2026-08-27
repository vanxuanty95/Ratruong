"""Model contracts reserved for the post-oracle PyTorch/PyG implementation."""

from dataclasses import dataclass


@dataclass(frozen=True)
class RecommenderContract:
    """Configuration surface without claiming a trained model exists."""

    embedding_dim: int
    num_layers: int
    uses_self_loops: bool = False

    def validate_primary_contract(self) -> None:
        if self.embedding_dim <= 0 or self.num_layers <= 0:
            raise ValueError("embedding_dim and num_layers must be positive")
        if self.uses_self_loops:
            raise ValueError("the primary LightGCN contract forbids recommender self-loops")


@dataclass(frozen=True)
class SamplerContract:
    """Ownership boundary for sampler-owned embeddings and features."""

    sampler_embedding_table_is_separate: bool = True
    uses_train_only_degree: bool = True

    def validate_primary_contract(self) -> None:
        if not self.sampler_embedding_table_is_separate:
            raise ValueError("sampler embeddings must be separate in the primary contract")
        if not self.uses_train_only_degree:
            raise ValueError("sampler degree features must be computed from training data only")
