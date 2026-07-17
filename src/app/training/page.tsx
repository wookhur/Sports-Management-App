import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { SPORTS } from "@/lib/sports";
import { getWorkoutCount, getVideoCount } from "@/lib/swimming";
import { DRILLS } from "@/lib/soccerDrills";
import NavBar from "@/components/NavBar";
import { ChevronRightIcon, StarIcon } from "@/components/navIcons";

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

export default async function TrainingLibraryPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const sections: { sportId: string; resources: Resource[] }[] = [
    {
      sportId: "swimming",
      resources: [
        {
          href: "/sports/swimming/workouts",
          category: "워크아웃 데이터베이스",
          title: "완성 워크아웃 모음",
          description: "웜업부터 쿨다운까지 5단계 세트 구성 · 영법·거리·레벨별 필터",
          count: `${getWorkoutCount().toLocaleString()}개`,
        },
        {
          href: "/sports/swimming",
          category: "기록 측정",
          title: "랩 타임 스톱워치",
          description: "영법·거리별 기록을 측정하고 코치와 공유하세요",
          count: `드릴 영상 ${getVideoCount()}개`,
        },
      ],
    },
    {
      sportId: "soccer",
      resources: [
        {
          href: "/sports/soccer/drills",
          category: "드릴 다이어그램",
          title: "연령대별 드릴 (그림 설명)",
          description: "콘 배치와 선수 움직임을 다이어그램으로 확인",
          count: `${DRILLS.length}개`,
        },
        {
          href: "/sports/soccer/program",
          category: "훈련 프로그램",
          title: "학년별 세션 플랜",
          description: "실제 훈련 커리큘럼 · 스트레칭 루틴 포함",
        },
        {
          href: "/sports/soccer",
          category: "기본기 가이드",
          title: "연습 방식 단계별 가이드",
          description: "퍼스트 터치부터 수비 포지셔닝까지",
          count: `${SPORTS.soccer.guides?.length ?? 0}개`,
        },
      ],
    },
    {
      sportId: "lacrosse",
      resources: [
        {
          href: "/sports/lacrosse/program",
          category: "엘리트 훈련 프로그램",
          title: "USA Lacrosse · NCAA D1 · PLL 기반",
          description: "철학·웜업·컨디셔닝·포지션별 플랜과 검증 영상",
        },
        {
          href: "/sports/lacrosse",
          category: "기본기 가이드",
          title: "훈련 방식 단계별 가이드",
          description: "크레들링부터 1대1 도징까지",
          count: `${SPORTS.lacrosse.guides?.length ?? 0}개`,
        },
      ],
    },
  ];

  return (
    <>
      <NavBar />
      <main className="mx-auto max-w-5xl px-4 py-8">
        <h1 className="text-2xl font-bold">트레이닝 라이브러리</h1>
        <p className="mt-1 text-slate-500">종목별 워크아웃, 드릴, 프로그램, 가이드를 한곳에서 찾아보세요.</p>

        {/* 스타 루틴 배너 */}
        <Link
          href="/stars"
          className="mt-6 flex items-center justify-between gap-4 rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-5 transition hover:shadow-md"
        >
          <div className="flex items-center gap-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
              <StarIcon className="h-6 w-6" />
            </span>
            <div>
              <p className="text-sm font-medium text-amber-700">스타 루틴</p>
              <p className="font-bold text-slate-800">세계적인 선수들은 어떻게 훈련할까요?</p>
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
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-base"
                    style={{ backgroundColor: `${sport.accent}1a` }}
                    aria-hidden="true"
                  >
                    {sport.emoji}
                  </span>
                  {sport.name}
                </h2>
                <Link
                  href={`/sports/${sportId}`}
                  className="text-sm font-medium text-slate-400 transition-colors hover:text-brand"
                >
                  종목 홈 →
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
                      <span className="text-xs font-semibold" style={{ color: sport.accent }}>
                        {r.category}
                      </span>
                      {r.count && <span className="badge bg-slate-100 text-slate-500">{r.count}</span>}
                    </div>
                    <h3 className="mt-2 font-bold text-slate-800 group-hover:text-brand">{r.title}</h3>
                    <p className="mt-1 flex-1 text-sm text-slate-500">{r.description}</p>
                    <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-slate-400 group-hover:text-brand">
                      바로가기 <ChevronRightIcon className="h-3.5 w-3.5" />
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
