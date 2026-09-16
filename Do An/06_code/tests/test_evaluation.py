import math
import random
import sys
import unittest
from pathlib import Path


SRC = Path(__file__).resolve().parents[1] / "src"
if str(SRC) not in sys.path:
    sys.path.insert(0, str(SRC))

from grapes_rec.evaluation import (  # noqa: E402
    exact_rank_after_history,
    popularity_order,
    ranks_from_order,
    row_ranking_metrics,
    top_k_unseen,
)


class EvaluationPrimitiveTests(unittest.TestCase):
    def test_popularity_order_uses_item_index_as_tie_break(self):
        self.assertEqual(popularity_order([2, 5, 5, 1]), [1, 2, 0, 3])

    def test_ranks_from_order_requires_a_permutation(self):
        self.assertEqual(ranks_from_order([2, 0, 1]), [2, 3, 1])
        with self.assertRaises(ValueError):
            ranks_from_order([0, 0, 1])

    def test_exact_rank_removes_only_better_seen_items(self):
        ranks = ranks_from_order([1, 2, 0, 3])
        self.assertEqual(exact_rank_after_history(0, {1, 3}, ranks), 2)

    def test_exact_rank_rejects_target_in_history(self):
        with self.assertRaises(ValueError):
            exact_rank_after_history(1, {1}, [1, 2])

    def test_top_k_unseen_respects_order(self):
        self.assertEqual(top_k_unseen([3, 2, 1, 0], {3, 1}, 2), [2, 0])

    def test_row_metrics_are_exact_for_single_target_rows(self):
        metrics = row_ranking_metrics([1, 2, 21], k=20)
        self.assertEqual(metrics["hits_at_k"], 2)
        self.assertAlmostEqual(metrics["recall_at_k"], 2 / 3)
        self.assertAlmostEqual(
            metrics["ndcg_at_k"],
            (1.0 + 1.0 / math.log2(3)) / 3,
        )

    def test_rank_shortcut_matches_brute_force_with_ties_and_history(self):
        generator = random.Random(20260913)
        for item_count in range(2, 31):
            for _ in range(25):
                degrees = [generator.randrange(0, 8) for _ in range(item_count)]
                order = popularity_order(degrees)
                global_ranks = ranks_from_order(order)
                target = generator.randrange(item_count)
                possible_prior = [item for item in range(item_count) if item != target]
                prior_size = generator.randrange(len(possible_prior) + 1)
                prior = set(generator.sample(possible_prior, prior_size))

                eligible_order = [item for item in order if item not in prior]
                brute_force_rank = eligible_order.index(target) + 1
                shortcut_rank = exact_rank_after_history(target, prior, global_ranks)
                self.assertEqual(shortcut_rank, brute_force_rank)


if __name__ == "__main__":
    unittest.main()
