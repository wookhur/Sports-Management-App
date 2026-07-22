import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { ok, fail } from "@/lib/api";
import { getMission, isMissionMet } from "@/lib/missions";
import { seoulDayKey } from "@/lib/format";

const schema = z.object({ missionKey: z.string().min(1) });

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return fail("로그인이 필요합니다", 401);

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return fail("잘못된 요청입니다");

  const def = getMission(parsed.data.missionKey);
  if (!def) return fail("존재하지 않는 미션입니다", 404);

  const met = await isMissionMet(session.userId, def.key);
  if (!met) return fail("아직 미션을 완료하지 않았어요");

  const day = seoulDayKey();

  // The MissionClaim unique index (userId, missionKey, day) makes claiming
  // idempotent per day: a duplicate throws P2002, which we treat as "already
  // claimed" without double-awarding beans.
  try {
    await prisma.$transaction([
      prisma.missionClaim.create({
        data: { userId: session.userId, missionKey: def.key, day },
      }),
      prisma.user.update({
        where: { id: session.userId },
        data: { beans: { increment: def.reward }, charXp: { increment: def.reward } },
      }),
    ]);
  } catch {
    return fail("이미 오늘 받은 미션이에요");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { beans: true, charXp: true },
  });
  return ok({ beans: user?.beans ?? 0, xp: user?.charXp ?? 0, reward: def.reward });
}
