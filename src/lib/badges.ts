import "server-only";
import { prisma } from "./db";

// Derived badges — computed from existing data on read, so there's no
// award table to keep in sync and history rewrites (deleted records)
// self-correct.

export interface Badge {
  id: string;
  emoji: string;
  name: string;
  detail: string;
  earned: boolean;
}

export async function computeBadges(userId: string): Promise<Badge[]> {
  const [user, records, achievedGoals, teamCount, blogCommentCount] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { longestStreak: true },
    }),
    prisma.record.findMany({
      where: { userId, durationMs: { not: null } },
      orderBy: { createdAt: "asc" },
      select: { metricKey: true, durationMs: true },
    }),
    prisma.goal.count({ where: { userId, achievedAt: { not: null } } }),
    prisma.teamMember.count({ where: { userId } }),
    prisma.blogComment.count({ where: { authorId: userId } }),
  ]);

  // Count personal-best renewals: a record strictly faster than every
  // earlier record of the same metric (the first record doesn't count).
  const best = new Map<string, number>();
  let pbRenewals = 0;
  for (const r of records) {
    const cur = best.get(r.metricKey);
    if (cur == null) {
      best.set(r.metricKey, r.durationMs!);
    } else if (r.durationMs! < cur) {
      best.set(r.metricKey, r.durationMs!);
      pbRenewals++;
    }
  }

  const longest = user?.longestStreak ?? 0;

  return [
    { id: "first-record", emoji: "🏊", name: "첫 기록", detail: "첫 기록을 측정했어요", earned: records.length >= 1 },
    { id: "ten-records", emoji: "📈", name: "꾸준한 측정", detail: "기록 10회 측정", earned: records.length >= 10 },
    { id: "pb-hunter", emoji: "⚡", name: "PB 헌터", detail: "최고 기록 5회 갱신", earned: pbRenewals >= 5 },
    { id: "streak-7", emoji: "🔥", name: "일주일 개근", detail: "7일 연속 출석", earned: longest >= 7 },
    { id: "streak-30", emoji: "🏅", name: "한 달 개근", detail: "30일 연속 출석", earned: longest >= 30 },
    { id: "goal-getter", emoji: "🎯", name: "목표 달성", detail: "목표 기록 달성", earned: achievedGoals >= 1 },
    { id: "team-player", emoji: "👥", name: "팀 플레이어", detail: "팀에 참여했어요", earned: teamCount >= 1 },
    { id: "commentator", emoji: "💬", name: "응원단", detail: "블로그에 댓글 작성", earned: blogCommentCount >= 1 },
  ];
}
