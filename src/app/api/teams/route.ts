import { z } from "zod";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { ok, fail } from "@/lib/api";

const schema = z.object({ name: z.string().min(2, "팀 이름을 입력하세요").max(40) });

// Unambiguous alphabet (no 0/O or 1/I) so codes are easy to read aloud.
const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function makeCode(): string {
  const bytes = randomBytes(6);
  return [...bytes].map((b) => CODE_ALPHABET[b % CODE_ALPHABET.length]).join("");
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return fail("로그인이 필요합니다", 401);
  if (session.role !== "COACH") return fail("코치만 팀을 만들 수 있습니다", 403);

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "잘못된 요청입니다");

  // Retry on the (astronomically unlikely) code collision.
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const team = await prisma.team.create({
        data: { name: parsed.data.name.trim(), code: makeCode(), coachId: session.userId },
      });
      return ok({ id: team.id, code: team.code }, 201);
    } catch (e: unknown) {
      const unique = typeof e === "object" && e !== null && (e as { code?: string }).code === "P2002";
      if (!unique || attempt === 2) throw e;
    }
  }
  return fail("팀을 만들지 못했습니다");
}
