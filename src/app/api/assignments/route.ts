import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { ok, fail } from "@/lib/api";
import { notify } from "@/lib/notifyServer";

const schema = z
  .object({
    // Exactly one target: a single athlete, or a whole team at once.
    athleteId: z.string().min(1).optional(),
    teamId: z.string().min(1).optional(),
    title: z.string().min(2, "Give the assignment a name").max(120),
    note: z.string().max(500).optional(),
    // In-app path only (e.g. /training, /sports/swimming/workouts/123) — no
    // external URLs, so assignments can't be used to send athletes off-site.
    linkHref: z
      .string()
      .max(300)
      .refine(
        (v) => v === "" || (v.startsWith("/") && !v.startsWith("//")),
        "Links must be in-app paths starting with /",
      )
      .optional(),
    dueDate: z.string().datetime().optional(),
  })
  .refine((v) => Boolean(v.athleteId) !== Boolean(v.teamId), {
    message: "Pick either one athlete or one team",
  });

/** Who the assignment lands on, or why it can't. */
type Targets = { athleteIds: string[] } | { error: string; status: 400 | 403 | 404 };

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return fail("Sign in to continue", 401);
  if (session.role !== "COACH") return fail("Only coaches can set assignments", 403);

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid request");

  const { athleteId, teamId, title, note, linkHref, dueDate } = parsed.data;

  // The schema guarantees exactly one of the two is set; this re-states it in a
  // form the compiler can follow.
  const targets: Targets = teamId
    ? await teamTargets(teamId, session.userId)
    : athleteId
      ? await soloTarget(athleteId, session.userId)
      : { error: "Pick either one athlete or one team", status: 400 };
  if ("error" in targets) return fail(targets.error, targets.status);

  const common = {
    coachId: session.userId,
    title,
    note: note?.trim() || null,
    linkHref: linkHref?.trim() || null,
    dueDate: dueDate ? new Date(dueDate) : null,
  };
  await prisma.assignment.createMany({
    data: targets.athleteIds.map((id) => ({ ...common, athleteId: id })),
  });
  await Promise.all(
    targets.athleteIds.map((id) => notify(id, "assignmentGiven", { name: session.name }, "/")),
  );
  return ok({ count: targets.athleteIds.length }, 201);
}

/** One athlete — allowed only where the coach and athlete are connected. */
async function soloTarget(athleteId: string, coachId: string): Promise<Targets> {
  const link = await prisma.coachAthlete.findUnique({
    where: { coachId_athleteId: { coachId, athleteId } },
  });
  if (link?.status !== "ACCEPTED") {
    return { error: "You can only assign to athletes you're connected to", status: 403 };
  }
  return { athleteIds: [athleteId] };
}

/**
 * Every member of one of the coach's own teams.
 *
 * Membership is its own authorisation here, and deliberately so: an athlete
 * joins a team by typing that coach's invite code, which is a more explicit
 * opt-in than the coach adding them by email. Requiring an accepted connection
 * on top would silently skip half a squad, which is worse than either allowing
 * it or refusing it outright.
 */
async function teamTargets(teamId: string, coachId: string): Promise<Targets> {
  const team = await prisma.team.findUnique({
    where: { id: teamId },
    select: { coachId: true, members: { select: { userId: true } } },
  });
  if (!team || team.coachId !== coachId) return { error: "Team not found", status: 404 };
  if (team.members.length === 0) {
    return { error: "Nobody has joined this team yet", status: 400 };
  }
  return { athleteIds: team.members.map((m) => m.userId) };
}
