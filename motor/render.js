const { chromium } = require('playwright');
const fs = require('fs'); const { spawn } = require('child_process');
const [,, outFile, fromS, toS, step] = process.argv;
(async () => {
  const timing = fs.readFileSync('timing.json', 'utf8');
  const logo = fs.readFileSync(process.env.LOGO).toString('base64');
  const html = `<!doctype html><html><body style="margin:0;background:#000">
  <img id="logo" src="data:image/png;base64,${logo}" style="display:none">
  <canvas id="c"></canvas>
  <div style="font-family:Poppins;font-weight:700;position:absolute;opacity:0">aA</div>
  <div style="font-family:Inter;font-weight:600;position:absolute;opacity:0">aA</div>
  <script>window.TIMING=${timing};</script><script>${fs.readFileSync('scene.js','utf8')}</script></body></html>`;
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  p.on('pageerror', e => { console.error('PAGEERR', e.message); process.exit(1); });
  await p.setContent(html); await p.evaluate(() => document.fonts.ready);
  await p.evaluate(async () => { await document.fonts.load('700 40px Poppins'); await document.fonts.load('600 40px Inter'); });
  if (outFile.endsWith('.png')) { // stills: comma list of times
    for (const t of fromS.split(',')) { const d = await p.evaluate(t => { if (t === 'cover') renderCover(); else render(+t); return document.getElementById('c').toDataURL('image/png'); }, t);
      fs.writeFileSync(outFile.replace('.png', `_${t}.png`), Buffer.from(d.split(',')[1], 'base64')); }
    await b.close(); return; }
  const fps = 30, a = +fromS, z = +toS;
  const ff = spawn('ffmpeg', ['-v','error','-y','-f','image2pipe','-framerate',String(fps),'-i','-','-i','audio.mp3',
    '-af','apad','-t',String(z - a),'-c:v','libx264','-preset','medium','-crf','18','-pix_fmt','yuv420p','-c:a','aac','-b:a','192k','-movflags','+faststart',outFile], { stdio: ['pipe','inherit','inherit'] });
  for (let f = Math.round(a * fps); f < Math.round(z * fps); f++) {
    const d = await p.evaluate(t => { render(t); return document.getElementById('c').toDataURL('image/jpeg', 0.95); }, f / fps);
    if (!ff.stdin.write(Buffer.from(d.split(',')[1], 'base64'))) await new Promise(r => ff.stdin.once('drain', r));
  }
  ff.stdin.end(); await new Promise(r => ff.on('close', r)); await b.close();
})();
