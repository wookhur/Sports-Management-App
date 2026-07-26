// Pet-raising mechanic for the mission hub. Beans earned from missions are
// spent on care actions (feed / play / keep warm …). Each care action adds
// "growth"; once growth crosses HATCH the egg hatches into a bird, and the
// bird keeps growing through sub-stages. The set of care actions on offer
// changes with growth, so the list "replaces itself" as the pet progresses.

import type { Lang } from "./i18n";

export const HATCH = 100;

export type PetStageId = "egg" | "bird";
export type PetSub = "egg" | "baby" | "young" | "adult";

interface SubDef {
  sub: PetSub;
  stage: PetStageId;
  from: number;
  to: number;
  label: Record<Lang, string>;
}

const SUBS: SubDef[] = [
  { sub: "egg", stage: "egg", from: 0, to: HATCH, label: { ko: "알", en: "Egg", es: "Huevo" } },
  { sub: "baby", stage: "bird", from: HATCH, to: 250, label: { ko: "아기 새", en: "Baby bird", es: "Pajarito" } },
  { sub: "young", stage: "bird", from: 250, to: 450, label: { ko: "청소년 새", en: "Young bird", es: "Ave joven" } },
  { sub: "adult", stage: "bird", from: 450, to: Infinity, label: { ko: "다 자란 새", en: "Grown bird", es: "Ave adulta" } },
];

export interface PetState {
  growth: number;
  stage: PetStageId;
  sub: PetSub;
  label: Record<Lang, string>;
  hatched: boolean;
  into: number; // growth accumulated within the current sub-stage
  span: number; // growth span of the current sub-stage (nominal for adult)
  toNext: number | null; // growth remaining to the next sub-stage, null if maxed
  hatchPct: number; // 0..1 progress toward hatching (egg only)
}

export function petState(growth: number): PetState {
  const g = Math.max(0, growth);
  const sd = SUBS.find((s) => g >= s.from && g < s.to) ?? SUBS[SUBS.length - 1];
  const finiteTo = Number.isFinite(sd.to) ? sd.to : sd.from + 200;
  return {
    growth: g,
    stage: sd.stage,
    sub: sd.sub,
    label: sd.label,
    hatched: sd.stage === "bird",
    into: g - sd.from,
    span: finiteTo - sd.from,
    toNext: Number.isFinite(sd.to) ? sd.to - g : null,
    hatchPct: Math.min(1, g / HATCH),
  };
}

// ---------------------------------------------------------------------------
// Care actions
// ---------------------------------------------------------------------------
export interface CareDef {
  key: string;
  emoji: string;
  cost: number; // beans
  growth: number; // growth added
  stage: PetStageId;
  from: number; // visible while from <= growth < to
  to: number;
  label: Record<Lang, string>;
}

