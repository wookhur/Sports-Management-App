import Link from "next/link";
import { getSession } from "@/lib/auth";
import Landing from "@/components/Landing";
import CompanionCard from "@/components/CompanionCard";
import { petMood, careActions } from "@/lib/pet";
import { prisma } from "@/lib/db";
import { SPORT_LIST } from "@/lib/sports";
import NavBar from "@/components/NavBar";
import OnboardingTour from "@/components/OnboardingTour";
import StreakCard from "@/components/StreakCard";
import AssignmentCard, { type MyAssignment } from "@/components/AssignmentCard";
import JoinTeamCard, { type MyTeam } from "@/components/JoinTeamCard";
import BadgeRow from "@/components/BadgeRow";
import WeekCalendar, { type WeekDay } from "@/components/WeekCalendar";
import { HomeScoreCard } from "@/components/TrainingScoreCard";
import { computeBadges, type Badge } from "@/lib/badges";
import { journalOverview } from "@/lib/trainingScore";
import { homeEncouragement } from "@/lib/encourage";
import { touchStreak, topStreaks } from "@/lib/streak";
import { formatDate, formatDuration, seoulDayKey, weekInSeoul } from "@/lib/format";
import { SPORT_I18N, metricLabel, type Lang } from "@/lib/i18n";
import { getLang } from "@/lib/getLang";

export const dynamic = "force-dynamic";

const L: Record<
  Lang,
  {
    greeting: (name: string) => string;
    subCoach: string;
    subAthlete: string;
    newFeedback: (n: number) => string;
    weeklyTitle: string;
    weeklySub: string;
    measureCountLabel: string;
    measureCount: (n: number) => string;
    pbLabel: string;
    pbCount: (n: number) => string;
    metricLabel: string;
    metricCount: (n: number) => string;
    weeklyHighlight: string;
    badgesTitle: string;
    badgesSub: (earned: number, total: number) => string;
    coachDashboard: string;
    coachDashboardLine: (n: number) => string;
    sportsTitle: string;
    featGuide: string;
    featMeasure: string;
    recentTitle: string;
    viewAll: string;
    emptyRecent: string;
    shared: string;
  }
