// "Como um pomar de ameixa virou o Vale do Silício" — timeline
const TOTAL = 92.0;
const CUES = []; // sound cues {t, type}
const cue = (t, type) => CUES.push({ t: +t.toFixed(3), type });
const S = [];   // scenes {a, draw(lt, t)}
const scene = (a, draw, tr = 'push') => { S.push({ a, draw, tr }); cue(a, 'whoosh'); };
const SHAKES = [], FLASHES = [];
const shake = (t, amp = 22) => SHAKES.push({ t, amp });
const flash = t => FLASHES.push(t);
const sepia = 'sepia(0.55) contrast(1.08) brightness(0.95)';
const bw = 'grayscale(1) contrast(1.15)';

// ---------- A: hook ----------
scene(0, (lt, t) => {
  background(t);
  const z = lerp(1.0, 1.12, prog(t, 0, 4.3));
  photo('phone', 540, 860, 470, 620, { scale: back(prog(t, 0, 0.45)) * z, rot: -0.04, zoom: 1.15, tape: false });
  const L = [['l_google', W_('Google'), 250, 560, -0.12], ['l_apple', W_('Apple'), 840, 640, 0.1], ['l_facebook', W_('Facebook'), 290, 1180, 0.08]];
  L.forEach(([k, tt, x, y, r]) => { const kk = prog(t, tt - 0.05, tt + 0.3); logoCard(k, x, y, k === 'l_google' ? 300 : 210, 190, { scale: back(kk), alpha: clamp(kk * 3), rot: r + Math.sin(t * 2 + x) * 0.02 }); });
  const q = W_('comum'); const kq = prog(t, q, q + 0.3);
  text('?', 830, 1130, { size: 360, color: C.orange, scale: slam(kq), alpha: clamp(kq * 4), shadow: 30 });
}, 'cut');
['Google', 'Apple', 'Facebook'].forEach(w => cue(W_(w), 'pop')); cue(W_('comum'), 'impact'); shake(W_('comum'), 18);

// ---------- B: mesmo pedaço de terra (schematic map zoom + pin) ----------
scene(P(1).s, (lt, t) => {
  background(t);
  const k = eio(prog(t, P(1).s, P(1).e + 0.3));
  const s = lerp(1.0, 1.35, k); const box = { x: 540 - 500 * s, y: 900 - 640 * s, w: 1000 * s, h: 1200 * s };
  const c = geoXY(-122.03, 37.38, box); const dx = lerp(0, 540 - c[0], k), dy = lerp(0, 860 - c[1], k);
  box.x += dx; box.y += dy; bayMap(box, { cities: ['sf'], valley: prog(t, W_('terra') - 0.2, W_('terra') + 0.4) });
  const p = geoXY(-122.03, 37.38, box);
  pin(p[0], p[1], prog(t, W_('terra') - 0.3, W_('terra') + 0.3), { label: 'AQUI' });
  ring(p[0], p[1] - 20, 140, prog(t, W_('terra'), W_('terra') + 0.8));
  text('CALIFÓRNIA · EUA', 540, 300, { size: 52, color: C.text, track: 6, alpha: prog(t, P(1).s, P(1).s + 0.3), shadow: 20 });
});
cue(W_('terra'), 'impact');

// ---------- C: 70 anos atrás + pomar ----------
scene(P(2).s, (lt, t) => {
  background(t);
  const k = prog(t, P(2).s, P(2).s + 1.0);
  const yr = Math.round(lerp(2026, 1956, eio(k)));
  text(String(yr), 540, 330, { size: 190, color: k < 1 ? C.text : C.amber, track: 6, shadow: 20 });
  if (k >= 1) text('70 ANOS ATRÁS', 540, 460, { size: 44, weight: 700, color: C.sub, track: 8 });
  const pk = prog(t, P(2).s + 0.8, P(2).s + 1.3);
  photo('orchard', 540, 990, 800, 600, { scale: back(pk), alpha: clamp(pk * 3), rot: 0.03, zoom: lerp(1.05, 1.25, prog(t, P(2).s + 0.8, P(3).s)), filter: sepia, caption: 'Pomar em Santa Clara, Califórnia' });
  const a = W_('ameixa'); pill('POMAR DE AMEIXA', 540, 1340, { size: 46, scale: back(prog(t, a - 0.2, a + 0.15)), alpha: prog(t, a - 0.2, a) });
}, 'zoom');
cue(P(2).s, 'tick'); cue(W_('ameixa') - 0.2, 'pop');

