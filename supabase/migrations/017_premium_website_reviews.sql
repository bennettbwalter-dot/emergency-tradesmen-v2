-- Migration: Add website and hidden_reviews columns for Premium users
-- Allows premium users to add their website and hide specific reviews

-- Add website URL for premium users
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS website TEXT;

-- Add array to track hidden review IDs
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS hidden_reviews TEXT[] DEFAULT '{}';

-- Create index for efficient lookup
CREATE INDEX IF NOT EXISTS idx_businesses_website ON businesses(website) WHERE website IS NOT NULL;

SELECT 'Migration 017 completed: Added website and hidden_reviews columns' AS status;
