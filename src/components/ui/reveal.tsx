"use client";

import {
  useEffect,
  useRef,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";

/* One shared IntersectionObserver for every <Reveal> on the page. */
let observer: IntersectionObserver | null = null;
const callbacks = new WeakMap<Element, () => void>();

function getObserver() {
  if (observer) return observer;
  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        callbacks.get(entry.target)?.();
        callbacks.delete(entry.target);
        observer?.unobserve(entry.target);
      }
    },
    { rootMargin: "0px 0px -6% 0px", threshold: 0.08 },
  );
  return observer;
}

export function observeOnce(el: Element, cb: () => void) {
  callbacks.set(el, cb);
  getObserver().observe(el);
  return () => {
    callbacks.delete(el);
    observer?.unobserve(el);
  };
}

type Tag =
  | "div"
  | "section"
  | "article"
  | "li"
  | "ul"
  | "span"
  | "p"
  | "h1"
  | "h2"
  | "h3"
  | "figure";

interface Props extends HTMLAttributes<HTMLElement> {
  as?: Tag;
  /** Stagger delay in ms. */
  delay?: number;
  children?: ReactNode;
}

/**
 * Fades + slides children in the first time they enter the viewport. Uses
 * the `.reveal` utility (globals.css) and flips a data attribute directly on
 * the DOM node, so there is no React re-render per element.
 */
export function Reveal({
  as = "div",
  delay = 0,
  className,
  style,
  children,
  ...rest
}: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    return observeOnce(el, () => el.setAttribute("data-inview", ""));
  }, []);

  const mergedStyle = {
    ...style,
    "--reveal-delay": `${delay}ms`,
  } as CSSProperties;

  // All supported tags accept the same global attributes, so typing the
  // polymorphic element as a <div> is safe here.
  const Tag = as as "div";

  return (
    <Tag ref={ref} className={cn("reveal", className)} style={mergedStyle} {...rest}>
      {children}
    </Tag>
  );
}
