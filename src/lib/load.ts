// Training-load engine.
//
// Sessions already carry the two numbers this needs — duration and RPE — so
// load comes for free from what athletes log. The maths follows the widely
// used session-RPE (Foster) method:
//
//   session load = minutes × RPE
//   acute        = total load over the last 7 days
//   chronic      = average 7-day load across the last 28 days
//   ACWR         = acute / chronic
//
// ACWR is a coaching heuristic, not a medical instrument. A high ratio means
// "this athlete ramped up quickly — look at them", never "this athlete is
// injured". The UI must phrase it that way.
//
// Deliberately pure and free of DB/server imports so it can be unit-tested.

export interface SessionInput {
  /** YYYY-MM-DD in the athlete's local (Seoul) calendar. */
  day: string;
  minutes: number;
  /** RPE 1–10. */
  intensity: number;
}

export const ACUTE_DAYS = 7;
export const CHRONIC_DAYS = 28;
/** Below this many days of history the chronic baseline isn't meaningful yet. */
export const MIN_HISTORY_DAYS = 14;

export type LoadZone = "detraining" | "optimal" | "caution" | "high" | "unknown";

export interface LoadSummary {
  /** Load per day over the chronic window, oldest → newest (zeros included). */
  daily: { day: string; load: number }[];
  acute: number; // total load, last 7 days
  chronic: number; // average 7-day load across the last 28 days
  acwr: number | null; // null when there isn't enough history yet
  zone: LoadZone;
  /** Distinct days with any load, within the chronic window. */
  activeDays: number;
  /** Variability of daily load (mean / SD). High monotony = same load daily. */
  monotony: number | null;
  weekTotal: number; // = acute
  prevWeekTotal: number; // the 7 days before that, for a trend arrow
}

export function sessionLoad(minutes: number, intensity: number): number {
  if (!Number.isFinite(minutes) || !Number.isFinite(intensity)) return 0;
  return Math.max(0, minutes) * Math.max(0, intensity);
}

/** The last `count` day-keys ending at `endDay`, oldest first. */
export function dayWindow(endDay: string, count: number): string[] {
  const end = new Date(`${endDay}T00:00:00Z`);
  const days: string[] = [];
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(end);
    d.setUTCDate(end.getUTCDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
}

function zoneFor(acwr: number | null): LoadZone {
  if (acwr == null) return "unknown";
  if (acwr < 0.8) return "detraining";
  if (acwr <= 1.3) return "optimal";
  if (acwr <= 1.5) return "caution";
  return "high";
}

function stdDev(values: number[]): number {
  if (values.length === 0) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((a, b) => a + (b - mean) ** 2, 0) / values.length;
  return Math.sqrt(variance);
}

/**
 * Summarise an athlete's load as of `today`.
 * `historyDays` is how long they've been logging — used to decide whether the
 * chronic baseline is trustworthy enough to publish a ratio.
 */
export function summarizeLoad(
  sessions: SessionInput[],
  today: string,
  historyDays: number,
): LoadSummary {
  const window = dayWindow(today, CHRONIC_DAYS);
  const byDay = new Map<string, number>(window.map((d) => [d, 0]));

  for (const s of sessions) {
    if (!byDay.has(s.day)) continue;
    byDay.set(s.day, (byDay.get(s.day) ?? 0) + sessionLoad(s.minutes, s.intensity));
  }

  const daily = window.map((day) => ({ day, load: byDay.get(day) ?? 0 }));
  const loads = daily.map((d) => d.load);

  const acute = loads.slice(-ACUTE_DAYS).reduce((a, b) => a + b, 0);
  const prevWeekTotal = loads.slice(-ACUTE_DAYS * 2, -ACUTE_DAYS).reduce((a, b) => a + b, 0);
  const chronicTotal = loads.reduce((a, b) => a + b, 0);
  // Chronic is expressed on the same scale as acute: an average week.
  const chronic = chronicTotal / (CHRONIC_DAYS / ACUTE_DAYS);

  const enoughHistory = historyDays >= MIN_HISTORY_DAYS && chronic > 0;
  const acwr = enoughHistory ? acute / chronic : null;

  const activeDays = loads.filter((l) => l > 0).length;
  const sd = stdDev(loads);
  const mean = chronicTotal / CHRONIC_DAYS;
  const monotony = sd > 0 ? mean / sd : null;

  return {
    daily,
    acute,
    chronic,
    acwr: acwr == null ? null : Math.round(acwr * 100) / 100,
    zone: zoneFor(acwr),
    activeDays,
    monotony: monotony == null ? null : Math.round(monotony * 100) / 100,
    weekTotal: acute,
    prevWeekTotal,
  };
}
