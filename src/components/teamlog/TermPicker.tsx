import Link from "next/link";
import type { Lang } from "@/lib/i18n";
import { schoolYearLabel, termLabel, termsOfYear, type Term } from "@/lib/season";
import { tl } from "@/lib/teamLogText";

/**
 * Pick a school year and a term (or the whole year) through the URL, so a
 * period can be bookmarked and printed. Offers the current year and the two
 * before it.
 */
export default function TermPicker({
  basePath,
  year,
  term,
  currentYear,
  lang,
  allowWhole = true,
}: {
  basePath: string;
  year: number;
  term: Term | null;
  currentYear: number;
  lang: Lang;
  allowWhole?: boolean;
}) {
  const s = tl(lang).common;
  const chip = (href: string, on: boolean, label: string) => (
    <Link
      key={href}
      href={href}
      aria-current={on ? "true" : undefined}
      className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
        on ? "bg-brand text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
      }`}
    >
      {label}
    </Link>
  );
  const years = [currentYear, currentYear - 1, currentYear - 2];
  return (
    <div className="no-print flex flex-wrap items-center gap-2">
      <span className="text-xs text-slate-500">{s.year}</span>
      {years.map((y) => chip(`${basePath}?year=${y}${term ? `&term=${term.slice(5)}` : ""}`, y === year, schoolYearLabel(y)))}
      <span className="ml-2 text-xs text-slate-500">{s.term}</span>
      {allowWhole && chip(`${basePath}?year=${year}`, term === null, s.total)}
      {termsOfYear(year).map((t) => chip(`${basePath}?year=${year}&term=${t.slice(5)}`, t === term, termLabel(t, lang).split(" · ")[1]))}
    </div>
  );
}

/** Read ?year= and ?term= (S1/S2) with sensible defaults. */
export function readPeriod(
  q: { year?: string; term?: string },
  today: string,
  defaultWhole: boolean,
): { year: number; term: Term | null; currentYear: number } {
  const month = Number(today.slice(5, 7));
  const currentYear = month >= 8 ? Number(today.slice(0, 4)) : Number(today.slice(0, 4)) - 1;
  const y = Number(q.year);
  const year = Number.isInteger(y) && y > 2000 && y <= currentYear ? y : currentYear;
  const t = q.term === "S1" || q.term === "S2" ? (`${year}-${q.term}` as Term) : null;
  if (t || defaultWhole) return { year, term: t, currentYear };
  return { year, term: `${year}-S${month >= 8 ? 1 : 2}` as Term, currentYear };
}
