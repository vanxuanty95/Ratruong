import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { Presentation, PresentationFile } from "@oai/artifact-tool";

const SKILL_DIR = "/Users/tyvan/.codex/plugins/cache/openai-primary-runtime/presentations/26.904.11930/skills/presentations";
const workspaceDir = "/Users/tyvan/Documents/Master/Ratruong";
const TMP_DIR = path.join(workspaceDir, "Do An/05_slides/.build-thesis-presentation-sequenced");
const FINAL_PPTX = path.join(workspaceDir, "Do An/05_slides/final-output/THESIS_PRESENTATION_vn_sequenced.pptx");
const RUNTIME_PYTHON = "/Users/tyvan/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3";

const { applyPresentationChartFont, finalizePresentation, makeNativeBulletParagraphs } = await import(
  pathToFileURL(path.join(SKILL_DIR, "container_tools/artifact_tool_utils.mjs")).href,
);

await fs.mkdir(TMP_DIR, { recursive: true });

const W = 1280;
const H = 720;
const FONT = "Arial";
const C = {
  ink: "#111317",
  muted: "#626C7A",
  lightMuted: "#8C96A5",
  grid: "#DCE2EA",
  light: "#F4F6F9",
  blue: "#3E8BFF",
  paleBlue: "#EAF3FF",
  green: "#2CA47B",
  paleGreen: "#EAF7F2",
  orange: "#F4A24C",
  paleOrange: "#FFF3E6",
  red: "#D65555",
  purple: "#7157D9",
  white: "#FFFFFF",
};
const TERM_LINE_BY_SLIDE = {
  2: "Hiểu nhanh: đây là bản đồ câu chuyện; kết quả chỉ xuất hiện sau phần thiết kế và đánh giá.",
  3: "Hiểu nhanh: pure-ID chỉ dùng ID và interaction, không có mô tả sản phẩm.",
  4: "Hiểu nhanh: node là user hoặc item; edge là interaction; propagation là truyền embedding qua edge.",
  5: "Hiểu nhanh: benchmark là bộ dữ liệu chuẩn; Graph-CF là collaborative filtering trên graph.",
  6: "Hiểu nhanh: warm-start giữ user và item đã xuất hiện trong train; retention là tỷ lệ còn lại.",
  7: "Hiểu nhanh: 0-core nghĩa là chưa lọc node ít tương tác; parent_asin là mã item.",
  8: "Hiểu nhanh: temporal split tách theo thời gian; leakage là dùng thông tin tương lai khi train.",
  9: "Hiểu nhanh: P4 xem rating 4 hoặc 5 là positive interaction cho implicit ranking.",
  10: "Hiểu nhanh: degree là số cạnh của node; density là phần cạnh thật trên mọi cặp user-item có thể.",
  11: "Hiểu nhanh: Gini cao nghĩa là interaction dồn vào ít item; head/body/tail dựa trên training degree.",
  12: "Hiểu nhanh: OOV là user hoặc item chưa có mapping train; exact catalog xếp trên toàn bộ item hợp lệ.",
  13: "Hiểu nhanh: NDCG thưởng target đứng sớm; Recall chỉ hỏi target có vào top-20 hay không.",
  14: "Hiểu nhanh: coverage đo độ rộng catalog; exposure đo phân bổ slot; semantic diversity cần metadata.",
  15: "Hiểu nhanh: sanity gate kiểm tra pipeline bằng baseline trước khi so sánh sampler.",
  16: "Hiểu nhanh: MostPop chọn item phổ biến; BPR-MF là matrix factorization; Full dùng LightGCN không sampling.",
  17: "Hiểu nhanh: M là method label; BPR là loss xếp positive cao hơn negative; budget là số mẫu tối đa mỗi layer.",
  18: "Hiểu nhanh: Gumbel tạo nhiễu ngẫu nhiên khi chọn; hub là node degree cao; frontier là node ở layer trước.",
  19: "Hiểu nhanh: seed là trạng thái ngẫu nhiên ban đầu; paired giữ cùng seed và negative draw giữa các method.",
  20: "Hiểu nhanh: mean là trung bình seed; SD là độ dao động mẫu; ba seed chưa đủ để kết luận significance.",
  21: "Hiểu nhanh: validation dùng để chọn quyết định; test chưa đọc nên không dùng để kết luận.",
};

const presentation = Presentation.create({ slideSize: { width: W, height: H } });

function addText(slide, text, x, y, w, h, opts = {}) {
  const shape = slide.shapes.add({
    geometry: "textbox",
    position: { left: x, top: y, width: w, height: h },
    fill: opts.fill ?? "none",
    line: { fill: "none", width: 0 },
  });
  shape.text = text;
  shape.text.style = {
    typeface: opts.fontFamily ?? FONT,
    fontSize: opts.fontSize ?? 24,
    bold: opts.bold ?? false,
    color: opts.color ?? C.ink,
    alignment: opts.align ?? "left",
    autoFit: opts.autoFit ?? "none",
    italic: opts.italic ?? false,
  };
  return shape;
}

function addRect(slide, x, y, w, h, fill, lineFill = "none", lineWidth = 0) {
  return slide.shapes.add({
    geometry: "rect",
    position: { left: x, top: y, width: w, height: h },
    fill,
    line: { fill: lineFill, width: lineWidth },
  });
}

function addRule(slide, x, y, w, h = 1.5, fill = C.grid) {
  return addRect(slide, x, y, w, h, fill);
}

function addHeader(slide, section, title, page, source) {
  slide.background.fill = C.white;
  addText(slide, section.toUpperCase(), 54, 30, 1130, 24, {
    fontSize: 13,
    bold: true,
    color: C.blue,
  });
  addText(slide, title, 54, 62, 1172, 58, { fontSize: 31, bold: true });
  addRule(slide, 54, 661, 1172, 1.5, C.grid);
  addText(slide, source, 54, 670, 1050, 16, { fontSize: 10, color: C.lightMuted });
  const actualPage = presentation.slides.items.length;
  const termLine = TERM_LINE_BY_SLIDE[actualPage];
  if (termLine) addText(slide, termLine, 54, 646, 1120, 12, { fontSize: 9, color: C.lightMuted, italic: true });
  addText(slide, String(actualPage).padStart(2, "0"), 1175, 669, 50, 16, {
    fontSize: 10,
    color: C.lightMuted,
    align: "right",
  });
}

function addSourceLine(slide, source) {
  addText(slide, source, 54, 670, 1050, 16, { fontSize: 10, color: C.lightMuted });
}

function addBlackStrip(slide, text, y = 605, x = 54, w = 1172) {
  addRect(slide, x, y, w, 38, C.ink);
  addText(slide, text, x + 16, y + 8, w - 32, 22, {
    fontSize: 15,
    bold: true,
    color: C.white,
    align: "center",
  });
}

function addCallout(slide, label, value, x, y, w, color = C.green, sub = "") {
  addText(slide, label.toUpperCase(), x, y, w, 17, { fontSize: 11, bold: true, color });
  addText(slide, value, x, y + 19, w, 39, { fontSize: 29, bold: true, color: C.ink });
  if (sub) addText(slide, sub, x, y + 60, w, 34, { fontSize: 14, color: C.muted });
}

function styleTable(table, opts = {}) {
  table.borders.assign({ style: "solid", fill: C.grid, width: 1 });
  table.cells.block({ row: 0, column: 0, rowCount: opts.rows, columnCount: opts.columns }).assign({
    fill: C.white,
    textStyle: { typeface: FONT, fontSize: opts.fontSize ?? 15, color: C.ink },
    margins: { left: 8, right: 8, top: 6, bottom: 6 },
  });
  table.cells.block({ row: 0, column: 0, rowCount: 1, columnCount: opts.columns }).assign({
    fill: C.ink,
    textStyle: { typeface: FONT, fontSize: opts.headerSize ?? 14, color: C.white, bold: true },
  });
  for (let r = 1; r < opts.rows; r += 1) {
    if (r % 2 === 0) {
      table.cells.block({ row: r, column: 0, rowCount: 1, columnCount: opts.columns }).fill = C.light;
    }
  }
}

function chartFont(chart) {
  applyPresentationChartFont(chart, { fontFamily: FONT });
  return chart;
}

function notes(slide, lines) {
  slide.speakerNotes.textFrame.setText(lines.join("\n"));
  slide.speakerNotes.setVisible(true);
}

