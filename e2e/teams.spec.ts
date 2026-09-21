import { test, expect, type Page } from "@playwright/test";
import { login, api, athleteUserId, cleanupAssignments, ATHLETE, COACH } from "./helpers";

// The Teams panel used to be a list you could add to and nothing else: no way
// to copy the invite code, rename a typo, delete a stray team, take anyone off
// one, or — the reason a team is worth making — give the whole squad the same
// assignment. These cover what was added, and the rules around it.

/** DELETE/PATCH as the logged-in user; `api` only speaks POST. */
function send(page: Page, path: string, method: string, body?: unknown) {
  return page.evaluate(
    async ([path, method, body]) => {
      const res = await fetch(path as string, {
        method: method as string,
        headers: body ? { "Content-Type": "application/json" } : {},
        body: body ? JSON.stringify(body) : undefined,
      });
      return { status: res.status, data: await res.json().catch(() => null) };
    },
    [path, method, body] as const,
  );
}

async function newTeam(page: Page, name: string) {
  const res = await api(page, "/api/teams", { name });
  expect(res.status, `creating ${name}`).toBe(201);
  return res.data as { id: string; code: string };
}

test("a coach can rename and delete their own team", async ({ page }) => {
  await login(page, COACH);
  const team = await newTeam(page, "Typo Sqaud");

  const renamed = await send(page, `/api/teams/${team.id}`, "PATCH", { name: "Typo Squad" });
  expect(renamed.status).toBe(200);
  expect(renamed.data.name).toBe("Typo Squad");

  await page.goto(`/teams/${team.id}`, { waitUntil: "networkidle" });
  await expect(page.locator("main")).toContainText("Typo Squad");

  expect((await send(page, `/api/teams/${team.id}`, "DELETE")).status).toBe(200);
  // Gone, not merely hidden.
  expect((await send(page, `/api/teams/${team.id}`, "PATCH", { name: "x" })).status).toBe(404);
});

test("a two-character name is rejected rather than saved blank", async ({ page }) => {
  await login(page, COACH);
  const team = await newTeam(page, "Short Name Test");
  const res = await send(page, `/api/teams/${team.id}`, "PATCH", { name: "a" });
  expect(res.status).toBe(400);
  await send(page, `/api/teams/${team.id}`, "DELETE");
});

test("someone else's team cannot be renamed, deleted, or even confirmed to exist", async ({
  page,
  browser,
}) => {
  await login(page, COACH);
  const team = await newTeam(page, "Coach Only");

  const other = await browser.newContext();
  const athletePage = await other.newPage();
  await login(athletePage, ATHLETE);

  // 404 rather than 403: which team ids exist is not a stranger's business.
  expect((await send(athletePage, `/api/teams/${team.id}`, "PATCH", { name: "hacked" })).status).toBe(404);
  expect((await send(athletePage, `/api/teams/${team.id}`, "DELETE")).status).toBe(404);
  await other.close();

  // Still there and still named what the coach called it.
  const check = await send(page, `/api/teams/${team.id}`, "PATCH", { name: "Coach Only" });
  expect(check.status).toBe(200);
  await send(page, `/api/teams/${team.id}`, "DELETE");
});

test("assigning to a team reaches every member at once", async ({ page, browser }) => {
  await login(page, COACH);
  const team = await newTeam(page, "Fan Out Squad");

  const other = await browser.newContext();
  const athletePage = await other.newPage();
  await login(athletePage, ATHLETE);
  const joined = await api(athletePage, "/api/teams/join", { code: team.code });
  expect(joined.status).toBe(200);

  const assigned = await api(page, "/api/assignments", {
    teamId: team.id,
    title: "Rondo + finishing, 30 min",
  });
  expect(assigned.status).toBe(201);
  expect(assigned.data.count).toBe(1);

  // It reached the athlete, not just the coach's own list.
  await athletePage.goto("/", { waitUntil: "networkidle" });
  await expect(athletePage.locator("main")).toContainText("Rondo + finishing, 30 min");
  await other.close();

  await send(page, `/api/teams/${team.id}`, "DELETE");
  await cleanupAssignments(["Rondo + finishing, 30 min"]);
});

