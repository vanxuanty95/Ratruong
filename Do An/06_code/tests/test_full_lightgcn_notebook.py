import contextlib
import hashlib
import io
import json
from pathlib import Path
import unittest


ROOT = Path(__file__).resolve().parents[1]
NOTEBOOK_PATH = ROOT / "notebooks" / "06_full_lightgcn_validation_sanity.ipynb"
CONFIG_PATH = ROOT / "configs" / "full_lightgcn_sanity_v1.json"


class FullLightGCNNotebookTests(unittest.TestCase):
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
        for index, code in enumerate(self.code_cells):
            compile(code, f"cell-{index}", "exec")

    def test_registered_config_hash_and_values_match_notebook(self):
        expected_hash = hashlib.sha256(CONFIG_PATH.read_bytes()).hexdigest()
        namespace = {}
        with contextlib.redirect_stdout(io.StringIO()):
            exec(self.code_cells[1], namespace)
        self.assertEqual(namespace["REGISTERED_CONFIG_FILE_SHA256"], expected_hash)
        self.assertEqual(
            namespace["CONFIG"],
            json.loads(CONFIG_PATH.read_text(encoding="utf-8")),
        )

    def test_protocol_is_validation_only_and_uses_reviewed_controls(self):
        self.assertIn("split': 'validation_only'", self.code)
        self.assertIn("MOSTPOP_PATH", self.code)
        self.assertIn("BPR_PATH", self.code)
        self.assertIn("test_targets_not_read", self.code)
        self.assertNotIn("baby_p4_test_targets", self.code)
        self.assertNotIn("TEST_PATH", self.code)

    def test_full_graph_propagation_and_exact_gradient_contract(self):
        self.assertIn("torch.sparse.mm(normalized_adjacency, current)", self.code)
        self.assertIn("adjacency._nnz() != 2 * train_rows", self.code)
        self.assertIn("propagated_leaf = propagated.detach().requires_grad_(True)", self.code)
        self.assertIn("propagated.backward(propagated_leaf.grad)", self.code)
        self.assertIn("verify_two_stage_gradient_oracle()", self.code)
        self.assertIn("torch.testing.assert_close", self.code)
        self.assertIn("one_optimizer_step_per_full_graph_epoch", self.code)
        self.assertNotIn("NeighborLoader", self.code)
        self.assertNotIn("dropout", self.code.lower())

    def test_exact_evaluator_keeps_deterministic_tie_rules(self):
        self.assertIn("scores > target_scores[:, None]", self.code)
        self.assertIn("item_ids[None, :] < targets[:, None]", self.code)
        self.assertIn("resolve_boundary_ties", self.code)
        self.assertIn("candidate_count_matches_every_target", self.code)

    def test_bundle_is_checkpoint_free(self):
        self.assertIn("full_lightgcn_validation_bundle.zip", self.code)
        self.assertIn("('.pt', '.pth', '.ckpt')", self.code)
        self.assertNotIn("torch.save", self.code)


if __name__ == "__main__":
    unittest.main()