// ---------- D: Califórnia, sul de São Francisco ----------
const BOXD = { x: 40, y: 330, w: 1000, h: 1200 };
scene(P(3).s, (lt, t) => {
  background(t);
  const k = eio(prog(t, P(3).s, P(5).s)); const s = lerp(1.0, 1.08, k);
  const box = { x: 540 - 500 * s, y: 930 - 600 * s, w: 1000 * s, h: 1200 * s };
  bayMap(box, { cities: t > W_('Francisco') - 0.3 ? ['sf', 'pa', 'mv', 'sj'] : [], valley: prog(t, W_('Vale') - 0.1, W_('Vale') + 0.4) });
  const sf = cityXY('sf', box), sv = geoXY(-122.03, 37.38, box);
  pin(sf[0], sf[1], prog(t, W_('Francisco') - 0.4, W_('Francisco')), {});
  const ak = eio(prog(t, W_('hoje'), W_('Vale')));
  if (ak > 0) { g.save(); g.strokeStyle = C.orange; g.lineWidth = 10; g.setLineDash([24, 16]); g.lineDashOffset = -t * 60; g.beginPath(); g.moveTo(sf[0], sf[1] + 20); g.lineTo(lerp(sf[0], sv[0], ak), lerp(sf[1] + 20, sv[1], ak)); g.stroke(); g.restore(); }
  const vk = prog(t, W_('Vale') - 0.1, W_('Vale') + 0.3);
  pill('VALE DO SILÍCIO', sv[0], sv[1] + 150, { size: 42, scale: back(vk), alpha: clamp(vk * 3) });
  text('CALIFÓRNIA · EUA', 540, 250, { size: 52, color: C.text, track: 6, alpha: prog(t, P(3).s, P(3).s + 0.3), shadow: 20 });
  credit('Mapa esquemático');
});
cue(W_('Francisco') - 0.3, 'pop'); cue(W_('Vale'), 'impact');

// ---------- E: Silício = material dos chips ----------
scene(P(5).s, (lt, t) => {
  background(t, 1);
  const k1 = prog(t, P(5).s, P(5).s + 0.4);
  text('SILÍCIO', 540, 330, { size: 150, color: C.amber, scale: slam(k1), alpha: clamp(k1 * 4), track: 4, shadow: 20 });
  const c = W_('chips'); const wk = prog(t, P(5).s + 0.3, P(5).s + 0.8);
  // wafer disc
  g.save(); g.translate(540, 860); g.rotate(t * 0.3); g.scale(back(wk), back(wk));
  g.beginPath(); g.arc(0, 0, 330, 0, 7); g.clip(); cover(IM.wafer2, -330, -330, 660, 660, { zoom: 1.3 }); g.restore();
  g.save(); g.globalAlpha = 0.5 * wk; g.strokeStyle = C.amber; g.lineWidth = 6; g.beginPath(); g.arc(540, 860, 340, 0, 7); g.stroke(); g.restore();
  pill('CHIPS', 540, 1250, { size: 50, scale: back(prog(t, c - 0.1, c + 0.2)), alpha: prog(t, c - 0.1, c) });
  // devices at "tela"
  const tk = prog(t, W_('tudo', 0) - 0.2, W_('tudo', 0) + 0.3);
  if (tk > 0) { g.save(); g.globalAlpha = tk; g.fillStyle = 'rgba(11,11,13,0.85)'; g.fillRect(0, 560, W, 620); g.restore();
    devices(tk, t); }
});
cue(P(5).s, 'impact'); cue(W_('chips'), 'pop'); cue(W_('tudo', 0) - 0.2, 'whoosh');

function devices(k, t) {
  const items = [[260, 870, 'phone'], [540, 870, 'laptop'], [820, 870, 'tv']];
  items.forEach(([x, y, kind], i) => {
    const kk = back(clamp(k * 1.6 - i * 0.25)); if (kk <= 0) return;
    g.save(); g.translate(x, y); g.scale(kk, kk); g.strokeStyle = '#e7e5e4'; g.lineWidth = 8; g.lineJoin = 'round';
    if (kind === 'phone') { rr(-70, -130, 140, 260, 22); g.stroke(); }
    if (kind === 'laptop') { rr(-120, -110, 240, 160, 12); g.stroke(); g.beginPath(); g.moveTo(-150, 70); g.lineTo(150, 70); g.stroke(); }
    if (kind === 'tv') { rr(-130, -110, 260, 170, 10); g.stroke(); g.beginPath(); g.moveTo(-50, 100); g.lineTo(50, 100); g.stroke(); }
    // chip glowing inside
    g.shadowColor = C.orange; g.shadowBlur = 30 + 15 * Math.sin(t * 8 + i); g.fillStyle = C.orange; rr(-26, -46, 52, 52, 6); g.fill();
    g.shadowBlur = 0; g.strokeStyle = C.orange; g.lineWidth = 4;
    for (let q = -18; q <= 18; q += 12) { g.beginPath(); g.moveTo(q, -46); g.lineTo(q, -58); g.moveTo(q, 6); g.lineTo(q, 18); g.stroke(); }
    g.restore();
  });
}

