import programData from "@/data/soccer/program.json";

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

// English phase names from the source sheet → Korean labels for display.
export const PHASE_KO: Record<string, string> = {
  "Warming-up": "웜업",
  Coordination: "코디네이션",
  "Passing&Ball Control": "패스 & 볼 컨트롤",
  "Mini Game": "미니 게임",
  "Cool-down & Stretching": "쿨다운 & 스트레칭",
};
