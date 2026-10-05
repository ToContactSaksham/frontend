"use client";

import { useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface TabItem {
  id: string;
  label: string;
  content: ReactNode;
}

/** WAI-ARIA Tabs with automatic activation and roving tabindex. */
export function Tabs({ items, label, defaultId }: { items: TabItem[]; label: string; defaultId?: string }) {
  const [active, setActive] = useState(defaultId ?? items[0]?.id ?? "");
  const listRef = useRef<HTMLDivElement>(null);

  const activate = (id: string) => {
    setActive(id);
    listRef.current?.querySelector<HTMLButtonElement>(`[data-tab="${id}"]`)?.focus();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const idx = items.findIndex((i) => i.id === active);
    const n = items.length;
    const map: Record<string, number> = {
      ArrowRight: (idx + 1) % n,
      ArrowLeft: (idx - 1 + n) % n,
      Home: 0,
      End: n - 1,
    };
    const next = map[e.key];
    if (next === undefined) return;
    e.preventDefault();
    activate(items[next]!.id);
  };

  return (
    <div>
      <div
        ref={listRef}
        role="tablist"
        aria-label={label}
        onKeyDown={onKeyDown}
        className="flex gap-1 border-b border-border"
      >
        {items.map((i) => {
          const selected = i.id === active;
          return (
            <button
              key={i.id}
              type="button"
              role="tab"
              id={`tab-${i.id}`}
              data-tab={i.id}
              aria-selected={selected}
              aria-controls={`panel-${i.id}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActive(i.id)}
              className={cn(
                "relative px-4 py-2.5 text-sm transition-colors",
                "after:absolute after:inset-x-2 after:-bottom-px after:h-0.5 after:rounded-full after:bg-accent after:transition-transform after:duration-300 after:ease-out-expo",
                selected ? "text-fg after:scale-x-100" : "text-fg-muted hover:text-fg after:scale-x-0",
              )}
            >
              {i.label}
            </button>
          );
        })}
      </div>
      {items.map((i) => (
        <div
          key={i.id}
          role="tabpanel"
          id={`panel-${i.id}`}
          aria-labelledby={`tab-${i.id}`}
          hidden={i.id !== active}
          tabIndex={0}
          className="rounded-b-xl pt-4 text-sm leading-6 text-fg-muted"
        >
          {i.content}
        </div>
      ))}
    </div>
  );
}
