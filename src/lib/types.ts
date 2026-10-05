/**
 * Shared domain types. These are the single source of truth for both the
 * REST API responses (src/app/api/**) and the UI components that consume them.
 */

export type SkillCategory =
  | "Languages"
  | "Frameworks"
  | "Styling"
  | "Tooling"
  | "APIs & Data"
  | "Quality";

export interface Skill {
  name: string;
  /** 0–100 self-assessed proficiency */
  level: number;
  category: SkillCategory;
  /** Years of hands-on experience */
  years: number;
  /** Optional accent for the ring; falls back to theme accent */
  color?: string;
}

export type ProjectTag =
  | "React"
  | "Next.js"
  | "TypeScript"
  | "JavaScript"
  | "Tailwind CSS"
  | "HTML"
  | "CSS"
  | "REST API"
  | "Animation"
  | "Accessibility"
  | "Performance"
  | "Canvas"
  | "Design System";

export interface ProjectLink {
  label: string;
  href: string;
}

export interface Project {
  slug: string;
  title: string;
  tagline: string;
  description: string;
  /** Bullet points explaining what made it technically interesting */
  highlights: string[];
  tags: ProjectTag[];
  year: number;
  featured: boolean;
  /** Two theme-agnostic gradient stops used for the card's visual */
  gradient: [string, string];
  links: ProjectLink[];
  metrics?: { label: string; value: string }[];
}

export interface Experience {
  id: string;
  role: string;
  company: string;
  location: string;
  start: string; // ISO yyyy-mm
  end: string | "Present";
  summary: string;
  achievements: string[];
  stack: string[];
}

export interface SocialLink {
  label: string;
  href: string;
  icon: "github" | "linkedin" | "x" | "mail";
}

export interface Profile {
  name: string;
  firstName: string;
  title: string;
  tagline: string;
  location: string;
  email: string;
  availability: string;
  bio: string[];
  roles: string[];
  socials: SocialLink[];
  stats: { label: string; value: number; suffix?: string }[];
}

/* ------------------------------------------------------------------ */
/* API envelope                                                        */
/* ------------------------------------------------------------------ */

export interface ApiMeta {
  requestId: string;
  timestamp: string;
  durationMs: number;
  [key: string]: unknown;
}

export interface ApiSuccess<T> {
  ok: true;
  data: T;
  meta: ApiMeta;
}

export interface ApiFieldError {
  field: string;
  message: string;
}

export interface ApiFailure {
  ok: false;
  error: {
    code: string;
    message: string;
    fields?: ApiFieldError[];
  };
  meta: ApiMeta;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

export interface Paginated<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

/* ------------------------------------------------------------------ */
/* GitHub (shape returned by /api/github after normalisation)          */
/* ------------------------------------------------------------------ */

export interface GitHubRepo {
  name: string;
  fullName: string;
  description: string | null;
  url: string;
  homepage: string | null;
  stars: number;
  forks: number;
  language: string | null;
  topics: string[];
  pushedAt: string;
}

export interface GitHubSummary {
  user: {
    login: string;
    name: string | null;
    avatarUrl: string;
    url: string;
    bio: string | null;
    publicRepos: number;
    followers: number;
    following: number;
    createdAt: string;
  };
  repos: GitHubRepo[];
  totals: { stars: number; forks: number };
  languages: { name: string; count: number; percent: number }[];
  /** true when the payload came from the local fallback, not GitHub */
  fallback: boolean;
  fetchedAt: string;
}

export interface ContactPayload {
  name: string;
  email: string;
  subject?: string;
  message: string;
  /** honeypot: must be empty */
  website?: string;
}

export interface ContactResult {
  id: string;
  receivedAt: string;
  echo: Pick<ContactPayload, "name" | "subject">;
}
