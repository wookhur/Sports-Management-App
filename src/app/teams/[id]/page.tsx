import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import NavBar from "@/components/NavBar";
import TeamMemberList from "@/components/TeamMemberList";
import CopyCodeButton from "@/components/CopyCodeButton";
import RegenerateCodeButton from "@/components/RegenerateCodeButton";
import TeamAssignments, { type TeamAssignmentGroup } from "@/components/TeamAssignments";
import RosterHeatmap from "@/components/RosterHeatmap";
import AttentionList from "@/components/AttentionList";
import { buildTeamSquad } from "@/lib/squad";
import { formatDate, formatDuration } from "@/lib/format";
import { metricLabel, type Lang } from "@/lib/i18n";
import { getLang } from "@/lib/getLang";

export const dynamic = "force-dynamic";

const L: Record<
  Lang,
  {
    backHome: string;
    coachLabel: string;
    memberCount: (n: number) => string;
    inviteCode: string;
    membersHeading: string;
    noMembers: string;
    recentHeading: string;
    noRecords: string;
  }
> = {
  ko: {
    backHome: "← 팀",
    coachLabel: "코치",
    memberCount: (n) => `멤버 ${n}명`,
    inviteCode: "초대 코드",
    membersHeading: "멤버",
    noMembers: "아직 멤버가 없어요. 초대 코드를 공유해보세요!",
    recentHeading: "팀 최근 기록",
    noRecords: "아직 공유된 기록이 없어요.",
  },
  en: {
    backHome: "← Teams",
    coachLabel: "Coach",
    memberCount: (n) => `${n} member${n === 1 ? "" : "s"}`,
    inviteCode: "Invite code",
    membersHeading: "Members",
    noMembers: "No members yet. Share the invite code!",
    recentHeading: "Recent team records",
    noRecords: "No shared records yet.",
  },
  es: {
    backHome: "← Equipos",
    coachLabel: "Entrenador",
    memberCount: (n) => `${n} miembro${n === 1 ? "" : "s"}`,
    inviteCode: "Código de invitación",
    membersHeading: "Miembros",
    noMembers: "Aún no hay miembros. ¡Comparte el código de invitación!",
    recentHeading: "Marcas recientes del equipo",
    noRecords: "Aún no hay marcas compartidas.",
  },
};