// ---------- F: como um vale de frutas virou centro da tecnologia? (before/after) ----------
scene(P(6).s, (lt, t) => {
  background(t);
  const k = eio(prog(t, P(6).s + 0.2, W_('tecnologia')));
  const x = lerp(1000, 540, k);
  g.save(); g.beginPath(); g.rect(60, 420, x - 60, 900); g.clip(); cover(IM.orchard, 60, 420, 960, 900, { zoom: 1.1, filter: sepia }); g.restore();
  g.save(); g.beginPath(); g.rect(x, 420, 1020 - x, 900); g.clip(); cover(IM.circuit, 60, 420, 960, 900, { zoom: 1.2 }); g.restore();
  g.strokeStyle = '#fff'; g.lineWidth = 8; g.beginPath(); g.moveTo(x, 400); g.lineTo(x, 1340); g.stroke();
  pill('FRUTAS', 300, 480, { size: 40, fill: '#7c5a2a', alpha: prog(t, W_('frutas') - 0.2, W_('frutas')) });
  pill('TECNOLOGIA', 790, 480, { size: 40, alpha: prog(t, W_('tecnologia') - 0.2, W_('tecnologia')) });
  const q = prog(t, W_('planeta') - 0.1, W_('planeta') + 0.25);
  text('?', 540, 870, { size: 420, color: C.orange, scale: slam(q), alpha: clamp(q * 4), shadow: 40 });
  credit('Fotos: OSU Special Collections · Unsplash');
}, 'whip');
cue(W_('planeta'), 'impact'); shake(W_('planeta'), 14);

// ---------- G: chefe insuportável ----------
scene(P(7).s, (lt, t) => {
  background(t);
  g.save(); g.globalAlpha = 0.25 + 0.1 * Math.sin(t * 20); g.fillStyle = '#3a0508'; g.fillRect(0, 0, W, H); g.restore();
  person(540, 1180, 2.6, { color: '#1c1917', glow: 0.0 });
  g.save(); g.shadowColor = C.red; g.shadowBlur = 60; person(540, 1180, 2.6, { color: '#0c0a09' }); g.restore();
  const k = prog(t, W_('insuportável') - 0.1, W_('insuportável') + 0.3);
  text('UM CHEFE', 540, 330, { size: 90, color: C.text, alpha: prog(t, P(7).s, P(7).s + 0.3) });
  stamp('INSUPORTÁVEL', 540, 480, k, { size: 92 });
  for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2 + t * 0.6, r = 330 + 20 * Math.sin(t * 9 + i);
    g.save(); g.globalAlpha = 0.8 * k; g.strokeStyle = C.red; g.lineWidth = 10; g.lineCap = 'round'; g.beginPath(); g.moveTo(540 + Math.cos(a) * r, 760 + Math.sin(a) * r * 0.8); g.lineTo(540 + Math.cos(a) * (r + 60), 760 + Math.sin(a) * (r + 60) * 0.8); g.stroke(); g.restore(); }
}, 'cut');
cue(W_('insuportável'), 'stamp'); shake(W_('insuportável'), 26); flash(W_('insuportável'));

// ---------- H: 1956 Shockley, transistor, Nobel ----------
scene(P(8).s, (lt, t) => {
  background(t);
  stamp('1956', 540, 300, prog(t, P(8).s, P(8).s + 0.3), { color: C.amber, size: 110, rot: -0.05 });
  const sk = prog(t, W_('Shockley') - 0.2, W_('Shockley') + 0.25);
  photo('shockley_nobel', 540, 880, 520, 680, { scale: back(sk), alpha: clamp(sk * 3), rot: -0.035, filter: bw, zoom: lerp(1.0, 1.08, prog(t, P(8).s, P(9).s)), fy: 0.2, caption: 'William Shockley' });
  const tk = prog(t, W_('transistor') - 0.2, W_('transistor') + 0.25);
  photo('transistor', 230, 1270, 250, 320, { scale: back(tk), alpha: clamp(tk * 3), rot: -0.12, caption: 'transistor' });
  const nk = prog(t, W_('Nobel') - 0.25, W_('Nobel') + 0.2);
  photo('nobel', 850, 1250, 260, 300, { scale: back(nk), alpha: clamp(nk * 3), rot: 0.1, caption: 'Nobel 1956' });
  if (nk > 0) ring(850, 1230, 220, prog(t, W_('Nobel'), W_('Nobel') + 0.8), C.amber);
  credit('Fotos: Fundação Nobel (dom. público) · Mister rf (CC BY-SA 4.0) · Science Museum (CC BY-SA 2.0)');
}, 'zoom');
cue(P(8).s, 'stamp'); cue(W_('Shockley') - 0.1, 'pop'); cue(W_('transistor') - 0.1, 'pop'); cue(W_('Nobel') - 0.1, 'ding');

