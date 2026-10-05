import type { GitHubSummary } from "@/lib/types";
import { site } from "@/lib/site";

/**
 * Snapshot used when the live GitHub REST API is unreachable or rate
 * limited. The UI labels it clearly as a fallback so visitors are never
 * misled about freshness.
 */
export function githubFallback(): GitHubSummary {
  const repos: GitHubSummary["repos"] = [
    {
      name: "frontend",
      fullName: `${site.githubUser}/frontend`,
      description:
        "This portfolio: Next.js App Router, React, Tailwind CSS v4 and a typed REST API layer.",
      url: `https://github.com/${site.githubUser}/frontend`,
      homepage: site.url,
      stars: 0,
      forks: 0,
      language: "TypeScript",
      topics: ["nextjs", "react", "tailwindcss", "portfolio", "rest-api"],
      pushedAt: new Date().toISOString(),
    },
  ];

  return {
    user: {
      login: site.githubUser,
      name: site.name,
      avatarUrl: `https://github.com/${site.githubUser}.png`,
      url: `https://github.com/${site.githubUser}`,
      bio: "Frontend engineer. React, Next.js, TypeScript, Tailwind CSS.",
      publicRepos: repos.length,
      followers: 0,
      following: 0,
      createdAt: "2020-01-01T00:00:00Z",
    },
    repos,
    totals: { stars: 0, forks: 0 },
    languages: [{ name: "TypeScript", count: 1, percent: 100 }],
    fallback: true,
    fetchedAt: new Date().toISOString(),
  };
}
