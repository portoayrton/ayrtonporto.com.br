/* Ayrton Porto — animações e interações (GSAP + ScrollTrigger + Lenis) */
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const touch = matchMedia("(hover: none)").matches;
  const hasGsap = typeof gsap !== "undefined";
  if (hasGsap) gsap.registerPlugin(ScrollTrigger);

  /* ---------- Scroll suave ---------- */
  let lenis = null;
  if (!reduce && typeof Lenis !== "undefined") {
    lenis = new Lenis({ lerp: 0.09 });
    if (hasGsap) {
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add((t) => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
    } else {
      const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    }
  }
  /* Links para seções (Serviços, Contato…): se a seção existe nesta página, rola até ela;
     se não existe, abre a home já posicionada na seção. */
  const goTo = (target, immediate) =>
    lenis ? lenis.scrollTo(target, { offset: -90, immediate }) : target.scrollIntoView({ behavior: immediate ? "auto" : "smooth" });
  document.querySelectorAll('a[href*="#"]').forEach((a) => {
    const id = a.getAttribute("href").split("#")[1];
    if (!id) return;
    a.addEventListener("click", (e) => {
      e.preventDefault();
      document.body.classList.remove("menu-open");
      const target = document.getElementById(id);
      if (target) return goTo(target, false);
      const home = (document.querySelector(".nav__logo") || {}).getAttribute?.("href") || "index.html";
      location.href = home + "#" + id;
    });
  });
  // chegou de outra página com #secao: depois que a página monta, posiciona logo abaixo do menu
  if (location.hash.length > 1) {
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    const target = document.getElementById(decodeURIComponent(location.hash.slice(1)));
    if (target) {
      let moved = false;   // se a pessoa já rolou, não puxa a página de volta
      ["wheel", "touchmove", "keydown"].forEach((ev) => window.addEventListener(ev, () => (moved = true), { once: true, passive: true }));
      const land = () => { if (!moved) goTo(target, true); };
      (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => setTimeout(land, 400));
      window.addEventListener("load", () => setTimeout(land, 200));
    }
  }

  /* ---------- Vídeos: autoplay em tela + preview no hover ---------- */
  const play = (v) => { const p = v.play(); if (p) p.catch(() => {}); };
  const io = new IntersectionObserver(
    (entries) => entries.forEach((e) => {
      const v = e.target.querySelector("video") || e.target;
      e.isIntersecting ? play(v) : v.pause();
    }),
    { threshold: 0.25 }
  );
  document.querySelectorAll("[data-autoplay]").forEach((el) => io.observe(el));
  document.querySelectorAll("[data-preview]").forEach((el) => {
    const v = el.querySelector("video");
    if (touch) return io.observe(el);
    const host = el.closest(".card, .feature") || el;
    host.addEventListener("mouseenter", () => { v.currentTime = Number(v.dataset.start) || 0; play(v); });
    host.addEventListener("mouseleave", () => v.pause());
  });

  /* ---------- Painel do projeto ----------
     Clicar num projeto: o vídeo sai do card e cresce até o lado esquerdo (no formato dele),
     e as informações entram pela direita. Fecha com X, Esc, clique fora ou "voltar". */
  const PROJ = window.AP_PROJECTS || [];
  const pv = document.querySelector(".pv");
  if (pv) {
    const pvMedia = pv.querySelector(".pv__media"), pvVideo = pvMedia.querySelector("video");
    const pvInfo = pv.querySelector(".pv__info"), pvBg = pv.querySelector(".pv__bg");
    const pvSound = pv.querySelector(".pv__sound");
    const escHtml = (t) => String(t ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
    let current = null;                       // { p, src (elemento de mídia do card) }
    const EASE = "expo.inOut";

    const rectOf = (el) => { const r = el.getBoundingClientRect(); return { left: r.left, top: r.top, width: r.width, height: r.height }; };
    // onde o vídeo fica aberto: lado esquerdo, no formato do vídeo; no celular, em cima
    const layout = (p, src) => {
      const W = innerWidth, H = innerHeight, m = Math.max(16, Math.min(40, W * 0.025));
      const v = src && src.querySelector("video");
      const ar = v && v.videoWidth ? v.videoWidth / v.videoHeight : (p.vertical ? 9 / 16 : 16 / 9);
      if (W <= 800) {
        const w = W - 2 * m, h = Math.min(w / ar, H * 0.62);
        return { media: { left: m, top: 70, width: Math.min(w, h * ar), height: h, x: (W - Math.min(w, h * ar)) / 2 }, info: { top: 70 + h + 28 } };
      }
      const infoW = Math.min(560, Math.max(400, W * 0.32));   // coluna das informações: nem estreita nem espalhada
      const gap = m * 1.5;
      let h = H - 2 * m, w = h * ar;
      const maxW = W - infoW - gap - 2 * m;
      if (w > maxW) { w = maxW; h = w / ar; }
      const x0 = Math.max(m, (W - (w + gap + infoW)) / 2);   // vídeo + informações centralizados na tela
      return { media: { left: x0, top: (H - h) / 2, width: w, height: h }, info: { left: x0 + w + gap, width: infoW } };
    };

    const fill = (p) => {
      pv.querySelector(".pv__cat").textContent = p.category || "";
      pv.querySelector(".pv__title").textContent = p.title || "";
      const facts = [["Cliente", p.client], ["Direção", p.director], ["Função", p.role], ["Ano", p.year]].filter(([, v]) => v);
      pv.querySelector(".pv__facts").innerHTML = facts.map(([k, v]) => `<div><dt>${k}</dt><dd>${escHtml(v)}</dd></div>`).join("");
      pv.querySelector(".pv__desc").textContent = p.description || "";
      const ig = pv.querySelector(".ig-btn");
      ig.style.display = p.instagram ? "" : "none";
      if (p.instagram) ig.href = p.instagram;
      pv.querySelector(".pv__page").href = "projeto.html?slug=" + p.slug;
    };

    // o título diminui só o necessário para caber na coluna (palavra longa não quebra no meio)
    const fitTitle = () => {
      const t = pv.querySelector(".pv__title");
      t.style.fontSize = "";
      let fs = parseFloat(getComputedStyle(t).fontSize);
      const words = (t.textContent || "").split(/\s+/);
      const longest = () => { const r = document.createRange(); let w = 0;
        t.innerHTML = words.map((x) => `<span style="white-space:nowrap">${escHtml(x)}</span>`).join(" ");
        t.querySelectorAll("span").forEach((s) => { w = Math.max(w, s.getBoundingClientRect().width); }); return w; };
      for (let i = 0; i < 40 && fs > 18 && longest() > t.clientWidth; i++) { fs *= 0.94; t.style.fontSize = fs + "px"; }
    };
    const open = (slug, src, push = true, kb = false) => {
      const p = PROJ.find((x) => x.slug === slug);
      if (!p || current) return;
      current = { p, src };
      fill(p);
      const L = layout(p, src);
      const srcVideo = src && src.querySelector("video");
      pvVideo.src = (srcVideo && (srcVideo.currentSrc || srcVideo.src)) || p.video;
      pvVideo.muted = true; pvSound.textContent = "Ativar som"; pvSound.setAttribute("aria-pressed", "false");
      pvSound.hidden = !!p.silent;          // vídeo sem áudio: botão não aparece
      if (srcVideo && srcVideo.currentTime) { try { pvVideo.currentTime = srcVideo.currentTime; } catch (e) {} }
      play(pvVideo);
      const from = src ? rectOf(src) : { left: innerWidth / 2 - 40, top: innerHeight / 2 - 40, width: 80, height: 80 };
      if (innerWidth <= 800) { Object.assign(pvInfo.style, { left: "", width: "", top: L.info.top + "px", bottom: "auto" }); }
      else Object.assign(pvInfo.style, { left: L.info.left + "px", width: L.info.width + "px", top: "0", bottom: "0" });
      pv.classList.add("is-open"); pv.setAttribute("aria-hidden", "false");
      fitTitle();
      document.body.style.overflow = "hidden"; lenis && lenis.stop();
      if (src) src.style.visibility = "hidden";
      if (push) history.pushState({ pv: slug }, "", "#projeto=" + slug);
      const to = { left: L.media.x ?? L.media.left, top: L.media.top, width: L.media.width, height: L.media.height };
      if (!hasGsap || reduce) {
        Object.assign(pvMedia.style, { left: to.left + "px", top: to.top + "px", width: to.width + "px", height: to.height + "px" });
        pvBg.style.opacity = 1; pv.classList.add("is-ready"); return;
      }
      gsap.killTweensOf([pvMedia, pvBg, ".pv-in"]);
      gsap.set(pvMedia, { ...from, borderRadius: src ? getComputedStyle(src).borderRadius : "50%" });
      gsap.set(".pv-in, .pv__close", { opacity: 0, x: 40 });
      const tlOpen = gsap.timeline()
        .to(pvBg, { opacity: 1, duration: 0.6, ease: "power2.out" }, 0)
        .to(pvMedia, { ...to, borderRadius: 18, duration: 1.05, ease: EASE }, 0)
        .to(".pv-in, .pv__close", { opacity: 1, x: 0, duration: 0.8, ease: "expo.out", stagger: 0.07 }, 0.55)
        .add(() => pv.classList.add("is-ready"), 0.9);
      // garantia: se a animação não rodar (aba em segundo plano, aparelho lento), termina na posição final
      setTimeout(() => { if (current && tlOpen.progress() < 1) tlOpen.progress(1); }, 2500);
      if (kb) setTimeout(() => pv.querySelector(".pv__close").focus({ preventScroll: true }), 600);   // foco no Fechar só para quem usa teclado
    };

    const close = () => {
      if (!current) return;
      const { src } = current;
      const done = () => {
        pv.classList.remove("is-open", "is-ready"); pv.setAttribute("aria-hidden", "true");
        pvVideo.pause(); pvVideo.removeAttribute("src"); pvVideo.load();
        if (src) src.style.visibility = "";
        document.body.style.overflow = ""; lenis && lenis.start();
        if (src) (src.closest(".card, .feature") || src).focus?.({ preventScroll: true });
        current = null;
      };
      if (!hasGsap || reduce) return done();
      const to = src ? rectOf(src) : { left: innerWidth / 2 - 40, top: innerHeight / 2 - 40, width: 80, height: 80 };
      pv.classList.remove("is-ready");
      let finished = false;
      const finish = () => { if (!finished) { finished = true; done(); } };
      setTimeout(finish, 2000);   // garantia: fecha mesmo se a animação travar
      gsap.timeline({ onComplete: finish })
        .to(".pv-in, .pv__close", { opacity: 0, x: 30, duration: 0.35, ease: "power2.in", stagger: { each: 0.03, from: "end" } }, 0)
        .to(pvMedia, { ...to, borderRadius: src ? getComputedStyle(src).borderRadius : "50%", duration: 0.9, ease: EASE }, 0.15)
        .to(pvBg, { opacity: 0, duration: 0.5, ease: "power2.inOut" }, 0.5);
    };
    const requestClose = () => { if (history.state && history.state.pv) history.back(); else close(); };

    // abrir ao clicar (ou Enter/Espaço) num destaque ou card; o botão do Instagram abre o Instagram normalmente
    document.addEventListener("click", (e) => {
      if (e.target.closest(".ig-btn")) return;
      const host = e.target.closest(".feature[data-slug], .card[data-slug]");
      if (!host) return;
      e.preventDefault();
      open(host.dataset.slug, host.querySelector(".media, .card__media") || host);
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && current) return requestClose();
      const host = (e.key === "Enter" || e.key === " ") && e.target.closest && e.target.closest(".feature[data-slug], .card[data-slug]");
      if (host && e.target === host) { e.preventDefault(); open(host.dataset.slug, host.querySelector(".media, .card__media") || host, true, true); }
    });
    pv.querySelector(".pv__close").addEventListener("click", requestClose);
    pvBg.addEventListener("click", requestClose);
    pvSound.addEventListener("click", () => {
      pvVideo.muted = !pvVideo.muted;
      pvSound.textContent = pvVideo.muted ? "Ativar som" : "Som ligado";
      pvSound.setAttribute("aria-pressed", String(!pvVideo.muted));
    });
    window.addEventListener("popstate", () => { if (current) close(); });
    window.addEventListener("resize", () => {
      if (!current || !hasGsap) return;
      const L = layout(current.p, current.src);
      gsap.set(pvMedia, { left: L.media.x ?? L.media.left, top: L.media.top, width: L.media.width, height: L.media.height });
      if (innerWidth > 800) Object.assign(pvInfo.style, { left: L.info.left + "px", width: L.info.width + "px" });
      fitTitle();
    });
    // link direto (#projeto=slug) abre o projeto ao carregar
    const m = location.hash.match(/^#projeto=([\w-]+)/);
    if (m) {
      const host = document.querySelector(`[data-slug="${m[1]}"]`);
      setTimeout(() => open(m[1], host && host.querySelector(".media, .card__media"), false), 900);
    }
  }

  /* ---------- Showreel modal ---------- */
  const modal = document.querySelector(".modal");
  const mv = modal.querySelector("video");
  const openReel = (src) => {
    mv.src = src; mv.currentTime = 0; mv.muted = false; play(mv);
    lenis && lenis.stop();
    hasGsap ? gsap.to(modal, { autoAlpha: 1, duration: 0.5, ease: "power2.out" }) : (modal.style.cssText = "visibility:visible;opacity:1");
  };
  const closeReel = () => {
    mv.pause();
    lenis && lenis.start();
    hasGsap ? gsap.to(modal, { autoAlpha: 0, duration: 0.4 }) : (modal.style.cssText = "");
  };
  document.querySelectorAll("[data-reel]").forEach((b) => b.addEventListener("click", () => openReel(window.AP_REEL)));
  modal.querySelector(".modal__close").addEventListener("click", closeReel);
  modal.addEventListener("click", (e) => e.target === modal && closeReel());
  document.addEventListener("keydown", (e) => e.key === "Escape" && closeReel());

  /* Player da página de projeto */
  const player = document.querySelector(".player");
  if (player) {
    const v = player.querySelector("video");
    const btn = player.querySelector(".player__play");
    btn.addEventListener("click", () => {
      v.controls = true; v.currentTime = 0; play(v);
      hasGsap ? gsap.to(btn, { autoAlpha: 0, duration: 0.4 }) : (btn.style.display = "none");
      player.removeAttribute("data-cursor");
    });
  }

  /* ---------- Cursor ---------- */
  const cursor = document.querySelector(".cursor");
  if (!touch && hasGsap) {
    // segue o mouse quadro a quadro (gsap.ticker = requestAnimationFrame): cobre 95% da distância em ~125 ms,
    // igual em 60 ou 120 Hz, sem o atraso de 0,35 s do tween antigo
    const pos = { x: innerWidth / 2, y: innerHeight / 2 }, target = { x: pos.x, y: pos.y };
    const SPEED = 24;                                   // maior = mais colada no mouse (40 ficou "dura"; 24 = 95% em ~125 ms, o "smooth" que ele pediu)
    gsap.set(cursor, { x: pos.x, y: pos.y, force3D: true });
    gsap.ticker.add((time, dt) => {
      const k = 1 - Math.exp(-(dt / 1000) * SPEED);
      const dx = target.x - pos.x, dy = target.y - pos.y;
      if (Math.abs(dx) < 0.05 && Math.abs(dy) < 0.05) return;
      pos.x += dx * k; pos.y += dy * k;
      gsap.set(cursor, { x: pos.x, y: pos.y });
    });
    // a bolinha olha a cor do fundo embaixo dela: fundo claro -> preta; escuro -> amarela
    const isLightBg = (el) => {
      for (let n = el; n && n.nodeType === 1; n = n.parentElement) {
        const m = getComputedStyle(n).backgroundColor.match(/[\d.]+/g);
        if (m && (m[3] === undefined || +m[3] > 0.5)) {
          return (0.2126 * m[0] + 0.7152 * m[1] + 0.0722 * m[2]) / 255 > 0.6;
        }
      }
      return false;
    };
    let lastTarget = null;
    window.addEventListener("mousemove", (e) => {
      target.x = e.clientX; target.y = e.clientY;
      if (!cursor.classList.contains("is-on")) { pos.x = target.x; pos.y = target.y; gsap.set(cursor, { x: pos.x, y: pos.y }); }   // 1º movimento: já nasce no lugar
      cursor.classList.add("is-on");
      document.body.classList.add("has-cursor");
      if (e.target !== lastTarget) {                      // só mede a cor quando muda o elemento sob o mouse
        lastTarget = e.target;
        cursor.classList.toggle("is-dark", isLightBg(e.target));
      }
    }, { passive: true });
    // ao sair da janela a bolinha some e a setinha do sistema volta
    document.addEventListener("mouseleave", () => cursor.classList.remove("is-on"));
    document.addEventListener("mouseenter", () => cursor.classList.add("is-on"));
  }

  /* ---------- Formulário (demo) ---------- */
  const form = document.querySelector(".form");
  form && form.addEventListener("submit", (e) => {
    e.preventDefault();
    const val = (id) => form.querySelector(id).value;
    const msg = `Olá, Ayrton! Sou ${val("#f-nome")} (${val("#f-email")}).\nTipo de projeto: ${val("#f-tipo")}\n\n${val("#f-msg")}`;
    window.open(`https://wa.me/5592984669043?text=${encodeURIComponent(msg)}`, "_blank", "noopener");
    form.classList.add("is-sent"); form.reset();
  });

  /* ---------- Filtros ---------- */
  const grid = document.getElementById("grid");
  const cardTweens = [];
  document.querySelectorAll("[data-filter]").forEach((btn) =>
    btn.addEventListener("click", () => {
      document.querySelectorAll("[data-filter]").forEach((b) => b.classList.toggle("is-active", b === btn));
      const f = btn.dataset.filter;
      const cards = [...grid.children];
      const apply = () => cards.forEach((c) => c.classList.toggle("is-hidden", f !== "Todos" && c.dataset.cat !== f));
      if (!hasGsap || reduce) return apply();
      // finaliza as entradas pendentes para que cards ainda não revelados apareçam
      cardTweens.splice(0).forEach((t) => { t.scrollTrigger && t.scrollTrigger.kill(); t.progress(1).kill(); });
      gsap.to(grid, {
        opacity: 0, y: 20, duration: 0.25, ease: "power2.in", overwrite: true,
        onComplete: () => {
          apply();
          ScrollTrigger.refresh();
          gsap.to(grid, { opacity: 1, y: 0, duration: 0.3 });
          gsap.fromTo(cards.filter((c) => !c.classList.contains("is-hidden")),
            { opacity: 0, y: 50, scale: 0.96 },
            { opacity: 1, y: 0, scale: 1, duration: 0.7, ease: "power3.out", stagger: 0.07 });
        }
      });
    })
  );

  /* ---------- Transição de página ---------- */
  const curtain = document.querySelector(".curtain");
  // Trim path do logo: o traço do σ, depois o do "a", e o ponto entra por último
  const drawLogo = (tl, at = 0, d = 1.3) => {
    const svg = curtain && curtain.querySelector(".brand-draw");
    if (!svg) return tl;
    const paths = svg.querySelectorAll("path");
    paths.forEach((p) => { const L = p.getTotalLength(); gsap.set(p, { strokeDasharray: L, strokeDashoffset: L }); });
    gsap.set(svg, { opacity: 1, yPercent: 0 });
    return tl
      .fromTo(svg, { scale: 0.94 }, { scale: 1, duration: d * 1.4, ease: "power2.out" }, at)
      .to(paths, { strokeDashoffset: 0, duration: d, ease: "power3.inOut", stagger: d * 0.32 }, at)
      .fromTo(svg.querySelector("circle"), { scale: 0 }, { scale: 1, duration: d * 0.45, ease: "back.out(3)" }, at + d * 1.05);
  };
  if (curtain) curtain.style.animation = "none";
  document.querySelectorAll("a[href]").forEach((a) => {
    const href = a.getAttribute("href");
    if (!href || href.startsWith("#") || href.includes("#") || a.target === "_blank" || /^(mailto|tel|https?):/.test(href)) return;
    a.addEventListener("click", (e) => {
      if (e.metaKey || e.ctrlKey || !hasGsap || !curtain) return;
      e.preventDefault();
      gsap.set(curtain, { transformOrigin: "bottom" });
      const tl = gsap.timeline({ onComplete: () => (location.href = href) });
      tl.fromTo(curtain, { scaleY: 0 }, { scaleY: 1, duration: 0.6, ease: "power4.inOut" }, 0);
      drawLogo(tl, 0.3, 0.8);
    });
  });
  window.addEventListener("pageshow", (e) => { if (e.persisted && curtain) gsap.set(curtain, { scaleY: 0 }); });

  if (!hasGsap || reduce) {
    if (curtain) curtain.style.display = "none";
    return;
  }

  /* ================= GSAP ================= */

  /* Split de palavras para reveals */
  document.querySelectorAll("[data-split]").forEach((el) => {
    el.innerHTML = el.textContent.trim().split(/\s+/)
      .map((w) => `<span class="w"><span>${w}</span></span>`).join(" ");
  });

  const intro = gsap.timeline({ defaults: { ease: "power4.out" } });
  // Na primeira visita da sessão o logo se revela antes da cortina abrir; nas demais a entrada é rápida
  let first = false;
  try { first = !sessionStorage.getItem("ap-intro"); sessionStorage.setItem("ap-intro", "1"); } catch (e) {}
  const D = first ? 1.9 : 0;
  if (curtain) {
    const logo = curtain.querySelector(".brand-draw") || curtain.querySelector(".brand");
    gsap.set(curtain, { transformOrigin: "top" });
    if (first) drawLogo(intro, 0, 1.3);
    intro.to(logo, { yPercent: -40, opacity: 0, duration: 0.5, ease: "power2.in" }, 0.1 + D)
         .to(curtain, { scaleY: 0, duration: 0.9, ease: "power4.inOut" }, 0.25 + D);
  }

  /* Títulos em camadas: abrem no load e se afastam no scroll */
  document.querySelectorAll("[data-layered]").forEach((wrap, idx) => {
    const g = (c) => wrap.querySelector(`.layered__ghost.${c}`);
    const offsets = { up2: -0.28, up: -0.15, down: 0.15, down2: 0.28 };
    const inHero = !!wrap.closest(".hero, .page-hero");
    const main = wrap.querySelector(".layered__main");

    if (inHero) {
      intro.from(main, { yPercent: 60, opacity: 0, duration: 1.2 }, 0.55 + D);
      Object.entries(offsets).forEach(([k, o]) =>
        intro.fromTo(g(k), { y: 0, opacity: 0 }, { y: `${o}em`, opacity: 1, duration: 1.3 }, 0.85 + D)
      );
    } else {
      Object.entries(offsets).forEach(([k, o]) => gsap.set(g(k), { y: `${o}em` }));
      gsap.from(wrap.querySelectorAll(".layered__word"), {
        yPercent: 40, opacity: 0, duration: 1.2, ease: "power4.out", stagger: 0.06,
        scrollTrigger: { trigger: wrap, start: "top 90%" }
      });
    }
    // glitch: as fatias "respiram" com a rolagem
    gsap.to([g("up2"), g("down2")], {
      y: (i) => `${i ? 0.42 : -0.42}em`, ease: "none",
      scrollTrigger: { trigger: wrap, start: inHero ? "top top" : "top bottom", end: "bottom top", scrub: true }
    });
  });

  /* ap.films: as palavras sobem e a bolinha amarela entra com um pulo */
  intro.from(".hero .brandword__w", { yPercent: 60, opacity: 0, duration: 1.2, stagger: 0.12 }, 0.5 + D)
       .from(".hero .brandword__dot", { scale: 0, duration: 0.7, ease: "back.out(3)" }, 0.9 + D);
  gsap.from(".footer__big .brandword__w, .footer__big .brandword__dot", {
    yPercent: 60, opacity: 0, duration: 1, ease: "power4.out", stagger: 0.1,
    scrollTrigger: { trigger: ".footer__big", start: "top 95%" }
  });

  /* Subtítulo + pills do hero */
  intro.from(".hero__sub p, .page-hero__meta p", { y: 30, opacity: 0, duration: 1 }, 1.1 + D)
       .from(".pill", { scaleY: 0, duration: 0.8, stagger: 0.1 }, 1.1 + D)
       .from(".hero__actions", { y: 20, opacity: 0, duration: 0.8 }, 1.3 + D)
       .from(".nav", { yPercent: -100, duration: 0.8, clearProps: "transform" }, 0.9 + D);

  /* Reveal de palavras */
  document.querySelectorAll("[data-split]").forEach((el) =>
    gsap.from(el.querySelectorAll(".w > span"), {
      yPercent: 110, duration: 1, ease: "power4.out", stagger: 0.035,
      scrollTrigger: { trigger: el, start: "top 88%" }
    })
  );
  gsap.utils.toArray("[data-reveal]").forEach((el) =>
    gsap.from(el, { y: 40, opacity: 0, duration: 1, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 90%" } })
  );

  /* Cards de destaque: entram escalando + parallax do vídeo */
  gsap.utils.toArray(".feature").forEach((f) => {
    gsap.from(f, { scale: 0.92, borderRadius: 40, duration: 1.2, ease: "power3.out", scrollTrigger: { trigger: f, start: "top 95%" } });
    const v = f.querySelector("video");
    gsap.fromTo(v, { yPercent: -8 }, { yPercent: 0, ease: "none", scrollTrigger: { trigger: f, start: "top bottom", end: "bottom top", scrub: true } });
    gsap.from(f.querySelector(".feature__title"), { yPercent: 50, opacity: 0, duration: 1, ease: "power4.out", scrollTrigger: { trigger: f, start: "top 60%" } });
  });

  /* Cards do grid */
  gsap.utils.toArray(".card").forEach((c, i) =>
    cardTweens.push(gsap.from(c, { y: 80, opacity: 0, duration: 1, ease: "power3.out", delay: (i % 2) * 0.12, scrollTrigger: { trigger: c, start: "top 92%" } }))
  );

  /* Imagens flutuando sobre o "Feito para a tela" */
  gsap.utils.toArray("[data-float]").forEach((el) => {
    const speed = Number(el.dataset.float);
    gsap.fromTo(el, { yPercent: 40 * speed, rotate: -3 * speed }, {
      yPercent: -60 * speed, rotate: 3 * speed, ease: "none",
      scrollTrigger: { trigger: el.closest(".crafted__stage"), start: "top bottom", end: "bottom top", scrub: true }
    });
  });

  /* Linhas de serviço desenham */
  gsap.utils.toArray(".service").forEach((s, i) =>
    gsap.from(s, { opacity: 0, x: -40, duration: 0.9, delay: i * 0.06, ease: "power3.out", scrollTrigger: { trigger: s, start: "top 92%" } })
  );

  /* Números do processo contam */
  gsap.utils.toArray("[data-count]").forEach((el) => {
    const end = Number(el.dataset.count);
    const o = { v: 0 };
    gsap.to(o, {
      v: end, duration: 1.6, ease: "power2.out",
      onUpdate: () => (el.textContent = (el.dataset.prefix || "") + String(Math.round(o.v)).padStart(el.dataset.pad || 1, "0") + (el.dataset.suffix || "")),
      scrollTrigger: { trigger: el, start: "top 90%" }
    });
  });

  /* Marquee de clientes — acelera com a velocidade do scroll */
  const track = document.querySelector(".marquee__track");
  if (track) {
    const loop = gsap.to(track, { xPercent: -50, duration: 30, ease: "none", repeat: -1 });
    ScrollTrigger.create({
      trigger: track, start: "top bottom", end: "bottom top",
      onUpdate: (self) => {
        const v = gsap.utils.clamp(-6, 6, self.getVelocity() / 300);
        gsap.to(loop, { timeScale: 1 + Math.abs(v), duration: 0.2, overwrite: true });
        gsap.to(loop, { timeScale: 1, duration: 1, delay: 0.2 });
      }
    });
  }

  /* Showreel do hero escurece e aproxima ao rolar */
  const reel = document.querySelector(".hero__reel");
  if (reel) gsap.to(reel, { scale: 1.15, opacity: 0.1, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });

  window.addEventListener("load", () => ScrollTrigger.refresh());
})();
