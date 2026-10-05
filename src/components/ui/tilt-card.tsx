"use client";

import { useRef, type HTMLAttributes, type PointerEvent } from "react";
import { useCanHover, useReducedMotion } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";

interface Props extends HTMLAttributes<HTMLDivElement> {
  /** Max rotation in degrees (default 7). */
  max?: number;
}

/**
 * 3D tilt + pointer spotlight. Writes CSS custom properties consumed by the
 * `tilt` and `spotlight` utilities in globals.css, so React never re-renders
 * on pointer move.
 */
export function TiltCard({ max = 7, className, children, ...rest }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const canHover = useCanHover();
  const reduced = useReducedMotion();
  const enabled = canHover && !reduced;

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    el.style.setProperty("--mx", `${(px * 100).toFixed(2)}%`);
    el.style.setProperty("--my", `${(py * 100).toFixed(2)}%`);
    el.style.setProperty("--spot-o", "1");
    if (!enabled) return;
    el.style.setProperty("--ry", `${((px - 0.5) * max * 2).toFixed(2)}deg`);
    el.style.setProperty("--rx", `${((0.5 - py) * max * 2).toFixed(2)}deg`);
    el.style.setProperty("--s", "1.015");
  };

  const onLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
    el.style.setProperty("--s", "1");
    el.style.setProperty("--spot-o", "0");
  };

  return (
    <div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className={cn("tilt spotlight relative", className)}
      {...rest}
    >
      {children}
    </div>
  );
}
