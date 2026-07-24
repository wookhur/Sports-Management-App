// Rule-based "AI coach" encouragement. Warm, streak-aware nudges that reward
// showing up and logging data — the "오 3일째 오셨네요!" moment. Pure functions
// (no DB, no Date.now) so they're safe to call anywhere.

import type { Lang } from "./i18n";

export interface Encouragement {
  emoji: string;
  text: string;
}

interface HomeCtx {
  lang: Lang;
  name: string;
  streak: number;
  advancedToday: boolean; // first visit of the day → streak just ticked
  todayScore: number;
  activeToday: boolean; // logged a session/record today
}

const MILESTONES = new Set([7, 14, 30, 50, 100, 200, 365]);

/** The greeting-banner encouragement shown at the top of the home dashboard. */
export function homeEncouragement(c: HomeCtx): Encouragement {
  const L = HOME_LINES[c.lang];

  if (c.advancedToday && MILESTONES.has(c.streak)) return { emoji: "🎉", text: L.milestone(c.streak) };
  if (c.advancedToday && c.streak >= 2) return { emoji: "🔥", text: L.streak(c.streak) };
  if (c.advancedToday) return { emoji: "👋", text: L.welcome(c.name) };
  if (!c.activeToday) return { emoji: "✍️", text: L.nudge };
  if (c.todayScore >= 80) return { emoji: "🏆", text: L.perfect(c.todayScore) };
  if (c.todayScore >= 50) return { emoji: "💪", text: L.solid };
  return { emoji: "✨", text: L.generic };
}

/** Inline message returned after logging a training session. */
export function sessionEncouragement(lang: Lang, countToday: number): Encouragement {
  const L = SESSION_LINES[lang];
  if (countToday <= 1) return { emoji: "💪", text: L.first };
  if (countToday === 2) return { emoji: "🔥", text: L.second };
  return { emoji: "🚀", text: L.more(countToday) };
}

const HOME_LINES: Record<
  Lang,
  {
    milestone: (n: number) => string;
    streak: (n: number) => string;
    welcome: (name: string) => string;
    nudge: string;
    perfect: (score: number) => string;
    solid: string;
    generic: string;
  }
> = {
  ko: {
    milestone: (n) => `${n}일 연속 출석 달성! 대단해요, 이 기세를 이어가요!`,
    streak: (n) => `오 ${n}일째 오셨네요! 꾸준함이 실력이 돼요.`,
    welcome: (name) => `${name}님, 다시 오셨네요! 오늘도 시작해볼까요?`,
    nudge: "오늘 훈련을 기록하면 점수를 바로 받을 수 있어요.",
    perfect: (score) => `오늘 트레이닝 점수 ${score}점! 완벽에 가까워요.`,
    solid: "오늘도 좋은 흐름이에요. 조금만 더 채워봐요!",
    generic: "오늘도 화이팅! 작은 기록이 큰 성장을 만들어요.",
  },
  en: {
    milestone: (n) => `${n}-day streak! Incredible — keep the momentum going!`,
    streak: (n) => `Oh, day ${n} in a row! Consistency becomes skill.`,
    welcome: (name) => `Welcome back, ${name}! Ready to start today?`,
    nudge: "Log today's training and get your score right away.",
    perfect: (score) => `Today's score is ${score}! That's near-perfect.`,
    solid: "Nice rhythm today — top it up a little more!",
    generic: "Let's go! Small entries add up to big progress.",
  },
  es: {
    milestone: (n) => `¡Racha de ${n} días! Increíble, ¡mantén el impulso!`,
    streak: (n) => `¡Vaya, día ${n} seguido! La constancia se vuelve habilidad.`,
    welcome: (name) => `¡Bienvenido de nuevo, ${name}! ¿Empezamos hoy?`,
    nudge: "Registra el entrenamiento de hoy y recibe tu puntuación al instante.",
    perfect: (score) => `¡La puntuación de hoy es ${score}! Casi perfecta.`,
    solid: "Buen ritmo hoy, ¡súmale un poco más!",
    generic: "¡Vamos! Los pequeños registros suman un gran progreso.",
  },
};

const SESSION_LINES: Record<Lang, { first: string; second: string; more: (n: number) => string }> = {
  ko: {
    first: "좋아요! 오늘의 트레이닝 점수가 시작됐어요.",
    second: "오늘 두 번째 훈련! 점수가 쑥쑥 올라가요.",
    more: (n) => `오늘 벌써 ${n}번째 훈련이에요. 대단해요!`,
  },
  en: {
    first: "Nice! Your training score for today has started.",
    second: "Second session today — your score is climbing!",
    more: (n) => `That's ${n} sessions today. Amazing!`,
  },
  es: {
    first: "¡Bien! Tu puntuación de hoy ha comenzado.",
    second: "¡Segunda sesión de hoy, tu puntuación sube!",
    more: (n) => `¡Ya son ${n} sesiones hoy. Increíble!`,
  },
};
