// -----------------------------------------------------------------------------
// Onboarding
//
// Pre-login "tutorial" that captures the visitor's purpose + interests before
// they create an account (modeled on Planfit's AI-coach onboarding flow).
// Answers are kept client-side in localStorage and used to prefill signup and
// personalize the app later — no backend/schema change required.
// -----------------------------------------------------------------------------

export type Role = "ATHLETE" | "COACH";

export interface Onboarding {
  role: Role;
  sports: string[]; // sport registry ids
  goal: string; // goal id
  focuses: string[]; // focus ids, in priority order
  username: string;
}

export interface Goal {
  id: string;
  emoji: string;
  title: string;
  detail: string;
}

/** Main goal — single select (see Planfit "What is your main goal?"). */
export const GOALS: Goal[] = [
  { id: "improve-record", emoji: "📈", title: "기록 향상", detail: "측정하고 성장 추세를 눈으로 확인하기" },
  { id: "learn-basics", emoji: "🎯", title: "기본기 다지기", detail: "종목별 훈련·연습 방식을 단계별로 배우기" },
  { id: "coach-feedback", emoji: "💬", title: "코치 피드백", detail: "기록을 코치와 공유하고 피드백 받기" },
  { id: "follow-star", emoji: "🌟", title: "스타 루틴 따라하기", detail: "최고 선수의 훈련 루틴을 팔로우해 따라 하기" },
  { id: "healthy-habit", emoji: "🔥", title: "꾸준한 습관", detail: "운동을 지속 가능한 습관으로 만들기" },
];

/** Focus areas — multi-select chips, kept in tap order (priority). */
export const FOCUSES: string[] = [
  "스피드",
  "지구력",
  "근력",
  "기술·테크닉",
  "민첩성",
  "유연성",
  "자세 교정",
  "회복·컨디셔닝",
  "정신력·집중",
  "팀플레이",
  "부상 예방",
  "체중 관리",
];

const KEY = "sideline365.onboarding";

export function saveOnboarding(data: Partial<Onboarding>): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    // Storage may be unavailable (private mode / blocked). Onboarding still
    // works; we just can't prefill signup.
  }
}

export function loadOnboarding(): Partial<Onboarding> | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Partial<Onboarding>) : null;
  } catch {
    return null;
  }
}
