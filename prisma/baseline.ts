// Baseline helper for the migration workflow.
//
// The production database predates `prisma migrate` — its tables were created
// by `prisma db push`, so it has no `_prisma_migrations` history. Running
// `migrate deploy` against it as-is would try to CREATE TABLE everything and
// fail. This script detects that case once and records the initial migration
// as already-applied, after which `migrate deploy` proceeds normally.
//
// Runs before every deploy and is a no-op in the two steady states:
//   - already baselined / already migrating  -> nothing to do
//   - brand-new empty database               -> migrate deploy creates it all
import { execSync } from "node:child_process";
import { PrismaClient } from "@prisma/client";

const INITIAL_MIGRATION = "0_init";
const prisma = new PrismaClient();

// pg_class rather than information_schema: the latter only lists tables the
// connecting role holds privileges on, so a table owned by someone else reads
// as "absent" and we would wrongly treat a populated database as empty.
async function tableExists(name: string): Promise<boolean> {
  const rows = await prisma.$queryRaw<{ present: boolean }[]>`
    SELECT EXISTS (
      SELECT 1 FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = 'public' AND c.relname = ${name} AND c.relkind IN ('r', 'p')
    ) AS present
  `;
  return rows[0]?.present === true;
}

async function main() {
  const hasHistory = await tableExists("_prisma_migrations");
  if (hasHistory) {
    console.log("[baseline] migration history present — nothing to do.");
    return;
  }

  // No history. Is this an existing database, or a fresh one?
  const hasSchema = await tableExists("User");
  if (!hasSchema) {
    console.log("[baseline] empty database — migrate deploy will create the schema.");
    return;
  }

  console.log(`[baseline] existing database without history — marking ${INITIAL_MIGRATION} as applied.`);
  execSync(`npx prisma migrate resolve --applied ${INITIAL_MIGRATION}`, { stdio: "inherit" });
  console.log("[baseline] done.");
}

main()
  .catch((e) => {
    console.error("[baseline] failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
