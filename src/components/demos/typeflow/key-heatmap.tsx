"use client";

import { cn } from "@/lib/utils";

const ROWS = ["qwertyuiop", "asdfghjkl", "zxcvbnm"];

/**
 * Keyboard heatmap of mistyped expected keys. Intensity is mixed into the
 * surface colour with color-mix, so it stays legible in both themes.
 */
export function KeyHeatmap({ errors }: { errors: Record<string, number> }) {
  const max = Math.max(1, ...Object.values(errors));
  const cell = (key: string, label = key, wide = false) => {
    const n = errors[key] ?? 0;
    const pct = Math.round((n / max) * 85);
    return (
      <span
        key={key}
        title={n ? `${label}: ${n} miss${n > 1 ? "es" : ""}` : label}
        aria-label={`${label}: ${n} misses`}
        style={{ background: `color-mix(in oklab, var(--danger) ${pct}%, var(--surface-strong))` }}
        className={cn(
          "grid h-9 place-items-center rounded-md border border-border font-mono text-xs uppercase transition-colors",
          wide ? "col-span-6" : "w-9",
          n ? "text-fg font-semibold" : "text-fg-subtle",
        )}
      >
        {label === " " ? "space" : label}
      </span>
    );
  };

  return (
    <div className="inline-flex flex-col gap-1.5" role="img" aria-label="Error heatmap by key">
      {ROWS.map((row, i) => (
        <div key={row} className="flex gap-1.5" style={{ paddingLeft: `${i * 0.9}rem` }}>
          {row.split("").map((k) => cell(k))}
        </div>
      ))}
      <div className="grid grid-cols-6 gap-1.5 pl-[3.6rem] pr-[3.6rem]">{cell(" ", " ", true)}</div>
    </div>
  );
}
