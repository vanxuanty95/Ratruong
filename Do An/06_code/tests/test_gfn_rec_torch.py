"""Oracle tests for GRAPES-GFN-Rec torch primitives (gate R2).

Test IDs refer to Do An/02_protocol/GRAPES_RECOMMENDATION_SPEC_vn.md (T01-T25)
and the G1-G7 checklist in Do An/00_project/PHASE2_GRAPES_GFN_REC_SPEC_vn.md.
Skipped when PyTorch is unavailable (local pure-Python environment).
"""

import itertools
import math
import unittest

try:
    import torch

    HAS_TORCH = True
except ImportError:  # pragma: no cover - environment dependent
    HAS_TORCH = False

if HAS_TORCH:
    from grapes_rec.torch_graph import TorchBipartiteGraph, unique_targets
    from grapes_rec.gfn_sampler import (
        GRAPESSampler,
        SamplerConfig,
        bernoulli_log_prob,
        candidate_set,
        gumbel_topk,
    )
    from grapes_rec.sampled_lightgcn import (
        SampledLightGCN,
        build_block,
        full_lightgcn_embeddings,
        bpr_loss,
    )
    from grapes_rec.gfn_trainer import (
        TrainConfig,
        reinforce_loss,
        train_step,
        trajectory_balance_loss,
    )


def toy_graph():
    # users 0..3, items 0..3 (global 4..7)
    edges = [(0, 0), (0, 1), (1, 1), (1, 2), (2, 2), (2, 3), (3, 3), (3, 0)]
    return TorchBipartiteGraph.from_pairs(4, 4, edges)


def brute_neighbors(graph, nodes):
    nodes = set(nodes)
    out = set()
    for u, i in graph.pairs:
        gi = graph.num_users + i
        if u in nodes:
            out.add(gi)
        if gi in nodes:
            out.add(u)
    return out


@unittest.skipUnless(HAS_TORCH, "PyTorch not installed")
class GraphAndTargetTests(unittest.TestCase):
    def test_T01_T02_unique_targets_preserve_triplet_map(self):
        users = torch.tensor([0, 0, 2])
        pos = torch.tensor([4, 5, 4])
        neg = torch.tensor([6, 4, 7])
        v0, iu, ip, ineg = unique_targets(users, pos, neg)
        self.assertEqual(set(v0.tolist()), {0, 2, 4, 5, 6, 7})
        self.assertEqual(len(v0.tolist()), len(set(v0.tolist())))
        self.assertTrue(torch.equal(v0[iu], users))
        self.assertTrue(torch.equal(v0[ip], pos))
        self.assertTrue(torch.equal(v0[ineg], neg))

    def test_T03_bipartite_ids_and_degree(self):
        g = toy_graph()
        self.assertEqual(g.num_nodes, 8)
        src, dst = g.edge_index()
        for s, d in zip(src.tolist(), dst.tolist()):
            self.assertNotEqual(s < 4, d < 4)
        self.assertEqual(g.degree.tolist(), [2, 2, 2, 2, 2, 2, 2, 2])
        with self.assertRaises(ValueError):
            TorchBipartiteGraph.from_pairs(2, 2, [(0, 5)])

    def test_T25_holdout_edge_guard(self):
        g = toy_graph()
        g.assert_disjoint_from(torch.tensor([[0, 2]]))  # (u0, item2) not in train
        with self.assertRaises(ValueError):
            g.assert_disjoint_from(torch.tensor([[0, 1]]))


