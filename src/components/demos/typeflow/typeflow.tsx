"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
} from "react";
import { RotateCcw, Timer, Target, Gauge } from "lucide-react";
import { cn } from "@/lib/utils";
import { typeflowPassages } from "@/data/demos/typeflow-passages";
import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";
import { Sparkline } from "@/components/demos/pulse/sparkline";
import { KeyHeatmap } from "./key-heatmap";
import { Leaderboard } from "./leaderboard";

interface Keystroke {
  /** performance.now() */
  t: number;
  /** the expected character */
  expected: string;
  correct: boolean;
}

/**
 * Typing trainer with keystroke-accurate stats.
 * - Desktop keys are handled on keydown; mobile/IME input falls through to
 *   onChange so composition and virtual keyboards still work.
 * - The caret is one absolutely positioned element moved with a transform
 *   (FLIP-style), so it glides instead of jumping.
 * - All timing uses state updated in handlers/intervals; nothing impure in render.
 */
export function TypeFlow() {
  const [passageIdx, setPassageIdx] = useState(0);
  const passage = typeflowPassages[passageIdx]!;

  const [typed, setTyped] = useState("");
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [finishedAt, setFinishedAt] = useState<number | null>(null);
  const [now, setNow] = useState(0);
  const [keystrokes, setKeystrokes] = useState<Keystroke[]>([]);
  const [series, setSeries] = useState<number[]>([]);
  const [focused, setFocused] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const caretRef = useRef<HTMLSpanElement>(null);
  const composingRef = useRef(false);
  const latestRef = useRef({ correct: 0, startedAt: null as number | null });

  const running = startedAt !== null && finishedAt === null;
  const done = finishedAt !== null;

  /* Derived stats */
  let correct = 0;
  for (let i = 0; i < typed.length; i++) if (typed[i] === passage[i]) correct += 1;
  const elapsedMs = startedAt === null ? 0 : Math.max(0, (finishedAt ?? now) - startedAt);
  const minutes = elapsedMs / 60000;
  const wpm = minutes > 0 ? Math.round(correct / 5 / minutes) : 0;
  const rawWpm = minutes > 0 ? Math.round(typed.length / 5 / minutes) : 0;
  const accuracy = keystrokes.length
    ? Math.round((keystrokes.filter((k) => k.correct).length / keystrokes.length) * 1000) / 10
    : 100;
  const progress = Math.round((typed.length / passage.length) * 100);

  /* Clock while running */
  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => setNow(Date.now()), 100);
    return () => window.clearInterval(id);
  }, [running]);

  /* Keep latest values in a ref for the sampler (ref writes in effects are fine). */
  useEffect(() => {
    latestRef.current = { correct, startedAt };
  });

  /* Sample WPM once per second for the results chart */
  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      const { correct: c, startedAt: s } = latestRef.current;
      if (s === null) return;
      const m = (Date.now() - s) / 60000;
      setSeries((arr) => [...arr, m > 0 ? Math.round(c / 5 / m) : 0]);
    }, 1000);
    return () => window.clearInterval(id);
  }, [running]);

  /* Move the caret to the current character (FLIP: measure → transform). */
  useLayoutEffect(() => {
    const container = textRef.current;
    const caret = caretRef.current;
    if (!container || !caret) return;
    const target =
      container.querySelector<HTMLElement>(`[data-i="${typed.length}"]`) ??
      container.querySelector<HTMLElement>("[data-end]");
    if (!target) return;
    caret.style.transform = `translate(${target.offsetLeft}px, ${target.offsetTop}px)`;
    caret.style.height = `${target.offsetHeight}px`;
  }, [typed, passageIdx]);

  const restart = (nextPassage = true) => {
    setPassageIdx((i) => (nextPassage ? (i + 1) % typeflowPassages.length : i));
    setTyped("");
    setStartedAt(null);
    setFinishedAt(null);
    setNow(0);
    setKeystrokes([]);
    setSeries([]);
    inputRef.current?.focus();
  };

  /** Process one or more typed characters. */
  const commit = (chars: string) => {
    if (done || !chars) return;
    const t = performance.now();
    let next = typed;
    const strokes: Keystroke[] = [];
    for (const ch of chars) {
      if (next.length >= passage.length) break;
      const expected = passage[next.length]!;
      strokes.push({ t, expected, correct: ch === expected });
      next += ch;
    }
    if (!strokes.length) return;
    const stamp = Date.now();
    if (startedAt === null) {
      setStartedAt(stamp);
      setNow(stamp);
    }
    setKeystrokes((k) => [...k, ...strokes]);
    setTyped(next);
    if (next.length === passage.length) setFinishedAt(stamp);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (composingRef.current || e.nativeEvent.isComposing) return;
    if (e.key === "Tab" || (done && e.key === "Enter")) {
      e.preventDefault();
      restart();
      return;
    }
    if (done) return;
    if (e.key === "Backspace") {
      e.preventDefault();
      setTyped((t) => (e.ctrlKey || e.altKey || e.metaKey ? t.replace(/\S*\s*$/, "") : t.slice(0, -1)));
      return;
    }
    if (e.key.length !== 1 || e.ctrlKey || e.metaKey || e.altKey) return;
    e.preventDefault();
    commit(e.key);
  };

  /* Virtual keyboards / IME deliver text here instead of keydown. */
  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    e.target.value = "";
    if (composingRef.current) return;
    commit(value);
  };

  const errorsByKey = keystrokes.reduce<Record<string, number>>((acc, k) => {
    if (!k.correct) acc[k.expected.toLowerCase()] = (acc[k.expected.toLowerCase()] ?? 0) + 1;
    return acc;
  }, {});

  const words = passage.split(/(?<=\s)/);
  let charIndex = 0;

  return (
    <div className="space-y-5">
      {/* Live stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { icon: Gauge, label: "WPM", value: String(wpm), sub: `${rawWpm} raw` },
          { icon: Target, label: "Accuracy", value: `${accuracy}%`, sub: `${keystrokes.filter((k) => !k.correct).length} misses` },
          { icon: Timer, label: "Time", value: `${(elapsedMs / 1000).toFixed(1)}s`, sub: running ? "running" : done ? "finished" : "ready" },
          { icon: RotateCcw, label: "Progress", value: `${progress}%`, sub: `${typed.length}/${passage.length}` },
        ].map((s) => (
          <div key={s.label} className="card p-4">
            <p className="flex items-center gap-1.5 text-xs text-fg-muted">
              <s.icon size={12} aria-hidden /> {s.label}
            </p>
            <p className="mt-1 text-2xl font-semibold tabular-nums tracking-tight">{s.value}</p>
            <p className="font-mono text-[11px] text-fg-subtle">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Typing surface */}
      <div
        className={cn(
          "card relative cursor-text p-6 transition md:p-8",
          focused ? "border-accent/60 shadow-[0_0_0_4px_var(--accent-soft)]" : "",
        )}
        onClick={() => inputRef.current?.focus()}
      >
        <div className="mb-4 flex items-center justify-between font-mono text-[11px] text-fg-subtle">
          <span>
            passage {passageIdx + 1} / {typeflowPassages.length}
          </span>
          <span className="flex items-center gap-1.5">
            <Kbd>Tab</Kbd> next passage
          </span>
        </div>

        <div className="h-1 w-full overflow-hidden rounded-full bg-surface-hover">
          <div
            className="h-full rounded-full bg-[linear-gradient(90deg,var(--accent),var(--accent-2))] transition-[width] duration-150"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div
          ref={textRef}
          className="relative mt-5 select-none text-xl leading-[1.9] tracking-wide md:text-2xl"
          aria-hidden
        >
          <span
            ref={caretRef}
            className={cn(
              "absolute left-0 top-0 w-[2px] rounded-sm bg-accent transition-transform duration-75 ease-out",
              !focused && "opacity-40",
              running && "",
              !running && focused && "animate-blink",
            )}
          />
          {words.map((word, wi) => (
            <span key={wi} className="inline-block whitespace-pre">
              {word.split("").map((ch) => {
                const i = charIndex++;
                const typedCh = typed[i];
                const state = typedCh === undefined ? "pending" : typedCh === ch ? "ok" : "bad";
                return (
                  <span
                    key={i}
                    data-i={i}
                    className={cn(
                      "rounded-sm transition-colors duration-100",
                      state === "pending" && "text-fg-subtle",
                      state === "ok" && "text-fg",
                      state === "bad" && (ch === " " ? "bg-danger/40" : "text-danger underline decoration-danger/70 underline-offset-4"),
                    )}
                  >
                    {ch}
                  </span>
                );
              })}
            </span>
          ))}
          <span data-end className="inline-block w-0" />
        </div>

        <p className="sr-only" aria-live="polite">
          {done ? `Finished. ${wpm} words per minute at ${accuracy} percent accuracy.` : `${typed.length} of ${passage.length} characters typed.`}
        </p>

        <input
          ref={inputRef}
          type="text"
          aria-label="Typing area: type the passage shown"
          autoCapitalize="off"
          autoCorrect="off"
          autoComplete="off"
          spellCheck={false}
          onKeyDown={onKeyDown}
          onChange={onChange}
          onCompositionStart={() => {
            composingRef.current = true;
          }}
          onCompositionEnd={(e) => {
            composingRef.current = false;
            const v = e.currentTarget.value;
            e.currentTarget.value = "";
            commit(v);
          }}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="absolute inset-0 h-full w-full cursor-text opacity-0"
        />

        {!focused && !done && (
          <div className="pointer-events-none absolute inset-0 grid place-items-center rounded-2xl bg-bg/60 backdrop-blur-[2px]">
            <span className="rounded-full border border-border bg-surface-strong px-4 py-2 text-sm font-medium shadow-md">
              Click here and start typing
            </span>
          </div>
        )}
      </div>

      {/* Results */}
      {done && (
        <div className="grid gap-5 lg:grid-cols-[1.3fr_1fr]">
          <div className="space-y-5">
            <div className="card p-5">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">Result</p>
                  <p className="mt-1 text-4xl font-semibold tracking-tight">
                    {wpm} <span className="text-lg text-fg-muted">wpm</span>
                  </p>
                  <p className="text-sm text-fg-muted">
                    {accuracy}% accuracy · {rawWpm} raw · {(elapsedMs / 1000).toFixed(1)}s
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={() => restart()}>
                  <RotateCcw size={14} aria-hidden /> Next passage
                </Button>
              </div>
              <p className="mt-5 font-mono text-[10px] uppercase tracking-[0.2em] text-fg-subtle">WPM over time</p>
              <Sparkline data={series.length > 1 ? series : [0, wpm]} className="mt-2 h-20" />
            </div>
            <div className="card p-5">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-fg-subtle">Misses by key</p>
              <div className="mt-3 overflow-x-auto pb-1">
                <KeyHeatmap errors={errorsByKey} />
              </div>
            </div>
          </div>
          <Leaderboard result={{ wpm, accuracy }} />
        </div>
      )}
      {!done && <Leaderboard result={null} />}
    </div>
  );
}