// ---------- I: empresa perto da mãe ----------
scene(P(9).s, (lt, t) => {
  background(t);
  const s = 2.1; const box = { x: 0, y: 0, w: 1000 * s, h: 1200 * s }; const c = geoXY(-122.1, 37.42, box); box.x = 540 - c[0]; box.y = 900 - c[1];
  bayMap(box, { cities: ['pa', 'mv'] });
  const mv = cityXY('mv', box);
  pin(mv[0], mv[1], prog(t, W_('empresa') - 0.3, W_('empresa') + 0.2), { label: 'EMPRESA DE SHOCKLEY' });
  const pa = cityXY('pa', box); const hk = prog(t, W_('mãe') - 0.3, W_('mãe') + 0.1);
  if (hk > 0) house(pa[0] - 40, pa[1] - 170, back(hk));
  text('1956 · MOUNTAIN VIEW', 540, 300, { size: 50, color: C.text, track: 4, alpha: prog(t, P(9).s, P(9).s + 0.3), shadow: 20 });
}, 'push');
cue(W_('empresa') - 0.2, 'pop'); cue(W_('mãe') - 0.2, 'pop');
function house(x, y, s) { g.save(); g.translate(x, y); g.scale(s, s); g.fillStyle = '#fff'; g.strokeStyle = '#fff'; g.lineWidth = 8; g.lineJoin = 'round';
  g.beginPath(); g.moveTo(-70, 0); g.lineTo(0, -60); g.lineTo(70, 0); g.closePath(); g.stroke(); rr(-55, 0, 110, 80, 6); g.stroke();
  g.fillStyle = C.red; g.beginPath(); const hy = 40; g.moveTo(0, hy + 18); g.bezierCurveTo(-30, hy - 4, -16, hy - 30, 0, hy - 12); g.bezierCurveTo(16, hy - 30, 30, hy - 4, 0, hy + 18); g.fill();
  text('mãe', 0, 125, { size: 38, weight: 700 }); g.restore(); }

// ---------- J: jovens cientistas brilhantes ----------
scene(P(10).s, (lt, t) => {
  background(t);
  text('OS MAIS BRILHANTES', 540, 330, { size: 64, color: C.text, alpha: prog(t, P(10).s, P(10).s + 0.3), track: 2 });
  for (let i = 0; i < 8; i++) {
    const r = Math.floor(i / 4), c = i % 4, x = 200 + c * 227, y = 820 + r * 400;
    const k = prog(t, P(10).s + 0.15 + i * 0.28, P(10).s + 0.45 + i * 0.28);
    person(x, y, 1.15, { color: k > 0 ? '#f5f5f4' : '#3f3f46', glow: 0.8 * k });
    if (k > 0) bulb(x, y - 290, back(k), t + i);
  }
}, 'push');
for (let i = 0; i < 8; i++) cue(P(10).s + 0.15 + i * 0.28, 'blip');
function bulb(x, y, s, t) { g.save(); g.translate(x, y); g.scale(s, s); g.shadowColor = C.amber; g.shadowBlur = 30 + 10 * Math.sin(t * 7);
  g.fillStyle = C.amber; g.beginPath(); g.arc(0, 0, 28, 0, 7); g.fill(); g.fillRect(-13, 22, 26, 22); g.restore(); }

// ---------- K: genial e paranoico ----------
scene(P(11).s, (lt, t) => {
  background(t);
  const gk = prog(t, W_('genial') - 0.1, W_('genial') + 0.2), pk = prog(t, W_('paranoico') - 0.1, W_('paranoico') + 0.2);
  photo('shockley_nobel', 540, 860, 560, 700, { rot: 0, filter: 'grayscale(1) contrast(1.4) brightness(0.9)', zoom: 1.35, fy: 0.2, tape: false, scale: 1 });
  // split overlay
  g.save(); g.globalAlpha = 0.45 * gk; g.fillStyle = C.green; g.beginPath(); g.moveTo(240, 480); g.lineTo(540, 480); g.lineTo(540, 1240); g.lineTo(240, 1240); g.fill(); g.restore();
  if (pk > 0) { g.save(); g.globalAlpha = 0.5 * pk; g.fillStyle = C.red; g.fillRect(540, 480, 300, 760); g.restore();
    // glitch slices
    for (let i = 0; i < 6; i++) { const yy = 520 + ((i * 137 + Math.floor(t * 18) * 53) % 680); g.save(); g.globalAlpha = 0.7 * pk; g.drawImage(cv, 540, yy, 300, 22, 540 + (Math.sin(t * 40 + i) * 30), yy, 300, 22); g.restore(); } }
  pill('GENIAL', 330, 420, { size: 54, fill: C.green, scale: back(gk), alpha: clamp(gk * 3) });
  pill('PARANOICO', 760, 420, { size: 54, fill: C.red, scale: back(pk), alpha: clamp(pk * 3), rot: Math.sin(t * 30) * 0.03 * pk });
  credit('Foto: Fundação Nobel (domínio público)');
}, 'cut');
cue(W_('genial'), 'ding'); cue(W_('paranoico'), 'glitch'); shake(W_('paranoico'), 12);

