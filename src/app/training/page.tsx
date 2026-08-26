import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { SPORTS } from "@/lib/sports";
import { getWorkoutCount, getVideoCount } from "@/lib/swimming";
import { DRILLS } from "@/lib/soccerDrills";
import SportIcon from "@/components/sportIcons";
import NavBar from "@/components/NavBar";
import { ChevronRightIcon, StarIcon } from "@/components/navIcons";
import { SPORT_I18N, type Lang } from "@/lib/i18n";
import { getLang } from "@/lib/getLang";

// "트레이닝 라이브러리" — one place to find every training resource in the
// app (workouts, drills, programs, basic guides), grouped by sport. Pure
// aggregation over existing content; each card links into the source page.

interface Resource {
  href: string;
  category: string;
  title: string;
  description: string;
  count?: string;
}

const L: Record<
  Lang,
  {
    title: string;
    sub: string;
    starLabel: string;
    starHeading: string;
    sportHome: string;
    go: string;
    nItems: (n: number) => string;
    nDrillVideos: (n: number) => string;
    swWorkoutsCat: string;
    swWorkoutsTitle: string;
    swWorkoutsDesc: string;
    swStopwatchCat: string;
    swStopwatchTitle: string;
    swStopwatchDesc: string;
    scDrillsCat: string;
    scDrillsTitle: string;
    scDrillsDesc: string;
    scProgramCat: string;
    scProgramTitle: string;
    scProgramDesc: string;
    scGuidesCat: string;
    scGuidesTitle: string;
    scGuidesDesc: string;
    laxProgramCat: string;
    laxProgramTitle: string;
    laxProgramDesc: string;
    laxGuidesCat: string;
    laxGuidesTitle: string;
    laxGuidesDesc: string;
  }
