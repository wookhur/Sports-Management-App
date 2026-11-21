import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { ok, fail } from "@/lib/api";
import { failIssue, failT } from "@/lib/apiText";

type Params = { params: Promise<{ slug: string }> };

const schema = z.object({ body: z.string().min(1, "enterComment").max(1000) });

export async function POST(req: Request, { params }: Params) {
  const session = await getSession();
  if (!session) return failT("signIn", 401);

  const { slug } = await params;
  const post = await prisma.blogPost.findUnique({ where: { slug }, select: { id: true, published: true } });
  if (!post || !post.published) return failT("postNotFound", 404);

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return failIssue(parsed.error.issues);

  const comment = await prisma.blogComment.create({
    data: { postId: post.id, authorId: session.userId, body: parsed.data.body.trim() },
  });
  return ok({ id: comment.id }, 201);
}
