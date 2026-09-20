import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { ok, fail } from "@/lib/api";

/**
 * Remove someone from a team.
 *
 * Two callers are allowed, and they are the same request: the coach who owns
 * the team taking a player off it, and a member leaving one they joined. Anyone
 * else gets the same 404 as a team that doesn't exist — which team ids exist is
 * not something a stranger should be able to probe.
 */
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string; userId: string }> },
) {
  const session = await getSession();
  if (!session) return fail("Sign in to continue", 401);

  const { id, userId } = await params;
  const team = await prisma.team.findUnique({
    where: { id },
    select: { id: true, coachId: true },
  });
  if (!team) return fail("Team not found", 404);

  const isOwner = team.coachId === session.userId;
  const isSelf = userId === session.userId;
  if (!isOwner && !isSelf) return fail("Team not found", 404);

  const membership = await prisma.teamMember.findUnique({
    where: { teamId_userId: { teamId: id, userId } },
  });
  if (!membership) return fail("They are not on this team", 404);

  await prisma.teamMember.delete({ where: { id: membership.id } });
  return ok({ teamId: id, userId });
}
