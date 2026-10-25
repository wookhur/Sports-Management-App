import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { ok, fail } from "@/lib/api";
import { memberIds, teamRole } from "@/lib/teamAccess";
import { matchSchema } from "@/lib/matchSchema";

/**
 * Record a match. Only current members can be listed as having played; a
 * stale form that names someone who has since left is quietly trimmed.
 */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return fail("Sign in to continue", 401);
  const { id } = await params;
  if ((await teamRole(id, session.userId)) !== "owner") return fail("Team not found", 404);

  const parsed = matchSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid request");
  const { players, competition, note, ...rest } = parsed.data;
  const onTeam = await memberIds(id);

  const match = await prisma.match.create({
    data: {
      teamId: id,
      ...rest,
      competition: competition || null,
      note: note || null,
      players: { create: [...new Set(players)].filter((p) => onTeam.has(p)).map((userId) => ({ userId })) },
    },
  });
  return ok({ id: match.id }, 201);
}
