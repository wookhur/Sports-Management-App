import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { ok, fail } from "@/lib/api";
import { failT } from "@/lib/apiText";

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return failT("signIn", 401);

  const { id } = await params;
  const entry = await prisma.trainingSession.findUnique({ where: { id }, select: { userId: true } });
  if (!entry) return failT("recordNotFound", 404);
  if (entry.userId !== session.userId) return failT("noDeletePermission", 403);

  await prisma.trainingSession.delete({ where: { id } });
  return ok({ ok: true });
}