test("an empty team is refused with a reason, not a silent no-op", async ({ page }) => {
  await login(page, COACH);
  const team = await newTeam(page, "Nobody Here");
  const res = await api(page, "/api/assignments", { teamId: team.id, title: "Ghost session" });
  expect(res.status).toBe(400);
  expect(res.data.error).toMatch(/joined/i);
  await send(page, `/api/teams/${team.id}`, "DELETE");
});

test("an assignment must name exactly one target", async ({ page }) => {
  await login(page, COACH);
  const team = await newTeam(page, "Ambiguous Squad");

  const both = await api(page, "/api/assignments", {
    teamId: team.id,
    athleteId: "whoever",
    title: "Two targets",
  });
  expect(both.status).toBe(400);

  const neither = await api(page, "/api/assignments", { title: "No target" });
  expect(neither.status).toBe(400);

  await send(page, `/api/teams/${team.id}`, "DELETE");
});

test("a coach cannot assign to a team that isn't theirs", async ({ page, browser }) => {
  await login(page, COACH);
  const team = await newTeam(page, "Not Yours");

  const other = await browser.newContext();
  const otherCoach = await other.newPage();
  await login(otherCoach, { email: "clare.nam@example.com", password: "password123" });
  const res = await api(otherCoach, "/api/assignments", { teamId: team.id, title: "Poached" });
  expect(res.status).toBe(404);
  await other.close();

  await send(page, `/api/teams/${team.id}`, "DELETE");
});

test("a coach removes a member; the athlete can leave on their own", async ({ page, browser }) => {
  await login(page, COACH);
  const team = await newTeam(page, "Revolving Door");

  const other = await browser.newContext();
  const athletePage = await other.newPage();
  await login(athletePage, ATHLETE);
  expect((await api(athletePage, "/api/teams/join", { code: team.code })).status).toBe(200);

  // The coach's own page is where the removal happens, so drive it from there.
  await page.goto(`/teams/${team.id}`, { waitUntil: "networkidle" });
  await expect(page.locator("main")).toContainText("Alex Lee");

  const meId = await athleteUserId();
  expect((await send(page, `/api/teams/${team.id}/members/${meId}`, "DELETE")).status).toBe(200);
  // Removing someone who is already off the team says so rather than pretending.
  expect((await send(page, `/api/teams/${team.id}/members/${meId}`, "DELETE")).status).toBe(404);

  // They can come back with the code, then leave under their own steam.
  expect((await api(athletePage, "/api/teams/join", { code: team.code })).status).toBe(200);
  expect(
    (await send(athletePage, `/api/teams/${team.id}/members/${meId}`, "DELETE")).status,
  ).toBe(200);
  await other.close();

  await send(page, `/api/teams/${team.id}`, "DELETE");
});

test("Teams is in the menu and has a page, for both roles", async ({ page, browser }) => {
  await login(page, COACH);
  // The menu item exists and points at the page. Clicking it is not asserted:
  // it sits at the bottom of a scrollable rail behind a sticky pet card at
  // short viewports, which is a layout fact, not a routing one.
  const coachItem = page.locator("aside nav").getByRole("link", { name: "Teams", exact: true });
  await expect(coachItem).toHaveAttribute("href", "/teams");
  await page.goto("/teams", { waitUntil: "networkidle" });
  await expect(page.locator("main")).toContainText("Teams");

  const other = await browser.newContext();
  const athletePage = await other.newPage();
  await login(athletePage, ATHLETE);
  const athleteItem = athletePage.locator("aside nav").getByRole("link", { name: "Teams", exact: true });
  await expect(athleteItem).toHaveAttribute("href", "/teams");
  await athletePage.goto("/teams", { waitUntil: "networkidle" });
  await expect(athletePage.locator("main")).toContainText("My teams");
  await other.close();
});

