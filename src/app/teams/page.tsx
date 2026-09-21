import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import NavBar from "@/components/NavBar";
import TeamPanel, { type TeamRow } from "@/components/TeamPanel";
import JoinTeamCard, { type MyTeam } from "@/components/JoinTeamCard";
import { getLang } from "@/lib/getLang";
import type { Lang } from "@/lib/i18n";

export const dynamic = "force-dynamic";

const L: Record<
  Lang,
  {
    coachTitle: string;
    coachSub: string;
    coachHow: string[];
    athleteTitle: string;
    athleteSub: string;
  }
> = {
  ko: {
    coachTitle: "팀",
    coachSub: "초대 코드 하나로 스쿼드를 모으고, 과제를 팀 전체에 한 번에 배정하세요.",
    coachHow: [
      "팀을 만들면 초대 코드가 생깁니다. 선수들에게 코드를 알려주세요.",
      "선수가 코드를 입력하면 팀에 들어옵니다 — 이메일로 연결할 필요가 없어요.",
      "코치 대시보드의 과제 배정에서 팀을 고르면 모든 멤버에게 한 번에 갑니다.",
      "팀 페이지에서 누가 과제를 끝냈는지, 누구를 살펴봐야 하는지 볼 수 있어요.",
    ],
    athleteTitle: "내 팀",
    athleteSub: "코치에게 받은 초대 코드로 팀에 참여하세요.",
  },
  en: {
    coachTitle: "Teams",
    coachSub: "One invite code gathers a squad; one assignment reaches all of them.",
    coachHow: [
      "Create a team and it gets an invite code. Give the code to your athletes.",
      "An athlete types the code and they're on the team — no email linking needed.",
      "Pick the team in the assignment form on your dashboard and it goes to every member.",
      "The team's page shows who has finished the homework and who needs a look.",
    ],
    athleteTitle: "My teams",
    athleteSub: "Join a team with the invite code your coach gave you.",
  },
  es: {
    coachTitle: "Equipos",
    coachSub: "Un código de invitación reúne a la plantilla; una tarea llega a todos.",
    coachHow: [
      "Crea un equipo y recibe un código de invitación. Dáselo a tus atletas.",
      "El atleta escribe el código y ya está en el equipo, sin vincular por correo.",
      "Elige el equipo en el formulario de tareas del panel y llega a todos los miembros.",
      "La página del equipo muestra quién terminó la tarea y a quién hay que revisar.",
    ],
    athleteTitle: "Mis equipos",
    athleteSub: "Únete a un equipo con el código que te dio tu entrenador.",
  },
};

/**
 * The Teams page.
 *
 * Teams used to live only as a card halfway down the coach dashboard, and a
 * coach looking for "Teams" in the menu found nothing. This is the menu
 * item's destination: the same management for a coach, with room to explain
 * what a team is for; and for an athlete, the teams they're on and the join
 * form, which had only ever been a card on the home screen.
 */
export default async function TeamsPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  const lang = await getLang();
  const s = L[lang];

  if (session.role === "COACH") {
    const teams = await prisma.team.findMany({
      where: { coachId: session.userId },
      orderBy: { createdAt: "asc" },
      include: { _count: { select: { members: true } } },
    });
    const rows: TeamRow[] = teams.map((t) => ({
      id: t.id,
      name: t.name,
      code: t.code,
      memberCount: t._count.members,
    }));

    return (
      <>
        <NavBar />
        <main className="mx-auto max-w-5xl px-4 py-8">
          <header>
            <h1 className="text-2xl font-bold sm:text-3xl">{s.coachTitle}</h1>
            <p className="mt-1 text-slate-600">{s.coachSub}</p>
          </header>
          <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
            <TeamPanel teams={rows} lang={lang} standalone />
            {/* Kept beside the list on wide screens, under it on narrow ones,
                so the empty state and the explanation never fight for the
                same column. */}
            <aside className="card h-fit p-5">
              <ol className="space-y-3 text-sm text-slate-700">
                {s.coachHow.map((line, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand/10 text-xs font-bold text-brand-dark">
                      {i + 1}
                    </span>
                    <span className="leading-snug">{line}</span>
                  </li>
                ))}
              </ol>
            </aside>
          </div>
        </main>
      </>
    );
  }

  const memberships = await prisma.teamMember.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: "asc" },
    include: {
      team: { include: { coach: { select: { name: true } }, _count: { select: { members: true } } } },
    },
  });
  const myTeams: MyTeam[] = memberships.map((m) => ({
    id: m.team.id,
    name: m.team.name,
    coachName: m.team.coach.name,
    memberCount: m.team._count.members,
  }));

  return (
    <>
      <NavBar />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <header>
          <h1 className="text-2xl font-bold sm:text-3xl">{s.athleteTitle}</h1>
          <p className="mt-1 text-slate-600">{s.athleteSub}</p>
        </header>
        <div className="mt-6">
          <JoinTeamCard teams={myTeams} lang={lang} standalone />
        </div>
      </main>
    </>
  );
}
