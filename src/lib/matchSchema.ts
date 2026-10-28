import { z } from "zod";
import { isDayKey } from "./season";
import { MATCH_KINDS } from "./teamLogText";
import { MATCH_PLAYER_STATUSES, type MatchPlayerStatusKey } from "./bitacora";

export const matchSchema = z.object({
  day: z.string().refine(isDayKey, "pickDate"),
  opponent: z.string().trim().min(1, "addOpponent").max(80),
  kind: z.enum(MATCH_KINDS),
  competition: z.string().trim().max(80).optional(),
  goalsFor: z.number().int().min(0).max(99),
  goalsAgainst: z.number().int().min(0).max(99),
  note: z.string().trim().max(500).optional(),
  penaltiesFor: z.number().int().min(0).max(99).nullable().optional(),
  penaltiesAgainst: z.number().int().min(0).max(99).nullable().optional(),
  eventId: z.string().min(1).nullable().optional(),
  // Who played. A bare id means "Asistió"; the sheet's other three statuses
  // come as { userId, status }. Anyone left out has no mark for the match.
  players: z
    .array(z.union([z.string().min(1), z.object({ userId: z.string().min(1), status: z.enum(MATCH_PLAYER_STATUSES) })]))
    .max(100),
});

export function playerMarks(players: MatchInput["players"]): { userId: string; status: MatchPlayerStatusKey }[] {
  const out = new Map<string, MatchPlayerStatusKey>();
  for (const p of players) {
    if (typeof p === "string") out.set(p, "ASISTIO");
    else out.set(p.userId, p.status);
  }
  return [...out].map(([userId, status]) => ({ userId, status }));
}

export type MatchInput = z.infer<typeof matchSchema>;
