import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { ok, fail } from "@/lib/api";
import { failT } from "@/lib/apiText";
import { readDoc } from "@/lib/bitacora";
import { dayKeyIn } from "@/lib/format";
import { schoolYearOf } from "@/lib/season";
import { teamTimeZone } from "@/lib/teamAccess";
import type { Prisma } from "@prisma/client";

/**
 * Remove someone from a team.
 *
 * Two callers are allowed, and they are the same request: the coach who owns
 * the team taking a player off it, and a member leaving one they joined. Anyone
 * else gets the same 404 as a team that doesn't exist — which team ids exist is
 * not something a stranger should be able to probe.
 *
 * The coach may send `{ reason }`: the player then goes on the year-end
 * report's list of students who left the team (R-FI "bajas").
 */
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string; userId: string }> },
) {
  const session = await getSession();
  if (!session) return failT("signIn", 401);

  const { id, userId } = await params;
  const team = await prisma.team.findUnique({
    where: { id },
    select: { id: true, coachId: true, timeZone: true },
  });
  if (!team) return failT("teamNotFound", 404);

  const isOwner = team.coachId === session.userId;
  const isSelf = userId === session.userId;
  if (!isOwner && !isSelf) return failT("teamNotFound", 404);

  const membership = await prisma.teamMember.findUnique({
    where: { teamId_userId: { teamId: id, userId } },
  });
  if (!membership) return failT("notOnTeam", 404);

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { managed: true, name: true } });

  const body = (await req.json().catch(() => null)) as { reason?: unknown } | null;
  const reason = typeof body?.reason === "string" ? body.reason.trim().slice(0, 300) : "";
  if (isOwner && !isSelf && reason && user) {
    const year = schoolYearOf(dayKeyIn(teamTimeZone(team)));
    const where = { teamId_year_kind: { teamId: id, year, kind: "report" } };
    const doc = readDoc("report", (await prisma.teamSeasonDoc.findUnique({ where }))?.data);
    doc.bajas = [...doc.bajas, { name: user.name.slice(0, 80), reason }].slice(-40);
    const data = doc as unknown as Prisma.InputJsonValue;
    await prisma.teamSeasonDoc.upsert({ where, update: { data }, create: { teamId: id, year, kind: "report", data } });
  }

  // Only the membership goes. A roster-only student who leaves keeps their
  // attendance, matches and evaluations, which belong to the school year's
  // log; the roster page lists them under "dados de baja" to bring back.
  await prisma.teamMember.delete({ where: { id: membership.id } });
  return ok({ teamId: id, userId });
}
