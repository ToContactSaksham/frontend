import { ok } from "@/lib/api";
import { githubFallback } from "@/data/github-fallback";
import { site } from "@/lib/site";
import type { GitHubRepo, GitHubSummary } from "@/lib/types";

/**
 * GET /api/github
 *
 * A backend-for-frontend proxy over the public GitHub REST API. Doing this
 * on the server:
 *   • keeps an optional GITHUB_TOKEN secret (higher rate limit),
 *   • normalises two upstream calls into one typed payload,
 *   • caches with Next.js fetch revalidation so visitors never hit the
 *     unauthenticated 60 req/h limit,
 *   • degrades to a labelled fallback snapshot instead of an error page.
 */

const REVALIDATE_SECONDS = 3600;

interface GhUser {
  login: string;
  name: string | null;
  avatar_url: string;
  html_url: string;
  bio: string | null;
  public_repos: number;
  followers: number;
  following: number;
  created_at: string;
}

interface GhRepo {
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  topics?: string[];
  pushed_at: string;
  fork: boolean;
  archived: boolean;
}

function ghHeaders() {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "saksham-portfolio (+https://github.com)",
  };
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }
  return headers;
}

async function gh<T>(path: string): Promise<T> {
  const res = await fetch(`https://api.github.com${path}`, {
    headers: ghHeaders(),
    next: { revalidate: REVALIDATE_SECONDS, tags: ["github"] },
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) {
    const remaining = res.headers.get("x-ratelimit-remaining");
    throw new Error(
      `GitHub ${path} responded ${res.status}${
        remaining === "0" ? " (rate limited)" : ""
      }`,
    );
  }
  return (await res.json()) as T;
}

function normaliseRepo(r: GhRepo): GitHubRepo {
  return {
    name: r.name,
    fullName: r.full_name,
    description: r.description,
    url: r.html_url,
    homepage: r.homepage || null,
    stars: r.stargazers_count,
    forks: r.forks_count,
    language: r.language,
    topics: r.topics ?? [],
    pushedAt: r.pushed_at,
  };
}

export async function GET() {
  const startedAt = performance.now();
  const user = site.githubUser;

  try {
    const [u, rawRepos] = await Promise.all([
      gh<GhUser>(`/users/${encodeURIComponent(user)}`),
      gh<GhRepo[]>(
        `/users/${encodeURIComponent(user)}/repos?per_page=100&sort=pushed&type=owner`,
      ),
    ]);

    const repos = rawRepos
      .filter((r) => !r.fork && !r.archived)
      .map(normaliseRepo)
      .sort((a, b) => b.stars - a.stars || b.pushedAt.localeCompare(a.pushedAt));

    const totals = repos.reduce(
      (acc, r) => ({ stars: acc.stars + r.stars, forks: acc.forks + r.forks }),
      { stars: 0, forks: 0 },
    );

    const langCounts = new Map<string, number>();
    for (const r of repos) {
      if (r.language) langCounts.set(r.language, (langCounts.get(r.language) ?? 0) + 1);
    }
    const langTotal = [...langCounts.values()].reduce((a, b) => a + b, 0) || 1;
    const languages = [...langCounts.entries()]
      .map(([name, count]) => ({
        name,
        count,
        percent: Math.round((count / langTotal) * 1000) / 10,
      }))
      .sort((a, b) => b.count - a.count);

    const data: GitHubSummary = {
      user: {
        login: u.login,
        name: u.name,
        avatarUrl: u.avatar_url,
        url: u.html_url,
        bio: u.bio,
        publicRepos: u.public_repos,
        followers: u.followers,
        following: u.following,
        createdAt: u.created_at,
      },
      repos: repos.slice(0, 12),
      totals,
      languages,
      fallback: false,
      fetchedAt: new Date().toISOString(),
    };

    return ok(data, startedAt, {
      cache: "proxy",
      meta: { source: "api.github.com", revalidateSeconds: REVALIDATE_SECONDS },
    });
  } catch (err) {
    const reason = err instanceof Error ? err.message : "Unknown error";
    // Degrade gracefully: 200 with a clearly flagged fallback payload so the
    // page still renders. Not cached, so the next request retries upstream.
    return ok(githubFallback(), startedAt, {
      cache: "none",
      meta: { source: "fallback", reason },
    });
  }
}
