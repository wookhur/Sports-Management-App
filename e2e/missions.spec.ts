import { test, expect } from "@playwright/test";
import { login, failOnPageErrors, api, resetPet } from "./helpers";

// Regression guard for a real outage: the care list and mission tier are
// derived from pet growth on the server, but the hub kept a client-side copy.
// Once growth crossed a care window the buttons still sent the old action, the
// API rejected it with 400, growth stalled and the egg could never hatch.
// These tests drive the flow far enough past that boundary to catch it again.

test("caring repeatedly grows the pet across care windows and hatches it", async ({ page }) => {
  // This test hatches the pet, and the next one depends on it having done so.
  // Put the account back on a fresh egg first: without this the pair passes
  // once against a newly seeded database and fails on every run after that.
  await resetPet();
  const errors = failOnPageErrors(page);
  const rejected: number[] = [];
  page.on("response", (r) => {
    if (r.url().includes("/api/pet/care") && r.status() >= 400) rejected.push(r.status());
  });

  await login(page);
  await page.goto("/missions");

  // The fixture starts the athlete on a fresh egg with beans to spend.
  await expect(page.locator("main")).toContainText(/알|Egg|Huevo/);

  const progress = async () =>
    Number(((await page.locator("main").innerText()).match(/(\d+)\s*(?:to hatch|para eclosionar)|부화까지\s*(\d+)/) ?? [])
      .slice(1)
      .find((v) => v != null) ?? NaN);

  const first = await progress();
  expect(Number.isNaN(first), "hatch countdown should be visible").toBe(false);

  // Care until it hatches or we run out of affordable actions.
  for (let i = 0; i < 16; i++) {
    const btn = page.locator("main button:not([disabled])", { hasText: /🌱/ }).first();
    if ((await btn.count()) === 0) break;
    await btn.click();
    await page.waitForTimeout(500);
    if (/아기 새|Baby bird|Pajarito/.test(await page.locator("main").innerText())) break;
  }

  // The whole point: no care request may be rejected mid-session.
  expect(rejected, "care calls must not be rejected").toEqual([]);
  await expect(page.locator("main"), "egg should have hatched").toContainText(
    /아기 새|Baby bird|Pajarito/,
  );
  expect(errors(), "console errors").toEqual([]);
});

test("hatching swaps in bird care actions", async ({ page }) => {
  await login(page);
  await page.goto("/missions");
  // Runs after the hatch test, so the pet is a bird by now.
  await expect(page.locator("main")).toContainText(/먹이 주기|Feed the bird|Dale de comer/);
});

test("an unknown care action is rejected", async ({ page }) => {
  await login(page);
  const res = await api(page, "/api/pet/care", { actionKey: "__nope__" });
  expect(res.status).toBeGreaterThanOrEqual(400);
});

test("claiming a mission awards beans", async ({ page }) => {
  await login(page);
  await page.goto("/missions");

  const claim = page.locator("main button", { hasText: /^(받기|Claim|Reclamar)$/ }).first();
  test.skip((await claim.count()) === 0, "nothing claimable right now");

  const beansOf = async () =>
    Number(((await page.locator("main").innerText()).match(/🌱?\s*(\d+)\s*(?:콩|beans|guisantes)/) ?? [])[1] ?? NaN);

  const before = await beansOf();
  await claim.click();
  await expect
    .poll(beansOf, { timeout: 10_000, message: "beans should increase" })
    .toBeGreaterThan(before);
});
