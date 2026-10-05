import { Briefcase, MapPin } from "lucide-react";
import { experience } from "@/data/experience";
import { formatDuration, formatMonth } from "@/lib/utils";
import { Section, SectionHeading } from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";
import { Badge } from "@/components/ui/badge";

export function Experience() {
  const items = [...experience].sort((a, b) => b.start.localeCompare(a.start));

  return (
    <Section id="experience">
      <SectionHeading
        index="05"
        eyebrow="Experience"
        title={
          <>
            Where I&apos;ve <span className="text-gradient">made an impact</span>.
          </>
        }
        description="Also available as JSON at GET /api/experience."
      />

      <ol className="relative mx-auto max-w-4xl">
        {/* Spine */}
        <div
          aria-hidden
          className="absolute left-4 top-0 h-full w-px bg-[linear-gradient(to_bottom,transparent,var(--accent),var(--accent-2),transparent)] md:left-1/2 md:-translate-x-1/2"
        />

        {items.map((job, i) => {
          const left = i % 2 === 0;
          return (
            <li key={job.id} className="relative mb-12 pl-12 last:mb-0 md:pl-0">
              {/* Dot */}
              <span
                aria-hidden
                className="absolute left-4 top-6 flex h-3 w-3 -translate-x-1/2 items-center justify-center md:left-1/2"
              >
                <span className="absolute h-3 w-3 animate-pulse-ring rounded-full bg-accent/60" />
                <span className="relative h-3 w-3 rounded-full border-2 border-bg bg-accent" />
              </span>

              <div
                className={
                  left
                    ? "md:mr-[calc(50%+2.5rem)]"
                    : "md:ml-[calc(50%+2.5rem)]"
                }
              >
                <Reveal
                  as="article"
                  delay={80}
                  className="card group p-6 transition duration-300 hover:-translate-y-0.5 hover:shadow-md"
                >
                  <header>
                    <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">
                      {formatMonth(job.start)} — {formatMonth(job.end)}
                      <span className="ml-2 text-fg-subtle normal-case tracking-normal">
                        · {formatDuration(job.start, job.end)}
                      </span>
                    </p>
                    <h3 className="mt-2 text-xl font-semibold tracking-tight">{job.role}</h3>
                    <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-fg-muted">
                      <span className="flex items-center gap-1.5">
                        <Briefcase size={14} aria-hidden /> {job.company}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <MapPin size={14} aria-hidden /> {job.location}
                      </span>
                    </p>
                  </header>

                  <p className="mt-4 text-sm leading-6 text-fg-muted">{job.summary}</p>

                  <ul className="mt-4 space-y-2">
                    {job.achievements.map((a) => (
                      <li key={a} className="flex gap-3 text-sm leading-6">
                        <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-2" aria-hidden />
                        {a}
                      </li>
                    ))}
                  </ul>

                  <ul className="mt-5 flex flex-wrap gap-1.5" aria-label="Technologies used">
                    {job.stack.map((s) => (
                      <li key={s}>
                        <Badge>{s}</Badge>
                      </li>
                    ))}
                  </ul>
                </Reveal>
              </div>
            </li>
          );
        })}
      </ol>
    </Section>
  );
}
