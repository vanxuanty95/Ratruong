import math
import pathlib
import sys
import unittest


CODE_ROOT = pathlib.Path(__file__).resolve().parents[1]
sys.path.insert(0, str(CODE_ROOT / "src"))

from grapes_rec.blocks import SampledBlock, message_sum, message_sum_with_weights, rectangular_bi_normalization
from grapes_rec.contracts import BPRTriplet, BipartiteGraph, initial_target_nodes, item_node_id
from grapes_rec.data_protocol import mask_positive_edge, undirected_edges
from grapes_rec.objectives import bpr_loss, trajectory_balance_loss, two_action_reinforce_gradient
from grapes_rec.sampling import candidate_nodes, full_bernoulli_log_prob, select_top_k


class Week1OracleTests(unittest.TestCase):
    def test_t01_and_t02_target_deduplication_preserves_order_and_multiplicity(self):
        item0 = item_node_id(2, 0)
        item1 = item_node_id(2, 1)
        batch = [BPRTriplet(0, item0, item1), BPRTriplet(0, item0, item1)]
        self.assertEqual(initial_target_nodes(batch), (0, item0, item1))
        self.assertEqual(batch[0], batch[1])

    def test_t03_graph_id_ranges_and_bipartite_edges(self):
        graph = BipartiteGraph(2, 2, ((0, 2), (1, 3)))
        graph.validate()
        self.assertTrue(all(user < 2 <= item for user, item in graph.positive_edges))

    def test_t05_to_t08_candidates_and_non_cumulative_layer_set(self):
        graph = BipartiteGraph(2, 3, ((0, 2), (0, 3), (1, 3), (1, 4)))
        previous = (0, 2)
        self.assertEqual(candidate_nodes(graph, previous), (3,))
        self.assertEqual(select_top_k({3: 0.9, 4: 0.1}, 5), (3, 4))
        self.assertEqual(set((0, 2) + (3,)), {0, 2, 3})
        self.assertNotIn(4, (0, 2) + (3,))

    def test_t09_and_t16_full_bernoulli_log_prob_is_finite(self):
        value = full_bernoulli_log_prob([1000.0, -1000.0, 0.0], [0])
        self.assertTrue(math.isfinite(value))
        self.assertAlmostEqual(value, -math.log(2.0), places=6)

    def test_t11_and_t12_block_orientation_and_two_layer_path(self):
        first = SampledBlock(source_nodes=(2, 1), target_nodes=(1, 0), edges=((2, 1),))
        second = SampledBlock(source_nodes=(1, 0), target_nodes=(0,), edges=((1, 0),))
        after_first = message_sum(first, {2: 1.0, 1: 0.0})
        after_second = message_sum(second, after_first)
        self.assertEqual(after_first[1], 1.0)
        self.assertEqual(after_second[0], 1.0)

    def test_t14_weighted_path_oracle_and_rectangular_normalization(self):
        first = SampledBlock(source_nodes=(2,), target_nodes=(1,), edges=((2, 1),))
        second = SampledBlock(source_nodes=(1,), target_nodes=(0,), edges=((1, 0),))
        values = message_sum_with_weights(first, {2: 1.0}, {(2, 1): 0.5})
        values = message_sum_with_weights(second, values, {(1, 0): 1.0})
        self.assertAlmostEqual(values[0], 0.5)
        normalized = rectangular_bi_normalization(first)
        self.assertAlmostEqual(normalized[(2, 1)], 1.0)

    def test_t18_reinforce_gradient_direction(self):
        self.assertAlmostEqual(two_action_reinforce_gradient([1.0, 3.0]), -0.5)

    def test_t19_tb_value_and_target_conditioning_boundary(self):
        self.assertAlmostEqual(trajectory_balance_loss(0.2, -0.1, 2.0, 0.3), 0.49)
        inside = {0: 0.1, 1: -0.2}
        outside = {2: 9.9}
        self.assertEqual(sum(inside.values()), -0.1)
        self.assertNotIn(2, inside)
        self.assertEqual(sum(outside.values()), 9.9)

    def test_t22_bpr_loss_decreases_with_larger_margin(self):
        self.assertLess(bpr_loss([2.0]), bpr_loss([0.5]))

    def test_t23_mask_removes_both_storage_directions(self):
        edges = undirected_edges(((0, 2), (1, 3)))
        masked = mask_positive_edge(edges, 0, 2)
        self.assertNotIn((0, 2), masked)
        self.assertNotIn((2, 0), masked)
        self.assertIn((1, 3), masked)
        self.assertIn((3, 1), masked)


if __name__ == "__main__":
    unittest.main()
