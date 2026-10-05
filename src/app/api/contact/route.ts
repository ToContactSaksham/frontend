import type { NextRequest } from "next/server";
import { clientIp, fail, ok, rateLimit, requestId } from "@/lib/api";
import { validateContact } from "@/lib/validation";
import type { ContactResult } from "@/lib/types";

const MAX_BODY_BYTES = 16 * 1024;

/**
 * POST /api/contact
 *
 * Accepts JSON { name, email, subject?, message, website? } and responds:
 *   201 { ok: true, data: { id, receivedAt, echo } }
 *   400 malformed JSON / wrong content type
 *   413 body too large
 *   422 validation failure with field-level errors
 *   429 rate limited (Retry-After header)
 *
 * Only POST is exported, so Next.js answers other methods with 405.
 */
export async function POST(request: NextRequest) {
  const startedAt = performance.now();

  const ip = clientIp(request);
  const rl = rateLimit(`contact:${ip}`, { limit: 5, windowMs: 10 * 60 * 1000 });
  if (!rl.allowed) {
    return fail(
      "RATE_LIMITED",
      "Too many messages from this address. Please try again later.",
      429,
      startedAt,
      undefined,
      { "Retry-After": String(rl.retryAfterSec) },
    );
  }

  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    return fail(
      "UNSUPPORTED_MEDIA_TYPE",
      "Send the body as application/json.",
      415,
      startedAt,
    );
  }

  const length = Number(request.headers.get("content-length") ?? 0);
  if (length > MAX_BODY_BYTES) {
    return fail("PAYLOAD_TOO_LARGE", "Body exceeds 16 KB.", 413, startedAt);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail("INVALID_JSON", "Body is not valid JSON.", 400, startedAt);
  }
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return fail("INVALID_JSON", "Body must be a JSON object.", 400, startedAt);
  }

  const result = validateContact(body);
  if (!result.ok) {
    return fail(
      "VALIDATION_FAILED",
      "Some fields need attention.",
      422,
      startedAt,
      result.fields,
    );
  }

  // In production this is where you would forward to email, a CRM, or a
  // database. The portfolio deliberately stores nothing: it logs a redacted
  // line and returns an id the client can reference.
  const id = requestId();
  const receivedAt = new Date().toISOString();
  console.info(
    `[contact] ${id} from ${result.value.email.replace(/(.{2}).+(@.*)/, "$1***$2")} (${result.value.message.length} chars)`,
  );

  const data: ContactResult = {
    id,
    receivedAt,
    echo: { name: result.value.name, subject: result.value.subject },
  };

  return ok(data, startedAt, {
    status: 201,
    headers: { "X-RateLimit-Remaining": String(rl.remaining) },
  });
}
