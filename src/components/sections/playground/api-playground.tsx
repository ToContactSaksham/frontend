"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Play, Terminal } from "lucide-react";
import { cn, highlightJson } from "@/lib/utils";
import { Section, SectionHeading } from "@/components/ui/section";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { useToast } from "@/components/providers/toast-provider";

type Method = "GET" | "POST";

interface Endpoint {
  id: string;
  method: Method;
  path: string;
  summary: string;
  /** Path template params, e.g. {slug} */
  pathParams?: { key: string; defaultValue: string }[];
  query?: { key: string; placeholder: string }[];
  body?: string;
}

const endpoints: Endpoint[] = [
  { id: "index", method: "GET", path: "/api", summary: "Discovery document" },
  { id: "health", method: "GET", path: "/api/health", summary: "Liveness probe" },
  {
    id: "projects",
    method: "GET",
    path: "/api/projects",
    summary: "Filter, search, sort, paginate",
    query: [
      { key: "q", placeholder: "dashboard" },
      { key: "tag", placeholder: "React" },
      { key: "featured", placeholder: "true" },
      { key: "sort", placeholder: "year-desc | year-asc | title" },
      { key: "page", placeholder: "1" },
      { key: "pageSize", placeholder: "12" },
    ],
  },
  {
    id: "project",
    method: "GET",
    path: "/api/projects/{slug}",
    summary: "Single project, 404 if unknown",
    pathParams: [{ key: "slug", defaultValue: "pulse-dashboard" }],
  },
  {
    id: "skills",
    method: "GET",
    path: "/api/skills",
    summary: "Grouped by category",
    query: [{ key: "category", placeholder: "Frameworks" }],
  },
  { id: "experience", method: "GET", path: "/api/experience", summary: "Work history" },
  { id: "github", method: "GET", path: "/api/github", summary: "Proxied GitHub data" },
  {
    id: "contact",
    method: "POST",
    path: "/api/contact",
    summary: "Validated form submission",
    body: JSON.stringify(
      {
        name: "Ada Lovelace",
        email: "ada@example.com",
        subject: "Hello from the playground",
        message: "Just trying out the REST API on your portfolio. Very nice!",
      },
      null,
      2,
    ),
  },
];

interface ResponseState {
  status: number;
  statusText: string;
  ms: number;
  bytes: number;
  headers: [string, string][];
  body: string;
  pretty: string | null;
}

interface HistoryEntry {
  id: number;
  method: Method;
  url: string;
  status: number;
  ms: number;
}

const SHOWN_HEADERS = ["content-type", "cache-control", "x-request-id", "x-ratelimit-remaining", "retry-after"];

function statusTone(status: number) {
  if (status === 0) return "bg-danger/15 text-danger";
  if (status < 300) return "bg-success/15 text-success";
  if (status < 400) return "bg-accent-soft text-accent";
  if (status < 500) return "bg-warning/15 text-warning";
  return "bg-danger/15 text-danger";
}

