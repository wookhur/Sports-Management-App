import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { ok, fail } from "@/lib/api";
import { failIssue, failT } from "@/lib/apiText";
import { coverImageSchema } from "@/lib/blogSchemas";
import { isBodyEmpty } from "@/lib/blogBody";
import { sanitizeBlogHtml } from "@/lib/sanitizeBlogHtml";
import { slugify } from "@/lib/slug";
import { getSport } from "@/lib/sports";

// Body is rich-text HTML from the editor, so length is checked after
// sanitizing/stripping tags rather than with a raw min() on the markup.
const schema = z.object({
  sport: z.string().min(1),
  athleteName: z.string().min(1, "enterAthleteName").max(80),
  title: z.string().min(2, "enterTitle").max(120),
  excerpt: z.string().min(2, "enterExcerpt").max(200),
  body: z.string().max(40000),
  coverImage: coverImageSchema,
});

// Coaches author these. (Timestamp comes from the request so the module
// stays free of Date.now at import time.)
export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return failT("signIn", 401);
  if (session.role !== "COACH") return failT("onlyCoachWrite", 403);

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return failIssue(parsed.error.issues);

  const { sport, athleteName, title, excerpt, coverImage } = parsed.data;
  if (!getSport(sport)) return failT("unknownSport");

  const body = sanitizeBlogHtml(parsed.data.body);
  if (isBodyEmpty(body)) return failT("writeBody");

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
