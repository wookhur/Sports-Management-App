import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import NavBar from "@/components/NavBar";
import BoardComposer from "@/components/BoardComposer";
import { t } from "@/lib/i18n";
import { getLang } from "@/lib/getLang";

export const dynamic = "force-dynamic";

export default async function NewBoardPostPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const lang = await getLang();
  const s = t(lang).board;

  return (
    <>
      <NavBar />
      <main className="mx-auto max-w-2xl px-4 py-8">
        <Link href="/board" className="text-sm text-slate-400 hover:text-slate-600">
          {s.backToBoard}
        </Link>
        <h1 className="mb-6 mt-3 text-2xl font-bold">{s.writeTitle}</h1>
        <BoardComposer lang={lang} />
      </main>
    </>
  );
}
