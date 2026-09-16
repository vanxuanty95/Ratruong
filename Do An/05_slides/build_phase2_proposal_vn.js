// Phase 2 proposal deck: GRAPES-GFN-Rec (Vietnamese, for supervisor review)
const pptxgen = require("pptxgenjs");
const path = require("path");
const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE"; // 13.33 x 7.5
pres.title = "Giai đoạn 2 — GRAPES-GFN-Rec";

const C = {
  ink: "13262A", teal: "0F4C4F", tealMid: "2E7D7A", tealPale: "E6F0EF",
  amber: "E89B2D", amberPale: "FCF1DF", coral: "C8553D", coralPale: "F8E6E1",
  gray: "5E6B6E", grayLight: "C9D3D2", white: "FFFFFF", bg: "FFFFFF", slate: "F4F7F7",
};
const HF = "Cambria", BF = "Calibri";
const W = 13.33;
let n = 0;

function base(title, kicker) {
  const s = pres.addSlide();
  s.background = { color: C.bg };
  n += 1;
  if (kicker) s.addText(kicker.toUpperCase(), { x: 0.6, y: 0.35, w: 9, h: 0.3, fontFace: BF, fontSize: 11, bold: true, color: C.tealMid, charSpacing: 2, margin: 0, isTextBox: true });
  s.addText(title, { x: 0.6, y: 0.62, w: 12.1, h: 0.8, fontFace: HF, fontSize: 30, bold: true, color: C.ink, margin: 0, isTextBox: true, valign: "top" });
  s.addText(String(n), { x: 12.3, y: 7.0, w: 0.5, h: 0.3, fontFace: BF, fontSize: 10, color: C.gray, align: "right", margin: 0, isTextBox: true });
  return s;
}
function node(s, x, y, label, fill, d = 0.5, fs = 14) {
  s.addShape(pres.shapes.OVAL, { x, y, w: d, h: d, fill: { color: fill }, line: { color: fill } });
  s.addText(label, { x, y, w: d, h: d, align: "center", valign: "middle", fontFace: BF, fontSize: fs, bold: true, color: C.white, margin: 0, isTextBox: true });
}
function card(s, x, y, w, h, head, body, opt = {}) {
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, rectRadius: 0.08, fill: { color: opt.fill || C.slate }, line: { color: opt.line || opt.fill || C.slate } });
  const pad = 0.2;
  let top = y + 0.15;
  if (opt.num) { node(s, x + pad, top, opt.num, opt.numFill || C.teal, 0.42, 13); }
  const hx = opt.num ? x + pad + 0.55 : x + pad;
  s.addText(head, { x: hx, y: top - 0.02, w: w - (hx - x) - pad, h: 0.46, fontFace: BF, fontSize: opt.headSize || 16, bold: true, color: opt.headColor || C.ink, valign: "middle", margin: 0, isTextBox: true });
  if (body) s.addText(body, { x: x + pad, y: top + 0.52, w: w - 2 * pad, h: h - 0.75, fontFace: BF, fontSize: opt.bodySize || 13, color: opt.bodyColor || C.ink, valign: "top", margin: 0, isTextBox: true, paraSpaceAfter: 3 });
}
function bullets(items, size = 15, color = C.ink) {
  return items.map((t, i) => {
    if (typeof t === "string") return { text: t, options: { bullet: { indent: 16 }, breakLine: i < items.length - 1, fontSize: size, color } };
    return { text: t.text, options: { bullet: t.sub ? { indent: 16 } : { indent: 16 }, indentLevel: t.sub ? 1 : 0, bold: !!t.bold, breakLine: i < items.length - 1, fontSize: t.sub ? size - 2 : size, color } };
  });
}
function arrow(s, x1, y1, x2, y2, color = C.gray) {
  s.addShape(pres.shapes.LINE, { x: Math.min(x1, x2), y: Math.min(y1, y2), w: Math.abs(x2 - x1) || 0.001, h: Math.abs(y2 - y1) || 0.001, flipH: x2 < x1, flipV: y2 < y1, line: { color, width: 1.75, endArrowType: "triangle" } });
}
function box(s, x, y, w, h, text, fill, color = C.ink, size = 13, bold = false) {
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, rectRadius: 0.06, fill: { color: fill }, line: { color: fill } });
  s.addText(text, { x: x + 0.08, y, w: w - 0.16, h, align: "center", valign: "middle", fontFace: BF, fontSize: size, bold, color, margin: 0, isTextBox: true });
}
function footnote(s, text) {
  s.addText(text, { x: 0.6, y: 6.95, w: 11.4, h: 0.35, fontFace: BF, fontSize: 10, italic: true, color: C.gray, margin: 0, isTextBox: true, valign: "middle" });
}

// 1 ─ Title
{
  const s = pres.addSlide(); n += 1;
  s.background = { color: C.teal };
  // graph motif
  const pts = [[9.6, 1.3], [11.2, 0.9], [12.3, 2.1], [10.6, 2.6], [11.8, 3.6], [9.9, 3.9]];
  const E = [[0, 1], [1, 2], [0, 3], [3, 2], [3, 4], [2, 4], [3, 5], [5, 4]];
  E.forEach(([a, b]) => { const [x1, y1] = pts[a], [x2, y2] = pts[b]; s.addShape(pres.shapes.LINE, { x: Math.min(x1, x2) + 0.2, y: Math.min(y1, y2) + 0.2, w: Math.abs(x2 - x1) || 0.01, h: Math.abs(y2 - y1) || 0.01, flipH: (x2 < x1) !== (y2 < y1), line: { color: "5E9C98", width: 1.5 } }); });
  pts.forEach(([x, y], i) => s.addShape(pres.shapes.OVAL, { x, y, w: 0.4, h: 0.4, fill: { color: [1, 3, 4].includes(i) ? C.amber : "A9CFCB" }, line: { color: C.teal, width: 2 } }));
  s.addText("GIAI ĐOẠN 2 · ĐỀ XUẤT VÀ KẾ HOẠCH", { x: 0.7, y: 1.2, w: 8, h: 0.4, fontFace: BF, fontSize: 14, bold: true, color: C.amber, charSpacing: 2, margin: 0, isTextBox: true });
  s.addText("GRAPES-GFN-Rec", { x: 0.7, y: 1.8, w: 8.5, h: 1.0, fontFace: HF, fontSize: 48, bold: true, color: C.white, margin: 0, isTextBox: true });
  s.addText("Học cách lấy mẫu đồ thị cho hệ gợi ý quy mô lớn dùng GNN", { x: 0.7, y: 2.85, w: 8.5, h: 1.0, fontFace: HF, fontSize: 24, color: "DCEBEA", margin: 0, isTextBox: true, valign: "top" });
  s.addText([
    { text: "Develop graph sampling for large-scale recommendation system using GNN", options: { italic: true, breakLine: true } },
    { text: "Dữ liệu: Amazon Reviews'23 Baby_Products · Backbone: LightGCN · Sampler: GRAPES + GFlowNet", options: {} },
  ], { x: 0.7, y: 4.4, w: 8.8, h: 0.9, fontFace: BF, fontSize: 14, color: "BFD8D5", margin: 0, isTextBox: true });
  s.addText("Trạng thái 16/09/2026: đã khóa thiết kế, đã có lõi code và oracle test. Chưa có kết quả thực nghiệm của phương pháp.", { x: 0.7, y: 6.3, w: 11, h: 0.5, fontFace: BF, fontSize: 13, color: C.white, margin: 0, isTextBox: true });
  s.addNotes("Mục tiêu buổi này: trình bày đúng bài toán giai đoạn 2, thiết kế phương pháp, cách đánh giá và khối lượng công việc. Không có kết quả phương pháp nào được trình bày vì chưa chạy.");
}

