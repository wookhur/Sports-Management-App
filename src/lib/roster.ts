// Squad Intelligence — shaping the coach's roster view.
//
// Pure and DB-free (the querying lives in squad.ts) so the ordering and the
// day maths can be unit-tested.
//
// Everything here is derived from what athletes already log, so the coach adds
// no data of their own. Queries are batched (a fixed number regardless of squad
// size) because a school coach can easily have 30–40 athletes.

import { dayWindow, type LoadZone, type LoadSummary } from "./load";

/** How many days the heatmap shows. */
export const HEATMAP_DAYS = 14;

export interface RosterCell {
  day: string;
  load: number;
  /** 0–4 shading step, relative to the whole squad's busiest day. */
  level: 0 | 1 | 2 | 3 | 4;
}

export interface RosterRow {
  athleteId: string;
  name: string;
  cells: RosterCell[];
  zone: LoadZone;
  acwr: number | null;
  weekLoad: number;
  /** Days since the athlete last logged anything; null if they never have. */
  daysSinceActive: number | null;
  currentStreak: number;
  sessions14: number;
}

export interface Roster {
  days: string[];
  rows: RosterRow[];
  /** Busiest single athlete-day in the window; drives the shading scale. */
  peak: number;
}

/** Shade step for a day's load, scaled against the squad's busiest day. */
export function cellLevel(load: number, peak: number): RosterCell["level"] {
  if (load <= 0 || peak <= 0) return 0;
  const ratio = load / peak;
  if (ratio <= 0.25) return 1;
  if (ratio <= 0.5) return 2;
  if (ratio <= 0.75) return 3;
  return 4;
}

/** Sort worst-first so the athletes needing attention rise to the top. */
function attentionRank(r: RosterRow): number {
  if (r.zone === "high") return 0;
  if (r.daysSinceActive == null || r.daysSinceActive >= 7) return 1;
  if (r.zone === "caution") return 2;
  if (r.daysSinceActive >= 3) return 3;
  if (r.zone === "detraining") return 4;
  return 5;
}

/**
 * Shape a roster from already-fetched pieces. Pure so it can be unit-tested;
 * buildRoster() below does the querying.
 */
export function shapeRoster(
  athletes: { id: string; name: string; currentStreak: number }[],
  loads: Map<string, LoadSummary>,
  lastActive: Map<string, string>,
  today: string,
): Roster {
  const days = dayWindow(today, HEATMAP_DAYS);

  const windows = athletes.map((a) => {
    const summary = loads.get(a.id);
    const recent = (summary?.daily ?? []).filter((d) => days.includes(d.day));
    const byDay = new Map(recent.map((d) => [d.day, d.load]));
    return { athlete: a, summary, byDay };
  });

  const peak = Math.max(0, ...windows.flatMap((w) => [...w.byDay.values()]));

  const rows: RosterRow[] = windows.map(({ athlete, summary, byDay }) => {
    const last = lastActive.get(athlete.id);
    const daysSinceActive = last
      ? Math.max(
          0,
          Math.round((Date.parse(`${today}T00:00:00Z`) - Date.parse(`${last}T00:00:00Z`)) / 86_400_000),
        )
      : null;

    const cells: RosterCell[] = days.map((day) => {
      const load = byDay.get(day) ?? 0;
      return { day, load, level: cellLevel(load, peak) };
    });

    return {
      athleteId: athlete.id,
      name: athlete.name,
      cells,
      zone: summary?.zone ?? "unknown",
      acwr: summary?.acwr ?? null,
      weekLoad: Math.round(summary?.weekTotal ?? 0),
      daysSinceActive,
      currentStreak: athlete.currentStreak,
      sessions14: cells.filter((c) => c.load > 0).length,
    };
  });

  rows.sort((a, b) => attentionRank(a) - attentionRank(b) || a.name.localeCompare(b.name));
  return { days, rows, peak };
}
