// -*- coding: utf-8 -*-
const pptxgen = require('/usr/local/lib/node_modules_global/lib/node_modules/pptxgenjs');
const pres = new pptxgen();
pres.layout = 'LAYOUT_16x9';
pres.author = 'Ty Van';
pres.title = 'Nghiên Cứu Phương Pháp GRAPES Trong Giảm Bùng Nổ Lân Cận Cho Mạng Nơ-ron Đồ Thị';

const C = {
  navy:      '065A82',
  teal:      '1C7293',
  mint:      '02C39A',
  lightBlue: 'EAF4FB',
  white:     'FFFFFF',
  darkText:  '1A2B3C',
  gray:      '5A6A78',
  lightGray: 'F1F5F9',
  orange:    'F4A261',
  tealDark:  '0A4D62',
  green:     '2D6A4F',
  red:       '9B2226',
};

const TOTAL = 28;

function addSlideNum(s, num, col) {
  s.addText(num + ' / ' + TOTAL, {
    x: 9.1, y: 5.28, w: 0.7, h: 0.25,
    fontSize: 10, fontFace: 'Calibri', color: col||C.gray, align: 'right'
  });
}

function titleBar(s, title) {
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: 0, w: 10, h: 0.88,
    fill: { color: C.navy }, line: { color: C.navy }
  });
  s.addText(title, {
    x: 0.4, y: 0.08, w: 9.2, h: 0.72,
    fontSize: 24, fontFace: 'Calibri', bold: true,
    color: C.white, align: 'left', valign: 'middle', margin: 0
  });
}

// ============================================================
// SLIDE 1: Trang bìa
// ============================================================
{
  const s = pres.addSlide();
  s.background = { color: C.navy };

  // Accent strip bên phải
  s.addShape(pres.shapes.RECTANGLE, {
    x: 8.9, y: 0, w: 1.1, h: 5.625,
    fill: { color: C.teal, transparency: 45 }, line: { color: C.teal, transparency: 45 }
  });

  // Trường / Khoa
  s.addText('ĐẠI HỌC QUỐC GIA TP.HCM  —  TRƯỜNG ĐẠI HỌC BÁCH KHOA', {
    x: 0.6, y: 0.22, w: 8.0, h: 0.38,
    fontSize: 12, fontFace: 'Calibri', bold: true,
    color: 'B8D4E8', align: 'left', charSpacing: 1
  });
  s.addText('Khoa Khoa học và Kỹ thuật Máy tính  —  Chuyên ngành: Khoa học máy tính', {
    x: 0.6, y: 0.58, w: 8.0, h: 0.32,
    fontSize: 11.5, fontFace: 'Calibri', color: '8AAFC7', align: 'left'
  });

  // Đường kẻ
  s.addShape(pres.shapes.LINE, {
    x: 0.6, y: 1.0, w: 8.0, h: 0,
    line: { color: C.teal, width: 0.8 }
  });

  // Tiêu đề chính (từ cover.tex)
  s.addText('PHÁT TRIỂN PHƯƠNG PHÁP LẤY MẪU ĐỒ THỊ\nCHO HỆ THỐNG GỢI Ý QUY MÔ LỚN\nSỬ DỤNG MẠNG NƠ-RON ĐỒ THỊ', {
    x: 0.6, y: 1.12, w: 8.0, h: 2.3,
    fontSize: 28, fontFace: 'Calibri', bold: true,
    color: C.white, align: 'left', valign: 'middle',
    paraSpaceAfter: 4
  });

  // Nhãn Thực Tập 2
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.6, y: 3.5, w: 1.6, h: 0.38,
    fill: { color: C.mint }, line: { color: C.mint }
  });
  s.addText('THỰC TẬP 2', {
    x: 0.6, y: 3.5, w: 1.6, h: 0.38,
    fontSize: 12, fontFace: 'Calibri', bold: true,
    color: C.navy, align: 'center', valign: 'middle', margin: 0
  });

  // Tên & MSHV
  s.addText('VĂN XUÂN TỶ', {
    x: 0.6, y: 4.02, w: 6, h: 0.48,
    fontSize: 19, fontFace: 'Calibri', bold: true, color: C.white
  });
  s.addText('MSHV: 2470113', {
    x: 0.6, y: 4.48, w: 4, h: 0.32,
    fontSize: 13, fontFace: 'Calibri', color: 'B8D4E8'
  });

  // GVHD + ngày bảo vệ
  s.addText('GVHD: TS. Lê Thanh Vân   —   Ngày bảo vệ: 09/06/2026', {
    x: 0.6, y: 5.05, w: 8.0, h: 0.32,
    fontSize: 11.5, fontFace: 'Calibri', italic: true, color: '6A9AB8', align: 'left'
  });
}

// ============================================================
// SLIDE 2: Nội dung trình bày
// ============================================================
{
  const s = pres.addSlide();
  s.background = { color: C.white };
  titleBar(s, 'Nội Dung Trình Bày');
  addSlideNum(s, 2);

  const items = [
    ['01', 'Bối cảnh & Vấn đề'],
    ['02', 'Tổng quan phương pháp'],
    ['03', 'Phương pháp GRAPES'],
    ['04', 'Thực nghiệm'],
    ['05', 'Kết luận & Hướng tương lai'],
  ];

  items.forEach(([num, title], i) => {
    const y = 1.05 + i * 0.82;
    s.addShape(pres.shapes.OVAL, {
      x: 0.4, y: y + 0.06, w: 0.6, h: 0.6,
      fill: { color: C.navy }, line: { color: C.navy }
    });
    s.addText(num, {
      x: 0.4, y: y + 0.06, w: 0.6, h: 0.6,
      fontSize: 15, fontFace: 'Calibri', bold: true,
      color: C.white, align: 'center', valign: 'middle', margin: 0
    });
    s.addText(title, {
      x: 1.2, y: y + 0.12, w: 8.4, h: 0.45,
      fontSize: 19, fontFace: 'Calibri', bold: true, color: C.navy
    });
    if (i < items.length - 1) {
      s.addShape(pres.shapes.LINE, {
        x: 0.4, y: y + 0.76, w: 9.2, h: 0,
        line: { color: 'E2E8F0', width: 0.5 }
      });
    }
  });
}

// ============================================================
// SLIDE 3: Bối cảnh
// ============================================================
{
  const s = pres.addSlide();
  s.background = { color: C.white };
  titleBar(s, 'Bối Cảnh & Động Cơ Nghiên Cứu');
  addSlideNum(s, 3);

  s.addText('Hệ thống gợi ý & GNN', {
    x: 0.35, y: 1.0, w: 4.7, h: 0.42,
    fontSize: 16, fontFace: 'Calibri', bold: true, color: C.navy
  });
  s.addText([
    { text: 'Dữ liệu user–item là đồ thị hai phía (bipartite graph)', options: { bullet: true, breakLine: true } },
    { text: 'GNN khai thác cấu trúc quan hệ bậc cao hiệu quả hơn lọc cộng tác truyền thống', options: { bullet: true, breakLine: true } },
    { text: 'PinSage (Pinterest): 3 tỷ cạnh — phải dùng sampling ngay từ đầu', options: { bullet: true, breakLine: true } },
    { text: 'NGCF, LightGCN: các mô hình GNN được nghiên cứu và ứng dụng rộng rãi cho hệ thống gợi ý', options: { bullet: true } },
  ], {
    x: 0.35, y: 1.48, w: 4.7, h: 2.1,
    fontSize: 14, fontFace: 'Calibri', color: C.darkText, paraSpaceAfter: 6
  });

  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.35, y: 3.65, w: 4.7, h: 0.88,
    fill: { color: C.lightBlue }, line: { color: C.teal, width: 2 }
  });
  s.addText('GNN quy mô lớn → nhu cầu Scalability là rào cản thực tế', {
    x: 0.35, y: 3.65, w: 4.7, h: 0.88,
    fontSize: 15, fontFace: 'Calibri', bold: true, color: C.navy,
    align: 'center', valign: 'middle'
  });

  const flowItems = [
    { label: 'Hệ thống Gợi ý', color: C.navy },
    { label: 'Mạng Nơ-ron Đồ thị (GNN)', color: C.teal },
    { label: 'Thách thức Scalability', color: '7B1C1C' },
    { label: 'Bùng nổ Lân cận', color: C.red },
  ];
  flowItems.forEach(({ label, color }, i) => {
    const y = 1.0 + i * 1.0;
    s.addShape(pres.shapes.RECTANGLE, {
      x: 5.6, y, w: 4.0, h: 0.65,
      fill: { color }, line: { color }
    });
    s.addText(label, {
      x: 5.6, y, w: 4.0, h: 0.65,
      fontSize: 15, fontFace: 'Calibri', bold: true,
      color: C.white, align: 'center', valign: 'middle', margin: 0
    });
    if (i < flowItems.length - 1) {
      s.addText('▼', {
        x: 7.4, y: y + 0.65, w: 0.5, h: 0.35,
        fontSize: 16, color: C.gray, align: 'center'
      });
    }
  });
}

// ============================================================
// SLIDE 4: GNN — Cơ chế Message Passing
// ============================================================
{
  const s = pres.addSlide();
  s.background = { color: C.white };
  titleBar(s, 'Mạng Nơ-ron Đồ Thị (GNN): Cơ Chế Message Passing');
  addSlideNum(s, 4);

  // ---- Left: GNN là gì ----
  s.addText('GNN là gì?', {
    x: 0.3, y: 1.0, w: 4.55, h: 0.42,
    fontSize: 16, fontFace: 'Calibri', bold: true, color: C.navy
  });
  s.addText([
    { text: 'Họ mô hình học đặc trưng đỉnh/cạnh dựa trên cấu trúc đồ thị G = (V, E)', options: { bullet: true, breakLine: true } },
    { text: 'Mỗi đỉnh tích lũy thông tin từ lân cận qua nhiều vòng lặp (tầng)', options: { bullet: true, breakLine: true } },
    { text: 'Sau L tầng: h_v^(L) mã hóa cấu trúc L-hop xung quanh đỉnh v', options: { bullet: true, breakLine: true } },
    { text: 'Ứng dụng: phân loại đỉnh, dự đoán liên kết, hệ gợi ý', options: { bullet: true } },
  ], {
    x: 0.3, y: 1.47, w: 4.55, h: 2.25,
    fontSize: 13.5, fontFace: 'Calibri', color: C.darkText, paraSpaceAfter: 8
  });

  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.3, y: 3.82, w: 4.55, h: 0.88,
    fill: { color: C.lightBlue }, line: { color: C.teal, width: 2 }
  });
  s.addText('Điểm mấu chốt: đặc trưng đỉnh được lan truyền qua cấu trúc đồ thị — không huấn luyện độc lập như MLP.', {
    x: 0.3, y: 3.82, w: 4.55, h: 0.88,
    fontSize: 13, fontFace: 'Calibri', bold: true, color: C.navy,
    align: 'center', valign: 'middle'
  });

  // ---- Divider ----
  s.addShape(pres.shapes.LINE, {
    x: 5.1, y: 0.97, w: 0, h: 4.32,
    line: { color: 'E2E8F0', width: 1 }
  });

  // ---- Right: 4 bước với công thức ----
  s.addText('Khung Message Passing (MPNN)', {
    x: 5.3, y: 1.0, w: 4.4, h: 0.42,
    fontSize: 16, fontFace: 'Calibri', bold: true, color: C.navy
  });

  const FD = '/sessions/festive-admiring-rubin/mnt/outputs/formulas';
  const mpnnSteps = [
    { step: 'Bước 0 — Khởi tạo',            img: `${FD}/f0_init.png`, desc: 'đặc trưng đầu vào của đỉnh v',          color: C.teal },
    { step: 'Bước 1 — Aggregate (tổng hợp)', img: `${FD}/f1_agg.png`,  desc: 'gom thông điệp từ toàn bộ lân cận',    color: C.navy },
    { step: 'Bước 2 — Update (cập nhật)',    img: `${FD}/f2_upd.png`,  desc: 'kết hợp thông tin cũ + thông điệp mới', color: C.navy },
    { step: 'Bước 3 — Predict (dự đoán)',    img: `${FD}/f3_pred.png`, desc: 'phân loại đỉnh / tác vụ đầu cuối',     color: C.mint },
  ];

  mpnnSteps.forEach(({ step, img, desc, color }, i) => {
    const y = 1.47 + i * 0.96;
    s.addShape(pres.shapes.RECTANGLE, {
      x: 5.3, y, w: 4.4, h: 0.88,
      fill: { color: C.lightGray }, line: { color: color, width: 1.8 }
    });
    s.addText(step, {
      x: 5.42, y: y + 0.04, w: 4.2, h: 0.24,
      fontSize: 11, fontFace: 'Calibri', bold: true, color: color
    });
    s.addImage({ path: img, x: 5.32, y: y + 0.26, w: 4.28, h: 0.35 });
    s.addText(desc, {
      x: 5.42, y: y + 0.63, w: 4.2, h: 0.22,
      fontSize: 11, fontFace: 'Calibri', italic: true, color: C.gray
    });
  });
}