// ---------- L: detector de mentiras ----------
scene(P(12).s, (lt, t) => {
  background(t);
  const pk = prog(t, P(12).s, P(12).s + 0.4);
  photo('polygraph', 540, 760, 820, 620, { scale: back(pk), alpha: clamp(pk * 3), rot: -0.02, filter: bw, zoom: lerp(1.0, 1.15, prog(t, P(12).s, P(13).s)), caption: 'Teste de detector de mentiras (anos 1940)' });
  // needle graph
  const dk = prog(t, W_('detector') - 0.4, P(12).e);
  g.save(); g.globalAlpha = clamp(dk * 5); g.fillStyle = '#f5f0e6'; rr(90, 1170, 900, 200, 14); g.fill(); g.beginPath(); g.rect(110, 1180, 860 * dk, 180); g.clip();
  g.strokeStyle = C.red; g.lineWidth = 5; g.beginPath();
  for (let x = 0; x <= 860; x += 4) { const amp = 20 + 60 * Math.max(0, Math.sin(x / 90)) * (x > 500 ? 1.6 : 1); g.lineTo(110 + x, 1270 + Math.sin(x / 9 + x * x / 4000) * amp * 0.6); }
  g.stroke(); g.restore();
  stamp('MENTIRA?', 760, 1250, prog(t, W_('mentiras') - 0.1, W_('mentiras') + 0.25), { size: 64, rot: -0.1 });
  credit('Foto: Ed Westcott (domínio público)');
}, 'push');
cue(W_('detector') - 0.3, 'scribble'); cue(W_('mentiras'), 'stamp'); shake(W_('mentiras'), 14);

// ---------- M: 1957, oito pedem demissão ----------
scene(P(13).s, (lt, t) => {
  background(t);
  stamp('1957', 540, 300, prog(t, P(13).s, P(13).s + 0.3), { color: C.amber, size: 110, rot: 0.04 });
  // door
  g.save(); g.strokeStyle = '#e7e5e4'; g.lineWidth = 10; rr(120, 620, 260, 520, 8); g.stroke(); g.fillStyle = 'rgba(255,176,32,0.18)'; g.fillRect(126, 626, 248, 508); g.restore();
  const ok = W_('oito'); let n = 0;
  for (let i = 0; i < 8; i++) {
    const st = ok - 0.2 + i * 0.32, k = eio(prog(t, st, st + 0.9)); if (t >= st) n = i + 1;
    if (k <= 0) continue;
    const x = lerp(250, 470 + i * 75, k), y = 1130;
    person(x, y, 0.95, { color: '#f5f5f4', walk: k < 1 ? 1 : 0, ph: t * 10 + i });
  }
  text(String(n), 820, 820, { size: 300, color: C.orange, alpha: n ? 1 : 0, scale: n ? lerp(1.25, 1, eo(prog(t, ok - 0.2 + (n - 1) * 0.32, ok + (n - 1) * 0.32))) : 1, shadow: 30 });
  text('DEMISSÕES', 820, 1000, { size: 46, weight: 800, color: C.sub, alpha: n ? 1 : 0, track: 4 });
}, 'zoom');
cue(P(13).s, 'stamp'); for (let i = 0; i < 8; i++) cue(W_('oito') - 0.2 + i * 0.32, 'tick');

// ---------- N: os oito traidores ----------
scene(P(14).s, (lt, t) => {
  background(t);
  for (let i = 0; i < 8; i++) person(150 + i * 112, 1150, 0.95, { color: '#d6d3d1' });
  const k = prog(t, W_('traidores') - 0.05, W_('traidores') + 0.25);
  if (k > 0) { g.save(); g.globalAlpha = 0.35 * clamp(k * 2); g.fillStyle = '#3a0508'; g.fillRect(0, 0, W, H); g.restore(); }
  stamp('OS 8 TRAIDORES', 540, 700, k, { size: 96, rot: -0.1 });
}, 'cut');
cue(W_('traidores'), 'stamp'); shake(W_('traidores'), 30); flash(W_('traidores'));

// ---------- O: não, não, não... sim ----------
scene(P(15).s, (lt, t) => {
  background(t);
  const st = W_('ouviram'), en = W_('topou');
  for (let i = 0; i < 12; i++) {
    const r = Math.floor(i / 3), c = i % 3, x = 230 + c * 310, y = 520 + r * 230; const last = i === 11;
    const ap = prog(t, st - 0.3 + i * 0.05, st + i * 0.05);
    g.save(); g.globalAlpha = ap; rr(x - 130, y - 90, 260, 180, 16); g.fillStyle = '#1c1917'; g.fill(); g.strokeStyle = '#44403c'; g.lineWidth = 4; g.stroke();
    text('empresa', x, y - 62, { size: 30, weight: 600, font: 'Inter', color: C.sub }); g.restore();
    const sk = last ? prog(t, en - 0.1, en + 0.2) : prog(t, st + 0.3 + i * ((en - st - 0.5) / 11), st + 0.5 + i * ((en - st - 0.5) / 11));
    stamp(last ? 'SIM' : 'NÃO', x, y + 15, sk, { size: 64, color: last ? C.green : C.red, rot: last ? 0.05 : -0.15 });
  }
}, 'push');
{ const st = W_('ouviram'), en = W_('topou'); for (let i = 0; i < 11; i++) cue(st + 0.3 + i * ((en - st - 0.5) / 11), 'thud'); cue(en - 0.1, 'ding'); }

