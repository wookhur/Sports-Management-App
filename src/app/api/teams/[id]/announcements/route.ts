import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { ok, fail } from "@/lib/api";
import { notify } from "@/lib/notifyServer";

const schema = z.object({ body: z.string().trim().min(1, "Write something first").max(1000) });

/**
 * Post a note to the whole team.
 *
 * Every member gets a notification pointing at the team page, where the note
 * lives. This is the first reason for a coach to talk to a squad inside the
 * app rather than in a chat group — and unlike a chat group, the note stays
 * next to the roster and the homework it's about.
 */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return fail("Sign in to continue", 401);

  const { id } = await params;
  const team = await prisma.team.findUnique({
    where: { id },
    select: { coachId: true, members: { select: { userId: true } } },
  });
  if (!team || team.coachId !== session.userId) return fail("Team not found", 404);

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid request");

  const announcement = await prisma.teamAnnouncement.create({
    data: { teamId: id, authorId: session.userId, body: parsed.data.body },
  });
  await Promise.all(
    team.members.map((m) =>
      notify(m.userId, "teamAnnouncement", { name: session.name }, `/teams/${id}`),
    ),
  );
  return ok({ id: announcement.id, notified: team.members.length }, 201);
}
