import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import NavBar from "@/components/NavBar";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function BlogListPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  const isCoach = session.role === "COACH";

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
            <h1 className="text-2xl font-bold">블로그</h1>
            <p className="mt-1 text-slate-500">훈련 팁과 소식을 만나보세요.</p>
          </div>
          {isCoach && (
            <Link href="/blog/new" className="btn-primary">
              + 글쓰기
            </Link>
          )}
        </div>

        <div className="mt-6 space-y-4">
          {posts.length === 0 && (
            <div className="card p-10 text-center text-slate-500">아직 글이 없어요.</div>
          )}
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="card group flex gap-4 p-5 transition hover:border-slate-300 hover:shadow-md"
            >
              {post.coverImage ? (
                <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                  <Image src={post.coverImage} alt="" fill className="object-cover" />
                </div>
              ) : (
                <span className="text-4xl">{post.emoji}</span>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  {post.tag && <span className="badge bg-brand/10 text-brand">{post.tag}</span>}
                  <span className="text-xs text-slate-400">{formatDate(post.createdAt)}</span>
                </div>
                <h2 className="mt-1 text-lg font-bold group-hover:text-brand">{post.title}</h2>
                <p className="mt-1 line-clamp-2 text-sm text-slate-500">{post.excerpt}</p>
                <p className="mt-2 text-xs text-slate-400">
                  {post.author?.name ?? "sideline365"}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </>
  );
}
