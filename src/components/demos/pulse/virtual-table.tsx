"use client";

import { useEffect, useRef, useState, type KeyboardEvent, type UIEvent } from "react";
import { cn } from "@/lib/utils";
import { typeTone, type EventRow } from "./stream";

interface Props {
  rows: EventRow[];
  height?: number;
  rowHeight?: number;
}

const COLS = "grid-cols-[5.5rem_6rem_1fr_5.5rem_4rem_4.5rem_4.5rem]";

const time = (t: number) =>
  new Date(t).toLocaleTimeString("en-GB", { hour12: false });

/**
 * Windowed table: only the rows intersecting the scroll viewport (plus a
 * small overscan) are in the DOM, so 5,000 rows cost the same as 20.
 * Implements the ARIA grid pattern with roving focus via arrow keys.
 */
export function VirtualTable({ rows, height = 420, rowHeight = 40 }: Props) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef(0);
  const [scrollTop, setScrollTop] = useState(0);
  const [active, setActive] = useState(0);

  const overscan = 6;
  const start = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan);
  const end = Math.min(rows.length, Math.ceil((scrollTop + height) / rowHeight) + overscan);
  const visible = rows.slice(start, end);

  const onScroll = (e: UIEvent<HTMLDivElement>) => {
    const top = e.currentTarget.scrollTop;
    if (rafRef.current) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = 0;
      setScrollTop(top);
    });
  };

  /* Keep the active row inside the viewport when navigating by keyboard. */
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const rowTop = active * rowHeight;
    if (rowTop < el.scrollTop) el.scrollTop = rowTop;
    else if (rowTop + rowHeight > el.scrollTop + height) el.scrollTop = rowTop + rowHeight - height;
  }, [active, rowHeight, height]);

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const page = Math.floor(height / rowHeight);
    const max = rows.length - 1;
    const map: Record<string, number> = {
      ArrowDown: Math.min(max, active + 1),
      ArrowUp: Math.max(0, active - 1),
      PageDown: Math.min(max, active + page),
      PageUp: Math.max(0, active - page),
      Home: 0,
      End: max,
    };
    const next = map[e.key];
    if (next === undefined) return;
    e.preventDefault();
    setActive(next);
  };

  return (
    <div className="overflow-hidden rounded-xl border border-border font-mono text-xs">
      <div
        role="row"
        className={cn(
          "grid items-center gap-3 border-b border-border bg-surface px-3 py-2 text-[10px] uppercase tracking-[0.15em] text-fg-subtle",
          COLS,
        )}
      >
        {["Time", "Type", "Path", "User", "Region", "Status", "Latency"].map((h) => (
          <span key={h} role="columnheader">
            {h}
          </span>
        ))}
      </div>

      <div
        ref={scrollerRef}
        role="grid"
        aria-label="Live events"
        aria-rowcount={rows.length}
        aria-colcount={7}
        aria-activedescendant={rows[active] ? `row-${rows[active].id}` : undefined}
        tabIndex={0}
        onScroll={onScroll}
        onKeyDown={onKeyDown}
        style={{ height }}
        className="relative overflow-y-auto overscroll-contain outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
      >
        <div style={{ height: rows.length * rowHeight }} className="relative">
          {visible.map((r, i) => {
            const index = start + i;
            const isActive = index === active;
            return (
              <div
                key={r.id}
                id={`row-${r.id}`}
                role="row"
                aria-rowindex={index + 1}
                aria-selected={isActive}
                onClick={() => setActive(index)}
                style={{ transform: `translateY(${index * rowHeight}px)`, height: rowHeight }}
                className={cn(
                  "absolute inset-x-0 grid items-center gap-3 border-b border-border/60 px-3 transition-colors",
                  COLS,
                  isActive ? "bg-accent-soft" : index % 2 ? "bg-surface/40" : "",
                  "hover:bg-surface-hover",
                )}
              >
                <span role="gridcell" className="tabular-nums text-fg-muted">
                  {time(r.at)}
                </span>
                <span role="gridcell" className={cn("font-semibold", typeTone[r.type])}>
                  {r.type}
                </span>
                <span role="gridcell" className="truncate text-fg">
                  {r.path}
                </span>
                <span role="gridcell" className="truncate text-fg-muted">
                  {r.user}
                </span>
                <span role="gridcell" className="text-fg-muted">
                  {r.region}
                </span>
                <span
                  role="gridcell"
                  className={cn(
                    "tabular-nums",
                    r.status >= 500 ? "text-danger" : r.status >= 400 ? "text-warning" : "text-success",
                  )}
                >
                  {r.status}
                </span>
                <span
                  role="gridcell"
                  className={cn("tabular-nums", r.ms > 500 ? "text-warning" : "text-fg-muted")}
                >
                  {r.ms} ms
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-border bg-surface px-3 py-1.5 text-[10px] text-fg-subtle">
        <span>
          {rows.length.toLocaleString("en")} rows · {visible.length} in DOM
        </span>
        <span>↑ ↓ PgUp PgDn Home End</span>
      </div>
    </div>
  );
}
