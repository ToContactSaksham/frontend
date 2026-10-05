import type { ReactNode } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { CommandPalette } from "@/components/layout/command-palette";

/**
 * Chrome for the single-page portfolio: section navbar, footer and the
 * command palette. Demo routes under /demos use their own shell instead.
 */
export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
      <CommandPalette />
    </>
  );
}
