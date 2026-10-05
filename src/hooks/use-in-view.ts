"use client";

import { useEffect, useRef, useState } from "react";

interface Options {
  /** Stop observing after the first intersection (default true). */
  once?: boolean;
  rootMargin?: string;
  threshold?: number | number[];
}

/**
 * Track whether an element is in the viewport using IntersectionObserver.
 * Returns a ref to attach and a boolean. State only changes inside the
 * observer callback, never synchronously in the effect body.
 */
export function useInView<T extends Element = HTMLDivElement>({
  once = true,
  rootMargin = "0px 0px -10% 0px",
  threshold = 0.2,
}: Options = {}) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setInView(true);
            if (once) io.unobserve(entry.target);
          } else if (!once) {
            setInView(false);
          }
        }
      },
      { rootMargin, threshold },
    );

    io.observe(el);
    return () => io.disconnect();
  }, [once, rootMargin, threshold]);

  return { ref, inView };
}
