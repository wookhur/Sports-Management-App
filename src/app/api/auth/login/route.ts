import { z } from "zod";
import { prisma } from "@/lib/db";
import { verifyPassword, createSession } from "@/lib/auth";
import { ok, fail } from "@/lib/api";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return fail("이메일과 비밀번호를 확인하세요");

  const { email, password } = parsed.data;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await verifyPassword(password, user.password))) {
    return fail("이메일 또는 비밀번호가 올바르지 않습니다", 401);
  }

  await createSession({ userId: user.id, role: user.role, name: user.name });
  return ok({ id: user.id, name: user.name, role: user.role });
}
