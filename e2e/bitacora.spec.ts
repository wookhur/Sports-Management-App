import { test, expect, type Page } from "@playwright/test";
import JSZip from "jszip";
import { DOMParser } from "@xmldom/xmldom";
import { readFileSync } from "node:fs";
import { PrismaClient } from "@prisma/client";
import { login, api, ATHLETE, COACH } from "./helpers";

// The coach's season log, sheet by sheet as the school's bitácora has it: a
// weekly plan, roster-only players, the five attendance marks, the match
// sheet, evaluations, the written sections, and the official workbook. Each
// test makes its own team and deletes it, so they don't lean on seeded state.

const TEMPLATE = "src/data/bitacora/bitacora-futbol-template.xlsx";

/** Download the official workbook as the browser would. */
async function downloadBitacora(page: Page, query: string): Promise<{ type: string | null; zip: JSZip }> {
  const res = await page.evaluate(async (q) => {
    const r = await fetch(q);
    return { type: r.headers.get("content-type"), data: Array.from(new Uint8Array(await r.arrayBuffer())) };
  }, query);
  return { type: res.type, zip: await JSZip.loadAsync(Buffer.from(res.data)) };
}

/** A cell's value from the package's XML: a number, a string, a boolean, or null. */
async function cell(zip: JSZip, sheet: string, ref: string): Promise<string | number | boolean | null> {
  const parser = new DOMParser();
  const wb = parser.parseFromString(await zip.file("xl/workbook.xml")!.async("string"), "text/xml");
  const rels = parser.parseFromString(await zip.file("xl/_rels/workbook.xml.rels")!.async("string"), "text/xml");
  const sheets = Array.from(wb.getElementsByTagName("sheet") as unknown as ArrayLike<Element>);
  const rid = sheets.find((x) => x.getAttribute("name") === sheet)!.getAttribute("r:id");
  const rel = Array.from(rels.getElementsByTagName("Relationship") as unknown as ArrayLike<Element>).find((r) => r.getAttribute("Id") === rid)!;
  const target = rel.getAttribute("Target")!;
  const xml = await zip.file(target.startsWith("/") ? target.slice(1) : `xl/${target}`)!.async("string");
  const doc = parser.parseFromString(xml, "text/xml");
  const c = Array.from(doc.getElementsByTagName("c") as unknown as ArrayLike<Element>).find((x) => x.getAttribute("r") === ref);
  if (!c) return null;
  const t = c.getAttribute("t");
  if (t === "inlineStr") return c.getElementsByTagName("t")[0]?.textContent ?? "";
  const v = c.getElementsByTagName("v")[0]?.textContent;
  if (v == null) return null;
  if (t === "b") return v === "1";
  if (t === "s") {
    const ss = parser.parseFromString(await zip.file("xl/sharedStrings.xml")!.async("string"), "text/xml");
    return ss.getElementsByTagName("si")[Number(v)].textContent;
  }
  if (t === "str") return v;
  return Number(v);
}

/** Every chart, drawing and form control of the template is still in the file. */
async function keepsTemplateParts(zip: JSZip) {
  const template = await JSZip.loadAsync(readFileSync(TEMPLATE));
  const parts = (z: JSZip) => Object.keys(z.files).filter((f) => /charts\/|drawings\/|ctrlProps\/|comments|tables\//.test(f)).sort();
  expect(parts(zip)).toEqual(parts(template));
  for (const f of parts(template)) expect(await zip.file(f)!.async("string"), f).toBe(await template.file(f)!.async("string"));
}

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
  expect(res.status).toBe(201);
  return res.data as { id: string; code: string };
}

/** Today in the team's default zone, the way the server decides it. */
function seoulToday(page: Page): Promise<string> {
  return page.evaluate(() =>
    new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date()),
  );
}

async function setLang(page: Page, lang: "en" | "es" | "ko") {
  await page.context().addCookies([{ name: "lang", value: lang, url: page.url() }]);
}

