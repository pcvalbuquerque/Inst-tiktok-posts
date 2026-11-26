// Motor v2 — documentary collage renderer (canvas). Library part: generic primitives.
const W = 1080, H = 1920;
const cv = document.getElementById('c'); cv.width = W; cv.height = H;
const g = cv.getContext('2d');
const TM = window.TIMING;
const C = { bg: '#0b0b0d', paper: '#f2ede4', ink: '#141414', text: '#f5f5f4', sub: '#a8a29e', dim: '#3f3f46',
  orange: '#ff6a00', amber: '#ffb020', red: '#ff2a42', green: '#22c55e', blue: '#3b82f6' };
const IM = {};
for (const [k, src] of Object.entries(window.IMGS || {})) { const i = new Image(); i.src = src; IM[k] = i; }
window.imagesReady = () => Object.values(IM).every(i => i.complete && i.naturalWidth > 0);

const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lerp = (a, b, k) => a + (b - a) * k;
const prog = (t, a, b) => clamp((t - a) / (b - a));
const eo = k => 1 - Math.pow(1 - k, 3);
const eio = k => k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
const back = k => { const c1 = 1.9, c3 = c1 + 1; return 1 + c3 * Math.pow(k - 1, 3) + c1 * Math.pow(k - 1, 2); };
const slam = k => k <= 0 ? 0 : lerp(2.2, 1, eo(clamp(k / 0.35))); // scale for stamp slam
const clean = w => w.replace(/[.,:?!;]/g, '');
const P = i => TM.phrases[i];
function W_(txt, n = 0) { let c = 0; for (const w of TM.words) if (clean(w.w).toLowerCase() === txt.toLowerCase()) { if (c === n) return w.s; c++; } throw new Error('word ' + txt); }

// seeded rng
function rng(s) { return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; }

// grain + scratches
const grain = [];
for (let i = 0; i < 4; i++) {
  const o = document.createElement('canvas'); o.width = 540; o.height = 960; const x = o.getContext('2d');
  const id = x.createImageData(540, 960);
  for (let p = 0; p < id.data.length; p += 4) { const v = Math.random() * 255; id.data[p] = id.data[p + 1] = id.data[p + 2] = v; id.data[p + 3] = 14; }
  x.putImageData(id, 0, 0); grain.push(o);
}

function rr(x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }

function text(str, x, y, { size = 60, weight = 800, color = C.text, align = 'center', font = 'Poppins', alpha = 1, scale = 1, rot = 0, stroke = 0, shadow = 0, track = 0 } = {}) {
  if (alpha <= 0) return;
  g.save(); g.globalAlpha *= alpha; g.translate(x, y); g.rotate(rot); g.scale(scale, scale);
  g.font = `${weight} ${size}px ${font}`; g.textAlign = align; g.textBaseline = 'middle';
  if (track) g.letterSpacing = track + 'px';
  if (shadow) { g.shadowColor = 'rgba(0,0,0,0.85)'; g.shadowBlur = shadow; g.shadowOffsetY = shadow * 0.25; }
  if (stroke) { g.lineJoin = 'round'; g.lineWidth = stroke; g.strokeStyle = 'rgba(0,0,0,0.9)'; g.strokeText(str, 0, 0); }
  g.fillStyle = color; g.fillText(str, 0, 0); g.restore();
}

function pill(str, x, y, { size = 44, fill = C.orange, color = '#fff', alpha = 1, scale = 1, rot = 0, stroke = null } = {}) {
  if (alpha <= 0) return;
  g.save(); g.globalAlpha *= alpha; g.translate(x, y); g.rotate(rot); g.scale(scale, scale);
  g.font = `800 ${size}px Poppins`; const tw = g.measureText(str).width, pw = tw + size * 0.9, ph = size * 1.5;
  rr(-pw / 2, -ph / 2, pw, ph, ph * 0.22); if (fill) { g.fillStyle = fill; g.fill(); }
  if (stroke) { g.lineWidth = 4; g.strokeStyle = stroke; g.stroke(); }
  g.fillStyle = color; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(str, 0, size * 0.04); g.restore();
}