// ============================================================
// SLIDE 5: MPNN — Minh hoạ Node qua Từng Tầng
// ============================================================
{
  const s = pres.addSlide();
  s.background = { color: C.white };
  titleBar(s, 'Thông Tin Lan Truyền Qua Từng Tầng GNN');
  addSlideNum(s, 5);

  const h1 = 0.60;
  const h2 = 1.10;
  const nr  = 0.18;
  const nrV = 0.24;

  const cV   = C.navy;
  const cVs  = C.orange;
  const c1   = '1C7293';
  const c2   = '5BAFC9';
  const cOff = 'B8C4CB';
  const cOn  = '1C7293';
  const cOff2= 'D8E4EA';

  const panels = [
    { cx: 1.65, title: 'Tầng 0 — Khởi tạo',     sub: 'V chỉ biết chính mình',        show1: false, show2: false, hd: C.gray },
    { cx: 4.85, title: 'Tầng 1 — Aggregate',     sub: 'V biết lân cận trực tiếp',     show1: true,  show2: false, hd: C.teal },
    { cx: 8.05, title: 'Tầng 2 — Mở rộng 2-hop', sub: 'V biết cấu trúc 2-hop',       show1: true,  show2: true,  hd: C.mint },
  ];
  const cy = 2.95;
  const pw = 1.45;

  panels.forEach(({ cx, title, sub, show1, show2, hd }, pi) => {
    const bgC = ['F8FAFB', 'EBF5FB', 'E8F8F5'];
    const brC = ['CBD5E1', '1C7293', '02C39A'];

    s.addShape(pres.shapes.RECTANGLE, {
      x: cx - pw, y: 0.92, w: pw * 2, h: 4.20,
      fill: { color: bgC[pi] }, line: { color: brC[pi], width: 1.5 }
    });
    s.addShape(pres.shapes.RECTANGLE, {
      x: cx - pw, y: 0.92, w: pw * 2, h: 0.38,
      fill: { color: hd }, line: { color: 'none' }
    });
    s.addText(title, {
      x: cx - pw, y: 0.92, w: pw * 2, h: 0.38,
      align: 'center', valign: 'middle',
      fontSize: 13, fontFace: 'Calibri', bold: true, color: C.white
    });

    const drawLine = (x1, y1, x2, y2, col) => {
      s.addShape(pres.shapes.LINE, {
        x: Math.min(x1, x2), y: Math.min(y1, y2),
        w: Math.max(Math.abs(x2 - x1), 0.01),
        h: Math.max(Math.abs(y2 - y1), 0.01),
        line: { color: col, width: 2 }
      });
    };

    const ec1 = show1 ? cOn : cOff2;
    const ec2 = show2 ? cOn : cOff2;

    drawLine(cx, cy - h1, cx, cy, ec1);
    drawLine(cx, cy, cx + h1, cy, ec1);
    drawLine(cx, cy, cx, cy + h1, ec1);
    drawLine(cx - h1, cy, cx, cy, ec1);

    if (show2) {
      drawLine(cx, cy - h2, cx, cy - h1, ec2);
      drawLine(cx + h1, cy, cx + h2, cy, ec2);
      drawLine(cx, cy + h1, cx, cy + h2, ec2);
      drawLine(cx - h2, cy, cx - h1, cy, ec2);
    }

    const drawNode = (nx, ny, fill, label, r) => {
      s.addShape(pres.shapes.OVAL, {
        x: nx - r, y: ny - r, w: 2 * r, h: 2 * r,
        fill: { color: fill },
        line: { color: fill === cV ? cVs : fill, width: fill === cV ? 2.5 : 1.8 }
      });
      if (label) s.addText(label, {
        x: nx - r, y: ny - r, w: 2 * r, h: 2 * r,
        align: 'center', valign: 'middle',
        fontSize: r > 0.22 ? 12 : 9,
        fontFace: 'Calibri', bold: true, color: C.white
      });
    };

    if (show2) {
      drawNode(cx,       cy - h2, c2, 'E', nr);
      drawNode(cx + h2,  cy,      c2, 'F', nr);
      drawNode(cx,       cy + h2, c2, 'G', nr);
      drawNode(cx - h2,  cy,      c2, 'H', nr);
    }

    const c1f = show1 ? c1 : cOff;
    drawNode(cx,       cy - h1, c1f, 'A', nr);
    drawNode(cx + h1,  cy,      c1f, 'B', nr);
    drawNode(cx,       cy + h1, c1f, 'C', nr);
    drawNode(cx - h1,  cy,      c1f, 'D', nr);

    drawNode(cx, cy, cV, 'V', nrV);

    // Legend (panel 3 only)
    if (pi === 2) {
      const lgx = cx - pw + 0.10;
      const lgy = 4.56;
      [[c2, '2-hop'], [c1, '1-hop'], [cV, 'V']].forEach(([col, lbl], li) => {
        s.addShape(pres.shapes.OVAL, {
          x: lgx + li * 0.90, y: lgy, w: 0.22, h: 0.22,
          fill: { color: col }, line: { color: col, width: 1 }
        });
        s.addText(lbl, {
          x: lgx + li * 0.90 + 0.24, y: lgy, w: 0.60, h: 0.22,
          fontSize: 9, fontFace: 'Calibri', color: C.gray, valign: 'middle'
        });
      });
    }

    s.addText(sub, {
      x: cx - pw, y: 4.82, w: pw * 2, h: 0.28,
      align: 'center', valign: 'middle',
      fontSize: 11, fontFace: 'Calibri', bold: true,
      color: pi === 0 ? C.gray : pi === 1 ? C.teal : C.mint
    });
  });

  // Arrows between panels
  [3.13, 6.33].forEach(ax => {
    s.addShape(pres.shapes.LINE, {
      x: ax, y: cy, w: 0.24, h: 0.01,
      line: { color: C.orange, width: 3, endArrowType: 'arrow' }
    });
  });
}


// ============================================================
// SLIDE 6: GNN gặp những vấn đề gì?
// ============================================================
{
  const s = pres.addSlide();
  s.background = { color: C.white };
  titleBar(s, 'GNN Gặp Những Vấn Đề Gì Khi Mở Rộng Quy Mô?');
  addSlideNum(s, 6);

  const boxes = [
    {
      title: '① Oversmoothing  [18]',
      body: 'Càng nhiều tầng, đặc trưng các đỉnh càng giống nhau — mạng không còn phân biệt được các đỉnh khác nhau.',
      bg: 'F0F4F8', border: '8AAFC7', titleColor: C.gray, focus: false,
    },
    {
      title: '② Oversquashing  [19]',
      body: 'Thông tin từ xa bị nén qua "cổ chai" — mạng mất tín hiệu từ các đỉnh ở xa khi số tầng tăng.',
      bg: 'F0F4F8', border: '8AAFC7', titleColor: C.gray, focus: false,
    },
    {
      title: '③ Bùng nổ lân cận  [21]',
      body: 'Số đỉnh cần xử lý tăng theo cấp số nhân với số tầng → không thể huấn luyện trên đồ thị lớn.',
      bg: C.lightBlue, border: C.navy, titleColor: C.navy, focus: true,
    },
  ];

  const bw = 2.98, bx = [0.28, 3.36, 6.44], by = 1.0, bh = 3.1;

  boxes.forEach(({ title, body, bg, border, titleColor, focus }, i) => {
    s.addShape(pres.shapes.RECTANGLE, {
      x: bx[i], y: by, w: bw, h: bh,
      fill: { color: bg }, line: { color: border, width: focus ? 2.5 : 1 }
    });
    s.addText(title, {
      x: bx[i] + 0.14, y: by + 0.14, w: bw - 0.28, h: 0.42,
      fontSize: 13.5, fontFace: 'Calibri', bold: true, color: titleColor
    });
    s.addShape(pres.shapes.LINE, {
      x: bx[i] + 0.14, y: by + 0.6, w: bw - 0.28, h: 0,
      line: { color: border, width: 0.8 }
    });
    s.addText(body, {
      x: bx[i] + 0.14, y: by + 0.72, w: bw - 0.28, h: bh - 0.9,
      fontSize: 13, fontFace: 'Calibri', color: C.darkText, valign: 'top'
    });
  });

  // Highlight strip
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.28, y: 4.22, w: 9.44, h: 0.9,
    fill: { color: C.navy }, line: { color: C.navy }
  });
  s.addText([
    { text: 'Báo cáo này tập trung vào ③ ', options: { color: C.white } },
    { text: 'Bùng nổ lân cận', options: { bold: true, color: C.mint } },
    { text: ' — thách thức scalability khi huấn luyện GNN trên đồ thị gợi ý quy mô lớn.', options: { color: C.white } },
  ], {
    x: 0.42, y: 4.22, w: 9.16, h: 0.9,
    fontSize: 13, fontFace: 'Calibri', align: 'center', valign: 'middle'
  });
}

// ============================================================
// SLIDE 7: Từ Aggregate → Bùng Nổ Lân Cận
// ============================================================
{
  const s = pres.addSlide();
  s.background = { color: C.white };
  titleBar(s, 'Tại Sao Bước Aggregate Gây Ra Bùng Nổ Lân Cận?');
  addSlideNum(s, 7);

  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.3, y: 0.96, w: 9.4, h: 0.68,
    fill: { color: C.lightBlue }, line: { color: C.teal, width: 1.5 }
  });
  s.addText('Để tính h_v^(L) ở tầng L, Bước Aggregate phải đệ quy lấy thông tin từ lân cận qua từng tầng.', {
    x: 0.3, y: 0.96, w: 9.4, h: 0.68,
    fontSize: 14, fontFace: 'Calibri', bold: true, color: C.navy,
    align: 'center', valign: 'middle'
  });

  const FD2 = '/sessions/festive-admiring-rubin/mnt/outputs/formulas';
  const hops = [
    { label: 'Tầng 1', img: `${FD2}/g1_l1.png`, note: 'cần h_u^(0) của tất cả lân cận trực tiếp của v',         badge: 'd̄  đỉnh', badgeColor: C.teal },
    { label: 'Tầng 2', img: `${FD2}/g2_l2.png`, note: 'h_u^(1) lại cần lân cận của u → mở rộng thêm một lớp',  badge: 'd̄²  đỉnh', badgeColor: C.navy },
    { label: 'Tầng L', img: `${FD2}/g3_lL.png`, note: 'lũy tiến theo từng tầng → số đỉnh phụ thuộc = O(d̄ᴸ)', badge: 'O(d̄ᴸ)', badgeColor: C.red  },
  ];

  hops.forEach(({ label, img, note, badge, badgeColor }, i) => {
    const y = 1.82 + i * 1.05;
    // Step label
    s.addShape(pres.shapes.RECTANGLE, {
      x: 0.3, y, w: 1.1, h: 0.82,
      fill: { color: badgeColor }, line: { color: badgeColor }
    });
    s.addText(label, {
      x: 0.3, y, w: 1.1, h: 0.82,
      fontSize: 14, fontFace: 'Calibri', bold: true,
      color: C.white, align: 'center', valign: 'middle', margin: 0
    });
    // Formula box with image
    s.addShape(pres.shapes.RECTANGLE, {
      x: 1.55, y, w: 5.6, h: 0.82,
      fill: { color: C.lightGray }, line: { color: badgeColor, width: 1.5 }
    });
    s.addImage({ path: img, x: 1.57, y: y + 0.03, w: 5.55, h: 0.42 });
    s.addText('→  ' + note, {
      x: 1.68, y: y + 0.47, w: 5.3, h: 0.32,
      fontSize: 12, fontFace: 'Calibri', italic: true, color: C.gray
    });
    // Badge
    s.addShape(pres.shapes.RECTANGLE, {
      x: 7.3, y: y + 0.1, w: 2.3, h: 0.62,
      fill: { color: badgeColor }, line: { color: badgeColor }
    });
    s.addText(badge, {
      x: 7.3, y: y + 0.1, w: 2.3, h: 0.62,
      fontSize: 18, fontFace: 'Calibri', bold: true,
      color: C.white, align: 'center', valign: 'middle', margin: 0
    });
    // Arrow between rows
    if (i < hops.length - 1) {
      s.addText('▼', {
        x: 0.58, y: y + 0.84, w: 0.5, h: 0.18,
        fontSize: 12, color: C.gray, align: 'center'
      });
    }
  });

  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.3, y: 5.08, w: 9.4, h: 0.42,
    fill: { color: 'FFF3CD' }, line: { color: 'FFC107', width: 2 }
  });
  s.addText('⚠  Mini-batch 512 đỉnh, d̄=10, L=3  →  phải nạp ~512.000 đỉnh vào bộ nhớ — bùng nổ theo cấp số nhân', {
    x: 0.3, y: 5.08, w: 9.4, h: 0.42,
    fontSize: 13, fontFace: 'Calibri', bold: true, color: '7B4F00',
    align: 'center', valign: 'middle'
  });
}

// ============================================================
// SLIDE 8: Bùng nổ lân cận
// ============================================================
{
  const s = pres.addSlide();
  s.background = { color: C.white };
  titleBar(s, 'Vấn Đề: Bùng Nổ Lân Cận (Neighbor Explosion)');
  addSlideNum(s, 8);

  s.addText('Tại sao đây là vấn đề?', {
    x: 0.35, y: 1.0, w: 4.7, h: 0.4,
    fontSize: 16, fontFace: 'Calibri', bold: true, color: C.navy
  });
  s.addText([
    { text: 'GNN L tầng: tính h_v cần toàn bộ lân cận L-hop của v', options: { bullet: true, breakLine: true } },
    { text: 'Số đỉnh phụ thuộc tăng theo O(d̄ᴸ) — cấp số nhân với độ sâu', options: { bullet: true, breakLine: true } },
    { text: 'Chia mini-batch nhỏ KHÔNG giúp giảm bộ nhớ nếu không có sampling', options: { bullet: true, breakLine: true } },
    { text: 'ogbn-arxiv (d̄≈13, L=3): mini-batch 512 đỉnh → ~1,2 triệu đỉnh phụ thuộc', options: { bullet: true } },
  ], {
    x: 0.35, y: 1.45, w: 4.7, h: 2.2,
    fontSize: 13.5, fontFace: 'Calibri', color: C.darkText, paraSpaceAfter: 8
  });

  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.35, y: 3.75, w: 4.7, h: 0.88,
    fill: { color: 'FFF3CD' }, line: { color: 'FFC107', width: 2 }
  });
  s.addText('Số đỉnh phụ thuộc ~ O(d̄ᴸ)     GCN 4 tầng trên Amazon (2M đỉnh, 61M cạnh) [13]: OOM trên mọi phương pháp cũ', {
    x: 0.35, y: 3.75, w: 4.7, h: 0.88,
    fontSize: 13, fontFace: 'Calibri', bold: true, color: '7B4F00',
    align: 'center', valign: 'middle'
  });

  s.addChart(pres.charts.BAR, [{
    name: 'Số đỉnh cần nạp vào bộ nhớ',
    labels: ['L = 1  (5K)', 'L = 2  (51K)', 'L = 3  (512K)'],
    values: [5120, 51200, 512000]
  }], {
    x: 5.3, y: 1.0, w: 4.4, h: 3.65,
    barDir: 'col',
    chartColors: ['4FC3F7', '0288D1', C.navy],
    showValue: true,
    dataLabelFontSize: 12,
    dataLabelColor: C.darkText,
    dataLabelPosition: 'outEnd',
    showTitle: true,
    title: 'Mini-batch 512 đỉnh, bậc trung bình d̄=10',
    titleFontSize: 11,
    titleColor: C.gray,
    catAxisLabelColor: C.darkText,
    valAxisLabelColor: C.gray,
    valGridLine: { color: 'E2E8F0', size: 0.5 },
    catGridLine: { style: 'none' },
    chartArea: { fill: { color: C.white }, roundedCorners: false },
    showLegend: false,
  });

  s.addText('(3 tầng, d̄=10: gần như phải nạp toàn bộ đồ thị cho một mini-batch nhỏ)', {
    x: 5.3, y: 4.72, w: 4.4, h: 0.38,
    fontSize: 10.5, fontFace: 'Calibri', italic: true, color: C.gray, align: 'center'
  });
}

// ============================================================
// SLIDE 9: Câu hỏi nghiên cứu
// ============================================================
{
  const s = pres.addSlide();
  s.background = { color: C.navy };
  addSlideNum(s, 9, C.white);

  s.addText('Câu Hỏi Nghiên Cứu', {
    x: 1, y: 0.5, w: 8, h: 0.6,
    fontSize: 22, fontFace: 'Calibri', bold: true,
    color: 'B8D4E8', align: 'center'
  });

  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.8, y: 1.2, w: 8.4, h: 1.9,
    fill: { color: C.teal, transparency: 20 }, line: { color: C.mint, width: 2 }
  });
  s.addText('"Có thể học được chính sách lấy mẫu đỉnh thích ứng — thay vì dùng heuristic tĩnh — để tối thiểu hóa chi phí bộ nhớ khi huấn luyện GNN mà vẫn giữ được chất lượng phân loại?"', {
    x: 0.8, y: 1.2, w: 8.4, h: 1.9,
    fontSize: 17, fontFace: 'Calibri', italic: true,
    color: C.white, align: 'center', valign: 'middle'
  });

  s.addText('Phạm vi: lấy mẫu đỉnh thích ứng — phân loại đỉnh — đồ thị quy mô lớn', {
    x: 1, y: 3.3, w: 8, h: 0.48,
    fontSize: 14, fontFace: 'Calibri', color: 'B8D4E8', align: 'center'
  });

  const aspects = [
    ['Học được', 'Không phải heuristic cố định'],
    ['Thích ứng', 'Theo từng đồ thị & tác vụ'],
    ['Hiệu quả', 'Bộ nhớ GPU thấp, ổn định'],
  ];
  aspects.forEach(([title, desc], i) => {
    const x = 0.9 + i * 2.9;
    s.addShape(pres.shapes.RECTANGLE, {
      x, y: 4.0, w: 2.6, h: 1.2,
      fill: { color: '0D3F5A' }, line: { color: C.mint, width: 1.5 }
    });
    s.addText(title, {
      x, y: 4.0, w: 2.6, h: 0.45,
      fontSize: 15, fontFace: 'Calibri', bold: true,
      color: C.mint, align: 'center', valign: 'middle'
    });
    s.addText(desc, {
      x, y: 4.45, w: 2.6, h: 0.7,
      fontSize: 13, fontFace: 'Calibri', color: C.white,
      align: 'center', valign: 'middle'
    });
  });
}

