import csv
import gzip
import json
import tempfile
import unittest
from pathlib import Path


PROJECT_ROOT = Path(__file__).resolve().parents[2]
NOTEBOOK = PROJECT_ROOT / "06_code" / "notebooks" / "02_baby_p4_temporal_graph_en.ipynb"


class G2CNotebookTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        notebook = json.loads(NOTEBOOK.read_text(encoding="utf-8"))
        code_cells = ["".join(cell["source"]) for cell in notebook["cells"] if cell["cell_type"] == "code"]
        namespace = {"__name__": "g2c_notebook_test"}
        exec(compile(code_cells[1], str(NOTEBOOK), "exec"), namespace)
        cls.build = staticmethod(namespace["build_g2c_artifacts"])

    def test_training_only_mapping_and_oov_ledger_reconcile(self):
        rows = [
            ("u1", "i1", 5.0, 10),
            ("u1", "i2", 4.0, 20),
            ("u2", "i2", 4.0, 30),
            ("u2", "i3", 5.0, 40),
            ("u1", "i3", 4.0, 120),
            ("u3", "i1", 5.0, 130),
            ("u1", "i4", 5.0, 140),
            ("u2", "i1", 4.0, 220),
            ("u4", "i5", 5.0, 230),
            ("u5", "i1", 0.0, 50),
        ]
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            raw_path = root / "toy.csv.gz"
            with gzip.open(raw_path, "wt", encoding="utf-8", newline="") as handle:
                writer = csv.writer(handle)
                writer.writerow(("user_id", "parent_asin", "rating", "timestamp"))
                writer.writerows(rows)

            manifest = self.build(
                raw_path,
                root / "out",
                root / "work.sqlite",
                t1_ms=100,
                t2_ms=200,
                dry_run_targets=10,
                evaluation_chunk_size=2,
            )

            self.assertEqual(manifest["training_graph"]["edges"], 4)
            self.assertEqual(manifest["training_graph"]["users"], 2)
            self.assertEqual(manifest["training_graph"]["items"], 3)
            self.assertEqual(manifest["input_counts"]["rating_zero_rows"], 1)
            self.assertEqual(manifest["partitions"]["validation"]["warm_rows"], 1)
            self.assertEqual(manifest["partitions"]["test"]["warm_rows"], 1)
            self.assertTrue(manifest["partitions"]["validation"]["reconciles"])
            self.assertTrue(manifest["partitions"]["test"]["reconciles"])
            self.assertEqual(manifest["g2d_feasibility"]["targets_executed"], 1)


if __name__ == "__main__":
    unittest.main()
