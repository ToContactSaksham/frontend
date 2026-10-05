"use client";

import { useEffect, useState } from "react";
import { useInView } from "@/hooks/use-in-view";
import { useReducedMotion } from "@/hooks/use-media-query";

interface Props {
  value: number;
  suffix?: string;
  duration?: number;
  className?: string;
}

/** Counts from 0 to `value` with an ease-out curve once scrolled into view. */
export function StatCounter({ value, suffix = "", duration = 1500, className }: Props) {
  const { ref, inView } = useInView<HTMLSpanElement>({ threshold: 0.6 });
  const reduced = useReducedMotion();
  const [n, setN] = useState(0);

  useEffect(() => {
    if (!inView || reduced) return;
    let raf = 0;
    const t0 = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.round(eased * value));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, reduced, value, duration]);

  const shown = reduced ? value : n;

  return (
    <span ref={ref} className={className}>
      <span className="tabular-nums">{shown}</span>
      {suffix}
    </span>
  );
}
