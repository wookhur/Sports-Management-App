import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { ok, fail } from "@/lib/api";
import { failIssue, failT } from "@/lib/apiText";
import { coverImageSchema } from "@/lib/blogSchemas";
import { isBodyEmpty } from "@/lib/blogBody";
import { sanitizeBlogHtml } from "@/lib/sanitizeBlogHtml";
import { slugify } from "@/lib/slug";

// Body is rich-text HTML from the editor, so length is checked after
// sanitizing/stripping tags rather than with a raw min() on the markup.
const schema = z.object({
  title: z.string().min(2, "enterTitle").max(120),
  excerpt: z.string().min(2, "enterExcerpt").max(200),
  body: z.string().max(40000),
  emoji: z.string().max(8).optional(),
  tag: z.string().max(40).optional(),
  coverImage: coverImageSchema,
});

// Any logged-in user can author posts.
export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return failT("signIn", 401);

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return failIssue(parsed.error.issues);

  const { title, excerpt, emoji, tag, coverImage } = parsed.data;
  const body = sanitizeBlogHtml(parsed.data.body);
  if (isBodyEmpty(body)) return failT("writeBody");

  // Slug is the post URL and must be unique. With every user able to publish,
  // title collisions are common, so append a numeric suffix until it's free.
  const base = slugify(title) || "post";
  let slug = base;
  for (let n = 2; await prisma.blogPost.findUnique({ where: { slug }, select: { id: true } }); n++) {
    slug = `${base}-${n}`;
  }

  const post = await prisma.blogPost.create({
    data: {
      slug,
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
