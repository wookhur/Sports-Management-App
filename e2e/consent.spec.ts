import { test, expect } from "@playwright/test";

/**
 * Research consent is optional, and these tests exist to keep it that way.
 *
 * The failure mode worth guarding against is not a broken checkbox — it is a
 * checkbox that quietly becomes load-bearing: sign-up refusing to complete
 * without it, or an untouched box being recorded as agreement. Either turns a
 * choice into a formality, which is worse than not asking at all.
 */

const unique = (n: string) => `${n}${process.pid}${Date.now().toString(36)}`;

async function signUp(page: import("@playwright/test").Page, tick: boolean) {
  const username = unique("consent");
  const res = await page.request.post("/api/auth/signup", {
    data: {
      username,
      email: `${username}@example.com`,
      password: "password123",
      role: "ATHLETE",
      ...(tick === undefined ? {} : { researchConsent: tick }),
    },
  });
  return { res, username };
}

test("declining still creates the account", async ({ page }) => {
  const { res } = await signUp(page, false);
  expect(res.status(), "sign-up must not depend on consent").toBe(201);
});

test("agreeing creates the account too", async ({ page }) => {
  const { res } = await signUp(page, true);
  expect(res.status()).toBe(201);
});

test("a caller that omits consent is not recorded as agreeing", async ({ page }) => {
  const username = unique("consent");
  const res = await page.request.post("/api/auth/signup", {
    data: {
      username,
      email: `${username}@example.com`,
      password: "password123",
      role: "ATHLETE",
    },
  });
  expect(res.status()).toBe(201);

  // Never asked, so the profile must claim neither agreement nor refusal.
  await page.goto("/profile", { waitUntil: "networkidle" });
  const box = page.locator("#researchConsentToggle");
  await expect(box).not.toBeChecked();
  await expect(page.locator("main")).toContainText(
    /아직 선택하지 않으셨어요|haven't chosen yet|Todavía no has elegido/,
  );
});

test("the box is unticked by default on the sign-up form", async ({ page }) => {
  await page.goto("/signup", { waitUntil: "networkidle" });

  // Walk to the final account step. Steps 1-5 offer Skip; the role step does
  // not, and its Next stays disabled until a role is picked, so choose one.
  const box = page.locator("#researchConsent");
  for (let i = 0; i < 25 && (await box.count()) === 0; i += 1) {
    // The role button's accessible name carries its description too, so match
    // on the leading word rather than the whole string.
    const role = page.getByRole("button", { name: /^(선수|Athlete|Atleta)\s/ });
    const skip = page.getByRole("button", { name: /건너뛰기|Skip|Omitir/ });
    const next = page.getByRole("button", {
      name: /다음|Next|Siguiente|시작하기|Get started|Comenzar|좋아요|Let's go|¡Vamos!/,
    });

    // Picking a role does not advance on its own, and Next is disabled until
    // one is picked — so do both, in that order.
    if (await role.count()) await role.first().click();
    if (await next.count()) {
      if (await next.first().isEnabled()) await next.first().click();
      else if (await skip.count()) await skip.first().click();
      else break;
    } else if (await skip.count()) {
      await skip.first().click();
    } else {
      break;
    }
    await page.waitForTimeout(200);
  }

  await expect(box).toHaveCount(1);
  await expect(box, "consent must start unticked").not.toBeChecked();
});

test("consent can be withdrawn after agreeing", async ({ page }) => {
  // Signing up through the API sets the session cookie on this same context,
  // so we are already signed in as the new account.
  await signUp(page, true);

  await page.goto("/profile", { waitUntil: "networkidle" });
  const box = page.locator("#researchConsentToggle");
  await expect(box).toBeChecked();

  await box.uncheck();
  await page.waitForTimeout(800);
  await page.reload({ waitUntil: "networkidle" });
  await expect(box, "withdrawal must survive a reload").not.toBeChecked();
});
