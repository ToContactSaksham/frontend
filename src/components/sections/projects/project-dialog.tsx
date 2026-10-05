"use client";

import { useEffect, useRef } from "react";
import { ArrowUpRight, X } from "lucide-react";
import { useApi } from "@/hooks/use-api";
import type { Project } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

type Detail = Project & {
  related: { slug: string; title: string }[];
  _links: { self: string; collection: string; prev: string | null; next: string | null };
};

interface Props {
  slug: string | null;
  onClose: () => void;
  onNavigate: (slug: string) => void;
}

/**
 * Native <dialog> that lazily fetches GET /api/projects/{slug} when opened.
 * Demonstrates a detail endpoint, HATEOAS-style links and skeleton states
 * inside a modal.
 */
export function ProjectDialog({ slug, onClose, onNavigate }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const { data, loading, error, durationMs } = useApi<Detail>(
    slug ? `/api/projects/${encodeURIComponent(slug)}` : null,
    { keepPreviousData: false },
  );

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (slug && !d.open) d.showModal();
    else if (!slug && d.open) d.close();
  }, [slug]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
      aria-labelledby="project-dialog-title"
      className="fixed left-1/2 top-1/2 m-0 max-h-[88vh] w-[min(94vw,46rem)] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-3xl border-0 bg-transparent p-0 text-fg outline-none open:animate-fade-up"
    >
      <div className="card max-h-[88vh] overflow-y-auto rounded-3xl bg-surface-strong p-0 shadow-lg">
        {/* Header visual */}
        <div
          className="relative h-40 overflow-hidden"
          style={{
            background: data
              ? `linear-gradient(135deg, ${data.gradient[0]}, ${data.gradient[1]})`
              : "var(--surface-hover)",
          }}
        >
          <div aria-hidden className="absolute inset-0 bg-grid opacity-30 mix-blend-overlay" />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur transition hover:bg-black/50"
          >
            <X size={18} aria-hidden />
          </button>
          {data && (
            <p className="absolute bottom-4 left-6 font-mono text-xs uppercase tracking-[0.2em] text-white/80">
              {data.year} · {data.featured ? "Featured" : "Project"}
            </p>
          )}
        </div>

        <div className="p-6 md:p-8">
          {loading && (
            <div className="space-y-4" aria-busy="true" aria-live="polite">
              <Skeleton className="h-8 w-2/3" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <div className="grid gap-2 pt-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-11/12" />
                <Skeleton className="h-4 w-4/5" />
              </div>
            </div>
          )}

          {error && (
            <div>
              <h3 id="project-dialog-title" className="text-xl font-semibold text-danger">
                {error.code}
              </h3>
              <p className="mt-2 text-fg-muted">{error.message}</p>
            </div>
          )}

          {data && !loading && (
            <>
              <h3 id="project-dialog-title" className="text-2xl font-semibold tracking-tight md:text-3xl">
                {data.title}
              </h3>
              <p className="mt-1 text-fg-muted">{data.tagline}</p>

              <div className="mt-4 flex flex-wrap gap-2">
                {data.tags.map((t) => (
                  <Badge key={t} tone="accent">
                    {t}
                  </Badge>
                ))}
              </div>

              <p className="mt-6 leading-7 text-fg-muted">{data.description}</p>

              <h4 className="mt-6 font-mono text-xs uppercase tracking-[0.2em] text-fg-subtle">
                Highlights
              </h4>
              <ul className="mt-3 space-y-2">
                {data.highlights.map((h) => (
                  <li key={h} className="flex gap-3 text-sm leading-6">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" aria-hidden />
                    {h}
                  </li>
                ))}
              </ul>

              {data.metrics && (
                <dl className="mt-6 grid grid-cols-3 gap-px overflow-hidden rounded-2xl border border-border bg-border">
                  {data.metrics.map((m) => (
                    <div key={m.label} className="bg-bg-elevated p-4">
                      <dt className="text-xs text-fg-muted">{m.label}</dt>
                      <dd className="mt-1 text-xl font-semibold tabular-nums">{m.value}</dd>
                    </div>
                  ))}
                </dl>
              )}

              <div className="mt-8 flex flex-wrap items-center gap-3">
                {data.links.map((l) => (
                  <Button key={l.href} href={l.href} variant="outline" size="sm">
                    {l.label} <ArrowUpRight size={14} aria-hidden />
                  </Button>
                ))}
              </div>

              {data.related.length > 0 && (
                <div className="mt-8 border-t border-border pt-6">
                  <p className="font-mono text-xs uppercase tracking-[0.2em] text-fg-subtle">
                    Related
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {data.related.map((r) => (
                      <button
                        key={r.slug}
                        type="button"
                        onClick={() => onNavigate(r.slug)}
                        className="rounded-full border border-border px-3 py-1 text-sm text-fg-muted transition hover:border-border-strong hover:text-fg"
                      >
                        {r.title}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <p className="mt-6 font-mono text-[11px] text-fg-subtle">
                GET {data._links.self} · {durationMs} ms
              </p>
            </>
          )}
        </div>
      </div>
    </dialog>
  );
}
