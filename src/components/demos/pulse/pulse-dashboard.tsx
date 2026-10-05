"use client";

import { useEffect, useMemo, useState } from "react";
import { Activity, Pause, Play, TrendingDown, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sparkline } from "./sparkline";
import { LineChart } from "./line-chart";
import { VirtualTable } from "./virtual-table";
import {
  makeRow,
  metrics,
  nextSample,
  seedRows,
  seedSamples,
  typeTone,
  type EventType,
  type MetricKey,
  type Sample,
} from "./stream";

const WINDOW = 120;
const MAX_ROWS = 5000;
const BASE_MS = 600;
const SPEEDS = [0.5, 1, 2, 4] as const;
const TYPES: EventType[] = ["pageview", "api", "signup", "purchase", "error"];

interface InitialState {
  samples: Sample[];
  rows: ReturnType<typeof seedRows>;
}

/**
 * Rendered client-only (see loader.tsx) because it is time- and
 * randomness-driven; `initial` is produced once by the loader so the
 * component body stays pure.
 */
export function PulseDashboard({ initial }: { initial: InitialState }) {
  const [samples, setSamples] = useState(initial.samples);
  const [rows, setRows] = useState(initial.rows);
  const [paused, setPaused] = useState(false);
  const [speed, setSpeed] = useState<(typeof SPEEDS)[number]>(1);
  const [fps, setFps] = useState(0);
  const [visible, setVisible] = useState<Record<MetricKey, boolean>>({
    users: true,
    rpm: true,
    errorRate: true,
    p95: false,
  });
  const [typeFilter, setTypeFilter] = useState<EventType | "all">("all");
  const [query, setQuery] = useState("");

  /* Live stream */
  useEffect(() => {
    if (paused) return;
    const id = window.setInterval(() => {
      if (document.hidden) return;
      const now = Date.now();
      setSamples((s) => [...s.slice(-(WINDOW - 1)), nextSample(s[s.length - 1], now)]);
      setRows((r) => {
        const burst = 1 + Math.floor(Math.random() * 3);
        const nextId = (r[0]?.id ?? 0) + burst;
        const fresh = Array.from({ length: burst }, (_, i) => makeRow(nextId - i, now - i * 90));
        return [...fresh, ...r].slice(0, MAX_ROWS);
      });
    }, BASE_MS / speed);
    return () => window.clearInterval(id);
  }, [paused, speed]);

  /* FPS meter */
  useEffect(() => {
    let frames = 0;
    let last = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      frames += 1;
      if (t - last >= 1000) {
        setFps(Math.round((frames * 1000) / (t - last)));
        frames = 0;
        last = t;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const latest = samples[samples.length - 1]!;
  const compare = samples[Math.max(0, samples.length - 31)]!;

  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter(
      (r) => (typeFilter === "all" || r.type === typeFilter) && (!q || r.path.includes(q) || r.user.includes(q)),
    );
  }, [rows, typeFilter, query]);

  const topPaths = useMemo(() => {
    const counts = new Map<string, number>();
    for (const r of rows) counts.set(r.path, (counts.get(r.path) ?? 0) + 1);
    const list = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 7);
    const max = list[0]?.[1] ?? 1;
    return list.map(([path, count]) => ({ path, count, pct: (count / max) * 100 }));
  }, [rows]);

  const errorsByType = useMemo(() => {
    const counts: Record<EventType, number> = { pageview: 0, api: 0, signup: 0, purchase: 0, error: 0 };
    for (const r of rows) counts[r.type] += 1;
    return counts;
  }, [rows]);

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <span
          className={cn(
            "inline-flex items-center gap-2 rounded-full border px-3 py-1 font-mono text-xs",
            paused ? "border-border text-fg-muted" : "border-success/40 bg-success/10 text-success",
          )}
        >
          <span className="relative flex h-2 w-2">
            {!paused && <span className="absolute inline-flex h-full w-full animate-pulse-ring rounded-full bg-success" />}
            <span className={cn("relative inline-flex h-2 w-2 rounded-full", paused ? "bg-fg-subtle" : "bg-success")} />
          </span>
          {paused ? "PAUSED" : "LIVE"}
        </span>

        <Button variant="outline" size="sm" onClick={() => setPaused((p) => !p)} aria-pressed={paused}>
          {paused ? <Play size={14} aria-hidden /> : <Pause size={14} aria-hidden />}
          {paused ? "Resume" : "Pause"}
        </Button>

        <div role="radiogroup" aria-label="Stream speed" className="flex rounded-full border border-border p-1">
          {SPEEDS.map((s) => (
            <button
              key={s}
              type="button"
              role="radio"
              aria-checked={speed === s}
              onClick={() => setSpeed(s)}
              className={cn(
                "rounded-full px-3 py-1 font-mono text-xs transition",
                speed === s ? "bg-fg text-bg" : "text-fg-muted hover:text-fg",
              )}
            >
              {s}×
            </button>
          ))}
        </div>

        <span className="ml-auto inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 font-mono text-xs text-fg-muted">
          <Activity size={12} aria-hidden className={fps >= 55 ? "text-success" : fps >= 30 ? "text-warning" : "text-danger"} />
          {fps} fps
        </span>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((m) => {
          const now = latest[m.key];
          const before = compare[m.key];
          const delta = before ? ((now - before) / before) * 100 : 0;
          const good = m.upIsGood ? delta >= 0 : delta <= 0;
          return (
            <div key={m.key} className="card p-5">
              <p className="text-xs text-fg-muted">{m.label}</p>
              <div className="mt-1 flex items-end justify-between gap-2">
                <p className="text-2xl font-semibold tabular-nums tracking-tight">{m.format(now)}</p>
                <p
                  className={cn(
                    "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 font-mono text-[11px] tabular-nums",
                    good ? "bg-success/10 text-success" : "bg-danger/10 text-danger",
                  )}
                  aria-label={`${Math.abs(delta).toFixed(1)} percent ${delta >= 0 ? "up" : "down"} over 30 seconds`}
                >
                  {delta >= 0 ? <TrendingUp size={12} aria-hidden /> : <TrendingDown size={12} aria-hidden />}
                  {Math.abs(delta).toFixed(1)}%
                </p>
              </div>
              <Sparkline data={samples.slice(-60).map((s) => s[m.key])} color={m.color} className="mt-3" />
            </div>
          );
        })}
      </div>

      {/* Chart + breakdowns */}
      <div className="grid gap-4 lg:grid-cols-[1.7fr_1fr]">
        <div className="card p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-semibold">Traffic & health</h2>
            <div className="flex flex-wrap gap-1.5" role="group" aria-label="Toggle series">
              {metrics.map((m) => (
                <button
                  key={m.key}
                  type="button"
                  aria-pressed={visible[m.key]}
                  onClick={() => setVisible((v) => ({ ...v, [m.key]: !v[m.key] }))}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition",
                    visible[m.key] ? "border-border-strong text-fg" : "border-border text-fg-subtle line-through",
                  )}
                >
                  <span className="h-2 w-2 rounded-full" style={{ background: `var(${m.color})` }} />
                  {m.label}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-4">
            <LineChart samples={samples} visible={visible} />
          </div>
          <p className="mt-2 font-mono text-[10px] text-fg-subtle">
            Each series is normalised to its own range · hover for values · {samples.length} points
          </p>
        </div>

        <div className="grid gap-4">
          <div className="card p-5">
            <h2 className="font-semibold">Top paths</h2>
            <ul className="mt-3 space-y-2">
              {topPaths.map((p) => (
                <li key={p.path} className="text-xs">
                  <div className="flex justify-between font-mono">
                    <span className="truncate text-fg">{p.path}</span>
                    <span className="text-fg-muted tabular-nums">{p.count}</span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-surface-hover">
                    <div
                      className="h-full rounded-full bg-[linear-gradient(90deg,var(--accent),var(--accent-2))] transition-[width] duration-700 ease-out-expo"
                      style={{ width: `${p.pct}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className="card p-5">
            <h2 className="font-semibold">Events by type</h2>
            <ul className="mt-3 grid grid-cols-2 gap-2 text-xs">
              {TYPES.map((t) => (
                <li key={t} className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
                  <span className={cn("font-mono font-semibold", typeTone[t])}>{t}</span>
                  <span className="tabular-nums text-fg-muted">{errorsByType[t].toLocaleString("en")}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-semibold">Event stream</h2>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex flex-wrap gap-1" role="group" aria-label="Filter by type">
              {(["all", ...TYPES] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  aria-pressed={typeFilter === t}
                  onClick={() => setTypeFilter(t)}
                  className={cn(
                    "rounded-full border px-2.5 py-1 font-mono text-[11px] transition",
                    typeFilter === t ? "border-fg bg-fg text-bg" : "border-border text-fg-muted hover:text-fg",
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter path or user…"
              aria-label="Filter events"
              className="h-8 w-44 rounded-full border border-border bg-bg px-3 font-mono text-xs outline-none focus:border-accent"
            />
          </div>
        </div>
        <div className="mt-4">
          <VirtualTable rows={filteredRows} />
        </div>
      </div>
    </div>
  );
}

/** Factory used by the client-only loader so seeding happens once, off-render. */
export function createInitialState(): InitialState {
  const now = Date.now();
  return { samples: seedSamples(WINDOW, now, BASE_MS), rows: seedRows(1500, now) };
}
