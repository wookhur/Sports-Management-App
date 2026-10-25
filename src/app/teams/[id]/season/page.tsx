import { loadTeamPage } from "@/lib/teamPage";
import { tl } from "@/lib/teamLogText";
import { loadSeason } from "@/lib/seasonReport";
import { schoolYearLabel, termLabel } from "@/lib/season";
import TeamLogShell from "@/components/teamlog/TeamLogShell";
import TermPicker, { readPeriod } from "@/components/teamlog/TermPicker";
import RecordTable from "@/components/teamlog/RecordTable";
import PrintButton from "@/components/PrintButton";

export const dynamic = "force-dynamic";

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-slate-200 px-4 py-3">
      <p className="text-[11px] uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-bold tabular-nums">{value}</p>
    </div>
  );
}

/**
 * The end-of-year report a school asks each coach for, filled in from what
 * was recorded: roster size, sessions, matches, each player's attendance,
 * appearances and evaluations, and the competitions table.
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
  const { year, currentYear } = readPeriod(await searchParams, today, true);
  const data = await loadSeason(id, year);
  const sessions = data.sessionDays.length;

  return (
    <TeamLogShell
      team={team}
      active="season"
      isOwner={isOwner}
      lang={lang}
      title={`${s.season.title} ${schoolYearLabel(year)}`}
      sub={s.season.sub}
      actions={
        <>
          <a href={`/api/teams/${id}/export?year=${year}`} className="btn-ghost text-sm" download>
            {s.season.download}
          </a>
          <PrintButton label={s.season.print} />
        </>
      }
    >
      <div className="no-print mb-4 flex flex-wrap gap-2">
        {[currentYear, currentYear - 1, currentYear - 2].map((y) => (
          <a
            key={y}
            href={`/teams/${id}/season?year=${y}`}
            className={`rounded-full px-3 py-1 text-xs font-semibold ${y === year ? "bg-brand text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
          >
            {schoolYearLabel(y)}
          </a>
        ))}
      </div>

      <section>
        <h2 className="text-sm font-bold">{s.season.general}</h2>
        <p className="mt-1 text-sm text-slate-600">
          {s.season.coach}: {team.coach.name}
          {team.category ? ` · ${s.roster.category}: ${team.category}` : ""}
          {team.branch ? ` · ${s.roster.branch}: ${team.branch}` : ""}
        </p>
        <div className="mt-3 grid grid-cols-3 gap-3">
          <Stat label={s.season.playersNow} value={data.players.length} />
          <Stat label={s.season.sessions} value={sessions} />
          <Stat label={s.season.matchesPlayed} value={data.records.total.played} />
        </div>
      </section>

      <section className="mt-6">
        <h2 className="mb-2 text-sm font-bold">{s.season.list}</h2>
        {data.players.length === 0 ? (
          <div className="card p-6 text-center text-sm text-slate-600">{s.common.noMembers}</div>
        ) : (
          <div className="card overflow-x-auto">
            <table className="w-full min-w-[560px] text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs text-slate-500">
                  <th className="px-4 py-2 text-left font-semibold">{s.common.player}</th>
                  <th className="px-2 py-2 text-center font-semibold">{s.season.attended}</th>
                  <th className="px-2 py-2 text-center font-semibold">{s.attendance.excusedCol}</th>
                  <th className="px-2 py-2 text-center font-semibold">{s.season.matches}</th>
                  <th className="px-2 py-2 text-center font-semibold">{s.season.evalT1}</th>
                  <th className="px-3 py-2 text-center font-semibold">{s.season.evalT2}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.players.map((p) => {
                  const marked = p.present + p.absent + p.excused;
                  return (
                    <tr key={p.userId}>
                      <td className="px-4 py-2 font-medium">
                        {p.number != null && <span className="mr-1.5 tabular-nums text-slate-500">{p.number}</span>}
                        {p.name}
                      </td>
                      <td className="px-2 py-2 text-center tabular-nums">
                        {p.present}
                        {marked > 0 && <span className="text-xs text-slate-500"> ({Math.round((p.present / marked) * 100)}%)</span>}
                      </td>
                      <td className="px-2 py-2 text-center tabular-nums">{p.excused}</td>
                      <td className="px-2 py-2 text-center tabular-nums">{p.matches}</td>
                      {data.terms.map((t) => (
                        <td key={t} className="px-2 py-2 text-center tabular-nums">
                          {p.evals[t]?.percent != null ? `${p.evals[t]!.percent}%` : "–"}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="mt-6 grid gap-6 md:grid-cols-2">
        <div className="card overflow-x-auto">
          <h2 className="px-4 pt-4 text-sm font-bold">{s.matches.stats}</h2>
          <RecordTable
            lang={lang}
            rows={[
              ...data.terms.map((t) => ({ label: termLabel(t, lang), r: data.records.term[t] })),
              { label: s.common.total, r: data.records.total },
            ]}
          />
        </div>
        <div className="card overflow-x-auto">
          <h2 className="px-4 pt-4 text-sm font-bold">{s.season.competitions}</h2>
          {data.competitions.length === 0 ? (
            <p className="px-4 pb-4 pt-2 text-sm text-slate-500">{s.matches.noMatches}</p>
          ) : (
            <RecordTable
              lang={lang}
              rows={data.competitions.map((c) => ({ label: c.name ?? s.matches.kinds[c.kind], r: c.record }))}
            />
          )}
        </div>
      </section>
    </TeamLogShell>
  );
}
