"use client";

import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  options: string[];
  label: string;
  placeholder?: string;
  onSelect?: (value: string) => void;
}

/**
 * Editable combobox (ARIA 1.2 pattern): filtering listbox, Up/Down/Enter/
 * Escape keys, aria-activedescendant, click-outside to close.
 */
export function Combobox({ options, label, placeholder = "Search…", onSelect }: Props) {
  const id = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);

  const filtered = useMemo(
    () => options.filter((o) => o.toLowerCase().includes(query.trim().toLowerCase())).slice(0, 8),
    [options, query],
  );

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [open]);

  useEffect(() => {
    listRef.current?.querySelector<HTMLElement>(`[data-index="${index}"]`)?.scrollIntoView({ block: "nearest" });
  }, [index]);

  const choose = (value: string) => {
    setSelected(value);
    setQuery(value);
    setOpen(false);
    onSelect?.(value);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        if (!open) setOpen(true);
        else setIndex((i) => Math.min(filtered.length - 1, i + 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setIndex((i) => Math.max(0, i - 1));
        break;
      case "Enter":
        if (open && filtered[index]) {
          e.preventDefault();
          choose(filtered[index]);
        }
        break;
      case "Escape":
        if (open) setOpen(false);
        else {
          setQuery("");
          setSelected(null);
        }
        break;
    }
  };

  const activeId = open && filtered[index] ? `${id}-opt-${index}` : undefined;

  return (
    <div ref={rootRef} className="relative">
      <label htmlFor={`${id}-input`} className="mb-1.5 block text-sm font-medium">
        {label}
      </label>
      <div className="relative">
        <input
          id={`${id}-input`}
          role="combobox"
          aria-expanded={open}
          aria-controls={`${id}-listbox`}
          aria-autocomplete="list"
          aria-activedescendant={activeId}
          autoComplete="off"
          value={query}
          placeholder={placeholder}
          onChange={(e) => {
            setQuery(e.target.value);
            setIndex(0);
            setOpen(true);
            if (selected) setSelected(null);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          className="h-10 w-full rounded-xl border border-border bg-bg pl-3 pr-9 text-sm outline-none transition placeholder:text-fg-subtle focus:border-accent"
        />
        <button
          type="button"
          tabIndex={-1}
          aria-label={open ? "Close options" : "Open options"}
          onClick={() => setOpen((o) => !o)}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-fg-subtle hover:text-fg"
        >
          <ChevronsUpDown size={14} aria-hidden />
        </button>
      </div>

      <ul
        ref={listRef}
        id={`${id}-listbox`}
        role="listbox"
        aria-label={label}
        hidden={!open}
        className="card absolute z-20 mt-1.5 max-h-56 w-full overflow-y-auto p-1 shadow-lg"
      >
        {filtered.length === 0 && (
          <li className="px-3 py-2 text-sm text-fg-muted" role="presentation">
            No matches
          </li>
        )}
        {filtered.map((o, i) => (
          <li
            key={o}
            id={`${id}-opt-${i}`}
            data-index={i}
            role="option"
            aria-selected={selected === o}
            onMouseDown={(e) => e.preventDefault()}
            onMouseEnter={() => setIndex(i)}
            onClick={() => choose(o)}
            className={cn(
              "flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-sm",
              i === index ? "bg-surface-hover text-fg" : "text-fg-muted",
            )}
          >
            {o}
            {selected === o && <Check size={14} className="text-accent" aria-hidden />}
          </li>
        ))}
      </ul>
      <p className="mt-1.5 text-xs text-fg-subtle" aria-live="polite">
        {selected ? `Selected: ${selected}` : `${filtered.length} of ${options.length} options`}
      </p>
    </div>
  );
}
