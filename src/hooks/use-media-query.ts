"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * Subscribe to a CSS media query. Implemented with useSyncExternalStore so
 * it is hydration-safe: the server value is used during hydration and the
 * real value is applied right after, with no effect-driven flicker.
 */
export function useMediaQuery(query: string, serverDefault = false) {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const mq = window.matchMedia(query);
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    [query],
  );
  const getSnapshot = useCallback(() => window.matchMedia(query).matches, [query]);
  const getServerSnapshot = useCallback(() => serverDefault, [serverDefault]);
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function useReducedMotion() {
  return useMediaQuery("(prefers-reduced-motion: reduce)");
}

/** True on devices with a fine pointer that can hover (mouse/trackpad). */
export function useCanHover() {
  return useMediaQuery("(hover: hover) and (pointer: fine)");
}
