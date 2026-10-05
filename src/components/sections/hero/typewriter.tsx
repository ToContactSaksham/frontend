"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";

interface Props {
  words: readonly string[];
  className?: string;
  typingMs?: number;
  deletingMs?: number;
  holdMs?: number;
}

interface State {
  index: number;
  text: string;
  deleting: boolean;
}

/**
 * Types, holds, deletes and cycles through `words`. Screen readers get the
 * full static list; the animated text is aria-hidden. With reduced motion
 * the first word is shown statically.
 */
export function Typewriter({
  words,
  className,
  typingMs = 65,
  deletingMs = 35,
  holdMs = 1700,
}: Props) {
  const reduced = useReducedMotion();
  const [state, setState] = useState<State>({ index: 0, text: "", deleting: false });

  useEffect(() => {
    if (reduced || words.length === 0) return;
    const word = words[state.index % words.length]!;

    let delay = state.deleting ? deletingMs : typingMs;
    if (!state.deleting && state.text === word) delay = holdMs;
    else if (state.deleting && state.text === "") delay = 350;
    // Slight human-like jitter.
    delay += Math.random() * 30;

    const t = window.setTimeout(() => {
      setState((s) => {
        const w = words[s.index % words.length]!;
        if (!s.deleting) {
          if (s.text === w) return { ...s, deleting: true };
          return { ...s, text: w.slice(0, s.text.length + 1) };
        }
        if (s.text === "") {
          return { index: (s.index + 1) % words.length, text: "", deleting: false };
        }
        return { ...s, text: w.slice(0, s.text.length - 1) };
      });
    }, delay);

    return () => window.clearTimeout(t);
  }, [state, words, reduced, typingMs, deletingMs, holdMs]);

  const display = reduced ? (words[0] ?? "") : state.text;

  return (
    <span className={cn("inline-flex items-baseline", className)}>
      <span className="sr-only">{words.join(", ")}</span>
      <span aria-hidden className="text-gradient animate-gradient">
        {display}
      </span>
      <span
        aria-hidden
        className="ml-1 inline-block h-[0.9em] w-[3px] translate-y-[0.08em] rounded-sm bg-accent animate-blink"
      />
    </span>
  );
}
