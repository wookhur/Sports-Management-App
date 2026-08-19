import { test, expect } from "@playwright/test";
import { seoulDayKey } from "../src/lib/format";
import {
  sessionLoad,
  dayWindow,
  summarizeLoad,
  monotonyBand,
  ACUTE_DAYS,
  CHRONIC_DAYS,
  MIN_HISTORY_DAYS,
  MONOTONY_FLAG,
  MONOTONY_MAX,
  type SessionInput,
} from "../src/lib/load";

// Pure-function tests — no browser, no database. The load engine drives injury
// -risk flags for coaches, so its edges are worth pinning down precisely.

const TODAY = "2026-07-31";

/** Build `n` days of identical daily load ending today. */
function steady(days: number, minutes: number, intensity: number): SessionInput[] {
  return dayWindow(TODAY, days).map((day) => ({ day, minutes, intensity }));
}

test("session load is minutes × RPE", () => {
  expect(sessionLoad(60, 7)).toBe(420);
  expect(sessionLoad(0, 9)).toBe(0);
  // Nonsense input must not poison the sum.
  expect(sessionLoad(-30, 7)).toBe(0);
  expect(sessionLoad(60, Number.NaN)).toBe(0);
});

test("dayWindow returns an inclusive, ordered range", () => {
  const w = dayWindow(TODAY, 3);
  expect(w).toEqual(["2026-07-29", "2026-07-30", "2026-07-31"]);
  expect(dayWindow(TODAY, CHRONIC_DAYS)).toHaveLength(CHRONIC_DAYS);
});

test("steady training sits at a ratio of about 1.0", () => {
  const s = summarizeLoad(steady(CHRONIC_DAYS, 60, 6), TODAY, 60);
  expect(s.acwr).not.toBeNull();
  expect(s.acwr!).toBeGreaterThan(0.95);
  expect(s.acwr!).toBeLessThan(1.05);
  expect(s.zone).toBe("optimal");
  expect(s.activeDays).toBe(CHRONIC_DAYS);
});

test("a sudden spike is flagged as high", () => {
  // Three quiet weeks, then a very heavy one.
  const quiet = dayWindow(TODAY, CHRONIC_DAYS)
    .slice(0, CHRONIC_DAYS - ACUTE_DAYS)
    .map((day) => ({ day, minutes: 30, intensity: 4 }));
  const heavy = dayWindow(TODAY, ACUTE_DAYS).map((day) => ({ day, minutes: 120, intensity: 9 }));

  const s = summarizeLoad([...quiet, ...heavy], TODAY, 90);
  expect(s.acwr!).toBeGreaterThan(1.5);
  expect(s.zone).toBe("high");
});

test("backing right off reads as detraining", () => {
  const busy = dayWindow(TODAY, CHRONIC_DAYS)
    .slice(0, CHRONIC_DAYS - ACUTE_DAYS)
    .map((day) => ({ day, minutes: 90, intensity: 8 }));
  const s = summarizeLoad(busy, TODAY, 90); // nothing at all in the last 7 days
  expect(s.acute).toBe(0);
  expect(s.zone).toBe("detraining");
});

test("no ratio is published until there is enough history", () => {
  const s = summarizeLoad(steady(5, 60, 7), TODAY, 5);
  expect(s.acwr).toBeNull();
  expect(s.zone).toBe("unknown");
  // The raw weekly number is still useful and must survive.
  expect(s.acute).toBeGreaterThan(0);
});

test("a brand-new athlete produces zeros, not NaN", () => {
  const s = summarizeLoad([], TODAY, 0);
  expect(s.acute).toBe(0);
  expect(s.chronic).toBe(0);
  expect(s.acwr).toBeNull();
  expect(s.activeDays).toBe(0);
  expect(s.daily).toHaveLength(CHRONIC_DAYS);
  expect(s.daily.every((d) => Number.isFinite(d.load))).toBe(true);
});

test("sessions outside the window are ignored", () => {
  const s = summarizeLoad([{ day: "2020-01-01", minutes: 600, intensity: 10 }], TODAY, 999);
  expect(s.acute).toBe(0);
  expect(s.activeDays).toBe(0);
});

test("multiple sessions on one day accumulate", () => {
  const s = summarizeLoad(
    [
      { day: TODAY, minutes: 60, intensity: 5 },
      { day: TODAY, minutes: 30, intensity: 4 },
    ],
    TODAY,
    MIN_HISTORY_DAYS,
  );
  expect(s.daily.at(-1)!.load).toBe(60 * 5 + 30 * 4);
  expect(s.activeDays).toBe(1);
});

