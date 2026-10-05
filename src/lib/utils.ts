import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind classes without conflicts. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Clamp a number between min and max. */
export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

/** Map a value from one range to another. */
export function remap(
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number,
) {
  if (inMax === inMin) return outMin;
  const t = (value - inMin) / (inMax - inMin);
  return outMin + t * (outMax - outMin);
}

/** Format "2023-04" as "Apr 2023". */
export function formatMonth(iso: string) {
  if (iso === "Present") return "Present";
  const [y, m] = iso.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, 1).toLocaleString("en-US", {
    month: "short",
    year: "numeric",
  });
}

/** Human-readable duration between two yyyy-mm strings. */
export function formatDuration(start: string, end: string) {
  const [sy, sm] = start.split("-").map(Number);
  let ey: number;
  let em: number;
  if (end === "Present") {
    const now = new Date();
    ey = now.getFullYear();
    em = now.getMonth() + 1;
  } else {
    [ey, em] = end.split("-").map(Number);
  }
  const months = Math.max(1, (ey - sy) * 12 + (em - sm) + 1);
  const years = Math.floor(months / 12);
  const rest = months % 12;
  const parts: string[] = [];
  if (years) parts.push(`${years} yr${years > 1 ? "s" : ""}`);
  if (rest) parts.push(`${rest} mo${rest > 1 ? "s" : ""}`);
  return parts.join(" ");
}

/** Compact number formatting: 1234 -> 1.2k */
export function compactNumber(n: number) {
  return new Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(n);
}

/** Relative time: "3 days ago" */
export function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const sec = Math.round(diff / 1000);
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ["year", 31536000],
    ["month", 2592000],
    ["week", 604800],
    ["day", 86400],
    ["hour", 3600],
    ["minute", 60],
  ];
  for (const [unit, size] of units) {
    if (Math.abs(sec) >= size) return rtf.format(-Math.round(sec / size), unit);
  }
  return "just now";
}

/** Simple debounce for event handlers. */
export function debounce<T extends (...args: never[]) => void>(
  fn: T,
  wait = 200,
) {
  let t: ReturnType<typeof setTimeout> | undefined;
  return (...args: Parameters<T>) => {
    if (t) clearTimeout(t);
    t = setTimeout(() => fn(...args), wait);
  };
}

/** Escape HTML so untrusted strings can be rendered in a <pre>. */
export function escapeHtml(s: string) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

/**
 * Lightweight JSON syntax highlighter. Returns safe HTML using the
 * `.tok-*` classes defined in globals.css.
 */
export function highlightJson(json: string) {
  // Tokenise the raw JSON first, then escape each piece: escaping before
  // tokenising would turn quotes into &quot; and break string detection.
  const re =
    /("(?:\\u[a-fA-F0-9]{4}|\\[^u]|[^\\"])*")(\s*:)?|\b(?:true|false)\b|\bnull\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?/g;
  let out = "";
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(json)) !== null) {
    out += escapeHtml(json.slice(last, m.index));
    const tok = m[0];
    let cls = "tok-num";
    if (m[1] !== undefined) cls = m[2] ? "tok-key" : "tok-str";
    else if (tok === "true" || tok === "false") cls = "tok-bool";
    else if (tok === "null") cls = "tok-null";
    out += `<span class="${cls}">${escapeHtml(tok)}</span>`;
    last = m.index + tok.length;
  }
  return out + escapeHtml(json.slice(last));
}
