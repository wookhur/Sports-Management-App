// "미션 & 캐릭터" gamification engine.
//
// Users complete daily missions to earn 완두콩 (beans) — a spendable currency —
// and XP that levels up their character/house. Beans are spent repairing the
// broken egg-house. Mission definitions live here as static data; per-user
// status (met / claimed today / progress) is computed from live DB data via
// computeMissions().

import { prisma } from "./db";
import { seoulDayKey } from "./format";
import type { Lang } from "./i18n";

export type MissionCategory = "daily" | "community";

export interface MissionDef {
  key: string;
  emoji: string;
  reward: number; // beans (and XP) awarded on claim
  goal: number; // target count for progress display (1 = binary)
  category: MissionCategory;
  // How completion is verified. "manual" missions are self-reported (the user
  // just taps to claim); the rest are auto-verified against real app data.
  kind: "streak" | "record" | "boardPost" | "boardComment" | "manual";
  title: Record<Lang, string>;
  subtitle: Record<Lang, string>;
}

export const MISSIONS: MissionDef[] = [
  {
    key: "streak5",
    emoji: "⚡",
    reward: 5,
    goal: 5,
    category: "daily",
    kind: "streak",
    title: { ko: "5일 달성하기", en: "Reach a 5-day streak", es: "Logra una racha de 5 días" },
    subtitle: { ko: "연속 기록", en: "Activity streak", es: "Racha de actividad" },
  },
  {
    key: "logRecord",
    emoji: "🍽️",
    reward: 5,
    goal: 1,
    category: "daily",
    kind: "record",
    title: { ko: "기록 남기기", en: "Log a record", es: "Registra una marca" },
    subtitle: { ko: "오늘의 훈련", en: "Today's training", es: "Entrenamiento de hoy" },
  },
  {
    key: "move",
    emoji: "🔥",
    reward: 5,
    goal: 1,
    category: "daily",
    kind: "manual",
    title: { ko: "움직이기", en: "Get moving", es: "Muévete" },
    subtitle: { ko: "200 kcal 이상", en: "200+ kcal", es: "200+ kcal" },
  },
  {
    key: "water",
    emoji: "💧",
    reward: 3,
    goal: 1,
    category: "daily",
    kind: "manual",
    title: { ko: "물 마시기", en: "Drink water", es: "Bebe agua" },
    subtitle: { ko: "하루 1L 이상", en: "1L+ a day", es: "1L+ al día" },
  },
  {
    key: "boardPost",
    emoji: "📝",
    reward: 5,
    goal: 1,
    category: "community",
    kind: "boardPost",
    title: { ko: "게시글 올리기", en: "Post to the board", es: "Publica en el tablón" },
    subtitle: { ko: "함께 해요! 자유게시판", en: "Community board", es: "Tablón de la comunidad" },
  },
  {
    key: "boardComment",
    emoji: "💬",
    reward: 1,
    goal: 3,
    category: "community",
    kind: "boardComment",
    title: { ko: "선플 댓글 쓰기", en: "Write kind comments", es: "Escribe comentarios amables" },
    subtitle: { ko: "함께 해요! 자유게시판", en: "Community board", es: "Tablón de la comunidad" },
  },
];

export function getMission(key: string): MissionDef | undefined {
  return MISSIONS.find((m) => m.key === key);
}

// ---------------------------------------------------------------------------
// Levels
// ---------------------------------------------------------------------------
// XP needed to advance FROM `level` to the next is 15 × level (15, 30, 45 …).
export function levelStep(level: number): number {
  return 15 * level;
}

export interface LevelInfo {
  level: number;
  intoLevel: number; // XP accumulated within the current level
  step: number; // XP span of the current level
  needed: number; // XP remaining to the next level
}

export function levelInfo(xp: number): LevelInfo {
  let level = 1;
  let base = 0;
  while (xp - base >= levelStep(level)) {
    base += levelStep(level);
    level += 1;
  }
  const step = levelStep(level);
  const intoLevel = xp - base;
  return { level, intoLevel, step, needed: step - intoLevel };
}

