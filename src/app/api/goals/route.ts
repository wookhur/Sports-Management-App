import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { ok, fail } from "@/lib/api";
import { getMetric } from "@/lib/sports";

// Targets from 1 second up to 1 hour, in ms.
const schema = z.object({
  sport: z.string().min(1),
  metricKey: z.string().min(1),
  targetMs: z.number().int().min(1000, "목표 시간이 너무 짧아요").max(3_600_000, "목표 시간이 너무 길어요"),
});

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return fail("로그인이 필요합니다", 401);

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "잘못된 요청입니다");

  const { sport, metricKey, targetMs } = parsed.data;
  const metric = getMetric(sport, metricKey);
  // "custom" records carry a free distance, so a fixed time target is ambiguous.
  if (!metric || metricKey === "custom") return fail("지원하지 않는 종목/측정 항목입니다");

  const existing = await prisma.goal.findFirst({
    where: { userId: session.userId, sport, metricKey, achievedAt: null },
  });
  if (existing) return fail("이 항목에는 이미 진행 중인 목표가 있어요");

  const goal = await prisma.goal.create({
    data: { userId: session.userId, sport, metricKey, metricName: metric.name, targetMs },
  });
  return ok({ id: goal.id }, 201);
}
