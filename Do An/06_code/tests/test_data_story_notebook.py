import csv
import gzip
import json
import tempfile
import unittest
from pathlib import Path


PROJECT_ROOT = Path(__file__).resolve().parents[2]
NOTEBOOK = PROJECT_ROOT / "06_code" / "notebooks" / "03_data_story_eda.ipynb"


class DataStoryNotebookTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        notebook = json.loads(NOTEBOOK.read_text(encoding="utf-8"))
        helper_source = "".join(notebook["cells"][3]["source"])
        namespace = {"__name__": "data_story_notebook_test"}
        exec(compile(helper_source, str(NOTEBOOK), "exec"), namespace)
        cls.scan_raw = staticmethod(namespace["scan_raw"])
        cls.scan_training_graph = staticmethod(namespace["scan_training_graph"])
        cls.gini_from_histogram = staticmethod(namespace["gini_from_histogram"])
        cls.ccdf_from_histogram = staticmethod(namespace["ccdf_from_histogram"])

    def test_every_code_cell_compiles(self):
        notebook = json.loads(NOTEBOOK.read_text(encoding="utf-8"))
        for index, cell in enumerate(notebook["cells"]):
            if cell["cell_type"] == "code":
                compile("".join(cell["source"]), f"{NOTEBOOK}#cell-{index}", "exec")

    def test_full_scan_helpers_preserve_counts_and_degree_mass(self):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            raw_path = root / "raw.csv.gz"
            with gzip.open(raw_path, "wt", encoding="utf-8", newline="") as handle:
                writer = csv.writer(handle)
                writer.writerow(("user_id", "parent_asin", "rating", "timestamp"))
                writer.writerows(
                    [
                        ("u0", "i0", 5.0, 1609459200000),
                        ("u0", "i1", 3.0, 1609459200001),
                        ("u1", "i1", 4.0, 1612137600000),
                        ("u2", "i2", 0.0, 1612137600001),
                    ]
                )

            train_path = root / "train.csv.gz"
            with gzip.open(train_path, "wt", encoding="utf-8", newline="") as handle:
                writer = csv.writer(handle)
                writer.writerow(("user_idx", "item_idx", "rating", "timestamp_ms", "source_row"))
                writer.writerows(
                    [
                        (0, 0, 5.0, 1609459200000, 2),
                        (0, 1, 4.0, 1609459200001, 3),
                        (1, 1, 4.0, 1612137600000, 4),
                    ]
                )

            raw = self.scan_raw(raw_path)
            train = self.scan_training_graph(train_path, num_users=2, num_items=2)

        self.assertEqual(raw["raw_rows"], 4)
        self.assertEqual(raw["parsed_rows"], 4)
        self.assertEqual(raw["out_of_range"], 1)
        self.assertEqual(raw["p4_rows"], 2)
        self.assertEqual(sum(raw["monthly_clean"].values()), 3)
        self.assertEqual(train["edge_count"], 3)
        self.assertEqual(train["user_histogram"], {1: 1, 2: 1})
        self.assertEqual(train["item_histogram"], {1: 1, 2: 1})
        self.assertAlmostEqual(train["item_degree_gini"], 1 / 6)
        self.assertEqual(train["top_item_interaction_shares"]["top_20pct_items"], 2 / 3)

    def test_ccdf_is_monotone_and_starts_at_one(self):
        x_values, y_values = self.ccdf_from_histogram({1: 3, 2: 1, 5: 1})
        self.assertEqual(x_values, [1, 2, 5])
        self.assertEqual(y_values[0], 1.0)
        self.assertTrue(all(left >= right for left, right in zip(y_values, y_values[1:])))

    def test_gini_is_zero_for_equal_degrees(self):
        self.assertAlmostEqual(self.gini_from_histogram({3: 5}), 0.0)


if __name__ == "__main__":
    unittest.main()
