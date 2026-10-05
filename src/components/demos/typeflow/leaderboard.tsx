"use client";

import { useState, type FormEvent } from "react";
import { Trophy } from "lucide-react";
import { useApi } from "@/hooks/use-api";
import type { ApiResponse } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { Score } from "@/app/api/demos/typeflow/scores/route";

interface Props {
  result: { wpm: number; accuracy: number } | null;
}

export function Leaderboard({ result }: Props) {
  const { data, loading, refetch } = useApi<{ items: Score[]; total: number }>("/api/demos/typeflow/scores");
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [mine, setMine] = useState<{ id: string; rank: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!result) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/demos/typeflow/scores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, wpm: result.wpm, accuracy: result.accuracy }),
      });
      const json = (await res.json()) as ApiResponse<{ entry: Score; rank: number }>;
      if (!json.ok) {
        setError(json.error.fields?.[0]?.message ?? json.error.message);
        return;
      }
      setMine({ id: json.data.entry.id, rank: json.data.rank });
      refetch();
    } catch {
      setError("Network error. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="card p-5">
      <h3 className="flex items-center gap-2 font-semibold">
        <Trophy size={16} className="text-warning" aria-hidden /> Leaderboard
        <span className="font-mono text-xs font-normal text-fg-subtle">GET /api/demos/typeflow/scores</span>
      </h3>

      {result && !mine && (
        <form onSubmit={submit} className="mt-4 flex gap-2">
          <label className="sr-only" htmlFor="lb-name">
            Your name
          </label>
          <input
            id="lb-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={20}
            placeholder="Your name"
            required
            className="h-10 min-w-0 flex-1 rounded-full border border-border bg-bg px-4 text-sm outline-none focus:border-accent"
          />
          <Button type="submit" size="sm" disabled={submitting || !name.trim()}>
            {submitting ? "Saving…" : `Save ${result.wpm} wpm`}
          </Button>
        </form>
      )}
      {error && <p className="mt-2 text-xs text-danger">{error}</p>}
      {mine && (
        <p className="mt-3 rounded-xl bg-success/10 px-3 py-2 text-sm text-success">
          Saved! You&apos;re ranked #{mine.rank}.
        </p>
      )}

      <ol className="mt-4 space-y-1.5">
        {loading && !data &&
          Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-9 rounded-lg" />)}
        {data?.items.map((s, i) => (
          <li
            key={s.id}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-1.5 text-sm",
              mine?.id === s.id ? "bg-accent-soft text-fg" : "text-fg-muted",
            )}
          >
            <span className="w-5 font-mono text-xs text-fg-subtle">{i + 1}</span>
            <span className="flex-1 truncate">{s.name}</span>
            <span className="font-mono text-xs tabular-nums">{s.wpm} wpm</span>
            <span className="w-14 text-right font-mono text-xs tabular-nums text-fg-subtle">{s.accuracy}%</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
