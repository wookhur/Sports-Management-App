// Password reset — rules and constants.
//
// Deliberately free of node:crypto so client components can import the limits
// they display (minimum length, link lifetime); anything reachable from the
// browser bundle must not pull it in. Token minting lives in
// ./passwordResetToken, the querying in ./passwordResetServer.

/** How long a link stays valid. Long enough to find the email, short enough to matter. */
export const RESET_TTL_MINUTES = 60;
/** Requests allowed per address inside the window, to stop mailbox flooding. */
export const RESET_MAX_PER_WINDOW = 3;
export const RESET_WINDOW_MINUTES = 15;
/** Matches the signup rule, so a reset can't set a weaker password. */
export const MIN_PASSWORD_LENGTH = 8;

export interface ResetTokenRow {
  tokenHash: string;
  expiresAt: Date;
  usedAt: Date | null;
}

export type TokenState = "valid" | "expired" | "used" | "unknown";

export function tokenState(row: ResetTokenRow | null, now = new Date()): TokenState {
  if (!row) return "unknown";
  // "Used" outranks "expired": a spent link must never look merely stale.
  if (row.usedAt) return "used";
  if (row.expiresAt.getTime() <= now.getTime()) return "expired";
  return "valid";
}

/** True once an address has asked too many times inside the window. */
export function isRateLimited(recentRequests: Date[], now = new Date()): boolean {
  const cutoff = now.getTime() - RESET_WINDOW_MINUTES * 60_000;
  return recentRequests.filter((d) => d.getTime() > cutoff).length >= RESET_MAX_PER_WINDOW;
}

export function passwordProblem(password: string): "tooShort" | null {
  return password.length < MIN_PASSWORD_LENGTH ? "tooShort" : null;
}

/** The link that goes in the email. */
export function resetUrl(appUrl: string, token: string): string {
  return `${appUrl.replace(/\/$/, "")}/reset/${encodeURIComponent(token)}`;
}
