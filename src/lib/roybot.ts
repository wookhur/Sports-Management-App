// Chooses which Roybot coach tier greets a user. The tier auto-advances the
// way the character sheet lays it out:
//   beginner  (blue)   — Kids & Beginners
//   intermediate (green) — Teens & Developing Athletes
//   pro       (purple) — Serious & Elite Athletes
//
// The self-reported experience level is a floor; real activity (records +
// training sessions) and the gamification character level can promote a user
// beyond it over time, so Roybot "levels up" as they train.

import "server-only";
import { prisma } from "./db";
import { levelInfo } from "./missions";
import type { RoybotTier } from "@/components/RoybotAvatar";

export interface TierSignals {
  experienceLevel?: string | null;
  activity: number; // records + training sessions logged
  charLevel: number; // gamification level from XP
}

export function roybotTierFrom(s: TierSignals): RoybotTier {
  if (s.experienceLevel === "advanced" || s.activity >= 50 || s.charLevel >= 8) return "pro";
  if (s.experienceLevel === "intermediate" || s.activity >= 12 || s.charLevel >= 3) return "intermediate";
  return "beginner";
}

/** Resolve a user's current Roybot tier from live data. */
export async function getRoybotTier(userId: string): Promise<RoybotTier> {
  const [user, records, sessions] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { experienceLevel: true, charXp: true } }),
    prisma.record.count({ where: { userId } }),
    prisma.trainingSession.count({ where: { userId } }),
  ]);
  const charLevel = levelInfo(user?.charXp ?? 0).level;
  return roybotTierFrom({
    experienceLevel: user?.experienceLevel,
    activity: records + sessions,
    charLevel,
  });
}
