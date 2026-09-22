import { prisma } from "./db";

export const CUSTOM_DRILL_MAX_BYTES = 2 * 1024 * 1024;
export const CUSTOM_DRILL_TYPES = ["image/png", "image/jpeg"] as const;

/** A custom drill as the pages show it: everything but the pixels. */
export interface CustomDrillRow {
  id: string;
  ownerId: string;
  ownerName: string;
  sport: string;
  title: string;
  description: string | null;
  ageLevels: string[];
  durationMin: number | null;
  width: number;
  height: number;
  createdAt: Date;
}

const rowSelect = {
  id: true,
  ownerId: true,
  sport: true,
  title: true,
  description: true,
  ageLevels: true,
  durationMin: true,
  width: true,
  height: true,
  createdAt: true,
  owner: { select: { name: true } },
} as const;

type Selected = {
  id: string;
  ownerId: string;
  sport: string;
  title: string;
  description: string | null;
  ageLevels: string[];
  durationMin: number | null;
  width: number;
  height: number;
  createdAt: Date;
  owner: { name: string };
};

function toRow(d: Selected): CustomDrillRow {
  const { owner, ...rest } = d;
  return { ...rest, ownerName: owner.name };
}

/**
 * Whose drills this person can see: their own, and those of everyone on a
 * team they coach or play on, plus a linked coach or athlete.
 *
 * A drill is a team resource. A coach draws it, the squad sees it; an
 * athlete draws one, their coach and teammates see it. Nobody outside that
 * circle does, including other coaches on the platform.
 */
export async function drillCircle(userId: string): Promise<string[]> {
  const [teams, links] = await Promise.all([
    prisma.team.findMany({
      where: { OR: [{ coachId: userId }, { members: { some: { userId } } }] },
      select: { coachId: true, members: { select: { userId: true } } },
    }),
    prisma.coachAthlete.findMany({
      where: { status: "ACCEPTED", OR: [{ coachId: userId }, { athleteId: userId }] },
      select: { coachId: true, athleteId: true },
    }),
  ]);
  const ids = new Set<string>([userId]);
  for (const t of teams) {
    ids.add(t.coachId);
    for (const m of t.members) ids.add(m.userId);
  }
  for (const l of links) {
    ids.add(l.coachId);
    ids.add(l.athleteId);
  }
  return [...ids];
}

export async function visibleDrills(userId: string, sport: string): Promise<CustomDrillRow[]> {
  const circle = await drillCircle(userId);
  const rows = await prisma.customDrill.findMany({
    where: { sport, ownerId: { in: circle } },
    select: rowSelect,
    orderBy: { createdAt: "desc" },
  });
  return rows.map(toRow);
}

/** One drill, or null when it doesn't exist or this person may not see it. */
export async function visibleDrill(userId: string, id: string): Promise<CustomDrillRow | null> {
  const row = await prisma.customDrill.findUnique({ where: { id }, select: rowSelect });
  if (!row) return null;
  if (row.ownerId !== userId && !(await drillCircle(userId)).includes(row.ownerId)) return null;
  return toRow(row);
}

/**
 * Pixel size straight from the file header, so the stored width and height
 * are the image's own and not whatever the client claimed.
 */
export function imageSize(bytes: Uint8Array, type: string): { width: number; height: number } | null {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  if (type === "image/png") {
    if (bytes.length < 24 || view.getUint32(0) !== 0x89504e47) return null;
    return { width: view.getUint32(16), height: view.getUint32(20) };
  }
  if (type === "image/jpeg") {
    if (bytes.length < 4 || bytes[0] !== 0xff || bytes[1] !== 0xd8) return null;
    let i = 2;
    while (i + 9 < bytes.length) {
      if (bytes[i] !== 0xff) return null;
      const marker = bytes[i + 1];
      // Start-of-frame markers carry the dimensions (all but DHT/JPG/DAC).
      if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
        return { height: view.getUint16(i + 5), width: view.getUint16(i + 7) };
      }
      i += 2 + view.getUint16(i + 2);
    }
  }
  return null;
}
