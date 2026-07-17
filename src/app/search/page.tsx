import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import NavBar from "@/components/NavBar";
import SearchBox from "@/components/SearchBox";
import { searchWorkouts, STROKE_KO, LEVEL_KO } from "@/lib/swimming";
import { searchDrills } from "@/lib/soccerDrills";
import { lacrosseSearchItems } from "@/lib/lacrosseProgram";
import { getLang } from "@/lib/getLang";
import type { Lang } from "@/lib/i18n";

export const dynamic = "force-dynamic";

const L: Record<
  Lang,
  {
    title: string;
    resultCount: (n: number) => string;
    empty: string;
    swimHeading: string;
    workoutTitle: (stroke: string, base: number) => string;
    workoutMeta: (id: string, level: string, total: string) => string;
    soccerHeading: string;
    lacrosseHeading: string;
    blogHeading: string;
  }
> = {
  ko: {
    title: "통합 검색",
    resultCount: (n) => `${n}개 결과`,
    empty: "검색 결과가 없어요. 다른 키워드로 시도해보세요.",
    swimHeading: "🏊 수영 워크아웃",
    workoutTitle: (stroke, base) => `${stroke} · ${base}m 기준`,
    workoutMeta: (id, level, total) => `${id} · ${level} · 총 ${total}m`,
    soccerHeading: "⚽ 축구 드릴",
    lacrosseHeading: "🥍 라크로스 훈련 영상",
    blogHeading: "📝 블로그",
  },
  en: {
    title: "Search",
    resultCount: (n) => `${n} result${n === 1 ? "" : "s"}`,
    empty: "No results found. Try a different keyword.",
    swimHeading: "🏊 Swim workouts",
    workoutTitle: (stroke, base) => `${stroke} · ${base}m base`,
    workoutMeta: (id, level, total) => `${id} · ${level} · ${total}m total`,
    soccerHeading: "⚽ Soccer drills",
    lacrosseHeading: "🥍 Lacrosse training videos",
    blogHeading: "📝 Blog",
  },
  es: {
    title: "Búsqueda",
    resultCount: (n) => `${n} resultado${n === 1 ? "" : "s"}`,
    empty: "No hay resultados. Prueba con otra palabra clave.",
    swimHeading: "🏊 Entrenamientos de natación",
    workoutTitle: (stroke, base) => `${stroke} · base de ${base}m`,
    workoutMeta: (id, level, total) => `${id} · ${level} · ${total}m en total`,
    soccerHeading: "⚽ Ejercicios de fútbol",
    lacrosseHeading: "🥍 Videos de entrenamiento de lacrosse",
    blogHeading: "📝 Blog",
  },
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  if (!(await getSession())) redirect("/login");
  const lang = await getLang();
  const s = L[lang];
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
        <h1 className="text-2xl font-bold">{s.title}</h1>
        <div className="mt-4">
          <SearchBox initial={query} lang={lang} />
        </div>

        {query && (
          <p className="mt-4 text-sm text-slate-500">
            <span className="font-semibold text-slate-800">“{query}”</span> · {s.resultCount(total)}
          </p>
        )}

        {query && total === 0 && (
          <div className="card mt-4 p-10 text-center text-slate-500">
            {s.empty}
          </div>
        )}

        {/* Swim workouts */}
        {workouts.length > 0 && (
          <Group title={s.swimHeading}>
            {workouts.map((w) => (
              <ResultRow
                key={w.id}
                href={`/sports/swimming/workouts/${w.id}`}
                title={s.workoutTitle(STROKE_KO[w.stroke], w.base)}
                meta={s.workoutMeta(w.id, LEVEL_KO[w.level], w.totalDistanceM.toLocaleString())}
              />
            ))}
          </Group>
        )}

        {/* Soccer drills */}
        {drills.length > 0 && (
          <Group title={s.soccerHeading}>
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
            <h2 className="mb-2 text-sm font-semibold text-slate-500">{s.lacrosseHeading}</h2>
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
          <Group title={s.blogHeading}>
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