// 01 — cover
{
  const slide = presentation.slides.add();
  slide.background.fill = C.white;
  addText(slide, "LUẬN VĂN THẠC SĨ | BẢN TỔNG HỢP BẰNG CHỨNG", 54, 40, 820, 24, {
    fontSize: 13,
    bold: true,
    color: C.blue,
  });
  addText(slide, "Lấy mẫu đồ thị cho hệ thống\ngợi ý quy mô lớn bằng GNN", 54, 106, 900, 135, {
    fontSize: 44,
    bold: true,
  });
  addText(slide, "Amazon Reviews’23 Baby_Products | temporal warm-start | pure-ID", 54, 266, 880, 30, {
    fontSize: 20,
    color: C.muted,
  });
  addText(slide, "Mục tiêu buổi trình bày", 54, 350, 340, 22, { fontSize: 14, bold: true, color: C.blue });
  addText(slide, "Giải thích dữ liệu, cách đo và cách lấy mẫu trước khi đọc kết quả.", 54, 384, 900, 38, { fontSize: 26, bold: true });
  const coverBlocks = [
    ["Dữ liệu", "Rating theo thời gian trên user-item graph"],
    ["Câu hỏi", "Sampler thay đổi context có ích cho ranking không?"],
    ["Bằng chứng", "Validation đã khóa; test target chưa đọc"],
  ];
  for (let i = 0; i < coverBlocks.length; i += 1) {
    const x = 54 + i * 386;
    addText(slide, coverBlocks[i][0].toUpperCase(), x, 472, 315, 18, { fontSize: 12, bold: true, color: [C.blue, C.green, C.orange][i] });
    addText(slide, coverBlocks[i][1], x, 502, 330, 52, { fontSize: 17, bold: true });
    if (i < 2) addRule(slide, x + 350, 465, 1, 98, C.grid);
  }
  addText(slide, "16/09/2026", 54, 592, 200, 22, { fontSize: 14, color: C.muted });
  addRule(slide, 54, 661, 1172, 1.5, C.grid);
  addText(slide, "Nguồn: Amazon Reviews’23 + artifact dự án đã audit", 54, 670, 1020, 16, {
    fontSize: 10,
    color: C.lightMuted,
  });
  addText(slide, "01", 1175, 669, 50, 16, { fontSize: 10, color: C.lightMuted, align: "right" });
  notes(slide, [
    "Mục tiêu trình bày: tổng hợp toàn bộ chuỗi bằng chứng từ dữ liệu đến quyết định nghiên cứu.",
    "Nguồn chính: https://amazon-reviews-2023.github.io/",
    "Slide mở đầu chỉ giới thiệu phạm vi và lộ trình trình bày, không nêu kết quả.",
  ]);
}

// 02 — research roadmap
{
  const slide = presentation.slides.add();
  addHeader(slide, "00 / BẢN ĐỒ", "Mạch trình bày đi từ dữ liệu đến câu trả lời", 2, "Nguồn: research plan; data story; validation protocol");
  const xs = [54, 447, 840];
  const widths = [330, 330, 386];
  const headings = ["DỮ LIỆU", "CẤU TRÚC", "THỰC NGHIỆM"];
  const colors = [C.blue, C.green, C.orange];
  const bodies = [
    ["Nguồn chính thức", "Schema và P4", "Temporal split", "Population được đánh giá"],
    ["Sparsity và singleton", "Long tail", "Head, body, tail", "Warm-start retention"],
    ["Metric và baseline", "LightGCN + BPR", "M0, M1, M2", "Paired validation"],
  ];
  for (let i = 0; i < 3; i += 1) {
    addText(slide, headings[i], xs[i], 159, widths[i], 24, { fontSize: 14, bold: true, color: colors[i] });
    addText(slide, bodies[i].join("\n"), xs[i], 201, widths[i], 174, { fontSize: 22, bold: i === 2 });
    if (i < 2) addRule(slide, xs[i] + widths[i] + 31, 150, 2, 280, C.grid);
  }
  addRect(slide, 54, 458, 1172, 95, C.light);
  addText(slide, "CÁCH ĐỌC DECK", 72, 475, 180, 20, { fontSize: 12, bold: true, color: C.green });
  addText(slide, "Mỗi phần trả lời một câu: dữ liệu có đáng tin không, metric đo gì, sampler thay đổi gì, rồi kết quả nói được gì.", 72, 505, 1125, 29, { fontSize: 21, bold: true });
  addBlackStrip(slide, "Kết quả và kết luận chỉ xuất hiện sau khi đã có ngữ cảnh để đọc chúng");
  notes(slide, [
    "Slide này chỉ dẫn đường, không công bố kết quả.",
    "Các phần sau theo thứ tự: dữ liệu, metric, thiết kế, baseline, sampler, result, conclusion.",
  ]);
}

// 03 — research question and boundary
{
  const slide = presentation.slides.add();
  addHeader(slide, "00 / CÂU HỎI", "Câu hỏi nghiên cứu và phạm vi", 2, "Nguồn: PHASE2_RESEARCH_PLAN_vn.md; BPR; LightGCN");
  addText(slide, "CÂU HỎI", 54, 148, 200, 20, { fontSize: 12, bold: true, color: C.blue });
  addText(slide, "Khi giữ nguyên mô hình, dữ liệu, budget và evaluator, cách lấy context nào tạo ranking tốt hơn với chi phí chấp nhận được?", 54, 181, 1080, 70, {
    fontSize: 28, bold: true,
  });
  addRule(slide, 54, 278, 1132, 1, C.grid);
  const cols = [54, 432, 810];
  const blocks = [
    ["Đối tượng", "Gợi ý top-20 trên graph user–item, temporal warm-start, pure-ID."],
    ["Can thiệp", "Chỉ thay sampler M0, M1, M2. Context là các node và edge lân cận được dùng để truyền thông tin trong batch/layer."],
    ["Ranh giới", "Kết luận chỉ dùng validation. Không suy ra semantic relevance, cold-start, ý nghĩa thống kê, hay kết quả test."],
  ];
  for (let i = 0; i < blocks.length; i += 1) {
    addText(slide, blocks[i][0].toUpperCase(), cols[i], 327, 315, 20, { fontSize: 12, bold: true, color: [C.blue, C.green, C.orange][i] });
    addText(slide, blocks[i][1], cols[i], 359, 320, 115, { fontSize: 18, bold: i === 1 });
    if (i < 2) addRule(slide, cols[i] + 338, 318, 1, 170, C.grid);
  }
  addRect(slide, 54, 532, 1132, 45, C.paleBlue);
  addText(slide, "Mục tiêu là một so sánh có kiểm soát, không phải chứng minh sampler phức tạp luôn tốt hơn.", 72, 544, 1090, 22, { fontSize: 16, bold: true });
  addBlackStrip(slide, "Câu hỏi đúng giúp kết quả âm vẫn có giá trị khoa học", 606);
  notes(slide, [
    "BPR: https://arxiv.org/abs/1205.2618",
    "LightGCN: https://hexiangnan.github.io/papers/sigir20-LightGCN.pdf",
    "Phạm vi và protocol: Do An/00_project/PHASE2_RESEARCH_PLAN_vn.md",
  ]);
}

// 03 — what context means
{
  const slide = presentation.slides.add();
  addHeader(slide, "00 / KHÁI NIỆM", "Context là phần graph model được nhìn thấy trong một batch", 3, "Nguồn: THESIS_REPORT_vn.md, Section 1 and 4");
  addText(slide, "Trong graph recommendation, user và item là node; rating tích cực là edge. LightGCN học embedding bằng cách truyền tín hiệu qua các edge.", 54, 150, 1120, 54, { fontSize: 22, bold: true });
  const blocks = [
    ["Target batch", "Những user–item interaction đang dùng để cập nhật model."],
    ["Context", "Các node và edge lân cận được lấy thêm để propagation trong từng layer."],
    ["Sampler", "Quy tắc quyết định node lân cận nào được lấy khi không thể dùng toàn graph."],
  ];
  for (let i = 0; i < blocks.length; i += 1) {
    const x = 54 + i * 390;
    addText(slide, blocks[i][0].toUpperCase(), x, 278, 330, 20, { fontSize: 13, bold: true, color: [C.blue, C.green, C.orange][i] });
    addText(slide, blocks[i][1], x, 316, 320, 88, { fontSize: 20, bold: i === 1 });
    if (i < 2) addRule(slide, x + 350, 268, 1, 170, C.grid);
  }
  addRect(slide, 54, 476, 1132, 64, C.paleBlue);
  addText(slide, "Sampler không đổi target hay metric. Nó đổi thông tin hàng xóm mà model nhận được để học từ target đó.", 75, 495, 1080, 28, { fontSize: 20, bold: true });
  addBlackStrip(slide, "Câu hỏi thực nghiệm: context khác có giúp xếp đúng item mục tiêu tốt hơn không?", 606);
  notes(slide, [
    "Định nghĩa context: Do An/04_thesis/THESIS_REPORT_vn.md, Sections 1.1 and 4.",
    "Không có claim rằng sampler thay đổi semantic meaning của sản phẩm.",
  ]);
}

