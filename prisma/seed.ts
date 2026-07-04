import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash("password123", 10);

  const coach = await prisma.user.upsert({
    where: { email: "coach@example.com" },
    update: {},
    create: {
      email: "coach@example.com",
      name: "김코치",
      password,
      role: "COACH",
    },
  });

  const athlete = await prisma.user.upsert({
    where: { email: "athlete@example.com" },
    update: {},
    create: {
      email: "athlete@example.com",
      name: "이선수",
      password,
      role: "ATHLETE",
    },
  });

  await prisma.coachAthlete.upsert({
    where: { coachId_athleteId: { coachId: coach.id, athleteId: athlete.id } },
    update: {},
    create: { coachId: coach.id, athleteId: athlete.id },
  });

  // Sample swimming records for the athlete (some shared with the coach).
  const existing = await prisma.record.count({ where: { userId: athlete.id } });
  if (existing === 0) {
    await prisma.record.createMany({
      data: [
        {
          userId: athlete.id,
          sport: "swimming",
          metricKey: "freestyle_50m",
          metricName: "자유형 50m",
          distanceM: 50,
          durationMs: 34120,
          notes: "출발 반응 좋았음",
          shared: true,
        },
        {
          userId: athlete.id,
          sport: "swimming",
          metricKey: "freestyle_50m",
          metricName: "자유형 50m",
          distanceM: 50,
          durationMs: 33480,
          notes: "턴 개선",
          shared: true,
        },
        {
          userId: athlete.id,
          sport: "swimming",
          metricKey: "backstroke_50m",
          metricName: "배영 50m",
          distanceM: 50,
          durationMs: 39900,
          shared: false,
        },
      ],
    });
  }

  console.log("Seed complete:");
  console.log("  Coach   -> coach@example.com / password123");
  console.log("  Athlete -> athlete@example.com / password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
