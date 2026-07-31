import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { ok, fail } from "@/lib/api";

const schema = z.object({ optOut: z.boolean() });

/** Turns the weekly digest email on or off for the signed-in user. */
export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return fail("로그인이 필요합니다", 401);

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return fail("잘못된 요청입니다");

  await prisma.user.update({
    where: { id: session.userId },
    data: { digestOptOut: parsed.data.optOut },
  });
  return ok({ optOut: parsed.data.optOut });
}
