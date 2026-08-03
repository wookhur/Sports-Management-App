// In-app notifications — kinds and rendering rules.
//
// Pure and DB-free so the copy selection and ordering can be unit-tested;
// writing lives in notifyServer.ts.

export const NOTIFICATION_KINDS = [
  "connectionRequest",
  "connectionAccepted",
  "assignmentGiven",
  "recordComment",
] as const;

export type NotificationKind = (typeof NOTIFICATION_KINDS)[number];

export interface NotificationView {
  id: string;
  kind: string;
  data: Record<string, unknown>;
  href: string | null;
  read: boolean;
  createdAt: string;
}

export function isNotificationKind(k: string): k is NotificationKind {
  return (NOTIFICATION_KINDS as readonly string[]).includes(k);
}

/** The name carried in a payload, defensively — never renders "undefined". */
export function actorName(data: Record<string, unknown>): string {
  const n = data?.name;
  return typeof n === "string" && n.trim() ? n : "—";
}

/** Unread first, then newest — the order someone actually wants to read them. */
export function sortNotifications<T extends { read: boolean; createdAt: string }>(items: T[]): T[] {
  return [...items].sort(
    (a, b) => Number(a.read) - Number(b.read) || (a.createdAt < b.createdAt ? 1 : -1),
  );
}
