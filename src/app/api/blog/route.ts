import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { ok, fail } from "@/lib/api";
import { coverImageSchema } from "@/lib/blogSchemas";

const schema = z.object({
  title: z.string().min(2, "제목을 입력하세요").max(120),
  excerpt: z.string().min(2, "요약을 입력하세요").max(200),
  body: z.string().min(10, "본문을 10자 이상 입력하세요").max(20000),
  emoji: z.string().max(8).optional(),
  tag: z.string().max(20).optional(),
  coverImage: coverImageSchema,
});

function slugify(title: string): string {
  // ASCII-only so the slug is always URL-safe (Korean titles collapse to
  // "post", made unique by the suffix below — avoids encoded-URL 404s).
  const base = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
  const suffix = Math.abs(hashCode(title + Date.now())).toString(36).slice(0, 6);
  return `${base || "post"}-${suffix}`;
}

function hashCode(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return h;
}

// Coaches author posts. (Timestamp comes from the request so the module stays
// free of Date.now at import time.)
export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return fail("로그인이 필요합니다", 401);
  if (session.role !== "COACH") return fail("코치만 글을 작성할 수 있습니다", 403);

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "잘못된 요청입니다");

  const { title, excerpt, body, emoji, tag, coverImage } = parsed.data;
  const post = await prisma.blogPost.create({
    data: {
      slug: slugify(title),
      title,
      excerpt,
      body,
      emoji: emoji?.trim() || "📝",
      tag: tag?.trim() || null,
      coverImage: coverImage?.trim() || null,
      authorId: session.userId,
    },
  });
  return ok({ slug: post.slug }, 201);
}
