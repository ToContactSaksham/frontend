import type { Metadata } from "next";
import { DemoShell } from "@/components/demos/demo-shell";
import { ShelfStore } from "@/components/demos/shelf/shelf-store";

export const metadata: Metadata = {
  title: "Shelf — Headless Commerce Storefront",
  description:
    "Live demo: a storefront on a REST backend with debounced search, category filters, skeletons and an optimistic cart that rolls back on failure.",
};

export default function ShelfDemoPage() {
  return (
    <DemoShell slug="shelf-commerce">
      <ShelfStore />
    </DemoShell>
  );
}
