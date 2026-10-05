"use client";

import { useEffect, useRef, type PointerEvent } from "react";
import { metrics, type MetricKey, type Sample } from "./stream";
import { fitCanvas, resolveColor } from "./sparkline";

interface Props {
  samples: Sample[];
  visible: Record<MetricKey, boolean>;
}

/**
 * Multi-series canvas chart. Each series is normalised to its own range so
 * four very different scales can share one plot. Hover draws a crosshair and
 * a value tooltip directly on the canvas, so pointer moves never re-render
 * React. Redraws are coalesced to one per animation frame.
 */
export function LineChart({ samples, visible }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);
  const hoverRef = useRef<number | null>(null);
  const drawRef = useRef<() => void>(() => {});
  const rafRef = useRef(0);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const draw = () => {
      const { width, height } = fitCanvas(canvas, ctx);
      ctx.clearRect(0, 0, width, height);
      const padL = 8;
      const padR = 8;
      const padT = 12;
      const padB = 22;
      const w = width - padL - padR;
      const h = height - padT - padB;
      const n = samples.length;
      if (n < 2) return;

      const grid = resolveColor(canvas, "--grid-line");
      const muted = resolveColor(canvas, "--fg-subtle");
      const x = (i: number) => padL + (i / (n - 1)) * w;

      // Horizontal grid lines
      ctx.strokeStyle = grid;
      ctx.lineWidth = 1;
      for (let g = 0; g <= 4; g++) {
        const gy = padT + (g / 4) * h;
        ctx.beginPath();
        ctx.moveTo(padL, gy);
        ctx.lineTo(width - padR, gy);
        ctx.stroke();
      }

      // Time labels
      ctx.fillStyle = muted;
      ctx.font = "10px ui-monospace, SFMono-Regular, Menlo, monospace";
      ctx.textBaseline = "top";
      const fmt = (t: number) =>
        new Date(t).toLocaleTimeString("en-GB", { hour12: false, minute: "2-digit", second: "2-digit" });
      ctx.textAlign = "left";
      ctx.fillText(fmt(samples[0]!.t), padL, height - padB + 8);
      ctx.textAlign = "right";
      ctx.fillText(fmt(samples[n - 1]!.t), width - padR, height - padB + 8);

      // Series
      for (const m of metrics) {
        if (!visible[m.key]) continue;
        const vals = samples.map((s) => s[m.key]);
        const lo = Math.min(...vals);
        const hi = Math.max(...vals);
        const span = hi - lo || 1;
        const y = (v: number) => padT + h - ((v - lo) / span) * h;
        const color = resolveColor(canvas, m.color);

        ctx.beginPath();
        vals.forEach((v, i) => (i === 0 ? ctx.moveTo(x(i), y(v)) : ctx.lineTo(x(i), y(v))));
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.75;
        ctx.lineJoin = "round";
        ctx.stroke();

        const grad = ctx.createLinearGradient(0, padT, 0, padT + h);
        grad.addColorStop(0, `color-mix(in oklab, ${color} 18%, transparent)`);
        grad.addColorStop(1, `color-mix(in oklab, ${color} 0%, transparent)`);
        ctx.lineTo(x(n - 1), padT + h);
        ctx.lineTo(x(0), padT + h);
        ctx.closePath();
        ctx.fillStyle = grad;
        ctx.fill();
      }

      // Hover crosshair + tooltip
      const hi = hoverRef.current;
      if (hi !== null && hi >= 0 && hi < n) {
        const hx = x(hi);
        ctx.strokeStyle = muted;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(hx, padT);
        ctx.lineTo(hx, padT + h);
        ctx.stroke();
        ctx.setLineDash([]);

        const s = samples[hi]!;
        const lines = metrics
          .filter((m) => visible[m.key])
          .map((m) => ({ text: `${m.label}  ${m.format(s[m.key])}`, color: resolveColor(canvas, m.color) }));
        ctx.font = "11px ui-monospace, SFMono-Regular, Menlo, monospace";
        const boxW = Math.max(...lines.map((l) => ctx.measureText(l.text).width), 60) + 28;
        const boxH = lines.length * 16 + 26;
        const bx = hx + 12 + boxW > width ? hx - 12 - boxW : hx + 12;
        const by = padT + 4;
        ctx.fillStyle = resolveColor(canvas, "--surface-strong");
        ctx.strokeStyle = resolveColor(canvas, "--border-strong");
        ctx.beginPath();
        ctx.roundRect(bx, by, boxW, boxH, 8);
        ctx.fill();
        ctx.stroke();
        ctx.textAlign = "left";
        ctx.textBaseline = "top";
        ctx.fillStyle = muted;
        ctx.fillText(fmt(s.t), bx + 10, by + 8);
        lines.forEach((l, i) => {
          ctx.fillStyle = l.color;
          ctx.beginPath();
          ctx.arc(bx + 13, by + 30 + i * 16, 3, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = resolveColor(canvas, "--fg");
          ctx.fillText(l.text, bx + 22, by + 24 + i * 16);
        });
      }
    };

    drawRef.current = draw;
    draw();
    const ro = new ResizeObserver(draw);
    ro.observe(canvas);
    const mo = new MutationObserver(draw);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => {
      ro.disconnect();
      mo.disconnect();
    };
  }, [samples, visible]);

  const schedule = () => {
    if (rafRef.current) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = 0;
      drawRef.current();
    });
  };

  const onMove = (e: PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const t = (e.clientX - rect.left - 8) / (rect.width - 16);
    hoverRef.current = Math.round(Math.min(1, Math.max(0, t)) * (samples.length - 1));
    schedule();
  };

  const onLeave = () => {
    hoverRef.current = null;
    schedule();
  };

  return (
    <canvas
      ref={ref}
      role="img"
      aria-label="Live metrics over the last two minutes"
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className="block h-64 w-full cursor-crosshair touch-none md:h-72"
    />
  );
}
