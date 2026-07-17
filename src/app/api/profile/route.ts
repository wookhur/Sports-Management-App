import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession, createSession } from "@/lib/auth";
import { ok, fail } from "@/lib/api";
import { EXPERIENCE_LEVELS, GRADE_OPTIONS } from "@/lib/onboarding";
import { SPORTS } from "@/lib/sports";

const schema = z.object({
  name: z.string().min(1, "이름을 입력하세요").max(40),
  username: z
    .string()
    .max(30)
    .regex(/^[a-z0-9._-]*$/i, "아이디는 영문/숫자/._-만 쓸 수 있어요")
    .optional(),
  school: z.string().max(60).optional(),
  grade: z.string().optional(),
  dob: z.string().optional(), // yyyy-mm-dd or empty
  experienceLevel: z.string().optional(),
  sportInterests: z.array(z.string()).max(10).optional(),
});

export async function PATCH(req: Request) {
  const session = await getSession();
  if (!session) return fail("로그인이 필요합니다", 401);

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "잘못된 요청입니다");

  const { name, username, school, grade, dob, experienceLevel, sportInterests } = parsed.data;

  if (grade && !GRADE_OPTIONS.includes(grade as (typeof GRADE_OPTIONS)[number])) {
    return fail("학년 값이 올바르지 않아요");
  }
  if (experienceLevel && !EXPERIENCE_LEVELS.some((l) => l.value === experienceLevel)) {
    return fail("경험 수준 값이 올바르지 않아요");
  }
  const interests = (sportInterests ?? []).filter((id) => SPORTS[id]);

  let dobDate: Date | null = null;
  if (dob) {
    dobDate = new Date(`${dob}T00:00:00Z`);
    if (Number.isNaN(dobDate.getTime())) return fail("생년월일이 올바르지 않아요");
  }

  if (username?.trim()) {
    const taken = await prisma.user.findFirst({
      where: { username: username.trim(), id: { not: session.userId } },
      select: { id: true },
    });
    if (taken) return fail("이미 사용 중인 아이디예요");
  }

  await prisma.user.update({
    where: { id: session.userId },
    data: {
      name: name.trim(),
      username: username?.trim() || null,
      school: school?.trim() || null,
      grade: grade || null,
      dob: dobDate,
      experienceLevel: experienceLevel || null,
      sportInterests: interests,
    },
  });

  // The display name lives in the JWT (NavBar/sidebar read it), so re-issue
  // the session cookie when it changes.
  if (name.trim() !== session.name) {
    await createSession({ ...session, name: name.trim() });
  }
  return ok({ ok: true });
}
