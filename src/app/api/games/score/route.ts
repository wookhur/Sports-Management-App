import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { ok, fail } from "@/lib/api";
import { isGameId, maxScore } from "@/lib/games";

const schema = z.object({
  game: z.string().min(1),
  score: z.number().int().min(0),
});

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return fail("로그인이 필요합니다", 401);

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return fail("잘못된 요청입니다");

  const { game, score } = parsed.data;
  if (!isGameId(game)) return fail("알 수 없는 게임입니다", 404);
  // Reject impossible scores (basic anti-tamper; the game is client-side).
  if (score > maxScore(game)) return fail("점수가 올바르지 않습니다");

  const existing = await prisma.gameScore.findUnique({
    where: { userId_game: { userId: session.userId, game } },
    select: { best: true },
  });
  const isRecord = !existing || score > existing.best;
  const best = Math.max(existing?.best ?? 0, score);

  await prisma.gameScore.upsert({
    where: { userId_game: { userId: session.userId, game } },
    update: { best, plays: { increment: 1 } },
    create: { userId: session.userId, game, best: score, plays: 1 },
  });

  // Rank among all players by best score (1-based).
  const higher = await prisma.gameScore.count({ where: { game, best: { gt: best } } });

  return ok({ best, isRecord, rank: higher + 1 });
}
