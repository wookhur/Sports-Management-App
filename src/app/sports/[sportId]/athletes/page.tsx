import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getSport } from "@/lib/sports";
import NavBar from "@/components/NavBar";
import DeletePostButton from "@/components/DeletePostButton";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AthleteGuideListPage({
  params,
}: {
  params: Promise<{ sportId: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  const isCoach = session.role === "COACH";

  const { sportId } = await params;
  const sport = getSport(sportId);
  if (!sport) notFound();

  const guides = await prisma.athleteGuide.findMany({
    where: { sport: sportId, published: true },
    orderBy: { createdAt: "desc" },
    include: { author: { select: { name: true } } },
  });

  return (
    <>
      <NavBar />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <Link href={`/sports/${sportId}`} className="text-sm text-slate-400 hover:text-slate-600">
          ← {sport.name}
        </Link>

        <div className="mt-3 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{sport.name} 유명 선수 훈련법</h1>
            <p className="mt-1 text-slate-500">유명 선수들이 실제로 사용하는 훈련 방법을 만나보세요.</p>
          </div>
          {isCoach && (
            <Link href={`/sports/${sportId}/athletes/new`} className="btn-primary">
              + 글쓰기
            </Link>
          )}
        </div>

        <div className="mt-6 space-y-4">
          {guides.length === 0 && (
            <div className="card p-10 text-center text-slate-500">아직 등록된 훈련법이 없어요.</div>
          )}
          {guides.map((guide) => (
            <div key={guide.id} className="card group flex gap-4 p-5 transition hover:border-slate-300 hover:shadow-md">
              <Link href={`/sports/${sportId}/athletes/${guide.slug}`} className="flex shrink-0">
                {guide.coverImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={guide.coverImage}
                    alt=""
                    className="h-20 w-28 rounded-xl bg-slate-100 object-cover"
                  />
                ) : (
                  <span className="text-4xl">{sport.emoji}</span>
                )}
              </Link>
              <div className="min-w-0 flex-1">
                <Link href={`/sports/${sportId}/athletes/${guide.slug}`}>
                  <div className="flex items-center gap-2">
                    <span className="badge bg-brand/10 text-brand">{guide.athleteName}</span>
                    <span className="text-xs text-slate-400">{formatDate(guide.createdAt)}</span>
                  </div>
                  <h2 className="mt-1 text-lg font-bold group-hover:text-brand">{guide.title}</h2>
                  <p className="mt-1 line-clamp-2 text-sm text-slate-500">{guide.excerpt}</p>
                </Link>
                <div className="mt-2 flex items-center justify-between">
                  <p className="text-xs text-slate-400">{guide.author?.name ?? "sideline365"}</p>
                  {isCoach && (
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/sports/${sportId}/athletes/${guide.slug}/edit`}
                        className="text-xs font-medium text-slate-400 hover:text-brand"
                      >
                        수정
                      </Link>
                      <DeletePostButton slug={guide.slug} endpointBase="/api/athlete-guides" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
