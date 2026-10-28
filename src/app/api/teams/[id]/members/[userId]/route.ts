import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { ok, fail } from "@/lib/api";
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
  if (!session) return fail("Sign in to continue", 401);

  const { id, userId } = await params;
  const team = await prisma.team.findUnique({
    where: { id },
    select: { id: true, coachId: true, timeZone: true },
  });
  if (!team) return fail("Team not found", 404);

  const isOwner = team.coachId === session.userId;
  const isSelf = userId === session.userId;
  if (!isOwner && !isSelf) return fail("Team not found", 404);

  const membership = await prisma.teamMember.findUnique({
    where: { teamId_userId: { teamId: id, userId } },
  });
  if (!membership) return fail("They are not on this team", 404);

  // A roster-only player exists only for this team, so taking them off it
  // removes them entirely rather than leaving an account nobody can use.
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

  if (user?.managed && isOwner) await prisma.user.delete({ where: { id: userId } });
  else await prisma.teamMember.delete({ where: { id: membership.id } });
  return ok({ teamId: id, userId });
}
