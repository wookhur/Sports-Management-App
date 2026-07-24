// Daily training score — the sports-app analogue of a diet app's meal score.
//
// Each Seoul-calendar day is scored 0–100 from what the athlete actually did:
//
//   훈련량 (volume)       40  minutes logged in the journal vs a 60-min target
//   강도   (intensity)    30  average RPE in the 5–8 sweet spot scores full
//   측정   (measurement)  20  logged a timed Record today (15) + set a PB (+5)
//   꾸준함 (consistency)  10  also trained (journal or record) the day before
//
// The score is always derived live from TrainingSession + Record rows — never
// stored — so retro-editing an entry, or logging a swim time from the existing
// stopwatch, updates the day instantly and the number can never drift.

import "server-only";
import { prisma } from "./db";
import { seoulDayKey } from "./format";

export const PART_MAX = { volume: 40, intensity: 30, measurement: 20, consistency: 10 } as const;
export const VOLUME_TARGET_MIN = 60;
export const OVERTRAIN_MINUTES = 180;

export type TrainingKind = "technique" | "strength" | "cardio" | "match" | "recovery";
export const TRAINING_KINDS: TrainingKind[] = ["technique", "strength", "cardio", "match", "recovery"];

export interface DayScoreParts {
  volume: number;
  intensity: number;
  measurement: number;
  consistency: number;
}

export interface DayScore {
  day: string;
  total: number;
  parts: DayScoreParts;
  minutes: number;
  avgRpe: number | null;
  recordCount: number;
  pbCount: number;
}

export interface SessionView {
  id: string;
  sport: string;
  kind: TrainingKind;
  minutes: number;
  intensity: number;
  notes: string | null;
}

export interface RecordTodayView {
  metricKey: string;
  metricName: string;
  durationMs: number;
  isPb: boolean;
}

export interface JournalOverview {
  today: DayScore;
  yesterdayTotal: number;
  /** Mon-agnostic trailing strip: the last 7 days, oldest first. */
  week: { day: string; dayNum: number; total: number; active: boolean }[];
  sessionsToday: SessionView[];
  recordsToday: RecordTodayView[];
  warnings: { overtraining: boolean; needRest: boolean };
  /** True when the athlete has never logged anything scoreable before today. */
  firstDay: boolean;
}

function scoreVolume(minutes: number): number {
  return Math.min(PART_MAX.volume, Math.round((PART_MAX.volume * minutes) / VOLUME_TARGET_MIN));
}

function scoreIntensity(avgRpe: number | null): number {
  if (avgRpe == null) return 0;
  if (avgRpe >= 5 && avgRpe <= 8) return PART_MAX.intensity; // sweet spot
  if (avgRpe >= 3 && avgRpe < 5) return 20; // too easy to adapt much
  if (avgRpe > 8) return 18; // red-lining: still work, but risky
  return 12; // barely above rest
}

