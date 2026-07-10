import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { ok, fail } from "@/lib/api";

// Marks the current user as having seen the onboarding tour, so the home
// page stops opening it automatically on future visits.
export async function POST() {
  const session = await getSession();
  if (!session) return fail("로그인이 필요합니다", 401);

  await prisma.user.update({
    where: { id: session.userId },
    data: { onboarded: true },
  });
  return ok({ ok: true });
}
