import { z } from "zod";
import { prisma } from "@/lib/db";
import { hashPassword, createSession } from "@/lib/auth";
import { SPORT_LIST } from "@/lib/sports";
import { ok, fail } from "@/lib/api";
import { failIssue, failT } from "@/lib/apiText";
import { minorFromDob } from "@/lib/consent";
import { sendGuardianNotice } from "@/lib/guardianEmail";
import { getLang } from "@/lib/getLang";
import { normalizeEmail, usersByEmail } from "@/lib/email";

const sportIds = SPORT_LIST.map((s) => s.id) as [string, ...string[]];

const schema = z.object({
  username: z
    .string()
    .min(3, "usernameShort")
    .max(20, "usernameLong")
    .regex(/^[a-zA-Z0-9_]+$/, "usernameChars"),
  email: z.string().trim().email("checkEmail"),
  password: z.string().min(6, "passwordShort").max(100),
  role: z.enum(["ATHLETE", "COACH"]),
  school: z.string().max(100).optional(),
  sportInterests: z.array(z.enum(sportIds)).max(sportIds.length).optional(),
  experienceLevel: z.enum(["beginner", "intermediate", "advanced"]).optional(),
  dob: z.string().optional(),
  grade: z.string().max(50).optional(),
  // Optional in the schema so an older client, or any caller that omits it,
  // creates an account recorded as never asked rather than as declining.
  researchConsent: z.boolean().optional(),
  // Required, and checked below rather than here so the message is ours.
  termsAccepted: z.boolean().optional(),
  // The person's own answer to "under 18?". Only consulted when there is no
  // birth date to decide from; a birth date always wins over this.
  minor: z.boolean().optional(),
  guardianName: z.string().trim().min(1).max(100).optional(),
  guardianEmail: z.string().trim().email("guardianEmail").optional(),
  guardianConsent: z.boolean().optional(),
});

const DUPLICATE: Record<"ko" | "en" | "es", { email: string; username: string }> = {
  ko: { email: "이미 가입된 이메일입니다", username: "이미 사용 중인 아이디입니다" },
  en: { email: "An account with this email already exists. Try logging in.", username: "That username is taken. Try another." },
  es: { email: "Ya existe una cuenta con este correo. Prueba a iniciar sesión.", username: "Ese nombre de usuario ya está en uso. Prueba otro." },
};

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return failIssue(parsed.error.issues);
  }
  const {
    username, email, password, role, school, sportInterests, experienceLevel, dob, grade, researchConsent,
    termsAccepted, minor, guardianName, guardianEmail, guardianConsent,
  } = parsed.data;

  if (termsAccepted !== true) return failT("acceptTerms");

  const lang = await getLang();
  const [existingEmail, existingUsername] = await Promise.all([
    usersByEmail(email),
    prisma.user.findUnique({ where: { username } }),
  ]);
  if (existingEmail.length) return fail(DUPLICATE[lang].email, 409);
  if (existingUsername) return fail(DUPLICATE[lang].username, 409);

  const parsedDob = dob ? new Date(dob) : undefined;
  if (dob && Number.isNaN(parsedDob?.getTime())) return failT("badDob");

  // Under 18 by birth date when we have one, otherwise by their own answer.
  // No answer at all is refused: an account for a child must never be
  // created on the assumption that they are an adult.
  const isMinor = minorFromDob(parsedDob ?? null) ?? minor;
  if (isMinor === undefined) return failT("tellMinor");
  if (isMinor && !(guardianName && guardianEmail && guardianConsent === true)) {
    return failT("parentConsent");
  }
  const now = new Date();

  const user = await prisma.user.create({
    data: {
      name: username,
      username,
      // Stored lower-cased so the address matches however it is typed later.
      email: normalizeEmail(email),
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
      researchConsentAt: researchConsent === undefined ? null : now,
      termsAcceptedAt: now,
      isMinor,
      guardianName: isMinor ? guardianName : null,
      guardianEmail: isMinor ? guardianEmail : null,
      guardianConsentAt: isMinor ? now : null,
      // The onboarding wizard itself explains the app, so there's no need
      // to also auto-show the post-login feature tour for these users.
      onboarded: true,
    },
  });

  await createSession({ userId: user.id, role: user.role, name: user.name });

  if (isMinor && guardianName && guardianEmail) {
    // The guardian's copy. The consent itself is already on the row above;
    // this is a courtesy that must not hold up or fail the sign-up.
    void sendGuardianNotice({ lang, guardianName, guardianEmail, childName: user.name, childEmail: email });
  }
  return ok({ id: user.id, name: user.name, role: user.role }, 201);
}
