import type { Project, ProjectTag } from "@/lib/types";

export const projects: Project[] = [
  {
    slug: "pulse-dashboard",
    title: "Pulse — Realtime Analytics Dashboard",
    tagline: "Streaming charts, 60fps, zero jank on a 2018 laptop.",
    description:
      "A product-analytics dashboard that renders live event streams with virtualised tables, canvas-backed sparklines, and server-side aggregation through a REST API. Built as a Next.js App Router application with React Server Components for the shell and small client islands for interactivity.",
    highlights: [
      "Canvas sparklines batched in a single requestAnimationFrame loop; 10k points at 60fps.",
      "Virtualised data grid with sticky headers, keyboard navigation and ARIA grid semantics.",
      "REST endpoints with cursor pagination, ETag caching and stale-while-revalidate.",
      "Theme tokens shared between Tailwind and chart renderer via CSS variables.",
    ],
    tags: ["Next.js", "React", "TypeScript", "REST API", "Canvas", "Performance"],
    year: 2025,
    featured: true,
    gradient: ["#7c3aed", "#06b6d4"],
    links: [
      { label: "Live demo", href: "https://example.com/pulse" },
      { label: "Source", href: "https://github.com/ToContactSaksham" },
    ],
    metrics: [
      { label: "LCP", value: "0.9s" },
      { label: "Bundle", value: "68kb" },
      { label: "Lighthouse", value: "100" },
    ],
  },
  {
    slug: "aurora-ui",
    title: "Aurora UI — Accessible Component Kit",
    tagline: "48 headless-first components with a tokenised theme engine.",
    description:
      "A design-system package built on React and Tailwind CSS v4 with CSS-variable tokens, automatic dark mode, and WAI-ARIA compliant primitives: dialog, combobox, menu, tabs, toast and more. Documented with live playgrounds and visual regression tests.",
    highlights: [
      "Tokens authored once, emitted to CSS variables, Tailwind theme and Figma JSON.",
      "Focus management, roving tabindex and screen-reader announcements on every primitive.",
      "Tree-shakeable ESM output; zero runtime CSS-in-JS.",
      "Playwright + axe audit on every pull request.",
    ],
    tags: ["React", "TypeScript", "Tailwind CSS", "Design System", "Accessibility"],
    year: 2024,
    featured: true,
    gradient: ["#db2777", "#f59e0b"],
    links: [
      { label: "Storybook", href: "https://example.com/aurora" },
      { label: "Source", href: "https://github.com/ToContactSaksham" },
    ],
    metrics: [
      { label: "Components", value: "48" },
      { label: "axe issues", value: "0" },
      { label: "Weekly installs", value: "3.2k" },
    ],
  },
  {
    slug: "kinetic-landing",
    title: "Kinetic — Scroll-Driven Product Launch Site",
    tagline: "Pure HTML, CSS and JavaScript. No framework, no compromise.",
    description:
      "A launch microsite exploring the limits of vanilla web tech: scroll-driven animations with the Web Animations API, view transitions, and a WebGL-free particle field on <canvas>. Hand-written HTML, modern CSS (container queries, :has, @layer) and plain ES modules.",
    highlights: [
      "Scroll-timeline animations progressively enhanced from IntersectionObserver.",
      "Container-query driven layout: no media-query breakpoints at all.",
      "Interactive canvas particle field with pointer gravity and DPR-aware rendering.",
      "100/100/100/100 Lighthouse on mobile, 23kb total transfer.",
    ],
    tags: ["HTML", "CSS", "JavaScript", "Animation", "Canvas", "Performance"],
    year: 2024,
    featured: true,
    gradient: ["#0ea5e9", "#22c55e"],
    links: [
      { label: "Live", href: "https://example.com/kinetic" },
      { label: "Source", href: "https://github.com/ToContactSaksham" },
    ],
    metrics: [
      { label: "Transfer", value: "23kb" },
      { label: "JS", value: "6kb" },
      { label: "CLS", value: "0.00" },
    ],
  },
  {
    slug: "shelf-commerce",
    title: "Shelf — Headless Commerce Storefront",
    tagline: "Next.js storefront on a REST commerce backend, optimistic everything.",
    description:
      "A headless storefront with server-rendered product pages, streaming search results, optimistic cart mutations and a REST backend-for-frontend layer that normalises three third-party APIs into one typed contract.",
    highlights: [
      "Backend-for-frontend route handlers with schema validation and typed error envelopes.",
      "Optimistic cart updates with rollback using React transitions.",
      "Streaming search with Suspense boundaries and skeletons that match final layout.",
      "Image pipeline with blur placeholders and responsive srcsets.",
    ],
    tags: ["Next.js", "React", "TypeScript", "REST API", "Tailwind CSS"],
    year: 2023,
    featured: false,
    gradient: ["#f97316", "#ef4444"],
    links: [
      { label: "Case study", href: "https://example.com/shelf" },
    ],
    metrics: [
      { label: "Conversion", value: "+18%" },
      { label: "TTFB", value: "120ms" },
    ],
  },
  {
    slug: "typeflow",
    title: "TypeFlow — Realtime Typing Trainer",
    tagline: "Keystroke-accurate stats with a buttery caret.",
    description:
      "A typing-practice web app with per-keystroke latency tracking, heatmaps of error-prone keys, and a results REST API with leaderboards. Focused on input handling, IME edge cases and precise timing.",
    highlights: [
      "Composition-event aware input handling for international keyboards.",
      "Caret animated with FLIP technique for sub-pixel smoothness.",
      "Leaderboard REST API with rate limiting and input validation.",
    ],
    tags: ["React", "TypeScript", "REST API", "Animation", "Tailwind CSS"],
    year: 2023,
    featured: false,
    gradient: ["#a855f7", "#ec4899"],
    links: [
      { label: "Play", href: "https://example.com/typeflow" },
      { label: "Source", href: "https://github.com/ToContactSaksham" },
    ],
  },
  {
    slug: "a11y-audit-kit",
    title: "A11y Audit Kit — Browser Extension",
    tagline: "Find, explain and fix accessibility issues in-page.",
    description:
      "A browser extension that overlays accessibility diagnostics on any page: contrast, landmarks, heading order, missing names. Written in TypeScript with a React popup and a vanilla-JS content script for minimal footprint.",
    highlights: [
      "Shadow-DOM isolated overlay so host page styles never leak.",
      "Contrast checks against WCAG 2.2 and APCA.",
      "Zero-dependency content script under 12kb.",
    ],
    tags: ["TypeScript", "JavaScript", "React", "Accessibility", "HTML"],
    year: 2022,
    featured: false,
    gradient: ["#14b8a6", "#6366f1"],
    links: [{ label: "Source", href: "https://github.com/ToContactSaksham" }],
  },
];

export const projectTags: ProjectTag[] = Array.from(
  new Set(projects.flatMap((p) => p.tags)),
).sort() as ProjectTag[];
