"""
GRAPES: Learning to Sample Graphs for Scalable Graph Neural Networks
Implementation dựa trên arXiv:2310.03399 (Younesian et al., TMLR 2024)

Triển khai bằng NumPy thuần (không cần PyTorch/TF).
Thuật toán:
  - Classifier GNN: GraphSAGE-style (mean aggregation)
  - Sampler GNN: dự đoán inclusion probability cho từng neighbor
  - GFlowNet training: trajectory balance objective
  - Adaptive neighbor sampling theo xác suất học được

Dataset: Cora-like synthetic (homophilous, 7 classes)
"""

import numpy as np
import time
import json

np.random.seed(42)

# ─────────────────────────────────────────────
# 1. Tạo synthetic graph kiểu Cora
# ─────────────────────────────────────────────

def generate_cora_like(n_nodes=1000, n_features=128, n_classes=7,
                        avg_degree=8, homophily=0.8):
    """
    Tạo đồ thị homophilous với n_nodes đỉnh, n_features đặc trưng, n_classes nhãn.
    homophily = tỷ lệ cạnh nối đỉnh cùng nhãn.
    """
    labels = np.random.randint(0, n_classes, size=n_nodes)

    # Feature: cluster quanh centroid theo nhãn + nhiễu
    centroids = np.random.randn(n_classes, n_features) * 2
    X = centroids[labels] + np.random.randn(n_nodes, n_features) * 0.5
    X = X / (np.linalg.norm(X, axis=1, keepdims=True) + 1e-8)

    # Xây dựng edge list
    edges = set()
    n_edges_target = n_nodes * avg_degree // 2

    for _ in range(n_edges_target * 3):
        if len(edges) >= n_edges_target:
            break
        u = np.random.randint(0, n_nodes)
        if np.random.rand() < homophily:
            # Chọn đỉnh cùng nhãn
            same = np.where(labels == labels[u])[0]
            same = same[same != u]
            if len(same) == 0:
                continue
            v = np.random.choice(same)
        else:
            v = np.random.randint(0, n_nodes)
            if v == u:
                continue
        if u != v:
            edges.add((min(u, v), max(u, v)))

    edge_index = np.array(list(edges), dtype=np.int32)  # [E, 2]

    # Adjacency list
    adj = [[] for _ in range(n_nodes)]
    for u, v in edge_index:
        adj[u].append(v)
        adj[v].append(u)

    return X.astype(np.float32), labels, adj, edge_index


# ─────────────────────────────────────────────
# 2. Hàm kích hoạt & tiện ích
# ─────────────────────────────────────────────

def relu(x):
    return np.maximum(0, x)

def relu_grad(x):
    return (x > 0).astype(np.float32)

def softmax(x):
    x = x - x.max(axis=-1, keepdims=True)
    e = np.exp(x)
    return e / (e.sum(axis=-1, keepdims=True) + 1e-12)

def sigmoid(x):
    return 1.0 / (1.0 + np.exp(-np.clip(x, -30, 30)))

def cross_entropy(logits, labels):
    probs = softmax(logits)
    n = labels.shape[0]
    return -np.log(probs[np.arange(n), labels] + 1e-12).mean()

def accuracy(logits, labels):
    return (logits.argmax(axis=1) == labels).mean()


# ─────────────────────────────────────────────
# 3. GraphSAGE layer (numpy, mean aggregation)
# ─────────────────────────────────────────────

