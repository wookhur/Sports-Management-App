import Link from "next/link";
import { prisma } from "@/lib/db";
import { loadTeamPage, rosterOf } from "@/lib/teamPage";
import { matchResult, tl } from "@/lib/teamLogText";
import { bt } from "@/lib/bitacoraText";
import { readEvent } from "@/lib/bitacora";
import { shortDay } from "@/lib/season";
import TeamLogShell from "@/components/teamlog/TeamLogShell";
import EventForm from "@/components/teamlog/EventForm";
import NewEventButton from "@/components/teamlog/NewEventButton";

export const dynamic = "force-dynamic";

/** S-EVE: the team's event requests, one open at a time. */
export default async function EventsPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ e?: string }> }) {
  const { id } = await params;
  const { lang, team, isOwner } = await loadTeamPage(id, { ownerOnly: true });
  const s = tl(lang);
  const t = bt(lang).events;
  const { e } = await searchParams;

  const [events, roster] = await Promise.all([
    prisma.teamEvent.findMany({
      where: { teamId: id },
      orderBy: { createdAt: "desc" },
      include: { matches: { orderBy: { day: "asc" }, include: { players: { select: { userId: true, status: true } } } } },
    }),
    rosterOf(id),
  ]);
  const open = events.find((x) => x.id === e) ?? events[0] ?? null;
  const kindOf = (ev: (typeof events)[number]) => {
    const kinds = new Set(ev.matches.map((m) => m.kind));
    return kinds.size === 1 ? s.matches.kinds[[...kinds][0] as keyof typeof s.matches.kinds] : null;
  };

  const played: Record<string, number> = {};
  for (const m of open?.matches ?? []) for (const p of m.players) if (p.status === "ASISTIO") played[p.userId] = (played[p.userId] ?? 0) + 1;

  return (
    <TeamLogShell team={team} active="events" code="S-EVE" isOwner={isOwner} lang={lang} title={t.title} sub={t.sub}>
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="space-y-2">
          <NewEventButton teamId={id} label={t.new} error={s.common.errSave} />
          {events.length === 0 ? (
            <p className="card p-4 text-sm text-slate-600">{t.none}</p>
          ) : (
            <ul className="space-y-2">
              {events.map((ev) => {
                const d = readEvent(ev.data);
                const on = ev.id === open?.id;
                const kind = kindOf(ev);
                return (
                  <li key={ev.id}>
                    <Link
                      href={`/teams/${id}/events?e=${ev.id}`}
                      aria-current={on ? "page" : undefined}
                      className={`block rounded-xl border bg-white p-3 transition hover:border-slate-300 ${on ? "border-2 border-brand" : "border-slate-200"}`}
                    >
                      {kind && <span className="text-[10px] font-bold uppercase text-orange-800">{kind}</span>}
                      <span className="block text-sm font-bold">{d.name || t.untitled}</span>
                      <span className="block text-xs text-slate-600">{d.dates || d.requestDate.split("-").reverse().join("/")}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </aside>
        {open && (
          <EventForm
            key={open.id}
            teamId={id}
            eventId={open.id}
            lang={lang}
            initial={readEvent(open.data)}
            roster={roster.map((r) => ({ userId: r.userId, name: r.user.name, number: r.number }))}
            played={played}
            results={open.matches.map((m) => {
              const r = matchResult(m.goalsFor, m.goalsAgainst);
              const pens = m.penaltiesFor != null && m.penaltiesAgainst != null ? ` (${m.penaltiesFor}–${m.penaltiesAgainst})` : "";
              return {
                id: m.id,
                label: shortDay(m.day, lang),
                rival: m.opponent,
                won: r === "W",
                drawn: r === "D",
                score: `${m.goalsFor} – ${m.goalsAgainst}${pens}`,
              };
            })}
            sportLine={[team.category ? `${s.roster.category}: ${team.category}` : null, team.branch ? `${s.roster.branch}: ${team.branch}` : null]
              .filter(Boolean)
              .join(" · ")}
            coach={`${s.season.coach}: ${team.coach.name}`}
          />
        )}
      </div>
    </TeamLogShell>
  );
}
