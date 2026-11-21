import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { ok, fail } from "@/lib/api";
import { failIssue, failT } from "@/lib/apiText";
import { BOARD_CATEGORIES } from "@/lib/board";

const schema = z.object({
  title: z.string().max(120).optional(),
  body: z.string().min(1, "enterContent").max(5000),
  images: z.array(z.string().url().or(z.string().startsWith("/"))).max(6).optional(),
  category: z.enum(BOARD_CATEGORIES).optional(),
  videoUrl: z.string().url("checkLink").max(500).optional().or(z.literal("")),
});

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return failT("signIn", 401);

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return failIssue(parsed.error.issues);

  const { title, body, images, category, videoUrl } = parsed.data;
  const post = await prisma.boardPost.create({
    data: {
      authorId: session.userId,
      title: title?.trim() || null,
      body: body.trim(),
      images: images ?? [],
      category: category ?? "general",
      videoUrl: videoUrl?.trim() || null,
    },
    select: { id: true },
  });

  return ok({ id: post.id }, 201);
}
