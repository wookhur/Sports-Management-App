import "server-only";
import { Prisma } from "@prisma/client";
import { prisma } from "./db";
import type { NotificationKind, NotificationView } from "./notify";
import { sortNotifications } from "./notify";

/** How many we show; older ones stay in the table but out of the way. */
export const NOTIFICATION_PAGE = 30;

/**
 * Record a notification.
 *
 * Never throws. These are always a side effect of something the user actually
 * asked for — accepting a connection, leaving a comment — and failing to write
 * the notification must not fail that action.
 */
export async function notify(
  userId: string,
  kind: NotificationKind,
  data: Record<string, unknown> = {},
  href?: string,
): Promise<void> {
  try {
    await prisma.notification.create({
      data: { userId, kind, data: data as Prisma.InputJsonValue, href: href ?? null },
    });
  } catch {
    // Intentionally swallowed — see above.
  }
}

export async function unreadCount(userId: string): Promise<number> {
  return prisma.notification.count({ where: { userId, readAt: null } });
}

export async function listNotifications(userId: string): Promise<NotificationView[]> {
  const rows = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: NOTIFICATION_PAGE,
  });
  return sortNotifications(
    rows.map((r) => ({
      id: r.id,
      kind: r.kind,
      data: (r.data ?? {}) as Record<string, unknown>,
      href: r.href,
      read: r.readAt !== null,
      createdAt: r.createdAt.toISOString(),
    })),
  );
}

export async function markAllRead(userId: string): Promise<void> {
  await prisma.notification.updateMany({
    where: { userId, readAt: null },
    data: { readAt: new Date() },
  });
}