// draw image cover-fitted in box with optional ken burns
function cover(img, x, y, w, h, { zoom = 1, fx = 0.5, fy = 0.5, filter = 'none' } = {}) {
  if (!img || !img.naturalWidth) { g.fillStyle = '#333'; g.fillRect(x, y, w, h); return; }
  const ir = img.naturalWidth / img.naturalHeight, br = w / h;
  let sw, sh; if (ir > br) { sh = img.naturalHeight / zoom; sw = sh * br; } else { sw = img.naturalWidth / zoom; sh = sw / br; }
  const sx = (img.naturalWidth - sw) * fx, sy = (img.naturalHeight - sh) * fy;
  g.save(); g.filter = filter; g.drawImage(img, sx, sy, sw, sh, x, y, w, h); g.restore();
}

// printed photo with white border, shadow, tape, caption
function photo(key, cx, cy, w, h, { rot = 0, alpha = 1, scale = 1, zoom = 1, fx = .5, fy = .5, filter = 'none', tape = true, caption = null, credit = null, border = 18 } = {}) {
  if (alpha <= 0 || scale <= 0) return;
  g.save(); g.globalAlpha *= alpha; g.translate(cx, cy); g.rotate(rot); g.scale(scale, scale);
  g.shadowColor = 'rgba(0,0,0,0.7)'; g.shadowBlur = 50; g.shadowOffsetY = 18;
  const bw = w + border * 2, bh = h + border * 2 + (caption ? 70 : 0);
  g.fillStyle = C.paper; g.fillRect(-bw / 2, -bh / 2, bw, bh); g.shadowBlur = 0; g.shadowOffsetY = 0;
  cover(IM[key], -w / 2, -bh / 2 + border, w, h, { zoom, fx, fy, filter });
  if (caption) text(caption, 0, bh / 2 - 42, { size: 34, weight: 700, color: C.ink, font: 'Poppins' });
  if (tape) { g.fillStyle = 'rgba(255,240,200,0.55)'; g.save(); g.rotate(-0.12); g.fillRect(-70, -bh / 2 - 22, 140, 44); g.restore(); }
  if (credit) text(credit, bw / 2 - 6, bh / 2 + 22, { size: 18, weight: 500, font: 'Inter', color: 'rgba(255,255,255,0.55)', align: 'right' });
  g.restore();
}

// logo on a white rounded card
function logoCard(key, cx, cy, w, h, { alpha = 1, scale = 1, rot = 0, pad = 0.18, dark = false } = {}) {
  if (alpha <= 0 || scale <= 0) return;
  const img = IM[key]; g.save(); g.globalAlpha *= alpha; g.translate(cx, cy); g.rotate(rot); g.scale(scale, scale);
  g.shadowColor = 'rgba(0,0,0,0.6)'; g.shadowBlur = 40; g.shadowOffsetY = 14;
  rr(-w / 2, -h / 2, w, h, 34); g.fillStyle = dark ? '#18181b' : '#ffffff'; g.fill(); g.shadowBlur = 0; g.shadowOffsetY = 0;
  if (img && img.naturalWidth) { const iw = w * (1 - pad * 2), ih = h * (1 - pad * 2), r = Math.min(iw / img.naturalWidth, ih / img.naturalHeight);
    g.drawImage(img, -img.naturalWidth * r / 2, -img.naturalHeight * r / 2, img.naturalWidth * r, img.naturalHeight * r); }
  else { const name = ({ l_intel: 'intel', l_fairchild: 'FAIRCHILD', l_amd: 'AMD' })[key] || key;
    g.fillStyle = key === 'l_intel' ? '#0068b5' : '#111'; g.font = `${key === 'l_intel' ? 800 : 900} ${Math.min(h * 0.42, w / (name.length * 0.62))}px Poppins`;
    g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(name, 0, 4); }
  g.restore();
}

