"use client";

import { useRef, type PointerEvent, type ReactNode } from "react";
import { useCanHover, useReducedMotion } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";

interface Props {
  children: ReactNode;
  /** 0–1: how strongly the element follows the pointer (default 0.35). */
  strength?: number;
  className?: string;
}

/**
 * Pulls its child toward the pointer while hovered and springs back on
 * leave. Pure DOM transforms (no React state per frame). Disabled on touch
 * devices and for users who prefer reduced motion.
 */
export function Magnetic({ children, strength = 0.35, className }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const canHover = useCanHover();
  const reduced = useReducedMotion();
  const enabled = canHover && !reduced;

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!enabled) return;
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = e.clientX - (r.left + r.width / 2);
    const y = e.clientY - (r.top + r.height / 2);
    el.style.transform = `translate3d(${x * strength}px, ${y * strength}px, 0)`;
  };

  const onLeave = () => {
    const el = ref.current;
    if (el) el.style.transform = "";
  };

  return (
    <div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className={cn(
        "inline-block will-change-transform transition-transform duration-500 ease-spring",
        className,
      )}
    >
      {children}
    </div>
  );
}
