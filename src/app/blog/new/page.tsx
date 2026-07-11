import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import NavBar from "@/components/NavBar";
import BlogEditor from "@/components/BlogEditor";

export default async function NewBlogPostPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  // Authoring is coach-only for now.
  if (session.role !== "COACH") redirect("/blog");

  return (
    <>
      <NavBar />
      <main className="mx-auto max-w-2xl px-4 py-8">
        <Link href="/blog" className="text-sm text-slate-400 hover:text-slate-600">
          ← 블로그
        </Link>
        <h1 className="mt-3 text-2xl font-bold">새 글 작성</h1>
        <BlogEditor />
      </main>
    </>
  );
}
