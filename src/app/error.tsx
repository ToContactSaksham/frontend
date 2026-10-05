"use client";

import { useEffect } from "react";
import { RotateCcw } from "lucide-react";

/**
 * Route-level error boundary. `retry` re-renders the segment and re-runs
 * its data fetching; `error.digest` matches the entry in server logs.
 */
export default function ErrorPage({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main id="main" className="flex flex-1 items-center">
      <div className="container-x py-32 text-center">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-danger">Something broke</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-6xl">
          An unexpected error occurred.
        </h1>
        <p className="mx-auto mt-6 max-w-md text-fg-muted">
          The error has been logged
          {error.digest ? (
            <>
              {" "}
              with digest <code className="font-mono text-sm text-fg">{error.digest}</code>
            </>
          ) : null}
          . You can try rendering this section again.
        </p>
        <button
          type="button"
          onClick={() => retry()}
          className="mt-10 inline-flex h-11 items-center gap-2 rounded-full bg-fg px-5 text-sm font-medium text-bg transition hover:opacity-90"
        >
          <RotateCcw size={16} aria-hidden /> Try again
        </button>
      </div>
    </main>
  );
}
