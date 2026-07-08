import { z } from "zod";
import { prisma } from "@/lib/db";
import { hashPassword, createSession } from "@/lib/auth";
import { ok, fail } from "@/lib/api";

const schema = z.object({
  name: z.string().min(1, "이름을 입력하세요").max(50),
  email: z.string().email("올바른 이메일을 입력하세요"),
  password: z.string().min(6, "비밀번호는 6자 이상이어야 합니다").max(100),
  role: z.enum(["ATHLETE", "COACH"]),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "잘못된 요청입니다");
  }
  const { name, email, password, role } = parsed.data;

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return fail("이미 가입된 이메일입니다", 409);

    const user = await prisma.user.create({
      data: { name, email, password: await hashPassword(password), role },
    });

    await createSession({ userId: user.id, role: user.role, name: user.name });
    return ok({ id: user.id, name: user.name, role: user.role }, 201);
  } catch (err) {
    // Most commonly a database connection/setup failure (e.g. SQLite is not
    // available on a serverless host). Return JSON so the client shows a real
    // error instead of hanging on an unparseable HTML 500 page.
    console.error("[signup] unexpected error", err);
    return fail("서버 오류로 가입하지 못했습니다. 데이터베이스 설정을 확인하세요.", 500);
  }
}
