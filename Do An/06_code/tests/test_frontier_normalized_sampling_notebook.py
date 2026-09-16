import ast
import contextlib
import hashlib
import io
import json
from pathlib import Path
import unittest

try:
    import numpy as np
except ImportError:  # The repository's minimal system Python may omit NumPy.
    np = None

ROOT = Path(__file__).resolve().parents[1]
NOTEBOOK_PATH = ROOT / "notebooks" / "09_frontier_normalized_sampling_validation_sanity.ipynb"
CONFIG_PATH = ROOT / "configs" / "frontier_normalized_sampling_smoke_v1.json"
UNIFORM_CONFIG_PATH = ROOT / "configs" / "uniform_sampling_smoke_v1.json"
DEGREE_CONFIG_PATH = ROOT / "configs" / "degree_aware_sampling_smoke_v1.json"
UNIFORM_SUMMARY_PATH = (
    ROOT / "results" / "uniform_sampling_validation" / "uniform_sampling_validation_summary.json"
)
DEGREE_SUMMARY_PATH = (
    ROOT / "results" / "degree_aware_sampling_validation" / "degree_aware_sampling_validation_summary.json"
)


class FrontierNormalizedSamplingNotebookTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.notebook = json.loads(NOTEBOOK_PATH.read_text(encoding="utf-8"))
        cls.code_cells = [
            "".join(cell["source"])
            for cell in cls.notebook["cells"]
            if cell["cell_type"] == "code"
        ]
        cls.code = "\n".join(cls.code_cells)

    def test_notebook_exists(self):
        self.assertTrue(
            NOTEBOOK_PATH.is_file(),
            "M2 frontier-normalized validation notebook must exist before execution",
        )

    def test_every_code_cell_compiles(self):
        for index, source in enumerate(self.code_cells):
            compile(source, f"cell-{index}", "exec")

    def test_registered_config_hash_and_values_match_notebook(self):
        self.assertGreaterEqual(len(self.code_cells), 2, "Notebook must define its frozen config cell")
        namespace = {}
        with contextlib.redirect_stdout(io.StringIO()):
            exec(self.code_cells[1], namespace)
        self.assertEqual(
            namespace["REGISTERED_CONFIG_FILE_SHA256"],
            hashlib.sha256(CONFIG_PATH.read_bytes()).hexdigest(),
        )
        self.assertEqual(namespace["CONFIG"], json.loads(CONFIG_PATH.read_text(encoding="utf-8")))

    def test_m2_changes_only_the_proposal_under_the_matched_contract(self):
        uniform = json.loads(UNIFORM_CONFIG_PATH.read_text(encoding="utf-8"))
        degree = json.loads(DEGREE_CONFIG_PATH.read_text(encoding="utf-8"))
        frontier = json.loads(CONFIG_PATH.read_text(encoding="utf-8"))
        for key in ("matched_control_id", "model", "training", "evaluation"):
            self.assertEqual(frontier[key], uniform[key])
            self.assertEqual(frontier[key], degree[key])
        core_fields = (
            "candidate_rule",
            "cross_layer_reentry",
            "exact_k_without_replacement",
            "k_l",
            "k_l_interpretation",
            "normalization",
            "positive_edge_policy",
            "seed",
            "state_rule",
        )
        for field in core_fields:
            self.assertEqual(frontier["sampler"][field], uniform["sampler"][field])
            self.assertEqual(frontier["sampler"][field], degree["sampler"][field])
        self.assertEqual(frontier["sampler"]["method"], "frontier_normalized")
        self.assertEqual(frontier["sampler"]["support_exponent"], 1.0)
        self.assertEqual(frontier["sampler"]["degree_exponent"], -0.5)
        self.assertEqual(
            frontier["sampler"]["frontier_support_source"],
            "count_training_edges_from_candidate_to_previous_K",
        )

    def test_m0_and_m1_results_are_hash_pinned(self):
        expected_uniform = hashlib.sha256(UNIFORM_SUMMARY_PATH.read_bytes()).hexdigest()
        expected_degree = hashlib.sha256(DEGREE_SUMMARY_PATH.read_bytes()).hexdigest()
        self.assertEqual(
            expected_uniform,
            "f29ed8f15d50a6d585ecb9cdcfc160232b64f9936e83fc8db6dac442bf941474",
        )
        self.assertEqual(
            expected_degree,
            "46d83f7e6938c94be3376a5e71387e6a1bf9e9db32043d4dbbd10378f9bd07da",
        )
        self.assertIn(f"UNIFORM_SUMMARY_SHA256 = '{expected_uniform}'", self.code)
        self.assertIn(f"DEGREE_SUMMARY_SHA256 = '{expected_degree}'", self.code)

    @unittest.skipIf(np is None, "NumPy is required")
    def test_frontier_support_counts_training_edges_into_previous_k(self):
        functions = self._extract_functions("candidate_nodes_with_support")
        namespace = {"np": np}

        class RowSlice:
            indices = np.asarray([2, 3, 2, 4], dtype=np.int64)

        class TinyGraph:
            def __getitem__(self, previous_nodes):
                np.testing.assert_array_equal(previous_nodes, np.asarray([0, 1]))
                return RowSlice()

        namespace["graph_csr"] = TinyGraph()
        exec(compile(ast.Module(body=functions, type_ignores=[]), "frontier_support", "exec"), namespace)
        candidates, support = namespace["candidate_nodes_with_support"](
            np.asarray([0, 1], dtype=np.int64)
        )
        np.testing.assert_array_equal(candidates, np.asarray([2, 3, 4]))
        np.testing.assert_array_equal(support, np.asarray([2, 1, 1]))

    @unittest.skipIf(np is None, "NumPy is required")
    def test_frontier_normalized_weights_follow_support_over_sqrt_degree(self):
        functions = self._extract_functions("frontier_normalized_weights")
        namespace = {"np": np}
        exec(compile(ast.Module(body=functions, type_ignores=[]), "frontier_weights", "exec"), namespace)
        weights = namespace["frontier_normalized_weights"](
            np.asarray([2, 3, 4]),
            np.asarray([2, 1, 1]),
            np.asarray([1, 1, 4, 1, 4], dtype=np.float64),
            support_exponent=1.0,
            degree_exponent=-0.5,
        )
        np.testing.assert_allclose(weights, np.asarray([1.0, 1.0, 0.5]))
        with self.assertRaises(ValueError):
            namespace["frontier_normalized_weights"](
                np.asarray([0]), np.asarray([0]), np.asarray([1.0]), 1.0, -0.5
            )

    @unittest.skipIf(np is None, "NumPy is required")
    def test_frontier_exact_k_uses_weights_without_replacement(self):
        functions = self._extract_functions(
            "frontier_normalized_weights", "frontier_normalized_exact_k"
        )
        namespace = {"np": np}
        exec(compile(ast.Module(body=functions, type_ignores=[]), "frontier_sampler", "exec"), namespace)
        sampler = namespace["frontier_normalized_exact_k"]
        rng = np.random.default_rng(20260915)
        counts = np.zeros(2, dtype=np.int64)
        for _ in range(1000):
            selected = sampler(
                np.asarray([0, 1]),
                np.asarray([9, 1]),
                1,
                rng,
                np.asarray([1.0, 1.0]),
                1.0,
                -0.5,
            )
            counts[selected[0]] += 1
        self.assertGreater(counts[0], 800)
        selected = sampler(
            np.asarray([0, 1, 2, 3]),
            np.asarray([1, 1, 1, 1]),
            3,
            rng,
            np.asarray([1.0, 1.0, 1.0, 1.0]),
            1.0,
            -0.5,
        )
        self.assertEqual(selected.size, 3)
        self.assertEqual(np.unique(selected).size, 3)

    def test_validation_only_output_is_checkpoint_free(self):
        self.assertNotIn("baby_p4_test_targets", self.code)
        self.assertNotIn("TEST_PATH", self.code)
        self.assertNotIn("torch.save", self.code)
        self.assertIn("frontier_normalized_sampling_validation_bundle.zip", self.code)
        self.assertIn("('.pt', '.pth', '.ckpt')", self.code)
        self.assertIn("frontier_minus_uniform", self.code)
        self.assertIn("frontier_minus_degree", self.code)
        self.assertIn("full_propagate(full_adjacency)", self.code)

    def _extract_functions(self, *names):
        module = ast.parse(self.code)
        by_name = {
            node.name: node
            for node in module.body
            if isinstance(node, ast.FunctionDef) and node.name in names
        }
        self.assertEqual(set(by_name), set(names))
        return [by_name[name] for name in names]


if __name__ == "__main__":
    unittest.main()
