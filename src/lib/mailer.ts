// Outbound email.
//
// Follows the same rule as Sentry here: with no credentials configured this is
// completely inert. It never throws, never blocks a request, and reports back
// that it skipped — so a deploy without a mail provider behaves predictably
// instead of erroring on a schedule at 7am.
//
// Resend is the default because its send endpoint is one HTTPS POST, so there
// is no SDK to add and no vendor types leaking into the app. Swapping provider
// means rewriting `deliver()` and nothing else — everything above this file
// deals in { to, subject, html, text }.

import "server-only";

export interface Mail {
  to: string;
  subject: string;
  html: string;
  text: string;
}

export type SendResult =
  | { status: "sent"; id?: string }
  | { status: "skipped"; reason: string }
  | { status: "failed"; reason: string };

/** Configured only when both the key and a From address are present. */
export function mailerConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY && process.env.DIGEST_FROM);
}

/** The app's public base URL, used for links inside emails. */
export function appUrl(): string {
  return (process.env.APP_URL || "https://sideline365.netlify.app").replace(/\/$/, "");
}

async function deliver(mail: Mail): Promise<SendResult> {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.DIGEST_FROM,
      to: [mail.to],
      subject: mail.subject,
      html: mail.html,
      text: mail.text,
    }),
  });

  if (!res.ok) {
    // The body carries the provider's reason (bad domain, rate limit, …), and
    // losing it would make a failed schedule impossible to diagnose.
    const body = await res.text().catch(() => "");
    return { status: "failed", reason: `${res.status} ${body.slice(0, 200)}` };
  }
  const json = (await res.json().catch(() => ({}))) as { id?: string };
  return { status: "sent", id: json.id };
}

export async function sendMail(mail: Mail): Promise<SendResult> {
  if (!mailerConfigured()) {
    return { status: "skipped", reason: "mailer not configured" };
  }
  try {
    return await deliver(mail);
  } catch (e) {
    // A provider outage must not take the whole run down — the caller keeps
    // going and reports per-recipient results.
    return { status: "failed", reason: e instanceof Error ? e.message : String(e) };
  }
}
