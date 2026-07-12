import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { ok, fail } from "@/lib/api";
import { coverImageSchema } from "@/lib/blogSchemas";

// Slug is intentionally immutable on edit — it's the post's URL, and any
// existing links/search-index entries would break if it changed.
const patchSchema = z.object({
  title: z.string().min(2, "제목을 입력하세요").max(120),
  excerpt: z.string().min(2, "요약을 입력하세요").max(200),
  body: z.string().min(10, "본문을 10자 이상 입력하세요").max(20000),
  emoji: z.string().max(8).optional(),
  tag: z.string().max(20).optional(),
  coverImage: coverImageSchema,
});

type Params = { params: Promise<{ slug: string }> };

export async function PATCH(req: Request, { params }: Params) {
  const session = await getSession();
  if (!session) return fail("로그인이 필요합니다", 401);
  if (session.role !== "COACH") return fail("코치만 글을 수정할 수 있습니다", 403);

  const { slug } = await params;
  const existing = await prisma.blogPost.findUnique({ where: { slug } });
  if (!existing) return fail("글을 찾을 수 없습니다", 404);

  const parsed = patchSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "잘못된 요청입니다");

  const { title, excerpt, body, emoji, tag, coverImage } = parsed.data;
  await prisma.blogPost.update({
    where: { slug },
    data: {
      title,
      excerpt,
      body,
      emoji: emoji?.trim() || "📝",
      tag: tag?.trim() || null,
      coverImage: coverImage?.trim() || null,
    },
  });
  return ok({ slug });
}

export async function DELETE(_req: Request, { params }: Params) {
  const session = await getSession();
  if (!session) return fail("로그인이 필요합니다", 401);
  if (session.role !== "COACH") return fail("코치만 글을 삭제할 수 있습니다", 403);

  const { slug } = await params;
  const existing = await prisma.blogPost.findUnique({ where: { slug } });
  if (!existing) return fail("글을 찾을 수 없습니다", 404);

  await prisma.blogPost.delete({ where: { slug } });
  return ok({ ok: true });
}