// stamp text in a border box (rubber stamp)
function stamp(str, cx, cy, k, { color = C.red, size = 120, rot = -0.12, alpha = 1 } = {}) {
  if (k <= 0 || alpha <= 0) return;
  const s = slam(k); g.save(); g.globalAlpha *= alpha * clamp(k * 6); g.translate(cx, cy); g.rotate(rot); g.scale(s, s);
  g.font = `900 ${size}px Poppins`; const tw = g.measureText(str).width;
  g.lineWidth = 12; g.strokeStyle = color; rr(-tw / 2 - 40, -size * 0.75, tw + 80, size * 1.5, 18); g.stroke();
  g.fillStyle = color; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(str, 0, size * 0.05);
  g.restore();
}

// filled silhouette person
function person(x, y, s, { color = '#d6d3d1', alpha = 1, walk = 0, ph = 0, glow = 0 } = {}) {
  if (alpha <= 0) return;
  g.save(); g.globalAlpha *= alpha; g.translate(x, y); g.scale(s, s);
  if (glow) { g.shadowColor = `rgba(255,106,0,${glow})`; g.shadowBlur = 40; }
  g.fillStyle = color; g.strokeStyle = color; g.lineCap = 'round';
  const sw = Math.sin(ph) * 0.45 * walk, bob = Math.abs(Math.sin(ph)) * 5 * walk;
  g.translate(0, -bob);
  g.beginPath(); g.arc(0, -170, 30, 0, 7); g.fill();
  rr(-38, -135, 76, 95, 30); g.fill();
  g.lineWidth = 26; g.beginPath(); g.moveTo(-14, -48); g.lineTo(-14 + Math.sin(sw) * 50, 0); g.stroke();
  g.beginPath(); g.moveTo(14, -48); g.lineTo(14 + Math.sin(-sw) * 50, 0); g.stroke();
  g.restore();
}

function pin(x, y, k, { color = C.orange, label = null } = {}) {
  if (k <= 0) return;
  const dy = lerp(-260, 0, bounceK(k));
  g.save(); g.translate(x, y + dy);
  const pr = (Date.now() / 1000) % 1;
  g.fillStyle = color; g.shadowColor = 'rgba(255,106,0,0.8)'; g.shadowBlur = 30;
  g.beginPath(); g.moveTo(0, 0); g.bezierCurveTo(-34, -40, -34, -86, 0, -86); g.bezierCurveTo(34, -86, 34, -40, 0, 0); g.fill();
  g.shadowBlur = 0; g.fillStyle = '#fff'; g.beginPath(); g.arc(0, -56, 12, 0, 7); g.fill(); g.restore();
  if (label && k > 0.6) pill(label, x, y + 60, { size: 36, alpha: prog(k, 0.6, 1) });
}
function bounceK(k) { const n = 7.5625, d = 2.75; if (k < 1 / d) return n * k * k; if (k < 2 / d) return n * (k -= 1.5 / d) * k + .75; if (k < 2.5 / d) return n * (k -= 2.25 / d) * k + .9375; return n * (k -= 2.625 / d) * k + .984375; }

function ring(x, y, r, k, color = C.orange) { if (k <= 0 || k >= 1) return; g.save(); g.globalAlpha *= (1 - k); g.strokeStyle = color; g.lineWidth = 8; g.beginPath(); g.arc(x, y, r * (0.4 + k), 0, 7); g.stroke(); g.restore(); }

