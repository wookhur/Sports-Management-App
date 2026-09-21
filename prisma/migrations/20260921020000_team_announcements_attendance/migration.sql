-- Team announcements and attendance.
--
-- Attendance is one row per athlete per day, present true or false. A missing
-- row means "not marked", which is a different fact from "marked absent" and
-- is kept distinct on purpose: a coach who never took the register that day
-- should not be reported as having marked everyone away.
CREATE TABLE "TeamAnnouncement" (
  "id"        TEXT NOT NULL,
  "teamId"    TEXT NOT NULL,
  "authorId"  TEXT NOT NULL,
  "body"      TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "TeamAnnouncement_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "TeamAnnouncement_teamId_createdAt_idx" ON "TeamAnnouncement"("teamId", "createdAt");
ALTER TABLE "TeamAnnouncement" ADD CONSTRAINT "TeamAnnouncement_teamId_fkey"
  FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TeamAnnouncement" ADD CONSTRAINT "TeamAnnouncement_authorId_fkey"
  FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "Attendance" (
  "id"         TEXT NOT NULL,
  "teamId"     TEXT NOT NULL,
  "userId"     TEXT NOT NULL,
  "day"        TEXT NOT NULL,
  "present"    BOOLEAN NOT NULL,
  "markedById" TEXT NOT NULL,
  "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"  TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Attendance_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Attendance_teamId_day_userId_key" ON "Attendance"("teamId", "day", "userId");
CREATE INDEX "Attendance_teamId_day_idx" ON "Attendance"("teamId", "day");
CREATE INDEX "Attendance_userId_day_idx" ON "Attendance"("userId", "day");
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_teamId_fkey"
  FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_markedById_fkey"
  FOREIGN KEY ("markedById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
