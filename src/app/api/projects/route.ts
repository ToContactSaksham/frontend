import type { NextRequest } from "next/server";
import { boolParam, fail, intParam, ok } from "@/lib/api";
import { projects, projectTags } from "@/data/projects";
import type { Paginated, Project, ProjectTag } from "@/lib/types";

const SORTS = ["year-desc", "year-asc", "title"] as const;
type Sort = (typeof SORTS)[number];

/**
 * GET /api/projects
 * Query: q, tag (repeatable), featured, sort, page, pageSize
 */
export function GET(request: NextRequest) {
  const startedAt = performance.now();
  const sp = request.nextUrl.searchParams;

  const q = (sp.get("q") ?? "").trim().toLowerCase();
  const tags = sp.getAll("tag").filter(Boolean) as ProjectTag[];
  const featured = boolParam(sp, "featured");
  const sortRaw = sp.get("sort") ?? "year-desc";
  const page = intParam(sp, "page", 1, 1, 10_000);
  const pageSize = intParam(sp, "pageSize", 12, 1, 50);

  if (!SORTS.includes(sortRaw as Sort)) {
    return fail(
      "INVALID_SORT",
      `sort must be one of: ${SORTS.join(", ")}`,
      400,
      startedAt,
      [{ field: "sort", message: `Unknown sort "${sortRaw}".` }],
    );
  }
  const sort = sortRaw as Sort;

  const unknownTags = tags.filter((t) => !projectTags.includes(t));
  if (unknownTags.length) {
    return fail(
      "INVALID_TAG",
      `Unknown tag(s): ${unknownTags.join(", ")}`,
      400,
      startedAt,
      unknownTags.map((t) => ({ field: "tag", message: `Unknown tag "${t}".` })),
    );
  }

  let items: Project[] = projects.filter((p) => {
    if (featured !== undefined && p.featured !== featured) return false;
    if (tags.length && !tags.every((t) => p.tags.includes(t))) return false;
    if (q) {
      const hay = [p.title, p.tagline, p.description, ...p.tags, ...p.highlights]
        .join(" ")
        .toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  items = [...items].sort((a, b) => {
    switch (sort) {
      case "year-asc":
        return a.year - b.year || a.title.localeCompare(b.title);
      case "title":
        return a.title.localeCompare(b.title);
      default:
        return b.year - a.year || a.title.localeCompare(b.title);
    }
  });

  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = (page - 1) * pageSize;
  const pageItems = items.slice(start, start + pageSize);

  const data: Paginated<Project> & { availableTags: ProjectTag[] } = {
    items: pageItems,
    page,
    pageSize,
    total,
    totalPages,
    availableTags: projectTags,
  };

  return ok(data, startedAt, {
    cache: "content",
    meta: { filters: { q: q || null, tags, featured: featured ?? null, sort } },
  });
}
