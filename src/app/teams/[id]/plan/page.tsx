import { prisma } from "@/lib/db";
import { loadTeamPage } from "@/lib/teamPage";
import { tl } from "@/lib/teamLogText";
import { L } from "@/lib/localized";
import { SESSION_PARTS, INTENSITY, FUNDAMENTALS_REMINDER, categoryYears } from "@/lib/soccerSeasonPlan";
import { mondayOf, monthLabel, weekLabel } from "@/lib/season";
import TeamLogShell from "@/components/teamlog/TeamLogShell";
import PlanWeeks from "@/components/teamlog/PlanWeeks";

export const dynamic = "force-dynamic";

export default async function TeamPlanPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { lang, team, isOwner, today } = await loadTeamPage(id);
  const s = tl(lang).plan;

  const weeks = await prisma.teamPlanWeek.findMany({ where: { teamId: id }, orderBy: { weekStart: "asc" } });
  const thisMonday = mondayOf(today);
  const years = categoryYears(team.category);

  // Group by the month each week starts in, keeping the plan's own order.
  const months: { key: string; label: string; weeks: typeof weeks }[] = [];
  for (const w of weeks) {
    const key = w.weekStart.slice(0, 7);
    let m = months.at(-1);
    if (!m || m.key !== key) {
      m = { key, label: `${monthLabel(key, lang)} ${key.slice(0, 4)}`, weeks: [] };
      months.push(m);
    }
    m.weeks.push(w);
  }

  return (
    <TeamLogShell team={team} active="plan" code={isOwner ? "B5" : undefined} isOwner={isOwner} lang={lang} title={s.title} sub={s.sub}>
      <div className="grid gap-4 md:grid-cols-2">
        <section className="card p-5">
          <h2 className="text-sm font-bold">{s.session}</h2>
          <ol className="mt-3 space-y-2.5">
            {SESSION_PARTS.map((p) => (
              <li key={p.minutes} className="flex gap-3">
                <span className="w-14 shrink-0 rounded-lg bg-emerald-50 py-1 text-center text-sm font-bold tabular-nums text-emerald-800">
                  {p.minutes} {s.minutes}
                </span>
                <div>
                  <p className="text-sm font-semibold">{L(p.title, lang)}</p>
                  <p className="text-xs text-slate-600">{L(p.detail, lang)}</p>
                </div>
              </li>
            ))}
          </ol>
          <p className="mt-3 text-xs text-slate-500">{L(FUNDAMENTALS_REMINDER, lang)}</p>
        </section>
        <section className="card p-5">
          <h2 className="text-sm font-bold">{s.intensity}</h2>
          <ul className="mt-3 space-y-2">
            {INTENSITY.map((r) => {
              const ours = years.some((y) => y >= r.from && y <= r.to);
              return (
                <li key={r.from} className={`rounded-lg px-3 py-2 ${ours ? "bg-emerald-50 ring-1 ring-emerald-300" : "bg-slate-50"}`}>
                  <div className="flex items-center justify-between gap-2 text-sm">
                    <span className="font-medium">{s.intensityRow(r.from, r.to, r.game)}</span>
                    {ours && <span className="text-xs font-bold text-emerald-700">{s.yourTeam}</span>}
                  </div>
                  <div className="mt-1.5 flex h-1.5 overflow-hidden rounded-full bg-slate-200" aria-hidden>
                    <div className="bg-emerald-500" style={{ width: `${r.game}%` }} />
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      </div>

      <PlanWeeks
        teamId={team.id}
        lang={lang}
        canEdit={isOwner}
        thisMonday={thisMonday}
        months={months.map((m) => ({
          key: m.key,
          label: m.label,
          weeks: m.weeks.map((w) => ({
            weekStart: w.weekStart,
            range: weekLabel(w.weekStart, lang),
            unit: w.unit,
            objective: w.objective,
            note: w.note,
          })),
        }))}
      />
    </TeamLogShell>
  );
}
