import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { ok, fail } from "@/lib/api";
import { failT } from "@/lib/apiText";

const schema = z.object({ code: z.string().min(4).max(12) });

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return failT("signIn", 401);

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return failT("enterCode");

  const team = await prisma.team.findUnique({ where: { code: parsed.data.code.trim().toUpperCase() } });
  if (!team) return failT("codeNoMatch");
  if (team.coachId === session.userId) return failT("alreadyCoach");

  await prisma.teamMember.upsert({
    where: { teamId_userId: { teamId: team.id, userId: session.userId } },
    update: {},
    create: { teamId: team.id, userId: session.userId },
  });
  return ok({ teamId: team.id, name: team.name });
}