@unittest.skipUnless(HAS_TORCH, "PyTorch not installed")
class SamplingPrimitiveTests(unittest.TestCase):
    def test_T05_T06_candidates_match_bruteforce(self):
        g = toy_graph()
        for prev in ([0], [0, 5], [1, 2, 7], list(range(8))):
            cand = candidate_set(g, torch.tensor(prev))
            expected = brute_neighbors(g, prev) - set(prev)
            self.assertEqual(set(cand.tolist()), expected)
            self.assertEqual(len(cand.tolist()), len(set(cand.tolist())))

    def test_T07_exact_k_unique(self):
        gen = torch.Generator().manual_seed(0)
        logits = torch.randn(50, generator=gen)
        for k in (0, 1, 7, 49, 50, 80):
            idx = gumbel_topk(torch.nn.functional.logsigmoid(logits), k, gen)
            self.assertEqual(idx.numel(), min(k, 50))
            self.assertEqual(len(set(idx.tolist())), idx.numel())

    def test_T09_empty_and_small_candidates_finite(self):
        gen = torch.Generator().manual_seed(1)
        empty = torch.zeros(0)
        self.assertEqual(gumbel_topk(empty, 5, gen).numel(), 0)
        self.assertEqual(float(bernoulli_log_prob(empty, torch.zeros(0, dtype=torch.bool))), 0.0)
        logits = torch.tensor([0.3, -2.0])
        mask = torch.tensor([True, True])
        lp = bernoulli_log_prob(logits, mask)
        self.assertTrue(torch.isfinite(lp))
        expected = sum(-math.log1p(math.exp(-x)) for x in (0.3, -2.0))
        self.assertAlmostEqual(float(lp), expected, places=5)

    def test_T10_equal_priority_is_uniform_exact_k(self):
        gen = torch.Generator().manual_seed(2)
        n, k, trials = 6, 2, 6000
        counts = torch.zeros(n)
        for _ in range(trials):
            counts[gumbel_topk(torch.zeros(n), k, gen)] += 1
        freq = counts / trials
        for f in freq.tolist():
            self.assertAlmostEqual(f, k / n, delta=0.03)

    def test_T16_T17_full_bernoulli_log_prob_manual_and_noise_free(self):
        logits = torch.tensor([1.0, -0.5, 2.0, 0.0])
        mask = torch.tensor([True, False, False, True])
        manual = (
            math.log(1 / (1 + math.exp(-1.0)))
            + math.log(1 - 1 / (1 + math.exp(0.5)))
            + math.log(1 - 1 / (1 + math.exp(-2.0)))
            + math.log(0.5)
        )
        self.assertAlmostEqual(float(bernoulli_log_prob(logits, mask)), manual, places=5)
        # T17: Gumbel noise changes the action but log q depends only on logits and mask.
        g1 = torch.Generator().manual_seed(3)
        g2 = torch.Generator().manual_seed(4)
        prio = torch.nn.functional.logsigmoid(torch.zeros(30))
        self.assertFalse(torch.equal(gumbel_topk(prio, 5, g1).sort()[0], gumbel_topk(prio, 5, g2).sort()[0]))
        self.assertEqual(
            float(bernoulli_log_prob(logits, mask)), float(bernoulli_log_prob(logits.clone(), mask.clone()))
        )

    def test_T21_extreme_logits_finite(self):
        logits = torch.tensor([60.0, -60.0, 1e4, -1e4])
        mask = torch.tensor([False, True, False, True])
        lp = bernoulli_log_prob(logits, mask)
        self.assertTrue(torch.isfinite(lp))
        logits = logits.clone().requires_grad_(True)
        bernoulli_log_prob(logits, mask).backward()
        self.assertTrue(torch.isfinite(logits.grad).all())


def make_sampler(g, mode, dim=8, layers=2, seed=0):
    torch.manual_seed(seed)
    cfg = SamplerConfig(mode=mode, embedding_dim=dim, num_layers=layers)
    return GRAPESSampler(g, cfg)


