import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getLang } from "@/lib/getLang";
import { prisma } from "@/lib/db";
import NavBar from "@/components/NavBar";
import ConnectionManager, { type Connection } from "@/components/ConnectionManager";
import ConnectionRequests, { type LinkRow } from "@/components/ConnectionRequests";
import { t } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function ConnectionsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const lang = await getLang();
  const s = t(lang).connect;
  const isCoach = session.role === "COACH";

  // Deliberately unfiltered by status: this is the one page that shows pending
  // requests, because it is where they get answered.
  const links = await prisma.coachAthlete.findMany({
    where: isCoach ? { coachId: session.userId } : { athleteId: session.userId },
    include: {
      coach: { select: { id: true, name: true, email: true } },
      athlete: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const rows = links.map((l) => {
    const other = isCoach ? l.athlete : l.coach;
    return {
      id: l.id,
      otherId: other.id,
      otherName: other.name,
      otherEmail: other.email,
      mine: l.requestedById === session.userId,
      status: l.status,
    };
  });

  const pending = rows.filter((r) => r.status === "PENDING");
  const active = rows.filter((r) => r.status === "ACCEPTED");

  return (
    <>
      <NavBar />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="text-2xl font-bold">{s.title}</h1>
        <p className="mt-1 text-slate-500">{s.subtitle}</p>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
          <ConnectionRequests
            lang={lang}
            role={session.role}
            incoming={pending.filter((r) => !r.mine)}
            outgoing={pending.filter((r) => r.mine)}
            active={active as LinkRow[]}
          />
          <aside>
            <ConnectionManager
              role={session.role}
              connections={active.map<Connection>((r) => ({ id: r.otherId, name: r.otherName, email: r.otherEmail }))}
              lang={lang}
              hideList
            />
          </aside>
        </div>
      </main>
    </>
  );
}