// 04 — external benchmark landscape
{
  const slide = presentation.slides.add();
  addHeader(slide, "01 / LỰA CHỌN DỮ LIỆU", "Các benchmark ngoài Amazon đã được xem xét", 3, "Nguồn: GroupLens; LightGCN; MIND; KuaiRec");
  const table = slide.tables.add({
    rows: 5, columns: 4, left: 54, top: 145, width: 1172, height: 338,
    columnWidths: [200, 260, 365, 347],
    values: [
      ["Bộ dữ liệu", "Được dùng phổ biến cho", "Điểm phù hợp", "Vì sao chưa chạy trong nghiên cứu này"],
      ["MovieLens 25M", "Collaborative filtering", "25M rating, 162.541 user, 62.423 phim; có tag", "Khác miền sản phẩm và khác cấu trúc long-tail Amazon"],
      ["Gowalla / Yelp2018", "Graph-CF", "LightGCN dùng hai benchmark này", "Phù hợp để mở rộng sau này, chưa phải thực nghiệm hiện tại"],
      ["MIND / KuaiRec", "Content / exposure", "MIND có text; KuaiRec gần fully observed", "Khác pure-ID e-commerce hoặc không đại diện graph thưa quy mô lớn"],
      ["Amazon Reviews’23", "E-commerce recommendation", "Có category, review theo thời gian và volume lớn", "Được chọn sau audit nội bộ, không phải vì là lựa chọn duy nhất"],
    ],
  });
  styleTable(table, { rows: 5, columns: 4, fontSize: 14, headerSize: 14 });
  addRect(slide, 54, 514, 1132, 53, C.paleOrange);
  addText(slide, "Các bộ trên là benchmark tham khảo. Nghiên cứu này chỉ chạy Amazon Reviews’23 Baby_Products.", 70, 530, 1090, 22, { fontSize: 16, bold: true });
  addBlackStrip(slide, "Dữ liệu phải khớp câu hỏi và giới hạn đo lường, không chỉ cần nổi tiếng", 606);
  notes(slide, [
    "MovieLens 25M: https://grouplens.org/datasets/movielens/25m/",
    "LightGCN benchmark context: https://hexiangnan.github.io/papers/sigir20-LightGCN.pdf",
    "MIND: https://aclanthology.org/2020.acl-main.331/",
    "KuaiRec: https://arxiv.org/abs/2202.10842",
    "Không có run/project result nào trên MovieLens, Gowalla, Yelp2018, MIND, hoặc KuaiRec.",
  ]);
}

// 04 — audited Amazon selection
{
  const slide = presentation.slides.add();
  addHeader(slide, "01 / LỰA CHỌN DỮ LIỆU", "Vì sao Baby_Products là bộ dữ liệu thực nghiệm", 4, "Nguồn: DATASET_PORTFOLIO_AND_ANALYSIS_PROTOCOL_vn.md; audit artifacts");
  const chart = slide.charts.add("bar", {
    position: { left: 54, top: 158, width: 520, height: 305 },
    categories: ["All_Beauty", "Baby_Products"],
    series: [{ name: "Raw review (triệu)", values: [0.693929, 5.953891], fill: C.blue, valuesFormatCode: "0.0" }],
    barOptions: { direction: "column", grouping: "clustered", gapWidth: 55 }, hasLegend: false,
    xAxis: { textStyle: { typeface: FONT, fontSize: 13, fill: C.muted }, majorGridlines: null },
    yAxis: { min: 0, max: 6.5, majorUnit: 1, textStyle: { typeface: FONT, fontSize: 11, fill: C.muted }, majorGridlines: { style: "solid", fill: C.grid, width: 1 } },
    dataLabels: { showValue: true, position: "outEnd", textStyle: { typeface: FONT, fontSize: 12, fill: C.ink, bold: true } },
    chartFill: C.white, plotAreaFill: C.white, chartLine: { fill: "none", width: 0 }, plotAreaLine: { fill: "none", width: 0 },
  });
  chartFont(chart);
  const table = slide.tables.add({
    rows: 4, columns: 4, left: 630, top: 150, width: 560, height: 282,
    columnWidths: [180, 125, 125, 130],
    values: [
      ["Tiêu chí", "All_Beauty", "Baby_Products", "Home_and_Kitchen"],
      ["Raw row", "693.929", "5.953.891", "66.623.880"],
      ["Vai trò", "Schema/pipeline", "Benchmark chính", "Chỉ provenance"],
      ["Đánh giá", "Warm validation 3,98%", "Warm validation 21,90%", "Chưa full protocol"],
    ],
  });
  styleTable(table, { rows: 4, columns: 4, fontSize: 13, headerSize: 12 });
  addText(slide, "LÝ DO CHỌN", 630, 473, 200, 18, { fontSize: 12, bold: true, color: C.green });
  addText(slide, "Baby có nhiều interaction hơn All_Beauty, long tail rõ, đủ lớn để stress sampling, nhưng vẫn chạy được trong ngân sách Colab đã kiểm chứng.", 630, 502, 540, 62, { fontSize: 17, bold: true });
  addText(slide, "Home_and_Kitchen lớn hơn 11,19 lần Baby. Ta chỉ biết provenance và quy mô, chưa được quyền dùng nó để nói về performance.", 54, 495, 520, 52, { fontSize: 15, color: C.muted });
  addBlackStrip(slide, "Lựa chọn Baby dựa trên audit và khả năng thực nghiệm, không dựa trên score model", 606);
  notes(slide, [
    "All_Beauty raw rows: 693,929. Baby_Products raw rows: 5,953,891. Home_and_Kitchen raw rows: 66,623,880.",
    "All_Beauty P4 validation warm retention: 3.982%. Baby validation warm retention: 21.9038%.",
    "Amazon Reviews’23: https://amazon-reviews-2023.github.io/main.html",
    "Project evidence: Do An/06_code/results/data_story/data_story_summary.json and audit artifacts.",
  ]);
}

// 03 — source and schema
{
  const slide = presentation.slides.add();
  addHeader(slide, "01 / NGUỒN", "Nguồn chính thức và tệp thực sự được dùng", 3, "Nguồn: Amazon Reviews’23; Baby_Products_protocol_audit.json");
  addText(slide, "McAuley Lab — Amazon Reviews’23", 54, 140, 500, 28, { fontSize: 21, bold: true });
  addText(slide, "Category: Baby_Products, benchmark 0-core, rating_only", 54, 176, 610, 26, {
    fontSize: 17,
    color: C.muted,
  });
  const table = slide.tables.add({
    rows: 5,
    columns: 3,
    left: 54,
    top: 225,
    width: 680,
    height: 250,
    columnWidths: [180, 130, 370],
    values: [
      ["Trường", "Kiểu", "Ý nghĩa trong nghiên cứu"],
      ["user_id", "string", "ID người đánh giá, dùng làm node user"],
      ["parent_asin", "string", "ID cha sản phẩm, dùng làm node item"],
      ["rating", "float", "Điểm 1–5; dự án đổi thành positive khi ≥4"],
      ["timestamp", "int (ms)", "Thứ tự thời gian để tách train/validation/test"],
    ],
  });
  styleTable(table, { rows: 5, columns: 3, fontSize: 15 });
  addRule(slide, 790, 143, 2, 386, C.grid);
  addCallout(slide, "Tệp tải chính xác", "148.609.233 bytes", 835, 148, 330, C.blue, "Baby_Products.csv.gz");
  addCallout(slide, "SHA-256", "e2a8d049…c279e", 835, 260, 330, C.green, "Nhận diện đúng byte nguồn");
  addText(slide, "URL artifact", 835, 376, 320, 18, { fontSize: 12, bold: true, color: C.orange });
  addText(slide, "datarepo.eng.ucsd.edu/…/0core/\nrating_only/Baby_Products.csv.gz", 835, 399, 340, 58, {
    fontSize: 16,
    color: C.ink,
  });
  addRect(slide, 835, 478, 325, 58, C.paleOrange);
  addText(slide, "Không dùng title/category/text/metadata\ntrong task chính.", 850, 490, 295, 39, {
    fontSize: 15,
    bold: true,
  });
  addBlackStrip(slide, "Nguồn chính thức cung cấp schema; artifact audit cung cấp byte, checksum và quy tắc dự án");
  notes(slide, [
    "Nguồn chính thức Amazon Reviews’23: https://amazon-reviews-2023.github.io/",
    "Ví dụ tải rating-only JSON/CSV và bốn trường: https://amazon-reviews-2023.github.io/data_loading/jsonl.html",
    "Artifact URL: https://datarepo.eng.ucsd.edu/mcauley_group/data/amazon_2023/benchmark/0core/rating_only/Baby_Products.csv.gz",
    "Audit cục bộ: Do An/06_code/results/Baby_Products_protocol_audit.json",
    "SHA đầy đủ: e2a8d0498afed767ee2615db7fac549559d82490b1a73c7241b84b5e9e8c279e",
  ]);
}

