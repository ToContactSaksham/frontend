"use client";

import { useState, type ReactNode } from "react";
import { Bell, Info, Keyboard, Palette } from "lucide-react";
import { useToast } from "@/components/providers/toast-provider";
import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";
import { Tabs } from "./tabs";
import { Accordion } from "./accordion";
import { Switch } from "./switch";
import { Combobox } from "./combobox";
import { Tooltip } from "./tooltip";
import { Modal } from "./modal";

const frameworks = [
  "Next.js", "React", "Vue", "Svelte", "SolidJS", "Qwik", "Astro", "Remix",
  "Nuxt", "Angular", "Preact", "Lit", "Ember", "HTMX",
];

const tokens = [
  ["--bg", "Background"],
  ["--bg-elevated", "Elevated"],
  ["--surface-strong", "Surface"],
  ["--border", "Border"],
  ["--fg", "Foreground"],
  ["--fg-muted", "Muted"],
  ["--accent", "Accent"],
  ["--accent-2", "Accent 2"],
  ["--accent-3", "Accent 3"],
  ["--success", "Success"],
  ["--warning", "Warning"],
  ["--danger", "Danger"],
] as const;

interface Section {
  title: string;
  description: string;
  keys: [string, string][];
  demo: ReactNode;
}

export function AuroraGallery() {
  const { toast } = useToast();
  const [notify, setNotify] = useState(true);
  const [compact, setCompact] = useState(false);
  const [reduced, setReduced] = useState(false);

  const sections: Section[] = [
    {
      title: "Tabs",
      description: "Automatic activation, roving tabindex, panels linked with aria-controls.",
      keys: [["← →", "Move between tabs"], ["Home / End", "First / last tab"], ["Tab", "Into the panel"]],
      demo: (
        <Tabs
          label="Account settings"
          items={[
            { id: "profile", label: "Profile", content: "Name, avatar and public bio. Changes are saved as you type." },
            { id: "security", label: "Security", content: "Passkeys, two-factor methods and active sessions." },
            { id: "billing", label: "Billing", content: "Plan, invoices and payment methods. Taxes are calculated at checkout." },
          ]}
        />
      ),
    },
    {
      title: "Accordion",
      description: "Height animates with CSS grid rows; collapsed regions are inert.",
      keys: [["↑ ↓", "Move between headers"], ["Enter / Space", "Toggle"], ["Home / End", "First / last header"]],
      demo: (
        <Accordion
          items={[
            { id: "a", title: "Is this accessible by default?", content: "Yes. Every primitive follows the WAI-ARIA Authoring Practices and is tested with a keyboard and a screen reader." },
            { id: "b", title: "Does it ship CSS-in-JS?", content: "No. Styles are Tailwind utilities driven by CSS custom properties, so there is zero runtime style injection." },
            { id: "c", title: "Can I theme it?", content: "Tokens live on :root. Override them per theme, per brand, or per component subtree." },
          ]}
        />
      ),
    },
    {
      title: "Switch",
      description: "role=\"switch\" with aria-checked and a spring-eased thumb.",
      keys: [["Space / Enter", "Toggle"], ["Tab", "Move focus"]],
      demo: (
        <div className="space-y-4">
          <Switch checked={notify} onChange={setNotify} label="Email notifications" description="Weekly digest and mentions." />
          <Switch checked={compact} onChange={setCompact} label="Compact mode" description="Tighter spacing in lists." />
          <Switch checked={reduced} onChange={setReduced} label="Reduce motion" description="Respects the OS setting too." />
        </div>
      ),
    },
    {
      title: "Combobox",
      description: "Filtering listbox with aria-activedescendant; the input stays focused.",
      keys: [["↓ ↑", "Highlight option"], ["Enter", "Select"], ["Esc", "Close, then clear"]],
      demo: (
        <Combobox
          label="Favourite framework"
          options={frameworks}
          onSelect={(v) => toast({ title: `Selected ${v}`, variant: "success" })}
        />
      ),
    },
    {
      title: "Tooltip",
      description: "Appears on hover and focus, dismisses on Escape, announced via aria-describedby.",
      keys: [["Tab", "Focus shows tooltip"], ["Esc", "Dismiss"]],
      demo: (
        <div className="flex flex-wrap gap-3">
          <Tooltip label="Saves to the cloud instantly">
            <Info size={14} aria-hidden /> Autosave
          </Tooltip>
          <Tooltip label="Keyboard: ⌘ + Shift + P">
            <Keyboard size={14} aria-hidden /> Command palette
          </Tooltip>
          <Tooltip label="Theme follows the OS by default">
            <Palette size={14} aria-hidden /> Theming
          </Tooltip>
        </div>
      ),
    },
    {
      title: "Dialog & Toast",
      description: "Native <dialog> traps and restores focus; toasts announce politely.",
      keys: [["Esc", "Close dialog"], ["Enter", "Submit form"]],
      demo: (
        <div className="flex flex-wrap items-center gap-3">
          <Modal
            title="Create project"
            description="Give your new design system a name. You can rename it later."
            trigger="Open dialog"
            onConfirm={(v) => toast({ title: "Project created", description: v, variant: "success" })}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast({ title: "Heads up", description: "This toast is announced via aria-live.", variant: "default" })}
          >
            <Bell size={14} aria-hidden /> Show toast
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <div className="grid gap-5 md:grid-cols-2">
        {sections.map((s) => (
          <section key={s.title} className="card flex flex-col p-5 md:p-6" aria-labelledby={`sec-${s.title}`}>
            <h2 id={`sec-${s.title}`} className="text-lg font-semibold">
              {s.title}
            </h2>
            <p className="mt-1 text-sm text-fg-muted">{s.description}</p>
            <div className="my-5 flex-1">{s.demo}</div>
            <details className="group text-xs">
              <summary className="cursor-pointer select-none text-fg-subtle hover:text-fg">
                Keyboard support
              </summary>
              <ul className="mt-2 space-y-1.5">
                {s.keys.map(([k, v]) => (
                  <li key={k} className="flex items-center gap-2 text-fg-muted">
                    <Kbd className="h-auto px-1.5 py-0.5 text-[10px]">{k}</Kbd> {v}
                  </li>
                ))}
              </ul>
            </details>
          </section>
        ))}
      </div>

      <section className="card p-5 md:p-6" aria-labelledby="tokens-heading">
        <h2 id="tokens-heading" className="text-lg font-semibold">
          Design tokens
        </h2>
        <p className="mt-1 text-sm text-fg-muted">
          One source of truth on <code className="font-mono text-xs">:root</code>. Toggle the theme in the header: every component above re-skins with zero JavaScript.
        </p>
        <ul className="mt-5 grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
          {tokens.map(([v, name]) => (
            <li key={v} className="rounded-xl border border-border p-2">
              <span className="block h-10 rounded-lg border border-border" style={{ background: `var(${v})` }} aria-hidden />
              <span className="mt-2 block text-xs font-medium">{name}</span>
              <span className="block truncate font-mono text-[10px] text-fg-subtle">{v}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
