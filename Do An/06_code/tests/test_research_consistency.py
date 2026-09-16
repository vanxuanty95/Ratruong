import importlib.util
import pathlib
import tempfile
import unittest
import zipfile


CODE_ROOT = pathlib.Path(__file__).resolve().parents[1]
REPO_ROOT = CODE_ROOT.parents[1]
SCRIPT_PATH = CODE_ROOT / "scripts" / "verify_research_consistency.py"


def load_checker():
    spec = importlib.util.spec_from_file_location("verify_research_consistency", SCRIPT_PATH)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


class ResearchConsistencyTests(unittest.TestCase):
    def test_build_report_reads_exact_saved_evidence(self):
        checker = load_checker()
        report = checker.build_report(REPO_ROOT)
        expected = {
            "all_beauty_rows": 693_929,
            "baby_rows": 5_953_891,
            "home_and_kitchen_rows": 66_623_880,
            "p4_rows": 4_655_843,
            "train_edges": 3_868_654,
            "train_users": 2_318_308,
            "train_items": 162_125,
            "item_gini": 0.8584238309483749,
            "m1_ndcg_mean": 0.005865983054867427,
            "m2_ndcg_mean": 0.005720915314706386,
        }
        for key, value in expected.items():
            self.assertEqual(report["facts"][key], value)

    def test_narrative_scan_rejects_forbidden_claims(self):
        checker = load_checker()
        text = (
            "Chúng tôi đã đo semantic diversity. "
            "M2 vượt M1 và test set đã được dùng để chọn phương pháp."
        )
        violations = checker.narrative_violations(text, "bad.md")
        joined = "\n".join(violations)
        self.assertIn("semantic diversity", joined)
        self.assertIn("M2", joined)
        self.assertIn("test", joined)

    def test_narrative_scan_accepts_current_bounded_claim(self):
        checker = load_checker()
        text = (
            "Semantic diversity chưa đo được từ dữ liệu pure-ID. "
            "M2 không vượt M1 trong paired validation. "
            "Test target chưa được đọc."
        )
        self.assertEqual(checker.narrative_violations(text, "good.md"), [])

    def test_validate_report_formats_missing_paths_and_claims(self):
        checker = load_checker()
        report = {
            "facts": {},
            "missing_paths": ["Do An/missing.md"],
            "forbidden_paths": ["Do An/05_slides/THESIS_PRESENTATION_vn_v99.pptx"],
            "narrative_violations": ["bad.md: M2 superiority claim"],
        }
        violations = checker.validate_report(report)
        self.assertTrue(any("missing.md" in item for item in violations))
        self.assertTrue(any("v99" in item for item in violations))
        self.assertTrue(any("M2 superiority" in item for item in violations))

    def test_extract_pptx_text_reads_slide_xml(self):
        checker = load_checker()
        with tempfile.TemporaryDirectory() as tmp:
            path = pathlib.Path(tmp) / "sample.pptx"
            slide_xml = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"
       xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:cSld><p:spTree><p:sp><p:txBody><a:p><a:r><a:t>M0 uniform</a:t></a:r></a:p>
  <a:p><a:r><a:t>M2 không vượt M1</a:t></a:r></a:p></p:txBody></p:sp></p:spTree></p:cSld>
</p:sld>"""
            with zipfile.ZipFile(path, "w") as archive:
                archive.writestr("ppt/slides/slide1.xml", slide_xml)
            self.assertIn("M0 uniform", checker.extract_pptx_text(path))
            self.assertIn("M2 không vượt M1", checker.extract_pptx_text(path))


if __name__ == "__main__":
    unittest.main()
