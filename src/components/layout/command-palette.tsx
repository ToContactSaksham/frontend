"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import {
  Braces,
  Copy,
  FlaskConical,
  FolderGit2,
  Home,
  Mail,
  MessageSquare,
  Moon,
  Search,
  Sparkles,
  Sun,
  User,
  Briefcase,
  Activity,
  ArrowUpRight,
} from "lucide-react";
import { navLinks } from "@/lib/site";
import { profile } from "@/data/profile";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/providers/theme-provider";
import { useToast } from "@/components/providers/toast-provider";
import { GitHubIcon, LinkedInIcon } from "@/components/icons/brand";
import { Kbd } from "@/components/ui/kbd";

const OPEN_EVENT = "saksham:open-palette";

/** Any component can open the palette without prop drilling. */
export function openCommandPalette() {
  window.dispatchEvent(new Event(OPEN_EVENT));
}

interface Command {
  id: string;
  label: string;
  group: "Navigate" | "Actions" | "Links";
  keywords?: string;
  hint?: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  run: () => void;
}

const navIcons: Record<string, Command["icon"]> = {
  home: Home,
  about: User,
  skills: Sparkles,
  projects: FolderGit2,
  github: Activity,
  experience: Briefcase,
  playground: FlaskConical,
  contact: MessageSquare,
};

function scrollToSection(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "start" });
  history.replaceState(null, "", `#${id}`);
}

/** Subsequence fuzzy match. Returns a score (lower is better) or -1. */
function fuzzy(haystack: string, needle: string) {
  if (!needle) return 0;
  const h = haystack.toLowerCase();
  const n = needle.toLowerCase();
  let hi = 0;
  let score = 0;
  let last = -1;
  for (const ch of n) {
    const idx = h.indexOf(ch, hi);
    if (idx === -1) return -1;
    score += idx - (last + 1); // gaps are penalised
    last = idx;
    hi = idx + 1;
  }
  return score;
}