// 2 ─ Summary
{
  const s = base("Tóm tắt trong một slide", "Tổng quan");
  const items = [
    ["1", "Vấn đề", "GNN gợi ý (LightGCN) phải lan truyền qua hàng xóm nhiều bước. Trên graph user–item lớn, số node cần tính bùng nổ theo số layer → cần lấy mẫu đồ thị khi huấn luyện.", C.teal],
    ["2", "Đề xuất", "GRAPES-GFN-Rec: một GNN phụ học chọn node ngữ cảnh cho từng layer, được huấn luyện bằng GFlowNet (Trajectory Balance) với phần thưởng từ BPR ranking loss.", C.tealMid],
    ["3", "Đánh giá", "So với uniform, degree-importance, bản REINFORCE, Full LightGCN, MostPop, BPR-MF. Cùng graph, budget, seed, evaluator. NDCG@20, Recall@20, coverage, head/tail, thời gian, GPU.", C.amber],
    ["4", "Kế hoạch", "8 gate R0–R7. R0 (khóa scope) xong; R2 lõi code + 28 oracle test xong. Tiếp theo: development split, thí nghiệm development, freeze, holdout, báo cáo.", C.coral],
  ];
  items.forEach(([num, h, b, col], i) => {
    const x = 0.6 + (i % 2) * 6.15, y = 1.65 + Math.floor(i / 2) * 2.6;
    card(s, x, y, 5.95, 2.4, h, b, { num, numFill: col, bodySize: 17, headSize: 20 });
  });
  s.addNotes("Bốn ý chính. Nhấn mạnh: phương pháp là biến thể GRAPES có sampler học được, không phải heuristic cố định.");
}

// 3 ─ Neighbor explosion
{
  const s = base("Vì sao phải lấy mẫu: bùng nổ lân cận", "Bối cảnh");
  s.addText(bullets([
    "LightGCN tính embedding của user bằng cách cộng embedding hàng xóm qua L bước (L = 2–3).",
    "Mỗi bước nhân số node cần tính với bậc của node đi qua. Trên graph lệch long-tail, chỉ cần chạm một item phổ biến là kéo theo hàng nghìn user.",
    "Full-graph training vẫn chạy được ở quy mô Baby, nhưng chi phí tăng theo số cạnh × số layer: Home_and_Kitchen có 66,6 triệu dòng, graph thương mại điện tử thật còn lớn hơn.",
    "Lấy mẫu giới hạn số node mỗi layer (budget k), đổi lại model chỉ thấy một phần ngữ cảnh → chọn node nào là câu hỏi nghiên cứu.",
  ], 17), { x: 0.6, y: 1.6, w: 6.3, h: 5.0, fontFace: BF, margin: 0, isTextBox: true, valign: "top", paraSpaceAfter: 8 });
  // hop diagram with measured stats
  const stats = [
    ["1 user có trung bình", "1,67 item", "bậc user trung bình trong graph train", C.teal],
    ["Đi theo 1 cạnh tới item", "≈ 1.009 user", "bậc item kỳ vọng theo cạnh (Σd²/Σd), không phải 23,9", C.tealMid],
    ["Item lớn nhất", "21.348 user", "một hàng xóm duy nhất ở bước 1", C.amber],
    ["Nhiều triplet trong batch", "vùng lân cận hợp lại tăng rất nhanh", "kích thước thực tế sẽ đo ở R3", C.coral],
  ];
  stats.forEach(([a, b, c, col], i) => {
    const y = 1.6 + i * 1.22;
    node(s, 7.4, y + 0.15, String(i + 1), col, 0.55, 16);
    s.addText([{ text: a + ": ", options: { color: C.gray } }, { text: b, options: { bold: true, color: C.ink } }], { x: 8.15, y: y, w: 4.6, h: 0.45, fontFace: BF, fontSize: 18, margin: 0, isTextBox: true, valign: "middle" });
    s.addText(c, { x: 8.15, y: y + 0.45, w: 4.6, h: 0.35, fontFace: BF, fontSize: 12, color: C.gray, margin: 0, isTextBox: true });
    if (i < 3) arrow(s, 7.675, y + 0.72, 7.675, y + 1.35, C.grayLight);
  });
  footnote(s, "Số liệu tính từ training graph Baby P4: 3.868.654 cạnh, 2.318.308 user, 162.125 item (06_code/results/data_story/data_story_summary.json). Dòng cuối là ước lượng định tính.");
  s.addNotes("Giải thích bùng nổ lân cận bằng số thật của dữ liệu. Σd²/Σd là bậc trung bình của item khi đi theo một cạnh ngẫu nhiên — đó là thứ lan truyền thực sự gặp phải, lớn hơn nhiều so với bậc trung bình 23,9.");
}

