import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import NavBar from "@/components/NavBar";
import BullseyeGame from "@/components/BullseyeGame";
import { t } from "@/lib/i18n";
import { getLang } from "@/lib/getLang";

export const dynamic = "force-dynamic";

export default async function BullseyePage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const lang = await getLang();
  const s = t(lang).games;

  const [top, mine] = await Promise.all([
    prisma.gameScore.findMany({
      where: { game: "bullseye" },
      orderBy: { best: "desc" },
      take: 20,
      include: { user: { select: { id: true, name: true } } },
    }),
    prisma.gameScore.findUnique({
      where: { userId_game: { userId: session.userId, game: "bullseye" } },
      select: { best: true, plays: true },
    }),
  ]);

  const myRank = mine ? (await prisma.gameScore.count({ where: { game: "bullseye", best: { gt: mine.best } } })) + 1 : null;

  return (
    <>
      <NavBar />
      <main className="mx-auto max-w-2xl px-4 py-8">
        <header className="mb-6">
          <h1 className="text-2xl font-bold sm:text-3xl">{s.title}</h1>
          <p className="mt-1 text-slate-500">{s.subtitle}</p>
        </header>

        <BullseyeGame lang={lang} />

        {/* How to play */}
        <section className="mt-5 rounded-2xl bg-slate-50 p-4">
          <p className="mb-2 text-sm font-bold text-slate-600">{s.howTitle}</p>
          <ul className="space-y-1 text-sm leading-relaxed text-slate-500">
            {s.how.map((line, i) => (
              <li key={i}>{line}</li>
            ))}
          </ul>
        </section>

        {/* My best */}
        <div className="mt-5 flex items-center justify-between rounded-2xl border border-brand/15 bg-brand/5 px-5 py-4">
          <span className="text-sm font-semibold text-slate-600">{s.myBest}</span>
          <span className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold tabular-nums text-brand">{mine?.best ?? 0}</span>
            {myRank && mine && <span className="text-xs text-slate-400">{s.yourRank(myRank)}</span>}
          </span>
        </div>

        {/* Leaderboard */}
        <section className="mt-6">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">{s.leaderboard}</h2>
          {top.length === 0 ? (
            <div className="card p-8 text-center text-sm text-slate-500">{s.noScores}</div>
          ) : (
            <div className="card divide-y divide-slate-100">
              {top.map((row, i) => {
                const isMe = row.user.id === session.userId;
                return (
                  <div
                    key={row.userId}
                    className={`flex items-center gap-3 px-4 py-3 ${isMe ? "bg-brand/5" : ""}`}
                  >
                    <span className="w-6 text-center text-sm font-bold tabular-nums text-slate-400">
                      {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : i + 1}
                    </span>
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand/10 text-xs font-bold text-brand">
                      {row.user.name.slice(0, 1)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {row.user.name}
                        {isMe && <span className="ml-1 text-xs text-brand">({s.you})</span>}
                      </p>
                      <p className="text-xs text-slate-400">{s.plays(row.plays)}</p>
                    </div>
                    <span className="text-lg font-extrabold tabular-nums">{row.best}</span>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </>
  );
}
