import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { ok } from "@/lib/api";
import { failT, failIssue } from "@/lib/apiText";
import { memberIds, teamRole } from "@/lib/teamAccess";
import { MATCH_PLAYER_STATUSES } from "@/lib/bitacora";

const schema = z.object({
  userId: z.string().min(1),
  status: z.enum(MATCH_PLAYER_STATUSES).nullable(),
});

/** One cell of the match sheet: a player's status for one match, or none. */
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string; matchId: string }> }) {
  const session = await getSession();
  if (!session) return failT("signIn", 401);
  const { id, matchId } = await params;
  if ((await teamRole(id, session.userId)) !== "owner") return failT("teamNotFound", 404);
  const match = await prisma.match.findFirst({ where: { id: matchId, teamId: id }, select: { id: true } });
  if (!match) return failT("matchNotFound", 404);

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return failIssue(parsed.error.issues);
  const { userId, status } = parsed.data;
  if (!(await memberIds(id)).has(userId)) return failT("notOnTeam", 404);

  if (status === null) await prisma.matchPlayer.deleteMany({ where: { matchId, userId } });
  else
    await prisma.matchPlayer.upsert({
      where: { matchId_userId: { matchId, userId } },
      update: { status },
      create: { matchId, userId, status },
    });
  return ok({ userId, status });
}