@unittest.skipUnless(HAS_TORCH, "PyTorch not installed")
class SamplerTraceTests(unittest.TestCase):
    def test_T06_T07_T08_trace_invariants_and_reentry(self):
        g = toy_graph()
        for mode in ("learned", "uniform", "degree"):
            sampler = make_sampler(g, mode)
            gen = torch.Generator().manual_seed(5)
            v0 = torch.tensor([0, 4])
            trace = sampler.sample(v0, [2, 2], gen)
            k_prev = v0
            for layer in trace.layers:
                sel = layer.selected
                self.assertEqual(sel.numel(), min(2, layer.candidates.numel()))
                self.assertEqual(len(set(sel.tolist())), sel.numel())
                self.assertFalse(set(sel.tolist()) & set(k_prev.tolist()))
                self.assertTrue(set(sel.tolist()) <= set(layer.candidates.tolist()))
                self.assertEqual(layer.nodes.tolist(), torch.cat([v0, sel]).tolist())
                k_prev = layer.nodes
            self.assertTrue(torch.isfinite(trace.log_q))
            self.assertTrue(torch.isfinite(trace.log_z))

    def test_D8_cross_layer_reentry_allowed(self):
        # path u0 - i0 - u1 : V0={u0}; V1={i0}; K1={u0,i0}; C2=N(K1)\K1={u1}
        # then layer 3 candidates from K2={u0,u1} are {i0} again -> re-entry.
        g = TorchBipartiteGraph.from_pairs(2, 1, [(0, 0), (1, 0)])
        sampler = make_sampler(g, "uniform", layers=3)
        trace = sampler.sample(torch.tensor([0]), [1, 1, 1], torch.Generator().manual_seed(0))
        self.assertEqual(trace.layers[0].selected.tolist(), [2])
        self.assertEqual(trace.layers[1].selected.tolist(), [1])
        self.assertEqual(trace.layers[2].selected.tolist(), [2])

    def test_static_modes_have_zero_log_q_and_no_parameters(self):
        g = toy_graph()
        for mode in ("uniform", "degree"):
            sampler = make_sampler(g, mode)
            self.assertEqual(sum(p.numel() for p in sampler.parameters()), 0)
            trace = sampler.sample(torch.tensor([1]), [1, 1], torch.Generator().manual_seed(0))
            self.assertEqual(float(trace.log_q), 0.0)

    def test_G1_learned_mode_has_parameters(self):
        sampler = make_sampler(toy_graph(), "learned")
        self.assertGreater(sum(p.numel() for p in sampler.parameters()), 0)

    def test_learned_log_q_matches_recomputed_bernoulli(self):
        g = toy_graph()
        sampler = make_sampler(g, "learned")
        trace = sampler.sample(torch.tensor([0, 5]), [1, 2], torch.Generator().manual_seed(7))
        total = torch.zeros(())
        for layer in trace.layers:
            mask = torch.isin(layer.candidates, layer.selected)
            total = total + bernoulli_log_prob(layer.logits, mask)
        self.assertAlmostEqual(float(trace.log_q), float(total), places=5)

    def test_deterministic_replay(self):
        g = toy_graph()
        sampler = make_sampler(g, "learned")
        a = sampler.sample(torch.tensor([0, 6]), [2, 2], torch.Generator().manual_seed(11))
        b = sampler.sample(torch.tensor([0, 6]), [2, 2], torch.Generator().manual_seed(11))
        self.assertEqual(a.fingerprint(), b.fingerprint())
        self.assertEqual(float(a.log_q), float(b.log_q))

    def test_T19_log_z_permutation_and_outside_invariance_isolated_finite(self):
        g = toy_graph()
        sampler = make_sampler(g, "learned")
        v0 = torch.tensor([0, 4, 6])
        z1 = sampler.log_z(v0)
        z2 = sampler.log_z(v0[[2, 0, 1]])
        self.assertAlmostEqual(float(z1), float(z2), places=5)
        # Changing an embedding of a node outside V0 must not change log Z(V0).
        with torch.no_grad():
            sampler.embedding.weight[3].add_(10.0)
        self.assertAlmostEqual(float(sampler.log_z(v0)), float(z1), places=5)
        # isolated targets (no edges among them) -> finite scalar
        iso = TorchBipartiteGraph.from_pairs(2, 2, [(0, 0)])
        s2 = make_sampler(iso, "learned")
        self.assertTrue(torch.isfinite(s2.log_z(torch.tensor([1, 3]))))