> = {
  ko: {
    title: "트레이닝 라이브러리",
    sub: "종목별 워크아웃, 드릴, 프로그램, 가이드를 한곳에서 찾아보세요.",
    starLabel: "스타 루틴",
    starHeading: "세계적인 선수들은 어떻게 훈련할까요?",
    sportHome: "종목 홈 →",
    go: "바로가기",
    nItems: (n) => `${n.toLocaleString()}개`,
    nDrillVideos: (n) => `드릴 영상 ${n}개`,
    swWorkoutsCat: "워크아웃 데이터베이스",
    swWorkoutsTitle: "완성 워크아웃 모음",
    swWorkoutsDesc: "웜업부터 쿨다운까지 5단계 세트 구성 · 영법·거리·레벨별 필터",
    swStopwatchCat: "기록 측정",
    swStopwatchTitle: "랩 타임 스톱워치",
    swStopwatchDesc: "영법·거리별 기록을 측정하고 코치와 공유하세요",
    scDrillsCat: "드릴 다이어그램",
    scDrillsTitle: "연령대별 드릴 (그림 설명)",
    scDrillsDesc: "콘 배치와 선수 움직임을 다이어그램으로 확인",
    scProgramCat: "훈련 프로그램",
    scProgramTitle: "학년별 세션 플랜",
    scProgramDesc: "실제 훈련 커리큘럼 · 스트레칭 루틴 포함",
    scGuidesCat: "기본기 가이드",
    scGuidesTitle: "연습 방식 단계별 가이드",
    scGuidesDesc: "퍼스트 터치부터 수비 포지셔닝까지",
    laxProgramCat: "엘리트 훈련 프로그램",
    laxProgramTitle: "USA Lacrosse · NCAA D1 · PLL 기반",
    laxProgramDesc: "철학·웜업·컨디셔닝·포지션별 플랜과 검증 영상",
    laxGuidesCat: "기본기 가이드",
    laxGuidesTitle: "훈련 방식 단계별 가이드",
    laxGuidesDesc: "크레들링부터 1대1 도징까지",
  },
  en: {
    title: "Training Library",
    sub: "Find workouts, drills, programs, and guides for every sport in one place.",
    starLabel: "Star Routines",
    starHeading: "How do world-class athletes train?",
    sportHome: "Sport home →",
    go: "Open",
    nItems: (n) => `${n.toLocaleString()} items`,
    nDrillVideos: (n) => `${n} drill videos`,
    swWorkoutsCat: "Workout database",
    swWorkoutsTitle: "Complete workout collection",
    swWorkoutsDesc: "5-part sets from warm-up to cool-down · filter by stroke, distance, and level",
    swStopwatchCat: "Time tracking",
    swStopwatchTitle: "Lap time stopwatch",
    swStopwatchDesc: "Track times by stroke and distance and share them with your coach",
    scDrillsCat: "Drill diagrams",
    scDrillsTitle: "Drills by age group (illustrated)",
    scDrillsDesc: "See cone setups and player movement in diagrams",
    scProgramCat: "Training program",
    scProgramTitle: "Session plans by grade",
    scProgramDesc: "Real training curriculum · stretching routine included",
    scGuidesCat: "Fundamentals guides",
    scGuidesTitle: "Step-by-step practice guides",
    scGuidesDesc: "From first touch to defensive positioning",
    laxProgramCat: "Elite training program",
    laxProgramTitle: "Based on USA Lacrosse · NCAA D1 · PLL",
    laxProgramDesc: "Philosophy, warm-up, conditioning, position plans, and verified videos",
    laxGuidesCat: "Fundamentals guides",
    laxGuidesTitle: "Step-by-step training guides",
    laxGuidesDesc: "From cradling to 1-on-1 dodging",
  },
  es: {
    title: "Biblioteca de entrenamiento",
    sub: "Encuentra workouts, ejercicios, programas y guías de cada deporte en un solo lugar.",
    starLabel: "Rutinas de estrellas",
    starHeading: "¿Cómo entrenan los atletas de clase mundial?",
    sportHome: "Inicio del deporte →",
    go: "Abrir",
    nItems: (n) => `${n.toLocaleString()} elementos`,
    nDrillVideos: (n) => `${n} videos de ejercicios`,
    swWorkoutsCat: "Base de datos de workouts",
    swWorkoutsTitle: "Colección de workouts completos",
    swWorkoutsDesc: "Series en 5 fases, del calentamiento a la vuelta a la calma · filtra por estilo, distancia y nivel",
    swStopwatchCat: "Registro de tiempos",
    swStopwatchTitle: "Cronómetro de vueltas",
    swStopwatchDesc: "Registra tus tiempos por estilo y distancia y compártelos con tu entrenador",
    scDrillsCat: "Diagramas de ejercicios",
    scDrillsTitle: "Ejercicios por edad (ilustrados)",
    scDrillsDesc: "Mira la colocación de conos y los movimientos en diagramas",
    scProgramCat: "Programa de entrenamiento",
    scProgramTitle: "Planes de sesión por grado",
    scProgramDesc: "Currículo de entrenamiento real · incluye rutina de estiramientos",
    scGuidesCat: "Guías de fundamentos",
    scGuidesTitle: "Guías de práctica paso a paso",
    scGuidesDesc: "Del primer toque al posicionamiento defensivo",
    laxProgramCat: "Programa de entrenamiento de élite",
    laxProgramTitle: "Basado en USA Lacrosse · NCAA D1 · PLL",
    laxProgramDesc: "Filosofía, calentamiento, acondicionamiento, planes por posición y videos verificados",
    laxGuidesCat: "Guías de fundamentos",
    laxGuidesTitle: "Guías de entrenamiento paso a paso",
    laxGuidesDesc: "Del cradling a los duelos 1 contra 1",
  },
};

