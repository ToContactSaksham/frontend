import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowLeft, ArrowUpRight, Sparkles } from "lucide-react";
import { projects } from "@/data/projects";
import { site } from "@/lib/site";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { GitHubIcon } from "@/components/icons/brand";
import { Badge } from "@/components/ui/badge";

interface Props {
  slug: string;
  children: ReactNode;
  /** Extra controls rendered in the header, e.g. a pause button. */
  controls?: ReactNode;
  /** Hide the intro card for demos that want the full viewport. */
  compact?: boolean;
}

/**
 * Shared chrome for every project demo: back link, title, source link,
 * theme toggle and an intro explaining what to look for. Each demo is a
 * real route on the same deployment, so "Live demo" links always work.
 */
export function DemoShell({ slug, children, controls, compact }: Props) {
  const project = projects.find((p) => p.slug === slug);
  const source = project?.links.find((l) => l.label === "Source")?.href ?? site.repoUrl;

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="glass sticky top-0 z-40 border-b border-border">
        <div className="container-x flex h-14 items-center gap-3">
          <Link
            href="/#projects"
            className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full px-3 text-sm text-fg-muted transition hover:bg-surface-hover hover:text-fg"
          >
            <ArrowLeft size={16} aria-hidden />
            <span className="hidden sm:inline">Portfolio</span>
          </Link>
          <p className="min-w-0 flex-1 truncate text-center text-sm font-semibold">
            {project?.title ?? "Demo"}
          </p>
          <div className="flex shrink-0 items-center gap-1">
            {controls}
            <a
              href={source}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-sm text-fg-muted transition hover:bg-surface-hover hover:text-fg"
            >
              <GitHubIcon size={15} />
              <span className="hidden sm:inline">Source</span>
            </a>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main id="main" className="container-x flex-1 py-8 md:py-10">
        {project && !compact && (
          <section className="card mb-8 flex flex-col gap-4 p-5 md:flex-row md:items-start md:justify-between md:p-6">
            <div className="min-w-0">
              <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-accent">
                <Sparkles size={12} aria-hidden /> Live demo · {project.year}
              </p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight md:text-3xl">
                {project.title}
              </h1>
              <p className="mt-1 text-fg-muted">{project.tagline}</p>
              <ul className="mt-3 flex flex-wrap gap-1.5">
                {project.tags.map((t) => (
                  <li key={t}>
                    <Badge>{t}</Badge>
                  </li>
                ))}
              </ul>
            </div>
            <details className="group shrink-0 md:w-80">
              <summary className="cursor-pointer select-none list-none rounded-xl border border-border px-4 py-2 text-sm font-medium transition hover:bg-surface-hover">
                What to look for
                <span className="float-right text-fg-subtle transition group-open:rotate-180">⌄</span>
              </summary>
              <ul className="mt-3 space-y-2 text-sm text-fg-muted">
                {project.highlights.map((h) => (
                  <li key={h} className="flex gap-2">
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent" aria-hidden />
                    {h}
                  </li>
                ))}
              </ul>
            </details>
          </section>
        )}
        {children}
      </main>

      <footer className="border-t border-border py-6 text-center text-xs text-fg-subtle">
        Built for{" "}
        <Link href="/" className="text-fg-muted underline-offset-4 hover:underline">
          {site.name}&apos;s portfolio
        </Link>
        . View the{" "}
        <a
          href={source}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-0.5 text-fg-muted underline-offset-4 hover:underline"
        >
          source <ArrowUpRight size={11} aria-hidden />
        </a>
        .
      </footer>
    </div>
  );
}
