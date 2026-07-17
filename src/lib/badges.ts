import "server-only";
import { prisma } from "./db";
import type { Lang } from "./i18n";

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

const BADGE_TEXT: Record<Lang, Record<string, { name: string; detail: string }>> = {
  ko: {
    "first-record": { name: "첫 기록", detail: "첫 기록을 측정했어요" },
    "ten-records": { name: "꾸준한 측정", detail: "기록 10회 측정" },
    "pb-hunter": { name: "PB 헌터", detail: "최고 기록 5회 갱신" },
    "streak-7": { name: "일주일 개근", detail: "7일 연속 출석" },
    "streak-30": { name: "한 달 개근", detail: "30일 연속 출석" },
    "goal-getter": { name: "목표 달성", detail: "목표 기록 달성" },
    "team-player": { name: "팀 플레이어", detail: "팀에 참여했어요" },
    commentator: { name: "응원단", detail: "블로그에 댓글 작성" },
  },
  en: {
    "first-record": { name: "First Record", detail: "Logged your first record" },
    "ten-records": { name: "Consistent", detail: "10 records logged" },
    "pb-hunter": { name: "PB Hunter", detail: "5 personal-best renewals" },
    "streak-7": { name: "Week Streak", detail: "7-day visit streak" },
    "streak-30": { name: "Month Streak", detail: "30-day visit streak" },
    "goal-getter": { name: "Goal Getter", detail: "Achieved a target time" },
    "team-player": { name: "Team Player", detail: "Joined a team" },
    commentator: { name: "Supporter", detail: "Commented on the blog" },
  },
  es: {
    "first-record": { name: "Primera marca", detail: "Registraste tu primera marca" },
    "ten-records": { name: "Constante", detail: "10 marcas registradas" },
    "pb-hunter": { name: "Cazador de PB", detail: "5 mejores marcas renovadas" },
    "streak-7": { name: "Racha semanal", detail: "7 días seguidos" },
    "streak-30": { name: "Racha mensual", detail: "30 días seguidos" },
    "goal-getter": { name: "Meta cumplida", detail: "Lograste un objetivo" },
    "team-player": { name: "Jugador de equipo", detail: "Te uniste a un equipo" },
    commentator: { name: "Animador", detail: "Comentaste en el blog" },
  },
};

export async function computeBadges(userId: string, lang: Lang = "ko"): Promise<Badge[]> {
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

  const earnedOf: Record<string, boolean> = {
    "first-record": records.length >= 1,
    "ten-records": records.length >= 10,
    "pb-hunter": pbRenewals >= 5,
    "streak-7": longest >= 7,
    "streak-30": longest >= 30,
    "goal-getter": achievedGoals >= 1,
    "team-player": teamCount >= 1,
    commentator: blogCommentCount >= 1,
  };
  const emojiOf: Record<string, string> = {
    "first-record": "🏊",
    "ten-records": "📈",
    "pb-hunter": "⚡",
    "streak-7": "🔥",
    "streak-30": "🏅",
    "goal-getter": "🎯",
    "team-player": "👥",
    commentator: "💬",
  };

  return Object.keys(earnedOf).map((id) => ({
    id,
    emoji: emojiOf[id],
    name: BADGE_TEXT[lang][id].name,
    detail: BADGE_TEXT[lang][id].detail,
    earned: earnedOf[id],
  }));
}
