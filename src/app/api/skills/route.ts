import type { NextRequest } from "next/server";
import { fail, ok } from "@/lib/api";
import { skillCategories, skills } from "@/data/skills";
import type { Skill, SkillCategory } from "@/lib/types";

/**
 * GET /api/skills
 * Query: category — optional filter.
 */
export function GET(request: NextRequest) {
  const startedAt = performance.now();
  const category = request.nextUrl.searchParams.get("category");

  if (category && !skillCategories.includes(category as SkillCategory)) {
    return fail(
      "INVALID_CATEGORY",
      `category must be one of: ${skillCategories.join(", ")}`,
      400,
      startedAt,
      [{ field: "category", message: `Unknown category "${category}".` }],
    );
  }

  const list = category
    ? skills.filter((s) => s.category === category)
    : skills;

  const groups = skillCategories
    .filter((c) => !category || c === category)
    .map((c) => {
      const items = list.filter((s) => s.category === c);
      const avg = items.length
        ? Math.round(items.reduce((a, s) => a + s.level, 0) / items.length)
        : 0;
      return { category: c, average: avg, items };
    });

  const data: {
    total: number;
    categories: typeof groups;
    flat: Skill[];
  } = { total: list.length, categories: groups, flat: list };

  return ok(data, startedAt, { cache: "content" });
}
