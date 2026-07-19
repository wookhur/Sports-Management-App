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

  // Lacrosse superstars + Ronaldo (soccer) — training methods with the
  // science/reasoning behind each, from user-provided research.
  const moreAthletes: {
    sport: string;
    slug: string;
    athleteName: string;
    title: string;
    excerpt: string;
    body: string;
  }[] = [
    {
      sport: "lacrosse",
      slug: "lacrosse-brennan-oneill",
      athleteName: "Brennan O'Neill",
      title: "Brennan O'Neill: Training Method & the Science Behind It",
      excerpt: "The PLL's #1-ranked player builds shooting power from the legs up, and beats goalies with head fakes instead of stick tricks.",
      body: `<p><strong>Position:</strong> Midfield, Denver Outlaws (PLL's #1-ranked player, 2025)</p><h2>Training Method</h2><p>Off-season strength work 4–5 days a week (legs, arms, core), paired with a shooting approach built on deception — head and shoulder fakes borrowed from box lacrosse — rather than elaborate stick moves.</p><h2>Why It Works</h2><p>O'Neill's own explanation is simple biomechanics: "Shooting is full body. You want a good plant, so you need strong legs." A stable, powerful base lets the upper body deliver force into the shot without losing accuracy. The head-fake emphasis works because in tight spaces a goalie reacts to eye and body cues faster than to stick movement — so deceiving the eyes beats trying to out-stick-fake the goalie.</p>`,
    },
    {
      sport: "lacrosse",
      slug: "lacrosse-tom-schreiber",
      athleteName: "Tom Schreiber",
      title: "Tom Schreiber: Training Method & the Science Behind It",
      excerpt: "The consensus best all-around midfielder drills shooting, dodging, and wall ball every single day — always at full game speed.",
      body: `<p><strong>Position:</strong> Midfield, Utah Archers (longtime consensus "best all-around midfielder")</p><h2>Training Method</h2><p>Daily lacrosse-specific reps — shooting, dodging, and wall ball, every single day — layered with medicine ball work, rowing/cycling/jump-rope cardio, and sprints. His week alternates lifting and stick-work days, with dedicated footwork sessions and lighter upper-body days before games.</p><h2>Why It Works</h2><p>Schreiber's three stated principles are dodging from multiple angles, shooting accurately with both hands while moving, and drilling at full game speed. This reflects a core training principle called specificity — skills only transfer to games if they're practiced at game speed and under game-like variability (both hands, multiple angles), not in slow, repetitive isolation.</p>`,
    },
    {
      sport: "lacrosse",
      slug: "lacrosse-trevor-baptiste",
      athleteName: "Trevor Baptiste",
      title: "Trevor Baptiste: Training Method & the Science Behind It",
      excerpt: "The best faceoff man ever doesn't train to win every clamp — he trains to win the scramble that follows.",
      body: `<p><strong>Position:</strong> Faceoff/FOGO, New York Atlas (widely considered the best ever at the position)</p><h2>Training Method</h2><p>Rather than obsessing over winning every clamp cleanly, Baptiste trains for the scramble — anticipating what happens when the draw is lost and winning the 50/50 ground-ball battle that follows, in coordination with his wing players.</p><h2>Why It Works</h2><p>A faceoff is decided in a fraction of a second off the whistle, so no technique wins every rep. Training the "second phase" (the scramble) is a bet on probability: it's more reliably repeatable than trying to perfect a single explosive first-move technique, and it turns a coin-flip battle into a team-coordinated advantage.</p>`,
    },
    {
      sport: "lacrosse",
      slug: "lacrosse-blaze-riorden",
      athleteName: "Blaze Riorden",
      title: "Blaze Riorden: Training Method & the Science Behind It",
      excerpt: "A hockey-style butterfly stance and reaction-ball drills — how the Chaos goalie handles 90+ mph shots.",
      body: `<p><strong>Position:</strong> Goalie, Carolina Chaos</p><h2>Training Method</h2><p>Plays a hockey-style "butterfly" stance, unusual for field lacrosse goalies, and leans on stick-handling skills carried over from his early years as an attackman to start transition offense right off a save. General elite goalie training (the drills top goalies use broadly) centers on reaction balls and "colored ball" call-outs — irregular-bounce balls or balls a coach names by color mid-flight, forcing the goalie to process visual information and react physically in the same instant.</p><h2>Why It Works</h2><p>The butterfly stance maximizes low-body coverage against a shot that can travel over 90 mph, leaving a goalie under half a second to read release point and react — so covering more net passively reduces how much has to be covered reactively. The reaction-ball drills work because they remove predictable bounce patterns, forcing the brain to build genuine reflexive (not memorized) responses — closer to what an actual game shot demands.</p>`,
    },
    {
      sport: "lacrosse",
      slug: "lacrosse-lyle-thompson",
      athleteName: "Lyle Thompson",
      title: "Lyle Thompson: Training Method & the Science Behind It",
      excerpt: "One of the most decorated attackmen ever balances strength, mobility, and stability — because lacrosse punishes any weak link.",
      body: `<p><strong>Position:</strong> Attack (Iroquois Nationals; one of the most decorated attackmen ever)</p><h2>Training Method</h2><p>Roughly two hours in the gym built around balance rather than maxing any one quality — about 30 minutes of strength work, 10 minutes of cardio, 10 minutes of core, then another 60 minutes of strength, rotating the training block every two months. Signature lifts: front squats, goblet squats, hang cleans, and pull-ups ("the great equalizer," in his words).</p><h2>Why It Works</h2><p>Thompson's rationale is that lacrosse punishes any single weak link — a lack of leg strength, core stability, or hip mobility all show up in one-on-one battles — so he deliberately balances mobility, stability, and strength instead of overtraining one at the expense of the others. He specifically targets hip strength because weak hips are a common limiting factor for lacrosse players' dodging and defensive positioning.</p>`,
    },
    {
      sport: "soccer",
      slug: "soccer-cristiano-ronaldo",
      athleteName: "Cristiano Ronaldo",
      title: "Cristiano Ronaldo: Training Method & the Science Behind It",
      excerpt: "Sprint intervals, 65–75% 1RM hypertrophy work, and multi-directional core training — the science behind CR7's longevity.",
      body: `<h2>Training Method</h2><p>High-intensity sprint intervals, strength work in the 65–75% one-rep-max range for 8–12 reps, and core training built on twisting/balancing/agile movements (planks, lateral sprints, complex compound lifts) instead of traditional crunches.</p><h2>Why It Works</h2><p>Research from Laval University links high-intensity sprint intervals to greater fat loss and elevated resting metabolism, which explains his low body-fat percentage into his 40s. The 65–75%-of-max, 8–12 rep range is what a Gothenburg University study associated with optimal muscle growth. And Penn State research found that football's twisting, balancing, agile movements recruit more core musculature than a standard sit-up — which is why his program favors compound, multi-directional movements over crunches.</p>`,
    },
    {
      sport: "track",
      slug: "track-usain-bolt",
      athleteName: "Usain Bolt",
      title: "Usain Bolt: Training Method & the Science Behind It",
      excerpt: "The fastest man ever recorded skipped heavy lifting for horizontal, hip-extension-dominant work — matched exactly to a sprint stride's force demands.",
      body: `<p><strong>Event:</strong> Track & Field / Sprinting (fastest man ever recorded)</p><h2>Training Method</h2><p>Rather than generic heavy lifting, Bolt's program leaned on horizontal, hip-extension-dominant exercises — pendulum quadruped hip extensions, hang cleans, sled work — while deliberately avoiding excessive heavy lifting.</p><h2>Why It Works</h2><p>Research shows horizontal ground-reaction force in sprinting comes mostly from the hip extensors and knee flexors, not the muscles vertical lifts like back squats emphasize — so training matched the specific force demands of a sprint stride. Skipping heavy lifting preserved his central nervous system for sprinting itself, the highest-value neural stimulus for speed. Physiologically, Bolt is also a leverage case study: at 6'5" he covered 100m in about 41 strides (vs. 45–47 for typical elite sprinters) with an estimated unusually high proportion of fast-twitch (Type IIb) fibers — the fiber type built for rapid, forceful, short-duration contraction.</p>`,
    },
    {
      sport: "basketball",
      slug: "basketball-lebron-james",
      athleteName: "LeBron James",
      title: "LeBron James: Training Method & the Science Behind It",
      excerpt: "At this stage of his career, recovery — cryotherapy, hyperbaric chambers, sleep tracking — gets treated as seriously as the lifting itself.",
      body: `<h2>Training Method</h2><p>At this stage of his career, recovery is treated as seriously as the lifting itself — cryotherapy, hyperbaric chambers, compression, sleep tracking, and in-season load management, reportedly a ~$1.5M/year setup.</p><h2>Why It Works</h2><p>High-intensity training creates micro-damage and inflammation, and the actual adaptation (getting stronger/faster) happens during recovery, not during the workout itself. Expanding recovery capacity is what lets a 40-year-old keep training at a young player's intensity.</p>`,
    },
    {
      sport: "swimming",
      slug: "swimming-summer-mcintosh",
      athleteName: "Summer McIntosh",
      title: "Summer McIntosh: Final Season as a Teenager",
      excerpt: "At 19, she holds four individual long-course world records at once — and just broke a mark that survived the super-suit era.",
      body: `<p><strong>Event:</strong> Swimming — 200m butterfly, 400m freestyle, 200m & 400m individual medley (world record holder, all four)</p><h2>The Record That Outlasted the Super-Suit Era</h2><p>On July 5, 2026, at the Canadian Swimming Trials in Montreal, McIntosh broke the 200m butterfly world record — a mark that had stood since 2009, set by China's Liu Zige during the so-called "super-suit era," when swimmers competed in now-banned full polyurethane bodysuits. That record had survived 17 years and outlasted essentially every other suit-era mark in the sport. McIntosh's time of 2:01.65 shaved just 0.16 seconds off it. "Growing up, this is the one world record that I thought I would never break," she said afterward.</p><p>The win made her the first swimmer to hold four individual long-course world records simultaneously since Sarah Sjöström held four at once between 2017 and 2024 — the 200m butterfly, 400m freestyle, and both individual medley events (200m and 400m).</p><h2>Building Since Age 14</h2><p>In 2021, at just 14 years old, McIntosh swam a 400m freestyle time that was the fastest ever recorded worldwide by a 14-year-old girl, and became one of the youngest athletes ever to make Canada's Olympic team for Tokyo 2020. By 16, she was the first swimmer — male or female — to simultaneously hold long-course world records in both the 400m freestyle and 400m individual medley.</p><p>Paris 2024 turned her into a headline name: three gold medals and a silver, tying for the most medals by a Canadian athlete at a single Olympic Games. Then came the 2025 World Aquatics Championships in Singapore — four gold medals and a bronze, making her just the third swimmer in history, after Michael Phelps and Sjöström, to win five individual medals at a single World Championships. She closed out the year as World Aquatics' Female Swimmer of the Year for the second consecutive time.</p><h2>The Bob Bowman Effect</h2><p>McIntosh began training in Austin, Texas in fall 2025 under Bob Bowman — the coach who guided Michael Phelps to all 28 of his Olympic medals. Bowman has called McIntosh "scarily similar in some ways" to Phelps, citing her ability to perform under pressure and her precise, repeatable pre-race routine. Fittingly, the 200m butterfly — her signature event and newest world record — was also the exact event where Phelps made his own Olympic debut as a 15-year-old and set his first world record.</p><p>She now trains alongside France's Léon Marchand and Hungary's Hubert Kos, both Olympic gold medalists, in Austin. "We all kind of share the same mentality," she's said. "Getting to train with them every single day is an absolute privilege."</p><h2>What's Next</h2><p>The Montreal trials also qualified her for this summer's Pan Pacific Championships in Irvine, California — one of the marquee meets of a 2026 calendar with no global long-course championship. She's skipping the Commonwealth Games entirely to focus on Pan Pacs. She turns 20 on August 18, 2026, closing out a teenage run of three Olympic golds, multiple world titles, and world records across four individual events.</p>`,
    },
    {
      sport: "soccer",
      slug: "soccer-lionel-messi",
      athleteName: "Lionel Messi",
      title: "Lionel Messi: Training Method & the Science Behind It",
      excerpt: "No heavy lifting — Messi's program is built around straight-line speed and change-of-direction drills, backed by five simple diet rules.",
      body: `<h2>The Diet (5 basics)</h2><ul><li>Drink lots of water</li><li>Use olive oil as your main fat source</li><li>Eat whole grains (brown rice, oats, quinoa) instead of refined carbs</li><li>Eat fresh fruit daily</li><li>Eat fresh vegetables daily</li></ul><p>Cut back on: added sugar, refined flour, and heavy meat portions. Swap soda for tea (he drinks yerba mate).</p><h2>The Training (5 days/week during season, plus 1+ hour of stretching daily)</h2><p><strong>Warm-up (both workout days):</strong></p><ul><li>Plank hold</li><li>Lunges</li><li>Hamstring stretches</li><li>Light footwork/skipping drills</li></ul><p><strong>Day A — Straight-Line Speed:</strong></p><ul><li>Jump/hop drills (over hurdles, split-squat jumps)</li><li>Sprint acceleration drills (short 10-yard bursts, 3–5 sets)</li></ul><p><strong>Day B — Change-of-Direction Speed:</strong></p><ul><li>Lateral jumps and bounds</li><li>Shuffle-and-cut drills</li><li>Hurdle agility drills</li><li>Mirror drill (reacting to a partner's movement)</li></ul><p>The big-picture takeaway: no heavy weight room work — the whole program is built around explosive, direction-changing speed, matched to what a playmaker actually needs on the pitch.</p>`,
    },
    {
      sport: "soccer",
      slug: "soccer-neymar",
      athleteName: "Neymar",
      title: "Neymar's Routine — Simplified (Early Barcelona Era, Bulking Phase)",
      excerpt: "Underweight at 132 lbs when he arrived at Barcelona, Neymar's early routine was a deliberate calorie-surplus muscle-building phase without losing speed.",
      body: `<p><strong>The Goal:</strong> Add lean muscle without losing speed or agility — he arrived at Barcelona underweight (132 lbs) and needed to bulk up safely.</p><h2>The Diet (high-calorie, carb-and-protein focused)</h2><ul><li>Ate above-average calories (2600–3000+ per day) to support muscle gain</li><li>Macro split: ~60% carbs, 30% protein, 10% fat</li><li>Carbs: mainly complex carbs like whole-wheat pasta (for sustained energy) rather than sugary "simple carbs"</li><li>Protein: lean sources — fish, spinach, lentils, beans — plus occasional protein shakes</li><li>General protein guideline used: about 0.5–0.7g of protein per pound of body weight per day</li></ul><h2>The Training (3 core methods)</h2><ol><li><strong>Plyometrics (2–3x/week)</strong> — explosive bodyweight moves like squat jumps, step-ups, push-ups, pull-ups — builds agility and explosive power</li><li><strong>Full-Body Circuit Training (1–2x/week)</strong> — several light-weight exercises back-to-back targeting different muscle groups, minimal rest between rounds</li><li><strong>High-Intensity Interval Training/HIIT</strong> — alternating easy pace with max-effort bursts (e.g., 60 sec jog, 30 sec sprint) to burn fat while keeping muscle</li></ol><h2>The "Play" Philosophy</h2><ul><li>Play as often as possible, in varied settings — Neymar credits his quick feet and passing to growing up playing futsal, where the tight space forces faster decisions</li><li>Deliberately train your weaker foot/skills, not just your strengths — his youth coach had him specifically develop his left-footed touch</li></ul><p>The big-picture takeaway: this wasn't a maintenance routine — it was a deliberate, calorie-surplus muscle-building phase early in his career, paired with agility work so he wouldn't lose his speed.</p>`,
    },
    {
      sport: "soccer",
      slug: "soccer-son-heung-min",
      athleteName: "Son Heung-min (손흥민)",
      title: "Son Heung-min's Daily Routine",
      excerpt: "Less a diet or workout split, more a discipline of recovery — 3–4 hours of physiotherapy daily and a strict 9–10 hours of sleep.",
      body: `<p><strong>The Philosophy:</strong> Less about a specific diet or workout split, more about total-body recovery and sleep discipline — he treats rest as seriously as training.</p><h2>A Typical Day</h2><ul><li><strong>~7:30 AM</strong> — Wake up, light fruit snack</li><li><strong>~9:00 AM</strong> — Full breakfast at the club</li><li><strong>~9:30 AM</strong> — Early gym session (mobility + leg prep)</li><li><strong>~10:30 AM</strong> — Main team training session</li><li><strong>~1:00 PM</strong> — Lunch at the club</li><li><strong>~1:30 PM</strong> — Ice bath + shower</li><li><strong>~3:00 PM</strong> — 3–4 hour physiotherapy session at home</li><li><strong>~6:30 PM</strong> — Early dinner</li><li><strong>~7:30 PM</strong> — Gaming/unwinding</li><li><strong>~10:30 PM</strong> — Bedtime (9–10 hours of sleep)</li></ul><h2>The 3 Pillars That Stand Out</h2><p><strong>Recovery is treated as training.</strong> The most unusual part of his routine is spending 3–4 hours every single afternoon with a personal physiotherapist — more time than most players spend on the actual training pitch.</p><p><strong>Sleep as a non-negotiable.</strong> He aims for 9–10 hours nightly and eats dinner early (before 7 PM) specifically to help his body wind down in time for a consistent 10:30 PM bedtime.</p><p><strong>Mental self-talk.</strong> He deliberately tells himself "I am the best" during rough patches — using a consistent, positive internal script to stay confident rather than letting slumps spiral.</p><p>The big-picture takeaway: unlike Messi's speed drills or Neymar's muscle-building plan, Son's routine isn't built around a specific training method — it's built around protecting the training he already does, through obsessive recovery and sleep consistency.</p>`,
    },
    {
      sport: "soccer",
      slug: "soccer-virgil-van-dijk",
      athleteName: "Virgil van Dijk",
      title: "Virgil van Dijk's Workout",
      excerpt: "The most traditional gym-heavy program of the athletes we've covered — a 5-day strength split built to win physical duels for 90+ minutes.",
      body: `<p><strong>The Goal:</strong> Build the strength to dominate physical duels (against players like Haaland) while keeping the speed and stamina needed to defend for 90+ minutes.</p><h2>Strength Training (5-day split, off-season)</h2><ul><li><strong>Day 1 — Upper Body Push/Pull + Legs:</strong> Push-ups, pull-ups, bench press, squats, split squats</li><li><strong>Day 2 &amp; 4 — Explosive Power + Core:</strong> Box jumps, hurdle jumps, medicine ball slams, planks, hanging leg raises</li><li><strong>Day 3 — Full-Body Accessory Work:</strong> Kettlebell swings, goblet squats, shoulder press, leg curls</li><li><strong>Day 5 — Heavy Compound Lifts:</strong> Deadlifts, snatches, lunges, leg press, medicine ball throws</li></ul><p>General format: 4–5 sets of 8–10 reps, mixing heavy lifts with explosive movements.</p><h2>Cardio (rotates between 4 formats)</h2><ol><li>Treadmill: incline walk/jog (20 min at incline)</li><li>Air bike intervals: 30 sec on / 30 sec off, for 20 min</li><li>Rowing: steady state + interval sprints</li><li>HIIT sprints: 15x 100m sprints + jump rope intervals</li></ol><h2>The Diet</h2><ul><li>Not vegan/vegetarian — eats meat, healthy fats, and carbs</li><li>Meals lean carb + protein heavy, with just enough fat to support recovery and hormone balance</li></ul><p>The big-picture takeaway: unlike Messi (speed-focused, low weights) or Neymar (bulking phase), Van Dijk's plan is the most traditional "gym-heavy" of the athletes we've covered — real barbell strength training combined with explosive plyometrics, built for a position that demands raw physical dominance over pure speed.</p>`,
    },
    {
      sport: "soccer",
      slug: "soccer-manuel-neuer",
      athleteName: "Manuel Neuer",
      title: "Manuel Neuer's Home Conditioning Workout",
      excerpt: "A 6-move, no-equipment circuit built to keep footballers strong and supple without needing a gym.",
      body: `<p><strong>The Goal:</strong> A quick, no-equipment routine mixing lower-body strength, core stability, and mobility — built to keep footballers strong and supple without needing a gym.</p><h2>The Full Routine (6 moves, do in order)</h2><ol><li><strong>High Knees</strong> — 12–15 reps each side (warm-up)</li><li><strong>Triangle Pose</strong> (yoga stretch) — 30 sec each side</li><li><strong>Reverse Lunge</strong> — 10 reps each side</li><li><strong>Bodyweight Squat</strong> — 12 reps</li><li><strong>Side Plank</strong> — 30 sec each side</li><li><strong>Russian Twist</strong> (with a ball or water bottle for resistance) — 30 sec</li></ol><p>Format: no rest structure was specified — treat it as one straight-through circuit, and repeat for 2–3 rounds if you want more volume.</p><p>The big-picture takeaway: unlike the other athlete routines (heavy gym/strength programs), this one stands out because it's specifically a no-equipment, home-friendly workout — useful for readers without a gym membership.</p>`,
    },
  ];

  for (const a of moreAthletes) {
    await prisma.athleteGuide.upsert({
      where: { slug: a.slug },
      update: {},
      create: {
        sport: a.sport,
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
