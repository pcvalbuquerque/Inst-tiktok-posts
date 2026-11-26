// Pilot: "Seu cliente não acha você caro. Acha você igual." — canvas renderer, render(t) draws frame at time t.
const W = 1080, H = 1920;
const cv = document.getElementById('c'); cv.width = W; cv.height = H;
const g = cv.getContext('2d');
const T = window.TIMING; // {words, phrases}
const LOGO = document.getElementById('logo');
const C = { bg: '#09090b', line: '#5b5b63', dim: '#3a3a40', text: '#f4f4f5', sub: '#a1a1aa',
  orange: '#ff6a00', amber: '#ffb020', red: '#ff2a42', purple: '#8b5cf6' };
const HL = new Set(['caro', 'igual', 'prateleira', 'preço', 'desconto', 'diferente', 'compra', 'comparável', 'comenta']);

const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lerp = (a, b, k) => a + (b - a) * k;
const prog = (t, a, b) => clamp((t - a) / (b - a));
const eo = k => 1 - Math.pow(1 - k, 3);
const eio = k => k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
const back = k => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(k - 1, 3) + c1 * Math.pow(k - 1, 2); };
const bounce = k => { const n = 7.5625, d = 2.75;
  if (k < 1 / d) return n * k * k; if (k < 2 / d) return n * (k -= 1.5 / d) * k + .75;
  if (k < 2.5 / d) return n * (k -= 2.25 / d) * k + .9375; return n * (k -= 2.625 / d) * k + .984375; };
const clean = w => w.replace(/[.,:?!]/g, '');
const wt = (txt, n = 0) => { // start time of the n-th occurrence of word txt
  let c = 0; for (const w of T.words) if (clean(w.w).toLowerCase() === txt) { if (c === n) return w.s; c++; }
  throw new Error('word ' + txt); };
const ph = i => T.phrases[i];

// grain layers
const grain = [];
for (let i = 0; i < 4; i++) {
  const o = document.createElement('canvas'); o.width = 540; o.height = 960;
  const x = o.getContext('2d'), id = x.createImageData(540, 960);
  for (let p = 0; p < id.data.length; p += 4) { const v = Math.random() * 255; id.data[p] = id.data[p + 1] = id.data[p + 2] = v; id.data[p + 3] = 9; }
  x.putImageData(id, 0, 0); grain.push(o);
}

function rr(x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r);
  g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }

function pill(cx, cy, text, { size = 44, fill = C.orange, color = '#fff', alpha = 1, scale = 1, stroke = null } = {}) {
  if (alpha <= 0) return;
  g.save(); g.globalAlpha = alpha; g.translate(cx, cy); g.scale(scale, scale);
  g.font = `700 ${size}px Poppins`; const tw = g.measureText(text).width;
  const pw = tw + size * 1.0, phh = size * 1.55;
  rr(-pw / 2, -phh / 2, pw, phh, phh * 0.28);
  if (fill) { g.fillStyle = fill; g.fill(); }
  if (stroke) { g.lineWidth = 3; g.strokeStyle = stroke; g.stroke(); }
  g.fillStyle = color; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(text, 0, size * 0.04);
  g.restore();
}

