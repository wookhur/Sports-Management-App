// Squad Intelligence — the weekly digest.
//
// The dashboard only helps a coach who opens it. This is the piece that works
// for the coach who doesn't: once a week it arrives in their inbox with the
// two things worth an email — who needs a conversation, and what went well.
//
// Deliberately small. A digest that lists everything gets filtered to a folder
// and never read again, so this carries at most a handful of names and always
// says how many it left out.
//
// Pure and DB-free so the composition and the "is this worth sending" rule can
// be unit-tested; the querying lives in digestServer.ts.

import type { TriageItem } from "./triage";
import type { ReportHighlight, TeamReport } from "./report";

/** Names beyond this are summarised as a count rather than listed. */
export const MAX_LISTED = 5;

export interface Digest {
  coachName: string;
  weekFrom: string;
  weekTo: string;
  squadSize: number;
  activeAthletes: number;
  sessions: number;
  minutes: number;
  /** Change vs the previous week, in sessions. */
  sessionsDelta: number;
  /** Athletes the coach should act on, worst first, capped at MAX_LISTED. */
  attention: TriageItem[];
  attentionOverflow: number;
  /** Personal bests set this week, newest first, capped at MAX_LISTED. */
  highlights: ReportHighlight[];
  highlightsOverflow: number;
}

function cap<T>(items: T[]): { shown: T[]; overflow: number } {
  return { shown: items.slice(0, MAX_LISTED), overflow: Math.max(0, items.length - MAX_LISTED) };
}

export function buildDigest(
  coachName: string,
  report: TeamReport,
  triage: { items: TriageItem[] },
  previousWeekSessions: number,
): Digest {
  // Breakthroughs are already covered by the highlights section, and a digest
  // that repeats itself reads as noise, so attention is the to-do list only.
  const actionable = triage.items.filter((i) => i.flag !== "breakthrough");
  const attention = cap(actionable);
  const highlights = cap(report.highlights);

  return {
    coachName,
    weekFrom: report.period.from,
    weekTo: report.period.to,
    squadSize: report.squadSize,
    activeAthletes: report.totals.activeAthletes,
    sessions: report.totals.sessions,
    minutes: report.totals.minutes,
    sessionsDelta: report.totals.sessions - previousWeekSessions,
    attention: attention.shown,
    attentionOverflow: attention.overflow,
    highlights: highlights.shown,
    highlightsOverflow: highlights.overflow,
  };
}

/**
 * Whether this digest earns an email.
 *
 * A coach with no athletes, or a week where the squad did nothing and nobody
 * needs attention, gets silence. Sending "nothing happened" every week is the
 * fastest way to train someone to ignore the sender — and once they filter
 * these, the one that mattered goes unread too.
 */
export function isWorthSending(d: Digest): boolean {
  if (d.squadSize === 0) return false;
  return d.sessions > 0 || d.attention.length > 0 || d.highlights.length > 0;
}
