import { test, expect } from "@playwright/test";
import {
  tokenState,
  isRateLimited,
  passwordProblem,
  resetUrl,
  RESET_MAX_PER_WINDOW,
  RESET_WINDOW_MINUTES,
  MIN_PASSWORD_LENGTH,
} from "../src/lib/passwordReset";
import { createResetToken, hashResetToken, hashesMatch } from "../src/lib/passwordResetToken";

// A reset link is a bearer credential for somebody's account, so these are the
// rules that stop it becoming a way in.

const NOW = new Date("2026-08-03T09:00:00Z");
const ago = (min: number) => new Date(NOW.getTime() - min * 60_000);
const ahead = (min: number) => new Date(NOW.getTime() + min * 60_000);

test("tokens are unpredictable and never repeat", () => {
  const seen = new Set(Array.from({ length: 200 }, () => createResetToken().token));
  expect(seen.size).toBe(200);
  expect([...seen][0].length).toBeGreaterThanOrEqual(40);
});

test("only the hash is stored, and it does not reveal the token", () => {
  const { token, tokenHash } = createResetToken();
  expect(tokenHash).not.toContain(token);
  expect(tokenHash).toMatch(/^[0-9a-f]{64}$/);
  expect(hashResetToken(token)).toBe(tokenHash);
});

test("two tokens never collide", () => {
  const a = createResetToken();
  const b = createResetToken();
  expect(a.tokenHash).not.toBe(b.tokenHash);
  expect(hashesMatch(a.tokenHash, b.tokenHash)).toBe(false);
  expect(hashesMatch(a.tokenHash, a.tokenHash)).toBe(true);
});

test("expiry is bounded to the stated lifetime", () => {
  const { expiresAt } = createResetToken();
  expect(expiresAt.getTime()).toBeGreaterThan(Date.now());
  expect(expiresAt.getTime()).toBeLessThanOrEqual(Date.now() + 61 * 60_000);
});

test("token state distinguishes valid, expired, used and unknown", () => {
  expect(tokenState({ tokenHash: "x", expiresAt: ahead(10), usedAt: null }, NOW)).toBe("valid");
  expect(tokenState({ tokenHash: "x", expiresAt: ago(1), usedAt: null }, NOW)).toBe("expired");
  expect(tokenState({ tokenHash: "x", expiresAt: ahead(10), usedAt: ago(5) }, NOW)).toBe("used");
  expect(tokenState(null, NOW)).toBe("unknown");
});

test("a spent link reads as used, not merely stale", () => {
  expect(tokenState({ tokenHash: "x", expiresAt: ahead(59), usedAt: ago(1) }, NOW)).toBe("used");
});

test("expiry is exclusive at the boundary", () => {
  expect(tokenState({ tokenHash: "x", expiresAt: NOW, usedAt: null }, NOW)).toBe("expired");
});

test("an address is rate limited once it hits the cap inside the window", () => {
  const inWindow = Array.from({ length: RESET_MAX_PER_WINDOW }, (_, i) => ago(i + 1));
  expect(isRateLimited(inWindow, NOW)).toBe(true);
  expect(isRateLimited(inWindow.slice(1), NOW)).toBe(false);
});

test("old requests leave the window instead of counting forever", () => {
  const stale = Array.from({ length: 10 }, () => ago(RESET_WINDOW_MINUTES + 1));
  expect(isRateLimited(stale, NOW)).toBe(false);
});

test("a reset cannot set a password weaker than signup allows", () => {
  expect(passwordProblem("a".repeat(MIN_PASSWORD_LENGTH - 1))).toBe("tooShort");
  expect(passwordProblem("a".repeat(MIN_PASSWORD_LENGTH))).toBeNull();
});

test("the emailed link is url-safe and points at the reset page", () => {
  const { token } = createResetToken();
  const url = resetUrl("https://example.test/", token);
  expect(url).toBe(`https://example.test/reset/${encodeURIComponent(token)}`);
  expect(() => new URL(url)).not.toThrow();
});
