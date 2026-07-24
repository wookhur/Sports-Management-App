import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import NavBar from "@/components/NavBar";
import { formatRelative } from "@/lib/format";
import { isBoardCategory } from "@/lib/board";
import { t } from "@/lib/i18n";
import { getLang } from "@/lib/getLang";

export const dynamic = "force-dynamic";

const CAT_BADGE: Record<string, string> = { tips: "💡", gameplay: "🎬" };

export default async function BoardPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const lang = await getLang();
  const s = t(lang).board;
  const { category } = await searchParams;
  const active = category && isBoardCategory(category) ? category : "all";

  const posts = await prisma.boardPost.findMany({
    where: active === "all" ? {} : { category: active },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      author: { select: { name: true } },
      _count: { select: { likes: true, comments: true } },
    },
  });

  const tabs: { key: string; label: string }[] = [
    { key: "all", label: s.catAll },
    { key: "general", label: s.catGeneral },
    { key: "tips", label: s.catTips },
    { key: "gameplay", label: s.catGameplay },
  ];

  return (
    <>
      <NavBar />
      <main className="mx-auto max-w-2xl px-4 py-8">
        <header className="mb-4 flex items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold sm:text-3xl">💬 {s.title}</h1>
            <p className="mt-1 text-slate-500">{s.subtitle}</p>
          </div>
          <Link
            href="/board/new"
            className="shrink-0 rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand/90"
          >
            ✏️ {s.newPost}
          </Link>
        </header>

        {/* Category tabs */}
        <div className="mb-5 flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <Link
              key={tab.key}
              href={tab.key === "all" ? "/board" : `/board?category=${tab.key}`}
              className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
                active === tab.key
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </div>

        {posts.length === 0 ? (
          <div className="card p-10 text-center text-slate-500">
            {active === "all" ? s.empty : s.catEmpty}
          </div>
        ) : (
          <div className="space-y-3">
            {posts.map((p) => {
              const preview = p.body.length > 140 ? `${p.body.slice(0, 140)}…` : p.body;
              return (
                <Link key={p.id} href={`/board/${p.id}`} className="card block p-4 transition hover:shadow-md">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand/10 text-xs font-bold text-brand">
                      {p.author.name.slice(0, 1)}
                    </span>
                    <span className="text-sm font-semibold">{p.author.name}</span>
                    <span className="text-xs text-slate-400">· {formatRelative(p.createdAt, lang)}</span>
                    {CAT_BADGE[p.category] && (
                      <span className="ml-auto rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">
                        {p.category === "tips" ? s.catTips : s.catGameplay}
                      </span>
                    )}
                  </div>
                  {p.title && <p className="mb-1 font-bold">{p.title}</p>}
                  <p className="whitespace-pre-wrap text-sm text-slate-600">{preview}</p>
                  {p.videoUrl && (
                    <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-brand">🎬 {s.watchVideo}</p>
                  )}
                  {p.images.length > 0 && (
                    <div className="mt-3 flex gap-2 overflow-hidden">
                      {p.images.slice(0, 3).map((src, i) => (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img key={i} src={src} alt="" className="h-24 w-24 shrink-0 rounded-lg object-cover" />
                      ))}
                    </div>
                  )}
                  <div className="mt-3 flex items-center gap-4 text-xs text-slate-400">
                    <span>❤️ {p._count.likes}</span>
                    <span>💬 {p._count.comments}</span>
                    <span>👁 {p.views}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </>
  );
}