> = {
  ko: {
    greeting: (name) => `안녕하세요, ${name}님 👋`,
    subCoach: "선수들의 기록을 확인하고 피드백을 남겨보세요.",
    subAthlete: "종목을 선택해 훈련하고 기록을 측정하세요.",
    newFeedback: (n) => `💬 코치가 새 피드백 ${n}개를 남겼어요`,
    weeklyTitle: "주간 리포트",
    weeklySub: "· 최근 7일",
    measureCountLabel: "측정 횟수",
    measureCount: (n) => `${n}회`,
    pbLabel: "최고 기록 갱신",
    pbCount: (n) => (n > 0 ? `🏆 ${n}개` : "0개"),
    metricLabel: "훈련한 항목",
    metricCount: (n) => `${n}개`,
    weeklyHighlight: "이번 주 하이라이트:",
    badgesTitle: "배지",
    badgesSub: (earned, total) => `· ${earned}/${total} 획득`,
    coachDashboard: "코치 대시보드",
    coachDashboardLine: (n) => `${n}명의 선수 · 공유된 기록 보기`,
    sportsTitle: "종목",
    featGuide: "가이드",
    featMeasure: "기록 측정",
    recentTitle: "최근 기록",
    viewAll: "전체 보기 →",
    emptyRecent: "아직 기록이 없어요. 수영 종목에서 첫 기록을 측정해보세요! 🏊",
    shared: "공유됨",
  },
  en: {
    greeting: (name) => `Hi, ${name} 👋`,
    subCoach: "Review your athletes' records and leave feedback.",
    subAthlete: "Pick a sport to train and track your records.",
    newFeedback: (n) =>
      `💬 Your coach left ${n} new feedback comment${n === 1 ? "" : "s"}`,
    weeklyTitle: "Weekly report",
    weeklySub: "· last 7 days",
    measureCountLabel: "Times recorded",
    measureCount: (n) => `${n}`,
    pbLabel: "Personal bests",
    pbCount: (n) => (n > 0 ? `🏆 ${n}` : "0"),
    metricLabel: "Events trained",
    metricCount: (n) => `${n}`,
    weeklyHighlight: "This week's highlight:",
    badgesTitle: "Badges",
    badgesSub: (earned, total) => `· ${earned}/${total} earned`,
    coachDashboard: "Coach dashboard",
    coachDashboardLine: (n) =>
      `${n} athlete${n === 1 ? "" : "s"} · view shared records`,
    sportsTitle: "Sports",
    featGuide: "Guide",
    featMeasure: "Time tracking",
    recentTitle: "Recent records",
    viewAll: "View all →",
    emptyRecent: "No records yet. Head to Swimming and log your first time! 🏊",
    shared: "Shared",
  },
  es: {
    greeting: (name) => `Hola, ${name} 👋`,
    subCoach: "Revisa las marcas de tus atletas y deja comentarios.",
    subAthlete: "Elige un deporte para entrenar y registrar tus marcas.",
    newFeedback: (n) =>
      `💬 Tu entrenador dejó ${n} comentario${n === 1 ? " nuevo" : "s nuevos"}`,
    weeklyTitle: "Reporte semanal",
    weeklySub: "· últimos 7 días",
    measureCountLabel: "Mediciones",
    measureCount: (n) => `${n}`,
    pbLabel: "Mejores marcas",
    pbCount: (n) => (n > 0 ? `🏆 ${n}` : "0"),
    metricLabel: "Pruebas entrenadas",
    metricCount: (n) => `${n}`,
    weeklyHighlight: "Lo mejor de la semana:",
    badgesTitle: "Insignias",
    badgesSub: (earned, total) => `· ${earned}/${total} obtenidas`,
    coachDashboard: "Panel del entrenador",
    coachDashboardLine: (n) =>
      `${n} atleta${n === 1 ? "" : "s"} · ver marcas compartidas`,
    sportsTitle: "Deportes",
    featGuide: "Guía",
    featMeasure: "Medición de tiempos",
    recentTitle: "Marcas recientes",
    viewAll: "Ver todo →",
    emptyRecent: "Aún no tienes marcas. ¡Ve a Natación y registra tu primer tiempo! 🏊",
    shared: "Compartido",
  },
};

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ tutorial?: string }>;
}) {
  const session = await getSession();
  const lang = await getLang();
  // Logged-out visitors get the dramatic intro instead of a bare redirect.
  if (!session) return <Landing lang={lang} />;

  const s = L[lang];
  const isCoach = session.role === "COACH";
  const { tutorial } = await searchParams;
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { onboarded: true, homeHidden: true, beans: true, petGrowth: true },
  });
  const showTour = tutorial === "1" || !user?.onboarded;
  // Home-dashboard personalization: sections the user chose to hide.
  const hidden = new Set(user?.homeHidden ?? []);
  const show = (key: string) => !hidden.has(key);

  // Record today's visit and read the leaderboard (idempotent per day).
  const streak = await touchStreak(session.userId);
  const leaders = await topStreaks(5);

  // Week calendar: mark days in the current (Seoul) week that have activity
  // — a training-journal entry, a logged record, or a community-board post.
  const { days: weekDaysRaw, todayKey } = weekInSeoul();
  const weekStart = new Date(`${weekDaysRaw[0].key}T00:00:00+09:00`);
  const [weekRecords, weekPosts, weekSessions] = await Promise.all([
    prisma.record.findMany({
      where: { userId: session.userId, createdAt: { gte: weekStart } },
      select: { createdAt: true },
    }),
    prisma.boardPost.findMany({
      where: { authorId: session.userId, createdAt: { gte: weekStart } },
      select: { createdAt: true },
    }),
    prisma.trainingSession.findMany({
      where: { userId: session.userId, day: { in: weekDaysRaw.map((d) => d.key) } },
      select: { day: true },
    }),
  ]);
  const activeDays = new Set<string>([
    ...weekRecords.map((r) => seoulDayKey(r.createdAt)),
    ...weekPosts.map((p) => seoulDayKey(p.createdAt)),
    ...weekSessions.map((s) => s.day),
  ]);
  const weekDays: WeekDay[] = weekDaysRaw.map((d) => ({
    key: d.key,
    dayNum: d.dayNum,
    isToday: d.key === todayKey,
    hasActivity: activeDays.has(d.key),
  }));

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
      bestLine: bestPb
        ? `${metricLabel(bestPb.metricKey, bestPb.metricName, lang)} ${formatDuration(bestPb.durationMs!)}`
        : null,
    };
  }

  // Today's training score (athletes) — same engine as /journal.
  let todayScore: { total: number; yesterdayTotal: number; minutes: number } | null = null;
  if (!isCoach) {
    const o = await journalOverview(session.userId);
    todayScore = { total: o.today.total, yesterdayTotal: o.yesterdayTotal, minutes: o.today.minutes };
  }

  // New coach feedback since I last opened my records page.
  let newFeedback = 0;
  let myAssignments: MyAssignment[] = [];
  let myTeams: MyTeam[] = [];
  let badges: Badge[] = [];
  if (!isCoach) {
    badges = await computeBadges(session.userId, lang);
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
    ? await prisma.coachAthlete.count({ where: { coachId: session.userId, status: "ACCEPTED" } })
    : 0;

  // --- Companion state -----------------------------------------------------
  // The pet mirrors real training data, so it doubles as a status readout.
  const activeToday = activeDays.has(todayKey);
  // Consecutive quiet days, walking back from today through this week.
  let daysIdle = 0;
  for (let i = weekDaysRaw.length - 1; i >= 0; i--) {
    const key = weekDaysRaw[i].key;
    if (key > todayKey) continue; // future days in the current week
    if (activeDays.has(key)) break;
    daysIdle += 1;
  }
  const petGrowth = user?.petGrowth ?? 0;
  const beans = user?.beans ?? 0;
  const cheapestCare = careActions(petGrowth).reduce(
    (min, c) => (min === 0 ? c.cost : Math.min(min, c.cost)),
    0,
  );
  const mood = petMood({
    streak: streak.current,
    activeToday,
    todayScore: todayScore?.total ?? 0,
    daysIdle,
    spendableBeans: beans,
    cheapestCare,
  });
  const needsCare = cheapestCare > 0 && beans >= cheapestCare;

  // Milestone/greeting lines (e.g. "오 3일째 오셨네요!") — spoken by the pet
  // on the first visit of a day so the companion is the single mascot voice.
  const cheer = homeEncouragement({
    lang,
    name: session.name,
    streak: streak.current,
    advancedToday: streak.advancedToday,
    todayScore: todayScore?.total ?? 0,
    activeToday,
  });
  const sayOverride = streak.advancedToday ? `${cheer.emoji} ${cheer.text}` : null;

  return (
    <>
      <NavBar />
      <OnboardingTour role={session.role} initialOpen={showTour} lang={lang} />
      <main className="mx-auto max-w-5xl px-4 py-8">
        <section className="mb-6">
          <h1 className="text-2xl font-bold sm:text-3xl">
            {s.greeting(session.name)}
          </h1>
          <p className="mt-1 text-slate-500">
            {isCoach ? s.subCoach : s.subAthlete}
          </p>
        </section>

        <div className="mb-6">
          <CompanionCard
            lang={lang}
            name={session.name}
            growth={petGrowth}
            mood={mood}
            streak={streak.current}
            daysIdle={daysIdle}
            needsCare={needsCare}
            sayOverride={sayOverride}
          />
        </div>

        {newFeedback > 0 && (
          <Link
            href="/records"
            className="mb-6 flex items-center justify-between rounded-2xl border border-brand/20 bg-brand/5 px-5 py-4 transition hover:bg-brand/10"
          >
            <p className="text-sm font-semibold text-brand">
              {s.newFeedback(newFeedback)}
            </p>
            <span className="text-brand">→</span>
          </Link>
        )}

        {show("calendar") && (
          <section className="mb-6">
            <WeekCalendar lang={lang} days={weekDays} />
          </section>
        )}

        {todayScore && show("score") && (
          <section className="mb-6">
            <HomeScoreCard
              lang={lang}
              total={todayScore.total}
              yesterdayTotal={todayScore.yesterdayTotal}
              minutes={todayScore.minutes}
            />
          </section>
        )}

        {show("streak") && (
          <section className="mb-8">
            <StreakCard streak={streak} leaders={leaders} myName={session.name} lang={lang} />
          </section>
        )}

        {weekly && show("weekly") && (
          <section className="mb-8">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
              {s.weeklyTitle} <span className="font-normal normal-case text-slate-300">{s.weeklySub}</span>
            </h2>
            <div className="grid grid-cols-3 gap-3">
              <div className="card p-4">
                <p className="text-xs text-slate-400">{s.measureCountLabel}</p>
                <p className="mt-1 text-xl font-bold tabular-nums">{s.measureCount(weekly.count)}</p>
              </div>
              <div className="card p-4">
                <p className="text-xs text-slate-400">{s.pbLabel}</p>
                <p className="mt-1 text-xl font-bold tabular-nums">
                  {s.pbCount(weekly.pbCount)}
                </p>
              </div>
              <div className="card p-4">
                <p className="text-xs text-slate-400">{s.metricLabel}</p>
                <p className="mt-1 text-xl font-bold tabular-nums">{s.metricCount(weekly.metricCount)}</p>
              </div>
            </div>
            {weekly.bestLine && (
              <p className="mt-2 text-sm text-slate-500">
                {s.weeklyHighlight} <span className="font-semibold text-slate-700">{weekly.bestLine}</span> 🎉
              </p>
            )}
          </section>
        )}

        {!isCoach && show("tasks") && (
          <section className="mb-8 grid gap-4 md:grid-cols-2">
            <AssignmentCard assignments={myAssignments} lang={lang} />
            <JoinTeamCard teams={myTeams} lang={lang} />
          </section>
        )}

        {!isCoach && badges.length > 0 && show("badges") && (
          <section className="mb-8">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
              {s.badgesTitle} <span className="font-normal normal-case text-slate-300">{s.badgesSub(badges.filter((b) => b.earned).length, badges.length)}</span>
            </h2>
            <BadgeRow badges={badges} />
          </section>
        )}

        {isCoach && (
          <Link
            href="/coach"
            className="mb-8 flex items-center justify-between rounded-2xl bg-slate-900 p-5 text-white transition hover:bg-slate-800"
          >
            <div>
              <p className="text-sm text-slate-300">{s.coachDashboard}</p>
              <p className="text-lg font-semibold">
                {s.coachDashboardLine(athleteCount)}
              </p>
            </div>
            <span className="text-2xl">→</span>
          </Link>
        )}

        {show("sports") && (
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
            {s.sportsTitle}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {SPORT_LIST.map((sport) => (
              <Link
                key={sport.id}
                href={`/sports/${sport.id}`}
                className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${sport.gradient} p-5 text-white shadow-sm transition hover:shadow-md`}
              >
                <div className="text-4xl">{sport.emoji}</div>
                <h3 className="mt-3 text-xl font-bold">
                  {SPORT_I18N[sport.id]?.[lang]?.name ?? sport.name}
                </h3>
                <p className="mt-1 text-sm text-white/85">
                  {SPORT_I18N[sport.id]?.[lang]?.tagline ?? sport.tagline}
                </p>
                <div className="mt-4 flex gap-1.5">
                  {sport.features.includes("guide") && (
                    <span className="badge bg-white/20 text-white">{s.featGuide}</span>
                  )}
                  {sport.features.includes("measure") && (
                    <span className="badge bg-white/20 text-white">{s.featMeasure}</span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>
        )}

        {!isCoach && show("recent") && (
          <section className="mt-10">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
                {s.recentTitle}
              </h2>
              <Link href="/records" className="text-sm font-medium text-brand">
                {s.viewAll}
              </Link>
            </div>
            {recentRecords.length === 0 ? (
              <div className="card p-8 text-center text-slate-500">
                {s.emptyRecent}
              </div>
            ) : (
              <div className="card divide-y divide-slate-100">
                {recentRecords.map((r) => (
                  <div key={r.id} className="flex items-center justify-between px-5 py-3.5">
                    <div>
                      <p className="font-medium">{metricLabel(r.metricKey, r.metricName, lang)}</p>
                      <p className="text-xs text-slate-400">{formatDate(r.createdAt, lang)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      {r.durationMs != null && (
                        <span className="font-mono text-lg font-semibold tabular-nums">
                          {formatDuration(r.durationMs)}
                        </span>
                      )}
                      {r.shared && (
                        <span className="badge bg-emerald-50 text-emerald-600">{s.shared}</span>
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
