import "server-only";
import indexData from "@/data/swimming/index.json";
import videosData from "@/data/swimming/videos.json";

// Reference swim-workout database (1,440 workouts). This is static, read-only
// coaching content shipped as committed JSON — user data still lives in the DB.
// The heavy full-detail file (workouts.json) is imported lazily so it only
// loads on the workout-detail route, keeping the list route light.

export interface SwimIndexRow {
  id: string;
  stroke: string;
  base: number;
  level: string;
  no: string;
  targetTime: string;
  totalDistanceM: number;
}

export interface SwimPhase {
  phase: string;
  video: string;
  set: string;
  distanceM: number;
  effort: string;
  howTo?: string;
  skills?: string;
  source?: string;
}

export interface SwimWorkout {
  id: string;
  stroke: string;
  base: number;
  level: string;
  no: string;
  phases: SwimPhase[];
}

export interface SwimVideo {
  stroke: string;
  source: string;
  howTo: string;
  skills: string;
  url: string;
}

const INDEX = indexData as SwimIndexRow[];
const VIDEOS = videosData as Record<string, SwimVideo>;

// Distinct filter values, in a sensible display order.
export const STROKES = ["Freestyle", "Backstroke", "Breaststroke", "Butterfly"] as const;
export const BASES = [25, 50, 75, 100] as const;
export const LEVELS = ["Beginner", "Intermediate", "Advanced"] as const;

export const STROKE_KO: Record<string, string> = {
  Freestyle: "자유형",
  Backstroke: "배영",
  Breaststroke: "평영",
  Butterfly: "접영",
};
export const LEVEL_KO: Record<string, string> = {
  Beginner: "초급",
  Intermediate: "중급",
  Advanced: "고급",
};

export interface WorkoutFilter {
  stroke?: string;
  base?: number;
  level?: string;
}

export function filterWorkouts(f: WorkoutFilter): SwimIndexRow[] {
  return INDEX.filter(
    (w) =>
      (!f.stroke || w.stroke === f.stroke) &&
      (!f.base || w.base === f.base) &&
      (!f.level || w.level === f.level)
  );
}

export function getVideo(name: string): (SwimVideo & { name: string }) | null {
  const v = VIDEOS[name];
  return v ? { name, ...v } : null;
}

export function getVideoCount(): number {
  return Object.keys(VIDEOS).length;
}

export function getWorkoutCount(): number {
  return INDEX.length;
}

export function searchWorkouts(query: string, limit = 8): SwimIndexRow[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return INDEX.filter((w) => {
    const hay = [
      w.id,
      w.stroke,
      STROKE_KO[w.stroke],
      w.level,
      LEVEL_KO[w.level],
      `${w.base}m`,
    ]
      .join(" ")
      .toLowerCase();
    return hay.includes(q);
  }).slice(0, limit);
}

// Lazy: only the detail route pulls in the 1MB full-workout file.
export async function getWorkout(id: string): Promise<SwimWorkout | null> {
  const mod = await import("@/data/swimming/workouts.json");
  const all = (mod.default ?? mod) as unknown as Record<string, SwimWorkout>;
  return all[id] ?? null;
}
