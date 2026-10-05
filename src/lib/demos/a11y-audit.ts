/**
 * A compact accessibility audit engine. Runs against any same-origin
 * Document (here: a sandboxed srcdoc iframe) and returns prioritised issues.
 * Rules are a pragmatic subset of WCAG 2.2 success criteria.
 */

export type Impact = "critical" | "serious" | "moderate" | "minor";

export interface Issue {
  id: string;
  rule: string;
  impact: Impact;
  message: string;
  help: string;
  selector: string;
  snippet: string;
}

export const impactOrder: Record<Impact, number> = {
  critical: 0,
  serious: 1,
  moderate: 2,
  minor: 3,
};

/* ------------------------------------------------------------- helpers */

function selectorFor(el: Element): string {
  if (el.id) return `#${CSS.escape(el.id)}`;
  const parts: string[] = [];
  let node: Element | null = el;
  while (node && node !== node.ownerDocument.documentElement && parts.length < 4) {
    const tag = node.tagName.toLowerCase();
    const parent: Element | null = node.parentElement;
    if (!parent) break;
    const siblings = Array.from(parent.children).filter((c) => c.tagName === node!.tagName);
    const idx = siblings.indexOf(node) + 1;
    parts.unshift(siblings.length > 1 ? `${tag}:nth-of-type(${idx})` : tag);
    if (parent.id) {
      parts.unshift(`#${CSS.escape(parent.id)}`);
      break;
    }
    node = parent;
  }
  return parts.join(" > ");
}

function snippetOf(el: Element) {
  const html = el.outerHTML.replace(/\s+/g, " ").trim();
  return html.length > 140 ? `${html.slice(0, 137)}…` : html;
}

function isVisible(el: Element, win: Window) {
  const cs = win.getComputedStyle(el);
  return cs.display !== "none" && cs.visibility !== "hidden";
}

function accessibleName(el: Element): string {
  const doc = el.ownerDocument;
  const labelledBy = el.getAttribute("aria-labelledby");
  if (labelledBy) {
    const text = labelledBy
      .split(/\s+/)
      .map((id) => doc.getElementById(id)?.textContent ?? "")
      .join(" ")
      .trim();
    if (text) return text;
  }
  const ariaLabel = el.getAttribute("aria-label")?.trim();
  if (ariaLabel) return ariaLabel;
  // Use tag/attribute checks rather than instanceof: elements inside an
  // iframe belong to another realm and fail the parent's instanceof.
  if (el.tagName === "INPUT") {
    const type = (el.getAttribute("type") ?? "text").toLowerCase();
    if (type === "submit" || type === "button" || type === "reset" || type === "image") {
      const value = (el as HTMLInputElement).value?.trim();
      if (value) return value;
      if (type === "image") return el.getAttribute("alt")?.trim() ?? "";
      // HTML-AAM: submit/reset inputs get a default localized label.
      if (type === "submit") return "Submit";
      if (type === "reset") return "Reset";
    }
  }
  const imgAlt = Array.from(el.querySelectorAll("img[alt]"))
    .map((i) => i.getAttribute("alt")?.trim() ?? "")
    .join(" ")
    .trim();
  const text = (el.textContent ?? "").replace(/\s+/g, " ").trim();
  if (text) return text;
  if (imgAlt) return imgAlt;
  return el.getAttribute("title")?.trim() ?? "";
}

function hasLabel(el: Element): boolean {
  if (el.getAttribute("aria-label")?.trim() || el.getAttribute("aria-labelledby") || el.getAttribute("title")?.trim()) {
    return true;
  }
  if (el.id && el.ownerDocument.querySelector(`label[for="${CSS.escape(el.id)}"]`)) return true;
  return Boolean(el.closest("label"));
}

/* ----------------------------------------------------------- contrast */

type RGBA = [number, number, number, number];

function parseColor(value: string): RGBA | null {
  const m = value.match(/rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)(?:[\s,/]+([\d.]+%?))?\s*\)/i);
  if (!m) return value === "transparent" ? [0, 0, 0, 0] : null;
  let a = 1;
  if (m[4] !== undefined) a = m[4].endsWith("%") ? Number.parseFloat(m[4]) / 100 : Number.parseFloat(m[4]);
  return [Number(m[1]), Number(m[2]), Number(m[3]), a];
}

