import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { ok, fail } from "@/lib/api";
import { failT } from "@/lib/apiText";

// Marks the current user as having seen the onboarding tour, so the home
// page stops opening it automatically on future visits.
export async function POST() {
  const session = await getSession();
  if (!session) return failT("signIn", 401);

  await prisma.user.update({
    where: { id: session.userId },
    data: { onboarded: true },
  });
  return ok({ ok: true });
}
