import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import NavBar from "@/components/NavBar";
import DeletePostButton from "@/components/DeletePostButton";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

// A short numbered line ("1. The Mbappé Factor") is treated as a section
// heading instead of body text. A line prefixed with "## " is also treated
// as a heading (for subheadings that aren't numbered).
const NUMBERED_HEADING_RE = /^\d+\.\s+\S.{0,80}$/;
const MARKDOWN_HEADING_RE = /^##\s+(\S.*)$/;

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  const isCoach = session.role === "COACH";
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
        <div className="flex items-center justify-between">
          <Link href="/blog" className="text-sm text-slate-400 hover:text-slate-600">
            ← 블로그
          </Link>
          {isCoach && (
            <div className="flex items-center gap-3">
              <Link
                href={`/blog/${post.slug}/edit`}
                className="text-xs font-medium text-slate-400 hover:text-brand"
              >
                수정
              </Link>
              <DeletePostButton slug={post.slug} redirectTo="/blog" />
            </div>
          )}
        </div>

        <header className="mt-4">
          {!post.coverImage && <div className="text-5xl">{post.emoji}</div>}
          <div className="mt-3 flex items-center gap-2">
            {post.tag && <span className="badge bg-brand/10 text-brand">{post.tag}</span>}
            <span className="text-sm text-slate-400">{formatDate(post.createdAt)}</span>
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

        <article className="mt-6 space-y-4 leading-relaxed text-slate-700">
          {paragraphs.map((p, i) => {
            const mdHeading = p.match(MARKDOWN_HEADING_RE);
            if (mdHeading || NUMBERED_HEADING_RE.test(p)) {
              return (
                <h2 key={i} className="!mt-8 text-xl font-bold text-slate-900">
                  {mdHeading ? mdHeading[1] : p}
                </h2>
              );
            }
            return <p key={i}>{p}</p>;
          })}
        </article>
      </main>
    </>
  );
}
