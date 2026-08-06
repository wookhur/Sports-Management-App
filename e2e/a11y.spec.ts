import { test, expect } from "@playwright/test";
import { AxeBuilder } from "@axe-core/playwright";
import { login, ATHLETE, COACH } from "./helpers";

// Accessibility regression guard.
//
// Runs axe against the routes people actually spend time on. Scoped to the
// rules that break a page outright for someone using a screen reader or
// keyboard — a control with no accessible name, an input with no label, a
// broken landmark. Colour contrast is checked separately below, because it
// needs a different failure budget.

const CRITICAL_RULES = [
  "aria-allowed-attr",
  "aria-required-attr",
  "aria-roles",
  "aria-valid-attr-value",
  "button-name",
  "duplicate-id-aria",
  "form-field-multiple-labels",
  "frame-title",
  "html-has-lang",
  "image-alt",
  "input-button-name",
  "label",
  "link-name",
  "select-name",
];

const ATHLETE_ROUTES = ["/", "/journal", "/missions", "/records", "/board", "/connections", "/leaderboard", "/training", "/blog", "/profile", "/sports/swimming", "/games/bullseye"];
const COACH_ROUTES = ["/coach", "/coach/report", "/coach/digest"];
const PUBLIC_ROUTES = ["/login", "/signup", "/forgot"];

// axe is not cheap on a large dashboard, and it walks every frame it can
// reach. The digest preview is a deliberately sandboxed iframe holding email
// markup, which axe cannot inject into and which is not app UI anyway.
test.describe.configure({ timeout: 120_000 });

async function violations(page: import("@playwright/test").Page, rules: string[]) {
  const res = await new AxeBuilder({ page }).exclude("iframe").withRules(rules).analyze();
  return res.violations.map((v) => `${v.id} (${v.nodes.length}): ${v.nodes[0]?.html?.slice(0, 90)}`);
}

test("every control on the main athlete routes has an accessible name", async ({ page }) => {
  await login(page, ATHLETE);
  const problems: string[] = [];
  for (const route of ATHLETE_ROUTES) {
    await page.goto(route, { waitUntil: "networkidle" });
    problems.push(...(await violations(page, CRITICAL_RULES)).map((v) => `${route}: ${v}`));
  }
  expect(problems, "accessibility violations").toEqual([]);
});

test("every control on the coach routes has an accessible name", async ({ page }) => {
  await login(page, COACH);
  const problems: string[] = [];
  for (const route of COACH_ROUTES) {
    await page.goto(route, { waitUntil: "networkidle" });
    problems.push(...(await violations(page, CRITICAL_RULES)).map((v) => `${route}: ${v}`));
  }
  expect(problems, "accessibility violations").toEqual([]);
});

test("signed-out pages are accessible too", async ({ page }) => {
  const problems: string[] = [];
  for (const route of PUBLIC_ROUTES) {
    await page.goto(route, { waitUntil: "networkidle" });
    problems.push(...(await violations(page, CRITICAL_RULES)).map((v) => `${route}: ${v}`));
  }
  expect(problems, "accessibility violations").toEqual([]);
});

async function contrastProblems(page: import("@playwright/test").Page, routes: string[]) {
  const problems: string[] = [];
  for (const route of routes) {
    await page.goto(route, { waitUntil: "networkidle" });
    const res = await new AxeBuilder({ page }).exclude("iframe").withRules(["color-contrast"]).analyze();
    for (const v of res.violations)
      for (const n of v.nodes) {
        const d = n.any?.[0]?.data as { fgColor?: string; bgColor?: string } | undefined;
        problems.push(`${route}: ${d?.fgColor} on ${d?.bgColor} — ${n.html.slice(0, 70)}`);
      }
  }
  return problems;
}

test("text meets AA contrast everywhere an athlete goes", async ({ page }) => {
  await login(page, ATHLETE);
  expect(await contrastProblems(page, ATHLETE_ROUTES), "contrast violations").toEqual([]);
});

// The coach routes had the accessible-name check but not this one, which is
// backwards: the squad table, the triage list and the report are the densest
// colour-coded screens in the app, and the ones an evaluator looks at longest.
test("text meets AA contrast on the coach routes too", async ({ page }) => {
  await login(page, COACH);
  expect(await contrastProblems(page, COACH_ROUTES), "contrast violations").toEqual([]);
});
