import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import NavBar from "@/components/NavBar";
import BlogEditor from "@/components/BlogEditor";

export default async function EditBlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "COACH") redirect("/blog");

  const { slug } = await params;
  const post = await prisma.blogPost.findUnique({ where: { slug } });
  if (!post) notFound();

  return (
    <>
      <NavBar />
      <main className="mx-auto max-w-2xl px-4 py-8">
        <Link href={`/blog/${slug}`} className="text-sm text-slate-400 hover:text-slate-600">
          ← 글로 돌아가기
        </Link>
        <h1 className="mt-3 text-2xl font-bold">글 수정</h1>
        <BlogEditor
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
