import { z } from "zod";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { ok } from "@/lib/api";
import { failT, failIssue } from "@/lib/apiText";
import { TEAM_TIME_ZONES } from "@/lib/teamAccess";

const schema = z.object({
  name: z.string().trim().min(2, "shortTeamName").max(40, "invalid"),
  // The creating browser's zone; kept only if it is one the team settings offer.
  timeZone: z.string().max(64).optional(),
});

// Unambiguous alphabet (no 0/O or 1/I) so codes are easy to read aloud.
const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function makeCode(): string {
  const bytes = randomBytes(6);
  return [...bytes].map((b) => CODE_ALPHABET[b % CODE_ALPHABET.length]).join("");
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return failT("signIn", 401);
  if (session.role !== "COACH") return failT("onlyCoachTeam", 403);

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return failIssue(parsed.error.issues);
  const tz = parsed.data.timeZone;
  const timeZone = tz && (TEAM_TIME_ZONES as readonly string[]).includes(tz) ? tz : null;

  // Retry on the (astronomically unlikely) code collision.
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const team = await prisma.team.create({
        data: { name: parsed.data.name, code: makeCode(), coachId: session.userId, timeZone },
      });
      return ok({ id: team.id, code: team.code }, 201);
    } catch (e: unknown) {
      const unique = typeof e === "object" && e !== null && (e as { code?: string }).code === "P2002";
      if (!unique || attempt === 2) throw e;
    }
  }
  return failT("createTeamFailed");
}