// ============================================================
// SLIDE 10: Tổng quan phương pháp
// ============================================================
{
  const s = pres.addSlide();
  s.background = { color: C.white };
  titleBar(s, 'Tổng Quan Các Phương Pháp Sampling');
  addSlideNum(s, 10);

  const H = { bold: true, fill: { color: C.navy }, color: C.white, fontSize: 12, align: 'center' };
  const N = { fontSize: 11.5 };
  const G = { bold: true, fill: { color: '02C39A', transparency: 40 }, color: '0A3D2A', fontSize: 12 };

  const rows = [
    [
      { text: 'Nhóm', options: H },
      { text: 'Đại diện tiêu biểu', options: H },
      { text: 'Cơ chế', options: H },
      { text: 'Hạn chế chính', options: H },
    ],
    [
      { text: 'Theo đỉnh', options: N },
      { text: 'GraphSAGE [4], PinSage [6], VR-GCN [9]', options: N },
      { text: 'k lân cận / đỉnh / tầng', options: N },
      { text: 'Dư thừa, vẫn bùng nổ theo số tầng', options: N },
    ],
    [
      { text: 'Theo tầng', options: N },
      { text: 'FastGCN [10], AS-GCN [11], LADIES [12]', options: N },
      { text: 'Chọn k đỉnh dùng chung cho toàn bộ batch trong một tầng', options: N },
      { text: 'AS-GCN: tốn bộ nhớ (attention), OOM đồ thị lớn', options: N },
    ],
    [
      { text: 'Theo đồ thị con', options: N },
      { text: 'ClusterGCN [13], GraphSAINT [14]', options: N },
      { text: 'Trích đồ thị con làm mini-batch', options: N },
      { text: 'Cắt đứt cạnh giữa các cụm — mất thông tin kết nối quan trọng', options: N },
    ],
    [
      { text: 'Embedding lịch sử', options: N },
      { text: 'GNNAutoScale (GAS) [15]', options: N },
      { text: 'Tái dùng embedding cũ thay vì tính lại', options: N },
      { text: 'Tốn bộ nhớ lưu trữ lớn', options: N },
    ],
    [
      { text: 'Thích ứng học được', options: G },
      { text: 'GRAPES [28]', options: G },
      { text: 'Học xác suất lấy mẫu theo mục tiêu tác vụ', options: G },
      { text: 'Chi phí huấn luyện mạng lấy mẫu thứ hai', options: G },
    ],
  ];

  s.addTable(rows, {
    x: 0.3, y: 0.95, w: 9.4, h: 4.1,
    border: { pt: 0.5, color: 'D4D4D4' },
    rowH: 0.65,
    colW: [1.7, 2.4, 2.3, 2.8],
    align: 'left', valign: 'middle',
    margin: [3, 5, 3, 5],
  });

  s.addText('→ Khoảng trống: cần phương pháp lấy mẫu HỌC ĐƯỢC, thích ứng theo từng đồ thị và tác vụ cụ thể', {
    x: 0.3, y: 5.15, w: 9.4, h: 0.28,
    fontSize: 11.5, fontFace: 'Calibri', italic: true, bold: true,
    color: C.teal, align: 'center'
  });
}

// ============================================================
// SLIDE 11: GRAPES ý tưởng cốt lõi
// ============================================================
{
  const s = pres.addSlide();
  s.background = { color: C.white };
  titleBar(s, 'GRAPES: Ý Tưởng');
  addSlideNum(s, 11);

  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.3, y: 0.95, w: 9.4, h: 0.88,
    fill: { color: C.lightBlue }, line: { color: C.teal, width: 1.5 }
  });
  s.addText('GRAPES huấn luyện một GNN thứ hai để HỌC xác suất lấy mẫu đỉnh, tối ưu trực tiếp theo mục tiêu tác vụ đầu cuối.', {
    x: 0.3, y: 0.95, w: 9.4, h: 0.88,
    fontSize: 15, fontFace: 'Calibri', bold: true, color: C.navy,
    align: 'center', valign: 'middle'
  });

  const props = [
    { title: 'Tính Thích Ứng', desc: 'Bộ lấy mẫu học được từ mục tiêu tác vụ — điều chỉnh theo từng đồ thị cụ thể — vượt qua giới hạn của heuristic tĩnh (random, degree-based)', color: C.navy },
    { title: 'Hiệu Quả Bộ Nhớ', desc: 'Dùng bộ nhớ GPU ít hơn nhiều bậc so với GAS (embedding lịch sử). Chạy được trên đồ thị 2,4M đỉnh với chỉ 15GB VRAM (Tesla T4).', color: C.navy },
    { title: 'Bền Vững Mẫu Nhỏ', desc: 'Duy trì hiệu năng tốt khi giảm kích thước mẫu theo cấp số mũ. Độ lệch chuẩn nhỏ nhất trong tất cả phương pháp so sánh.', color: C.navy },
  ];

  props.forEach(({ title, desc, color }, i) => {
    const x = 0.3 + i * 3.2;
    s.addShape(pres.shapes.RECTANGLE, {
      x: x + 0.05, y: 2.03, w: 3.0, h: 3.2,
      fill: { color: 'E0E0E0' }, line: { color: 'E0E0E0' }
    });
    s.addShape(pres.shapes.RECTANGLE, {
      x, y: 2.0, w: 3.0, h: 3.2,
      fill: { color: C.white }, line: { color: color, width: 2 }
    });
    s.addShape(pres.shapes.RECTANGLE, {
      x, y: 2.0, w: 3.0, h: 0.58,
      fill: { color: color }, line: { color: color }
    });
    s.addText(title, {
      x, y: 2.0, w: 3.0, h: 0.58,
      fontSize: 15, fontFace: 'Calibri', bold: true,
      color: C.white, align: 'center', valign: 'middle', margin: 0
    });
    s.addText(desc, {
      x: x + 0.15, y: 2.65, w: 2.7, h: 2.4,
      fontSize: 13.5, fontFace: 'Calibri', color: C.darkText,
      align: 'left', valign: 'top', paraSpaceAfter: 6
    });
  });
}

// ============================================================
// SLIDE 12: Kiến trúc GRAPES
// ============================================================
{
  const s = pres.addSlide();
  s.background = { color: C.white };
  titleBar(s, 'Kiến Trúc GRAPES: Hai GNN Phối Hợp');
  addSlideNum(s, 12);

  // GCN_S
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.25, y: 1.05, w: 2.6, h: 2.9,
    fill: { color: 'E8F4FD' }, line: { color: C.navy, width: 2 }
  });
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.25, y: 1.05, w: 2.6, h: 0.56,
    fill: { color: C.navy }, line: { color: C.navy }
  });
  s.addText('GCN_S  (Sampler)', {
    x: 0.25, y: 1.05, w: 2.6, h: 0.56,
    fontSize: 14, fontFace: 'Calibri', bold: true,
    color: C.white, align: 'center', valign: 'middle', margin: 0
  });
  s.addText('Đầu vào: Đồ thị G\n\nĐầu ra: Xác suất pᵢ cho từng đỉnh lân cận\n\nBackbone: GCN tiêu chuẩn', {
    x: 0.38, y: 1.68, w: 2.3, h: 2.1,
    fontSize: 12.5, fontFace: 'Calibri', color: C.darkText
  });

  // Arrow 1
  s.addText('→', {
    x: 2.9, y: 2.35, w: 0.55, h: 0.4,
    fontSize: 22, fontFace: 'Calibri', bold: true, color: C.teal, align: 'center'
  });
  s.addText('pᵢ', {
    x: 2.9, y: 2.72, w: 0.55, h: 0.28,
    fontSize: 11, fontFace: 'Calibri', italic: true, color: C.gray, align: 'center'
  });

  // Gumbel Top-k
  s.addShape(pres.shapes.RECTANGLE, {
    x: 3.5, y: 1.65, w: 2.5, h: 1.65,
    fill: { color: 'FFF3CD' }, line: { color: C.orange, width: 2.5 }
  });
  s.addText('Gumbel Top-k', {
    x: 3.5, y: 1.65, w: 2.5, h: 0.62,
    fontSize: 16, fontFace: 'Calibri', bold: true,
    color: '7B4F00', align: 'center', valign: 'middle'
  });
  s.addText('Chọn k đỉnh quan trọng nhất\n(khả vi hóa quá trình\ndiscrete sampling)', {
    x: 3.5, y: 2.27, w: 2.5, h: 1.0,
    fontSize: 12, fontFace: 'Calibri', color: '7B4F00', align: 'center'
  });

  // Arrow 2
  s.addText('→', {
    x: 6.05, y: 2.35, w: 0.55, h: 0.4,
    fontSize: 22, fontFace: 'Calibri', bold: true, color: C.teal, align: 'center'
  });
  s.addText('G_s', {
    x: 6.05, y: 2.72, w: 0.55, h: 0.28,
    fontSize: 11, fontFace: 'Calibri', italic: true, color: C.gray, align: 'center'
  });

  // GCN_C
  s.addShape(pres.shapes.RECTANGLE, {
    x: 6.65, y: 1.05, w: 2.6, h: 2.9,
    fill: { color: 'FDF0F0' }, line: { color: C.red, width: 2 }
  });
  s.addShape(pres.shapes.RECTANGLE, {
    x: 6.65, y: 1.05, w: 2.6, h: 0.56,
    fill: { color: C.red }, line: { color: C.red }
  });
  s.addText('GCN_C  (Classifier)', {
    x: 6.65, y: 1.05, w: 2.6, h: 0.56,
    fontSize: 14, fontFace: 'Calibri', bold: true,
    color: C.white, align: 'center', valign: 'middle', margin: 0
  });
  s.addText('Đầu vào: Đồ thị con G_s\n\nĐầu ra: Dự đoán nhãn đỉnh\n\nTính: Loss L_C → reward cho GFlowNet', {
    x: 6.78, y: 1.68, w: 2.3, h: 2.1,
    fontSize: 12.5, fontFace: 'Calibri', color: C.darkText
  });

  // Feedback arrow: GCN_C bottom → down → left → up → arrowhead into GCN_S
  // Step 1: vertical down from GCN_C center-bottom (x=7.95, y=3.95)
  s.addShape(pres.shapes.LINE, {
    x: 7.95, y: 3.95, w: 0, h: 0.65,
    line: { color: C.mint, width: 2.5 }
  });
  // Step 2: horizontal segment at bottom (y=4.60)
  s.addShape(pres.shapes.LINE, {
    x: 1.55, y: 4.6, w: 6.4, h: 0,
    line: { color: C.mint, width: 2.5 }
  });
  // Step 3: vertical up to GCN_S center-bottom (x=1.55, y=3.95)
  s.addShape(pres.shapes.LINE, {
    x: 1.55, y: 3.95, w: 0, h: 0.65,
    line: { color: C.mint, width: 2.5 }
  });
  // Arrowhead pointing UP into GCN_S (^ shape at x=1.55, y=3.95)
  s.addShape(pres.shapes.LINE, {
    x: 1.32, y: 4.2, w: 0.23, h: -0.25,
    line: { color: C.mint, width: 2.5 }
  });
  s.addShape(pres.shapes.LINE, {
    x: 1.55, y: 3.95, w: 0.23, h: 0.25,
    line: { color: C.mint, width: 2.5 }
  });

  // Label centred on horizontal arrow segment (y=4.60)
  s.addShape(pres.shapes.RECTANGLE, {
    x: 2.6, y: 4.44, w: 4.5, h: 0.32,
    fill: { color: '0A4D62' }, line: { color: C.mint, width: 1 }
  });
  s.addText('GFlowNet: cập nhật GCN_S từ reward của L_C', {
    x: 2.6, y: 4.44, w: 4.5, h: 0.32,
    fontSize: 11.5, fontFace: 'Calibri', bold: true, color: C.mint,
    align: 'center', valign: 'middle', margin: 0
  });

  s.addText('Điểm khác biệt: lấy mẫu HỌC ĐƯỢC vs. heuristic tĩnh (random, degree-based)', {
    x: 0.25, y: 5.12, w: 9.5, h: 0.3,
    fontSize: 11.5, fontFace: 'Calibri', italic: true, color: C.gray, align: 'center'
  });
}

