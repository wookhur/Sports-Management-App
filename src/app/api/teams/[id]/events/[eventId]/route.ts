import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { ok } from "@/lib/api";
import { failT, failIssue } from "@/lib/apiText";
import { teamRole } from "@/lib/teamAccess";
import { eventSchema } from "@/lib/bitacora";
import type { Prisma } from "@prisma/client";

async function owned(id: string, eventId: string) {
  const session = await getSession();
  if (!session) return failT("signIn", 401);
  if ((await teamRole(id, session.userId)) !== "owner") return failT("teamNotFound", 404);
  const event = await prisma.teamEvent.findFirst({ where: { id: eventId, teamId: id }, select: { id: true } });
  return event ? null : failT("invalid", 404);
}

/** Autosave of the whole request form. */
export async function PUT(req: Request, { params }: { params: Promise<{ id: string; eventId: string }> }) {
  const { id, eventId } = await params;
  const denied = await owned(id, eventId);
  if (denied) return denied;
  const parsed = eventSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return failIssue(parsed.error.issues);
  await prisma.teamEvent.update({ where: { id: eventId }, data: { data: parsed.data as Prisma.InputJsonValue } });
  return ok({ id: eventId });
}

/** Delete a request; its matches stay, unlinked. */
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string; eventId: string }> }) {
  const { id, eventId } = await params;
  const denied = await owned(id, eventId);
  if (denied) return denied;
  await prisma.teamEvent.delete({ where: { id: eventId } });
  return ok({ id: eventId });
}
