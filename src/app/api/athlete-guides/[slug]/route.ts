import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { ok, fail } from "@/lib/api";
import { coverImageSchema } from "@/lib/blogSchemas";
import { isBodyEmpty } from "@/lib/blogBody";
import { sanitizeBlogHtml } from "@/lib/sanitizeBlogHtml";

// Slug and sport are intentionally immutable on edit — the slug is the
// post's URL, and sport determines which hub page it lives under. Body is
// rich-text HTML from the editor, so length is checked after sanitizing/
// stripping tags rather than with a raw min() on the markup.
const patchSchema = z.object({
  athleteName: z.string().min(1, "선수 이름을 입력하세요").max(80),
  title: z.string().min(2, "제목을 입력하세요").max(120),
  excerpt: z.string().min(2, "요약을 입력하세요").max(200),
  body: z.string().max(40000),
  coverImage: coverImageSchema,
});

type Params = { params: Promise<{ slug: string }> };

export async function PATCH(req: Request, { params }: Params) {
  const session = await getSession();
  if (!session) return fail("로그인이 필요합니다", 401);
  if (session.role !== "COACH") return fail("코치만 글을 수정할 수 있습니다", 403);

  const { slug } = await params;
  const existing = await prisma.athleteGuide.findUnique({ where: { slug } });
  if (!existing) return fail("글을 찾을 수 없습니다", 404);

  const parsed = patchSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "잘못된 요청입니다");

  const { athleteName, title, excerpt, coverImage } = parsed.data;
  const body = sanitizeBlogHtml(parsed.data.body);
  if (isBodyEmpty(body)) return fail("본문을 입력하세요");

  await prisma.athleteGuide.update({
    where: { slug },
    data: {
      athleteName,
      title,
      excerpt,
      body,
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
  const existing = await prisma.athleteGuide.findUnique({ where: { slug } });
  if (!existing) return fail("글을 찾을 수 없습니다", 404);

  await prisma.athleteGuide.delete({ where: { slug } });
  return ok({ ok: true });
}
