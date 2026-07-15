import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { ok, fail } from "@/lib/api";
import { coverImageSchema } from "@/lib/blogSchemas";
import { isBodyEmpty } from "@/lib/blogBody";
import { sanitizeBlogHtml } from "@/lib/sanitizeBlogHtml";
import { slugify } from "@/lib/slug";
import { getSport } from "@/lib/sports";

// Body is rich-text HTML from the editor, so length is checked after
// sanitizing/stripping tags rather than with a raw min() on the markup.
const schema = z.object({
  sport: z.string().min(1),
  athleteName: z.string().min(1, "선수 이름을 입력하세요").max(80),
  title: z.string().min(2, "제목을 입력하세요").max(120),
  excerpt: z.string().min(2, "요약을 입력하세요").max(200),
  body: z.string().max(40000),
  coverImage: coverImageSchema,
});

// Coaches author these. (Timestamp comes from the request so the module
// stays free of Date.now at import time.)
export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return fail("로그인이 필요합니다", 401);
  if (session.role !== "COACH") return fail("코치만 글을 작성할 수 있습니다", 403);

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "잘못된 요청입니다");

  const { sport, athleteName, title, excerpt, coverImage } = parsed.data;
  if (!getSport(sport)) return fail("알 수 없는 종목입니다");

  const body = sanitizeBlogHtml(parsed.data.body);
  if (isBodyEmpty(body)) return fail("본문을 입력하세요");

  const guide = await prisma.athleteGuide.create({
    data: {
      sport,
      slug: slugify(`${sport}-${athleteName}`, sport),
      athleteName,
      title,
      excerpt,
      body,
      coverImage: coverImage?.trim() || null,
      authorId: session.userId,
    },
  });
  return ok({ slug: guide.slug }, 201);
}
