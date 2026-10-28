import { prisma } from "@/lib/db";
import { loadTeamPage, rosterOf } from "@/lib/teamPage";
import { MATCH_KINDS, tl, type MatchKindKey } from "@/lib/teamLogText";
import { shortDay, termOf, termLabel, termRange, termsOfYear, yearRange } from "@/lib/season";
import { teamRecord } from "@/lib/matchStats";
import RecordTable from "@/components/teamlog/RecordTable";
import TeamLogShell from "@/components/teamlog/TeamLogShell";
import TermPicker, { readPeriod } from "@/components/teamlog/TermPicker";
import MatchBoard from "@/components/teamlog/MatchBoard";
import MatchSheet from "@/components/teamlog/MatchSheet";
import { bt } from "@/lib/bitacoraText";
import { readEvent } from "@/lib/bitacora";

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

  const [roster, matches, events] = await Promise.all([
    rosterOf(id),
    prisma.match.findMany({
      where: { teamId: id, day: { gte: from, lte: to } },
      orderBy: [{ day: "desc" }, { createdAt: "desc" }],
      include: { players: { select: { userId: true, status: true } } },
    }),
    isOwner ? prisma.teamEvent.findMany({ where: { teamId: id }, orderBy: { createdAt: "desc" } }) : Promise.resolve([]),
  ]);
  const played = (x: (typeof matches)[number]) => x.players.filter((p) => p.status === "ASISTIO");
  const sheetRoster = roster.map((r) => ({ userId: r.userId, name: r.user.name, number: r.number }));
  const chronological = [...matches].reverse();

  const recordRows = [
    ...(term ? [] : termsOfYear(year).map((t) => ({ label: termLabel(t, lang).split(" · ")[1], r: teamRecord(matches.filter((x) => termOf(x.day) === t)) }))),
    ...MATCH_KINDS.filter((k) => matches.some((x) => x.kind === k)).map((k) => ({
      label: s.matches.kinds[k],
      r: teamRecord(matches.filter((x) => x.kind === k)),
    })),
    { label: s.common.total, r: teamRecord(matches) },
  ];
  const appearances = new Map<string, number>();
  for (const x of matches) for (const p of played(x)) appearances.set(p.userId, (appearances.get(p.userId) ?? 0) + 1);

  return (
    <TeamLogShell team={team} active="matches" code={isOwner ? "B3" : undefined} isOwner={isOwner} lang={lang} title={s.matches.title} sub={s.matches.sub}>
      <TermPicker basePath={`/teams/${id}/matches`} year={year} term={term} currentYear={currentYear} lang={lang} />

      {isOwner && roster.length > 0 && (
        <section className="mt-4">
          <h2 className="text-sm font-bold">{bt(lang).sheet.title}</h2>
          <p className="mb-2 text-xs text-slate-600">{bt(lang).sheet.sub}</p>
          <MatchSheet
            key={matches
              .map((x) => `${x.id}:${x.goalsFor}-${x.goalsAgainst}-${x.penaltiesFor}-${x.penaltiesAgainst}:${x.players.map((p) => p.userId + p.status).join("")}`)
              .join(",")}
            teamId={id}
            lang={lang}
            roster={sheetRoster}
            matches={chronological.map((x) => ({
              id: x.id,
              dayLabel: shortDay(x.day, lang),
              opponent: x.opponent,
              kind: x.kind as MatchKindKey,
              goalsFor: x.goalsFor,
              goalsAgainst: x.goalsAgainst,
              penaltiesFor: x.penaltiesFor,
              penaltiesAgainst: x.penaltiesAgainst,
              status: Object.fromEntries(x.players.map((p) => [p.userId, p.status])),
            }))}
          />
        </section>
      )}

      <div className="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <MatchBoard
          teamId={id}
          lang={lang}
          canEdit={isOwner}
          today={today}
          roster={sheetRoster}
          events={events.map((ev) => ({ id: ev.id, name: readEvent(ev.data).name || bt(lang).events.untitled }))}
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
            penaltiesFor: x.penaltiesFor,
            penaltiesAgainst: x.penaltiesAgainst,
            eventId: x.eventId,
            players: played(x).map((p) => p.userId),
            status: isOwner ? Object.fromEntries(x.players.map((p) => [p.userId, p.status])) : {},
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
