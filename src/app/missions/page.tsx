import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import NavBar from "@/components/NavBar";
import MissionHub, { type MissionItem, type CareItem } from "@/components/MissionHub";
import { computeMissions, MISSIONS } from "@/lib/missions";
import { careActions, petState } from "@/lib/pet";
import { t } from "@/lib/i18n";
import { getLang } from "@/lib/getLang";

export const dynamic = "force-dynamic";

// In-app page an auto mission links to when its requirement isn't met yet.
const GO_HREF: Record<string, string | null> = {
  logRecord: "/records",
  journal0: "/journal",
  journal2: "/journal",
  twoSessions: "/journal",
  post0: "/board/new",
  comment1: "/board",
  streak5: null,
  streak10: null,
};

export default async function MissionsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const lang = await getLang();
  const s = t(lang).missions;

  const [user, statuses] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.userId },
      select: { beans: true, petGrowth: true },
    }),
    computeMissions(session.userId),
  ]);

  const beans = user?.beans ?? 0;
  const growth = user?.petGrowth ?? 0;
  const st = petState(growth);

  const missions: MissionItem[] = statuses.map((m) => {
    const def = MISSIONS.find((d) => d.key === m.key)!;
    return { ...m, title: def.title[lang], goHref: GO_HREF[m.key] ?? null };
  });

  const care: CareItem[] = careActions(growth).map((c) => ({
    key: c.key,
    emoji: c.emoji,
    cost: c.cost,
    title: c.label[lang],
  }));

  return (
    <>
      <NavBar />
      <main className="mx-auto max-w-2xl px-4 py-8">
        <header className="mb-6">
          <h1 className="text-2xl font-bold sm:text-3xl">{s.title}</h1>
          <p className="mt-1 text-slate-500">{s.subtitle}</p>
        </header>

        <MissionHub
          lang={lang}
          beans={beans}
          pet={{
            growth,
            stage: st.stage,
            label: st.label[lang],
            hatched: st.hatched,
            hatchPct: st.hatchPct,
            into: st.into,
            span: st.span,
            toNext: st.toNext,
          }}
          care={care}
          missions={missions}
        />
      </main>
    </>
  );
}
