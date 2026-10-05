import type { NextRequest } from "next/server";
import { fail, ok } from "@/lib/api";
import { shelfCategories, shelfProducts } from "@/data/demos/shelf-products";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * GET /api/demos/shelf/products?q=&category=
 * Backing endpoint for the Shelf storefront demo. Adds ~350 ms of latency so
 * skeleton and stale-while-loading states are visible.
 */
export async function GET(request: NextRequest) {
  const startedAt = performance.now();
  const sp = request.nextUrl.searchParams;
  const q = (sp.get("q") ?? "").trim().toLowerCase();
  const category = sp.get("category");

  if (category && !shelfCategories.includes(category as (typeof shelfCategories)[number])) {
    return fail(
      "INVALID_CATEGORY",
      `category must be one of: ${shelfCategories.join(", ")}`,
      400,
      startedAt,
    );
  }

  await sleep(350);

  const items = shelfProducts.filter(
    (p) =>
      (!category || p.category === category) &&
      (!q || p.name.toLowerCase().includes(q) || p.blurb.toLowerCase().includes(q)),
  );

  return ok(
    { items, total: items.length, categories: shelfCategories },
    startedAt,
    { cache: "none", meta: { simulatedLatencyMs: 350 } },
  );
}
