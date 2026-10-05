"use client";

import { useState, type FormEvent } from "react";
import { Check, Copy, Loader2, Mail, MapPin, Send } from "lucide-react";
import { profile } from "@/data/profile";
import { contactRules, validateContact } from "@/lib/validation";
import type { ApiFieldError, ApiResponse, ContactResult } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Section, SectionHeading } from "@/components/ui/section";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { useToast } from "@/components/providers/toast-provider";
import { GitHubIcon, LinkedInIcon, XIcon } from "@/components/icons/brand";

type Field = "name" | "email" | "subject" | "message";
type Errors = Partial<Record<Field | "website" | "form", string>>;

const initial = { name: "", email: "", subject: "", message: "", website: "" };

const socialIcon = { github: GitHubIcon, linkedin: LinkedInIcon, x: XIcon, mail: Mail } as const;

function toErrors(fields: ApiFieldError[]): Errors {
  return fields.reduce<Errors>((acc, f) => {
    acc[f.field as Field] = f.message;
    return acc;
  }, {});
}

export function Contact() {
  const { toast } = useToast();
  const [values, setValues] = useState(initial);
  const [touched, setTouched] = useState<Partial<Record<Field, boolean>>>({});
  const [errors, setErrors] = useState<Errors>({});
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<ContactResult | null>(null);
  const [copied, setCopied] = useState(false);

  const validateNow = (v: typeof values) => {
    const r = validateContact(v);
    return r.ok ? {} : toErrors(r.fields);
  };

  const onChange = (field: Field, value: string) => {
    const next = { ...values, [field]: value };
    setValues(next);
    if (touched[field]) setErrors(validateNow(next));
  };

  const onBlur = (field: Field) => {
    setTouched((t) => ({ ...t, [field]: true }));
    setErrors(validateNow(values));
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setTouched({ name: true, email: true, subject: true, message: true });
    const clientErrors = validateNow(values);
    setErrors(clientErrors);
    if (Object.keys(clientErrors).length) return;

    setPending(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(values),
      });
      const json = (await res.json()) as ApiResponse<ContactResult>;

      if (json.ok) {
        setResult(json.data);
        setValues(initial);
        setTouched({});
        setErrors({});
        toast({
          title: "Message sent",
          description: `Thanks ${json.data.echo.name}! I'll reply soon.`,
          variant: "success",
        });
      } else if (json.error.fields?.length) {
        setErrors(toErrors(json.error.fields));
      } else if (res.status === 429) {
        const retry = res.headers.get("Retry-After");
        setErrors({ form: `${json.error.message}${retry ? ` Try again in ${retry}s.` : ""}` });
      } else {
        setErrors({ form: json.error.message });
      }
    } catch {
      setErrors({ form: "Network error. Please check your connection and try again." });
    } finally {
      setPending(false);
    }
  };

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      toast({ title: "Couldn't copy", description: profile.email, variant: "error" });
    }
  };

  const inputClass = (field: Field) =>
    cn(
      "w-full rounded-xl border bg-bg px-4 py-3 text-sm outline-none transition placeholder:text-fg-subtle",
      errors[field] ? "border-danger focus:border-danger" : "border-border focus:border-accent",
    );

  const remaining = contactRules.message.max - values.message.length;

  return (
    <Section id="contact">
      <SectionHeading
        index="07"
        eyebrow="Contact"
        title={
          <>
            Let&apos;s build something <span className="text-gradient">worth shipping</span>.
          </>
        }
        description="This form posts JSON to /api/contact. Validation runs on both sides with one shared schema, and the server replies with field-level errors."
      />

      <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr] lg:gap-16">
        {/* Info */}
        <Reveal className="space-y-8">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-fg-subtle">Email</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <a href={`mailto:${profile.email}`} className="text-lg font-medium underline decoration-border-strong underline-offset-4 transition hover:decoration-accent">
                {profile.email}
              </a>
              <button
                type="button"
                onClick={copyEmail}
                aria-label="Copy email address"
                className="inline-flex h-8 w-8 items-center justify-center rounded-full text-fg-muted transition hover:bg-surface-hover hover:text-fg"
              >
                {copied ? <Check size={14} className="text-success" aria-hidden /> : <Copy size={14} aria-hidden />}
              </button>
            </div>
          </div>

          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-fg-subtle">Based in</p>
            <p className="mt-2 flex items-center gap-2 text-fg-muted">
              <MapPin size={16} aria-hidden /> {profile.location}
            </p>
          </div>

          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-fg-subtle">Elsewhere</p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {profile.socials
                .filter((s) => s.icon !== "mail")
                .map((s) => {
                  const Icon = socialIcon[s.icon];
                  return (
                    <li key={s.label}>
                      <a
                        href={s.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm text-fg-muted transition hover:-translate-y-0.5 hover:border-border-strong hover:text-fg"
                      >
                        <Icon size={16} /> {s.label}
                      </a>
                    </li>
                  );
                })}
            </ul>
          </div>

          <div className="card p-5 text-sm leading-6 text-fg-muted">
            <p className="font-medium text-fg">What happens when you hit send</p>
            <ol className="mt-2 list-decimal space-y-1 pl-5">
              <li>Client validation with the same rules the server uses.</li>
              <li>
                <code className="font-mono text-xs">POST /api/contact</code> with a JSON body.
              </li>
              <li>Server re-validates, rate-limits per IP, and answers 201 or 422.</li>
            </ol>
          </div>
        </Reveal>

        {/* Form */}
        <Reveal delay={100}>
          {result ? (
            <div className="card flex h-full flex-col items-start justify-center p-8" role="status">
              <span className="grid h-12 w-12 place-items-center rounded-full bg-success/15 text-success">
                <Check size={24} aria-hidden />
              </span>
              <h3 className="mt-5 text-2xl font-semibold tracking-tight">Message received</h3>
              <p className="mt-2 text-fg-muted">
                Thanks, {result.echo.name}. The API stored your message with id{" "}
                <code className="font-mono text-xs text-fg">{result.id}</code> at{" "}
                {new Date(result.receivedAt).toLocaleTimeString()}.
              </p>
              <Button variant="outline" size="sm" className="mt-6" onClick={() => setResult(null)}>
                Send another
              </Button>
            </div>
          ) : (
            <form onSubmit={onSubmit} noValidate className="card space-y-5 p-6 md:p-8" aria-busy={pending}>
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="c-name" className="mb-1.5 block text-sm font-medium">
                    Name
                  </label>
                  <input
                    id="c-name"
                    name="name"
                    autoComplete="name"
                    value={values.name}
                    onChange={(e) => onChange("name", e.target.value)}
                    onBlur={() => onBlur("name")}
                    aria-invalid={Boolean(errors.name)}
                    aria-describedby={errors.name ? "c-name-err" : undefined}
                    placeholder="Ada Lovelace"
                    className={inputClass("name")}
                  />
                  {errors.name && (
                    <p id="c-name-err" className="mt-1.5 text-xs text-danger">
                      {errors.name}
                    </p>
                  )}
                </div>
                <div>
                  <label htmlFor="c-email" className="mb-1.5 block text-sm font-medium">
                    Email
                  </label>
                  <input
                    id="c-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={values.email}
                    onChange={(e) => onChange("email", e.target.value)}
                    onBlur={() => onBlur("email")}
                    aria-invalid={Boolean(errors.email)}
                    aria-describedby={errors.email ? "c-email-err" : undefined}
                    placeholder="you@example.com"
                    className={inputClass("email")}
                  />
                  {errors.email && (
                    <p id="c-email-err" className="mt-1.5 text-xs text-danger">
                      {errors.email}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="c-subject" className="mb-1.5 block text-sm font-medium">
                  Subject <span className="font-normal text-fg-subtle">(optional)</span>
                </label>
                <input
                  id="c-subject"
                  name="subject"
                  value={values.subject}
                  onChange={(e) => onChange("subject", e.target.value)}
                  onBlur={() => onBlur("subject")}
                  aria-invalid={Boolean(errors.subject)}
                  aria-describedby={errors.subject ? "c-subject-err" : undefined}
                  placeholder="Frontend role, freelance project, or just hello"
                  className={inputClass("subject")}
                />
                {errors.subject && (
                  <p id="c-subject-err" className="mt-1.5 text-xs text-danger">
                    {errors.subject}
                  </p>
                )}
              </div>

              <div>
                <div className="mb-1.5 flex items-baseline justify-between">
                  <label htmlFor="c-message" className="block text-sm font-medium">
                    Message
                  </label>
                  <span
                    className={cn("font-mono text-xs tabular-nums", remaining < 0 ? "text-danger" : "text-fg-subtle")}
                    aria-live="polite"
                  >
                    {remaining}
                  </span>
                </div>
                <textarea
                  id="c-message"
                  name="message"
                  rows={6}
                  value={values.message}
                  onChange={(e) => onChange("message", e.target.value)}
                  onBlur={() => onBlur("message")}
                  aria-invalid={Boolean(errors.message)}
                  aria-describedby={errors.message ? "c-message-err" : "c-message-help"}
                  placeholder="Tell me about the problem you're solving…"
                  className={cn(inputClass("message"), "resize-y")}
                />
                {errors.message ? (
                  <p id="c-message-err" className="mt-1.5 text-xs text-danger">
                    {errors.message}
                  </p>
                ) : (
                  <p id="c-message-help" className="mt-1.5 text-xs text-fg-subtle">
                    At least {contactRules.message.min} characters.
                  </p>
                )}
              </div>

              {/* Honeypot — hidden from humans, tempting for bots */}
              <div className="absolute -left-[9999px] top-auto h-px w-px overflow-hidden" aria-hidden>
                <label htmlFor="c-website">Website</label>
                <input
                  id="c-website"
                  name="website"
                  tabIndex={-1}
                  autoComplete="off"
                  value={values.website}
                  onChange={(e) => setValues((v) => ({ ...v, website: e.target.value }))}
                />
              </div>

              {errors.form && (
                <p role="alert" className="rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
                  {errors.form}
                </p>
              )}

              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <p className="text-xs text-fg-subtle">I usually reply within two working days.</p>
                <Button type="submit" disabled={pending} size="lg">
                  {pending ? (
                    <Loader2 size={16} className="animate-spin" aria-hidden />
                  ) : (
                    <Send size={16} aria-hidden className="transition-transform duration-300 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
                  )}
                  {pending ? "Sending…" : "Send message"}
                </Button>
              </div>
            </form>
          )}
        </Reveal>
      </div>
    </Section>
  );
}
