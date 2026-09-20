import { test, expect } from "@playwright/test";
import { parseMinutes, sessionSpans } from "../src/lib/programTime";
import { soccerProgram } from "../src/lib/soccerProgram";

// The session plan draws a bar showing how a session's time divides. Getting
// that wrong would mislead a coach silently, so the arithmetic is pinned here.

test("durations are read out of the sheet's ragged formatting", () => {
  expect(parseMinutes("10min")).toBe(10);
  expect(parseMinutes("10 min")).toBe(10);
  expect(parseMinutes("40 minutes")).toBe(40);
});

test("anything that isn't a plain figure reads as no figure at all", () => {
  expect(parseMinutes(null)).toBeNull();
  expect(parseMinutes(undefined)).toBeNull();
  expect(parseMinutes("")).toBeNull();
  expect(parseMinutes("as long as it takes")).toBeNull();
  expect(parseMinutes("0 min")).toBeNull();
});

test("shares are of the session total and add up to it", () => {
  const { totalMinutes, spans } = sessionSpans(["10 min", "20 min", "10 min"]);
  expect(totalMinutes).toBe(40);
  expect(spans.map((s) => s.share)).toEqual([0.25, 0.5, 0.25]);
  expect(spans.reduce((n, s) => n + s.share, 0)).toBeCloseTo(1);
});

test("one unreadable duration suppresses the whole bar rather than skewing it", () => {
  // Drawing 4 of 5 phases would overstate every one it could read.
  const { totalMinutes, spans } = sessionSpans(["10 min", "20 min", null]);
  expect(totalMinutes).toBeNull();
  expect(spans.map((s) => s.share)).toEqual([0, 0, 0]);
  // The minutes it *could* read are still available for the rows.
  expect(spans.map((s) => s.minutes)).toEqual([10, 20, null]);
});

test("an empty session totals nothing instead of dividing by zero", () => {
  const { totalMinutes, spans } = sessionSpans([]);
  expect(totalMinutes).toBeNull();
  expect(spans).toEqual([]);
});

test("every shipped soccer session can be totalled", () => {
  // If a future edit to the sheet drops a duration, the bar quietly disappears
  // from that session — this says so out loud instead.
  for (const session of soccerProgram.sessions) {
    const { totalMinutes } = sessionSpans(session.phases.map((p) => p.time));
    expect(totalMinutes, `session "${session.title}"`).not.toBeNull();
    expect(totalMinutes!, `session "${session.title}"`).toBeGreaterThan(0);
  }
});
