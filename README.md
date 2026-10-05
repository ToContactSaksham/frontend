# Saksham — Frontend Engineer Portfolio

**Live:** https://sakshamportfolio20.netlify.app

A single-page portfolio built to *demonstrate* frontend craft rather than just describe it. Every section is driven by real code paths: React Server Components for the shell, small client islands for interactivity, custom hooks, a typed REST API layer with validation, and animation tuned for 60 fps and reduced-motion users alike. Every project card links to a **working live demo hosted on this same deployment**.

**Stack:** HTML · CSS · JavaScript · TypeScript · React 19 · Next.js 16 (App Router, Turbopack) · Tailwind CSS v4 · REST API via Route Handlers

---

## Live project demos

| Project | Route | What it demonstrates |
| --- | --- | --- |
| **Pulse** — Realtime Analytics Dashboard | [`/demos/pulse-dashboard`](https://sakshamportfolio20.netlify.app/demos/pulse-dashboard) | Simulated live stream, canvas sparklines, multi-series canvas chart with hover crosshair, **virtualised ARIA grid** (5,000 rows, ~25 in the DOM) with keyboard navigation, pause/speed controls, FPS meter |
| **Aurora UI** — Accessible Component Kit | [`/demos/aurora-ui`](https://sakshamportfolio20.netlify.app/demos/aurora-ui) | Tabs, Accordion, Switch, Combobox, Tooltip, Dialog and Toast built on WAI-ARIA patterns with full keyboard support; token swatches that re-skin on theme change |
| **Kinetic** — Scroll-Driven Launch Site | [`/demos/kinetic-landing`](https://sakshamportfolio20.netlify.app/demos/kinetic-landing) | A genuine **no-framework** page (`public/demos/kinetic/`): scroll-driven animations with `animation-timeline`, container queries, pointer parallax, canvas particles, reduced-motion gating. Also openable standalone |
| **Shelf** — Headless Commerce Storefront | [`/demos/shelf-commerce`](https://sakshamportfolio20.netlify.app/demos/shelf-commerce) | Products from a REST endpoint with debounced search and filters, skeletons, and an **optimistic cart** (`useOptimistic` + `useTransition`) that rolls back when “chaos mode” makes the API fail |
| **TypeFlow** — Realtime Typing Trainer | [`/demos/typeflow`](https://sakshamportfolio20.netlify.app/demos/typeflow) | Keystroke-accurate WPM/accuracy, IME-aware input, FLIP-animated caret, WPM chart, key error heatmap, REST leaderboard with validation |
| **A11y Audit Kit** — Accessibility Checker | [`/demos/a11y-audit-kit`](https://sakshamportfolio20.netlify.app/demos/a11y-audit-kit) | A real audit engine (alt text, heading order, accessible names, labels, landmarks, focus order, duplicate ids, **colour contrast**) run against a sandboxed iframe; edit the HTML and watch issues appear and disappear |

Each demo has a shared shell with a back link, a link to its source folder on GitHub, and a “What to look for” panel.

## What's inside the portfolio page

| Area | Highlights |
| --- | --- |
| **Hero** | Canvas particle constellation (DPR-aware, pointer attraction, pauses offscreen, static frame under `prefers-reduced-motion`), typewriter roles, magnetic CTAs, tech marquee |
| **Theme** | Light/dark via `data-theme`, applied by an inline script before first paint (no flash), persisted in `localStorage`, synced across tabs, follows system changes until the user picks one |
| **Navigation** | Glass navbar with a sliding active-section pill (IntersectionObserver), mobile overlay menu with focus management and scroll lock, scroll-progress bar, **⌘K / Ctrl+K command palette** (native `<dialog>`, fuzzy search, keyboard navigation, ARIA combobox/listbox) |
| **Skills** | Fetched from `GET /api/skills`; SVG progress rings animate from the JSON when scrolled into view; category tabs |
| **Projects** | Fetched from `GET /api/projects` with **URL-synced filters** (`?tag=&q=&sort=`), debounced search, 3D tilt + spotlight cards, native `<dialog>` detail view hitting `GET /api/projects/{slug}`, direct “Live demo” links |
| **GitHub** | `GET /api/github` proxies the GitHub REST API server-side (optional token), normalises user + repos + language stats, revalidates hourly, and returns a labelled fallback snapshot when upstream is unavailable |
| **Experience** | Scroll-revealed alternating timeline (server component) |
| **API Lab** | In-page REST explorer: pick an endpoint, edit query/path params or a JSON body, send, inspect status, latency, headers and syntax-highlighted JSON; copy as `curl`; request history |
| **Contact** | Shared client/server validation schema, `POST /api/contact`, field-level 422 errors, honeypot, per-IP rate limiting, success state with the returned id |
| **SEO** | `metadata` + `viewport` exports, generated Open Graph / Twitter images (`next/og`), favicon + Apple icon, `sitemap.xml` (including demos), `robots.txt`, web manifest, JSON-LD Person schema |
| **Resilience** | `loading.tsx`, `error.tsx` (uses `retry`), `global-error.tsx`, styled `not-found.tsx` |
| **Accessibility** | Skip link, semantic landmarks, visible focus rings, ARIA on every interactive widget, reduced-motion respected everywhere; scroll-reveal is JS-gated so content is always visible without JavaScript |

## REST API

All endpoints return the same envelope and set `X-Request-Id` and `Cache-Control` headers.

```jsonc
// success
{ "ok": true,  "data": { ... }, "meta": { "requestId": "…", "timestamp": "…", "durationMs": 1.2 } }
// failure
{ "ok": false, "error": { "code": "VALIDATION_FAILED", "message": "…", "fields": [ { "field": "email", "message": "…" } ] }, "meta": { ... } }
```

### Portfolio endpoints

| Method | Path | Description | Notable responses |
| --- | --- | --- | --- |
| GET | `/api` | Discovery document listing every endpoint | 200 |
| GET | `/api/health` | Liveness probe (uptime, version, runtime) | 200 |
| GET | `/api/projects` | List projects. Query: `q`, `tag` (repeatable), `featured`, `sort` (`year-desc` \| `year-asc` \| `title`), `page`, `pageSize` (1–50) | 200, 400 `INVALID_TAG` / `INVALID_SORT` |
| GET | `/api/projects/{slug}` | Single project with related items and `_links` | 200, 404 `NOT_FOUND` |
| GET | `/api/skills` | Skills grouped by category. Query: `category` | 200, 400 `INVALID_CATEGORY` |
| GET | `/api/experience` | Work history, newest first | 200 |
| GET | `/api/github` | Proxied GitHub profile, top repos, language breakdown. `data.fallback` is `true` when served from the snapshot | 200 |
| POST | `/api/contact` | JSON `{ name, email, subject?, message }` | 201, 400 `INVALID_JSON`, 413, 415, 422 `VALIDATION_FAILED`, 429 `RATE_LIMITED` (+ `Retry-After`) |

### Demo endpoints

| Method | Path | Description | Notable responses |
| --- | --- | --- | --- |
| GET | `/api/demos/shelf/products` | Storefront catalogue. Query: `q`, `category`. Adds ~350 ms latency so loading states are visible | 200, 400 |
| POST | `/api/demos/shelf/cart` | `{ action: add \| remove \| setQty, productId, qty? }`. Send header `X-Chaos: 1` to make half the calls fail | 200, 404, 422, 500 `CHAOS_MONKEY` |
| GET | `/api/demos/typeflow/scores` | Top-10 leaderboard | 200 |
| POST | `/api/demos/typeflow/scores` | `{ name (1–20), wpm (1–300), accuracy (0–100) }` | 201, 422, 429 |

Try them in the **API Lab** section of the site, or:

```bash
curl -s 'https://sakshamportfolio20.netlify.app/api/projects?tag=React&pageSize=2' | jq
curl -s -X POST https://sakshamportfolio20.netlify.app/api/contact \
  -H 'Content-Type: application/json' \
  -d '{"name":"Ada","email":"ada@example.com","message":"Hello from the command line, nice API!"}'
```

## Getting started

```bash
npm install
cp .env.example .env.local   # optional – see below
npm run dev                  # http://localhost:3000
```

| Script | What it does |
| --- | --- |
| `npm run dev` | Start the dev server (Turbopack) |
| `npm run build` | Production build (type-checks too) |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint (flat config, React Compiler rules) |

### Environment variables

| Variable | Default | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | `https://sakshamportfolio20.netlify.app` | Canonical URL for metadata, OG image, sitemap |
| `GITHUB_USERNAME` | `ToContactSaksham` | GitHub account shown in the GitHub section |
| `GITHUB_TOKEN` | – | Optional. Raises the GitHub API limit from 60 to 5,000 req/h. Server-only |

## Project structure

```
src/
├─ app/
│  ├─ (site)/              # the single-page portfolio (navbar, footer, palette)
│  │  ├─ layout.tsx · page.tsx · loading.tsx
│  ├─ demos/               # one route per project demo, each wrapped in DemoShell
│  │  ├─ pulse-dashboard/ aurora-ui/ kinetic-landing/ shelf-commerce/ typeflow/ a11y-audit-kit/
│  ├─ api/                 # REST API (Route Handlers)
│  │  ├─ route.ts          # GET /api – discovery
│  │  ├─ health/ projects/ projects/[slug]/ skills/ experience/ github/ contact/
│  │  └─ demos/            # shelf/products, shelf/cart, typeflow/scores
│  ├─ layout.tsx           # fonts, metadata, theme script, providers
│  ├─ opengraph-image.tsx  # generated social image (next/og)
│  ├─ icon.tsx · apple-icon.tsx · sitemap.ts · robots.ts · manifest.ts
│  ├─ error.tsx · global-error.tsx · not-found.tsx
│  └─ globals.css          # Tailwind v4 theme tokens, utilities, keyframes
├─ components/
│  ├─ demos/               # demo-shell + pulse/ aurora/ shelf/ typeflow/ a11y/
│  ├─ layout/              # navbar, command palette, footer, theme toggle, scroll progress
│  ├─ providers/           # ThemeProvider (useSyncExternalStore), ToastProvider
│  ├─ sections/            # hero, about, skills, projects, github, experience, playground, contact
│  ├─ ui/                  # Button, Badge, Reveal, TiltCard, Magnetic, Section, Skeleton, Kbd, Avatar
│  └─ icons/               # inline SVG brand icons
├─ hooks/                  # useApi, useInView, useActiveSection, useMediaQuery
├─ data/                   # profile, projects, skills, experience + demos/ (products, passages, a11y samples)
└─ lib/                    # types, API envelope helpers, validation schema, utils, site config, demos/a11y-audit
public/demos/kinetic/      # the vanilla HTML/CSS/JS demo (no framework)
```

## Customising

All content lives in `src/data/*.ts` and `src/lib/site.ts`. Change the name, roles, projects, skills and experience there; the API, the UI and the OG image all read from the same source. Project “Live demo” links resolve to `/demos/<slug>` on the current deployment, so they keep working on any domain.

## Engineering notes

- **No flash of wrong theme:** an inline `<script>` in `<head>` sets `data-theme` before paint; the provider reads the DOM through `useSyncExternalStore`, so there is no effect-driven flicker and no hydration mismatch.
- **Animations never trigger React renders:** scroll progress, tilt, magnetic buttons, reveal-on-scroll and every canvas write directly to the DOM or CSS custom properties; a single shared `IntersectionObserver` powers every `<Reveal>`.
- **Derived loading state:** `useApi` derives `loading` from "requested key ≠ resolved key" instead of setting state synchronously inside effects, which keeps it compatible with the React Compiler lint rules.
- **URL as state:** project filters read `useSearchParams` and write with `history.replaceState`, which Next.js syncs with its router without a server round-trip.
- **Client-only where it must be:** the Pulse dashboard is time- and randomness-driven, so it is loaded with `next/dynamic({ ssr: false })` from a Client Component and seeded once off-render.
- **Graceful degradation:** the GitHub proxy returns `200` with `fallback: true` rather than an error when upstream is unreachable, and the UI labels it honestly.
