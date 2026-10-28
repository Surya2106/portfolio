// ============================================================================
//  Particle shapes, one per chapter. Every generator returns { pos, col }:
//  N xyz positions (longest side ≈ 1, centred on the origin) and N rgb colours.
// ============================================================================

export const hex = (h) => {
  const n = parseInt(h.slice(1), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
};
export const mix = (a, b, t) => [
  a[0] + (b[0] - a[0]) * t,
  a[1] + (b[1] - a[1]) * t,
  a[2] + (b[2] - a[2]) * t,
];

export const PAPER = hex("#eceae4");
export const SUN = hex("#ffb547");
export const FLARE = hex("#ff5b2e");
export const SKY = hex("#6f8cff");
const STEEL = hex("#9aa6b8");
const DEEP = hex("#1f2a4a");

const rand = (a = -0.5, b = 0.5) => a + Math.random() * (b - a);
// uniform point on a sphere of radius r
const onSphere = (r) => {
  const u = Math.random() * 2 - 1,
    th = Math.random() * Math.PI * 2,
    s = Math.sqrt(1 - u * u);
  return [Math.cos(th) * s * r, u * r, Math.sin(th) * s * r];
};
// gaussian-ish blob: denser at the centre
const blob = (r, cx = 0, cy = 0, cz = 0) => {
  const p = onSphere(
    r * Math.cbrt(Math.random()) * (0.4 + 0.6 * Math.random()),
  );
  return [p[0] + cx, p[1] + cy, p[2] + cz];
};
// a point somewhere on the segment a → b, with a little thickness
const onLine = (a, b, w = 0.004) => {
  const t = Math.random();
  return [
    a[0] + (b[0] - a[0]) * t + rand() * w,
    a[1] + (b[1] - a[1]) * t + rand() * w,
    a[2] + (b[2] - a[2]) * t + rand() * w,
  ];
};

function fill(N, fn) {
  const pos = new Float32Array(N * 3),
    col = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) {
    const [p, c] = fn(i, i / N);
    pos[i * 3] = p[0];
    pos[i * 3 + 1] = p[1];
    pos[i * 3 + 2] = p[2];
    col[i * 3] = c[0];
    col[i * 3 + 1] = c[1];
    col[i * 3 + 2] = c[2];
  }
  return { pos, col };
}

// Draw something on a 2D canvas, then scatter particles over its opaque pixels.
// `weight(red)` repeats a pixel so brighter details can get more particles.
function fromCanvas(N, w, h, draw, colour, weight = () => 1) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const g = c.getContext("2d");
  draw(g, w, h);
  const d = g.getImageData(0, 0, w, h).data,
    hits = [];
  for (let y = 0; y < h; y += 2)
    for (let x = 0; x < w; x += 2) {
      const a = d[(y * w + x) * 4 + 3];
      if (a <= 120) continue;
      const red = d[(y * w + x) * 4] / 255;
      for (let k = weight(red); k > 0; k--) hits.push(x, y, red);
    }
  if (!hits.length) return fill(N, () => [onSphere(0.3), PAPER]);
  let x0 = 1e9,
    x1 = -1e9,
    y0 = 1e9,
    y1 = -1e9;
  for (let i = 0; i < hits.length; i += 3) {
    x0 = Math.min(x0, hits[i]);
    x1 = Math.max(x1, hits[i]);
    y0 = Math.min(y0, hits[i + 1]);
    y1 = Math.max(y1, hits[i + 1]);
  }
  const span = Math.max(x1 - x0, y1 - y0) || 1,
    cx = (x0 + x1) / 2,
    cy = (y0 + y1) / 2,
    k = hits.length / 3;
  return fill(N, () => {
    const j = ((Math.random() * k) | 0) * 3;
    const x = hits[j] + rand() * 2,
      y = hits[j + 1] + rand() * 2;
    return [
      [(x - cx) / span, -(y - cy) / span, rand() * 0.02],
      colour(hits[j + 2], (y - y0) / (y1 - y0 || 1)),
    ];
  });
}

// Words, used for the name and the sign-off
export function words(N, text) {
  return fromCanvas(
    N,
    1700,
    440,
    (g, w, h) => {
      g.font = `800 320px "Cabinet Grotesk", "General Sans", sans-serif`;
      g.textAlign = "center";
      g.textBaseline = "middle";
      g.fillStyle = "#fff";
      g.fillText(text, w / 2, h / 2 + 12);
    },
    (_, ty) =>
      Math.random() < 0.14
        ? mix(SUN, FLARE, ty)
        : mix(PAPER, [1, 1, 1], Math.random() * 0.25),
  );
}

