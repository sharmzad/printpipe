import "server-only";
import { site } from "./site";

export function emailEnabled() {
  return Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM);
}

// Sends through Resend's HTTP API (https://resend.com). Returns false when email isn't configured or fails.
export async function sendEmail(to: string, subject: string, html: string) {
  if (!emailEnabled()) return false;
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: process.env.EMAIL_FROM, to, subject, html, reply_to: site.supportEmail }),
  });
  if (!res.ok) console.error("email send failed", res.status, await res.text());
  return res.ok;
}
