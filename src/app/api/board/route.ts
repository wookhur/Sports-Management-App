import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { ok, fail } from "@/lib/api";

const schema = z.object({
  title: z.string().max(120).optional(),
  body: z.string().min(1, "내용을 입력해주세요").max(5000),
  images: z.array(z.string().url().or(z.string().startsWith("/"))).max(6).optional(),
});

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return fail("로그인이 필요합니다", 401);

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "잘못된 요청입니다");

  const { title, body, images } = parsed.data;
  const post = await prisma.boardPost.create({
    data: {
      authorId: session.userId,
      title: title?.trim() || null,
      body: body.trim(),
      images: images ?? [],
    },
    select: { id: true },
  });

  return ok({ id: post.id }, 201);
}
