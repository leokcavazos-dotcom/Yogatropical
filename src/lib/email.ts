/**
 * Outgoing email goes through Resend (resend.com). Without RESEND_API_KEY
 * (local dev) nothing is sent, so callers can check isEmailConfigured() and
 * skip quietly.
 */
const RESEND_API_BASE = process.env.RESEND_API_BASE ?? "https://api.resend.com";
const DEFAULT_FROM = "Yoga Tropical <reminders@yogatropical.com>";

export function isEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}

export class EmailError extends Error {}

export async function sendEmail({ to, subject, text, html }: { to: string; subject: string; text: string; html: string }) {
  const res = await fetch(`${RESEND_API_BASE}/emails`, {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: process.env.EMAIL_FROM || DEFAULT_FROM, to: [to], subject, text, html }),
    cache: "no-store",
  });
  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { message?: string };
    throw new EmailError(`Email service error (${res.status}): ${data.message ?? "unknown"}`);
  }
}

/** Escapes text for use inside an HTML email. */
export function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

/** True when a time zone name is one the runtime knows ("America/Mexico_City"). */
export function isValidTimeZone(timeZone: string): boolean {
  try {
    new Intl.DateTimeFormat("en", { timeZone });
    return true;
  } catch {
    return false;
  }
}
