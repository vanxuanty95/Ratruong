"""Behavioral gates for the six-run Colab replication, without a CUDA requirement."""

import ast
import copy
from contextlib import redirect_stdout
import gc
import gzip
import hashlib
import io
import json
from pathlib import Path
import tempfile
import time
from types import SimpleNamespace
import unittest
from unittest import mock
import uuid
import weakref
import zipfile

import numpy as np


ROOT = Path(__file__).resolve().parents[1]
NOTEBOOK = ROOT / "notebooks" / "10_paired_sampling_validation.ipynb"
PROTOCOL = ROOT / "configs" / "paired_sampling_validation_v1.json"


class PairedSamplingNotebookTests(unittest.TestCase):
    def setUp(self):
        self.nb = json.loads(NOTEBOOK.read_text()) if NOTEBOOK.exists() else {"cells": []}
        self.cells = ["".join(c["source"]) for c in self.nb["cells"] if c["cell_type"] == "code"]
        self.ns = dict(np=np, Path=Path, json=json, hashlib=hashlib, copy=copy,
                       gzip=gzip, io=io, uuid=uuid, zipfile=zipfile, gc=gc,
                       time=time, weakref=weakref)
        for source in self.cells:
            module = ast.parse(source)
            constants = [n for n in module.body if isinstance(n, ast.Assign)
                         and any(isinstance(t, ast.Name) and t.id in (
                             "PROTOCOL", "REGISTERED_PROTOCOL_SHA256", "BASE_CONFIGS",
                             "ENGINES", "FOUNDATION_SOURCE", "DATA_SOURCE") for t in n.targets)]
            if constants:
                exec(compile(ast.Module(body=constants, type_ignores=[]), "payload", "exec"), self.ns)
        functions = [n for source in self.cells for n in ast.parse(source).body
                     if isinstance(n, ast.FunctionDef)]
        exec(compile(ast.Module(body=functions, type_ignores=[]), "helpers", "exec"), self.ns)

    def fn(self, name):
        if name not in self.ns:
            self.fail(f"Missing paired-run behavior: {name}")
        return self.ns[name]

    def cuda_trial_fixture(self, training_suffix=""):
        """Only replace the unavailable CUDA/engine boundary; execute the real runner."""
        plan, identity, summary, ranks = self.fixture()

        class CudaTensor:
            is_cuda = True
            shape = (2, 3)
            dtype = "torch.float32"
            device = "cuda:0"

        cuda = SimpleNamespace(synchronize=lambda: None, empty_cache=lambda: None,
                               memory_allocated=lambda: 8519680,
                               memory_reserved=lambda: 125829120)
        self.ns.update(
            torch=SimpleNamespace(Tensor=CudaTensor, cuda=cuda),
            scipy=SimpleNamespace(__version__="fixture"),
            train_sha="train-fixture", validation_sha="validation-fixture", validation_rows=5,
            RUNTIME_ENVIRONMENT_SHA256="runtime-environment-fixture",
            TARGET_ORDER_SHA256="target-order-fixture",
            TARGET_ITEM_LABELS=np.array(["head", "head", "body", "body", "tail"]),
            SHARED_DATA=dict(CudaTensor=CudaTensor, train_sha="train-fixture",
                             validation_sha="validation-fixture", validation_rows=5,
                             summary_fixture=summary, ranks_fixture=ranks),
            ENGINES={"M0": {
                "training": "tensor = CudaTensor()\n" + training_suffix,
                "evaluation": "summary = summary_fixture\nranks = ranks_fixture.copy()\n"
                              "initial_embedding_sha256 = 'initial-fixture'\n"
                              "epoch_input_fingerprints = summary['pairing']['epoch_inputs']\n",
            }},
        )
        return plan, identity, CudaTensor

    def test_run_trial_accepts_backend_workspace_and_releases_its_cuda_tensors(self):
        # Restoring the allocated != 0 guard must fail this consumer-visible run.
        plan, identity, _ = self.cuda_trial_fixture()
        try:
            summary, ranks = self.fn("run_trial")(plan)
        except RuntimeError as error:
            self.fail(f"Backend-only allocation must not block a clean trial: {error}")
        self.assertEqual(summary["run_id"], "s1_M0")
        self.assertEqual(summary["training"]["peak_gpu_memory_mb"], 200.0)
        self.assertEqual(summary["cuda_cleanup"]["after"]["allocated_mb"], 8.125)
        self.assertEqual(summary["cuda_cleanup"]["after"]["live_cuda_tensor_count"], 0)
        self.assertGreaterEqual(summary["cuda_cleanup"]["tracked_trial_tensors"], 1)
        self.assertEqual(summary["cuda_cleanup"]["tracked_trial_tensors_still_alive"], 0)
        self.assertIs(summary["integrity_assertions"]["runner_cuda_tensors_released"], True)
        # New optional diagnostics must still round-trip under the same registered identity.
        with tempfile.TemporaryDirectory() as directory:
            run_dir = Path(directory) / "s1_M0"
            self.fn("save_completed_run")(run_dir, summary, ranks)
            restored = self.fn("load_completed_run")(run_dir, identity)
            np.testing.assert_array_equal(restored["ranks"], [1, 50, 21, 5, 1000])

    def test_run_trial_still_rejects_real_foreign_cuda_tensors(self):
        # A removed tensor guard would let this contaminating tensor enter training.
        plan, _, tensor_class = self.cuda_trial_fixture()
        foreign_tensor = tensor_class()
        with self.assertRaises(RuntimeError):
            self.fn("run_trial")(plan)
        del foreign_tensor

    def test_run_trial_rejects_cuda_tensor_leaked_by_its_engine(self):
        # Skipping the post-run release check would return a saveable result here.
        plan, _, _ = self.cuda_trial_fixture("leak_sink.append(tensor)\n")
        sink = []
        self.ns["SHARED_DATA"]["leak_sink"] = sink
        try:
            with self.assertRaises(RuntimeError):
                self.fn("run_trial")(plan)
            self.assertEqual(len(sink), 1, "The failure must be from release, not the pre-run guard")
        finally:
            sink.clear()

    def test_run_trial_does_not_mask_the_original_engine_failure(self):
        # A finally block that raises on traceback-held tensors would hide this cause.
        plan, _, _ = self.cuda_trial_fixture("raise ValueError('original engine failure')\n")
        with self.assertRaisesRegex(ValueError, "original engine failure"):
            self.fn("run_trial")(plan)

    def test_engine_failure_survives_a_cleanup_synchronization_error(self):
        # Re-raising cleanup errors after an engine failure would hide its cause.
        plan, _, _ = self.cuda_trial_fixture("raise ValueError('original engine failure')\n")
        synchronizations = 0

        def synchronize():
            nonlocal synchronizations
            synchronizations += 1
            if synchronizations > 1:
                raise RuntimeError("cleanup synchronize failed")

        self.ns["torch"].cuda.synchronize = synchronize
        output = io.StringIO()
        with redirect_stdout(output):
            with self.assertRaisesRegex(ValueError, "original engine failure"):
                self.fn("run_trial")(plan)
        self.assertIn("cleanup synchronize failed", output.getvalue())

    def fixture(self):
        plan = self.fn("planned_runs")()[0]
        config = self.fn("trial_config")(plan)
        identity = {
            "run_id": plan["run_id"], "protocol_sha256": self.ns["REGISTERED_PROTOCOL_SHA256"],
            "runtime_config_sha256": self.fn("semantic_sha256")(config),
            "train_sha256": "train-fixture", "validation_sha256": "validation-fixture",
            "target_order_sha256": "target-order-fixture", "validation_rows": 5,
            "runtime_environment_sha256": "runtime-environment-fixture",
        }
        ranks = np.array([1, 50, 21, 5, 1000], dtype=np.int32)
        summary = {
            **identity, "registered_config": config,
            "integrity_assertions": {"fixture_gate": True},
            "pairing": {"initial_embedding_sha256": "initial-fixture",
                        "epoch_inputs": [{"epoch": i, "pair_order_sha256": f"order-{i}",
                                          "negative_items_sha256": f"negatives-{i}"} for i in range(1, 6)]},
            "training": {"optimizer_steps": 300, "wall_seconds": 100.0,
                         "peak_gpu_memory_mb": 200.0,
                         "epochs": [{"epoch": i, "sampler_seconds": 10.0} for i in range(1, 6)]},
            "validation": {"metrics": {"rows": 5, "ndcg_at_k": 0.2773705614469083, "recall_at_k": 0.4,
                                       "hits_at_k": 2, "k": 20},
                           "recommendation_exposure": {"catalog_coverage_at_k": 0.1},
                           "target_item_cohorts": {"head": {"hits_at_k": 1},
                                                   "body": {"hits_at_k": 1}, "tail": {"hits_at_k": 0}}},
            "environment": {"gpu": "Tesla T4", "torch": "fixture", "python": "fixture", "cuda": "fixture"},
        }
        return plan, identity, summary, ranks

    def test_delivered_notebook_has_executable_cells(self):
        self.assertTrue(NOTEBOOK.is_file(), "The user needs an actual paired-seed notebook")
        self.assertGreaterEqual(len(self.cells), 5)
        for source in self.cells:
            compile(source, "colab-cell", "exec")

    def test_embedded_engines_and_data_loader_compile_before_gpu_execution(self):
        self.assertIn("ENGINES", self.ns)
        for method, engine in self.ns["ENGINES"].items():
            for stage, source in engine.items():
                compile(source, f"{method}-{stage}", "exec")
        compile(self.ns["FOUNDATION_SOURCE"], "foundation", "exec")
        compile(self.ns["DATA_SOURCE"], "data-loader", "exec")

    def test_preflight_namespace_can_resolve_actual_graph_artifacts(self):
        # Catches imports living only in the notebook globals, not the exec namespace.
        with tempfile.TemporaryDirectory() as directory:
            graph_dir = Path(directory)
            fallback = graph_dir / "training.csv.gz"
            fallback.write_bytes(b"fixture")
            ns = {**self.ns, "GRAPH_DIR": graph_dir}
            for name in ("MANIFEST_PATH", "MOSTPOP_PATH", "BPR_PATH", "FULL_LIGHTGCN_PATH",
                         "UNIFORM_PATH", "DEGREE_PATH"):
                ns[name] = graph_dir / name
            assignments = [node for source in self.cells for node in ast.parse(source).body
                           if isinstance(node, ast.Assign) and any(
                               isinstance(target, ast.Name) and target.id == "SHARED_DATA"
                               for target in node.targets)]
            self.assertEqual(len(assignments), 1)
            exec(compile(ast.Module(body=assignments, type_ignores=[]), "preflight", "exec"), ns)
            function = [n for n in ast.parse(ns["FOUNDATION_SOURCE"]).body
                        if isinstance(n, ast.FunctionDef) and n.name == "resolve_artifact"]
            exec(compile(ast.Module(body=function, type_ignores=[]), "foundation", "exec"), ns["SHARED_DATA"])
            try:
                actual = ns["SHARED_DATA"]["resolve_artifact"](
                    {"path": str(graph_dir / "absent-recorded-path")}, "training.csv.gz")
            except NameError as error:
                self.fail(f"Standalone preflight namespace is missing an import: {error}")
            self.assertEqual(actual, fallback)

    def test_runtime_rejects_changes_to_the_registered_payload(self):
        validate = self.fn("validate_frozen_payload")
        self.assertTrue(PROTOCOL.is_file())
        self.assertEqual(self.ns["PROTOCOL"], json.loads(PROTOCOL.read_text()))
        self.assertEqual(self.ns["REGISTERED_PROTOCOL_SHA256"], hashlib.sha256(PROTOCOL.read_bytes()).hexdigest())
        validate()
        self.ns["BASE_CONFIGS"]["M2"]["sampler"]["degree_exponent"] = -1.0
        with self.assertRaises(ValueError):
            validate()

    def test_schedule_runs_all_three_methods_on_two_new_seeds(self):
        runs = self.fn("planned_runs")()
        self.assertEqual([(p["seed_id"], p["method"]) for p in runs],
                         [("s1", "M0"), ("s1", "M1"), ("s1", "M2"),
                          ("s2", "M2"), ("s2", "M0"), ("s2", "M1")])
        self.assertEqual(len({p["run_id"] for p in runs}), 6)
        self.assertEqual({p["training_seed"] for p in runs}, {20270913, 20280913})
        self.assertEqual({p["sampler_seed"] for p in runs}, {20271013, 20281013})

    def test_runtime_configs_keep_the_matched_core_and_frozen_proposals(self):
        configs = [self.fn("trial_config")(p) for p in self.fn("planned_runs")()]
        for config in configs:
            self.assertEqual(config["training"]["epochs"], 5)
            self.assertEqual(config["training"]["epoch_selection"], "fixed_last_epoch")
            self.assertEqual(config["evaluation"]["split"], "validation_only")
            self.assertEqual(config["sampler"]["k_l"], [65536, 65536, 65536])
        for group in (configs[:3], configs[3:]):
            for key in ("model", "training", "evaluation"):
                self.assertEqual(group[0][key], group[1][key])
                self.assertEqual(group[1][key], group[2][key])
        frontier = configs[2]
        self.assertEqual(frontier["sampler"]["support_exponent"], 1.0)
        self.assertEqual(frontier["sampler"]["degree_exponent"], -0.5)

    def test_array_fingerprints_detect_different_order_shape_and_dtype(self):
        fingerprint = self.fn("array_sha256")
        a = np.array([1, 2, 3], dtype=np.int32)
        self.assertEqual(fingerprint(a), fingerprint(a.copy()))
        for altered in (a[::-1], a.astype(np.int64), a.reshape(1, 3)):
            self.assertNotEqual(fingerprint(a), fingerprint(altered))

    def test_pairing_rejects_different_initialization_or_training_draws(self):
        check = self.fn("check_pairing")
        _, _, first, _ = self.fixture()
        second = copy.deepcopy(first)
        check([first, second])
        second["pairing"]["epoch_inputs"][0]["negative_items_sha256"] = "other-negative-draw"
        with self.assertRaises(ValueError):
            check([first, second])
        second = copy.deepcopy(first)
        second["pairing"]["initial_embedding_sha256"] = "other-initialization"
        with self.assertRaises(ValueError):
            check([first, second])

    def test_equal_cohort_hit_counts_do_not_hide_different_hit_targets(self):
        compare = self.fn("compare_rank_vectors")
        result = compare(np.array([1, 50, 21, 5, 1000]),
                         np.array([30, 3, 100, 5, 500]),
                         np.array(["head", "head", "body", "body", "tail"]), 20)
        self.assertEqual(result["head"]["gained_hits"], 1)
        self.assertEqual(result["head"]["lost_hits"], 1)
        self.assertEqual(result["head"]["net_hits"], 0)
        self.assertEqual(result["body"]["rank_improved_rows"], 1)
        self.assertEqual(result["tail"]["rank_worsened_rows"], 1)
        self.assertEqual(result["overall"]["both_hit_rows"], 1)

    def test_rank_diagnostics_separate_top20_hits_from_outside_improvement(self):
        diagnose = self.fn("rank_diagnostics")
        result = diagnose(np.array([21, 100, 1000]), np.array(["tail"] * 3))
        self.assertEqual(result["tail"]["hits_at_20"], 0)
        self.assertAlmostEqual(result["tail"]["share_at_100"], 2 / 3)
        self.assertEqual(result["tail"]["median_rank"], 100.0)

    def test_completed_run_round_trips_and_preserves_row_order(self):
        save, load = self.fn("save_completed_run"), self.fn("load_completed_run")
        _, identity, summary, ranks = self.fixture()
        with tempfile.TemporaryDirectory() as directory:
            run_dir = Path(directory) / "s1_M0"
            save(run_dir, summary, ranks)
            restored = load(run_dir, identity)
            np.testing.assert_array_equal(restored["ranks"], ranks)
            self.assertEqual(restored["summary"]["pairing"], summary["pairing"])

    def test_completed_results_cannot_be_overwritten(self):
        save = self.fn("save_completed_run")
        _, _, summary, ranks = self.fixture()
        with tempfile.TemporaryDirectory() as directory:
            run_dir = Path(directory) / "s1_M0"
            save(run_dir, summary, ranks)
            with self.assertRaises(FileExistsError):
                save(run_dir, summary, ranks)

    def test_interrupted_attempt_is_retained_and_not_marked_complete(self):
        save, load = self.fn("save_completed_run"), self.fn("load_completed_run")
        _, identity, summary, ranks = self.fixture()
        with tempfile.TemporaryDirectory() as directory:
            run_dir = Path(directory) / "s1_M0"
            unfinished = run_dir / "attempts" / "interrupted" / "notes.txt"
            unfinished.parent.mkdir(parents=True)
            unfinished.write_text("unfinished evidence")
            self.assertIsNone(load(run_dir, identity))
            save(run_dir, summary, ranks)
            self.assertEqual(unfinished.read_text(), "unfinished evidence")

    def test_interrupted_completion_write_is_not_published(self):
        save, load = self.fn("save_completed_run"), self.fn("load_completed_run")
        _, identity, summary, ranks = self.fixture()
        real_open = Path.open

        class InterruptedWrite:
            def __init__(self, handle):
                self.handle = handle

            def __enter__(self):
                return self

            def __exit__(self, *args):
                self.handle.close()

            def write(self, payload):
                self.handle.write(payload[:8])
                raise OSError("Simulated storage interruption during completion write")

        def storage_open(path, *args, **kwargs):
            handle = real_open(path, *args, **kwargs)
            if path.name in ("COMPLETED.json", "completion_ready.json") and args == ("xb",):
                return InterruptedWrite(handle)
            return handle

        with tempfile.TemporaryDirectory() as directory:
            run_dir = Path(directory) / "s1_M0"
            with mock.patch.object(Path, "open", storage_open):
                with self.assertRaises(OSError):
                    save(run_dir, summary, ranks)
            self.assertFalse((run_dir / "COMPLETED.json").exists(), "Incomplete marker must not be published")
            self.assertIsNone(load(run_dir, identity))

    def test_resume_rejects_tampered_summary_and_missing_ranks(self):
        save, load = self.fn("save_completed_run"), self.fn("load_completed_run")
        _, identity, summary, ranks = self.fixture()
        with tempfile.TemporaryDirectory() as directory:
            run_dir = Path(directory) / "s1_M0"
            save(run_dir, summary, ranks)
            marker = json.loads((run_dir / "COMPLETED.json").read_text())
            summary_path = run_dir / marker["summary"]["path"]
            original = summary_path.read_bytes()
            summary_path.write_bytes(original + b" ")
            with self.assertRaises(ValueError):
                load(run_dir, identity)
            summary_path.write_bytes(original)
            (run_dir / marker["ranks"]["path"]).unlink()
            with self.assertRaises(ValueError):
                load(run_dir, identity)

    def test_resume_rejects_another_protocol_or_target_order(self):
        save, load = self.fn("save_completed_run"), self.fn("load_completed_run")
        _, identity, summary, ranks = self.fixture()
        with tempfile.TemporaryDirectory() as directory:
            run_dir = Path(directory) / "s1_M0"
            save(run_dir, summary, ranks)
            for key in ("protocol_sha256", "target_order_sha256", "runtime_config_sha256", "runtime_environment_sha256"):
                altered = {**identity, key: "different"}
                with self.assertRaises(ValueError):
                    load(run_dir, altered)

    def test_failed_or_empty_integrity_gate_cannot_be_saved(self):
        save = self.fn("save_completed_run")
        _, _, summary, ranks = self.fixture()
        with tempfile.TemporaryDirectory() as directory:
            for index, gates in enumerate(({}, {"fixture_gate": False}, {"fixture_gate": "true"})):
                altered = {**summary, "integrity_assertions": gates}
                with self.assertRaises(ValueError):
                    save(Path(directory) / str(index), altered, ranks)

    def test_metrics_must_reconcile_with_saved_exact_ranks(self):
        save = self.fn("save_completed_run")
        _, _, summary, ranks = self.fixture()
        with tempfile.TemporaryDirectory() as directory:
            for index, (key, value) in enumerate((("ndcg_at_k", 0.9), ("recall_at_k", 0.9), ("k", 10))):
                altered = copy.deepcopy(summary)
                altered["validation"]["metrics"][key] = value
                with self.assertRaises(ValueError):
                    save(Path(directory) / str(index), altered, ranks)

    def test_aggregate_pairs_six_runs_and_does_not_pool_a_changed_legacy_runtime(self):
        _, identity, template, ranks = self.fixture()
        complete = {}
        for plan in self.fn("planned_runs")():
            summary = copy.deepcopy(template)
            config = self.fn("trial_config")(plan)
            summary.update(run_id=plan["run_id"], seed_id=plan["seed_id"], method=plan["method"],
                           registered_config=config,
                           runtime_config_sha256=self.fn("semantic_sha256")(config))
            complete[plan["run_id"]] = {"summary": summary, "ranks": ranks}
        legacy = {method: copy.deepcopy(template) for method in ("M0", "M1", "M2")}
        labels = np.array(["head", "head", "body", "body", "tail"])
        build = self.fn("build_aggregate")
        aggregate = build(complete, legacy, labels)
        self.assertEqual(aggregate["status"], "PAIRED_VALIDATION_COMPLETE")
        self.assertEqual(len(aggregate["additional_seed_comparisons"]), 2)
        self.assertTrue(aggregate["quality_statistics_include_legacy_seed"])
        self.assertEqual(aggregate["quality_statistics"]["M0"]["ndcg_at_20"]["seed_count"], 3)
        legacy["M1"]["environment"]["torch"] = "different-legacy-torch"
        altered = build(complete, legacy, labels)
        self.assertFalse(altered["quality_statistics_include_legacy_seed"])
        self.assertEqual(altered["quality_statistics"]["M0"]["ndcg_at_20"]["seed_count"], 2)

    def test_marker_paths_cannot_escape_the_run_folder(self):
        child = self.fn("safe_child")
        with tempfile.TemporaryDirectory() as directory:
            for path in ("../other", "/private/tmp/outside", "attempts/../../outside"):
                with self.assertRaises(ValueError):
                    child(Path(directory), path)

    def test_partial_export_is_explicit_and_checkpoint_free(self):
        save, load, export = self.fn("save_completed_run"), self.fn("load_completed_run"), self.fn("export_bundle")
        _, identity, summary, ranks = self.fixture()
        with tempfile.TemporaryDirectory() as directory:
            output = Path(directory)
            run_dir = output / "runs" / "s1_M0"
            save(run_dir, summary, ranks)
            completed = {"s1_M0": load(run_dir, identity)}
            (run_dir / "rogue.pt").write_bytes(b"must not be exported")
            aggregate = {"status": "PAIRED_VALIDATION_PARTIAL", "completed_runs": 1, "planned_runs": 6}
            archive = export(output, completed, aggregate, "Partial report")
            with zipfile.ZipFile(archive) as bundle:
                self.assertIsNone(bundle.testzip())
                self.assertEqual(len(bundle.namelist()), 5)
                self.assertFalse(any(n.endswith((".pt", ".pth", ".ckpt")) for n in bundle.namelist()))
                exported = json.loads(bundle.read("paired_sampling_validation_summary.json"))
                self.assertEqual(exported["status"], "PAIRED_VALIDATION_PARTIAL")


if __name__ == "__main__":
    unittest.main()
