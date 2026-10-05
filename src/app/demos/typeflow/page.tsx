import type { Metadata } from "next";
import { DemoShell } from "@/components/demos/demo-shell";
import { TypeFlow } from "@/components/demos/typeflow/typeflow";

export const metadata: Metadata = {
  title: "TypeFlow — Realtime Typing Trainer",
  description:
    "Live demo: a typing trainer with keystroke-accurate WPM and accuracy, a FLIP-animated caret, an error heatmap and a REST leaderboard.",
};

export default function TypeFlowDemoPage() {
  return (
    <DemoShell slug="typeflow">
      <TypeFlow />
    </DemoShell>
  );
}
