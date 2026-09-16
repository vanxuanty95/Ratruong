import json
import unittest
from pathlib import Path


PROJECT_ROOT = Path(__file__).resolve().parents[2]
NOTEBOOK = PROJECT_ROOT / "06_code" / "notebooks" / "04_mostpop_validation_sanity.ipynb"


class MostPopNotebookTests(unittest.TestCase):
    def test_every_code_cell_compiles(self):
        notebook = json.loads(NOTEBOOK.read_text(encoding="utf-8"))
        for index, cell in enumerate(notebook["cells"]):
            if cell["cell_type"] == "code":
                compile("".join(cell["source"]), f"{NOTEBOOK}#cell-{index}", "exec")

    def test_protocol_is_validation_only(self):
        notebook_text = NOTEBOOK.read_text(encoding="utf-8")
        self.assertIn("'split': 'validation_only'", notebook_text)
        self.assertIn("'test_targets_not_read': True", notebook_text)
        self.assertNotIn("manifest['artifacts']['test_targets']", notebook_text)

    def test_bundle_contains_only_validation_sanity_outputs(self):
        notebook_text = NOTEBOOK.read_text(encoding="utf-8")
        self.assertIn("mostpop_validation_summary.json", notebook_text)
        self.assertIn("MOSTPOP_VALIDATION_vn.md", notebook_text)
        self.assertIn("mostpop_validation_bundle.zip", notebook_text)


if __name__ == "__main__":
    unittest.main()
