import { getSession } from "@/lib/auth";
import { ok, fail } from "@/lib/api";
import { failT } from "@/lib/apiText";
import { listNotifications, markAllRead } from "@/lib/notifyServer";

export async function GET() {
  const session = await getSession();
  if (!session) return failT("signIn", 401);
  return ok({ items: await listNotifications(session.userId) });
}

/** Mark everything read — called when the panel is opened. */
export async function POST() {
  const session = await getSession();
  if (!session) return failT("signIn", 401);
  await markAllRead(session.userId);
  return ok({ ok: true });
}
