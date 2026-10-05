import type { NextRequest } from "next/server";
import { fail, ok } from "@/lib/api";
import { projects } from "@/data/projects";

/** GET /api/projects/{slug} */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const startedAt = performance.now();
  const { slug } = await params;

  const project = projects.find((p) => p.slug === slug);
  if (!project) {
    return fail(
      "NOT_FOUND",
      `No project with slug "${slug}".`,
      404,
      startedAt,
    );
  }

  const index = projects.indexOf(project);
  const related = projects
    .filter((p) => p.slug !== slug && p.tags.some((t) => project.tags.includes(t)))
    .slice(0, 3)
    .map((p) => ({ slug: p.slug, title: p.title }));

  return ok(
    {
      ...project,
      related,
      links: project.links,
      _links: {
        self: `/api/projects/${project.slug}`,
        collection: "/api/projects",
        prev: projects[index - 1] ? `/api/projects/${projects[index - 1]!.slug}` : null,
        next: projects[index + 1] ? `/api/projects/${projects[index + 1]!.slug}` : null,
      },
    },
    startedAt,
    { cache: "content" },
  );
}
