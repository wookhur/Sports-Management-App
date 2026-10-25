import type { Lang } from "./i18n";

// Dates in the team log are calendar days ("YYYY-MM-DD") in the team's own
// calendar, the same keys attendance already uses. The arithmetic below is
// done in UTC so a day key never shifts by the server's time zone.

export function parseDay(day: string): Date {
  return new Date(`${day}T00:00:00Z`);
}

export function dayKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function addDays(day: string, n: number): string {
  return dayKey(new Date(parseDay(day).getTime() + n * 86_400_000));
}

/** The Monday of the week a day falls in. */
export function mondayOf(day: string): string {
  const dow = parseDay(day).getUTCDay(); // 0 = Sunday
  return addDays(day, dow === 0 ? -6 : 1 - dow);
}

export function isDayKey(s: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(parseDay(s).getTime()) && dayKey(parseDay(s)) === s;
}

// A school year runs August to July and splits into two terms: August to
// December, then January to July. "2026-S1" is the first term of the year that
// starts in August 2026; "2026-S2" is January to July 2027.

export type Term = `${number}-S${1 | 2}`;

export function schoolYearOf(day: string): number {
  const [y, m] = day.split("-").map(Number);
  return m >= 8 ? y : y - 1;
}

export function termOf(day: string): Term {
  const m = Number(day.slice(5, 7));
  return `${schoolYearOf(day)}-S${m >= 8 ? 1 : 2}` as Term;
}

export function isTerm(s: string): s is Term {
  return /^\d{4}-S[12]$/.test(s);
}

/** First and last day of a term, inclusive. */
export function termRange(term: Term): [string, string] {
  const y = Number(term.slice(0, 4));
  return term.endsWith("S1") ? [`${y}-08-01`, `${y}-12-31`] : [`${y + 1}-01-01`, `${y + 1}-07-31`];
}

export function yearRange(year: number): [string, string] {
  return [`${year}-08-01`, `${year + 1}-07-31`];
}

export function termsOfYear(year: number): [Term, Term] {
  return [`${year}-S1` as Term, `${year}-S2` as Term];
}

const TERM_LABEL: Record<Lang, (y: number, n: 1 | 2) => string> = {
  ko: (y, n) => `${y}-${String(y + 1).slice(2)} · ${n}학기`,
  en: (y, n) => `${y}-${String(y + 1).slice(2)} · Term ${n}`,
  es: (y, n) => `${y}-${String(y + 1).slice(2)} · ${n === 1 ? "1er" : "2do"} semestre`,
};

export function termLabel(term: Term, lang: Lang): string {
  return TERM_LABEL[lang](Number(term.slice(0, 4)), term.endsWith("S1") ? 1 : 2);
}

export function schoolYearLabel(year: number): string {
  return `${year}-${year + 1}`;
}

/** Month keys ("2026-09") from August to July of a school year. */
export function monthsOfYear(year: number): string[] {
  return Array.from({ length: 12 }, (_, i) => {
    const m = ((7 + i) % 12) + 1;
    return `${m >= 8 ? year : year + 1}-${String(m).padStart(2, "0")}`;
  });
}

const LOCALE: Record<Lang, string> = { ko: "ko-KR", en: "en-US", es: "es-MX" };

export function monthLabel(month: string, lang: Lang, style: "long" | "short" = "long"): string {
  return new Intl.DateTimeFormat(LOCALE[lang], { month: style, timeZone: "UTC" }).format(parseDay(`${month}-01`));
}

/** "Oct 26 – 30" style label for a training week (Monday to Friday). */
export function weekLabel(weekStart: string, lang: Lang): string {
  const fmt = new Intl.DateTimeFormat(LOCALE[lang], { month: "short", day: "numeric", timeZone: "UTC" });
  return `${fmt.format(parseDay(weekStart))} – ${fmt.format(parseDay(addDays(weekStart, 4)))}`;
}

export function shortDay(day: string, lang: Lang): string {
  return new Intl.DateTimeFormat(LOCALE[lang], { month: "short", day: "numeric", weekday: "short", timeZone: "UTC" }).format(
    parseDay(day),
  );
}
