import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import NavBar from "@/components/NavBar";
import RecordList from "@/components/RecordList";
import ConnectionManager, { type Connection } from "@/components/ConnectionManager";
import type { RecordView } from "@/lib/types";

export default async function CoachPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "COACH") redirect("/");

  const links = await prisma.coachAthlete.findMany({
    where: { coachId: session.userId },
    include: { athlete: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: "asc" },
  });
  const athletes = links.map((l) => l.athlete);
  const connections: Connection[] = athletes;
  const athleteIds = athletes.map((a) => a.id);

  const records = athleteIds.length
    ? await prisma.record.findMany({
        where: { userId: { in: athleteIds }, shared: true },
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { name: true } },
          comments: {
            orderBy: { createdAt: "asc" },
            include: { author: { select: { name: true, role: true } } },
          },
        },
      })
    : [];

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
    ownerName: r.user.name,
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
        <h1 className="text-2xl font-bold">코치 대시보드</h1>
        <p className="mt-1 text-slate-500">선수들이 공유한 기록을 확인하고 피드백을 남기세요.</p>

        {/* Summary */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <StatCard label="담당 선수" value={`${athletes.length}명`} />
          <StatCard label="공유된 기록" value={`${records.length}건`} />
          <StatCard
            label="남긴 피드백"
            value={`${records.reduce((n, r) => n + r.comments.filter((c) => c.author.role === "COACH").length, 0)}건`}
          />
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
          <div>
            <h2 className="mb-3 text-lg font-bold">공유된 기록</h2>
            <RecordList records={view} mode="coach" />
          </div>
          <aside className="lg:order-last">
            <ConnectionManager role="COACH" connections={connections} />
          </aside>
        </div>
      </main>
    </>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="card p-4">
      <p className="text-xs text-slate-400">{label}</p>
      <p className="mt-1 text-xl font-bold">{value}</p>
    </div>
  );
}
