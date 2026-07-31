import { test, expect } from "@playwright/test";
import { buildDigest, isWorthSending, MAX_LISTED, type Digest } from "../src/lib/digest";
import { digestHtml, digestText, digestSubject } from "../src/lib/digestEmail";
import type { TeamReport, ReportHighlight } from "../src/lib/report";
import type { TriageItem } from "../src/lib/triage";

// The digest is the only thing this app sends to someone who isn't looking at
// it, so the rules about *not* sending, and about what a name is attached to,
// are the ones worth pinning down.

const APP = "https://example.test";

function report(over: Partial<TeamReport> = {}): TeamReport {
  return {
    period: { from: "2026-07-25", to: "2026-07-31", days: 7, weeks: 1 },
    squadSize: 4,
    totals: { sessions: 12, minutes: 600, activeAthletes: 3, attendance: 0.4, pbs: 0 },
    rows: [],
    highlights: [],
    watch: [],
    ...over,
  };
}

function item(name: string, flag: TriageItem["flag"], value: number | null = 1.7): TriageItem {
  return { athleteId: name, name, flag, value, sessions14: 8, weekLoad: 500 };
}

function pb(name: string, day = "2026-07-30"): ReportHighlight {
  return { athleteId: name, name, metricKey: "freestyle_50m", metricName: "자유형 50m", durationMs: 29_000, day };
}

test("the week's numbers carry through, with a delta against last week", () => {
  const d = buildDigest("Clare", report(), { items: [] }, 9);
  expect(d.sessions).toBe(12);
  expect(d.sessionsDelta).toBe(3);
  expect(d.activeAthletes).toBe(3);
  expect(d.squadSize).toBe(4);
});

test("a quieter week reports a negative delta rather than hiding it", () => {
  const d = buildDigest("Clare", report({ totals: { ...report().totals, sessions: 4 } }), { items: [] }, 10);
  expect(d.sessionsDelta).toBe(-6);
});

test("breakthroughs are left to the highlights section, not repeated as to-dos", () => {
  const d = buildDigest(
    "Clare",
    report(),
    { items: [item("Spiking", "injuryRisk"), item("Winner", "breakthrough", 2)] },
    0,
  );
  expect(d.attention.map((a) => a.name)).toEqual(["Spiking"]);
});

test("long lists are capped and the remainder is counted, never silently dropped", () => {
  const many = Array.from({ length: MAX_LISTED + 3 }, (_, i) => item(`A${i}`, "disengaged", 9));
  const pbs = Array.from({ length: MAX_LISTED + 2 }, (_, i) => pb(`B${i}`));
  const d = buildDigest("Clare", report({ highlights: pbs }), { items: many }, 0);

  expect(d.attention).toHaveLength(MAX_LISTED);
  expect(d.attentionOverflow).toBe(3);
  expect(d.highlights).toHaveLength(MAX_LISTED);
  expect(d.highlightsOverflow).toBe(2);
});

test("a coach with no athletes is never emailed", () => {
  const empty = report({ squadSize: 0, totals: { sessions: 0, minutes: 0, activeAthletes: 0, attendance: 0, pbs: 0 } });
  expect(isWorthSending(buildDigest("Clare", empty, { items: [] }, 0))).toBe(false);
});

test("a week with nothing in it is not worth an email", () => {
  const quiet = report({ totals: { sessions: 0, minutes: 0, activeAthletes: 0, attendance: 0, pbs: 0 } });
  expect(isWorthSending(buildDigest("Clare", quiet, { items: [] }, 0))).toBe(false);
});

test("a silent week still sends when somebody needs attention", () => {
  const quiet = report({ totals: { sessions: 0, minutes: 0, activeAthletes: 0, attendance: 0, pbs: 0 } });
  const d = buildDigest("Clare", quiet, { items: [item("Gone", "disengaged", 21)] }, 0);
  expect(isWorthSending(d)).toBe(true);
});

test("a quiet week with a personal best still sends", () => {
  const quiet = report({
    totals: { sessions: 0, minutes: 0, activeAthletes: 0, attendance: 0, pbs: 1 },
    highlights: [pb("Ana")],
  });
  expect(isWorthSending(buildDigest("Clare", quiet, { items: [] }, 0))).toBe(true);
});

// --- rendering -------------------------------------------------------------

function sample(): Digest {
  return buildDigest(
    "Clare",
    report({ highlights: [pb("Ana")] }),
    { items: [item("Spiking", "injuryRisk", 1.72)] },
    9,
  );
}

test("the email names the athletes and gives each a suggested action", () => {
  const html = digestHtml(sample(), "en", APP);
  expect(html).toContain("Spiking");
  expect(html).toContain("Ana");
  expect(html).toContain("1.72"); // the number behind the flag
  expect(html).toContain(`${APP}/coach`);
});

test("the email renders in the coach's own language", () => {
  const d = sample();
  expect(digestSubject(d, "en")).toContain("Weekly squad digest");
  expect(digestSubject(d, "ko")).toContain("주간 스쿼드 요약");
  expect(digestSubject(d, "es")).toContain("Resumen semanal");
  expect(digestHtml(d, "es", APP)).toContain("A quién revisar");
});

test("no Korean leaks into a non-Korean email", () => {
  for (const lang of ["en", "es"] as const) {
    const body = digestHtml(sample(), lang, APP) + digestText(sample(), lang, APP);
    // Athlete and metric names are data; strip the ones this fixture supplies.
    const chrome = body.replace(/자유형 50m/g, "");
    expect(chrome, `${lang} email`).not.toMatch(/[가-힣]/);
  }
});

test("the email is self-contained: no external images, scripts or stylesheets", () => {
  const html = digestHtml(sample(), "en", APP);
  expect(html).not.toMatch(/<script/i);
  expect(html).not.toMatch(/<img/i);
  expect(html).not.toMatch(/<link[^>]+stylesheet/i);
  // Inline styles only — a <style> block gets stripped by several clients.
  expect(html).not.toMatch(/<style/i);
});

test("athlete names are escaped, so a name can never inject markup", () => {
  const d = buildDigest("Clare", report(), { items: [item('<img src=x onerror="alert(1)">', "disengaged", 9)] }, 0);
  const html = digestHtml(d, "en", APP);
  expect(html).not.toContain("<img src=x");
  expect(html).toContain("&lt;img src=x");
});

test("a plain-text alternative is always produced alongside the HTML", () => {
  const text = digestText(sample(), "en", APP);
  expect(text).toContain("Spiking");
  expect(text).toContain("Ana");
  expect(text).not.toMatch(/<[a-z]/i); // genuinely plain
});

test("an empty attention list reads as good news, not as a blank section", () => {
  const d = buildDigest("Clare", report(), { items: [] }, 0);
  expect(digestText(d, "en", APP)).toContain("Nobody needed action this week");
});
