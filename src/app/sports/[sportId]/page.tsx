import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getSport } from "@/lib/sports";
import SportIcon from "@/components/sportIcons";
import { ChevronRightIcon, TargetIcon, TimerIcon } from "@/components/navIcons";
import NavBar from "@/components/NavBar";
import Stopwatch from "@/components/Stopwatch";
import { formatDate, formatDuration, formatPace } from "@/lib/format";
import { SPORT_I18N, metricLabel, guideCopy, guideLevelLabel, type Lang } from "@/lib/i18n";
import { getLang } from "@/lib/getLang";

const levelColors: Record<string, string> = {
  입문: "bg-emerald-50 text-emerald-700",
  중급: "bg-amber-50 text-amber-700",
  고급: "bg-rose-50 text-rose-600",
};

const L: Record<
  Lang,
  {
    home: string;
    swProgramCat: string;
    swProgramTitle: string;
    swProgramDesc: string;
    scDrillsCat: string;
    scDrillsTitle: string;
    scDrillsDesc: string;
    scProgramCat: string;
    scProgramTitle: string;
    scProgramDesc: string;
    laxProgramCat: string;
    laxProgramTitle: string;
    laxProgramDesc: string;
    athletesCat: string;
    athletesTitle: string;
    athletesDesc: string;
    trainingHeading: string;
    practiceHeading: string;
    guidesSub: string;
    minutes: (n: number) => string;
    recentRecords: string;
    emptyRecords: string;
    manageAll: string;
    best: string;
  }
> = {
  ko: {
    home: "홈",
    swProgramCat: "추천 훈련 프로그램",
    swProgramTitle: "1,440개 완성 워크아웃 · 영법·거리·레벨별",
    swProgramDesc: "웜업부터 쿨다운까지 5단계 세트와 검증된 드릴 영상을 제공해요.",
    scDrillsCat: "드릴 (그림 설명)",
    scDrillsTitle: "연령대별 드릴 다이어그램",
    scDrillsDesc: "콘 배치와 움직임을 그림으로 확인하세요.",
    scProgramCat: "훈련 프로그램",
    scProgramTitle: "학년별 세션 플랜 · 스트레칭",
    scProgramDesc: "실제 훈련 커리큘럼과 루틴이에요.",
    laxProgramCat: "엘리트 훈련 프로그램",
    laxProgramTitle: "USA Lacrosse · NCAA D1 · PLL 기반",
    laxProgramDesc: "철학·웜업·컨디셔닝·포지션별 플랜과 40여 개 검증 영상까지 담았어요.",
    athletesCat: "유명 선수 훈련법",
    athletesTitle: "실제 선수들은 어떻게 훈련할까요?",
    athletesDesc: "유명 선수들의 훈련 방식을 소개해요.",
    trainingHeading: "훈련 방식",
    practiceHeading: "연습 방식",
    guidesSub: "단계별 가이드를 따라 훈련해보세요.",
    minutes: (n) => `${n}분`,
    recentRecords: "최근 기록",
    emptyRecords: "아직 기록이 없어요. 왼쪽에서 첫 기록을 측정해보세요!",
    manageAll: "모든 기록 관리 →",
    best: "🏆 최고",
  },
  en: {
    home: "Home",
    swProgramCat: "Recommended training programs",
    swProgramTitle: "1,440 complete workouts · by stroke, distance, and level",
    swProgramDesc: "5-part sets from warm-up to cool-down, plus verified drill videos.",
    scDrillsCat: "Drills (illustrated)",
    scDrillsTitle: "Drill diagrams by age group",
    scDrillsDesc: "See cone setups and movement in diagrams.",
    scProgramCat: "Training program",
    scProgramTitle: "Session plans by grade · stretching",
    scProgramDesc: "Real training curriculum and routines.",
    laxProgramCat: "Elite training program",
    laxProgramTitle: "Based on USA Lacrosse · NCAA D1 · PLL",
    laxProgramDesc: "Philosophy, warm-up, conditioning, position plans, and 40+ verified videos.",
    athletesCat: "Famous athlete training methods",
    athletesTitle: "How do real athletes train?",
    athletesDesc: "Discover how famous athletes train.",
    trainingHeading: "Training methods",
    practiceHeading: "Practice methods",
    guidesSub: "Train along with step-by-step guides.",
    minutes: (n) => `${n} min`,
    recentRecords: "Recent records",
    emptyRecords: "No records yet. Track your first time on the left!",
    manageAll: "Manage all records →",
    best: "🏆 Best",
  },
  es: {
    home: "Inicio",
    swProgramCat: "Programas de entrenamiento recomendados",
    swProgramTitle: "1,440 workouts completos · por estilo, distancia y nivel",
    swProgramDesc: "Series en 5 fases, del calentamiento a la vuelta a la calma, con videos de ejercicios verificados.",
    scDrillsCat: "Ejercicios (ilustrados)",
    scDrillsTitle: "Diagramas de ejercicios por edad",
    scDrillsDesc: "Mira la colocación de conos y los movimientos en diagramas.",
    scProgramCat: "Programa de entrenamiento",
    scProgramTitle: "Planes de sesión por grado · estiramientos",
    scProgramDesc: "Currículo y rutinas de entrenamiento reales.",
    laxProgramCat: "Programa de entrenamiento de élite",
    laxProgramTitle: "Basado en USA Lacrosse · NCAA D1 · PLL",
    laxProgramDesc: "Filosofía, calentamiento, acondicionamiento, planes por posición y más de 40 videos verificados.",
    athletesCat: "Métodos de entrenamiento de atletas famosos",
    athletesTitle: "¿Cómo entrenan los atletas de verdad?",
    athletesDesc: "Te presentamos cómo entrenan los atletas famosos.",
    trainingHeading: "Métodos de entrenamiento",
    practiceHeading: "Métodos de práctica",
    guidesSub: "Entrena siguiendo las guías paso a paso.",
    minutes: (n) => `${n} min`,
    recentRecords: "Marcas recientes",
    emptyRecords: "Todavía no hay marcas. ¡Registra tu primer tiempo a la izquierda!",
    manageAll: "Gestionar todas las marcas →",
    best: "🏆 Mejor",
  },
};