// word-chunk captions with active word highlight
let CHUNKS = null;
function buildChunks() {
  g.save(); g.font = '900 78px Poppins'; const out = []; let cur = [];
  const width = arr => g.measureText(arr.map(x => clean(x.w).toUpperCase()).join(' ')).width;
  TM.words.forEach((w, i) => {
    const nx = TM.words[i + 1];
    if (cur.length && width([...cur, w]) > 900) { out.push(cur); cur = []; }
    cur.push(w);
    const brk = /[.,:?!;]$/.test(w.w) || cur.length >= 3 || !nx || nx.p !== w.p;
    if (brk) { out.push(cur); cur = []; }
  });
  g.restore(); return out;
}
const HL = new Set(['vale', 'silício', 'chips', 'pomar', 'ameixa', 'shockley', 'nobel', 'paranoico', 'mentiras', 'oito', 'traidores', 'fairchild', 'intel', 'amd', 'google', 'amazon', 'coragem', 'brasil', 'insuportável', 'apple', 'facebook', 'não', 'sim']);
function captions(t, y = 1480) {
  if (!CHUNKS) CHUNKS = buildChunks();
  let ch = null; for (const c of CHUNKS) { if (c[0].s - 0.05 <= t) ch = c; else break; }
  if (!ch || t > ch[ch.length - 1].e + 0.6) return;
  const k = eo(prog(t, ch[0].s - 0.05, ch[0].s + 0.1));
  g.save(); g.font = '900 78px Poppins';
  const parts = ch.map(w => clean(w.w).toUpperCase()); const sp = 22;
  const widths = parts.map(p => g.measureText(p).width); const tot = widths.reduce((a, b) => a + b, 0) + sp * (parts.length - 1);
  let x = 540 - tot / 2; const sc = lerp(0.85, 1, k);
  g.translate(540, y); g.scale(sc, sc); g.translate(-540, -y);
  parts.forEach((p, i) => {
    const w = ch[i], active = t >= w.s && t < (ch[i + 1] ? ch[i + 1].s : w.e + 0.6), hl = HL.has(clean(w.w).toLowerCase());
    const col = active ? (hl ? C.amber : '#ffffff') : 'rgba(255,255,255,0.78)';
    g.lineJoin = 'round'; g.lineWidth = 16; g.strokeStyle = 'rgba(0,0,0,0.95)'; g.textAlign = 'left'; g.textBaseline = 'middle';
    g.globalAlpha = k; g.strokeText(p, x, 0 + y); g.fillStyle = col; g.fillText(p, x, y);
    if (active && hl) { g.fillStyle = C.orange; g.fillRect(x, y + 50, widths[i], 8); }
    x += widths[i] + sp;
  });
  g.restore();
}

function background(t, tone = 0) {
  g.fillStyle = C.bg; g.fillRect(0, 0, W, H);
  const vg = g.createRadialGradient(540, 860, 150, 540, 960, 1250);
  vg.addColorStop(0, tone ? 'rgba(255,106,0,0.10)' : 'rgba(255,255,255,0.035)'); vg.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = vg; g.fillRect(0, 0, W, H);
  // subtle grid paper lines
  g.save(); g.globalAlpha = 0.05; g.strokeStyle = '#fff'; g.lineWidth = 1;
  for (let x = 0; x <= W; x += 90) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, H); g.stroke(); }
  for (let y = 0; y <= H; y += 90) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
  g.restore();
}
function finish(t, total) {
  // vignette, grain, progress
  const vg = g.createRadialGradient(540, 960, 500, 540, 960, 1250); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.55)');
  g.fillStyle = vg; g.fillRect(0, 0, W, H);
  g.drawImage(grain[Math.floor(t * 24) % 4], 0, 0, W, H);
  const pg = g.createLinearGradient(0, 0, W, 0); pg.addColorStop(0, C.amber); pg.addColorStop(.5, C.orange); pg.addColorStop(1, C.red);
  g.fillStyle = pg; g.fillRect(0, 0, W * clamp(t / total), 10);
}

