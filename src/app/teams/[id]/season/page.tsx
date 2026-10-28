import { prisma } from "@/lib/db";
import { loadTeamPage } from "@/lib/teamPage";
import { tl } from "@/lib/teamLogText";
import { bt } from "@/lib/bitacoraText";
import { readDoc } from "@/lib/bitacora";
import { loadSeason } from "@/lib/seasonReport";
import { schoolYearLabel, termLabel } from "@/lib/season";
import TeamLogShell from "@/components/teamlog/TeamLogShell";
import { readPeriod } from "@/components/teamlog/TermPicker";
import YearChips from "@/components/teamlog/YearChips";
import RecordTable from "@/components/teamlog/RecordTable";
import ReportForm from "@/components/teamlog/ReportForm";
import PrintButton from "@/components/PrintButton";

export const dynamic = "force-dynamic";

/**
 * R-FI, the end-of-year report the school asks each coach for: the numbers
 * filled in from what was recorded, the written answers saved as typed.
 */
export default async function SeasonReportPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ year?: string }>;
}) {
  const { id } = await params;
  const { lang, team, isOwner, today } = await loadTeamPage(id, { ownerOnly: true });
  const s = tl(lang);
  const b = bt(lang);
  const { year, currentYear } = readPeriod(await searchParams, today, true);
  const [data, row] = await Promise.all([
    loadSeason(id, year),
    prisma.teamSeasonDoc.findUnique({ where: { teamId_year_kind: { teamId: id, year, kind: "report" } } }),
  ]);
  const termShort = (t: string) => termLabel(t as never, lang).split(" · ")[1];

  return (
    <TeamLogShell
      team={team}
      active="season"
      code="R-FI"
      isOwner={isOwner}
      lang={lang}
      title={`${b.report.title} ${schoolYearLabel(year)}`}
      sub={b.report.sub}
      actions={
        <>
          <a href={`/api/teams/${id}/export?year=${year}`} className="btn-primary text-sm" download>
            {b.hub.download}
          </a>
          <PrintButton label={s.season.print} />
        </>
      }
    >
      <YearChips basePath={`/teams/${id}/season`} year={year} currentYear={currentYear} lang={lang} />
      <p className="mt-3 text-sm text-slate-600">
        {s.season.coach}: {team.coach.name}
        {team.category ? ` · ${s.roster.category}: ${team.category}` : ""}
        {team.branch ? ` · ${s.roster.branch}: ${team.branch}` : ""}
      </p>
      <div className="mt-4">
        <ReportForm
          key={year}
          teamId={id}
          year={year}
          lang={lang}
          initial={readDoc("report", row?.data)}
          sessions={data.sessionDays.length}
          matches={data.records.total.played}
          players={data.players.map((p) => ({
            userId: p.userId,
            name: p.name,
            number: p.number,
            present: p.present,
            matches: p.matches,
            grades: data.terms.map((t) => ({
              term: termShort(t),
              attitude: p.evals[t]?.attitude ?? null,
              performance: p.evals[t]?.performance ?? null,
            })),
          }))}
          competitions={data.competitions.map((c) => ({ key: c.key, label: c.name ?? s.matches.kinds[c.kind], record: c.record }))}
        />
      </div>

      <section className="card mt-5 overflow-x-auto">
        <h2 className="px-4 pt-4 text-sm font-bold">{s.matches.stats}</h2>
        <RecordTable
          lang={lang}
          rows={[
            ...data.terms.map((t) => ({ label: termLabel(t, lang), r: data.records.term[t] })),
            { label: s.common.total, r: data.records.total },
          ]}
        />
      </section>
    </TeamLogShell>
  );
}