test("the soccer season plan loads once, can be edited, and shows this week on the team page", async ({ page }) => {
  await login(page, COACH);
  await setLang(page, "es");
  const team = await newTeam(page, "Plan Squad");

  const first = await api(page, `/api/teams/${team.id}/plan`, { template: "soccer-season" });
  expect(first.status).toBe(201);
  expect(first.data.added).toBe(40);
  // Loading again fills nothing: every week is already there.
  const again = await api(page, `/api/teams/${team.id}/plan`, { template: "soccer-season" });
  expect(again.data.added).toBe(0);

  await page.goto(`/teams/${team.id}/plan`, { waitUntil: "networkidle" });
  await expect(page.locator("main")).toContainText("Familiarización y Perfiles");
  await expect(page.locator("main")).toContainText("Superficies de contacto");
  await expect(page.locator("main")).toContainText("65 min");

  // Write this week's objective; the team page leads with it.
  const today = await seoulToday(page);
  const put = await send(page, `/api/teams/${team.id}/plan`, "PUT", {
    weekStart: today,
    unit: "Pase y Amplitud",
    objective: "Rondos 4v2 con dos toques",
  });
  expect(put.status).toBe(200);
  await page.goto(`/teams/${team.id}`, { waitUntil: "networkidle" });
  await expect(page.getByText("Rondos 4v2 con dos toques")).toBeVisible();
  // And the plan page marks it as the current week.
  await page.goto(`/teams/${team.id}/plan`, { waitUntil: "networkidle" });
  await expect(page.locator("li[data-current]")).toContainText("Rondos 4v2 con dos toques");

  await send(page, `/api/teams/${team.id}`, "DELETE");
});

test("players without accounts go on the roster, take attendance, and never get homework", async ({ page }) => {
  await login(page, COACH);
  await setLang(page, "en");
  const team = await newTeam(page, "Roster Only Squad");

  const added = await api(page, `/api/teams/${team.id}/roster`, { names: ["Mendoza Jesús", "Ana López"] });
  expect(added.status).toBe(201);
  expect(added.data.added).toBe(2);

  await page.goto(`/teams/${team.id}/roster`, { waitUntil: "networkidle" });
  const jesus = page.locator('li[data-player="Mendoza Jesús"]');
  await expect(jesus).toContainText("No account");

  // Fill in a shirt number and a guardian through the form.
  await jesus.getByRole("button", { name: "Edit" }).click();
  await jesus.locator('input[name="number"]').fill("9");
  await jesus.locator('input[name="birthDate"]').fill("2013-04-02");
  await jesus.locator('input[name="guardian1Name"]').fill("María Mendoza");
  await jesus.locator('input[name="guardian1Phone"]').fill("33 1234 5678");
  // CURP: eighteen letters and digits, checked on the server.
  await jesus.locator('input[name="curp"]').fill("mejj1304");
  await jesus.getByRole("button", { name: "Save" }).click();
  await expect(jesus.getByRole("alert")).toBeVisible();
  await jesus.locator('input[name="curp"]').fill("mejj130402hjcnss09");
  await expect(jesus.locator('input[name="curp"]')).toHaveValue("MEJJ130402HJCNSS09");
  await jesus.getByRole("button", { name: "Save" }).click();
  await expect(jesus).toContainText("2013-04-02 · MEJJ130402HJCNSS09 · María Mendoza · 33 1234 5678");

  // Homework can't go to people who can't open the app.
  const homework = await api(page, "/api/assignments", { teamId: team.id, title: "50 keep-ups" });
  expect(homework.status).toBe(400);

  // An excused absence on an earlier day, then the monthly history counts it.
  await page.goto(`/teams/${team.id}`, { waitUntil: "networkidle" });
  const today = await seoulToday(page);
  const earlier = new Date(`${today}T00:00:00Z`);
  earlier.setUTCDate(earlier.getUTCDate() - 2);
  const day = earlier.toISOString().slice(0, 10);
  await page.goto(`/teams/${team.id}?day=${day}`, { waitUntil: "networkidle" });
  await expect(page.locator('#attendance input[type="date"]')).toHaveValue(day);
  await page.getByRole("radiogroup", { name: "Mendoza Jesús" }).getByRole("radio", { name: "Excused" }).click();
  await page.getByRole("radiogroup", { name: "Ana López" }).getByRole("radio", { name: "Late" }).click();
  await page.locator("#attendance").getByRole("button", { name: "Save" }).click();
  await expect(page.locator("#attendance")).toContainText("Saved 2");

  // B2: the month's grid shows the marks; late counts as attended.
  const year = day.slice(5, 7) >= "08" ? day.slice(0, 4) : String(Number(day.slice(0, 4)) - 1);
  await page.goto(`/teams/${team.id}/attendance?year=${year}&month=${day.slice(0, 7)}`, { waitUntil: "networkidle" });
  const grid = page.getByTestId("attendance-grid");
  const jesusRow = grid.locator('tr[data-player="Mendoza Jesús"]');
  const anaRow = grid.locator('tr[data-player="Ana López"]');
  await expect(jesusRow.getByRole("button", { name: /Mendoza Jesús, .*: Excused/ })).toHaveText("E");
  await expect(jesusRow.locator("td").nth(-3)).toHaveText("1"); // excused
  await expect(anaRow.getByRole("button", { name: /Ana López, .*: Late/ })).toHaveText("L");
  await expect(anaRow.locator("td").nth(-5)).toHaveText("1"); // attended
  // A tap moves a cell on to the next mark and saves it: late → incident.
  await anaRow.getByRole("button", { name: /Ana López, .*: Late/ }).click();
  await expect(anaRow.getByRole("button", { name: /Ana López, .*: Incident/ })).toHaveText("I");
  await page.reload({ waitUntil: "networkidle" });
  await expect(grid.locator('tr[data-player="Ana López"]').getByRole("button", { name: /Ana López, .*: Incident/ })).toBeVisible();

  await send(page, `/api/teams/${team.id}`, "DELETE");
});

