-- Drills people draw elsewhere and bring in. The image is stored in the row
-- (no file store on Netlify); the client caps it at 2 MB before upload.
CREATE TABLE "CustomDrill" (
  "id"          TEXT NOT NULL,
  "ownerId"     TEXT NOT NULL,
  "sport"       TEXT NOT NULL DEFAULT 'soccer',
  "title"       TEXT NOT NULL,
  "description" TEXT,
  "ageLevels"   TEXT[] DEFAULT ARRAY[]::TEXT[],
  "durationMin" INTEGER,
  "image"       BYTEA NOT NULL,
  "imageType"   TEXT NOT NULL,
  "width"       INTEGER NOT NULL,
  "height"      INTEGER NOT NULL,
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CustomDrill_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "CustomDrill_ownerId_sport_idx" ON "CustomDrill"("ownerId", "sport");
ALTER TABLE "CustomDrill" ADD CONSTRAINT "CustomDrill_ownerId_fkey"
  FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
