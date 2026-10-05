"use client";

/**
 * Last-resort boundary for errors thrown by the root layout itself. Global
 * CSS is not available here, so styles are inline.
 */
export default function GlobalError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          background: "#08080c",
          color: "#f4f4f5",
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
          textAlign: "center",
          padding: 24,
        }}
      >
        <div>
          <p style={{ fontFamily: "ui-monospace, monospace", fontSize: 12, letterSpacing: "0.3em", textTransform: "uppercase", color: "#f87171" }}>
            Fatal error
          </p>
          <h1 style={{ fontSize: 40, margin: "16px 0 8px", letterSpacing: -1 }}>
            The page failed to render.
          </h1>
          {error.digest && (
            <p style={{ color: "#a1a1aa" }}>
              Digest: <code>{error.digest}</code>
            </p>
          )}
          <button
            type="button"
            onClick={() => retry()}
            style={{
              marginTop: 24,
              height: 44,
              padding: "0 20px",
              borderRadius: 9999,
              border: 0,
              background: "#f4f4f5",
              color: "#08080c",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Reload
          </button>
        </div>
      </body>
    </html>
  );
}
