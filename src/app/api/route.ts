import type { NextRequest } from "next/server";
import { ok } from "@/lib/api";

/**
 * GET /api
 * Discovery document: lists every endpoint with its methods, parameters and
 * an example, so the API is self-describing (and powers the API Playground).
 */
export function GET(request: NextRequest) {
  const startedAt = performance.now();
  const origin = request.nextUrl.origin;

  const endpoints = [
    {
      path: "/api/health",
      methods: ["GET"],
      description: "Liveness probe with uptime and version.",
      example: `${origin}/api/health`,
    },
    {
      path: "/api/projects",
      methods: ["GET"],
      description: "Paginated, filterable list of projects.",
      query: {
        q: "Full-text search across title, tagline, description and tags.",
        tag: "Filter by a single tag, e.g. React. Repeatable.",
        featured: "true | false",
        sort: "year-desc (default) | year-asc | title",
        page: "1-based page number (default 1)",
        pageSize: "1–50 (default 12)",
      },
      example: `${origin}/api/projects?tag=Next.js&pageSize=3`,
    },
    {
      path: "/api/projects/{slug}",
      methods: ["GET"],
      description: "A single project by slug. 404 when unknown.",
      example: `${origin}/api/projects/pulse-dashboard`,
    },
    {
      path: "/api/skills",
      methods: ["GET"],
      description: "Skills grouped by category with proficiency levels.",
      query: { category: "Filter to one category, e.g. Frameworks." },
      example: `${origin}/api/skills?category=Frameworks`,
    },
    {
      path: "/api/experience",
      methods: ["GET"],
      description: "Work history, newest first.",
      example: `${origin}/api/experience`,
    },
    {
      path: "/api/github",
      methods: ["GET"],
      description:
        "Server-side proxy of the GitHub REST API (user, repos, languages), revalidated hourly with a graceful fallback.",
      example: `${origin}/api/github`,
    },
    {
      path: "/api/contact",
      methods: ["POST"],
      description:
        "Submit a contact message. Validates JSON body and returns field-level errors (422) or the stored message id (201).",
      body: {
        name: "string, 2–80 chars",
        email: "string, valid email",
        subject: "string, optional, ≤120 chars",
        message: "string, 20–2000 chars",
      },
      example: `${origin}/api/contact`,
    },
  ];

  return ok(
    {
      name: "Saksham Portfolio API",
      version: "1.0.0",
      envelope: {
        success: "{ ok: true, data, meta }",
        failure: "{ ok: false, error: { code, message, fields? }, meta }",
      },
      endpoints,
    },
    startedAt,
    { cache: "content" },
  );
}
