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

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await verifyPassword(password, user.password))) {
      return fail("이메일 또는 비밀번호가 올바르지 않습니다", 401);
    }

    await createSession({ userId: user.id, role: user.role, name: user.name });
    return ok({ id: user.id, name: user.name, role: user.role });
  } catch (err) {
    // Most commonly a database connection/setup failure (e.g. SQLite is not
    // available on a serverless host). Return JSON so the client shows a real
    // error instead of hanging on an unparseable HTML 500 page.
    console.error("[login] unexpected error", err);
    return fail("서버 오류로 로그인하지 못했습니다. 데이터베이스 설정을 확인하세요.", 500);
  }
}
