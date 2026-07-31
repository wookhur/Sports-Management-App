import { test, expect } from "@playwright/test";
import { shapeRoster, cellLevel, HEATMAP_DAYS } from "../src/lib/roster";
import { summarizeLoad, dayWindow, CHRONIC_DAYS, type LoadSummary } from "../src/lib/load";

// The roster decides which athlete a coach looks at first, so the ordering and
// the "days since active" maths are worth pinning down.

const TODAY = "2026-07-31";

function athlete(id: string, name = id, streak = 0) {
  return { id, name, currentStreak: streak };
}

/** A load summary built from a constant daily load over `days` days. */
function loadFor(days: number, minutes: number, intensity: number): LoadSummary {
  const sessions = dayWindow(TODAY, days).map((day) => ({ day, minutes, intensity }));
  return summarizeLoad(sessions, TODAY, 90);
}

function spikeLoad(): LoadSummary {
  const quiet = dayWindow(TODAY, CHRONIC_DAYS)
    .slice(0, CHRONIC_DAYS - 7)
    .map((day) => ({ day, minutes: 20, intensity: 3 }));
  const heavy = dayWindow(TODAY, 7).map((day) => ({ day, minutes: 120, intensity: 10 }));
  return summarizeLoad([...quiet, ...heavy], TODAY, 90);
}

test("cell shading scales against the squad's busiest day", () => {
  expect(cellLevel(0, 100)).toBe(0);
  expect(cellLevel(10, 100)).toBe(1);
  expect(cellLevel(40, 100)).toBe(2);
  expect(cellLevel(70, 100)).toBe(3);
  expect(cellLevel(100, 100)).toBe(4);
  // A squad with no load at all must not divide by zero.
  expect(cellLevel(0, 0)).toBe(0);
});

test("every row gets exactly the heatmap window", () => {
  const r = shapeRoster([athlete("a")], new Map([["a", loadFor(CHRONIC_DAYS, 60, 6)]]), new Map([["a", TODAY]]), TODAY);
  expect(r.days).toHaveLength(HEATMAP_DAYS);
  expect(r.rows[0].cells).toHaveLength(HEATMAP_DAYS);
  expect(r.rows[0].cells.at(-1)!.day).toBe(TODAY);
});

test("athletes needing attention sort above steady ones", () => {
  const roster = shapeRoster(
    [athlete("steady", "Steady"), athlete("spiking", "Spiking"), athlete("missing", "Missing")],
    new Map([
      ["steady", loadFor(CHRONIC_DAYS, 60, 6)],
      ["spiking", spikeLoad()],
      ["missing", loadFor(CHRONIC_DAYS, 60, 6)],
    ]),
    new Map([
      ["steady", TODAY],
      ["spiking", TODAY],
      ["missing", "2026-07-10"], // three weeks quiet
    ]),
    TODAY,
  );

  const order = roster.rows.map((r) => r.name);
  expect(order.indexOf("Spiking")).toBeLessThan(order.indexOf("Steady"));
  expect(order.indexOf("Missing")).toBeLessThan(order.indexOf("Steady"));
  expect(roster.rows.find((r) => r.name === "Spiking")!.zone).toBe("high");
});

test("days since active is computed from the last logged day", () => {
  const r = shapeRoster(
    [athlete("a"), athlete("b"), athlete("c")],
    new Map(),
    new Map([
      ["a", TODAY],
      ["b", "2026-07-28"],
    ]),
    TODAY,
  );
  const by = Object.fromEntries(r.rows.map((x) => [x.athleteId, x]));
  expect(by.a.daysSinceActive).toBe(0);
  expect(by.b.daysSinceActive).toBe(3);
  expect(by.c.daysSinceActive).toBeNull(); // never logged
});

test("an athlete with no load data still renders a full empty row", () => {
  const r = shapeRoster([athlete("ghost", "Ghost")], new Map(), new Map(), TODAY);
  const row = r.rows[0];
  expect(row.zone).toBe("unknown");
  expect(row.acwr).toBeNull();
  expect(row.weekLoad).toBe(0);
  expect(row.sessions14).toBe(0);
  expect(row.cells.every((c) => c.level === 0)).toBe(true);
  expect(r.peak).toBe(0);
});

test("an empty squad produces no rows but a valid window", () => {
  const r = shapeRoster([], new Map(), new Map(), TODAY);
  expect(r.rows).toEqual([]);
  expect(r.days).toHaveLength(HEATMAP_DAYS);
});
