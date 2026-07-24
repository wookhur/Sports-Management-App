import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import NavBar from "@/components/NavBar";
import DeletePostButton from "@/components/DeletePostButton";
import BlogEngagement, { type BlogCommentView } from "@/components/BlogEngagement";
import { formatDate } from "@/lib/format";
import { toEditableHtml } from "@/lib/blogBody";
import { sanitizeBlogHtml } from "@/lib/sanitizeBlogHtml";
import { getLang } from "@/lib/getLang";
import type { Lang } from "@/lib/i18n";

export const dynamic = "force-dynamic";

const L: Record<Lang, { back: string; edit: string }> = {
  ko: { back: "← 블로그", edit: "수정" },
  en: { back: "← Blog", edit: "Edit" },
  es: { back: "← Blog", edit: "Editar" },
};

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  const isCoach = session.role === "COACH";
  const lang = await getLang();
  const s = L[lang];
  const { slug } = await params;

  const post = await prisma.blogPost.findUnique({
    where: { slug },
    include: { author: { select: { id: true, name: true } } },
  });
  if (!post || !post.published) notFound();
  const canManage = post.author?.id === session.userId || isCoach;

  const bodyHtml = sanitizeBlogHtml(toEditableHtml(post.body));

  const [likeCount, myLike, blogComments] = await Promise.all([
    prisma.blogLike.count({ where: { postId: post.id } }),
    prisma.blogLike.findUnique({
      where: { postId_userId: { postId: post.id, userId: session.userId } },
    }),
    prisma.blogComment.findMany({
      where: { postId: post.id },
      orderBy: { createdAt: "asc" },
      include: { author: { select: { id: true, name: true, role: true } } },
    }),
  ]);
  const commentView: BlogCommentView[] = blogComments.map((c) => ({
    id: c.id,
    body: c.body,
    authorName: c.author.name,
    authorRole: c.author.role,
    mine: c.author.id === session.userId,
    createdAt: c.createdAt.toISOString(),
  }));

  return (
    <>
      <NavBar />
      <main className="mx-auto max-w-2xl px-4 py-8">
        <div className="flex items-center justify-between">
          <Link href="/blog" className="text-sm text-slate-400 hover:text-slate-600">
            {s.back}
          </Link>
          {canManage && (
            <div className="flex items-center gap-3">
              <Link
                href={`/blog/${post.slug}/edit`}
                className="text-xs font-medium text-slate-400 hover:text-brand"
              >
                {s.edit}
              </Link>
              <DeletePostButton slug={post.slug} redirectTo="/blog" lang={lang} />
            </div>
          )}
        </div>

        <header className="mt-4">
          {!post.coverImage && <div className="text-5xl">{post.emoji}</div>}
          <div className="mt-3 flex items-center gap-2">
            {post.tag && <span className="badge bg-brand/10 text-brand">{post.tag}</span>}
            <span className="text-sm text-slate-400">{formatDate(post.createdAt, lang)}</span>
          </div>
          <h1 className="mt-2 text-3xl font-bold leading-tight">{post.title}</h1>
          <p className="mt-2 text-slate-500">{post.author?.name ?? "sideline365"}</p>
        </header>

        {post.coverImage && (
          <div className="relative mt-5 aspect-video w-full overflow-hidden rounded-2xl bg-slate-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={post.coverImage} alt={post.title} className="h-full w-full object-cover" />
          </div>
        )}

        <article className="blog-body mt-6" dangerouslySetInnerHTML={{ __html: bodyHtml }} />

        <BlogEngagement
          slug={post.slug}
          initialLiked={Boolean(myLike)}
          initialLikeCount={likeCount}
          comments={commentView}
          canModerate={canManage}
          lang={lang}
        />
      </main>
    </>
  );
}
