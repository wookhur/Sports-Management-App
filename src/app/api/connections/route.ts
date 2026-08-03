import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { ok, fail } from "@/lib/api";
import { notify } from "@/lib/notifyServer";

const schema = z.object({ email: z.string().email("올바른 이메일을 입력하세요") });

/**
 * Ask to link with a counterpart by email.
 *
 *  - An ATHLETE asks a COACH to view their records.
 *  - A COACH asks an ATHLETE to join their roster.
 *
 * This creates a PENDING request, not a live link. Previously, typing an email
 * granted the coach immediate access to that athlete's entire training history
 * — load, ACWR, personal bests, the lot — with no say from the athlete. For an
 * app used by school children that was the wrong default; the person whose
 * data it is now has to agree.
 */
export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return fail("로그인이 필요합니다", 401);

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "잘못된 요청입니다");

  const counterpart = await prisma.user.findUnique({
    where: { email: parsed.data.email.toLowerCase().trim() },
  });
  if (!counterpart) return fail("해당 이메일의 사용자를 찾을 수 없습니다", 404);
  if (counterpart.id === session.userId) return fail("자기 자신은 연결할 수 없습니다");

  const wantRole = session.role === "COACH" ? "ATHLETE" : "COACH";
  if (counterpart.role !== wantRole) {
    return fail(
      session.role === "COACH"
        ? "선수 계정만 로스터에 추가할 수 있습니다"
        : "코치 계정만 연결할 수 있습니다",
    );
  }

  const coachId = session.role === "COACH" ? session.userId : counterpart.id;
  const athleteId = session.role === "COACH" ? counterpart.id : session.userId;

  const existing = await prisma.coachAthlete.findUnique({
    where: { coachId_athleteId: { coachId, athleteId } },
  });

  if (existing) {
    if (existing.status === "ACCEPTED") return ok({ status: "ACCEPTED", name: counterpart.name });
    // If they already asked us, this is an acceptance rather than a new
    // request — otherwise two people each inviting the other would deadlock.
    if (existing.requestedById && existing.requestedById !== session.userId) {
      await prisma.coachAthlete.update({
        where: { id: existing.id },
        data: { status: "ACCEPTED", respondedAt: new Date() },
      });
      await notify(counterpart.id, "connectionAccepted", { name: session.name }, "/connections");
      return ok({ status: "ACCEPTED", name: counterpart.name });
    }
    return ok({ status: "PENDING", name: counterpart.name });
  }

  await prisma.coachAthlete.create({
    data: { coachId, athleteId, status: "PENDING", requestedById: session.userId },
  });
  await notify(counterpart.id, "connectionRequest", { name: session.name }, "/connections");
  return ok({ status: "PENDING", name: counterpart.name });
}

/** Remove a link, or withdraw a pending request. Either side may. */
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
