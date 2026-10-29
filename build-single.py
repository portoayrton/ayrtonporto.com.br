"""Gera "Portfolio - Ayrton Porto (site).html": o site inteiro num arquivo único para enviar.

As 4 páginas viram uma só (a navegação usa ?p=trabalhos, ?p=sobre, ?p=projeto&slug=...).
CSS, JS, dados, logo e vídeos curtos (build/clips) vão embutidos. Fontes, GSAP e Lenis
continuam vindo da internet. Rode da pasta do projeto:  python3 build-single.py
"""
import base64, re

OUT = "../Portfolio - Ayrton Porto (site).html"
PAGES = {"home": "index.html", "trabalhos": "trabalhos.html", "sobre": "sobre.html", "projeto": "projeto.html"}
CLIPS = ["reel"] + re.findall(r'slug: "([\w-]+)"', open("data/projects.js", encoding="utf-8").read())


def b64(path):
    return base64.b64encode(open(path, "rb").read()).decode()


def read(path):
    return open(path, encoding="utf-8").read()


# Links entre páginas viram ?p=...
def links(s):
    s = s.replace("projeto.html?slug=", "?p=projeto&slug=")
    s = s.replace('"index.html#servicos"', '(page === "home" ? "#servicos" : "?p=home#servicos")')
    for name, file in PAGES.items():
        s = s.replace(f'"{file}"', f'"?p={name}"')
    return s


# Vídeos locais: no arquivo único cada projeto é um clipe curto que começa 1 s antes do "start"
def clips(s):
    s = re.sub(r'assets/video/([\w-]+)\.mp4(#t=[\d.]+)?', lambda m: f'@@V:{m.group(1)}@@#t=1', s)
    return re.sub(r'data-start="[\d.]+"', 'data-start="1"', s)


templates = ""
for name, file in PAGES.items():
    main = re.search(r"<main[^>]*>.*?</main>", read(file), re.S).group(0)
    templates += f'<template id="page-{name}">{clips(links(main))}</template>\n'

css = read("css/style.css").replace("url(../assets/logo.png)", f'url("data:image/png;base64,{b64("assets/logo.png")}")')

data = read("data/projects.js")
data = data.replace("const v = (slug) => `assets/video/${slug}.mp4`;", "const v = (slug) => window.AP_VIDEO[slug];")
data = re.sub(r"start: [\d.]+,", "start: 1,", data)
render = links(read("js/render.js"))
main_js = read("js/main.js")
for name, code in [("data", data), ("render", render), ("main", main_js)]:
    assert "</script" not in code, name

videos = ",\n".join(f'"{c}": "{b64(f"build/clips/{c}.mp4")}"' for c in CLIPS)

boot = """
// Escolhe a página pelo ?p= e transforma os vídeos embutidos em blob URLs
(() => {
  const B = {%s};
  window.AP_VIDEO = {};
  for (const [k, s] of Object.entries(B)) {
    const bin = atob(s), u = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
    window.AP_VIDEO[k] = URL.createObjectURL(new Blob([u], { type: "video/mp4" }));
  }
  const p = new URLSearchParams(location.search).get("p") || "home";
  const page = document.getElementById("page-" + p) ? p : "home";
  document.body.dataset.page = page;
  const html = document.getElementById("page-" + page).innerHTML.replace(/@@V:([\\w-]+)@@/g, (_, k) => window.AP_VIDEO[k]);
  document.getElementById("main-slot").outerHTML = html;
  const titles = { home: "ap.films — Filmmaker", trabalhos: "Trabalhos — ap.films", sobre: "Sobre — ap.films" };
  if (titles[page]) document.title = titles[page];
})();
""" % videos

home_head = re.search(r"<head>.*?</head>", read("index.html"), re.S).group(0)
home_head = re.sub(r'<link rel="stylesheet" href="css/style\.css[^"]*">', lambda m: f"<style>\n{css}\n</style>", home_head)
home_head = home_head.replace('href="assets/favicon.png"', f'href="data:image/png;base64,{b64("assets/favicon.png")}"')

html = f"""<!doctype html>
<html lang="pt-BR">
{home_head}
<body>
  <div class="curtain" aria-hidden="true"><span class="brand"></span></div>
{templates}
  <div id="main-slot"></div>
  <script>{boot}</script>
  <script>{data}</script>
  <script>{render}</script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>
  <script src="https://unpkg.com/lenis@1.1.13/dist/lenis.min.js"></script>
  <script>(() => {{ const r = document.getElementById("heroReel"); if (r) r.src = window.AP_REEL; }})();</script>
  <script>{main_js}</script>
</body>
</html>
"""
assert 'href="css/' not in html and 'src="js/' not in html and 'src="assets/video/' not in html
open(OUT, "w", encoding="utf-8").write(html)
print(f"{OUT} gerado ({len(html.encode()) // 1024} KB)")
