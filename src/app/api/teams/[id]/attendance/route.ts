import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { ok, fail } from "@/lib/api";

const schema = z.object({
  day: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Day must be YYYY-MM-DD"),
  marks: z.array(z.object({ userId: z.string().min(1), present: z.boolean() })).min(1).max(200),
});

/**
 * Take the register for one day.
 *
 * Whole-day upsert: the sheet sends every row it shows, so a coach correcting
 * one mark resends the rest unchanged and nothing is lost. Only current
 * members can be marked — a userId that isn't on the team is dropped rather
 * than written, so a stale sheet can't attach attendance to someone who left.
 */
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return fail("Sign in to continue", 401);

  const { id } = await params;
  const team = await prisma.team.findUnique({
    where: { id },
    select: { coachId: true, members: { select: { userId: true } } },
  });
  if (!team || team.coachId !== session.userId) return fail("Team not found", 404);

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid request");

  const onTeam = new Set(team.members.map((m) => m.userId));
  const marks = parsed.data.marks.filter((m) => onTeam.has(m.userId));
  const { day } = parsed.data;

  await prisma.$transaction(
    marks.map((m) =>
      prisma.attendance.upsert({
        where: { teamId_day_userId: { teamId: id, day, userId: m.userId } },
        update: { present: m.present, markedById: session.userId },
        create: { teamId: id, day, userId: m.userId, present: m.present, markedById: session.userId },
      }),
    ),
  );
  return ok({ day, saved: marks.length, ignored: parsed.data.marks.length - marks.length });
}
