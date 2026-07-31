import { test, expect } from "@playwright/test";
import {
  pbSignals,
  triageSquad,
  DISENGAGED_DAYS,
  PLATEAU_DAYS,
  PLATEAU_MIN_SESSIONS,
  BREAKTHROUGH_DAYS,
  type PbInput,
} from "../src/lib/triage";
import type { RosterRow } from "../src/lib/roster";
import type { LoadZone } from "../src/lib/load";

// Triage is the one screen a coach acts on, so a wrong bucket is a wrong
// conversation with a teenager. The thresholds are pinned here.

const TODAY = "2026-07-31";

function daysAgo(n: number): string {
  return new Date(Date.parse(`${TODAY}T00:00:00Z`) - n * 86_400_000).toISOString().slice(0, 10);
}

function row(over: Partial<RosterRow> & { athleteId: string }): RosterRow {
  return {
    name: over.athleteId,
    cells: [],
    zone: "optimal" as LoadZone,
    acwr: 1.0,
    weekLoad: 500,
    daysSinceActive: 0,
    currentStreak: 0,
    sessions14: 8,
    ...over,
  };
}

function rec(userId: string, ms: number, day: string, metricKey = "freestyle_50m"): PbInput {
  return { userId, metricKey, durationMs: ms, day };
}

test("a load spike is flagged as injury risk before anything else", () => {
  const r = triageSquad([row({ athleteId: "a", zone: "high", acwr: 1.9, daysSinceActive: 9 })], new Map());
  expect(r.items).toHaveLength(1);
  expect(r.items[0].flag).toBe("injuryRisk");
  expect(r.items[0].value).toBe(1.9);
  expect(r.actionable).toBe(1);
});

test("silence is flagged only once it crosses the threshold", () => {
  const quiet = triageSquad([row({ athleteId: "a", daysSinceActive: DISENGAGED_DAYS })], new Map());
  expect(quiet.items[0].flag).toBe("disengaged");
  expect(quiet.items[0].value).toBe(DISENGAGED_DAYS);

  const fine = triageSquad([row({ athleteId: "b", daysSinceActive: DISENGAGED_DAYS - 1 })], new Map());
  expect(fine.items).toHaveLength(0);
});

test("an athlete who never logged anything is flagged, not skipped", () => {
  const r = triageSquad([row({ athleteId: "ghost", daysSinceActive: null, zone: "unknown", acwr: null })], new Map());
  expect(r.items[0].flag).toBe("disengaged");
  expect(r.items[0].value).toBeNull();
});

test("a fresh personal best is a breakthrough", () => {
  const signals = pbSignals([rec("a", 30_000, daysAgo(90)), rec("a", 29_000, daysAgo(2))], TODAY);
  const r = triageSquad([row({ athleteId: "a" })], signals);
  expect(r.items[0].flag).toBe("breakthrough");
  expect(r.items[0].value).toBe(1);
  expect(r.actionable).toBe(0); // good news is not a to-do
  expect(r.counts.breakthrough).toBe(1);
});

test("a PB just outside the window is no longer breakthrough news", () => {
  const signals = pbSignals([rec("a", 30_000, daysAgo(BREAKTHROUGH_DAYS))], TODAY);
  expect(signals.get("a")!.recentPbs).toBe(0);
  expect(triageSquad([row({ athleteId: "a" })], signals).items).toHaveLength(0);
});

test("steady training with a stale PB is a plateau", () => {
  const signals = pbSignals([rec("a", 30_000, daysAgo(PLATEAU_DAYS))], TODAY);
  const r = triageSquad([row({ athleteId: "a", sessions14: PLATEAU_MIN_SESSIONS })], signals);
  expect(r.items[0].flag).toBe("plateau");
  expect(r.items[0].value).toBe(PLATEAU_DAYS);
});

test("barely training is not a plateau — there is nothing to plateau on", () => {
  const signals = pbSignals([rec("a", 30_000, daysAgo(PLATEAU_DAYS + 10))], TODAY);
  const r = triageSquad([row({ athleteId: "a", sessions14: PLATEAU_MIN_SESSIONS - 1 })], signals);
  expect(r.items).toHaveLength(0);
});

test("never having set a PB is not a plateau", () => {
  const r = triageSquad([row({ athleteId: "a", sessions14: 14 })], new Map());
  expect(r.items).toHaveLength(0);
});

test("only genuine improvements count as personal bests", () => {
  const signals = pbSignals(
    [
      rec("a", 30_000, daysAgo(20)),
      rec("a", 31_000, daysAgo(3)), // slower — not a PB
      rec("a", 30_000, daysAgo(2)), // equal — not a PB either
    ],
    TODAY,
  );
  expect(signals.get("a")!.recentPbs).toBe(0);
  expect(signals.get("a")!.daysSincePb).toBe(20);
});

test("personal bests are tracked per metric and per athlete", () => {
  const signals = pbSignals(
    [
      rec("a", 30_000, daysAgo(30), "freestyle_50m"),
      rec("a", 60_000, daysAgo(1), "freestyle_100m"), // first time at a new metric = a PB
      rec("b", 30_000, daysAgo(1), "freestyle_50m"), // different athlete, own baseline
    ],
    TODAY,
  );
  expect(signals.get("a")!.recentPbs).toBe(1);
  expect(signals.get("b")!.recentPbs).toBe(1);
});

test("out-of-order input does not change the verdict", () => {
  const forward = pbSignals([rec("a", 31_000, daysAgo(10)), rec("a", 30_000, daysAgo(2))], TODAY);
  const reversed = pbSignals([rec("a", 30_000, daysAgo(2)), rec("a", 31_000, daysAgo(10))], TODAY);
  expect(reversed.get("a")).toEqual(forward.get("a"));
});

test("the list reads worst-first, then most severe within a bucket", () => {
  const signals = pbSignals([rec("pb", 30_000, daysAgo(1))], TODAY);
  const r = triageSquad(
    [
      row({ athleteId: "pb", name: "Breakthrough" }),
      row({ athleteId: "quiet", name: "Quiet", daysSinceActive: 6 }),
      row({ athleteId: "gone", name: "Gone", daysSinceActive: 20 }),
      row({ athleteId: "spike", name: "Spike", zone: "high", acwr: 1.7 }),
    ],
    signals,
  );
  expect(r.items.map((i) => i.name)).toEqual(["Spike", "Gone", "Quiet", "Breakthrough"]);
  expect(r.actionable).toBe(3);
});

test("a healthy squad produces an empty list", () => {
  const r = triageSquad([row({ athleteId: "a" }), row({ athleteId: "b" })], new Map());
  expect(r.items).toEqual([]);
  expect(r.actionable).toBe(0);
  expect(r.counts).toEqual({ injuryRisk: 0, disengaged: 0, plateau: 0, breakthrough: 0 });
});