@unittest.skipUnless(HAS_TORCH, "PyTorch not installed")
class BlockAndLightGCNTests(unittest.TestCase):
    def path_graph(self):
        # t=user0, a=item0 (global 2), b=user1 ; edges t-a, b-a
        return TorchBipartiteGraph.from_pairs(2, 1, [(0, 0), (1, 0)])

    def test_T11_T13_block_edges_declared_and_no_self_loops(self):
        g = toy_graph()
        src = torch.tensor([0, 4, 5, 1])
        dst = torch.tensor([0, 4])
        blk = build_block(g, src, dst, norm="sampled_bi")
        for s_local, t_local in zip(blk.src_local.tolist(), blk.dst_local.tolist()):
            s, t = int(src[s_local]), int(dst[t_local])
            self.assertNotEqual(s, t)
            self.assertIn(t, brute_neighbors(g, [s]))
        expected = {(int(s), int(t)) for s in src for t in dst if int(t) in brute_neighbors(g, [int(s)])}
        got = {(int(src[a]), int(dst[b])) for a, b in zip(blk.src_local.tolist(), blk.dst_local.tolist())}
        self.assertEqual(got, expected)

    def test_T12_path_oracle_direction_unit_weights(self):
        g = self.path_graph()
        v0 = torch.tensor([0])  # t
        k1 = torch.tensor([0, 2])  # V0 ∪ {a}
        k2 = torch.tensor([0, 1])  # V0 ∪ {b}
        model = SampledLightGCN(g.num_nodes, dim=1, num_layers=2)
        with torch.no_grad():
            model.embedding.weight.copy_(torch.tensor([[0.0], [1.0], [0.0]]))
        blocks = [build_block(g, k1, v0, norm="none"), build_block(g, k2, k1, norm="none")]
        depth = model.depth_outputs(blocks, [v0, k1, k2])
        self.assertAlmostEqual(float(depth[2][0, 0]), 1.0, places=6)
        # D1: P_2 has sources K^2 (contains b) and targets K^1 (contains a).
        self.assertEqual((blocks[1].num_src, blocks[1].num_dst), (k2.numel(), k1.numel()))
        # the depth-two value is carried by b: zeroing e_b removes it
        with torch.no_grad():
            model.embedding.weight.zero_()
        self.assertEqual(float(model.depth_outputs(blocks, [v0, k1, k2])[2][0, 0]), 0.0)
        # reversed blocks (K^(l-1) -> K^l) yield outputs on K^1 rows, never on t alone
        reversed_block = build_block(g, v0, k1, norm="none")
        self.assertEqual(reversed_block.num_dst, k1.numel())

    def test_T12_path_oracle_normalized_values(self):
        g = self.path_graph()
        v0, k1, k2 = torch.tensor([0]), torch.tensor([0, 2]), torch.tensor([0, 1])
        model = SampledLightGCN(g.num_nodes, dim=1, num_layers=2)
        with torch.no_grad():
            model.embedding.weight.copy_(torch.tensor([[0.0], [1.0], [0.0]]))
        full = [build_block(g, k1, v0, norm="full"), build_block(g, k2, k1, norm="full")]
        self.assertAlmostEqual(float(model.depth_outputs(full, [v0, k1, k2])[2][0, 0]), 0.5, places=6)
        # sampled-local bi-norm: a receives from t and b -> 1/sqrt(2)
        samp = [build_block(g, k1, v0, norm="sampled_bi"), build_block(g, k2, k1, norm="sampled_bi")]
        self.assertAlmostEqual(
            float(model.depth_outputs(samp, [v0, k1, k2])[2][0, 0]), 1 / math.sqrt(2), places=6
        )

    def test_T14_T15_full_receptive_field_matches_full_lightgcn_single_user_target(self):
        g = toy_graph()
        torch.manual_seed(0)
        model = SampledLightGCN(g.num_nodes, dim=4, num_layers=2)
        sampler = make_sampler(g, "uniform")
        v0 = torch.tensor([0])
        trace = sampler.sample(v0, [100, 100], torch.Generator().manual_seed(0))
        blocks = model.build_blocks(g, trace, v0, norm="full")
        z = model(blocks, [v0] + [layer.nodes for layer in trace.layers])
        full = full_lightgcn_embeddings(g, model.embedding.weight, 2)
        self.assertTrue(torch.allclose(z[0], full[0], atol=1e-6))

    def test_non_cumulative_K_is_not_full_equivalent_for_mixed_targets(self):
        # Documented GRAPES property: K^l = V0 ∪ V^l drops V^1 nodes from K^2.
        g = toy_graph()
        torch.manual_seed(0)
        model = SampledLightGCN(g.num_nodes, dim=4, num_layers=2)
        sampler = make_sampler(g, "uniform")
        v0 = torch.tensor([0, 5])
        trace = sampler.sample(v0, [100, 100], torch.Generator().manual_seed(0))
        blocks = model.build_blocks(g, trace, v0, norm="full")
        z = model(blocks, [v0] + [layer.nodes for layer in trace.layers])
        full = full_lightgcn_embeddings(g, model.embedding.weight, 2)
        self.assertFalse(torch.allclose(z, full[v0], atol=1e-6))

    def test_T22_bpr_decreases_with_margin(self):
        z = torch.tensor([[1.0], [0.5], [0.0]])
        low = bpr_loss(z, torch.tensor([0]), torch.tensor([1]), torch.tensor([2]))
        z2 = torch.tensor([[1.0], [2.0], [0.0]])
        high = bpr_loss(z2, torch.tensor([0]), torch.tensor([1]), torch.tensor([2]))
        self.assertLess(float(high), float(low))


