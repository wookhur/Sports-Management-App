// Squad Intelligence — the printable team report.
//
// This is the one artefact that leaves the app. An athletic director or a
// parent reads it, and neither of them has an account, so it has to stand on
// its own: what the squad did over a period, who showed up, what improved.
//
// Two deliberate choices about tone, because the audience is not the coach:
//
//   - No diagnosis language. The dashboard can say "injury risk" to a coach
//     who knows it means "this athlete's ACWR is above 1.5". In a document a
//     parent might read, the same phrase reads as a medical claim about their
//     child, so the report reports the observation — the load rose sharply —
//     and leaves the judgement to the coach.
//   - Nobody is ranked. Participation is reported per athlete because that is
//     a fact, but the report never sorts teenagers best-to-worst.
//
// Pure and DB-free so the arithmetic can be unit-tested; the querying lives in
// squad.ts.

import { dayWindow } from "./load";
import { personalBests, type PbInput } from "./triage";

export const REPORT_WEEK_OPTIONS = [4, 8, 12] as const;
export type ReportWeeks = (typeof REPORT_WEEK_OPTIONS)[number];
export const DEFAULT_REPORT_WEEKS: ReportWeeks = 4;

/** One athlete-day of training, already reduced to Seoul day keys. */
export interface ReportSession {
  userId: string;
  day: string;
  minutes: number;
  intensity: number;
}

export interface ReportRow {
  athleteId: string;
  name: string;
  sessions: number;
  minutes: number;
  /** Distinct days trained inside the period. */
  activeDays: number;
  /** activeDays / period days, 0–1. */
  attendance: number;
  avgRpe: number | null;
  pbs: number;
  /** Days since their last logged session, relative to the period end. */
  daysSinceActive: number | null;
}

export interface ReportHighlight {
  athleteId: string;
  name: string;
  metricKey: string;
  metricName: string;
  durationMs: number;
  day: string;
}

export interface ReportWatch {
  athleteId: string;
  name: string;
  /** Observation, not diagnosis — see the note at the top of this file. */
  kind: "loadJump" | "inactive";
  value: number | null;
}

export interface TeamReport {
  period: { from: string; to: string; days: number; weeks: number };
  squadSize: number;
  totals: {
    sessions: number;
    minutes: number;
    /** Athletes who logged at least one session in the period. */
    activeAthletes: number;
    /** Mean attendance across the whole squad, 0–1. */
    attendance: number;
    pbs: number;
  };
  rows: ReportRow[];
  highlights: ReportHighlight[];
  watch: ReportWatch[];
}

/** A sharp week-on-week jump worth mentioning to a director. */
export const LOAD_JUMP_RATIO = 1.5;
/** No logged session for this long, by the end of the period. */
export const INACTIVE_DAYS = 14;

function round(n: number, places = 2): number {
  const f = 10 ** places;
  return Math.round(n * f) / f;
}

/**
 * `lastActive` is passed in rather than derived from `sessions`, because
 * `sessions` only covers the reporting period: an athlete who stopped training
 * two months ago has no rows in it at all, and deriving recency from an empty
 * set would report them as "never trained" instead of "quiet for 60 days".
 */
export function buildReport(
  athletes: { id: string; name: string }[],
  sessions: ReportSession[],
  records: PbInput[],
  lastActive: Map<string, string>,
  today: string,
  weeks: number,
): TeamReport {
  const days = weeks * 7;
  const window = dayWindow(today, days);
  const inPeriod = new Set(window);
  const from = window[0];

  const periodSessions = sessions.filter((s) => inPeriod.has(s.day));

  // Personal bests are computed from the *full* history — a swim only counts
  // as a PB if it beat everything before it, including times set before this
  // period started — then filtered down to the ones set inside it.
  const pbEvents = personalBests(records).filter((e) => inPeriod.has(e.day));
  const pbByAthlete = new Map<string, number>();
  for (const e of pbEvents) pbByAthlete.set(e.userId, (pbByAthlete.get(e.userId) ?? 0) + 1);

  // The two halves of the period, for the week-on-week load comparison.
  const half = Math.floor(days / 2);
  const secondHalf = new Set(window.slice(days - half));

  const rows: ReportRow[] = [];
  const watch: ReportWatch[] = [];

  for (const a of athletes) {
    const mine = periodSessions.filter((s) => s.userId === a.id);
    const minutes = mine.reduce((n, s) => n + s.minutes, 0);
    const activeDays = new Set(mine.map((s) => s.day)).size;
    const rpeSum = mine.reduce((n, s) => n + s.intensity, 0);
    const last = lastActive.get(a.id);

    rows.push({
      athleteId: a.id,
      name: a.name,
      sessions: mine.length,
      minutes,
      activeDays,
      attendance: days > 0 ? round(activeDays / days, 3) : 0,
      avgRpe: mine.length > 0 ? round(rpeSum / mine.length, 1) : null,
      pbs: pbByAthlete.get(a.id) ?? 0,
      daysSinceActive: last
        ? Math.max(0, Math.round((Date.parse(`${today}T00:00:00Z`) - Date.parse(`${last}T00:00:00Z`)) / 86_400_000))
        : null,
    });

    // Observations for the coach's notes section.
    const early = mine.filter((s) => !secondHalf.has(s.day)).reduce((n, s) => n + s.minutes * s.intensity, 0);
    const late = mine.filter((s) => secondHalf.has(s.day)).reduce((n, s) => n + s.minutes * s.intensity, 0);
    if (early > 0 && late / early >= LOAD_JUMP_RATIO) {
      watch.push({ athleteId: a.id, name: a.name, kind: "loadJump", value: round(late / early) });
    } else if (last == null) {
      watch.push({ athleteId: a.id, name: a.name, kind: "inactive", value: null });
    } else {
      const idle = Math.round((Date.parse(`${today}T00:00:00Z`) - Date.parse(`${last}T00:00:00Z`)) / 86_400_000);
      if (idle >= INACTIVE_DAYS) {
        watch.push({ athleteId: a.id, name: a.name, kind: "inactive", value: idle });
      }
    }
  }

  // Alphabetical, not ranked: this document is not a league table.
  rows.sort((a, b) => a.name.localeCompare(b.name));
  watch.sort((a, b) => a.name.localeCompare(b.name));

  const nameOf = new Map(athletes.map((a) => [a.id, a.name]));
  const highlights: ReportHighlight[] = pbEvents
    .filter((e) => nameOf.has(e.userId))
    .map((e) => ({
      athleteId: e.userId,
      name: nameOf.get(e.userId)!,
      metricKey: e.metricKey,
      metricName: e.metricName ?? e.metricKey,
      durationMs: e.durationMs,
      day: e.day,
    }))
    .sort((a, b) => (a.day < b.day ? 1 : a.day > b.day ? -1 : 0)); // newest first

  const activeAthletes = rows.filter((r) => r.sessions > 0).length;

  return {
    period: { from, to: today, days, weeks },
    squadSize: athletes.length,
    totals: {
      sessions: periodSessions.length,
      minutes: rows.reduce((n, r) => n + r.minutes, 0),
      activeAthletes,
      // From raw active-days, not from the rounded per-athlete percentages —
      // averaging already-rounded values drifts the squad figure.
      attendance:
        rows.length > 0 && days > 0
          ? round(rows.reduce((n, r) => n + r.activeDays, 0) / (rows.length * days), 4)
          : 0,
      pbs: highlights.length,
    },
    rows,
    highlights,
    watch,
  };
}