test("matches build the team record, and members can read but not write them", async ({ page, browser }) => {
  await login(page, COACH);
  await setLang(page, "es");
  const team = await newTeam(page, "Match Squad");

  const other = await browser.newContext();
  const athletePage = await other.newPage();
  await login(athletePage, ATHLETE);
  expect((await api(athletePage, "/api/teams/join", { code: team.code })).status).toBeLessThan(300);
  await api(page, `/api/teams/${team.id}/roster`, { names: ["Mendoza Jesús"] });

  await page.goto(`/teams/${team.id}/matches`, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "+ Agregar partido" }).click();
  await page.locator('input[name="opponent"]').fill("Atlas Chapalita");
  await page.locator('input[name="goalsFor"]').fill("3");
  await page.locator('input[name="goalsAgainst"]').fill("1");
  await page.getByRole("button", { name: "Guardar partido" }).click();
  await expect(page.locator("main")).toContainText("3 – 1 · Atlas Chapalita");
  // A win, everyone "Asistió" by default.
  await expect(page.locator("main")).toContainText("Quién jugó: 2");
  const total = page.locator("aside tr", { hasText: "Total" });
  await expect(total).toContainText("1"); // played
  await expect(total.locator("td").last()).toHaveText("+2");

  // B3: the match sheet. A tap moves Jesús on to "No asistió" and saves it.
  const sheet = page.getByTestId("match-sheet");
  await expect(sheet.locator("tfoot")).toContainText("Ganado");
  const cellBtn = sheet.locator('tr[data-player="Mendoza Jesús"]').getByRole("button");
  await expect(cellBtn).toHaveText("Asistió");
  await cellBtn.click();
  await expect(cellBtn).toHaveText("No asistió");
  await page.reload({ waitUntil: "networkidle" });
  await expect(page.getByTestId("match-sheet").locator('tr[data-player="Mendoza Jesús"]').getByRole("button")).toHaveText("No asistió");
  await expect(page.locator("main")).toContainText("Quién jugó: 1");

  // The athlete sees the result but can't add one.
  await athletePage.goto(`/teams/${team.id}/matches`, { waitUntil: "networkidle" });
  await expect(athletePage.locator("main")).toContainText("Atlas Chapalita");
  const write = await api(athletePage, `/api/teams/${team.id}/matches`, {
    day: "2026-09-20", opponent: "x", kind: "LEAGUE", goalsFor: 0, goalsAgainst: 0, players: [],
  });
  expect(write.status).toBe(404);
  // Evaluations, roster and the season report are the coach's alone.
  for (const tab of ["evaluations", "roster", "season", "bitacora", "goals", "events", "self-eval"]) {
    const res = await athletePage.goto(`/teams/${team.id}/${tab}`);
    expect(res?.status(), tab).toBe(404);
  }
  await other.close();
  await send(page, `/api/teams/${team.id}`, "DELETE");
});