// product box: k = color amount (0 gray, 1 brand), glow
function box(cx, cy, s, { alpha = 1, k = 0, label = 'produto', dim = 0 } = {}) {
  if (alpha <= 0) return;
  const w = 190 * s, h = 210 * s;
  g.save(); g.globalAlpha = alpha * (1 - dim * 0.7); g.translate(cx, cy);
  if (k > 0) { g.shadowColor = `rgba(255,106,0,${0.55 * k})`; g.shadowBlur = 70 * k; }
  rr(-w / 2, -h / 2, w, h, 20 * s);
  if (k > 0) {
    const gr = g.createLinearGradient(-w / 2, -h / 2, w / 2, h / 2);
    gr.addColorStop(0, `rgba(255,176,32,${k})`); gr.addColorStop(.5, `rgba(255,106,0,${k})`); gr.addColorStop(1, `rgba(139,92,246,${k})`);
    g.fillStyle = 'rgba(255,255,255,0.035)'; g.fill(); g.fillStyle = gr; g.fill();
  } else { g.fillStyle = 'rgba(255,255,255,0.035)'; g.fill(); }
  g.shadowBlur = 0;
  g.lineWidth = 3.5 * s; g.strokeStyle = k > 0 ? `rgba(255,220,180,${0.4 + 0.6 * k})` : C.line; g.stroke();
  // lid line + label stripes
  g.beginPath(); g.moveTo(-w / 2, -h / 2 + 46 * s); g.lineTo(w / 2, -h / 2 + 46 * s);
  g.strokeStyle = k > 0.5 ? 'rgba(255,255,255,0.55)' : C.dim; g.lineWidth = 3 * s; g.stroke();
  g.fillStyle = k > 0.5 ? '#fff' : C.sub; g.font = `600 ${28 * s}px Inter`; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText(label, 0, 18 * s);
  g.fillStyle = k > 0.5 ? 'rgba(255,255,255,0.5)' : C.dim;
  rr(-46 * s, 56 * s, 92 * s, 9 * s, 4 * s); g.fill(); rr(-30 * s, 74 * s, 60 * s, 9 * s, 4 * s); g.fill();
  g.restore();
}

function tag(cx, cy, s, text, { alpha = 1, rot = 0, fill = null, color = C.sub, stroke = C.line, string = true } = {}) {
  if (alpha <= 0) return;
  g.save(); g.globalAlpha = alpha; g.translate(cx, cy); g.rotate(rot); g.scale(s, s);
  const w = 150, h = 74;
  if (string) { g.beginPath(); g.moveTo(-w / 2 + 12, 0); g.quadraticCurveTo(-w / 2 - 20, -40, -w / 2 - 10, -70);
    g.strokeStyle = C.dim; g.lineWidth = 2.5; g.stroke(); }
  g.beginPath(); g.moveTo(-w / 2, 0); g.lineTo(-w / 2 + 28, -h / 2); g.lineTo(w / 2, -h / 2); g.lineTo(w / 2, h / 2);
  g.lineTo(-w / 2 + 28, h / 2); g.closePath();
  g.fillStyle = fill || 'rgba(255,255,255,0.04)'; g.fill(); g.lineWidth = 3.5; g.strokeStyle = stroke; g.stroke();
  g.beginPath(); g.arc(-w / 2 + 22, 0, 7, 0, 7); g.strokeStyle = stroke; g.lineWidth = 3; g.stroke();
  g.fillStyle = color; g.font = '700 34px Poppins'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText(text, 18, 2);
  g.restore();
}

function person(x, y, ph, { alpha = 1, color = C.sub, s = 1, walk = 1 } = {}) {
  if (alpha <= 0) return;
  g.save(); g.globalAlpha = alpha; g.translate(x, y); g.scale(s, s);
  g.strokeStyle = color; g.lineWidth = 6; g.lineCap = 'round';
  const sw = Math.sin(ph) * 0.5 * walk, bob = Math.abs(Math.sin(ph)) * 4 * walk;
  g.translate(0, -bob);
  g.beginPath(); g.arc(0, -150, 22, 0, 7); g.stroke();
  g.beginPath(); g.moveTo(0, -126); g.lineTo(0, -55); g.stroke();
  g.beginPath(); g.moveTo(0, -110); const A=(a,L,y0)=>{g.beginPath(); g.moveTo(0,y0); g.lineTo(Math.sin(a)*L, y0+Math.cos(a)*L); g.stroke();};
  A(-0.5-sw,42,-110); A(0.5+sw,42,-110); A(0.34+sw,58,-55); A(-0.34-sw,58,-55);
  g.restore();
}

