import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { ok, fail } from "@/lib/api";
import { getRepair } from "@/lib/missions";

const schema = z.object({ repairKey: z.string().min(1) });

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return fail("로그인이 필요합니다", 401);

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return fail("잘못된 요청입니다");

  const def = getRepair(parsed.data.repairKey);
  if (!def) return fail("존재하지 않는 항목입니다", 404);

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { beans: true, houseRepairs: true },
  });
  if (!user) return fail("사용자를 찾을 수 없습니다", 404);
  if (user.houseRepairs.includes(def.key)) return fail("이미 수리한 항목이에요");
  if (user.beans < def.cost) return fail("완두콩이 부족해요");

  const updated = await prisma.user.update({
    where: { id: session.userId },
    data: {
      beans: { decrement: def.cost },
      houseRepairs: { push: def.key },
    },
    select: { beans: true, houseRepairs: true },
  });

  return ok({ beans: updated.beans, houseRepairs: updated.houseRepairs });
}
