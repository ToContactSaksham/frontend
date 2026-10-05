"use client";

import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";

export type Theme = "light" | "dark";
export const THEME_STORAGE_KEY = "theme";

/**
 * Inline script injected into <head> by the root layout. Runs before first
 * paint so the correct theme is applied with zero flash. Kept here next to
 * the provider so the two can never disagree about the storage key.
 */
export const themeInitScript = `(function(){var d=document.documentElement;d.classList.add("js");try{var k="${THEME_STORAGE_KEY}",s=localStorage.getItem(k),m=window.matchMedia("(prefers-color-scheme: dark)").matches,t=s==="light"||s==="dark"?s:(m?"dark":"light");d.setAttribute("data-theme",t)}catch(e){d.setAttribute("data-theme","dark")}})();`;

function readTheme(): Theme {
  return document.documentElement.getAttribute("data-theme") === "light"
    ? "light"
    : "dark";
}

function resolvePreferred(): Theme {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === "light" || stored === "dark") return stored;
  } catch {
    /* storage unavailable */
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function applyTheme(theme: Theme, persist: boolean) {
  document.documentElement.setAttribute("data-theme", theme);
  if (persist) {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      /* ignore */
    }
  }
}

/** The DOM attribute is the store; a MutationObserver is the subscription. */
function subscribe(onChange: () => void) {
  const mo = new MutationObserver(onChange);
  mo.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });

  const onStorage = (e: StorageEvent) => {
    if (e.key === THEME_STORAGE_KEY && (e.newValue === "light" || e.newValue === "dark")) {
      applyTheme(e.newValue, false);
    }
  };
  window.addEventListener("storage", onStorage);

  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  const onSystem = () => {
    let stored: string | null = null;
    try {
      stored = localStorage.getItem(THEME_STORAGE_KEY);
    } catch {
      /* ignore */
    }
    if (!stored) applyTheme(mq.matches ? "dark" : "light", false);
  };
  mq.addEventListener("change", onSystem);

  return () => {
    mo.disconnect();
    window.removeEventListener("storage", onStorage);
    mq.removeEventListener("change", onSystem);
  };
}

interface ThemeContextValue {
  theme: Theme;
  setTheme: (t: Theme) => void;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const theme = useSyncExternalStore(subscribe, readTheme, () => "dark" as Theme);

  // Dev-only safety net: React Strict Mode's double mount can reset <html>
  // attributes. Re-apply the resolved theme once on mount; no-op in prod.
  useLayoutEffect(() => {
    applyTheme(resolvePreferred(), false);
  }, []);

  const setTheme = useCallback((t: Theme) => applyTheme(t, true), []);
  const toggle = useCallback(
    () => applyTheme(readTheme() === "dark" ? "light" : "dark", true),
    [],
  );

  const value = useMemo(() => ({ theme, setTheme, toggle }), [theme, setTheme, toggle]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within <ThemeProvider>");
  return ctx;
}
