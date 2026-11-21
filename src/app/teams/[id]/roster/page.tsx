import { loadTeamPage, rosterOf } from "@/lib/teamPage";
import { tl } from "@/lib/teamLogText";
import { TEAM_TIME_ZONES, teamTimeZone } from "@/lib/teamAccess";
import TeamLogShell from "@/components/teamlog/TeamLogShell";
import RosterEditor, { AddPlayersForm, NewPlayerForm, TeamDetailsForm } from "@/components/teamlog/RosterEditor";
import { bt } from "@/lib/bitacoraText";

export const dynamic = "force-dynamic";

export default async function RosterPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { lang, team, isOwner } = await loadTeamPage(id, { ownerOnly: true });
  const s = tl(lang);
  const roster = await rosterOf(id);
  const tz = teamTimeZone(team);

  return (
    <TeamLogShell team={team} active="roster" code={isOwner ? "B1" : undefined} isOwner={isOwner} lang={lang} title={s.roster.title} sub={s.roster.sub}>
      <div className="space-y-6">
        {/* Adding a student comes first: it is what a coach does most here,
            and no student needs an account for it. */}
        <NewPlayerForm teamId={id} lang={lang} />
        {roster.length === 0 ? (
          <div className="card p-6 text-center text-sm text-slate-600">{bt(lang).addStudent.emptyOwner}</div>
        ) : (
          <RosterEditor
            teamId={id}
            lang={lang}
            rows={roster.map((m) => ({
              userId: m.userId,
              name: m.user.name,
              managed: m.user.managed,
              number: m.number,
              birthDate: m.birthDate,
              curp: m.curp,
              guardian1Name: m.guardian1Name,
              guardian1Email: m.guardian1Email,
              guardian1Phone: m.guardian1Phone,
              guardian2Name: m.guardian2Name,
              guardian2Email: m.guardian2Email,
              guardian2Phone: m.guardian2Phone,
            }))}
          />
        )}
        <AddPlayersForm teamId={id} lang={lang} />
        <TeamDetailsForm
          teamId={id}
          lang={lang}
          initial={{ category: team.category ?? "", branch: team.branch ?? "", timeZone: tz }}
          timeZones={TEAM_TIME_ZONES.includes(tz as (typeof TEAM_TIME_ZONES)[number]) ? TEAM_TIME_ZONES : [tz, ...TEAM_TIME_ZONES]}
        />
      </div>
    </TeamLogShell>
  );
}
