import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { ok, fail } from "@/lib/api";
import { failIssue, failT } from "@/lib/apiText";

const schema = z.object({ body: z.string().min(1, "enterComment").max(1000) });

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return failT("signIn", 401);

  const { id } = await params;
  const post = await prisma.boardPost.findUnique({ where: { id }, select: { id: true } });
  if (!post) return failT("postNotFound", 404);

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return failIssue(parsed.error.issues);

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
