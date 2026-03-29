-- Add last_available_ping to businesses table
ALTER TABLE businesses 
ADD COLUMN IF NOT EXISTS last_available_ping TIMESTAMP WITH TIME ZONE;

-- Create an index for faster filtering
CREATE INDEX IF NOT EXISTS idx_businesses_last_available_ping ON businesses(last_available_ping);

-- Function to check if business is currently live (pinged within last hour)
CREATE OR REPLACE FUNCTION is_business_live(business_row businesses)
RETURNS boolean AS $$
BEGIN
  RETURN (business_row.last_available_ping > (NOW() - INTERVAL '1 hour'));
END;
$$ LANGUAGE plpgsql STABLE;