class SAGELayer:
    def __init__(self, in_dim, out_dim, lr=0.01):
        scale = np.sqrt(2.0 / in_dim)
        self.W_self = np.random.randn(in_dim, out_dim).astype(np.float32) * scale
        self.W_neigh = np.random.randn(in_dim, out_dim).astype(np.float32) * scale
        self.b = np.zeros(out_dim, dtype=np.float32)
        self.lr = lr
        # cache for backprop
        self._cache = {}

    def forward(self, h, sampled_adj):
        """
        h: [N, in_dim]
        sampled_adj: list of lists — sampled_adj[i] = danh sách neighbor được chọn
        """
        N = h.shape[0]
        agg = np.zeros_like(h)
        for i in range(N):
            nbrs = sampled_adj[i]
            if len(nbrs) > 0:
                agg[i] = h[nbrs].mean(axis=0)
            else:
                agg[i] = np.zeros(h.shape[1])

        out = h @ self.W_self + agg @ self.W_neigh + self.b
        out_act = relu(out)
        self._cache = {'h': h, 'agg': agg, 'out_pre': out, 'sampled_adj': sampled_adj}
        return out_act

    def backward(self, d_out_act):
        cache = self._cache
        h = cache['h']
        agg = cache['agg']
        out_pre = cache['out_pre']
        sampled_adj = cache['sampled_adj']
        N = h.shape[0]

        d_out = d_out_act * relu_grad(out_pre)

        dW_self = h.T @ d_out
        dW_neigh = agg.T @ d_out
        db = d_out.sum(axis=0)

        # gradient w.r.t. h (self + aggregated)
        dh = d_out @ self.W_self.T
        d_agg = d_out @ self.W_neigh.T

        # propagate d_agg back to neighbors
        for i in range(N):
            nbrs = sampled_adj[i]
            if len(nbrs) > 0:
                dh[nbrs] += d_agg[i] / len(nbrs)

        # SGD update
        self.W_self -= self.lr * dW_self
        self.W_neigh -= self.lr * dW_neigh
        self.b -= self.lr * db
        return dh


# ─────────────────────────────────────────────
# 4. Classifier GNN (2-layer GraphSAGE)
# ─────────────────────────────────────────────

class ClassifierGNN:
    def __init__(self, in_dim, hidden_dim, out_dim, lr=0.01):
        self.layer1 = SAGELayer(in_dim, hidden_dim, lr)
        self.layer2 = SAGELayer(hidden_dim, out_dim, lr)
        self.out_dim = out_dim

    def forward(self, X, sampled_adj):
        h1 = self.layer1.forward(X, sampled_adj)
        logits = self.layer2.forward(h1, sampled_adj)
        self._h1 = h1
        self._logits = logits
        return logits

    def backward(self, logits, labels):
        # Cross-entropy gradient
        N = labels.shape[0]
        probs = softmax(logits)
        d_logits = probs.copy()
        d_logits[np.arange(N), labels] -= 1.0
        d_logits /= N
        dh1 = self.layer2.backward(d_logits)
        self.layer1.backward(dh1)

    def loss_and_grad(self, X, sampled_adj, labels):
        logits = self.forward(X, sampled_adj)
        loss = cross_entropy(logits, labels)
        self.backward(logits, labels)
        return loss, logits


# ─────────────────────────────────────────────
# 5. Sampler GNN (dự đoán inclusion probability)
# ─────────────────────────────────────────────

class SamplerGNN:
    """
    Một GNN nhỏ học xác suất lấy mẫu đỉnh.
    Input: feature của node, output: scalar logit (→ sigmoid → probability)
    """
    def __init__(self, in_dim, hidden_dim=32, lr=0.005):
        scale = np.sqrt(2.0 / in_dim)
        self.W1 = np.random.randn(in_dim, hidden_dim).astype(np.float32) * scale
        self.b1 = np.zeros(hidden_dim, dtype=np.float32)
        self.W2 = np.random.randn(hidden_dim, 1).astype(np.float32) * scale
        self.b2 = np.zeros(1, dtype=np.float32)
        self.lr = lr
        self._cache = {}

    def forward(self, X):
        """X: [N, in_dim] → probs: [N,]"""
        h = relu(X @ self.W1 + self.b1)
        logits = (h @ self.W2 + self.b2).squeeze(-1)
        probs = sigmoid(logits)
        self._cache = {'X': X, 'h': h, 'logits': logits, 'probs': probs}
        return probs

    def backward(self, d_probs):
        """d_probs: [N,] gradient w.r.t. probs"""
        cache = self._cache
        X, h, logits, probs = cache['X'], cache['h'], cache['logits'], cache['probs']

        d_logits = d_probs * probs * (1 - probs)  # sigmoid grad
        d_logits = d_logits[:, None]

        dW2 = h.T @ d_logits
        db2 = d_logits.sum(axis=0)
        dh = d_logits @ self.W2.T
        dh_pre = dh * relu_grad(h)
        dW1 = X.T @ dh_pre
        db1 = dh_pre.sum(axis=0)

        self.W1 -= self.lr * dW1
        self.b1 -= self.lr * db1
        self.W2 -= self.lr * dW2
        self.b2 -= self.lr * db2


