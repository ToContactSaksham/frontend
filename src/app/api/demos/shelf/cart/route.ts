import type { NextRequest } from "next/server";
import { fail, ok } from "@/lib/api";
import { shelfProducts } from "@/data/demos/shelf-products";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const ACTIONS = ["add", "remove", "setQty"] as const;
type Action = (typeof ACTIONS)[number];

/**
 * POST /api/demos/shelf/cart
 * Body: { action: "add" | "remove" | "setQty", productId: string, qty?: number }
 *
 * Validates and echoes the mutation after ~450 ms. Send `X-Chaos: 1` to make
 * half of the requests fail with 500, which lets the storefront demonstrate
 * optimistic updates rolling back.
 */
export async function POST(request: NextRequest) {
  const startedAt = performance.now();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail("INVALID_JSON", "Body is not valid JSON.", 400, startedAt);
  }
  const b = (body ?? {}) as Record<string, unknown>;

  const action = b.action as Action;
  if (!ACTIONS.includes(action)) {
    return fail("INVALID_ACTION", `action must be one of: ${ACTIONS.join(", ")}`, 422, startedAt, [
      { field: "action", message: "Unknown action." },
    ]);
  }
  const product = shelfProducts.find((p) => p.id === b.productId);
  if (!product) {
    return fail("UNKNOWN_PRODUCT", "No such product.", 404, startedAt, [
      { field: "productId", message: "Unknown product id." },
    ]);
  }
  const qty = action === "setQty" ? Number(b.qty) : action === "add" ? 1 : 0;
  if (action === "setQty" && (!Number.isInteger(qty) || qty < 1 || qty > 20)) {
    return fail("INVALID_QTY", "qty must be an integer from 1 to 20.", 422, startedAt, [
      { field: "qty", message: "Quantity must be between 1 and 20." },
    ]);
  }

  await sleep(450);

  if (request.headers.get("x-chaos") === "1" && Math.random() < 0.5) {
    return fail(
      "CHAOS_MONKEY",
      "Simulated upstream failure (chaos mode is on).",
      500,
      startedAt,
    );
  }

  return ok(
    {
      action,
      product: { id: product.id, name: product.name, price: product.price },
      qty,
      at: new Date().toISOString(),
    },
    startedAt,
    { cache: "none" },
  );
}
