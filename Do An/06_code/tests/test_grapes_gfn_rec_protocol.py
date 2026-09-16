"""Gate R1: saved development split manifest and deep-analysis summary contracts."""

import json
import pathlib
import unittest

RES = pathlib.Path(__file__).resolve().parents[1] / "results"
T1_MS = 1628643414042
T2_MS = 1658002729837


class DevelopmentSplitManifest(unittest.TestCase):
    def setUp(self):
        self.m = json.loads((RES / "grapes_gfn_rec_development" / "development_graph_manifest.json").read_text())

    def test_registered_rule_and_cutoff(self):
        self.assertEqual(self.m["t1_ms"], T1_MS)
        self.assertEqual(self.m["t2_ms"], T2_MS)
        if not self.m["fallback_triggered"]:
            self.assertEqual(self.m["rule_used"], "t0 = t1 - (t2 - t1)")
            self.assertEqual(self.m["t0_ms"], T1_MS - (T2_MS - T1_MS))
        self.assertLess(self.m["t0_ms"], T1_MS)

    def test_thresholds_of_spec_3_1(self):
        self.assertGreaterEqual(self.m["dev_window"]["warm_targets"], 20000)
        self.assertGreaterEqual(self.m["dev_train"]["share_of_current_train_edges"], 0.5)

    def test_isolation(self):
        iso = self.m["isolation"]
        self.assertTrue(iso["max_dev_train_ts_lt_min_dev_target_ts"])
        self.assertTrue(iso["all_dev_rows_before_t1"])
        self.assertFalse(iso["current_validation_or_test_rows_used"])

    def test_file_ledger_counts(self):
        f = self.m["files"]
        self.assertEqual(f["dev_train_edges.csv.gz"]["rows"], self.m["dev_train"]["edges"])
        self.assertEqual(f["dev_targets.csv.gz"]["rows"], self.m["dev_window"]["warm_targets"])
        for entry in f.values():
            self.assertEqual(len(entry["sha256"]), 64)


class DeepAnalysisSummary(unittest.TestCase):
    def setUp(self):
        self.s = json.loads((RES / "dataset_deep_analysis" / "deep_analysis_summary.json").read_text())

    def test_raw_and_graph_match_audited_artifacts(self):
        self.assertTrue(self.s["raw_sha256_matches_audit"])
        self.assertEqual(self.s["rows_after_quarantine"], 5953890)
        self.assertTrue(all(self.s["S4_graph"]["matches_registered_manifest"].values()))

    def test_target_analysis_uses_development_window_only(self):
        self.assertIn("development window", self.s["R1_dev_target_analysis"]["scope"])
        self.assertEqual(self.s["R1_dev_target_analysis"]["targets"], self.s["R1_dev_manifest"]["dev_window"]["warm_targets"])

    def test_cohort_thresholds_match_frozen_config(self):
        cohorts = json.loads((RES.parent / "configs" / "cohorts_v1.json").read_text())["item_popularity_cohorts"]
        self.assertEqual(self.s["S4_graph"]["cohort_check"]["head"]["items"], cohorts["head"]["items"])
        self.assertEqual(self.s["S4_graph"]["cohort_check"]["tail"]["items"], cohorts["tail"]["items"])


if __name__ == "__main__":
    unittest.main()