// schematic map of the SF Bay Area from real coordinates
const GEO = { lon0: -122.66, lon1: -121.74, lat0: 36.9, lat1: 38.0 };
const BAYPOLY = [[-122.37,37.93],[-122.30,37.80],[-122.25,37.76],[-122.18,37.70],[-122.13,37.62],[-122.05,37.52],[-121.98,37.44],[-122.11,37.46],[-122.21,37.52],[-122.27,37.58],[-122.36,37.62],[-122.37,37.72],[-122.39,37.79],[-122.42,37.81],[-122.48,37.83],[-122.45,37.88],[-122.42,37.94]];
const OCEAN = [[-122.48,37.83],[-122.51,37.76],[-122.50,37.62],[-122.44,37.46],[-122.38,37.25],[-122.19,37.01],[-122.03,36.96],[-121.95,36.97],[-121.9,36.9],[-122.7,36.9],[-122.7,38.0],[-122.62,38.0],[-122.6,37.92],[-122.55,37.88]];
const CITIES = { sf: [-122.42, 37.775, 'São Francisco'], pa: [-122.14, 37.44, 'Palo Alto'], mv: [-122.08, 37.39, 'Mountain View'], cu: [-122.03, 37.32, 'Cupertino'], sj: [-121.89, 37.335, 'San José'] };
function geoXY(lon, lat, box) { return [box.x + (lon - GEO.lon0) / (GEO.lon1 - GEO.lon0) * box.w, box.y + (GEO.lat1 - lat) / (GEO.lat1 - GEO.lat0) * box.h]; }
function bayMap(box, { cities = [], valley = 0, alpha = 1 } = {}) {
  g.save(); g.globalAlpha *= alpha;
  g.fillStyle = '#18181b'; g.fillRect(box.x, box.y, box.w, box.h);
  g.strokeStyle = 'rgba(255,255,255,0.06)'; g.lineWidth = 2;
  for (let lo = -122.6; lo <= -121.7; lo += 0.1) { const [x] = geoXY(lo, 37, box); g.beginPath(); g.moveTo(x, box.y); g.lineTo(x, box.y + box.h); g.stroke(); }
  for (let la = 36.9; la <= 38; la += 0.1) { const [, y] = geoXY(-122, la, box); g.beginPath(); g.moveTo(box.x, y); g.lineTo(box.x + box.w, y); g.stroke(); }
  const poly = (pts, fill, stroke) => { g.beginPath(); pts.forEach(([lo, la], i) => { const [x, y] = geoXY(lo, la, box); i ? g.lineTo(x, y) : g.moveTo(x, y); }); g.closePath(); g.fillStyle = fill; g.fill(); if (stroke) { g.strokeStyle = stroke; g.lineWidth = 3; g.stroke(); } };
  poly(OCEAN, '#0c1f2c', 'rgba(120,180,220,0.35)'); poly(BAYPOLY, '#0c1f2c', 'rgba(120,180,220,0.35)');
  const [ox, oy] = geoXY(-122.58, 37.3, box); text('OCEANO PACÍFICO', ox, oy, { size: 22 * box.w / 1000, weight: 600, font: 'Inter', color: 'rgba(150,200,230,0.5)', rot: -1.2, track: 4 });
  if (valley > 0) { const [vx, vy] = geoXY(-122.03, 37.38, box); g.save(); g.globalAlpha *= 0.35 * valley; g.fillStyle = C.orange; g.beginPath(); g.ellipse(vx, vy, box.w * 0.17 * valley, box.h * 0.07 * valley, 0.35, 0, 7); g.fill(); g.restore(); }
  for (const id of cities) { const [lo, la, name] = CITIES[id]; const [x, y] = geoXY(lo, la, box); g.fillStyle = '#fff'; g.beginPath(); g.arc(x, y, 7 * box.w / 1000, 0, 7); g.fill();
    text(name, x + 14 * box.w / 1000, y - 16 * box.w / 1000, { size: 26 * box.w / 1000, weight: 600, font: 'Inter', color: '#e7e5e4', align: 'left' }); }
  g.restore();
}
function cityXY(id, box) { const [lo, la] = CITIES[id]; return geoXY(lo, la, box); }
