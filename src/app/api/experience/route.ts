import { ok } from "@/lib/api";
import { experience } from "@/data/experience";

/** GET /api/experience — newest first. */
export function GET() {
  const startedAt = performance.now();
  const items = [...experience].sort((a, b) => b.start.localeCompare(a.start));
  return ok({ total: items.length, items }, startedAt, { cache: "content" });
}
