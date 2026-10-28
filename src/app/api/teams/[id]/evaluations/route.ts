import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { ok, fail } from "@/lib/api";
import { failT, failIssue } from "@/lib/apiText";
import { memberIds, teamRole } from "@/lib/teamAccess";
import { isTerm } from "@/lib/season";

// Ten points, each 10-6, or 0 for "not scored yet" so a coach can save half
// an evaluation and come back to it.
const schema = z.object({
  athleteId: z.string().min(1),
  period: z.string().refine(isTerm, "pickTerm"),
  // The school's scale: 10, 9, 8, 7 or 6 per point; 0 = not scored yet.
  scores: z.array(z.number().int().refine((n) => n === 0 || (n >= 6 && n <= 10), "invalid")).length(10),
  note: z.string().trim().max(1000).optional(),
});

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return await failT("signIn", 401);
  const { id } = await params;
  if ((await teamRole(id, session.userId)) !== "owner") return await failT("teamNotFound", 404);

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return await failIssue(parsed.error.issues);
  const { athleteId, period, scores } = parsed.data;
  if (!(await memberIds(id)).has(athleteId)) return await failT("notOnTeam", 404);

  const note = parsed.data.note || null;
  await prisma.playerEvaluation.upsert({
    where: { teamId_athleteId_period: { teamId: id, athleteId, period } },
    update: { scores, note },
    create: { teamId: id, athleteId, period, scores, note },
  });
  return ok({ athleteId, period });
}