// 4 ─ GRAPES phase 1
{
  const s = base("Giai đoạn 1: GRAPES học cách lấy mẫu", "Nền tảng");
  // flow diagram
  box(s, 0.6, 1.8, 2.2, 0.9, "Batch node mục tiêu", C.tealPale, C.ink, 14, true);
  box(s, 3.3, 1.8, 2.6, 0.9, "GCN_S chấm điểm hàng xóm", C.teal, C.white, 14, true);
  box(s, 6.4, 1.8, 2.4, 0.9, "Gumbel Top-k chọn k node", C.tealMid, C.white, 14, true);
  box(s, 9.3, 1.8, 3.4, 0.9, "GCN_C học trên subgraph đã chọn", C.teal, C.white, 14, true);
  arrow(s, 2.8, 2.25, 3.3, 2.25); arrow(s, 5.9, 2.25, 6.4, 2.25); arrow(s, 8.8, 2.25, 9.3, 2.25);
  box(s, 9.3, 3.3, 3.4, 0.8, "Loss phân loại (detach)", C.amberPale, C.ink, 14, true);
  arrow(s, 11.0, 2.7, 11.0, 3.3);
  box(s, 3.3, 3.3, 5.5, 0.8, "GFlowNet TB: (log Z + Σ log q + α·loss)² → cập nhật GCN_S, GCN_Z", C.amber, C.ink, 14, true);
  arrow(s, 9.3, 3.7, 8.8, 3.7); arrow(s, 4.6, 3.3, 4.6, 2.7);
  // results table
  const rows = [
    [{ text: "Tái hiện trên T4", options: { bold: true, color: C.white, fill: { color: C.teal } } }, { text: "GRAPES", options: { bold: true, color: C.white, fill: { color: C.teal } } }, { text: "Random", options: { bold: true, color: C.white, fill: { color: C.teal } } }, { text: "Thời gian GRAPES / Random", options: { bold: true, color: C.white, fill: { color: C.teal } } }],
    ["Cora (accuracy)", "0,8710", "0,8677", "56,3 s / 30,5 s"],
    ["Citeseer", "0,7857", "0,7900", "94,6 s / 56,0 s"],
    ["ogbn-arxiv", "0,6204", "0,6128", "11.114 s / 8.133 s"],
  ];
  s.addTable(rows, { x: 0.6, y: 4.55, w: 7.4, colW: [2.2, 1.4, 1.4, 2.4], fontFace: BF, fontSize: 13, color: C.ink, border: { type: "solid", pt: 0.5, color: C.grayLight }, rowH: 0.42 });
  s.addText(bullets([
    "Bài học 1: sampler học được có thể hơn random, nhưng lợi thế nhỏ và không đều giữa dataset.",
    "Bài học 2: sampler tốn thêm 37–85% thời gian → phải tính chi phí sampler vào trade-off.",
    "GRAPES mới đánh giá node classification; recommendation chỉ được nêu là hướng mở rộng.",
  ], 14), { x: 8.3, y: 4.5, w: 4.4, h: 2.3, fontFace: BF, margin: 0, isTextBox: true, valign: "top", paraSpaceAfter: 6 });
  footnote(s, "Nguồn: [1] GRAPES arXiv:2310.03399v3; kết quả tái hiện ThucTap2/GRAPES report/grapes_results.json.");
  s.addNotes("Đây là lý do tái hiện ở giai đoạn 1: kiểm tra cơ chế học sampler trước khi chuyển sang recommendation.");
}

// 5 ─ Gap: node classification vs recommendation
{
  const s = base("Không thể chép nguyên GRAPES sang gợi ý", "Khoảng trống");
  const head = (t) => ({ text: t, options: { bold: true, color: C.white, fill: { color: C.teal } } });
  const rows = [
    [head("Khía cạnh"), head("GRAPES gốc (node classification)"), head("GRAPES-GFN-Rec (recommendation)")],
    ["Đồ thị", "Node có feature, cạnh tổng quát", "Hai phía user–item, chỉ cạnh positive trước mốc thời gian"],
    ["Mục tiêu một batch", "Node có nhãn", "Triplet BPR (user, item mua, item âm); V⁰ = tập endpoint"],
    ["Feature cho sampler", "Feature node sẵn có", "Embedding ID riêng + loại node + degree train + lịch sử layer"],
    ["Model chính", "GCN phân loại", "Sampled LightGCN: không self-loop, không phi tuyến"],
    ["Tín hiệu thưởng", "Cross-entropy", "Mean BPR ranking loss (không gồm regularizer)"],
    ["Đánh giá", "Accuracy trên node", "Xếp hạng toàn catalog: NDCG@20, Recall@20, coverage, head/tail"],
    ["Rò rỉ dữ liệu", "Split node cố định", "Split theo thời gian; cạnh tương lai không được vào graph, degree, feature"],
  ];
  s.addTable(rows, { x: 0.6, y: 1.6, w: 12.1, colW: [2.3, 4.2, 5.6], fontFace: BF, fontSize: 16, color: C.ink, border: { type: "solid", pt: 0.5, color: C.grayLight }, rowH: 0.64, fill: { color: C.white } });
  footnote(s, "Chi tiết từng quyết định: 02_protocol/GRAPES_RECOMMENDATION_SPEC_vn.md (D1–D11). Đây là adaptation của đồ án, không phải kết quả paper GRAPES đã chứng minh.");
  s.addNotes("Nhấn mạnh phần thay thế: target, feature, loss, evaluation, leakage đều khác.");
}

// 6 ─ Lesson from pilot
{
  const s = base("Rà soát hướng đi: vì sao phải xây lại", "Điều chỉnh");
  s.addText("Pilot M0–M2 trước đây chỉ so sánh ba luật chọn node cố định. M2 (frontier-normalized) mượn hình thức của GRAPES nhưng thiếu phần cốt lõi: học sampler.", { x: 0.6, y: 1.55, w: 12.1, h: 0.8, fontFace: BF, fontSize: 16, color: C.ink, margin: 0, isTextBox: true });
  const checks = [
    ["G1", "Policy có tham số (GCN_S)"], ["G2", "Gumbel Top-k exact-k"], ["G3", "Log-likelihood trajectory log q"], ["G4", "Tín hiệu từ loss gợi ý (detach)"],
    ["G5", "log Z(V⁰) học được"], ["G6", "Mục tiêu TB / REINFORCE"], ["G7", "Sampler thực sự được cập nhật"],
  ];
  const m2 = [false, true, false, false, false, false, false];
  checks.forEach(([id, t], i) => {
    const col = i % 4, row = Math.floor(i / 4);
    const x = 0.6 + col * 3.05, y = 2.6 + row * 1.35;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w: 2.85, h: 1.15, rectRadius: 0.08, fill: { color: C.slate }, line: { color: C.slate } });
    node(s, x + 0.15, y + 0.15, id, C.teal, 0.5, 12);
    s.addText(t, { x: x + 0.75, y: y + 0.1, w: 2.0, h: 0.6, fontFace: BF, fontSize: 13, bold: true, color: C.ink, margin: 0, isTextBox: true, valign: "middle" });
    s.addText(m2[i] ? "M2: có" : "M2: không có", { x: x + 0.75, y: y + 0.7, w: 2.0, h: 0.35, fontFace: BF, fontSize: 12, bold: true, color: m2[i] ? C.tealMid : C.coral, margin: 0, isTextBox: true });
  });
  card(s, 9.75, 3.95, 2.95, 1.15, "GRAPES-GFN-Rec", "Đủ G1–G7, có oracle test cho từng mục", { fill: C.amberPale, headSize: 14, bodySize: 12 });
  s.addText(bullets([
    "Pilot vẫn có ích: kiểm chứng dữ liệu, evaluator, và cho hai bài học về budget (chỉ ~300 bước tối ưu) và backbone yếu (Full LightGCN NDCG@20 0,0049 < MostPop 0,0059).",
    "Pilot được lưu trữ ở phụ lục, không dùng làm kết luận hay để chọn cấu hình cho phương pháp mới.",
  ], 14), { x: 0.6, y: 5.45, w: 12.1, h: 1.3, fontFace: BF, margin: 0, isTextBox: true, valign: "top", paraSpaceAfter: 6 });
  s.addNotes("Minh bạch với cô: đã phát hiện lệch scope và ghi vào decision log DL-001. Checklist G1–G7 là định nghĩa thế nào mới là biến thể GRAPES.");
}

