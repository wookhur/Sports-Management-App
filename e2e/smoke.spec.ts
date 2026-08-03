import { test, expect } from "@playwright/test";
import { login, failOnPageErrors, ATHLETE, COACH } from "./helpers";

// Every authenticated route must render for both roles without errors. This is
// the net that catches a page dying from a bad query or a renamed field.
const ROUTES = [
  "/",
  "/journal",
  "/missions",
  "/board",
  "/board/new",
  "/games/bullseye",
  "/training",
  "/stars",
  "/leaderboard",
  "/blog",
  "/blog/new",
  "/records",
  "/profile",
  "/search?q=phelps",
  "/sports/swimming",
  "/sports/swimming/athletes",
  "/sports/swimming/workouts",
  "/sports/soccer/program",
  "/sports/soccer/drills",
];

for (const who of [
  { name: "athlete", creds: ATHLETE },
  { name: "coach", creds: COACH },
]) {
  test(`all routes render for ${who.name}`, async ({ page }) => {
    await login(page, who.creds);

    // Collect per route so a failure names the page that broke.
    const problems: string[] = [];
    for (const route of ROUTES) {
      const errors: string[] = [];
      const onConsole = (m: { type: () => string; text: () => string }) => {
        if (m.type() === "error") errors.push(m.text());
      };
      page.on("console", onConsole);
      page.on("pageerror", (e) => errors.push(String(e)));

      const res = await page.goto(route, { waitUntil: "networkidle" });
      if ((res?.status() ?? 0) >= 400) problems.push(`${route}: status ${res?.status()}`);

      const body = (await page.textContent("body")) ?? "";
      if (/Application error|Internal Server Error/i.test(body)) problems.push(`${route}: app error`);

      // Give hydration a beat so mismatches surface on the right route.
      await page.waitForTimeout(250);
      page.off("console", onConsole);
      for (const e of errors) problems.push(`${route}: ${e.slice(0, 140)}`);
    }
    expect(problems, "page problems").toEqual([]);
  });
}

test("password reset pages render for logged-out visitors", async ({ page }) => {
  for (const route of ["/forgot", "/reset/not-a-real-token"]) {
    const res = await page.goto(route, { waitUntil: "domcontentloaded" });
    expect(res?.status(), `${route} status`).toBeLessThan(400);
  }
  // A dead link must say so rather than offering a password form.
  await expect(page.locator('input[type="password"]')).toHaveCount(0);
});

test("landing page shows for logged-out visitors", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("body")).toContainText(/무료로 시작하기|Start free|Empieza gratis/);
  await expect(page.locator('a[href="/signup"]').first()).toBeVisible();
});

test("coach-only areas load for a coach", async ({ page }) => {
  await login(page, COACH);
  for (const route of ["/coach", "/coach/report", "/coach/report?weeks=12", "/coach/digest", "/admin"]) {
    const res = await page.goto(route, { waitUntil: "domcontentloaded" });
    expect(res?.status(), `${route} status`).toBeLessThan(400);
  }
});
