"use client";

import { useApi } from "@/hooks/use-api";
import { cn } from "@/lib/utils";

interface Health {
  status: string;
  uptimeSec: number;
  version: string;
}

/** Tiny live indicator in the footer that pings GET /api/health. */
export function ApiStatus() {
  const { data, loading, error, durationMs } = useApi<Health>("/api/health");

  const state = loading ? "loading" : error ? "down" : "up";
  const label =
    state === "loading"
      ? "Checking API…"
      : state === "down"
        ? "API unreachable"
        : `API healthy · ${durationMs} ms`;

  return (
    <a
      href="/api/health"
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 font-mono text-xs text-fg-muted transition hover:text-fg"
      title={data ? `v${data.version} · up ${data.uptimeSec}s` : undefined}
    >
      <span className="relative flex h-2 w-2">
        {state === "up" && (
          <span className="absolute inline-flex h-full w-full animate-pulse-ring rounded-full bg-success" />
        )}
        <span
          className={cn(
            "relative inline-flex h-2 w-2 rounded-full",
            state === "loading" && "animate-pulse bg-warning",
            state === "down" && "bg-danger",
            state === "up" && "bg-success",
          )}
        />
      </span>
      {label}
    </a>
  );
}
