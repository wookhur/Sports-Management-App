import { test, expect, type BrowserContext, type Page } from "@playwright/test";
import { login } from "./helpers";
import { langFromAcceptLanguage } from "../src/lib/i18n";

// Guards against Korean copy leaking into the EN/ES UI. Content authored by
// users (blog posts, board posts, athlete guides) is deliberately left in
// whatever language it was written in — these routes are chrome + reference
// data, which must follow the selected language.
const HANGUL = /[가-힣]/;

// NOTE: /board and /blog are excluded — they show user-authored posts, which
// stay in whatever language the author wrote them in. So are /records and
// /stars: the first shows athletes' own notes, the second deliberately prints
// each athlete's name in their native script.
//
// That rule is about content *people* write. It was also sheltering content we
// ship: every seeded board post was Korean, so an English visitor opened
// Community and found the entire page in a language they could not read. The
// sweep still cannot run over /board without failing on genuine Korean posts,
// so the seeded content is checked on its own below.
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
        .replace(/박태환|손흥민|clare nam/gi, "")
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

// A first-time visitor has no cookie, so the landing page — the one screen
// that has to make sense to a stranger — is picked from Accept-Language.
test.describe("first visit falls back to the browser's language", () => {
  test("picks a supported language, matching on the base tag", () => {
    expect(langFromAcceptLanguage("en-US,en;q=0.9")).toBe("en");
    expect(langFromAcceptLanguage("es-419")).toBe("es");
    expect(langFromAcceptLanguage("ko-KR")).toBe("ko");
  });

  test("honours quality values rather than header order", () => {
    expect(langFromAcceptLanguage("fr;q=0.9,en;q=0.8,es;q=1.0")).toBe("es");
    expect(langFromAcceptLanguage("en;q=0.4,ko;q=0.8")).toBe("ko");
  });

  test("skips languages we do not speak", () => {
    expect(langFromAcceptLanguage("fr-FR,de;q=0.9,en;q=0.5")).toBe("en");
  });

  test("returns null when there is nothing to go on, so Korean stays default", () => {
    expect(langFromAcceptLanguage("")).toBeNull();
    expect(langFromAcceptLanguage(null)).toBeNull();
    expect(langFromAcceptLanguage("fr-FR,de")).toBeNull();
    expect(langFromAcceptLanguage("*")).toBeNull();
  });

  // One malformed entry must not be read as q=0 and reshuffle the rest.
  test("a malformed quality value drops that entry only", () => {
    expect(langFromAcceptLanguage("en;q=abc,es")).toBe("es");
  });
});


test("the community board ships English seed content", async ({ page, context }) => {
  // Not a sweep for Hangul — a real Korean post from a real user is fine and
  // must not fail this. It pins the posts we seed, by their English titles.
  await login(page);
  await setLang(context, page, "en");
  await page.goto("/board", { waitUntil: "networkidle" });
  await expect(page.locator("main")).toContainText("Welcome to the community board");
  await expect(page.locator("main")).not.toContainText("자유게시판을 열었어요");
});
