import type { Skill } from "@/lib/types";

export const skills: Skill[] = [
  // Languages
  { name: "JavaScript (ES2024)", level: 96, years: 6, category: "Languages" },
  { name: "TypeScript", level: 93, years: 5, category: "Languages" },
  { name: "HTML5 (semantic)", level: 98, years: 7, category: "Languages" },
  { name: "CSS3 / Modern CSS", level: 95, years: 7, category: "Languages" },

  // Frameworks
  { name: "React 19", level: 95, years: 5, category: "Frameworks" },
  { name: "Next.js (App Router)", level: 92, years: 4, category: "Frameworks" },
  { name: "React Server Components", level: 86, years: 2, category: "Frameworks" },
  { name: "State (Zustand, Context, URL)", level: 90, years: 4, category: "Frameworks" },

  // Styling
  { name: "Tailwind CSS v4", level: 96, years: 4, category: "Styling" },
  { name: "CSS Animations & Motion", level: 92, years: 5, category: "Styling" },
  { name: "Responsive & Fluid Layout", level: 97, years: 6, category: "Styling" },
  { name: "Design Systems & Tokens", level: 90, years: 4, category: "Styling" },

  // APIs & Data
  { name: "REST API Design", level: 90, years: 5, category: "APIs & Data" },
  { name: "Fetch, Caching & Revalidation", level: 91, years: 4, category: "APIs & Data" },
  { name: "Route Handlers / BFF", level: 88, years: 3, category: "APIs & Data" },
  { name: "Auth, Pagination, Error Contracts", level: 87, years: 4, category: "APIs & Data" },

  // Tooling
  { name: "Git & GitHub Flow", level: 94, years: 6, category: "Tooling" },
  { name: "Turbopack / Vite", level: 85, years: 3, category: "Tooling" },
  { name: "ESLint, Prettier, CI", level: 90, years: 5, category: "Tooling" },
  { name: "Vercel & Edge Deploys", level: 88, years: 4, category: "Tooling" },

  // Quality
  { name: "Accessibility (WCAG 2.2)", level: 91, years: 4, category: "Quality" },
  { name: "Web Performance / CWV", level: 93, years: 4, category: "Quality" },
  { name: "Testing (Vitest, Playwright)", level: 85, years: 3, category: "Quality" },
  { name: "SEO & Metadata", level: 88, years: 4, category: "Quality" },
];

export const skillCategories = [
  "Languages",
  "Frameworks",
  "Styling",
  "APIs & Data",
  "Tooling",
  "Quality",
] as const;
