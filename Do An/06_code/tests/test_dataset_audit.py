import importlib.util
import pathlib
import tempfile
import unittest


CODE_ROOT = pathlib.Path(__file__).resolve().parents[1]
SCRIPT_PATH = CODE_ROOT / "scripts" / "analyze_amazon_dataset.py"
SPEC = importlib.util.spec_from_file_location("analyze_amazon_dataset", SCRIPT_PATH)
assert SPEC is not None and SPEC.loader is not None
AUDIT = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(AUDIT)


class DatasetProtocolAuditTests(unittest.TestCase):
    def test_one_pass_protocol_audit_builds_all_semantic_snapshots(self):
        fixture = CODE_ROOT / "tests" / "fixtures" / "toy_amazon.csv"
        result = AUDIT.audit_artifact(
            path=fixture,
            source="toy://amazon",
            acquisition="test_fixture",
            t1_ms=AUDIT.DEFAULT_T1_MS,
            t2_ms=AUDIT.DEFAULT_T2_MS,
            pair_audit="sqlite",
            timestamp_audit=False,
            protocol_audit=True,
        )

        protocol = result["protocol_analysis"]
        self.assertEqual(protocol["duplicate_user_item_rows"], 1)
        self.assertEqual(protocol["clean_deduplicated_events"], 4)
        self.assertEqual(protocol["timestamp_audit"]["rows_in_shared_timestamp_values"], 2)
        self.assertEqual(protocol["timestamp_audit"]["rows_exactly_at_t1"], 1)
        self.assertEqual(protocol["timestamp_audit"]["rows_exactly_at_t2"], 1)
        self.assertEqual(protocol["semantic_snapshots"]["all_observed"]["event_count"], 4)
        self.assertEqual(protocol["semantic_snapshots"]["p4"]["event_count"], 2)
        self.assertEqual(protocol["semantic_snapshots"]["p5"]["event_count"], 1)
        self.assertEqual(
            protocol["semantic_snapshots"]["p4"]["partitions"]["test_candidate"]["user_oov_rate"],
            1.0,
        )

    def test_out_of_range_rating_is_quarantined_before_snapshots(self):
        with tempfile.TemporaryDirectory() as directory:
            fixture = pathlib.Path(directory) / "anomaly.csv"
            fixture.write_text(
                "user_id,parent_asin,rating,timestamp\n"
                "u1,i1,0.0,1600000000000\n"
                "u1,i2,5.0,1600000000001\n",
                encoding="utf-8",
            )
            result = AUDIT.audit_artifact(
                path=fixture,
                source="toy://anomaly",
                acquisition="test_fixture",
                t1_ms=AUDIT.DEFAULT_T1_MS,
                t2_ms=AUDIT.DEFAULT_T2_MS,
                pair_audit="sqlite",
                timestamp_audit=False,
                protocol_audit=True,
            )

        self.assertEqual(result["invalid_or_missing"]["rating_out_of_expected_range_1_to_5"], 1)
        protocol = result["protocol_analysis"]
        self.assertEqual(protocol["syntactically_valid_events"], 2)
        self.assertEqual(protocol["clean_deduplicated_events"], 1)
        self.assertEqual(protocol["semantic_snapshots"]["all_observed"]["event_count"], 1)


if __name__ == "__main__":
    unittest.main()
