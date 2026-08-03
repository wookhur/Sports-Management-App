-- CreateEnum
CREATE TYPE "LinkStatus" AS ENUM ('PENDING', 'ACCEPTED');

-- DropIndex
DROP INDEX "CoachAthlete_athleteId_idx";

-- DropIndex
DROP INDEX "CoachAthlete_coachId_idx";

-- AlterTable
ALTER TABLE "CoachAthlete" ADD COLUMN     "requestedById" TEXT,
ADD COLUMN     "respondedAt" TIMESTAMP(3),
ADD COLUMN     "status" "LinkStatus" NOT NULL DEFAULT 'PENDING';

-- Grandfather existing relationships.
--
-- `status` defaults to PENDING so application code that forgets it fails
-- closed. But every row that exists right now was created under the old rules,
-- where linking was immediate and the relationship was already in use. Without
-- this backfill the migration would silently empty every coach's roster.
UPDATE "CoachAthlete" SET "status" = 'ACCEPTED', "respondedAt" = "createdAt";


-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "data" JSONB,
    "href" TEXT,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Notification_userId_readAt_idx" ON "Notification"("userId", "readAt");

-- CreateIndex
CREATE INDEX "Notification_userId_createdAt_idx" ON "Notification"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "CoachAthlete_coachId_status_idx" ON "CoachAthlete"("coachId", "status");

-- CreateIndex
CREATE INDEX "CoachAthlete_athleteId_status_idx" ON "CoachAthlete"("athleteId", "status");

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
