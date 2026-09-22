import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { ok, fail } from "@/lib/api";

/** Only the person who brought a drill in can take it out again. */
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return fail("Sign in to continue", 401);

  const { id } = await params;
  const drill = await prisma.customDrill.findUnique({ where: { id }, select: { ownerId: true } });
  // 404 for a stranger too: the id alone should not confirm the drill exists.
  if (!drill || drill.ownerId !== session.userId) return fail("Drill not found", 404);

  await prisma.customDrill.delete({ where: { id } });
  return ok({ id });
}
