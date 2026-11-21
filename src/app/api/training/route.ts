import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { ok, fail } from "@/lib/api";
import { failIssue, failT } from "@/lib/apiText";
import { getSport } from "@/lib/sports";
import { TRAINING_KINDS } from "@/lib/trainingScore";
import { sessionEncouragement } from "@/lib/encourage";
import { resolveLang } from "@/lib/i18n";
import { cookies } from "next/headers";
import { seoulDayKey } from "@/lib/format";

const schema = z.object({
  sport: z.string().min(1),
  kind: z.enum(TRAINING_KINDS as [string, ...string[]]),
  minutes: z.number().int().min(5, "minutesMin").max(360, "minutesMax"),
  intensity: z.number().int().min(1).max(10),
  notes: z.string().max(300).optional(),
});

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return failT("signIn", 401);

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return failIssue(parsed.error.issues);

  const { sport, kind, minutes, intensity, notes } = parsed.data;
  if (!getSport(sport)) return failT("unknownSport");

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
