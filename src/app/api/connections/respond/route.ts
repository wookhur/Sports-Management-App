import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { ok, fail } from "@/lib/api";
import { notify } from "@/lib/notifyServer";

const schema = z.object({ id: z.string().min(1), accept: z.boolean() });

/**
 * Accept or decline a pending connection request.
 *
 * Only the party who did *not* raise the request may answer it — otherwise the
 * requester could approve their own access, which is the exact thing consent
 * is meant to prevent.
 */
export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return fail("로그인이 필요합니다", 401);

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return fail("잘못된 요청입니다");

  const link = await prisma.coachAthlete.findUnique({ where: { id: parsed.data.id } });
  if (!link) return fail("요청을 찾을 수 없습니다", 404);

  const iAmParty = link.coachId === session.userId || link.athleteId === session.userId;
  if (!iAmParty) return fail("권한이 없습니다", 403);
  if (link.status !== "PENDING") return fail("이미 처리된 요청입니다");
  if (link.requestedById === session.userId) return fail("본인이 보낸 요청은 수락할 수 없습니다", 403);

  if (!parsed.data.accept) {
    await prisma.coachAthlete.delete({ where: { id: link.id } });
    return ok({ status: "DECLINED" });
  }

  await prisma.coachAthlete.update({
    where: { id: link.id },
    data: { status: "ACCEPTED", respondedAt: new Date() },
  });

  if (link.requestedById) {
    await notify(
      link.requestedById,
      "connectionAccepted",
      { name: session.name },
      link.requestedById === link.coachId ? "/coach" : "/records",
    );
  }
  return ok({ status: "ACCEPTED" });
}
