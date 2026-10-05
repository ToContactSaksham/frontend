// Kinetic — vanilla ES module. No dependencies, no build step.
const $ = (sel, root = document) => root.querySelector(sel);
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------------------------------------------------------------- Reveal */
const io = new IntersectionObserver(
  (entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      e.target.classList.add("in");
      io.unobserve(e.target);
    }
  },
  { threshold: 0.15, rootMargin: "0px 0px -8% 0px" },
);
document.querySelectorAll(".reveal, .bar").forEach((el) => io.observe(el));

/* --------------------------------------- Scroll progress (JS fallback) */
if (!CSS.supports("animation-timeline: scroll()")) {
  const bar = $(".progress");
  let raf = 0;
  const update = () => {
    raf = 0;
    const max = document.documentElement.scrollHeight - innerHeight;
    bar.style.setProperty("--p", max > 0 ? (scrollY / max).toFixed(4) : "0");
  };
  addEventListener("scroll", () => { if (!raf) raf = requestAnimationFrame(update); }, { passive: true });
  update();
}

/* ---------------------------------------------- Pointer / tilt parallax */
const parallax = $("#parallax");
if (parallax && !reduced) {
  const set = (x, y) => {
    parallax.style.setProperty("--px", x.toFixed(3));
    parallax.style.setProperty("--py", y.toFixed(3));
  };
  parallax.addEventListener("pointermove", (e) => {
    const r = parallax.getBoundingClientRect();
    set((e.clientX - r.left) / r.width - 0.5, (e.clientY - r.top) / r.height - 0.5);
  });
  parallax.addEventListener("pointerleave", () => set(0, 0));
  addEventListener(
    "deviceorientation",
    (e) => {
      if (e.gamma == null || e.beta == null) return;
      const clamp = (v) => Math.max(-0.5, Math.min(0.5, v));
      set(clamp(e.gamma / 60), clamp((e.beta - 45) / 60));
    },
    { passive: true },
  );
}

/* --------------------------------------------- Container-query slider */
const range = $("#cq-range");
const wrap = $("#cq-wrap");
const out = $("#cq-out");
if (range && wrap && out) {
  const apply = () => {
    wrap.style.setProperty("--cqw", range.value + "px");
    out.value = range.value;
  };
  range.addEventListener("input", apply);
  apply();
}

const add = $("#add");
if (add) {
  add.addEventListener("click", () => {
    add.textContent = "Added ✓";
    add.classList.add("added");
    setTimeout(() => {
      add.textContent = "Add to cart";
      add.classList.remove("added");
    }, 1400);
  });
}

/* ---------------------------------------------------- Particle field */
const canvas = $("#field");
if (canvas) {
  const ctx = canvas.getContext("2d");
  let w = 0, h = 0, raf = 0, particles = [];
  const pointer = { x: -1e4, y: -1e4, on: false };
  let colA = [167, 139, 250], colB = [34, 211, 238];

  const hex = (v) => {
    const s = v.trim().replace("#", "");
    const n = parseInt(s.length === 3 ? s.split("").map((c) => c + c).join("") : s, 16);
    return Number.isNaN(n) ? [167, 139, 250] : [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  };
  const readColors = () => {
    const cs = getComputedStyle(document.documentElement);
    colA = hex(cs.getPropertyValue("--a") || "#a78bfa");
    colB = hex(cs.getPropertyValue("--b") || "#22d3ee");
  };
  const resize = () => {
    const r = canvas.getBoundingClientRect();
    const dpr = Math.min(2, devicePixelRatio || 1);
    w = r.width; h = r.height;
    canvas.width = Math.max(1, Math.round(w * dpr));
    canvas.height = Math.max(1, Math.round(h * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.round(Math.min(110, (w * h) / 15000));
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3,
      r: 0.9 + Math.random() * 1.4,
    }));
  };
  const mix = (t) => colA.map((c, i) => Math.round(c + (colB[i] - c) * t));
  const draw = (animate) => {
    ctx.clearRect(0, 0, w, h);
    for (const p of particles) {
      if (!animate) continue;
      if (pointer.on) {
        const dx = pointer.x - p.x, dy = pointer.y - p.y, d2 = dx * dx + dy * dy;
        if (d2 < 160 * 160 && d2 > 1) {
          const d = Math.sqrt(d2), f = ((160 - d) / 160) * 0.012;
          p.vx += (dx / d) * f; p.vy += (dy / d) * f;
        }
      }
      p.vx *= 0.995; p.vy *= 0.995;
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > w) p.vx *= -1;
      if (p.y < 0 || p.y > h) p.vy *= -1;
    }
    for (let i = 0; i < particles.length; i++) {
      const a = particles[i];
      for (let j = i + 1; j < particles.length; j++) {
        const b = particles[j];
        const dx = a.x - b.x, dy = a.y - b.y, d2 = dx * dx + dy * dy;
        if (d2 > 120 * 120) continue;
        const [r, g, bl] = mix(a.x / Math.max(1, w));
        ctx.strokeStyle = `rgba(${r},${g},${bl},${((1 - Math.sqrt(d2) / 120) * 0.35).toFixed(3)})`;
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      }
    }
    for (const p of particles) {
      const [r, g, bl] = mix(p.x / Math.max(1, w));
      ctx.fillStyle = `rgba(${r},${g},${bl},0.9)`;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
    }
  };
  let visible = true;
  const loop = () => { raf = 0; draw(true); if (visible && !document.hidden) raf = requestAnimationFrame(loop); };
  const start = () => { if (reduced) { draw(false); return; } if (!raf) raf = requestAnimationFrame(loop); };

  readColors(); resize(); start();
  new ResizeObserver(() => { resize(); if (reduced) draw(false); }).observe(canvas);
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) start(); }).observe(canvas);
  matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => { readColors(); if (reduced) draw(false); });
  document.addEventListener("visibilitychange", start);
  addEventListener("pointermove", (e) => {
    const r = canvas.getBoundingClientRect();
    pointer.x = e.clientX - r.left; pointer.y = e.clientY - r.top;
    pointer.on = pointer.x >= 0 && pointer.y >= 0 && pointer.x <= w && pointer.y <= h;
  }, { passive: true });
  document.addEventListener("pointerleave", () => { pointer.on = false; });
}

/* --------------------------------------------------------- FPS meter */
const fpsEl = $("#fps");
if (fpsEl && !reduced) {
  let frames = 0, last = performance.now();
  const tick = (t) => {
    frames++;
    if (t - last >= 1000) { fpsEl.textContent = String(Math.round((frames * 1000) / (t - last))); frames = 0; last = t; }
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

/* ---------------------------------- Report this module's own byte size */
fetch(import.meta.url)
  .then((r) => r.blob())
  .then((b) => { const el = $("#js-size"); if (el) el.textContent = (b.size / 1024).toFixed(1) + " kB"; })
  .catch(() => {});
