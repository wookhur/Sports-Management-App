// Squad Intelligence — roster querying for the coach dashboard.
//
// Queries are batched (a fixed number regardless of squad size) because a
// school coach can easily have 30–40 athletes. The shaping/ordering lives in
// ./roster so it stays unit-testable.

import "server-only";
import { prisma } from "./db";
import { seoulDayKey } from "./format";
import { squadLoad } from "./loadServer";
import { dayWindow } from "./load";
import { shapeRoster, HEATMAP_DAYS, type Roster } from "./roster";
import { pbSignals, triageSquad, type Triage, type PbInput } from "./triage";
import { buildReport, type TeamReport } from "./report";

export type { Roster, RosterRow, RosterCell } from "./roster";
export { HEATMAP_DAYS, cellLevel, shapeRoster } from "./roster";
export type { Triage, TriageItem, Flag } from "./triage";
export type { TeamReport } from "./report";

/** Every timed record for these athletes, reduced to Seoul day keys. */
async function timedRecords(athleteIds: string[]): Promise<PbInput[]> {
  const rows = await prisma.record.findMany({
    where: { userId: { in: athleteIds }, durationMs: { not: null } },
    select: { userId: true, metricKey: true, metricName: true, durationMs: true, createdAt: true },
  });
  return rows.map((r) => ({
    userId: r.userId,
    metricKey: r.metricKey,
    metricName: r.metricName,
    durationMs: r.durationMs!,
    day: seoulDayKey(r.createdAt),
  }));
}

/** Roster + triage in one pass, so the coach page runs the queries only once. */
export async function buildSquad(coachId: string): Promise<{ roster: Roster; triage: Triage }> {
  const roster = await buildRoster(coachId);
  if (roster.rows.length === 0) {
    return { roster, triage: { items: [], counts: { injuryRisk: 0, disengaged: 0, plateau: 0, breakthrough: 0 }, actionable: 0 } };
  }

  // Personal bests need the full timed history to know what was a PB *at the
  // time*; these are hand-logged rows, so the volume stays small.
  const records = await timedRecords(roster.rows.map((r) => r.athleteId));
  return { roster, triage: triageSquad(roster.rows, pbSignals(records, seoulDayKey())) };
}

/** The printable team report for one coach, over the last `weeks` weeks. */
export async function buildTeamReport(coachId: string, weeks: number): Promise<TeamReport> {
  const today = seoulDayKey();

  const links = await prisma.coachAthlete.findMany({
    where: { coachId },
    select: { athlete: { select: { id: true, name: true } } },
  });
  const athletes = links.map((l) => l.athlete);
  if (athletes.length === 0) return buildReport([], [], [], new Map(), today, weeks);

  const ids = athletes.map((a) => a.id);
  const [sessions, records, latest] = await Promise.all([
    // Only the reporting period — recency comes from the grouped query below.
    prisma.trainingSession.findMany({
      where: { userId: { in: ids }, day: { gte: dayWindow(today, weeks * 7)[0] } },
      select: { userId: true, day: true, minutes: true, intensity: true },
    }),
    timedRecords(ids),
    prisma.trainingSession.groupBy({
      by: ["userId"],
      where: { userId: { in: ids } },
      _max: { day: true },
    }),
  ]);

  const lastActive = new Map<string, string>();
  for (const l of latest) if (l._max.day) lastActive.set(l.userId, l._max.day);

  return buildReport(athletes, sessions, records, lastActive, today, weeks);
}

/** The roster for one coach, worst-first. */
export async function buildRoster(coachId: string): Promise<Roster> {
  const today = seoulDayKey();

  const links = await prisma.coachAthlete.findMany({
    where: { coachId },
    select: { athlete: { select: { id: true, name: true, currentStreak: true } } },
  });
  const athletes = links.map((l) => l.athlete);
  if (athletes.length === 0) return { days: dayWindow(today, HEATMAP_DAYS), rows: [], peak: 0 };

  const ids = athletes.map((a) => a.id);
  const [loads, latest] = await Promise.all([
    squadLoad(ids),
    // One grouped query for "when did each athlete last log a session".
    prisma.trainingSession.groupBy({
      by: ["userId"],
      where: { userId: { in: ids } },
      _max: { day: true },
    }),
  ]);

  const lastActive = new Map<string, string>();
  for (const l of latest) if (l._max.day) lastActive.set(l.userId, l._max.day);

  return shapeRoster(athletes, loads, lastActive, today);
}
