import { z } from "zod";
import { isDayKey } from "./season";
import { MATCH_KINDS } from "./teamLogText";

export const matchSchema = z.object({
  day: z.string().refine(isDayKey, "Pick the date"),
  opponent: z.string().trim().min(1, "Add the opponent").max(80),
  kind: z.enum(MATCH_KINDS),
  competition: z.string().trim().max(80).optional(),
  goalsFor: z.number().int().min(0).max(99),
  goalsAgainst: z.number().int().min(0).max(99),
  note: z.string().trim().max(500).optional(),
  players: z.array(z.string().min(1)).max(100),
});

export type MatchInput = z.infer<typeof matchSchema>;
