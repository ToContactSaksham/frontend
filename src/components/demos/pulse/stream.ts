/**
 * Deterministic + live data generators for the Pulse dashboard demo.
 * Seed data uses a seeded PRNG so initial render is pure; live updates use
 * Math.random inside interval callbacks.
 */

export interface Sample {
  t: number;
  users: number;
  rpm: number;
  errorRate: number;
  p95: number;
}

export type MetricKey = Exclude<keyof Sample, "t">;

export interface MetricDef {
  key: MetricKey;
  label: string;
  /** CSS custom property name used for the series colour. */
  color: string;
  /** Whether an increase is good (users, rpm) or bad (errors, latency). */
  upIsGood: boolean;
  format: (v: number) => string;
}

export const metrics: MetricDef[] = [
  {
    key: "users",
    label: "Active users",
    color: "--accent",
    upIsGood: true,
    format: (v) => Math.round(v).toLocaleString("en"),
  },
  {
    key: "rpm",
    label: "Requests / min",
    color: "--accent-2",
    upIsGood: true,
    format: (v) =>
      new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(v),
  },
  {
    key: "errorRate",
    label: "Error rate",
    color: "--accent-3",
    upIsGood: false,
    format: (v) => `${v.toFixed(2)}%`,
  },
  {
    key: "p95",
    label: "p95 latency",
    color: "--warning",
    upIsGood: false,
    format: (v) => `${Math.round(v)} ms`,
  },
];

/** mulberry32: tiny seeded PRNG for reproducible seed data. */
export function prng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function walk(prev: number, min: number, max: number, vol: number, rnd: () => number) {
  const next = prev + (rnd() - 0.5) * vol * (max - min);
  return Math.min(max, Math.max(min, next));
}

export function nextSample(prev: Sample | undefined, t: number, rnd: () => number = Math.random): Sample {
  if (!prev) return { t, users: 1240, rpm: 8600, errorRate: 0.42, p95: 180 };
  return {
    t,
    users: walk(prev.users, 400, 3000, 0.05, rnd),
    rpm: walk(prev.rpm, 2000, 20000, 0.05, rnd),
    errorRate: walk(prev.errorRate, 0.05, 3, 0.07, rnd),
    p95: walk(prev.p95, 80, 600, 0.06, rnd),
  };
}

export function seedSamples(n: number, now: number, stepMs: number) {
  const rnd = prng(42);
  const out: Sample[] = [];
  for (let i = 0; i < n; i++) {
    out.push(nextSample(out[i - 1], now - (n - i) * stepMs, rnd));
  }
  return out;
}

export type EventType = "pageview" | "api" | "signup" | "purchase" | "error";

export interface EventRow {
  id: number;
  at: number;
  type: EventType;
  path: string;
  user: string;
  region: string;
  status: number;
  ms: number;
}

const PATHS = [
  "/",
  "/pricing",
  "/docs/getting-started",
  "/api/v2/orders",
  "/api/v2/events",
  "/checkout",
  "/blog/launch-week",
  "/dashboard",
  "/settings/billing",
  "/signup",
];
const REGIONS = ["iad", "fra", "sin", "syd", "gru", "bom", "lhr"];

export function makeRow(id: number, at: number, rnd: () => number = Math.random): EventRow {
  const r = rnd();
  const type: EventType =
    r < 0.55 ? "pageview" : r < 0.82 ? "api" : r < 0.9 ? "signup" : r < 0.96 ? "purchase" : "error";
  const status =
    type === "error" ? [500, 502, 503, 429][Math.floor(rnd() * 4)]! : rnd() < 0.04 ? 404 : type === "signup" || type === "purchase" ? 201 : 200;
  return {
    id,
    at,
    type,
    path:
      type === "api"
        ? PATHS[3 + Math.floor(rnd() * 2)]!
        : type === "signup"
          ? "/signup"
          : type === "purchase"
            ? "/checkout"
            : PATHS[Math.floor(rnd() * PATHS.length)]!,
    user: `u_${Math.floor(rnd() * 46655).toString(36).padStart(3, "0")}`,
    region: REGIONS[Math.floor(rnd() * REGIONS.length)]!,
    status,
    ms: Math.round(20 + rnd() * rnd() * 900),
  };
}

export function seedRows(n: number, now: number) {
  const rnd = prng(7);
  const rows: EventRow[] = [];
  for (let i = 0; i < n; i++) {
    rows.push(makeRow(n - i, now - i * 850, rnd));
  }
  return rows;
}

export const typeTone: Record<EventType, string> = {
  pageview: "text-fg-muted",
  api: "text-accent-2",
  signup: "text-accent",
  purchase: "text-success",
  error: "text-danger",
};
