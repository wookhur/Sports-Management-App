import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { SPORTS } from "@/lib/sports";
import NavBar from "@/components/NavBar";
import { formatDate, formatDuration } from "@/lib/format";

export const dynamic = "force-dynamic";

// Best shared time per athlete for one swimming metric, fastest first.
// Only records the athlete chose to share are ranked.

export default async function LeaderboardPage({
  searchParams,
}: {
  searchParams: Promise<{ metric?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const metrics = (SPORTS.swimming.metrics ?? []).filter((m) => m.key !== "custom");
  const { metric } = await searchParams;
  const activeKey = metrics.some((m) => m.key === metric) ? metric! : metrics[0].key;
  const active = metrics.find((m) => m.key === activeKey)!;

  const bests = await prisma.record.groupBy({
    by: ["userId"],
    where: { sport: "swimming", metricKey: activeKey, shared: true, durationMs: { not: null } },
    _min: { durationMs: true },
  });
  const ranked = bests
    .filter((b) => b._min.durationMs != null)
    .sort((a, b) => a._min.durationMs! - b._min.durationMs!)
    .slice(0, 20);

  const users = ranked.length
    ? await prisma.user.findMany({
        where: { id: { in: ranked.map((r) => r.userId) } },
        select: { id: true, name: true },
      })
    : [];
  const nameOf = new Map(users.map((u) => [u.id, u.name]));

  // When was each best set? (for the date column)
  const bestRecords = ranked.length
    ? await prisma.record.findMany({
        where: {
          sport: "swimming",
          metricKey: activeKey,
          shared: true,
          OR: ranked.map((r) => ({ userId: r.userId, durationMs: r._min.durationMs })),
        },
        orderBy: { createdAt: "asc" },
        select: { userId: true, durationMs: true, createdAt: true },
      })
    : [];
  const dateOf = new Map<string, Date>();
  for (const r of bestRecords) if (!dateOf.has(r.userId)) dateOf.set(r.userId, r.createdAt);

  const medals = ["🥇", "🥈", "🥉"];

  return (
    <>
      <NavBar />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="text-2xl font-bold">🏆 리더보드</h1>
        <p className="mt-1 text-slate-500">공유된 기록 기준, 항목별 최고 기록 순위예요.</p>

        <div className="mt-5 flex flex-wrap gap-2">
          {metrics.map((m) => {
            const isActive = m.key === activeKey;
            return (
              <Link
                key={m.key}
                href={`/leaderboard?metric=${m.key}`}
                aria-current={isActive ? "page" : undefined}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  isActive ? "bg-brand text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {m.name}
              </Link>
            );
          })}
        </div>

        {ranked.length === 0 ? (
          <div className="card mt-6 p-12 text-center text-slate-500">
            아직 {active.name} 공유 기록이 없어요. 기록을 측정하고 공유해보세요!
          </div>
        ) : (
          <div className="card mt-6 divide-y divide-slate-100">
            {ranked.map((row, i) => {
              const isMe = row.userId === session.userId;
              return (
                <div
                  key={row.userId}
                  className={`flex items-center gap-4 px-5 py-3.5 ${isMe ? "bg-brand/5" : ""}`}
                >
                  <span className="w-8 text-center text-lg font-bold text-slate-400">
                    {medals[i] ?? i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">
                      {nameOf.get(row.userId) ?? "알 수 없음"}
                      {isMe && <span className="badge ml-2 bg-brand/10 text-brand">나</span>}
                    </p>
                    {dateOf.get(row.userId) && (
                      <p className="text-xs text-slate-400">{formatDate(dateOf.get(row.userId)!)}</p>
                    )}
                  </div>
                  <span className="font-mono text-lg font-bold tabular-nums">
                    {formatDuration(row._min.durationMs!)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </>
  );
}
