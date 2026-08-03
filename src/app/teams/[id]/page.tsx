import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import NavBar from "@/components/NavBar";
import { formatDate, formatDuration } from "@/lib/format";
import { metricLabel, type Lang } from "@/lib/i18n";
import { getLang } from "@/lib/getLang";

export const dynamic = "force-dynamic";

const L: Record<
  Lang,
  {
    backHome: string;
    coachAndMembers: (coachName: string, n: number) => string;
    inviteCode: string;
    membersHeading: string;
    noMembers: string;
    recentHeading: string;
    noRecords: string;
    streakBadge: (n: number) => string;
  }
> = {
  ko: {
    backHome: "← 홈",
    coachAndMembers: (coachName, n) => `${coachName} 코치 · 멤버 ${n}명`,
    inviteCode: "초대 코드",
    membersHeading: "멤버",
    noMembers: "아직 멤버가 없어요. 초대 코드를 공유해보세요!",
    recentHeading: "팀 최근 기록",
    noRecords: "아직 공유된 기록이 없어요.",
    streakBadge: (n) => `🔥 ${n}일`,
  },
  en: {
    backHome: "← Home",
    coachAndMembers: (coachName, n) => `Coach ${coachName} · ${n} member${n === 1 ? "" : "s"}`,
    inviteCode: "Invite code",
    membersHeading: "Members",
    noMembers: "No members yet. Share the invite code!",
    recentHeading: "Recent team records",
    noRecords: "No shared records yet.",
    streakBadge: (n) => `🔥 ${n} day${n === 1 ? "" : "s"}`,
  },
  es: {
    backHome: "← Inicio",
    coachAndMembers: (coachName, n) => `Entrenador ${coachName} · ${n} miembro${n === 1 ? "" : "s"}`,
    inviteCode: "Código de invitación",
    membersHeading: "Miembros",
    noMembers: "Aún no hay miembros. ¡Comparte el código de invitación!",
    recentHeading: "Marcas recientes del equipo",
    noRecords: "Aún no hay marcas compartidas.",
    streakBadge: (n) => `🔥 ${n} día${n === 1 ? "" : "s"}`,
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

  return (
    <>
      <NavBar />
      <main className="mx-auto max-w-5xl px-4 py-8">
        <Link href="/" className="text-sm text-slate-500 hover:text-slate-600">
          {s.backHome}
        </Link>

        <header className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-slate-900 p-6 text-white">
          <div>
            <h1 className="text-2xl font-bold">👥 {team.name}</h1>
            <p className="mt-1 text-slate-300">
              {s.coachAndMembers(team.coach.name, team.members.length)}
            </p>
          </div>
          {isOwner && (
            <div className="rounded-xl bg-white/10 px-4 py-3 text-center">
              <p className="text-xs text-slate-300">{s.inviteCode}</p>
              <p className="font-mono text-xl font-bold tracking-widest">{team.code}</p>
            </div>
          )}
        </header>

        <div className="mt-6 grid gap-6 lg:grid-cols-[320px_1fr]">
          <section>
            <h2 className="mb-3 text-lg font-bold">{s.membersHeading}</h2>
            {team.members.length === 0 ? (
              <div className="card p-6 text-center text-sm text-slate-500">
                {s.noMembers}
              </div>
            ) : (
              <div className="card divide-y divide-slate-100">
                {byStreak.map((m, i) => (
                  <div key={m.id} className="flex items-center gap-3 px-4 py-3">
                    <span className="w-5 text-center text-sm font-bold text-slate-300">{i + 1}</span>
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand/10 text-xs font-bold text-brand">
                      {m.user.name.slice(0, 1)}
                    </span>
                    <p className="flex-1 truncate text-sm font-medium">{m.user.name}</p>
                    {m.user.currentStreak > 0 && (
                      <span className="badge bg-orange-50 text-orange-600">{s.streakBadge(m.user.currentStreak)}</span>
                    )}
                  </div>
                ))}
              </div>
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