function bubble(x, y, text, { alpha = 1, strike = 0, accent = false, scale = 1 } = {}) {
  if (alpha <= 0) return;
  g.save(); g.globalAlpha = alpha; g.translate(x, y); g.scale(scale, scale);
  g.font = '700 40px Poppins'; const tw = g.measureText(text).width, w = tw + 60, h = 84;
  rr(-w / 2, -h / 2, w, h, 26);
  g.fillStyle = accent ? 'rgba(255,106,0,0.16)' : 'rgba(255,255,255,0.06)'; g.fill();
  g.lineWidth = 3.5; g.strokeStyle = accent ? C.orange : C.line; g.stroke();
  g.beginPath(); g.moveTo(-20, h / 2 - 2); g.lineTo(-6, h / 2 + 24); g.lineTo(10, h / 2 - 2);
  g.fillStyle = accent ? '#2a1505' : '#151517'; g.fill();
  g.beginPath(); g.moveTo(-20, h / 2); g.lineTo(-6, h / 2 + 24); g.lineTo(10, h / 2); g.stroke();
  g.fillStyle = accent ? '#fff' : C.text; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(text, 0, 2);
  if (strike > 0) { g.beginPath(); g.moveTo(-tw / 2 - 10, 2); g.lineTo(-tw / 2 - 10 + (tw + 20) * strike, 2);
    g.strokeStyle = C.red; g.lineWidth = 7; g.lineCap = 'round'; g.stroke(); }
  g.restore();
}

function arrowDown(x, y, s, alpha) {
  if (alpha <= 0) return;
  g.save(); g.globalAlpha = alpha; g.translate(x, y); g.scale(s, s);
  g.strokeStyle = C.red; g.lineWidth = 8; g.lineCap = 'round'; g.lineJoin = 'round';
  g.beginPath(); g.moveTo(0, -40); g.lineTo(0, 40); g.moveTo(-26, 14); g.lineTo(0, 40); g.lineTo(26, 14); g.stroke();
  g.restore();
}

function caption(t) {
  let cur = null;
  for (const w of T.words) { if (w.s <= t) cur = w; else break; }
  if (!cur) return;
  const word = clean(cur.w), hl = HL.has(word.toLowerCase());
  const k = eo(prog(t, cur.s, cur.s + 0.14)), sc = lerp(1.18, 1, k);
  if (hl) pill(540, 330, word, { size: 64, scale: sc, alpha: k });
  else { g.save(); g.globalAlpha = k; g.translate(540, 330); g.scale(sc, sc); g.font = '700 70px Poppins';
    g.fillStyle = C.text; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(word, 0, 0); g.restore(); }
}

// ---------- layout ----------
const BX = [175, 405, 635, 865], BY = [800, 1100], SHELF = [915, 1215];
const HERO = { r: 0, c: 2 }; // the box that becomes different

