import { test, expect } from "@playwright/test";
import { buildReport, LOAD_JUMP_RATIO, INACTIVE_DAYS, type ReportSession } from "../src/lib/report";
import type { PbInput } from "../src/lib/triage";
import { formatDayKey } from "../src/lib/format";

// The report is the one artefact that leaves the app and gets read by people
// with no account, so wrong arithmetic here is wrong information given to a
// parent. Every number on the page is pinned.

const TODAY = "2026-07-31";
const WEEKS = 4;

function daysAgo(n: number): string {
  return new Date(Date.parse(`${TODAY}T00:00:00Z`) - n * 86_400_000).toISOString().slice(0, 10);
}

function sess(userId: string, ago: number, minutes = 60, intensity = 6): ReportSession {
  return { userId, day: daysAgo(ago), minutes, intensity };
}

function rec(userId: string, ms: number, ago: number, metricKey = "freestyle_50m"): PbInput {
  return { userId, metricKey, metricName: "자유형 50m", durationMs: ms, day: daysAgo(ago) };
}

const ANA = [{ id: "a", name: "Ana" }];

test("the period is exactly the requested number of weeks", () => {
  const r = buildReport(ANA, [], [], new Map(), TODAY, WEEKS);
  expect(r.period.days).toBe(28);
  expect(r.period.to).toBe(TODAY);
  expect(r.period.from).toBe(daysAgo(27));
});

test("sessions outside the period are excluded from every total", () => {
  const r = buildReport(
    ANA,
    [sess("a", 3), sess("a", 10), sess("a", 40)], // the 40-day-old one is outside
    [],
    new Map([["a", daysAgo(3)]]),
    TODAY,
    WEEKS,
  );
  expect(r.totals.sessions).toBe(2);
  expect(r.rows[0].sessions).toBe(2);
  expect(r.rows[0].minutes).toBe(120);
});

test("two sessions on one day count once toward attendance", () => {
  const r = buildReport(
    ANA,
    [sess("a", 3, 60), sess("a", 3, 30)],
    [],
    new Map([["a", daysAgo(3)]]),
    TODAY,
    WEEKS,
  );
  expect(r.rows[0].sessions).toBe(2);
  expect(r.rows[0].activeDays).toBe(1);
  expect(r.rows[0].minutes).toBe(90);
  expect(r.rows[0].attendance).toBeCloseTo(1 / 28, 3);
});

test("average effort is the mean RPE across sessions", () => {
  const r = buildReport(ANA, [sess("a", 1, 60, 4), sess("a", 2, 60, 8)], [], new Map(), TODAY, WEEKS);
  expect(r.rows[0].avgRpe).toBe(6);
});

test("an athlete with no sessions still appears, with nulls not zeros for effort", () => {
  const r = buildReport(ANA, [], [], new Map(), TODAY, WEEKS);
  expect(r.rows).toHaveLength(1);
  expect(r.rows[0].sessions).toBe(0);
  expect(r.rows[0].avgRpe).toBeNull();
  expect(r.rows[0].daysSinceActive).toBeNull();
  expect(r.totals.activeAthletes).toBe(0);
});

test("a personal best only counts if it beat everything before the period too", () => {
  const r = buildReport(
    ANA,
    [],
    [
      rec("a", 29_000, 60), // set before the period — a faster benchmark
      rec("a", 30_000, 5), // slower than the old best, so not a PB
    ],
    new Map(),
    TODAY,
    WEEKS,
  );
  expect(r.totals.pbs).toBe(0);
  expect(r.rows[0].pbs).toBe(0);
  expect(r.highlights).toEqual([]);
});

test("a genuine improvement inside the period becomes a highlight", () => {
  const r = buildReport(ANA, [], [rec("a", 31_000, 60), rec("a", 29_000, 5)], new Map(), TODAY, WEEKS);
  expect(r.totals.pbs).toBe(1);
  expect(r.rows[0].pbs).toBe(1);
  expect(r.highlights[0]).toMatchObject({ name: "Ana", durationMs: 29_000, day: daysAgo(5) });
});