test("evaluations score ten points from 10 to 6 into two grades and fill B4 of the official workbook", async ({ page }) => {
  await login(page, COACH);
  await setLang(page, "es");
  const team = await newTeam(page, "Eval Squad");
  await api(page, `/api/teams/${team.id}/roster`, { names: ["Mendoza Jesús"] });
  expect((await send(page, `/api/teams/${team.id}`, "PATCH", { category: "2012-2013", branch: "Varonil", timeZone: "America/Mexico_City" })).status).toBe(200);
  expect((await send(page, `/api/teams/${team.id}`, "PATCH", { timeZone: "Mars/Olympus" })).status).toBe(400);

  await page.goto(`/teams/${team.id}/evaluations`, { waitUntil: "networkidle" });
  const row = page.locator('li[data-player="Mendoza Jesús"]');
  await expect(row.getByTestId("eval-attitude")).toHaveText("–");
  // The old 1-5 scale is gone.
  const old = await send(page, `/api/teams/${team.id}/evaluations`, "PUT", { athleteId: "x", period: "2026-S1", scores: Array(10).fill(4) });
  expect(old.status).toBe(400);
  const selects = row.locator("select");
  for (let i = 0; i < 10; i++) await selects.nth(i).selectOption(i < 5 ? "10" : i < 9 ? "8" : "9");
  await expect(row.getByTestId("eval-attitude")).toHaveText("10");
  await expect(row.getByTestId("eval-performance")).toHaveText("8.2");
  await row.getByRole("button", { name: "Guardar" }).click();
  await expect(row).toContainText("Guardado");

  await page.reload({ waitUntil: "networkidle" });
  await expect(page.locator('li[data-player="Mendoza Jesús"]').getByTestId("eval-performance")).toHaveText("8.2");

  // The year-end report and the school's workbook both carry it.
  await page.goto(`/teams/${team.id}/season`, { waitUntil: "networkidle" });
  await expect(page.locator("main")).toContainText("2012-2013");
  await expect(page.locator("main")).toContainText("10 / 8.2");
  const { type, zip } = await downloadBitacora(page, `/api/teams/${team.id}/export`);
  expect(type).toContain("spreadsheetml");
  expect(await cell(zip, "B1- INFO Y CONTACTOS", "B8")).toBe("Mendoza Jesús");
  expect(await cell(zip, "B1- INFO Y CONTACTOS", "C3")).toBe("2012-2013");
  expect(await cell(zip, "B1- INFO Y CONTACTOS", "C4")).toBe("Varonil");
  expect(await cell(zip, "B1- INFO Y CONTACTOS", "B9")).toBeNull(); // the template's sample row is cleared
  expect(await cell(zip, "B4- REND. Y ACTITUD DEP.", "C10")).toBe(10);
  expect(await cell(zip, "B4- REND. Y ACTITUD DEP.", "I10")).toBe(8);
  expect(await cell(zip, "B4- REND. Y ACTITUD DEP.", "M10")).toBe(9);
  expect(await cell(zip, "B4- REND. Y ACTITUD DEP.", "C11")).toBeNull();
  await keepsTemplateParts(zip);

  await send(page, `/api/teams/${team.id}`, "DELETE");
});

test("a team of roster-only players reads right in Spanish, from the home screen down", async ({ page }) => {
  await login(page, COACH);
  await setLang(page, "es");
  const team = await newTeam(page, "Solo Plantilla");
  await api(page, `/api/teams/${team.id}/roster`, { names: ["Mendoza Jesús", "García Sofía"] });

  // The coach's home leads to the team and its register.
  await page.goto("/", { waitUntil: "networkidle" });
  const card = page.locator("section", { has: page.getByRole("heading", { name: "Tus equipos" }) });
  await expect(card.getByRole("link", { name: "Solo Plantilla" })).toBeVisible();
  await expect(card.getByRole("link", { name: "Pasar lista" }).first()).toBeVisible();

  // No homework form or "no athletes connected" panel for players without
  // accounts; an explanation instead.
  await page.goto(`/teams/${team.id}`, { waitUntil: "networkidle" });
  await expect(page.locator("main")).toContainText("Tus 2 jugadores están en la plantilla sin cuenta");
  await expect(page.locator("#team-assign")).toHaveCount(0);
  await expect(page.getByText("Aún no hay atletas conectados")).toHaveCount(0);

  // Server-side validation answers in Spanish too.
  const bad = await send(page, `/api/teams/${team.id}/roster/nobody`, "PATCH", { number: 3 });
  expect(bad.status).toBe(404);
  expect(bad.data.error).toBe("Ese jugador no está en el equipo");

  // The soccer program's drills are translated, not left in English.
  await page.goto("/sports/soccer/program", { waitUntil: "networkidle" });
  await expect(page.locator("main")).toContainText("Rondo avanzado");
  await expect(page.locator("main")).not.toContainText("Juggling variation");
  await expect(page).toHaveTitle(/Entrenamiento registrado/);

  await send(page, `/api/teams/${team.id}`, "DELETE");
});

