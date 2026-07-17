import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { SPORT_LIST } from "@/lib/sports";
import NavBar from "@/components/NavBar";
import OnboardingTour from "@/components/OnboardingTour";
import StreakCard from "@/components/StreakCard";
import AssignmentCard, { type MyAssignment } from "@/components/AssignmentCard";
import JoinTeamCard, { type MyTeam } from "@/components/JoinTeamCard";
import { touchStreak, topStreaks } from "@/lib/streak";
import { formatDate, formatDuration } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ tutorial?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const isCoach = session.role === "COACH";
  const { tutorial } = await searchParams;
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { onboarded: true },
  });
  const showTour = tutorial === "1" || !user?.onboarded;

  // Record today's visit and read the leaderboard (idempotent per day).
  const streak = await touchStreak(session.userId);
  const leaders = await topStreaks(5);

  const recentRecords = isCoach
    ? []
    : await prisma.record.findMany({
        where: { userId: session.userId },
        orderBy: { createdAt: "desc" },
        take: 5,
      });

  // Weekly report (athletes): last 7 days of timed records vs all-time bests.
  let weekly: { count: number; pbCount: number; metricCount: number; bestLine: string | null } | null = null;
  if (!isCoach) {
    const weekAgo = new Date(Date.now() - 7 * 86_400_000);
    const all = await prisma.record.findMany({
      where: { userId: session.userId, durationMs: { not: null } },
      orderBy: { createdAt: "asc" },
      select: { metricKey: true, metricName: true, durationMs: true, createdAt: true },
    });
    const bests = new Map<string, number>();
    for (const r of all) {
      const cur = bests.get(r.metricKey);
      if (cur == null || r.durationMs! < cur) bests.set(r.metricKey, r.durationMs!);
    }
    const week = all.filter((r) => r.createdAt >= weekAgo);
    const pbs = week.filter((r) => bests.get(r.metricKey) === r.durationMs);
    const bestPb = pbs.length
      ? pbs.reduce((a, b) => (a.durationMs! <= b.durationMs! ? a : b))
      : null;
    weekly = {
      count: week.length,
      pbCount: pbs.length,
      metricCount: new Set(week.map((r) => r.metricKey)).size,
      bestLine: bestPb ? `${bestPb.metricName} ${formatDuration(bestPb.durationMs!)}` : null,
    };
  }

  // New coach feedback since I last opened my records page.
  let newFeedback = 0;
  let myAssignments: MyAssignment[] = [];
  let myTeams: MyTeam[] = [];
  if (!isCoach) {
    const me = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { lastSeenCommentsAt: true },
    });
    newFeedback = await prisma.comment.count({
      where: {
        record: { userId: session.userId },
        authorId: { not: session.userId },
        ...(me?.lastSeenCommentsAt ? { createdAt: { gt: me.lastSeenCommentsAt } } : {}),
      },
    });

    const assignments = await prisma.assignment.findMany({
      where: { athleteId: session.userId },
      orderBy: [{ completedAt: "asc" }, { createdAt: "desc" }],
      take: 8,
      include: { coach: { select: { name: true } } },
    });
    myAssignments = assignments.map((a) => ({
      id: a.id,
      title: a.title,
      note: a.note,
      linkHref: a.linkHref,
      coachName: a.coach.name,
      completedAt: a.completedAt?.toISOString() ?? null,
    }));

    const memberships = await prisma.teamMember.findMany({
      where: { userId: session.userId },
      include: {
        team: {
          include: { coach: { select: { name: true } }, _count: { select: { members: true } } },
        },
      },
    });
    myTeams = memberships.map((m) => ({
      id: m.team.id,
      name: m.team.name,
      coachName: m.team.coach.name,
      memberCount: m.team._count.members,
    }));
  }

  const athleteCount = isCoach
    ? await prisma.coachAthlete.count({ where: { coachId: session.userId } })
    : 0;

  return (
    <>
      <NavBar />
      <OnboardingTour role={session.role} initialOpen={showTour} />
      <main className="mx-auto max-w-5xl px-4 py-8">
        <section className="mb-8">
          <h1 className="text-2xl font-bold sm:text-3xl">
            안녕하세요, {session.name}님 👋
          </h1>
          <p className="mt-1 text-slate-500">
            {isCoach
              ? "선수들의 기록을 확인하고 피드백을 남겨보세요."
              : "종목을 선택해 훈련하고 기록을 측정하세요."}
          </p>
        </section>

        {newFeedback > 0 && (
          <Link
            href="/records"
            className="mb-6 flex items-center justify-between rounded-2xl border border-brand/20 bg-brand/5 px-5 py-4 transition hover:bg-brand/10"
          >
            <p className="text-sm font-semibold text-brand">
              💬 코치가 새 피드백 {newFeedback}개를 남겼어요
            </p>
            <span className="text-brand">→</span>
          </Link>
        )}

        <section className="mb-8">
          <StreakCard streak={streak} leaders={leaders} myName={session.name} />
        </section>

        {weekly && (
          <section className="mb-8">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
              주간 리포트 <span className="font-normal normal-case text-slate-300">· 최근 7일</span>
            </h2>
            <div className="grid grid-cols-3 gap-3">
              <div className="card p-4">
                <p className="text-xs text-slate-400">측정 횟수</p>
                <p className="mt-1 text-xl font-bold tabular-nums">{weekly.count}회</p>
              </div>
              <div className="card p-4">
                <p className="text-xs text-slate-400">최고 기록 갱신</p>
                <p className="mt-1 text-xl font-bold tabular-nums">
                  {weekly.pbCount > 0 ? `🏆 ${weekly.pbCount}개` : "0개"}
                </p>
              </div>
              <div className="card p-4">
                <p className="text-xs text-slate-400">훈련한 항목</p>
                <p className="mt-1 text-xl font-bold tabular-nums">{weekly.metricCount}개</p>
              </div>
            </div>
            {weekly.bestLine && (
              <p className="mt-2 text-sm text-slate-500">
                이번 주 하이라이트: <span className="font-semibold text-slate-700">{weekly.bestLine}</span> 🎉
              </p>
            )}
          </section>
        )}

        {!isCoach && (
          <section className="mb-8 grid gap-4 md:grid-cols-2">
            <AssignmentCard assignments={myAssignments} />
            <JoinTeamCard teams={myTeams} />
          </section>
        )}

        {isCoach && (
          <Link
            href="/coach"
            className="mb-8 flex items-center justify-between rounded-2xl bg-slate-900 p-5 text-white transition hover:bg-slate-800"
          >
            <div>
              <p className="text-sm text-slate-300">코치 대시보드</p>
              <p className="text-lg font-semibold">
                {athleteCount}명의 선수 · 공유된 기록 보기
              </p>
            </div>
            <span className="text-2xl">→</span>
          </Link>
        )}

        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
            종목
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {SPORT_LIST.map((sport) => (
              <Link
                key={sport.id}
                href={`/sports/${sport.id}`}
                className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${sport.gradient} p-5 text-white shadow-sm transition hover:shadow-md`}
              >
                <div className="text-4xl">{sport.emoji}</div>
                <h3 className="mt-3 text-xl font-bold">{sport.name}</h3>
                <p className="mt-1 text-sm text-white/85">{sport.tagline}</p>
                <div className="mt-4 flex gap-1.5">
                  {sport.features.includes("guide") && (
                    <span className="badge bg-white/20 text-white">가이드</span>
                  )}
                  {sport.features.includes("measure") && (
                    <span className="badge bg-white/20 text-white">기록 측정</span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>

        {!isCoach && (
          <section className="mt-10">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
                최근 기록
              </h2>
              <Link href="/records" className="text-sm font-medium text-brand">
                전체 보기 →
              </Link>
            </div>
            {recentRecords.length === 0 ? (
              <div className="card p-8 text-center text-slate-500">
                아직 기록이 없어요. 수영 종목에서 첫 기록을 측정해보세요! 🏊
              </div>
            ) : (
              <div className="card divide-y divide-slate-100">
                {recentRecords.map((r) => (
                  <div key={r.id} className="flex items-center justify-between px-5 py-3.5">
                    <div>
                      <p className="font-medium">{r.metricName}</p>
                      <p className="text-xs text-slate-400">{formatDate(r.createdAt)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      {r.durationMs != null && (
                        <span className="font-mono text-lg font-semibold tabular-nums">
                          {formatDuration(r.durationMs)}
                        </span>
                      )}
                      {r.shared && (
                        <span className="badge bg-emerald-50 text-emerald-600">공유됨</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </main>
    </>
  );
}