// 04 — pipeline and timeline
{
  const slide = presentation.slides.add();
  addHeader(slide, "02 / PIPELINE", "Phân tích đi theo thời gian, không nhìn test để chọn phương pháp", 4, "Nguồn: baby_p4_g2c_manifest.json; audit cutoffs t1/t2");
  const x = [54, 290, 526, 762, 998];
  const labels = ["RAW", "QUARANTINE", "P4", "TEMPORAL SPLIT", "WARM FILTER"];
  const values = ["5.953.891", "1 rating = 0,0", "4.655.843", "t1 / t2", "train-only map"];
  const subs = [
    "parsed row",
    "khỏi [1,5]",
    "rating 4–5",
    "11/08/2021 đến 16/07/2022",
    "user & item phải đã thấy",
  ];
  for (let i = 0; i < x.length; i += 1) {
    addText(slide, labels[i], x[i], 158, 185, 20, { fontSize: 12, bold: true, color: i === 1 ? C.orange : C.blue });
    addText(slide, values[i], x[i], 191, 185, 34, { fontSize: 24, bold: true });
    addText(slide, subs[i], x[i], 231, 190, 42, { fontSize: 14, color: C.muted });
    if (i < x.length - 1) {
      addRule(slide, x[i] + 187, 210, 37, 2, C.grid);
      addRule(slide, x[i] + 191, 210, 22, 2, C.lightMuted);
    }
  }
  addText(slide, "ARTIFACT SAU KHI KHÓA", 54, 327, 280, 20, { fontSize: 12, bold: true, color: C.green });
  const outputs = [
    ["TRAIN GRAPH", "3.868.654 edge", "Model chỉ nhìn quá khứ"],
    ["VALIDATION", "81.871 warm target", "Dùng development evidence"],
    ["TEST", "40.587 warm target", "Đã tạo artifact, chưa đọc target"],
  ];
  for (let i = 0; i < outputs.length; i += 1) {
    const ox = 54 + i * 390;
    addRect(slide, ox, 364, 350, 125, i === 2 ? C.paleOrange : C.light);
    addText(slide, outputs[i][0], ox + 18, 380, 310, 19, { fontSize: 12, bold: true, color: i === 2 ? C.orange : C.green });
    addText(slide, outputs[i][1], ox + 18, 409, 310, 30, { fontSize: 24, bold: true });
    addText(slide, outputs[i][2], ox + 18, 450, 310, 28, { fontSize: 14, color: C.muted });
  }
  addRect(slide, 54, 519, 1130, 45, C.paleBlue);
  addText(slide, "Không leakage: mapping/cohort học từ train; evaluator loại strict prior history; model selection chỉ dùng validation.", 70, 531, 1095, 22, {
    fontSize: 16,
    bold: true,
  });
  addBlackStrip(slide, "P4 là phép biến đổi của dự án, không phải nhãn có sẵn của nguồn");
  notes(slide, [
    "Cutoff t1 = 1628643414042 ms = 2021-08-11 00:56:54 UTC.",
    "Cutoff t2 = 1658002729837 ms = 2022-07-16 20:18:49 UTC.",
    "Nguồn: Do An/06_code/results/baby_p4_g2c_manifest.json và Baby_Products_protocol_audit.json.",
    "Test target đã được tạo trong pipeline nhưng test_targets_read=false trong mọi validation summary.",
  ]);
}

// 05 — rating quality
{
  const slide = presentation.slides.add();
  addHeader(slide, "03 / CHẤT LƯỢNG DỮ LIỆU", "Rating lệch mạnh về phía tích cực; P4 giữ 78,20%", 5, "Nguồn: data_story_summary.json / source.rating_counts");
  const chart = slide.charts.add("bar", {
    position: { left: 54, top: 160, width: 730, height: 365 },
    categories: ["1★", "2★", "3★", "4★", "5★"],
    series: [{
      name: "Tỷ lệ raw row",
      values: [0.0932875661, 0.0519980967, 0.0727309250, 0.1145430778, 0.6674401664],
      fill: C.muted,
      valuesFormatCode: "0%",
      points: [{ idx: 3, fill: C.green }, { idx: 4, fill: C.green }],
    }],
    barOptions: { direction: "column", grouping: "clustered", gapWidth: 52 },
    hasLegend: false,
    xAxis: { textStyle: { typeface: FONT, fontSize: 14, fill: C.muted }, majorGridlines: null },
    yAxis: {
      min: 0,
      max: 0.75,
      majorUnit: 0.15,
      numberFormatCode: "0%",
      textStyle: { typeface: FONT, fontSize: 12, fill: C.muted },
      majorGridlines: { style: "solid", fill: C.grid, width: 1 },
    },
    dataLabels: { showValue: true, position: "outEnd", textStyle: { typeface: FONT, fontSize: 12, fill: C.ink, bold: true } },
    chartFill: C.white,
    plotAreaFill: C.white,
    chartLine: { fill: "none", width: 0 },
    plotAreaLine: { fill: "none", width: 0 },
  });
  chartFont(chart);
  addCallout(slide, "Raw rows", "5.953.891", 845, 165, 315, C.blue, "0 missing / parse-invalid");
  addCallout(slide, "Duplicate pair", "0", 845, 276, 315, C.green, "user–item exact audit");
  addCallout(slide, "Ngoài [1,5]", "1", 845, 387, 315, C.orange, "rating 0,0 đã quarantine");
  addRect(slide, 845, 503, 315, 52, C.paleGreen);
  addText(slide, "Positive edge = rating 4 hoặc 5", 860, 518, 285, 22, { fontSize: 16, bold: true });
  addBlackStrip(slide, "5★ chiếm 66,74%: training signal vốn đã không cân bằng");
  notes(slide, [
    "Rating counts: 0★=1, 1★=555424, 2★=309591, 3★=433032, 4★=681977, 5★=3973866.",
    "P4 rows = 4,655,843; retention = 0.7819832442.",
    "Nguồn: Do An/06_code/results/data_story/data_story_summary.json.",
  ]);
}

// 06 — scale and sparsity
{
  const slide = presentation.slides.add();
  addHeader(slide, "04 / GRAPH", "Graph lớn, nhưng lịch sử của phần lớn node rất mỏng", 6, "Nguồn: data_story_summary.json / training_graph");
  const chart = slide.charts.add("bar", {
    position: { left: 54, top: 160, width: 700, height: 340 },
    categories: ["User", "Item"],
    series: [
      { name: "Singleton", values: [0.7176341539, 0.3334957594], fill: C.blue, valuesFormatCode: "0.0%" },
      { name: "Degree > 1", values: [0.2823658461, 0.6665042406], fill: C.green, valuesFormatCode: "0.0%" },
    ],
    barOptions: { direction: "column", grouping: "percentStacked", gapWidth: 55 },
    hasLegend: true,
    legend: { position: "bottom", overlay: false, textStyle: { typeface: FONT, fontSize: 12, fill: C.muted } },
    xAxis: { textStyle: { typeface: FONT, fontSize: 14, fill: C.muted }, majorGridlines: null },
    yAxis: { min: 0, max: 1, majorUnit: 0.2, numberFormatCode: "0%", majorGridlines: { style: "solid", fill: C.grid, width: 1 } },
    dataLabels: { showValue: true, position: "center", textStyle: { typeface: FONT, fontSize: 13, fill: C.white, bold: true } },
    chartFill: C.white,
    plotAreaFill: C.white,
    chartLine: { fill: "none", width: 0 },
    plotAreaLine: { fill: "none", width: 0 },
  });
  chartFont(chart);
  addCallout(slide, "Training graph", "3.868.654 edge", 805, 150, 360, C.blue, "2.318.308 user, 162.125 item");
  addCallout(slide, "Density", "1,0293 × 10⁻⁵", 805, 267, 360, C.orange, "Bipartite graph cực thưa");
  addCallout(slide, "Largest component", "96,50% node", 805, 384, 360, C.green, "2.393.587 / 2.480.433 node");
  addRect(slide, 54, 518, 1130, 50, C.light);
  addText(slide, "Degree p50 / p90 / p99", 70, 533, 220, 20, { fontSize: 13, bold: true, color: C.muted });
  addText(slide, "User  1 / 3 / 9", 315, 530, 290, 25, { fontSize: 18, bold: true });
  addText(slide, "Item  3 / 32 / 397", 660, 530, 330, 25, { fontSize: 18, bold: true });
  addBlackStrip(slide, "Mean metric không đủ: phải xem theo cohort user activity và item popularity");
  notes(slide, [
    "Training graph: 3,868,654 edges; 2,318,308 users; 162,125 items; density 1.0292924e-05.",
    "User singleton 71.7634%; item singleton 33.3496%.",
    "Largest connected component: 96.4988% nodes.",
    "Nguồn: data_story_summary.json.",
  ]);
}

