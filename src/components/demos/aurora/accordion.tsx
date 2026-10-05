"use client";

import { useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AccordionItem {
  id: string;
  title: string;
  content: ReactNode;
}

/**
 * Accordion with animated height (CSS grid 0fr → 1fr), aria-expanded /
 * aria-controls wiring, inert collapsed regions and arrow-key navigation
 * between headers.
 */
export function Accordion({ items, allowMultiple = false }: { items: AccordionItem[]; allowMultiple?: boolean }) {
  const [open, setOpen] = useState<string[]>(items[0] ? [items[0].id] : []);
  const rootRef = useRef<HTMLDivElement>(null);

  const toggle = (id: string) =>
    setOpen((o) => {
      const isOpen = o.includes(id);
      if (allowMultiple) return isOpen ? o.filter((x) => x !== id) : [...o, id];
      return isOpen ? [] : [id];
    });

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const buttons = Array.from(rootRef.current?.querySelectorAll<HTMLButtonElement>("[data-acc]") ?? []);
    const idx = buttons.findIndex((b) => b === document.activeElement);
    if (idx === -1) return;
    const n = buttons.length;
    const map: Record<string, number> = {
      ArrowDown: (idx + 1) % n,
      ArrowUp: (idx - 1 + n) % n,
      Home: 0,
      End: n - 1,
    };
    const next = map[e.key];
    if (next === undefined) return;
    e.preventDefault();
    buttons[next]?.focus();
  };

  return (
    <div ref={rootRef} onKeyDown={onKeyDown} className="divide-y divide-border rounded-xl border border-border">
      {items.map((item) => {
        const isOpen = open.includes(item.id);
        return (
          <div key={item.id}>
            <h3>
              <button
                type="button"
                data-acc
                id={`acc-btn-${item.id}`}
                aria-expanded={isOpen}
                aria-controls={`acc-panel-${item.id}`}
                onClick={() => toggle(item.id)}
                className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left text-sm font-medium transition hover:bg-surface-hover"
              >
                {item.title}
                <ChevronDown
                  size={16}
                  aria-hidden
                  className={cn("shrink-0 text-fg-subtle transition-transform duration-300 ease-out-expo", isOpen && "rotate-180")}
                />
              </button>
            </h3>
            <div
              id={`acc-panel-${item.id}`}
              role="region"
              aria-labelledby={`acc-btn-${item.id}`}
              inert={!isOpen}
              style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
              className="grid transition-[grid-template-rows] duration-300 ease-out-expo"
            >
              <div className="min-h-0 overflow-hidden">
                <div className="px-4 pb-4 text-sm leading-6 text-fg-muted">{item.content}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