/** Compute the full journal overview for a user (today + trailing week). */
export async function journalOverview(userId: string): Promise<JournalOverview> {
  // The last 9 Seoul days, oldest first. Index 8 is today; the extra lead day
  // (index 0) only exists so the first week-strip day can check "yesterday".
  const days: string[] = [];
  for (let i = 8; i >= 0; i--) {
    days.push(seoulDayKey(new Date(Date.now() - i * 86_400_000)));
  }
  const today = days[days.length - 1];
  const rangeStart = new Date(`${days[0]}T00:00:00+09:00`);

  const [sessions, timedRecords] = await Promise.all([
    prisma.trainingSession.findMany({
      where: { userId, day: { in: days } },
      orderBy: { createdAt: "asc" },
    }),
    // All-time timed records: needed both for PB detection and to know
    // whether pre-range days had activity (consistency / firstDay).
    prisma.record.findMany({
      where: { userId, durationMs: { not: null } },
      orderBy: { createdAt: "asc" },
      select: { metricKey: true, metricName: true, durationMs: true, createdAt: true },
    }),
  ]);

  // Group journal minutes/RPE by day.
  const byDay = new Map<string, { minutes: number; rpeSum: number; count: number }>();
  for (const s of sessions) {
    const cur = byDay.get(s.day) ?? { minutes: 0, rpeSum: 0, count: 0 };
    cur.minutes += s.minutes;
    cur.rpeSum += s.intensity;
    cur.count += 1;
    byDay.set(s.day, cur);
  }

  // Walk records oldest→newest tracking the running best per metric, so each
  // record knows whether it was a PB *at the moment it was swum*. The first
  // record for a metric counts as a PB — a baseline worth celebrating.
  const bests = new Map<string, number>();
  const recDays = new Map<string, { count: number; pbs: number }>();
  const recordsToday: RecordTodayView[] = [];
  let hadAnythingBeforeRange = false;
  for (const r of timedRecords) {
    const day = seoulDayKey(r.createdAt);
    const prevBest = bests.get(r.metricKey);
    const isPb = prevBest == null || r.durationMs! < prevBest;
    if (isPb) bests.set(r.metricKey, r.durationMs!);
    if (day < days[0]) {
      hadAnythingBeforeRange = true;
      continue;
    }
    const cur = recDays.get(day) ?? { count: 0, pbs: 0 };
    cur.count += 1;
    if (isPb) cur.pbs += 1;
    recDays.set(day, cur);
    if (day === today) {
      recordsToday.push({
        metricKey: r.metricKey,
        metricName: r.metricName,
        durationMs: r.durationMs!,
        isPb,
      });
    }
  }

  const activeOn = (day: string) => (byDay.get(day)?.count ?? 0) > 0 || (recDays.get(day)?.count ?? 0) > 0;

  function scoreDay(day: string, prevDay: string | null): DayScore {
    const j = byDay.get(day);
    const r = recDays.get(day);
    const minutes = j?.minutes ?? 0;
    const avgRpe = j && j.count > 0 ? j.rpeSum / j.count : null;
    const recordCount = r?.count ?? 0;
    const pbCount = r?.pbs ?? 0;

    const parts: DayScoreParts = {
      volume: scoreVolume(minutes),
      intensity: scoreIntensity(avgRpe),
      measurement: recordCount > 0 ? 15 + (pbCount > 0 ? 5 : 0) : 0,
      consistency: prevDay && activeOn(prevDay) ? PART_MAX.consistency : 0,
    };
    return {
      day,
      total: parts.volume + parts.intensity + parts.measurement + parts.consistency,
      parts,
      minutes,
      avgRpe,
      recordCount,
      pbCount,
    };
  }

  const week = days.slice(2).map((day, i) => {
    const s = scoreDay(day, days[i + 1]);
    return { day, dayNum: Number(day.slice(-2)), total: s.total, active: activeOn(day) };
  });
  const todayScore = scoreDay(today, days[days.length - 2]);
  const yesterdayScore = scoreDay(days[days.length - 2], days[days.length - 3]);

  // Overtraining: a single huge day or an all-out average.
  const jToday = byDay.get(today);
  const overtraining =
    todayScore.minutes > OVERTRAIN_MINUTES ||
    (todayScore.avgRpe != null && todayScore.avgRpe >= 9 && (jToday?.count ?? 0) > 0);
  // Rest needed: journal work on each of the last 7 days with no recovery-only day.
  const needRest = days.slice(2).every((d) => (byDay.get(d)?.count ?? 0) > 0);

  const anythingInRangeBeforeToday = days.slice(0, -1).some((d) => activeOn(d));
  const firstDay = !hadAnythingBeforeRange && !anythingInRangeBeforeToday;

  const sessionsToday: SessionView[] = sessions
    .filter((s) => s.day === today)
    .map((s) => ({
      id: s.id,
      sport: s.sport,
      kind: (TRAINING_KINDS.includes(s.kind as TrainingKind) ? s.kind : "technique") as TrainingKind,
      minutes: s.minutes,
      intensity: s.intensity,
      notes: s.notes,
    }));

  return {
    today: todayScore,
    yesterdayTotal: yesterdayScore.total,
    week,
    sessionsToday,
    recordsToday,
    warnings: { overtraining, needRest },
    firstDay,
  };
}
