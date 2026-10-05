import { ArrowUp, Mail } from "lucide-react";
import { profile } from "@/data/profile";
import { navLinks } from "@/lib/site";
import { GitHubIcon, LinkedInIcon, XIcon } from "@/components/icons/brand";
import { ApiStatus } from "@/components/layout/api-status";

const socialIcon = {
  github: GitHubIcon,
  linkedin: LinkedInIcon,
  x: XIcon,
  mail: Mail,
} as const;

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative border-t border-border">
      <div className="container-x py-14">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <a href="#home" className="inline-flex items-center gap-2 font-semibold tracking-tight">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-fg text-bg">S</span>
              saksham<span className="text-accent">.</span>
            </a>
            <p className="mt-4 max-w-sm text-sm leading-6 text-fg-muted">
              {profile.tagline}
            </p>
            <div className="mt-5 flex items-center gap-2">
              {profile.socials.map((s) => {
                const Icon = socialIcon[s.icon];
                return (
                  <a
                    key={s.label}
                    href={s.href}
                    target={s.href.startsWith("mailto:") ? undefined : "_blank"}
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border text-fg-muted transition hover:-translate-y-0.5 hover:border-border-strong hover:text-fg"
                  >
                    <Icon size={18} />
                  </a>
                );
              })}
            </div>
          </div>

          <nav aria-label="Footer">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-fg-subtle">
              Sections
            </p>
            <ul className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
              {navLinks.map((l) => (
                <li key={l.id}>
                  <a href={`#${l.id}`} className="text-fg-muted transition hover:text-fg">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-fg-subtle">
              Under the hood
            </p>
            <ul className="mt-4 space-y-2 text-sm text-fg-muted">
              <li>Next.js 16 · App Router · RSC</li>
              <li>React 19 · TypeScript</li>
              <li>Tailwind CSS v4 · CSS tokens</li>
              <li>Typed REST API · Route Handlers</li>
            </ul>
            <div className="mt-5">
              <ApiStatus />
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col-reverse items-start justify-between gap-4 border-t border-border pt-6 text-xs text-fg-subtle sm:flex-row sm:items-center">
          <p>
            © {year} {profile.name}. Designed and built from scratch — no templates.
          </p>
          <a
            href="#home"
            className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-fg-muted transition hover:text-fg"
          >
            Back to top <ArrowUp size={14} aria-hidden />
          </a>
        </div>
      </div>
    </footer>
  );
}
