"""Contract tests for notebook 11 (deep data analysis + development split, gate R1)."""

import json
import pathlib
import unittest

CODE = pathlib.Path(__file__).resolve().parents[1]
NB = CODE / "notebooks" / "11_dataset_deep_analysis_and_dev_split.ipynb"
SCRIPT = CODE / "scripts" / "deep_dataset_analysis.py"


class DeepAnalysisNotebookContract(unittest.TestCase):
    def setUp(self):
        self.nb = json.loads(NB.read_text(encoding="utf-8"))
        self.text = "\n".join("".join(c["source"]) for c in self.nb["cells"])
        self.script = SCRIPT.read_text(encoding="utf-8")

    def test_embedded_source_matches_script(self):
        embedded = [c for c in self.nb["cells"] if "".join(c["source"]).startswith("%%writefile /content/deep_dataset_analysis.py")]
        self.assertEqual(len(embedded), 1)
        body = "".join(embedded[0]["source"]).split("\n", 1)[1]
        self.assertEqual(body, self.script)

    def test_never_reads_current_validation_or_test_targets(self):
        for forbidden in ("validation_targets", "test_targets", "baby_p4_validation", "baby_p4_test"):
            self.assertNotIn(forbidden, self.text)
            self.assertNotIn(forbidden, self.script)

    def test_development_rule_matches_spec(self):
        self.assertIn("t0 = T1_MS - (T2_MS - T1_MS)", self.script)
        self.assertIn("len(warm) < 20000 or len(tr) < 0.5 * len(pos)", self.script)
        self.assertIn("np.quantile(pos.timestamp.values, 0.8)", self.script)
        self.assertIn('"current_validation_or_test_rows_used": False', self.script)

    def test_structural_statistics_restricted_before_t1(self):
        for fn in ("def rating_analysis", "def anomaly_analysis", "def graph_analysis", "def development_split"):
            start = self.script.index(fn)
            body = self.script[start:start + 400]
            self.assertIn("T1_MS", body, fn)

    def test_raw_hash_is_checked_against_audit(self):
        self.assertIn("e2a8d0498afed767ee2615db7fac549559d82490b1a73c7241b84b5e9e8c279e", self.script)


if __name__ == "__main__":
    unittest.main()
