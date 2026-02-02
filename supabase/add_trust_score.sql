-- Add trust_score column for Master Prompt Execution
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS trust_score INTEGER DEFAULT 1;

-- Add index for filtering/sorting by trust score
CREATE INDEX IF NOT EXISTS idx_businesses_trust_score ON businesses(trust_score);

COMMENT ON COLUMN businesses.trust_score IS '1-5 assessment based on real-ness, contact info, socials, and reviews.';
