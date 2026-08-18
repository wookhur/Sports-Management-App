-- Optional consent to have an account's data used in research.
--
-- Deliberately nullable with no default and no backfill. NULL means "never
-- asked", which every account predating this migration is. Defaulting these
-- to false would be harmless; defaulting them to true, or backfilling either
-- way, would be recording a consent decision that nobody ever made.
ALTER TABLE "User" ADD COLUMN     "researchConsent" BOOLEAN,
ADD COLUMN     "researchConsentAt" TIMESTAMP(3);
