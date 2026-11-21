import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { ok, fail } from "@/lib/api";
import { failT } from "@/lib/apiText";
import { getMission, isMissionMet } from "@/lib/missions";
import { seoulDayKey } from "@/lib/format";

const schema = z.object({ missionKey: z.string().min(1) });

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return failT("signIn", 401);

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return failT("invalid");

  const def = getMission(parsed.data.missionKey);
  if (!def) return failT("unknownMission", 404);

  const met = await isMissionMet(session.userId, def.key);
  if (!met) return failT("missionNotDone");

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
    return failT("missionClaimed");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { beans: true, charXp: true },
  });
  return ok({ beans: user?.beans ?? 0, xp: user?.charXp ?? 0, reward: def.reward });
}
