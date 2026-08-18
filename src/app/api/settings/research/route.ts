import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { ok, fail } from "@/lib/api";

const schema = z.object({ consent: z.boolean() });

/**
 * Records the signed-in user's research-consent decision.
 *
 * Both directions go through here: granting and withdrawing are the same
 * operation with a different value, and each re-stamps `researchConsentAt` so
 * the record shows when the *current* answer was given. There is no route that
 * sets the column back to null — "never asked" is a state only the passage of
 * time can produce, not something a request should be able to forge.
 */
export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return fail("로그인이 필요합니다", 401);

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return fail("잘못된 요청입니다");

  await prisma.user.update({
    where: { id: session.userId },
    data: { researchConsent: parsed.data.consent, researchConsentAt: new Date() },
  });
  return ok({ consent: parsed.data.consent });
}
