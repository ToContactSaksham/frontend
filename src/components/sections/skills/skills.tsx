"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { useApi } from "@/hooks/use-api";
import { useInView } from "@/hooks/use-in-view";
import type { Skill, SkillCategory } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Section, SectionHeading } from "@/components/ui/section";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface SkillsPayload {
  total: number;
  categories: { category: SkillCategory; average: number; items: Skill[] }[];
  flat: Skill[];
}

const R = 26;
const C = 2 * Math.PI * R;

function SkillRing({ level, active, delay }: { level: number; active: boolean; delay: number }) {
  const offset = C * (1 - (active ? level : 0) / 100);
  return (
    <svg viewBox="0 0 64 64" className="h-16 w-16 -rotate-90" aria-hidden>
      <circle cx="32" cy="32" r={R} className="stroke-border" strokeWidth="5" fill="none" />
      <circle
        cx="32"
        cy="32"
        r={R}
        stroke="url(#skill-grad)"
        strokeWidth="5"
        fill="none"
        strokeLinecap="round"
        strokeDasharray={C}
        strokeDashoffset={offset}
        style={{
          transition: "stroke-dashoffset 1.4s var(--ease-out-expo)",
          transitionDelay: `${delay}ms`,
        }}
      />
    </svg>
  );
}

export function Skills() {
  const { data, loading, error, durationMs, refetch } = useApi<SkillsPayload>("/api/skills");
  const [active, setActive] = useState<SkillCategory | "All">("All");
  const { ref, inView } = useInView<HTMLUListElement>({ threshold: 0.15 });

  const categories = data?.categories ?? [];
  const visible =
    active === "All" ? categories : categories.filter((c) => c.category === active);

  return (
    <Section id="skills" className="bg-bg-elevated/60">
      <SectionHeading
        index="02"
        eyebrow="Skills"
        title={
          <>
            A deep toolkit, <span className="text-gradient">sharpened daily</span>.
          </>
        }
        description="Proficiency is self-assessed and loaded live from this site's own REST API — the rings animate from the JSON response."
      />

      {/* Category filter */}
      <div className="mb-10 flex flex-wrap items-center gap-2" role="tablist" aria-label="Skill categories">
        <button
          type="button"
          role="tab"
          aria-selected={active === "All"}
          onClick={() => setActive("All")}
          className={cn(
            "rounded-full border px-4 py-1.5 text-sm transition",
            active === "All"
              ? "border-fg bg-fg text-bg"
              : "border-border text-fg-muted hover:border-border-strong hover:text-fg",
          )}
        >
          All
        </button>
        {loading && !data
          ? Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-24 rounded-full" />
            ))
          : categories.map((c) => (
              <button
                key={c.category}
                type="button"
                role="tab"
                aria-selected={active === c.category}
                onClick={() => setActive(c.category)}
                className={cn(
                  "rounded-full border px-4 py-1.5 text-sm transition",
                  active === c.category
                    ? "border-fg bg-fg text-bg"
                    : "border-border text-fg-muted hover:border-border-strong hover:text-fg",
                )}
              >
                {c.category}
                <span className="ml-2 font-mono text-xs opacity-70">{c.average}%</span>
              </button>
            ))}
      </div>

      {error && (
        <div className="card flex flex-col items-start gap-3 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-medium text-danger">Couldn&apos;t load skills</p>
            <p className="text-sm text-fg-muted">
              {error.code}: {error.message}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={refetch}>
            <RefreshCw size={14} aria-hidden /> Retry
          </Button>
        </div>
      )}

      <ul
        ref={ref}
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        aria-busy={loading}
      >
        {/* Shared gradient for every ring */}
        <li aria-hidden className="hidden">
          <svg width="0" height="0" className="absolute">
            <defs>
              <linearGradient id="skill-grad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="var(--accent)" />
                <stop offset="100%" stopColor="var(--accent-2)" />
              </linearGradient>
            </defs>
          </svg>
        </li>

        {loading && !data &&
          Array.from({ length: 8 }).map((_, i) => (
            <li key={i} className="card flex items-center gap-4 p-5">
              <Skeleton className="h-16 w-16 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </li>
          ))}

        {visible.flatMap((group) =>
          group.items.map((s, i) => (
            <li
              key={s.name}
              className="card group flex items-center gap-4 p-5 transition duration-300 hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="relative shrink-0">
                <SkillRing level={s.level} active={inView} delay={i * 60} />
                <span className="absolute inset-0 grid place-items-center font-mono text-sm font-semibold tabular-nums">
                  {s.level}
                </span>
              </div>
              <div className="min-w-0">
                <p className="truncate font-medium">{s.name}</p>
                <p className="mt-1 flex flex-wrap items-center gap-2 text-xs text-fg-muted">
                  <Badge className="px-2 py-0 text-[10px]">{s.category}</Badge>
                  <span>
                    {s.years} yr{s.years > 1 ? "s" : ""}
                  </span>
                </p>
              </div>
            </li>
          )),
        )}
      </ul>

      {data && (
        <p className="mt-6 font-mono text-xs text-fg-subtle">
          GET /api/skills → {data.total} skills in {durationMs} ms
        </p>
      )}
    </Section>
  );
}
