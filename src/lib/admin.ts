import { prisma } from "./db";
import { normalizeEmail } from "./email";

/**
 * The operators allowed to see the site-wide overview (/admin), which lists
 * the newest accounts with their email addresses. Anyone can sign up as a
 * coach, so being a coach is not enough: the operators are named in the
 * ADMIN_EMAILS environment variable (comma separated). Unset means nobody.
 */
function adminEmails(): Set<string> {
  return new Set(
    (process.env.ADMIN_EMAILS ?? "")
      .split(",")
      .map((e) => normalizeEmail(e))
      .filter(Boolean),
  );
}

export async function isAdmin(userId: string): Promise<boolean> {
  const allowed = adminEmails();
  if (allowed.size === 0) return false;
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { email: true } });
  return !!user && allowed.has(normalizeEmail(user.email));
}
