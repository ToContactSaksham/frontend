"use client";

import { useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowUpRight, Search, SlidersHorizontal, X } from "lucide-react";
import { useApi } from "@/hooks/use-api";
import type { Paginated, Project, ProjectTag } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Section, SectionHeading } from "@/components/ui/section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { TiltCard } from "@/components/ui/tilt-card";
import { Reveal } from "@/components/ui/reveal";
import { ProjectDialog } from "./project-dialog";

type Payload = Paginated<Project> & { availableTags: ProjectTag[] };

const SORTS = [
  { value: "year-desc", label: "Newest" },
  { value: "year-asc", label: "Oldest" },
  { value: "title", label: "A → Z" },
] as const;

/**
 * Filter state lives in the URL (?tag=&q=&sort=) so views are shareable and
 * the back button works. Reads via useSearchParams; writes via the native
 * history API, which Next.js syncs with the router without a server round-trip.
 */
function useUrlFilters() {
  const sp = useSearchParams();
  const tags = sp.getAll("tag") as ProjectTag[];
  const q = sp.get("q") ?? "";
  const sort = sp.get("sort") ?? "year-desc";

  const update = (mutate: (p: URLSearchParams) => void) => {
    const p = new URLSearchParams(window.location.search);
    mutate(p);
    const qs = p.toString();
    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}${qs ? `?${qs}` : ""}${window.location.hash}`,
    );
  };

  return { tags, q, sort, update };
}

export function Projects() {
  const { tags, q, sort, update } = useUrlFilters();
  const [input, setInput] = useState(q);
  const [openSlug, setOpenSlug] = useState<string | null>(null);
  const debounce = useRef<number | undefined>(undefined);

  const params = new URLSearchParams();
  tags.forEach((t) => params.append("tag", t));
  if (q) params.set("q", q);
  if (sort !== "year-desc") params.set("sort", sort);
  params.set("pageSize", "12");
  const url = `/api/projects?${params.toString()}`;

  const { data, loading, stale, error, durationMs, refetch } = useApi<Payload>(url);

  const toggleTag = (tag: ProjectTag) =>
    update((p) => {
      const current = p.getAll("tag");
      p.delete("tag");
      const next = current.includes(tag)
        ? current.filter((t) => t !== tag)
        : [...current, tag];
      next.forEach((t) => p.append("tag", t));
    });

  const onSearch = (value: string) => {
    setInput(value);
    window.clearTimeout(debounce.current);
    debounce.current = window.setTimeout(() => {
      update((p) => {
        if (value.trim()) p.set("q", value.trim());
        else p.delete("q");
      });
    }, 220);
  };

  const clearAll = () => {
    setInput("");
    update((p) => {
      p.delete("tag");
      p.delete("q");
      p.delete("sort");
    });
  };

  const hasFilters = tags.length > 0 || q !== "" || sort !== "year-desc";
  const availableTags = data?.availableTags ?? [];

  return (
    <Section id="projects">
      <SectionHeading
        index="03"
        eyebrow="Projects"
        title={
          <>
            Work that <span className="text-gradient">ships</span>.
          </>
        }
        description="Filters are URL-synced and every card is backed by a paginated REST endpoint. Open a card to hit the detail endpoint."
      />

      {/* Toolbar */}
      <Reveal className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <label className="relative flex-1 lg:max-w-md">
          <span className="sr-only">Search projects</span>
          <Search
            size={16}
            aria-hidden
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-fg-subtle"
          />
          <input
            type="search"
            value={input}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Search projects…"
            className="h-11 w-full rounded-full border border-border bg-surface pl-10 pr-4 text-sm outline-none transition placeholder:text-fg-subtle focus:border-accent"
          />
        </label>

        <div className="flex flex-wrap items-center gap-2">
          <SlidersHorizontal size={14} className="text-fg-subtle" aria-hidden />
          <div role="radiogroup" aria-label="Sort" className="flex rounded-full border border-border p-1">
            {SORTS.map((s) => (
              <button
                key={s.value}
                type="button"
                role="radio"
                aria-checked={sort === s.value}
                onClick={() =>
                  update((p) => {
                    if (s.value === "year-desc") p.delete("sort");
                    else p.set("sort", s.value);
                  })
                }
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-medium transition",
                  sort === s.value ? "bg-fg text-bg" : "text-fg-muted hover:text-fg",
                )}
              >
                {s.label}
              </button>
            ))}
          </div>
          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={clearAll}>
              <X size={14} aria-hidden /> Clear
            </Button>
          )}
        </div>
      </Reveal>

      {/* Tag chips */}
      <Reveal delay={60} className="mb-10 flex flex-wrap gap-2" aria-label="Filter by tag">
        {availableTags.length === 0 && loading
          ? Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-20 rounded-full" />
            ))
          : availableTags.map((t) => {
              const on = tags.includes(t);
              return (
                <button
                  key={t}
                  type="button"
                  aria-pressed={on}
                  onClick={() => toggleTag(t)}
                  className={cn(
                    "rounded-full border px-3.5 py-1.5 text-sm transition",
                    on
                      ? "border-accent bg-accent-soft text-accent"
                      : "border-border text-fg-muted hover:border-border-strong hover:text-fg",
                  )}
                >
                  {t}
                </button>
              );
            })}
      </Reveal>

      {/* Status line */}
      <div className="mb-4 flex min-h-5 items-center justify-between font-mono text-xs text-fg-subtle" aria-live="polite">
        <span>
          {data
            ? `${data.total} result${data.total === 1 ? "" : "s"}${stale ? " · updating…" : ` · ${durationMs} ms`}`
            : loading
              ? "Loading…"
              : ""}
        </span>
        <span className="hidden truncate sm:inline" title={url}>
          GET {url}
        </span>
      </div>

      {error && (
        <div className="card mb-6 flex items-center justify-between gap-4 p-5">
          <p className="text-sm">
            <span className="font-semibold text-danger">{error.code}</span>{" "}
            <span className="text-fg-muted">{error.message}</span>
          </p>
          <Button variant="outline" size="sm" onClick={refetch}>
            Retry
          </Button>
        </div>
      )}

      {/* Grid */}
      <ul
        className={cn(
          "grid gap-5 md:grid-cols-2 xl:grid-cols-3 transition-opacity duration-300",
          stale && "opacity-60",
        )}
        aria-busy={loading}
      >
        {loading && !data &&
          Array.from({ length: 6 }).map((_, i) => (
            <li key={i} className="card overflow-hidden">
              <Skeleton className="h-40 rounded-none" />
              <div className="space-y-3 p-5">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <div className="flex gap-2 pt-1">
                  <Skeleton className="h-5 w-16 rounded-full" />
                  <Skeleton className="h-5 w-20 rounded-full" />
                </div>
              </div>
            </li>
          ))}

        {data?.items.map((p, i) => (
          <Reveal as="li" key={p.slug} delay={(i % 3) * 70} className="h-full">
            <TiltCard className="card group h-full overflow-hidden rounded-2xl">
              <button
                type="button"
                onClick={() => setOpenSlug(p.slug)}
                className="flex h-full w-full flex-col text-left"
                aria-label={`Open details for ${p.title}`}
              >
                <div
                  className="relative h-40 w-full overflow-hidden"
                  style={{
                    background: `linear-gradient(135deg, ${p.gradient[0]}, ${p.gradient[1]})`,
                  }}
                >
                  <div aria-hidden className="absolute inset-0 bg-grid opacity-30 mix-blend-overlay" />
                  <div
                    aria-hidden
                    className="absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-white/20 blur-2xl transition-transform duration-700 ease-out-expo group-hover:scale-150"
                  />
                  <span className="absolute left-5 top-5 font-mono text-xs uppercase tracking-[0.2em] text-white/85">
                    {p.year}
                  </span>
                  {p.featured && (
                    <span className="absolute right-5 top-5 rounded-full bg-black/30 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-white backdrop-blur">
                      Featured
                    </span>
                  )}
                  <span className="absolute bottom-5 left-5 text-4xl font-bold text-white drop-shadow-md">
                    {p.title.split(" ")[0]}
                  </span>
                </div>

                <div className="flex flex-1 flex-col p-5">
                  <h3 className="flex items-start justify-between gap-3 text-lg font-semibold leading-snug">
                    {p.title}
                    <ArrowUpRight
                      size={18}
                      aria-hidden
                      className="mt-0.5 shrink-0 text-fg-subtle transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-fg"
                    />
                  </h3>
                  <p className="mt-1.5 text-sm leading-6 text-fg-muted">{p.tagline}</p>

                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {p.tags.slice(0, 4).map((t) => (
                      <Badge key={t}>{t}</Badge>
                    ))}
                    {p.tags.length > 4 && <Badge>+{p.tags.length - 4}</Badge>}
                  </div>

                  {p.metrics && (
                    <dl className="mt-auto flex gap-5 pt-5 text-xs">
                      {p.metrics.slice(0, 3).map((m) => (
                        <div key={m.label}>
                          <dt className="text-fg-subtle">{m.label}</dt>
                          <dd className="font-mono font-semibold tabular-nums">{m.value}</dd>
                        </div>
                      ))}
                    </dl>
                  )}
                </div>
              </button>
            </TiltCard>
          </Reveal>
        ))}
      </ul>

      {data && data.total === 0 && (
        <div className="card mt-2 p-10 text-center">
          <p className="text-lg font-medium">No projects match those filters.</p>
          <p className="mt-1 text-sm text-fg-muted">
            Try removing a tag or clearing the search.
          </p>
          <Button variant="outline" size="sm" className="mt-5" onClick={clearAll}>
            Clear filters
          </Button>
        </div>
      )}

      <ProjectDialog
        slug={openSlug}
        onClose={() => setOpenSlug(null)}
        onNavigate={(slug) => setOpenSlug(slug)}
      />
    </Section>
  );
}
