import { expect, type Page } from "@playwright/test";
import { PrismaClient } from "@prisma/client";

export const ATHLETE = { email: "athlete@example.com", password: "password123" };
export const COACH = { email: "coach@example.com", password: "password123" };

/** Log in through the real form and wait for the dashboard. */
export async function login(page: Page, who: { email: string; password: string } = ATHLETE) {
  await page.goto("/login");
  await page.fill('input[type="email"]', who.email);
  await page.fill('input[type="password"]', who.password);
  await Promise.all([
    page.waitForURL("/", { timeout: 20_000 }).catch(() => {}),
    page.click('button[type="submit"]'),
  ]);
  // The dashboard greeting only renders for an authenticated session.
  await expect(page.locator("main")).toContainText(/안녕하세요|Hi,|Hola,/);
}

/** Fail the test if the page reports a client-side or server error. */
export function failOnPageErrors(page: Page) {
  const errors: string[] = [];
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  page.on("pageerror", (e) => errors.push(String(e)));
  return () => errors;
}

/** Drive the app's own APIs as the logged-in user (cookies come along). */
export async function api(page: Page, path: string, body?: unknown) {
  return page.evaluate(
    async ([p, b]) => {
      const res = await fetch(p as string, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(b ?? {}),
      });
      return { status: res.status, data: await res.json().catch(() => null) };
    },
    [path, body] as const,
  );
}

/**
 * Put the fixture athlete back on a fresh egg with beans to spend.
 *
 * The pet tests hatch the pet, which is the whole point of them — and left the
 * account hatched afterwards, so they only passed against a database that had
 * just been seeded and failed on every run after that. The state they need is
 * theirs to set up, not the seed's to happen to provide.
 */
export async function resetPet(beans = 200) {
  const db = new PrismaClient();
  try {
    await db.user.update({
      where: { email: ATHLETE.email },
      data: { petGrowth: 0, beans },
    });
  } finally {
    await db.$disconnect();
  }
}
