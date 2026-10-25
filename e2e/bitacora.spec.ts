import { test, expect, type Page } from "@playwright/test";
import ExcelJS from "exceljs";
import { login, api, ATHLETE, COACH } from "./helpers";

// The coach's season log: a weekly plan, roster-only players, excused
// absences on past days, matches, evaluations and the Excel export. Each test
// makes its own team and deletes it, so they don't lean on seeded state.

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
  await jesus.getByRole("button", { name: "Save" }).click();
  await expect(jesus).toContainText("2013-04-02 · María Mendoza · 33 1234 5678");

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
  await page.getByRole("radiogroup", { name: "Ana López" }).getByRole("radio", { name: "Present" }).click();
  await page.locator("#attendance").getByRole("button", { name: "Save" }).click();
  await expect(page.locator("#attendance")).toContainText("Saved 2");

  await page.goto(`/teams/${team.id}/attendance?year=${day.slice(5, 7) >= "08" ? day.slice(0, 4) : Number(day.slice(0, 4)) - 1}`, {
    waitUntil: "networkidle",
  });
  const row = page.locator("tr", { hasText: "Mendoza Jesús" });
  await expect(row.locator("td").nth(-2)).toHaveText("1"); // excused
  await expect(page.locator("tr", { hasText: "Ana López" }).locator("td").last()).toHaveText("100%");

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
  // A win, everyone ticked by default.
  await expect(page.locator("main")).toContainText("Quién jugó: 2");
  const total = page.locator("tr", { hasText: "Total" });
  await expect(total).toContainText("1"); // played
  await expect(total.locator("td").last()).toHaveText("+2");

  // The athlete sees the result but can't add one.
  await athletePage.goto(`/teams/${team.id}/matches`, { waitUntil: "networkidle" });
  await expect(athletePage.locator("main")).toContainText("Atlas Chapalita");
  const write = await api(athletePage, `/api/teams/${team.id}/matches`, {
    day: "2026-09-20", opponent: "x", kind: "LEAGUE", goalsFor: 0, goalsAgainst: 0, players: [],
  });
  expect(write.status).toBe(404);
  // Evaluations, roster and the season report are the coach's alone.
  for (const tab of ["evaluations", "roster", "season"]) {
    const res = await athletePage.goto(`/teams/${team.id}/${tab}`);
    expect(res?.status(), tab).toBe(404);
  }
  await other.close();
  await send(page, `/api/teams/${team.id}`, "DELETE");
});

test("evaluations score ten points into a percentage and come out in the Excel export", async ({ page }) => {
  await login(page, COACH);
  await setLang(page, "es");
  const team = await newTeam(page, "Eval Squad");
  await api(page, `/api/teams/${team.id}/roster`, { names: ["Mendoza Jesús"] });
  expect((await send(page, `/api/teams/${team.id}`, "PATCH", { category: "2012-2013", branch: "Varonil", timeZone: "America/Mexico_City" })).status).toBe(200);
  expect((await send(page, `/api/teams/${team.id}`, "PATCH", { timeZone: "Mars/Olympus" })).status).toBe(400);

  await page.goto(`/teams/${team.id}/evaluations`, { waitUntil: "networkidle" });
  const row = page.locator('li[data-player="Mendoza Jesús"]');
  await expect(row.getByTestId("eval-pct")).toHaveText("Sin calificar");
  const selects = row.locator("select");
  for (let i = 0; i < 10; i++) await selects.nth(i).selectOption(i < 5 ? "5" : "4");
  await expect(row.getByTestId("eval-pct")).toHaveText("90%");
  await row.getByRole("button", { name: "Guardar" }).click();
  await expect(row).toContainText("Guardado");

  await page.reload({ waitUntil: "networkidle" });
  await expect(page.locator('li[data-player="Mendoza Jesús"]').getByTestId("eval-pct")).toHaveText("90%");

  // The season report and the workbook both carry it.
  await page.goto(`/teams/${team.id}/season`, { waitUntil: "networkidle" });
  await expect(page.locator("main")).toContainText("2012-2013");
  const bytes = await page.evaluate(async (id) => {
    const res = await fetch(`/api/teams/${id}/export`);
    return { type: res.headers.get("content-type"), data: Array.from(new Uint8Array(await res.arrayBuffer())) };
  }, team.id);
  expect(bytes.type).toContain("spreadsheetml");
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(Buffer.from(bytes.data) as unknown as ExcelJS.Buffer);
  expect(wb.worksheets.map((w) => w.name)).toEqual(["Plantilla", "Asistencia", "Partidos", "Evaluaciones", "Plan de temporada"]);
  const ev = wb.getWorksheet("Evaluaciones")!;
  const evRow = ev.getRow(5);
  expect(evRow.getCell(2).value).toBe("Mendoza Jesús");
  expect(evRow.getCell(13).value).toBe(0.9);

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
