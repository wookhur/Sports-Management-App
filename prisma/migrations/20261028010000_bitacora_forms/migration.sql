-- The school's bitácora, sheet for sheet: five attendance marks, a status
-- per player per match, shootouts, CURP on the roster, and the form-like
-- sections (goals, year-end report, self-evaluation, event requests).
--
-- Two conversions of existing data, both lossless:
-- * attendance rows get the status their present/excused flags already
--   meant (present → Asistencia, excused → Justificada, else Falta);
-- * evaluation scores move from the app's 1-5 scale to the school's 10-6
--   one (5 → 10 … 1 → 6), unscored points (0) staying 0.
-- CreateEnum
CREATE TYPE "AttendanceStatus" AS ENUM ('ASISTENCIA', 'FALTA', 'TARDE', 'INCIDENTE', 'JUSTIFICADA');

-- CreateEnum
CREATE TYPE "MatchPlayerStatus" AS ENUM ('ASISTIO', 'NO_ASISTIO', 'JUSTIFICADO', 'NO_SELECCIONADO');

-- AlterTable
ALTER TABLE "Attendance" ADD COLUMN     "status" "AttendanceStatus" NOT NULL DEFAULT 'ASISTENCIA';

-- AlterTable
ALTER TABLE "Match" ADD COLUMN     "eventId" TEXT,
ADD COLUMN     "penaltiesAgainst" INTEGER,
ADD COLUMN     "penaltiesFor" INTEGER;

-- AlterTable
ALTER TABLE "MatchPlayer" ADD COLUMN     "status" "MatchPlayerStatus" NOT NULL DEFAULT 'ASISTIO';

-- AlterTable
ALTER TABLE "TeamMember" ADD COLUMN     "curp" TEXT;

-- CreateTable
CREATE TABLE "TeamSeasonDoc" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "kind" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeamSeasonDoc_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeamEvent" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "data" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeamEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TeamSeasonDoc_teamId_year_kind_key" ON "TeamSeasonDoc"("teamId", "year", "kind");

-- CreateIndex
CREATE INDEX "TeamEvent_teamId_year_idx" ON "TeamEvent"("teamId", "year");

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "TeamEvent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamSeasonDoc" ADD CONSTRAINT "TeamSeasonDoc_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamEvent" ADD CONSTRAINT "TeamEvent_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- Existing attendance: the status the two flags already described.
UPDATE "Attendance" SET "status" = CASE
  WHEN "present" THEN 'ASISTENCIA'::"AttendanceStatus"
  WHEN "excused" THEN 'JUSTIFICADA'::"AttendanceStatus"
  ELSE 'FALTA'::"AttendanceStatus"
END;

-- Existing evaluations: 1-5 onto 6-10, order of the ten points preserved.
UPDATE "PlayerEvaluation" SET "scores" = ARRAY(
  SELECT CASE WHEN s.v BETWEEN 1 AND 5 THEN s.v + 5 ELSE 0 END
  FROM unnest("scores") WITH ORDINALITY AS s(v, i)
  ORDER BY s.i
);
