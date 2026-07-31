import { NextResponse } from "next/server";
import { runWeeklyDigest } from "@/lib/digestServer";

export const dynamic = "force-dynamic";

/**
 * Weekly digest trigger, called by a scheduler (Netlify scheduled function,
 * GitHub Actions, cron-job.org — anything that can make an authenticated POST).
 *
 * Guarded by CRON_SECRET rather than a session, because there is no user here.
 * With the secret unset the route refuses every request: an endpoint that mails
 * every coach in the system must never be open by default, and failing closed
 * is the only safe way to be misconfigured.
 */
function authorized(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const header = req.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : header;
  // Length-independent compare isn't worth a timing-safe helper here, but do
  // avoid the empty-string-matches-empty-secret case above.
  return token === secret;
}

export async function POST(req: Request) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const result = await runWeeklyDigest();
  return NextResponse.json(result);
}

// Some schedulers can only issue GETs; same guard, same work.
export async function GET(req: Request) {
  return POST(req);
}
