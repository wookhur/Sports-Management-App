-- Sign-up agreements: acceptance of the Terms and Privacy Notice, and for a
-- minor, the parent or guardian who consented on their behalf. Every existing
-- account stays null in all five columns: they were never asked, which is a
-- different fact from having declined.
ALTER TABLE "User"
  ADD COLUMN "termsAcceptedAt"   TIMESTAMP(3),
  ADD COLUMN "isMinor"           BOOLEAN,
  ADD COLUMN "guardianName"      TEXT,
  ADD COLUMN "guardianEmail"     TEXT,
  ADD COLUMN "guardianConsentAt" TIMESTAMP(3);
