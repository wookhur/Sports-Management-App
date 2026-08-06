/**
 * Demo squad — data for showing the coach features to someone.
 *
 * The seeded coach has one athlete who has never logged anything, so every
 * headline feature correctly renders its empty state: a blank heatmap, a
 * zeroed report, "nothing to send this week". Accurate, and a terrible
 * demonstration of what the app is for.
 *
 * This builds a squad that exercises all of it. The shapes are chosen so each
 * triage bucket appears at least once — a load spike, someone who stopped
 * logging, a plateau, and two athletes who just set a personal best — because
 * a screenshot where everything is green says nothing about what the app
 * notices.
 *
 * Names are deliberately, obviously fake. This is a school product; demo rows
 * must never be mistaken for real children.
 *
 * Safe to re-run: everything is upserted or replaced, keyed on the demo email
 * addresses. Worth re-running before a demo, in fact — all the dates are
 * relative to today, so "set a personal best this week" goes stale otherwise.
 *
 *   npm run db:demo          # populate / refresh
 *   npm run db:demo -- --clean   # remove every demo athlete again
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

/** Which coach the squad attaches to. */
const COACH_EMAIL = "coach@example.com";
/** The seeded athlete, who has shared records but no training sessions. */
const SEEDED_ATHLETE_EMAIL = "athlete@example.com";
const DEMO_PREFIX = "demo.athlete";

const day = (n: number) => new Date(Date.now() - n * 86_400_000).toISOString().slice(0, 10);
const at = (n: number) => new Date(Date.now() - n * 86_400_000);

interface Session {
  day: string;
  minutes: number;
  intensity: number;
}

/** Trained every `every` days across `spanDays`, at a steady effort. */
function steady(spanDays: number, every: number, minutes: number, intensity: number, skipRecent = 0): Session[] {
  const out: Session[] = [];
  for (let d = spanDays; d >= skipRecent; d -= every) out.push({ day: day(d), minutes, intensity });
  return out;
}

type Shape =
  | "spike" // 🔴 quiet month, then a hard week — ACWR climbs past 1.5
  | "quiet" // 🟠 was training, then stopped
  | "plateau" // 🟡 training steadily, but the personal best is months old
  | "breakthrough" // 🟢 steady, and a personal best in the last few days
  | "solid"; // no flag — the squad needs athletes who are simply fine

interface DemoAthlete {
  name: string;
  shape: Shape;
}

// Nine athletes: enough that the heatmap reads as a squad rather than a list,
// and weighted so most are fine — a dashboard screaming at the coach about
// everyone would be the wrong impression too.
const SQUAD: DemoAthlete[] = [
  { name: "Demo Athlete 1", shape: "spike" },
  { name: "Demo Athlete 2", shape: "quiet" },
  { name: "Demo Athlete 3", shape: "plateau" },
  { name: "Demo Athlete 4", shape: "breakthrough" },
  { name: "Demo Athlete 5", shape: "breakthrough" },
  { name: "Demo Athlete 6", shape: "solid" },
  { name: "Demo Athlete 7", shape: "solid" },
  { name: "Demo Athlete 8", shape: "solid" },
  { name: "Demo Athlete 9", shape: "solid" },
];

function sessionsFor(shape: Shape, i: number): Session[] {
  switch (shape) {
    case "spike":
      // Three easy weeks build the chronic baseline, then a heavy week spikes
      // the acute load against it. Both halves are needed — a hard week alone
      // has nothing to look sudden against.
      return [...steady(27, 1, 25, 4).filter((s) => s.day <= day(7)), ...steady(6, 1, 130, 9)];
    case "quiet":
      // Enough history for the load engine to have had a baseline, then
      // nothing for twelve days.
      return steady(40, 1, 60, 6, 12);
    case "plateau":
    case "breakthrough":
      return steady(27, 2, 60, 6);
    case "solid":
      // Vary the volume so the heatmap has actual shading rather than one flat
      // tone across the whole squad.
      return steady(27, 2, 45 + ((i * 17) % 50), 5 + (i % 3));
  }
}

interface DemoRecord {
  ms: number;
  daysAgo: number;
  metricKey: string;
  metricName: string;
}

function recordsFor(shape: Shape, i: number): DemoRecord[] {
  const free50 = { metricKey: "freestyle_50m", metricName: "자유형 50m" };
  const free100 = { metricKey: "freestyle_100m", metricName: "자유형 100m" };
  switch (shape) {
    case "plateau":
      // One old best and nothing since — that is the whole point of the flag.
      return [{ ms: 31_200, daysAgo: 44, ...free50 }];
    case "breakthrough":
      return [
        { ms: 31_500, daysAgo: 40, ...free50 },
        { ms: 30_100 - i * 120, daysAgo: 2 + (i % 3), ...free50 },
        { ms: 64_800, daysAgo: 5, ...free100 },
      ];
    case "solid":
      return [
        { ms: 32_000 + i * 200, daysAgo: 30, ...free50 },
        { ms: 31_400 + i * 200, daysAgo: 11, ...free50 },
      ];
    default:
      return [{ ms: 33_000, daysAgo: 20, ...free50 }];
  }
}

