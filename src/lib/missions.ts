// "미션 & 캐릭터" gamification engine.
//
// Users complete daily missions to earn 완두콩 (beans) — a spendable currency
// spent caring for their pet (see lib/pet.ts). Missions are sport-agnostic
// (training / conditioning / lifestyle) so they fit every athlete regardless
// of their main sport, and they're grouped into tiers: which tier a user sees
// advances with their pet's growth, so the mission board "replaces itself" as
// they progress. Per-user status is computed from live DB data.

import { prisma } from "./db";
import { seoulDayKey } from "./format";
import type { Lang } from "./i18n";

/** Which mission tier a user sees, based on their pet's growth. Advancing the
 *  pet swaps the whole mission set for the next tier. */
export function missionTierForGrowth(growth: number): number {
  if (growth >= 320) return 2;
  if (growth >= 120) return 1;
  return 0;
}

export type MissionCategory = "training" | "conditioning" | "lifestyle";

export interface MissionDef {
  key: string;
  emoji: string;
  reward: number; // beans (and XP) awarded on claim
  goal: number; // target count for progress display (1 = binary)
  tier: number; // 0,1,2 — shown according to the user's progress
  category: MissionCategory;
  // How completion is verified. "manual" missions are self-reported (the user
  // just taps to claim); the rest are auto-verified against real app data.
  kind: "streak" | "record" | "training" | "boardPost" | "boardComment" | "manual";
  title: Record<Lang, string>;
}