// 7 ─ Dataset choice
{
  const s = base("Chọn dữ liệu: Amazon Reviews'23, Baby_Products", "Dữ liệu");
  s.addChart(pres.charts.BAR, [{ name: "Số dòng raw (triệu)", labels: ["All_Beauty", "Baby_Products", "Home_and_Kitchen"], values: [0.69, 5.95, 66.62] }], {
    x: 0.6, y: 1.6, w: 6.0, h: 4.9, barDir: "bar", chartColors: [C.tealMid], showValue: true, dataLabelFormatCode: "0.00", dataLabelColor: C.ink, dataLabelFontSize: 12,
    catAxisLabelColor: C.ink, catAxisLabelFontSize: 13, valAxisHidden: true, valGridLine: { style: "none" }, catGridLine: { style: "none" },
    showTitle: true, title: "Số dòng rating raw (triệu)", titleFontSize: 14, titleColor: C.ink, showLegend: false,
  });
  card(s, 6.9, 1.6, 5.8, 1.45, "All_Beauty — kiểm tra pipeline", "0,69 triệu dòng. Quá nhỏ; chỉ 3,98% target validation còn warm-start.", { bodySize: 13 });
  card(s, 6.9, 3.2, 5.8, 1.75, "Baby_Products — dữ liệu chính", "5,95 triệu dòng, 3,39 triệu user, 217.654 item. Đủ lớn để thấy chi phí sampling, long-tail rõ, vẫn chạy được ma trận thí nghiệm trên Colab T4.", { fill: C.amberPale, bodySize: 13 });
  card(s, 6.9, 5.1, 5.8, 1.45, "Home_and_Kitchen — tham chiếu quy mô", "66,6 triệu dòng (11,2 lần Baby). Dành cho stress test sau khi có kết quả Baby.", { bodySize: 13 });
  footnote(s, "Đã cân nhắc MovieLens 25M, Gowalla, Yelp2018, MIND, KuaiRec: phù hợp câu hỏi khác (nội dung, exposure, split ngẫu nhiên) — dùng làm bối cảnh, chưa chạy.");
  s.addNotes("Amazon có nhiều danh mục, lượng giao dịch lớn, có metadata sản phẩm nếu sau này cần đo ngữ nghĩa.");
}

// 8 ─ Data analysis
{
  const s = base("Phân tích dữ liệu: nhiễu, mất cân bằng, long-tail", "Dữ liệu");
  s.addChart(pres.charts.BAR, [{ name: "Số rating", labels: ["1★", "2★", "3★", "4★", "5★"], values: [555424, 309591, 433032, 681977, 3973866] }], {
    x: 0.5, y: 1.55, w: 4.1, h: 2.75, chartColors: [C.grayLight, C.grayLight, C.grayLight, C.amber, C.amber], showValue: false,
    catAxisLabelColor: C.ink, valAxisLabelColor: C.gray, valAxisLabelFormatCode: "#,##0,\"k\"", valGridLine: { color: "E3E8E8", size: 0.5 }, catGridLine: { style: "none" },
    showTitle: true, title: "Phân bố rating (P4 = 4–5★ là positive)", titleFontSize: 12, titleColor: C.ink, showLegend: false,
  });
  s.addChart(pres.charts.BAR, [{ name: "Tỷ lệ interaction", labels: ["Top 1%", "Top 5%", "Top 10%", "Top 20%"], values: [44.1, 71.1, 81.3, 89.6] }], {
    x: 0.5, y: 4.35, w: 4.1, h: 2.5, chartColors: [C.teal], showValue: true, dataLabelFormatCode: "0.0\"%\"", dataLabelFontSize: 11, dataLabelColor: C.ink,
    catAxisLabelColor: C.ink, valAxisHidden: true, valGridLine: { style: "none" }, catGridLine: { style: "none" },
    showTitle: true, title: "Item phổ biến nhất giữ bao nhiêu interaction", titleFontSize: 12, titleColor: C.ink, showLegend: false,
  });
  s.addImage({ path: path.join(__dirname, "../06_code/results/data_story/02_degree_long_tail.png"), x: 4.8, y: 1.55, w: 4.5, h: 2.87 });
  const stats = [["71,76%", "user train chỉ có 1 interaction"], ["0,8584", "Gini bậc item"], ["1 dòng", "rating 0.0 ngoài miền → loại"], ["0", "dòng trùng, thiếu ID, sai timestamp"]];
  stats.forEach(([v, l], i) => {
    const x = 4.8 + (i % 2) * 2.3, y = 4.6 + Math.floor(i / 2) * 1.15;
    s.addText(v, { x, y, w: 2.2, h: 0.55, fontFace: HF, fontSize: 26, bold: true, color: i < 2 ? C.coral : C.tealMid, margin: 0, isTextBox: true });
    s.addText(l, { x, y: y + 0.55, w: 2.2, h: 0.45, fontFace: BF, fontSize: 11, color: C.gray, margin: 0, isTextBox: true, valign: "top" });
  });
  card(s, 9.55, 1.55, 3.2, 5.3, "Hệ quả cho thiết kế", "", { fill: C.amberPale });
  s.addText(bullets([
    "Nhiễu thấp: chỉ loại 1 dòng; không lọc k-core để không làm mất long-tail thật.",
    "Mất cân bằng mạnh → score tổng có thể tăng chỉ nhờ item phổ biến. Phải báo exposure/hit theo head–body–tail.",
    "User gần như không có ngữ cảnh riêng → lựa chọn sampler có ý nghĩa chủ yếu ở layer đi qua item.",
    "Sampler học được có thể dồn về hub → theo dõi bậc/nhóm của node được chọn.",
  ], 13), { x: 9.75, y: 2.15, w: 2.85, h: 4.6, fontFace: BF, margin: 0, isTextBox: true, valign: "top", paraSpaceAfter: 6 });
  s.addNotes("Trả lời feedback của cô: bao nhiêu sản phẩm, histogram, mất cân bằng, nhiễu và có nên loại bỏ không.");
}

