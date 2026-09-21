import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { ok, fail } from "@/lib/api";

/** The coach takes a note down. Notifications already sent are left alone. */
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string; aid: string }> },
) {
  const session = await getSession();
  if (!session) return fail("Sign in to continue", 401);

  const { id, aid } = await params;
  const announcement = await prisma.teamAnnouncement.findUnique({
    where: { id: aid },
    select: { teamId: true, team: { select: { coachId: true } } },
  });
  if (!announcement || announcement.teamId !== id || announcement.team.coachId !== session.userId) {
    return fail("Announcement not found", 404);
  }
  await prisma.teamAnnouncement.delete({ where: { id: aid } });
  return ok({ id: aid });
}