export default async function TrainingLibraryPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const lang = await getLang();
  const s = L[lang];

  const sections: { sportId: string; resources: Resource[] }[] = [
    {
      sportId: "swimming",
      resources: [
        {
          href: "/sports/swimming/workouts",
          category: s.swWorkoutsCat,
          title: s.swWorkoutsTitle,
          description: s.swWorkoutsDesc,
          count: s.nItems(getWorkoutCount()),
        },
        {
          href: "/sports/swimming",
          category: s.swStopwatchCat,
          title: s.swStopwatchTitle,
          description: s.swStopwatchDesc,
          count: s.nDrillVideos(getVideoCount()),
        },
      ],
    },
    {
      sportId: "soccer",
      resources: [
        {
          href: "/sports/soccer/drills",
          category: s.scDrillsCat,
          title: s.scDrillsTitle,
          description: s.scDrillsDesc,
          count: s.nItems(DRILLS.length),
        },
        {
          href: "/sports/soccer/program",
          category: s.scProgramCat,
          title: s.scProgramTitle,
          description: s.scProgramDesc,
        },
        {
          href: "/sports/soccer",
          category: s.scGuidesCat,
          title: s.scGuidesTitle,
          description: s.scGuidesDesc,
          count: s.nItems(SPORTS.soccer.guides?.length ?? 0),
        },
      ],
    },
    {
      sportId: "lacrosse",
      resources: [
        {
          href: "/sports/lacrosse/program",
          category: s.laxProgramCat,
          title: s.laxProgramTitle,
          description: s.laxProgramDesc,
        },
        {
          href: "/sports/lacrosse",
          category: s.laxGuidesCat,
          title: s.laxGuidesTitle,
          description: s.laxGuidesDesc,
          count: s.nItems(SPORTS.lacrosse.guides?.length ?? 0),
        },
      ],
    },
  ];

  return (
    <>
      <NavBar />
      <main className="mx-auto max-w-5xl px-4 py-8">
        <h1 className="text-2xl font-bold">{s.title}</h1>
        <p className="mt-1 text-slate-500">{s.sub}</p>

        {/* 스타 루틴 배너 */}
        <Link
          href="/stars"
          className="mt-6 flex items-center justify-between gap-4 rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-5 transition hover:shadow-md"
        >
          <div className="flex items-center gap-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
              <StarIcon className="h-6 w-6" />
            </span>
            <div>
              <p className="text-sm font-medium text-amber-700">{s.starLabel}</p>
              <p className="font-bold text-slate-800">{s.starHeading}</p>
            </div>
          </div>
          <ChevronRightIcon className="h-5 w-5 shrink-0 text-amber-500" />
        </Link>

        {sections.map(({ sportId, resources }) => {
          const sport = SPORTS[sportId];
          return (
            <section key={sportId} className="mt-10">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="flex items-center gap-2.5 text-lg font-bold">
                  <span
                    className="flex h-8 w-8 items-center justify-center rounded-lg"
                    style={{ backgroundColor: `${sport.accent}1a`, color: sport.accentText }}
                  >
                    <SportIcon sportId={sportId} className="h-5 w-5" />
                  </span>
                  {SPORT_I18N[sportId]?.[lang]?.name ?? sport.name}
                </h2>
                <Link
                  href={`/sports/${sportId}`}
                  className="text-sm font-medium text-slate-500 transition-colors hover:text-brand"
                >
                  {s.sportHome}
                </Link>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {resources.map((r) => (
                  <Link
                    key={r.href + r.title}
                    href={r.href}
                    className="card group flex flex-col p-5 transition hover:border-slate-300 hover:shadow-md"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold" style={{ color: sport.accentText }}>
                        {r.category}
                      </span>
                      {r.count && <span className="badge bg-slate-100 text-slate-600">{r.count}</span>}
                    </div>
                    <h3 className="mt-2 font-bold text-slate-800 group-hover:text-brand">{r.title}</h3>
                    <p className="mt-1 flex-1 text-sm text-slate-500">{r.description}</p>
                    <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-slate-500 group-hover:text-brand">
                      {s.go} <ChevronRightIcon className="h-3.5 w-3.5" />
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}
      </main>
    </>
  );
}
