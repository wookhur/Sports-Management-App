import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { ok } from "@/lib/api";
import { failT } from "@/lib/apiText";
import { teamRole } from "@/lib/teamAccess";
import { departedOf } from "@/lib/teamPage";

/** Put a student who left back on the roster, with their history as it was. */
export async function POST(_req: Request, { params }: { params: Promise<{ id: string; userId: string }> }) {
  const session = await getSession();
  if (!session) return failT("signIn", 401);
  const { id, userId } = await params;
  if ((await teamRole(id, session.userId)) !== "owner") return failT("teamNotFound", 404);
  // Only someone who left this team: a roster-only student with records here.
  const departed = await departedOf(id);
  if (!departed.some((d) => d.id === userId)) return failT("notOnTeam", 404);
  await prisma.teamMember.create({ data: { teamId: id, userId } });
  return ok({ userId }, 201);
}