// ---------------------------------------------------------------------------
// House repairs
// ---------------------------------------------------------------------------
export interface RepairDef {
  key: string;
  emoji: string;
  cost: number; // beans
  title: Record<Lang, string>;
}

// Ordered cheapest → priciest so early progress is achievable.
export const REPAIRS: RepairDef[] = [
  { key: "roof", emoji: "🏠", cost: 10, title: { ko: "지붕 수리하기", en: "Fix the roof", es: "Arregla el tejado" } },
  { key: "door", emoji: "🚪", cost: 15, title: { ko: "현관문 수리하기", en: "Fix the front door", es: "Arregla la puerta" } },
  { key: "window", emoji: "🪟", cost: 20, title: { ko: "창문 수리하기", en: "Fix the windows", es: "Arregla las ventanas" } },
  { key: "wall", emoji: "🧱", cost: 25, title: { ko: "벽 수리하기", en: "Fix the walls", es: "Arregla las paredes" } },
];

export function getRepair(key: string): RepairDef | undefined {
  return REPAIRS.find((r) => r.key === key);
}

// ---------------------------------------------------------------------------
// Per-user mission status
// ---------------------------------------------------------------------------
export interface MissionStatus {
  key: string;
  emoji: string;
  reward: number;
  goal: number;
  progress: number; // capped at goal
  met: boolean; // requirement satisfied → claimable (if not already)
  claimed: boolean; // already claimed today
  manual: boolean;
  category: MissionCategory;
}

/** Compute today's mission board for a user (Asia/Seoul day boundary). */
export async function computeMissions(userId: string): Promise<MissionStatus[]> {
  const day = seoulDayKey();
  const dayStart = new Date(`${day}T00:00:00+09:00`);

  const [user, claims, recordsToday, postsToday, commentsToday] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { currentStreak: true } }),
    prisma.missionClaim.findMany({ where: { userId, day }, select: { missionKey: true } }),
    prisma.record.count({ where: { userId, createdAt: { gte: dayStart } } }),
    prisma.boardPost.count({ where: { authorId: userId, createdAt: { gte: dayStart } } }),
    prisma.boardComment.count({ where: { authorId: userId, createdAt: { gte: dayStart } } }),
  ]);

  const claimed = new Set(claims.map((c) => c.missionKey));
  const streak = user?.currentStreak ?? 0;

  return MISSIONS.map((m) => {
    let progress = 0;
    switch (m.kind) {
      case "streak":
        progress = streak;
        break;
      case "record":
        progress = recordsToday;
        break;
      case "boardPost":
        progress = postsToday;
        break;
      case "boardComment":
        progress = commentsToday;
        break;
      case "manual":
        progress = m.goal; // self-report: always considered met
        break;
    }
    const met = progress >= m.goal;
    return {
      key: m.key,
      emoji: m.emoji,
      reward: m.reward,
      goal: m.goal,
      progress: Math.min(progress, m.goal),
      met,
      claimed: claimed.has(m.key),
      manual: m.kind === "manual",
      category: m.category,
    };
  });
}

/** Whether a mission's requirement is currently satisfied for the user. Used
 *  by the claim endpoint to re-verify before awarding beans. */
export async function isMissionMet(userId: string, key: string): Promise<boolean> {
  const def = getMission(key);
  if (!def) return false;
  if (def.kind === "manual") return true;

  const day = seoulDayKey();
  const dayStart = new Date(`${day}T00:00:00+09:00`);
  switch (def.kind) {
    case "streak": {
      const u = await prisma.user.findUnique({ where: { id: userId }, select: { currentStreak: true } });
      return (u?.currentStreak ?? 0) >= def.goal;
    }
    case "record":
      return (await prisma.record.count({ where: { userId, createdAt: { gte: dayStart } } })) >= def.goal;
    case "boardPost":
      return (await prisma.boardPost.count({ where: { authorId: userId, createdAt: { gte: dayStart } } })) >= def.goal;
    case "boardComment":
      return (await prisma.boardComment.count({ where: { authorId: userId, createdAt: { gte: dayStart } } })) >= def.goal;
    default:
      return false;
  }
}
