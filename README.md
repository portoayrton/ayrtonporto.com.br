# Ayrton Porto — Portfólio (site)

Site estático com a mesma estética e as mesmas animações do AP.STUDIO (GSAP + ScrollTrigger + Lenis),
com os trabalhos do portfólio: Encantados, SPFW 2026, Parintins de cima, Festival de Parintins,
CasaCor SP 2025, Pelmex+ e Maiori Casa.

## Rodar localmente
```bash
cd portfolio-site && python3 -m http.server 8080
```
Abra http://localhost:8080

## Arquivo único para enviar
`python3 build-single.py` gera `../Portfolio - Ayrton Porto (site).html`: o site inteiro num arquivo só
(páginas, CSS, JS, logo e clipes curtos de 12 s embutidos). Abre com dois cliques; precisa de internet
só para a fonte e as animações (GSAP/Lenis). Os clipes ficam em `build/clips/`.

## Onde editar
| O quê | Arquivo |
|---|---|
| Projetos (título, cliente, função, vídeo, link do Instagram, imagens da página) | `data/projects.js` |
| Showreel do topo | `assets/video/reel.mp4` |
| Clientes do letreiro | `AP_CLIENTS` em `data/projects.js` |
| Menu, contato (WhatsApp/e-mail), rodapé | `js/render.js` |
| Cores, fonte e layout | `css/style.css` |
| Animações | `js/main.js` |
| Textos da home / sobre | `index.html`, `sobre.html` |

Vídeos completos (720p) em `assets/video/`. O formulário de contato abre o WhatsApp com a mensagem pronta.
