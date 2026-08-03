import { z } from "zod";
import { ok } from "@/lib/api";
import { requestPasswordReset } from "@/lib/passwordResetServer";

const schema = z.object({ email: z.string().email() });

/**
 * Start a password reset.
 *
 * Always answers 200 — unknown address, rate limited, or malformed alike.
 * Anything else turns this into an oracle for "does this person have an
 * account here", and for a school app that is a list of children.
 */
export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (parsed.success) await requestPasswordReset(parsed.data.email).catch(() => {});
  return ok({ ok: true });
}
