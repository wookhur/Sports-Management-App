import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { ok, fail } from "@/lib/api";
import { failT, failIssue } from "@/lib/apiText";
import { teamRole } from "@/lib/teamAccess";
import { isDayKey } from "@/lib/season";

const text = (max: number) => z.string().trim().max(max).optional();

// Empty strings clear a field. The player's display name can be changed here
// only for roster-only players; people with accounts own their own name.
const schema = z.object({
  name: z.string().trim().min(1).max(60).optional(),
  number: z.union([z.number().int().min(0).max(999), z.null()]).optional(),
  birthDate: z.union([z.string().refine(isDayKey, "pickDate"), z.literal("")]).optional(),
  guardian1Name: text(80),
  guardian1Email: z.union([z.string().trim().email("checkEmail").max(120), z.literal("")]).optional(),
  guardian1Phone: text(40),
  guardian2Name: text(80),
  guardian2Email: z.union([z.string().trim().email("checkEmail").max(120), z.literal("")]).optional(),
  guardian2Phone: text(40),
});

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string; userId: string }> }) {
  const session = await getSession();
  if (!session) return await failT("signIn", 401);
  const { id, userId } = await params;
  if ((await teamRole(id, session.userId)) !== "owner") return await failT("teamNotFound", 404);

  const member = await prisma.teamMember.findUnique({
    where: { teamId_userId: { teamId: id, userId } },
    select: { id: true, user: { select: { managed: true } } },
  });
  if (!member) return await failT("notOnTeam", 404);

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return await failIssue(parsed.error.issues);
  const { name, ...fields } = parsed.data;

  const data: Record<string, string | number | null> = {};
  for (const [k, v] of Object.entries(fields)) if (v !== undefined) data[k] = v === "" ? null : v;
  await prisma.teamMember.update({ where: { id: member.id }, data });
  if (name && member.user.managed) await prisma.user.update({ where: { id: userId }, data: { name } });
  return ok({ userId });
}
