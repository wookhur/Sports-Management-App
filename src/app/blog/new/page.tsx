import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import NavBar from "@/components/NavBar";
import BlogEditor from "@/components/BlogEditor";
import { getLang } from "@/lib/getLang";
import type { Lang } from "@/lib/i18n";

const L: Record<Lang, { back: string; title: string }> = {
  ko: { back: "← 블로그", title: "새 글 작성" },
  en: { back: "← Blog", title: "New post" },
  es: { back: "← Blog", title: "Nueva publicación" },
};

export default async function NewBlogPostPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  // Authoring is coach-only for now.
  if (session.role !== "COACH") redirect("/blog");
  const lang = await getLang();
  const s = L[lang];

  return (
    <>
      <NavBar />
      <main className="mx-auto max-w-2xl px-4 py-8">
        <Link href="/blog" className="text-sm text-slate-400 hover:text-slate-600">
          {s.back}
        </Link>
        <h1 className="mt-3 text-2xl font-bold">{s.title}</h1>
        <BlogEditor lang={lang} />
      </main>
    </>
  );
}
