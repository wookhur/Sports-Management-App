// Password reset — token minting.
//
// A reset link is a bearer credential: whoever holds it can take the account.
// So the token is 32 random bytes (nothing derived from the user), and only its
// SHA-256 is stored — a database leak cannot be replayed into account takeover.

import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { RESET_TTL_MINUTES } from "./passwordReset";

/** A fresh token: the plaintext goes in the email, the hash into the database. */
export function createResetToken(): { token: string; tokenHash: string; expiresAt: Date } {
  const token = randomBytes(32).toString("base64url");
  return {
    token,
    tokenHash: hashResetToken(token),
    expiresAt: new Date(Date.now() + RESET_TTL_MINUTES * 60_000),
  };
}

export function hashResetToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/**
 * Constant-time comparison of two token hashes. Lookup is by hash so the
 * database does the matching, but where application code compares we do it
 * without leaking length or content through timing.
 */
export function hashesMatch(a: string, b: string): boolean {
  const ab = Buffer.from(a, "utf8");
  const bb = Buffer.from(b, "utf8");
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}
