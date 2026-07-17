import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { ok, fail } from "@/lib/api";

const schema = z.object({
  athleteId: z.string().min(1),
  title: z.string().min(2, "과제 이름을 입력하세요").max(120),
  note: z.string().max(500).optional(),
  // In-app path only (e.g. /training, /sports/swimming/workouts/123) — no
  // external URLs, so assignments can't be used to send athletes off-site.
  linkHref: z
    .string()
    .max(300)
    .refine((v) => v === "" || (v.startsWith("/") && !v.startsWith("//")), "앱 내 경로(/로 시작)만 넣을 수 있어요")
    .optional(),
  dueDate: z.string().datetime().optional(),
});

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return fail("로그인이 필요합니다", 401);
  if (session.role !== "COACH") return fail("코치만 과제를 배정할 수 있습니다", 403);

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "잘못된 요청입니다");

  const { athleteId, title, note, linkHref, dueDate } = parsed.data;
  const link = await prisma.coachAthlete.findUnique({
    where: { coachId_athleteId: { coachId: session.userId, athleteId } },
  });
  if (!link) return fail("연결된 선수에게만 과제를 배정할 수 있어요");

  const assignment = await prisma.assignment.create({
    data: {
      coachId: session.userId,
      athleteId,
      title,
      note: note?.trim() || null,
      linkHref: linkHref?.trim() || null,
      dueDate: dueDate ? new Date(dueDate) : null,
    },
  });
  return ok({ id: assignment.id }, 201);
}