// 9 ─ Data path
{
  const s = base("Đường đi dữ liệu và chia theo thời gian", "Protocol");
  const steps = [["Raw CSV", "5,95 tr dòng\nkiểm SHA-256"], ["Audit", "schema, trùng,\nnhiễu, rating"], ["P4", "4–5★ → positive\n4,66 tr dòng"], ["Chia thời gian", "t0 < t1 < t2"], ["Graph train", "chỉ cạnh quá khứ\nmapping ID"], ["Train + đánh giá", "sampled train,\nfull-graph rank"]];
  steps.forEach(([h, b], i) => {
    const x = 0.6 + i * 2.07;
    box(s, x, 1.65, 1.8, 0.55, h, i === 3 ? C.amber : C.teal, i === 3 ? C.ink : C.white, 14, true);
    s.addText(b, { x, y: 2.25, w: 1.8, h: 0.7, fontFace: BF, fontSize: 12, color: C.gray, align: "center", margin: 0, isTextBox: true, valign: "top" });
    if (i < 5) arrow(s, x + 1.8, 1.925, x + 2.07, 1.925);
  });
  // timeline
  const y = 3.75;
  s.addShape(pres.shapes.LINE, { x: 0.8, y, w: 11.7, h: 0, line: { color: C.ink, width: 2 } });
  const seg = [[0.8, 5.6, "G_dev_train: phát triển phương pháp", C.tealPale], [5.6, 7.9, "D_dev: chọn cấu hình", C.tealMid], [7.9, 10.2, "Validation: holdout sau freeze", C.amber], [10.2, 12.5, "Test: chưa đọc", C.coral]];
  seg.forEach(([a, b, t, col], i) => {
    s.addShape(pres.shapes.RECTANGLE, { x: a, y: y + 0.15, w: b - a, h: 0.55, fill: { color: col }, line: { color: C.white, width: 1 } });
    s.addText(t, { x: a + 0.05, y: y + 0.15, w: b - a - 0.1, h: 0.55, fontFace: BF, fontSize: 12, bold: true, color: i === 0 ? C.ink : (i === 2 ? C.ink : C.white), align: "center", valign: "middle", margin: 0, isTextBox: true });
  });
  [[5.6, "t0 = t1 − (t2 − t1)"], [7.9, "t1 (2021-08-11)"], [10.2, "t2 (2022-07-16)"]].forEach(([x, t]) => {
    s.addShape(pres.shapes.LINE, { x, y: y - 0.3, w: 0, h: 0.45, line: { color: C.ink, width: 1.5 } });
    s.addText(t, { x: x - 1.2, y: y - 0.7, w: 2.4, h: 0.35, fontFace: BF, fontSize: 12, color: C.ink, align: "center", margin: 0, isTextBox: true });
  });
  s.addText(bullets([
    "Graph train hiện tại: 3.868.654 cạnh, 2.318.308 user, 162.125 item. Validation 81.871 target warm-start; test 40.587 (chưa đọc).",
    "Validation đã bị pilot nhìn thấy → mọi điều chỉnh phương pháp chỉ dùng development split mới, cùng độ dài với cửa sổ validation.",
    "Cạnh tương lai không được vào graph, degree, candidate, feature sampler, normalization hay hàm mục tiêu.",
  ], 16), { x: 0.6, y: 4.85, w: 12.1, h: 1.9, fontFace: BF, margin: 0, isTextBox: true, valign: "top", paraSpaceAfter: 6 });
  s.addNotes("t1 = 1628643414042 ms, t2 = 1658002729837 ms. Quy tắc t0 đã đăng ký trước, có quy tắc dự phòng nếu D_dev quá nhỏ.");
}

// 10 ─ Architecture
{
  const s = base("Kiến trúc tổng thể GRAPES-GFN-Rec", "Phương pháp");
  // lane labels
  s.addText("Huấn luyện một bước", { x: 0.6, y: 1.5, w: 4, h: 0.35, fontFace: BF, fontSize: 13, bold: true, color: C.tealMid, margin: 0, isTextBox: true });
  box(s, 0.6, 2.0, 2.0, 0.95, "Batch BPR\n(u, i⁺, i⁻)", C.tealPale, C.ink, 13, true);
  box(s, 3.0, 2.0, 2.3, 0.95, "V⁰ = user, item mua,\nitem âm", C.tealPale, C.ink, 13, true);
  box(s, 5.7, 2.0, 3.0, 0.95, "Sampler GCN_S\nchọn k node / layer (Gumbel Top-k)", C.teal, C.white, 13, true);
  box(s, 9.1, 2.0, 3.6, 0.95, "Sampled LightGCN\ntrên K¹…K^L", C.teal, C.white, 13, true);
  arrow(s, 2.6, 2.475, 3.0, 2.475); arrow(s, 5.3, 2.475, 5.7, 2.475); arrow(s, 8.7, 2.475, 9.1, 2.475);
  box(s, 9.1, 3.45, 3.6, 0.8, "BPR loss → cập nhật Θ_R", C.amberPale, C.ink, 13, true);
  arrow(s, 10.9, 2.95, 10.9, 3.45);
  box(s, 5.7, 3.45, 3.0, 0.8, "log q (tổng các layer)", C.slate, C.ink, 13, true);
  arrow(s, 7.2, 2.95, 7.2, 3.45);
  box(s, 3.0, 3.45, 2.3, 0.8, "GCN_Z → log Z(V⁰)", C.slate, C.ink, 13, true);
  arrow(s, 4.15, 2.95, 4.15, 3.45);
  box(s, 3.0, 4.7, 9.7, 0.85, "Trajectory Balance: (log Z + log q + α · BPR đã detach)²  →  cập nhật Θ_S ∪ Θ_Z", C.amber, C.ink, 14, true);
  arrow(s, 4.15, 4.25, 4.15, 4.7); arrow(s, 7.2, 4.25, 7.2, 4.7); arrow(s, 10.9, 4.25, 10.9, 4.7);
  s.addText("Suy luận", { x: 0.6, y: 5.85, w: 4, h: 0.35, fontFace: BF, fontSize: 13, bold: true, color: C.tealMid, margin: 0, isTextBox: true });
  box(s, 0.6, 6.25, 12.1, 0.6, "Không lấy mẫu: LightGCN trên toàn bộ graph train → xếp hạng toàn catalog → NDCG@20, Recall@20, coverage, head/tail", C.tealPale, C.ink, 13, true);
  s.addText("Sampler không nhận gradient BPR; recommender không nhận gradient TB (đã có test kiểm chứng).", { x: 0.6, y: 3.45, w: 2.2, h: 1.1, fontFace: BF, fontSize: 11, italic: true, color: C.gray, margin: 0, isTextBox: true, valign: "top" });
  s.addNotes("Đây là khung kiến trúc chung: có thể thay backbone (LightGCN → NGCF/SGL) hoặc thay loss mà không đổi phần sampler. Trong triển khai thực tế, sampler chỉ dùng lúc train; serving dùng embedding đã học.");
}

