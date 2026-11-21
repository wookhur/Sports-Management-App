import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { ok, fail } from "@/lib/api";
import { failT } from "@/lib/apiText";

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return failT("signIn", 401);

  const { id } = await params;
  const post = await prisma.boardPost.findUnique({ where: { id }, select: { authorId: true } });
  if (!post) return failT("postNotFound", 404);
  // The author can delete their own post; coaches can moderate any post.
  if (post.authorId !== session.userId && session.role !== "COACH") {
    return failT("noDeletePermission", 403);
  }

  await prisma.boardPost.delete({ where: { id } });
  return ok({ ok: true });
}