test("highlights read newest-first", () => {
  const r = buildReport(
    ANA,
    [],
    [rec("a", 31_000, 20), rec("a", 30_000, 10), rec("a", 29_000, 2)],
    new Map(),
    TODAY,
    WEEKS,
  );
  expect(r.highlights.map((h) => h.day)).toEqual([daysAgo(2), daysAgo(10), daysAgo(20)]);
});

test("a sharp second-half increase is observed, without calling it a risk", () => {
  const light = [1, 2, 3].map((d) => sess("a", d + 20, 30, 3)); // first half
  const heavy = [1, 2, 3, 4].map((d) => sess("a", d, 120, 9)); // second half
  const r = buildReport(ANA, [...light, ...heavy], [], new Map([["a", daysAgo(1)]]), TODAY, WEEKS);
  expect(r.watch).toHaveLength(1);
  expect(r.watch[0].kind).toBe("loadJump");
  expect(r.watch[0].value!).toBeGreaterThanOrEqual(LOAD_JUMP_RATIO);
});

test("a steady athlete is not flagged at all", () => {
  const steady = [2, 6, 10, 14, 18, 22, 26].map((d) => sess("a", d));
  const r = buildReport(ANA, steady, [], new Map([["a", daysAgo(2)]]), TODAY, WEEKS);
  expect(r.watch).toEqual([]);
});

test("a long gap is measured from the real last session, not the period", () => {
  // No sessions inside the 4-week window; the last one was 60 days ago. The
  // report must say "60 days", not "never trained".
  const r = buildReport(ANA, [], [], new Map([["a", daysAgo(60)]]), TODAY, WEEKS);
  expect(r.rows[0].daysSinceActive).toBe(60);
  expect(r.watch[0]).toMatchObject({ kind: "inactive", value: 60 });
  expect(r.watch[0].value!).toBeGreaterThanOrEqual(INACTIVE_DAYS);
});

test("an athlete who never trained is flagged with no day count", () => {
  const r = buildReport(ANA, [], [], new Map(), TODAY, WEEKS);
  expect(r.watch[0]).toMatchObject({ kind: "inactive", value: null });
});

test("squad totals aggregate across athletes and attendance is a mean", () => {
  const squad = [
    { id: "a", name: "Ana" },
    { id: "b", name: "Ben" },
  ];
  const r = buildReport(
    squad,
    [sess("a", 1), sess("a", 2), sess("b", 1)],
    [],
    new Map([
      ["a", daysAgo(1)],
      ["b", daysAgo(1)],
    ]),
    TODAY,
    WEEKS,
  );
  expect(r.squadSize).toBe(2);
  expect(r.totals.sessions).toBe(3);
  expect(r.totals.minutes).toBe(180);
  expect(r.totals.activeAthletes).toBe(2);
  expect(r.totals.attendance).toBeCloseTo((2 / 28 + 1 / 28) / 2, 3);
});

test("the roster is alphabetical, never ranked by output", () => {
  const squad = [
    { id: "z", name: "Zoe" },
    { id: "a", name: "Ana" },
  ];
  // Zoe trains far more; she must still come second.
  const r = buildReport(squad, [sess("z", 1), sess("z", 2), sess("a", 1)], [], new Map(), TODAY, WEEKS);
  expect(r.rows.map((x) => x.name)).toEqual(["Ana", "Zoe"]);
});

test("a coach with no athletes produces an empty but valid report", () => {
  const r = buildReport([], [], [], new Map(), TODAY, WEEKS);
  expect(r.squadSize).toBe(0);
  expect(r.rows).toEqual([]);
  expect(r.totals.attendance).toBe(0);
  expect(r.period.days).toBe(28);
});

test("day keys format without drifting a day in any language", () => {
  expect(formatDayKey("2026-07-31", "ko")).toBe("2026년 7월 31일");
  expect(formatDayKey("2026-07-31", "en")).toBe("Jul 31, 2026");
  expect(formatDayKey("2026-01-01", "es")).toBe("1 ene 2026");
});
