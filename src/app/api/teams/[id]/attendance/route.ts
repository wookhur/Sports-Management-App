import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { ok, fail } from "@/lib/api";
import { failT, failIssue } from "@/lib/apiText";
import { ATTENDANCE_STATUSES, attendanceFlags, type AttendanceStatusKey } from "@/lib/bitacora";

const schema = z.object({
  day: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "pickDate"),
  marks: z
    .array(
      z.object({
        userId: z.string().min(1),
        // The school's five marks; null clears the day's mark. Older callers
        // send present/excused instead, which map onto three of the five.
        status: z.enum(ATTENDANCE_STATUSES).nullable().optional(),
        present: z.boolean().optional(),
        excused: z.boolean().optional(),
      }),
    )
    .min(1)
    .max(200),
});

function statusOf(m: { status?: AttendanceStatusKey | null; present?: boolean; excused?: boolean }): AttendanceStatusKey | null {
  if (m.status !== undefined) return m.status;
  if (m.present) return "ASISTENCIA";
  return m.excused ? "JUSTIFICADA" : "FALTA";
}

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
  if (!session) return await failT("signIn", 401);

  const { id } = await params;
  const team = await prisma.team.findUnique({
    where: { id },
    select: { coachId: true, members: { select: { userId: true } } },
  });
  if (!team || team.coachId !== session.userId) return await failT("teamNotFound", 404);

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return await failIssue(parsed.error.issues);

  const onTeam = new Set(team.members.map((m) => m.userId));
  const marks = parsed.data.marks.filter((m) => onTeam.has(m.userId));
  const { day } = parsed.data;

  await prisma.$transaction(
    marks.map((m) => {
      const status = statusOf(m);
      if (status === null) return prisma.attendance.deleteMany({ where: { teamId: id, day, userId: m.userId } });
      const data = { status, ...attendanceFlags(status), markedById: session.userId };
      return prisma.attendance.upsert({
        where: { teamId_day_userId: { teamId: id, day, userId: m.userId } },
        update: data,
        create: { teamId: id, day, userId: m.userId, ...data },
      });
    }),
  );
  return ok({ day, saved: marks.length, ignored: parsed.data.marks.length - marks.length });
}
