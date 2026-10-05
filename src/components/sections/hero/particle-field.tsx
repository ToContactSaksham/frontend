"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
}

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "").trim();
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const n = Number.parseInt(full, 16);
  if (Number.isNaN(n)) return [167, 139, 250];
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/**
 * Constellation particle field on a <canvas>.
 *
 * - DPR-aware so it is crisp on retina screens, capped at 2x for perf.
 * - Particle count scales with area, capped at 140.
 * - Pointer gently attracts nearby particles.
 * - Pauses when offscreen or the tab is hidden; renders one static frame
 *   for users who prefer reduced motion.
 * - Colours come from the CSS theme tokens and update on theme change.
 */
export function ParticleField({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let raf = 0;
    let visible = true;
    let particles: Particle[] = [];
    let rgbA: [number, number, number] = [167, 139, 250];
    let rgbB: [number, number, number] = [34, 211, 238];
    const pointer = { x: -1e4, y: -1e4, active: false };

    const readColors = () => {
      const cs = getComputedStyle(document.documentElement);
      rgbA = hexToRgb(cs.getPropertyValue("--accent") || "#a78bfa");
      rgbB = hexToRgb(cs.getPropertyValue("--accent-2") || "#22d3ee");
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.max(1, Math.round(width * dpr));
      canvas.height = Math.max(1, Math.round(height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const target = Math.round(Math.min(140, (width * height) / 13000));
      particles = Array.from({ length: target }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        r: 0.9 + Math.random() * 1.5,
      }));
    };

    const LINK = 120;
    const ATTRACT = 170;

    const draw = (animate: boolean) => {
      ctx.clearRect(0, 0, width, height);

      for (const p of particles) {
        if (animate) {
          // Gentle attraction toward the pointer.
          if (pointer.active) {
            const dx = pointer.x - p.x;
            const dy = pointer.y - p.y;
            const d2 = dx * dx + dy * dy;
            if (d2 < ATTRACT * ATTRACT && d2 > 1) {
              const d = Math.sqrt(d2);
              const f = ((ATTRACT - d) / ATTRACT) * 0.012;
              p.vx += (dx / d) * f;
              p.vy += (dy / d) * f;
            }
          }
          // Mild damping keeps velocities bounded.
          p.vx *= 0.995;
          p.vy *= 0.995;
          p.x += p.vx;
          p.y += p.vy;
          if (p.x < 0 || p.x > width) p.vx *= -1;
          if (p.y < 0 || p.y > height) p.vy *= -1;
          p.x = Math.min(width, Math.max(0, p.x));
          p.y = Math.min(height, Math.max(0, p.y));
        }
      }

      // Links first so dots render on top.
      for (let i = 0; i < particles.length; i++) {
        const a = particles[i]!;
        for (let j = i + 1; j < particles.length; j++) {
          const b = particles[j]!;
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (d2 > LINK * LINK) continue;
          const t = 1 - Math.sqrt(d2) / LINK;
          const mix = a.x / Math.max(1, width);
          const r = Math.round(rgbA[0] + (rgbB[0] - rgbA[0]) * mix);
          const g = Math.round(rgbA[1] + (rgbB[1] - rgbA[1]) * mix);
          const bl = Math.round(rgbA[2] + (rgbB[2] - rgbA[2]) * mix);
          ctx.strokeStyle = `rgba(${r},${g},${bl},${(t * 0.35).toFixed(3)})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }

      for (const p of particles) {
        const mix = p.x / Math.max(1, width);
        const r = Math.round(rgbA[0] + (rgbB[0] - rgbA[0]) * mix);
        const g = Math.round(rgbA[1] + (rgbB[1] - rgbA[1]) * mix);
        const bl = Math.round(rgbA[2] + (rgbB[2] - rgbA[2]) * mix);
        ctx.fillStyle = `rgba(${r},${g},${bl},0.9)`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const loop = () => {
      raf = 0;
      draw(true);
      if (visible && !document.hidden) raf = requestAnimationFrame(loop);
    };

    const start = () => {
      if (reduced) {
        draw(false);
        return;
      }
      if (!raf) raf = requestAnimationFrame(loop);
    };

    readColors();
    resize();
    start();

    const onPointerMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = e.clientX - rect.left;
      pointer.y = e.clientY - rect.top;
      pointer.active =
        pointer.x >= 0 && pointer.y >= 0 && pointer.x <= width && pointer.y <= height;
    };
    const onPointerLeave = () => {
      pointer.active = false;
    };
    const onVisibility = () => start();

    const ro = new ResizeObserver(() => {
      resize();
      if (reduced) draw(false);
    });
    ro.observe(canvas);

    const io = new IntersectionObserver(([entry]) => {
      visible = entry?.isIntersecting ?? true;
      if (visible) start();
    });
    io.observe(canvas);

    const mo = new MutationObserver(() => {
      readColors();
      if (reduced) draw(false);
    });
    mo.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("pointerleave", onPointerLeave);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      mo.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerleave", onPointerLeave);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [reduced]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 h-full w-full", className)}
    />
  );
}
