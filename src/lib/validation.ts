import type { ApiFieldError, ContactPayload } from "@/lib/types";

/**
 * Contact-form schema shared by the client (instant feedback) and the
 * server (source of truth). Keeping one implementation guarantees the two
 * never drift apart.
 */
export const contactRules = {
  name: { min: 2, max: 80 },
  email: { min: 5, max: 160 },
  subject: { min: 0, max: 120 },
  message: { min: 20, max: 2000 },
} as const;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

type Result =
  | { ok: true; value: ContactPayload }
  | { ok: false; fields: ApiFieldError[] };

function str(v: unknown) {
  return typeof v === "string" ? v.trim() : "";
}

export function validateContact(input: unknown): Result {
  const fields: ApiFieldError[] = [];
  const src = (input ?? {}) as Record<string, unknown>;

  const name = str(src.name);
  const email = str(src.email);
  const subject = str(src.subject);
  const message = str(src.message);
  const website = str(src.website);

  if (name.length < contactRules.name.min)
    fields.push({ field: "name", message: "Please tell me your name." });
  else if (name.length > contactRules.name.max)
    fields.push({
      field: "name",
      message: `Name must be under ${contactRules.name.max} characters.`,
    });

  if (!email) fields.push({ field: "email", message: "Email is required." });
  else if (!EMAIL_RE.test(email) || email.length > contactRules.email.max)
    fields.push({ field: "email", message: "That email doesn't look valid." });

  if (subject.length > contactRules.subject.max)
    fields.push({
      field: "subject",
      message: `Subject must be under ${contactRules.subject.max} characters.`,
    });

  if (message.length < contactRules.message.min)
    fields.push({
      field: "message",
      message: `Message should be at least ${contactRules.message.min} characters.`,
    });
  else if (message.length > contactRules.message.max)
    fields.push({
      field: "message",
      message: `Message must be under ${contactRules.message.max} characters.`,
    });

  // Honeypot: real users never fill this hidden field.
  if (website)
    fields.push({ field: "website", message: "Spam check failed." });

  if (fields.length) return { ok: false, fields };
  return {
    ok: true,
    value: { name, email, subject: subject || undefined, message },
  };
}