async function clean(ids: string[]) {
  if (ids.length === 0) return;
  await prisma.trainingSession.deleteMany({ where: { userId: { in: ids } } });
  await prisma.record.deleteMany({ where: { userId: { in: ids } } });
  await prisma.coachAthlete.deleteMany({ where: { athleteId: { in: ids } } });
  await prisma.notification.deleteMany({ where: { userId: { in: ids } } });
  await prisma.assignment.deleteMany({ where: { athleteId: { in: ids } } });
  await prisma.missionClaim.deleteMany({ where: { userId: { in: ids } } });
}

async function main() {
  const removeOnly = process.argv.includes("--clean");

  const existing = await prisma.user.findMany({
    where: { email: { startsWith: DEMO_PREFIX } },
    select: { id: true },
  });
  const existingIds = existing.map((u) => u.id);

  if (removeOnly) {
    await clean(existingIds);
    await prisma.user.deleteMany({ where: { id: { in: existingIds } } });
    // The seeded athlete is not ours to delete — only the sessions we gave them.
    const seeded = await prisma.user.findUnique({ where: { email: SEEDED_ATHLETE_EMAIL } });
    if (seeded) {
      const days = steady(27, 2, 55, 6).map((s) => s.day);
      await prisma.trainingSession.deleteMany({ where: { userId: seeded.id, day: { in: days } } });
    }
    console.log(`[demo] removed ${existingIds.length} demo athletes.`);
    return;
  }

  const coach = await prisma.user.findUnique({ where: { email: COACH_EMAIL } });
  if (!coach) {
    console.error(`[demo] no coach at ${COACH_EMAIL} — run the seed first.`);
    process.exitCode = 1;
    return;
  }

  // Wipe the demo athletes' activity so re-running re-dates everything rather
  // than piling a second month on top of the first.
  await clean(existingIds);

  const password = await bcrypt.hash("password123", 10);
  let sessionCount = 0;
  let recordCount = 0;

  for (const [i, spec] of SQUAD.entries()) {
    const email = `${DEMO_PREFIX}${i + 1}@example.com`;
    const athlete = await prisma.user.upsert({
      where: { email },
      update: { name: spec.name },
      create: {
        email,
        name: spec.name,
        password,
        role: "ATHLETE",
        sportInterests: ["swimming"],
        onboarded: true,
      },
    });

    // Already consented: the coach is demonstrating their own squad, not the
    // request flow. /connections still shows how consent works.
    await prisma.coachAthlete.upsert({
      where: { coachId_athleteId: { coachId: coach.id, athleteId: athlete.id } },
      update: { status: "ACCEPTED", respondedAt: new Date() },
      create: {
        coachId: coach.id,
        athleteId: athlete.id,
        status: "ACCEPTED",
        requestedById: athlete.id,
        respondedAt: new Date(),
      },
    });

    const sessions = sessionsFor(spec.shape, i);
    await prisma.trainingSession.createMany({
      data: sessions.map((s) => ({
        userId: athlete.id,
        day: s.day,
        sport: "swimming",
        kind: "technique",
        minutes: s.minutes,
        intensity: s.intensity,
      })),
    });
    sessionCount += sessions.length;

    for (const r of recordsFor(spec.shape, i)) {
      await prisma.record.create({
        data: {
          userId: athlete.id,
          sport: "swimming",
          metricKey: r.metricKey,
          metricName: r.metricName,
          durationMs: r.ms,
          createdAt: at(r.daysAgo),
          // Shared, so the coach's feedback list has something in it.
          shared: true,
        },
      });
      recordCount += 1;
    }
  }

  // The seeded athlete shares records but logs no training, so the dashboard
  // flagged them "never logged anything" directly above their own shared
  // times. Both statements are true — records and training sessions are
  // different things — but side by side they read as a bug. Give them a
  // steady history so the squad's one non-demo member looks like a member.
  const seeded = await prisma.user.findUnique({ where: { email: SEEDED_ATHLETE_EMAIL } });
  if (seeded) {
    // Only ever the days this script writes, so re-running re-dates them
    // instead of stacking a second month on top.
    const days = steady(27, 2, 55, 6).map((s) => s.day);
    await prisma.trainingSession.deleteMany({ where: { userId: seeded.id, day: { in: days } } });
    await prisma.trainingSession.createMany({
      data: steady(27, 2, 55, 6).map((s) => ({
        userId: seeded.id,
        day: s.day,
        sport: "swimming",
        kind: "technique",
        minutes: s.minutes,
        intensity: s.intensity,
      })),
    });
    sessionCount += days.length;
  }

  console.log(
    `[demo] ${SQUAD.length} athletes, ${sessionCount} sessions, ${recordCount} records attached to ${COACH_EMAIL}.`,
  );
  console.log("[demo] re-run before a demo — the dates are relative to today.");
}

main()
  .catch((e) => {
    console.error("[demo] failed:", e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
