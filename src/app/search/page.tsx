import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import NavBar from "@/components/NavBar";
import SearchBox from "@/components/SearchBox";
import { searchWorkouts, STROKE_KO, LEVEL_KO } from "@/lib/swimming";
import { searchDrills } from "@/lib/soccerDrills";
import { lacrosseSearchItems } from "@/lib/lacrosseProgram";

export const dynamic = "force-dynamic";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  if (!(await getSession())) redirect("/login");
  const { q } = await searchParams;
  const query = (q ?? "").trim();

  const workouts = query ? searchWorkouts(query) : [];
  const drills = query ? searchDrills(query) : [];
  const laxVideos = query
    ? lacrosseSearchItems()
        .filter((v) => `${v.title} ${v.note} ${v.group}`.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 6)
    : [];
  const posts = query
    ? await prisma.blogPost.findMany({
        where: {
          published: true,
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { excerpt: { contains: query, mode: "insensitive" } },
            { body: { contains: query, mode: "insensitive" } },
            { tag: { contains: query, mode: "insensitive" } },
          ],
        },
        orderBy: { createdAt: "desc" },
        take: 8,
      })
    : [];

  const total = workouts.length + drills.length + laxVideos.length + posts.length;

  return (
    <>
      <NavBar />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="text-2xl font-bold">통합 검색</h1>
        <div className="mt-4">
          <SearchBox initial={query} />
        </div>

        {query && (
          <p className="mt-4 text-sm text-slate-500">
            <span className="font-semibold text-slate-800">“{query}”</span> · {total}개 결과
          </p>
        )}

        {query && total === 0 && (
          <div className="card mt-4 p-10 text-center text-slate-500">
            검색 결과가 없어요. 다른 키워드로 시도해보세요.
          </div>
        )}

        {/* Swim workouts */}
        {workouts.length > 0 && (
          <Group title="🏊 수영 워크아웃">
            {workouts.map((w) => (
              <ResultRow
                key={w.id}
                href={`/sports/swimming/workouts/${w.id}`}
                title={`${STROKE_KO[w.stroke]} · ${w.base}m 기준`}
                meta={`${w.id} · ${LEVEL_KO[w.level]} · 총 ${w.totalDistanceM.toLocaleString()}m`}
              />
            ))}
          </Group>
        )}

        {/* Soccer drills */}
        {drills.length > 0 && (
          <Group title="⚽ 축구 드릴">
            {drills.map((d) => (
              <ResultRow
                key={d.id}
                href={`/sports/soccer/drills/${d.id}`}
                title={d.title}
                meta={`${d.category} · ${d.summary}`}
              />
            ))}
          </Group>
        )}

        {/* Lacrosse videos */}
        {laxVideos.length > 0 && (
          <section className="mt-6">
            <h2 className="mb-2 text-sm font-semibold text-slate-500">🥍 라크로스 훈련 영상</h2>
            <div className="card divide-y divide-slate-100">
              {laxVideos.map((v) => (
                <a
                  key={v.url}
                  href={v.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block px-5 py-3.5 transition hover:bg-slate-50"
                >
                  <p className="font-medium text-slate-800">▶ {v.title}</p>
                  <p className="mt-0.5 line-clamp-1 text-sm text-slate-500">
                    {v.group} · {v.note}
                  </p>
                </a>
              ))}
            </div>
          </section>
        )}

        {/* Blog */}
        {posts.length > 0 && (
          <Group title="📝 블로그">
            {posts.map((p) => (
              <ResultRow
                key={p.id}
                href={`/blog/${p.slug}`}
                title={`${p.emoji} ${p.title}`}
                meta={p.excerpt}
              />
            ))}
          </Group>
        )}
      </main>
    </>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-6">
      <h2 className="mb-2 text-sm font-semibold text-slate-500">{title}</h2>
      <div className="card divide-y divide-slate-100">{children}</div>
    </section>
  );
}

function ResultRow({ href, title, meta }: { href: string; title: string; meta: string }) {
  return (
    <Link href={href} className="block px-5 py-3.5 transition hover:bg-slate-50">
      <p className="font-medium text-slate-800">{title}</p>
      <p className="mt-0.5 line-clamp-1 text-sm text-slate-500">{meta}</p>
    </Link>
  );
}
