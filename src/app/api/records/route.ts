import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { getSport, getMetric } from "@/lib/sports";
import { ok, fail } from "@/lib/api";

const schema = z.object({
  sport: z.string(),
  metricKey: z.string(),
  distanceM: z.number().positive().optional(),
  durationMs: z.number().int().nonnegative().optional(),
  value: z.number().optional(),
  unit: z.string().optional(),
  notes: z.string().max(500).optional(),
  shared: z.boolean().optional(),
  // Optional measured date for manually entered records. The app uses
  // `createdAt` as the record's date everywhere, so setting it here makes a
  // hand-entered past result sort and display on the day it happened.
  occurredAt: z.string().datetime().optional(),
});

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return fail("로그인이 필요합니다", 401);

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "잘못된 요청입니다");

  const data = parsed.data;
  const sport = getSport(data.sport);
  if (!sport) return fail("알 수 없는 종목입니다");
  const metric = getMetric(data.sport, data.metricKey);
  if (!metric) return fail("알 수 없는 측정 항목입니다");

  // Resolve distance: use metric preset, else the submitted value.
  const distanceM = metric.distanceM ?? data.distanceM;
  if (metric.capture.includes("distance") && !distanceM) {
    return fail("거리를 입력하세요");
  }
  if (metric.capture.includes("time") && data.durationMs == null) {
    return fail("측정 시간이 필요합니다");
  }

  // For manual entries the athlete may pick the date it happened. Reject a
  // date in the future so a typo can't push a record ahead of real ones.
  let occurredAt: Date | undefined;
  if (data.occurredAt) {
    const d = new Date(data.occurredAt);
    if (Number.isNaN(d.getTime())) return fail("측정 날짜가 올바르지 않습니다");
    if (d.getTime() > Date.now() + 60_000) return fail("측정 날짜는 미래일 수 없습니다");
    occurredAt = d;
  }

  const record = await prisma.record.create({
    data: {
      userId: session.userId,
      sport: data.sport,
      metricKey: data.metricKey,
      metricName: metric.name,
      distanceM: distanceM ?? null,
      durationMs: data.durationMs ?? null,
      value: data.value ?? null,
      unit: data.unit ?? null,
      notes: data.notes?.trim() || null,
      shared: data.shared ?? false,
      // Fall back to the DB default (now) when no date was supplied.
      ...(occurredAt ? { createdAt: occurredAt } : {}),
    },
  });

  return ok(record, 201);
}

export async function GET(req: Request) {
  const session = await getSession();
  if (!session) return fail("로그인이 필요합니다", 401);

  const { searchParams } = new URL(req.url);
  const sport = searchParams.get("sport") ?? undefined;

  const records = await prisma.record.findMany({
    where: { userId: session.userId, ...(sport ? { sport } : {}) },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return ok(records);
}
