import { prisma } from "./db";
import { attendanceFlags, type AttendanceStatusKey } from "./bitacora";

// Folding a roster-only player into the account the same person later made.
//
// A coach adds "Mendoza Jesús" by name, records a season of attendance,
// matches and evaluations against that row, and then Jesús signs up and joins
// with the invite code. Without a merge the roster has him twice and his
// history stays on the row with no account. Merging moves everything that
// row has onto the account and deletes the row.

type Mark = { status: AttendanceStatusKey };

/** Which of two marks for one day to keep: having come beats not, then an excuse. */
const MARK_RANK: Record<AttendanceStatusKey, number> = { ASISTENCIA: 5, TARDE: 4, INCIDENTE: 3, JUSTIFICADA: 2, FALTA: 1 };

/** Both rows say something about one day: keep the stronger mark. */
export function combineMarks(a: Mark, b: Mark) {
  const status = MARK_RANK[a.status] >= MARK_RANK[b.status] ? a.status : b.status;
  return { status, ...attendanceFlags(status) };
}

/** Of two evaluations for one term, keep the one with more points scored, then the newer. */
export function pickEvaluation<T extends { scores: number[]; updatedAt: Date }>(a: T, b: T): T {
  const scored = (e: T) => e.scores.filter((s) => s >= 1).length;
  if (scored(a) !== scored(b)) return scored(a) > scored(b) ? a : b;
  return a.updatedAt >= b.updatedAt ? a : b;
}

const ROSTER_FIELDS = [
  "number",
  "birthDate",
  "curp",
  "guardian1Name",
  "guardian1Email",
  "guardian1Phone",
  "guardian2Name",
  "guardian2Email",
  "guardian2Phone",
] as const;

export interface MergeResult {
  attendance: number;
  matches: number;
  evaluations: number;
}

/**
 * Move a roster-only player's records onto an account on the same team, then
 * delete the roster-only player. Callers check that the coach owns the team,
 * that `fromId` is a managed member and `intoId` an account member.
 */
export async function mergeRosterPlayer(teamId: string, fromId: string, intoId: string): Promise<MergeResult> {
  return prisma.$transaction(async (tx) => {
    const result: MergeResult = { attendance: 0, matches: 0, evaluations: 0 };

    // Attendance, day by day.
    const [fromDays, intoDays] = await Promise.all([
      tx.attendance.findMany({ where: { teamId, userId: fromId } }),
      tx.attendance.findMany({ where: { teamId, userId: intoId } }),
    ]);
    const intoByDay = new Map(intoDays.map((r) => [r.day, r]));
    for (const r of fromDays) {
      const existing = intoByDay.get(r.day);
      if (existing) {
        const m = combineMarks(existing, r);
        await tx.attendance.update({ where: { id: existing.id }, data: m });
      } else {
        await tx.attendance.update({ where: { id: r.id }, data: { userId: intoId } });
      }
      result.attendance += 1;
    }

    // Match appearances. A match both rows played in counts once.
    const appearances = await tx.matchPlayer.findMany({ where: { userId: fromId, match: { teamId } }, select: { matchId: true, status: true } });
    if (appearances.length) {
      await tx.matchPlayer.createMany({
        data: appearances.map((a) => ({ matchId: a.matchId, userId: intoId, status: a.status })),
        skipDuplicates: true,
      });
      result.matches = appearances.length;
    }

    // Evaluations, term by term.
    const [fromEvals, intoEvals] = await Promise.all([
      tx.playerEvaluation.findMany({ where: { teamId, athleteId: fromId } }),
      tx.playerEvaluation.findMany({ where: { teamId, athleteId: intoId } }),
    ]);
    const intoByTerm = new Map(intoEvals.map((e) => [e.period, e]));
    for (const e of fromEvals) {
      const existing = intoByTerm.get(e.period);
      if (!existing) {
        await tx.playerEvaluation.update({ where: { id: e.id }, data: { athleteId: intoId } });
      } else if (pickEvaluation(existing, e) === e) {
        await tx.playerEvaluation.update({ where: { id: existing.id }, data: { scores: e.scores, note: e.note ?? existing.note } });
      }
      result.evaluations += 1;
    }

    // Roster details: fill what the account's row doesn't have yet.
    const [fromRow, intoRow] = await Promise.all([
      tx.teamMember.findUniqueOrThrow({ where: { teamId_userId: { teamId, userId: fromId } } }),
      tx.teamMember.findUniqueOrThrow({ where: { teamId_userId: { teamId, userId: intoId } } }),
    ]);
    const fill: Record<string, string | number> = {};
    for (const f of ROSTER_FIELDS) if (intoRow[f] == null && fromRow[f] != null) fill[f] = fromRow[f]!;
    if (Object.keys(fill).length) await tx.teamMember.update({ where: { id: intoRow.id }, data: fill });

    // The roster-only player existed only for this team; whatever is left on
    // it (rows the account already had for the same day or match) goes too.
    await tx.user.delete({ where: { id: fromId } });
    return result;
  });
}
