-- The coach's season log ("bitácora"): roster details, excused absences, a
-- weekly training plan, match results and term evaluations.
--
-- Additive only. Every new column is nullable or has a default, so existing
-- teams, members and attendance rows are untouched, and nothing is backfilled.
-- CreateEnum
CREATE TYPE "MatchKind" AS ENUM ('LEAGUE', 'FRIENDLY', 'TOURNAMENT', 'ASOMEX');

-- AlterTable
ALTER TABLE "Attendance" ADD COLUMN     "excused" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Team" ADD COLUMN     "branch" TEXT,
ADD COLUMN     "category" TEXT,
ADD COLUMN     "timeZone" TEXT;

-- AlterTable
ALTER TABLE "TeamMember" ADD COLUMN     "birthDate" TEXT,
ADD COLUMN     "guardian1Email" TEXT,
ADD COLUMN     "guardian1Name" TEXT,
ADD COLUMN     "guardian1Phone" TEXT,
ADD COLUMN     "guardian2Email" TEXT,
ADD COLUMN     "guardian2Name" TEXT,
ADD COLUMN     "guardian2Phone" TEXT,
ADD COLUMN     "number" INTEGER;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "managed" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "TeamPlanWeek" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "weekStart" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "objective" TEXT NOT NULL,
    "note" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeamPlanWeek_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Match" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "day" TEXT NOT NULL,
    "opponent" TEXT NOT NULL,
    "kind" "MatchKind" NOT NULL,
    "competition" TEXT,
    "goalsFor" INTEGER NOT NULL,
    "goalsAgainst" INTEGER NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Match_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MatchPlayer" (
    "matchId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "MatchPlayer_pkey" PRIMARY KEY ("matchId","userId")
);

-- CreateTable
CREATE TABLE "PlayerEvaluation" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "athleteId" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "scores" INTEGER[],
    "note" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlayerEvaluation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TeamPlanWeek_teamId_weekStart_key" ON "TeamPlanWeek"("teamId", "weekStart");

-- CreateIndex
CREATE INDEX "Match_teamId_day_idx" ON "Match"("teamId", "day");

-- CreateIndex
CREATE INDEX "MatchPlayer_userId_idx" ON "MatchPlayer"("userId");

-- CreateIndex
CREATE INDEX "PlayerEvaluation_athleteId_idx" ON "PlayerEvaluation"("athleteId");

-- CreateIndex
CREATE UNIQUE INDEX "PlayerEvaluation_teamId_athleteId_period_key" ON "PlayerEvaluation"("teamId", "athleteId", "period");

-- AddForeignKey
ALTER TABLE "TeamPlanWeek" ADD CONSTRAINT "TeamPlanWeek_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchPlayer" ADD CONSTRAINT "MatchPlayer_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchPlayer" ADD CONSTRAINT "MatchPlayer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerEvaluation" ADD CONSTRAINT "PlayerEvaluation_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerEvaluation" ADD CONSTRAINT "PlayerEvaluation_athleteId_fkey" FOREIGN KEY ("athleteId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

