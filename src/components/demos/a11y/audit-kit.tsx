"use client";

import { useEffect, useRef, useState } from "react";
import { Bug, CheckCircle2, Eye, EyeOff, Play, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { a11ySamples, type SampleKey } from "@/data/demos/a11y-samples";
import { impactOrder, runAudit as auditWithTiming, type Impact, type Issue } from "@/lib/demos/a11y-audit";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const impactTone: Record<Impact, "danger" | "warning" | "accent" | "neutral"> = {
  critical: "danger",
  serious: "warning",
  moderate: "accent",
  minor: "neutral",
};

const OVERLAY_STYLE_ID = "__a11y_overlay";

function applyOverlay(doc: Document, issues: Issue[], show: boolean) {
  doc.querySelectorAll("[data-a11y]").forEach((el) => {
    el.removeAttribute("data-a11y");
    el.removeAttribute("data-a11y-active");
  });
  doc.getElementById(OVERLAY_STYLE_ID)?.remove();
  if (!show) return;
  const style = doc.createElement("style");
  style.id = OVERLAY_STYLE_ID;
  style.textContent = `
    [data-a11y] { outline: 2px dashed #ef4444 !important; outline-offset: 2px !important; }
    [data-a11y-active] { outline: 3px solid #f59e0b !important; box-shadow: 0 0 0 6px rgba(245,158,11,.25) !important; }
  `;
  doc.head.appendChild(style);
  for (const issue of issues) {
    try {
      doc.querySelector(issue.selector)?.setAttribute("data-a11y", issue.rule);
    } catch {
      /* invalid selector — skip */
    }
  }
}

/**
 * Edit HTML on the left, see it rendered in a sandboxed iframe on the right,
 * and get a prioritised issue list from the audit engine. Clicking an issue
 * highlights the offending element inside the frame.
 */
export function AuditKit() {
  const [preset, setPreset] = useState<SampleKey | "custom">("broken");
  const [source, setSource] = useState<string>(a11ySamples.broken);
  /* Starts empty on purpose: a server-rendered srcdoc would fire `load`
     before React hydrates and attaches onLoad, so the first audit would be
     missed. The document is injected right after mount instead. */
  const [srcDoc, setSrcDoc] = useState<string | undefined>(undefined);
  const [issues, setIssues] = useState<Issue[] | null>(null);
  const [auditMs, setAuditMs] = useState(0);
  const [filter, setFilter] = useState<Impact | "all">("all");
  const [selected, setSelected] = useState<string | null>(null);
  const [overlay, setOverlay] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const firstLoadRef = useRef(true);

  /* Debounce editor → iframe reloads → onLoad re-audits. */
  useEffect(() => {
    const delay = firstLoadRef.current ? 0 : 450;
    firstLoadRef.current = false;
    const t = window.setTimeout(() => setSrcDoc(source), delay);
    return () => window.clearTimeout(t);
  }, [source]);

  const runAudit = () => {
    const frame = iframeRef.current;
    const doc = frame?.contentDocument;
    const win = frame?.contentWindow;
    // Ignore the initial about:blank load before srcDoc is injected.
    if (!doc || !win || !doc.body || !srcDoc) return;
    const { issues: result, durationMs } = auditWithTiming(doc, win);
    setAuditMs(durationMs);
    setIssues(result);
    setSelected(null);
    applyOverlay(doc, result, overlay);
  };

  const loadPreset = (key: SampleKey) => {
    setPreset(key);
    setSource(a11ySamples[key]);
  };

  const focusIssue = (issue: Issue) => {
    setSelected(issue.id);
    const doc = iframeRef.current?.contentDocument;
    if (!doc) return;
    doc.querySelectorAll("[data-a11y-active]").forEach((el) => el.removeAttribute("data-a11y-active"));
    try {
      const el = doc.querySelector(issue.selector);
      if (el) {
        el.setAttribute("data-a11y-active", "");
        el.scrollIntoView({ block: "center", behavior: "smooth" });
      }
    } catch {
      /* ignore */
    }
  };

  const toggleOverlay = () => {
    const next = !overlay;
    setOverlay(next);
    const doc = iframeRef.current?.contentDocument;
    if (doc && issues) applyOverlay(doc, issues, next);
  };

  const counts = (issues ?? []).reduce<Record<Impact, number>>(
    (acc, i) => {
      acc[i.impact] += 1;
      return acc;
    },
    { critical: 0, serious: 0, moderate: 0, minor: 0 },
  );
  const shown = (issues ?? []).filter((i) => filter === "all" || i.impact === filter);

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="card flex flex-col gap-4 p-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Sample page">
          {(["broken", "fixed"] as const).map((k) => (
            <button
              key={k}
              type="button"
              aria-pressed={preset === k}
              onClick={() => loadPreset(k)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm transition",
                preset === k ? "border-fg bg-fg text-bg" : "border-border text-fg-muted hover:text-fg",
              )}
            >
              {k === "broken" ? <Bug size={14} aria-hidden /> : <CheckCircle2 size={14} aria-hidden />}
              {k === "broken" ? "Broken page" : "Fixed page"}
            </button>
          ))}
          {preset === "custom" && <Badge tone="accent">Edited</Badge>}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={toggleOverlay} aria-pressed={overlay}>
            {overlay ? <Eye size={14} aria-hidden /> : <EyeOff size={14} aria-hidden />}
            Overlay
          </Button>
          <Button size="sm" onClick={runAudit}>
            <Play size={14} aria-hidden /> Re-run audit
          </Button>
        </div>
      </div>

      {/* Editor + preview */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card flex flex-col overflow-hidden">
          <div className="flex items-center justify-between border-b border-border px-4 py-2 font-mono text-[11px] text-fg-subtle">
            <span>index.html</span>
            <span>{source.length.toLocaleString("en")} chars · edits re-audit automatically</span>
          </div>
          <label className="sr-only" htmlFor="a11y-source">
            HTML source
          </label>
          <textarea
            id="a11y-source"
            value={source}
            onChange={(e) => {
              setSource(e.target.value);
              setPreset("custom");
            }}
            spellCheck={false}
            className="h-[26rem] w-full resize-none bg-bg p-4 font-mono text-xs leading-5 outline-none"
          />
        </div>
        <div className="card flex flex-col overflow-hidden">
          <div className="flex items-center justify-between border-b border-border px-4 py-2 font-mono text-[11px] text-fg-subtle">
            <span>preview · sandboxed iframe</span>
            <span>{issues ? `${issues.length} issue${issues.length === 1 ? "" : "s"} · ${auditMs} ms` : "auditing…"}</span>
          </div>
          <iframe
            ref={iframeRef}
            title="Audited page preview"
            srcDoc={srcDoc}
            sandbox="allow-same-origin"
            onLoad={runAudit}
            className="h-[26rem] w-full bg-white"
          />
        </div>
      </div>

      {/* Summary + list */}
      <div className="card p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 font-semibold">
            <ShieldCheck size={18} className={issues && issues.length === 0 ? "text-success" : "text-accent"} aria-hidden />
            {issues === null
              ? "Running audit…"
              : issues.length === 0
                ? "No issues found"
                : `${issues.length} issue${issues.length === 1 ? "" : "s"} found`}
          </h2>
          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter by impact">
            <button
              type="button"
              aria-pressed={filter === "all"}
              onClick={() => setFilter("all")}
              className={cn("rounded-full border px-3 py-1 text-xs", filter === "all" ? "border-fg bg-fg text-bg" : "border-border text-fg-muted")}
            >
              All
            </button>
            {(Object.keys(impactOrder) as Impact[]).map((imp) => (
              <button
                key={imp}
                type="button"
                aria-pressed={filter === imp}
                onClick={() => setFilter(imp)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs capitalize",
                  filter === imp ? "border-fg bg-fg text-bg" : "border-border text-fg-muted",
                )}
              >
                {imp} <span className="font-mono tabular-nums opacity-70">{counts[imp]}</span>
              </button>
            ))}
          </div>
        </div>

        {issues && issues.length === 0 && (
          <p className="mt-4 rounded-xl bg-success/10 px-4 py-3 text-sm text-success">
            Every rule passed. Try the “Broken page” preset to see the engine at work.
          </p>
        )}

        <ul className="mt-4 divide-y divide-border">
          {shown.map((issue) => (
            <li key={issue.id}>
              <button
                type="button"
                onClick={() => focusIssue(issue)}
                aria-pressed={selected === issue.id}
                className={cn(
                  "flex w-full flex-col gap-1.5 px-2 py-3 text-left transition hover:bg-surface-hover",
                  selected === issue.id && "bg-accent-soft",
                )}
              >
                <span className="flex flex-wrap items-center gap-2">
                  <Badge tone={impactTone[issue.impact]} className="capitalize">
                    {issue.impact}
                  </Badge>
                  <span className="font-mono text-xs text-fg-muted">{issue.rule}</span>
                  <span className="text-sm font-medium">{issue.message}</span>
                </span>
                <span className="text-xs text-fg-muted">{issue.help}</span>
                <code className="block truncate font-mono text-[11px] text-fg-subtle">
                  {issue.selector} · {issue.snippet}
                </code>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
