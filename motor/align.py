import json, re
PHRASES = [
 "Seu cliente não acha você caro.",
 "Ele acha você igual.",
 "Olha essa prateleira.",
 "Mesmo produto, mesma embalagem, mesma promessa.",
 "Quando tudo parece igual, sobra um único jeito de escolher:",
 "o preço.",
 "E aí começa a guerra do desconto.",
 "Você baixa, o concorrente baixa,",
 "e no fim ninguém lucra.",
 "Agora repara.",
 "Quando um aparece diferente, a etiqueta para de importar.",
 "O cliente não pergunta mais quanto custa.",
 "Pergunta como compra.",
 "Ser diferente não é ser mais caro.",
 "É deixar de ser comparável.",
 "E o seu negócio?",
 "Tá na prateleira ou fora dela?",
 "Comenta aqui.",
]
SEG = [(0.03,1.97),(2.25,3.75),(4.27,5.11),(5.53,8.56),(8.99,12.02),(12.45,12.98),
 (13.35,15.15),(15.39,17.25),(17.58,18.95),(19.35,20.06),(20.44,23.57),(23.88,25.72),
 (25.97,27.24),(27.59,29.52),(29.79,31.24),(31.61,32.33),(32.63,34.14),(34.49,35.05)]
def syl(w):
    w = re.sub(r"[^a-záéíóúâêôãõçà]", "", w.lower())
    n = len(re.findall(r"[aeiouáéíóúâêôãõà]+", w))
    return max(1, n)
words = []
for pi, (ph, (a, b)) in enumerate(zip(PHRASES, SEG)):
    toks = ph.split()
    wts = [syl(t) + (0.6 if re.search(r"[,:]$", t) else 0) for t in toks]
    tot = sum(wts); t = a
    for tok, wt in zip(toks, wts):
        d = (b - a) * wt / tot
        words.append({"w": tok, "s": round(t, 3), "e": round(t + d, 3), "p": pi})
        t += d
json.dump({"words": words, "phrases": [{"t": p, "s": s[0], "e": s[1]} for p, s in zip(PHRASES, SEG)]},
          open("timing.json", "w"), ensure_ascii=False, indent=1)
print(len(words), words[:3])
