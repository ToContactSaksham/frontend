import { ArrowRight, ChevronDown, Mail } from "lucide-react";
import { profile } from "@/data/profile";
import { Button } from "@/components/ui/button";
import { Magnetic } from "@/components/ui/magnetic";
import { GitHubIcon, LinkedInIcon, XIcon } from "@/components/icons/brand";
import { ParticleField } from "./particle-field";
import { Typewriter } from "./typewriter";

const stack = [
  "HTML5",
  "CSS3",
  "JavaScript",
  "TypeScript",
  "React 19",
  "Next.js 16",
  "Tailwind CSS v4",
  "REST APIs",
  "Node.js",
  "Accessibility",
  "Performance",
  "Testing",
];

const socialIcon = {
  github: GitHubIcon,
  linkedin: LinkedInIcon,
  x: XIcon,
  mail: Mail,
} as const;

export function Hero() {
  return (
    <section
      id="home"
      className="relative flex min-h-[100svh] flex-col overflow-hidden pt-28"
      aria-labelledby="hero-title"
    >
      {/* Background layers */}
      <div aria-hidden className="absolute inset-0 bg-grid mask-fade-b opacity-70" />
      <div
        aria-hidden
        className="absolute -left-32 top-24 h-[28rem] w-[28rem] rounded-full bg-[radial-gradient(circle,var(--glow),transparent_65%)] blur-2xl animate-float"
      />
      <div
        aria-hidden
        className="absolute -right-40 top-1/3 h-[32rem] w-[32rem] rounded-full bg-[radial-gradient(circle,var(--glow-2),transparent_65%)] blur-2xl animate-float-slow"
      />
      <ParticleField className="opacity-80" />

      {/* Content */}
      <div className="container-x relative z-10 flex flex-1 flex-col justify-center py-12">
        <div className="animate-fade-up">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-fg-muted backdrop-blur">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-pulse-ring rounded-full bg-success" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
            </span>
            {profile.availability}
          </span>
        </div>

        <h1
          id="hero-title"
          className="mt-6 max-w-4xl text-balance text-5xl font-semibold leading-[1.02] tracking-tight sm:text-6xl md:text-7xl lg:text-8xl animate-fade-up [animation-delay:120ms]"
        >
          Hi, I&apos;m{" "}
          <span className="text-gradient animate-gradient">{profile.name}</span>
          <span className="text-accent">.</span>
        </h1>

        <p className="mt-5 text-2xl font-medium text-fg-muted sm:text-3xl md:text-4xl animate-fade-up [animation-delay:220ms]">
          <span className="text-fg">I&apos;m a </span>
          <Typewriter words={profile.roles} />
        </p>

        <p className="mt-6 max-w-xl text-pretty text-base leading-7 text-fg-muted md:text-lg animate-fade-up [animation-delay:320ms]">
          {profile.tagline}
        </p>

        <div className="mt-10 flex flex-wrap items-center gap-3 animate-fade-up [animation-delay:420ms]">
          <Magnetic>
            <Button href="#projects" size="lg">
              View projects
              <ArrowRight
                size={18}
                aria-hidden
                className="transition-transform duration-300 group-hover/btn:translate-x-1"
              />
            </Button>
          </Magnetic>
          <Magnetic strength={0.25}>
            <Button href="#contact" size="lg" variant="secondary">
              Get in touch
            </Button>
          </Magnetic>
          <div className="ml-1 flex items-center gap-1">
            {profile.socials.map((s) => {
              const Icon = socialIcon[s.icon];
              return (
                <a
                  key={s.label}
                  href={s.href}
                  target={s.href.startsWith("mailto:") ? undefined : "_blank"}
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full text-fg-muted transition hover:bg-surface-hover hover:text-fg"
                >
                  <Icon size={20} />
                </a>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tech marquee */}
      <div className="relative z-10 border-t border-border/60 py-5 mask-fade-x animate-fade-in [animation-delay:600ms]">
        <ul
          className="flex w-max gap-10 animate-marquee hover:[animation-play-state:paused] motion-reduce:animate-none"
          aria-label="Technologies"
        >
          {[...stack, ...stack].map((t, i) => (
            <li
              key={`${t}-${i}`}
              aria-hidden={i >= stack.length}
              className="flex items-center gap-10 font-mono text-xs uppercase tracking-[0.25em] text-fg-subtle"
            >
              {t}
              <span className="h-1 w-1 rounded-full bg-accent/70" />
            </li>
          ))}
        </ul>
      </div>

      {/* Scroll cue */}
      <a
        href="#about"
        aria-label="Scroll to about section"
        className="absolute bottom-24 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-2 text-fg-subtle transition hover:text-fg md:flex"
      >
        <span className="flex h-9 w-6 items-start justify-center rounded-full border border-border-strong p-1">
          <span className="h-1.5 w-1 rounded-full bg-accent animate-scroll-cue" />
        </span>
        <ChevronDown size={14} aria-hidden />
      </a>
    </section>
  );
}
