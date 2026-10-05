"use client";

import { useEffect, useState } from "react";

/**
 * Returns the id of the section currently crossing an activation line at
 * roughly 40% of the viewport height. Uses one IntersectionObserver with a
 * thin rootMargin band instead of scroll math, plus a cheap end-of-page
 * check so the final (short) section can still become active.
 */
export function useActiveSection(ids: readonly string[], initial = "home") {
  const [active, setActive] = useState(initial);

  useEffect(() => {
    const sections = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    if (!sections.length) return;

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
        }
      },
      // A 6%-tall band starting 40% down the viewport.
      { rootMargin: "-40% 0px -54% 0px", threshold: 0 },
    );
    sections.forEach((s) => io.observe(s));

    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const atBottom =
          window.innerHeight + window.scrollY >=
          document.documentElement.scrollHeight - 2;
        if (atBottom) setActive(sections[sections.length - 1]!.id);
        else if (window.scrollY < 40) setActive(sections[0]!.id);
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [ids]);

  return active;
}
