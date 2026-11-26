// usage: node render2.js <timeline.js> <out.mp4|still.png> [times|from to] ; env AUDIO, IMGDIR, LOGO
const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path'); const { spawn } = require('child_process');
const [,, tl, out, a1, a2] = process.argv;
(async () => {
  const imgs = {}; const dir = process.env.IMGDIR || 'img';
  for (const f of fs.readdirSync(dir)) { const k = path.parse(f).name; const ext0 = path.extname(f).slice(1).toLowerCase(); const ext = ext0 === 'svg' ? 'svg+xml' : ext0.replace('jpg', 'jpeg');
    if (fs.statSync(path.join(dir, f)).size > 4000 || ext0 === 'svg') imgs[k] = `data:image/${ext};base64,` + fs.readFileSync(path.join(dir, f)).toString('base64'); }
  if (process.env.LOGO) imgs.logo = 'data:image/png;base64,' + fs.readFileSync(process.env.LOGO).toString('base64');
  const html = `<!doctype html><html><body style="margin:0;background:#000"><canvas id="c"></canvas>
  <script>window.TIMING=${fs.readFileSync('timing.json', 'utf8')};window.IMGS=${JSON.stringify(imgs)};</script>
  <script>${fs.readFileSync('motor2.js', 'utf8')}</script><script>${fs.readFileSync(tl, 'utf8')}</script></body></html>`;
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  let err = null; p.on('pageerror', e => { err = e.message; console.error('PAGEERR', e.message); });
  await p.setContent(html, { timeout: 120000 });
  await p.evaluate(async () => { await document.fonts.load('900 40px Poppins'); await document.fonts.load('800 40px Poppins'); await document.fonts.load('700 40px Poppins'); await document.fonts.load('600 40px Inter'); await document.fonts.load('500 40px Inter'); });
  await p.waitForFunction(() => window.imagesReady && window.imagesReady(), null, { timeout: 120000 });
  if (err) { await b.close(); process.exit(1); }
  fs.writeFileSync('cues.json', JSON.stringify(await p.evaluate(() => window.CUES)));
  const total = await p.evaluate(() => window.TOTAL);
  const grab = async (t, fmt) => { const d = await p.evaluate(([t, fmt]) => { render(t); return document.getElementById('c').toDataURL(fmt, 0.95); }, [t, fmt]); if (err) throw new Error(err); return Buffer.from(d.split(',')[1], 'base64'); };
  if (out.endsWith('.png')) { for (const t of a1.split(',')) fs.writeFileSync(out.replace('.png', `_${t}.png`), await grab(+t, 'image/png')); await b.close(); return; }
  const from = a1 ? +a1 : 0, to = a2 ? +a2 : total, fps = 30;
  const ff = spawn('ffmpeg', ['-v', 'error', '-y', '-f', 'image2pipe', '-framerate', String(fps), '-i', '-', '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  for (let f = Math.round(from * fps); f < Math.round(to * fps); f++) { const buf = await grab(f / fps, 'image/jpeg'); if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r)); }
  ff.stdin.end(); await new Promise(r => ff.on('close', r)); await b.close();
})().catch(e => { console.error(e); process.exit(1); });