// ============================================================
// SLIDE 13: GFlowNet — Tại Sao Cần Và Nó Làm Gì?
// ============================================================
{
  const s = pres.addSlide();
  s.background = { color: C.white };
  titleBar(s, 'GFlowNet: Subgraph Tốt Hơn → Được Chọn Nhiều Hơn');
  addSlideNum(s, 13);

  // ─── TOP BANNER ───────────────────────────────────────────
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.28, y: 0.97, w: 9.44, h: 0.62,
    fill: { color: C.lightBlue }, line: { color: C.teal, width: 1.5 }
  });
  s.addText([
    { text: 'GFlowNet học phân phối: ', options: {} },
    { text: 'P(G_s) ∝ R(G_s)', options: { bold: true, color: C.navy } },
    { text: '  —  xác suất lấy mẫu subgraph tỷ lệ với chất lượng, không chỉ tìm max.', options: {} },
  ], {
    x: 0.42, y: 0.97, w: 9.2, h: 0.62,
    fontSize: 13.5, fontFace: 'Calibri', color: C.darkText,
    align: 'center', valign: 'middle'
  });

  // ─── EXAMPLE LABEL ────────────────────────────────────────
  s.addText('Ví dụ: 3 subgraph khả thi — chất lượng: SG1=0,8  /  SG2=0,6  /  SG3=0,1', {
    x: 0.28, y: 1.67, w: 9.44, h: 0.26,
    fontSize: 12, fontFace: 'Calibri', italic: true, bold: true,
    color: C.gray, align: 'center'
  });

  // ─── COLUMN HEADERS ───────────────────────────────────────
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.28, y: 2.0, w: 4.55, h: 0.42,
    fill: { color: C.red }, line: { color: C.red }
  });
  s.addText('Cách Cũ: Chỉ Học 1 Cách Lấy Mẫu Duy Nhất', {
    x: 0.28, y: 2.0, w: 4.55, h: 0.42,
    fontSize: 13, fontFace: 'Calibri', bold: true,
    color: C.white, align: 'center', valign: 'middle'
  });
  s.addShape(pres.shapes.RECTANGLE, {
    x: 5.1, y: 2.0, w: 4.35, h: 0.42,
    fill: { color: C.teal }, line: { color: C.teal }
  });
  s.addText('GFlowNet ✓: Học Nhiều Cách Lấy Mẫu Khác Nhau', {
    x: 5.1, y: 2.0, w: 4.35, h: 0.42,
    fontSize: 13, fontFace: 'Calibri', bold: true,
    color: C.white, align: 'center', valign: 'middle'
  });

  // ─── COLUMN BODIES ────────────────────────────────────────
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.28, y: 2.42, w: 4.55, h: 2.8,
    fill: { color: 'FFF0F0' }, line: { color: C.red, width: 1.5 }
  });
  s.addShape(pres.shapes.RECTANGLE, {
    x: 5.1, y: 2.42, w: 4.35, h: 2.8,
    fill: { color: 'E8F8F2' }, line: { color: C.teal, width: 1.5 }
  });

  // VS badge — compact, sits in the gap between columns (no tall overlap)
  s.addShape(pres.shapes.RECTANGLE, {
    x: 4.74, y: 3.08, w: 0.52, h: 0.44,
    fill: { color: C.white }, line: { color: C.navy, width: 1.5 }
  });
  s.addText('VS', {
    x: 4.74, y: 3.08, w: 0.52, h: 0.44,
    fontSize: 14, fontFace: 'Calibri', bold: true,
    color: C.navy, align: 'center', valign: 'middle'
  });

  // ─── BAR CHARTS ───────────────────────────────────────────
  const barW = 1.02, barBottom = 4.46, maxBarH = 1.55;
  const subLabels = ['SG1', 'SG2', 'SG3'];

  // REINFORCE bars: 100%, 0%, 0%
  [[100, 0.45], [0, 1.83], [0, 3.21]].forEach(([pct, bx], i) => {
    const bh = Math.max(maxBarH * pct / 100, 0.04);
    const by = barBottom - bh;
    const fc = pct > 0 ? C.red : 'DDDDDD';
    s.addShape(pres.shapes.RECTANGLE, { x: bx, y: by, w: barW, h: bh, fill: { color: fc }, line: { color: fc } });
    s.addText(pct + '%', {
      x: bx, y: pct > 30 ? by + 0.06 : by - 0.28, w: barW, h: 0.26,
      fontSize: 13, fontFace: 'Calibri', bold: true,
      color: pct > 0 ? C.white : C.gray, align: 'center'
    });
    s.addText(subLabels[i], {
      x: bx, y: barBottom + 0.06, w: barW, h: 0.22,
      fontSize: 11, fontFace: 'Calibri', color: C.gray, align: 'center'
    });
  });
  s.addText('Chỉ học 1 cách — bỏ lỡ SG2, SG3 dù cũng tốt', {
    x: 0.32, y: 4.80, w: 4.45, h: 0.32,
    fontSize: 11, fontFace: 'Calibri', italic: true, color: C.red, align: 'center'
  });

  // GFlowNet bars: 53%, 40%, 7%
  [[53, 5.28], [40, 6.61], [7, 7.94]].forEach(([pct, bx], i) => {
    const bh = Math.max(maxBarH * pct / 100, 0.04);
    const by = barBottom - bh;
    const fc = [C.navy, C.teal, '7EB5C5'][i];
    s.addShape(pres.shapes.RECTANGLE, { x: bx, y: by, w: barW, h: bh, fill: { color: fc }, line: { color: fc } });
    s.addText(pct + '%', {
      x: bx, y: pct > 30 ? by + 0.06 : by - 0.28, w: barW, h: 0.26,
      fontSize: 13, fontFace: 'Calibri', bold: true,
      color: pct > 10 ? C.white : C.navy, align: 'center'
    });
    s.addText(subLabels[i], {
      x: bx, y: barBottom + 0.06, w: barW, h: 0.22,
      fontSize: 11, fontFace: 'Calibri', color: C.gray, align: 'center'
    });
  });
  s.addText('Khám phá cả G_s², G_s³ — đa dạng, bền vững hơn', {
    x: 5.15, y: 4.80, w: 4.25, h: 0.32,
    fontSize: 11, fontFace: 'Calibri', italic: true, color: C.teal, align: 'center'
  });

  // ─── BOTTOM STRIP (GFlowNet only — full width) ────────────
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.28, y: 5.22, w: 9.44, h: 0.35,
    fill: { color: '031F30' }, line: { color: C.orange, width: 1 }
  });
  s.addText([
    { text: 'GFlowNet dùng TB Loss: ', options: { bold: true, color: C.orange } },
    { text: 'L_TB = (log Z  +  log q(τ|V⁰)  +  α·L_C)²', options: { bold: true, color: C.mint } },
    { text: '     |     ', options: { color: C.gray } },
    { text: 'Trong GRAPES: ', options: { bold: true, color: C.mint } },
    { text: 'R = exp(−α·L_C)', options: { color: 'B8D4E8' } },
  ], {
    x: 0.42, y: 5.22, w: 9.16, h: 0.35,
    fontSize: 11.5, fontFace: 'Calibri', align: 'center', valign: 'middle'
  });
}


// ============================================================
// SLIDE 14: GFlowNet & Chính sách
// ============================================================
{
  const s = pres.addSlide();
  s.background = { color: C.white };
  titleBar(s, 'GFlowNet & Chính Sách Lấy Mẫu Phân Rã Theo Tầng');
  addSlideNum(s, 14);

  // Left
  s.addText('Tại sao cần GFlowNet?', {
    x: 0.3, y: 1.0, w: 4.6, h: 0.4,
    fontSize: 16, fontFace: 'Calibri', bold: true, color: C.navy
  });
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.3, y: 1.45, w: 4.6, h: 1.1,
    fill: { color: 'FFF3CD' }, line: { color: C.orange, width: 1.5 }
  });
  s.addText('Phép chọn đỉnh chỉ là 0 hoặc 1 — không có giá trị ở giữa → mạng không tính được "nên điều chỉnh theo hướng nào" → không tự học được', {
    x: 0.3, y: 1.45, w: 4.6, h: 1.1,
    fontSize: 13.5, fontFace: 'Calibri', color: '7B4F00',
    align: 'center', valign: 'middle'
  });
  s.addText('GFlowNet học phân phối xác suất trên các tập con, tối ưu theo reward = L_C. Không yêu cầu khả vi đối với quá trình sampling.\n\n→ Ổn định hơn REINFORCE (phương sai thấp hơn).\n→ Khám phá đa dạng hơn trong không gian các tập con.', {
    x: 0.3, y: 2.65, w: 4.6, h: 2.3,
    fontSize: 13, fontFace: 'Calibri', color: C.darkText, paraSpaceAfter: 5
  });

  s.addShape(pres.shapes.LINE, {
    x: 5.1, y: 1.0, w: 0, h: 4.4,
    line: { color: 'E2E8F0', width: 1 }
  });

  // Right
  s.addText('Chính Sách Phân Rã Theo Tầng', {
    x: 5.3, y: 1.0, w: 4.4, h: 0.4,
    fontSize: 16, fontFace: 'Calibri', bold: true, color: C.navy
  });
  s.addShape(pres.shapes.RECTANGLE, {
    x: 5.3, y: 1.45, w: 4.4, h: 0.82,
    fill: { color: C.lightBlue }, line: { color: C.teal, width: 1.5 }
  });
  s.addText('q(V¹,…,Vᴸ | V⁰) = Π_{l=1}^{L} q(Vˡ | V⁰,…,Vˡ⁻¹)', {
    x: 5.3, y: 1.45, w: 4.4, h: 0.82,
    fontSize: 14, fontFace: 'Calibri', bold: true, color: C.navy,
    align: 'center', valign: 'middle'
  });

  const steps = [
    ['Tầng 0', 'V⁰ = tập đỉnh đích mini-batch'],
    ['Tầng 1', 'GCN_S tính pᵢ cho lân cận của K⁽⁰⁾, chọn k đỉnh → V¹'],
    ['Tầng 2', 'GCN_S tính pᵢ cho lân cận của K⁽¹⁾, chọn k đỉnh → V²'],
    ['Tầng L', 'K⁽ᴸ⁾ = V⁰ ∪ V¹ ∪ … ∪ Vᴸ (tích lũy qua từng tầng)'],
    ['Kết quả', 'Đồ thị con G_s được nạp vào GCN_C để phân loại'],
  ];

  steps.forEach(([step, desc], i) => {
    const y = 2.4 + i * 0.54;
    s.addShape(pres.shapes.RECTANGLE, {
      x: 5.3, y, w: 1.1, h: 0.42,
      fill: { color: i === steps.length - 1 ? C.mint : C.teal },
      line: { color: i === steps.length - 1 ? C.mint : C.teal }
    });
    s.addText(step, {
      x: 5.3, y, w: 1.1, h: 0.42,
      fontSize: 11, fontFace: 'Calibri', bold: true,
      color: i === steps.length - 1 ? C.navy : C.white,
      align: 'center', valign: 'middle', margin: 0
    });
    s.addText(desc, {
      x: 6.5, y, w: 3.2, h: 0.42,
      fontSize: 12.5, fontFace: 'Calibri', color: C.darkText, valign: 'middle'
    });
  });
}

// ============================================================
// SLIDE 15: Thiết lập thực nghiệm
// ============================================================
{
  const s = pres.addSlide();
  s.background = { color: C.white };
  titleBar(s, 'Thiết Lập Thực Nghiệm');
  addSlideNum(s, 15);

  s.addText('12 Dataset Benchmark', {
    x: 0.3, y: 1.0, w: 4.6, h: 0.42,
    fontSize: 16, fontFace: 'Calibri', bold: true, color: C.navy
  });
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.3, y: 1.48, w: 4.6, h: 1.55,
    fill: { color: C.lightBlue }, line: { color: C.navy, width: 1.5 }
  });
  s.addText('Homophily (7 tập) — nút giống nhau thường kết nối nhau', {
    x: 0.45, y: 1.52, w: 4.3, h: 0.35,
    fontSize: 12, fontFace: 'Calibri', bold: true, color: C.navy
  });
  s.addText([
    { text: 'Cora  •  CiteSeer  •  PubMed  •  Reddit', options: { breakLine: true } },
    { text: 'ogbn-arxiv  •  ogbn-products  •  DBLP', options: {} },
  ], {
    x: 0.45, y: 1.87, w: 4.3, h: 0.9,
    fontSize: 12.5, fontFace: 'Calibri', color: C.darkText, paraSpaceAfter: 4
  });

  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.3, y: 3.1, w: 4.6, h: 1.45,
    fill: { color: 'FFF0F0' }, line: { color: C.red, width: 1.5 }
  });
  s.addText('Heterophily (5 tập) — nút khác nhau vẫn kết nối nhau', {
    x: 0.45, y: 3.14, w: 4.3, h: 0.35,
    fontSize: 12, fontFace: 'Calibri', bold: true, color: C.red
  });
  s.addText([
    { text: 'Flickr  •  snap-patents  •  Yelp', options: { breakLine: true } },
    { text: 'ogbn-proteins  •  BlogCat', options: {} },
  ], {
    x: 0.45, y: 3.5, w: 4.3, h: 0.9,
    fontSize: 12.5, fontFace: 'Calibri', color: C.darkText, paraSpaceAfter: 4
  });

  s.addText('Giao Thức Đánh Giá', {
    x: 5.2, y: 1.0, w: 4.5, h: 0.42,
    fontSize: 16, fontFace: 'Calibri', bold: true, color: C.navy
  });

  const settings = [
    ['Batch size', '256 đỉnh / batch'],
    ['Số mẫu', '256 đỉnh / tầng (tất cả pp)'],
    ['Số lần chạy', '10 runs → mean ± std'],
    ['GPU (gốc)', 'Nvidia RTX A6000 48 GB'],
    ['GPU (tái hiện)', 'Tesla T4 15,6 GB (Colab)'],
    ['Đánh giá', 'Full-graph inference trên test'],
    ['Metric', 'F1-score (macro / micro)'],
  ];

  // ─── GRAPES variants note ────────────────────────────────
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.3, y: 4.62, w: 4.6, h: 0.58,
    fill: { color: C.lightBlue }, line: { color: C.navy, width: 1 }
  });
  s.addText([
    { text: 'GRAPES-RL', options: { bold: true, color: C.navy } },
    { text: ': dùng REINFORCE', options: { color: C.darkText, breakLine: true } },
    { text: 'GRAPES-GFN', options: { bold: true, color: C.teal } },
    { text: ': thay bằng GFlowNet', options: { color: C.darkText } },
  ], {
    x: 0.42, y: 4.62, w: 4.36, h: 0.58,
    fontSize: 11.5, fontFace: 'Calibri', align: 'left', valign: 'middle'
  });

  settings.forEach(([key, val], i) => {
    const y = 1.48 + i * 0.56;
    s.addShape(pres.shapes.RECTANGLE, {
      x: 5.2, y, w: 2.1, h: 0.44,
      fill: { color: C.navy }, line: { color: C.navy }
    });
    s.addText(key, {
      x: 5.2, y, w: 2.1, h: 0.44,
      fontSize: 12, fontFace: 'Calibri', bold: true,
      color: C.white, align: 'center', valign: 'middle', margin: 0
    });
    s.addText(val, {
      x: 7.4, y, w: 2.35, h: 0.44,
      fontSize: 12, fontFace: 'Calibri', color: C.darkText, valign: 'middle'
    });
  });
}

// ============================================================
// SLIDE 16: Kết quả Homophily
// ============================================================
{
  const s = pres.addSlide();
  s.background = { color: C.white };
  titleBar(s, 'Kết Quả: Đồ Thị Homophily (F1-score %)');
  addSlideNum(s, 16);

  const H = { bold: true, fill: { color: C.navy }, color: C.white, fontSize: 11, align: 'center' };
  const N = { fontSize: 10.5, align: 'center' };
  const G = { bold: true, fill: { color: '02C39A', transparency: 40 }, color: '063A25', fontSize: 11, align: 'center' };
  const OOM = { color: 'AE2012', bold: true, fontSize: 10.5, align: 'center' };
  const GAS = { fill: { color: 'F4F8FB' }, fontSize: 10.5, align: 'center' };
  const UNSTBL = { fill: { color: 'FFF3E0' }, fontSize: 10, italic: true, color: 'B35200', align: 'center' };

  const rows = [
    [
      { text: 'Phương pháp', options: H },
      { text: 'Cora', options: H },
      { text: 'Reddit', options: H },
      { text: 'ogbn-arxiv', options: H },
      { text: 'ogbn-products', options: H },
      { text: 'DBLP', options: H },
    ],
    [{ text: 'GAS (baseline)', options: GAS }, { text: '87,00±0,19', options: GAS }, { text: '94,75±0,04', options: GAS }, { text: '68,36±0,55', options: GAS }, { text: '74,69±0,14', options: GAS }, { text: '83,08±0,31', options: GAS }],
    [{ text: 'FastGCN', options: N }, { text: '76,17±3,98', options: N }, { text: '62,93±3,28', options: N }, { text: '39,49±8,04', options: N }, { text: '66,09±3,04', options: N }, { text: '62,93±3,28', options: N }],
    [{ text: 'LADIES ⚠', options: UNSTBL }, { text: '76,02±11,69', options: UNSTBL }, { text: '59,30±2,69', options: UNSTBL }, { text: '43,52±8,03', options: UNSTBL }, { text: '68,08±1,95', options: UNSTBL }, { text: '59,97±10,45', options: UNSTBL }],
    [{ text: 'AS-GCN *', options: N }, { text: '85,60±0,54', options: N }, { text: '93,52±0,40', options: N }, { text: '65,38±1,80', options: N }, { text: 'OOM ✗', options: OOM }, { text: '83,24±0,51', options: N }],
    [{ text: 'PASS', options: N }, { text: '82,03±0,07', options: N }, { text: 'OOM ✗', options: OOM }, { text: '58,32±0,05', options: N }, { text: 'OOM ✗', options: OOM }, { text: '54,40±2,31', options: N }],
    [{ text: 'Random', options: N }, { text: '86,58±0,33', options: N }, { text: '94,16±0,06', options: N }, { text: '61,35±0,32', options: N }, { text: '70,47±0,32', options: N }, { text: '76,87±0,24', options: N }],
    [{ text: 'GRAPES-RL', options: G }, { text: '87,62±0,48 ①', options: G }, { text: '94,09±0,05', options: G }, { text: '62,58±0,64', options: G }, { text: '71,45±0,20', options: G }, { text: '76,88±0,33', options: G }],
    [{ text: 'GRAPES-GFN', options: G }, { text: '87,29±0,32', options: G }, { text: '94,30±0,06', options: G }, { text: '61,86±0,51', options: G }, { text: '70,66±0,30', options: G }, { text: '77,14±0,48 ①', options: G }],
  ];

  s.addTable(rows, {
    x: 0.25, y: 0.95, w: 9.5, h: 4.14,
    border: { pt: 0.5, color: 'D4D4D4' },
    rowH: 0.44,
    colW: [2.0, 1.35, 1.35, 1.6, 1.75, 1.45],
    align: 'center', valign: 'middle',
    margin: [2, 4, 2, 4],
  });

  s.addText('① = tốt nhất trong nhóm sampling   ⚠ = std rất cao (không ổn định)   * AS-GCN tốt nhất CiteSeer (79,21) & PubMed (90,58)   Nguồn: Bảng 1, Younesian et al. TMLR 2024', {
    x: 0.25, y: 5.14, w: 9.5, h: 0.26,
    fontSize: 8.5, fontFace: 'Calibri', italic: true, color: C.gray, align: 'center'
  });
}