test("a roster-only player merges into the account they signed up with, history and all", async ({ page, browser }) => {
  await login(page, COACH);
  await setLang(page, "es");
  const team = await newTeam(page, "Merge Squad");
  // The coach added the athlete by name, surname first, before they had an account.
  await api(page, `/api/teams/${team.id}/roster`, { names: ["Lee Alex"] });

  const other = await browser.newContext();
  const athletePage = await other.newPage();
  await login(athletePage, ATHLETE);
  expect((await api(athletePage, "/api/teams/join", { code: team.code })).status).toBeLessThan(300);

  const db = new PrismaClient();
  try {
    const members = await db.teamMember.findMany({ where: { teamId: team.id }, include: { user: true } });
    const ghost = members.find((m) => m.user.managed)!.userId;
    const account = members.find((m) => !m.user.managed)!.userId;

    await page.goto(`/teams/${team.id}`, { waitUntil: "networkidle" });
    const today = await seoulToday(page);
    const back = (n: number) => {
      const d = new Date(`${today}T00:00:00Z`);
      d.setUTCDate(d.getUTCDate() - n);
      return d.toISOString().slice(0, 10);
    };
    const [y, m] = today.split("-").map(Number);
    const term = m >= 8 ? `${y}-S1` : `${y - 1}-S2`;

    // History on the roster-only row: present two days ago, excused yesterday,
    // one match, an evaluation and a shirt number. The account was marked
    // absent yesterday, so that day has a mark on both rows.
    await send(page, `/api/teams/${team.id}/attendance`, "PUT", { day: back(2), marks: [{ userId: ghost, present: true }] });
    await send(page, `/api/teams/${team.id}/attendance`, "PUT", {
      day: back(1),
      marks: [{ userId: ghost, present: false, excused: true }, { userId: account, present: false }],
    });
    await api(page, `/api/teams/${team.id}/matches`, {
      day: back(1), opponent: "Atlas Chapalita", kind: "LEAGUE", goalsFor: 1, goalsAgainst: 0, players: [ghost],
    });
    await send(page, `/api/teams/${team.id}/evaluations`, "PUT", { athleteId: ghost, period: term, scores: Array(10).fill(8) });
    await send(page, `/api/teams/${team.id}/roster/${ghost}`, "PATCH", { number: 7, guardian1Name: "Mamá Lee" });

    // Only a roster-only player can be merged away, and only by the coach.
    expect((await api(page, `/api/teams/${team.id}/roster/${account}/merge`, { into: ghost })).data.error).toBe(
      "Solo se puede unir un jugador sin cuenta",
    );
    expect((await api(athletePage, `/api/teams/${team.id}/roster/${ghost}/merge`, { into: account })).status).toBe(404);

    // The team page and the roster both point out the duplicate.
    await page.goto(`/teams/${team.id}`, { waitUntil: "networkidle" });
    await expect(page.locator("main")).toContainText("Lee Alex (sin cuenta) y Alex Lee (con cuenta)");
    await page.goto(`/teams/${team.id}/roster`, { waitUntil: "networkidle" });
    await page.getByRole("region", { name: "Parecen el mismo jugador" }).getByRole("button", { name: "Unir con su cuenta" }).click();
    const panel = page.locator('li[data-player="Lee Alex"]');
    await expect(panel.locator('select[name="into"]')).toHaveValue(account);
    page.once("dialog", (d) => d.accept());
    await panel.getByRole("button", { name: "Unir", exact: true }).click();
    await expect(page.locator('li[data-player="Lee Alex"]')).toHaveCount(0);

    // Everything landed on the account.
    await expect(page.locator('li[data-player="Alex Lee"]')).toContainText("Mamá Lee");
    await expect(page.locator('li[data-player="Alex Lee"]')).toContainText("7");
    expect(await db.user.findUnique({ where: { id: ghost } })).toBeNull();
    const marks = await db.attendance.findMany({ where: { teamId: team.id, userId: account }, orderBy: { day: "asc" } });
    expect(marks.map((r) => [r.day, r.present, r.excused])).toEqual([
      [back(2), true, false],
      [back(1), false, true], // absent on the account, excused on the roster row: excused
    ]);
    expect(await db.matchPlayer.count({ where: { userId: account, match: { teamId: team.id } } })).toBe(1);
    const ev = await db.playerEvaluation.findUnique({ where: { teamId_athleteId_period: { teamId: team.id, athleteId: account, period: term } } });
    expect(ev?.scores).toEqual(Array(10).fill(8));
  } finally {
    await db.$disconnect();
    await other.close();
    await send(page, `/api/teams/${team.id}`, "DELETE");
  }
});

