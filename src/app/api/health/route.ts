import { ok } from "@/lib/api";

const bootedAt = Date.now();

/** GET /api/health — liveness probe. */
export function GET() {
  const startedAt = performance.now();
  return ok(
    {
      status: "healthy",
      uptimeSec: Math.round((Date.now() - bootedAt) / 1000),
      version: process.env.npm_package_version ?? "1.0.0",
      runtime: `node ${process.versions.node}`,
      env: process.env.NODE_ENV,
    },
    startedAt,
  );
}
