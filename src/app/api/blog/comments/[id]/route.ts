import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { ok, fail } from "@/lib/api";
import { failT } from "@/lib/apiText";

type Params = { params: Promise<{ id: string }> };

// The comment's author can delete it; coaches moderate everyone's.
export async function DELETE(_req: Request, { params }: Params) {
  const session = await getSession();
  if (!session) return failT("signIn", 401);

  const { id } = await params;
  const comment = await prisma.blogComment.findUnique({ where: { id } });
  if (!comment) return failT("commentNotFound", 404);
  if (comment.authorId !== session.userId && session.role !== "COACH") {
    return failT("ownCommentsOnly", 403);
  }

  await prisma.blogComment.delete({ where: { id } });
  return ok({ ok: true });
}
