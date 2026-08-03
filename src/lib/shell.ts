// Data the app shell needs on every authenticated page.
//
// The sidebar's companion and the nav's unread badge are rendered on every
// page by two different components, so they were two sequential database round
// trips added to every single render.
//
// React's cache() memoises per request, so both callers share one fetch — and
// the two queries inside run together rather than one after the other. Anything
// else the shell grows should be added here rather than as a third trip.
//
// Per-request only: nothing is cached across requests, because beans and unread
// counts change from the user's own actions and a stale shell is worse than a
// cheap one.

import "server-only";
import { cache } from "react";
import { prisma } from "./db";

export interface ShellData {
  beans: number;
  petGrowth: number;
  unread: number;
}

export const getShellData = cache(async (userId: string): Promise<ShellData> => {
  const [user, unread] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { beans: true, petGrowth: true },
    }),
    prisma.notification.count({ where: { userId, readAt: null } }),
  ]);

  return {
    beans: user?.beans ?? 0,
    petGrowth: user?.petGrowth ?? 0,
    unread,
  };
});
