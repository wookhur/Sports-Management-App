import "server-only";
import { prisma } from "./db";
import { hashPassword } from "./auth";
import { sendMail, appUrl } from "./mailer";
import { resolveLang, t, type Lang } from "./i18n";
import { createResetToken, hashResetToken } from "./passwordResetToken";
import {
  isRateLimited,
  resetUrl,
  tokenState,
  RESET_TTL_MINUTES,
  RESET_WINDOW_MINUTES,
  type TokenState,
} from "./passwordReset";

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function resetEmail(name: string, url: string, lang: Lang) {
  const s = t(lang).reset;
  return {
    subject: s.mailSubject,
    text: [s.mailGreeting(name), "", s.mailBody(RESET_TTL_MINUTES), "", url, "", s.mailIgnore].join("\n"),
    html: `<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${esc(
      s.mailSubject,
    )}</title></head>
<body style="margin:0;background:#f8fafc;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;"><tr><td align="center" style="padding:24px 12px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#fff;border:1px solid #e2e8f0;border-radius:14px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;">
    <tr><td style="padding:20px 24px;background:#0f766e;border-radius:13px 13px 0 0;">
      <div style="font-size:18px;font-weight:700;color:#fff;">Sideline365</div>
    </td></tr>
    <tr><td style="padding:24px;">
      <p style="margin:0 0 6px;font-size:15px;font-weight:600;color:#0f172a;">${esc(s.mailGreeting(name))}</p>
      <p style="margin:0 0 20px;font-size:14px;line-height:1.6;color:#475569;">${esc(s.mailBody(RESET_TTL_MINUTES))}</p>
      <p style="margin:0 0 20px;" align="center">
        <a href="${esc(url)}" style="display:inline-block;background:#0f766e;color:#fff;text-decoration:none;font-size:14px;font-weight:700;padding:12px 24px;border-radius:10px;">${esc(s.mailCta)}</a>
      </p>
      <p style="margin:0;font-size:12px;line-height:1.6;color:#94a3b8;">${esc(s.mailIgnore)}</p>
    </td></tr>
  </table>
</td></tr></table></body></html>`,
  };
}

/**
 * Start a reset.
 *
 * Always resolves the same way regardless of whether the address exists: this
 * endpoint must not become a way to find out who has an account. Rate limiting
 * is per address so nobody can be mail-bombed through it.
 */
export async function requestPasswordReset(email: string): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase().trim() },
    select: { id: true, name: true, email: true, lang: true },
  });
  if (!user) return;

  const since = new Date(Date.now() - RESET_WINDOW_MINUTES * 60_000);
  const recent = await prisma.passwordResetToken.findMany({
    where: { userId: user.id, createdAt: { gt: since } },
    select: { createdAt: true },
  });
  if (isRateLimited(recent.map((r) => r.createdAt))) return;

  const { token, tokenHash, expiresAt } = createResetToken();
  await prisma.passwordResetToken.create({ data: { userId: user.id, tokenHash, expiresAt } });

  const lang = resolveLang(user.lang ?? undefined);
  await sendMail({ to: user.email, ...resetEmail(user.name, resetUrl(appUrl(), token), lang) });
}

export async function checkResetToken(token: string): Promise<TokenState> {
  const row = await prisma.passwordResetToken.findUnique({
    where: { tokenHash: hashResetToken(token) },
    select: { tokenHash: true, expiresAt: true, usedAt: true },
  });
  return tokenState(row);
}

/**
 * Consume a token and set the new password.
 *
 * The password update and the "mark used" happen in one transaction, and every
 * other outstanding token for that user is burned at the same time — links
 * still sitting in the mailbox stop working the moment one is spent.
 */
export async function consumeResetToken(
  token: string,
  newPassword: string,
): Promise<{ ok: true } | { ok: false; state: TokenState }> {
  const row = await prisma.passwordResetToken.findUnique({
    where: { tokenHash: hashResetToken(token) },
    select: { id: true, userId: true, tokenHash: true, expiresAt: true, usedAt: true },
  });

  const state = tokenState(row);
  if (state !== "valid" || !row) return { ok: false, state };

  const hashed = await hashPassword(newPassword);
  await prisma.$transaction([
    prisma.user.update({ where: { id: row.userId }, data: { password: hashed } }),
    prisma.passwordResetToken.updateMany({
      where: { userId: row.userId, usedAt: null },
      data: { usedAt: new Date() },
    }),
  ]);
  return { ok: true };
}
