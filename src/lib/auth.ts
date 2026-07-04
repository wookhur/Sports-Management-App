import "server-only";
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { prisma } from "./db";

const COOKIE_NAME = "smapp_session";
const secret = new TextEncoder().encode(
  process.env.AUTH_SECRET ?? "insecure-dev-secret-please-set-AUTH_SECRET"
);

export interface SessionPayload {
  userId: string;
  role: "ATHLETE" | "COACH";
  name: string;
}

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

async function signToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

// Cookie options. We use SameSite=None + Secure so the session survives when
// the app is embedded in a cross-site iframe (e.g. a hosted preview). Browsers
// treat localhost as a secure context, so this also works in local dev.
// Set COOKIE_INSECURE=1 only if you must run over plain HTTP on a non-localhost
// host (falls back to SameSite=Lax, which won't work inside a cross-site frame).
const insecure = process.env.COOKIE_INSECURE === "1";
const cookieOptions = {
  httpOnly: true,
  secure: !insecure,
  sameSite: insecure ? ("lax" as const) : ("none" as const),
  // CHIPS: a partitioned cookie is stored per top-level site, so it survives
  // third-party-cookie blocking when the app is embedded in a cross-site
  // iframe (e.g. a hosted preview). Without this the session is dropped.
  partitioned: !insecure,
  path: "/",
};

/** Create the session cookie for a user. */
export async function createSession(payload: SessionPayload): Promise<void> {
  const token = await signToken(payload);
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    ...cookieOptions,
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, "", { ...cookieOptions, maxAge: 0 });
}

/** Read + verify the session cookie. Returns null when not signed in. */
export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    return {
      userId: payload.userId as string,
      role: payload.role as "ATHLETE" | "COACH",
      name: payload.name as string,
    };
  } catch {
    return null;
  }
}

/** Full user record for the current session, or null. */
export async function getCurrentUser() {
  const session = await getSession();
  if (!session) return null;
  return prisma.user.findUnique({ where: { id: session.userId } });
}
