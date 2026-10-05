import type { Metadata } from "next";
import { DemoShell } from "@/components/demos/demo-shell";
import { AuroraGallery } from "@/components/demos/aurora/gallery";

export const metadata: Metadata = {
  title: "Aurora UI — Accessible Component Kit",
  description:
    "Live demo: Tabs, Accordion, Switch, Combobox, Tooltip, Dialog and Toast built on WAI-ARIA patterns with full keyboard support and token-based theming.",
};

export default function AuroraDemoPage() {
  return (
    <DemoShell slug="aurora-ui">
      <AuroraGallery />
    </DemoShell>
  );
}
