import { getSession } from "@/lib/auth";
import { ok, fail } from "@/lib/api";
import { listNotifications, markAllRead } from "@/lib/notifyServer";

export async function GET() {
  const session = await getSession();
  if (!session) return fail("로그인이 필요합니다", 401);
  return ok({ items: await listNotifications(session.userId) });
}

/** Mark everything read — called when the panel is opened. */
export async function POST() {
  const session = await getSession();
  if (!session) return fail("로그인이 필요합니다", 401);
  await markAllRead(session.userId);
  return ok({ ok: true });
}
