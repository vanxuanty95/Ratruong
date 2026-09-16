"""DL-004: living documents must not contain known fabricated claims and must match derived facts."""

import json
import pathlib
import subprocess
import sys
import unittest

CODE = pathlib.Path(__file__).resolve().parents[1]
REPO = CODE.parents[1]
TEX = REPO / "Do An" / "04_thesis" / "THESIS_vn.tex"
DECK = REPO / "Do An" / "05_slides" / "build_thesis_vn.js"
FACTS = CODE / "results" / "doc_facts" / "doc_facts.json"


class DocFacts(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.facts = {k: v["value"] for k, v in json.loads(FACTS.read_text()).items()}
        cls.tex = TEX.read_text(encoding="utf-8")
        cls.deck = DECK.read_text(encoding="utf-8")

    def test_facts_file_is_reproducible(self):
        before = FACTS.read_text()
        subprocess.run([sys.executable, str(CODE / "scripts" / "derive_doc_facts.py")], check=True, capture_output=True)
        self.assertEqual(json.loads(before), json.loads(FACTS.read_text()))

    def test_known_fabrications_absent(self):
        banned = ["một nửa mỗi năm", "khoảng một nửa", "10³ đến 10⁵", "$10^3$ đến $10^5$", "chỉ cộng node được chọn",
                  "Có thể do khuyến mãi", "phần lớn 5★", "NGCF", "SGL)", "khó chia đều", "55--60", "55–60", "5 epoch, validation"]
        for phrase in banned:
            self.assertNotIn(phrase, self.tex, phrase)
            self.assertNotIn(phrase, self.deck, phrase)

    def test_quoted_numbers_match_facts(self):
        lo, hi = self.facts["new_user_rows_share_2014_2023_pct"]
        self.assertEqual((round(lo), round(hi)), (54, 60))
        self.assertIn("54--60", self.tex)
        jl, jh = self.facts["top1pct_jaccard_range"]
        self.assertEqual((round(jl, 2), round(jh, 2)), (0.45, 0.54))
        g_lo, g_hi = self.facts["grapes_config_loss_coef_range_gflownet"]
        self.assertEqual((g_lo, round(g_hi)), (151.6, 789615))
        self.assertAlmostEqual(self.facts["item_degree_size_biased_mean"], 1009.0, delta=0.5)
        self.assertAlmostEqual(self.facts["rating_mean"], 4.21, delta=0.005)
        self.assertAlmostEqual(self.facts["p5_vs_p4_interaction_loss_pct"], 14.65, delta=0.01)
        ov = self.facts["phase1_time_overhead_pct"]
        self.assertEqual((round(min(ov.values())), round(max(ov.values()))), (37, 85))

    def test_r2_verification_recorded(self):
        r = json.loads((CODE / "results" / "r2_oracle_verification" / "r2_oracle_verification.json").read_text())
        self.assertEqual(r["baseline"]["status"], "OK")
        self.assertIn("Ran 28 tests", r["baseline"]["ran"])
        self.assertEqual(r["mutations_killed"], r["mutations_total"])


if __name__ == "__main__":
    unittest.main()
