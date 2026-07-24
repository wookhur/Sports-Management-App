import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import NavBar from "@/components/NavBar";
import BlogEditor from "@/components/BlogEditor";
import { getLang } from "@/lib/getLang";
import type { Lang } from "@/lib/i18n";

const L: Record<Lang, { back: string; title: string }> = {
  ko: { back: "← 글로 돌아가기", title: "글 수정" },
  en: { back: "← Back to post", title: "Edit post" },
  es: { back: "← Volver a la publicación", title: "Editar publicación" },
};

export default async function EditBlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { slug } = await params;
  const post = await prisma.blogPost.findUnique({ where: { slug } });
  if (!post) notFound();
  // Only the author (or a coach) may edit.
  if (post.authorId !== session.userId && session.role !== "COACH") redirect(`/blog/${slug}`);
  const lang = await getLang();
  const s = L[lang];

  return (
    <>
      <NavBar />
      <main className="mx-auto max-w-2xl px-4 py-8">
        <Link href={`/blog/${slug}`} className="text-sm text-slate-400 hover:text-slate-600">
          {s.back}
        </Link>
        <h1 className="mt-3 text-2xl font-bold">{s.title}</h1>
        <BlogEditor
          lang={lang}
          initial={{
            slug: post.slug,
            title: post.title,
            excerpt: post.excerpt,
            emoji: post.emoji,
            tag: post.tag ?? "",
            coverImage: post.coverImage ?? "",
            body: post.body,
          }}
        />
      </main>
    </>
  );
}