# ─────────────────────────────────────────────
# 6. GFlowNet Trajectory Balance Objective
#    Simplified: TB loss = (log Z + log P_F - log P_B - log R)^2
#    P_F = forward sampling probs, P_B = uniform backward
#    R = exp(classifier_reward) (normalized downstream loss)
# ─────────────────────────────────────────────

class GFlowNetSampler:
    def __init__(self, in_dim, hidden_dim=32, sample_size=10, lr=0.005):
        self.sampler = SamplerGNN(in_dim, hidden_dim, lr)
        self.log_Z = np.zeros(1, dtype=np.float32)  # learnable partition function
        self.log_Z_lr = lr
        self.sample_size = sample_size

    def sample_neighbors(self, X, adj, node_idx):
        """
        Với mỗi node trong node_idx, lấy mẫu sample_size neighbors
        theo xác suất từ SamplerGNN.
        Trả về sampled_adj: list of lists
        """
        probs = self.sampler.forward(X)  # [N,]
        sampled_adj = []
        N = len(adj)
        for i in range(N):
            nbrs = adj[i]
            if len(nbrs) == 0:
                sampled_adj.append([])
                continue
            k = min(self.sample_size, len(nbrs))
            nbr_probs = probs[nbrs]
            # Normalize
            nbr_probs_norm = nbr_probs / (nbr_probs.sum() + 1e-12)
            chosen_idx = np.random.choice(len(nbrs), size=k, replace=False,
                                           p=nbr_probs_norm)
            sampled_adj.append([nbrs[j] for j in chosen_idx])
        return sampled_adj, probs

    def gflownet_loss(self, probs, sampled_adj, reward):
        """
        Trajectory Balance loss (simplified):
        L = mean( (log_Z + log P_F(traj) - log P_B(traj) - log R) ^ 2 )
        P_F = product of sampling probs for chosen nodes
        P_B = uniform = 1/|neighbors|
        reward: scalar, goodness of this trajectory (based on classifier perf)
        """
        N = len(sampled_adj)
        tb_losses = []
        d_probs = np.zeros_like(probs)

        for i in range(N):
            nbrs_all = sampled_adj[i]  # chosen neighbors
            if len(nbrs_all) == 0:
                continue
            p_chosen = probs[nbrs_all]
            log_pf = np.log(p_chosen + 1e-12).sum()
            log_pb = -np.log(len(nbrs_all) + 1e-12) * len(nbrs_all)  # uniform
            log_r = np.log(reward + 1e-12)
            tb = (self.log_Z[0] + log_pf - log_pb - log_r) ** 2
            tb_losses.append(tb)

            # gradient w.r.t. probs
            coeff = 2 * (self.log_Z[0] + log_pf - log_pb - log_r)
            for j in nbrs_all:
                d_probs[j] += coeff / (probs[j] + 1e-12)

        if len(tb_losses) == 0:
            return 0.0

        loss = np.mean(tb_losses)
        d_probs /= N

        # Update log_Z
        coeff_Z = np.mean([2 * (self.log_Z[0] + np.log(probs[sampled_adj[i]] + 1e-12).sum()
                                 - (-np.log(len(sampled_adj[i]) + 1e-12) * len(sampled_adj[i]))
                                 - np.log(reward + 1e-12))
                            for i in range(N) if len(sampled_adj[i]) > 0])
        self.log_Z -= self.log_Z_lr * coeff_Z

        # Backprop through sampler
        self.sampler.backward(d_probs)
        return loss


