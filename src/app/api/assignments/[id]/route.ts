import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { ok, fail } from "@/lib/api";
import { failT } from "@/lib/apiText";

type Params = { params: Promise<{ id: string }> };

const patchSchema = z.object({ completed: z.boolean() });

/** The assigned athlete checks the homework off (or back on). */
export async function PATCH(req: Request, { params }: Params) {
  const session = await getSession();
  if (!session) return failT("signIn", 401);

  const { id } = await params;
  const assignment = await prisma.assignment.findUnique({ where: { id } });
  if (!assignment || assignment.athleteId !== session.userId) return failT("assignmentNotFound", 404);

  const parsed = patchSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return failT("invalid");

  await prisma.assignment.update({
    where: { id },
    data: { completedAt: parsed.data.completed ? new Date() : null },
  });
  return ok({ ok: true });
}

/** The assigning coach withdraws the homework. */
export async function DELETE(_req: Request, { params }: Params) {
  const session = await getSession();
  if (!session) return failT("signIn", 401);

  const { id } = await params;
  const assignment = await prisma.assignment.findUnique({ where: { id } });
  if (!assignment || assignment.coachId !== session.userId) return failT("assignmentNotFound", 404);

  await prisma.assignment.delete({ where: { id } });
  return ok({ ok: true });
}
