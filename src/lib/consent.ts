// Who counts as a minor at sign-up, and how that is decided.
//
// Anyone under 18 needs a parent or guardian to consent before an account
// is created. The birth date decides when it was given; when it wasn't, the
// person is asked outright. Either way the answer is stored on the account
// (User.isMinor) along with when the guardian consented, so the fact of
// consent survives later edits to the profile.

export const MINOR_UNDER = 18;

/** Whole years between a birth date and now. */
export function ageOn(dob: Date, now: Date = new Date()): number {
  let age = now.getUTCFullYear() - dob.getUTCFullYear();
  const beforeBirthday =
    now.getUTCMonth() < dob.getUTCMonth() ||
    (now.getUTCMonth() === dob.getUTCMonth() && now.getUTCDate() < dob.getUTCDate());
  if (beforeBirthday) age -= 1;
  return age;
}

/** Null when there is no usable birth date to decide from. */
export function minorFromDob(dob: string | Date | null | undefined, now: Date = new Date()): boolean | null {
  if (!dob) return null;
  const d = typeof dob === "string" ? new Date(dob) : dob;
  if (Number.isNaN(d.getTime())) return null;
  return ageOn(d, now) < MINOR_UNDER;
}

/** Where the operator can be reached about personal data. Set PRIVACY_CONTACT to change it. */
export function privacyContact(): string {
  return process.env.NEXT_PUBLIC_PRIVACY_CONTACT || "wookhur@quantumadmissions.com";
}
