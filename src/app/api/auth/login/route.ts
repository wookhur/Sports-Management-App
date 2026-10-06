import { z } from "zod";
import { verifyPassword, createSession } from "@/lib/auth";
import { ok, fail } from "@/lib/api";
import { usersByEmail } from "@/lib/email";
import { getLang } from "@/lib/getLang";
import type { Lang } from "@/lib/i18n";

// Spaces around the address are a typo, not a different address; the format
// check runs on what is left.
const schema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});

const MSG: Record<Lang, { invalid: string; noMatch: string }> = {
  ko: { invalid: "이메일과 비밀번호를 확인하세요", noMatch: "이메일 또는 비밀번호가 올바르지 않습니다" },
  en: { invalid: "Check your email and password.", noMatch: "That email and password don't match an account." },
  es: { invalid: "Revisa tu correo y tu contraseña.", noMatch: "Ese correo y esa contraseña no coinciden con ninguna cuenta." },
};

export async function POST(req: Request) {
  const m = MSG[await getLang()];
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (parsed.success === false) return fail(m.invalid);

  const { email, password } = parsed.data;
  // Case-insensitive, and if two old accounts differ only in case, the one
  // whose password this is.
  for (const user of await usersByEmail(email)) {
    if (await verifyPassword(password, user.password)) {
      await createSession({ userId: user.id, role: user.role, name: user.name });
      return ok({ id: user.id, name: user.name, role: user.role });
    }
  }
  // One message for "no such account" and "wrong password": telling them
  // apart would let anyone check which addresses are registered.
  return fail(m.noMatch, 401);
}
