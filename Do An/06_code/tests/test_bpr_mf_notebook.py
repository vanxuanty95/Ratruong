import hashlib
import io
import json
import unittest
from contextlib import redirect_stdout
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[2]
NOTEBOOK = PROJECT_ROOT / "06_code" / "notebooks" / "05_bpr_mf_validation_sanity.ipynb"
CONFIG_PATH = PROJECT_ROOT / "06_code" / "configs" / "bpr_mf_sanity_v1.json"


class BprMfNotebookTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.notebook = json.loads(NOTEBOOK.read_text(encoding="utf-8"))
        cls.notebook_text = NOTEBOOK.read_text(encoding="utf-8")

    def test_every_code_cell_compiles(self):
        for index, cell in enumerate(self.notebook["cells"]):
            if cell["cell_type"] == "code":
                compile("".join(cell["source"]), f"{NOTEBOOK}#cell-{index}", "exec")

    def test_registered_config_hash_and_values_match_notebook(self):
        config_bytes = CONFIG_PATH.read_bytes()
        config = json.loads(config_bytes)
        namespace = {}
        config_source = "".join(self.notebook["cells"][2]["source"])
        with redirect_stdout(io.StringIO()):
            exec(compile(config_source, str(NOTEBOOK), "exec"), namespace)

        self.assertEqual(
            hashlib.sha256(config_bytes).hexdigest(),
            namespace["REGISTERED_CONFIG_FILE_SHA256"],
        )
        embedded = namespace["CONFIG"]
        self.assertEqual(embedded["config_id"], config["config_id"])
        self.assertEqual(embedded["model"], config["model"])
        self.assertEqual(embedded["training"], config["training"])
        self.assertEqual(embedded["evaluation"], config["evaluation"])
        self.assertEqual(embedded["claim_boundary"], config["claim_boundary"])

    def test_negative_sampler_contains_exact_rejection_contract(self):
        helper_source = "".join(self.notebook["cells"][4]["source"])
        self.assertIn("np.searchsorted(positive_keys, keys)", helper_source)
        self.assertIn("while collisions.any():", helper_source)
        self.assertIn("Negative rejection sampler không hội tụ", helper_source)
        self.assertIn("return negatives, resampled", helper_source)

    def test_protocol_never_reads_test_targets(self):
        self.assertIn("'split': 'validation_only'", self.notebook_text)
        self.assertIn("'test_targets_not_read': True", self.notebook_text)
        self.assertNotIn("manifest['artifacts']['test_targets']", self.notebook_text)
        self.assertNotIn("baby_p4_test_targets.csv.gz", self.notebook_text)

    def test_gpu_rank_and_topk_have_deterministic_tie_rules(self):
        evaluation_source = "".join(self.notebook["cells"][7]["source"])
        self.assertIn("scores == target_scores[:, None]", evaluation_source)
        self.assertIn("item_ids[None, :] < targets[:, None]", evaluation_source)
        self.assertIn("tied[:needed]", evaluation_source)
        self.assertIn("topk_boundary_ties_resolved", evaluation_source)

    def test_bundle_is_small_and_checkpoint_free(self):
        self.assertIn("bpr_mf_validation_bundle.zip", self.notebook_text)
        self.assertIn("bpr_mf_validation_summary.json", self.notebook_text)
        self.assertIn("BPR_MF_VALIDATION_vn.md", self.notebook_text)
        self.assertNotIn("torch.save", self.notebook_text)


if __name__ == "__main__":
    unittest.main()
