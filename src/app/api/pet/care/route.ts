import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { ok, fail } from "@/lib/api";
import { failT } from "@/lib/apiText";
import { getCare, isCareAvailable, petState, HATCH } from "@/lib/pet";

const schema = z.object({ actionKey: z.string().min(1) });

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return failT("signIn", 401);

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return failT("invalid");

  const def = getCare(parsed.data.actionKey);
  if (!def) return failT("unknownActivity", 404);

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { beans: true, petGrowth: true },
  });
  if (!user) return failT("userNotFound", 404);

  // The action must be one that's currently offered for this pet's growth.
  if (!isCareAvailable(def.key, user.petGrowth)) return failT("careUnavailable");
  if (user.beans < def.cost) return failT("notEnoughBeans");

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
