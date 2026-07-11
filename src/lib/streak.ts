import "server-only";
import { prisma } from "./db";

// Daily-activity streak ("연속 출석"). Any visit on a calendar day counts.
// Idempotent per day, so it's safe to call on every dashboard load.

/** Local calendar day as YYYY-MM-DD (server timezone). */
function dayKey(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function daysBetween(a: Date, b: Date): number {
  const ms = new Date(a.getFullYear(), a.getMonth(), a.getDate()).getTime() -
    new Date(b.getFullYear(), b.getMonth(), b.getDate()).getTime();
  return Math.round(ms / 86_400_000);
}

export interface StreakInfo {
  current: number;
  longest: number;
  /** true if this call is the first visit today (i.e. streak just advanced). */
  advancedToday: boolean;
}

export async function touchStreak(userId: string): Promise<StreakInfo> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { lastActiveOn: true, currentStreak: true, longestStreak: true },
  });
  if (!user) return { current: 0, longest: 0, advancedToday: false };

  const now = new Date();
  const last = user.lastActiveOn;

  // Already counted today → no change.
  if (last && dayKey(last) === dayKey(now)) {
    return { current: user.currentStreak, longest: user.longestStreak, advancedToday: false };
  }

  const gap = last ? daysBetween(now, last) : Infinity;
  const nextCurrent = gap === 1 ? user.currentStreak + 1 : 1; // consecutive day vs reset
  const nextLongest = Math.max(user.longestStreak, nextCurrent);

  await prisma.user.update({
    where: { id: userId },
    data: { lastActiveOn: now, currentStreak: nextCurrent, longestStreak: nextLongest },
  });

  return { current: nextCurrent, longest: nextLongest, advancedToday: true };
}

export interface LeaderRow {
  name: string;
  currentStreak: number;
}

/** Top active users by current streak — the "많이 들어오는 사람" board. */
export async function topStreaks(limit = 5): Promise<LeaderRow[]> {
  const rows = await prisma.user.findMany({
    where: { currentStreak: { gt: 0 } },
    orderBy: [{ currentStreak: "desc" }, { longestStreak: "desc" }],
    take: limit,
    select: { name: true, currentStreak: true },
  });
  return rows;
}
