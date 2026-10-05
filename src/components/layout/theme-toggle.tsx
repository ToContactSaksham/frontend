"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/providers/theme-provider";
import { cn } from "@/lib/utils";

/**
 * Both icons are always rendered and swapped purely with CSS (`dark:`), so
 * server and client markup are identical and there is no hydration flicker.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { toggle } = useTheme();
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle colour theme"
      title="Toggle theme"
      className={cn(
        "relative inline-flex h-10 w-10 items-center justify-center rounded-full text-fg-muted transition hover:bg-surface-hover hover:text-fg",
        className,
      )}
    >
      <span className="relative block h-[18px] w-[18px]">
        <Sun
          size={18}
          aria-hidden
          className="absolute inset-0 rotate-90 scale-0 opacity-0 transition-all duration-500 ease-out-expo dark:rotate-0 dark:scale-100 dark:opacity-100"
        />
        <Moon
          size={18}
          aria-hidden
          className="absolute inset-0 rotate-0 scale-100 opacity-100 transition-all duration-500 ease-out-expo dark:-rotate-90 dark:scale-0 dark:opacity-0"
        />
      </span>
    </button>
  );
}
