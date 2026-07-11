import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { SPORT_LIST } from "@/lib/sports";
import NavBar from "@/components/NavBar";
import OnboardingTour from "@/components/OnboardingTour";
import StreakCard from "@/components/StreakCard";
import { touchStreak, topStreaks } from "@/lib/streak";
import { formatDate, formatDuration } from "@/lib/format";

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

        <section className="mb-8">
          <StreakCard streak={streak} leaders={leaders} myName={session.name} />
        </section>

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