test("a new invite code retires the old one; only the owner can issue it", async ({ page, browser }) => {
  await login(page, COACH);
  const team = await newTeam(page, "Leaked Code");

  const other = await browser.newContext();
  const athletePage = await other.newPage();
  await login(athletePage, ATHLETE);
  expect((await send(athletePage, `/api/teams/${team.id}/code`, "POST")).status).toBe(404);

  const fresh = await send(page, `/api/teams/${team.id}/code`, "POST");
  expect(fresh.status).toBe(200);
  expect(fresh.data.code).not.toBe(team.code);
  expect(fresh.data.code).toMatch(/^[A-Z2-9]{6}$/);

  // The old code is dead; the new one works.
  expect((await api(athletePage, "/api/teams/join", { code: team.code })).status).toBe(400);
  expect((await api(athletePage, "/api/teams/join", { code: fresh.data.code })).status).toBe(200);
  await other.close();

  await send(page, `/api/teams/${team.id}`, "DELETE");
});

test("the team page counts homework done, and names who hasn't", async ({ page, browser }) => {
  await login(page, COACH);
  const team = await newTeam(page, "Homework Squad");

  const other = await browser.newContext();
  const athletePage = await other.newPage();
  await login(athletePage, ATHLETE);
  expect((await api(athletePage, "/api/teams/join", { code: team.code })).status).toBe(200);

  const given = await api(page, "/api/assignments", { teamId: team.id, title: "Wall passes x50" });
  expect(given.status).toBe(201);

  await page.goto(`/teams/${team.id}`, { waitUntil: "networkidle" });
  await expect(page.locator("main")).toContainText("Wall passes x50");
  await expect(page.locator("main")).toContainText("0 of 1 done");
  await expect(page.locator("main")).toContainText("Still to do: Alex Lee");

  // The athlete ticks it off; the team page follows. A first-run tour can be
  // sitting over the home screen and swallowing clicks — clear it first.
  await athletePage.goto("/", { waitUntil: "networkidle" });
  const skipTour = athletePage.getByRole("button", { name: /건너뛰기|Skip|Omitir/ });
  if (await skipTour.isVisible().catch(() => false)) await skipTour.click();
  await athletePage.getByRole("button", { name: /Wall passes x50/ }).first().click();
  await expect
    .poll(async () => {
      await page.reload({ waitUntil: "networkidle" });
      return page.locator("main").innerText();
    })
    .toContain("Everyone's done");
  await other.close();

  await send(page, `/api/teams/${team.id}`, "DELETE");
  await cleanupAssignments(["Wall passes x50"]);
});

test("deleting a team keeps the homework it handed out", async ({ page, browser }) => {
  await login(page, COACH);
  const team = await newTeam(page, "Short Lived");

  const other = await browser.newContext();
  const athletePage = await other.newPage();
  await login(athletePage, ATHLETE);
  expect((await api(athletePage, "/api/teams/join", { code: team.code })).status).toBe(200);
  expect((await api(page, "/api/assignments", { teamId: team.id, title: "Survives the team" })).status).toBe(201);

  expect((await send(page, `/api/teams/${team.id}`, "DELETE")).status).toBe(200);
  await athletePage.goto("/", { waitUntil: "networkidle" });
  await expect(athletePage.locator("main")).toContainText("Survives the team");
  await other.close();
  await cleanupAssignments(["Survives the team"]);
});

