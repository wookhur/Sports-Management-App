import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { ok, fail } from "@/lib/api";
import { isHomeWidget } from "@/lib/homeWidgets";

const schema = z.object({ hidden: z.array(z.string()).max(20) });

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return fail("로그인이 필요합니다", 401);

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return fail("잘못된 요청입니다");

  // Only persist keys we actually recognize.
  const hidden = [...new Set(parsed.data.hidden.filter(isHomeWidget))];

  await prisma.user.update({
    where: { id: session.userId },
    data: { homeHidden: hidden },
  });
  return ok({ hidden });
}
