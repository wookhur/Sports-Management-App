import programData from "@/data/soccer/program.json";
import type { LocalizedText } from "./localized";

// Coach-provided soccer training program (grade-level session plans +
// warm-up / cool-down routines). Static reference content.

export interface SessionPhase {
  name: string;
  time: string | null;
  items: string[];
}
export interface Session {
  title: string;
  phases: SessionPhase[];
}
export interface StretchItem {
  name: string;
  variations: string[];
}
export interface SoccerProgram {
  sessions: Session[];
  warmup: StretchItem[];
  cooldown: StretchItem[];
}

export const soccerProgram = programData as SoccerProgram;

// The source sheet names phases in English; these are the display labels.
// Keyed by the sheet's own wording, which is stable because it comes from the
// JSON rather than from anything a translator would touch.
export const PHASE_I18N: Record<string, LocalizedText> = {
  "Warming-up": { ko: "웜업", en: "Warm-up", es: "Calentamiento" },
  Coordination: { ko: "코디네이션", en: "Coordination", es: "Coordinación" },
  "Passing&Ball Control": {
    ko: "패스 & 볼 컨트롤",
    en: "Passing & ball control",
    es: "Pase y control del balón",
  },
  "Mini Game": { ko: "미니 게임", en: "Mini game", es: "Mini partido" },
  "Cool-down & Stretching": {
    ko: "쿨다운 & 스트레칭",
    en: "Cool-down & stretching",
    es: "Vuelta a la calma y estiramientos",
  },
};

/** The grade bands the sessions are written for, keyed by the JSON's title. */
export const SESSION_I18N: Record<string, LocalizedText> = {
  "유치원~2학년": { ko: "유치원~2학년", en: "Kindergarten – Grade 2", es: "Infantil – 2.º grado" },
  "3~5학년": { ko: "3~5학년", en: "Grades 3–5", es: "3.º – 5.º grado" },
};
