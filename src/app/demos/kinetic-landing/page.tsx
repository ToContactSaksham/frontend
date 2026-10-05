import type { Metadata } from "next";
import { ArrowUpRight, FileCode2 } from "lucide-react";
import { DemoShell } from "@/components/demos/demo-shell";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Kinetic — Scroll-Driven Launch Site",
  description:
    "Live demo: a product-launch microsite in pure HTML, CSS and JavaScript with scroll-driven animations, container queries and a canvas particle field.",
};

const STANDALONE = "/demos/kinetic/index.html";

/**
 * The demo is a genuine static site (public/demos/kinetic) with no framework,
 * framed here so the portfolio chrome stays consistent. It can also be opened
 * standalone.
 */
export default function KineticDemoPage() {
  return (
    <DemoShell
      slug="kinetic-landing"
      controls={
        <Button href={STANDALONE} variant="ghost" size="sm" className="hidden sm:inline-flex">
          Open standalone <ArrowUpRight size={14} aria-hidden />
        </Button>
      }
    >
      <div className="card overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-2 text-xs text-fg-muted">
          <span className="inline-flex items-center gap-2 font-mono">
            <FileCode2 size={14} aria-hidden /> public/demos/kinetic/index.html · styles.css · app.js
          </span>
          <a
            href={STANDALONE}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-fg-muted underline-offset-4 hover:text-fg hover:underline sm:hidden"
          >
            Open standalone <ArrowUpRight size={12} aria-hidden />
          </a>
        </div>
        <iframe
          src={STANDALONE}
          title="Kinetic — scroll-driven launch site (vanilla HTML, CSS and JavaScript)"
          className="block h-[80vh] min-h-[32rem] w-full bg-bg"
          loading="eager"
        />
      </div>
      <p className="mt-4 text-sm text-fg-muted">
        Scroll inside the frame. The page runs with its own stylesheet and a single ES module; nothing
        from React or Next.js is loaded inside it.
      </p>
    </DemoShell>
  );
}
