import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import NavBar from "@/components/NavBar";
import RecordList from "@/components/RecordList";
import ConnectionManager, { type Connection } from "@/components/ConnectionManager";
import type { RecordView } from "@/lib/types";

export default async function RecordsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  // Coaches manage their roster from the coach dashboard instead.
  if (session.role === "COACH") redirect("/coach");

  const records = await prisma.record.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: "desc" },
    include: {
      comments: {
        orderBy: { createdAt: "asc" },
        include: { author: { select: { name: true, role: true } } },
      },
    },
  });

  const coachLinks = await prisma.coachAthlete.findMany({
    where: { athleteId: session.userId },
    include: { coach: { select: { id: true, name: true, email: true } } },
  });
  const connections: Connection[] = coachLinks.map((l) => l.coach);

  const view: RecordView[] = records.map((r) => ({
    id: r.id,
    sport: r.sport,
    metricName: r.metricName,
    distanceM: r.distanceM,
    durationMs: r.durationMs,
    value: r.value,
    unit: r.unit,
    notes: r.notes,
    shared: r.shared,
    createdAt: r.createdAt.toISOString(),
    comments: r.comments.map((c) => ({
      id: c.id,
      body: c.body,
      authorName: c.author.name,
      authorRole: c.author.role,
      createdAt: c.createdAt.toISOString(),
    })),
  }));

  return (
    <>
      <NavBar />
      <main className="mx-auto max-w-5xl px-4 py-8">
        <h1 className="text-2xl font-bold">내 기록</h1>
        <p className="mt-1 text-slate-500">기록을 관리하고 코치에게 공유하세요.</p>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
          <div>
            <RecordList records={view} mode="owner" />
          </div>
          <aside className="lg:order-last">
            <ConnectionManager role="ATHLETE" connections={connections} />
          </aside>
        </div>
      </main>
    </>
  );
}