// 07 — popularity concentration
{
  const slide = presentation.slides.add();
  addHeader(slide, "05 / POPULARITY", "1% item giữ 44,09% training interaction", 7, "Nguồn: data story top-item shares + cohorts_v1.json");
  const c1 = slide.charts.add("bar", {
    position: { left: 54, top: 158, width: 555, height: 350 },
    categories: ["Top 1%", "Top 5%", "Top 10%", "Top 20%"],
    series: [{ name: "Tỷ lệ interaction tích lũy", values: [0.4409414747, 0.7111744808, 0.8132650271, 0.8964559767], fill: C.orange, valuesFormatCode: "0%" }],
    barOptions: { direction: "column", grouping: "clustered", gapWidth: 45 },
    hasLegend: false,
    xAxis: { textStyle: { typeface: FONT, fontSize: 12, fill: C.muted }, majorGridlines: null },
    yAxis: { min: 0, max: 1, majorUnit: 0.2, numberFormatCode: "0%", majorGridlines: { style: "solid", fill: C.grid, width: 1 } },
    dataLabels: { showValue: true, position: "outEnd", textStyle: { typeface: FONT, fontSize: 12, fill: C.ink, bold: true } },
    chartFill: C.white,
    plotAreaFill: C.white,
    chartLine: { fill: "none", width: 0 },
    plotAreaLine: { fill: "none", width: 0 },
  });
  chartFont(c1);
  const c2 = slide.charts.add("bar", {
    position: { left: 650, top: 158, width: 540, height: 350 },
    categories: ["Tỷ lệ item", "Tỷ lệ interaction"],
    series: [
      { name: "Head ≥397", values: [0.0100, 0.4416], fill: C.blue, valuesFormatCode: "0%" },
      { name: "Body 13–396", values: [0.1892, 0.4545], fill: C.green, valuesFormatCode: "0%" },
      { name: "Tail ≤12", values: [0.8007, 0.1039], fill: C.orange, valuesFormatCode: "0%" },
    ],
    barOptions: { direction: "column", grouping: "percentStacked", gapWidth: 45 },
    hasLegend: true,
    legend: { position: "bottom", overlay: false, textStyle: { typeface: FONT, fontSize: 11, fill: C.muted } },
    xAxis: { textStyle: { typeface: FONT, fontSize: 12, fill: C.muted }, majorGridlines: null },
    yAxis: { min: 0, max: 1, majorUnit: 0.2, numberFormatCode: "0%", majorGridlines: { style: "solid", fill: C.grid, width: 1 } },
    dataLabels: { showValue: true, position: "center", textStyle: { typeface: FONT, fontSize: 11, fill: C.white, bold: true } },
    chartFill: C.white,
    plotAreaFill: C.white,
    chartLine: { fill: "none", width: 0 },
    plotAreaLine: { fill: "none", width: 0 },
  });
  chartFont(c2);
  addText(slide, "Gini item-degree = 0,8584", 54, 520, 330, 30, { fontSize: 22, bold: true, color: C.orange });
  addText(slide, "44,09% = exact top-1% cumulative; 44,16% = cohort head tie-aware.", 400, 524, 790, 24, {
    fontSize: 14,
    color: C.muted,
  });
  addBlackStrip(slide, "Accuracy phải đi cùng coverage, exposure và hit theo head/body/tail");
  notes(slide, [
    "Top-item cumulative interaction shares: 1%=44.0941%, 5%=71.1174%, 10%=81.3265%, 20%=89.6456%.",
    "Frozen cohort shares: head 1.00% items / 44.16% edges; body 18.92% / 45.45%; tail 80.07% / 10.39%.",
    "Hai số 44.09% và 44.16% dùng cách cắt khác nhau; slide ghi rõ để tránh coi chúng là cùng một statistic.",
  ]);
}

// 08 — temporal population
{
  const slide = presentation.slides.add();
  addHeader(slide, "06 / PHẠM VI", "Warm-start chỉ giữ 21,90% validation và 9,82% test", 8, "Nguồn: data_story_summary.json / temporal_population");
  const chart = slide.charts.add("bar", {
    position: { left: 54, top: 165, width: 760, height: 330 },
    categories: ["Validation", "Test"],
    series: [
      { name: "Warm retained", values: [0.2190376054, 0.0981754323], fill: C.green, valuesFormatCode: "0.0%" },
      { name: "Loại do user/item OOV", values: [0.7809623946, 0.9018245677], fill: "#D7DEE8", valuesFormatCode: "0.0%" },
    ],
    barOptions: { direction: "bar", grouping: "percentStacked", gapWidth: 55 },
    hasLegend: true,
    legend: { position: "bottom", overlay: false, textStyle: { typeface: FONT, fontSize: 12, fill: C.muted } },
    xAxis: { min: 0, max: 1, majorUnit: 0.2, numberFormatCode: "0%", majorGridlines: { style: "solid", fill: C.grid, width: 1 } },
    yAxis: { textStyle: { typeface: FONT, fontSize: 13, fill: C.muted }, majorGridlines: null },
    dataLabels: { showValue: true, position: "center", textStyle: { typeface: FONT, fontSize: 12, fill: C.ink, bold: true } },
    chartFill: C.white,
    plotAreaFill: C.white,
    chartLine: { fill: "none", width: 0 },
    plotAreaLine: { fill: "none", width: 0 },
  });
  chartFont(chart);
  addCallout(slide, "Validation", "81.871 / 373.776", 850, 165, 330, C.green, "warm target / candidate row");
  addCallout(slide, "Test", "40.587 / 413.413", 850, 284, 330, C.blue, "warm target / candidate row");
  addRect(slide, 850, 417, 330, 118, C.paleOrange);
  addText(slide, "RANH GIỚI CLAIM", 866, 432, 298, 20, { fontSize: 12, bold: true, color: C.orange });
  addText(slide, "Chỉ temporal warm-start, pure-ID.\nKhông suy ra cold-start toàn dữ liệu.", 866, 461, 298, 58, {
    fontSize: 17,
    bold: true,
  });
  addBlackStrip(slide, "Test artifact tồn tại nhưng target chưa được đọc trong validation");
  notes(slide, [
    "Validation: 81,871 warm / 373,776 candidate = 21.9038%.",
    "Test: 40,587 warm / 413,413 candidate = 9.8175%.",
    "Ranh giới này bắt buộc: kết quả không đại diện cho unseen user/item.",
  ]);
}

// 09 — research question and metrics
{
  const slide = presentation.slides.add();
  addHeader(slide, "07 / METRIC", "NDCG@20 và Recall@20 đọc chất lượng ranking khác nhau", 9, "Nguồn nền tảng: BPR (UAI 2009), LightGCN (SIGIR 2020)");
  addRect(slide, 54, 142, 1172, 72, C.ink);
  addText(slide, "Mỗi dòng validation có một item mục tiêu. Hai metric đầu tiên trả lời: item đó có vào top 20 không, và nếu có thì đứng ở đâu?", 78, 158, 1124, 43, {
    fontSize: 18,
    bold: true,
    color: C.white,
    align: "center",
  });
  addText(slide, "NDCG@20", 54, 259, 300, 20, { fontSize: 12, bold: true, color: C.blue });
  const fixedList = addText(slide, "", 54, 293, 525, 205, { fontSize: 18 });
  fixedList.text = makeNativeBulletParagraphs([
    "Hit ở rank 1 giá trị hơn hit ở rank 20, nên NDCG là metric chính.",
    "Với một target mỗi dòng, hit ở rank r nhận điểm 1/log₂(r+1).",
    "Miss hoặc rank ngoài 20 nhận điểm 0.",
  ], { marginLeftPoints: 16, hangingPoints: 8, spaceAfterPoints: 3 });
  fixedList.text.style = { typeface: FONT, fontSize: 18, color: C.ink, autoFit: "none" };
  addRule(slide, 615, 250, 2, 300, C.grid);
  addText(slide, "RECALL@20", 660, 259, 300, 20, { fontSize: 12, bold: true, color: C.green });
  const metricRows = [
    ["Câu hỏi", "Item mục tiêu có xuất hiện trong 20 item đầu không?", C.green],
    ["Điểm", "Có hit là 1, không hit là 0. Không phân biệt rank 1 và 20.", C.blue],
    ["Vai trò", "Dễ hiểu, nhưng phải đi cùng NDCG để không bỏ qua thứ tự.", C.orange],
    ["Evaluator", "Xếp hạng exact trên toàn bộ training catalog hợp lệ, không sampled ranking.", C.red],
  ];
  for (let i = 0; i < metricRows.length; i += 1) {
    const yy = 295 + i * 60;
    addText(slide, metricRows[i][0], 660, yy, 150, 22, { fontSize: 14, bold: true, color: metricRows[i][2] });
    addText(slide, metricRows[i][1], 830, yy - 2, 355, 28, { fontSize: 17, bold: i === 0 });
    if (i < metricRows.length - 1) addRule(slide, 660, yy + 39, 525, 1, C.grid);
  }
  addRect(slide, 660, 527, 525, 42, C.paleOrange);
  addText(slide, "NDCG và Recall đo ranking target, chưa nói gì về đa dạng hay nghĩa của item.", 675, 538, 495, 22, {
    fontSize: 14,
    bold: true,
  });
  addBlackStrip(slide, "NDCG ưu tiên thứ hạng sớm; Recall trả lời trực tiếp tỷ lệ tìm được target");
  notes(slide, [
    "BPR: https://www.cs.mcgill.ca/~uai2009/papers/UAI2009_0139_48141db02b9f0b02bc7158819ebfa2c7.pdf",
    "LightGCN: https://hexiangnan.github.io/papers/sigir20-LightGCN.pdf",
    "Graph sampling context: GraphSAGE https://papers.nips.cc/paper_files/paper/2017/hash/5dd9db5e033da9c6fb5ba83c7a7ebea9-Abstract.html",
    "FastGCN: https://openreview.net/pdf?id=rytstxWAW",
    "LADIES: https://proceedings.neurips.cc/paper/2019/hash/91ba4a4478a66bee9812b0804b6f9d1b-Abstract.html",
  ]);
}

