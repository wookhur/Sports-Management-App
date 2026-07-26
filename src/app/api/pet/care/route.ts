import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { ok, fail } from "@/lib/api";
import { getCare, isCareAvailable, petState, HATCH } from "@/lib/pet";

const schema = z.object({ actionKey: z.string().min(1) });

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return fail("로그인이 필요합니다", 401);

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return fail("잘못된 요청입니다");

  const def = getCare(parsed.data.actionKey);
  if (!def) return fail("존재하지 않는 활동입니다", 404);

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { beans: true, petGrowth: true },
  });
  if (!user) return fail("사용자를 찾을 수 없습니다", 404);

  // The action must be one that's currently offered for this pet's growth.
  if (!isCareAvailable(def.key, user.petGrowth)) return fail("지금은 할 수 없는 활동이에요");
  if (user.beans < def.cost) return fail("완두콩이 부족해요");

  const newGrowth = user.petGrowth + def.growth;
  const justHatched = user.petGrowth < HATCH && newGrowth >= HATCH;

  const updated = await prisma.user.update({
    where: { id: session.userId },
    data: { beans: { decrement: def.cost }, petGrowth: newGrowth },
    select: { beans: true, petGrowth: true },
  });

  const state = petState(updated.petGrowth);
  return ok({
    beans: updated.beans,
    growth: updated.petGrowth,
    stage: state.stage,
    justHatched,
  });
}
