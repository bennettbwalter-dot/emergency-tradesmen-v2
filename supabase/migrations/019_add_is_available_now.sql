-- Add is_available_now column to businesses table
-- This column tracks the explicit availability status set by business owners

ALTER TABLE businesses 
ADD COLUMN IF NOT EXISTS is_available_now BOOLEAN DEFAULT true;

-- Create an index for faster queries
CREATE INDEX IF NOT EXISTS idx_businesses_is_available_now 
ON businesses(is_available_now);

-- Add a comment explaining the column
COMMENT ON COLUMN businesses.is_available_now IS 'Explicit availability status set by business owner. Used in conjunction with last_available_ping for real-time availability tracking.';