// A line of text of any length, longest side 1 like every other shape
export function line(N, text) {
  const font = `800 200px "Cabinet Grotesk", "General Sans", sans-serif`;
  const probe = document.createElement("canvas").getContext("2d");
  probe.font = font;
  const w = Math.ceil(probe.measureText(text).width) + 60;
  return fromCanvas(
    N,
    w,
    280,
    (g, cw, ch) => {
      g.font = font;
      g.textAlign = "center";
      g.textBaseline = "middle";
      g.fillStyle = "#fff";
      g.fillText(text, cw / 2, ch / 2 + 8);
    },
    (_, ty) =>
      Math.random() < 0.14
        ? mix(SUN, FLARE, ty)
        : mix(PAPER, [1, 1, 1], Math.random() * 0.25),
  );
}

// AI estimation: a 3 × 2 solar array, every panel a grid of cells. Some cells are lit,
// the lines an estimate has already validated.
export function solarArray(N) {
  const PX = 3,
    PY = 2,
    CX = 6,
    CY = 10,
    gap = 0.03,
    pw = 0.3,
    ph = 0.44;
  const totalW = PX * pw + (PX - 1) * gap,
    totalH = PY * ph + (PY - 1) * gap;
  const lit = new Set();
  for (let k = 0; k < 26; k++) lit.add((Math.random() * PX * PY * CX * CY) | 0);
  return fill(N, () => {
    const px = (Math.random() * PX) | 0,
      py = (Math.random() * PY) | 0;
    const ox = -totalW / 2 + px * (pw + gap),
      oy = -totalH / 2 + py * (ph + gap);
    if (Math.random() < 0.22) {
      // frame and cell borders
      const vertical = Math.random() < 0.5;
      const k = vertical
        ? Math.round(Math.random() * CX) / CX
        : Math.round(Math.random() * CY) / CY;
      const x = vertical ? ox + k * pw : ox + Math.random() * pw;
      const y = vertical ? oy + Math.random() * ph : oy + k * ph;
      return [[x, y, rand() * 0.004], mix(PAPER, STEEL, 0.3)];
    }
    const cx = (Math.random() * CX) | 0,
      cy = (Math.random() * CY) | 0;
    const id = ((py * PX + px) * CX + cx) * CY + cy;
    const x = ox + ((cx + 0.12 + Math.random() * 0.76) * pw) / CX,
      y = oy + ((cy + 0.12 + Math.random() * 0.76) * ph) / CY;
    const on = lit.has(id);
    return [
      [x, y, rand() * 0.006],
      on
        ? mix(SUN, FLARE, Math.random() * 0.4)
        : mix(DEEP, SKY, 0.45 + Math.random() * 0.35),
    ];
  });
}

// Structural drawings: a column's rebar cage on its footing. Eight long bars around a
// rectangle, ties every few centimetres, and a pad at the base.
export function rebarCage(N) {
  const hw = 0.13,
    hd = 0.1,
    top = 0.46,
    bottom = -0.38;
  const bars = [
    [-hw, -hd],
    [0, -hd],
    [hw, -hd],
    [hw, 0],
    [hw, hd],
    [0, hd],
    [-hw, hd],
    [-hw, 0],
  ];
  const ties = 18;
  return fill(N, () => {
    const r = Math.random();
    if (r < 0.46) {
      const [bx, bz] = bars[(Math.random() * bars.length) | 0];
      const y = bottom + Math.random() * (top - bottom),
        a = Math.random() * Math.PI * 2,
        rr = 0.008;
      return [
        [bx + Math.cos(a) * rr, y, bz + Math.sin(a) * rr],
        mix(STEEL, PAPER, 0.4 + Math.random() * 0.3),
      ];
    }
    if (r < 0.82) {
      const k = (Math.random() * ties) | 0,
        y = bottom + 0.03 + (k * (top - bottom - 0.06)) / (ties - 1);
      const per = 2 * (2 * hw + 2 * hd),
        s = Math.random() * per;
      let x, z;
      if (s < 2 * hw) {
        x = -hw + s;
        z = -hd - 0.012;
      } else if (s < 2 * hw + 2 * hd) {
        x = hw + 0.012;
        z = -hd + s - 2 * hw;
      } else if (s < 4 * hw + 2 * hd) {
        x = hw - (s - 2 * hw - 2 * hd);
        z = hd + 0.012;
      } else {
        x = -hw - 0.012;
        z = hd - (s - 4 * hw - 2 * hd);
      }
      return [[x, y + rand() * 0.006, z], mix(SUN, FLARE, Math.random() * 0.5)];
    }
    // footing pad: a flat slab with a bottom mat of bars
    const x = rand(-0.36, 0.36),
      z = rand(-0.3, 0.3),
      y = bottom - 0.04 - Math.random() * 0.06;
    const onMat =
      Math.abs((((x + 0.36) * 20) % 1) - 0.5) < 0.08 ||
      Math.abs((((z + 0.3) * 20) % 1) - 0.5) < 0.08;
    return [[x, y, z], onMat ? mix(STEEL, PAPER, 0.5) : mix(DEEP, STEEL, 0.35)];
  });
}