test("the bitácora's written sections save as typed and everything lands in the school's workbook", async ({ page }) => {
  await login(page, COACH);
  await setLang(page, "es");
  const team = await newTeam(page, "Bitacora Squad");
  await send(page, `/api/teams/${team.id}`, "PATCH", { category: "2012-2013", branch: "Varonil", timeZone: "America/Mexico_City" });
  await api(page, `/api/teams/${team.id}/roster`, { names: ["Mendoza Jesús", "García Sofía", "Ruiz Pablo"] });

  const db = new PrismaClient();
  try {
    const members = await db.teamMember.findMany({ where: { teamId: team.id }, include: { user: true } });
    const idOf = (name: string) => members.find((m) => m.user.name === name)!.userId;
    const [jesus, sofia, pablo] = ["Mendoza Jesús", "García Sofía", "Ruiz Pablo"].map(idOf);

    const today = await page.evaluate(() =>
      new Intl.DateTimeFormat("en-CA", { timeZone: "America/Mexico_City", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date()),
    );
    const back = (n: number) => {
      const d = new Date(`${today}T00:00:00Z`);
      d.setUTCDate(d.getUTCDate() - n);
      return d.toISOString().slice(0, 10);
    };
    const [d1, d2] = [back(2), back(1)];

    // B2: all five marks are accepted, and anything else is not.
    expect((await send(page, `/api/teams/${team.id}/attendance`, "PUT", { day: d1, marks: [jesus, sofia, pablo].map((userId) => ({ userId, status: "ASISTENCIA" })) })).status).toBe(200);
    expect(
      (
        await send(page, `/api/teams/${team.id}/attendance`, "PUT", {
          day: d2,
          marks: [
            { userId: jesus, status: "TARDE" },
            { userId: sofia, status: "FALTA" },
            { userId: pablo, status: "JUSTIFICADA" },
          ],
        })
      ).status,
    ).toBe(200);
    expect((await send(page, `/api/teams/${team.id}/attendance`, "PUT", { day: d2, marks: [{ userId: jesus, status: "TARDISIMO" }] })).status).toBe(400);

    // S-EVE: a request, and a match played under it with the sheet's statuses and a shoot-out.
    const ev = await api(page, `/api/teams/${team.id}/events`, {});
    expect(ev.status).toBe(201);
    expect(
      (
        await send(page, `/api/teams/${team.id}/events/${ev.data.id}`, "PUT", {
          name: "Copa ASFG",
          requestDate: today,
          dates: "14 – 16 nov",
          objective: "Foguear al equipo",
          invited: [jesus, sofia],
          outsideCategory: [sofia],
          individual: { [jesus]: "Gran torneo" },
        })
      ).status,
    ).toBe(200);
    const match = await api(page, `/api/teams/${team.id}/matches`, {
      day: d2,
      opponent: "Colegio Cervantes",
      kind: "TOURNAMENT",
      competition: "Copa ASFG",
      goalsFor: 1,
      goalsAgainst: 1,
      penaltiesFor: 4,
      penaltiesAgainst: 3,
      eventId: ev.data.id,
      players: [
        { userId: jesus, status: "ASISTIO" },
        { userId: sofia, status: "JUSTIFICADO" },
        { userId: pablo, status: "NO_SELECCIONADO" },
      ],
    });
    expect(match.status).toBe(201);

    // STA-GRAL and A-EV through the documents API; an unknown section is refused.
    const year = Number(today.slice(5, 7)) >= 8 ? Number(today.slice(0, 4)) : Number(today.slice(0, 4)) - 1;
    expect((await send(page, `/api/teams/${team.id}/docs/goals`, "PUT", { year, data: { objectives: ["Ganar la liga", "Mejorar el pase"], general: "Competir con orden" } })).status).toBe(200);
    expect((await send(page, `/api/teams/${team.id}/docs/nonsense`, "PUT", { year, data: {} })).status).toBe(404);
    const all5 = Object.fromEntries(
      ["puntualidad", "uniforme", "actitudinales", "imagen", "material", "bitacora", "evaluaciones", "guardias", "asistencia", "capacitacion", "eventos", "tecnologia", "reporta", "seguimiento", "reportes", "planDiario", "objetivos", "metodo", "calentamiento", "explica", "describeObjetivos", "equipo", "sigue", "retroIndividual", "retroFinal", "variedad", "uniformeAlumnos", "distraen", "dirige", "reglamento", "mision", "liderazgo", "consistente"].map((k) => [k, 5]),
    );
    expect((await send(page, `/api/teams/${team.id}/docs/selfEvalTerm`, "PUT", { year, data: { scores: { ...all5, puntualidad: 6 } } })).status).toBe(400);
    expect(
      (await send(page, `/api/teams/${team.id}/docs/selfEvalTerm`, "PUT", { year, data: { scores: all5, notes: { puntualidad: "Siempre a tiempo" }, date: today } })).status,
    ).toBe(200);

    // The goals page saves what's typed, without a save button.
    await page.goto(`/teams/${team.id}/goals?year=${year}`, { waitUntil: "networkidle" });
    await expect(page.locator('textarea[name="objectives"]')).toHaveValue("Ganar la liga\nMejorar el pase");
    await page.locator('textarea[name="specific"]').fill("Dominar la salida desde atrás");
    await expect(page.getByTestId("save-state")).toHaveText("Guardado");
    await page.reload({ waitUntil: "networkidle" });
    await expect(page.locator('textarea[name="specific"]')).toHaveValue("Dominar la salida desde atrás");

    // Taking a player off the team with a reason puts them on R-FI's "bajas".
    await page.goto(`/teams/${team.id}/roster`, { waitUntil: "networkidle" });
    const pabloRow = page.locator('li[data-player="Ruiz Pablo"]');
    await pabloRow.getByRole("button", { name: "Dar de baja" }).click();
    await pabloRow.locator('input[name="reason"]').fill("Cambio de escuela");
    await pabloRow.getByRole("button", { name: "Dar de baja: Ruiz Pablo" }).click();
    await expect(page.locator('li[data-player="Ruiz Pablo"]')).toHaveCount(0);

    // R-FI: the numbers are filled in; the place is typed and saved.
    await page.goto(`/teams/${team.id}/season?year=${year}`, { waitUntil: "networkidle" });
    await expect(page.locator('input[aria-label="¿Cuál fue la razón de su baja? 1"]')).toHaveValue("Cambio de escuela");
    await page.getByLabel("Lugar obtenido: Copa ASFG").fill("1er lugar");
    await expect(page.getByTestId("save-state")).toHaveText("Guardado");

    // A-EV shows the averages and the range the workbook computes.
    await page.goto(`/teams/${team.id}/self-eval?year=${year}&kind=term`, { waitUntil: "networkidle" });
    await expect(page.getByTestId("self-total")).toContainText("15");
    await expect(page.getByTestId("self-total")).toContainText("Excelente");

    // S-EVE lists the request with the linked result.
    await page.goto(`/teams/${team.id}/events`, { waitUntil: "networkidle" });
    await expect(page.locator("main")).toContainText("Copa ASFG");
    await expect(page.locator("main")).toContainText("1 – 1 (4–3)");

    // The hub shows which sheets have something in them.
    await page.goto(`/teams/${team.id}/bitacora?year=${year}`, { waitUntil: "networkidle" });
    await expect(page.locator("main li a", { hasText: "Objetivos y metas" })).toContainText("Con datos");

    // The official workbook.
    const { zip } = await downloadBitacora(page, `/api/teams/${team.id}/export?year=${year}`);
    await keepsTemplateParts(zip);
    expect(await zip.file("xl/workbook.xml")!.async("string")).toContain('fullCalcOnLoad="1"');

    // B2: names in roster order, the marks as the sheet's dropdown words, and the month's session count.
    const B2 = "B2- ASISTENCIAS";
    expect(await cell(zip, B2, "B6")).toBe("García Sofía");
    expect(await cell(zip, B2, "B7")).toBe("Mendoza Jesús");
    const blocks: Record<number, string> = { 8: "C", 9: "G", 10: "V", 11: "AK", 12: "AZ", 1: "BJ", 2: "BY", 3: "CN", 4: "DC", 5: "DR", 6: "EG" };
    const col = (day: string) => {
      const start = blocks[Number(day.slice(5, 7))];
      const n = start.split("").reduce((a, ch) => a * 26 + ch.charCodeAt(0) - 64, 0) + (day.slice(0, 7) === d1.slice(0, 7) && day === d2 ? 1 : 0);
      let s = "";
      for (let x = n; x > 0; x = Math.floor((x - 1) / 26)) s = String.fromCharCode(65 + ((x - 1) % 26)) + s;
      return s;
    };
    expect(await cell(zip, B2, `${col(d2)}6`)).toBe("Falta");
    expect(await cell(zip, B2, `${col(d2)}7`)).toBe("Tarde");
    expect(await cell(zip, B2, `${col(d1)}7`)).toBe("Asistencia");
    expect(await cell(zip, B2, `${blocks[Number(d2.slice(5, 7))]}42`)).toBe(d1.slice(0, 7) === d2.slice(0, 7) ? 2 : 1);

    // B3: the match in the first column of its term, statuses, a draw, and the shoot-out.
    const B3 = "B3- PARTIDOS";
    const m3 = Number(d2.slice(5, 7)) >= 8 ? "D" : "AE";
    expect(await cell(zip, B3, `${m3}4`)).toBe("TORNEO");
    expect(await cell(zip, B3, `${m3}6`)).toBe("VS COLEGIO CERVANTES");
    expect(await cell(zip, B3, `${m3}7`)).toBe("Justificado");
    expect(await cell(zip, B3, `${m3}8`)).toBe("Asistio");
    expect(await cell(zip, B3, `${m3}44`)).toBe(false);
    expect(await cell(zip, B3, `${m3}45`)).toBe(true);
    expect(await cell(zip, B3, `${m3}47`)).toBe(1);
    expect(await cell(zip, B3, `${m3}49`)).toBe("4 - 3");

    // STA-GRAL, R-FI, A-EV and S-EVE.
    expect(await cell(zip, "STA-GRAL", "O6")).toBe("Ganar la liga");
    expect(await cell(zip, "STA-GRAL", "A25")).toBe("Dominar la salida desde atrás");
    expect(await cell(zip, "R-FI", "H12")).toBe(2);
    expect(await cell(zip, "R-FI", "H13")).toBe(2); // sessions held, not the sum of attendances
    expect(await cell(zip, B3, Number(d2.slice(5, 7)) >= 8 ? "AQ27" : "AQ44")).toBe(1); // that term's stats panel
    expect(await cell(zip, "R-FI", "A56")).toBe("Ruiz Pablo");
    expect(await cell(zip, "R-FI", "E56")).toBe("Cambio de escuela");
    expect(await cell(zip, "R-FI", "A65")).toBe("Copa ASFG");
    expect(await cell(zip, "R-FI", "G65")).toBe("1er lugar");
    expect(await cell(zip, "A-EV (SEMESTRAL)", "E11")).toBe(5);
    expect(await cell(zip, "A-EV (SEMESTRAL)", "F11")).toBeNull();
    expect(await cell(zip, "A-EV (SEMESTRAL)", "H11")).toBe("Siempre a tiempo");
    expect(await cell(zip, "S-EVE", "B7")).toBe("Copa ASFG");
    expect(await cell(zip, "S-EVE", "A37")).toBe("Mendoza Jesús");
    expect(await cell(zip, "S-EVE", "F37")).toBe(1);
    expect(await cell(zip, "S-EVE", "H31")).toBe(1);
    expect(await cell(zip, "S-EVE", "H32")).toBe(1);
    expect(await cell(zip, "S-EVE", "H33")).toBe("1"); // text: the template formats the cell as a date
    expect(await cell(zip, "S-EVE", "G55")).toBe("1 - 1 (4-3 pen.)");
    expect(await cell(zip, "S-EVE", "D83")).toBe("Gran torneo");
  } finally {
    await db.$disconnect();
    await send(page, `/api/teams/${team.id}`, "DELETE");
  }
});
