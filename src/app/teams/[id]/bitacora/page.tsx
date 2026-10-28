import Link from "next/link";
import { prisma } from "@/lib/db";
import { loadTeamPage } from "@/lib/teamPage";
import { bt } from "@/lib/bitacoraText";
import { termsOfYear, yearRange } from "@/lib/season";
import TeamLogShell from "@/components/teamlog/TeamLogShell";
import { readPeriod } from "@/components/teamlog/TermPicker";
import YearChips from "@/components/teamlog/YearChips";

export const dynamic = "force-dynamic";

/**
 * The bitácora's front page: every sheet of the school's workbook, in order,
 * with whether anything is recorded in it yet, and the official download.
 */
export default async function BitacoraPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ year?: string }> }) {
  const { id } = await params;
  const { lang, team, isOwner, today } = await loadTeamPage(id, { ownerOnly: true });
  const h = bt(lang).hub;
  const { year, currentYear } = readPeriod(await searchParams, today, true);
  const [from, to] = yearRange(year);
  const inYear = { teamId: id, day: { gte: from, lte: to } };

  const [docs, roster, attendance, matches, evals, plan, events] = await Promise.all([
    prisma.teamSeasonDoc.findMany({ where: { teamId: id, year }, select: { kind: true } }),
    prisma.teamMember.count({ where: { teamId: id } }),
    prisma.attendance.count({ where: inYear }),
    prisma.match.count({ where: inYear }),
    prisma.playerEvaluation.count({ where: { teamId: id, period: { in: termsOfYear(year) } } }),
    prisma.teamPlanWeek.count({ where: { teamId: id, weekStart: { gte: from, lte: to } } }),
    prisma.teamEvent.count({ where: { teamId: id, year } }),
  ]);
  const has = new Set(docs.map((d) => d.kind));

  const cards: { key: keyof typeof h.sheets; href: string; count: number | null; filled: boolean }[] = [
    { key: "sta", href: "goals", count: null, filled: has.has("goals") },
    { key: "b1", href: "roster", count: roster, filled: roster > 0 },
    { key: "b2", href: "attendance", count: attendance, filled: attendance > 0 },
    { key: "b3", href: "matches", count: matches, filled: matches > 0 },
    { key: "b4", href: "evaluations", count: evals, filled: evals > 0 },
    { key: "b5", href: "plan", count: plan, filled: plan > 0 },
    { key: "rfi", href: "season", count: null, filled: has.has("report") },
    { key: "seve", href: "events", count: events, filled: events > 0 },
    { key: "aev", href: "self-eval", count: null, filled: has.has("selfEvalTerm") || has.has("selfEvalFinal") },
  ];

  return (
    <TeamLogShell team={team} active="bitacora" isOwner={isOwner} lang={lang} title={h.title} sub={h.sub}>
      <YearChips basePath={`/teams/${id}/bitacora`} year={year} currentYear={currentYear} lang={lang} />

      <section className="card mt-4 flex flex-wrap items-center justify-between gap-3 border-emerald-200 bg-emerald-50 p-5">
        <div>
          <p className="text-sm font-bold text-emerald-950">{h.download}</p>
          <p className="text-xs text-emerald-900">{h.downloadSub}</p>
        </div>
        <a href={`/api/teams/${id}/export?year=${year}`} className="btn-primary text-sm" download>
          {h.download}
        </a>
      </section>

      <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <li key={c.key}>
            <Link
              href={`/teams/${id}/${c.href}${["goals", "season", "self-eval", "attendance"].includes(c.href) ? `?year=${year}` : ""}`}
              className="card flex h-full flex-col gap-1 p-4 transition hover:border-slate-300 hover:shadow-sm"
            >
              <span className="flex items-center justify-between gap-2">
                <span className="rounded bg-slate-900 px-1.5 py-0.5 text-[10px] font-bold text-white">{h.sheets[c.key].code}</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${c.filled ? "bg-emerald-100 text-emerald-900" : "bg-slate-100 text-slate-600"}`}
                >
                  {c.filled ? h.filled : h.empty}
                  {c.count ? ` · ${c.count}` : ""}
                </span>
              </span>
              <span className="text-sm font-bold">{h.sheets[c.key].name}</span>
              <span className="mt-auto text-xs font-semibold text-brand">{h.open} →</span>
            </Link>
          </li>
        ))}
      </ul>
    </TeamLogShell>
  );
}
