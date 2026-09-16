// Living thesis deck: GRAPES-GFN-Rec. Updated at every gate; pending parts are marked ĐANG CHỜ.
// Build: node build_thesis_vn.js (reads ../06_code/results).
const pptxgen = require("pptxgenjs");
const path = require("path");
const DATA = process.env.DATA_DIR || path.join(__dirname, "../06_code/results/data_story");
const OUT_NAME = "THESIS_vn.pptx";
const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE"; // 13.33 x 7.5
pres.title = "Luận văn — GRAPES-GFN-Rec (bản sống)";

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


const VERSION = "0.3", UPDATED = "16/09/2026";
const REG = {};
function pending(title, kicker, gate, items, note) {
  const s = base(title, kicker);
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.6, y: 1.55, w: 12.1, h: 0.7, rectRadius: 0.08, fill: { color: C.amberPale }, line: { color: C.amber, width: 1.5, dashType: "dash" } });
  s.addText([{ text: "ĐANG CHỜ · ", options: { bold: true, color: C.coral } }, { text: gate, options: { bold: true, color: C.ink } }], { x: 0.85, y: 1.55, w: 11.6, h: 0.7, fontFace: BF, fontSize: 17, margin: 0, isTextBox: true, valign: "middle" });
  const rows = [[{ text: "Sẽ điền", options: { bold: true, color: C.white, fill: { color: C.teal } } }, { text: "Trả lời câu hỏi", options: { bold: true, color: C.white, fill: { color: C.teal } } }, { text: "Nguồn số liệu", options: { bold: true, color: C.white, fill: { color: C.teal } } }]].concat(items);
  s.addTable(rows, { x: 0.6, y: 2.45, w: 12.1, colW: [5.0, 3.9, 3.2], fontFace: BF, fontSize: 13, color: C.ink, border: { type: "solid", pt: 0.5, color: C.grayLight }, rowH: 0.5, fill: { color: C.white } });
  if (note) footnote(s, note);
  return s;
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
  s.addText(`LUẬN VĂN · BẢN SỐNG ${VERSION}`, { x: 0.7, y: 1.2, w: 8, h: 0.4, fontFace: BF, fontSize: 14, bold: true, color: C.amber, charSpacing: 2, margin: 0, isTextBox: true });
  s.addText("GRAPES-GFN-Rec", { x: 0.7, y: 1.8, w: 8.5, h: 1.0, fontFace: HF, fontSize: 48, bold: true, color: C.white, margin: 0, isTextBox: true });
  s.addText("Học cách lấy mẫu đồ thị cho hệ gợi ý quy mô lớn dùng GNN", { x: 0.7, y: 2.85, w: 8.5, h: 1.0, fontFace: HF, fontSize: 24, color: "DCEBEA", margin: 0, isTextBox: true, valign: "top" });
  s.addText([
    { text: "Develop graph sampling for large-scale recommendation system using GNN", options: { italic: true, breakLine: true } },
    { text: "Dữ liệu: Amazon Reviews'23 Baby_Products · Backbone: LightGCN · Sampler: GRAPES + GFlowNet", options: {} },
  ], { x: 0.7, y: 4.4, w: 8.8, h: 0.9, fontFace: BF, fontSize: 14, color: "BFD8D5", margin: 0, isTextBox: true });
  s.addText(`Cập nhật ${UPDATED}. Tài liệu được bồi đắp theo từng gate đến khi nộp (11/2026). Phần “ĐANG CHỜ” chưa có số liệu.`, { x: 0.7, y: 6.3, w: 11, h: 0.5, fontFace: BF, fontSize: 13, color: C.white, margin: 0, isTextBox: true });
  s.addNotes("Mục tiêu buổi này: trình bày đúng bài toán giai đoạn 2, thiết kế phương pháp, cách đánh giá và khối lượng công việc. Không có kết quả phương pháp nào được trình bày vì chưa chạy.");
}



// Status & changelog
{
  const s = base("Trạng thái các chương và nhật ký cập nhật", "Bản sống"); REG["status"] = n;
  const head = (t) => ({ text: t, options: { bold: true, color: C.white, fill: { color: C.teal } } });
  const st = (t, col) => ({ text: t, options: { bold: true, color: col } });
  const rows = [
    [head("Chương"), head("Nội dung"), head("Trạng thái"), head("Gate điền tiếp")],
    ["1 Mở đầu", "Bùng nổ lân cận, sampling vs distributed, GRAPES, câu hỏi nghiên cứu", st("Có", C.tealMid), "—"],
    ["2 Dữ liệu", "Chọn dataset, chất lượng, rating, histogram, long-tail, cold-start, thời gian, graph", st("Một phần", C.amber), "Notebook 11 (phân tích sâu, dev split)"],
    ["3 Góp ý của cô", "Context, NDCG, coverage/conversion, ngữ nghĩa, đa dạng, quan hệ node, trade-off", st("Có · số ngữ nghĩa chờ", C.amber), "Notebook 11 (metadata), R5"],
    ["4 Phương pháp", "GRAPES-GFN-Rec, hàm mục tiêu, điểm riêng của gợi ý", st("Có", C.tealMid), "R2 hoàn tất"],
    ["5 Thiết kế thực nghiệm", "Phương pháp so sánh, chỉ số, tiêu chí", st("Có", C.tealMid), "R4 freeze"],
    ["6 Kết quả", "Development, holdout, hành vi sampler, budget, ngữ nghĩa", st("Đang chờ", C.coral), "R3, R5, R6"],
    ["7 Kế hoạch & kết luận", "Tiến độ đến 30/11, rủi ro, tổng kết", st("Kế hoạch có · kết luận chờ", C.amber), "R6, R7"],
  ];
  s.addTable(rows, { x: 0.6, y: 1.5, w: 12.1, colW: [2.2, 5.6, 2.3, 2.0], fontFace: BF, fontSize: 13, color: C.ink, border: { type: "solid", pt: 0.5, color: C.grayLight }, rowH: 0.5, fill: { color: C.white } });
  s.addText([
    { text: "Nhật ký", options: { bold: true, breakLine: true } },
    { text: "0.3 (16/09) — chuyển sang bản sống; thêm chương dữ liệu chi tiết và chương trả lời góp ý 3/9; kế hoạch nén về 30/11.", options: { breakLine: true } },
    { text: "0.2 (16/09) — bản đề xuất GRAPES-GFN-Rec, lõi code R2 và 28 oracle test.", options: { breakLine: true } },
    { text: "0.1 (16/09) — reset scope (DL-001): pilot M0–M2 chuyển phụ lục.", options: {} },
  ], { x: 0.6, y: 5.6, w: 12.1, h: 1.3, fontFace: BF, fontSize: 12.5, color: C.ink, margin: 0, isTextBox: true, valign: "top", paraSpaceAfter: 2 });
}