# ─────────────────────────────────────────────
# 7. Vòng lặp huấn luyện GRAPES
# ─────────────────────────────────────────────

def train_grapes(X, labels, adj, n_epochs=50, batch_size=256, sample_size=10,
                 hidden_dim=64, lr=0.01, sampler_hidden=32, sampler_lr=0.005,
                 train_ratio=0.6, val_ratio=0.2):
    N, F = X.shape
    n_classes = labels.max() + 1

    # Split
    idx = np.random.permutation(N)
    n_train = int(N * train_ratio)
    n_val = int(N * val_ratio)
    train_idx = idx[:n_train]
    val_idx = idx[n_train:n_train + n_val]
    test_idx = idx[n_train + n_val:]

    # Models
    classifier = ClassifierGNN(F, hidden_dim, n_classes, lr=lr)
    gflownet = GFlowNetSampler(F, sampler_hidden, sample_size, lr=sampler_lr)

    history = {'epoch': [], 'train_loss': [], 'train_acc': [],
               'val_acc': [], 'gflow_loss': [], 'time': []}

    print(f"\n{'='*60}")
    print(f"GRAPES Training — N={N}, F={F}, Classes={n_classes}")
    print(f"Train/Val/Test: {len(train_idx)}/{len(val_idx)}/{len(test_idx)}")
    print(f"Sample size per node: {sample_size}  |  Batch: {batch_size}")
    print(f"{'='*60}")
    print(f"{'Epoch':>6} | {'Loss':>8} | {'Train Acc':>10} | {'Val Acc':>8} | {'GFlow Loss':>11} | {'Time(s)':>8}")
    print(f"{'-'*60}")

    t0 = time.time()
    for epoch in range(1, n_epochs + 1):
        # --- Mini-batch sampling ---
        batch = np.random.choice(train_idx, size=min(batch_size, len(train_idx)),
                                  replace=False)

        # --- Sampler: adaptive neighbor sampling ---
        sampled_adj, probs = gflownet.sample_neighbors(X, adj, batch)

        # --- Classifier forward + backward ---
        clf_loss, logits = classifier.loss_and_grad(X, sampled_adj, labels)

        # --- Reward = exp(-classifier_loss) clipped ---
        reward = float(np.clip(np.exp(-clf_loss), 1e-6, 1.0))

        # --- GFlowNet update ---
        gflow_loss = gflownet.gflownet_loss(probs, sampled_adj, reward)

        # --- Đánh giá ---
        if epoch % 5 == 0 or epoch == 1:
            # Val: dùng tất cả neighbor (greedy sampling theo prob)
            sa_val, _ = gflownet.sample_neighbors(X, adj, val_idx)
            val_logits = classifier.forward(X, sa_val)
            val_acc = accuracy(val_logits[val_idx], labels[val_idx])
            train_acc = accuracy(logits[batch], labels[batch])
            elapsed = time.time() - t0
            history['epoch'].append(epoch)
            history['train_loss'].append(float(clf_loss))
            history['train_acc'].append(float(train_acc))
            history['val_acc'].append(float(val_acc))
            history['gflow_loss'].append(float(gflow_loss))
            history['time'].append(elapsed)
            print(f"{epoch:>6} | {clf_loss:>8.4f} | {train_acc:>10.4f} | "
                  f"{val_acc:>8.4f} | {gflow_loss:>11.4f} | {elapsed:>8.2f}")

    # --- Test ---
    sa_test, _ = gflownet.sample_neighbors(X, adj, test_idx)
    test_logits = classifier.forward(X, sa_test)
    test_acc = accuracy(test_logits[test_idx], labels[test_idx])
    elapsed = time.time() - t0

    print(f"\n{'='*60}")
    print(f"TEST ACCURACY (GRAPES, adaptive sampling): {test_acc:.4f}")
    print(f"Total time: {elapsed:.2f}s")
    print(f"{'='*60}")

    return classifier, gflownet, history, test_acc


