import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import NavBar from "@/components/NavBar";
import BoardInteractions, { type BoardCommentView } from "@/components/BoardInteractions";
import { formatRelative } from "@/lib/format";
import { embedUrl } from "@/lib/board";
import { t } from "@/lib/i18n";
import { getLang } from "@/lib/getLang";

export const dynamic = "force-dynamic";

export default async function BoardPostPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) redirect("/login");

  const lang = await getLang();
  const s = t(lang).board;
  const { id } = await params;

  const post = await prisma.boardPost.findUnique({
    where: { id },
    include: {
      author: { select: { id: true, name: true } },
      comments: {
        orderBy: { createdAt: "asc" },
        include: { author: { select: { name: true } } },
      },
      likes: { select: { userId: true } },
    },
  });
  if (!post) notFound();

  // Bump view count (fire-and-forget; not part of the render data).
  await prisma.boardPost.update({ where: { id }, data: { views: { increment: 1 } } });

  const initialComments: BoardCommentView[] = post.comments.map((c) => ({
    id: c.id,
    body: c.body,
    authorName: c.author.name,
    createdAt: c.createdAt.toISOString(),
  }));
  const liked = post.likes.some((l) => l.userId === session.userId);

  return (
    <>
      <NavBar />
      <main className="mx-auto max-w-2xl px-4 py-8">
        <Link href="/board" className="text-sm text-slate-500 hover:text-slate-600">
          {s.backToBoard}
        </Link>

        <article className="mt-3">
          <div className="mb-3 flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand/10 text-sm font-bold text-brand">
              {post.author.name.slice(0, 1)}
            </span>
            <div>
              <p className="text-sm font-semibold">{post.author.name}</p>
              <p className="text-xs text-slate-500">
                {formatRelative(post.createdAt, lang)} · {post.views + 1} {s.views}
              </p>
            </div>
          </div>

          {post.title && <h1 className="mb-2 text-xl font-bold">{post.title}</h1>}
          <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-slate-700">{post.body}</p>

          {post.videoUrl &&
            (embedUrl(post.videoUrl) ? (
              <div className="mt-4 aspect-video w-full overflow-hidden rounded-xl bg-black">
                <iframe
                  src={embedUrl(post.videoUrl)!}
                  title="gameplay"
                  className="h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : (
              <a
                href={post.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-brand transition hover:bg-slate-50"
              >
                🎬 {s.watchVideo} ↗
              </a>
            ))}

          {post.images.length > 0 && (
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {post.images.map((src, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={i} src={src} alt="" className="w-full rounded-xl object-cover" />
              ))}
            </div>
          )}
        </article>

        <div className="mt-6">
          <BoardInteractions
            lang={lang}
            postId={post.id}
            initialLiked={liked}
            initialLikes={post.likes.length}
            initialComments={initialComments}
            canDelete={post.author.id === session.userId || session.role === "COACH"}
          />
        </div>
      </main>
    </>
  );
}
