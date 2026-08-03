import { z } from "zod";
import { ok, fail } from "@/lib/api";
import { consumeResetToken } from "@/lib/passwordResetServer";
import { MIN_PASSWORD_LENGTH } from "@/lib/passwordReset";

const schema = z.object({
  token: z.string().min(1),
  password: z.string().min(MIN_PASSWORD_LENGTH),
});

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return fail("tooShort");

  const result = await consumeResetToken(parsed.data.token, parsed.data.password);
  // A bare state key; the client maps it to copy so the server stays
  // language-agnostic.
  if (!result.ok) return fail(result.state, 400);
  return ok({ ok: true });
}