// 11 ─ One sampling step
{
  const s = base("Một bước lấy mẫu trong layer l", "Phương pháp");
  const steps = [
    ["Ứng viên", "C^l = hàng xóm của K^(l−1) trong graph train, trừ chính K^(l−1)."],
    ["Feature", "Embedding ID riêng của sampler, loại user/item, log(1 + degree train) chuẩn hóa, cờ đã thuộc V⁰…V^(l−1)."],
    ["Chấm điểm", "GCN_S hai lớp trên subgraph K^(l−1) ∪ C^l → logit, xác suất p = σ(logit)."],
    ["Chọn", "Gumbel Top-k trên log p: chọn đúng min(k, |C^l|) node, không trùng."],
    ["Xác suất", "log q_l = Σ chọn log p + Σ không chọn log(1 − p)."],
    ["Trạng thái", "K^l = V⁰ ∪ V^l (không cộng dồn; node có thể quay lại ở layer sau)."],
  ];
  steps.forEach(([h, b], i) => {
    const y = 1.6 + i * 0.86;
    node(s, 0.6, y + 0.08, String(i + 1), i === 3 ? C.amber : C.teal, 0.52, 15);
    s.addText(h, { x: 1.3, y, w: 1.7, h: 0.68, fontFace: BF, fontSize: 16, bold: true, color: C.ink, margin: 0, isTextBox: true, valign: "middle" });
    s.addText(b, { x: 3.0, y, w: 5.1, h: 0.68, fontFace: BF, fontSize: 13, color: C.ink, margin: 0, isTextBox: true, valign: "middle" });
  });
  card(s, 8.5, 1.6, 4.2, 2.35, "Ba sampler, một đường code", "Learned: điểm từ GCN_S, có log q.\nUniform (M0): điểm bằng nhau.\nDegree (M1): điểm = log(degree).\nKhác nhau duy nhất ở cách tính điểm → so sánh công bằng.", { fill: C.tealPale, bodySize: 13 });
  card(s, 8.5, 4.15, 4.2, 2.6, "Giới hạn đã chứng minh bằng test", "Vì K^l không cộng dồn, khi V⁰ có cả user lẫn item, một số node ở bước 1 bị rơi khỏi bước 2 → không tương đương Full LightGCN kể cả khi lấy hết. Đây là tính chất kế thừa từ GRAPES, sẽ nêu trong báo cáo.", { fill: C.coralPale, bodySize: 13 });
  s.addNotes("Công thức log q theo paper dùng cả node không chọn; code GRAPES chính thức chỉ cộng node được chọn — sai khác đã ghi nhận.");
}

// 12 ─ Objectives
{
  const s = base("Hàm mục tiêu và phân quyền tham số", "Phương pháp");
  card(s, 0.6, 1.6, 5.95, 2.4, "Recommender (Θ_R)", "L_BPR = − mean log σ( z_u·z_i⁺ − z_u·z_i⁻ )\nL_model = L_BPR + λ · ‖e⁰‖²\nOptimizer riêng; chỉ nhận gradient từ L_model.", { fill: C.tealPale, bodySize: 15, headSize: 18 });
  card(s, 6.75, 1.6, 5.95, 2.4, "Sampler (Θ_S ∪ Θ_Z)", "L_TB = ( log Z(V⁰) + Σ_l log q_l + α · stopgrad(L_BPR) )²\nPhần thưởng R = exp(−α · L_BPR)\nAdam riêng; không gradient qua Top-k.", { fill: C.amberPale, bodySize: 15, headSize: 18 });
  s.addText("Ý nghĩa: trajectory (tập node được chọn) làm BPR loss thấp hơn sẽ có xác suất cao hơn, tỷ lệ với phần thưởng.", { x: 0.6, y: 4.2, w: 12.1, h: 0.5, fontFace: BF, fontSize: 15, italic: true, color: C.tealMid, margin: 0, isTextBox: true });
  const tests = [["28", "oracle test pass (PyTorch CPU)"], ["4/4", "lỗi cài cố ý bị test bắt"], ["T20", "TB không chạm Θ_R; BPR không chạm Θ_S"], ["G7", "tham số sampler thay đổi sau 1 bước"]];
  tests.forEach(([v, l], i) => {
    const x = 0.6 + i * 3.05;
    s.addText(v, { x, y: 4.95, w: 2.8, h: 0.8, fontFace: HF, fontSize: 36, bold: true, color: C.teal, margin: 0, isTextBox: true });
    s.addText(l, { x, y: 5.75, w: 2.8, h: 0.6, fontFace: BF, fontSize: 13, color: C.gray, margin: 0, isTextBox: true, valign: "top" });
  });
  footnote(s, "Lỗi cài cố ý: bỏ detach trong TB, bỏ số hạng node không chọn trong log q, cộng dồn K^l, sai dấu REINFORCE. Ablation: GRAPES-RL-Rec dùng L = stopgrad(L_BPR) · log q.");
  s.addNotes("TB theo Malkin et al. 2022 [3]. α và log_z_init sẽ quét trên development split — GRAPES gốc dùng α từ 10³ đến 10⁵.");
}

// 13 ─ Recommendation-specific issues
{
  const s = base("Những điểm riêng của bài toán gợi ý phải xử lý", "Rủi ro kỹ thuật");
  const items = [
    ["R-1", "Quá ít phần thưởng", "Pilot: batch 65.536 × 5 epoch ≈ 300 bước → sampler chỉ học từ ~300 số. Chọn lại batch/budget chung cho mọi sampler."],
    ["R-2", "Thang phần thưởng", "BPR ≈ 0,69 và chênh lệch nhỏ; α quá nhỏ thì log q lấn át. Quét α, log_z_init trên D_dev, log từng thành phần."],
    ["R-3", "Phần thưởng thay đổi", "Recommender học thêm thì cùng trajectory cho loss khác. Giữ như GRAPES, ghi log drift."],
    ["R-4", "Graph cực thưa", "71,76% user có 1 cạnh; theo dõi bậc/loại/nhóm node được chọn để phát hiện dồn về hub."],
    ["R-5", "Chi phí sampler", "Embedding cho 2,48 triệu node + GCN_S có thể đắt hơn LightGCN. Tính cả sampler vào chi phí; có ngưỡng khả thi T4."],
    ["R-6", "Backbone yếu", "Full LightGCN phải vượt MostPop trên D_dev trước khi so sánh sampler."],
  ];
  items.forEach(([id, h, b], i) => {
    const x = 0.6 + (i % 3) * 4.1, y = 1.6 + Math.floor(i / 3) * 2.65;
    card(s, x, y, 3.9, 2.45, h, b, { num: id, numFill: i === 0 || i === 5 ? C.coral : C.teal, headSize: 17, bodySize: 15 });
  });
  footnote(s, "Thêm: R-7 item âm cũng là mục tiêu của sampler; R-8 cạnh positive của batch có thể rò qua propagation → ablation che cạnh tạm thời (D9).");
  s.addNotes("Đây là phần suy nghĩ sâu về vì sao không port nguyên xi. Mỗi rủi ro gắn với một gate đo được.");
}

