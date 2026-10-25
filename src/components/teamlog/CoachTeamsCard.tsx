import Link from "next/link";
import { prisma } from "@/lib/db";
import type { Lang } from "@/lib/i18n";
import { dayKeyIn } from "@/lib/format";
import { teamTimeZone } from "@/lib/teamAccess";
import { mondayOf } from "@/lib/season";
import { tl } from "@/lib/teamLogText";

const L: Record<Lang, { title: string; players: (n: number) => string; register: string; open: string; noPlan: string }> = {
  ko: { title: "내 팀", players: (n) => `선수 ${n}명`, register: "출석 체크", open: "팀 열기", noPlan: "이번 주 계획이 없어요" },
  en: { title: "Your teams", players: (n) => `${n} player${n === 1 ? "" : "s"}`, register: "Take attendance", open: "Open team", noPlan: "Nothing planned this week" },
  es: { title: "Tus equipos", players: (n) => `${n} jugador${n === 1 ? "" : "es"}`, register: "Pasar lista", open: "Abrir equipo", noPlan: "Sin plan para esta semana" },
};

/**
 * The coach's teams at the top of the home screen, each with this week's
 * training objective and a one-tap way to the register. A coach whose players
 * have no accounts had nothing on the home screen that led to their team.
 */
export default async function CoachTeamsCard({ coachId, lang }: { coachId: string; lang: Lang }) {
  const teams = await prisma.team.findMany({
    where: { coachId },
    orderBy: { createdAt: "asc" },
    select: { id: true, name: true, timeZone: true, _count: { select: { members: true } } },
  });
  if (teams.length === 0) return null;
  const weeks = await prisma.teamPlanWeek.findMany({
    where: { OR: teams.map((t) => ({ teamId: t.id, weekStart: mondayOf(dayKeyIn(teamTimeZone(t))) })) },
    select: { teamId: true, unit: true, objective: true },
  });
  const s = L[lang];
  const focus = tl(lang).plan.thisWeek;
  return (
    <section className="mb-6" aria-labelledby="coach-teams">
      <h2 id="coach-teams" className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
        {s.title}
      </h2>
      <div className="grid gap-3 md:grid-cols-2">
        {teams.map((t) => {
          const w = weeks.find((x) => x.teamId === t.id);
          return (
            <div key={t.id} className="card p-5">
              <div className="flex items-baseline justify-between gap-2">
                <Link href={`/teams/${t.id}`} className="text-base font-bold hover:underline">
                  {t.name}
                </Link>
                <span className="shrink-0 text-xs text-slate-500">{s.players(t._count.members)}</span>
              </div>
              <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-emerald-700">
                {focus}
                {w ? ` · ${w.unit}` : ""}
              </p>
              <p className="mt-0.5 text-sm text-slate-700">{w ? w.objective : s.noPlan}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link href={`/teams/${t.id}#attendance`} className="btn-primary text-sm">
                  {s.register}
                </Link>
                <Link href={`/teams/${t.id}`} className="btn-ghost text-sm">
                  {s.open}
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
