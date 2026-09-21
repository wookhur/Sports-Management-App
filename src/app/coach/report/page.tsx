import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getLang } from "@/lib/getLang";
import { prisma } from "@/lib/db";
import { buildTeamReport } from "@/lib/squad";
import TeamReportView from "@/components/TeamReportView";
import { REPORT_WEEK_OPTIONS, DEFAULT_REPORT_WEEKS, type ReportWeeks } from "@/lib/report";

export const dynamic = "force-dynamic";

/** Only the periods we offer — an arbitrary ?weeks= would be an unbounded query. */
function parseWeeks(raw: string | string[] | undefined): ReportWeeks {
  const n = Number(Array.isArray(raw) ? raw[0] : raw);
  return (REPORT_WEEK_OPTIONS as readonly number[]).includes(n) ? (n as ReportWeeks) : DEFAULT_REPORT_WEEKS;
}

export default async function CoachReportPage({
  searchParams,
}: {
  searchParams: Promise<{ weeks?: string | string[]; team?: string | string[] }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "COACH") redirect("/");

  const lang = await getLang();
  const sp = await searchParams;
  const weeks = parseWeeks(sp.weeks);
  const teamParam = Array.isArray(sp.team) ? sp.team[0] : sp.team;

  // The coach's teams, for the scope picker; and the one in scope, if any.
  const teams = await prisma.team.findMany({
    where: { coachId: session.userId },
    orderBy: { createdAt: "asc" },
    select: { id: true, name: true },
  });
  const team = teams.find((t) => t.id === teamParam) ?? null;
  const report = await buildTeamReport(session.userId, weeks, team?.id);

  // No NavBar: this page is a document, and the print stylesheet strips app
  // chrome anyway. The back link lives in the report's own control row.
  return (
    <TeamReportView
      lang={lang}
      report={report}
      coachName={session.name}
      weeks={weeks}
      teams={teams}
      team={team}
    />
  );
}
