import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { ok, fail } from "@/lib/api";
import { failT, failIssue } from "@/lib/apiText";
import { TEAM_TIME_ZONES } from "@/lib/teamAccess";

// Every field is optional: the same request renames the team or fills in its
// details. An empty string clears a detail.
const renameSchema = z.object({
  name: z.string().trim().min(2, "shortTeamName").max(40).optional(),
  category: z.string().trim().max(40).optional(),
  branch: z.string().trim().max(40).optional(),
  timeZone: z.enum(TEAM_TIME_ZONES, { errorMap: () => ({ message: "timeZone" }) }).optional(),
});

/** The team, but only if the caller is the coach who owns it. */
async function ownedTeam(id: string, userId: string) {
  const team = await prisma.team.findUnique({ where: { id }, select: { id: true, coachId: true } });
  if (!team || team.coachId !== userId) return null;
  return team;
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return await failT("signIn", 401);

  const { id } = await params;
  if (!(await ownedTeam(id, session.userId))) return await failT("teamNotFound", 404);

  const parsed = renameSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return await failIssue(parsed.error.issues);

  const { name, category, branch, timeZone } = parsed.data;
  const team = await prisma.team.update({
    where: { id },
    data: {
      ...(name !== undefined && { name }),
      ...(category !== undefined && { category: category || null }),
      ...(branch !== undefined && { branch: branch || null }),
      ...(timeZone !== undefined && { timeZone }),
    },
  });
  return ok({ id: team.id, name: team.name });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return await failT("signIn", 401);

  const { id } = await params;
  if (!(await ownedTeam(id, session.userId))) return await failT("teamNotFound", 404);

  // Memberships cascade with the team; the athletes themselves and any
  // assignments already given to them are untouched.
  await prisma.team.delete({ where: { id } });
  return ok({ id });
}