function render(t) {
  g.globalAlpha = 1; g.fillStyle = C.bg; g.fillRect(0, 0, W, H);
  const vg = g.createRadialGradient(540, 960, 200, 540, 960, 1150);
  vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.6)');
  g.fillStyle = vg; g.fillRect(0, 0, W, H);

  const tEnd = ph(17).e;
  // ===== Scene A: big tag "caro" -> "igual" (0 – 4.27)
  {
    const a = 1 - prog(t, 3.8, 4.25);
    if (a > 0) {
      const dk = bounce(prog(t, 0.05, 0.8)), y = lerp(-200, 980, dk);
      const caro = t >= wt('caro'), ig = wt('igual');
      tag(540, y, 2.8, caro ? 'CARO' : 'R$', { alpha: a, color: caro ? C.amber : C.sub,
        stroke: caro ? C.amber : C.line, rot: Math.sin(t * 2) * 0.03 });
      const sk = eio(prog(t, ig - 0.05, ig + 0.25));
      if (sk > 0) { g.save(); g.globalAlpha = a; g.strokeStyle = C.red; g.lineWidth = 12; g.lineCap = 'round';
        g.beginPath(); g.moveTo(330, 1040); g.lineTo(lerp(330, 800, sk), lerp(1040, 920, sk)); g.stroke(); g.restore(); }
      const pk = prog(t, ig + 0.1, ig + 0.4);
      pill(540, 1260, 'IGUAL', { size: 78, scale: back(pk), alpha: pk * a });
    }
  }

  // shelf group visibility
  const shelfIn = prog(t, 4.27, 4.75), shelfOut = prog(t, ph(13).s, ph(13).s + 0.9);
  const shelfA = shelfIn * (1 - shelfOut);
  const slide = lerp(50, -10, eio(prog(t, 4.27, 9)));
  const dimK = eio(prog(t, ph(7).s, ph(8).e)) * (1 - eio(prog(t, ph(9).s, ph(9).e)));
  const heroT = wt('diferente'), heroK = eio(prog(t, heroT - 0.05, heroT + 0.45));

  if (shelfA > 0) {
    // boards
    g.save(); g.globalAlpha = shelfA; g.strokeStyle = C.line; g.lineWidth = 7; g.lineCap = 'round';
    for (const sy of SHELF) { const L = lerp(0, 940, eo(shelfIn)); g.beginPath(); g.moveTo(70 + slide, sy); g.lineTo(70 + slide + L, sy); g.stroke();
      g.lineWidth = 4; g.beginPath(); g.moveTo(140 + slide, sy); g.lineTo(140 + slide, sy + 40); g.moveTo(940 + slide, sy); g.lineTo(940 + slide, sy + 40); g.stroke(); g.lineWidth = 7; }
    g.restore();
  }
  // boxes
  for (let r = 0; r < 2; r++) for (let c = 0; c < 4; c++) {
    const i = r * 4 + c, isHero = r === HERO.r && c === HERO.c;
    const pk = prog(t, 4.45 + i * 0.11, 4.75 + i * 0.11);
    let x = BX[c] + slide, y = BY[r], s = back(pk), alpha = clamp(pk * 3) ;
    let k = 0, label = 'produto', dim = dimK;
    if (isHero) {
      k = heroK; s *= lerp(1, 1.12, heroK); dim = dimK * (1 - heroK);
      const mv = eio(prog(t, ph(13).s, ph(13).s + 1.0));
      x = lerp(x, 540, mv); y = lerp(y, 900, mv); s *= lerp(1, 1.45, mv);
      if (t >= ph(13).s) label = 'você';
      const fin = eio(prog(t, ph(15).s - 0.1, ph(15).s + 0.6));
      y = lerp(y, 700, fin); s *= lerp(1, 0.78, fin);
      if (t > tEnd + 3) alpha = 0;
    } else alpha *= (1 - shelfOut);
    if (!isHero && shelfOut > 0) { s *= lerp(1, 0.6, shelfOut); y += shelfOut * 60; }
    if (t < 4.27) alpha = 0;
    box(x, y, s, { alpha, k, label, dim });
  }

  // B: "mesmo produto / mesma embalagem / mesma promessa"
  {
    const out = prog(t, ph(4).s, ph(4).s + 0.3);
    [['mesmo produto', 'produto'], ['mesma embalagem', 'embalagem'], ['mesma promessa', 'promessa']].forEach(([txt, key], i) => {
      const k = prog(t, wt(key) - 0.1, wt(key) + 0.2);
      pill(540, 1370 + i * 92, txt, { size: 36, fill: 'rgba(255,255,255,0.06)', color: C.text, stroke: C.line, alpha: k * (1 - out), scale: back(k) });
    });
  }

  // C/D: tags over each box
  {
    const show = ph(4).s + 0.2, pre = wt('preço'), war = ph(6).s, outT = ph(9).s;
    const outA = 1 - prog(t, outT, outT + 0.35);
    for (let r = 0; r < 2; r++) for (let c = 0; c < 4; c++) {
      const i = r * 4 + c, isHero = r === HERO.r && c === HERO.c;
      const k = prog(t, show + i * 0.3, show + i * 0.3 + 0.3);
      if (k <= 0) continue;
      let x = BX[c] + slide + 30, y = BY[r] - 128, rot = -0.06;
      const pulse = Math.exp(-Math.pow((t - pre - 0.15) / 0.18, 2));
      const isWar = t >= war;
      let txt = isWar ? '-%' : 'R$';
      let fill = null, color = C.sub, stroke = C.line;
      if (t >= pre) { color = C.amber; stroke = C.amber; }
      if (isWar) { color = C.red; stroke = C.red; fill = 'rgba(255,42,66,0.10)'; }
      // drops on each "baixa"
      let drop = 0; try { drop += eo(prog(t, wt('baixa', 0), wt('baixa', 0) + 0.3)) * 18 + eo(prog(t, wt('baixa', 1), wt('baixa', 1) + 0.3)) * 18; } catch (e) {}
      y += drop; rot += Math.sin(t * 9 + i) * 0.04 * (isWar ? 1 : 0);
      let a = k * (1 - dimK * 0.5);
      if (isHero) {
        // hero tag comes back at "etiqueta" and falls at "importar"
        a = k * outA;
      } else a *= outA;
      tag(x, y, 0.72 * (1 + pulse * 0.25), txt, { alpha: a, rot, fill, color, stroke });
    }
    // hero tag reappears and falls
    const et = wt('etiqueta'), imp = wt('importar');
    const ra = prog(t, et - 0.1, et + 0.2);
    if (ra > 0) {
      const f = eio(prog(t, imp, imp + 0.9));
      const x = BX[HERO.c] + slide + 30 + f * 60, y = BY[HERO.r] - 128 + f * 1300;
      tag(x, y, 0.72, 'R$', { alpha: ra * (1 - prog(t, imp + 0.7, imp + 0.9)), rot: -0.08 + f * 2.2, color: C.amber, stroke: C.amber, string: f < 0.05 });
    }
  }

  // D: arrows + falling chart
  {
    const a = prog(t, ph(6).s, ph(6).s + 0.3) * (1 - prog(t, ph(9).s, ph(9).s + 0.35));
    for (let i = 0; i < 3; i++) arrowDown(300 + i * 240, 560 + Math.sin(t * 6 + i) * 14, 0.9, a);
    const ck = eio(prog(t, ph(8).s, ph(8).e));
    if (ck > 0) {
      g.save(); g.globalAlpha = a; g.strokeStyle = C.red; g.lineWidth = 7; g.lineJoin = 'round'; g.lineCap = 'round';
      const pts = [[150, 1390], [330, 1420], [470, 1470], [640, 1500], [800, 1570], [930, 1620]];
      g.beginPath(); g.moveTo(...pts[0]);
      const n = ck * (pts.length - 1);
      for (let i = 1; i <= Math.floor(n); i++) g.lineTo(...pts[i]);
      const fi = Math.floor(n), fr = n - fi;
      if (fi < pts.length - 1) g.lineTo(lerp(pts[fi][0], pts[fi + 1][0], fr), lerp(pts[fi][1], pts[fi + 1][1], fr));
      g.stroke();
      g.fillStyle = C.sub; g.font = '600 32px Inter'; g.textAlign = 'left'; g.fillText('lucro', 150, 1350);
      g.restore();
    }
  }

  // E: people walk to hero, bubbles
  {
    const s0 = ph(11).s, a = prog(t, s0 - 0.2, s0 + 0.2) * (1 - prog(t, ph(13).s + 0.3, ph(13).s + 0.9));
    if (a > 0) {
      const wk = eio(prog(t, s0 - 0.2, ph(11).e + 0.3));
      const walking = wk < 1 ? 1 : 0.0;
      person(lerp(-80, 470, wk), 1640, t * 9, { alpha: a, walk: walking });
      person(lerp(1160, 640, wk), 1640, t * 9 + 1.5, { alpha: a, walk: walking });
      person(lerp(-220, 330, wk), 1660, t * 9 + 3, { alpha: a * 0.8, walk: walking, s: 0.9 });
      const q = wt('quanto'), cc = ph(12).s;
      const b1 = prog(t, q - 0.1, q + 0.2) * (1 - prog(t, cc - 0.05, cc + 0.15));
      bubble(560, 1340, 'quanto custa?', { alpha: b1 * a, strike: eio(prog(t, ph(11).e - 0.4, ph(11).e + 0.1)), scale: back(clamp(b1 * 1.5)) });
      const b2 = prog(t, cc, cc + 0.25);
      bubble(560, 1340, 'como eu compro?', { alpha: b2 * a, accent: true, scale: back(b2) });
    }
  }

  // F: "deixar de ser comparável"
  {
    const k = prog(t, wt('comparável') - 0.1, wt('comparável') + 0.25), out = prog(t, ph(15).s - 0.1, ph(15).s + 0.2);
    pill(540, 1290, 'fora da comparação', { size: 44, fill: 'rgba(255,255,255,0.06)', stroke: C.orange, color: C.text, alpha: k * (1 - out), scale: back(k) });
  }

  // G: end card
  {
    const s0 = ph(16).s - 0.05, k = prog(t, s0, s0 + 0.35);
    if (k > 0) {
      g.save(); g.globalAlpha = k; g.fillStyle = C.text; g.font = '700 66px Poppins'; g.textAlign = 'center'; g.textBaseline = 'middle';
      g.fillText('Tá na prateleira', 540, 1000 + (1 - eo(k)) * 30);
      g.fillStyle = C.orange; g.fillText('ou fora dela?', 540, 1085 + (1 - eo(k)) * 30); g.restore();
      const ck = prog(t, ph(17).s - 0.1, ph(17).s + 0.25);
      pill(540, 1240, 'comenta aqui', { size: 46, scale: back(ck), alpha: ck });
      const lk = prog(t, ph(17).e, ph(17).e + 0.5);
      if (lk > 0 && LOGO.complete) {
        const lw = 560, lh = lw * LOGO.naturalHeight / LOGO.naturalWidth;
        g.save(); g.globalAlpha = lk; g.drawImage(LOGO, 540 - lw / 2, 1460 + (1 - eo(lk)) * 20, lw, lh);
        g.fillStyle = C.sub; g.font = '500 34px Inter'; g.textAlign = 'center';
        g.fillText('@pcesar.albuquerque  ·  @porto_labs', 540, 1460 + lh + 70); g.restore();
      }
    }
  }

  caption(t);
  // progress bar
  const pr = clamp(t / (tEnd + 1.3));
  const pg = g.createLinearGradient(0, 0, W, 0); pg.addColorStop(0, C.amber); pg.addColorStop(.5, C.orange); pg.addColorStop(1, C.red);
  g.fillStyle = pg; g.globalAlpha = 1; g.fillRect(0, 0, W * pr, 9);
  g.globalAlpha = 1; g.drawImage(grain[Math.floor(t * 30) % 4], 0, 0, W, H);
}
window.render = render;
window.renderCover = function () {
  g.globalAlpha = 1; g.fillStyle = C.bg; g.fillRect(0, 0, W, H);
  const vg = g.createRadialGradient(540, 960, 200, 540, 960, 1150); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.6)');
  g.fillStyle = vg; g.fillRect(0, 0, W, H);
  g.fillStyle = C.text; g.font = '800 92px Poppins'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText('Seu cliente não', 540, 420); g.fillText('acha você caro.', 540, 530);
  tag(540, 900, 2.6, 'CARO', { color: C.amber, stroke: C.amber, rot: -0.04 });
  g.save(); g.strokeStyle = C.red; g.lineWidth = 12; g.lineCap = 'round'; g.beginPath(); g.moveTo(345, 955); g.lineTo(790, 845); g.stroke(); g.restore();
  g.fillStyle = C.sub; g.font = '600 50px Inter'; g.fillText('Ele acha você', 540, 1160);
  pill(540, 1280, 'IGUAL', { size: 84 });
  const lw = 520, lh = lw * LOGO.naturalHeight / LOGO.naturalWidth; g.drawImage(LOGO, 540 - lw / 2, 1560, lw, lh);
  g.drawImage(grain[0], 0, 0, W, H);
};
