import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getSport } from "@/lib/sports";
import NavBar from "@/components/NavBar";
import Stopwatch from "@/components/Stopwatch";
import { formatDate, formatDuration, formatPace } from "@/lib/format";

const levelColors: Record<string, string> = {
  입문: "bg-emerald-50 text-emerald-600",
  중급: "bg-amber-50 text-amber-600",
  고급: "bg-rose-50 text-rose-600",
};

export default async function SportPage({
  params,
}: {
  params: Promise<{ sportId: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { sportId } = await params;
  const sport = getSport(sportId);
  if (!sport) notFound();

  const canMeasure = sport.features.includes("measure");
  const records = canMeasure
    ? await prisma.record.findMany({
        where: { userId: session.userId, sport: sportId },
        orderBy: { createdAt: "desc" },
        take: 10,
      })
    : [];

  // Best (fastest) time per metric.
  const best = new Map<string, number>();
  for (const r of records) {
    if (r.durationMs == null) continue;
    const cur = best.get(r.metricKey);
    if (cur == null || r.durationMs < cur) best.set(r.metricKey, r.durationMs);
  }

  return (
    <>
      <NavBar />
      <main className="mx-auto max-w-5xl px-4 py-8">
        <Link href="/" className="text-sm text-slate-400 hover:text-slate-600">
          ← 홈
        </Link>

        <header
          className={`mt-3 flex items-center gap-4 rounded-2xl bg-gradient-to-br ${sport.gradient} p-6 text-white`}
        >
          <span className="text-5xl">{sport.emoji}</span>
          <div>
            <h1 className="text-2xl font-bold">{sport.name}</h1>
            <p className="text-white/85">{sport.tagline}</p>
          </div>
        </header>

        {/* Reference content from coach-provided databases */}
        {sportId === "swimming" && (
          <Link
            href="/sports/swimming/workouts"
            className="mt-6 flex items-center justify-between rounded-2xl border border-cyan-200 bg-gradient-to-br from-cyan-50 to-blue-50 p-5 transition hover:shadow-md"
          >
            <div>
              <p className="text-sm font-medium text-cyan-700">추천 훈련 프로그램</p>
              <p className="mt-0.5 text-lg font-bold text-slate-800">
                1,440개 완성 워크아웃 · 영법·거리·레벨별
              </p>
              <p className="mt-1 text-sm text-slate-500">
                웜업부터 쿨다운까지 5단계 세트와 검증된 드릴 영상을 제공해요.
              </p>
            </div>
            <span className="text-2xl text-cyan-600">→</span>
          </Link>
        )}
        {sportId === "soccer" && (
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <Link
              href="/sports/soccer/drills"
              className="flex items-center justify-between rounded-2xl border border-indigo-200 bg-gradient-to-br from-sky-50 to-indigo-50 p-5 transition hover:shadow-md"
            >
              <div>
                <p className="text-sm font-medium text-indigo-700">드릴 (그림 설명)</p>
                <p className="mt-0.5 text-lg font-bold text-slate-800">연령대별 드릴 다이어그램</p>
                <p className="mt-1 text-sm text-slate-500">콘 배치와 움직임을 그림으로 확인하세요.</p>
              </div>
              <span className="text-2xl text-indigo-600">→</span>
            </Link>
            <Link
              href="/sports/soccer/program"
              className="flex items-center justify-between rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-slate-100 p-5 transition hover:shadow-md"
            >
              <div>
                <p className="text-sm font-medium text-slate-600">훈련 프로그램</p>
                <p className="mt-0.5 text-lg font-bold text-slate-800">학년별 세션 플랜 · 스트레칭</p>
                <p className="mt-1 text-sm text-slate-500">실제 훈련 커리큘럼과 루틴이에요.</p>
              </div>
              <span className="text-2xl text-slate-500">→</span>
            </Link>
          </div>
        )}

        {/* Guides (lacrosse / soccer) */}
        {sport.guides && sport.guides.length > 0 && (
          <section className="mt-8">
            <h2 className="mb-1 text-lg font-bold">
              {sportId === "soccer" ? "연습 방식" : "훈련 방식"}
            </h2>
            <p className="mb-4 text-sm text-slate-500">
              단계별 가이드를 따라 훈련해보세요.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              {sport.guides.map((guide) => (
                <Link
                  key={guide.id}
                  href={`/sports/${sportId}/guides/${guide.id}`}
                  className="card group p-5 transition hover:border-slate-300 hover:shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <span className={`badge ${levelColors[guide.level]}`}>{guide.level}</span>
                    <span className="text-xs text-slate-400">⏱ {guide.durationMin}분</span>
                  </div>
                  <h3 className="mt-3 text-lg font-bold group-hover:text-brand">{guide.title}</h3>
                  <p className="mt-1 text-sm text-slate-500">{guide.summary}</p>
                  <p className="mt-3 text-xs font-medium text-slate-400">🎯 {guide.focus}</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Measurement (swimming) */}
        {canMeasure && sport.metrics && (
          <section className="mt-8 grid gap-6 lg:grid-cols-2">
            <Stopwatch sportId={sportId} metrics={sport.metrics} />

            <div>
              <h2 className="mb-3 text-lg font-bold">최근 기록</h2>
              {records.length === 0 ? (
                <div className="card p-8 text-center text-slate-500">
                  아직 기록이 없어요. 왼쪽에서 첫 기록을 측정해보세요!
                </div>
              ) : (
                <div className="card divide-y divide-slate-100">
                  {records.map((r) => {
                    const isBest = r.durationMs != null && best.get(r.metricKey) === r.durationMs;
                    return (
                      <div key={r.id} className="px-5 py-3.5">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="flex items-center gap-1.5 font-medium">
                              {r.metricName}
                              {isBest && (
                                <span className="badge bg-yellow-50 text-yellow-600">🏆 최고</span>
                              )}
                            </p>
                            <p className="text-xs text-slate-400">{formatDate(r.createdAt)}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-mono text-lg font-semibold tabular-nums">
                              {r.durationMs != null ? formatDuration(r.durationMs) : "—"}
                            </p>
                            {r.distanceM && r.durationMs != null && (
                              <p className="text-xs text-slate-400">
                                {formatPace(r.distanceM, r.durationMs)}
                              </p>
                            )}
                          </div>
                        </div>
                        {r.notes && <p className="mt-1 text-sm text-slate-500">“{r.notes}”</p>}
                      </div>
                    );
                  })}
                </div>
              )}
              <Link href="/records" className="mt-3 inline-block text-sm font-medium text-brand">
                모든 기록 관리 →
              </Link>
            </div>
          </section>
        )}
      </main>
    </>
  );
}
