-- Add owner_id and claim_status to businesses table
ALTER TABLE businesses 
ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS claim_status TEXT DEFAULT 'unclaimed' CHECK (claim_status IN ('unclaimed', 'pending', 'verified'));

-- create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_businesses_owner_id ON businesses(owner_id);
CREATE INDEX IF NOT EXISTS idx_businesses_claim_status ON businesses(claim_status);

-- Update RLS policies to allow reading claim status
-- (Already covered by "Public can read verified businesses" if we update it, but we need public to see UNVERIFIED businesses too if we want them to claim them? 
-- Actually, currently "Public can read verified businesses" restricts visibility. 
-- We might need to allow public to see BASIC info of unverified businesses so they can claim them.
-- OR, we only allow searching them.
-- Let's enable reading claim_status for everyone so the UI knows to show the button.)

-- Actually, looking at setup-complete.sql:
-- CREATE POLICY "Public can read verified businesses" ON businesses FOR SELECT USING (verified = true OR auth.role() = 'authenticated');
-- This means unauthenticated users CANNOT see unverified businesses.
-- This is fine, users might need to login to claim, or we just rely on them finding the page via search which might filtering unverified?
-- If they can't see the page, they can't claim it.
-- We might need to adjust the policy to allow seeing the business page if you have the direct link? Or just allow public to see all businesses?
-- For now, I will NOT change the visibility policy drastically, but ensure AUTHENTICATED users (which the claimer will be) can update the record.

-- Allow authenticated users to UPDATE the business if they are the owner (or if they are claiming it - wait, if they claim it, they don't own it yet)
-- We need a function to "claim" a business which sets the status to pending and owner_id to the caller.

CREATE OR REPLACE FUNCTION claim_business(business_id_param TEXT, contact_email_param TEXT, contact_phone_param TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  biz_record RECORD;
BEGIN
  -- Check if business exists and is unclaimed
  SELECT * INTO biz_record FROM businesses WHERE id = business_id_param;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Business not found';
  END IF;

  IF biz_record.claim_status != 'unclaimed' AND biz_record.claim_status IS NOT NULL THEN
    RAISE EXCEPTION 'Business is already claimed or pending verification';
  END IF;

  -- Update the business
  UPDATE businesses 
  SET 
    owner_id = auth.uid(),
    claim_status = 'pending',
    email = COALESCE(email, contact_email_param), -- update email if missing
    phone = COALESCE(phone, contact_phone_param), -- update phone if missing
    updated_at = NOW()
  WHERE id = business_id_param;

  RETURN jsonb_build_object('success', true, 'message', 'Business claimed successfully');
END;
$$;
