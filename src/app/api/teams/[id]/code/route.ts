import { randomBytes } from "crypto";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { ok, fail } from "@/lib/api";

// Unambiguous alphabet (no 0/O or 1/I) so codes are easy to read aloud.
const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function makeCode(): string {
  const bytes = randomBytes(6);
  return [...bytes].map((b) => CODE_ALPHABET[b % CODE_ALPHABET.length]).join("");
}

/**
 * Issue a new invite code, retiring the old one.
 *
 * A code is meant to be passed around, and one day it will be passed around
 * too far — pasted into a public group, printed on a flyer that outlives the
 * season. The only fix is a new code. Existing members are unaffected; only
 * *joining* needs the current code.
 */
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return fail("Sign in to continue", 401);

  const { id } = await params;
  const team = await prisma.team.findUnique({ where: { id }, select: { coachId: true } });
  if (!team || team.coachId !== session.userId) return fail("Team not found", 404);

  // Retry on the (astronomically unlikely) code collision.
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const updated = await prisma.team.update({ where: { id }, data: { code: makeCode() } });
      return ok({ id: updated.id, code: updated.code });
    } catch (e: unknown) {
      const unique = typeof e === "object" && e !== null && (e as { code?: string }).code === "P2002";
      if (!unique || attempt === 2) throw e;
    }
  }
  return fail("Couldn't issue a new code");
}
