import { NextResponse } from "next/server";
import type {
  ApiFailure,
  ApiFieldError,
  ApiMeta,
  ApiSuccess,
} from "@/lib/types";

/**
 * Helpers that give every endpoint the same response envelope:
 *
 *   { ok: true,  data, meta }          on success
 *   { ok: false, error: {...}, meta }  on failure
 *
 * `meta` always carries a request id, timestamp and server duration so
 * clients (and the API Playground on the page) can show latency and
 * correlate logs.
 */

export const CACHE_HEADERS = {
  /** Static-ish content that rarely changes. */
  content: "public, s-maxage=300, stale-while-revalidate=86400",
  /** Third-party data we proxy. */
  proxy: "public, s-maxage=3600, stale-while-revalidate=86400",
  /** Never cache (mutations, errors, fallbacks). */
  none: "no-store",
} as const;

export function requestId() {
  return typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);
}

export function createMeta(
  startedAt: number,
  extra?: Record<string, unknown>,
): ApiMeta {
  return {
    requestId: requestId(),
    timestamp: new Date().toISOString(),
    durationMs: Math.round((performance.now() - startedAt) * 100) / 100,
    ...extra,
  };
}

interface OkInit {
  status?: number;
  cache?: keyof typeof CACHE_HEADERS;
  headers?: Record<string, string>;
  meta?: Record<string, unknown>;
}

export function ok<T>(data: T, startedAt: number, init: OkInit = {}) {
  const meta = createMeta(startedAt, init.meta);
  const body: ApiSuccess<T> = { ok: true, data, meta };
  return NextResponse.json(body, {
    status: init.status ?? 200,
    headers: {
      "Cache-Control": CACHE_HEADERS[init.cache ?? "none"],
      "X-Request-Id": meta.requestId,
      ...init.headers,
    },
  });
}

export function fail(
  code: string,
  message: string,
  status: number,
  startedAt: number,
  fields?: ApiFieldError[],
  headers?: Record<string, string>,
) {
  const meta = createMeta(startedAt);
  const body: ApiFailure = {
    ok: false,
    error: { code, message, ...(fields?.length ? { fields } : {}) },
    meta,
  };
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": CACHE_HEADERS.none,
      "X-Request-Id": meta.requestId,
      ...headers,
    },
  });
}

/** Parse an integer query param with bounds and a fallback. */
export function intParam(
  params: URLSearchParams,
  key: string,
  fallback: number,
  min: number,
  max: number,
) {
  const raw = params.get(key);
  if (raw === null || raw.trim() === "") return fallback;
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(Math.max(n, min), max);
}

/** Parse a boolean query param ("true" | "1" | "false" | "0"). */
export function boolParam(params: URLSearchParams, key: string) {
  const raw = params.get(key);
  if (raw === null) return undefined;
  if (["1", "true", "yes"].includes(raw.toLowerCase())) return true;
  if (["0", "false", "no"].includes(raw.toLowerCase())) return false;
  return undefined;
}

/** Best-effort client IP for rate limiting behind common proxies. */
export function clientIp(request: Request) {
  const fwd = request.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  return (
    request.headers.get("x-real-ip") ??
    request.headers.get("cf-connecting-ip") ??
    "unknown"
  );
}

/**
 * Tiny in-memory sliding-window rate limiter. Good enough for a portfolio
 * contact form; on serverless platforms each instance has its own window,
 * which is acceptable for abuse mitigation but not for hard quotas.
 */
const buckets = new Map<string, number[]>();

export function rateLimit(
  key: string,
  { limit, windowMs }: { limit: number; windowMs: number },
) {
  const now = Date.now();
  const hits = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);
  const allowed = hits.length < limit;
  if (allowed) hits.push(now);
  buckets.set(key, hits);

  // Opportunistic cleanup so the map cannot grow without bound.
  if (buckets.size > 5000) {
    for (const [k, v] of buckets) {
      if (v.every((t) => now - t >= windowMs)) buckets.delete(k);
    }
  }

  const oldest = hits[0] ?? now;
  return {
    allowed,
    remaining: Math.max(0, limit - hits.length),
    retryAfterSec: allowed ? 0 : Math.ceil((oldest + windowMs - now) / 1000),
  };
}
