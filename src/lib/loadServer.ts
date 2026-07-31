import "server-only";
import { prisma } from "./db";
import { seoulDayKey } from "./format";
import { summarizeLoad, dayWindow, CHRONIC_DAYS, type LoadSummary } from "./load";

/** Training-load summary for one athlete, as of today (Asia/Seoul). */
export async function athleteLoad(userId: string): Promise<LoadSummary> {
  const today = seoulDayKey();
  const window = dayWindow(today, CHRONIC_DAYS);

  const [sessions, first] = await Promise.all([
    prisma.trainingSession.findMany({
      where: { userId, day: { in: window } },
      select: { day: true, minutes: true, intensity: true },
    }),
    // How long they've been logging at all — decides whether the chronic
    // baseline is trustworthy enough to show a ratio.
    prisma.trainingSession.findFirst({
      where: { userId },
      orderBy: { day: "asc" },
      select: { day: true },
    }),
  ]);

  const historyDays = first
    ? Math.floor(
        (Date.parse(`${today}T00:00:00Z`) - Date.parse(`${first.day}T00:00:00Z`)) / 86_400_000,
      ) + 1
    : 0;

  return summarizeLoad(sessions, today, historyDays);
}

/** Load summaries for many athletes at once — used by the coach roster view. */
export async function squadLoad(userIds: string[]): Promise<Map<string, LoadSummary>> {
  const today = seoulDayKey();
  const window = dayWindow(today, CHRONIC_DAYS);
  const out = new Map<string, LoadSummary>();
  if (userIds.length === 0) return out;

  const [sessions, firsts] = await Promise.all([
    prisma.trainingSession.findMany({
      where: { userId: { in: userIds }, day: { in: window } },
      select: { userId: true, day: true, minutes: true, intensity: true },
    }),
    prisma.trainingSession.groupBy({
      by: ["userId"],
      where: { userId: { in: userIds } },
      _min: { day: true },
    }),
  ]);

  const byUser = new Map<string, { day: string; minutes: number; intensity: number }[]>();
  for (const s of sessions) {
    const list = byUser.get(s.userId) ?? [];
    list.push({ day: s.day, minutes: s.minutes, intensity: s.intensity });
    byUser.set(s.userId, list);
  }
  const firstDay = new Map(firsts.map((f) => [f.userId, f._min.day]));

  for (const id of userIds) {
    const start = firstDay.get(id);
    const historyDays = start
      ? Math.floor(
          (Date.parse(`${today}T00:00:00Z`) - Date.parse(`${start}T00:00:00Z`)) / 86_400_000,
        ) + 1
      : 0;
    out.set(id, summarizeLoad(byUser.get(id) ?? [], today, historyDays));
  }
  return out;
}
