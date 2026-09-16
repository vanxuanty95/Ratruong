import contextlib
import hashlib
import io
import json
from pathlib import Path
import unittest


ROOT = Path(__file__).resolve().parents[1]
NOTEBOOK_PATH = ROOT / "notebooks" / "07_uniform_sampling_validation_sanity.ipynb"
UNIFORM_CONFIG_PATH = ROOT / "configs" / "uniform_sampling_smoke_v1.json"
DEGREE_CONFIG_PATH = ROOT / "configs" / "degree_aware_sampling_smoke_v1.json"


class UniformSamplingNotebookTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.notebook = json.loads(NOTEBOOK_PATH.read_text(encoding="utf-8"))
        cls.code_cells = [
            "".join(cell["source"])
            for cell in cls.notebook["cells"]
            if cell["cell_type"] == "code"
        ]
        cls.code = "\n".join(cls.code_cells)

    def test_every_code_cell_compiles(self):
        for index, source in enumerate(self.code_cells):
            compile(source, f"cell-{index}", "exec")

    def test_registered_uniform_config_hash_and_values_match_notebook(self):
        namespace = {}
        with contextlib.redirect_stdout(io.StringIO()):
            exec(self.code_cells[1], namespace)
        self.assertEqual(
            namespace["REGISTERED_CONFIG_FILE_SHA256"],
            hashlib.sha256(UNIFORM_CONFIG_PATH.read_bytes()).hexdigest(),
        )
        self.assertEqual(
            namespace["CONFIG"],
            json.loads(UNIFORM_CONFIG_PATH.read_text(encoding="utf-8")),
        )

    def test_degree_control_is_preregistered_with_matched_core(self):
        uniform = json.loads(UNIFORM_CONFIG_PATH.read_text(encoding="utf-8"))
        degree = json.loads(DEGREE_CONFIG_PATH.read_text(encoding="utf-8"))
        self.assertEqual(uniform["matched_control_id"], degree["matched_control_id"])
        self.assertEqual(uniform["model"], degree["model"])
        self.assertEqual(uniform["training"], degree["training"])
        self.assertEqual(uniform["evaluation"], degree["evaluation"])
        for field in (
            "candidate_rule",
            "cross_layer_reentry",
            "exact_k_without_replacement",
            "k_l",
            "k_l_interpretation",
            "normalization",
            "positive_edge_policy",
            "seed",
            "state_rule",
        ):
            self.assertEqual(uniform["sampler"][field], degree["sampler"][field])
        self.assertEqual(uniform["sampler"]["method"], "uniform")
        self.assertEqual(degree["sampler"]["method"], "degree_proportional")

    def test_sampling_contract_is_exact_k_layerwise_and_non_cumulative(self):
        self.assertIn("candidate_nodes(previous)", self.code)
        self.assertIn("effective_k = min(int(requested_k), int(candidates.size))", self.code)
        self.assertIn("np.union1d(v0, selected)", self.code)
        self.assertIn("np.intersect1d(selected, previous).size == 0", self.code)
        self.assertIn("rectangular_sampled_local_bi_normalization", self.code)
        self.assertIn("1.0 / np.sqrt(source_degree[source_local] * target_degree[target_local])", self.code)
        self.assertIn("sampled_blocks_have_no_self_loop", self.code)

    def test_paired_training_inputs_and_resource_logs_are_explicit(self):
        self.assertIn("pair_rng = np.random.default_rng(CONFIG['training']['seed'] + epoch)", self.code)
        self.assertIn("sampler_rng = np.random.default_rng(CONFIG['sampler']['seed'] + epoch)", self.code)
        self.assertIn("sampler_seconds", self.code)
        self.assertIn("propagation_and_update_seconds", self.code)
        self.assertIn("unique_selected_context_nodes", self.code)
        self.assertIn("unique_training_edges_in_blocks", self.code)
        self.assertIn("throughput_examples_per_second", self.code)

    def test_validation_uses_full_training_graph_and_never_reads_test(self):
        self.assertIn("full_propagate(full_adjacency)", self.code)
        self.assertIn("scores > target_scores[:, None]", self.code)
        self.assertIn("item_ids[None, :] < targets[:, None]", self.code)
        self.assertIn("test_targets_not_read", self.code)
        self.assertNotIn("baby_p4_test_targets", self.code)
        self.assertNotIn("TEST_PATH", self.code)

    def test_bundle_is_checkpoint_free_and_claim_boundary_is_narrow(self):
        self.assertIn("uniform_sampling_validation_bundle.zip", self.code)
        self.assertIn("('.pt', '.pth', '.ckpt')", self.code)
        self.assertIn("budget-matched method", self.code)
        self.assertNotIn("torch.save", self.code)


if __name__ == "__main__":
    unittest.main()