export default async function SportPage({
  params,
}: {
  params: Promise<{ sportId: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const lang = await getLang();
  const t = L[lang];

  const { sportId } = await params;
  const sport = getSport(sportId);
  if (!sport) notFound();

  const sportName = SPORT_I18N[sportId]?.[lang]?.name ?? sport.name;
  const sportTagline = SPORT_I18N[sportId]?.[lang]?.tagline ?? sport.tagline;

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
        <Link href="/" className="text-sm text-slate-500 hover:text-slate-600">
          ← {t.home}
        </Link>

        <header
          className={`mt-3 flex items-center gap-4 rounded-2xl bg-gradient-to-br ${sport.gradient} p-6 text-white`}
        >
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15">
            <SportIcon sportId={sport.id} className="h-8 w-8" />
          </span>
          <div>
            <h1 className="text-2xl font-bold">{sportName}</h1>
            <p className="text-white/90">{sportTagline}</p>
          </div>
        </header>

        {/* Reference content from coach-provided databases.
            Every one of these panels used to pick its own hue — a cyan card, an
            indigo card, an emerald card and an amber card, none of them the
            colour of the sport they sit under, and two of them borrowing the
            coach dashboard's status colours. They are all the same card now,
            tinted with the sport's own accent. */}
        {sportId === "swimming" && (
          <RefLink
            href="/sports/swimming/workouts"
            accent={sport.accent}
            accentText={sport.accentText}
            cat={t.swProgramCat}
            title={t.swProgramTitle}
            desc={t.swProgramDesc}
            className="mt-6"
          />
        )}
        {sportId === "soccer" && (
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <RefLink
              href="/sports/soccer/drills"
              accent={sport.accent}
              accentText={sport.accentText}
              cat={t.scDrillsCat}
              title={t.scDrillsTitle}
              desc={t.scDrillsDesc}
            />
            <RefLink
              href="/sports/soccer/program"
              accent={sport.accent}
              accentText={sport.accentText}
              cat={t.scProgramCat}
              title={t.scProgramTitle}
              desc={t.scProgramDesc}
            />
          </div>
        )}
        {sportId === "lacrosse" && (
          <RefLink
            href="/sports/lacrosse/program"
            accent={sport.accent}
            accentText={sport.accentText}
            cat={t.laxProgramCat}
            title={t.laxProgramTitle}
            desc={t.laxProgramDesc}
            className="mt-6"
          />
        )}

        {/* Famous athlete training methods (every sport) */}
        <RefLink
          href={`/sports/${sportId}/athletes`}
          accent={sport.accent}
          accentText={sport.accentText}
          cat={t.athletesCat}
          title={t.athletesTitle}
          desc={t.athletesDesc}
          className="mt-6"
        />

        {/* Guides (lacrosse / soccer) */}
        {sport.guides && sport.guides.length > 0 && (
          <section className="mt-8">
            <h2 className="mb-1 text-lg font-bold">
              {sportId === "soccer" ? t.practiceHeading : t.trainingHeading}
            </h2>
            <p className="mb-4 text-sm text-slate-500">
              {t.guidesSub}
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              {sport.guides.map((guide) => (
                <Link
                  key={guide.id}
                  href={`/sports/${sportId}/guides/${guide.id}`}
                  className="card group p-5 transition hover:border-slate-300 hover:shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <span className={`badge ${levelColors[guide.level]}`}>{guideLevelLabel(guide.level, lang)}</span>
                    <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                      <TimerIcon className="h-3.5 w-3.5" />
                      {t.minutes(guide.durationMin)}
                    </span>
                  </div>
                  <h3 className="mt-3 text-lg font-bold group-hover:text-brand">{guideCopy(guide.id, lang, guide).title}</h3>
                  <p className="mt-1 text-sm text-slate-500">{guideCopy(guide.id, lang, guide).summary}</p>
                  <p className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-slate-500">
                    <TargetIcon className="h-3.5 w-3.5" />
                    {guideCopy(guide.id, lang, guide).focus}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Measurement (swimming) */}
        {canMeasure && sport.metrics && (
          <section className="mt-8 grid gap-6 lg:grid-cols-2">
            <Stopwatch sportId={sportId} metrics={sport.metrics} lang={lang} />

            <div>
              <h2 className="mb-3 text-lg font-bold">{t.recentRecords}</h2>
              {records.length === 0 ? (
                <div className="card p-8 text-center text-slate-500">
                  {t.emptyRecords}
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
                              {metricLabel(r.metricKey, r.metricName, lang)}
                              {isBest && (
                                <span className="badge bg-yellow-50 text-yellow-700">{t.best}</span>
                              )}
                            </p>
                            <p className="text-xs text-slate-500">{formatDate(r.createdAt, lang)}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-mono text-lg font-semibold tabular-nums">
                              {r.durationMs != null ? formatDuration(r.durationMs) : "—"}
                            </p>
                            {r.distanceM && r.durationMs != null && (
                              <p className="text-xs text-slate-500">
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
                {t.manageAll}
              </Link>
            </div>
          </section>
        )}
      </main>
    </>
  );
}

/**
 * A link out to a body of reference content — swim programs, soccer drills,
 * star routines. One shape, tinted with whichever sport's page it appears on.
 */
function RefLink({
  href,
  accent,
  accentText,
  cat,
  title,
  desc,
  className = "",
}: {
  href: string;
  accent: string;
  accentText: string;
  cat: string;
  title: string;
  desc: string;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center justify-between gap-4 rounded-2xl border p-5 transition hover:shadow-md ${className}`}
      style={{ borderColor: `${accent}33`, backgroundColor: `${accent}0d` }}
    >
      <div>
        <p className="text-sm font-medium" style={{ color: accentText }}>
          {cat}
        </p>
        <p className="mt-0.5 text-lg font-bold text-slate-800">{title}</p>
        {/* slate-600, not the 500 these cards used to use: on a tinted ground
            rather than plain white, 500 lands at 4.35:1 and misses AA. */}
        <p className="mt-1 text-sm text-slate-600">{desc}</p>
      </div>
      <span className="shrink-0" style={{ color: accentText }}>
        <ChevronRightIcon className="h-5 w-5" />
      </span>
    </Link>
  );
}
