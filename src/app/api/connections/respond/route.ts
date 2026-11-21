import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { ok, fail } from "@/lib/api";
import { failT } from "@/lib/apiText";
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
  if (!session) return failT("signIn", 401);

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return failT("invalid");

  const link = await prisma.coachAthlete.findUnique({ where: { id: parsed.data.id } });
  if (!link) return failT("requestNotFound", 404);

  const iAmParty = link.coachId === session.userId || link.athleteId === session.userId;
  if (!iAmParty) return failT("forbidden", 403);
  if (link.status !== "PENDING") return failT("alreadyHandled");
  if (link.requestedById === session.userId) return failT("ownRequest", 403);

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
