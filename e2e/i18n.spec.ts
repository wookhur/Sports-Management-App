import { test, expect, type BrowserContext, type Page } from "@playwright/test";
import { login } from "./helpers";

// Guards against Korean copy leaking into the EN/ES UI. Content authored by
// users (blog posts, board posts, athlete guides) is deliberately left in
// whatever language it was written in — these routes are chrome + reference
// data, which must follow the selected language.
const HANGUL = /[가-힣]/;

// NOTE: /board and /blog are excluded — they show user-authored posts, which
// stay in whatever language the author wrote them in. So are /records and
// /stars: the first shows athletes' own notes, the second deliberately prints
// each athlete's name in their native script.
const ROUTES = [
  "/",
  "/journal",
  "/missions",
  "/games/bullseye",
  "/leaderboard",
  "/profile",
  "/training",
  "/sports/lacrosse",
  "/sports/soccer",
  "/sports/lacrosse/guides/cradling-basics",
  // Reference content — the bulk of it, and the part that silently shipped
  // Korean-only for months because nothing checked these pages.
  "/sports/lacrosse/program",
  "/sports/soccer/program",
  "/sports/soccer/drills",
  "/sports/soccer/drills/dribble-gates",
  "/sports/swimming/workouts",
];

async function setLang(ctx: BrowserContext, page: Page, lang: string) {
  await ctx.addCookies([{ name: "lang", value: lang, url: page.url().split("/").slice(0, 3).join("/") }]);
}

for (const lang of ["en", "es"]) {
  test(`no Korean leaks into the ${lang.toUpperCase()} UI`, async ({ page, context }) => {
    await login(page);
    await setLang(context, page, lang);

    const leaks: string[] = [];
    for (const route of ROUTES) {
      await page.goto(route, { waitUntil: "networkidle" });
      const text = await page.locator("main").innerText();
      // People's names are user data and stay in whatever language they were
      // entered in — including the single-character avatar initials derived
      // from them. Strip those before looking for untranslated chrome.
      const cleaned = text
        .replace(/이선수|김코치|박태환|손흥민|clare nam/gi, "")
        .replace(/(^|\s)[가-힣](?=\s|$)/g, "$1") // lone avatar initials
        .replace(/^\s*$/gm, "");
      if (HANGUL.test(cleaned)) {
        const sample = (cleaned.match(new RegExp(`.{0,40}${HANGUL.source}.{0,40}`)) ?? [""])[0];
        leaks.push(`${route} → "${sample.trim()}"`);
      }
    }
    expect(leaks, `Korean found in ${lang} UI`).toEqual([]);
  });
}

test("Korean UI still renders Korean", async ({ page, context }) => {
  await login(page);
  await setLang(context, page, "ko");
  await page.goto("/sports/lacrosse", { waitUntil: "networkidle" });
  await expect(page.locator("main")).toContainText("크레들링");
});
