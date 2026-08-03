-- Drop the dead User.houseRepairs column.
--
-- This backed the original house-repair mechanic, which was replaced by the
-- egg/pet growth system. No application code has read or written it since;
-- the only remaining references were the schema definition and the 0_init
-- baseline, which stays as-is because migration history is append-only.
--
-- Destructive and deliberate. Prisma's own check reports the column as
-- holding non-null values, but every row holds an empty array — the column's
-- default — so nothing meaningful is lost. Verified before writing this:
--
--   SELECT count(*) FILTER (WHERE array_length("houseRepairs", 1) > 0)
--   FROM "User";   -- 0
--
-- Run that against production before deploying if you want the same
-- assurance there; if it returns anything but 0, stop and keep the column.

ALTER TABLE "User" DROP COLUMN "houseRepairs";
