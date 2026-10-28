import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { failT } from "@/lib/apiText";
import { dayKeyIn } from "@/lib/format";
import { teamTimeZone } from "@/lib/teamAccess";
import { schoolYearOf, type Term } from "@/lib/season";
import { buildBitacora } from "@/lib/bitacoraExport";

export const runtime = "nodejs";

/**
 * The official bitácora: the school's workbook filled in with the team's
 * season. ?year= picks the school year; ?term=S1|S2 the evaluations B4
 * shows; ?event= the request S-EVE holds.
 */
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return failT("signIn", 401);
  const { id } = await params;
  const team = await prisma.team.findUnique({
    where: { id },
    select: { id: true, name: true, coachId: true, category: true, branch: true, timeZone: true, coach: { select: { name: true } } },
  });
  if (!team || team.coachId !== session.userId) return failT("teamNotFound", 404);

  const q = new URL(req.url).searchParams;
  const today = dayKeyIn(teamTimeZone(team));
  let year = schoolYearOf(today);
  const asked = Number(q.get("year"));
  if (Number.isInteger(asked) && asked > 2000 && asked <= year) year = asked;

  const eventId = q.get("event") ?? undefined;
  if (eventId) {
    const ev = await prisma.teamEvent.findFirst({ where: { id: eventId, teamId: id }, select: { year: true } });
    if (!ev) return failT("invalid", 404);
    if (!q.get("year")) year = ev.year;
  }
  const t = q.get("term");
  const term = t === "S1" || t === "S2" ? (`${year}-${t}` as Term) : undefined;

  const file = await buildBitacora(
    { id, name: team.name, category: team.category, branch: team.branch, coachName: team.coach.name },
    year,
    { term, eventId, today },
  );
  const base = `Bitacora ${team.name} ${year}-${String(year + 1).slice(2)}${eventId ? " S-EVE" : ""}`;
  const ascii = base.normalize("NFD").replace(/[^\x20-\x7e]/g, "").replace(/["\\]/g, "");
  return new Response(new Uint8Array(file), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${ascii}.xlsx"; filename*=UTF-8''${encodeURIComponent(base)}.xlsx`,
      "Cache-Control": "no-store",
    },
  });
}
