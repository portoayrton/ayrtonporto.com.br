/* Ayrton Porto — monta o layout compartilhado e os blocos que vêm de data/projects.js */
(() => {
  const P = window.AP_PROJECTS || [];
  const page = document.body.dataset.page;
  const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const vid = (p, extra = "") =>
    `<video muted playsinline loop preload="metadata" src="${p.video}#t=${p.start || 0}" data-start="${p.start || 0}" ${extra}></video>`;

  const NAV = [
    ["Trabalhos", "trabalhos.html", "trabalhos"],
    ["Serviços", "index.html#servicos", "servicos"],
    ["Sobre", "sobre.html", "sobre"],
    ["Contato", "#contato", "contato"]
  ];

  /* ---------- Layered heading ---------- */
  window.APLayered = (text, tag = "h2", cls = "") => {
    const ghosts = ["up2", "up", "down", "down2"]
      .map((g) => `<${tag} class="layered__word layered__ghost ${g}" aria-hidden="true">${text}</${tag}>`)
      .join("");
    return `<div class="layered ${cls}" data-layered>${ghosts}<${tag} class="layered__word layered__main">${text}</${tag}></div>`;
  };
  document.querySelectorAll("[data-layered-text]").forEach((el) => {
    el.outerHTML = window.APLayered(el.dataset.layeredText, el.dataset.tag || "h2", el.className);
  });

  /* ---------- Logo da cortina em SVG (para o trim path) ---------- */
  const curtainLogo = document.querySelector(".curtain .brand");
  if (curtainLogo) curtainLogo.outerHTML = `
    <svg class="brand-draw" viewBox="0 0 1892 786" aria-hidden="true">
      <path class="brand-draw__s" d="M750 105.5H375A303.5 303.5 0 0 0 375 712.5A303.5 303.5 0 0 0 375 105.5"/>
      <path class="brand-draw__a" d="M1195 712.5A303.5 303.5 0 0 1 1195 105.5A303.5 303.5 0 0 1 1195 712.5H1891"/>
      <circle class="brand-draw__dot" cx="1659.5" cy="88.5" r="87.5"/>
    </svg>`;

  /* ---------- Header ---------- */
  const header = document.createElement("header");
  header.className = "nav";
  header.innerHTML = `
    <a href="index.html" class="nav__logo" aria-label="ap.films — início"><span class="brand"></span></a>
    <nav class="nav__links">${NAV.map(([l, h, k]) => `<a href="${h}" class="${k === page ? "is-active" : ""}">${l}</a>`).join("")}</nav>
    <button class="nav__burger" aria-label="Abrir menu"><span></span><span></span></button>`;
  document.body.prepend(header);
  header.querySelector(".nav__burger").addEventListener("click", () => document.body.classList.toggle("menu-open"));
  header.querySelectorAll(".nav__links a").forEach((a) => a.addEventListener("click", () => document.body.classList.remove("menu-open")));

  /* ---------- Contato + footer ---------- */
  const contactHTML = `
  <section class="section section-primary contact" id="contato">
    <div class="container contact__grid">
      <div>
        <div class="caps" data-reveal>Contato</div>
        <h2 data-split>Toda história começa com uma conversa</h2>
        <p data-reveal>Me conta o seu projeto — vamos criar algo que fica.</p>
        <a class="btn-bracket" href="https://wa.me/5592984669043" target="_blank" rel="noopener" data-reveal>Chamar no WhatsApp</a>
        <p data-reveal style="margin-top:28px">WhatsApp (92) 98466-9043<br><a href="mailto:ayrtonporto@me.com">ayrtonporto@me.com</a> · <a href="https://www.instagram.com/ayrtonporto/" target="_blank" rel="noopener">@ayrtonporto</a></p>
      </div>
      <form class="form" data-reveal>
        <div class="field"><label for="f-nome">Nome *</label><input id="f-nome" required placeholder="Seu nome"></div>
        <div class="field"><label for="f-email">Email *</label><input id="f-email" type="email" required placeholder="voce@email.com"></div>
        <div class="field"><label for="f-tipo">Tipo de projeto *</label>
          <select id="f-tipo" required><option value="">Selecione…</option>${(window.AP_CATEGORIES || []).map((c) => `<option>${c}</option>`).join("")}<option>Outro</option></select></div>
        <div class="field"><label for="f-msg">Mensagem *</label><textarea id="f-msg" rows="3" required placeholder="Prazo, orçamento, referências…"></textarea></div>
        <div class="form__foot"><button class="btn-solid" type="submit">Enviar pelo WhatsApp</button></div>
        <p class="form__ok">Abrindo o WhatsApp com a sua mensagem…</p>
      </form>
    </div>
  </section>`;

  const icons = {
    instagram: '<svg viewBox="0 0 24 24"><path d="M12 2.2c3.2 0 3.6 0 4.8.1 3.3.1 4.8 1.7 4.9 4.9.1 1.3.1 1.6.1 4.8s0 3.6-.1 4.8c-.1 3.2-1.7 4.8-4.9 4.9-1.3.1-1.6.1-4.8.1s-3.6 0-4.8-.1c-3.3-.1-4.8-1.7-4.9-4.9C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.8C2.4 3.9 3.9 2.4 7.2 2.3 8.4 2.2 8.8 2.2 12 2.2zm0 4.8a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0 8.2a3.2 3.2 0 1 1 0-6.4 3.2 3.2 0 0 1 0 6.4zm5.2-9.6a1.2 1.2 0 1 0 0 2.4 1.2 1.2 0 0 0 0-2.4z"/></svg>',
    vimeo: '<svg viewBox="0 0 24 24"><path d="M23 7.2c-.1 2.1-1.6 5-4.5 8.8-3 3.9-5.5 5.8-7.6 5.8-1.3 0-2.4-1.2-3.3-3.6L5.8 11.6C5.1 9.2 4.4 8 3.7 8c-.2 0-.7.3-1.6 1L1 7.6l3-2.7c1.4-1.2 2.4-1.8 3-1.8 1.6-.2 2.6.9 3 3.3.4 2.6.7 4.2.8 4.8.5 2.1 1 3.2 1.6 3.2.4 0 1.1-.7 2-2.1.9-1.4 1.4-2.5 1.5-3.3.1-1.2-.3-1.8-1.5-1.8-.5 0-1.1.1-1.6.4 1.1-3.5 3.1-5.2 6.2-5.1 2.2.1 3.3 1.5 3.2 4.3z"/></svg>',
    youtube: '<svg viewBox="0 0 24 24"><path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8zM9.6 15.6V8.4l6.2 3.6-6.2 3.6z"/></svg>',
    tiktok: '<svg viewBox="0 0 24 24"><path d="M19.6 6.7a4.8 4.8 0 0 1-3.8-4.2V2h-3.4v13.7a2.9 2.9 0 1 1-2-2.7V9.5a6.3 6.3 0 1 0 5.4 6.2V8.8a8.2 8.2 0 0 0 4.8 1.5V6.9l-1-.2z"/></svg>'
  };

  const footerHTML = `
  <footer class="footer">
    <div class="container">
      <div class="footer__top">
        <a href="index.html" class="nav__logo" aria-label="ap.films — início"><span class="brand"></span></a>
        <div class="footer__links">${NAV.map(([l, h]) => `<a href="${h}">${l}</a>`).join("")}</div>
      </div>
      <div class="footer__meta">
        <span>© ${new Date().getFullYear()} ap.films — FILMMAKER</span>
        <a href="mailto:ayrtonporto@me.com">ayrtonporto@me.com</a>
        <div class="socials">
          <a href="https://www.instagram.com/ayrtonporto/" target="_blank" rel="noopener" aria-label="instagram">${icons.instagram}</a>
        </div>
      </div>
      <div class="footer__big"><div class="brandword" aria-label="ap.films"><span class="brandword__w">ap</span><span class="brandword__dot"></span><span class="brandword__w">films</span></div></div>
    </div>
  </footer>`;

  const main = document.querySelector("main");
  if (document.body.dataset.contact !== "off") main.insertAdjacentHTML("beforeend", contactHTML);
  main.insertAdjacentHTML("afterend", footerHTML);

  /* ap.films do rodapé: ajusta o tamanho para a tinta das letras ir de uma borda à outra */
  const big = document.querySelector(".footer__big .brandword");
  if (big) {
    const ctx = document.createElement("canvas").getContext("2d");
    const fit = () => {
      const W = document.documentElement.clientWidth;
      const family = getComputedStyle(big).fontFamily;
      let fs = parseFloat(getComputedStyle(big).fontSize);
      for (let i = 0; i < 3; i++) {
        ctx.font = `900 ${fs}px ${family}`;
        const a = ctx.measureText("ap"), f = ctx.measureText("films");
        const left = -a.actualBoundingBoxLeft, right = f.width - f.actualBoundingBoxRight;
        const ink = big.getBoundingClientRect().width - left - right;
        fs = fs * W / ink;
        big.style.fontSize = fs + "px";
        big.style.marginLeft = -left + "px";
      }
      ctx.font = `900 ${fs}px ${family}`;
      const m = ctx.measureText("as");
      // a base das letras encosta na borda de baixo da página (a perna do "p" sai pela borda)
      const baseline = (fs + m.fontBoundingBoxAscent - m.fontBoundingBoxDescent) / 2;
      const inkBottom = baseline + m.actualBoundingBoxDescent;
      big.style.marginBottom = -(big.getBoundingClientRect().height - inkBottom) + "px";
    };
    (document.fonts ? document.fonts.ready : Promise.resolve()).then(fit);
    window.addEventListener("resize", fit);
  }

  document.body.insertAdjacentHTML(
    "beforeend",
    `<div class="pv" role="dialog" aria-modal="true" aria-label="Projeto" aria-hidden="true">
       <div class="pv__bg"></div>
       <div class="pv__media"><video playsinline loop muted preload="auto"></video>
         <button class="pv__sound" type="button" aria-pressed="false">Ativar som</button></div>
       <aside class="pv__info">
         <button class="pv__close btn-bracket" type="button">Fechar</button>
         <div class="pv__cat pv-in"></div>
         <h2 class="pv__title pv-in"></h2>
         <dl class="pv__facts pv-in"></dl>
         <p class="pv__desc pv-in"></p>
         <div class="pv__actions pv-in">
           <a class="ig-btn ig-btn--big" target="_blank" rel="noopener">${icons.instagram}<span>Ver no Instagram</span></a>
           <a class="pv__page btn-bracket" href="#">Página do projeto</a>
         </div>
       </aside>
     </div>
     <div class="cursor" aria-hidden="true"></div>
     <div class="modal" role="dialog" aria-modal="true" aria-label="Showreel">
       <button class="modal__close btn-bracket">Fechar</button>
       <video controls playsinline></video>
     </div>`
  );

  /* ---------- Home: destaques ---------- */
  const features = document.getElementById("features");
  if (features) {
    features.innerHTML = P.filter((p) => p.featured)
      .map(
        (p) => `
      <article class="feature" data-slug="${p.slug}" tabindex="0" role="button" aria-label="Abrir ${esc(p.title)}">
        <div class="media" data-autoplay>${vid(p, 'data-parallax-media')}</div>
        <div class="feature__body">
          <div class="feature__award"><b>${p.year}</b>${p.award ? `<i></i><span>${esc(p.award)}</span>` : ""}</div>
          <div class="feature__quotes">${p.quotes
            .map((q) => `<div class="quote"><div class="stars">★★★★★</div><p>${esc(q.text)}</p><small>${esc(q.source).toUpperCase()}</small></div>`)
            .join("")}</div>
          <div class="feature__info">
            <div class="feature__cat">${esc(p.category)}</div>
            <h3 class="feature__title">${esc(p.title)}</h3>
            <div class="feature__dir">Cliente: ${esc(p.client)}</div>
          </div>
          <div class="feature__actions">
            <span class="btn-bracket">Ver projeto</span>
            ${p.instagram ? `<a class="ig-btn" href="${p.instagram}" target="_blank" rel="noopener">${icons.instagram}<span>Ver no Instagram</span></a>` : ""}
          </div>
        </div>
      </article>`
      )
      .join("");
  }

  /* ---------- Cards (grid) ---------- */
  const card = (p) => `
    <article class="card${p.vertical ? " card--vertical" : ""}" data-slug="${p.slug}" data-cat="${esc(p.category)}" data-flip-id="${p.slug}" tabindex="0" role="button" aria-label="Abrir ${esc(p.title)}">
      <div class="card__media" data-preview>${vid(p)}<span class="card__tag">${esc(p.category)}${p.vertical ? " · 9:16" : ""}</span></div>
      <div class="card__meta"><h3 class="card__title">${esc(p.title)}</h3><span class="card__sub">${esc(p.client)} · ${p.year}</span></div>
      ${p.instagram ? `<a class="ig-btn ig-btn--sm" href="${p.instagram}" target="_blank" rel="noopener" aria-label="${esc(p.title)} no Instagram">${icons.instagram}<span>Instagram</span></a>` : ""}
    </article>`;

  const grid = document.getElementById("grid");
  if (grid) {
    const limit = Number(grid.dataset.limit) || P.length;
    grid.innerHTML = P.slice(0, limit).map(card).join("");
  }

  const filters = document.getElementById("filters");
  if (filters) {
    const count = (c) => P.filter((p) => c === "Todos" || p.category === c).length;
    filters.innerHTML = ["Todos", ...window.AP_CATEGORIES]
      .map((c, i) => `<button class="filter${i ? "" : " is-active"}" data-filter="${c}">${c}<sup>${count(c)}</sup></button>`)
      .join("");
  }

  /* ---------- Clientes ---------- */
  const marquee = document.getElementById("marquee");
  if (marquee) {
    const items = (window.AP_CLIENTS || []).map((c) => `<span class="logo-mark">${esc(c)}</span>`).join("");
    marquee.innerHTML = `<div class="marquee__track">${items}${items}</div>`;
  }

  /* ---------- Página de projeto ---------- */
  if (page === "projeto") {
    const slug = new URLSearchParams(location.search).get("slug");
    const i = Math.max(0, P.findIndex((p) => p.slug === slug));
    const p = P[i];
    const next = P[(i + 1) % P.length];
    document.title = `${p.title} — ap.films`;
    document.getElementById("project").innerHTML = `
      <section class="page-hero container">
        ${window.APLayered(esc(p.title), "h1")}
        <div class="page-hero__meta"><span class="pill"></span><p>${p.year} | ${esc(p.category)}</p><span class="pill"></span></div>
      </section>
      <section class="container">
        <div class="player" data-cursor="play">
          <video playsinline preload="metadata" src="${p.video}#t=${p.start || 0}"></video>
          <button class="player__play" aria-label="Assistir"><span>ASSISTIR</span></button>
        </div>
        <div class="facts" data-reveal>
          <div><h4>Cliente</h4><p>${esc(p.client)}</p></div>
          <div><h4>Direção</h4><p>${esc(p.director)}</p></div>
          <div><h4>Função</h4><p>${esc(p.role).replace(/, /g, "<br>")}</p></div>
          <div><h4>Ano</h4><p>${p.year}${p.award ? `<br><span style="color:var(--yellow)">${esc(p.award)}</span>` : ""}</p></div>
        </div>
        <p class="lead" data-split>${esc(p.description)}</p>
        ${p.instagram ? `<div style="margin-top:40px" data-reveal><a class="btn-bracket" href="${p.instagram}" target="_blank" rel="noopener">Assistir no Instagram</a></div>` : ""}
        <div class="stills">
          ${(p.stills || [1.6, 4, 6.4]).map((s) => `<div data-reveal><video muted playsinline preload="metadata" src="${p.video}#t=${(p.start || 0) + s}"></video></div>`).join("")}
        </div>
      </section>
      <section class="container" style="margin-top:120px">
        <a class="next" href="projeto.html?slug=${next.slug}">
          <span class="caps">Próximo · ${esc(next.category)}</span>
          <h2>${esc(next.title)}</h2>
          <span class="btn-bracket">Ver projeto</span>
        </a>
      </section>`;
  }
})();

