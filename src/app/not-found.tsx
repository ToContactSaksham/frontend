import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <main id="main" className="relative flex flex-1 items-center overflow-hidden">
      <div aria-hidden className="absolute inset-0 bg-grid mask-fade-b opacity-70" />
      <div className="container-x relative py-32 text-center">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-accent">Error 404</p>
        <h1 className="mt-4 text-6xl font-semibold tracking-tight sm:text-8xl">
          <span className="text-gradient">Lost</span> in the DOM.
        </h1>
        <p className="mx-auto mt-6 max-w-md text-balance text-fg-muted">
          That route doesn&apos;t exist. The API, however, does: try{" "}
          <code className="font-mono text-sm text-fg">GET /api</code> for a map.
        </p>
        <Link
          href="/"
          className="mt-10 inline-flex h-11 items-center gap-2 rounded-full bg-fg px-5 text-sm font-medium text-bg transition hover:opacity-90"
        >
          <ArrowLeft size={16} aria-hidden /> Back home
        </Link>
      </div>
    </main>
  );
}
