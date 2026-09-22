import { test, expect, type Page } from "@playwright/test";
import { PrismaClient } from "@prisma/client";

/**
 * Sign-up agreements.
 *
 * Two things must hold. Nobody gets an account without accepting the terms.
 * And nobody under 18 gets one without a parent or guardian on record — by
 * birth date when one is given, and by their own answer when it is not, and
 * never by silently assuming they are an adult.
 */

const unique = (n: string) => `${n}${process.pid}${Date.now().toString(36)}`;
const made: string[] = [];

function signUp(page: Page, extra: Record<string, unknown>) {
  const username = unique("minor");
  made.push(username);
  return page.request.post("/api/auth/signup", {
    data: { username, email: `${username}@example.com`, password: "password123", role: "ATHLETE", ...extra },
  });
}

function isoYearsAgo(years: number): string {
  const d = new Date();
  d.setUTCFullYear(d.getUTCFullYear() - years);
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}

const guardian = { guardianName: "Pat Guardian", guardianEmail: "pat.guardian@example.com", guardianConsent: true };

test.afterAll(async () => {
  const db = new PrismaClient();
  try {
    await db.user.deleteMany({ where: { username: { in: made } } });
  } finally {
    await db.$disconnect();
  }
});

test("without accepting the terms there is no account", async ({ page }) => {
  const res = await signUp(page, { minor: false });
  expect(res.status()).toBe(400);
  expect((await res.json()).error).toMatch(/Terms/);
});

test("an adult by birth date needs no guardian", async ({ page }) => {
  const res = await signUp(page, { termsAccepted: true, dob: isoYearsAgo(25) });
  expect(res.status()).toBe(201);
});

test("a minor by birth date is refused without a guardian, even if they claim to be an adult", async ({ page }) => {
  const res = await signUp(page, { termsAccepted: true, dob: isoYearsAgo(12), minor: false });
  expect(res.status()).toBe(400);
  expect((await res.json()).error).toMatch(/parent or guardian/);
});

test("with no birth date, the question must be answered", async ({ page }) => {
  const res = await signUp(page, { termsAccepted: true });
  expect(res.status()).toBe(400);
  expect((await res.json()).error).toMatch(/under 18/);
});

test("a minor with a guardian on record gets an account, and the profile shows who consented", async ({ page }) => {
  const res = await signUp(page, { termsAccepted: true, dob: isoYearsAgo(14), ...guardian });
  expect(res.status()).toBe(201);

  await page.goto("/profile", { waitUntil: "networkidle" });
  const main = page.locator("main");
  await expect(main).toContainText(/under 18|18세 미만|menor de 18/);
  await expect(main).toContainText("Pat Guardian");
  await expect(main).toContainText("pat.guardian@example.com");
});

test("a minor without a birth date who says so is held to the same rule", async ({ page }) => {
  const refused = await signUp(page, { termsAccepted: true, minor: true });
  expect(refused.status()).toBe(400);
  const allowed = await signUp(page, { termsAccepted: true, minor: true, ...guardian });
  expect(allowed.status()).toBe(201);
});

test("the legal pages read signed out, in Spanish too", async ({ page }) => {
  await page.goto("/privacy", { waitUntil: "networkidle" });
  await expect(page.locator("h1")).toContainText(/Privacy Notice|개인정보 처리방침|Aviso de privacidad/);
  await page.context().addCookies([{ name: "lang", value: "es", url: page.url() }]);
  await page.goto("/privacy", { waitUntil: "networkidle" });
  await expect(page.locator("h1")).toHaveText("Aviso de privacidad");
  await expect(page.locator("main")).toContainText("Menores");
  await page.goto("/terms", { waitUntil: "networkidle" });
  await expect(page.locator("h1")).toHaveText("Términos de uso");
});

test("the wizard asks for a guardian when the birth date says under 18, and not before", async ({ page }) => {
  await page.goto("/signup", { waitUntil: "networkidle" });
  const next = page.getByRole("button", { name: /다음|Next|Siguiente|좋아요|Let's go|¡Vamos!/ });
  const skip = page.getByRole("button", { name: /건너뛰기|Skip|Omitir/ });

  await next.first().click(); // intro
  await next.first().click(); // username (suggested)
  await skip.first().click(); // school
  await skip.first().click(); // sports
  await skip.first().click(); // experience
  await page.fill("#dob", isoYearsAgo(10));
  await next.first().click(); // dob & grade
  await page.getByRole("button", { name: /^(선수|Athlete|Atleta)\s/ }).first().click();
  await next.first().click(); // role

  // Account step: the guardian block is there because of the birth date, and
  // Get started stays disabled until it is filled in.
  const guardianBlock = page.getByTestId("guardian-block");
  await expect(guardianBlock).toBeVisible();
  await expect(page.locator("#ageUnder")).toHaveCount(0);

  const username = unique("wizard");
  made.push(username);
  await page.fill("#email", `${username}@example.com`);
  await page.fill("#password", "password123");
  await page.check("#termsAccepted");
  const start = page.getByRole("button", { name: /시작하기|Get started|Comenzar/ });
  await expect(start).toBeDisabled();

  await page.fill("#guardianName", "Sam Guardian");
  await page.fill("#guardianEmail", "sam.guardian@example.com");
  await page.check("#guardianConsent");
  await expect(start).toBeEnabled();
  await start.click();
  await page.waitForURL("/", { timeout: 20_000 });

  // The wizard's suggested username is what the account got; clean that up
  // rather than the email-derived one.
  const db = new PrismaClient();
  try {
    const u = await db.user.findUnique({ where: { email: `${username}@example.com` }, select: { username: true, guardianName: true } });
    expect(u?.guardianName).toBe("Sam Guardian");
    if (u?.username) made.push(u.username);
  } finally {
    await db.$disconnect();
  }
});
