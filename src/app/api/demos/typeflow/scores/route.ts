import type { NextRequest } from "next/server";
import { clientIp, fail, ok, rateLimit, requestId } from "@/lib/api";
import type { ApiFieldError } from "@/lib/types";

export interface Score {
  id: string;
  name: string;
  wpm: number;
  accuracy: number;
  at: string;
}

/* In-memory leaderboard, seeded so the board is never empty. On serverless
   hosts each instance keeps its own list; fine for a demo. */
const scores: Score[] = [
  { id: "seed-1", name: "Ada", wpm: 112, accuracy: 98.6, at: "2026-09-02T10:12:00Z" },
  { id: "seed-2", name: "Grace", wpm: 104, accuracy: 97.1, at: "2026-09-04T18:40:00Z" },
  { id: "seed-3", name: "Linus", wpm: 96, accuracy: 95.8, at: "2026-09-10T08:03:00Z" },
  { id: "seed-4", name: "Margaret", wpm: 88, accuracy: 99.2, at: "2026-09-15T14:27:00Z" },
  { id: "seed-5", name: "Tim", wpm: 81, accuracy: 94.0, at: "2026-09-21T21:55:00Z" },
  { id: "seed-6", name: "Hedy", wpm: 74, accuracy: 96.3, at: "2026-09-28T12:11:00Z" },
];

const top = () => [...scores].sort((a, b) => b.wpm - a.wpm || b.accuracy - a.accuracy).slice(0, 10);

/** GET /api/demos/typeflow/scores — top 10. */
export function GET() {
  const startedAt = performance.now();
  return ok({ items: top(), total: scores.length }, startedAt);
}

/** POST /api/demos/typeflow/scores — { name, wpm, accuracy } */
export async function POST(request: NextRequest) {
  const startedAt = performance.now();

  const rl = rateLimit(`typeflow:${clientIp(request)}`, { limit: 10, windowMs: 60_000 });
  if (!rl.allowed) {
    return fail("RATE_LIMITED", "Slow down a little.", 429, startedAt, undefined, {
      "Retry-After": String(rl.retryAfterSec),
    });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail("INVALID_JSON", "Body is not valid JSON.", 400, startedAt);
  }
  const b = (body ?? {}) as Record<string, unknown>;
  const fields: ApiFieldError[] = [];

  const name = typeof b.name === "string" ? b.name.replace(/[\u0000-\u001f\u007f]/g, "").trim() : "";
  if (name.length < 1 || name.length > 20) {
    fields.push({ field: "name", message: "Name must be 1–20 characters." });
  }
  const wpm = Number(b.wpm);
  if (!Number.isInteger(wpm) || wpm < 1 || wpm > 300) {
    fields.push({ field: "wpm", message: "wpm must be an integer from 1 to 300." });
  }
  const accuracy = Number(b.accuracy);
  if (!Number.isFinite(accuracy) || accuracy < 0 || accuracy > 100) {
    fields.push({ field: "accuracy", message: "accuracy must be between 0 and 100." });
  }
  if (fields.length) {
    return fail("VALIDATION_FAILED", "Some fields need attention.", 422, startedAt, fields);
  }

  const entry: Score = {
    id: requestId(),
    name,
    wpm,
    accuracy: Math.round(accuracy * 10) / 10,
    at: new Date().toISOString(),
  };
  scores.push(entry);
  if (scores.length > 200) scores.splice(0, scores.length - 200);

  const rank = [...scores].sort((a, b) => b.wpm - a.wpm || b.accuracy - a.accuracy).findIndex((s) => s.id === entry.id) + 1;

  return ok({ entry, rank, total: scores.length }, startedAt, { status: 201 });
}
