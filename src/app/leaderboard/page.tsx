import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { SPORT_LIST, getSport } from "@/lib/sports";
import NavBar from "@/components/NavBar";
import { formatDate, formatDuration } from "@/lib/format";
import { SPORT_I18N, metricLabel, type Lang } from "@/lib/i18n";
import { getLang } from "@/lib/getLang";

export const dynamic = "force-dynamic";

// Best shared time per athlete for one metric, fastest first — split by
// sport. Only records the athlete chose to share are ranked.

const L: Record<
  Lang,
  {
    title: string;
    sub: string;
    empty: (metricName: string) => string;
    noMetrics: string;
    me: string;
    unknown: string;
  }
> = {
  ko: {
    title: "🏆 리더보드",
    sub: "공유된 기록 기준, 종목·항목별 최고 기록 순위예요.",
    empty: (metricName) => `아직 ${metricName} 공유 기록이 없어요. 기록을 측정하고 공유해보세요!`,
    noMetrics: "이 종목은 아직 기록 측정을 지원하지 않아요.",
    me: "나",
    unknown: "알 수 없음",
  },
  en: {
    title: "🏆 Leaderboard",
    sub: "Best-time rankings per sport and event, based on shared records.",
    empty: (metricName) => `No shared ${metricName} records yet. Track a time and share it!`,
    noMetrics: "This sport doesn't support time tracking yet.",
    me: "Me",
    unknown: "Unknown",
  },
  es: {
    title: "🏆 Clasificación",
    sub: "Ranking de mejores tiempos por deporte y prueba, según las marcas compartidas.",
    empty: (metricName) => `Todavía no hay marcas compartidas de ${metricName}. ¡Registra un tiempo y compártelo!`,
    noMetrics: "Este deporte aún no admite medición de tiempos.",
    me: "Yo",
    unknown: "Desconocido",
  },
};

export default async function LeaderboardPage({
  searchParams,
}: {
  searchParams: Promise<{ sport?: string; metric?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const lang = await getLang();
  const t = L[lang];

  const { sport, metric } = await searchParams;
  // Default to the first sport that actually has timed metrics (swimming),
  // so the leaderboard opens on a rankable board rather than an empty one.
  const defaultSport =
    SPORT_LIST.find((sp) => (sp.metrics ?? []).some((m) => m.key !== "custom"))?.id ?? SPORT_LIST[0].id;
  const activeSport = sport && getSport(sport) ? sport : defaultSport;
  const metrics = (getSport(activeSport)?.metrics ?? []).filter((m) => m.key !== "custom");
  const activeKey = metrics.some((m) => m.key === metric) ? metric! : metrics[0]?.key ?? "";
  const active = metrics.find((m) => m.key === activeKey);

  const bests = activeKey
    ? await prisma.record.groupBy({
        by: ["userId"],
        where: { sport: activeSport, metricKey: activeKey, shared: true, durationMs: { not: null } },
        _min: { durationMs: true },
      })
    : [];
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
          sport: activeSport,
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
        <h1 className="text-2xl font-bold">{t.title}</h1>
        <p className="mt-1 text-slate-500">{t.sub}</p>

        {/* Sport tabs */}
        <div className="mt-5 flex flex-wrap gap-2 border-b border-slate-200 pb-4">
          {SPORT_LIST.map((sp) => {
            const isActive = sp.id === activeSport;
            const name = SPORT_I18N[sp.id]?.[lang]?.name ?? sp.name;
            return (
              <Link
                key={sp.id}
                href={`/leaderboard?sport=${sp.id}`}
                aria-current={isActive ? "page" : undefined}
                className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
                  isActive ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <span aria-hidden="true">{sp.emoji}</span>
                {name}
              </Link>
            );
          })}
        </div>

        {/* Metric chips (only sports with timed metrics) */}
        {metrics.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {metrics.map((m) => {
              const isActive = m.key === activeKey;
              return (
                <Link
                  key={m.key}
                  href={`/leaderboard?sport=${activeSport}&metric=${m.key}`}
                  aria-current={isActive ? "page" : undefined}
                  className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                    isActive ? "bg-brand text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {metricLabel(m.key, m.name, lang)}
                </Link>
              );
            })}
          </div>
        )}

        {metrics.length === 0 ? (
          <div className="card mt-6 p-12 text-center text-slate-500">{t.noMetrics}</div>
        ) : ranked.length === 0 ? (
          <div className="card mt-6 p-12 text-center text-slate-500">
            {t.empty(active ? metricLabel(active.key, active.name, lang) : "")}
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
                  <span className="w-8 text-center text-lg font-bold text-slate-500">
                    {medals[i] ?? i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">
                      {nameOf.get(row.userId) ?? t.unknown}
                      {isMe && <span className="badge ml-2 bg-brand/10 text-brand-dark">{t.me}</span>}
                    </p>
                    {dateOf.get(row.userId) && (
                      <p className={`text-xs ${isMe ? "text-slate-600" : "text-slate-500"}`}>{formatDate(dateOf.get(row.userId)!, lang)}</p>
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
