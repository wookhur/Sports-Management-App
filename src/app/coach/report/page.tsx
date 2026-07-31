import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getLang } from "@/lib/getLang";
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
  searchParams: Promise<{ weeks?: string | string[] }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "COACH") redirect("/");

  const lang = await getLang();
  const weeks = parseWeeks((await searchParams).weeks);
  const report = await buildTeamReport(session.userId, weeks);

  // No NavBar: this page is a document, and the print stylesheet strips app
  // chrome anyway. The back link lives in the report's own control row.
  return <TeamReportView lang={lang} report={report} coachName={session.name} weeks={weeks} />;
}