export function CommandPalette() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState(0);
  const { theme, toggle } = useTheme();
  const { toast } = useToast();

  const commands = useMemo<Command[]>(() => {
    const nav: Command[] = [
      { id: "home", label: "Home", group: "Navigate", icon: Home, run: () => scrollToSection("home") },
      ...navLinks.map<Command>((l) => ({
        id: l.id,
        label: l.label,
        group: "Navigate",
        icon: navIcons[l.id] ?? Home,
        run: () => scrollToSection(l.id),
      })),
    ];
    const actions: Command[] = [
      {
        id: "theme",
        label: theme === "dark" ? "Switch to light theme" : "Switch to dark theme",
        group: "Actions",
        keywords: "dark light mode appearance",
        icon: theme === "dark" ? Sun : Moon,
        run: toggle,
      },
      {
        id: "copy-email",
        label: "Copy email address",
        group: "Actions",
        keywords: "contact mail",
        hint: profile.email,
        icon: Copy,
        run: async () => {
          try {
            await navigator.clipboard.writeText(profile.email);
            toast({ title: "Email copied", description: profile.email, variant: "success" });
          } catch {
            toast({ title: "Couldn't copy", description: profile.email, variant: "error" });
          }
        },
      },
      {
        id: "api-docs",
        label: "Explore the REST API",
        group: "Actions",
        keywords: "json endpoints playground",
        icon: Braces,
        run: () => scrollToSection("playground"),
      },
    ];
    const links: Command[] = [
      {
        id: "gh",
        label: "Open GitHub profile",
        group: "Links",
        icon: GitHubIcon as Command["icon"],
        hint: "↗",
        run: () => window.open(profile.socials.find((s) => s.icon === "github")?.href, "_blank", "noopener"),
      },
      {
        id: "li",
        label: "Open LinkedIn",
        group: "Links",
        icon: LinkedInIcon as Command["icon"],
        hint: "↗",
        run: () => window.open(profile.socials.find((s) => s.icon === "linkedin")?.href, "_blank", "noopener"),
      },
      {
        id: "mail",
        label: "Send an email",
        group: "Links",
        icon: Mail,
        hint: "↗",
        run: () => {
          window.location.href = `mailto:${profile.email}`;
        },
      },
    ];
    return [...nav, ...actions, ...links];
  }, [theme, toggle, toast]);

  const filtered = useMemo(() => {
    if (!query.trim()) return commands;
    return commands
      .map((c) => ({ c, s: fuzzy(`${c.label} ${c.keywords ?? ""}`, query.trim()) }))
      .filter((x) => x.s >= 0)
      .sort((a, b) => a.s - b.s)
      .map((x) => x.c);
  }, [commands, query]);

  const show = () => {
    setQuery("");
    setIndex(0);
    setOpen(true);
  };

  /* Global shortcuts + external open event. */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => {
          if (!o) {
            setQuery("");
            setIndex(0);
          }
          return !o;
        });
      }
    };
    const onOpen = () => show();
    window.addEventListener("keydown", onKey);
    window.addEventListener(OPEN_EVENT, onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener(OPEN_EVENT, onOpen);
    };
  }, []);

  /* Sync React state with the native <dialog>. */
  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    if (open && !d.open) {
      d.showModal();
      inputRef.current?.focus();
    } else if (!open && d.open) {
      d.close();
    }
  }, [open]);

  /* Keep the highlighted row in view. */
  useEffect(() => {
    const row = listRef.current?.querySelector<HTMLElement>(`[data-index="${index}"]`);
    row?.scrollIntoView({ block: "nearest" });
  }, [index]);

  const run = (cmd: Command | undefined) => {
    if (!cmd) return;
    setOpen(false);
    // Let the dialog close before scrolling so focus restoration doesn't fight it.
    window.setTimeout(() => cmd.run(), 10);
  };

  const onInputKey = (e: ReactKeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setIndex((i) => Math.min(filtered.length - 1, i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setIndex((i) => Math.max(0, i - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      run(filtered[index]);
    } else if (e.key === "Home") {
      setIndex(0);
    } else if (e.key === "End") {
      setIndex(filtered.length - 1);
    }
  };

  const groups = ["Navigate", "Actions", "Links"] as const;
  let flatIndex = -1;

  return (
    <dialog
      ref={dialogRef}
      onClose={() => setOpen(false)}
      onClick={(e) => {
        if (e.target === dialogRef.current) setOpen(false);
      }}
      aria-label="Command palette"
      className="fixed left-1/2 top-[12vh] m-0 w-[min(92vw,38rem)] -translate-x-1/2 border-0 bg-transparent p-0 text-fg outline-none open:animate-fade-up"
    >
      <div className="glass overflow-hidden rounded-2xl bg-surface-strong/95 shadow-lg">
        <div className="flex items-center gap-3 border-b border-border px-4">
          <Search size={18} className="shrink-0 text-fg-subtle" aria-hidden />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIndex(0);
            }}
            onKeyDown={onInputKey}
            placeholder="Jump to a section or run an action…"
            aria-label="Search commands"
            role="combobox"
            aria-expanded="true"
            aria-controls="palette-list"
            aria-activedescendant={filtered[index] ? `cmd-${filtered[index].id}` : undefined}
            aria-autocomplete="list"
            autoComplete="off"
            spellCheck={false}
            className="h-14 w-full bg-transparent text-base outline-none placeholder:text-fg-subtle"
          />
          <Kbd className="hidden sm:inline-flex">Esc</Kbd>
        </div>

        <ul
          id="palette-list"
          ref={listRef}
          role="listbox"
          aria-label="Commands"
          className="max-h-[50vh] overflow-y-auto p-2"
        >
          {filtered.length === 0 && (
            <li className="px-3 py-8 text-center text-sm text-fg-muted">
              No matches for “{query}”.
            </li>
          )}
          {groups.map((g) => {
            const items = filtered.filter((c) => c.group === g);
            if (!items.length) return null;
            return (
              <li key={g} role="presentation">
                <p className="px-3 pb-1 pt-2 font-mono text-[10px] uppercase tracking-[0.2em] text-fg-subtle">
                  {g}
                </p>
                <ul role="group" aria-label={g}>
                  {items.map((c) => {
                    flatIndex += 1;
                    const i = flatIndex;
                    const Icon = c.icon;
                    const selected = i === index;
                    return (
                      <li
                        key={c.id}
                        id={`cmd-${c.id}`}
                        role="option"
                        aria-selected={selected}
                        data-index={i}
                        onMouseEnter={() => setIndex(i)}
                        onClick={() => run(c)}
                        className={cn(
                          "flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
                          selected ? "bg-surface-hover text-fg" : "text-fg-muted",
                        )}
                      >
                        <Icon size={16} className={cn("shrink-0", selected ? "text-accent" : "text-fg-subtle")} />
                        <span className="flex-1 truncate">{c.label}</span>
                        {c.hint && (
                          <span className="truncate font-mono text-xs text-fg-subtle">
                            {c.hint}
                          </span>
                        )}
                        {selected && <ArrowUpRight size={14} className="text-fg-subtle" aria-hidden />}
                      </li>
                    );
                  })}
                </ul>
              </li>
            );
          })}
        </ul>

        <div className="flex items-center justify-between border-t border-border px-4 py-2 text-xs text-fg-subtle">
          <span className="flex items-center gap-2">
            <Kbd>↑</Kbd>
            <Kbd>↓</Kbd> navigate
          </span>
          <span className="flex items-center gap-2">
            <Kbd>↵</Kbd> select
          </span>
        </div>
      </div>
    </dialog>
  );
}
