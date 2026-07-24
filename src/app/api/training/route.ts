import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { ok, fail } from "@/lib/api";
import { getSport } from "@/lib/sports";
import { TRAINING_KINDS } from "@/lib/trainingScore";
import { sessionEncouragement } from "@/lib/encourage";
import { resolveLang } from "@/lib/i18n";
import { cookies } from "next/headers";
import { seoulDayKey } from "@/lib/format";

const schema = z.object({
  sport: z.string().min(1),
  kind: z.enum(TRAINING_KINDS as [string, ...string[]]),
  minutes: z.number().int().min(5, "5분 이상 입력해주세요").max(360, "6시간 이하로 입력해주세요"),
  intensity: z.number().int().min(1).max(10),
  notes: z.string().max(300).optional(),
});

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return fail("로그인이 필요합니다", 401);

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "잘못된 요청입니다");

  const { sport, kind, minutes, intensity, notes } = parsed.data;
  if (!getSport(sport)) return fail("알 수 없는 종목입니다");

  const day = seoulDayKey();
  const entry = await prisma.trainingSession.create({
    data: {
      userId: session.userId,
      day,
      sport,
      kind,
      minutes,
      intensity,
      notes: notes?.trim() || null,
    },
    select: { id: true },
  });

  // Encouraging note back to the athlete (data-input positive reinforcement).
  const countToday = await prisma.trainingSession.count({ where: { userId: session.userId, day } });
  const lang = resolveLang((await cookies()).get("lang")?.value);
  const cheer = sessionEncouragement(lang, countToday);

  return ok({ id: entry.id, cheer }, 201);
}
