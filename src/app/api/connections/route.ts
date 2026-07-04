import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { ok, fail } from "@/lib/api";

const schema = z.object({ email: z.string().email("올바른 이메일을 입력하세요") });

// Link the current user to a counterpart by email.
//  - An ATHLETE links a COACH (invites a coach to view their records).
//  - A COACH links an ATHLETE (adds an athlete to their roster).
export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return fail("로그인이 필요합니다", 401);

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "잘못된 요청입니다");

  const counterpart = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (!counterpart) return fail("해당 이메일의 사용자를 찾을 수 없습니다", 404);
  if (counterpart.id === session.userId) return fail("자기 자신은 연결할 수 없습니다");

  const wantRole = session.role === "COACH" ? "ATHLETE" : "COACH";
  if (counterpart.role !== wantRole) {
    return fail(
      session.role === "COACH"
        ? "선수 계정만 로스터에 추가할 수 있습니다"
        : "코치 계정만 연결할 수 있습니다"
    );
  }

  const coachId = session.role === "COACH" ? session.userId : counterpart.id;
  const athleteId = session.role === "COACH" ? counterpart.id : session.userId;

  await prisma.coachAthlete.upsert({
    where: { coachId_athleteId: { coachId, athleteId } },
    update: {},
    create: { coachId, athleteId },
  });

  return ok({ ok: true, name: counterpart.name });
}

export async function DELETE(req: Request) {
  const session = await getSession();
  if (!session) return fail("로그인이 필요합니다", 401);

  const { searchParams } = new URL(req.url);
  const otherId = searchParams.get("id");
  if (!otherId) return fail("대상이 필요합니다");

  const coachId = session.role === "COACH" ? session.userId : otherId;
  const athleteId = session.role === "COACH" ? otherId : session.userId;

  await prisma.coachAthlete
    .delete({ where: { coachId_athleteId: { coachId, athleteId } } })
    .catch(() => null);

  return ok({ ok: true });
}
