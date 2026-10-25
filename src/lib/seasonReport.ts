import { prisma } from "./db";
import { rosterOf } from "./teamPage";
import { teamRecord, type TeamRecord } from "./matchStats";
import { termOf, termsOfYear, yearRange, type Term } from "./season";
import { evaluationPercent, type MatchKindKey } from "./teamLogText";

export interface SeasonPlayer {
  userId: string;
  name: string;
  managed: boolean;
  number: number | null;
  birthDate: string | null;
  guardians: { name: string | null; email: string | null; phone: string | null }[];
  present: number;
  absent: number;
  excused: number;
  /** Attendance by day, for the register sheet: "P", "A" or "J" (excused). */
  marks: Map<string, "P" | "A" | "J">;
  matches: number;
  evals: Record<Term, { scores: number[]; percent: number | null; note: string | null } | null>;
}

export interface SeasonData {
  year: number;
  terms: [Term, Term];
  players: SeasonPlayer[];
  sessionDays: string[];
  matches: {
    day: string;
    opponent: string;
    kind: MatchKindKey;
    competition: string | null;
    goalsFor: number;
    goalsAgainst: number;
    note: string | null;
    players: string[];
  }[];
  records: { term: Record<Term, TeamRecord>; total: TeamRecord };
  /** Grouped by competition name, or by match type where no name was given. */
  competitions: { name: string | null; kind: MatchKindKey; record: TeamRecord }[];
  plan: { weekStart: string; unit: string; objective: string; note: string | null }[];
}

/**
 * Everything recorded for a team over one school year: the source for both
 * the season report page and the Excel export, so the two never disagree.
 */
export async function loadSeason(teamId: string, year: number): Promise<SeasonData> {
  const [from, to] = yearRange(year);
  const terms = termsOfYear(year);
  const [roster, attendance, matches, evals, plan] = await Promise.all([
    rosterOf(teamId),
    prisma.attendance.findMany({
      where: { teamId, day: { gte: from, lte: to } },
      select: { userId: true, day: true, present: true, excused: true },
    }),
    prisma.match.findMany({
      where: { teamId, day: { gte: from, lte: to } },
      orderBy: [{ day: "asc" }, { createdAt: "asc" }],
      include: { players: { select: { userId: true } } },
    }),
    prisma.playerEvaluation.findMany({ where: { teamId, period: { in: terms } } }),
    prisma.teamPlanWeek.findMany({
      where: { teamId, weekStart: { gte: from, lte: to } },
      orderBy: { weekStart: "asc" },
      select: { weekStart: true, unit: true, objective: true, note: true },
    }),
  ]);

  const players: SeasonPlayer[] = roster.map((m) => ({
    userId: m.userId,
    name: m.user.name,
    managed: m.user.managed,
    number: m.number,
    birthDate: m.birthDate,
    guardians: [
      { name: m.guardian1Name, email: m.guardian1Email, phone: m.guardian1Phone },
      { name: m.guardian2Name, email: m.guardian2Email, phone: m.guardian2Phone },
    ],
    present: 0,
    absent: 0,
    excused: 0,
    marks: new Map(),
    matches: 0,
    evals: { [terms[0]]: null, [terms[1]]: null } as SeasonPlayer["evals"],
  }));
  const byId = new Map(players.map((p) => [p.userId, p]));

  for (const a of attendance) {
    const p = byId.get(a.userId);
    if (!p) continue;
    if (a.present) p.present += 1;
    else if (a.excused) p.excused += 1;
    else p.absent += 1;
    p.marks.set(a.day, a.present ? "P" : a.excused ? "J" : "A");
  }
  for (const m of matches) for (const mp of m.players) {
    const p = byId.get(mp.userId);
    if (p) p.matches += 1;
  }
  for (const e of evals) {
    const p = byId.get(e.athleteId);
    if (p) p.evals[e.period as Term] = { scores: e.scores, percent: evaluationPercent(e.scores), note: e.note };
  }

  const groups = new Map<string, { name: string | null; kind: MatchKindKey; rows: typeof matches }>();
  for (const m of matches) {
    const key = m.competition ? `c:${m.competition.toLowerCase()}` : `k:${m.kind}`;
    const g = groups.get(key) ?? { name: m.competition, kind: m.kind as MatchKindKey, rows: [] };
    g.rows.push(m);
    groups.set(key, g);
  }

  return {
    year,
    terms,
    players,
    sessionDays: [...new Set(attendance.map((a) => a.day))].sort(),
    matches: matches.map((m) => ({
      day: m.day,
      opponent: m.opponent,
      kind: m.kind as MatchKindKey,
      competition: m.competition,
      goalsFor: m.goalsFor,
      goalsAgainst: m.goalsAgainst,
      note: m.note,
      players: m.players.map((p) => p.userId),
    })),
    records: {
      term: Object.fromEntries(terms.map((t) => [t, teamRecord(matches.filter((m) => termOf(m.day) === t))])) as Record<Term, TeamRecord>,
      total: teamRecord(matches),
    },
    competitions: [...groups.values()].map((g) => ({ name: g.name, kind: g.kind, record: teamRecord(g.rows) })),
    plan,
  };
}