@unittest.skipUnless(HAS_TORCH, "PyTorch not installed")
class ObjectiveAndOwnershipTests(unittest.TestCase):
    def test_T18_reinforce_expected_gradient_direction(self):
        theta = torch.zeros((), requires_grad=True)
        losses = {True: 1.0, False: 3.0}  # action a = select, b = not select
        expected = torch.zeros(())
        for select in (True, False):
            logq = bernoulli_log_prob(theta.view(1), torch.tensor([select]))
            expected = expected + logq.exp().detach() * reinforce_loss(torch.tensor(losses[select]), logq)
        expected.backward()
        self.assertAlmostEqual(float(theta.grad), -0.5, places=6)
        # descent step raises probability of lower-loss action
        self.assertGreater(float(torch.sigmoid(theta - 0.1 * theta.grad)), 0.5)

    def test_T19_tb_manual(self):
        loss = trajectory_balance_loss(torch.tensor(0.2), torch.tensor(-3.0), 100.0, torch.tensor(0.03))
        self.assertAlmostEqual(float(loss), (0.2 - 3.0 + 3.0) ** 2, places=6)

    def run_step(self, mode, seed=0):
        g = toy_graph()
        torch.manual_seed(seed)
        rec = SampledLightGCN(g.num_nodes, dim=8, num_layers=2)
        sampler = make_sampler(g, mode, seed=seed)
        opt_r = torch.optim.Adam(rec.parameters(), lr=0.05)
        opt_s = torch.optim.Adam(sampler.parameters(), lr=0.05) if mode == "learned" else None
        cfg = TrainConfig(objective={"learned": "tb"}.get(mode, "none"), alpha=10.0, k_per_layer=[2, 2])
        users = torch.tensor([0, 1, 2])
        pos = torch.tensor([4, 5, 6])
        neg = torch.tensor([6, 7, 4])
        return g, rec, sampler, opt_r, opt_s, cfg, (users, pos, neg)

    def test_T20_G7_gradient_ownership_and_sampler_learns(self):
        g, rec, sampler, opt_r, opt_s, cfg, batch = self.run_step("learned")
        before_s = [p.detach().clone() for p in sampler.parameters()]
        before_r = [p.detach().clone() for p in rec.parameters()]
        logs = train_step(g, rec, sampler, opt_r, opt_s, cfg, batch, torch.Generator().manual_seed(0))
        for name in ("bpr", "tb", "log_q", "log_z"):
            self.assertTrue(math.isfinite(logs[name]), name)
        self.assertTrue(logs["ownership_ok"])
        self.assertTrue(any(not torch.equal(a, b) for a, b in zip(before_s, sampler.parameters())))
        self.assertTrue(any(not torch.equal(a, b) for a, b in zip(before_r, rec.parameters())))
        self.assertGreater(logs["sampler_param_delta"], 0.0)

    def test_T20_tb_loss_gives_no_recommender_gradient(self):
        g, rec, sampler, opt_r, opt_s, cfg, batch = self.run_step("learned")
        v0, *_ = unique_targets(*batch)
        trace = sampler.sample(v0, cfg.k_per_layer, torch.Generator().manual_seed(0))
        blocks = rec.build_blocks(g, trace, v0, norm="sampled_bi")
        z = rec(blocks, [v0] + [layer.nodes for layer in trace.layers])
        bpr = (z ** 2).mean()
        tb = trajectory_balance_loss(trace.log_z, trace.log_q, 10.0, bpr.detach())
        rec.zero_grad()
        sampler.zero_grad()
        tb.backward(retain_graph=True)
        self.assertTrue(all(p.grad is None or float(p.grad.abs().sum()) == 0 for p in rec.parameters()))
        sampler.zero_grad()
        bpr.backward()
        self.assertTrue(all(p.grad is None or float(p.grad.abs().sum()) == 0 for p in sampler.parameters()))

    def test_static_modes_step_without_sampler_optimizer(self):
        for mode in ("uniform", "degree"):
            g, rec, sampler, opt_r, opt_s, cfg, batch = self.run_step(mode)
            logs = train_step(g, rec, sampler, opt_r, opt_s, cfg, batch, torch.Generator().manual_seed(0))
            self.assertTrue(math.isfinite(logs["bpr"]))
            self.assertEqual(logs["log_q"], 0.0)

    def test_train_step_replay_is_deterministic(self):
        out = []
        for _ in range(2):
            g, rec, sampler, opt_r, opt_s, cfg, batch = self.run_step("learned", seed=3)
            logs = train_step(g, rec, sampler, opt_r, opt_s, cfg, batch, torch.Generator().manual_seed(9))
            out.append((logs["bpr"], logs["tb"], logs["trace_fingerprint"]))
        self.assertEqual(out[0], out[1])


if __name__ == "__main__":
    unittest.main()
