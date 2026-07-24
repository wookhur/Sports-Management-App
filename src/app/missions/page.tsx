import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import NavBar from "@/components/NavBar";
import MissionHub, { type MissionItem, type RepairItem } from "@/components/MissionHub";
import { computeMissions, levelInfo, MISSIONS, REPAIRS } from "@/lib/missions";
import { t } from "@/lib/i18n";
import { getLang } from "@/lib/getLang";

export const dynamic = "force-dynamic";

// In-app page an auto mission links to when its requirement isn't met yet.
const GO_HREF: Record<string, string | null> = {
  streak5: null,
  logRecord: "/records",
  move: "/journal",
  boardPost: "/board/new",
  boardComment: "/board",
};

export default async function MissionsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const lang = await getLang();
  const s = t(lang).missions;

  const [user, statuses] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.userId },
      select: { beans: true, charXp: true, houseRepairs: true },
    }),
    computeMissions(session.userId),
  ]);

  const beans = user?.beans ?? 0;
  const xp = user?.charXp ?? 0;
  const repaired = new Set(user?.houseRepairs ?? []);
  const lvl = levelInfo(xp);

  const missions: MissionItem[] = statuses.map((st) => {
    const def = MISSIONS.find((m) => m.key === st.key)!;
    return {
      ...st,
      title: def.title[lang],
      subtitle: def.subtitle[lang],
      goHref: GO_HREF[st.key] ?? null,
    };
  });

  const repairs: RepairItem[] = REPAIRS.map((r) => ({
    key: r.key,
    emoji: r.emoji,
    cost: r.cost,
    title: r.title[lang],
    owned: repaired.has(r.key),
  }));

  return (
    <>
      <NavBar />
      <main className="mx-auto max-w-2xl px-4 py-8">
        <header className="mb-6">
          <h1 className="text-2xl font-bold sm:text-3xl">🎯 {s.title}</h1>
          <p className="mt-1 text-slate-500">{s.subtitle}</p>
        </header>

        <MissionHub
          lang={lang}
          beans={beans}
          level={lvl.level}
          intoLevel={lvl.intoLevel}
          step={lvl.step}
          needed={lvl.needed}
          missions={missions}
          repairs={repairs}
        />
      </main>
    </>
  );
}