export const CARES: CareDef[] = [
  // --- Egg (growth 0 → HATCH) ---
  { key: "warm", emoji: "🔥", cost: 4, growth: 10, stage: "egg", from: 0, to: 45, label: { ko: "온기 나눠주기", en: "Keep it warm", es: "Dale calor" } },
  { key: "pat", emoji: "🫧", cost: 3, growth: 8, stage: "egg", from: 0, to: 45, label: { ko: "쓰다듬어 주기", en: "Give it a pat", es: "Acarícialo" } },
  { key: "talk", emoji: "💬", cost: 5, growth: 12, stage: "egg", from: 0, to: 45, label: { ko: "이야기 들려주기", en: "Talk to it", es: "Háblale" } },
  { key: "nourish", emoji: "🥗", cost: 5, growth: 12, stage: "egg", from: 45, to: HATCH, label: { ko: "영양 공급하기", en: "Nourish it", es: "Nútrelo" } },
  { key: "wrap", emoji: "🧣", cost: 6, growth: 14, stage: "egg", from: 45, to: HATCH, label: { ko: "따뜻하게 감싸기", en: "Wrap it up warm", es: "Abrígalo" } },
  { key: "lullaby", emoji: "🎵", cost: 7, growth: 16, stage: "egg", from: 45, to: HATCH, label: { ko: "자장가 불러주기", en: "Sing a lullaby", es: "Cántale" } },
  // --- Baby bird (HATCH → 250) ---
  { key: "feed", emoji: "🐛", cost: 5, growth: 12, stage: "bird", from: HATCH, to: 250, label: { ko: "먹이 주기", en: "Feed the bird", es: "Dale de comer" } },
  { key: "water", emoji: "💧", cost: 4, growth: 10, stage: "bird", from: HATCH, to: 250, label: { ko: "물 주기", en: "Give it water", es: "Dale agua" } },
  { key: "play", emoji: "🎾", cost: 6, growth: 14, stage: "bird", from: HATCH, to: 250, label: { ko: "함께 놀아주기", en: "Play together", es: "Jueguen juntos" } },
  // --- Young bird (250 → 450) ---
  { key: "train", emoji: "🏃", cost: 7, growth: 16, stage: "bird", from: 250, to: 450, label: { ko: "훈련 함께하기", en: "Train together", es: "Entrenen juntos" } },
  { key: "bathe", emoji: "🛁", cost: 6, growth: 14, stage: "bird", from: 250, to: 450, label: { ko: "목욕시켜 주기", en: "Give it a bath", es: "Báñalo" } },
  { key: "treat", emoji: "🍎", cost: 5, growth: 12, stage: "bird", from: 250, to: 450, label: { ko: "간식 주기", en: "Give it a treat", es: "Dale un premio" } },
  // --- Grown bird (450+) ---
  { key: "fly", emoji: "🕊️", cost: 8, growth: 18, stage: "bird", from: 450, to: Infinity, label: { ko: "하늘 날기 연습", en: "Practice flying", es: "Practicar el vuelo" } },
  { key: "adventure", emoji: "🗺️", cost: 9, growth: 20, stage: "bird", from: 450, to: Infinity, label: { ko: "모험 떠나기", en: "Go on an adventure", es: "Ir de aventura" } },
  { key: "friends", emoji: "🤝", cost: 7, growth: 16, stage: "bird", from: 450, to: Infinity, label: { ko: "친구 만나러 가기", en: "Meet some friends", es: "Ver a los amigos" } },
];

/** Care actions currently on offer for a pet at the given growth. */
export function careActions(growth: number): CareDef[] {
  const g = Math.max(0, growth);
  const stage = petState(g).stage;
  return CARES.filter((c) => c.stage === stage && g >= c.from && g < c.to);
}

export function getCare(key: string): CareDef | undefined {
  return CARES.find((c) => c.key === key);
}

/** Whether a care action is valid to buy right now (stage + growth window). */
export function isCareAvailable(key: string, growth: number): boolean {
  return careActions(growth).some((c) => c.key === key);
}

// ---------------------------------------------------------------------------
// Mood — the companion mirrors the athlete's real training state, so the
// character is a status readout (and a nudge), not just decoration.
// ---------------------------------------------------------------------------
export type PetMood = "celebrating" | "proud" | "happy" | "hungry" | "sleepy" | "waiting";

export interface MoodSignals {
  streak: number;
  activeToday: boolean; // logged a record or training session today
  todayScore: number; // 0–100 training score
  daysIdle: number; // consecutive days with no activity
  spendableBeans: number; // beans on hand
  cheapestCare: number; // cost of the cheapest available care action
}

/** Pick the companion's mood. Order matters: celebration first, then needs. */
export function petMood(s: MoodSignals): PetMood {
  if (s.activeToday && s.todayScore >= 80) return "celebrating";
  if (s.daysIdle >= 3) return "sleepy";
  // Beans sitting unspent → the pet is asking to be fed/cared for.
  if (s.spendableBeans >= s.cheapestCare && s.cheapestCare > 0) return "hungry";
  if (s.activeToday && s.streak >= 3) return "proud";
  if (s.activeToday) return "happy";
  return "waiting";
}
