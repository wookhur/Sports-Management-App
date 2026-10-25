import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { ok } from "@/lib/api";
import { failT, failIssue } from "@/lib/apiText";
import { teamRole } from "@/lib/teamAccess";
import { mergeRosterPlayer } from "@/lib/rosterMerge";

const schema = z.object({ into: z.string().min(1, "mergeTarget") });

/** Merge the roster-only player `userId` into the account member `into`. */
export async function POST(req: Request, { params }: { params: Promise<{ id: string; userId: string }> }) {
  const session = await getSession();
  if (!session) return failT("signIn", 401);
  const { id, userId } = await params;
  if ((await teamRole(id, session.userId)) !== "owner") return failT("teamNotFound", 404);

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return failIssue(parsed.error.issues);
  const { into } = parsed.data;

  const rows = await prisma.teamMember.findMany({
    where: { teamId: id, userId: { in: [userId, into] } },
    select: { userId: true, user: { select: { managed: true } } },
  });
  const from = rows.find((r) => r.userId === userId);
  const target = rows.find((r) => r.userId === into);
  if (!from) return failT("notOnTeam", 404);
  // Only a roster-only player can be merged away, and only into a real
  // account: merging two accounts would delete someone's login.
  if (!from.user.managed) return failT("mergeNotManaged");
  if (!target || target.userId === userId || target.user.managed) return failT("mergeTarget");

  const moved = await mergeRosterPlayer(id, userId, into);
  return ok({ into, ...moved });
}
