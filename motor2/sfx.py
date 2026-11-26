"""Synthesize SFX track + music bed from cues.json. usage: sfx.py cues.json total_seconds out_sfx.wav out_music.wav"""
import json, sys, wave, numpy as np
SR = 44100
cues = json.load(open(sys.argv[1])); total = float(sys.argv[2])
N = int(total * SR) + SR
rs = np.random.RandomState(3)
def env(n, a=0.005, r=None):
    t = np.arange(n) / SR; e = np.minimum(1, t / a)
    return e * np.exp(-t / (r if r else n / SR / 4))
def noise(n): return rs.randn(n)
def bandsweep(x, f0, f1):  # crude moving 1-pole lowpass/highpass sweep -> whoosh
    y = np.zeros_like(x); lp = 0; hp = 0; prev = 0
    for i in range(len(x)):
        f = f0 + (f1 - f0) * (i / len(x)); a = min(0.99, 2 * np.pi * f / SR)
        lp += a * (x[i] - lp); y[i] = lp
    return y
def sine(f, n, f2=None):
    t = np.arange(n) / SR; ff = f if f2 is None else np.linspace(f, f2, n)
    return np.sin(2 * np.pi * np.cumsum(ff) / SR) if f2 is not None else np.sin(2 * np.pi * f * t)
def whoosh():
    n = int(0.45 * SR); x = bandsweep(noise(n), 300, 4000) ; w = np.hanning(n) ** 1.5
    return x * w * 0.9
def pop():
    n = int(0.12 * SR); return sine(900, n, 300) * env(n, 0.002, 0.03) * 0.5
def blip():
    n = int(0.08 * SR); return sine(1400, n) * env(n, 0.001, 0.02) * 0.25
def tick():
    n = int(0.05 * SR); return (sine(2400, n) * 0.4 + noise(n) * 0.2) * env(n, 0.0005, 0.008) * 0.6
def impact():
    n = int(1.2 * SR); low = sine(70, n, 38) * env(n, 0.002, 0.35)
    hit = bandsweep(noise(n), 3000, 200) * env(n, 0.001, 0.08)
    return (low * 1.0 + hit * 0.6) * 0.9
def stamp():
    n = int(0.5 * SR); thud = sine(110, n, 55) * env(n, 0.001, 0.09); crack = noise(n) * env(n, 0.0005, 0.02)
    return (thud * 0.9 + crack * 0.5) * 0.9
def thud():
    n = int(0.25 * SR); return (sine(140, n, 70) * env(n, 0.001, 0.05) + noise(n) * env(n, 0.0005, 0.01) * 0.3) * 0.55
def ding():
    n = int(1.0 * SR); t = np.arange(n) / SR
    return (np.sin(2 * np.pi * 1318 * t) + 0.5 * np.sin(2 * np.pi * 2637 * t)) * env(n, 0.002, 0.3) * 0.22
def glitch():
    n = int(0.35 * SR); x = np.sign(sine(180, n)) * 0.3 + noise(n) * 0.3
    gate = (np.floor(np.arange(n) / (SR * 0.025)) % 2); return x * gate * env(n, 0.001, 0.15) * 0.5
def scribble():
    n = int(1.6 * SR); x = bandsweep(noise(n), 2500, 2500) * (0.5 + 0.5 * np.sin(np.arange(n) / SR * 2 * np.pi * 9) ** 2)
    return x * np.hanning(n) * 0.25
def scratch():
    n = int(0.3 * SR); return bandsweep(noise(n), 1200, 5000) * np.hanning(n) * 0.6
def riser():
    n = int(2.2 * SR); t = np.arange(n) / SR
    x = bandsweep(noise(n), 300, 6000) * (t / t[-1]) ** 2 + sine(200, n, 900) * 0.15 * (t / t[-1]) ** 2
    return x * 0.6
def riserEnd():
    return impact() * 0.8
FX = dict(whoosh=whoosh, pop=pop, blip=blip, tick=tick, impact=impact, stamp=stamp, thud=thud, ding=ding, glitch=glitch,
          scribble=scribble, scratch=scratch, riser=riser, riserEnd=riserEnd)
cache = {}
sfx = np.zeros(N)
GAIN = dict(whoosh=0.35, pop=0.5, blip=0.4, tick=0.45, impact=0.6, stamp=0.65, thud=0.5, ding=0.45, glitch=0.4, scribble=0.5, scratch=0.5, riser=0.45, riserEnd=0.55)
for c in cues:
    if c['type'] not in cache: cache[c['type']] = FX[c['type']]()
    s = cache[c['type']]; st = int(c['t'] * SR)
    if c['type'] == 'whoosh': st -= int(0.18 * SR)
    if c['type'] == 'riser': st = max(0, st - 0)
    st = max(0, st); e = min(N, st + len(s)); sfx[st:e] += s[:e - st] * GAIN[c['type']]
# music bed: Am F C G pad + soft pulse, 92 bpm
t = np.arange(N) / SR
chords = [[220.0, 261.63, 329.63], [174.61, 220.0, 261.63], [130.81, 196.0, 261.63], [196.0, 246.94, 293.66]]
bar = 60 / 92 * 4; mus = np.zeros(N)
for i, ch in enumerate(chords * int(total / bar / 4 + 2)):
    st = int(i * bar * SR); n = int(bar * SR);
    if st >= N: break
    e = min(N, st + n); tt = np.arange(e - st) / SR
    seg = sum(np.sin(2 * np.pi * f / 2 * tt) * 0.5 + np.sin(2 * np.pi * f * tt + 0.3) * 0.25 for f in ch)
    fade = np.minimum(1, tt / 0.4) * np.minimum(1, (bar - tt) / 0.4)
    mus[st:e] += seg * fade
beat = 60 / 92; pulse = np.zeros(N); kick = sine(55, int(0.3 * SR), 40) * env(int(0.3 * SR), 0.002, 0.12)
for k in range(int(total / beat) + 1):
    st = int(k * beat * SR); e = min(N, st + len(kick)); pulse[st:e] += kick[:e - st]
lfo = 0.75 + 0.25 * np.sin(2 * np.pi * t / beat)
mus = mus * lfo * 0.05 + pulse * 0.12
mus[-int(2 * SR):] *= np.linspace(1, 0, int(2 * SR))
def save(fn, x):
    x = np.clip(x, -1, 1); w = wave.open(fn, 'w'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((x * 32000).astype(np.int16).tobytes()); w.close()
save(sys.argv[3], sfx * 0.8); save(sys.argv[4], mus)
print('ok', len(cues), 'cues')