// 2 ─ Summary
{
  const s = base("Tóm tắt trong một slide", "Tổng quan"); REG["summary"] = n;
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



// Mapping to supervisor feedback (table filled at the end)
let MAP_SLIDE;
{
  const s = base("Trả lời các góp ý của cô (3/9)", "Tổng quan"); REG["map"] = n; MAP_SLIDE = s;
  footnote(s, "Nguồn góp ý: ghi chú “cô dặn 3/09”. Mỗi dòng có mục tương ứng trong chương 3 của báo cáo.");
}

// 3 ─ Neighbor explosion
{
  const s = base("Vì sao phải lấy mẫu: bùng nổ lân cận", "Chương 1 · Mở đầu"); REG["explosion"] = n;
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


// NEW ─ Sampling vs distributed
{
  const s = base("Sampling hay distributed?", "Chương 1 · Mở đầu"); REG["dist"] = n;
  const head = (t) => ({ text: t, options: { bold: true, color: C.white, fill: { color: C.teal } } });
  const hi = { fill: { color: C.amberPale }, bold: true };
  const rows = [
    [head("Hướng"), head("Cách làm"), head("Ưu điểm"), head("Hạn chế với bài toán này"), head("Vai trò")],
    ["Full-graph, 1 GPU", "Lan truyền trên toàn graph", "Chính xác, đơn giản", "Bộ nhớ/thời gian tăng theo số cạnh × layer", "Tham chiếu (tầng B)"],
    ["Distributed training", "Chia batch/model cho nhiều GPU, nhiều máy (PinSage [9])", "Mở rộng bằng phần cứng", "Cần cụm máy, chi phí giao tiếp; không giảm lượng tính mỗi batch", "Ngoài phạm vi (1×T4)"],
    ["Chia đồ thị (Cluster-GCN [11])", "Học trên từng cụm con", "Batch nhỏ, dễ song song", "Cắt mất cạnh giữa cụm; graph lệch hub khó chia đều", "Không chọn"],
    ["Embedding lịch sử (GAS [12])", "Dùng lại embedding cũ của hàng xóm", "Không bỏ hàng xóm", "Lưu embedding cho 2,48 tr node mỗi layer; embedding cũ bị lệch", "Không chọn"],
    [{ text: "Sampling (GraphSAGE, FastGCN, LADIES, GRAPES)", options: hi }, { text: "Giới hạn k node mỗi layer", options: hi }, { text: "Kiểm soát trực tiếp chi phí mỗi batch", options: hi }, { text: "Mất ngữ cảnh → phải chọn node đúng", options: hi }, { text: "Hướng chính", options: hi }],
  ];
  s.addTable(rows, { x: 0.6, y: 1.55, w: 12.1, colW: [2.4, 2.8, 2.0, 3.3, 1.6], fontFace: BF, fontSize: 13.5, color: C.ink, border: { type: "solid", pt: 0.5, color: C.grayLight }, rowH: 0.72, fill: { color: C.white } });
  card(s, 0.6, 5.95, 12.1, 0.9, "Hai hướng bổ sung cho nhau, không loại trừ", "", { fill: C.tealPale, headSize: 15 });
  s.addText("Distributed nhân phần cứng; sampling giảm lượng tính mỗi batch. Sampler học được có thể chạy trong từng worker của hệ distributed. Đồ án chọn sampling vì đề tài hướng tới và giới hạn 1 GPU.", { x: 5.6, y: 5.95, w: 6.95, h: 0.9, fontFace: BF, fontSize: 13, color: C.ink, margin: 0, isTextBox: true, valign: "middle" });
  s.addNotes("Trả lời câu hỏi sampling hoặc distributed trong ghi chú của cô.");
}


// 4 ─ GRAPES phase 1
{
  const s = base("Giai đoạn 1: GRAPES học cách lấy mẫu", "Chương 1 · Mở đầu"); REG["grapes"] = n;
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
  const s = base("Không thể chép nguyên GRAPES sang gợi ý", "Chương 1 · Mở đầu"); REG["gap"] = n;
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
  const s = base("Rà soát hướng đi: vì sao phải xây lại", "Chương 1 · Mở đầu"); REG["pilot"] = n;
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



// Research questions
{
  const s = base("Câu hỏi nghiên cứu", "Chương 1 · Mở đầu"); REG["rq"] = n;
  const qs = [
    ["RQ1", "Chính", "Giữ cố định recommender, graph, batch, budget, seed, evaluator, phần cứng: GRAPES-GFN-Rec có trade-off NDCG@20–chi phí tốt hơn lấy mẫu đều và theo bậc không?"],
    ["RQ2", "Hàm mục tiêu", "Trajectory Balance có ổn định, hiệu quả hơn REINFORCE trên tín hiệu BPR không?"],
    ["RQ3", "Hành vi", "Sampler học được chọn node nào (bậc, loại, head/body/tail)? Có khuếch đại thiên lệch phổ biến không?"],
    ["RQ4", "Ngân sách", "Khi budget k chặt hơn, lợi thế (nếu có) thay đổi thế nào?"],
  ];
  qs.forEach(([id, h, b], i) => card(s, 0.6, 1.55 + i * 1.25, 12.1, 1.1, h, b, { num: id, numFill: i === 0 ? C.coral : C.teal, bodySize: 15, headSize: 16 }));
  footnote(s, "Kết quả âm là kết quả hợp lệ: nghiên cứu hoàn thành khi trả lời được các câu hỏi với bằng chứng truy vết được.");
}

// 7 ─ Dataset choice
{
  const s = base("Chọn dữ liệu: Amazon Reviews'23, Baby_Products", "Chương 2 · Dữ liệu"); REG["dataset"] = n;
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


// NEW ─ Noise
{
  const s = base("Nhiễu: có nhiều không, có nên loại bỏ?", "Chương 2 · Dữ liệu"); REG["noise"] = n;
  const head = (t) => ({ text: t, options: { bold: true, color: C.white, fill: { color: C.teal } } });
  const tag = (t, col) => ({ text: t, options: { bold: true, color: col } });
  const rows = [
    [head("Loại"), head("Mức độ trong Baby_Products"), head("Quyết định"), head("Lý do")],
    ["Rating ngoài miền 1–5", "1 dòng (rating 0.0)", tag("Loại", C.coral), "Lỗi dữ liệu rõ ràng"],
    ["Trùng cặp, thiếu ID, sai timestamp", "0 dòng", tag("Không cần xử lý", C.tealMid), "Đã kiểm tra chính xác trên toàn file"],
    ["Rating thấp 1–3★", "1.298.047 dòng (21,8%)", tag("Không làm cạnh positive", C.amber), "Không phải lỗi mà là tín hiệu không thích / không chắc; gợi ý top-N chỉ học từ 4–5★"],
    ["User / item chỉ 1 tương tác", "71,76% user; 33,35% item", tag("Giữ, không lọc k-core", C.tealMid), "Là long-tail thật; lọc sẽ xóa đúng phần sampling phải xử lý"],
    ["Hành vi bất thường (bot, spam, đánh giá dồn dập)", "Chưa kiểm tra", tag("Kiểm tra ở R1, chỉ báo cáo", C.amber), "Không xóa khi chưa có quy tắc đăng ký trước"],
    ["Thiên lệch phổ biến", "Top 1% item giữ 44,1% tương tác", tag("Giữ, báo theo nhóm", C.tealMid), "Không phải nhiễu nhưng làm lệch chỉ số tổng"],
  ];
  s.addTable(rows, { x: 0.6, y: 1.55, w: 12.1, colW: [3.0, 2.8, 2.5, 3.8], fontFace: BF, fontSize: 13.5, color: C.ink, border: { type: "solid", pt: 0.5, color: C.grayLight }, rowH: 0.72, fill: { color: C.white } });
  s.addText("Kết luận: nhiễu dạng lỗi rất ít (1/5.953.891 dòng). Thách thức chính không phải nhiễu mà là thưa và mất cân bằng.", { x: 0.6, y: 6.45, w: 12.1, h: 0.45, fontFace: BF, fontSize: 15, italic: true, color: C.tealMid, margin: 0, isTextBox: true });
  s.addNotes("Trả lời: dữ liệu nhiễu nhiều không, có nên loại bỏ không, tính cân bằng dữ liệu.");
}



// Rating & positive policy
{
  const s = base("Rating và cách chọn tương tác positive", "Chương 2 · Dữ liệu"); REG["rating"] = n;
  s.addChart(pres.charts.BAR, [{ name: "Số rating", labels: ["1★", "2★", "3★", "4★", "5★"], values: [555424, 309591, 433032, 681977, 3973866] }], {
    x: 0.5, y: 1.5, w: 5.2, h: 3.3, chartColors: [C.grayLight], showValue: true, dataLabelFormatCode: "#,##0", dataLabelFontSize: 10, dataLabelColor: C.ink,
    catAxisLabelColor: C.ink, valAxisHidden: true, valGridLine: { style: "none" }, catGridLine: { style: "none" },
    showTitle: true, title: "Phân bố rating Baby_Products (5.953.890 dòng hợp lệ)", titleFontSize: 12, titleColor: C.ink, showLegend: false,
  });
  s.addText("Hình chữ J: 66,7% là 5★, 21,8% là 1–3★. Rating trên Amazon lệch mạnh về tích cực, nên 5★ không hiếm và 4★ đã là tín hiệu kém hơn trung bình.", { x: 0.6, y: 4.9, w: 5.0, h: 1.0, fontFace: BF, fontSize: 13, color: C.ink, margin: 0, isTextBox: true });
  const head = (t) => ({ text: t, options: { bold: true, color: C.white, fill: { color: C.teal } } });
  const hi = (t) => ({ text: t, options: { bold: true, fill: { color: C.amberPale } } });
  const rows = [
    [head("Chính sách"), head("Tất cả"), head("P4: 4–5★"), head("P5: chỉ 5★")],
    ["Tương tác", "5.953.890", hi("4.655.843"), "3.973.866"],
    ["User", "3.386.206", hi("2.769.312"), "2.476.012"],
    ["Sản phẩm", "217.654", hi("194.722"), "182.226"],
    ["User chỉ 1 tương tác", "70,01%", hi("71,64%"), "73,18%"],
    ["Sản phẩm chỉ 1 tương tác", "31,65%", hi("33,13%"), "34,34%"],
    ["Target validation còn warm", "24,50%", hi("21,90%"), "20,34%"],
    ["User validation chưa từng thấy", "75,07%", hi("77,43%"), "78,88%"],
  ];
  s.addTable(rows, { x: 6.0, y: 1.55, w: 6.7, colW: [2.5, 1.4, 1.4, 1.4], fontFace: BF, fontSize: 13, color: C.ink, border: { type: "solid", pt: 0.5, color: C.grayLight }, rowH: 0.45, fill: { color: C.white } });
  card(s, 6.0, 5.35, 6.7, 1.45, "Vì sao chọn P4", "Gợi ý top-N cần tín hiệu “thích”. Coi mọi rating là positive sẽ gộp 1–3★; chỉ lấy 5★ làm mất 14,6% tương tác và tăng cold-start. P4 là điểm cân bằng; chọn trước khi có kết quả model.", { fill: C.tealPale, bodySize: 13, headSize: 14 });
  footnote(s, "Nguồn: 06_code/results/Baby_Products_protocol_audit.json (semantic_snapshots all_observed / P4 / P5, cùng mốc t1, t2).");
}

// NEW ─ Products count, histogram, insufficient data, representation
{
  const s = base("Bao nhiêu sản phẩm, phân bố tương tác theo sản phẩm", "Chương 2 · Dữ liệu"); REG["hist"] = n;
  const flow = [["217.654", "item trong dữ liệu raw"], ["194.722", "item còn tương tác 4–5★ (P4)"], ["162.125", "item có trong graph train (trước t1)"]];
  flow.forEach(([v, l], i) => {
    const x = 0.6 + i * 2.05;
    s.addText(v, { x, y: 1.5, w: 1.9, h: 0.55, fontFace: HF, fontSize: 24, bold: true, color: i === 2 ? C.teal : C.tealMid, margin: 0, isTextBox: true });
    s.addText(l, { x, y: 2.05, w: 1.85, h: 0.55, fontFace: BF, fontSize: 11, color: C.gray, margin: 0, isTextBox: true, valign: "top" });
    if (i < 2) arrow(s, x + 1.75, 1.78, x + 2.02, 1.78, C.grayLight);
  });
  const labels = ["1", "2–5", "6–20", "21–100", "101–1000", ">1000"];
  s.addChart(pres.charts.BAR, [
    { name: "% sản phẩm", labels, values: [33.35, 32.79, 19.87, 10.13, 3.55, 0.31] },
    { name: "% tương tác", labels, values: [1.40, 4.12, 8.84, 18.65, 40.64, 26.35] },
  ], {
    x: 0.5, y: 2.75, w: 6.3, h: 4.05, barGrouping: "clustered", chartColors: [C.grayLight, C.teal], showValue: true, dataLabelFormatCode: "0.0", dataLabelFontSize: 10, dataLabelColor: C.ink,
    catAxisLabelColor: C.ink, catAxisLabelFontSize: 11, valAxisHidden: true, valGridLine: { style: "none" }, catGridLine: { style: "none" },
    showTitle: true, title: "Histogram: số tương tác của mỗi sản phẩm (graph train)", titleFontSize: 12, titleColor: C.ink, showLegend: true, legendPos: "t", legendFontSize: 11,
    showCatAxisTitle: true, catAxisTitle: "số user đã tương tác với sản phẩm", catAxisTitleFontSize: 11, catAxisTitleColor: C.gray,
  });
  s.addChart(pres.charts.BAR, [{ name: "% user", labels: ["1", "2–5", "6–20", ">20"], values: [71.76, 25.15, 2.97, 0.11] }], {
    x: 7.0, y: 1.45, w: 2.7, h: 2.9, chartColors: [C.coral], showValue: true, dataLabelFormatCode: "0.0", dataLabelFontSize: 10, dataLabelColor: C.ink,
    catAxisLabelColor: C.ink, catAxisLabelFontSize: 10, valAxisHidden: true, valGridLine: { style: "none" }, catGridLine: { style: "none" },
    showTitle: true, title: "% user theo số tương tác", titleFontSize: 11, titleColor: C.ink, showLegend: false,
  });
  card(s, 9.9, 1.5, 2.8, 2.85, "Không đủ dữ liệu", "71,76% user chỉ có 1 tương tác. Chỉ 21,9% dòng validation có user và item đã thấy trong train; 239.908 dòng loại vì user mới (cold-start, ngoài phạm vi).", { fill: C.coralPale, bodySize: 12, headSize: 14 });
  card(s, 7.0, 4.55, 5.7, 2.25, "Biểu diễn dữ liệu", "Graph hai phía G = (U ∪ I, E): node là user hoặc sản phẩm; cạnh là tương tác 4–5★ có thời điểm. Không dùng rating làm trọng số, không có feature → mỗi node học một embedding ID. Metadata sản phẩm chỉ dùng cho đánh giá ngữ nghĩa (chương 3).", { fill: C.tealPale, bodySize: 13, headSize: 15 });
  footnote(s, "33,35% sản phẩm chỉ có 1 tương tác nhưng chiếm 1,4% tương tác; 3,9% sản phẩm có >100 tương tác chiếm 67,0% tương tác.");
  s.addNotes("Trả lời: bao nhiêu sản phẩm, histogram cho từng sản phẩm, không đủ dữ liệu, cần biểu diễn dữ liệu gì.");
}


// 8 ─ Data analysis
{
  const s = base("Mất cân bằng, dồn về item phổ biến, long-tail", "Chương 2 · Dữ liệu"); REG["imb"] = n;
  s.addChart(pres.charts.BAR, [{ name: "Tỷ lệ interaction", labels: ["Top 1%", "Top 5%", "Top 10%", "Top 20%"], values: [44.1, 71.1, 81.3, 89.6] }], {
    x: 0.5, y: 1.55, w: 4.1, h: 5.3, chartColors: [C.teal], showValue: true, dataLabelFormatCode: "0.0\"%\"", dataLabelFontSize: 11, dataLabelColor: C.ink,
    catAxisLabelColor: C.ink, valAxisHidden: true, valGridLine: { style: "none" }, catGridLine: { style: "none" },
    showTitle: true, title: "Item phổ biến nhất giữ bao nhiêu interaction", titleFontSize: 12, titleColor: C.ink, showLegend: false,
  });
  s.addImage({ path: path.join(DATA, "02_degree_long_tail.png"), x: 4.8, y: 1.55, w: 4.5, h: 2.87 });
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



// Insufficient data / cold start
{
  const s = base("Không đủ dữ liệu: tương lai chủ yếu là user mới", "Chương 2 · Dữ liệu"); REG["cold"] = n;
  s.addChart(pres.charts.DOUGHNUT, [{ name: "Validation P4", labels: ["Warm: user và item đã có", "User mới (item đã có)", "User mới và item mới", "Item mới (user đã có)"], values: [81871, 239908, 34560, 17437] }], {
    x: 0.5, y: 1.45, w: 5.6, h: 4.6, chartColors: [C.teal, C.coral, "E39A8A", C.amber], holeSize: 55, showPercent: true, showValue: false, dataLabelColor: C.white, dataLabelFontSize: 12,
    showLegend: true, legendPos: "b", legendFontSize: 11, showTitle: true, title: "373.776 tương tác P4 trong cửa sổ validation", titleFontSize: 12, titleColor: C.ink,
  });
  const facts = [
    ["71,76%", "user trong graph train chỉ có 1 tương tác → gần như không có lịch sử cá nhân"],
    ["64,2%", "tương tác validation đến từ user chưa xuất hiện trong train (cold-start)"],
    ["21,9%", "tương tác validation dùng được cho gợi ý warm-start (81.871 target)"],
    ["9,8%", "tỷ lệ tương ứng ở cửa sổ test: càng xa mốc train, càng ít warm"],
  ];
  facts.forEach(([v, l], i) => {
    const y = 1.55 + i * 1.08;
    s.addText(v, { x: 6.5, y, w: 1.9, h: 0.8, fontFace: HF, fontSize: 28, bold: true, color: i === 2 ? C.teal : C.coral, margin: 0, isTextBox: true, valign: "middle" });
    s.addText(l, { x: 8.45, y, w: 4.25, h: 0.8, fontFace: BF, fontSize: 13, color: C.ink, margin: 0, isTextBox: true, valign: "middle" });
  });
  card(s, 6.5, 5.95, 6.2, 0.9, "Hệ quả", "", { fill: C.amberPale, headSize: 14 });
  s.addText("Đồ án giới hạn ở warm-start; cold-start cần feature nội dung (metadata) và là hướng phát triển.", { x: 7.6, y: 5.95, w: 5.0, h: 0.9, fontFace: BF, fontSize: 12.5, color: C.ink, margin: 0, isTextBox: true, valign: "middle" });
  footnote(s, "Nguồn: data_story_summary.json (temporal_population) và baby_p4_g2c_manifest.json. Chỉ đếm số dòng, không dùng target để thiết kế.");
}


// Temporal
{
  const s = base("Dữ liệu theo thời gian và các cửa sổ chia", "Chương 2 · Dữ liệu"); REG["time"] = n;
  const years = [2010,2011,2012,2013,2014,2015,2016,2017,2018,2019,2020,2021,2022,2023];
  const vals = [21151,43070,56685,140671,217199,346665,417378,414201,497560,664832,637961,533675,438337,190655];
  s.addChart(pres.charts.BAR, [{ name: "Tương tác P4", labels: years.map(String), values: vals }], {
    x: 0.5, y: 1.45, w: 7.6, h: 4.2, chartColors: [C.tealMid], showValue: false,
    catAxisLabelColor: C.ink, catAxisLabelFontSize: 11, valAxisLabelColor: C.gray, valAxisLabelFormatCode: "#,##0,\"k\"", valGridLine: { color: "E3E8E8", size: 0.5 }, catGridLine: { style: "none" },
    showTitle: true, title: "Số tương tác 4–5★ theo năm (2000–2009 rất ít; 2023 chỉ đến tháng 9)", titleFontSize: 12, titleColor: C.ink, showLegend: false,
  });
  const rows = [
    [{ text: "Mốc", options: { bold: true, color: C.white, fill: { color: C.teal } } }, { text: "Ngày", options: { bold: true, color: C.white, fill: { color: C.teal } } }, { text: "Vai trò", options: { bold: true, color: C.white, fill: { color: C.teal } } }],
    ["Dữ liệu đầu", "10/06/2000", "—"],
    ["t0", "05/09/2020", "Bắt đầu cửa sổ development"],
    ["t1", "11/08/2021", "Hết graph train"],
    ["t2", "16/07/2022", "Hết validation, bắt đầu test"],
    ["Dữ liệu cuối", "12/09/2023", "—"],
  ];
  s.addTable(rows, { x: 8.4, y: 1.55, w: 4.3, colW: [1.2, 1.3, 1.8], fontFace: BF, fontSize: 12, color: C.ink, border: { type: "solid", pt: 0.5, color: C.grayLight }, rowH: 0.42, fill: { color: C.white } });
  s.addText(bullets([
    "Tăng mạnh từ 2013, đỉnh 2019–2020, giảm dần sau 2021: phân bố thay đổi theo thời gian → chia theo thời gian thay vì ngẫu nhiên.",
    "Cửa sổ development ước tính ~546 nghìn tương tác (~14% trước t1), nên quy tắc t0 chính dự kiến đủ điều kiện; con số chính xác chờ notebook 11.",
    "32.050 dòng trùng timestamp với dòng khác; không có dòng nào đúng bằng t1 hoặc t2.",
  ], 13), { x: 8.4, y: 4.25, w: 4.3, h: 2.6, fontFace: BF, margin: 0, isTextBox: true, valign: "top", paraSpaceAfter: 6 });
  s.addText("Độ trôi của sản phẩm phổ biến theo năm, khoảng cách giữa hai tương tác: ĐANG CHỜ notebook 11.", { x: 0.6, y: 5.8, w: 7.5, h: 0.5, fontFace: BF, fontSize: 12, italic: true, color: C.coral, margin: 0, isTextBox: true });
  footnote(s, "Nguồn: data_story_summary.json (monthly_p4), Baby_Products_protocol_audit.json (timestamp_audit). Số cửa sổ development là ước lượng theo tháng.");
}


// Graph structure
{
  const s = base("Cấu trúc graph huấn luyện", "Chương 2 · Dữ liệu"); REG["graph"] = n;
  const stats = [["2.480.433", "node (2.318.308 user + 162.125 sản phẩm)"], ["3.868.654", "cạnh; mật độ 1,03 × 10⁻⁵"], ["96,5%", "node nằm trong thành phần liên thông lớn nhất; 34.288 thành phần"], ["≈ 1.009", "bậc kỳ vọng của sản phẩm khi đi theo một cạnh (Σd²/Σd), so với trung bình 23,9"]];
  stats.forEach(([v, l], i) => {
    const x = 0.6 + (i % 2) * 3.1, y = 1.55 + Math.floor(i / 2) * 1.45;
    s.addText(v, { x, y, w: 2.95, h: 0.65, fontFace: HF, fontSize: 26, bold: true, color: C.teal, margin: 0, isTextBox: true });
    s.addText(l, { x, y: y + 0.65, w: 2.95, h: 0.7, fontFace: BF, fontSize: 12, color: C.gray, margin: 0, isTextBox: true, valign: "top" });
  });
  const head = (t) => ({ text: t, options: { bold: true, color: C.white, fill: { color: C.teal } } });
  const rows = [
    [head("Nhóm sản phẩm"), head("Quy tắc bậc"), head("% sản phẩm"), head("% cạnh")],
    ["Head", "≥ 397", "1,00%", "44,16%"],
    ["Body", "13–396", "18,92%", "45,45%"],
    ["Tail", "≤ 12", "80,07%", "10,39%"],
  ];
  s.addTable(rows, { x: 0.6, y: 4.55, w: 6.0, colW: [1.6, 1.5, 1.45, 1.45], fontFace: BF, fontSize: 13, color: C.ink, border: { type: "solid", pt: 0.5, color: C.grayLight }, rowH: 0.45, fill: { color: C.white } });
  card(s, 7.0, 1.55, 5.7, 2.55, "Đọc cấu trúc này thế nào", "Graph gần như liên thông nên lan truyền 2–3 bước chạm tới phần lớn graph. Một item head có hàng nghìn user; 80% sản phẩm tail chỉ giữ 10% cạnh. Mỗi lựa chọn node vì vậy đánh đổi giữa tín hiệu phổ biến (rẻ để có, ít cá nhân) và tín hiệu hiếm.", { fill: C.tealPale, bodySize: 13.5, headSize: 15 });
  card(s, 7.0, 4.25, 5.7, 2.55, "ĐANG CHỜ notebook 11", "Số cặp sản phẩm đồng mua; tỷ lệ sản phẩm không có sản phẩm đồng mua (không nhận được collaborative signal); kích thước lân cận 1–3 bước thực tế của user; % graph bị chạm theo batch 1k–65k triplet; target development nằm trong 3 bước bao nhiêu %.", { fill: C.amberPale, bodySize: 13, headSize: 15 });
  footnote(s, "Nguồn: data_story_summary.json (training_graph), configs/cohorts_v1.json (khóa trước khi có kết quả model).");
}

// 9 ─ Data path
{
  const s = base("Đường đi dữ liệu và chia theo thời gian", "Chương 2 · Dữ liệu"); REG["path"] = n;
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



// Pending deep analysis
{
  const s = pending("Phân tích sâu dữ liệu (notebook 11)", "Chương 2 · Dữ liệu", "notebook 11_dataset_deep_analysis_and_dev_split — chạy trên Colab", [
    ["Rating trung bình, tỷ lệ 5★ và ≤3★ theo độ phổ biến sản phẩm", "Dữ liệu rating; nhiễu", "S1"],
    ["User chỉ cho 5★, độ lệch rating mỗi user", "Nhiễu; mất cân bằng", "S1"],
    ["User mới theo năm, khoảng cách giữa hai tương tác, độ trôi top-1%", "Thời gian; không đủ dữ liệu", "S2"],
    ["User đánh giá dồn dập, sản phẩm tăng đột biến, rating hằng số", "Nhiễu có nên loại bỏ", "S3"],
    ["Cặp đồng mua, sản phẩm không có đồng mua, lân cận 1–3 bước", "Quan hệ node có giá trị; bùng nổ lân cận", "S4"],
    ["Độ phủ metadata, danh mục cấp 2, giá theo head/tail", "Khớp ngữ nghĩa; đa dạng", "S6"],
    ["Development split: số cạnh, target, retention, quy tắc đã dùng", "Protocol (gate R1)", "R1"],
    ["Target development: nhóm head/body/tail, % trong 3 bước", "Quan hệ node; hệ quả số layer", "R1"],
  ], "Mỗi dòng sẽ thành một slide và một mục trong báo cáo khi có deep_analysis_summary.json."); REG["deep"] = n;
}


// Data -> design implications
{
  const s = base("Từ dữ liệu đến quyết định thiết kế", "Chương 2 · Dữ liệu"); REG["impl"] = n;
  const head = (t) => ({ text: t, options: { bold: true, color: C.white, fill: { color: C.teal } } });
  const rows = [
    [head("Quan sát"), head("Quyết định")],
    ["Rating hình chữ J, 21,8% là 1–3★", "Positive = 4–5★ (P4); không dùng rating làm trọng số"],
    ["Nhiễu dạng lỗi chỉ 1 dòng", "Không lọc thêm; bất thường chỉ báo cáo"],
    ["71,8% user có 1 tương tác; 33% sản phẩm có 1 tương tác", "Không lọc k-core; theo dõi node được sampler chọn theo bậc"],
    ["Top 1% sản phẩm giữ 44% tương tác", "Báo exposure/hit theo head–body–tail, không chỉ NDCG tổng"],
    ["64% tương tác validation của user mới", "Giới hạn warm-start; cold-start là hướng phát triển"],
    ["Phân bố thay đổi mạnh theo năm", "Chia theo thời gian; development split mới trước t1"],
    ["Graph gần liên thông, bậc kỳ vọng theo cạnh ~1.009", "Lấy mẫu có budget k; chi phí sampler được tính vào trade-off"],
    ["Có metadata sản phẩm", "Dùng cho đánh giá ngữ nghĩa/đa dạng, không đưa vào huấn luyện"],
  ];
  s.addTable(rows, { x: 0.6, y: 1.5, w: 12.1, colW: [5.6, 6.5], fontFace: BF, fontSize: 14, color: C.ink, border: { type: "solid", pt: 0.5, color: C.grayLight }, rowH: 0.56, fill: { color: C.white } });
}

// NEW ─ Concepts
{
  const s = base("Thống nhất khái niệm: context, NDCG, coverage, conversion", "Chương 3 · Góp ý của cô"); REG["concept"] = n;
  card(s, 0.6, 1.55, 5.95, 2.45, "Context (ngữ cảnh) trong đồ án này", "Tập node và cạnh lân cận mà model dùng để tính embedding cho batch ở mỗi layer (ký hiệu K^l). Sampler quyết định context. Không phải ngữ cảnh người dùng như thời gian, thiết bị, vị trí (đó là context-aware recommendation, ngoài phạm vi).", { fill: C.tealPale, bodySize: 14, headSize: 17 });
  card(s, 6.75, 1.55, 5.95, 2.45, "NDCG@20 — chỉ số chính", "Mỗi dòng đánh giá có 1 item đúng. Xếp toàn bộ catalog, tìm hạng r của item đúng:\nNDCG@20 = 1 / log₂(r + 1) nếu r ≤ 20, ngược lại 0.\nItem đúng đứng càng cao, điểm càng lớn.", { fill: C.tealPale, bodySize: 14, headSize: 17 });
  s.addChart(pres.charts.BAR, [{ name: "NDCG@20", labels: ["hạng 1", "hạng 2", "hạng 3", "hạng 5", "hạng 10", "hạng 20", "hạng 21+"], values: [1, 0.631, 0.5, 0.387, 0.289, 0.228, 0] }], {
    x: 6.75, y: 4.15, w: 5.95, h: 2.65, chartColors: [C.amber], showValue: true, dataLabelFormatCode: "0.00", dataLabelFontSize: 11, dataLabelColor: C.ink,
    catAxisLabelColor: C.ink, catAxisLabelFontSize: 11, valAxisHidden: true, valGridLine: { style: "none" }, catGridLine: { style: "none" },
    showTitle: true, title: "Điểm NDCG@20 theo hạng của item đúng", titleFontSize: 12, titleColor: C.ink, showLegend: false,
  });
  card(s, 0.6, 4.15, 2.9, 2.65, "Coverage@20", "Tỷ lệ item trong catalog xuất hiện ít nhất một lần trong top-20 của mọi user. Đo độ phủ, chưa đo ý nghĩa.", { bodySize: 13, headSize: 15 });
  card(s, 3.65, 4.15, 2.9, 2.65, "Conversion", "Tỷ lệ gợi ý dẫn tới mua. Cần log hiển thị–click–mua và A/B test online; dữ liệu review offline không có. Proxy offline: Recall@20.", { fill: C.coralPale, bodySize: 13, headSize: 15 });
  footnote(s, "NDCG: Järvelin & Kekäläinen [14]. Recall@20 = tỷ lệ dòng có item đúng trong top-20.");
  s.addNotes("Nếu “converat” trong ghi chú là coverage thì đã có; nếu là conversion rate thì giải thích vì sao không đo được offline.");
}



// Semantic & diversity metrics
{
  const s = base("Mức khớp ngữ nghĩa và đa dạng sản phẩm được gợi ý", "Chương 3 · Góp ý của cô"); REG["sem"] = n;
  card(s, 0.6, 1.55, 3.9, 3.1, "Semantic match@20", "Mức giống về nội dung giữa sản phẩm gợi ý và sản phẩm user thật sự chọn.\n\nmax (hoặc trung bình) cos(e_gợi ý, e_đúng) trên top-20, với e là embedding văn bản title + features [15].", { fill: C.tealPale, bodySize: 13, headSize: 16 });
  card(s, 4.7, 1.55, 3.9, 3.1, "ILD@20 (đa dạng trong danh sách)", "Trung bình khoảng cách giữa mọi cặp trong top-20 [13]:\nILD = 2/(k(k−1)) · Σ d(i, j)\nd theo danh mục (1 − Jaccard của đường danh mục) hoặc 1 − cos văn bản.", { fill: C.tealPale, bodySize: 13, headSize: 16 });
  card(s, 8.8, 1.55, 3.9, 3.1, "Đa dạng toàn hệ thống", "Coverage@20: độ phủ catalog.\nGini exposure: gợi ý dồn vào ít sản phẩm hay trải đều.\nCategory coverage: số danh mục xuất hiện trong gợi ý.", { fill: C.tealPale, bodySize: 13, headSize: 16 });
  const head = (t) => ({ text: t, options: { bold: true, color: C.white, fill: { color: C.teal } } });
  const rows = [
    [head("Điều kiện"), head("Trạng thái")],
    ["Amazon Reviews'23 có meta_Baby_Products (title, categories, features, store, price)", "Có sẵn, công bố chính thức [10]"],
    ["Độ phủ metadata trên 162.125 sản phẩm train", "ĐANG CHỜ notebook 11"],
    ["Metadata không vào huấn luyện → không đổi phương pháp, chỉ thêm phép đo", "Cần cô duyệt (OD-2)"],
    ["Tính trên rank vector đã lưu của R5", "Sau R5"],
  ];
  s.addTable(rows, { x: 0.6, y: 4.85, w: 12.1, colW: [8.2, 3.9], fontFace: BF, fontSize: 13, color: C.ink, border: { type: "solid", pt: 0.5, color: C.grayLight }, rowH: 0.42, fill: { color: C.white } });
}

// NEW ─ Which node relations carry value
{
  const s = base("Quan hệ nào giữa các node mang giá trị?", "Chương 3 · Góp ý của cô"); REG["rel"] = n;
  const items = [
    ["user → item", "Lịch sử trực tiếp", "Tín hiệu mạnh nhất cho user; với user 1 tương tác đây là toàn bộ thông tin.", C.teal],
    ["item → user → item", "“Người mua A cũng mua B”", "Collaborative signal cốt lõi của LightGCN, xuất hiện từ bước 2.", C.tealMid],
    ["qua item head", "Bậc ≥ 397 · 1% item · 44% cạnh", "Nhiều thông tin phổ biến, ít tính cá nhân, tốn chi phí lan truyền.", C.amber],
    ["qua item tail", "Bậc ≤ 12 · 80% item · 10% cạnh", "Tín hiệu riêng, ngách, nhưng ít quan sát nên dễ nhiễu.", C.coral],
    ["qua user hoạt động nhiều", "Bậc user cao (p99 = 9)", "Cầu nối nhiều sản phẩm, có thể quá chung chung.", C.gray],
  ];
  items.forEach(([h, sub, b, col], i) => {
    const y = 1.55 + i * 1.02;
    node(s, 0.6, y + 0.12, String(i + 1), col, 0.52, 15);
    s.addText(h, { x: 1.3, y, w: 2.6, h: 0.45, fontFace: BF, fontSize: 16, bold: true, color: C.ink, margin: 0, isTextBox: true, valign: "middle" });
    s.addText(sub, { x: 1.3, y: y + 0.45, w: 2.6, h: 0.4, fontFace: BF, fontSize: 11, color: C.gray, margin: 0, isTextBox: true });
    s.addText(b, { x: 4.0, y, w: 3.6, h: 0.85, fontFace: BF, fontSize: 13, color: C.ink, margin: 0, isTextBox: true, valign: "middle" });
  });
  card(s, 7.9, 1.55, 4.8, 2.45, "Không giả định trước giá trị", "Heuristic cố định (M1 ưu tiên head, M2 phạt hub) áp đặt một câu trả lời. GRAPES-GFN-Rec để sampler học: quan hệ nào giúp BPR loss giảm sẽ được chọn nhiều hơn.", { fill: C.amberPale, bodySize: 14, headSize: 16 });
  card(s, 7.9, 4.15, 4.8, 2.65, "Đo lại bằng dữ liệu (RQ3, RQ4)", "Phân phối loại node, bậc, nhóm head/body/tail của node được chọn theo layer, so với M0 và M1 trên cùng tập ứng viên. Khi budget chặt hơn, quan hệ nào vẫn được giữ cho biết quan hệ nào quan trọng nhất.", { fill: C.tealPale, bodySize: 14, headSize: 16 });
  footnote(s, "Ngưỡng head/body/tail khóa trước khi có kết quả model (06_code/configs/cohorts_v1.json).");
  s.addNotes("Trả lời: mối quan hệ giữa các node để có giá trị như nào.");
}


// NEW ─ Criteria trade-off
{
  const s = base("Ưu tiên tiêu chí nào thì các giá trị khác thay đổi ra sao", "Chương 3 · Góp ý của cô"); REG["trade"] = n;
  const head = (t) => ({ text: t, options: { bold: true, color: C.white, fill: { color: C.teal } } });
  const rows = [
    [head("Nếu chỉ tối ưu"), head("Điều thường xảy ra"), head("Bằng chứng trên Baby_Products"), head("Cách đồ án đo")],
    ["Độ chính xác tổng (NDCG)", "Dồn về sản phẩm phổ biến, độ phủ sụp", "MostPop: NDCG@20 0,0059 nhưng chỉ gợi ý 25 sản phẩm, coverage 0,00015, 100% exposure ở head", "NDCG kèm coverage và exposure theo nhóm"],
    ["Độ phủ / đa dạng", "Có thể giảm độ chính xác", "BPR-MF: coverage 0,0335 (~218 lần MostPop) nhưng NDCG@20 0,0041", "Đồ thị NDCG–coverage"],
    ["Chi phí thấp (budget k nhỏ)", "Ít ngữ cảnh, chất lượng có thể giảm", "Chưa đo — là RQ4", "NDCG–thời gian ở 2 mức budget"],
    ["Đưa sản phẩm tail lên", "Exposure tail tăng nhưng hit tail có thể không tăng", "Chưa đo cho phương pháp mới", "Exposure và hit tail tách riêng"],
    ["Mức khớp ngữ nghĩa", "Gợi ý an toàn, giống nhau, kém đa dạng", "Chưa đo — cần metadata", "Semantic match@20 cùng ILD@20"],
  ];
  s.addTable(rows, { x: 0.6, y: 1.55, w: 12.1, colW: [2.4, 2.9, 4.2, 2.6], fontFace: BF, fontSize: 13.5, color: C.ink, border: { type: "solid", pt: 0.5, color: C.grayLight }, rowH: 0.78, fill: { color: C.white } });
  s.addText("Không chọn phương pháp bằng một con số. Kết quả được báo như mặt trận Pareto: không phương pháp nào được coi là tốt hơn nếu nó thua ở một trục mà không thắng ở trục khác.", { x: 0.6, y: 6.25, w: 12.1, h: 0.6, fontFace: BF, fontSize: 14, italic: true, color: C.tealMid, margin: 0, isTextBox: true });
  footnote(s, "MostPop, BPR-MF là baseline sanity cũ (validation, 5 epoch) — chỉ minh họa trade-off của dữ liệu, không phải kết quả GRAPES-GFN-Rec.");
  s.addNotes("Trả lời: nếu quan tâm tiêu chí gì thì xem các giá trị tiếp theo mang lại sẽ như thế nào; và trade-off.");
}


// 10 ─ Architecture
{
  const s = base("Kiến trúc tổng thể GRAPES-GFN-Rec", "Chương 4 · Phương pháp"); REG["arch"] = n;
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
  const s = base("Một bước lấy mẫu trong layer l", "Chương 4 · Phương pháp"); REG["step"] = n;
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
  const s = base("Hàm mục tiêu và phân quyền tham số", "Chương 4 · Phương pháp"); REG["obj"] = n;
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
  const s = base("Những điểm riêng của bài toán gợi ý phải xử lý", "Chương 4 · Phương pháp"); REG["issues"] = n;
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
  const s = base("So sánh với các phương pháp khác", "Chương 5 · Thiết kế thực nghiệm"); REG["comp"] = n;
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
  const s = base("Đo gì và vì sao", "Chương 5 · Thiết kế thực nghiệm"); REG["metrics"] = n;
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
  card(s, 0.6, 5.4, 12.1, 1.4, "Ngữ nghĩa và đa dạng sản phẩm được gợi ý (đề xuất bổ sung, cần cô duyệt · OD-2)", "Nối metadata meta_Baby_Products có sẵn trong Amazon Reviews'23 (title, categories, features, store). Semantic match@20: cosine giữa embedding văn bản [15] của sản phẩm gợi ý và sản phẩm đúng. ILD@20: khoảng cách danh mục trung bình giữa các cặp trong top-20 [13]. Metadata không đưa vào huấn luyện, chỉ để đánh giá.", { fill: C.amberPale, bodySize: 13 });
  s.addNotes("Kết luận được phép: chỉ nói GRAPES-GFN-Rec cải thiện nếu Δ NDCG@20 > 0 ở mọi seed holdout và chi phí được báo đủ.");
}



{
  const s = pending("Kết quả development (R3)", "Chương 6 · Kết quả", "notebook 12 trên D_dev — dự kiến 23/09–10/10", [
    ["Full LightGCN vs MostPop theo số epoch (điều kiện backbone)", "R-6", "R3a"],
    ["Budget chung: batch × k, số bước, thời gian/epoch, bộ nhớ T4", "R-1, R-5", "R3b"],
    ["Quét α, log_z_init, learning rate sampler", "R-2", "R3c"],
    ["Bằng chứng sampler học: ‖ΔΘ_S‖, phân phối chọn khác M0", "G7", "R3d"],
    ["Chi phí sampler so với propagation", "Trade-off", "R3e"],
  ], "Cấu hình chỉ được chọn từ D_dev; validation hiện tại chưa được đọc.");
}


{
  const s = pending("Kết quả so sánh ghép cặp trên holdout (R5)", "Chương 6 · Kết quả", "notebook 13 — dự kiến 14/10–27/10", [
    ["NDCG@20, Recall@20 × 7 phương pháp × 3 seed; Δ ghép cặp", "RQ1", "R5"],
    ["Coverage@20, exposure/hit head–body–tail, Gini", "Phân bổ, đa dạng", "R5"],
    ["Thời gian sampler, TB, propagation, epoch; peak GPU", "Trade-off chi phí", "R5"],
    ["TB vs REINFORCE: độ ổn định, tỷ lệ run fail", "RQ2", "R5"],
    ["Semantic match@20, ILD@20", "Ngữ nghĩa (nếu OD-2 duyệt)", "R5 + metadata"],
  ], "Chỉ kết luận cải thiện khi Δ NDCG@20 > 0 ở mọi seed và chi phí được báo đủ.");
}


{
  const s = pending("Hành vi sampler và độ nhạy budget (R6)", "Chương 6 · Kết quả", "phân tích sau R5 — dự kiến 28/10–03/11", [
    ["Bậc, loại user/item, nhóm của node được chọn theo layer", "RQ3 · quan hệ node có giá trị", "R6"],
    ["Có dồn về hub không; so với M0/M1 cùng ứng viên", "RQ3 · thiên lệch phổ biến", "R6"],
    ["Mặt trận Pareto NDCG–thời gian, NDCG–coverage", "Trade-off theo tiêu chí", "R6"],
    ["Budget chặt: quan hệ nào vẫn được giữ", "RQ4", "R6"],
    ["Ablation che cạnh positive (D9), log Z kiểu cũ (D6)", "Độ tin cậy", "R6"],
  ], null);
}


// Plan to 30/11
{
  const s = base("Kế hoạch đến hạn nộp 30/11/2026", "Chương 7 · Kế hoạch"); REG["plan"] = n;
  const weeks = ["16/9", "23/9", "30/9", "7/10", "14/10", "21/10", "28/10", "4/11", "11/11", "18/11", "25/11"];
  const x0 = 4.9, wk = 0.7;
  weeks.forEach((w, i) => {
    s.addShape(pres.shapes.LINE, { x: x0 + i * wk, y: 1.8, w: 0, h: 4.75, line: { color: "E3E8E8", width: 0.75 } });
    s.addText(w, { x: x0 + i * wk - 0.05, y: 1.45, w: 0.7, h: 0.3, fontFace: BF, fontSize: 10, color: C.gray, margin: 0, isTextBox: true });
  });
  const tasks = [
    ["R0 · R2 lõi", "Scope, spec, code, oracle test", 0, 0.6, C.tealMid, "Xong"],
    ["Notebook 11", "Phân tích sâu + dev split (R1)", 0, 1, C.amber, "Chạy ngay"],
    ["R2 hoàn tất", "Negative, ablation D9/D6, embedding thưa", 0.4, 1, C.teal, ""],
    ["R3 development", "Backbone, budget, quét α/lr, khả thi", 1, 2.5, C.teal, ""],
    ["R4 freeze", "Chốt OD-1…4 với cô, hash cấu hình", 3.3, 0.7, C.coral, "Gặp cô"],
    ["R5 holdout", "7 phương pháp × 3 seed (Colab song song)", 4, 2, C.teal, ""],
    ["R6 phân tích", "RQ1–RQ4, ngữ nghĩa, Pareto", 6, 1, C.teal, ""],
    ["R7 viết", "Hoàn thiện luận văn + slide (viết song song từ tuần 1)", 7, 2, C.teal, ""],
    ["Dự phòng", "Sửa theo góp ý, nộp", 9, 2, C.grayLight, "Nộp 30/11"],
  ];
  tasks.forEach(([h, d, st, len, col, tag], i) => {
    const y = 1.85 + i * 0.52;
    s.addText([{ text: h + "  ", options: { bold: true } }, { text: d, options: { color: C.gray, fontSize: 11 } }], { x: 0.6, y, w: 4.25, h: 0.46, fontFace: BF, fontSize: 12.5, color: C.ink, margin: 0, isTextBox: true, valign: "middle" });
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: x0 + st * wk, y: y + 0.08, w: len * wk, h: 0.32, rectRadius: 0.05, fill: { color: col }, line: { color: col } });
    if (tag) s.addText(tag, { x: x0 + (st + len) * wk + 0.06, y: y + 0.03, w: 1.3, h: 0.4, fontFace: BF, fontSize: 10.5, bold: true, color: col === C.grayLight ? C.gray : col, margin: 0, isTextBox: true, valign: "middle" });
  });
  s.addText("Tăng tốc: slide và báo cáo được điền ngay khi mỗi gate có số; chạy Colab song song theo seed; giới hạn lưới quét; tầng C (GraphSAGE) chỉ làm nếu cô yêu cầu.", { x: 0.6, y: 6.55, w: 12.1, h: 0.4, fontFace: BF, fontSize: 12, italic: true, color: C.tealMid, margin: 0, isTextBox: true });
}

// 17 ─ Risks
{
  const s = base("Rủi ro và phương án dự phòng", "Chương 7 · Kế hoạch"); REG["risks"] = n;
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
  const s = pres.addSlide(); n += 1; REG["final"] = n;
  s.background = { color: C.teal };
  s.addText("Tổng kết", { x: 0.6, y: 0.5, w: 8, h: 0.8, fontFace: HF, fontSize: 36, bold: true, color: C.white, margin: 0, isTextBox: true });
  const colsT = [
    ["Đã đạt được", ["Kiểm toán 3 dataset Amazon, trả lời các câu hỏi dữ liệu của cô", "Protocol thời gian, evaluator toàn catalog", "Rà soát và khóa lại scope (DL-001), checklist G1–G7", "Thiết kế GRAPES-GFN-Rec cho gợi ý + lõi code, 28 oracle test"]],
    ["Sẽ làm", ["Development split và thí nghiệm development (R1, R3)", "Freeze rồi so sánh ghép cặp 7 phương pháp (R4, R5)", "Phân tích chất lượng – chi phí – hành vi sampler (R6)", "Báo cáo cuối từ bằng chứng holdout (R7)"]],
    ["Xin ý kiến cô", ["OD-1: thêm GraphSAGE fan-out làm đối chứng?", "OD-2: nối metadata để đo ngữ nghĩa, đa dạng? (khuyến nghị: có)", "OD-3: lưới budget (1 chính + 1 chặt)?", "OD-4: số seed (đề xuất 3)?"]],
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
  const s = base("Tài liệu tham khảo", "Tài liệu"); REG["refs"] = n;
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
    "[11] W.-L. Chiang et al. Cluster-GCN. KDD 2019. arXiv:1905.07953.  [12] M. Fey et al. GNNAutoScale (GAS). ICML 2021. arXiv:2106.05609.",
    "[13] C.-N. Ziegler et al. Improving Recommendation Lists Through Topic Diversification. WWW 2005.  [14] K. Järvelin, J. Kekäläinen. Cumulated Gain-Based Evaluation of IR Techniques. ACM TOIS 2002.",
    "[15] N. Reimers, I. Gurevych. Sentence-BERT. EMNLP 2019. arXiv:1908.10084.",
  ];
  s.addText(refs.map((t, i) => ({ text: t, options: { breakLine: i < refs.length - 1 } })), { x: 0.6, y: 1.6, w: 12.1, h: 5.2, fontFace: BF, fontSize: 13, color: C.ink, margin: 0, isTextBox: true, valign: "top", paraSpaceAfter: 6 });
}



// Fill mapping slide now that slide numbers are known
{
  const s = MAP_SLIDE;
  const head = (t) => ({ text: t, options: { bold: true, color: C.white, fill: { color: C.teal } } });
  const pend = (t) => ({ text: t, options: { color: C.coral, bold: true } });
  const sl = (...ids) => ids.map((k) => REG[k]).join(", ");
  const rows = [
    [head("Câu hỏi của cô (3/9)"), head("Trả lời ngắn"), head("Trạng thái"), head("Slide")],
    ["Coverage / conversion, context, NDCG", "Định nghĩa rõ; conversion cần log online, không có trong dữ liệu offline", "Có", sl("concept")],
    ["Mức khớp ngữ nghĩa", "Semantic match@20 từ metadata Amazon", pend("Chờ nb11 + R5"), sl("sem")],
    ["Tính phân bổ, đa dạng sản phẩm được gợi ý", "Exposure/hit head–body–tail, Gini, ILD@20, coverage", "Định nghĩa có; số chờ R5", sl("graph", "sem")],
    ["Trade-off; tiêu chí nào thì giá trị khác ra sao", "Bảng tối ưu X → hệ quả Y; mặt trận Pareto", "Có; số chờ R6", sl("trade")],
    ["Bao nhiêu sản phẩm, histogram từng sản phẩm", "217.654 → 194.722 → 162.125; histogram theo sản phẩm và user", "Có", sl("hist")],
    ["Mất cân bằng, dồn về, long-tail", "Top 1% giữ 44,1% tương tác; Gini 0,858; head/body/tail", "Có", sl("imb", "graph")],
    ["Dữ liệu rating", "Hình chữ J; so sánh P4/P5/tất cả", "Có; theo độ phổ biến chờ nb11", sl("rating")],
    ["Không đủ dữ liệu", "71,8% user 1 tương tác; 64% tương tác validation của user mới", "Có", sl("cold")],
    ["Cần biểu diễn dữ liệu gì", "Graph hai phía, cạnh = tương tác 4–5★ có thời điểm", "Có", sl("hist")],
    ["Nhiễu nhiều không, có nên loại bỏ", "6 kiểu nhiễu và quyết định cho từng kiểu", "Có; bot/spam chờ nb11", sl("noise")],
    ["Sampling hay distributed", "So sánh 5 hướng; chọn sampling, bổ sung cho distributed", "Có", sl("dist")],
    ["Quan hệ giữa các node có giá trị ra sao", "5 loại quan hệ; sampler học giá trị; đo ở RQ3", "Có; số chờ nb11, R6", sl("rel")],
  ];
  s.addTable(rows, { x: 0.6, y: 1.45, w: 12.1, colW: [3.4, 5.3, 2.4, 1.0], fontFace: BF, fontSize: 12, color: C.ink, border: { type: "solid", pt: 0.5, color: C.grayLight }, rowH: 0.41, fill: { color: C.white } });
}

pres.writeFile({ fileName: path.join(__dirname, OUT_NAME) }).then((f) => console.log("wrote", f, "slides", n));
