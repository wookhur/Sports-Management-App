-- Which team an assignment was given to, when it was given to a team.
--
-- Nullable: every assignment before this was given to one athlete, and stays
-- that way. SET NULL on team delete rather than CASCADE — deleting a team must
-- not take a player's homework with it.
ALTER TABLE "Assignment" ADD COLUMN "teamId" TEXT;
CREATE INDEX "Assignment_teamId_idx" ON "Assignment"("teamId");
ALTER TABLE "Assignment" ADD CONSTRAINT "Assignment_teamId_fkey"
  FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;
