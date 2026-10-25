import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import NavBar from "@/components/NavBar";
import TeamMemberList from "@/components/TeamMemberList";
import CopyCodeButton from "@/components/CopyCodeButton";
import RegenerateCodeButton from "@/components/RegenerateCodeButton";
import TeamAssignments, { type TeamAssignmentGroup } from "@/components/TeamAssignments";
import TeamAssignForm, { type LinkGroup } from "@/components/TeamAssignForm";
import { DRILLS } from "@/lib/soccerDrills";
import { visibleDrills } from "@/lib/customDrills";
import { L as loc } from "@/lib/localized";
import RosterHeatmap from "@/components/RosterHeatmap";
import AttentionList from "@/components/AttentionList";
import { buildTeamSquad } from "@/lib/squad";
import TeamAnnouncements, { type AnnouncementRow } from "@/components/TeamAnnouncements";
import AttendanceSheet, { type AttendanceMember, type AttendanceMark } from "@/components/AttendanceSheet";
import { dayKeyIn } from "@/lib/format";
import { teamTimeZone } from "@/lib/teamAccess";
import { TeamTabs } from "@/components/teamlog/TeamLogShell";
import { tl } from "@/lib/teamLogText";
import { addDays, isDayKey, mondayOf } from "@/lib/season";
import { TrophyIcon, FileTextIcon, ClipboardIcon } from "@/components/navIcons";
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
    teamBoard: string;
    teamReport: string;
    assignAll: string;
    linkSoccer: string;
    linkTeamDrills: string;
    linkOther: string;
    soccerProgram: string;
    soccerDrillLibrary: string;
    swimWorkouts: string;
    laxProgram: string;
    journal: string;
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
    teamBoard: "팀 리더보드",
    teamReport: "팀 리포트 인쇄",
    assignAll: "팀 전체에 과제 내기",
    linkSoccer: "축구",
    linkTeamDrills: "우리 팀 드릴",
    linkOther: "다른 훈련",
    soccerProgram: "축구 훈련 프로그램",
    soccerDrillLibrary: "축구 드릴 라이브러리",
    swimWorkouts: "수영 훈련 프로그램",
    laxProgram: "라크로스 엘리트 프로그램",
    journal: "훈련 일지 쓰기",
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
    teamBoard: "Team leaderboard",
    teamReport: "Print team report",
    assignAll: "Assign to whole team",
    linkSoccer: "Soccer",
    linkTeamDrills: "Our team's drills",
    linkOther: "Other training",
    soccerProgram: "Soccer training program",
    soccerDrillLibrary: "Soccer drill library",
    swimWorkouts: "Swim training programs",
    laxProgram: "Lacrosse elite program",
    journal: "Write in the training journal",
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
    teamBoard: "Clasificación del equipo",
    teamReport: "Imprimir informe del equipo",
    assignAll: "Asignar a todo el equipo",
    linkSoccer: "Fútbol",
    linkTeamDrills: "Ejercicios de nuestro equipo",
    linkOther: "Otros entrenamientos",
    soccerProgram: "Programa de entrenamiento de fútbol",
    soccerDrillLibrary: "Biblioteca de ejercicios de fútbol",
    swimWorkouts: "Programas de natación",
    laxProgram: "Programa élite de lacrosse",
    journal: "Escribir en el diario de entrenamiento",
  },
};

