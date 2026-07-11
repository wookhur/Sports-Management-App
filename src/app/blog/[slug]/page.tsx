import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import NavBar from "@/components/NavBar";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  if (!(await getSession())) redirect("/login");
  const { slug } = await params;

  const post = await prisma.blogPost.findUnique({
    where: { slug },
    include: { author: { select: { name: true } } },
  });
  if (!post || !post.published) notFound();

  const paragraphs = post.body.split(/\n\n+/);

  return (
    <>
      <NavBar />
      <main className="mx-auto max-w-2xl px-4 py-8">
        <Link href="/blog" className="text-sm text-slate-400 hover:text-slate-600">
          ← 블로그
        </Link>

        <header className="mt-4">
          <div className="text-5xl">{post.emoji}</div>
          <div className="mt-3 flex items-center gap-2">
            {post.tag && <span className="badge bg-brand/10 text-brand">{post.tag}</span>}
            <span className="text-sm text-slate-400">{formatDate(post.createdAt)}</span>
          </div>
          <h1 className="mt-2 text-3xl font-bold leading-tight">{post.title}</h1>
          <p className="mt-2 text-slate-500">{post.author?.name ?? "sideline365"}</p>
        </header>

        <article className="mt-6 space-y-4 leading-relaxed text-slate-700">
          {paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </article>
      </main>
    </>
  );
}
