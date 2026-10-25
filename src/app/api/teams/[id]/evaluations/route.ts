import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { ok, fail } from "@/lib/api";
import { memberIds, teamRole } from "@/lib/teamAccess";
import { isTerm } from "@/lib/season";

// Ten points, each 1-5, or 0 for "not scored yet" so a coach can save half an
// evaluation and come back to it.
const schema = z.object({
  athleteId: z.string().min(1),
  period: z.string().refine(isTerm, "Pick a term"),
  scores: z.array(z.number().int().min(0).max(5)).length(10),
  note: z.string().trim().max(1000).optional(),
});

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return fail("Sign in to continue", 401);
  const { id } = await params;
  if ((await teamRole(id, session.userId)) !== "owner") return fail("Team not found", 404);

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid request");
  const { athleteId, period, scores } = parsed.data;
  if (!(await memberIds(id)).has(athleteId)) return fail("They are not on this team", 404);

  const note = parsed.data.note || null;
  await prisma.playerEvaluation.upsert({
    where: { teamId_athleteId_period: { teamId: id, athleteId, period } },
    update: { scores, note },
    create: { teamId: id, athleteId, period, scores, note },
  });
  return ok({ athleteId, period });
}
