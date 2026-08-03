import { test, expect } from "@playwright/test";
import { firstRunState, nextStep, type FirstRunSignals } from "../src/lib/firstRun";
import { t } from "../src/lib/i18n";

const NOTHING: FirstRunSignals = {
  hasTrainingSession: false,
  hasRecord: false,
  hasAcceptedLink: false,
  hasLeftFeedback: false,
};

test("a brand-new athlete sees every step outstanding", () => {
  const state = firstRunState("ATHLETE", NOTHING);
  expect(state.show).toBe(true);
  expect(state.doneCount).toBe(0);
  expect(state.items.every((i) => !i.done)).toBe(true);
});

test("steps tick off from real data, not from having seen the card", () => {
  const state = firstRunState("ATHLETE", { ...NOTHING, hasTrainingSession: true });
  expect(state.doneCount).toBe(1);
  expect(state.items.find((i) => i.step === "logTraining")!.done).toBe(true);
  expect(state.show).toBe(true);
});

test("the card removes itself once everything is done", () => {
  const done = firstRunState("ATHLETE", {
    hasTrainingSession: true,
    hasRecord: true,
    hasAcceptedLink: true,
    hasLeftFeedback: true,
  });
  expect(done.doneCount).toBe(done.items.length);
  expect(done.show).toBe(false);
  expect(nextStep(done)).toBeNull();
});

test("a coach gets coach-shaped steps, not the athlete's", () => {
  const coach = firstRunState("COACH", NOTHING);
  const steps = coach.items.map((i) => i.step);
  expect(steps).toContain("connectAthlete");
  expect(steps).toContain("feedback");
  expect(steps).not.toContain("connectCoach");
});

test("the next step is the first outstanding one, in order", () => {
  const state = firstRunState("ATHLETE", { ...NOTHING, hasTrainingSession: true });
  expect(nextStep(state)!.step).toBe("measure");
});

test("every step has copy and a destination in every language", () => {
  for (const role of ["ATHLETE", "COACH"] as const) {
    for (const item of firstRunState(role, NOTHING).items) {
      expect(item.href.startsWith("/"), item.step).toBe(true);
      for (const lang of ["ko", "en", "es"] as const) {
        const copy = t(lang).firstRun.step[item.step];
        expect(copy?.title, `${lang}/${item.step}`).toBeTruthy();
        expect(copy?.body, `${lang}/${item.step}`).toBeTruthy();
      }
    }
  }
});