# ─────────────────────────────────────────────
# 8. Baseline: Random Sampling (GraphSAGE)
# ─────────────────────────────────────────────

def train_random_sampling(X, labels, adj, n_epochs=50, batch_size=256,
                          sample_size=10, hidden_dim=64, lr=0.01,
                          train_ratio=0.6, val_ratio=0.2):
    N, F = X.shape
    n_classes = labels.max() + 1
    idx = np.random.permutation(N)
    n_train = int(N * train_ratio)
    n_val = int(N * val_ratio)
    train_idx = idx[:n_train]
    val_idx = idx[n_train:n_train + n_val]
    test_idx = idx[n_train + n_val:]

    classifier = ClassifierGNN(F, hidden_dim, n_classes, lr=lr)

    print(f"\n{'='*60}")
    print(f"Baseline (Random Sampling / GraphSAGE)")
    print(f"{'='*60}")
    print(f"{'Epoch':>6} | {'Loss':>8} | {'Train Acc':>10} | {'Val Acc':>8}")
    print(f"{'-'*50}")

    t0 = time.time()
    history = {'epoch': [], 'train_acc': [], 'val_acc': [], 'train_loss': []}
    for epoch in range(1, n_epochs + 1):
        batch = np.random.choice(train_idx, size=min(batch_size, len(train_idx)),
                                  replace=False)
        # Random uniform sampling
        sampled_adj = []
        for i in range(N):
            nbrs = adj[i]
            if len(nbrs) == 0:
                sampled_adj.append([])
            else:
                k = min(sample_size, len(nbrs))
                sampled_adj.append(list(np.random.choice(nbrs, k, replace=False)))

        loss, logits = classifier.loss_and_grad(X, sampled_adj, labels)

        if epoch % 5 == 0 or epoch == 1:
            val_logits = classifier.forward(X, sampled_adj)
            val_acc = accuracy(val_logits[val_idx], labels[val_idx])
            train_acc = accuracy(logits[batch], labels[batch])
            history['epoch'].append(epoch)
            history['train_loss'].append(float(loss))
            history['train_acc'].append(float(train_acc))
            history['val_acc'].append(float(val_acc))
            print(f"{epoch:>6} | {loss:>8.4f} | {train_acc:>10.4f} | {val_acc:>8.4f}")

    # Test
    sampled_adj_test = []
    for i in range(N):
        nbrs = adj[i]
        k = min(sample_size, len(nbrs))
        sampled_adj_test.append(list(np.random.choice(nbrs, k, replace=False)) if len(nbrs) > 0 else [])
    test_logits = classifier.forward(X, sampled_adj_test)
    test_acc = accuracy(test_logits[test_idx], labels[test_idx])
    elapsed = time.time() - t0

    print(f"\nTEST ACCURACY (Random Sampling): {test_acc:.4f}")
    print(f"Total time: {elapsed:.2f}s")
    return history, test_acc


# ─────────────────────────────────────────────
# 9. Thực nghiệm: so sánh với nhiều sample_size
# ─────────────────────────────────────────────

