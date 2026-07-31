/**
 * Weekly digest schedule.
 *
 * This function only pulls the trigger; all the work happens in the app's
 * /api/cron/digest route, so the digest can also be fired by hand (or by any
 * other scheduler) without duplicating logic here.
 *
 * 22:00 UTC Sunday is 07:00 Monday in Asia/Seoul — the coaches' Monday
 * morning, which is when a weekly summary is actually useful. Netlify cron is
 * UTC-only and has no DST, and Korea has no DST either, so this stays put.
 */
export default async () => {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    console.log("[weekly-digest] CRON_SECRET unset — skipping.");
    return new Response("skipped: CRON_SECRET unset", { status: 200 });
  }

  const base = (process.env.APP_URL || process.env.URL || "").replace(/\/$/, "");
  if (!base) {
    console.log("[weekly-digest] no APP_URL/URL — skipping.");
    return new Response("skipped: no base URL", { status: 200 });
  }

  const res = await fetch(`${base}/api/cron/digest`, {
    method: "POST",
    headers: { Authorization: `Bearer ${secret}` },
  });
  const body = await res.text();
  console.log(`[weekly-digest] ${res.status} ${body.slice(0, 500)}`);
  return new Response(body, { status: res.status });
};

// Netlify reads this at deploy time to register the schedule. Deliberately not
// typed against @netlify/functions: the package isn't a dependency here, and a
// type-only import that fails to resolve would break the build for a schedule
// string.
export const config = {
  schedule: "0 22 * * 0",
};
