import { prisma } from "@/lib/db";
import { loadTeamPage, rosterOf } from "@/lib/teamPage";
import { MATCH_KINDS, tl, type MatchKindKey } from "@/lib/teamLogText";
import { shortDay, termOf, termLabel, termRange, termsOfYear, yearRange } from "@/lib/season";
import { teamRecord } from "@/lib/matchStats";
import RecordTable from "@/components/teamlog/RecordTable";
import TeamLogShell from "@/components/teamlog/TeamLogShell";
import TermPicker, { readPeriod } from "@/components/teamlog/TermPicker";
import MatchBoard from "@/components/teamlog/MatchBoard";

export const dynamic = "force-dynamic";

export default async function MatchesPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ year?: string; term?: string }>;
}) {
  const { id } = await params;
  const { lang, team, isOwner, today } = await loadTeamPage(id);
  const s = tl(lang);
  const { year, term, currentYear } = readPeriod(await searchParams, today, true);
  const [from, to] = term ? termRange(term) : yearRange(year);

  const [roster, matches] = await Promise.all([
    rosterOf(id),
    prisma.match.findMany({
      where: { teamId: id, day: { gte: from, lte: to } },
      orderBy: [{ day: "desc" }, { createdAt: "desc" }],
      include: { players: { select: { userId: true } } },
    }),
  ]);

  const recordRows = [
    ...(term ? [] : termsOfYear(year).map((t) => ({ label: termLabel(t, lang).split(" · ")[1], r: teamRecord(matches.filter((x) => termOf(x.day) === t)) }))),
    ...MATCH_KINDS.filter((k) => matches.some((x) => x.kind === k)).map((k) => ({
      label: s.matches.kinds[k],
      r: teamRecord(matches.filter((x) => x.kind === k)),
    })),
    { label: s.common.total, r: teamRecord(matches) },
  ];
  const appearances = new Map<string, number>();
  for (const x of matches) for (const p of x.players) appearances.set(p.userId, (appearances.get(p.userId) ?? 0) + 1);

  return (
    <TeamLogShell team={team} active="matches" isOwner={isOwner} lang={lang} title={s.matches.title} sub={s.matches.sub}>
      <TermPicker basePath={`/teams/${id}/matches`} year={year} term={term} currentYear={currentYear} lang={lang} />

      <div className="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <MatchBoard
          teamId={id}
          lang={lang}
          canEdit={isOwner}
          today={today}
          roster={roster.map((r) => ({ userId: r.userId, name: r.user.name, number: r.number }))}
          matches={matches.map((x) => ({
            id: x.id,
            day: x.day,
            dayLabel: shortDay(x.day, lang),
            opponent: x.opponent,
            kind: x.kind as MatchKindKey,
            competition: x.competition,
            goalsFor: x.goalsFor,
            goalsAgainst: x.goalsAgainst,
            note: x.note,
            players: x.players.map((p) => p.userId),
          }))}
        />
        <aside className="space-y-4">
          <section className="card overflow-x-auto">
            <h2 className="px-4 pt-4 text-sm font-bold">{s.matches.stats}</h2>
            <RecordTable lang={lang} rows={recordRows} />
          </section>
          {roster.length > 0 && matches.length > 0 && (
            <section className="card p-4">
              <h2 className="text-sm font-bold">{s.matches.byPlayer}</h2>
              <ul className="mt-2 space-y-1 text-sm">
                {roster.map((r) => (
                  <li key={r.userId} className="flex justify-between gap-2">
                    <span className="truncate">{r.user.name}</span>
                    <span className="tabular-nums text-slate-600">
                      {appearances.get(r.userId) ?? 0}/{matches.length}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </aside>
      </div>
    </TeamLogShell>
  );
}