// ---------- P: Fairchild ----------
scene(P(16).s, (lt, t) => {
  background(t, 1);
  const k = prog(t, W_('Fairchild') - 0.2, W_('Fairchild') + 0.25);
  logoCard('l_fairchild', 540, 760, 760, 380, { scale: back(k), alpha: clamp(k * 3), pad: 0.1 });
  for (let i = 0; i < 8; i++) person(190 + i * 100, 1220, 0.7, { color: '#f5f5f4', glow: 0.6 });
  text('NASCIA A', 540, 400, { size: 56, color: C.sub, alpha: prog(t, P(16).s, P(16).s + 0.3), track: 6 });
}, 'zoom');
cue(W_('Fairchild') - 0.1, 'impact'); flash(W_('Fairchild'));

// ---------- Q: primeiros chips ----------
scene(P(17).s, (lt, t) => {
  background(t);
  const k = prog(t, P(17).s, P(17).s + 0.4);
  photo('noyce', 540, 820, 700, 760, { scale: back(k), alpha: clamp(k * 3), rot: 0.025, zoom: lerp(1.0, 1.15, prog(t, P(17).s, P(18).s)), caption: 'Robert Noyce, um dos 8 (1959)' });
  pill('UM DOS PRIMEIROS CHIPS', 540, 1330, { size: 42, scale: back(prog(t, W_('chips', 1) - 0.3, W_('chips', 1))), alpha: prog(t, W_('chips', 1) - 0.3, W_('chips', 1) - 0.1) });
  credit('Foto: Intel Free Press (CC BY-SA 2.0)');
}, 'push');
cue(W_('chips', 1) - 0.3, 'pop');

// ---------- R: árvore de empresas ----------
const NODES = {
  fair: { x: 540, y: 520, key: 'l_fairchild', w: 330, h: 160 },
  intel: { x: 250, y: 900, key: 'l_intel', w: 260, h: 150, t: () => W_('Intel') },
  amd: { x: 830, y: 900, key: 'l_amd', w: 260, h: 150, t: () => W_('AMD') },
  kp: { x: 540, y: 1080, label: 'FUNDO DE INVESTIMENTO', t: () => W_('fundo') },
  goog: { x: 300, y: 1330, key: 'l_google', w: 280, h: 140, t: () => W_('Google', 1) },
  amzn: { x: 780, y: 1330, key: 'l_amazon', w: 280, h: 140, t: () => W_('Amazon') },
};
const EDGES = [['fair', 'intel'], ['fair', 'amd'], ['fair', 'kp'], ['kp', 'goog'], ['kp', 'amzn']];
function tree(t, cam = 1, extraK = 0) {
  g.save(); g.translate(540, 900); g.scale(cam, cam); g.translate(-540, -900);
  for (const [a, b] of EDGES) { const A = NODES[a], B = NODES[b], tb = B.t(); const k = eio(prog(t, tb - 0.5, tb - 0.1)); if (k <= 0) continue;
    g.save(); g.strokeStyle = C.orange; g.lineWidth = 7; g.shadowColor = C.orange; g.shadowBlur = 20; g.beginPath(); g.moveTo(A.x, A.y + 70);
    const mx = lerp(A.x, B.x, k), my = lerp(A.y + 70, B.y - 70, k); g.bezierCurveTo(A.x, (A.y + my) / 2, mx, (A.y + my) / 2, mx, my); g.stroke(); g.restore(); }
  for (const [id, N] of Object.entries(NODES)) {
    const k = N.t ? prog(t, N.t() - 0.15, N.t() + 0.2) : 1; if (k <= 0) continue;
    if (N.key) logoCard(N.key, N.x, N.y, N.w, N.h, { scale: back(k), alpha: clamp(k * 3), pad: 0.14 });
    else pill(N.label, N.x, N.y, { size: 36, fill: '#1c1917', stroke: C.orange, scale: back(k), alpha: clamp(k * 3) });
  }
  // extra explosion nodes
  if (extraK > 0) { const R = rng(7); for (let i = 0; i < 60; i++) { const a = R() * Math.PI * 2, d = 250 + R() * 900, x = 540 + Math.cos(a) * d, y = 900 + Math.sin(a) * d * 1.2;
    const k = back(clamp(extraK * 2.2 - R() * 1.2)); if (k <= 0) continue; g.save(); g.globalAlpha = 0.9; g.strokeStyle = 'rgba(255,106,0,0.35)'; g.lineWidth = 3; g.beginPath(); g.moveTo(540, 900); g.lineTo(lerp(540, x, k), lerp(900, y, k)); g.stroke();
    g.fillStyle = '#1c1917'; g.strokeStyle = C.orange; g.lineWidth = 4; rr(x - 45 * k, y - 28 * k, 90 * k, 56 * k, 10); g.fill(); g.stroke(); g.restore(); } }
  g.restore();
}
scene(P(18).s, (lt, t) => {
  background(t, 1);
  const zoom = lerp(1.25, 1.0, eio(prog(t, P(18).s, P(19).s)));
  tree(t, zoom);
  // Noyce & Moore photo pops near Intel
  const nk = prog(t, W_('Intel') - 0.6, W_('Intel') - 0.2) * (1 - prog(t, W_('AMD') - 0.3, W_('AMD')));
  photo('noyce', 290, 560, 360, 400, { scale: back(nk), alpha: clamp(nk * 3), rot: -0.06, caption: 'Robert Noyce', zoom: 1.1 });
  text('E A HISTÓRIA SE MULTIPLICA', 540, 300, { size: 52, color: C.text, alpha: prog(t, P(18).s, P(18).s + 0.3) * (1 - prog(t, P(19).s, P(19).s + 0.3)) });
  if (t > W_('Intel') - 0.6 && t < W_('AMD')) credit('Foto: Intel Free Press (CC BY-SA 2.0)');
}, 'zoom');
['Intel', 'AMD', 'fundo'].forEach(w => cue(W_(w) - 0.15, 'pop')); cue(W_('Google', 1) - 0.15, 'pop'); cue(W_('Amazon') - 0.15, 'pop'); cue(W_('Intel') - 0.6, 'pop');

