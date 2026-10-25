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

// The drills and stretches in the sheet are written in English, so a coach
// reading the program in Spanish or Korean used to get them in English.
// Keyed by the sheet's wording; anything missing falls back to it.
const ITEM_I18N: Record<string, { ko: string; es: string; en?: string }> = {
  "1 on 1 different passing techniques": { es: "Pases en parejas con distintas técnicas", ko: "1대1 다양한 패스 기술" },
  "1:1 moves and finishing": { es: "1 vs 1: fintas y definición", ko: "1대1 개인기와 마무리" },
  "1:1 soccer tournament": { es: "Torneo de 1 vs 1", ko: "1대1 축구 토너먼트" },
  "1:1 to 2:1 to 2:1... to 5:5 with goals": { es: "De 1 vs 1 a 2 vs 1… hasta 5 vs 5 con porterías", ko: "1대1 → 2대1 → … → 5대5 골대 게임" },
  "1:1 with GK": { es: "1 vs 1 contra portero", ko: "골키퍼와 1대1" },
  "1:1 with goals": { es: "1 vs 1 con porterías", ko: "골대 있는 1대1" },
  "2:1 passing": { es: "Pase 2 vs 1", ko: "2대1 패스" },
  "3 vs 2 deep ball": { es: "3 vs 2 con balón largo", ko: "3대2 롱볼" },
  "4 + GK vs 4": { es: "4 + portero vs 4", ko: "4 + 골키퍼 대 4" },
  Adductors: { es: "Aductores", ko: "내전근" },
  "Advanced Rondo": { es: "Rondo avanzado", ko: "심화 론도" },
  Back: { es: "Hacia atrás", ko: "뒤로" },
  "Backwards jogging": { es: "Trote hacia atrás", ko: "뒤로 조깅" },
  "Butt kicks": { es: "Talones a los glúteos", ko: "엉덩이 차기" },
  "Calf stretch": { es: "Estiramiento de gemelos", ko: "종아리 스트레칭" },
  "Classic 3 v 3, winner stays": { es: "3 vs 3 clásico, el que gana se queda", ko: "클래식 3대3, 이긴 팀 남기" },
  "Control with player behind": { es: "Control con rival a la espalda", ko: "등 뒤 수비수 두고 컨트롤" },
  "Cool-down stretch": { es: "Estiramientos de vuelta a la calma", ko: "정리 스트레칭" },
  "Easy jog": { es: "Trote suave", ko: "가벼운 조깅" },
  "Finish off with Sprints": { es: "Terminar con sprints", ko: "스프린트로 마무리" },
  "First touch": { es: "Primer toque", ko: "퍼스트 터치" },
  Footwork: { es: "Trabajo de pies", ko: "풋워크" },
  Forth: { es: "Hacia adelante", ko: "앞으로" },
  "Freekicks/Cornerkicks practice": { es: "Práctica de tiros libres y tiros de esquina", ko: "프리킥·코너킥 연습" },
  "Glute stretch": { es: "Estiramiento de glúteos", ko: "엉덩이 스트레칭" },
  "Goalkeeper training Ex: Tennis": { es: "Entrenamiento de portero (p. ej., con pelota de tenis)", ko: "골키퍼 훈련 (예: 테니스공)" },
  Hamstring: { es: "Isquiotibiales", ko: "햄스트링" },
  "Hamstring stretch": { es: "Estiramiento de isquiotibiales", ko: "햄스트링 스트레칭" },
  "High knees": { es: "Rodillas arriba", ko: "하이니" },
  "Hip flexor stretch": { es: "Estiramiento de flexores de cadera", ko: "고관절 굴곡근 스트레칭" },
  "Hip rotation": { es: "Rotación de cadera", ko: "고관절 돌리기" },
  Juggling: { es: "Dominadas", ko: "리프팅" },
  "Juggling variation": { es: "Variantes de dominadas", ko: "리프팅 변형" },
  "Jumping Squats": { es: "Sentadillas con salto", ko: "점프 스쿼트" },
  "King of the Ring": { es: "Rey del ring", ko: "링의 왕" },
  Ladder: { es: "Escalera de coordinación", ko: "사다리" },
  "Ladder, cones w/ and w/out ball": { es: "Escalera y conos, con y sin balón", ko: "사다리·콘, 공 있이/없이" },
  "Leg swings": { es: "Balanceo de piernas", ko: "다리 흔들기" },
  "Lower back stretch": { es: "Estiramiento de espalda baja", ko: "허리 스트레칭" },
  Lunges: { es: "Zancadas", ko: "런지" },
  "Neck stretch": { es: "Estiramiento de cuello", ko: "목 스트레칭" },
  "Neck stretches": { es: "Estiramientos de cuello", ko: "목 스트레칭" },
  "Normal Rondo(4v1)": { es: "Rondo normal (4 vs 1)", ko: "기본 론도 (4대1)", en: "Normal rondo (4v1)" },
  "Possession 10:4 (3 in the middle)": { es: "Posesión 10 vs 4 (3 en medio)", ko: "점유 10대4 (가운데 3명)" },
  "Practice Match": { es: "Partido de práctica", ko: "연습 경기", en: "Practice match" },
  "Quad stretch": { es: "Estiramiento de cuádriceps", ko: "대퇴사두근 스트레칭" },
  Quads: { es: "Cuádriceps", ko: "대퇴사두근" },
  "Shoulder stretch": { es: "Estiramiento de hombros", ko: "어깨 스트레칭" },
  Sidesteps: { es: "Desplazamientos laterales", ko: "사이드스텝" },
  Sideways: { es: "De lado", ko: "옆으로" },
  "Sit ups": { es: "Abdominales", ko: "윗몸일으키기", en: "Sit-ups" },
  Skipping: { es: "Skipping", ko: "스키핑" },
  "Soccer fundamentals(passing, defending, goalkeeping, etc)": {
    es: "Fundamentos de fútbol (pase, defensa, portería, etc.)",
    ko: "축구 기본기 (패스, 수비, 골키핑 등)",
    en: "Soccer fundamentals (passing, defending, goalkeeping, etc.)",
  },
  "Soccer tennis 2 vs 2 / 1 vs 1": { es: "Futtenis 2 vs 2 / 1 vs 1", ko: "풋테니스 2대2 / 1대1" },
  "Stretch thigh": { es: "Estiramiento de muslo", ko: "허벅지 스트레칭", en: "Thigh stretch" },
  Stretching: { es: "Estiramientos", ko: "스트레칭" },
  "The Gauntlet": { es: "El pasillo (The Gauntlet)", ko: "건틀릿" },
  "Triangle Passing": { es: "Pases en triángulo", ko: "삼각 패스", en: "Triangle passing" },
  "Triceps stretch": { es: "Estiramiento de tríceps", ko: "삼두근 스트레칭" },
  "Turning excercises": { es: "Ejercicios de giro", ko: "방향 전환 훈련", en: "Turning exercises" },
};

/** A drill or stretch name from the sheet, in the reader's language. */
export function programItem(text: string, lang: "ko" | "en" | "es"): string {
  const t = ITEM_I18N[text.trim()];
  if (!t) return text;
  return lang === "en" ? (t.en ?? text) : t[lang];
}
