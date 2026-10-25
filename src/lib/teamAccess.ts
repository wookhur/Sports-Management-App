import { prisma } from "./db";

// Who can see and change a team's log. The coach who owns the team can change
// everything; members can read what is meant for them (the plan, results).
// Anyone else is told the team doesn't exist, so team ids can't be probed.

export async function teamRole(teamId: string, userId: string): Promise<"owner" | "member" | null> {
  const team = await prisma.team.findUnique({
    where: { id: teamId },
    select: { coachId: true, members: { where: { userId }, select: { id: true } } },
  });
  if (!team) return null;
  if (team.coachId === userId) return "owner";
  return team.members.length > 0 ? "member" : null;
}

/** The ids of everyone on the team, for checking that a request only names members. */
export async function memberIds(teamId: string): Promise<Set<string>> {
  const rows = await prisma.teamMember.findMany({ where: { teamId }, select: { userId: true } });
  return new Set(rows.map((r) => r.userId));
}

export const DEFAULT_TEAM_TZ = "Asia/Seoul";

/** Time zones a coach can pick for a team. */
export const TEAM_TIME_ZONES = [
  "Asia/Seoul",
  "America/Mexico_City",
  "America/Los_Angeles",
  "America/Denver",
  "America/Chicago",
  "America/New_York",
  "America/Bogota",
  "America/Lima",
  "America/Santiago",
  "America/Argentina/Buenos_Aires",
  "Europe/Madrid",
  "Europe/London",
  "Asia/Tokyo",
  "Asia/Shanghai",
  "Asia/Singapore",
  "Australia/Sydney",
] as const;

export function teamTimeZone(team: { timeZone: string | null }): string {
  return team.timeZone ?? DEFAULT_TEAM_TZ;
}
