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

  // Sample blog posts (idempotent by slug). Authored by the coach; more can
  // be written in-app later.
  const posts = [
    {
      slug: "welcome-to-sideline365",
      title: "sideline365에 오신 것을 환영합니다",
      excerpt: "기록을 측정하고 코치와 공유해 더 나은 운동 성과를 만드는 방법을 소개합니다.",
      emoji: "🏅",
      tag: "공지",
      body:
        "sideline365는 선수와 코치를 잇는 스포츠 통합 관리 앱입니다.\n\n" +
        "선수는 종목별로 훈련하고 기록을 측정하며, 코치는 공유된 기록을 확인하고 피드백을 남깁니다. " +
        "수영은 1,440개의 완성 워크아웃을, 축구는 학년별 세션 플랜과 드릴을, 라크로스는 단계별 훈련 가이드를 제공합니다.\n\n" +
        "매일 접속해 연속 출석을 이어가고, 나만의 성장 기록을 만들어보세요!",
    },
    {
      slug: "how-to-measure-swim-records",
      title: "수영 기록, 이렇게 측정하세요",
      excerpt: "타이머와 직접 입력, 두 가지 방식으로 정확한 랩 타임을 남기는 팁.",
      emoji: "🏊",
      tag: "가이드",
      body:
        "수영 종목에서는 스톱워치로 실시간 측정하거나, '직접 입력' 탭에서 시간을 바로 타이핑할 수 있습니다.\n\n" +
        "정확한 기록을 위해서는 출발과 터치 타이밍을 일관되게 유지하는 것이 중요합니다. " +
        "측정한 기록은 100m 페이스로 자동 환산되고, 영법별 최고 기록이 표시됩니다.\n\n" +
        "기록마다 공유 스위치를 켜면 연결된 코치가 확인하고 피드백을 남길 수 있어요.",
    },
    {
      slug: "soccer-training-by-age",
      title: "연령대별 축구 훈련의 핵심",
      excerpt: "유소년 선수의 발달 단계에 맞춘 드릴 구성 원칙을 정리했습니다.",
      emoji: "⚽",
      tag: "훈련",
      body:
        "어린 선수일수록 볼 터치 횟수를 극대화하는 것이 중요합니다.\n\n" +
        "유치원~2학년은 재미와 기본 볼 컨트롤에 집중하고, 3~5학년부터는 론도와 포지셔닝 같은 전술 요소를 더합니다. " +
        "축구 훈련 프로그램의 드릴 다이어그램을 참고해 콘 배치와 움직임을 그대로 따라 해보세요.",
    },
  ];
  for (const p of posts) {
    await prisma.blogPost.upsert({
      where: { slug: p.slug },
      update: {},
      create: { ...p, authorId: coach.id },
    });
  }

  console.log("Seed complete:");
  console.log("  Coach   -> coach@example.com / password123");
  console.log("  Athlete -> athlete@example.com / password123");
  console.log(`  Blog posts: ${posts.length}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
