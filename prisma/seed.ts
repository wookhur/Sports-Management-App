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

  const royHyun = await prisma.user.upsert({
    where: { email: "roy.hyun@example.com" },
    update: {},
    create: {
      email: "roy.hyun@example.com",
      name: "Roy Hyun",
      username: "royhyun",
      password,
      role: "COACH",
    },
  });

  await prisma.blogPost.upsert({
    where: { slug: "why-we-built-sideline365" },
    update: {},
    create: {
      slug: "why-we-built-sideline365",
      title: "Why We Built Sideline365",
      excerpt:
        "Lacrosse demands speed, agility, stick skills, and elite conditioning all at once. Here's why we built Sideline365 to bring real program structure to that development.",
      emoji: "🥍",
      tag: "Lacrosse",
      authorId: royHyun.id,
      body: [
        "Lacrosse is considered the fastest sport on two feet. The demands it places on your body and mind are unlike almost any other sport — you need speed, agility, stick skills, game intelligence, and the conditioning to maintain all of it through four full quarters. Developing a program that addresses all of these areas simultaneously takes a level of structure and intentionality that goes well beyond showing up to practice and running drills.",
        "We built Sideline365 because we wanted to bring the same level of preparation to our team that top programs use. Every drill, every practice plan, and every conditioning method in Sideline365 has been sourced directly from USA Lacrosse's national training program, NCAA Division 1 coaches, and Premier Lacrosse League players. This is not a generic fitness platform adapted for lacrosse — it was designed specifically for lacrosse, from the ground up, with your development as an athlete in mind.",
        "## Introducing the Game of Lacrosse",
        "Lacrosse is one of the oldest team sports in North America and one of the fastest-growing in the world today. Two teams of ten battle it out using long-handled sticks with mesh pockets to carry, pass, and shoot a rubber ball into the opponent's goal — combining the speed of hockey, the field vision of basketball, and the athleticism of soccer into one sport.",
        "What makes it unique is the pace. Possessions shift in seconds, ground balls decide momentum, and every player on the field needs to be both physically explosive and technically sharp at the same time. The stick is the great equalizer — master it, and everything else opens up.",
        "If you're new to the game, the learning curve is real but the payoff is enormous. Sideline365 exists to make sure every rep you put in is pointed in exactly the right direction.",
      ].join("\n\n"),
    },
  });

  await prisma.user.upsert({
    where: { email: "clare.nam@example.com" },
    update: {},
    create: {
      email: "clare.nam@example.com",
      name: "Clare Nam",
      username: "clarenam",
      password,
      role: "COACH",
    },
  });

  // "유명 선수 훈련법" (famous athlete training methods) — swimming.
  // Evidence-based summaries from interviews/media/biographies, not exact
  // current training plans. Upserted by slug like the blog posts above, so
  // re-running the seed never duplicates or overwrites in-app edits.
  const swimmingAthletes: {
    slug: string;
    athleteName: string;
    title: string;
    excerpt: string;
    body: string;
  }[] = [
    {
      slug: "swimming-michael-phelps",
      athleteName: "Michael Phelps",
      title: "Michael Phelps: Typical Training Routine",
      excerpt: "High-volume, multi-event training built around huge weekly mileage, IM sets, and consistent strength work.",
      body: `<p><strong>Events:</strong> 100–400m free/fly/IM</p><p><strong>Type:</strong> High-volume, multi-event swimmer</p><h2>Typical Routine (Prime Years)</h2><h3>Pool</h3><ul><li>~8–10 sessions/week (often 2×/day, 6 days/week)</li><li>~70–90 km/week at peak</li><li>Lots of: aerobic IM sets, stroke drills, kick/pull sets, race-pace repeats (50–400m), turns/underwaters</li></ul><h3>Gym</h3><ul><li>3–4×/week</li><li>Pull-ups, rows, presses, core circuits, medicine ball throws, general strength</li></ul><h3>Dryland</h3><ul><li>Stretching, mobility, shoulder care, light plyometrics</li></ul><h2>Evidence</h2><ul><li>Phelps' autobiography and talks describing twice-daily swim sessions and huge weekly mileage.</li><li>Coach Bob Bowman's interviews about 80–90 km/week and 14 sessions/week.</li><li>Olympic profiles and TV features outlining his mix of IM, aerobic, and race-pace work plus regular strength training.</li></ul>`,
    },
    {
      slug: "swimming-katie-ledecky",
      athleteName: "Katie Ledecky",
      title: "Katie Ledecky: Typical Training Routine",
      excerpt: "Classic high-volume distance training — long aerobic sets, threshold work, and posterior-chain strength.",
      body: `<p><strong>Events:</strong> 200–1500m freestyle</p><p><strong>Type:</strong> Distance/mid-distance freestyle</p><h2>Typical Routine</h2><h3>Pool</h3><ul><li>8–10 sessions/week</li><li>Often 60–80+ km/week</li><li>Long aerobic sets (e.g., long 200–800m repeats), threshold/tempo sets, race-pace 200/400/800s, paddles/pull work</li></ul><h3>Strength and Conditioning</h3><ul><li>2–4×/week</li><li>Focus on posterior chain (glutes/hamstrings/back), core, shoulder stability</li></ul><h3>Dryland</h3><ul><li>Mobility and band work for shoulder health</li></ul><h2>Evidence</h2><ul><li>Media and coach interviews describing her as a classic high-volume distance trainer.</li><li>College/National Team coverage mentioning 2-a-day pool sessions and regular lifting.</li><li>Standard distance-swimmer norms: high mileage plus aerobic/threshold and pace work.</li></ul>`,
    },
    {
      slug: "swimming-caeleb-dressel",
      athleteName: "Caeleb Dressel",
      title: "Caeleb Dressel: Typical Training Routine",
      excerpt: "Pure sprint model — lower volume, very high intensity, heavy resisted swimming and gym power work.",
      body: `<p><strong>Events:</strong> 50–100m free/fly</p><p><strong>Type:</strong> Pure sprinter</p><h2>Typical Routine</h2><h3>Pool</h3><ul><li>~8–9 sessions/week</li><li>Lower total volume than distance swimmers, very high intensity</li><li>Short sprints (15–50m), race-pace 25/50/100s with long rest, resisted swims (parachutes, paddles, fins), starts/turns/underwaters</li></ul><h3>Gym</h3><ul><li>3–4×/week</li><li>Olympic lifts, squats, deadlifts, pull-ups, presses, plyometrics, medicine ball throws</li></ul><h3>Dryland</h3><ul><li>Cords, core work, explosive jumps</li></ul><h2>Evidence</h2><ul><li>Dressel and coaches in interviews describing sprint-focused, power-based training.</li><li>Swim media features showing heavy lifting and resisted/power sets.</li><li>Typical sprint-freestyle/fly model: lower volume, more intensity plus strength.</li></ul>`,
    },
    {
      slug: "swimming-sarah-sjostrom",
      athleteName: "Sarah Sjöström",
      title: "Sarah Sjöström: Typical Training Routine",
      excerpt: "Sprint/mid-sprint training combining lactate sets, broken 100s, and frequent compound strength work.",
      body: `<p><strong>Events:</strong> 50–100m fly/free, 100m free</p><p><strong>Type:</strong> Sprint/mid-sprint</p><h2>Typical Routine</h2><h3>Pool</h3><ul><li>~9 sessions/week</li><li>25–100m sprint and lactate sets, mixed with some middle-distance free</li><li>Broken 100s, high-tempo stroke-rate sets, fly technique work, starts/turns/underwaters</li></ul><h3>Strength Training</h3><ul><li>~3×/week</li><li>Compound lifts, pull-ups, upper-back work, core, explosive leg training</li></ul><h3>Dryland</h3><ul><li>Mobility and shoulder-injury prevention (bands, stability drills)</li></ul><h2>Evidence</h2><ul><li>European and world-level coverage noting her combination of sprint and endurance training.</li><li>Interviews referencing strong emphasis on gym strength and high-intensity fly/free sets.</li><li>Common approach for elite sprint fly/free: sprint plus threshold sets, plus frequent strength work.</li></ul>`,
    },
    {
      slug: "swimming-adam-peaty",
      athleteName: "Adam Peaty",
      title: "Adam Peaty: Typical Training Routine",
      excerpt: "Power-sprinter model — breaststroke-specific speed sets paired with heavy squats, deadlifts, and Olympic lifts.",
      body: `<p><strong>Events:</strong> 50–100m breaststroke</p><p><strong>Type:</strong> Power sprinter</p><h2>Typical Routine</h2><h3>Pool</h3><ul><li>8–10 sessions/week</li><li>Breaststroke-specific speed sets: 25–50m sprints, 50/100s at race pace, high-tempo stroke-rate work</li><li>Kick/pull tuned to breast rhythm, turns and breakouts</li></ul><h3>Gym</h3><ul><li>3–4×/week</li><li>Heavy squats, deadlifts, bench, rows, plus jumps and Olympic lifts for power</li></ul><h3>Dryland</h3><ul><li>Core, hip/knee stability, ankle mobility</li></ul><h2>Evidence</h2><ul><li>Peaty and coaches (interviews and documentaries) describing 8–10 swims plus 3–4 strength sessions weekly.</li><li>British Swimming/Olympic features emphasizing power and sprint-specific breastwork.</li><li>Typical elite 50/100 breaststroke pattern: short, high-intensity sets plus heavy strength.</li></ul>`,
    },
    {
      slug: "swimming-katinka-hosszu",
      athleteName: "Katinka Hosszú",
      title: "Katinka Hosszú: Typical Training Routine",
      excerpt: "The “Iron Lady” approach — extreme volume across all four strokes, heavy IM sets, and frequent racing.",
      body: `<p><strong>Events:</strong> 200–400m IM, 200 back/fly</p><p><strong>Nickname:</strong> "The Iron Lady"</p><h2>Typical Routine</h2><h3>Pool</h3><ul><li>9–10+ sessions/week, very high volume</li><li>Heavy IM sets: 100/200/400 IM repeats, mixed-stroke aerobic/threshold work</li><li>Lots of race-pace work across strokes, frequent racing in competition blocks</li></ul><h3>Gym</h3><ul><li>2–3×/week</li><li>Full-body strength, core, medicine ball and functional exercises</li></ul><h3>Dryland</h3><ul><li>Mobility, joint stability, prehab/rehab</li></ul><h2>Evidence</h2><ul><li>Media coverage calling her "Iron Lady" for extreme training volume and packed racing schedules.</li><li>Interviews with her team noting large IM workloads and frequent hard sessions.</li><li>IM norms: multi-stroke, high yardage, combining aerobic, threshold, and pace work.</li></ul>`,
    },
    {
      slug: "swimming-ian-thorpe",
      athleteName: "Ian Thorpe",
      title: "Ian Thorpe: Typical Training Routine",
      excerpt: "High-volume mid-distance/distance freestyle training from his prime years — huge mileage plus double sessions.",
      body: `<p><strong>Events:</strong> 200–400m freestyle (also 800/1500 earlier)</p><p><strong>Type:</strong> Mid-distance/distance freestyle</p><h2>Typical Routine</h2><h3>Pool</h3><ul><li>~9–10 sessions/week</li><li>~70–80+ km/week in heavy phases</li><li>Long aerobic sets, threshold free, broken 200/400 at race pace, speed work at the end of long sessions</li></ul><h3>Strength and Conditioning</h3><ul><li>2–3×/week</li><li>Upper-body pull strength, leg power, core stability</li></ul><h3>Dryland</h3><ul><li>Flexibility and mobility, especially shoulders and ankles</li></ul><h2>Evidence</h2><ul><li>Thorpe's autobiography and long-form interviews describing big mileage and double sessions.</li><li>Australian program norms in his era: high-volume distance/mid-distance training.</li><li>Media reports citing 70–80+ km/week for elite mid-distance freestylers like Thorpe.</li></ul>`,
    },
    {
      slug: "swimming-missy-franklin",
      athleteName: "Missy Franklin",
      title: "Missy Franklin: Typical Training Routine",
      excerpt: "Backstroke-centered training built around race-pace sets and heavy underwater dolphin-kick work.",
      body: `<p><strong>Events:</strong> 100–200m backstroke, 200m freestyle</p><p><strong>Type:</strong> Back/free specialist</p><h2>Typical Routine</h2><h3>Pool</h3><ul><li>8–10 sessions/week</li><li>Backstroke-centered: 50–200 race-pace sets, aerobic backstroke, mixed back/free sets</li><li>Heavy underwater dolphin kick and turn work</li></ul><h3>Gym</h3><ul><li>2–3×/week</li><li>Squats, lunges, presses, rows, pull-ups, core training</li></ul><h3>Dryland</h3><ul><li>Shoulder mobility and band work, core stability</li></ul><h2>Evidence</h2><ul><li>Interviews and Olympic coverage detailing her backstroke-heavy training and underwater focus.</li><li>College program reports describing her mix of free/back, pace sets, and underwaters.</li><li>Backstroke norms: stroke-specific aerobic sets plus pace work plus significant underwater training.</li></ul>`,
    },
    {
      slug: "swimming-sun-yang",
      athleteName: "Sun Yang",
      title: "Sun Yang: Typical Training Routine",
      excerpt: "Traditional distance-freestyle model — very high volume with layered aerobic, threshold, and pace work.",
      body: `<p><strong>Events:</strong> 200–1500m freestyle</p><p><strong>Type:</strong> Distance/mid-distance freestyle</p><h2>Typical Routine</h2><h3>Pool</h3><ul><li>Very high volume; long-distance model</li><li>Long continuous and interval sets (200–1500m repeats), strong aerobic and threshold focus</li><li>Race-pace 200/400/1500 work, negative splits, pacing control</li></ul><h3>Strength and Conditioning</h3><ul><li>2–3×/week</li><li>Full-body strength, durability, and core</li></ul><h3>Dryland</h3><ul><li>Flexibility, mobility, low-impact conditioning</li></ul><h2>Evidence</h2><ul><li>Asian and international media describing his huge training volume and traditional distance program.</li><li>Coach and federation comments about high-mileage, endurance-heavy work.</li><li>Distance-freestyle norms: many kilometers per week with layered pace work.</li></ul>`,
    },
    {
      slug: "swimming-ryan-lochte",
      athleteName: "Ryan Lochte",
      title: "Ryan Lochte: Typical Training Routine",
      excerpt: "IM/back specialist training with a heavy stroke-variety focus and creative functional dryland work.",
      body: `<p><strong>Events:</strong> 200–400m IM, back/free</p><p><strong>Type:</strong> IM/back specialist</p><h2>Typical Routine</h2><h3>Pool</h3><ul><li>8–10 sessions/week</li><li>IM sets (100/200/400 IM), stroke-mix work, free/back endurance</li><li>Strong emphasis on underwaters and turns</li></ul><h3>Gym</h3><ul><li>2–4×/week</li><li>Strength plus functional work: medicine balls, unstable surfaces, core and rotational training</li></ul><h3>Dryland</h3><ul><li>Plyometrics, resistance cords, mobility</li></ul><h2>Evidence</h2><ul><li>Lochte/coach interviews discussing his love of IM and underwater training.</li><li>Swimming media highlighting his creative functional dryland work.</li><li>IM/back norms: high stroke variety, mixed-stroke sets, lots of turns/underwaters.</li></ul>`,
    },
    {
      slug: "swimming-park-tae-hwan",
      athleteName: "Park Tae-hwan (박태환)",
      title: "Park Tae-hwan: Typical Training Routine",
      excerpt: "Mid-distance/distance freestyle training from his prime years — high mileage, double sessions, and technique focus.",
      body: `<p><strong>Events:</strong> 200–400m freestyle (and 1500m earlier)</p><p><strong>Type:</strong> Mid-distance/distance freestyler</p><h2>Typical Routine (Prime Years)</h2><h3>Pool</h3><ul><li>~8–10 sessions/week (often 2×/day on several days)</li><li>Often 60–80 km/week in hard phases</li><li>Long aerobic freestyle sets (e.g., long 200–800m repeats)</li><li>Threshold/tempo work to build strong 200/400 pace</li><li>Broken 200/400s at or faster than race pace, turn and underwater practice</li><li>Strong focus on efficient freestyle technique (body position, catch, timing)</li></ul><h3>Strength and Conditioning</h3><ul><li>2–3×/week</li><li>Leg strength (squats, lunges, deadlifts), upper-body pulling (rows, pull-downs, pull-ups), core stability</li></ul><h3>Dryland</h3><ul><li>Stretching, mobility (shoulders, hips, ankles), injury-prevention drills</li></ul><h2>Evidence</h2><ul><li>Korean and international media around Beijing 2008 / London 2012 describing double swim sessions and high-mileage distance training similar to other 200–400/1500 freestylers.</li><li>Coach comments about heavy aerobic work, 200/400 race-pace sets, and technique focus.</li><li>General distance-freestyle norms (like Thorpe/Sun/Ledecky): 8–10 swims/week, 60–80+ km, aerobic plus threshold plus pace work, plus 2–3 strength sessions.</li></ul>`,
    },
  ];

  for (const a of swimmingAthletes) {
    await prisma.athleteGuide.upsert({
      where: { slug: a.slug },
      update: {},
      create: {
        sport: "swimming",
        slug: a.slug,
        athleteName: a.athleteName,
        title: a.title,
        excerpt: a.excerpt,
        body: a.body,
        authorId: coach.id,
      },
    });
  }

  console.log("Seed complete:");
  console.log("  Coach   -> coach@example.com / password123");
  console.log("  Athlete -> athlete@example.com / password123");
  console.log("  Eric Park (blog author) -> eric.park@example.com / password123");
  console.log("  Roy Hyun (blog author)  -> roy.hyun@example.com / password123");
  console.log("  Clare Nam (coach)       -> clare.nam@example.com / password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
