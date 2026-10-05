"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface Props {
  data: number[];
  /** CSS custom property (e.g. "--accent") resolved from the canvas element. */
  color?: string;
  fill?: boolean;
  className?: string;
}

export function resolveColor(el: Element, prop: string) {
  const v = getComputedStyle(el).getPropertyValue(prop).trim();
  return v || "#a78bfa";
}

/** Fits the canvas to its CSS box at device pixel ratio; returns css size. */
export function fitCanvas(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
  const rect = canvas.getBoundingClientRect();
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const w = Math.max(1, Math.round(rect.width * dpr));
  const h = Math.max(1, Math.round(rect.height * dpr));
  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w;
    canvas.height = h;
  }
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { width: rect.width, height: rect.height };
}

/**
 * Tiny canvas sparkline. Redraws when data changes or the element resizes;
 * never causes a React render.
 */
export function Sparkline({ data, color = "--accent", fill = true, className }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const draw = () => {
      const { width, height } = fitCanvas(canvas, ctx);
      ctx.clearRect(0, 0, width, height);
      if (data.length < 2) return;

      const lo = Math.min(...data);
      const hi = Math.max(...data);
      const span = hi - lo || 1;
      const pad = 3;
      const x = (i: number) => (i / (data.length - 1)) * (width - pad * 2) + pad;
      const y = (v: number) => height - pad - ((v - lo) / span) * (height - pad * 2);
      const stroke = resolveColor(canvas, color);

      ctx.beginPath();
      data.forEach((v, i) => (i === 0 ? ctx.moveTo(x(i), y(v)) : ctx.lineTo(x(i), y(v))));

      if (fill) {
        const grad = ctx.createLinearGradient(0, 0, 0, height);
        grad.addColorStop(0, `color-mix(in oklab, ${stroke} 35%, transparent)`);
        grad.addColorStop(1, `color-mix(in oklab, ${stroke} 0%, transparent)`);
        ctx.save();
        ctx.lineTo(x(data.length - 1), height);
        ctx.lineTo(x(0), height);
        ctx.closePath();
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.restore();
        ctx.beginPath();
        data.forEach((v, i) => (i === 0 ? ctx.moveTo(x(i), y(v)) : ctx.lineTo(x(i), y(v))));
      }

      ctx.strokeStyle = stroke;
      ctx.lineWidth = 1.75;
      ctx.lineJoin = "round";
      ctx.lineCap = "round";
      ctx.stroke();

      // End dot
      const last = data[data.length - 1]!;
      ctx.fillStyle = stroke;
      ctx.beginPath();
      ctx.arc(x(data.length - 1), y(last), 2.5, 0, Math.PI * 2);
      ctx.fill();
    };

    draw();
    const ro = new ResizeObserver(draw);
    ro.observe(canvas);
    const mo = new MutationObserver(draw);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => {
      ro.disconnect();
      mo.disconnect();
    };
  }, [data, color, fill]);

  return <canvas ref={ref} aria-hidden className={cn("block h-12 w-full", className)} />;
}