// ============================================================
// SLIDE 17: Kết quả Heterophily
// ============================================================
{
  const s = pres.addSlide();
  s.background = { color: C.white };
  titleBar(s, 'Kết Quả: Đồ Thị Heterophily (F1-score %)');
  addSlideNum(s, 17);

  const H = { bold: true, fill: { color: C.navy }, color: C.white, fontSize: 10.5, align: 'center' };
  const N = { fontSize: 10, align: 'center' };
  const G = { bold: true, fill: { color: '02C39A', transparency: 40 }, color: '063A25', fontSize: 10.5, align: 'center' };
  const GASh = { fill: { color: 'F4F8FB' }, fontSize: 10, align: 'center' };
  const OOMh = { color: 'AE2012', bold: true, fontSize: 10, align: 'center' };

  const rows = [
    [
      { text: 'Phương pháp', options: H },
      { text: 'Flickr', options: H },
      { text: 'snap-patents', options: H },
      { text: 'Yelp', options: H },
      { text: 'ogbn-proteins', options: H },
      { text: 'BlogCat', options: H },
    ],
    // GAS tách riêng — embedding lịch sử, không phải sampling
    [{ text: 'GAS (baseline)', options: GASh }, { text: '49,96±0,28', options: GASh }, { text: '38,04±0,20', options: GASh }, { text: '37,81±0,07', options: GASh }, { text: '7,55±0,01', options: GASh }, { text: '6,07±0,04', options: GASh }],
    // Sampling baselines
    [{ text: 'LADIES', options: N }, { text: '47,19±3,42', options: N }, { text: '29,09±1,88', options: N }, { text: '18,92±3,18', options: N }, { text: '4,31±0,11', options: N }, { text: '6,74±0,67', options: N }],
    [{ text: 'GraphSAINT', options: N }, { text: '48,01±1,44', options: N }, { text: '28,01±0,57', options: N }, { text: '34,68±0,70', options: N }, { text: '9,94±0,07', options: N }, { text: '6,89±0,96', options: N }],
    [{ text: 'AS-GCN', options: N }, { text: '48,42±1,20', options: N }, { text: '31,04±0,19 ①', options: { ...N, bold: true } }, { text: '38,51±1,45', options: N }, { text: '5,20±0,36', options: N }, { text: '5,43±0,54', options: N }],
    [{ text: 'Random', options: N }, { text: '49,39±0,23', options: N }, { text: '29,74±0,34', options: N }, { text: '40,63±0,13', options: N }, { text: '10,82±0,05', options: N }, { text: '7,13±0,97', options: N }],
    [{ text: 'GRAPES-RL', options: G }, { text: '49,54±0,67 ①', options: G }, { text: '29,16±0,54', options: G }, { text: '40,69±0,55', options: G }, { text: '11,78±0,14 ①', options: G }, { text: '9,06±0,68', options: G }],
    [{ text: 'GRAPES-GFN', options: G }, { text: '49,29±0,32', options: G }, { text: '29,58±0,24', options: G }, { text: '44,57±0,88 ①', options: G }, { text: '11,57±0,18', options: G }, { text: '9,22±0,40 ①', options: G }],
  ];

  s.addTable(rows, {
    x: 0.25, y: 0.95, w: 9.5, h: 3.1,
    border: { pt: 0.5, color: 'D4D4D4' },
    rowH: 0.38,
    colW: [2.0, 1.4, 1.55, 1.4, 1.75, 1.4],
    align: 'center', valign: 'middle',
    margin: [2, 3, 2, 3],
  });

  const findings = [
    { title: 'GRAPES đạt #1 trên 4/5 dataset\nheterophily (RL: Flickr, ogbn-proteins;\nGFN: Yelp, BlogCat)', color: C.navy },
    { title: 'snap-patents: AS-GCN (31,04) dẫn đầu\nGRAPES không phải tốt nhất ở đây', color: C.orange },
    { title: 'GAS thắng Flickr (49,96) nhưng\ncần bộ nhớ lưu trữ N embedding', color: C.teal },
  ];

  findings.forEach(({ title, color }, i) => {
    const x = 0.25 + i * 3.2;
    s.addShape(pres.shapes.RECTANGLE, {
      x: x + 0.04, y: 4.18, w: 2.98, h: 1.22,
      fill: { color: 'E0E0E0' }, line: { color: 'E0E0E0' }
    });
    s.addShape(pres.shapes.RECTANGLE, {
      x, y: 4.15, w: 2.98, h: 1.22,
      fill: { color: C.white }, line: { color: color, width: 2 }
    });
    s.addShape(pres.shapes.RECTANGLE, {
      x, y: 4.15, w: 2.98, h: 0.4,
      fill: { color: color }, line: { color: color }
    });
    s.addText('Nhận xét ' + (i + 1), {
      x, y: 4.15, w: 2.98, h: 0.4,
      fontSize: 12, fontFace: 'Calibri', bold: true,
      color: C.white, align: 'center', valign: 'middle', margin: 0
    });
    s.addText(title, {
      x: x + 0.1, y: 4.58, w: 2.78, h: 0.75,
      fontSize: 11.5, fontFace: 'Calibri', color: C.darkText,
      align: 'center', valign: 'middle'
    });
  });

  s.addText('① = tốt nhất trong nhóm sampling   Nguồn: Bảng 2, Younesian et al. TMLR 2024', {
    x: 0.25, y: 5.44, w: 9.5, h: 0.2,
    fontSize: 9, italic: true, color: C.gray, align: 'right'
  });
}

// ============================================================
// SLIDE 18: Thực nghiệm tái hiện
// ============================================================
{
  const s = pres.addSlide();
  s.background = { color: C.white };
  titleBar(s, 'Thực Nghiệm Tái Hiện Của Học Viên');
  addSlideNum(s, 18);

  // --- Lý do tái hiện (3 boxes) ---
  s.addText('Lý do tái hiện', {
    x: 0.28, y: 0.95, w: 1.30, h: 0.28,
    fontSize: 10.5, fontFace: 'Calibri', bold: true, color: C.navy
  });

  const reasons = [
    {
      icon: '🔬',
      title: 'Kiểm chứng độc lập',
      body: 'Bài báo gốc dùng RTX A6000 49GB — môi trường không phổ biến. Cần xác nhận kết quả có tái hiện được trên phần cứng thực tế hơn (T4 15,6GB = ⅓ VRAM).'
    },
    {
      icon: '📐',
      title: 'Kiểm tra scalability thực tế',
      body: 'Bài báo claim GRAPES scalable — nhưng chưa có con số OOM/không OOM trên phần cứng tiêu chuẩn. ogbn-products (2,4M đỉnh, 61,9M cạnh) là test case cực đoan.'
    },
    {
      icon: '⚙️',
      title: 'Cơ sở cho giai đoạn 2',
      body: 'Tái hiện thành công = nắm rõ codebase (GCN_S, GFlowNet, Gumbel Top-k). Đây là điều kiện tiên quyết để mở rộng sang bài toán gợi ý ở giai đoạn 2.'
    },
  ];

  reasons.forEach(({ title, body }, i) => {
    const x = 0.28 + i * 3.20;
    s.addShape(pres.shapes.RECTANGLE, {
      x, y: 1.24, w: 3.08, h: 1.02,
      fill: { color: i===0?'EBF5FB': i===1?'FFF8E7':'E8F8F5' },
      line: { color: i===0?C.teal: i===1?C.orange:C.mint, width: 1.5 }
    });
    s.addShape(pres.shapes.RECTANGLE, {
      x, y: 1.24, w: 3.08, h: 0.28,
      fill: { color: i===0?C.teal: i===1?C.orange:C.mint },
      line: { color: 'none' }
    });
    s.addText(title, {
      x: x+0.08, y: 1.24, w: 2.96, h: 0.28,
      fontSize: 10, bold: true, color: C.white, fontFace: 'Calibri', valign: 'middle'
    });
    s.addText(body, {
      x: x+0.08, y: 1.54, w: 2.92, h: 0.68,
      fontSize: 9.5, color: C.darkText, fontFace: 'Calibri', valign: 'top'
    });
  });

  // --- Environment bar ---
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.28, y: 2.34, w: 9.44, h: 0.30,
    fill: { color: 'F0F4F8' }, line: { color: 'D0D8E0', width: 0.8 }
  });
  s.addText('Môi trường: Google Colab  |  Tesla T4 15,6GB VRAM  |  PyTorch 2.11 + torch-geometric 2.7  |  4 datasets, 3 lần chạy/dataset', {
    x: 0.28, y: 2.34, w: 9.44, h: 0.30,
    fontSize: 10, fontFace: 'Calibri', color: C.darkText, align: 'center', valign: 'middle'
  });

  // --- Results table ---
  const H = { bold: true, fill: { color: C.navy }, color: C.white, fontSize: 11, align: 'center' };
  const N = { fontSize: 11, align: 'center' };
  const G = { bold: true, fill: { color: '02C39A', transparency: 40 }, color: '063A25', fontSize: 11, align: 'center' };
  const POS = { fill: { color: 'E8F5E9' }, bold: true, color: '1A6B35', fontSize: 11, align: 'center' };
  const NEU = { fill: { color: 'FFF8E1' }, color: '7B4F00', fontSize: 11, align: 'center' };

  const rows = [
    [
      { text: 'Phương pháp', options: H },
      { text: 'Cora', options: H },
      { text: 'CiteSeer', options: H },
      { text: 'ogbn-arxiv', options: H },
      { text: 'ogbn-products', options: H },
    ],
    [
      { text: 'Random', options: N },
      { text: '86,77±0,38', options: N },
      { text: '79,00±0,82', options: N },
      { text: '61,28±0,29', options: N },
      { text: '—', options: N },
    ],
    [
      { text: 'GRAPES-GFN', options: G },
      { text: '87,10±0,17', options: G },
      { text: '78,57±0,71', options: G },
      { text: '62,04±0,31', options: G },
      { text: 'Chạy được (9/10 epoch)', options: G },
    ],
    [
      { text: 'Δ (GFN − Random)', options: { bold: true, fill: { color: 'F0F4F8' }, fontSize: 11, align: 'center' } },
      { text: '+0,33', options: POS },
      { text: '−0,43', options: NEU },
      { text: '+0,76', options: POS },
      { text: 'Không OOM (15GB)', options: { ...POS } },
    ],
  ];

  s.addTable(rows, {
    x: 0.28, y: 2.70, w: 9.44, h: 1.68,
    border: { pt: 0.5, color: 'D4D4D4' },
    rowH: 0.41,
    colW: [2.10, 1.60, 1.60, 1.60, 2.54],
    align: 'center', valign: 'middle',
    margin: [2, 4, 2, 4],
  });

  // --- Key finding box ---
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.28, y: 4.46, w: 9.44, h: 0.74,
    fill: { color: C.lightBlue }, line: { color: C.teal, width: 2 }
  });
  s.addText([
    { text: 'Phát hiện quan trọng nhất: ', options: { bold: true } },
    { text: 'GRAPES chạy không OOM trên ogbn-products (2,4M đỉnh, 61,9M cạnh) trên Tesla T4 15,6GB — bằng ⅓ VRAM bài báo gốc. 9/10 epoch ổn định. |Δ| ≤ 0,76 F1 → tái hiện xác nhận thành công.' },
  ], {
    x: 0.42, y: 4.46, w: 9.16, h: 0.74,
    fontSize: 11.5, fontFace: 'Calibri', color: C.navy, valign: 'middle'
  });

}

// ============================================================
// SLIDE 19: Chi phí bộ nhớ & thời gian (Tái hiện)
// ============================================================
{
  const s = pres.addSlide();
  s.background = { color: C.white };
  titleBar(s, 'Chi Phí Bộ Nhớ & Thời Gian Thực Tế (Bảng 5.6)');
  addSlideNum(s, 19);

  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.25, y: 0.95, w: 9.5, h: 0.55,
    fill: { color: C.lightGray }, line: { color: C.lightGray }
  });
  s.addText('Môi trường: Google Colab  |  Tesla T4 15,6GB  |  Đo 3 lần, lấy trung bình ± độ lệch chuẩn', {
    x: 0.25, y: 0.95, w: 9.5, h: 0.55,
    fontSize: 12.5, fontFace: 'Calibri', color: C.darkText,
    align: 'center', valign: 'middle'
  });

  s.addText('So Sánh Bộ Nhớ GPU & Thời Gian Mỗi Epoch: GRAPES-GFN vs Random', {
    x: 0.25, y: 1.57, w: 9.5, h: 0.32,
    fontSize: 12.5, fontFace: 'Calibri', bold: true, color: C.navy
  });

  const Hm = { bold: true, fill: { color: C.navy }, color: C.white, fontSize: 12.5, align: 'center' };
  const Nm = { fontSize: 12.5, align: 'center' };
  const Gm = { bold: true, fill: { color: '02C39A', transparency: 40 }, color: '063A25', fontSize: 12.5, align: 'center' };
  const Wm = { bold: true, fill: { color: 'FFF3E0' }, color: '7B4F00', fontSize: 12.5, align: 'center' };

  const memRows = [
    [
      { text: 'Dataset', options: Hm },
      { text: 'Bộ nhớ GRAPES (MB)', options: Hm },
      { text: 'Bộ nhớ Random (MB)', options: Hm },
      { text: 'Tỉ lệ bộ nhớ', options: Hm },
      { text: 'T. gian GRAPES', options: Hm },
      { text: 'T. gian Random', options: Hm },
    ],
    [
      { text: 'Cora', options: Nm },
      { text: '65,8 ± 5,5', options: Nm },
      { text: '29,0 ± 0,5', options: Nm },
      { text: '2,3×', options: Wm },
      { text: '56 giây', options: Nm },
      { text: '31 giây (1,8×)', options: Nm },
    ],
    [
      { text: 'CiteSeer', options: Nm },
      { text: '120,6 ± 19,0', options: Nm },
      { text: '45,1 ± 2,7', options: Nm },
      { text: '2,7×', options: Wm },
      { text: '95 giây', options: Nm },
      { text: '56 giây (1,7×)', options: Nm },
    ],
    [
      { text: 'ogbn-arxiv', options: Gm },
      { text: '59,3 ± 9,5', options: Gm },
      { text: '18,7 ± 0,1', options: Gm },
      { text: '3,2×', options: Gm },
      { text: '11.114 giây', options: Gm },
      { text: '8.133 giây (1,4×)', options: Gm },
    ],
  ];

  s.addTable(memRows, {
    x: 0.25, y: 1.93, w: 9.5, h: 1.88,
    border: { pt: 0.5, color: 'D4D4D4' },
    rowH: 0.47,
    colW: [1.5, 2.0, 1.9, 1.3, 1.5, 1.3],
    align: 'center', valign: 'middle',
    margin: [3, 4, 3, 4],
  });

  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.25, y: 3.92, w: 9.5, h: 0.88,
    fill: { color: C.lightBlue }, line: { color: C.teal, width: 2 }
  });
  s.addText([
    { text: 'Chi phí của lấy mẫu thích ứng: ', options: { bold: true } },
    { text: 'GRAPES tốn thêm 2,3–3,2× bộ nhớ và 1,4–1,8× thời gian so với Random do phải duy trì mạng lấy mẫu GCN_S song song. Đây là đánh đổi cần cân nhắc khi triển khai trên hệ thống bị giới hạn tài nguyên.' }
  ], {
    x: 0.4, y: 3.92, w: 9.2, h: 0.88,
    fontSize: 12.5, fontFace: 'Calibri', color: C.navy, valign: 'middle'
  });

  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.25, y: 4.86, w: 9.5, h: 0.42,
    fill: { color: C.lightGray }, line: { color: 'D4D4D4', width: 1 }
  });
  s.addText('ogbn-products (2,4M đỉnh, 61,9M cạnh): 9/10 epoch hoàn thành trên T4 15,6GB — không OOM dù chỉ bằng 1/3 VRAM RTX A6000', {
    x: 0.4, y: 4.86, w: 9.2, h: 0.42,
    fontSize: 11, fontFace: 'Calibri', color: C.teal,
    align: 'center', valign: 'middle', italic: true, bold: true
  });
}