// D.E. Shaw: three knowledge clouds (Confluence, tickets, Slack) streaming into
// one bright answer in the middle.
export function retrieval(N) {
  const sources = [
    { at: [-0.36, 0.22, 0], c: SKY },
    { at: [0.36, 0.22, 0], c: PAPER },
    { at: [0, -0.4, 0], c: hex("#b388ff") },
  ];
  const answer = [0, 0.02, 0];
  return fill(N, () => {
    const r = Math.random(),
      s = sources[(Math.random() * 3) | 0];
    if (r < 0.62)
      return [blob(0.17, ...s.at), mix(s.c, PAPER, Math.random() * 0.3)];
    if (r < 0.9) {
      const p = onLine(s.at, answer, 0.012);
      return [p, mix(s.c, SUN, Math.random() * 0.6)];
    }
    return [blob(0.06, ...answer), mix(SUN, FLARE, Math.random() * 0.4)];
  });
}

// Tekion: the DMS core, a ring of microservices, four OEMs riding one orbit,
// and the links between them.
export function orbit(N) {
  const R = 0.42;
  const oems = [0, 1, 2, 3].map((k) => {
    const a = (k * Math.PI) / 2 + Math.PI / 4;
    return [Math.cos(a) * R, k % 2 ? 0.06 : -0.06, Math.sin(a) * R];
  });
  return fill(N, () => {
    const r = Math.random();
    if (r < 0.22) return [blob(0.1), mix(SUN, FLARE, Math.random() * 0.5)];
    if (r < 0.4) {
      const k = (Math.random() * 12) | 0,
        a = (k / 12) * Math.PI * 2;
      return [
        blob(0.024, Math.cos(a) * 0.19, rand() * 0.02, Math.sin(a) * 0.19),
        mix(PAPER, SKY, 0.3),
      ];
    }
    if (r < 0.66)
      return [
        blob(0.065, ...oems[(Math.random() * 4) | 0]),
        mix(SKY, PAPER, Math.random() * 0.4),
      ];
    if (r < 0.84) {
      const a = Math.random() * Math.PI * 2;
      return [
        [Math.cos(a) * R + rand() * 0.006, rand() * 0.006, Math.sin(a) * R + rand() * 0.006],
        mix(STEEL, PAPER, 0.3),
      ];
    }
    return [
      onLine([0, 0, 0], oems[(Math.random() * 4) | 0], 0.006),
      mix(STEEL, SUN, Math.random() * 0.4),
    ];
  });
}

