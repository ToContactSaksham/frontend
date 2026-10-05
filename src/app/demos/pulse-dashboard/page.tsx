import type { Metadata } from "next";
import { DemoShell } from "@/components/demos/demo-shell";
import { PulseDashboardLoader } from "@/components/demos/pulse/loader";

export const metadata: Metadata = {
  title: "Pulse — Realtime Analytics Dashboard",
  description:
    "Live demo: a streaming analytics dashboard with canvas sparklines, a multi-series chart and a virtualised ARIA grid rendering 5,000 rows at 60fps.",
};

export default function PulseDemoPage() {
  return (
    <DemoShell slug="pulse-dashboard">
      <PulseDashboardLoader />
    </DemoShell>
  );
}
