import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { ok, fail } from "@/lib/api";
import { memberIds, teamRole } from "@/lib/teamAccess";
import { matchSchema } from "@/lib/matchSchema";

async function ownedMatch(id: string, matchId: string) {
  const session = await getSession();
  if (!session) return { error: fail("Sign in to continue", 401) };
  if ((await teamRole(id, session.userId)) !== "owner") return { error: fail("Team not found", 404) };
  const match = await prisma.match.findFirst({ where: { id: matchId, teamId: id }, select: { id: true } });
  if (!match) return { error: fail("Match not found", 404) };
  return {};
}

/**
 * Replace a match. Who played is rewritten as a whole, except that players
 * who have since left the team keep their appearance: editing the score in
 * spring shouldn't erase an autumn appearance from someone's record.
 */
export async function PUT(req: Request, { params }: { params: Promise<{ id: string; matchId: string }> }) {
  const { id, matchId } = await params;
  const { error } = await ownedMatch(id, matchId);
  if (error) return error;

  const parsed = matchSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid request");
  const { players, competition, note, ...rest } = parsed.data;
  const onTeam = await memberIds(id);
  const keep = [...new Set(players)].filter((p) => onTeam.has(p));

  await prisma.$transaction([
    prisma.matchPlayer.deleteMany({ where: { matchId, userId: { in: [...onTeam] } } }),
    prisma.match.update({
      where: { id: matchId },
      data: { ...rest, competition: competition || null, note: note || null },
    }),
    prisma.matchPlayer.createMany({ data: keep.map((userId) => ({ matchId, userId })), skipDuplicates: true }),
  ]);
  return ok({ id: matchId });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string; matchId: string }> }) {
  const { id, matchId } = await params;
  const { error } = await ownedMatch(id, matchId);
  if (error) return error;
  await prisma.match.delete({ where: { id: matchId } });
  return ok({ id: matchId });
}
