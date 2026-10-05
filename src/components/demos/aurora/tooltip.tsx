"use client";

import { useEffect, useId, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Tooltip on a focusable trigger: shows on hover and keyboard focus, hides
 * on Escape, and is linked with aria-describedby so screen readers announce
 * it alongside the control.
 */
export function Tooltip({ label, children }: { label: string; children: ReactNode }) {
  const id = useId();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <span className="relative inline-block">
      <button
        type="button"
        aria-describedby={id}
        onPointerEnter={() => setOpen(true)}
        onPointerLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        className="inline-flex h-9 items-center gap-2 rounded-full border border-border px-3.5 text-sm text-fg transition hover:bg-surface-hover"
      >
        {children}
      </button>
      <span
        role="tooltip"
        id={id}
        className={cn(
          "pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-fg px-2.5 py-1.5 text-xs font-medium text-bg shadow-md transition-all duration-200 ease-out-expo",
          open ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0",
        )}
      >
        {label}
        <span aria-hidden className="absolute left-1/2 top-full -ml-1 border-4 border-transparent border-t-fg" />
      </span>
    </span>
  );
}
