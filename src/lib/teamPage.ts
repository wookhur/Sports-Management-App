import { notFound, redirect } from "next/navigation";
import { getSession } from "./auth";
import { prisma } from "./db";
import { getLang } from "./getLang";
import { dayKeyIn } from "./format";
import { teamTimeZone } from "./teamAccess";

/**
 * What every page of a team's log starts with: who is asking, in which
 * language, the team, and what "today" is where the team trains.
 *
 * `ownerOnly` pages (roster, evaluations, the season report) 404 for members,
 * the same as for strangers, so a player can't tell those pages exist.
 */
export async function loadTeamPage(id: string, opts: { ownerOnly?: boolean } = {}) {
  const session = await getSession();
  if (!session) redirect("/login");
  const lang = await getLang();
  const team = await prisma.team.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      coachId: true,
      category: true,
      branch: true,
      timeZone: true,
      coach: { select: { name: true } },
      members: { where: { userId: session.userId }, select: { id: true } },
    },
  });
  if (!team) notFound();
  const isOwner = team.coachId === session.userId;
  if (!isOwner && (opts.ownerOnly || team.members.length === 0)) notFound();
  return { session, lang, team, isOwner, today: dayKeyIn(teamTimeZone(team)) };
}

/** The team's players in roster order: shirt number, then name. */
export async function rosterOf(teamId: string) {
  const rows = await prisma.teamMember.findMany({
    where: { teamId },
    include: { user: { select: { id: true, name: true, managed: true } } },
  });
  return rows.sort(
    (a, b) => (a.number ?? 1e6) - (b.number ?? 1e6) || a.user.name.localeCompare(b.user.name),
  );
}