// 10 — distribution, diversity, and cost diagnostics
{
  const slide = presentation.slides.add();
  addHeader(slide, "07 / METRIC", "Coverage, cohort và semantic diversity là ba khái niệm khác nhau", 10, "Nguồn: data_story_summary.json; THESIS_REPORT_vn.md");
  const rows = [
    ["Catalog Coverage@20", "Bao nhiêu item khác nhau xuất hiện trong mọi top-20 list?", "Phát hiện catalog collapse; không nói item có giống nhau về nghĩa hay không.", C.blue],
    ["Exposure và hit theo cohort", "Các slot và hit thuộc head, body hay tail?", "Kiểm tra phân bổ popularity và target relevance theo nhóm.", C.green],
    ["Semantic match/diversity", "Sản phẩm có giống nghĩa, khác category hay hợp sở thích không?", "Không đo được: file chính chỉ có ID, rating và thời gian; không có text/category/embedding.", C.orange],
    ["Time và GPU memory", "Mất bao lâu, dùng bộ nhớ đỉnh bao nhiêu?", "Đọc trade-off, vì sampler tốt hơn một chút nhưng quá chậm chưa chắc đáng dùng.", C.red],
  ];
  for (let i = 0; i < rows.length; i += 1) {
    const y = 150 + i * 100;
    addText(slide, rows[i][0], 54, y, 280, 45, { fontSize: 18, bold: true, color: rows[i][3] });
    addText(slide, rows[i][1], 360, y, 370, 52, { fontSize: 17, bold: true });
    addText(slide, rows[i][2], 760, y, 410, 58, { fontSize: 16, color: C.muted });
    if (i < rows.length - 1) addRule(slide, 54, y + 76, 1132, 1, C.grid);
  }
  addRect(slide, 54, 565, 1132, 34, C.paleOrange);
  addText(slide, "Vì vậy không dùng một chữ “đa dạng” chung chung: phải nói rõ đa dạng catalog, phân bổ popularity hay đa dạng ngữ nghĩa.", 70, 573, 1090, 18, { fontSize: 15, bold: true });
  addBlackStrip(slide, "M2 có thể đổi phân bổ context, nhưng điều đó chỉ có giá trị nếu target ranking hoặc trade-off cải thiện", 608);
  notes(slide, [
    "Coverage and cohorts: Do An/04_thesis/THESIS_REPORT_vn.md, Sections 5.3--5.5.",
    "Semantic diversity is deliberately not measured from this pure-ID artifact.",
  ]);
}

// 11 — experimental design
{
  const slide = presentation.slides.add();
  addHeader(slide, "08 / THIẾT KẾ", "Đi từ sanity gate đến matched sampler rồi paired validation", 10, "Nguồn: configs/*.json; PHASE2_RESEARCH_PLAN_vn.md");
  const table = slide.tables.add({
    rows: 7,
    columns: 4,
    left: 54,
    top: 145,
    width: 1172,
    height: 355,
    columnWidths: [160, 250, 400, 362],
    values: [
      ["Mã", "Vai trò", "Điều thay đổi", "Mục đích"],
      ["MostPop", "Sanity", "Không học embedding", "Kiểm split / evaluator / popularity failure"],
      ["BPR-MF", "Sanity", "Pairwise ranking, không message passing", "Kiểm đường train và coverage"],
      ["Full", "Backbone", "Full-graph LightGCN", "Mốc feasibility cho message passing"],
      ["M0", "Matched", "Uniform không hoàn lại", "Đối chứng sampling đơn giản"],
      ["M1", "Matched", "Degree-aware", "Static reference mạnh"],
      ["M2", "Proposed", "Frontier / √degree", "Task-conditioned candidate đã khóa"],
    ],
  });
  styleTable(table, { rows: 7, columns: 4, fontSize: 14 });
  table.cells.block({ row: 4, column: 0, rowCount: 3, columnCount: 1 }).textStyle.bold = true;
  table.getCell(4, 0).fill = C.paleBlue;
  table.getCell(5, 0).fill = C.paleGreen;
  table.getCell(6, 0).fill = C.paleOrange;
  addText(slide, "MATCHED CONTRACT", 54, 525, 180, 18, { fontSize: 12, bold: true, color: C.green });
  addText(slide, "5 epoch • 300 optimizer step • batch 65.536 • kₗ = 65.536 × 3 lớp • 58.982.400 context slot • Tesla T4", 230, 520, 960, 27, {
    fontSize: 17,
    bold: true,
  });
  addBlackStrip(slide, "Trong từng paired seed, init embedding, pair order và negative draw khớp giữa M0–M1–M2");
  notes(slide, [
    "Thiết kế paired xác minh checksum khởi tạo, training-pair order và negative draw ở cả 5 epoch.",
    "Full LightGCN và BPR-MF là sanity/feasibility references; optimizer-step budget của chúng không matched với sampled runs.",
    "GRAPES là tài liệu tham khảo về adaptive sampling, không phải phương pháp được sao chép nguyên xi: https://arxiv.org/abs/2310.03399",
  ]);
}

// 11 — baseline evidence
{
  const slide = presentation.slides.add();
  addHeader(slide, "09 / BASELINES", "Baseline cho thấy accuracy, coverage và popularity không đi cùng nhau", 11, "Nguồn: mostpop / bpr_mf / full_lightgcn validation summaries");
  const c1 = slide.charts.add("bar", {
    position: { left: 54, top: 155, width: 630, height: 335 },
    categories: ["MostPop", "BPR-MF", "Full LightGCN"],
    series: [
      { name: "NDCG@20", values: [0.0058725502, 0.0040535124, 0.0049312379], fill: C.blue, valuesFormatCode: "0.00%" },
      { name: "Recall@20", values: [0.0145961329, 0.0104188296, 0.0123731236], fill: C.green, valuesFormatCode: "0.00%" },
    ],
    barOptions: { direction: "column", grouping: "clustered", gapWidth: 42 },
    hasLegend: true,
    legend: { position: "bottom", overlay: false, textStyle: { typeface: FONT, fontSize: 12, fill: C.muted } },
    xAxis: { textStyle: { typeface: FONT, fontSize: 12, fill: C.muted }, majorGridlines: null },
    yAxis: { min: 0, max: 0.017, majorUnit: 0.004, numberFormatCode: "0.0%", majorGridlines: { style: "solid", fill: C.grid, width: 1 } },
    dataLabels: { showValue: true, position: "outEnd", textStyle: { typeface: FONT, fontSize: 10, fill: C.ink, bold: true } },
    chartFill: C.white,
    plotAreaFill: C.white,
    chartLine: { fill: "none", width: 0 },
    plotAreaLine: { fill: "none", width: 0 },
  });
  chartFont(c1);
  const c2 = slide.charts.add("bar", {
    position: { left: 720, top: 155, width: 470, height: 335 },
    categories: ["MostPop", "BPR-MF", "Full"],
    series: [{ name: "Catalog coverage@20", values: [0.0001542020, 0.0335173477, 0.0063654588], fill: C.orange, valuesFormatCode: "0.00%" }],
    barOptions: { direction: "bar", grouping: "clustered", gapWidth: 48 },
    hasLegend: false,
    xAxis: { min: 0, max: 0.04, majorUnit: 0.01, numberFormatCode: "0%", majorGridlines: { style: "solid", fill: C.grid, width: 1 } },
    yAxis: { textStyle: { typeface: FONT, fontSize: 12, fill: C.muted }, majorGridlines: null },
    dataLabels: { showValue: true, position: "outEnd", textStyle: { typeface: FONT, fontSize: 11, fill: C.ink, bold: true } },
    chartFill: C.white,
    plotAreaFill: C.white,
    chartLine: { fill: "none", width: 0 },
    plotAreaLine: { fill: "none", width: 0 },
  });
  chartFont(c2);
  const facts = [
    ["MostPop", "1.195 hit • 25 item • 100% head exposure"],
    ["BPR-MF", "853 hit • 5.434 item • 23 body hit"],
    ["Full", "1.013 hit • 1.032 item • 1.012/1.013 hit thuộc head"],
  ];
  for (let i = 0; i < facts.length; i += 1) {
    addText(slide, facts[i][0], 54 + i * 390, 515, 105, 22, { fontSize: 13, bold: true, color: [C.blue, C.green, C.purple][i] });
    addText(slide, facts[i][1], 150 + i * 390, 511, 265, 44, { fontSize: 14, bold: true });
  }
  addBlackStrip(slide, "Không gọi baseline nào là ‘tối ưu’: đây là các sanity gate cố định, chưa tuning");
  notes(slide, [
    "MostPop: NDCG .00587255, Recall .01459613, coverage .00015420, 25 unique items, 1195 hits.",
    "BPR-MF: NDCG .00405351, Recall .01041883, coverage .03351735, 5434 unique items, 853 hits.",
    "Full LightGCN: NDCG .00493124, Recall .01237312, coverage .00636546, 1032 unique items, 1013 hits.",
    "Nguồn file: Do An/06_code/results/{mostpop_validation,bpr_mf_validation,full_lightgcn_validation}/*.json.",
  ]);
}

