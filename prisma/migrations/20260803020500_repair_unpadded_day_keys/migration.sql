-- Repair day keys written with an unpadded day-of-month.
--
-- seoulDayKey() formatted with `day: "numeric"`, so on the 1st–9th of a month
-- it produced "2026-08-3" instead of "2026-08-03". Those keys are compared and
-- sorted as plain strings and parsed back with `new Date(key + "T00:00:00Z")`,
-- so any row carrying one is invisible to range queries and breaks date maths.
--
-- Idempotent: well-formed rows match the pattern and are skipped, so
-- re-running this changes nothing.

-- MissionClaim is uniquely keyed on (userId, missionKey, day). Normalising a
-- malformed key could collide with an already-correct row for the same day, so
-- drop the malformed duplicate rather than failing the migration.
DELETE FROM "MissionClaim" m
WHERE m."day" !~ '^\d{4}-\d{2}-\d{2}$'
  AND EXISTS (
    SELECT 1 FROM "MissionClaim" o
    WHERE o."userId" = m."userId"
      AND o."missionKey" = m."missionKey"
      AND o."day" = to_char(to_date(m."day", 'YYYY-MM-DD'), 'YYYY-MM-DD')
  );

UPDATE "MissionClaim"
SET "day" = to_char(to_date("day", 'YYYY-MM-DD'), 'YYYY-MM-DD')
WHERE "day" !~ '^\d{4}-\d{2}-\d{2}$';

UPDATE "TrainingSession"
SET "day" = to_char(to_date("day", 'YYYY-MM-DD'), 'YYYY-MM-DD')
WHERE "day" !~ '^\d{4}-\d{2}-\d{2}$';
