import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { ok, fail } from "@/lib/api";
import { failIssue, failT } from "@/lib/apiText";
import { getMetric } from "@/lib/sports";

// Targets from 1 second up to 1 hour, in ms.
const schema = z.object({
  sport: z.string().min(1),
  metricKey: z.string().min(1),
  targetMs: z.number().int().min(1000, "goalTooShort").max(3_600_000, "goalTooLong"),
});

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return failT("signIn", 401);

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return failIssue(parsed.error.issues);

  const { sport, metricKey, targetMs } = parsed.data;
  const metric = getMetric(sport, metricKey);
  // "custom" records carry a free distance, so a fixed time target is ambiguous.
  if (!metric || metricKey === "custom") return failT("unsupportedMetric");

  const existing = await prisma.goal.findFirst({
    where: { userId: session.userId, sport, metricKey, achievedAt: null },
  });
  if (existing) return failT("goalExists");

  const goal = await prisma.goal.create({
    data: { userId: session.userId, sport, metricKey, metricName: metric.name, targetMs },
  });
  return ok({ id: goal.id }, 201);
}