export const MISSIONS: MissionDef[] = [
  // ---- Tier 0 ----
  { key: "logRecord", emoji: "🏅", reward: 5, goal: 1, tier: 0, category: "training", kind: "record",
    title: { ko: "오늘 기록 하나 남기기", en: "Log one record today", es: "Registra una marca hoy" } },
  { key: "journal0", emoji: "📓", reward: 5, goal: 1, tier: 0, category: "training", kind: "training",
    title: { ko: "훈련 일지 쓰기", en: "Write your training journal", es: "Escribe tu diario" } },
  { key: "water0", emoji: "💧", reward: 3, goal: 1, tier: 0, category: "conditioning", kind: "manual",
    title: { ko: "물 1L 이상 마시기", en: "Drink 1L+ of water", es: "Bebe 1L+ de agua" } },
  { key: "stretch0", emoji: "🤸", reward: 3, goal: 1, tier: 0, category: "conditioning", kind: "manual",
    title: { ko: "스트레칭 하기", en: "Do some stretching", es: "Haz estiramientos" } },
  { key: "sleep0", emoji: "😴", reward: 4, goal: 1, tier: 0, category: "lifestyle", kind: "manual",
    title: { ko: "일찍 잠자리 들기", en: "Get to bed early", es: "Acuéstate temprano" } },
  { key: "post0", emoji: "📝", reward: 4, goal: 1, tier: 0, category: "lifestyle", kind: "boardPost",
    title: { ko: "커뮤니티에 글 남기기", en: "Post to the community", es: "Publica en la comunidad" } },

  // ---- Tier 1 ----
  { key: "streak5", emoji: "⚡", reward: 6, goal: 5, tier: 1, category: "training", kind: "streak",
    title: { ko: "연속 출석 5일 달성", en: "Reach a 5-day streak", es: "Racha de 5 días" } },
  { key: "twoSessions", emoji: "🔥", reward: 6, goal: 2, tier: 1, category: "training", kind: "training",
    title: { ko: "하루 훈련 2번 기록", en: "Log 2 sessions in a day", es: "Registra 2 sesiones" } },
  { key: "walk1", emoji: "🚶", reward: 4, goal: 1, tier: 1, category: "conditioning", kind: "manual",
    title: { ko: "30분 이상 걷기", en: "Walk for 30+ minutes", es: "Camina 30+ min" } },
  { key: "core1", emoji: "🧘", reward: 4, goal: 1, tier: 1, category: "conditioning", kind: "manual",
    title: { ko: "코어 운동 하기", en: "Do a core workout", es: "Entrena el core" } },
  { key: "meal1", emoji: "🥗", reward: 4, goal: 1, tier: 1, category: "lifestyle", kind: "manual",
    title: { ko: "건강한 식사 챙기기", en: "Eat a healthy meal", es: "Come sano" } },
  { key: "comment1", emoji: "💬", reward: 4, goal: 3, tier: 1, category: "lifestyle", kind: "boardComment",
    title: { ko: "선플 댓글 3개 쓰기", en: "Write 3 kind comments", es: "Escribe 3 comentarios amables" } },

  // ---- Tier 2 ----
  { key: "streak10", emoji: "🏆", reward: 8, goal: 10, tier: 2, category: "training", kind: "streak",
    title: { ko: "연속 출석 10일 달성", en: "Reach a 10-day streak", es: "Racha de 10 días" } },
  { key: "journal2", emoji: "💪", reward: 6, goal: 1, tier: 2, category: "training", kind: "training",
    title: { ko: "고강도 훈련 일지 쓰기", en: "Log a hard training session", es: "Registra un entrenamiento intenso" } },
  { key: "hydrate2", emoji: "🚰", reward: 5, goal: 1, tier: 2, category: "conditioning", kind: "manual",
    title: { ko: "물 2L 마시기", en: "Drink 2L of water", es: "Bebe 2L de agua" } },
  { key: "mobility2", emoji: "🌀", reward: 5, goal: 1, tier: 2, category: "conditioning", kind: "manual",
    title: { ko: "모빌리티 루틴 하기", en: "Do a mobility routine", es: "Rutina de movilidad" } },
  { key: "rise2", emoji: "🌅", reward: 5, goal: 1, tier: 2, category: "lifestyle", kind: "manual",
    title: { ko: "일찍 일어나기", en: "Wake up early", es: "Levántate temprano" } },
  { key: "gratitude2", emoji: "🙏", reward: 4, goal: 1, tier: 2, category: "lifestyle", kind: "manual",
    title: { ko: "감사 일기 쓰기", en: "Write a gratitude note", es: "Escribe algo por lo que estás agradecido" } },
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

/** Compute today's mission board for a user (Asia/Seoul day boundary). The set
 *  shown is the tier that matches the user's pet growth. */
export async function computeMissions(userId: string): Promise<MissionStatus[]> {
  const day = seoulDayKey();
  const dayStart = new Date(`${day}T00:00:00+09:00`);

  const [user, claims, recordsToday, sessionsToday, postsToday, commentsToday] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { currentStreak: true, petGrowth: true } }),
    prisma.missionClaim.findMany({ where: { userId, day }, select: { missionKey: true } }),
    prisma.record.count({ where: { userId, createdAt: { gte: dayStart } } }),
    prisma.trainingSession.count({ where: { userId, day } }),
    prisma.boardPost.count({ where: { authorId: userId, createdAt: { gte: dayStart } } }),
    prisma.boardComment.count({ where: { authorId: userId, createdAt: { gte: dayStart } } }),
  ]);

  const claimed = new Set(claims.map((c) => c.missionKey));
  const streak = user?.currentStreak ?? 0;
  const tier = missionTierForGrowth(user?.petGrowth ?? 0);

  return MISSIONS.filter((m) => m.tier === tier).map((m) => {
    let progress = 0;
    switch (m.kind) {
      case "streak":
        progress = streak;
        break;
      case "record":
        progress = recordsToday;
        break;
      case "training":
        progress = sessionsToday;
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
    case "training":
      return (await prisma.trainingSession.count({ where: { userId, day } })) >= def.goal;
    case "boardPost":
      return (await prisma.boardPost.count({ where: { authorId: userId, createdAt: { gte: dayStart } } })) >= def.goal;
    case "boardComment":
      return (await prisma.boardComment.count({ where: { authorId: userId, createdAt: { gte: dayStart } } })) >= def.goal;
    default:
      return false;
  }
}
