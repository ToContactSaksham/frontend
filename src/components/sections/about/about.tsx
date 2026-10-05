import { Calendar, MapPin, Mail, Sparkles } from "lucide-react";
import { profile } from "@/data/profile";
import { Section, SectionHeading } from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";
import { StatCounter } from "./stat-counter";

const principles = [
  { title: "Performance is a feature", body: "Budgets, measured. Core Web Vitals in the green on real devices." },
  { title: "Accessible by default", body: "Keyboard first, semantic HTML, reduced-motion respected." },
  { title: "Typed end to end", body: "One set of types from the REST contract to the component props." },
  { title: "Motion with intent", body: "Animation that explains state, never decoration for its own sake." },
];

export function About() {
  return (
    <Section id="about">
      <SectionHeading
        index="01"
        eyebrow="About"
        title={
          <>
            Crafting the web, <span className="text-gradient">one frame</span> at a time.
          </>
        }
      />

      <div className="grid gap-12 lg:grid-cols-[1.2fr_1fr] lg:gap-16">
        <div className="space-y-5 text-pretty text-base leading-8 text-fg-muted md:text-lg">
          {profile.bio.map((p, i) => (
            <Reveal as="p" key={i} delay={i * 90}>
              {p}
            </Reveal>
          ))}

          <Reveal as="ul" delay={300} className="mt-8 grid gap-4 sm:grid-cols-2">
            {principles.map((p) => (
              <li key={p.title} className="card p-5">
                <p className="flex items-center gap-2 text-sm font-semibold text-fg">
                  <Sparkles size={14} className="text-accent" aria-hidden />
                  {p.title}
                </p>
                <p className="mt-1.5 text-sm leading-6 text-fg-muted">{p.body}</p>
              </li>
            ))}
          </Reveal>
        </div>

        <Reveal delay={150} className="lg:sticky lg:top-28 lg:self-start">
          <div className="card relative overflow-hidden p-6">
            <div
              aria-hidden
              className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[radial-gradient(circle,var(--glow),transparent_65%)] blur-xl"
            />
            <div className="relative flex items-center gap-4">
              <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-[linear-gradient(135deg,var(--accent),var(--accent-2))] text-2xl font-bold text-accent-fg shadow-lg">
                S
              </div>
              <div>
                <p className="text-lg font-semibold">{profile.name}</p>
                <p className="text-sm text-fg-muted">{profile.title}</p>
              </div>
            </div>

            <dl className="relative mt-6 space-y-3 text-sm">
              <div className="flex items-center gap-3">
                <dt className="sr-only">Location</dt>
                <MapPin size={16} className="shrink-0 text-fg-subtle" aria-hidden />
                <dd className="text-fg-muted">{profile.location}</dd>
              </div>
              <div className="flex items-center gap-3">
                <dt className="sr-only">Availability</dt>
                <Calendar size={16} className="shrink-0 text-fg-subtle" aria-hidden />
                <dd className="text-fg-muted">{profile.availability}</dd>
              </div>
              <div className="flex items-center gap-3">
                <dt className="sr-only">Email</dt>
                <Mail size={16} className="shrink-0 text-fg-subtle" aria-hidden />
                <dd>
                  <a
                    href={`mailto:${profile.email}`}
                    className="text-fg underline decoration-border-strong underline-offset-4 transition hover:decoration-accent"
                  >
                    {profile.email}
                  </a>
                </dd>
              </div>
            </dl>

            <div className="relative mt-6 border-t border-border pt-6">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-fg-subtle">
                Currently
              </p>
              <ul className="mt-3 space-y-2 text-sm text-fg-muted">
                <li className="flex gap-2">
                  <span className="text-accent">▸</span> Shipping with React Server Components
                </li>
                <li className="flex gap-2">
                  <span className="text-accent">▸</span> Exploring the View Transitions API
                </li>
                <li className="flex gap-2">
                  <span className="text-accent">▸</span> Writing about frontend performance
                </li>
              </ul>
            </div>
          </div>
        </Reveal>
      </div>

      <Reveal as="ul" delay={100} className="mt-16 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border bg-border md:grid-cols-4">
        {profile.stats.map((s) => (
          <li key={s.label} className="bg-bg-elevated p-6 md:p-8">
            <p className="text-4xl font-semibold tracking-tight md:text-5xl">
              <StatCounter value={s.value} suffix={s.suffix} className="text-gradient" />
            </p>
            <p className="mt-2 text-sm text-fg-muted">{s.label}</p>
          </li>
        ))}
      </Reveal>
    </Section>
  );
}