export function ApiPlayground() {
  const { toast } = useToast();
  const [selectedId, setSelectedId] = useState(endpoints[2]!.id);
  const [values, setValues] = useState<Record<string, string>>({});
  const [body, setBody] = useState(endpoints.find((e) => e.id === "contact")!.body!);
  const [sending, setSending] = useState(false);
  const [response, setResponse] = useState<ResponseState | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [copied, setCopied] = useState<"body" | "curl" | null>(null);

  const endpoint = endpoints.find((e) => e.id === selectedId)!;

  const url = useMemo(() => {
    let path = endpoint.path;
    for (const p of endpoint.pathParams ?? []) {
      const v = values[`${endpoint.id}:${p.key}`] ?? p.defaultValue;
      path = path.replace(`{${p.key}}`, encodeURIComponent(v));
    }
    const qs = new URLSearchParams();
    for (const q of endpoint.query ?? []) {
      const v = values[`${endpoint.id}:${q.key}`];
      if (v && v.trim()) qs.set(q.key, v.trim());
    }
    const s = qs.toString();
    return s ? `${path}?${s}` : path;
  }, [endpoint, values]);

  const setValue = (key: string, v: string) =>
    setValues((prev) => ({ ...prev, [`${endpoint.id}:${key}`]: v }));

  const send = async () => {
    setSending(true);
    const t0 = performance.now();
    try {
      const res = await fetch(url, {
        method: endpoint.method,
        headers:
          endpoint.method === "POST"
            ? { "Content-Type": "application/json", Accept: "application/json" }
            : { Accept: "application/json" },
        body: endpoint.method === "POST" ? body : undefined,
      });
      const text = await res.text();
      const ms = Math.round(performance.now() - t0);
      let pretty: string | null = null;
      try {
        pretty = JSON.stringify(JSON.parse(text), null, 2);
      } catch {
        pretty = null;
      }
      const headers = SHOWN_HEADERS.flatMap((h) => {
        const v = res.headers.get(h);
        return v ? ([[h, v]] as [string, string][]) : [];
      });
      setResponse({
        status: res.status,
        statusText: res.statusText,
        ms,
        bytes: new TextEncoder().encode(text).length,
        headers,
        body: text,
        pretty,
      });
      setHistory((h) =>
        [{ id: Date.now(), method: endpoint.method, url, status: res.status, ms }, ...h].slice(0, 6),
      );
    } catch (err) {
      const ms = Math.round(performance.now() - t0);
      const message = err instanceof Error ? err.message : "Network error";
      setResponse({
        status: 0,
        statusText: "Network error",
        ms,
        bytes: 0,
        headers: [],
        body: message,
        pretty: null,
      });
    } finally {
      setSending(false);
    }
  };

  // The preview uses a relative URL so server and client render identical
  // text; the absolute origin is only added when copying, in the browser.
  const buildCurl = (origin: string) => {
    const parts = [`curl -i -X ${endpoint.method} '${origin}${url}'`];
    if (endpoint.method === "POST") {
      parts.push(`-H 'Content-Type: application/json'`);
      parts.push(`-d '${body.replace(/\n\s*/g, " ").replace(/'/g, "'\\''")}'`);
    }
    return parts.join(" \\\n  ");
  };
  const curl = buildCurl("");

  const copy = async (what: "body" | "curl") => {
    const text =
      what === "curl"
        ? buildCurl(window.location.origin)
        : (response?.pretty ?? response?.body ?? "");
    try {
      await navigator.clipboard.writeText(text);
      setCopied(what);
      window.setTimeout(() => setCopied(null), 1500);
    } catch {
      toast({ title: "Clipboard unavailable", variant: "error" });
    }
  };

  const bodyIsValidJson = useMemo(() => {
    if (endpoint.method !== "POST") return true;
    try {
      JSON.parse(body);
      return true;
    } catch {
      return false;
    }
  }, [endpoint.method, body]);

  return (
    <Section id="playground" className="bg-bg-elevated/60">
      <SectionHeading
        index="06"
        eyebrow="API Lab"
        title={
          <>
            Poke the <span className="text-gradient">REST API</span> yourself.
          </>
        }
        description="Every endpoint on this site is a Next.js Route Handler with a consistent JSON envelope, proper status codes and cache headers. Build a request and send it from your browser."
      />

      <Reveal className="card overflow-hidden">
        <div className="grid lg:grid-cols-[16rem_1fr]">
          {/* Endpoint list */}
          <nav aria-label="Endpoints" className="border-b border-border lg:border-b-0 lg:border-r">
            <p className="flex items-center gap-2 px-4 pt-4 font-mono text-[10px] uppercase tracking-[0.2em] text-fg-subtle">
              <Terminal size={12} aria-hidden /> Endpoints
            </p>
            <ul className="flex gap-1 overflow-x-auto p-2 lg:flex-col lg:overflow-visible">
              {endpoints.map((e) => (
                <li key={e.id} className="shrink-0">
                  <button
                    type="button"
                    onClick={() => setSelectedId(e.id)}
                    aria-current={e.id === selectedId ? "true" : undefined}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm transition",
                      e.id === selectedId
                        ? "bg-surface-hover text-fg"
                        : "text-fg-muted hover:bg-surface-hover hover:text-fg",
                    )}
                  >
                    <span
                      className={cn(
                        "w-11 shrink-0 rounded-md px-1.5 py-0.5 text-center font-mono text-[10px] font-bold",
                        e.method === "GET" ? "bg-success/15 text-success" : "bg-accent-soft text-accent",
                      )}
                    >
                      {e.method}
                    </span>
                    <span className="truncate font-mono text-xs">{e.path}</span>
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* Request + response */}
          <div className="p-5 md:p-6">
            <p className="text-sm text-fg-muted">{endpoint.summary}</p>

            {/* URL bar */}
            <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden rounded-xl border border-border bg-bg px-3 py-2 font-mono text-sm">
                <span
                  className={cn(
                    "shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-bold",
                    endpoint.method === "GET" ? "bg-success/15 text-success" : "bg-accent-soft text-accent",
                  )}
                >
                  {endpoint.method}
                </span>
                <span className="truncate" title={url}>
                  {url}
                </span>
              </div>
              <Button onClick={send} disabled={sending || !bodyIsValidJson} className="sm:shrink-0" aria-busy={sending}>
                <Play size={14} aria-hidden className={cn(sending && "animate-pulse")} />
                {sending ? "Sending…" : "Send"}
              </Button>
            </div>

            {/* Params */}
            {(endpoint.pathParams?.length || endpoint.query?.length) ? (
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {endpoint.pathParams?.map((p) => (
                  <label key={p.key} className="text-xs">
                    <span className="font-mono text-fg-muted">{`{${p.key}}`}</span>
                    <input
                      value={values[`${endpoint.id}:${p.key}`] ?? p.defaultValue}
                      onChange={(e) => setValue(p.key, e.target.value)}
                      className="mt-1 h-9 w-full rounded-lg border border-border bg-bg px-3 font-mono text-xs outline-none transition focus:border-accent"
                    />
                  </label>
                ))}
                {endpoint.query?.map((q) => (
                  <label key={q.key} className="text-xs">
                    <span className="font-mono text-fg-muted">?{q.key}</span>
                    <input
                      value={values[`${endpoint.id}:${q.key}`] ?? ""}
                      onChange={(e) => setValue(q.key, e.target.value)}
                      placeholder={q.placeholder}
                      className="mt-1 h-9 w-full rounded-lg border border-border bg-bg px-3 font-mono text-xs outline-none transition placeholder:text-fg-subtle focus:border-accent"
                    />
                  </label>
                ))}
              </div>
            ) : null}

            {/* Body editor */}
            {endpoint.method === "POST" && (
              <label className="mt-4 block text-xs">
                <span className="flex items-center justify-between font-mono text-fg-muted">
                  JSON body
                  {!bodyIsValidJson && <span className="text-danger">Invalid JSON</span>}
                </span>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={7}
                  spellCheck={false}
                  className={cn(
                    "mt-1 w-full resize-y rounded-lg border bg-bg p-3 font-mono text-xs leading-5 outline-none transition focus:border-accent",
                    bodyIsValidJson ? "border-border" : "border-danger",
                  )}
                />
                <span className="mt-1 block text-fg-subtle">
                  Tip: remove the message or break the email to see a 422 with field errors.
                </span>
              </label>
            )}

            {/* Response */}
            <div className="mt-6 rounded-2xl border border-border bg-bg">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-border px-4 py-3 text-xs">
                <span className="font-mono uppercase tracking-[0.2em] text-fg-subtle">Response</span>
                {response ? (
                  <>
                    <span className={cn("rounded-md px-2 py-0.5 font-mono font-semibold", statusTone(response.status))}>
                      {response.status || "ERR"} {response.statusText}
                    </span>
                    <span className="font-mono text-fg-muted">{response.ms} ms</span>
                    <span className="font-mono text-fg-muted">{response.bytes} B</span>
                  </>
                ) : (
                  <span className="text-fg-subtle">Send a request to see the response here.</span>
                )}
                <span className="ml-auto flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => copy("curl")}
                    className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-fg-muted transition hover:bg-surface-hover hover:text-fg"
                  >
                    {copied === "curl" ? <Check size={12} aria-hidden /> : <Copy size={12} aria-hidden />}
                    curl
                  </button>
                  {response && (
                    <button
                      type="button"
                      onClick={() => copy("body")}
                      className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-fg-muted transition hover:bg-surface-hover hover:text-fg"
                    >
                      {copied === "body" ? <Check size={12} aria-hidden /> : <Copy size={12} aria-hidden />}
                      body
                    </button>
                  )}
                </span>
              </div>

              {response && response.headers.length > 0 && (
                <dl className="grid gap-x-6 gap-y-1 border-b border-border px-4 py-3 font-mono text-[11px] sm:grid-cols-2">
                  {response.headers.map(([k, v]) => (
                    <div key={k} className="flex gap-2 truncate">
                      <dt className="shrink-0 text-fg-subtle">{k}:</dt>
                      <dd className="truncate text-fg-muted" title={v}>
                        {v}
                      </dd>
                    </div>
                  ))}
                </dl>
              )}

              <pre
                className="max-h-[26rem] overflow-auto p-4 font-mono text-xs leading-5"
                aria-live="polite"
                tabIndex={0}
              >
                {response ? (
                  response.pretty ? (
                    <code dangerouslySetInnerHTML={{ __html: highlightJson(response.pretty) }} />
                  ) : (
                    <code>{response.body}</code>
                  )
                ) : (
                  <code className="text-fg-subtle">{curl}</code>
                )}
              </pre>
            </div>

            {history.length > 0 && (
              <div className="mt-4">
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-fg-subtle">History</p>
                <ul className="mt-2 flex flex-wrap gap-2">
                  {history.map((h) => (
                    <li
                      key={h.id}
                      className="flex items-center gap-2 rounded-full border border-border px-3 py-1 font-mono text-[11px] text-fg-muted"
                    >
                      <span className={cn("rounded px-1 font-semibold", statusTone(h.status))}>{h.status || "ERR"}</span>
                      <span className="max-w-[14rem] truncate" title={h.url}>
                        {h.method} {h.url}
                      </span>
                      <span className="text-fg-subtle">{h.ms} ms</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </Reveal>
    </Section>
  );
}
