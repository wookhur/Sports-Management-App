import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { SPORTS } from "@/lib/sports";
import NavBar from "@/components/NavBar";
import RecordList from "@/components/RecordList";
import ConnectionManager, { type Connection } from "@/components/ConnectionManager";
import RecordTrendChart, { type TrendPoint } from "@/components/RecordTrendChart";
import GoalManager, { type GoalView } from "@/components/GoalManager";
import type { RecordView } from "@/lib/types";
import type { Lang } from "@/lib/i18n";
import { getLang } from "@/lib/getLang";

export const dynamic = "force-dynamic";

const L: Record<Lang, { title: string; subtitle: string; trendHeading: string }> = {
  ko: {
    title: "내 기록",
    subtitle: "기록을 관리하고 코치에게 공유하세요.",
    trendHeading: "성장 그래프",
  },
  en: {
    title: "My Records",
    subtitle: "Manage your records and share them with your coach.",
    trendHeading: "Progress charts",
  },
  es: {
    title: "Mis marcas",
    subtitle: "Gestiona tus marcas y compártelas con tu entrenador.",
    trendHeading: "Gráficas de progreso",
  },
};

export default async function RecordsPage() {
  const lang = await getLang();
  const s = L[lang];
  const session = await getSession();
  if (!session) redirect("/login");

  // Coaches manage their roster from the coach dashboard instead.
  if (session.role === "COACH") redirect("/coach");

  const records = await prisma.record.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: "desc" },
    include: {
      comments: {
        orderBy: { createdAt: "asc" },
        include: { author: { select: { name: true, role: true } } },
      },
    },
  });

  // Opening this page marks coach feedback as seen (notification cursor).
  await prisma.user.update({
    where: { id: session.userId },
    data: { lastSeenCommentsAt: new Date() },
  });

  const coachLinks = await prisma.coachAthlete.findMany({
    where: { athleteId: session.userId },
    include: { coach: { select: { id: true, name: true, email: true } } },
  });
  const connections: Connection[] = coachLinks.map((l) => l.coach);

  // Per-metric best + trend series (oldest→newest) for timed records.
  const bests = new Map<string, number>();
  const trends = new Map<string, { metricName: string; points: TrendPoint[] }>();
  for (const r of [...records].reverse()) {
    if (r.durationMs == null) continue;
    const cur = bests.get(r.metricKey);
    if (cur == null || r.durationMs < cur) bests.set(r.metricKey, r.durationMs);
    const t = trends.get(r.metricKey) ?? { metricName: r.metricName, points: [] };
    t.points.push({ date: r.createdAt.toISOString(), ms: r.durationMs });
    trends.set(r.metricKey, t);
  }
  const chartMetrics = [...trends.entries()].filter(([, t]) => t.points.length >= 2);

  // Goals: stamp newly-achieved ones, then build the view.
  const goals = await prisma.goal.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: "desc" },
  });
  for (const g of goals) {
    const best = bests.get(g.metricKey);
    if (!g.achievedAt && best != null && best <= g.targetMs) {
      await prisma.goal.update({ where: { id: g.id }, data: { achievedAt: new Date() } });
      g.achievedAt = new Date();
    }
  }
  const goalView: GoalView[] = goals.map((g) => ({
    id: g.id,
    metricName: g.metricName,
    targetMs: g.targetMs,
    achieved: Boolean(g.achievedAt),
    bestMs: bests.get(g.metricKey) ?? null,
  }));

  const goalMetrics = (SPORTS.swimming.metrics ?? [])
    .filter((m) => m.key !== "custom")
    .map((m) => ({ key: m.key, name: m.name }));

  const view: RecordView[] = records.map((r) => ({
    id: r.id,
    sport: r.sport,
    metricName: r.metricName,
    distanceM: r.distanceM,
    durationMs: r.durationMs,
    value: r.value,
    unit: r.unit,
    notes: r.notes,
    shared: r.shared,
    createdAt: r.createdAt.toISOString(),
    comments: r.comments.map((c) => ({
      id: c.id,
      body: c.body,
      authorName: c.author.name,
      authorRole: c.author.role,
      createdAt: c.createdAt.toISOString(),
    })),
  }));

  return (
    <>
      <NavBar />
      <main className="mx-auto max-w-5xl px-4 py-8">
        <h1 className="text-2xl font-bold">{s.title}</h1>
        <p className="mt-1 text-slate-500">{s.subtitle}</p>

        {chartMetrics.length > 0 && (
          <section className="mt-6">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
              {s.trendHeading}
            </h2>
            <div className="grid gap-4 lg:grid-cols-2">
              {chartMetrics.map(([key, t]) => (
                <RecordTrendChart key={key} metricName={t.metricName} points={t.points} lang={lang} />
              ))}
            </div>
          </section>
        )}

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
          <div>
            <RecordList records={view} mode="owner" lang={lang} />
          </div>
          <aside className="space-y-6 lg:order-last">
            <GoalManager goals={goalView} metrics={goalMetrics} lang={lang} />
            <ConnectionManager role="ATHLETE" connections={connections} lang={lang} />
          </aside>
        </div>
      </main>
    </>
  );
}
