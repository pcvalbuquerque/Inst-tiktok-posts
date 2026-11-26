"""Align a known script to narration using pauses (silencedetect) + syllable-duration DP.
usage: python3 align.py script.txt audio.mp3 out.json"""
import sys, re, json, math, subprocess
script, audio, out = sys.argv[1:4]
text = open(script, encoding="utf-8").read()
dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", audio],
                           capture_output=True, text=True).stdout)
log = subprocess.run(["ffmpeg", "-hide_banner", "-i", audio, "-af", "silencedetect=noise=-35dB:d=0.16", "-f", "null", "-"],
                     capture_output=True, text=True).stderr
st = [float(x) for x in re.findall(r"silence_start: ([\d.]+)", log)]
en = [float(x) for x in re.findall(r"silence_end: ([\d.]+)", log)]
segs, cur = [], 0.0
for a, b in zip(st, en):
    if a - cur > 0.05: segs.append((cur, a, b - a))  # (start, end, pause after)
    cur = b
if dur - cur > 0.15: segs.append((cur, dur, 0))
# units: split on punctuation, keep trailing punct
words = text.split()
units, buf = [], []
for w in words:
    buf.append(w)
    if re.search(r"[,.?!:;]$", w): units.append(buf); buf = []
if buf: units.append(buf)
def syl(w):
    w = re.sub(r"[^a-záéíóúâêôãõçà0-9]", "", w.lower())
    if w.isdigit(): return {4: 8}.get(len(w), 2 * len(w))  # 1956 ~ "mil novecentos e cinquenta e seis"
    return max(1, len(re.findall(r"[aeiouáéíóúâêôãõà]+", w)))
usyl = [sum(syl(w) for w in u) for u in units]
rate = sum(e - s for s, e, _ in segs) / sum(usyl)
end_kind = lambda u: 2 if re.search(r"[.?!]$", u[-1]) else (1 if re.search(r"[,:;]$", u[-1]) else 0)
N, M = len(units), len(segs)
INF = 1e18
dp = [[INF] * (M + 1) for _ in range(N + 1)]; bk = [[None] * (M + 1) for _ in range(N + 1)]
dp[0][0] = 0
for i in range(N + 1):
    for j in range(M + 1):
        if dp[i][j] >= INF: continue
        for k in range(1, 5):
            for m in range(1, 4):
                if i + k > N or j + m > M: continue
                sy = sum(usyl[i:i + k]); d = segs[j + m - 1][1] - segs[j][0]
                c = math.log(d / (sy * rate)) ** 2 * 4
                c += sum(0.9 if end_kind(units[i + q]) == 2 else 0.25 for q in range(k - 1))  # pause expected at sentence ends
                c += 0.35 * (m - 1)  # splitting a unit across a pause
                if dp[i][j] + c < dp[i + k][j + m]: dp[i + k][j + m] = dp[i][j] + c; bk[i + k][j + m] = (i, j)
i, j, groups = N, M, []
while i > 0:
    pi, pj = bk[i][j]; groups.append((pi, i, pj, j)); i, j = pi, pj
groups.reverse()
res, phr = [], []
for (a, b, c, d) in groups:
    s0, s1 = segs[c][0], segs[d - 1][1]
    toks = [w for u in units[a:b] for w in u]
    wts = [syl(t) + (0.5 if re.search(r"[,:;]$", t) else 0) for t in toks]
    tot = sum(wts); t = s0
    for tok, wt in zip(toks, wts):
        dd = (s1 - s0) * wt / tot; res.append({"w": tok, "s": round(t, 3), "e": round(t + dd, 3), "p": len(phr)}); t += dd
    phr.append({"t": " ".join(toks), "s": round(s0, 3), "e": round(s1, 3)})
json.dump({"words": res, "phrases": phr, "duration": dur}, open(out, "w"), ensure_ascii=False, indent=1)
for p in phr: print(f'{p["s"]:7.2f}-{p["e"]:7.2f}  {p["t"]}')
print("cost", round(dp[N][M], 2), "segs", M, "units", N)
