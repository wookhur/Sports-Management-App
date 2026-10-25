import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { ok, fail } from "@/lib/api";
import { failT, failIssue } from "@/lib/apiText";
import { teamRole, teamTimeZone } from "@/lib/teamAccess";
import { isDayKey, mondayOf, schoolYearOf } from "@/lib/season";
import { weeksFor } from "@/lib/soccerSeasonPlan";
import { getLang } from "@/lib/getLang";
import { dayKeyIn } from "@/lib/format";

const weekSchema = z.object({
  weekStart: z.string().refine(isDayKey, "pickDate"),
  unit: z.string().trim().min(1, "addUnit").max(80),
  objective: z.string().trim().min(1, "addObjective").max(300),
  note: z.string().trim().max(300).optional(),
});

const loadSchema = z.object({
  template: z.literal("soccer-season"),
  year: z.number().int().min(2020).max(2100).optional(),
});

async function ownerOnly(id: string) {
  const session = await getSession();
  if (!session) return { error: await failT("signIn", 401) };
  if ((await teamRole(id, session.userId)) !== "owner") return { error: await failT("teamNotFound", 404) };
  return { session };
}

/**
 * Load the ready-made season plan into the team.
 *
 * Weeks the coach has already written are kept: the template only fills the
 * weeks that are still empty, so loading it twice, or after editing, never
 * overwrites anything.
 */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { error } = await ownerOnly(id);
  if (error) return error;

  const parsed = loadSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return await failIssue(parsed.error.issues);

  const team = await prisma.team.findUnique({ where: { id }, select: { timeZone: true } });
  const year = parsed.data.year ?? schoolYearOf(dayKeyIn(teamTimeZone(team ?? { timeZone: null })));
  const weeks = weeksFor(year, await getLang());
  const { count } = await prisma.teamPlanWeek.createMany({
    data: weeks.map((w) => ({ teamId: id, ...w })),
    skipDuplicates: true,
  });
  return ok({ year, added: count, kept: weeks.length - count }, 201);
}

/** Write one week of the plan. */
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { error } = await ownerOnly(id);
  if (error) return error;

  const parsed = weekSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return await failIssue(parsed.error.issues);

  const weekStart = mondayOf(parsed.data.weekStart);
  const data = { unit: parsed.data.unit, objective: parsed.data.objective, note: parsed.data.note || null };
  const week = await prisma.teamPlanWeek.upsert({
    where: { teamId_weekStart: { teamId: id, weekStart } },
    update: data,
    create: { teamId: id, weekStart, ...data },
  });
  return ok({ weekStart: week.weekStart });
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { error } = await ownerOnly(id);
  if (error) return error;

  const weekStart = new URL(req.url).searchParams.get("weekStart") ?? "";
  if (!isDayKey(weekStart)) return await failT("pickDate");
  await prisma.teamPlanWeek.deleteMany({ where: { teamId: id, weekStart } });
  return ok({ weekStart });
}
