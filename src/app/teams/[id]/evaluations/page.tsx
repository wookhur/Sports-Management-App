import { prisma } from "@/lib/db";
import { loadTeamPage, rosterOf } from "@/lib/teamPage";
import { EVAL_SCALE, evaluationPercent, tl } from "@/lib/teamLogText";
import TeamLogShell from "@/components/teamlog/TeamLogShell";
import TermPicker, { readPeriod } from "@/components/teamlog/TermPicker";
import EvaluationGrid from "@/components/teamlog/EvaluationGrid";

export const dynamic = "force-dynamic";

export default async function EvaluationsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ year?: string; term?: string }>;
}) {
  const { id } = await params;
  const { lang, team, isOwner, today } = await loadTeamPage(id, { ownerOnly: true });
  const s = tl(lang);
  const e = s.evaluations;
  const { year, term, currentYear } = readPeriod(await searchParams, today, false);
  const period = term!;

  const [roster, evals] = await Promise.all([
    rosterOf(id),
    prisma.playerEvaluation.findMany({ where: { teamId: id, period } }),
  ]);
  const byAthlete = new Map(evals.map((v) => [v.athleteId, v]));
  const done = roster.filter((r) => evaluationPercent(byAthlete.get(r.userId)?.scores ?? []) != null).length;

  return (
    <TeamLogShell team={team} active="evaluations" isOwner={isOwner} lang={lang} title={e.title} sub={e.sub}>
      <TermPicker basePath={`/teams/${id}/evaluations`} year={year} term={term} currentYear={currentYear} lang={lang} allowWhole={false} />

      <div className="mt-4 grid gap-4 md:grid-cols-[1fr_1fr_220px]">
        {[
          { title: e.attitude, codes: "A", from: 0, tone: "border-sky-200" },
          { title: e.performance, codes: "R", from: 5, tone: "border-emerald-200" },
        ].map((g) => (
          <section key={g.codes} className={`card border-l-4 p-4 ${g.tone}`}>
            <h2 className="text-sm font-bold">{g.title}</h2>
            <ol className="mt-2 space-y-1 text-xs text-slate-700">
              {e.criteria.slice(g.from, g.from + 5).map((c, i) => (
                <li key={c}>
                  <span className="mr-1 font-bold text-slate-500">
                    {g.codes}
                    {i + 1}
                  </span>
                  {c}
                </li>
              ))}
            </ol>
          </section>
        ))}
        <section className="card p-4">
          <h2 className="text-sm font-bold">{e.score}</h2>
          <ul className="mt-2 space-y-0.5 text-xs text-slate-700">
            {EVAL_SCALE.map((v) => (
              <li key={v}>
                <span className="mr-1.5 font-bold tabular-nums">{v}</span>
                {e.scale[v]}
              </li>
            ))}
          </ul>
        </section>
      </div>

      {roster.length === 0 ? (
        <div className="card mt-4 p-6 text-center text-sm text-slate-600">{s.common.noMembers}</div>
      ) : (
        <>
          <p className="mb-2 mt-5 text-sm text-slate-600">{e.progress(done, roster.length)}</p>
          <EvaluationGrid
            teamId={id}
            period={period}
            lang={lang}
            players={roster.map((r) => {
              const v = byAthlete.get(r.userId);
              return { userId: r.userId, name: r.user.name, number: r.number, scores: v?.scores ?? [], note: v?.note ?? null };
            })}
          />
        </>
      )}
    </TeamLogShell>
  );
}