test("an announcement reaches every member as a notification", async ({ page, browser }) => {
  await login(page, COACH);
  const team = await newTeam(page, "Loud Squad");

  const other = await browser.newContext();
  const athletePage = await other.newPage();
  await login(athletePage, ATHLETE);
  expect((await api(athletePage, "/api/teams/join", { code: team.code })).status).toBe(200);

  // Members can't post; a blank note is refused.
  expect((await api(athletePage, `/api/teams/${team.id}/announcements`, { body: "hi" })).status).toBe(404);
  expect((await api(page, `/api/teams/${team.id}/announcements`, { body: "   " })).status).toBe(400);

  const posted = await api(page, `/api/teams/${team.id}/announcements`, { body: "Bring fins on Thursday" });
  expect(posted.status).toBe(201);
  expect(posted.data.notified).toBe(1);

  await athletePage.goto(`/teams/${team.id}`, { waitUntil: "networkidle" });
  await expect(athletePage.locator("main")).toContainText("Bring fins on Thursday");
  // The athlete's bell knows about it.
  const unread = await athletePage.evaluate(async () => {
    const r = await fetch("/api/notifications");
    return r.ok ? await r.text() : "";
  });
  expect(unread).toContain("teamAnnouncement");

  expect((await send(page, `/api/teams/${team.id}/announcements/${posted.data.id}`, "DELETE")).status).toBe(200);
  expect((await send(page, `/api/teams/${team.id}/announcements/${posted.data.id}`, "DELETE")).status).toBe(404);
  await other.close();
  await send(page, `/api/teams/${team.id}`, "DELETE");
});

test("attendance is a per-day register the coach can correct", async ({ page, browser }) => {
  await login(page, COACH);
  const team = await newTeam(page, "Register Squad");

  const other = await browser.newContext();
  const athletePage = await other.newPage();
  await login(athletePage, ATHLETE);
  expect((await api(athletePage, "/api/teams/join", { code: team.code })).status).toBe(200);
  const meId = await athleteUserId();

  // Athletes can't take the register; a stranger's id is ignored, not written.
  expect((await send(athletePage, `/api/teams/${team.id}/attendance`, "PUT",
    { day: "2026-09-21", marks: [{ userId: meId, present: true }] })).status).toBe(404);
  const first = await send(page, `/api/teams/${team.id}/attendance`, "PUT",
    { day: "2026-09-21", marks: [{ userId: meId, present: false }, { userId: "not-on-team", present: true }] });
  expect(first.status).toBe(200);
  expect(first.data).toEqual({ day: "2026-09-21", saved: 1, ignored: 1 });

  // Correcting the same day overwrites rather than duplicating.
  const fixed = await send(page, `/api/teams/${team.id}/attendance`, "PUT",
    { day: "2026-09-21", marks: [{ userId: meId, present: true }] });
  expect(fixed.status).toBe(200);
  expect((await send(page, `/api/teams/${team.id}/attendance`, "PUT",
    { day: "21/09/2026", marks: [{ userId: meId, present: true }] })).status).toBe(400);

  await page.goto(`/teams/${team.id}`, { waitUntil: "networkidle" });
  await expect(page.locator("main")).toContainText("Attendance");
  await expect(page.getByRole("radiogroup", { name: "Alex Lee" })).toBeVisible();
  await other.close();
  await send(page, `/api/teams/${team.id}`, "DELETE");
});

test("the leaderboard and the report can be scoped to a team", async ({ page, browser }) => {
  await login(page, COACH);
  const team = await newTeam(page, "Scoped Squad");

  const other = await browser.newContext();
  const athletePage = await other.newPage();
  await login(athletePage, ATHLETE);
  expect((await api(athletePage, "/api/teams/join", { code: team.code })).status).toBe(200);

  // Scoped board shows only the team; the seeded demo squad is not on it.
  await page.goto(`/leaderboard?sport=swimming&team=${team.id}`, { waitUntil: "networkidle" });
  const main = page.locator("main");
  await expect(main).toContainText("Scoped Squad");
  await expect(main).not.toContainText("Demo Athlete");

  // A team you're not part of is ignored — same board as "Everyone".
  await athletePage.goto(`/leaderboard?sport=swimming&team=not-mine`, { waitUntil: "networkidle" });
  await expect(athletePage.getByRole("link", { name: "Everyone" })).toHaveAttribute("aria-current", "page");

  await page.goto(`/coach/report?team=${team.id}`, { waitUntil: "networkidle" });
  await expect(page.locator("main, body")).toContainText("Scoped Squad");
  await other.close();
  await send(page, `/api/teams/${team.id}`, "DELETE");
});
