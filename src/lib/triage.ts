// Squad Intelligence — auto-triage.
//
// The heatmap answers "who?". This answers "why, and what do I do about it?".
//
// Every athlete the coach should act on today is sorted into exactly one of
// four buckets, each with the number that put them there and a suggested next
// step. Athletes who need nothing simply don't appear — an empty list is the
// good outcome, not a broken one.
//
//   injuryRisk    load spiked well past their own baseline
//   disengaged    stopped logging
//   plateau       training steadily but no personal best in weeks
//   breakthrough  set a personal best this week (worth saying out loud)
//
// Pure and DB-free so the thresholds can be unit-tested; the querying lives in
// squad.ts.

import type { RosterRow } from "./roster";

export type Flag = "injuryRisk" | "disengaged" | "plateau" | "breakthrough";

/** Order the coach reads them in: act-now first, celebrate last. */
export const FLAG_ORDER: Flag[] = ["injuryRisk", "disengaged", "plateau", "breakthrough"];

/** No logs for this many days counts as dropping off. */
export const DISENGAGED_DAYS = 5;
/** Training steadily but no PB for this long reads as a plateau. */
export const PLATEAU_DAYS = 28;
/** …and only if they actually trained on this many of the last 14 days. */
export const PLATEAU_MIN_SESSIONS = 6;
/** A PB inside this window is still fresh news. */
export const BREAKTHROUGH_DAYS = 7;

/** One timed record, already reduced to a Seoul day key. */
export interface PbInput {
  userId: string;
  metricKey: string;
  /** Authored metric name, carried through for display; translated by key. */
  metricName?: string;
  durationMs: number;
  day: string;
}

export interface PbSignal {
  /** Days since their most recent personal best; null if they've never set one. */
  daysSincePb: number | null;
  /** Personal bests inside the breakthrough window. */
  recentPbs: number;
  lastPbDay: string | null;
}

export interface TriageItem {
  athleteId: string;
  name: string;
  flag: Flag;
  /**
   * The single number behind the reason. Its meaning follows the flag:
   * injuryRisk → ACWR, disengaged → days since a log (null = never logged),
   * plateau → days since the last PB, breakthrough → PBs this week.
   */
  value: number | null;
  sessions14: number;
  weekLoad: number;
}

export interface Triage {
  items: TriageItem[];
  counts: Record<Flag, number>;
  /** Items that want the coach to do something — everything but breakthroughs. */
  actionable: number;
}

function daysBetween(from: string, to: string): number {
  return Math.max(0, Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86_400_000));
}

/** One record that was a personal best at the moment it was set. */
export interface PbEvent {
  userId: string;
  metricKey: string;
  metricName?: string;
  durationMs: number;
  day: string;
}

/**
 * Walk timed records oldest → newest per athlete, tracking the running best for
 * each metric, so a record knows whether it was a PB at the moment it was set.
 * The first record for a metric counts — a baseline is worth celebrating too.
 *
 * This is the single definition of "personal best" behind the daily training
 * score, the coach's triage list and the team report, so the three can never
 * tell an athlete different things about the same swim.
 */
export function personalBests(records: PbInput[]): PbEvent[] {
  const sorted = [...records].sort((a, b) => (a.day < b.day ? -1 : a.day > b.day ? 1 : 0));
  const bests = new Map<string, number>(); // `${userId}::${metricKey}` → best ms
  const events: PbEvent[] = [];

  for (const r of sorted) {
    if (!Number.isFinite(r.durationMs) || r.durationMs <= 0) continue;
    const key = `${r.userId}::${r.metricKey}`;
    const prev = bests.get(key);
    if (prev != null && r.durationMs >= prev) continue;
    bests.set(key, r.durationMs);
    events.push({
      userId: r.userId,
      metricKey: r.metricKey,
      metricName: r.metricName,
      durationMs: r.durationMs,
      day: r.day,
    });
  }
  return events;
}

export function pbSignals(records: PbInput[], today: string): Map<string, PbSignal> {
  const out = new Map<string, PbSignal>();

  for (const e of personalBests(records)) {
    const cur = out.get(e.userId) ?? { daysSincePb: null, recentPbs: 0, lastPbDay: null };
    cur.lastPbDay = e.day; // events arrive oldest-first, so the last write wins
    cur.daysSincePb = daysBetween(e.day, today);
    if (daysBetween(e.day, today) < BREAKTHROUGH_DAYS) cur.recentPbs += 1;
    out.set(e.userId, cur);
  }
  return out;
}

/** Classify one athlete, or null when they need nothing today. */
function classify(row: RosterRow, pb: PbSignal | undefined): TriageItem | null {
  const base = {
    athleteId: row.athleteId,
    name: row.name,
    sessions14: row.sessions14,
    weekLoad: row.weekLoad,
  };

  // A load spike outranks everything — it's the one that can end a season.
  if (row.zone === "high") {
    return { ...base, flag: "injuryRisk", value: row.acwr };
  }

  // Silence next: an athlete who stopped logging is invisible to every other
  // signal here, so nothing else would ever catch them.
  if (row.daysSinceActive == null) {
    return { ...base, flag: "disengaged", value: null };
  }
  if (row.daysSinceActive >= DISENGAGED_DAYS) {
    return { ...base, flag: "disengaged", value: row.daysSinceActive };
  }

  if (pb && pb.recentPbs > 0) {
    return { ...base, flag: "breakthrough", value: pb.recentPbs };
  }

  // Plateau only means something for someone who is both training and
  // measuring — otherwise "no PB" just means "no stopwatch".
  if (pb && pb.daysSincePb != null && pb.daysSincePb >= PLATEAU_DAYS && row.sessions14 >= PLATEAU_MIN_SESSIONS) {
    return { ...base, flag: "plateau", value: pb.daysSincePb };
  }

  return null;
}

/** Severity within a bucket, so the worst spike / longest silence leads. */
function severity(item: TriageItem): number {
  if (item.flag === "disengaged" && item.value == null) return Infinity; // never logged
  return item.value ?? 0;
}

export function triageSquad(rows: RosterRow[], signals: Map<string, PbSignal>): Triage {
  const items = rows
    .map((r) => classify(r, signals.get(r.athleteId)))
    .filter((i): i is TriageItem => i !== null);

  items.sort(
    (a, b) =>
      FLAG_ORDER.indexOf(a.flag) - FLAG_ORDER.indexOf(b.flag) ||
      severity(b) - severity(a) ||
      a.name.localeCompare(b.name),
  );

  const counts: Record<Flag, number> = { injuryRisk: 0, disengaged: 0, plateau: 0, breakthrough: 0 };
  for (const i of items) counts[i.flag] += 1;

  return { items, counts, actionable: items.length - counts.breakthrough };
}
