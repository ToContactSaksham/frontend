"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";

interface Props {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
  description?: string;
}

/** role="switch" with a spring thumb; Space/Enter toggle natively via <button>. */
export function Switch({ checked, onChange, label, description }: Props) {
  const id = useId();
  return (
    <div className="flex items-center justify-between gap-4">
      <span id={`${id}-label`} className="text-sm">
        <span className="block font-medium">{label}</span>
        {description && <span className="block text-xs text-fg-muted">{description}</span>}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-labelledby={`${id}-label`}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative h-6 w-11 shrink-0 rounded-full border transition-colors duration-300",
          checked ? "border-accent bg-accent" : "border-border-strong bg-surface-hover",
        )}
      >
        <span
          aria-hidden
          className={cn(
            "absolute left-0.5 top-0.5 h-[18px] w-[18px] rounded-full bg-white shadow transition-transform duration-400 ease-spring",
            checked && "translate-x-5",
          )}
        />
      </button>
    </div>
  );
}
