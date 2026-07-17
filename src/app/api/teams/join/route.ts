import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { ok, fail } from "@/lib/api";

const schema = z.object({ code: z.string().min(4).max(12) });

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return fail("로그인이 필요합니다", 401);

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return fail("초대 코드를 입력하세요");

  const team = await prisma.team.findUnique({ where: { code: parsed.data.code.trim().toUpperCase() } });
  if (!team) return fail("초대 코드가 올바르지 않아요");
  if (team.coachId === session.userId) return fail("내가 만든 팀에는 참여할 필요가 없어요");

  await prisma.teamMember.upsert({
    where: { teamId_userId: { teamId: team.id, userId: session.userId } },
    update: {},
    create: { teamId: team.id, userId: session.userId },
  });
  return ok({ teamId: team.id, name: team.name });
}