/* ap.films do rodapé com o movimento do template "Stretched Type Repeater" (Jitter).
   Reproduz os dois shaders do template:
   - "Cubic-In X Remap": as colunas da palavra são remapeadas por uma curva cúbica; o centro do
     esticão (progressX) alterna entre 0,3 e 0,7 a cada 1 s, com suavização; linhas vizinhas em fase oposta
     (no template, LOVE começa em 0,7 e HATE em 0,3).
   - "Alternating Row Scroll Grid": blocos de 2 linhas repetidos na vertical; cada bloco anda para um lado
     (alternando), a 0,25 da largura por segundo, com ±50% de variação por bloco; 24 px de espaço (proporcional).
   Sem WebGL ou com "reduzir movimento", fica o ap.films parado. */
(() => {
  const wrap = document.querySelector(".footer__big");
  const word = wrap && wrap.querySelector(".brandword");
  if (!wrap || !word) return;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const ROWS = 1;            // linhas visíveis (1 = como antes, cortada na base; com 3, as 2 de cima formam um bloco)
  const SPEED = 0.25;        // larguras por segundo (baseSpeed do template)
  const VARIATION = 0.5;     // rowSpeedVariation do template
  const GAP_EM = 0.12;       // espaço entre cópias (folga da caixa de texto do template + 24 px, numa fonte de 410 px)
  const CELL_GAP = 24 / 410; // espaço entre blocos, proporcional ao tamanho da fonte

  const VERT = "attribute vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }";
  const FRAG = `
precision highp float;
uniform sampler2D u_tex;
uniform vec2 u_res;      // tamanho do canvas (px do aparelho)
uniform float u_t;       // segundos
uniform float u_rowH;    // altura da tinta de uma linha (px)
uniform float u_pitch;   // distância entre linhas do mesmo bloco (px)
uniform float u_cellGap; // espaço extra entre blocos (px)
uniform float u_rows;
uniform float u_stepX;
uniform float u_speed;
uniform float u_var;
float hashRow(float n) { return fract(sin(n * 12.9898 + 7.137) * 43758.5453); }
float ease(float x) { return x < 0.5 ? 2.0 * x * x : 1.0 - 2.0 * (1.0 - x) * (1.0 - x); }
float valueAt(float seg, float line) {
  float even = mod(seg, 2.0) < 0.5 ? 1.0 : 0.0;
  float first = line < 0.5 ? even : 1.0 - even;   // linha de cima começa em 0,7; a de baixo em 0,3
  return mix(0.3, 0.7, first);
}
void main() {
  float y = u_res.y - gl_FragCoord.y;
  float cellH = 2.0 * u_pitch + u_cellGap;
  float c = floor(y / cellH);
  float yc = y - c * cellH;
  float line = yc < u_pitch ? 0.0 : 1.0;
  float yl = yc - line * u_pitch;
  if (yl > u_rowH || c * 2.0 + line >= u_rows) { gl_FragColor = vec4(0.0); return; }

  float dir = mod(c, 2.0) < 0.5 ? 1.0 : -1.0;
  float rnd = hashRow(c + 1.0);
  float speed = u_speed * (1.0 + u_var * (rnd * 2.0 - 1.0));
  float x = gl_FragCoord.x / u_res.x;
  float modX = mod(x - dir * speed * u_t, u_stepX);
  if (modX > 1.0) { gl_FragColor = vec4(0.0); return; }

  float seg = floor(u_t);
  float p = mix(valueAt(seg, line), valueAt(seg + 1.0, line), ease(fract(u_t)));
  float tx = clamp(modX, 0.0, 1.0);
  float cubicIn = tx * tx * tx;
  float inv = 1.0 - tx;
  float cubicOut = 1.0 - inv * inv * inv;
  float rx = p >= 0.5 ? mix(tx, cubicOut, (p - 0.5) * 2.0) : mix(tx, cubicIn, (0.5 - p) * 2.0);
  gl_FragColor = texture2D(u_tex, vec2(rx, yl / u_rowH));
}`;

  const canvas = document.createElement("canvas");
  canvas.className = "footer__stretch";
  canvas.setAttribute("role", "img");
  canvas.setAttribute("aria-label", "ap.films");
  const gl = canvas.getContext("webgl", { premultipliedAlpha: true, alpha: true, antialias: false });
  if (!gl) return;

  const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; };
  const prog = gl.createProgram();
  gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT));
  gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
  gl.useProgram(prog);
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, "p");
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const U = (n) => gl.getUniformLocation(prog, n);
  const tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  // Desenha o ap●films (com a bolinha amarela) numa textura, nas mesmas posições do texto da página
  function build() {
    word.style.position = word.style.visibility = word.style.top = "";
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const W = wrap.getBoundingClientRect().width;
    const cs = getComputedStyle(word);
    const fs = parseFloat(cs.fontSize);
    const ctx2 = document.createElement("canvas").getContext("2d");
    ctx2.font = `900 ${fs}px ${cs.fontFamily}`;
    const m = ctx2.measureText("apfilms");
    const asc = m.actualBoundingBoxAscent, desc = m.actualBoundingBoxDescent;
    const wr = wrap.getBoundingClientRect();
    const spans = word.querySelectorAll(".brandword__w");
    const dot = word.querySelector(".brandword__dot");
    const s0 = spans[0].getBoundingClientRect();
    const baseDom = s0.top + (fs + m.fontBoundingBoxAscent - m.fontBoundingBoxDescent) / 2;

    const src = document.createElement("canvas");
    src.width = Math.round(W * dpr);
    src.height = Math.ceil((asc + desc) * dpr);
    const g = src.getContext("2d");
    g.scale(dpr, dpr);
    g.font = ctx2.font;
    if ("letterSpacing" in g) g.letterSpacing = cs.letterSpacing;
    g.fillStyle = cs.color;
    g.textBaseline = "alphabetic";
    spans.forEach((s) => g.fillText(s.textContent, s.getBoundingClientRect().left - wr.left, asc));
    const d = dot.getBoundingClientRect();
    g.fillStyle = getComputedStyle(dot).backgroundColor;
    g.beginPath();
    g.arc(d.left - wr.left + d.width / 2, asc + (d.top + d.height / 2 - baseDom), d.width / 2, 0, Math.PI * 2);
    g.fill();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, src);

    const pitch = asc + desc + 0.04 * fs;
    const cellGap = CELL_GAP * fs;
    // a última linha é cortada na base das letras, como antes (a perna do "p" sai pela borda de baixo)
    const lastTop = (ROWS - 1) * pitch + Math.floor((ROWS - 1) / 2) * cellGap;
    const H = lastTop + asc;
    canvas.style.width = W + "px";
    canvas.style.height = H + "px";
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniform1i(U("u_tex"), 0);
    gl.uniform2f(U("u_res"), canvas.width, canvas.height);
    gl.uniform1f(U("u_rowH"), (asc + desc) * dpr);
    gl.uniform1f(U("u_pitch"), pitch * dpr);
    gl.uniform1f(U("u_cellGap"), cellGap * dpr);
    gl.uniform1f(U("u_rows"), ROWS);
    gl.uniform1f(U("u_stepX"), 1 + (GAP_EM * fs) / W);
    gl.uniform1f(U("u_speed"), reduce ? 0 : SPEED);
    gl.uniform1f(U("u_var"), VARIATION);

    if (!canvas.isConnected) wrap.appendChild(canvas);
    Object.assign(word.style, { position: "absolute", visibility: "hidden", top: "0" });
    wrap.classList.add("is-stretch");
    draw();
  }

  const t0 = performance.now();
  function draw() {
    const fixed = window.AP_STRETCH_TIME;            // só para testes: congela num instante (ms)
    const t = reduce ? 0.5 : (fixed != null ? fixed : performance.now() - t0) / 1000;
    gl.uniform1f(U("u_t"), t);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  // anima só enquanto o rodapé está na tela
  let raf = 0, visible = false;
  const loop = () => { draw(); raf = requestAnimationFrame(loop); };
  new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    cancelAnimationFrame(raf);
    if (visible && !reduce) raf = requestAnimationFrame(loop);
  }).observe(wrap);

  let rt = 0;
  (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => requestAnimationFrame(build));
  window.addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(build, 150); });
})();