// 14 ─ Comparators
{
  const s = base("So sánh với các phương pháp khác", "Đánh giá");
  const head = (t) => ({ text: t, options: { bold: true, color: C.white, fill: { color: C.teal } } });
  const tierA = { fill: { color: C.tealPale } }, tierB = { fill: { color: C.white } }, tierC = { fill: { color: C.slate } };
  const r = (cells, o) => cells.map((t) => ({ text: t, options: o }));
  const rows = [
    [head("Tầng"), head("Phương pháp"), head("Vai trò"), head("Câu hỏi trả lời")],
    r(["A · cùng budget", "GRAPES-GFN-Rec", "Phương pháp đề xuất", "—"], { ...tierA, bold: true }),
    r(["A · cùng budget", "M0 Uniform", "Đối chứng trung lập", "Học có hơn chọn ngẫu nhiên?"], tierA),
    r(["A · cùng budget", "M1 Degree-importance", "Đối chứng tĩnh mạnh (họ FastGCN/LADIES)", "Học có hơn ưu tiên node phổ biến?"], tierA),
    r(["A · cùng budget", "GRAPES-RL-Rec", "Ablation hàm mục tiêu", "GFlowNet TB có cần hơn REINFORCE?"], tierA),
    r(["B · tham chiếu", "Full LightGCN", "Không lấy mẫu", "Lấy mẫu mất bao nhiêu chất lượng?"], tierB),
    r(["B · tham chiếu", "MostPop, BPR-MF", "Sanity", "Graph và propagation có giá trị?"], tierB),
    r(["C · tùy chọn", "GraphSAGE fan-out", "Lấy mẫu theo từng node", "Layer-wise học được vs node-wise?"], tierC),
    r(["Phụ lục", "M2 frontier (pilot)", "Lịch sử", "Không nằm trong so sánh chính"], tierC),
  ];
  s.addTable(rows, { x: 0.6, y: 1.6, w: 12.1, colW: [1.9, 2.8, 3.7, 3.7], fontFace: BF, fontSize: 15, color: C.ink, border: { type: "solid", pt: 0.5, color: C.grayLight }, rowH: 0.56 });
  footnote(s, "Tầng A chạy lại toàn bộ trên budget mới, cùng graph, thứ tự triplet, negative, khởi tạo, seed, evaluator, GPU. Số liệu M0/M1 pilot không được dùng lại.");
  s.addNotes("Tầng C cần cô góp ý (OD-1).");
}

// 15 ─ Metrics
{
  const s = base("Đo gì và vì sao", "Đánh giá");
  const cols = [
    ["Chất lượng xếp hạng", C.teal, ["NDCG@20 (chính): item đúng ở vị trí cao được tính nhiều hơn", "Recall@20: item đúng có vào top-20", "Δ NDCG@20 ghép cặp theo seed"]],
    ["Phân bổ & đa dạng", C.tealMid, ["Catalog Coverage@20", "Exposure và hit theo head / body / tail", "Gini exposure"]],
    ["Chi phí (trade-off)", C.amber, ["Thời gian sampler, TB, propagation, epoch", "Peak GPU memory", "Số node / cạnh thực tế mỗi layer"]],
    ["Hành vi sampler", C.coral, ["Bậc, loại, nhóm của node được chọn", "Entropy, p_min / p_max", "Có dồn về hub không (RQ3)"]],
  ];
  cols.forEach(([h, col, items], i) => {
    const x = 0.6 + i * 3.05;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y: 1.6, w: 2.85, h: 3.6, rectRadius: 0.08, fill: { color: C.slate }, line: { color: C.slate } });
    node(s, x + 0.2, 1.8, String(i + 1), col, 0.48, 14);
    s.addText(h, { x: x + 0.8, y: 1.75, w: 1.95, h: 0.6, fontFace: BF, fontSize: 15, bold: true, color: C.ink, margin: 0, isTextBox: true, valign: "middle" });
    s.addText(bullets(items, 14.5), { x: x + 0.2, y: 2.55, w: 2.5, h: 2.5, fontFace: BF, margin: 0, isTextBox: true, valign: "top", paraSpaceAfter: 6 });
  });
  card(s, 0.6, 5.4, 12.1, 1.35, "Mức khớp ngữ nghĩa và đa dạng sản phẩm (theo góp ý của cô)", "Dữ liệu hiện tại chỉ có ID, rating, thời gian nên chưa đo được. Có thể nối metadata Amazon (title, category) để đo đa dạng theo danh mục như một phân tích phụ — cần cô quyết định (OD-2). Conversion không đo được vì dữ liệu offline không có log hiển thị.", { fill: C.amberPale, bodySize: 13 });
  s.addNotes("Kết luận được phép: chỉ nói GRAPES-GFN-Rec cải thiện nếu Δ NDCG@20 > 0 ở mọi seed holdout và chi phí được báo đủ.");
}

// 16 ─ Plan
{
  const s = base("Kế hoạch triển khai giai đoạn 2", "Kế hoạch");
  const gates = [
    ["R0", "Khóa scope, spec, decision log, checker", "Xong", 0.5, C.tealMid],
    ["R2", "Code sampler, Sampled LightGCN, TB + oracle test", "Lõi xong", 1.0, C.tealMid],
    ["R1", "Development split, manifest, hash (Colab)", "Tiếp theo", 0.5, C.amber],
    ["R3", "Backbone đủ tốt · chọn budget · quét α, lr · khả thi T4", "", 3.0, C.teal],
    ["R4", "Freeze cấu hình, seed, evaluator; chốt OD-1…OD-4", "", 0.5, C.teal],
    ["R5", "Chạy so sánh ghép cặp trên holdout (7 phương pháp × seed)", "", 2.0, C.teal],
    ["R6", "Phân tích RQ1–RQ4, ablation, lỗi", "", 1.0, C.teal],
    ["R7", "Viết báo cáo, slide, README; pilot vào phụ lục", "", 1.5, C.teal],
  ];
  const x0 = 5.6, scale = 0.72; // inches per week
  let acc = 0;
  s.addText("Tuần (ước lượng)", { x: x0, y: 1.45, w: 4, h: 0.3, fontFace: BF, fontSize: 11, color: C.gray, margin: 0, isTextBox: true });
  for (let wk = 0; wk <= 10; wk++) {
    s.addShape(pres.shapes.LINE, { x: x0 + wk * scale, y: 1.8, w: 0, h: 4.95, line: { color: "E3E8E8", width: 0.75 } });
    s.addText(String(wk), { x: x0 + wk * scale - 0.2, y: 6.75, w: 0.4, h: 0.25, fontFace: BF, fontSize: 10, color: C.gray, align: "center", margin: 0, isTextBox: true });
  }
  gates.forEach(([id, t, st, wks, col], i) => {
    const y = 1.85 + i * 0.61;
    node(s, 0.6, y + 0.04, id, col, 0.45, 11);
    s.addText(t, { x: 1.15, y, w: 4.3, h: 0.53, fontFace: BF, fontSize: 12.5, color: C.ink, margin: 0, isTextBox: true, valign: "middle" });
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: x0 + acc * scale, y: y + 0.08, w: wks * scale, h: 0.37, rectRadius: 0.05, fill: { color: col }, line: { color: col } });
    if (st) s.addText(st, { x: x0 + (acc + wks) * scale + 0.08, y: y + 0.05, w: 1.4, h: 0.43, fontFace: BF, fontSize: 11, bold: true, color: col, margin: 0, isTextBox: true, valign: "middle" });
    acc += wks;
  });
  footnote(s, "Tổng ước lượng ~10 tuần; sẽ chỉnh lại sau R3 khi đo được thời gian chạy thực tế. Không qua gate bằng cách viết claim — gate fail được ghi lý do vào decision log.");
  s.addNotes("Thể hiện khối lượng công việc giai đoạn 2 theo từng bước, có tiêu chí qua gate rõ ràng.");
}

