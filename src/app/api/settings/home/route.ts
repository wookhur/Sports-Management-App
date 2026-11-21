import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { ok, fail } from "@/lib/api";
import { failT } from "@/lib/apiText";
import { isHomeWidget } from "@/lib/homeWidgets";

const schema = z.object({ hidden: z.array(z.string()).max(20) });

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return failT("signIn", 401);

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return failT("invalid");

  // Only persist keys we actually recognize.
  const hidden = [...new Set(parsed.data.hidden.filter(isHomeWidget))];

  await prisma.user.update({
    where: { id: session.userId },
    data: { homeHidden: hidden },
  });
  return ok({ hidden });
}