// ============================================================
// SLIDE 20: Kết luận
// ============================================================
{
  const s = pres.addSlide();
  s.background = { color: C.white };
  titleBar(s, 'Kết Luận: Ưu Điểm & Nhược Điểm');
  addSlideNum(s, 20);

  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.25, y: 1.0, w: 4.6, h: 0.5,
    fill: { color: C.green }, line: { color: C.green }
  });
  s.addText('✔  Ưu Điểm', {
    x: 0.25, y: 1.0, w: 4.6, h: 0.5,
    fontSize: 16, fontFace: 'Calibri', bold: true,
    color: C.white, align: 'center', valign: 'middle', margin: 0
  });
  s.addText([
    { text: 'Lấy mẫu THÍCH ỨNG học được — tổng quát hóa tốt hơn giữa các đồ thị và tác vụ', options: { bullet: true, breakLine: true } },
    { text: 'Chạy được trên đồ thị hàng triệu đỉnh — nơi full-graph GCN và GAS bị OOM', options: { bullet: true, breakLine: true } },
    { text: 'Bền vững khi kích thước mẫu giảm mạnh — độ lệch chuẩn nhỏ nhất', options: { bullet: true, breakLine: true } },
    { text: 'Đặc biệt hiệu quả trên heterophily đa nhãn (#1 trên 4/5 dataset)', options: { bullet: true } },
  ], {
    x: 0.25, y: 1.55, w: 4.6, h: 2.65,
    fontSize: 13.5, fontFace: 'Calibri', color: C.darkText, paraSpaceAfter: 8
  });

  s.addShape(pres.shapes.LINE, {
    x: 4.95, y: 1.05, w: 0, h: 3.15,
    line: { color: 'E2E8F0', width: 1.5 }
  });

  s.addShape(pres.shapes.RECTANGLE, {
    x: 5.15, y: 1.0, w: 4.6, h: 0.5,
    fill: { color: C.red }, line: { color: C.red }
  });
  s.addText('✘  Nhược Điểm', {
    x: 5.15, y: 1.0, w: 4.6, h: 0.5,
    fontSize: 16, fontFace: 'Calibri', bold: true,
    color: C.white, align: 'center', valign: 'middle', margin: 0
  });
  s.addText([
    { text: 'Chi phí huấn luyện tăng thêm do mạng lấy mẫu GCN_S thứ hai', options: { bullet: true, breakLine: true } },
    { text: 'Ổn định GFlowNet — nhạy cảm với thiết kế hàm phần thưởng và siêu tham số', options: { bullet: true, breakLine: true } },
    { text: 'Chỉ đánh giá node classification — chưa kiểm chứng trên link prediction / gợi ý', options: { bullet: true, breakLine: true } },
    { text: 'Lấy mẫu đỉnh — chưa kiểm soát trực tiếp số cạnh, có thể là nút thắt trên đồ thị dày', options: { bullet: true } },
  ], {
    x: 5.15, y: 1.55, w: 4.6, h: 2.65,
    fontSize: 13.5, fontFace: 'Calibri', color: C.darkText, paraSpaceAfter: 8
  });

  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.25, y: 4.38, w: 9.5, h: 0.9,
    fill: { color: C.lightBlue }, line: { color: C.teal, width: 1.5 }
  });
  s.addText('GRAPES là bước tiến theo hướng lấy mẫu thích ứng có cơ sở lý thuyết. Scalability so với full-graph training là điểm mạnh rõ ràng; đánh đổi là chi phí cao hơn so với sampling đơn giản. Các nhược điểm chính là xuất phát điểm cho 3 hướng nghiên cứu tiếp theo.', {
    x: 0.4, y: 4.38, w: 9.2, h: 0.9,
    fontSize: 13, fontFace: 'Calibri', italic: true, color: C.navy,
    align: 'center', valign: 'middle'
  });
}

// ============================================================
// ============================================================
// ============================================================
// SLIDE 21: Hướng 1 — Áp Dụng Cho Hệ Thống Gợi Ý
// ============================================================
{
  const s = pres.addSlide();
  s.background = { color: C.navy };
  addSlideNum(s, 21, C.white);
  s.addShape(pres.shapes.RECTANGLE, { x:0,y:0,w:10,h:0.88, fill:{color:C.tealDark}, line:{color:C.tealDark} });
  s.addShape(pres.shapes.RECTANGLE, { x:0,y:0,w:0.65,h:0.88, fill:{color:C.mint}, line:{color:C.mint} });
  s.addText('01', { x:0,y:0,w:0.65,h:0.88, fontSize:26,fontFace:'Calibri',bold:true,color:C.navy,align:'center',valign:'middle' });
  s.addText('Hướng 1 — Áp Dụng Cho Hệ Thống Gợi Ý', { x:0.75,y:0.08,w:9.0,h:0.72, fontSize:22,fontFace:'Calibri',bold:true,color:C.white,valign:'middle' });

  const colW=3.08, gap=0.10, y0=1.00, bodyH=3.88;
  const cols21 = [
    {
      x: 0.28, hdrColor: C.teal, hdrText: 'Tại sao hướng này?',
      items: [
        'GRAPES chỉ kiểm chứng trên node classification — bài báo gốc chưa bao giờ test recommendation.',
        'Hệ thống gợi ý là ứng dụng GNN phổ biến nhất trong thực tế (Spotify, Amazon, Pinterest).',
        'Bài báo GRAPES xác nhận: phương pháp "applicable to link prediction tasks".',
        'Nhược điểm đo được ở giai đoạn 1 (chi phí sampling) cần được kiểm chứng trên bài toán thực tế hơn.'
      ],
      itemColor: 'A8D8EA'
    },
    {
      x: 0.28+colW+gap, hdrColor: C.mint, hdrText: 'Đề xuất cụ thể',
      items: [
        '① Đầu vào: đồ thị hai phía G = (U ∪ I, E) thay đồ thị đồng nhất.',
        '② GCN_C: thay Softmax bằng BPR Loss — chuẩn cho link prediction.',
        '③ Reward GFlowNet: R = exp(−α · L_BPR).',
        '④ GCN_S + GFlowNet: giữ nguyên hoàn toàn — đây là đóng góp cốt lõi của GRAPES.'
      ],
      itemColor: 'B8F0D8'
    },
    {
      x: 0.28+2*(colW+gap), hdrColor: '1A8C4E', hdrText: 'Tính khả thi',
      items: [
        '● Codebase GRAPES nắm rõ từ giai đoạn 1 — không cần viết lại.',
        '● Amazon Reviews\'23 public, metadata đầy đủ, chuẩn benchmark.',
        '● BPR Loss: 5 dòng PyTorch, đã có trong mọi GNN recommendation repo.',
        '● Baselines: LightGCN, NGCF, PinSage đều open-source, PyG.'
      ],
      itemColor: 'B0E8C4'
    },
  ];
  cols21.forEach(({ x, hdrColor, hdrText, items, itemColor }) => {
    s.addShape(pres.shapes.RECTANGLE, { x, y:y0, w:colW, h:bodyH+0.38, fill:{color:'082840'}, line:{color:hdrColor,width:1.8} });
    s.addShape(pres.shapes.RECTANGLE, { x, y:y0, w:colW, h:0.38, fill:{color:hdrColor}, line:{color:'none'} });
    s.addText(hdrText, { x:x+0.08, y:y0, w:colW-0.16, h:0.38, fontSize:12,bold:true,color:C.white,fontFace:'Calibri',valign:'middle' });
    items.forEach((txt, ii) => {
      s.addText(txt, { x:x+0.12, y:y0+0.46+ii*0.88, w:colW-0.24, h:0.82, fontSize:11,color:itemColor,fontFace:'Calibri',valign:'top' });
    });
  });
}

// ============================================================
// SLIDE 22: Hướng 2 — Khi Nào Nên Dùng GRAPES?
// ============================================================
{
  const s = pres.addSlide();
  s.background = { color: C.navy };
  addSlideNum(s, 22, C.white);
  s.addShape(pres.shapes.RECTANGLE, { x:0,y:0,w:10,h:0.88, fill:{color:C.tealDark}, line:{color:C.tealDark} });
  s.addShape(pres.shapes.RECTANGLE, { x:0,y:0,w:0.65,h:0.88, fill:{color:C.orange}, line:{color:C.orange} });
  s.addText('02', { x:0,y:0,w:0.65,h:0.88, fontSize:26,fontFace:'Calibri',bold:true,color:C.white,align:'center',valign:'middle' });
  s.addText('Hướng 2 — Khi Nào Nên Dùng GRAPES?', { x:0.75,y:0.08,w:9.0,h:0.72, fontSize:22,fontFace:'Calibri',bold:true,color:C.white,valign:'middle' });

  const colW=3.08, gap=0.10, y0=1.00, bodyH=3.88;
  const cols22 = [
    {
      x: 0.28, hdrColor: 'B55A1C', hdrText: 'Tại sao hướng này?',
      items: [
        'Sau 12 dataset, không có quy luật chung. Người dùng hiện tại phải thử-sai — tốn thời gian và tài nguyên.',
        'ΔF1 dao động từ −3,7 (GRAPES tệ hơn) đến +3,0 (GRAPES tốt hơn) — không thể đoán được.',
        'Thiếu hướng dẫn thực hành: "nên dùng GRAPES khi đồ thị có đặc trưng gì?"',
        'Dữ liệu đã có sẵn từ giai đoạn 1 → cơ hội phân tích ngay.'
      ],
      itemColor: 'F5D5B5'
    },
    {
      x: 0.28+colW+gap, hdrColor: C.orange, hdrText: 'Đề xuất cụ thể',
      items: [
        '① Trích đặc trưng đồ thị từ 12 dataset: homophily ratio, bậc TB, phương sai bậc, số lớp nhãn.',
        '② Tính ΔF1 = F1_GRAPES − F1_Random trên từng dataset.',
        '③ Tìm tương quan (Pearson, Spearman) giữa đặc trưng và ΔF1.',
        '④ Xây dựng decision rule: "nếu homophily < 0.3 → dùng GRAPES".'
      ],
      itemColor: 'FDE8CC'
    },
    {
      x: 0.28+2*(colW+gap), hdrColor: '1A8C4E', hdrText: 'Tính khả thi',
      items: [
        '● 12 datasets + kết quả F1 đã có từ giai đoạn 1.',
        '● Không cần train mới — chỉ phân tích thống kê.',
        '● Công cụ: pandas, scipy, sklearn — không cần GPU.',
        '● Khối lượng nhỏ: ước tính 2–3 tuần phân tích.'
      ],
      itemColor: 'B0E8C4'
    },
  ];
  cols22.forEach(({ x, hdrColor, hdrText, items, itemColor }) => {
    s.addShape(pres.shapes.RECTANGLE, { x, y:y0, w:colW, h:bodyH+0.38, fill:{color:'1A0E04'}, line:{color:hdrColor,width:1.8} });
    s.addShape(pres.shapes.RECTANGLE, { x, y:y0, w:colW, h:0.38, fill:{color:hdrColor}, line:{color:'none'} });
    s.addText(hdrText, { x:x+0.08, y:y0, w:colW-0.16, h:0.38, fontSize:12,bold:true,color:C.white,fontFace:'Calibri',valign:'middle' });
    items.forEach((txt, ii) => {
      s.addText(txt, { x:x+0.12, y:y0+0.46+ii*0.88, w:colW-0.24, h:0.82, fontSize:11,color:itemColor,fontFace:'Calibri',valign:'top' });
    });
  });
}

