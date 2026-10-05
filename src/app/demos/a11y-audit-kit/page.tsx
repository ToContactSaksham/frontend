import type { Metadata } from "next";
import { DemoShell } from "@/components/demos/demo-shell";
import { AuditKit } from "@/components/demos/a11y/audit-kit";

export const metadata: Metadata = {
  title: "A11y Audit Kit — Accessibility Checker",
  description:
    "Live demo: edit HTML, render it in a sandboxed frame and get a prioritised accessibility report covering alt text, headings, names, labels, landmarks, focus order and colour contrast.",
};

export default function A11yDemoPage() {
  return (
    <DemoShell slug="a11y-audit-kit">
      <AuditKit />
    </DemoShell>
  );
}