// ---------- S: empresa gerando empresa (explosion) ----------
scene(P(22).s, (lt, t) => {
  background(t, 1);
  const k = prog(t, P(22).s, P(24).s);
  tree(t, lerp(1.0, 0.55, eio(k)), k);
}, 'cut');
cue(P(22).s, 'riser');

// ---------- T: pomar -> vale (wipe) ----------
scene(P(24).s, (lt, t) => {
  background(t);
  const k = eio(prog(t, W_('virou', 1) - 0.2, W_('virou', 1) + 0.8));
  cover(IM.orchard, 0, 0, W, H, { zoom: lerp(1.1, 1.25, prog(t, P(24).s, P(25).s)), filter: sepia });
  g.save(); g.beginPath(); g.rect(0, 0, W * k, H); g.clip(); cover(IM.circuit, 0, 0, W, H, { zoom: lerp(1.3, 1.15, prog(t, P(24).s, P(25).s)) }); g.restore();
  g.fillStyle = 'rgba(0,0,0,0.35)'; g.fillRect(0, 0, W, H);
  if (k > 0 && k < 1) { g.strokeStyle = '#fff'; g.lineWidth = 10; g.beginPath(); g.moveTo(W * k, 0); g.lineTo(W * k, H); g.stroke(); }
  text(k < 0.5 ? 'ANTES' : 'HOJE', 540, 360, { size: 150, color: k < 0.5 ? C.paper : C.amber, shadow: 30 });
  credit('Fotos: OSU Special Collections · Unsplash');
}, 'whip');
cue(W_('virou', 1) - 0.2, 'whoosh'); cue(W_('virou', 1) + 0.6, 'impact');

// ---------- U: não nasceu de sol nem de sorte ----------
scene(P(25).s, (lt, t) => {
  background(t);
  const sk = prog(t, W_('sol') - 0.3, W_('sol')), lk = prog(t, W_('sorte') - 0.3, W_('sorte'));
  sun(320, 860, back(sk), t); clover(760, 860, back(lk));
  [[320, W_('sol')], [760, W_('sorte')]].forEach(([x, tt]) => { const k = eio(prog(t, tt + 0.05, tt + 0.3)); if (k > 0) { g.save(); g.strokeStyle = C.red; g.lineWidth = 18; g.lineCap = 'round'; g.beginPath(); g.moveTo(x - 160, 700); g.lineTo(lerp(x - 160, x + 160, k), lerp(700, 1020, k)); g.stroke(); g.restore(); } });
  text('NÃO FOI', 540, 380, { size: 80, color: C.text, alpha: prog(t, P(25).s, P(25).s + 0.3) });
}, 'push');
cue(W_('sol') + 0.05, 'scratch'); cue(W_('sorte') + 0.05, 'scratch');
function sun(x, y, s, t) { if (s <= 0) return; g.save(); g.translate(x, y); g.scale(s, s); g.fillStyle = C.amber; g.shadowColor = C.amber; g.shadowBlur = 40; g.beginPath(); g.arc(0, 0, 80, 0, 7); g.fill(); g.strokeStyle = C.amber; g.lineWidth = 12; g.lineCap = 'round';
  for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2 + t * 0.4; g.beginPath(); g.moveTo(Math.cos(a) * 110, Math.sin(a) * 110); g.lineTo(Math.cos(a) * 150, Math.sin(a) * 150); g.stroke(); } g.restore(); }
function clover(x, y, s) { if (s <= 0) return; g.save(); g.translate(x, y); g.scale(s, s); g.fillStyle = C.green;
  for (let i = 0; i < 4; i++) { g.save(); g.rotate(i * Math.PI / 2); g.beginPath(); g.arc(0, -55, 50, 0, 7); g.fill(); g.restore(); } g.strokeStyle = C.green; g.lineWidth = 14; g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(30, 90, 10, 150); g.stroke(); g.restore(); }

