import { test, expect } from "@playwright/test";
import { actorName, sortNotifications, isNotificationKind, NOTIFICATION_KINDS } from "../src/lib/notify";
import { t } from "../src/lib/i18n";

// The consent rules are enforced server-side and exercised against a real
// database; these cover the pure pieces around them.

test("every notification kind the app writes has copy in every language", () => {
  for (const lang of ["ko", "en", "es"] as const) {
    const lines = t(lang).notifications.line;
    for (const kind of NOTIFICATION_KINDS) {
      expect(typeof lines[kind], `${lang}/${kind}`).toBe("function");
      expect(lines[kind]("이름"), `${lang}/${kind}`).toContain("이름");
    }
  }
});

test("unknown kinds are rejected rather than rendered blank", () => {
  expect(isNotificationKind("connectionRequest")).toBe(true);
  expect(isNotificationKind("somethingFromTheFuture")).toBe(false);
});

test("a missing or malformed actor name never renders as undefined", () => {
  expect(actorName({})).toBe("—");
  expect(actorName({ name: "" })).toBe("—");
  expect(actorName({ name: "   " })).toBe("—");
  expect(actorName({ name: 42 })).toBe("—");
  expect(actorName({ name: "Clare" })).toBe("Clare");
});

test("unread sort above read, newest first inside each group", () => {
  const items = [
    { id: "old-read", read: true, createdAt: "2026-08-01T00:00:00Z" },
    { id: "new-read", read: true, createdAt: "2026-08-03T00:00:00Z" },
    { id: "old-unread", read: false, createdAt: "2026-08-01T00:00:00Z" },
    { id: "new-unread", read: false, createdAt: "2026-08-02T00:00:00Z" },
  ];
  expect(sortNotifications(items).map((i) => i.id)).toEqual([
    "new-unread",
    "old-unread",
    "new-read",
    "old-read",
  ]);
});

test("sorting does not mutate the caller's array", () => {
  const items = [
    { id: "a", read: true, createdAt: "2026-08-01T00:00:00Z" },
    { id: "b", read: false, createdAt: "2026-08-01T00:00:00Z" },
  ];
  const before = items.map((i) => i.id);
  sortNotifications(items);
  expect(items.map((i) => i.id)).toEqual(before);
});
