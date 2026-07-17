import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { SPORTS, SPORT_LIST } from "@/lib/sports";
import NavBar from "@/components/NavBar";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

// "스타 루틴" — every star-athlete training routine across all sports in
// one place, with sport filter chips. Detail/edit pages stay under
// /sports/[sportId]/athletes/*; this is the cross-sport entrance the
// sidebar links to.

export default async function StarRoutinesPage({
  searchParams,
}: {
  searchParams: Promise<{ sport?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  const isCoach = session.role === "COACH";

  const { sport } = await searchParams;
  const activeSport = sport && SPORTS[sport] ? sport : undefined;

  const guides = await prisma.athleteGuide.findMany({
    where: { published: true, ...(activeSport ? { sport: activeSport } : {}) },
    orderBy: [{ sport: "asc" }, { createdAt: "desc" }],
    include: { author: { select: { name: true } } },
  });

  const chips = [
    { key: undefined as string | undefined, label: "전체" },
    ...SPORT_LIST.map((s) => ({ key: s.id as string | undefined, label: s.name })),
  ];

  return (
    <>
      <NavBar />
      <main className="mx-auto max-w-5xl px-4 py-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">⭐ 스타 루틴</h1>
            <p className="mt-1 text-slate-500">세계적인 선수들이 실제로 사용하는 훈련 방법을 만나보세요.</p>
          </div>
          {isCoach && (
            <div className="flex items-center gap-2">
              {SPORT_LIST.map((s) => (
                <Link
                  key={s.id}
                  href={`/sports/${s.id}/athletes/new`}
                  className="btn-ghost px-3 py-1.5 text-xs"
                  title={`${s.name} 스타 루틴 작성`}
                >
                  + {s.name}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Sport filter chips */}
        <div className="mt-5 flex flex-wrap items-center gap-2">
          {chips.map((chip) => {
            const active = chip.key === activeSport;
            return (
              <Link
                key={chip.label}
                href={chip.key ? `/stars?sport=${chip.key}` : "/stars"}
                aria-current={active ? "page" : undefined}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  active
                    ? "bg-brand text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {chip.label}
              </Link>
            );
          })}
        </div>

        {guides.length === 0 ? (
          <div className="card mt-6 p-12 text-center text-slate-500">
            아직 등록된 스타 루틴이 없어요.
          </div>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {guides.map((guide) => {
              const s = SPORTS[guide.sport];
              return (
                <Link
                  key={guide.id}
                  href={`/sports/${guide.sport}/athletes/${guide.slug}`}
                  className="card group flex flex-col overflow-hidden transition hover:border-slate-300 hover:shadow-md"
                >
                  {guide.coverImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={guide.coverImage} alt="" className="h-36 w-full bg-slate-100 object-cover" />
                  ) : (
                    <div
                      className="flex h-36 w-full items-center justify-center text-5xl"
                      style={{ backgroundColor: `${s?.accent ?? "#64748b"}14` }}
                      aria-hidden="true"
                    >
                      {s?.emoji ?? "⭐"}
                    </div>
                  )}
                  <div className="flex flex-1 flex-col p-5">
                    <div className="flex items-center gap-2">
                      <span
                        className="badge"
                        style={{ backgroundColor: `${s?.accent ?? "#64748b"}1a`, color: s?.accent ?? "#334155" }}
                      >
                        {s?.name ?? guide.sport}
                      </span>
                      <span className="badge bg-brand/10 text-brand">{guide.athleteName}</span>
                    </div>
                    <h2 className="mt-2 font-bold leading-snug text-slate-800 group-hover:text-brand">
                      {guide.title}
                    </h2>
                    <p className="mt-1 line-clamp-2 flex-1 text-sm text-slate-500">{guide.excerpt}</p>
                    <p className="mt-3 text-xs text-slate-400">
                      {guide.author?.name ?? "sideline365"} · {formatDate(guide.createdAt)}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </>
  );
}
