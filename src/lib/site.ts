/**
 * Site-wide configuration. Values can be overridden with environment
 * variables (see .env.example) without touching code.
 */
export const site = {
  name: "Saksham",
  title: "Saksham — Frontend Engineer",
  description:
    "Portfolio of Saksham, a frontend engineer crafting fast, accessible, and delightful interfaces with React, Next.js, TypeScript, Tailwind CSS and REST APIs.",
  /** Canonical production URL (Netlify). Override with NEXT_PUBLIC_SITE_URL. */
  url: (
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://sakshamportfolio20.netlify.app"
  ).replace(/\/$/, ""),
  /** GitHub account whose public activity is shown in the GitHub section. */
  githubUser: process.env.GITHUB_USERNAME ?? "ToContactSaksham",
  /** Repository that contains this site and every project demo. */
  repoUrl: "https://github.com/ToContactSaksham/frontend",
  keywords: [
    "Saksham",
    "frontend engineer",
    "React developer",
    "Next.js",
    "TypeScript",
    "Tailwind CSS",
    "REST API",
    "portfolio",
  ],
  locale: "en_US",
} as const;

export const navLinks = [
  { id: "about", label: "About" },
  { id: "skills", label: "Skills" },
  { id: "projects", label: "Projects" },
  { id: "github", label: "GitHub" },
  { id: "experience", label: "Experience" },
  { id: "playground", label: "API Lab" },
  { id: "contact", label: "Contact" },
] as const;

export type SectionId = (typeof navLinks)[number]["id"] | "home";

/** Every project demo lives under this path on the same deployment. */
export const demoPath = (slug: string) => `/demos/${slug}`;
