import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { ok, fail } from "@/lib/api";

type Params = { params: Promise<{ slug: string }> };

const schema = z.object({ body: z.string().min(1, "댓글을 입력하세요").max(1000) });

export async function POST(req: Request, { params }: Params) {
  const session = await getSession();
  if (!session) return fail("로그인이 필요합니다", 401);

  const { slug } = await params;
  const post = await prisma.blogPost.findUnique({ where: { slug }, select: { id: true, published: true } });
  if (!post || !post.published) return fail("글을 찾을 수 없습니다", 404);

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "잘못된 요청입니다");

  const comment = await prisma.blogComment.create({
    data: { postId: post.id, authorId: session.userId, body: parsed.data.body.trim() },
  });
  return ok({ id: comment.id }, 201);
}
