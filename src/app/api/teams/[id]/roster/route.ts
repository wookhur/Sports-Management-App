import { z } from "zod";
import { randomBytes, randomUUID } from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { ok, fail } from "@/lib/api";
import { failT, failIssue } from "@/lib/apiText";
import { teamRole } from "@/lib/teamAccess";

const schema = z.object({
  names: z.array(z.string().trim().min(1).max(60, "nameTooLong")).min(1, "addName").max(60, "tooManyNames"),
});

/**
 * Put players on the roster by name, without accounts.
 *
 * Each one is a real user row so attendance, matches and evaluations work the
 * same for them as for anyone, but marked `managed`: the address is in the
 * reserved .invalid domain, which no mail is ever delivered to and no one can
 * type into the login form and own, and the password is random and thrown
 * away. Login and password reset skip managed rows as well.
 */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return await failT("signIn", 401);
  const { id } = await params;
  if ((await teamRole(id, session.userId)) !== "owner") return await failT("teamNotFound", 404);

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return await failIssue(parsed.error.issues);

  const password = await bcrypt.hash(randomBytes(32).toString("hex"), 10);
  const created = await prisma.$transaction(
    parsed.data.names.map((name) =>
      prisma.user.create({
        data: {
          name,
          email: `player-${randomUUID()}@roster.invalid`,
          password,
          role: "ATHLETE",
          onboarded: true,
          managed: true,
          teamMemberships: { create: { teamId: id } },
        },
        select: { id: true },
      }),
    ),
  );
  return ok({ added: created.length }, 201);
}