// 12 — what the method labels M0/M1/M2 mean
{
  const slide = presentation.slides.add();
  addHeader(slide, "10 / THIẾT KẾ SO SÁNH", "M không phải tên model: M0, M1, M2 là ba cách chọn context", 12, "Nguồn: configs M0/M1/M2; protocol audit; THESIS_REPORT_vn.md");
  addRect(slide, 54, 140, 1172, 72, C.light);
  addText(slide, "Cùng một LightGCN được huấn luyện trên cùng graph. M chỉ cho biết quy tắc sampler dùng để chọn các node và edge lân cận mà model nhìn thấy trong batch.", 76, 162, 1125, 32, { fontSize: 18, bold: true });
  const fixed = [
    ["GIỮ CỐ ĐỊNH", "Baby P4 graph, LightGCN 3 layer, BPR, training pair, negative draw, 5 epoch / 300 step, budget [65.536, 65.536, 65.536], seed, evaluator và GPU."],
    ["CHỈ THAY ĐỔI", "Quy tắc chọn hàng xóm. Vì vậy so sánh M0–M2 trả lời: context nào đáng đưa vào propagation hơn?"],
  ];
  for (let i = 0; i < fixed.length; i += 1) {
    const x = 54 + i * 590;
    addText(slide, fixed[i][0], x, 238, 220, 18, { fontSize: 12, bold: true, color: i === 0 ? C.blue : C.green });
    addText(slide, fixed[i][1], x, 266, 540, 60, { fontSize: 15, color: C.ink, bold: i === 1 });
  }
  const methods = [
    ["M0", C.blue, "Bốc thăm đều", "Mỗi hàng xóm có cơ hội như nhau. Đây là đối chứng trung tính: random context tự nó đạt mức nào?"],
    ["M1", C.green, "Ưu tiên degree cao", "Node có nhiều tương tác trong training graph được ưu tiên. Câu hỏi: tín hiệu phổ biến, ổn định có giúp ranking không?"],
    ["M2", C.orange, "Ưu tiên frontier, phạt hub", "Ưu tiên node đang nối với frontier của layer trước, đồng thời giảm trọng số hub. Câu hỏi: context cục bộ có liên quan hơn không?"],
  ];
  for (let i = 0; i < methods.length; i += 1) {
    const x = 54 + i * 393;
    addRect(slide, x, 355, 355, 155, [C.paleBlue, C.paleGreen, C.paleOrange][i]);
    addText(slide, methods[i][0], x + 18, 374, 55, 28, { fontSize: 23, bold: true, color: methods[i][1] });
    addText(slide, methods[i][2], x + 86, 379, 242, 20, { fontSize: 16, bold: true });
    addText(slide, methods[i][3], x + 18, 415, 318, 74, { fontSize: 14, color: C.ink });
  }
  addText(slide, "Frontier = các node ở layer trước đang cần hàng xóm để tiếp tục truyền thông tin. Đây là biến kỹ thuật của sampler, không phải một metric.", 54, 532, 1110, 24, { fontSize: 14, color: C.muted, italic: true });
  addBlackStrip(slide, "Đừng đọc M0, M1, M2 như ba kiến trúc khác nhau: đó là ba chính sách chọn context trong cùng một kiến trúc");
  notes(slide, [
    "M0: uniform without replacement. M1: log(training_degree)+Gumbel. M2: log(frontier_support)-0.5 log(training_degree)+Gumbel.",
    "Không thay backbone, objective, data split, budget hay evaluator giữa ba method.",
  ]);
}

// 13 — sampler mechanisms
{
  const slide = presentation.slides.add();
  addHeader(slide, "11 / SAMPLERS", "Dấu vết context cho thấy mỗi chính sách thực sự chọn khác nhau", 13, "Nguồn: M0/M1/M2 configs và full validation traces");
  const table = slide.tables.add({
    rows: 4,
    columns: 4,
    left: 54,
    top: 150,
    width: 1172,
    height: 280,
    columnWidths: [120, 300, 330, 422],
    values: [
      ["Method", "Priority", "Ý định", "Điều quan sát ở s0"],
      ["M0", "Uniform + Gumbel", "Chọn ngẫu nhiên không hoàn lại", "60,52% item-context ở tail; coverage cao nhất"],
      ["M1", "log(degree) + Gumbel", "Ưu tiên node có nhiều tương tác trong training graph", "68,29% item-context ở body; mean quality cao nhất"],
      ["M2", "frontier support và penalty degree", "Ưu tiên node nối với frontier hiện tại, đồng thời giảm ưu tiên hub", "68,60% item-context ở tail; tail hit vẫn bằng 0"],
    ],
  });
  styleTable(table, { rows: 4, columns: 4, fontSize: 14 });
  table.getCell(1, 0).fill = C.paleBlue;
  table.getCell(2, 0).fill = C.paleGreen;
  table.getCell(3, 0).fill = C.paleOrange;
  table.getCell(1, 0).text.style = { typeface: FONT, fontSize: 16, bold: true, color: C.blue };
  table.getCell(2, 0).text.style = { typeface: FONT, fontSize: 16, bold: true, color: C.green };
  table.getCell(3, 0).text.style = { typeface: FONT, fontSize: 16, bold: true, color: C.orange };
  addText(slide, "STRUCTURAL EFFECT", 54, 467, 200, 20, { fontSize: 12, bold: true, color: C.orange });
  addText(slide, "M2 dùng ít directed block entry hơn M1 11,97% nhưng sampler vẫn chậm hơn 45,14 s ở s0 vì phải tính frontier support.", 54, 495, 770, 58, {
    fontSize: 18,
    bold: true,
  });
  addCallout(slide, "Sampler share M0", "84,04%", 885, 459, 270, C.red, "592,79 / 705,32 giây");
  addBlackStrip(slide, "M2 thay đổi context theo chủ đích, nhưng thay đổi đó chưa biến thành ranking gain");
  notes(slide, [
    "M0 item-context: body 39.31%, tail 60.52% (head còn lại).",
    "M1 item-context: body 68.29%, tail 31.48%.",
    "M2 chỉ có 290,606 item-context slot; tail 68.60%.",
    "Tất cả sampled methods chọn tổng 58,982,400 context slots theo layer budget.",
  ]);
}

// 13 — s0 quality/cost
{
  const slide = presentation.slides.add();
  addHeader(slide, "11 / MATCHED S0", "Ở seed đầu, M1 tốt hơn M2 về ranking và thời gian", 13, "Nguồn: uniform / degree-aware / frontier-normalized validation summaries");
  const c1 = slide.charts.add("bar", {
    position: { left: 54, top: 155, width: 640, height: 330 },
    categories: ["M0", "M1", "M2"],
    series: [
      { name: "NDCG@20", values: [0.0057272830, 0.0061532962, 0.0059206961], fill: C.blue, valuesFormatCode: "0.00%" },
      { name: "Recall@20", values: [0.0146572046, 0.0159885674, 0.0153167788], fill: C.green, valuesFormatCode: "0.00%" },
    ],
    barOptions: { direction: "column", grouping: "clustered", gapWidth: 42 },
    hasLegend: true,
    legend: { position: "bottom", overlay: false, textStyle: { typeface: FONT, fontSize: 12, fill: C.muted } },
    xAxis: { textStyle: { typeface: FONT, fontSize: 12, fill: C.muted }, majorGridlines: null },
    yAxis: { min: 0, max: 0.017, majorUnit: 0.004, numberFormatCode: "0.0%", majorGridlines: { style: "solid", fill: C.grid, width: 1 } },
    dataLabels: { showValue: true, position: "outEnd", textStyle: { typeface: FONT, fontSize: 10, fill: C.ink, bold: true } },
    chartFill: C.white,
    plotAreaFill: C.white,
    chartLine: { fill: "none", width: 0 },
    plotAreaLine: { fill: "none", width: 0 },
  });
  chartFont(c1);
  const c2 = slide.charts.add("bar", {
    position: { left: 735, top: 155, width: 455, height: 330 },
    categories: ["M0", "M1", "M2"],
    series: [{ name: "Training wall (s)", values: [705.32, 795.10, 868.63], fill: C.orange, valuesFormatCode: "0" }],
    barOptions: { direction: "bar", grouping: "clustered", gapWidth: 45 },
    hasLegend: false,
    xAxis: { min: 0, max: 1000, majorUnit: 200, numberFormatCode: "0", majorGridlines: { style: "solid", fill: C.grid, width: 1 } },
    yAxis: { textStyle: { typeface: FONT, fontSize: 12, fill: C.muted }, majorGridlines: null },
    dataLabels: { showValue: true, position: "outEnd", textStyle: { typeface: FONT, fontSize: 11, fill: C.ink, bold: true } },
    chartFill: C.white,
    plotAreaFill: C.white,
    chartLine: { fill: "none", width: 0 },
    plotAreaLine: { fill: "none", width: 0 },
  });
  chartFont(c2);
  addText(slide, "M2 − M1", 54, 515, 125, 20, { fontSize: 12, bold: true, color: C.orange });
  addText(slide, "NDCG giảm 3,78%. Recall giảm 4,20%. Training tăng 9,25%; chỉ thêm 13 item unique.", 170, 506, 520, 50, {
    fontSize: 16,
    bold: true,
  });
  addText(slide, "Peak GPU: M0 3.483 MB, M1 2.665 MB, M2 2.669 MB", 735, 515, 455, 30, {
    fontSize: 14,
    color: C.muted,
    align: "right",
  });
  addBlackStrip(slide, "Body hit 25/25/25; tail hit 0/0/0 — quality gain của M1 đến từ head");
  notes(slide, [
    "s0: M0 NDCG .00572728 / Recall .01465720 / 705.32s / 3482.90MB.",
    "s0: M1 .00615330 / .01598857 / 795.10s / 2665.10MB.",
    "s0: M2 .00592070 / .01531678 / 868.63s / 2669.06MB.",
    "M1 và M2 có peak GPU gần như nhau; M2 chậm hơn và quality thấp hơn.",
  ]);
}

