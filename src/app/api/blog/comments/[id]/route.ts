import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { ok, fail } from "@/lib/api";

type Params = { params: Promise<{ id: string }> };

// The comment's author can delete it; coaches moderate everyone's.
export async function DELETE(_req: Request, { params }: Params) {
  const session = await getSession();
  if (!session) return fail("로그인이 필요합니다", 401);

  const { id } = await params;
  const comment = await prisma.blogComment.findUnique({ where: { id } });
  if (!comment) return fail("댓글을 찾을 수 없습니다", 404);
  if (comment.authorId !== session.userId && session.role !== "COACH") {
    return fail("내 댓글만 삭제할 수 있어요", 403);
  }

  await prisma.blogComment.delete({ where: { id } });
  return ok({ ok: true });
}
