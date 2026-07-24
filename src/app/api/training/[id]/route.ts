import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { ok, fail } from "@/lib/api";

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return fail("로그인이 필요합니다", 401);

  const { id } = await params;
  const entry = await prisma.trainingSession.findUnique({ where: { id }, select: { userId: true } });
  if (!entry) return fail("기록을 찾을 수 없습니다", 404);
  if (entry.userId !== session.userId) return fail("삭제 권한이 없습니다", 403);

  await prisma.trainingSession.delete({ where: { id } });
  return ok({ ok: true });
}
