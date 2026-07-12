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

  // Retire the original placeholder demo posts (superseded by real editorial
  // content below). Targeted by slug rather than truncating the table, so
  // any real posts written in-app since are never touched by a redeploy.
  await prisma.blogPost.deleteMany({
    where: {
      slug: { in: ["welcome-to-sideline365", "how-to-measure-swim-records", "soccer-training-by-age"] },
    },
  });

  const ericPark = await prisma.user.upsert({
    where: { email: "eric.park@example.com" },
    update: {},
    create: {
      email: "eric.park@example.com",
      name: "Eric Park",
      username: "ericpark",
      password,
      role: "COACH",
    },
  });

  await prisma.blogPost.upsert({
    where: { slug: "france-2026-world-cup-favorite" },
    update: {},
    create: {
      slug: "france-2026-world-cup-favorite",
      title: "Why France Is the Favorite to Win the 2026 World Cup",
      excerpt:
        "As the tournament nears its finale, France stands out as the strongest candidate to lift the trophy. Having gone 6-0 so far, here's why they're the team to beat.",
      emoji: "🇫🇷",
      tag: "World Cup",
      coverImage: "/blog/france-2026-mbappe.jpg",
      authorId: ericPark.id,
      body: [
        "As the tournament nears its finale, France stands out as the strongest candidate to lift the trophy. Having gone 6-0 so far, here's why they're the team to beat.",
        "1. The Mbappé Factor",
        "Kylian Mbappé continues to peak on the world's biggest stage, notching 5 goals through 6 matches. After the heartbreak of 2022, he returns this year with better teammates around him and a noticeably matured mentality — on full display after a Paraguayan senator launched racist remarks at him following France's Round of 16 win. Rather than lashing out, Mbappé responded with a pointed but composed public statement calling out the comments, showing the same command off the pitch that he shows on it. And on the pitch, his game speaks for itself: blistering pace, elite dribbling, and a finishing instinct that's earned him multiple Ligue 1 Golden Boots with PSG and back-to-back scoring titles at Real Madrid. He's simply a natural-born goal scorer.",
        "2. Mbappé Isn't Carrying This Team Alone",
        "Part of why Mbappé thrives without buckling under pressure — unlike, say, South Korea's captain Son Heung-min, who often has to shoulder his team's hopes almost single-handedly — is the sheer depth around him. His supporting cast reads like a who's-who of world football: Michael Olise, Ousmane Dembélé, Désiré Doué, Bradley Barcola, Rayan Cherki, and more. Even fans who don't follow soccer closely would recognize most of these names. That's what makes France so dangerous — the talent doesn't stop at the starting XI; it runs deep on the bench too.",
        "Dembélé, the reigning Ballon d'Or winner, is a genuine all-rounder: fast, clinical in front of goal, an excellent passer, a dangerous dribbler, and remarkably comfortable on his weak foot. Olise plays at a more measured tempo, but his vision, creativity, and shot accuracy have been evident since his Crystal Palace days. And it's not just the attack — the defense is just as stacked, with Mike Maignan marshaling the goal, William Saliba anchoring the back line, and Aurélien Tchouaméni providing cover in defensive midfield. There isn't a weak link in this lineup.",
        "3. Deschamps' Tactics Are Nearly Unbeatable",
        "Didier Deschamps builds his system around counter-attacking rather than possession — a style some might call unglamorous, but it's devastatingly effective with a roster full of explosive attackers and disciplined defenders who can still pass under pressure. He's also known for shifting formations based on the opponent, which makes France notoriously hard to prepare for.",
        "What elevates him further is sheer experience. He recently became the first manager in history to reach 20 World Cup wins. As a player, he captained France to the 1998 World Cup and Euro 2000 titles; as a manager, he has led them to the 2014 World Cup quarterfinals, the Euro 2016 final, the 2018 World Cup title, and the 2022 World Cup final. Add it all up, and it's clear why France enters this final stretch as the strongest team left standing.",
      ].join("\n\n"),
    },
  });

  console.log("Seed complete:");
  console.log("  Coach   -> coach@example.com / password123");
  console.log("  Athlete -> athlete@example.com / password123");
  console.log("  Eric Park (blog author) -> eric.park@example.com / password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
