import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import NavBar from "@/components/NavBar";
import RecordList from "@/components/RecordList";
import ConnectionManager, { type Connection } from "@/components/ConnectionManager";
import AssignmentPanel, { type AssignmentRow } from "@/components/AssignmentPanel";
import TeamPanel, { type TeamRow } from "@/components/TeamPanel";
import type { RecordView } from "@/lib/types";
import type { Lang } from "@/lib/i18n";
import { getLang } from "@/lib/getLang";

export const dynamic = "force-dynamic";

const L: Record<
  Lang,
  {
    title: string;
    sub: string;
    statAthletes: string;
    statSharedRecords: string;
    statFeedback: string;
    athleteCount: (n: number) => string;
    recordCount: (n: number) => string;
    sharedRecordsHeading: string;
  }
> = {
  ko: {
    title: "코치 대시보드",
    sub: "선수들이 공유한 기록을 확인하고 피드백을 남기세요.",
    statAthletes: "담당 선수",
    statSharedRecords: "공유된 기록",
    statFeedback: "남긴 피드백",
    athleteCount: (n) => `${n}명`,
    recordCount: (n) => `${n}건`,
    sharedRecordsHeading: "공유된 기록",
  },
  en: {
    title: "Coach dashboard",
    sub: "Review the records your athletes share and leave feedback.",
    statAthletes: "My athletes",
    statSharedRecords: "Shared records",
    statFeedback: "Feedback given",
    athleteCount: (n) => `${n}`,
    recordCount: (n) => `${n}`,
    sharedRecordsHeading: "Shared records",
  },
  es: {
    title: "Panel del entrenador",
    sub: "Revisa las marcas que comparten tus atletas y deja comentarios.",
    statAthletes: "Mis atletas",
    statSharedRecords: "Marcas compartidas",
    statFeedback: "Comentarios dejados",
    athleteCount: (n) => `${n}`,
    recordCount: (n) => `${n}`,
    sharedRecordsHeading: "Marcas compartidas",
  },
};

export default async function CoachPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "COACH") redirect("/");

  const lang = await getLang();
  const s = L[lang];

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

  const assignments = await prisma.assignment.findMany({
    where: { coachId: session.userId },
    orderBy: [{ completedAt: "asc" }, { createdAt: "desc" }],
    take: 20,
    include: { athlete: { select: { name: true } } },
  });
  const assignmentRows: AssignmentRow[] = assignments.map((a) => ({
    id: a.id,
    athleteName: a.athlete.name,
    title: a.title,
    linkHref: a.linkHref,
    dueDate: a.dueDate?.toISOString() ?? null,
    completedAt: a.completedAt?.toISOString() ?? null,
  }));

  const teams = await prisma.team.findMany({
    where: { coachId: session.userId },
    orderBy: { createdAt: "asc" },
    include: { _count: { select: { members: true } } },
  });
  const teamRows: TeamRow[] = teams.map((t) => ({
    id: t.id,
    name: t.name,
    code: t.code,
    memberCount: t._count.members,
  }));

  const view: RecordView[] = records.map((r) => ({
    id: r.id,
    sport: r.sport,
    metricKey: r.metricKey,
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
        <h1 className="text-2xl font-bold">{s.title}</h1>
        <p className="mt-1 text-slate-500">{s.sub}</p>

        {/* Summary */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <StatCard label={s.statAthletes} value={s.athleteCount(athletes.length)} />
          <StatCard label={s.statSharedRecords} value={s.recordCount(records.length)} />
          <StatCard
            label={s.statFeedback}
            value={s.recordCount(records.reduce((n, r) => n + r.comments.filter((c) => c.author.role === "COACH").length, 0))}
          />
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <AssignmentPanel
            athletes={athletes.map((a) => ({ id: a.id, name: a.name }))}
            assignments={assignmentRows}
            lang={lang}
          />
          <TeamPanel teams={teamRows} lang={lang} />
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
          <div>
            <h2 className="mb-3 text-lg font-bold">{s.sharedRecordsHeading}</h2>
            <RecordList records={view} mode="coach" lang={lang} />
          </div>
          <aside className="lg:order-last">
            <ConnectionManager role="COACH" connections={connections} lang={lang} />
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
