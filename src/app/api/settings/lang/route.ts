import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { ok, fail } from "@/lib/api";

const schema = z.object({ lang: z.enum(["ko", "en", "es"]) });

/**
 * Mirrors the language switcher's cookie onto the user record.
 *
 * The cookie still drives every page render; this copy exists so the weekly
 * digest — sent by a scheduler with no request and therefore no cookie — knows
 * which language to write in. It also means the choice follows a coach to a
 * new device instead of resetting to Korean.
 *
 * Signed-out visitors get a silent no-op: there is nobody to store it against,
 * and the cookie already did the useful part.
 */
export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return fail("잘못된 요청입니다");

  const session = await getSession();
  if (!session) return ok({ stored: false });

  await prisma.user.update({
    where: { id: session.userId },
    data: { lang: parsed.data.lang },
  });
  return ok({ stored: true });
}