// Amazon: a shield with a bright check across it. The body is drawn grey and
// the check white, so the red channel tells them apart when colouring.
export function shield(N) {
  return fromCanvas(
    N,
    520,
    600,
    (g, w, h) => {
      g.fillStyle = "#808080";
      g.beginPath();
      g.moveTo(w / 2, 30);
      g.bezierCurveTo(w * 0.7, 70, w * 0.86, 80, w - 40, 90);
      g.bezierCurveTo(w - 40, 340, w * 0.72, 480, w / 2, h - 30);
      g.bezierCurveTo(w * 0.28, 480, 40, 340, 40, 90);
      g.bezierCurveTo(w * 0.14, 80, w * 0.3, 70, w / 2, 30);
      g.fill();
      g.strokeStyle = "#fff";
      g.lineWidth = 44;
      g.lineCap = "round";
      g.lineJoin = "round";
      g.beginPath();
      g.moveTo(w * 0.3, h * 0.5);
      g.lineTo(w * 0.45, h * 0.64);
      g.lineTo(w * 0.72, h * 0.36);
      g.stroke();
    },
    (red, ty) =>
      red > 0.9
        ? mix(SUN, FLARE, Math.random() * 0.5)
        : mix(DEEP, SKY, 0.35 + ty * 0.3 + Math.random() * 0.2),
    (red) => (red > 0.9 ? 4 : 1),
  );
}
// Journey: a helix climbing through five bright nodes, one per team
export function helix(N) {
  const turns = 2.2,
    H = 0.9,
    R = 0.18,
    nodes = 5;
  return fill(N, () => {
    const r = Math.random();
    if (r < 0.2) {
      const k = (Math.random() * nodes) | 0,
        t = (k + 0.5) / nodes,
        a = t * turns * Math.PI * 2;
      return [
        blob(0.04, Math.cos(a) * R, -H / 2 + t * H, Math.sin(a) * R),
        mix(SUN, FLARE, k / (nodes - 1)),
      ];
    }
    const t = Math.random(),
      a = t * turns * Math.PI * 2 + (r < 0.6 ? 0 : Math.PI);
    const p = [
      Math.cos(a) * R + rand() * 0.01,
      -H / 2 + t * H + rand() * 0.01,
      Math.sin(a) * R + rand() * 0.01,
    ];
    if (r > 0.95)
      return [
        onLine(
          p,
          [Math.cos(a + Math.PI) * R, p[1], Math.sin(a + Math.PI) * R],
          0.003,
        ),
        mix(STEEL, PAPER, 0.4),
      ];
    return [p, mix(DEEP, PAPER, 0.45 + t * 0.5)];
  });
}

// Before the first frame: everything collapsed into a single point
export function seed(N) {
  return fill(N, () => [
    onSphere(0.004 * Math.random()),
    Math.random() < 0.25 ? SUN : PAPER,
  ]);
}

// ---------------------------------------------------------------------------
//  Hero portrait: the photo redrawn as monospace glyphs. Each glyph particle
//  carries `look` = [glyph index, cell size], where the index points into an
//  atlas ordered from sparse to dense ink. Brighter cells get denser glyphs and
//  sit a little closer, over a dome so the head turns like a solid. The rest
//  of the particles lay a faint dot grid behind it.
// ---------------------------------------------------------------------------
// sparse to dense ink, so a glyph's index doubles as its tone
const GLYPHS = ".:-~=+*<>[]{}#%@";
export const ATLAS_CELLS = 4;

export function glyphAtlas(px = 64) {
  const c = document.createElement("canvas");
  c.width = c.height = px * ATLAS_CELLS;
  const g = c.getContext("2d");
  g.font = `600 ${px * 0.92}px "IBM Plex Mono", ui-monospace, monospace`;
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.fillStyle = "#fff";
  [...GLYPHS].forEach((ch, i) =>
    g.fillText(
      ch,
      (i % ATLAS_CELLS) * px + px / 2,
      Math.floor(i / ATLAS_CELLS) * px + px / 2,
    ),
  );
  return c;
}

export function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