// 14 — paired validation
{
  const slide = presentation.slides.add();
  addHeader(slide, "12 / PAIRED EVIDENCE", "M2 thấp hơn M1 về quality ở cả ba validation seed", 14, "Nguồn: paired_sampling_validation_summary.json + six rank vectors");
  const chart = slide.charts.add("line", {
    position: { left: 54, top: 150, width: 730, height: 360 },
    categories: ["s0", "s1", "s2"],
    series: [
      { name: "M0", values: [0.0057272830, 0.0056249800, 0.0057669238], line: { style: "solid", fill: C.blue, width: 3 }, marker: { symbol: "circle", size: 8 }, valuesFormatCode: "0.00%" },
      { name: "M1", values: [0.0061532962, 0.0057042864, 0.0057403666], line: { style: "solid", fill: C.green, width: 3 }, marker: { symbol: "circle", size: 8 }, valuesFormatCode: "0.00%" },
      { name: "M2", values: [0.0059206961, 0.0055738678, 0.0056681820], line: { style: "solid", fill: C.orange, width: 3 }, marker: { symbol: "circle", size: 8 }, valuesFormatCode: "0.00%" },
    ],
    lineOptions: { smooth: false },
    hasLegend: true,
    legend: { position: "bottom", overlay: false, textStyle: { typeface: FONT, fontSize: 12, fill: C.muted } },
    xAxis: { textStyle: { typeface: FONT, fontSize: 13, fill: C.muted }, majorGridlines: null },
    yAxis: { min: 0.0054, max: 0.0063, majorUnit: 0.0002, numberFormatCode: "0.00%", majorGridlines: { style: "solid", fill: C.grid, width: 1 } },
    chartFill: C.white,
    plotAreaFill: C.white,
    chartLine: { fill: "none", width: 0 },
    plotAreaLine: { fill: "none", width: 0 },
  });
  chartFont(chart);
  addCallout(slide, "Mean NDCG", "M1 0,005866", 830, 150, 350, C.green, "M2 0,005721, thấp hơn 2,47%");
  addCallout(slide, "Mean Recall", "M1 0,015296", 830, 268, 350, C.blue, "M2 0,014873, thấp hơn 2,77%");
  addCallout(slide, "Hai repeat mới", "+14,36% time", 830, 386, 350, C.orange, "M2 914,95 s vs M1 800,07 s");
  addText(slide, "M2 thấp hơn M1 ở 3/3 seed. M1 không thắng M0 ở mọi seed nên không có claim significance hay superiority phổ quát.", 54, 530, 1125, 28, {
    fontSize: 17,
    bold: true,
  });
  addBlackStrip(slide, "Kết luận hẹp: M2 không tạo đánh đổi ranking và chi phí tốt hơn M1 ở budget đã khóa");
  notes(slide, [
    "Mean±SD NDCG: M0 .00570640±.00007324; M1 .00586598±.00024947; M2 .00572092±.00017933.",
    "M2−M1 per seed NDCG: s0 −.00023260; s1 −.00013042; s2 −.00007218.",
    "M2−M1 Recall cũng âm ở 3/3 seed.",
    "Resource average +14.36% chỉ dùng hai repeat mới s1/s2 vì s0 có instrumentation boundary khác.",
    "Paired bundle audit: 85/85 checks pass; test_targets_read=false.",
  ]);
}

// 18 — decision, contribution, next steps
{
  const slide = presentation.slides.add();
  addHeader(slide, "14 / KẾT LUẬN", "Kết luận và bước tiếp theo có điều kiện", 18, "Nguồn: paired_sampling_validation_summary.json; THESIS_REPORT_vn.md");
  const table = slide.tables.add({
    rows: 5,
    columns: 3,
    left: 54,
    top: 145,
    width: 1172,
    height: 320,
    columnWidths: [190, 450, 532],
    values: [
      ["Trạng thái", "Kết luận hoặc hành động", "Lý do"],
      ["KẾT LUẬN", "Không chọn M2 thay M1 ở budget đã khóa", "M2 thấp hơn M1 ở NDCG và Recall trong cả 3 validation seed, đồng thời chậm hơn ở hai repeat mới"],
      ["KHÓA", "Không mở thêm sampler chỉ để đuổi validation score", "Giữ được tính đối chứng sau khi đã quan sát kết quả"],
      ["BÁO CÁO", "Trình bày kết quả validation và failure analysis", "Test target chưa đọc, không có quyền gọi đó là final test result"],
      ["MỞ RỘNG", "Nếu cần generalization, pre-register một benchmark ngoài Amazon trước khi chạy", "Yelp2018 hoặc Gowalla phù hợp Graph-CF; không trộn chúng với kết luận hiện tại"],
    ],
  });
  styleTable(table, { rows: 5, columns: 3, fontSize: 14 });
  table.getCell(1, 0).fill = C.paleOrange;
  table.getCell(2, 0).fill = C.paleGreen;
  table.getCell(3, 0).fill = C.paleBlue;
  table.getCell(4, 0).fill = C.light;
  addText(slide, "ĐÓNG GÓP CÓ THỂ BẢO VỆ", 54, 496, 290, 20, { fontSize: 12, bold: true, color: C.green });
  addText(slide, "Audit có truy vết, protocol đối chứng, evaluator exact và failure analysis cho một kết quả âm được lặp lại", 54, 524, 900, 55, {
    fontSize: 18,
    bold: true,
  });
  addText(slide, "85/85", 1000, 492, 180, 39, { fontSize: 30, bold: true, color: C.green, align: "right" });
  addText(slide, "artifact checks", 1000, 532, 180, 18, { fontSize: 12, color: C.muted, align: "right" });
  addText(slide, "96/96", 1000, 554, 180, 31, { fontSize: 24, bold: true, color: C.blue, align: "right" });
  addText(slide, "project tests", 1000, 584, 180, 18, { fontSize: 12, color: C.muted, align: "right" });
  addBlackStrip(slide, "Sampler phức tạp hơn không tự động tạo recommendation tốt hơn", 612);
  notes(slide, [
    "Paired aggregate: Do An/06_code/results/paired_sampling_validation/paired_sampling_validation_summary.json",
    "Paired artifact audit: 85/85 checks passed; test_targets_read=false.",
    "Any cross-dataset extension must be registered before execution and reported separately from the present Baby_Products result.",
  ]);
}

const stagingDir = path.join(TMP_DIR, "finalizer");
await fs.mkdir(stagingDir, { recursive: true });
await fs.mkdir(path.dirname(FINAL_PPTX), { recursive: true });
const candidatePath = path.join(stagingDir, "candidate.pptx");
await (await PresentationFile.exportPptx(presentation)).save(candidatePath);

const requirements = {
  explicitTotalSlideCount: 21,
  requiredNativeTableOwnerSlides: [5, 6, 7, 15, 18, 21],
  requiredNativeChartOwnerSlides: [6, 9, 10, 11, 12, 16, 19, 20],
  materializeLiteralChartWorkbooks: true,
};
const fontPolicy = { basis: "design", families: [FONT] };
const result = await finalizePresentation({
  ...requirements,
  workspaceDir,
  candidatePath,
  finalPath: FINAL_PPTX,
  pythonExecutable: RUNTIME_PYTHON,
  integrityValidatorPath: path.join(SKILL_DIR, "container_tools/inspect_presentation_package_integrity.py"),
  layoutValidatorPath: path.join(SKILL_DIR, "container_tools/inspect_presentation_layout_geometry.py"),
  layoutArgs: [
    "--expected-slide-size-emu", "12192000,6858000",
    "--validate-bullet-geometry",
    "--validate-heading-fit",
    ...requirements.requiredNativeTableOwnerSlides.flatMap((number) => ["--require-native-table-slide", String(number)]),
  ],
  requiredNativeTableOwnerSlides: requirements.requiredNativeTableOwnerSlides,
  requiredNativeChartOwnerSlides: requirements.requiredNativeChartOwnerSlides,
  materializeLiteralChartWorkbooks: true,
  fontPolicy,
  verifyArtifactToolImport: true,
  receiptPath: path.join(stagingDir, "THESIS_PRESENTATION_vn_21.pptx.validation.json"),
});

console.log(JSON.stringify({ final: FINAL_PPTX, result }, null, 2));