export default async function TeamPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) redirect("/login");

  const lang = await getLang();
  const s = L[lang];

  const { id } = await params;
  const team = await prisma.team.findUnique({
    where: { id },
    include: {
      coach: { select: { id: true, name: true } },
      members: {
        orderBy: { createdAt: "asc" },
        include: { user: { select: { id: true, name: true, currentStreak: true } } },
      },
    },
  });
  if (!team) notFound();

  const isOwner = team.coachId === session.userId;
  const isMember = team.members.some((m) => m.userId === session.userId);
  if (!isOwner && !isMember) notFound();

  const memberIds = team.members.map((m) => m.userId);
  const recentRecords = memberIds.length
    ? await prisma.record.findMany({
        where: { userId: { in: memberIds }, shared: true },
        orderBy: { createdAt: "desc" },
        take: 12,
        include: { user: { select: { name: true } } },
      })
    : [];

  const byStreak = [...team.members].sort((a, b) => b.user.currentStreak - a.user.currentStreak);

  // Coach-only views. An athlete on the team sees the roster and the records,
  // not their teammates' load status or who hasn't done their homework.
  const squad = isOwner && memberIds.length ? await buildTeamSquad(team.id) : null;
  const assignmentGroups: TeamAssignmentGroup[] = isOwner ? await teamAssignmentGroups(team.id) : [];

  return (
    <>
      <NavBar />
      <main className="mx-auto max-w-5xl px-4 py-8">
        <Link href="/teams" className="text-sm text-slate-500 hover:text-slate-600">
          {s.backHome}
        </Link>

        <header className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-slate-900 p-6 text-white">
          <div>
            <h1 className="text-2xl font-bold">{team.name}</h1>
            {/* The label is a chip rather than a word glued to the name: a
                coach called "Coach Kim" was being announced as "Coach Coach
                Kim". */}
            <p className="mt-1.5 flex flex-wrap items-center gap-2 text-slate-300">
              <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs font-semibold text-white">
                {s.coachLabel}
              </span>
              <span>
                {team.coach.name} · {s.memberCount(team.members.length)}
              </span>
            </p>
          </div>
          {isOwner && (
            <div className="rounded-xl bg-white/10 px-4 py-3 text-center">
              <p className="text-xs text-slate-300">{s.inviteCode}</p>
              <p className="font-mono text-xl font-bold tracking-widest">{team.code}</p>
              <CopyCodeButton code={team.code} lang={lang} />
              <RegenerateCodeButton teamId={team.id} lang={lang} />
            </div>
          )}
        </header>

        {squad && (
          <div className="mt-6 space-y-6">
            {squad.roster.rows.length > 0 && <AttentionList lang={lang} triage={squad.triage} />}
            <RosterHeatmap lang={lang} roster={squad.roster} />
          </div>
        )}

        {isOwner && (
          <div className="mt-6">
            <TeamAssignments groups={assignmentGroups} lang={lang} />
          </div>
        )}

        <div className="mt-6 grid gap-6 lg:grid-cols-[320px_1fr]">
          <section>
            <h2 className="mb-3 text-lg font-bold">{s.membersHeading}</h2>
            {team.members.length === 0 ? (
              <div className="card p-6 text-center text-sm text-slate-600">
                {s.noMembers}
              </div>
            ) : (
              <TeamMemberList
                teamId={team.id}
                teamName={team.name}
                members={byStreak.map((m) => ({
                  userId: m.userId,
                  name: m.user.name,
                  currentStreak: m.user.currentStreak,
                }))}
                canManage={isOwner}
                selfUserId={session.userId}
                lang={lang}
              />
            )}
          </section>

          <section>
            <h2 className="mb-3 text-lg font-bold">{s.recentHeading}</h2>
            {recentRecords.length === 0 ? (
              <div className="card p-8 text-center text-sm text-slate-500">
                {s.noRecords}
              </div>
            ) : (
              <div className="card divide-y divide-slate-100">
                {recentRecords.map((r) => (
                  <div key={r.id} className="flex items-center justify-between px-5 py-3.5">
                    <div>
                      <p className="text-sm font-medium">
                        {r.user.name} · {metricLabel(r.metricKey, r.metricName, lang)}
                      </p>
                      <p className="text-xs text-slate-500">{formatDate(r.createdAt, lang)}</p>
                    </div>
                    {r.durationMs != null && (
                      <span className="font-mono font-semibold tabular-nums">{formatDuration(r.durationMs)}</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </>
  );
}

/**
 * Assignments given to this team, one line per fan-out.
 *
 * A team assignment is written as one row per member in a single createMany,
 * so every row of one fan-out shares a createdAt to the millisecond — that plus
 * the title is the group key. Rows are then read back per athlete for the
 * done/outstanding split.
 */
async function teamAssignmentGroups(teamId: string): Promise<TeamAssignmentGroup[]> {
  const rows = await prisma.assignment.findMany({
    where: { teamId },
    orderBy: { createdAt: "desc" },
    select: {
      title: true,
      linkHref: true,
      createdAt: true,
      completedAt: true,
      athlete: { select: { name: true } },
    },
  });
  const groups = new Map<string, TeamAssignmentGroup>();
  for (const r of rows) {
    const key = `${r.createdAt.toISOString()}|${r.title}`;
    let g = groups.get(key);
    if (!g) {
      g = {
        key,
        title: r.title,
        linkHref: r.linkHref,
        givenAt: r.createdAt.toISOString(),
        total: 0,
        done: 0,
        outstanding: [],
      };
      groups.set(key, g);
    }
    g.total += 1;
    if (r.completedAt) g.done += 1;
    else g.outstanding.push(r.athlete.name);
  }
  return [...groups.values()];
}