test("the week-over-week trend uses the preceding seven days", () => {
  const thisWeek = dayWindow(TODAY, ACUTE_DAYS).map((day) => ({ day, minutes: 60, intensity: 6 }));
  const lastWeek = dayWindow(TODAY, ACUTE_DAYS * 2)
    .slice(0, ACUTE_DAYS)
    .map((day) => ({ day, minutes: 30, intensity: 6 }));
  const s = summarizeLoad([...lastWeek, ...thisWeek], TODAY, 60);
  expect(s.weekTotal).toBe(7 * 360);
  expect(s.prevWeekTotal).toBe(7 * 180);
});

test("day keys are fixed-width, so date maths and string ordering both work", () => {
  // Regression: seoulDayKey used `day: "numeric"`, which dropped the leading
  // zero on the 1st–9th. The resulting "2026-08-3" is not a parseable date
  // string, so dayWindow() threw and the coach dashboard returned 500 for the
  // first nine days of every month.
  for (const iso of ["2026-08-01", "2026-08-09", "2026-08-10", "2026-12-31"]) {
    const key = seoulDayKey(new Date(`${iso}T12:00:00Z`));
    expect(key, iso).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(() => dayWindow(key, 3), key).not.toThrow();
    expect(new Date(`${key}T00:00:00Z`).toISOString(), key).toContain(key);
  }
  // Equal length everywhere means plain string ordering is date ordering.
  expect(seoulDayKey(new Date("2026-08-09T12:00:00Z")) < seoulDayKey(new Date("2026-08-10T12:00:00Z"))).toBe(true);
});

// ---------------------------------------------------------------------------
// Training monotony (Foster). Computed all along but shown nowhere until now,
// so these are the first tests it has ever had — and they pin down the two
// things that were wrong when it surfaced.
// ---------------------------------------------------------------------------

test("training every day at the same load is the most monotonous week there is", () => {
  // Regression: SD is exactly 0 here, and the old code returned null for that,
  // reporting the single most monotonous case as "no data".
  const s = summarizeLoad(steady(CHRONIC_DAYS, 60, 6), TODAY, 60);
  expect(s.monotony).toBe(MONOTONY_MAX);
  expect(s.monotonyBand).toBe("monotonous");
});

test("hard days mixed with rest days read as varied", () => {
  // Three training days in the week, four rest days.
  const week = dayWindow(TODAY, ACUTE_DAYS);
  const sessions: SessionInput[] = [0, 2, 4].map((i) => ({
    day: week[i],
    minutes: 90,
    intensity: 8,
  }));
  const s = summarizeLoad(sessions, TODAY, 60);
  expect(s.monotony!).toBeLessThan(MONOTONY_FLAG);
  expect(s.monotonyBand).toBe("varied");
});

test("monotony describes this week, not the last four", () => {
  // A samey week following a varied month must read as samey: monotony is a
  // weekly statistic, and averaging it across 28 days described neither.
  const month = dayWindow(TODAY, CHRONIC_DAYS);
  const older = month.slice(0, CHRONIC_DAYS - ACUTE_DAYS).filter((_, i) => i % 3 === 0);
  const sessions: SessionInput[] = [
    ...older.map((day) => ({ day, minutes: 120, intensity: 9 })),
    ...month.slice(-ACUTE_DAYS).map((day) => ({ day, minutes: 60, intensity: 6 })),
  ];
  const s = summarizeLoad(sessions, TODAY, 60);
  expect(s.monotonyBand).toBe("monotonous");
});

test("a week with nothing logged has no pattern to report", () => {
  const s = summarizeLoad([], TODAY, 60);
  expect(s.monotony).toBeNull();
  expect(s.monotonyBand).toBe("unknown");
});

test("monotony does not depend on having enough history for a ratio", () => {
  // ACWR needs a baseline; monotony is just this week's shape, so a brand new
  // athlete still gets one.
  const s = summarizeLoad(steady(ACUTE_DAYS, 45, 5), TODAY, 3);
  expect(s.acwr, "not enough history for a ratio").toBeNull();
  expect(s.monotonyBand).not.toBe("unknown");
});

test("the band boundaries are inclusive at the flag point", () => {
  expect(monotonyBand(null)).toBe("unknown");
  expect(monotonyBand(1.49)).toBe("varied");
  expect(monotonyBand(1.5)).toBe("moderate");
  expect(monotonyBand(1.99)).toBe("moderate");
  expect(monotonyBand(MONOTONY_FLAG)).toBe("monotonous");
});