// 17 ─ Risks
{
  const s = base("Rủi ro và phương án dự phòng", "Kế hoạch");
  const head = (t) => ({ text: t, options: { bold: true, color: C.white, fill: { color: C.teal } } });
  const rows = [
    [head("Rủi ro"), head("Dấu hiệu"), head("Phương án")],
    ["Sampler không học được", "‖ΔΘ_S‖ ≈ 0, phân phối chọn giống M0", "Tăng số bước/giảm batch, quét α; nếu vẫn không học → báo kết quả âm có phân tích"],
    ["Hết bộ nhớ T4", "OOM khi embedding 2,48 tr node + GCN_S", "Embedding thưa, giảm chiều sampler, chỉ chạy GCN_S trên ứng viên"],
    ["Sampler quá chậm", "Thời gian sampler > ngưỡng đăng ký", "Giảm độ rộng GCN_S, lấy mẫu ứng viên trước khi chấm điểm"],
    ["Backbone vẫn yếu", "Full LightGCN ≤ MostPop trên D_dev", "Tăng epoch trong grid; nếu fail ghi decision log trước khi đi tiếp"],
    ["Dồn về item phổ biến", "Node chọn toàn head, tail hit = 0", "Báo cáo RQ3; không đổi method sau holdout"],
    ["Kết quả không vượt đối chứng", "Δ NDCG@20 ≤ 0", "Kết quả âm hợp lệ; phân tích nguyên nhân R-1…R-6"],
  ];
  s.addTable(rows, { x: 0.6, y: 1.6, w: 12.1, colW: [3.0, 4.0, 5.1], fontFace: BF, fontSize: 15.5, color: C.ink, border: { type: "solid", pt: 0.5, color: C.grayLight }, rowH: 0.74, fill: { color: C.white } });
  s.addNotes("Quy tắc: kết quả âm vẫn là kết quả; không dùng test để chọn method.");
}

// 18 ─ Summary & asks
{
  const s = pres.addSlide(); n += 1;
  s.background = { color: C.teal };
  s.addText("Tổng kết", { x: 0.6, y: 0.5, w: 8, h: 0.8, fontFace: HF, fontSize: 36, bold: true, color: C.white, margin: 0, isTextBox: true });
  const colsT = [
    ["Đã đạt được", ["Kiểm toán 3 dataset Amazon, chọn Baby_Products có lý do", "Protocol thời gian, evaluator toàn catalog", "Rà soát và khóa lại scope (DL-001), checklist G1–G7", "Thiết kế GRAPES-GFN-Rec cho gợi ý + lõi code, 28 oracle test"]],
    ["Sẽ làm", ["Development split và thí nghiệm development (R1, R3)", "Freeze rồi so sánh ghép cặp 7 phương pháp (R4, R5)", "Phân tích chất lượng – chi phí – hành vi sampler (R6)", "Báo cáo cuối từ bằng chứng holdout (R7)"]],
    ["Xin ý kiến cô", ["OD-1: thêm GraphSAGE fan-out làm đối chứng?", "OD-2: nối metadata để đo đa dạng / ngữ nghĩa?", "OD-3: lưới budget (1 chính + 1 chặt)?", "OD-4: số seed (đề xuất 3)?"]],
  ];
  colsT.forEach(([h, items], i) => {
    const x = 0.6 + i * 4.1;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y: 1.6, w: 3.9, h: 5.1, rectRadius: 0.08, fill: { color: i === 2 ? C.amber : "1C5E61" }, line: { color: i === 2 ? C.amber : "1C5E61" } });
    s.addText(h, { x: x + 0.25, y: 1.8, w: 3.4, h: 0.55, fontFace: HF, fontSize: 20, bold: true, color: i === 2 ? C.ink : C.white, margin: 0, isTextBox: true });
    s.addText(bullets(items, 17, i === 2 ? C.ink : C.white), { x: x + 0.25, y: 2.5, w: 3.4, h: 4.0, fontFace: BF, margin: 0, isTextBox: true, valign: "top", paraSpaceAfter: 10 });
  });
  s.addText(String(n), { x: 12.3, y: 7.0, w: 0.5, h: 0.3, fontFace: BF, fontSize: 10, color: "BFD8D5", align: "right", margin: 0, isTextBox: true });
  s.addNotes("Kết thúc bằng những quyết định cần cô góp ý trước gate R4.");
}

// 19 ─ References
{
  const s = base("Tài liệu tham khảo", "Nguồn");
  const refs = [
    "[1] T. Younesian et al. GRAPES: Learning to Sample Graphs for Scalable Graph Neural Networks. arXiv:2310.03399v3. Code: github.com/dfdazac/grapes (commit 71ecebe).",
    "[2] X. He et al. LightGCN: Simplifying and Powering Graph Convolution Network for Recommendation. SIGIR 2020. arXiv:2002.02126.",
    "[3] N. Malkin et al. Trajectory Balance: Improved Credit Assignment in GFlowNets. NeurIPS 2022. arXiv:2201.13259.",
    "[4] S. Rendle et al. BPR: Bayesian Personalized Ranking from Implicit Feedback. UAI 2009. arXiv:1205.2618.",
    "[5] W. Kool et al. Stochastic Beams and Where to Find Them: The Gumbel-Top-k Trick. ICML 2019. arXiv:1903.06059.",
    "[6] J. Chen et al. FastGCN: Fast Learning with Graph Convolutional Networks via Importance Sampling. ICLR 2018. arXiv:1801.10247.",
    "[7] D. Zou et al. Layer-Dependent Importance Sampling for Training Deep and Large Graph Convolutional Networks (LADIES). NeurIPS 2019. arXiv:1911.07323.",
    "[8] W. Hamilton et al. Inductive Representation Learning on Large Graphs (GraphSAGE). NeurIPS 2017. arXiv:1706.02216.",
    "[9] R. Ying et al. Graph Convolutional Neural Networks for Web-Scale Recommender Systems (PinSage). KDD 2018. arXiv:1806.01973.",
    "[10] Y. Hou et al. Bridging Language and Items for Retrieval and Recommendation (Amazon Reviews'23). arXiv:2403.03952.",
  ];
  s.addText(refs.map((t, i) => ({ text: t, options: { breakLine: i < refs.length - 1 } })), { x: 0.6, y: 1.6, w: 12.1, h: 5.2, fontFace: BF, fontSize: 15, color: C.ink, margin: 0, isTextBox: true, valign: "top", paraSpaceAfter: 8 });
}

pres.writeFile({ fileName: path.join(__dirname, "PHASE2_PROPOSAL_GRAPES_GFN_REC_vn.pptx") }).then((f) => console.log("wrote", f));
