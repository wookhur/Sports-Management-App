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
  }
> = {
  ko: {
    title: "블로그",
    subtitle: "훈련 팁과 소식을 만나보세요.",
    write: "+ 글쓰기",
    empty: "아직 글이 없어요.",
    edit: "수정",
  },
  en: {
    title: "Blog",
    subtitle: "Training tips and news.",
    write: "+ New post",
    empty: "No posts yet.",
    edit: "Edit",
  },
  es: {
    title: "Blog",
    subtitle: "Consejos de entrenamiento y novedades.",
    write: "+ Escribir",
    empty: "Todavía no hay publicaciones.",
    edit: "Editar",
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
    include: { author: { select: { name: true } } },
  });

  return (
    <>
      <NavBar />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{s.title}</h1>
            <p className="mt-1 text-slate-500">{s.subtitle}</p>
          </div>
          {isCoach && (
            <Link href="/blog/new" className="btn-primary">
              {s.write}
            </Link>
          )}
        </div>

        <div className="mt-6 space-y-4">
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
                    <span className="text-xs text-slate-400">{formatDate(post.createdAt)}</span>
                  </div>
                  <h2 className="mt-1 text-lg font-bold group-hover:text-brand">{post.title}</h2>
                  <p className="mt-1 line-clamp-2 text-sm text-slate-500">{post.excerpt}</p>
                </Link>
                <div className="mt-2 flex items-center justify-between">
                  <p className="text-xs text-slate-400">{post.author?.name ?? "sideline365"}</p>
                  {isCoach && (
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
      </main>
    </>
  );
}