function blend(bg: RGBA, fg: RGBA): RGBA {
  const a = fg[3];
  return [
    fg[0] * a + bg[0] * (1 - a),
    fg[1] * a + bg[1] * (1 - a),
    fg[2] * a + bg[2] * (1 - a),
    1,
  ];
}

function luminance([r, g, b]: RGBA) {
  const f = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

export function contrastRatio(a: RGBA, b: RGBA) {
  const l1 = luminance(a);
  const l2 = luminance(b);
  const [hi, lo] = l1 > l2 ? [l1, l2] : [l2, l1];
  return (hi + 0.05) / (lo + 0.05);
}

function effectiveBackground(el: Element, win: Window): RGBA {
  const chain: Element[] = [];
  let node: Element | null = el;
  while (node) {
    chain.unshift(node);
    node = node.parentElement;
  }
  let bg: RGBA = [255, 255, 255, 1];
  for (const n of chain) {
    const c = parseColor(win.getComputedStyle(n).backgroundColor);
    if (c && c[3] > 0) bg = blend(bg, c);
  }
  return bg;
}

function hasOwnText(el: Element) {
  return Array.from(el.childNodes).some(
    (n) => n.nodeType === Node.TEXT_NODE && (n.textContent ?? "").trim().length > 0,
  );
}

/* --------------------------------------------------------------- audit */

/** Runs the audit and reports how long it took (ms, one decimal). */
export function runAudit(doc: Document, win: Window): { issues: Issue[]; durationMs: number } {
  const t0 = performance.now();
  const issues = auditDocument(doc, win);
  return { issues, durationMs: Math.round((performance.now() - t0) * 10) / 10 };
}

export function auditDocument(doc: Document, win: Window): Issue[] {
  const issues: Issue[] = [];
  let counter = 0;
  const add = (rule: string, impact: Impact, message: string, help: string, el?: Element) => {
    counter += 1;
    issues.push({
      id: `${rule}-${counter}`,
      rule,
      impact,
      message,
      help,
      selector: el ? selectorFor(el) : "html",
      snippet: el ? snippetOf(el) : `<html lang="${doc.documentElement.getAttribute("lang") ?? ""}">`,
    });
  };

  // 1. Document language & title
  if (!doc.documentElement.getAttribute("lang")?.trim()) {
    add("html-has-lang", "serious", "The <html> element has no lang attribute.", "Add lang=\"en\" (or the page language) so screen readers pick the right voice.");
  }
  if (!doc.title.trim()) {
    add("document-title", "serious", "The document has no <title>.", "Add a descriptive <title> in <head>; it is the first thing announced.");
  }

  // 2. Images without alt
  doc.querySelectorAll("img").forEach((img) => {
    if (img.hasAttribute("alt")) return;
    if (img.getAttribute("role") === "presentation" || img.getAttribute("aria-hidden") === "true") return;
    add("image-alt", "critical", "Image has no alt attribute.", "Describe the image with alt text, or use alt=\"\" if it is decorative.", img);
  });

  // 3. Heading structure
  const headings = Array.from(doc.querySelectorAll("h1,h2,h3,h4,h5,h6"));
  const h1s = headings.filter((h) => h.tagName === "H1");
  if (headings.length === 0) {
    add("page-has-heading", "moderate", "The page has no headings.", "Use <h1>–<h6> to outline the content for assistive tech and skimmers.");
  } else {
    if (h1s.length === 0) add("page-has-heading-one", "moderate", "The page has no <h1>.", "Give every page exactly one <h1> that names its main content.");
    if (h1s.length > 1) add("single-h1", "minor", `The page has ${h1s.length} <h1> elements.`, "Keep one <h1>; demote the others.", h1s[1]);
    let prev = 0;
    for (const h of headings) {
      const level = Number(h.tagName[1]);
      if (prev && level > prev + 1) {
        add("heading-order", "moderate", `Heading level skips from h${prev} to h${level}.`, "Headings should descend one level at a time.", h);
      }
      prev = level;
    }
  }

  // 4. Buttons without a name
  doc.querySelectorAll("button, [role='button'], input[type='button'], input[type='submit']").forEach((b) => {
    if (!isVisible(b, win)) return;
    if (!accessibleName(b)) {
      add("button-name", "critical", "Button has no accessible name.", "Add visible text, aria-label, or an <img alt> inside the button.", b);
    }
  });

  // 5. Links
  doc.querySelectorAll("a").forEach((a) => {
    if (!isVisible(a, win)) return;
    const href = a.getAttribute("href");
    if (href === null) {
      add("link-focusable", "minor", "Anchor without href is not keyboard focusable.", "Use a <button> for actions, or add a real href.", a);
      return;
    }
    if (!accessibleName(a)) {
      add("link-name", "serious", "Link has no accessible name.", "Add link text or aria-label that says where it goes.", a);
    }
    if (href.trim() === "#" || href.trim().toLowerCase().startsWith("javascript:")) {
      add("link-placeholder-href", "moderate", "Link uses a placeholder href.", "Point the link somewhere real, or use a <button> for in-page actions.", a);
    }
    if (a.getAttribute("target") === "_blank") {
      const rel = (a.getAttribute("rel") ?? "").toLowerCase();
      if (!rel.includes("noopener") && !rel.includes("noreferrer")) {
        add("link-target-blank-rel", "minor", "target=\"_blank\" without rel=\"noopener\".", "Add rel=\"noopener noreferrer\" to prevent tab-nabbing.", a);
      }
    }
  });

  // 6. Form controls without labels
  doc
    .querySelectorAll("input:not([type='hidden']):not([type='submit']):not([type='button']):not([type='reset']), select, textarea")
    .forEach((c) => {
      if (!isVisible(c, win)) return;
      if (!hasLabel(c)) {
        add("label", "critical", "Form control has no associated label.", "Wrap it in a <label>, use <label for>, or add aria-label. Placeholder text is not a label.", c);
      }
    });

  // 7. Landmarks
  if (!doc.querySelector("main, [role='main']")) {
    add("landmark-main", "moderate", "The page has no <main> landmark.", "Wrap the primary content in <main> so users can jump straight to it.");
  }

  // 8. Positive tabindex
  doc.querySelectorAll("[tabindex]").forEach((el) => {
    const v = Number(el.getAttribute("tabindex"));
    if (v > 0) add("tabindex", "moderate", `tabindex="${v}" overrides the natural focus order.`, "Use tabindex=\"0\" or \"-1\" and rely on DOM order.", el);
  });

  // 9. Duplicate ids
  const seen = new Map<string, Element>();
  doc.querySelectorAll("[id]").forEach((el) => {
    const id = el.id;
    if (seen.has(id)) {
      add("duplicate-id", "minor", `Duplicate id "${id}".`, "ids must be unique; labels and aria references break otherwise.", el);
    } else seen.set(id, el);
  });

  // 10. Click handlers on non-interactive elements
  doc.querySelectorAll("[onclick]").forEach((el) => {
    const tag = el.tagName.toLowerCase();
    const interactive = ["a", "button", "input", "select", "textarea", "summary"].includes(tag);
    if (!interactive && !el.hasAttribute("role") && !el.hasAttribute("tabindex")) {
      add("click-events-have-key-events", "serious", `<${tag}> has an onclick but is not focusable.`, "Use a <button>, or add role, tabindex=\"0\" and a key handler.", el);
    }
  });

  // 11. Iframes need titles
  doc.querySelectorAll("iframe:not([title])").forEach((f) => {
    add("frame-title", "serious", "iframe has no title.", "Add a title that describes the embedded content.", f);
  });

  // 12. Colour contrast on text-bearing elements
  const textEls = Array.from(doc.querySelectorAll("p, span, a, li, h1, h2, h3, h4, h5, h6, button, label, td, th, small, strong, em, div"))
    .filter((el) => hasOwnText(el) && isVisible(el, win));
  for (const el of textEls) {
    const cs = win.getComputedStyle(el);
    const fg = parseColor(cs.color);
    if (!fg) continue;
    const bg = effectiveBackground(el, win);
    const ratio = contrastRatio(blend(bg, fg), bg);
    const size = Number.parseFloat(cs.fontSize);
    const weight = Number.parseInt(cs.fontWeight, 10) || (cs.fontWeight === "bold" ? 700 : 400);
    const large = size >= 24 || (size >= 18.66 && weight >= 700);
    const needed = large ? 3 : 4.5;
    if (ratio < needed) {
      add(
        "color-contrast",
        "serious",
        `Text contrast ${ratio.toFixed(2)}:1 is below ${needed}:1.`,
        `Darken the text or lighten the background until it reaches ${needed}:1 (WCAG 1.4.3).`,
        el,
      );
    }
  }

  return issues.sort((a, b) => impactOrder[a.impact] - impactOrder[b.impact]);
}
