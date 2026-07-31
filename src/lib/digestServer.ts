// Squad Intelligence — querying and sending the weekly digest.

import "server-only";
import { prisma } from "./db";
import { seoulDayKey } from "./format";
import { dayWindow } from "./load";
import { buildTeamReport, buildSquad } from "./squad";
import { buildDigest, isWorthSending, type Digest } from "./digest";
import { digestHtml, digestText, digestSubject } from "./digestEmail";
import { sendMail, appUrl, mailerConfigured, type SendResult } from "./mailer";
import { resolveLang, type Lang } from "./i18n";

/** The digest covers exactly one week. */
export const DIGEST_DAYS = 7;

export interface CoachDigest {
  coachId: string;
  email: string;
  lang: Lang;
  digest: Digest;
}

/** Sessions the squad logged in the week *before* the one being reported. */
async function previousWeekSessions(athleteIds: string[], today: string): Promise<number> {
  if (athleteIds.length === 0) return 0;
  const twoWeeks = dayWindow(today, DIGEST_DAYS * 2);
  const priorWeek = twoWeeks.slice(0, DIGEST_DAYS);
  return prisma.trainingSession.count({
    where: { userId: { in: athleteIds }, day: { in: priorWeek } },
  });
}

/** Build one coach's digest without sending anything. */
export async function coachDigest(coachId: string, coachName: string): Promise<Digest> {
  const today = seoulDayKey();
  const [report, squad] = await Promise.all([
    buildTeamReport(coachId, 1),
    buildSquad(coachId),
  ]);
  const athleteIds = squad.roster.rows.map((r) => r.athleteId);
  const prior = await previousWeekSessions(athleteIds, today);
  return buildDigest(coachName, report, squad.triage, prior);
}

/**
 * Every coach who should receive a digest this week, with the content already
 * composed. Coaches are processed one at a time rather than in parallel: a
 * school might have a handful, and hammering the database (and the mail
 * provider's rate limit) to save a few seconds on a weekly job is a bad trade.
 */
export async function allCoachDigests(): Promise<CoachDigest[]> {
  const coaches = await prisma.user.findMany({
    where: { role: "COACH", digestOptOut: false },
    select: { id: true, name: true, email: true, lang: true },
  });

  const out: CoachDigest[] = [];
  for (const c of coaches) {
    const digest = await coachDigest(c.id, c.name);
    if (!isWorthSending(digest)) continue;
    out.push({ coachId: c.id, email: c.email, lang: resolveLang(c.lang ?? undefined), digest });
  }
  return out;
}

export interface DigestRunResult {
  considered: number;
  sent: number;
  skipped: number;
  failed: number;
  mailerConfigured: boolean;
  results: { email: string; status: SendResult["status"]; reason?: string }[];
}

/** Compose and send this week's digests. Never throws; reports per recipient. */
export async function runWeeklyDigest(): Promise<DigestRunResult> {
  const digests = await allCoachDigests();
  const run: DigestRunResult = {
    considered: digests.length,
    sent: 0,
    skipped: 0,
    failed: 0,
    mailerConfigured: mailerConfigured(),
    results: [],
  };

  for (const d of digests) {
    const result = await sendMail({
      to: d.email,
      subject: digestSubject(d.digest, d.lang),
      html: digestHtml(d.digest, d.lang, appUrl()),
      text: digestText(d.digest, d.lang, appUrl()),
    });
    run[result.status === "sent" ? "sent" : result.status === "skipped" ? "skipped" : "failed"] += 1;
    run.results.push({
      email: d.email,
      status: result.status,
      reason: "reason" in result ? result.reason : undefined,
    });
  }
  return run;
}
