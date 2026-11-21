import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { ok, fail } from "@/lib/api";
import { failT } from "@/lib/apiText";

// Toggle a like on a board post. Returns the new like count and whether the
// caller now likes it.
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return failT("signIn", 401);

  const { id } = await params;
  const post = await prisma.boardPost.findUnique({ where: { id }, select: { id: true } });
  if (!post) return failT("postNotFound", 404);

  const existing = await prisma.boardLike.findUnique({
    where: { postId_userId: { postId: id, userId: session.userId } },
  });

  if (existing) {
    await prisma.boardLike.delete({
      where: { postId_userId: { postId: id, userId: session.userId } },
    });
  } else {
    await prisma.boardLike.create({ data: { postId: id, userId: session.userId } });
  }

  const count = await prisma.boardLike.count({ where: { postId: id } });
  return ok({ liked: !existing, count });
}
