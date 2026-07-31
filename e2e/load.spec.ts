import { test, expect } from "@playwright/test";
import {
  sessionLoad,
  dayWindow,
  summarizeLoad,
  ACUTE_DAYS,
  CHRONIC_DAYS,
  MIN_HISTORY_DAYS,
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
