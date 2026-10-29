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
  document.querySelectorAll('a[href^="#"], a[href^="index.html#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href").split("#")[1];
      const target = id && document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      lenis ? lenis.scrollTo(target, { offset: -60 }) : target.scrollIntoView({ behavior: "smooth" });
    });
  });

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
    const host = el.closest("a") || el;
    host.addEventListener("mouseenter", () => { v.currentTime = Number(v.dataset.start) || 0; play(v); });
    host.addEventListener("mouseleave", () => v.pause());
  });

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
    const xTo = gsap.quickTo(cursor, "x", { duration: 0.35, ease: "power3" });
    const yTo = gsap.quickTo(cursor, "y", { duration: 0.35, ease: "power3" });
    window.addEventListener("mousemove", (e) => {
      xTo(e.clientX); yTo(e.clientY);
      cursor.classList.add("is-on");
      cursor.classList.toggle("is-play", !!e.target.closest("[data-cursor='play']"));
    });
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