// ============================================================
// SLIDE 23: Hướng 3 — Tối Ưu Cho Đồ Thị Kết Nối Đa Dạng
// ============================================================
{
  const s = pres.addSlide();
  s.background = { color: C.navy };
  addSlideNum(s, 23, C.white);
  s.addShape(pres.shapes.RECTANGLE, { x:0,y:0,w:10,h:0.88, fill:{color:C.tealDark}, line:{color:C.tealDark} });
  s.addShape(pres.shapes.RECTANGLE, { x:0,y:0,w:0.65,h:0.88, fill:{color:C.red}, line:{color:C.red} });
  s.addText('03', { x:0,y:0,w:0.65,h:0.88, fontSize:26,fontFace:'Calibri',bold:true,color:C.white,align:'center',valign:'middle' });
  s.addText('Hướng 3 — Tối Ưu Cho Đồ Thị Kết Nối Đa Dạng', { x:0.75,y:0.08,w:9.0,h:0.72, fontSize:22,fontFace:'Calibri',bold:true,color:C.white,valign:'middle' });

  const colW=3.08, gap=0.10, y0=1.00, bodyH=3.88;
  const cols23 = [
    {
      x: 0.28, hdrColor: '882020', hdrText: 'Tại sao hướng này?',
      items: [
        'GRAPES xếp hạng #1 trên 4/5 heterophily dataset — rõ ràng có lợi thế trên loại đồ thị này.',
        'GCN tổng hợp thông tin đồng đều từ mọi lân cận → mất tín hiệu phân biệt trên heterophily.',
        'Câu hỏi: nếu thay GCN_C bằng kiến trúc phù hợp heterophily hơn, GRAPES có cải thiện thêm không?',
        'Không xung đột với GCN_S và GFlowNet — thay module độc lập.'
      ],
      itemColor: 'F0C8C8'
    },
    {
      x: 0.28+colW+gap, hdrColor: C.red, hdrText: 'Đề xuất cụ thể',
      items: [
        '① Bước 1: thay GCN_C bằng GAT (Graph Attention Network) — học trọng số lân cận.',
        '② Test trên 5 heterophily: BlogCat, Yelp, ogbn-proteins, snap-patents, Penn94.',
        '③ Đo ΔF1 so với GCN_C baseline trong cùng framework GRAPES.',
        '④ Bước 2: nếu tốt → thử H2GCN, FAGCN, MixHop.'
      ],
      itemColor: 'FDD8D8'
    },
    {
      x: 0.28+2*(colW+gap), hdrColor: '1A8C4E', hdrText: 'Tính khả thi',
      items: [
        '● GAT có sẵn trong PyTorch Geometric (2 dòng import).',
        '● GCN_C là module độc lập trong codebase — thay thế không ảnh hưởng GCN_S.',
        '● 5 heterophily datasets đã được setup ở giai đoạn 1.',
        '● Rủi ro thấp: nếu GAT không cải thiện, kết quả đó tự nó là đóng góp mới.'
      ],
      itemColor: 'B0E8C4'
    },
  ];
  cols23.forEach(({ x, hdrColor, hdrText, items, itemColor }) => {
    s.addShape(pres.shapes.RECTANGLE, { x, y:y0, w:colW, h:bodyH+0.38, fill:{color:'1A0505'}, line:{color:hdrColor,width:1.8} });
    s.addShape(pres.shapes.RECTANGLE, { x, y:y0, w:colW, h:0.38, fill:{color:hdrColor}, line:{color:'none'} });
    s.addText(hdrText, { x:x+0.08, y:y0, w:colW-0.16, h:0.38, fontSize:12,bold:true,color:C.white,fontFace:'Calibri',valign:'middle' });
    items.forEach((txt, ii) => {
      s.addText(txt, { x:x+0.12, y:y0+0.46+ii*0.88, w:colW-0.24, h:0.82, fontSize:11,color:itemColor,fontFace:'Calibri',valign:'top' });
    });
  });
}
// SLIDE 24: Giai Đoạn 2 — Tổng Quan & Dữ Liệu
// ============================================================
{
  const s = pres.addSlide();
  s.background = { color: C.white };
  titleBar(s, 'Giai Đoạn 2: GRAPES Áp Dụng Cho Hệ Thống Gợi Ý');
  addSlideNum(s, 24);

  // LEFT: Dataset table
  s.addText('Bộ Dữ Liệu: Amazon Reviews\'23 (McAuley Lab, UCSD)', {
    x: 0.28, y: 1.00, w: 4.60, h: 0.36, fontSize: 12, fontFace: 'Calibri', bold: true, color: C.navy
  });
  s.addShape(pres.shapes.RECTANGLE, { x: 0.28, y: 1.40, w: 4.60, h: 1.90, fill: { color: C.lightBlue }, line: { color: C.teal, width: 1.2 } });
  s.addShape(pres.shapes.RECTANGLE, { x: 0.28, y: 1.40, w: 4.60, h: 0.34, fill: { color: C.navy }, line: { color: 'none' } });

  const tcols = [
    { x: 0.28, w: 1.05 }, { x: 1.33, w: 0.80 },
    { x: 2.13, w: 0.82 }, { x: 2.95, w: 0.90 }, { x: 3.85, w: 1.03 }
  ];
  ['Danh mục','#User','#Item','#Rating','Đặc điểm'].forEach((h, ci) => {
    s.addText(h, { x: tcols[ci].x, y: 1.40, w: tcols[ci].w, h: 0.34, fontSize: 9.5, bold: true, color: C.white, fontFace: 'Calibri', align: 'center', valign: 'middle' });
  });

  const trows = [
    ['Books',       '10.3M','4.4M', '29.5M','Văn bản, thưa'],
    ['Clothing',    '22.6M','7.2M', '66.0M','Long-tail'],
    ['Electronics', '18.3M','1.6M', '43.9M','Bậc cao, dày'],
  ];
  ['FFFFFF','F0F7FF','FFFFFF'].forEach((bg, ri) => {
    const ry = 1.74 + ri * 0.52;
    s.addShape(pres.shapes.RECTANGLE, { x: 0.28, y: ry, w: 4.60, h: 0.52, fill: { color: bg }, line: { color: C.teal, width: 0.5 } });
    tcols.forEach(({ x, w }, ci) => {
      s.addText(trows[ri][ci], { x: x+0.04, y: ry, w: w-0.04, h: 0.52, fontSize: 9.5, color: C.darkText, fontFace: 'Calibri', align: ci===0?'left':'center', valign: 'middle' });
    });
  });

  s.addText('Nguồn: Amazon Reviews\'23 — arXiv:2403.03952', { x: 0.28, y: 3.34, w: 4.60, h: 0.22, fontSize: 7.5, italic: true, color: C.gray, fontFace: 'Calibri' });
  s.addShape(pres.shapes.RECTANGLE, { x: 0.28, y: 3.62, w: 4.60, h: 0.80, fill: { color: 'FFF8E7' }, line: { color: C.orange, width: 1.5 } });
  s.addText([
    { text: 'Lý do chọn: ', options: { bold: true, color: C.orange } },
    { text: 'Quy mô thực tế (10–23M user), metadata đầy đủ, chuẩn benchmark cho GNN recommendation. Span: May 1996 – Sep 2023.', options: { color: C.darkText } }
  ], { x: 0.38, y: 3.62, w: 4.40, h: 0.80, fontSize: 10, fontFace: 'Calibri', valign: 'middle' });

  s.addShape(pres.shapes.LINE, { x: 5.14, y: 0.97, w: 0, h: 4.28, line: { color: 'E2E8F0', width: 1 } });

  // RIGHT: Architecture changes
  s.addText('Thích Nghi Kiến Trúc GRAPES', { x: 5.28, y: 1.00, w: 4.44, h: 0.36, fontSize: 12, fontFace: 'Calibri', bold: true, color: C.navy });

  const changes = [
    { comp: 'Đầu vào G', from: 'Đồ thị đồng nhất\n(node classif.)', to: 'Đồ thị hai phía\nUser ∪ Item', col: C.teal },
    { comp: 'GCN_C',     from: 'Softmax loss\n(phân loại đỉnh)', to: 'BPR Loss\n(link prediction)', col: C.navy },
    { comp: 'Reward',    from: 'R = exp(−α·L_C)',               to: 'R = exp(−α·L_BPR)',           col: C.mint },
    { comp: 'Metric',    from: 'F1-score',                      to: 'Recall@K\nNDCG@K',             col: C.orange },
  ];
  changes.forEach(({ comp, from, to, col }, ci) => {
    const y = 1.46 + ci * 0.82;
    s.addShape(pres.shapes.RECTANGLE, { x: 5.28, y, w: 0.90, h: 0.72, fill: { color: col }, line: { color: col } });
    s.addText(comp, { x: 5.28, y, w: 0.90, h: 0.72, fontSize: 9, bold: true, color: C.white, align: 'center', valign: 'middle', fontFace: 'Calibri' });
    s.addShape(pres.shapes.RECTANGLE, { x: 6.22, y, w: 1.60, h: 0.72, fill: { color: 'FFF0F0' }, line: { color: 'D0D0D0', width: 0.8 } });
    s.addText(from, { x: 6.22, y, w: 1.60, h: 0.72, fontSize: 8.5, color: C.gray, align: 'center', valign: 'middle', fontFace: 'Calibri' });
    s.addShape(pres.shapes.LINE, { x: 7.85, y: y+0.36, w: 0.28, h: 0.01, line: { color: C.orange, width: 1.5, endArrowType: 'arrow' } });
    s.addShape(pres.shapes.RECTANGLE, { x: 8.17, y, w: 1.55, h: 0.72, fill: { color: 'EBF5FB' }, line: { color: col, width: 1.5 } });
    s.addText(to, { x: 8.17, y, w: 1.55, h: 0.72, fontSize: 8.5, bold: true, color: C.darkText, align: 'center', valign: 'middle', fontFace: 'Calibri' });
  });

  s.addShape(pres.shapes.RECTANGLE, { x: 5.28, y: 4.78, w: 4.44, h: 0.38, fill: { color: 'E8F8F5' }, line: { color: C.mint, width: 1 } });
  s.addText('GCN_S (Sampler) và GFlowNet giữ nguyên — chỉ thích nghi 3 thành phần trên', {
    x: 5.28, y: 4.78, w: 4.44, h: 0.38, fontSize: 9.5, fontFace: 'Calibri', color: C.teal, align: 'center', valign: 'middle'
  });
}

// ============================================================
// ============================================================
// SLIDE 25: Roadmap Triển Khai Giai Đoạn 2
// ============================================================
{
  const s = pres.addSlide();
  s.background = { color: C.white };
  titleBar(s, 'Roadmap Triển Khai Giai Đoạn 2');
  addSlideNum(s, 25);

  // --- Timeline axis ---
  // x range for chart: labelW=3.10, chartX=3.46, chartEnd=9.76, chartW=6.30
  // 16 weeks total → scale = 6.30/16 = 0.394"/week
  const lx=0.28, lw=3.10, cx=3.46, cw=6.30, scale=cw/16;

  // Month header bands
  const months = ['Tháng 1','Tháng 2','Tháng 3','Tháng 3.5–4'];
  const mColors = ['E8F4FA','F0FAF5','FFF5E8','F5E8FF'];
  months.forEach((m, mi) => {
    const bx = cx + mi*4*scale;
    const bw = 4*scale;
    s.addShape(pres.shapes.RECTANGLE, { x:bx, y:0.92, w:bw, h:0.30, fill:{color:mColors[mi]}, line:{color:'D0D8E4',width:0.5} });
    s.addText(m, { x:bx, y:0.92, w:bw, h:0.30, fontSize:11,fontFace:'Calibri',bold:true,color:C.navy,align:'center',valign:'middle' });
  });

  // Tick marks at weeks 0,4,8,12,16
  [0,4,8,12,16].forEach(w => {
    const tx = cx + w*scale;
    s.addShape(pres.shapes.LINE, { x:tx, y:1.22, w:0.01, h:3.70, line:{color:'E0E8F0',width:0.8} });
    s.addText('W'+w, { x:tx-0.22, y:1.22, w:0.44, h:0.22, fontSize:9,color:C.gray,align:'center',fontFace:'Calibri' });
  });

  // Phase data: [name, detail, startW, durationW, color]
  const phases = [
    ['Thu thập & tiền xử lý',  'Amazon Reviews\'23 | 5-core filter',          0,   2.5, C.teal  ],
    ['Xây dựng đồ thị',        'User–Item bipartite | Split 80/10/10',        2.5, 1.5, C.navy  ],
    ['Thích nghi GCN_C',       'BPR Loss | Bipartite embedding',              4.0, 3.5, C.teal  ],
    ['Thiết kế Reward',        'R = exp(−α·L_BPR) | TB Loss',                7.5, 2.5, C.navy  ],
    ['Chạy Baselines',         'LightGCN, NGCF, PinSage | Random',           10.0, 2.5, C.teal  ],
    ['Đánh giá & Báo cáo',    'Recall@K, NDCG@K | Bộ nhớ & thời gian',     12.5, 3.5, C.orange],
  ];

  const rowH=0.55, rowGap=0.03, rowY0=1.48;

  phases.forEach(([name, detail, startW, durW, col], pi) => {
    const y = rowY0 + pi*(rowH+rowGap);
    // Row background
    s.addShape(pres.shapes.RECTANGLE, { x:lx, y, w:lw+cw+0.08, h:rowH, fill:{color:pi%2===0?'F8FAFB':'F0F4F8'}, line:{color:'none'} });
    // Phase number badge
    s.addShape(pres.shapes.OVAL, { x:lx+0.04, y:y+0.12, w:0.30, h:0.30, fill:{color:col}, line:{color:col} });
    s.addText(String(pi+1), { x:lx+0.04, y:y+0.12, w:0.30, h:0.30, fontSize:11,bold:true,color:C.white,align:'center',valign:'middle',fontFace:'Calibri' });
    // Phase name
    s.addText(name, { x:lx+0.42, y:y+0.03, w:lw-0.46, h:0.26, fontSize:12,bold:true,color:C.darkText,fontFace:'Calibri',valign:'middle' });
    // Phase detail
    s.addText(detail, { x:lx+0.42, y:y+0.29, w:lw-0.46, h:0.24, fontSize:9,color:C.gray,fontFace:'Calibri',valign:'middle' });
    // Gantt bar
    const barX = cx + startW*scale;
    const barW = durW*scale - 0.04;
    const barH = rowH - 0.18;  // 0.37"
    s.addShape(pres.shapes.RECTANGLE, { x:barX, y:y+0.09, w:barW, h:barH, fill:{color:col}, line:{color:'none'} });
    const barLabel = durW>=2 ? Math.floor(durW)+'-'+Math.ceil(durW)+' tuần' : Math.round(durW*7)+' ngày';
    if (barW < 0.65) {
      // Narrow bar: smaller font to prevent overflow
      s.addText(barLabel, { x:barX+0.02, y:y+0.09, w:barW-0.04, h:barH, fontSize:8,bold:true,color:C.white,fontFace:'Calibri',align:'center',valign:'middle' });
    } else if (barW >= 1.1) {
      // Wide bar: just duration label
      s.addText(barLabel, { x:barX+0.06, y:y+0.09, w:barW-0.12, h:barH, fontSize:10.5,bold:true,color:C.white,fontFace:'Calibri',align:'center',valign:'middle' });
    } else {
      // Mid-width bar: label inside, medium font
      s.addText(barLabel, { x:barX+0.04, y:y+0.09, w:barW-0.08, h:barH, fontSize:9.5,bold:true,color:C.white,fontFace:'Calibri',align:'center',valign:'middle' });
    }
  });

  // Last row bottom: rowY0 + 5*(rowH+rowGap) + rowH = 1.48+5*0.58+0.55 = 1.48+2.90+0.55 = 4.93
  // Total bar
  s.addShape(pres.shapes.RECTANGLE, { x:lx, y:4.96, w:9.48, h:0.28, fill:{color:C.navy}, line:{color:C.navy} });
  s.addText('Tổng thời gian dự kiến: 3.5 – 4 tháng   (≈ 16 tuần)', {
    x:lx, y:4.96, w:9.48, h:0.28, fontSize:12,bold:true,color:C.white,align:'center',valign:'middle',fontFace:'Calibri'
  });
}