export default async function TeamPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ day?: string }>;
}) {
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
        include: { user: { select: { id: true, name: true, currentStreak: true, managed: true } } },
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
  // What a team assignment can point at: the soccer program and drills first
  // (library and the team's own uploads), then the other sports' programs.
  const linkGroups: LinkGroup[] = isOwner
    ? [
        {
          label: s.linkSoccer,
          options: [
            { href: "/sports/soccer/program", label: s.soccerProgram },
            { href: "/sports/soccer/drills", label: s.soccerDrillLibrary },
            ...DRILLS.map((d) => ({ href: `/sports/soccer/drills/${d.id}`, label: loc(d.title, lang) })),
          ],
        },
        {
          label: s.linkTeamDrills,
          options: (await visibleDrills(session.userId, "soccer")).map((d) => ({
            href: `/sports/soccer/drills/${d.id}`,
            label: d.title,
          })),
        },
        {
          label: s.linkOther,
          options: [
            { href: "/sports/swimming/workouts", label: s.swimWorkouts },
            { href: "/sports/lacrosse/program", label: s.laxProgram },
            { href: "/journal", label: s.journal },
          ],
        },
      ]
    : [];

  const announcements: AnnouncementRow[] = (
    await prisma.teamAnnouncement.findMany({
      where: { teamId: team.id },
      orderBy: { createdAt: "desc" },
      take: 20,
      include: { author: { select: { name: true } } },
    })
  ).map((a) => ({ id: a.id, body: a.body, authorName: a.author.name, createdAt: a.createdAt.toISOString() }));

  // "Today" where the team trains, not where the server is. The coach can
  // open an earlier day to fill in a register they missed; future days can't
  // be taken.
  const today = dayKeyIn(teamTimeZone(team));
  const asked = (await searchParams).day;
  const registerDay = asked && isDayKey(asked) && asked <= today ? asked : today;
  const attendance: AttendanceMember[] = isOwner ? await attendanceFor(team.id, memberIds, registerDay) : [];
  const thisWeek = await prisma.teamPlanWeek.findUnique({
    where: { teamId_weekStart: { teamId: team.id, weekStart: mondayOf(today) } },
  });
  const planCount = thisWeek ? 1 : await prisma.teamPlanWeek.count({ where: { teamId: team.id } });
  const pt = tl(lang).plan;

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

        <TeamTabs teamId={team.id} active="overview" isOwner={isOwner} lang={lang} />

        {thisWeek ? (
          <Link
            href={`/teams/${team.id}/plan`}
            className="mt-4 block rounded-2xl border border-emerald-200 bg-emerald-50 p-5 transition hover:border-emerald-300"
          >
            <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">{pt.thisWeekFocus}</p>
            <p className="mt-1 text-sm font-semibold text-emerald-900">{thisWeek.unit}</p>
            <p className="mt-0.5 text-base font-medium text-slate-900">{thisWeek.objective}</p>
            {thisWeek.note && <p className="mt-1 text-xs font-medium text-amber-700">★ {thisWeek.note}</p>}
            <p className="mt-2 text-xs font-semibold text-emerald-700">{pt.seeAll}</p>
          </Link>
        ) : (
          isOwner &&
          planCount === 0 && (
            <Link href={`/teams/${team.id}/plan`} className="mt-4 block rounded-2xl border border-dashed border-slate-300 p-4 text-sm font-semibold text-slate-600 hover:border-slate-400">
              {pt.planSeason}
            </Link>
          )
        )}

        <div className="no-print mt-4 flex flex-wrap gap-2">
          <Link
            href={`/leaderboard?team=${team.id}`}
            className="btn-ghost inline-flex items-center gap-2 text-sm"
          >
            <TrophyIcon className="h-4 w-4" />
            {s.teamBoard}
          </Link>
          {isOwner && (
            <a href="#team-assign" className="btn-primary inline-flex items-center gap-2 text-sm">
              <ClipboardIcon className="h-4 w-4" />
              {s.assignAll}
            </a>
          )}
          {isOwner && (
            <Link
              href={`/coach/report?team=${team.id}`}
              className="btn-ghost inline-flex items-center gap-2 text-sm"
            >
              <FileTextIcon className="h-4 w-4" />
              {s.teamReport}
            </Link>
          )}
        </div>

        <div className="mt-6">
          <TeamAnnouncements
            teamId={team.id}
            announcements={announcements}
            canPost={isOwner}
            lang={lang}
          />
        </div>

        {/* Homework for everyone, right under the notes: the two things a
            coach does to the whole team at once sit together. */}
        {isOwner && (
          <div className="mt-6 space-y-4">
            <TeamAssignments groups={assignmentGroups} lang={lang}>
              <TeamAssignForm
                teamId={team.id}
                memberCount={team.members.filter((m) => !m.user.managed).length}
                linkGroups={linkGroups}
                lang={lang}
              />
            </TeamAssignments>
          </div>
        )}

        {isOwner && attendance.length > 0 && (
          <div className="mt-6">
            <AttendanceSheet
              key={registerDay}
              teamId={team.id}
              day={registerDay}
              today={today}
              windowDays={ATTENDANCE_WINDOW_DAYS}
              members={attendance}
              lang={lang}
            />
          </div>
        )}

        {squad && (
          <div className="mt-6 space-y-6">
            {squad.roster.rows.length > 0 && <AttentionList lang={lang} triage={squad.triage} />}
            <RosterHeatmap lang={lang} roster={squad.roster} />
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
                  managed: m.user.managed,
                  noAccountLabel: tl(lang).roster.noAccount,
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

/** How far back the attendance rate looks. */
const ATTENDANCE_WINDOW_DAYS = 30;

/** One day's register plus each member's rate over the window ending that day. */
async function attendanceFor(teamId: string, memberIds: string[], today: string): Promise<AttendanceMember[]> {
  if (memberIds.length === 0) return [];
  const from = addDays(today, -ATTENDANCE_WINDOW_DAYS);
  const [members, rows] = await Promise.all([
    prisma.user.findMany({ where: { id: { in: memberIds } }, select: { id: true, name: true } }),
    prisma.attendance.findMany({
      where: { teamId, userId: { in: memberIds }, day: { gte: from, lte: today } },
      select: { userId: true, day: true, present: true, excused: true },
    }),
  ]);
  const byUser = new Map<string, { today: AttendanceMark | null; marked: number; present: number }>();
  for (const r of rows) {
    const u = byUser.get(r.userId) ?? { today: null, marked: 0, present: 0 };
    u.marked += 1;
    if (r.present) u.present += 1;
    if (r.day === today) u.today = r.present ? "present" : r.excused ? "excused" : "absent";
    byUser.set(r.userId, u);
  }
  return members
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((m) => {
      const u = byUser.get(m.id);
      return {
        userId: m.id,
        name: m.name,
        present: u?.today ?? null,
        recentMarked: u?.marked ?? 0,
        recentPresent: u?.present ?? 0,
      };
    });
}
