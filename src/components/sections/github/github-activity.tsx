"use client";

import { ArrowUpRight, GitFork, RefreshCw, Star, TriangleAlert } from "lucide-react";
import { useApi } from "@/hooks/use-api";
import type { GitHubSummary } from "@/lib/types";
import { cn, compactNumber, timeAgo } from "@/lib/utils";
import { Section, SectionHeading } from "@/components/ui/section";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { StatCounter } from "@/components/sections/about/stat-counter";
import { Avatar } from "@/components/ui/avatar";
import { GitHubIcon } from "@/components/icons/brand";

const languageColors: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#f1e05a",
  HTML: "#e34c26",
  CSS: "#563d7c",
  SCSS: "#c6538c",
  Vue: "#41b883",
  Svelte: "#ff3e00",
  Python: "#3572a5",
  Go: "#00add8",
  Rust: "#dea584",
  Shell: "#89e051",
  MDX: "#fcb32c",
};

function langColor(name: string | null) {
  return (name && languageColors[name]) || "var(--accent)";
}

export function GitHubActivity() {
  const { data, loading, error, durationMs, refetch } = useApi<GitHubSummary>("/api/github");

  return (
    <Section id="github" className="bg-bg-elevated/60">
      <SectionHeading
        index="04"
        eyebrow="GitHub"
        title={
          <>
            Live from the <span className="text-gradient">GitHub REST API</span>.
          </>
        }
        description="A server-side route handler proxies api.github.com, normalises two upstream calls into one typed payload, caches it for an hour, and degrades gracefully when GitHub is unavailable."
      />

      {error && (
        <div className="card flex items-center justify-between gap-4 p-5">
          <p className="text-sm">
            <span className="font-semibold text-danger">{error.code}</span>{" "}
            <span className="text-fg-muted">{error.message}</span>
          </p>
          <Button variant="outline" size="sm" onClick={refetch}>
            <RefreshCw size={14} aria-hidden /> Retry
          </Button>
        </div>
      )}

      {data?.fallback && (
        <Reveal className="mb-6 flex items-start gap-3 rounded-2xl border border-warning/30 bg-warning/10 p-4 text-sm">
          <TriangleAlert size={18} className="mt-0.5 shrink-0 text-warning" aria-hidden />
          <div>
            <p className="font-medium">Showing a cached snapshot</p>
            <p className="text-fg-muted">
              The live GitHub API wasn&apos;t reachable from the server just now, so the
              endpoint returned its fallback payload (flagged with{" "}
              <code className="font-mono text-xs">fallback: true</code>) instead of failing.
            </p>
          </div>
        </Reveal>
      )}

      <div className="grid gap-5 lg:grid-cols-[1fr_1.6fr]">
        {/* Profile + totals */}
        <Reveal className="card flex flex-col p-6">
          {loading && !data ? (
            <div className="flex items-center gap-4">
              <Skeleton className="h-16 w-16 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-1/2" />
                <Skeleton className="h-4 w-1/3" />
              </div>
            </div>
          ) : data ? (
            <a
              href={data.user.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-4"
            >
              <Avatar
                src={data.user.avatarUrl}
                name={data.user.name ?? data.user.login}
                size={64}
              />
              <div className="min-w-0">
                <p className="flex items-center gap-2 truncate text-lg font-semibold">
                  {data.user.name ?? data.user.login}
                  <ArrowUpRight
                    size={16}
                    aria-hidden
                    className="text-fg-subtle transition group-hover:text-fg"
                  />
                </p>
                <p className="truncate font-mono text-sm text-fg-muted">@{data.user.login}</p>
              </div>
            </a>
          ) : null}

          {data?.user.bio && (
            <p className="mt-4 text-sm leading-6 text-fg-muted">{data.user.bio}</p>
          )}

          <dl className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border bg-border">
            {(
              [
                ["Repositories", data?.user.publicRepos ?? 0],
                ["Followers", data?.user.followers ?? 0],
                ["Stars earned", data?.totals.stars ?? 0],
                ["Forks", data?.totals.forks ?? 0],
              ] as const
            ).map(([label, value]) => (
              <div key={label} className="bg-bg-elevated p-4">
                <dt className="text-xs text-fg-muted">{label}</dt>
                <dd className="mt-1 text-2xl font-semibold tabular-nums">
                  {data ? <StatCounter value={value} duration={1200} /> : <Skeleton className="h-7 w-12" />}
                </dd>
              </div>
            ))}
          </dl>

          {/* Language breakdown */}
          <div className="mt-6">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-fg-subtle">
              Languages
            </p>
            {data ? (
              <>
                <div className="mt-3 flex h-2.5 w-full overflow-hidden rounded-full bg-surface-hover" role="img" aria-label="Language distribution">
                  {data.languages.map((l) => (
                    <span
                      key={l.name}
                      title={`${l.name} ${l.percent}%`}
                      style={{ width: `${l.percent}%`, background: langColor(l.name) }}
                      className="h-full transition-[width] duration-1000 ease-out-expo"
                    />
                  ))}
                </div>
                <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-fg-muted">
                  {data.languages.slice(0, 6).map((l) => (
                    <li key={l.name} className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full" style={{ background: langColor(l.name) }} />
                      {l.name} <span className="font-mono text-fg-subtle">{l.percent}%</span>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <Skeleton className="mt-3 h-2.5 w-full rounded-full" />
            )}
          </div>

          <div className="mt-auto pt-6">
            <Button href={data?.user.url ?? "https://github.com"} variant="outline" size="sm">
              <GitHubIcon size={14} /> Follow on GitHub
            </Button>
          </div>
        </Reveal>

        {/* Repos */}
        <div>
          <ul className="grid gap-4 sm:grid-cols-2" aria-busy={loading}>
            {loading && !data &&
              Array.from({ length: 6 }).map((_, i) => (
                <li key={i} className="card space-y-3 p-5">
                  <Skeleton className="h-5 w-2/3" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-4/5" />
                </li>
              ))}
            {data?.repos.slice(0, 6).map((r, i) => (
              <Reveal as="li" key={r.fullName} delay={i * 60}>
                <a
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="card group flex h-full flex-col p-5 transition duration-300 hover:-translate-y-0.5 hover:shadow-md"
                >
                  <p className="flex items-start justify-between gap-2 font-semibold">
                    <span className="truncate">{r.name}</span>
                    <ArrowUpRight
                      size={16}
                      aria-hidden
                      className="mt-0.5 shrink-0 text-fg-subtle transition group-hover:text-fg"
                    />
                  </p>
                  <p className="mt-1.5 line-clamp-2 flex-1 text-sm leading-6 text-fg-muted">
                    {r.description ?? "No description provided."}
                  </p>
                  {r.topics.length > 0 && (
                    <p className="mt-3 flex flex-wrap gap-1.5">
                      {r.topics.slice(0, 3).map((t) => (
                        <span key={t} className="rounded-full bg-accent-soft px-2 py-0.5 text-[11px] text-accent">
                          {t}
                        </span>
                      ))}
                    </p>
                  )}
                  <p className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-fg-muted">
                    {r.language && (
                      <span className="flex items-center gap-1.5">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ background: langColor(r.language) }} />
                        {r.language}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Star size={12} aria-hidden /> {compactNumber(r.stars)}
                    </span>
                    <span className="flex items-center gap-1">
                      <GitFork size={12} aria-hidden /> {compactNumber(r.forks)}
                    </span>
                    <span className={cn("ml-auto", "text-fg-subtle")}>{timeAgo(r.pushedAt)}</span>
                  </p>
                </a>
              </Reveal>
            ))}
          </ul>

          {data && (
            <p className="mt-5 font-mono text-xs text-fg-subtle">
              GET /api/github → {data.fallback ? "fallback" : "api.github.com"} · {durationMs} ms ·
              fetched {timeAgo(data.fetchedAt)}
            </p>
          )}
        </div>
      </div>
    </Section>
  );
}