// SLIDE 25: Luồng Dữ Liệu Chi Tiết
// ============================================================
{
  const s = pres.addSlide();
  s.background = { color: 'F5F8FA' };
  titleBar(s, 'Luồng Dữ Liệu Chi Tiết: GRAPES Cho Hệ Thống Gợi Ý');
  addSlideNum(s, 26);

  const lx = 0.22, lw = 6.08, rx = 6.56, rw = 3.18;
  const fs = 11.5; // base font size (larger = readable)
  const bh = 0.50; // box height
  const ah = 0.14; // arrow height

  const varrow = (cx, y, h, col) => {
    s.addShape(pres.shapes.LINE, { x: cx, y, w: 0.01, h, line: { color: col||C.teal, width: 2, endArrowType: 'arrow' } });
  };
  const harrow = (x, y, w, col, begin) => {
    const lo = { color: col||C.orange, width: 2.5, endArrowType: begin?'none':'arrow' };
    if (begin) lo.beginArrowType = 'arrow';
    s.addShape(pres.shapes.LINE, { x, y, w, h: 0.01, line: lo });
  };

  // Step 1: Preprocessing (start at 0.96 — no source boxes, those are on slide 24)
  const y1 = 0.96;
  s.addShape(pres.shapes.RECTANGLE, { x: lx, y: y1, w: lw, h: bh, fill: { color: 'FFF9F0' }, line: { color: C.orange, width: 1.8 } });
  s.addText([
    {text:'① Tiền xử lý  ', options:{bold:true, color:C.orange}},
    {text:'5-core filter (user/item ≥ 5 tương tác)   |   Timestamp split: train 80% / val 10% / test 10%   |   ID mapping', options:{color:C.darkText}}
  ], { x: lx+0.12, y: y1, w: lw-0.24, h: bh, fontSize: fs, fontFace: 'Calibri', valign: 'middle' });
  varrow(lx+lw/2, y1+bh, ah);

  // Step 2: Graph
  const y2 = y1+bh+ah;
  s.addShape(pres.shapes.RECTANGLE, { x: lx, y: y2, w: lw, h: bh, fill: { color: 'EBF5FB' }, line: { color: C.teal, width: 1.8 } });
  s.addText([
    {text:'② Đồ thị hai phía  G = (U ∪ I, E)  ', options:{bold:true, color:C.teal}},
    {text:'Đỉnh: User + Item   |   Cạnh: tương tác rating   |   |V| = |U|+|I|,  |E| = #ratings', options:{color:C.darkText}}
  ], { x: lx+0.12, y: y2, w: lw-0.24, h: bh, fontSize: fs, fontFace: 'Calibri', valign: 'middle' });
  varrow(lx+lw/2, y2+bh, ah);

  // Step 3: Mini-batch
  const y3 = y2+bh+ah;
  s.addShape(pres.shapes.RECTANGLE, { x: lx, y: y3, w: lw, h: bh, fill: { color: 'F3F6F9' }, line: { color: C.gray, width: 1.2 } });
  s.addText([
    {text:'③ Mini-batch  ', options:{bold:true, color:C.gray}},
    {text:'B ⊂ U  (|B| = 512 users)   →   xác định L-hop neighborhood N^L(B)   →   tập ứng viên lân cận C', options:{color:C.darkText}}
  ], { x: lx+0.12, y: y3, w: lw-0.24, h: bh, fontSize: fs, fontFace: 'Calibri', valign: 'middle' });
  varrow(lx+lw/2, y3+bh, ah);

  // Step 4: GCN_S
  const y4 = y3+bh+ah;
  s.addShape(pres.shapes.RECTANGLE, { x: lx, y: y4, w: lw, h: bh, fill: { color: 'E5F0FF' }, line: { color: C.navy, width: 2.5 } });
  s.addText([
    {text:'④ GCN_S — Sampler  ', options:{bold:true, color:C.navy}},
    {text:'h_v^(0) ∀v ∈ C   →   2-layer GCN   →   p_v ∈ [0,1]  (xác suất quan trọng mỗi ứng viên)', options:{color:C.darkText}}
  ], { x: lx+0.12, y: y4, w: lw-0.24, h: bh, fontSize: fs, fontFace: 'Calibri', valign: 'middle' });

  // Gumbel arrow with label
  varrow(lx+lw/2, y4+bh, ah+0.08, C.orange);
  s.addText('Gumbel Top-k — làm mượt phép chọn rời rạc bằng nhiễu Gumbel để gradient truyền ngược', {
    x: lx+0.12, y: y4+bh+0.01, w: lw-0.24, h: ah+0.06,
    fontSize: 9, italic: true, color: C.orange, fontFace: 'Calibri', align: 'center', valign: 'middle'
  });

  // Step 5: G_s
  const y5 = y4+bh+ah+0.08;
  s.addShape(pres.shapes.RECTANGLE, { x: lx, y: y5, w: lw, h: bh, fill: { color: 'E8F8F5' }, line: { color: C.mint, width: 1.8 } });
  s.addText([
    {text:'⑤ G_s — Sampled Subgraph  ', options:{bold:true, color:C.mint}},
    {text:'k đỉnh quan trọng nhất mỗi hop   |   kích thước cố định — không phụ thuộc bậc đỉnh d̄', options:{color:C.darkText}}
  ], { x: lx+0.12, y: y5, w: lw-0.24, h: bh, fontSize: fs, fontFace: 'Calibri', valign: 'middle' });
  varrow(lx+lw/2, y5+bh, ah);

  // Step 6: GCN_C
  const y6 = y5+bh+ah;
  s.addShape(pres.shapes.RECTANGLE, { x: lx, y: y6, w: lw, h: bh, fill: { color: C.navy }, line: { color: C.navy } });
  s.addText([
    {text:'⑥ GCN_C — Link Predictor  ', options:{bold:true, color:C.mint}},
    {text:'e_u · e_i = ŷ_ui   |   ', options:{color:C.white}},
    {text:'L_BPR = −∑ log σ(ŷ_u,i⁺ − ŷ_u,i⁻)', options:{bold:true, color:C.orange}}
  ], { x: lx+0.12, y: y6, w: lw-0.24, h: bh, fontSize: fs, fontFace: 'Calibri', valign: 'middle' });
  varrow(lx+lw/2, y6+bh, ah);

  // Step 7: Evaluation
  const y7 = y6+bh+ah;
  s.addShape(pres.shapes.RECTANGLE, { x: lx, y: y7, w: lw, h: bh, fill: { color: 'E8F8F5' }, line: { color: C.mint, width: 2.5 } });
  s.addText([
    {text:'⑦ Đánh giá  ', options:{bold:true, color:C.teal}},
    {text:'Recall@K   NDCG@K   Precision@K   |   Baselines: LightGCN, NGCF, PinSage, Random Sampling', options:{color:C.darkText}}
  ], { x: lx+0.12, y: y7, w: lw-0.24, h: bh, fontSize: fs, fontFace: 'Calibri', valign: 'middle' });

  // GFlowNet box (right) — spans from GCN_S to Evaluation
  const gfH = y7+bh - y4;
  s.addShape(pres.shapes.RECTANGLE, { x: rx, y: y4, w: rw, h: gfH, fill: { color: '031F30' }, line: { color: C.orange, width: 2.5 } });
  s.addShape(pres.shapes.RECTANGLE, { x: rx, y: y4, w: rw, h: 0.36, fill: { color: C.orange }, line: { color: 'none' } });
  s.addText('GFlowNet Feedback', {
    x: rx, y: y4, w: rw, h: 0.36, fontSize: 12, bold: true,
    color: C.white, align: 'center', valign: 'middle', fontFace: 'Calibri'
  });
  s.addText([
    {text:'Reward\n', options:{bold:true, color:C.mint, fontSize:12}},
    {text:'R = exp(−α · L_BPR)\n\n', options:{color:C.white, fontSize:12}},
    {text:'TB Loss\n', options:{bold:true, color:C.mint, fontSize:12}},
    {text:'(log Z + log q(τ|V⁰)\n  + α · L_BPR)²\n\n', options:{color:'B8D4E8', fontSize:11.5}},
    {text:'→ Cập nhật θ của GCN_S\n', options:{bold:true, color:C.orange, fontSize:12}},
    {text:'→ subgraph tốt hơn\n   ở vòng lặp sau', options:{color:'9CB8D0', fontSize:11}},
  ], { x: rx+0.14, y: y4+0.40, w: rw-0.28, h: gfH-0.44, fontSize: 12, fontFace: 'Calibri', valign: 'top' });

  // Horizontal arrows: L_BPR → GFlowNet and GFlowNet → GCN_S
  harrow(lx+lw+0.02, y6+bh/2, rx-(lx+lw)-0.02, C.orange, false);
  harrow(lx+lw+0.02, y4+bh/2, rx-(lx+lw)-0.02, C.orange, true);
}

// ============================================================
// SLIDE 26: Kế Hoạch Triển Khai Giai Đoạn 2
// ============================================================
{
  const s = pres.addSlide();
  s.background = { color: C.white };
  titleBar(s, 'Kế Hoạch Triển Khai Giai Đoạn 2');
  addSlideNum(s, 27);

  const steps = [
    { n:'1', task:'Thu thập & tiền xử lý Amazon Reviews\'23 (Books, Clothing, Electronics)',       time:'2–3 tuần', col:C.teal  },
    { n:'2', task:'Xây dựng đồ thị hai phía user–item, 5-core filter, timestamp split',             time:'1–2 tuần', col:C.navy  },
    { n:'3', task:'Thích nghi GCN_C → link predictor, thay Softmax bằng BPR Loss',                 time:'3–4 tuần', col:C.teal  },
    { n:'4', task:'Thiết kế & kiểm thử reward: R = exp(−α·L_BPR) trong GFlowNet',                  time:'2–3 tuần', col:C.navy  },
    { n:'5', task:'Chạy baselines: LightGCN, NGCF, PinSage, Random Sampling',                       time:'2–3 tuần', col:C.teal  },
    { n:'6', task:'Đánh giá Recall@K / NDCG@K, phân tích bộ nhớ & thời gian, viết báo cáo',        time:'3–4 tuần', col:C.navy  },
  ];

  steps.forEach(({ n, task, time, col }, i) => {
    const y = 1.00 + i * 0.66;
    s.addShape(pres.shapes.RECTANGLE, { x: 0.28, y, w: 9.44, h: 0.58, fill: { color: i%2===0?'F0F7FF':'F8FAFB' }, line: { color: col, width: 1.5 } });
    s.addShape(pres.shapes.OVAL, { x: 0.32, y: y+0.14, w: 0.30, h: 0.30, fill: { color: col }, line: { color: col } });
    s.addText(n, { x: 0.32, y: y+0.14, w: 0.30, h: 0.30, fontSize: 10, bold: true, color: C.white, align: 'center', valign: 'middle', fontFace: 'Calibri' });
    s.addText(task, { x: 0.72, y, w: 7.80, h: 0.58, fontSize: 11, color: C.darkText, fontFace: 'Calibri', valign: 'middle' });
    s.addShape(pres.shapes.RECTANGLE, { x: 8.56, y: y+0.10, w: 1.08, h: 0.38, fill: { color: col }, line: { color: col } });
    s.addText(time, { x: 8.56, y: y+0.10, w: 1.08, h: 0.38, fontSize: 9, color: C.white, bold: true, align: 'center', valign: 'middle', fontFace: 'Calibri' });
  });

  s.addShape(pres.shapes.RECTANGLE, { x: 0.28, y: 4.98, w: 9.44, h: 0.28, fill: { color: C.navy }, line: { color: C.navy } });
  s.addText('Timeline dự kiến: 3.5 – 4 tháng   |   Công cụ: PyTorch Geometric, DGL, Amazon Reviews\'23 API', {
    x: 0.28, y: 4.98, w: 9.44, h: 0.28, fontSize: 10, bold: true, color: C.white, align: 'center', valign: 'middle', fontFace: 'Calibri'
  });
}

// ============================================================
// SLIDE 27: Tổng Kết
// ============================================================
{
  const s = pres.addSlide();
  s.background = { color: C.navy };
  addSlideNum(s, 28, C.white);

  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.88, fill: { color: '031F30' }, line: { color: '031F30' } });
  s.addText('Tổng Kết', { x: 0.4, y: 0.08, w: 9.2, h: 0.72, fontSize: 26, fontFace: 'Calibri', bold: true, color: C.white, valign: 'middle' });

  // LEFT: Phase 1
  s.addShape(pres.shapes.RECTANGLE, { x: 0.28, y: 0.98, w: 4.60, h: 0.34, fill: { color: C.teal }, line: { color: C.teal } });
  s.addText('Giai Đoạn 1 — Kết Quả', { x: 0.28, y: 0.98, w: 4.60, h: 0.34, fontSize: 12, bold: true, color: C.white, align: 'center', valign: 'middle', fontFace: 'Calibri' });

  const p1 = [
    'Khảo sát 28 công trình (NeurIPS, ICML, ICLR, TMLR — 2017–2024)',
    'Tái hiện GRAPES trên 12 dataset (7 homophily + 5 heterophily)',
    'Xác nhận: GRAPES-GFN vượt GRAPES-RL trên 10/12 dataset',
    'Scalability: Amazon 2M đỉnh 61M cạnh — GAS/AS-GCN OOM, GRAPES chạy được',
    'Đánh đổi: 2–3× bộ nhớ, 1.4–1.8× thời gian so với Random',
  ];
  p1.forEach((txt, i) => {
    const y = 1.38 + i * 0.62;
    s.addShape(pres.shapes.RECTANGLE, { x: 0.28, y, w: 4.60, h: 0.56, fill: { color: '0A2E4A' }, line: { color: C.teal, width: 0.8 } });
    s.addShape(pres.shapes.RECTANGLE, { x: 0.28, y, w: 0.06, h: 0.56, fill: { color: C.teal }, line: { color: 'none' } });
    s.addText(txt, { x: 0.42, y, w: 4.38, h: 0.56, fontSize: 9.5, color: C.white, fontFace: 'Calibri', valign: 'middle' });
  });

  // RIGHT: Phase 2
  s.addShape(pres.shapes.RECTANGLE, { x: 5.12, y: 0.98, w: 4.60, h: 0.34, fill: { color: C.orange }, line: { color: C.orange } });
  s.addText('Giai Đoạn 2 — Kế Hoạch', { x: 5.12, y: 0.98, w: 4.60, h: 0.34, fontSize: 12, bold: true, color: C.white, align: 'center', valign: 'middle', fontFace: 'Calibri' });

  const p2 = [
    { n:'1', t:'Thu thập & tiền xử lý Amazon Reviews\'23' },
    { n:'2', t:'Xây dựng đồ thị hai phía User–Item' },
    { n:'3', t:'Thích nghi GCN_C → BPR Loss' },
    { n:'4', t:'Reward: R = exp(−α·L_BPR)' },
    { n:'5', t:'Chạy baselines: LightGCN, PinSage, NGCF' },
    { n:'6', t:'Đánh giá Recall@K / NDCG@K + báo cáo' },
  ];
  p2.forEach(({ n, t }, i) => {
    const y = 1.38 + i * 0.52;
    s.addShape(pres.shapes.RECTANGLE, { x: 5.12, y, w: 4.60, h: 0.46, fill: { color: '0A2030' }, line: { color: C.orange, width: 0.8 } });
    s.addShape(pres.shapes.OVAL, { x: 5.16, y: y+0.08, w: 0.28, h: 0.28, fill: { color: C.orange }, line: { color: C.orange } });
    s.addText(n, { x: 5.16, y: y+0.08, w: 0.28, h: 0.28, fontSize: 9, bold: true, color: C.white, align: 'center', valign: 'middle', fontFace: 'Calibri' });
    s.addText(t, { x: 5.50, y, w: 4.14, h: 0.46, fontSize: 9.5, color: C.white, fontFace: 'Calibri', valign: 'middle' });
  });

  s.addShape(pres.shapes.RECTANGLE, { x: 5.12, y: 4.54, w: 4.60, h: 0.28, fill: { color: C.orange }, line: { color: C.orange } });
  s.addText('3.5 – 4 tháng', { x: 5.12, y: 4.54, w: 4.60, h: 0.28, fontSize: 10.5, bold: true, color: C.white, align: 'center', valign: 'middle', fontFace: 'Calibri' });

  s.addShape(pres.shapes.LINE, { x: 0.28, y: 4.92, w: 9.44, h: 0, line: { color: C.teal, width: 0.8 } });
  s.addText('Xin cảm ơn Hội đồng đã lắng nghe!', {
    x: 0.28, y: 5.00, w: 9.44, h: 0.26, fontSize: 18, fontFace: 'Calibri', bold: true, color: C.white, align: 'center'
  });
}

// Save
pres.writeFile({ fileName: '/sessions/festive-admiring-rubin/mnt/GRAPES report/GRAPES_Presentation.pptx' })
  .then(() => console.log('SUCCESS'))
  .catch(err => { console.error(err); process.exit(1); });
