import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import NavBar from "@/components/NavBar";
import DeletePostButton from "@/components/DeletePostButton";
import { formatDate } from "@/lib/format";
import { getLang } from "@/lib/getLang";
import type { Lang } from "@/lib/i18n";

export const dynamic = "force-dynamic";

const L: Record<
  Lang,
  {
    title: string;
    subtitle: string;
    write: string;
    empty: string;
    edit: string;
    popular: string;
    all: string;
    reactions: (likes: number, comments: number) => string;
  }
> = {
  ko: {
    title: "블로그",
    subtitle: "누구나 훈련 팁과 이야기를 나눌 수 있어요.",
    write: "+ 글쓰기",
    empty: "아직 글이 없어요. 첫 글을 남겨보세요!",
    edit: "수정",
    popular: "🔥 인기 블로그",
    all: "전체 글",
    reactions: (likes, comments) => `❤️ ${likes} · 💬 ${comments}`,
  },
  en: {
    title: "Blog",
    subtitle: "Anyone can share training tips and stories.",
    write: "+ New post",
    empty: "No posts yet. Be the first to write!",
    edit: "Edit",
    popular: "🔥 Popular",
    all: "All posts",
    reactions: (likes, comments) => `❤️ ${likes} · 💬 ${comments}`,
  },
  es: {
    title: "Blog",
    subtitle: "Cualquiera puede compartir consejos e historias.",
    write: "+ Escribir",
    empty: "Todavía no hay publicaciones. ¡Sé el primero!",
    edit: "Editar",
    popular: "🔥 Populares",
    all: "Todas las publicaciones",
    reactions: (likes, comments) => `❤️ ${likes} · 💬 ${comments}`,
  },
};

export default async function BlogListPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  const isCoach = session.role === "COACH";
  const lang = await getLang();
  const s = L[lang];

  const posts = await prisma.blogPost.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
    include: {
      author: { select: { id: true, name: true } },
      _count: { select: { likes: true, readerComments: true } },
    },
  });

  const canManage = (authorId: string | null) => authorId === session.userId || isCoach;
  const score = (p: (typeof posts)[number]) => p._count.likes * 2 + p._count.readerComments;

  // Popular = top 3 by engagement, but only once there's enough to rank.
  const popular =
    posts.length >= 4
      ? [...posts]
          .filter((p) => score(p) > 0)
          .sort((a, b) => score(b) - score(a))
          .slice(0, 3)
      : [];

  return (
    <>
      <NavBar />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{s.title}</h1>
            <p className="mt-1 text-slate-500">{s.subtitle}</p>
          </div>
          <Link href="/blog/new" className="btn-primary">
            {s.write}
          </Link>
        </div>

        {popular.length > 0 && (
          <section className="mt-6">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">{s.popular}</h2>
            <div className="grid gap-3 sm:grid-cols-3">
              {popular.map((post, i) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="card group flex flex-col p-4 transition hover:border-slate-300 hover:shadow-md"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xl" aria-hidden="true">
                      {["🥇", "🥈", "🥉"][i]}
                    </span>
                    <span className="text-2xl">{post.emoji}</span>
                  </div>
                  <h3 className="mt-2 line-clamp-2 flex-1 font-bold leading-snug group-hover:text-brand">
                    {post.title}
                  </h3>
                  <p className="mt-2 text-xs text-slate-400">{s.reactions(post._count.likes, post._count.readerComments)}</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        <section className="mt-8">
          {popular.length > 0 && (
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">{s.all}</h2>
          )}
          <div className="space-y-4">
            {posts.length === 0 && (
              <div className="card p-10 text-center text-slate-500">{s.empty}</div>
            )}
            {posts.map((post) => (
              <div key={post.id} className="card group flex gap-4 p-5 transition hover:border-slate-300 hover:shadow-md">
                <Link href={`/blog/${post.slug}`} className="flex shrink-0">
                  {post.coverImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={post.coverImage}
                      alt=""
                      className="h-20 w-28 rounded-xl bg-slate-100 object-cover"
                    />
                  ) : (
                    <span className="text-4xl">{post.emoji}</span>
                  )}
                </Link>
                <div className="min-w-0 flex-1">
                  <Link href={`/blog/${post.slug}`}>
                    <div className="flex items-center gap-2">
                      {post.tag && <span className="badge bg-brand/10 text-brand">{post.tag}</span>}
                      <span className="text-xs text-slate-400">{formatDate(post.createdAt, lang)}</span>
                    </div>
                    <h2 className="mt-1 text-lg font-bold group-hover:text-brand">{post.title}</h2>
                    <p className="mt-1 line-clamp-2 text-sm text-slate-500">{post.excerpt}</p>
                  </Link>
                  <div className="mt-2 flex items-center justify-between">
                    <p className="text-xs text-slate-400">
                      {post.author?.name ?? "sideline365"} · {s.reactions(post._count.likes, post._count.readerComments)}
                    </p>
                    {canManage(post.author?.id ?? null) && (
                      <div className="flex items-center gap-3">
                        <Link
                          href={`/blog/${post.slug}/edit`}
                          className="text-xs font-medium text-slate-400 hover:text-brand"
                        >
                          {s.edit}
                        </Link>
                        <DeletePostButton slug={post.slug} lang={lang} />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
