import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { ok, fail } from "@/lib/api";

type Params = { params: Promise<{ slug: string }> };

/** Toggle my like on a post. Returns the new state + total. */
export async function POST(_req: Request, { params }: Params) {
  const session = await getSession();
  if (!session) return fail("로그인이 필요합니다", 401);

  const { slug } = await params;
  const post = await prisma.blogPost.findUnique({ where: { slug }, select: { id: true, published: true } });
  if (!post || !post.published) return fail("글을 찾을 수 없습니다", 404);

  const key = { postId_userId: { postId: post.id, userId: session.userId } };
  const existing = await prisma.blogLike.findUnique({ where: key });
  if (existing) {
    await prisma.blogLike.delete({ where: key });
  } else {
    await prisma.blogLike.create({ data: { postId: post.id, userId: session.userId } });
  }
  const count = await prisma.blogLike.count({ where: { postId: post.id } });
  return ok({ liked: !existing, count });
}
