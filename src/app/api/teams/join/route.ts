import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { ok, fail } from "@/lib/api";

const schema = z.object({ code: z.string().min(4).max(12) });

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return fail("Sign in to continue", 401);

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return fail("Enter an invite code");

  const team = await prisma.team.findUnique({ where: { code: parsed.data.code.trim().toUpperCase() } });
  if (!team) return fail("That invite code doesn't match any team");
  if (team.coachId === session.userId) return fail("You already coach this team");

  await prisma.teamMember.upsert({
    where: { teamId_userId: { teamId: team.id, userId: session.userId } },
    update: {},
    create: { teamId: team.id, userId: session.userId },
  });
  return ok({ teamId: team.id, name: team.name });
}
