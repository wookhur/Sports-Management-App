// Puts the seeded athlete into a known state so end-to-end tests are
// deterministic: a fresh egg, enough beans to exercise the care flow, and no
// mission claims recorded for today.
//
// Run against a disposable/local database only — never production.
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const EMAIL = "athlete@example.com";

async function main() {
  if (/neon\.tech|amazonaws|supabase/i.test(process.env.DATABASE_URL ?? "")) {
    throw new Error("Refusing to run the e2e fixture against a hosted database.");
  }

  const user = await prisma.user.findUnique({ where: { email: EMAIL }, select: { id: true } });
  if (!user) throw new Error(`${EMAIL} not found — run the seed first.`);

  await prisma.missionClaim.deleteMany({ where: { userId: user.id } });
  await prisma.user.update({
    where: { id: user.id },
    data: { beans: 200, petGrowth: 0 },
  });

  console.log("[e2e-fixture] athlete reset: beans=200, petGrowth=0, claims cleared");
}

main()
  .catch((e) => {
    console.error("[e2e-fixture] failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