// monospace cells are taller than wide, so columns run ~1.7× denser than rows
const CELL = 0.6;
// `name` = { text, left, cy, width } in shape units: the name is written in
// particles there, beside the portrait
export function portrait(N, img, [gx0, gx1, gy0, gy1], rows = 96, name) {
  const cols = Math.round((rows * img.width) / img.height / CELL);
  const c = document.createElement("canvas");
  c.width = cols;
  c.height = rows;
  const g = c.getContext("2d", { willReadFrequently: true });
  g.imageSmoothingQuality = "high";
  g.drawImage(img, 0, 0, cols, rows);
  const d = g.getImageData(0, 0, cols, rows).data;

  // keep the subject: drop transparent or near-white background, then erode
  // one cell so the cut-out's light fringe doesn't draw a halo
  const L = new Float32Array(cols * rows).fill(-1);
  for (let i = 0; i < cols * rows; i++) {
    const r = d[i * 4] / 255,
      gr = d[i * 4 + 1] / 255,
      b = d[i * 4 + 2] / 255;
    if (d[i * 4 + 3] > 200 && Math.min(r, gr, b) < 0.86)
      L[i] = 0.2126 * r + 0.7152 * gr + 0.0722 * b;
  }
  const at = (x, y) =>
    x < 0 || y < 0 || x >= cols || y >= rows ? -1 : L[y * cols + x];
  const cells = [];
  for (let y = 0; y < rows; y++)
    for (let x = 0; x < cols; x++) {
      const v = at(x, y);
      if (v < 0 || at(x - 1, y) < 0 || at(x + 1, y) < 0 || at(x, y - 1) < 0)
        continue;
      // sharpen against the 3 × 3 neighbourhood so eyes, brows and beard read
      let sum = 0,
        k = 0;
      for (let j = -1; j <= 1; j++)
        for (let i = -1; i <= 1; i++) {
          const w = at(x + i, y + j);
          if (w >= 0) {
            sum += w;
            k++;
          }
        }
      const i4 = (y * cols + x) * 4;
      cells.push([
        x,
        y,
        v + (v - sum / k) * 1.4,
        d[i4] / 255,
        d[i4 + 1] / 255,
        d[i4 + 2] / 255,
      ]);
    }
  // equalise: a cell's tone is its rank, so the face uses the full glyph range
  const order = cells.map((_, i) => i).sort((a, b) => cells[a][2] - cells[b][2]);
  const rank = new Float32Array(cells.length);
  order.forEach((ci, r) => {
    rank[ci] = r / Math.max(1, cells.length - 1);
  });

  const pitch = 1 / Math.max(rows, cols * CELL),
    pos = new Float32Array(N * 3),
    col = new Float32Array(N * 3),
    look = new Float32Array(N * 2);
  const put = (i, p, k, l) => {
    pos.set(p, i * 3);
    col.set(k, i * 3);
    look.set(l, i * 2);
  };

  const n = Math.min(N, cells.length);
  for (let i = 0; i < n; i++) {
    const [x, y, , r, gr, b] = cells[i];
    const t = Math.pow(rank[i], 1.35);
    const px = (x + 0.5 - cols / 2) * pitch * CELL,
      py = -(y + 0.5 - rows / 2) * pitch;
    // shoulders fade towards the bottom and the sides
    const fade =
      Math.min(1, Math.max(0, (rows - y) / (rows * 0.3))) *
      Math.min(1, Math.max(0, 1.7 - Math.abs(px) * 2.6));
    const dome = Math.sqrt(Math.max(0, 0.2 - px * px - py * py * 0.6)) * 0.5;
    // warm paper tinted by the photo, with the brightest cells turning to sunlight
    const tone = mix(PAPER, [r * 1.25, gr * 1.05, b * 0.9], 0.3);
    const warm = mix(tone, [1, 0.9, 0.78], t > 0.85 ? (t - 0.85) * 3 : 0);
    put(
      i,
      [px, py, dome + (t - 0.5) * 0.04],
      warm.map((v) => v * (0.38 + t * 0.85) * fade),
      // the darkest cells stay empty: eyes, brows and hair shadow read as negative space
      [Math.min(15, Math.round(t * 15)), fade < 0.05 || t < 0.07 ? 0 : pitch * 1.1],
    );
  }

  // the name takes a share of what's left
  let m = 0;
  if (name) {
    m = Math.min(14000, Math.round((N - n) * 0.55));
    const t = line(m, name.text);
    for (let i = 0; i < m; i++)
      put(
        n + i,
        [
          name.left + name.width / 2 + t.pos[i * 3] * name.width,
          name.cy + t.pos[i * 3 + 1] * name.width,
          t.pos[i * 3 + 2],
        ],
        t.col.subarray(i * 3, i * 3 + 3),
        [-1, 1],
      );
  }

  // a faint dot grid behind the face, as wide as the leftovers allow
  const left = N - n - m;
  const W = gx1 - gx0,
    H = gy1 - gy0,
    step = Math.max(pitch * 3.2, Math.sqrt((W * H) / Math.max(1, left))),
    gw = Math.max(1, Math.floor(W / step));
  for (let j = 0; j < left; j++) {
    const gx = j % gw,
      gy = Math.floor(j / gw);
    const x = gx0 + gx * step,
      y = gy1 - gy * step;
    const shade = 0.34 + Math.random() * 0.06;
    // look.x = -2 marks an even grid dot; spares past the grid rest at zero size
    put(n + m + j, [x, y, -0.06], [shade, shade * 0.97, shade * 0.94], [-2, y < gy0 ? 0 : 2.2]);
  }
  return { pos, col, look };
}
