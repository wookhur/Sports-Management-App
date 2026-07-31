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

export type { Roster, RosterRow, RosterCell } from "./roster";
export { HEATMAP_DAYS, cellLevel, shapeRoster } from "./roster";

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
