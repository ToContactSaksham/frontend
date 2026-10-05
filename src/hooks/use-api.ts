"use client";

import { useCallback, useEffect, useState } from "react";
import type { ApiFailure, ApiResponse } from "@/lib/types";

export type ApiError = ApiFailure["error"];

interface Snapshot<T> {
  key: string;
  data: T | null;
  error: ApiError | null;
  status: number;
  durationMs: number;
}

interface Options {
  /** Keep showing the previous result while a new URL loads (default true). */
  keepPreviousData?: boolean;
}

/**
 * Minimal REST client hook for this site's API envelope.
 *
 * - Aborts in-flight requests when the URL changes or the component unmounts.
 * - Loading state is *derived* (current key !== resolved key) instead of being
 *   set synchronously in an effect, which keeps it compiler-friendly.
 * - Exposes HTTP status and round-trip time for the UI to display.
 */
export function useApi<T>(url: string | null, { keepPreviousData = true }: Options = {}) {
  const [nonce, setNonce] = useState(0);
  const key = url ? `${url}#${nonce}` : null;
  const [snap, setSnap] = useState<Snapshot<T> | null>(null);

  useEffect(() => {
    if (!key || !url) return;
    const ctrl = new AbortController();
    const t0 = performance.now();

    (async () => {
      try {
        const res = await fetch(url, {
          signal: ctrl.signal,
          headers: { Accept: "application/json" },
        });
        const json = (await res.json()) as ApiResponse<T>;
        if (ctrl.signal.aborted) return;
        setSnap({
          key,
          data: json.ok ? json.data : null,
          error: json.ok ? null : json.error,
          status: res.status,
          durationMs: Math.round(performance.now() - t0),
        });
      } catch (err) {
        if (ctrl.signal.aborted) return;
        setSnap({
          key,
          data: null,
          error: {
            code: "NETWORK_ERROR",
            message: err instanceof Error ? err.message : "Network error",
          },
          status: 0,
          durationMs: Math.round(performance.now() - t0),
        });
      }
    })();

    return () => ctrl.abort();
  }, [key, url]);

  const isCurrent = snap !== null && snap.key === key;
  const loading = key !== null && !isCurrent;
  const data = isCurrent ? snap.data : keepPreviousData ? (snap?.data ?? null) : null;

  const refetch = useCallback(() => setNonce((n) => n + 1), []);

  return {
    data,
    error: isCurrent ? snap.error : null,
    loading,
    /** True while new data is loading but old data is still displayed. */
    stale: loading && data !== null,
    status: isCurrent ? snap.status : 0,
    durationMs: isCurrent ? snap.durationMs : 0,
    refetch,
  };
}
