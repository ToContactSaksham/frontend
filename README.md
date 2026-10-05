# Saksham — Frontend Engineer Portfolio

A single-page portfolio built to *demonstrate* frontend craft rather than just describe it. Every section is driven by real code paths: React Server Components for the shell, small client islands for interactivity, custom hooks, a typed REST API layer with validation, and animation tuned for 60 fps and reduced-motion users alike.

**Stack:** HTML · CSS · JavaScript · TypeScript · React 19 · Next.js 16 (App Router, Turbopack) · Tailwind CSS v4 · REST API via Route Handlers

---

## What's inside

| Area | Highlights |
| --- | --- |
| **Hero** | Canvas particle constellation (DPR-aware, pointer attraction, pauses offscreen, static frame under `prefers-reduced-motion`), typewriter roles, magnetic CTAs, tech marquee |
| **Theme** | Light/dark via `data-theme`, applied by an inline script before first paint (no flash), persisted in `localStorage`, synced across tabs, follows system changes until the user picks one |
| **Navigation** | Glass navbar with a sliding active-section pill (IntersectionObserver), mobile overlay menu with focus management and scroll lock, scroll-progress bar, **⌘K / Ctrl+K command palette** (native `<dialog>`, fuzzy search, keyboard navigation, ARIA combobox/listbox) |
| **Skills** | Fetched from `GET /api/skills`; SVG progress rings animate from the JSON when scrolled into view; category tabs |
| **Projects** | Fetched from `GET /api/projects` with **URL-synced filters** (`?tag=&q=&sort=`), debounced search, 3D tilt + spotlight cards, native `<dialog>` detail view hitting `GET /api/projects/{slug}` |
| **GitHub** | `GET /api/github` proxies the GitHub REST API server-side (optional token), normalises user + repos + language stats, revalidates hourly, and returns a labelled fallback snapshot when upstream is unavailable |
| **Experience** | Scroll-revealed alternating timeline (server component) |
| **API Lab** | In-page REST explorer: pick an endpoint, edit query/path params or a JSON body, send, inspect status, latency, headers and syntax-highlighted JSON; copy as `curl`; request history |
| **Contact** | Shared client/server validation schema, `POST /api/contact`, field-level 422 errors, honeypot, per-IP rate limiting, success state with the returned id |
| **SEO** | `metadata` + `viewport` exports, generated Open Graph / Twitter images (`next/og`), favicon + Apple icon, `sitemap.xml`, `robots.txt`, web manifest, JSON-LD Person schema |
| **Resilience** | `loading.tsx`, `error.tsx` (uses `retry`), `global-error.tsx`, styled `not-found.tsx` |
| **Accessibility** | Skip link, semantic landmarks, visible focus rings, ARIA on every interactive widget, reduced-motion respected everywhere |

## REST API

All endpoints return the same envelope and set `X-Request-Id` and `Cache-Control` headers.

```jsonc
// success
{ "ok": true,  "data": { ... }, "meta": { "requestId": "…", "timestamp": "…", "durationMs": 1.2 } }
// failure
{ "ok": false, "error": { "code": "VALIDATION_FAILED", "message": "…", "fields": [ { "field": "email", "message": "…" } ] }, "meta": { ... } }
```

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

Try them in the **API Lab** section of the site, or:

```bash
curl -s 'http://localhost:3000/api/projects?tag=React&pageSize=2' | jq
curl -s -X POST http://localhost:3000/api/contact \
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
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` | Canonical URL for metadata, OG image, sitemap |
| `GITHUB_USERNAME` | `ToContactSaksham` | GitHub account shown in the GitHub section |
| `GITHUB_TOKEN` | – | Optional. Raises the GitHub API limit from 60 to 5,000 req/h. Server-only |

## Project structure

```
src/
├─ app/
│  ├─ api/                 # REST API (Route Handlers)
│  │  ├─ route.ts          # GET /api – discovery
│  │  ├─ health/ projects/ projects/[slug]/ skills/ experience/ github/ contact/
│  ├─ layout.tsx           # fonts, metadata, theme script, providers
│  ├─ page.tsx             # composes the sections
│  ├─ opengraph-image.tsx  # generated social image (next/og)
│  ├─ icon.tsx · apple-icon.tsx · sitemap.ts · robots.ts · manifest.ts
│  ├─ loading.tsx · error.tsx · global-error.tsx · not-found.tsx
│  └─ globals.css          # Tailwind v4 theme tokens, utilities, keyframes
├─ components/
│  ├─ layout/              # navbar, command palette, footer, theme toggle, scroll progress
│  ├─ providers/           # ThemeProvider (useSyncExternalStore), ToastProvider
│  ├─ sections/            # hero, about, skills, projects, github, experience, playground, contact
│  ├─ ui/                  # Button, Badge, Reveal, TiltCard, Magnetic, Section, Skeleton, Kbd
│  └─ icons/               # inline SVG brand icons
├─ hooks/                  # useApi, useInView, useActiveSection, useMediaQuery
├─ data/                   # profile, projects, skills, experience (edit these to make it yours)
└─ lib/                    # types, API envelope helpers, validation schema, utils, site config
```

## Customising

All content lives in `src/data/*.ts` and `src/lib/site.ts`. Change the name, roles, projects, skills and experience there; the API, the UI and the OG image all read from the same source.

## Engineering notes

- **No flash of wrong theme:** an inline `<script>` in `<head>` sets `data-theme` before paint; the provider reads the DOM through `useSyncExternalStore`, so there is no effect-driven flicker and no hydration mismatch.
- **Animations never trigger React renders:** scroll progress, tilt, magnetic buttons and reveal-on-scroll write directly to the DOM or CSS custom properties; a single shared `IntersectionObserver` powers every `<Reveal>`.
- **Derived loading state:** `useApi` derives `loading` from "requested key ≠ resolved key" instead of setting state synchronously inside effects, which keeps it compatible with the React Compiler lint rules.
- **URL as state:** project filters read `useSearchParams` and write with `history.replaceState`, which Next.js syncs with its router without a server round-trip.
- **Graceful degradation:** the GitHub proxy returns `200` with `fallback: true` rather than an error when upstream is unreachable, and the UI labels it honestly.
