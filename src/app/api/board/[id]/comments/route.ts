import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { ok, fail } from "@/lib/api";

const schema = z.object({ body: z.string().min(1, "댓글을 입력해주세요").max(1000) });

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return fail("로그인이 필요합니다", 401);

  const { id } = await params;
  const post = await prisma.boardPost.findUnique({ where: { id }, select: { id: true } });
  if (!post) return fail("게시글을 찾을 수 없습니다", 404);

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "잘못된 요청입니다");

  const comment = await prisma.boardComment.create({
    data: { postId: id, authorId: session.userId, body: parsed.data.body.trim() },
    select: {
      id: true,
      body: true,
      createdAt: true,
      author: { select: { name: true } },
    },
  });

  return ok(
    {
      id: comment.id,
      body: comment.body,
      authorName: comment.author.name,
      createdAt: comment.createdAt.toISOString(),
    },
    201,
  );
}
