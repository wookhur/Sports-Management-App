import { z } from "zod";
import { prisma } from "@/lib/db";
import { hashPassword, createSession } from "@/lib/auth";
import { SPORT_LIST } from "@/lib/sports";
import { ok, fail } from "@/lib/api";

const sportIds = SPORT_LIST.map((s) => s.id) as [string, ...string[]];

const schema = z.object({
  username: z
    .string()
    .min(3, "아이디는 3자 이상이어야 합니다")
    .max(20, "아이디는 20자 이하여야 합니다")
    .regex(/^[a-zA-Z0-9_]+$/, "아이디는 영문/숫자/밑줄만 사용할 수 있습니다"),
  email: z.string().email("올바른 이메일을 입력하세요"),
  password: z.string().min(6, "비밀번호는 6자 이상이어야 합니다").max(100),
  role: z.enum(["ATHLETE", "COACH"]),
  school: z.string().max(100).optional(),
  sportInterests: z.array(z.enum(sportIds)).max(sportIds.length).optional(),
  experienceLevel: z.enum(["beginner", "intermediate", "advanced"]).optional(),
  dob: z.string().optional(),
  grade: z.string().max(50).optional(),
  // Optional in the schema so an older client, or any caller that omits it,
  // creates an account recorded as never asked rather than as declining.
  researchConsent: z.boolean().optional(),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "잘못된 요청입니다");
  }
  const { username, email, password, role, school, sportInterests, experienceLevel, dob, grade, researchConsent } =
    parsed.data;

  const [existingEmail, existingUsername] = await Promise.all([
    prisma.user.findUnique({ where: { email } }),
    prisma.user.findUnique({ where: { username } }),
  ]);
  if (existingEmail) return fail("이미 가입된 이메일입니다", 409);
  if (existingUsername) return fail("이미 사용 중인 아이디입니다", 409);

  const parsedDob = dob ? new Date(dob) : undefined;
  if (dob && Number.isNaN(parsedDob?.getTime())) return fail("생년월일 형식이 올바르지 않습니다");

  const user = await prisma.user.create({
    data: {
      name: username,
      username,
      email,
      password: await hashPassword(password),
      role,
      school: school || null,
      sportInterests: sportInterests ?? [],
      experienceLevel: experienceLevel ?? null,
      dob: parsedDob ?? null,
      grade: grade || null,
      // Both branches record the moment the choice was made — declining is an
      // answer too, and is worth being able to prove. Omitted entirely leaves
      // both columns null, which reads as "never asked".
      researchConsent: researchConsent ?? null,
      researchConsentAt: researchConsent === undefined ? null : new Date(),
      // The onboarding wizard itself explains the app, so there's no need
      // to also auto-show the post-login feature tour for these users.
      onboarded: true,
    },
  });

  await createSession({ userId: user.id, role: user.role, name: user.name });
  return ok({ id: user.id, name: user.name, role: user.role }, 201);
}