// ---------- V: pessoas com coragem ----------
scene(P(26).s, (lt, t) => {
  background(t, 1);
  const k = eio(prog(t, P(26).s, P(26).s + 1.2));
  for (let i = 0; i < 8; i++) { const x = lerp(540, 150 + i * 112, k); person(x, 1150, 0.95, { color: '#fff7ed', glow: 0.9 }); }
  if (k > 0.9) { g.save(); g.strokeStyle = C.orange; g.lineWidth = 8; g.beginPath(); g.moveTo(150, 1060); g.lineTo(934, 1060); g.stroke(); g.restore(); }
  const ck = prog(t, W_('coragem') - 0.1, W_('coragem') + 0.25);
  text('CORAGEM', 540, 640, { size: 150, color: C.amber, scale: slam(ck), alpha: clamp(ck * 4), shadow: 30 });
  const jk = prog(t, W_('juntas') - 0.2, W_('juntas') + 0.2);
  pill('DE CONSTRUIR JUNTOS', 540, 800, { size: 44, scale: back(jk), alpha: clamp(jk * 3) });
}, 'zoom');
cue(W_('coragem'), 'impact'); cue(W_('juntas') - 0.2, 'pop');

// ---------- W: Brasil + CTA ----------
scene(P(27).s, (lt, t) => {
  background(t, 1);
  cover(IM.circuit2, 0, 0, W, H, { zoom: lerp(1.15, 1.3, prog(t, P(27).s, TOTAL)), filter: 'brightness(0.45) saturate(0.8)' });
  const bk = prog(t, W_('Brasil') - 0.2, W_('Brasil') + 0.25);
  text('UM VALE DO SILÍCIO', 540, 600, { size: 74, color: C.text, alpha: clamp(bk * 3), shadow: 30 });
  text('NO BRASIL', 540, 730, { size: 130, color: C.amber, scale: slam(bk), alpha: clamp(bk * 4), shadow: 30 });
  const qk = prog(t, W_('Silício', 3) - 0.3, W_('Silício', 3) + 0.2);
  text('?', 985, 735, { size: 190, color: C.orange, scale: slam(qk), alpha: clamp(qk * 4), shadow: 30 });
  const ek = prog(t, P(28).e + 0.1, P(28).e + 0.5);
  if (ek > 0) { pill('COMENTA AQUI 👇', 540, 1000, { size: 56, scale: back(ek) });
    if (IM.logo && IM.logo.naturalWidth) { const lw = 560, lh = lw * IM.logo.naturalHeight / IM.logo.naturalWidth; g.save(); g.globalAlpha = ek; g.drawImage(IM.logo, 540 - lw / 2, 1180, lw, lh); g.restore(); }
    text('@pcesar.albuquerque', 540, 1360, { size: 36, weight: 600, font: 'Inter', color: C.sub, alpha: ek }); }
  credit('Foto: Unsplash');
}, 'push');
cue(W_('Brasil') - 0.1, 'impact'); cue(W_('Silício', 3) - 0.2, 'pop'); cue(P(28).e + 0.1, 'riserEnd');

function credit(s) { text(s, 1050, 1880, { size: 20, weight: 500, font: 'Inter', color: 'rgba(255,255,255,0.45)', align: 'right' }); }

// map anchors (set from image inspection)


// ---------- renderer ----------
S.sort((a, b) => a.a - b.a);
const TR = 0.32;
function transform(tr, k, dir) { // k: 0..1 progress of transition; dir: 1 entering, -1 leaving
  const e = eio(k);
  if (tr === 'push') { g.translate(dir === 1 ? (1 - e) * W : -e * W * 0.4, 0); }
  else if (tr === 'zoom') { const s = dir === 1 ? lerp(1.35, 1, e) : lerp(1, 0.85, e); g.translate(540, 900); g.scale(s, s); g.translate(-540, -900); }
  else if (tr === 'whip') { g.translate(dir === 1 ? (1 - e) * W * 1.2 : -e * W * 1.2, 0); }
}
function render(t) {
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.filter = 'none';
  let idx = 0; for (let i = 0; i < S.length; i++) if (S[i].a <= t) idx = i;
  const cur = S[idx], prev = S[idx - 1];
  // shake
  let sx = 0, sy = 0; for (const s of SHAKES) { const d = t - s.t; if (d >= 0 && d < 0.4) { const a = s.amp * Math.exp(-d * 9); sx += Math.sin(d * 90) * a; sy += Math.cos(d * 77) * a; } }
  const k = (t - cur.a) / TR;
  g.save(); g.translate(sx, sy);
  if (prev && k < 1 && cur.tr !== 'cut') {
    g.save(); transform(cur.tr, k, -1); prev.draw(t - prev.a, t); g.restore();
    g.save(); transform(cur.tr, k, 1); if (cur.tr === 'whip') { g.globalAlpha = 1; } cur.draw(t - cur.a, t); g.restore();
    if (cur.tr === 'whip') { g.save(); g.globalAlpha = 0.5 * Math.sin(k * Math.PI); g.filter = 'blur(18px)'; g.drawImage(cv, 0, 0); g.restore(); }
  } else { cur.draw(t - cur.a, t); }
  g.restore();
  captions(t);
  for (const f of FLASHES) { const d = t - f; if (d >= 0 && d < 0.15) { g.fillStyle = `rgba(255,255,255,${0.55 * (1 - d / 0.15)})`; g.fillRect(0, 0, W, H); } }
  finish(t, TOTAL);
}
window.render = render; window.CUES = CUES; window.TOTAL = TOTAL;
