"use client";

import { useEffect, useRef, useState } from "react";
import { Menu, Search, X } from "lucide-react";
import { navLinks } from "@/lib/site";
import { cn } from "@/lib/utils";
import { useActiveSection } from "@/hooks/use-active-section";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { openCommandPalette } from "@/components/layout/command-palette";
import { Kbd } from "@/components/ui/kbd";

const sectionIds = ["home", ...navLinks.map((l) => l.id)] as const;

export function Navbar() {
  const active = useActiveSection(sectionIds);
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const listRef = useRef<HTMLUListElement>(null);
  const indicatorRef = useRef<HTMLSpanElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  /* Glass background once the page is scrolled. */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* Sliding pill indicator under the active desktop link. */
  useEffect(() => {
    const list = listRef.current;
    const pill = indicatorRef.current;
    if (!list || !pill) return;

    const place = () => {
      const link = list.querySelector<HTMLAnchorElement>(`a[data-id="${active}"]`);
      if (!link) {
        pill.style.opacity = "0";
        return;
      }
      pill.style.opacity = "1";
      pill.style.width = `${link.offsetWidth}px`;
      pill.style.transform = `translateX(${link.offsetLeft}px)`;
    };
    place();
    const ro = new ResizeObserver(place);
    ro.observe(list);
    return () => ro.disconnect();
  }, [active]);

  /* Mobile menu: lock scroll, close on Escape, manage focus. */
  useEffect(() => {
    if (!open) return;
    const trigger = menuButtonRef.current;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    const first = document.querySelector<HTMLAnchorElement>("#mobile-menu a");
    first?.focus();
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
      trigger?.focus();
    };
  }, [open]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-[padding] duration-500 ease-out-expo",
        scrolled ? "py-2" : "py-4",
      )}
    >
      <div className="container-x">
        <nav
          aria-label="Primary"
          className={cn(
            "flex h-14 items-center justify-between rounded-full px-3 pl-5 transition-all duration-500 ease-out-expo",
            scrolled ? "glass shadow-md" : "border border-transparent",
          )}
        >
          <a
            href="#home"
            className="group flex items-center gap-2 font-semibold tracking-tight"
            aria-label="Saksham — back to top"
          >
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-fg text-bg transition-transform duration-500 ease-spring group-hover:rotate-[-8deg]">
              S
            </span>
            <span className="hidden sm:inline">
              saksham<span className="text-accent">.</span>
            </span>
          </a>

          <ul
            ref={listRef}
            className="relative hidden items-center gap-1 md:flex"
          >
            <span
              ref={indicatorRef}
              aria-hidden
              className="absolute left-0 top-1/2 h-8 w-0 -translate-y-1/2 rounded-full bg-surface-hover opacity-0 transition-[transform,width,opacity] duration-500 ease-out-expo"
            />
            {navLinks.map((l) => (
              <li key={l.id} className="relative">
                <a
                  href={`#${l.id}`}
                  data-id={l.id}
                  aria-current={active === l.id ? "true" : undefined}
                  className={cn(
                    "relative z-10 inline-flex h-8 items-center rounded-full px-3 text-sm transition-colors",
                    active === l.id ? "text-fg" : "text-fg-muted hover:text-fg",
                  )}
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={openCommandPalette}
              className="hidden h-10 items-center gap-2 rounded-full px-3 text-sm text-fg-muted transition hover:bg-surface-hover hover:text-fg sm:inline-flex"
              aria-label="Open command palette"
            >
              <Search size={16} aria-hidden />
              <span className="hidden lg:inline">Search</span>
              <span className="flex items-center gap-0.5">
                <Kbd>⌘</Kbd>
                <Kbd>K</Kbd>
              </span>
            </button>
            <ThemeToggle />
            <button
              ref={menuButtonRef}
              type="button"
              onClick={() => setOpen(true)}
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label="Open menu"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full text-fg-muted transition hover:bg-surface-hover hover:text-fg md:hidden"
            >
              <Menu size={20} aria-hidden />
            </button>
          </div>
        </nav>
      </div>

      {/* Mobile overlay menu */}
      <div
        id="mobile-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Site menu"
        inert={!open}
        className={cn(
          "fixed inset-0 z-[60] flex flex-col bg-bg/95 backdrop-blur-xl transition-opacity duration-400 md:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      >
        <div className="container-x flex h-[4.5rem] items-center justify-between">
          <span className="font-semibold">Menu</span>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-fg-muted transition hover:bg-surface-hover hover:text-fg"
          >
            <X size={22} aria-hidden />
          </button>
        </div>
        <ul className="container-x mt-6 flex flex-col gap-1">
          {navLinks.map((l, i) => (
            <li
              key={l.id}
              style={{ transitionDelay: open ? `${80 + i * 50}ms` : "0ms" }}
              className={cn(
                "transition-all duration-500 ease-out-expo",
                open ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
              )}
            >
              <a
                href={`#${l.id}`}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center justify-between rounded-2xl px-4 py-4 text-2xl font-semibold tracking-tight transition hover:bg-surface-hover",
                  active === l.id ? "text-fg" : "text-fg-muted",
                )}
              >
                {l.label}
                <span className="font-mono text-xs text-fg-subtle">
                  0{i + 1}
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </header>
  );
}
