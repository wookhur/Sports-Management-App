import { prisma } from "./db";

// Email addresses are matched without regard to case or surrounding spaces.
//
// Phones capitalise the first letter of a text field, so the same person
// types "Yeonju@…" on one device and "yeonju@…" on another. The database's
// unique index is case-sensitive and sign-up used to store whatever was
// typed, so an exact lookup told someone with the right password that their
// account didn't exist. New accounts are stored lower-cased; older ones may
// not be, which is why lookups ignore case rather than lower-casing the input
// and hoping the stored value matches.

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Every account whose address matches, ignoring case. Usually one; more only
 * where two accounts were created before addresses were normalised, and the
 * caller decides which is meant (login: the one whose password matches).
 */
export function usersByEmail(email: string) {
  return prisma.user.findMany({
    where: { email: { equals: normalizeEmail(email), mode: "insensitive" } },
    orderBy: { createdAt: "asc" },
  });
}