def robustness_experiment(X, labels, adj, sample_sizes=[2, 5, 10, 20],
                          n_epochs=30):
    """
    Tái hiện Figure 3 của bài báo: GRAPES bền vững hơn khi giảm sample size.
    """
    results = {'sample_size': [], 'grapes_acc': [], 'random_acc': []}
    print(f"\n{'='*60}")
    print("ROBUSTNESS EXPERIMENT: Accuracy vs. Sample Size")
    print(f"{'='*60}")
    print(f"{'Sample Size':>12} | {'GRAPES Acc':>12} | {'Random Acc':>12} | {'Delta':>8}")
    print(f"{'-'*55}")

    for k in sample_sizes:
        np.random.seed(42)
        _, _, _, g_acc = train_grapes(X, labels, adj, n_epochs=n_epochs,
                                       sample_size=k, hidden_dim=64,
                                       lr=0.01, sampler_lr=0.005)
        np.random.seed(42)
        _, r_acc = train_random_sampling(X, labels, adj, n_epochs=n_epochs,
                                          sample_size=k, hidden_dim=64, lr=0.01)
        results['sample_size'].append(k)
        results['grapes_acc'].append(float(g_acc))
        results['random_acc'].append(float(r_acc))
        delta = g_acc - r_acc
        print(f"{k:>12} | {g_acc:>12.4f} | {r_acc:>12.4f} | {delta:>+8.4f}")

    return results


# ─────────────────────────────────────────────
# 10. Main
# ─────────────────────────────────────────────

if __name__ == "__main__":
    print("\n" + "="*60)
    print("GRAPES Experiment — arXiv:2310.03399")
    print("NumPy implementation (no PyTorch required)")
    print("="*60)

    # Tạo dataset Cora-like
    print("\n[1] Generating Cora-like synthetic graph...")
    t0 = time.time()
    X, labels, adj, edges = generate_cora_like(
        n_nodes=1000, n_features=128, n_classes=7,
        avg_degree=8, homophily=0.8
    )
    deg = [len(a) for a in adj]
    print(f"    Nodes: {len(X)}, Features: {X.shape[1]}, Classes: {labels.max()+1}")
    print(f"    Edges: {len(edges)}, Avg degree: {np.mean(deg):.2f}, "
          f"Max degree: {max(deg)}")
    print(f"    Homophily label: {sum(labels[e[0]]==labels[e[1]] for e in edges)/len(edges):.3f}")

    # ── Experiment 1: Main comparison ──
    print("\n[2] Main Experiment: GRAPES vs Random Sampling (sample_size=10)")
    np.random.seed(42)
    clf, gfn, grapes_hist, grapes_test = train_grapes(
        X, labels, adj, n_epochs=50, batch_size=256, sample_size=10,
        hidden_dim=64, lr=0.01, sampler_lr=0.005
    )
    np.random.seed(42)
    rand_hist, rand_test = train_random_sampling(
        X, labels, adj, n_epochs=50, batch_size=256, sample_size=10,
        hidden_dim=64, lr=0.01
    )

    print(f"\n{'='*60}")
    print("SUMMARY — Main Experiment")
    print(f"{'='*60}")
    print(f"  GRAPES Test Accuracy  : {grapes_test:.4f}")
    print(f"  Random Test Accuracy  : {rand_test:.4f}")
    print(f"  GRAPES improvement    : {grapes_test - rand_test:+.4f}")

    # ── Experiment 2: Robustness vs. sample size ──
    print("\n[3] Robustness Experiment: varying sample size")
    rob = robustness_experiment(
        X, labels, adj,
        sample_sizes=[2, 5, 10, 20],
        n_epochs=30
    )

    # ── Lưu kết quả ──
    output = {
        "dataset": {
            "n_nodes": int(len(X)),
            "n_features": int(X.shape[1]),
            "n_classes": int(labels.max() + 1),
            "n_edges": int(len(edges)),
            "avg_degree": float(np.mean(deg)),
            "homophily": float(sum(labels[e[0]]==labels[e[1]] for e in edges)/len(edges))
        },
        "main_experiment": {
            "grapes_test_acc": float(grapes_test),
            "random_test_acc": float(rand_test),
            "delta": float(grapes_test - rand_test),
            "grapes_history": grapes_hist,
            "random_history": rand_hist
        },
        "robustness": rob
    }

    with open("/sessions/bold-laughing-archimedes/grapes_results.json", "w") as f:
        json.dump(output, f, indent=2)

    print("\n[4] Results saved to grapes_results.json")
    print("\nDone.")
