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
NOTEBOOK_PATH = ROOT / "notebooks" / "08_degree_aware_sampling_validation_sanity.ipynb"
DEGREE_CONFIG_PATH = ROOT / "configs" / "degree_aware_sampling_smoke_v1.json"
UNIFORM_SUMMARY_PATH = (
    ROOT / "results" / "uniform_sampling_validation" / "uniform_sampling_validation_summary.json"
)


class DegreeAwareSamplingNotebookTests(unittest.TestCase):
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
            "M1 degree-aware validation notebook must be created before execution",
        )

    def test_every_code_cell_compiles(self):
        for index, source in enumerate(self.code_cells):
            compile(source, f"cell-{index}", "exec")

    def test_registered_degree_config_hash_and_values_match_notebook(self):
        self.assertGreaterEqual(len(self.code_cells), 2, "Notebook must define its frozen config cell")
        namespace = {}
        with contextlib.redirect_stdout(io.StringIO()):
            exec(self.code_cells[1], namespace)
        self.assertEqual(
            namespace["REGISTERED_CONFIG_FILE_SHA256"],
            hashlib.sha256(DEGREE_CONFIG_PATH.read_bytes()).hexdigest(),
        )
        self.assertEqual(
            namespace["CONFIG"],
            json.loads(DEGREE_CONFIG_PATH.read_text(encoding="utf-8")),
        )

    def test_uniform_result_is_hash_pinned_as_the_matched_control(self):
        self.assertTrue(UNIFORM_SUMMARY_PATH.is_file())
        expected_hash = hashlib.sha256(UNIFORM_SUMMARY_PATH.read_bytes()).hexdigest()
        self.assertEqual(expected_hash, "f29ed8f15d50a6d585ecb9cdcfc160232b64f9936e83fc8db6dac442bf941474")
        self.assertIn(f"UNIFORM_SUMMARY_SHA256 = '{expected_hash}'", self.code)
        self.assertIn("uniform_and_degree_matched_control_id", self.code)
        self.assertIn("matched_sampler_core_equal_except_proposal", self.code)

    @unittest.skipIf(np is None, "NumPy is available in Colab and the bundled artifact runtime")
    def test_degree_weighted_exact_k_favors_high_degree_without_replacement(self):
        module = ast.parse(self.code)
        functions = [
            node
            for node in module.body
            if isinstance(node, ast.FunctionDef) and node.name == "degree_exact_k"
        ]
        self.assertEqual(len(functions), 1, "Notebook must define degree_exact_k exactly once")
        function = functions[0]
        namespace = {"np": np}
        exec(compile(ast.Module(body=[function], type_ignores=[]), "degree_exact_k", "exec"), namespace)
        sampler = namespace["degree_exact_k"]

        degrees = np.asarray([1, 9, 2, 3], dtype=np.float64)
        rng = np.random.default_rng(20260914)
        counts = np.zeros(4, dtype=np.int64)
        for _ in range(1000):
            selected = sampler(np.asarray([0, 1]), 1, rng, degrees, 1.0)
            counts[selected[0]] += 1
        self.assertGreater(counts[1], 800)

        selected = sampler(np.asarray([0, 1, 2, 3]), 3, rng, degrees, 1.0)
        self.assertEqual(selected.size, 3)
        self.assertEqual(np.unique(selected).size, 3)
        with self.assertRaises(ValueError):
            sampler(np.asarray([0, 1]), 1, rng, np.asarray([1.0, 0.0]), 1.0)

    def test_training_and_evaluation_contract_stays_paired_with_m0(self):
        self.assertIn("pair_rng = np.random.default_rng(CONFIG['training']['seed'] + epoch)", self.code)
        self.assertIn("sampler_rng = np.random.default_rng(CONFIG['sampler']['seed'] + epoch)", self.code)
        self.assertIn("np.union1d(v0, selected)", self.code)
        self.assertIn("rectangular_sampled_local_bi_normalization", self.code)
        self.assertIn("full_propagate(full_adjacency)", self.code)
        self.assertIn("sampler_seconds", self.code)
        self.assertIn("propagation_and_update_seconds", self.code)
        self.assertIn("matched_comparison", self.code)

    def test_protocol_never_reads_test_and_bundle_has_no_checkpoint(self):
        self.assertNotIn("baby_p4_test_targets", self.code)
        self.assertNotIn("TEST_PATH", self.code)
        self.assertNotIn("torch.save", self.code)
        self.assertIn("degree_aware_sampling_validation_bundle.zip", self.code)
        self.assertIn("('.pt', '.pth', '.ckpt')", self.code)


if __name__ == "__main__":
    unittest.main()
