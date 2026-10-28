import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { ok } from "@/lib/api";
import { failT } from "@/lib/apiText";
import { teamRole, teamTimeZone } from "@/lib/teamAccess";
import { eventSchema } from "@/lib/bitacora";
import { dayKeyIn } from "@/lib/format";
import { schoolYearOf } from "@/lib/season";
import type { Prisma } from "@prisma/client";

/** Start a new event request (S-EVE), dated today. */
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return failT("signIn", 401);
  const { id } = await params;
  if ((await teamRole(id, session.userId)) !== "owner") return failT("teamNotFound", 404);
  const team = await prisma.team.findUnique({ where: { id }, select: { timeZone: true } });
  const today = dayKeyIn(teamTimeZone(team ?? { timeZone: null }));
  const data = eventSchema.parse({ requestDate: today }) as Prisma.InputJsonValue;
  const event = await prisma.teamEvent.create({ data: { teamId: id, year: schoolYearOf(today), data } });
  return ok({ id: event.id }, 201);
}
