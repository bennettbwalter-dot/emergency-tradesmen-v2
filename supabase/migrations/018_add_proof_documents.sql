-- Add proof_documents column to store array of URLs
ALTER TABLE businesses 
ADD COLUMN IF NOT EXISTS proof_documents JSONB DEFAULT '[]'::jsonb;

-- Update the claim_business function to accept proof documents
CREATE OR REPLACE FUNCTION claim_business(
    business_id_param TEXT, 
    contact_email_param TEXT, 
    contact_phone_param TEXT,
    proof_docs_param JSONB DEFAULT '[]'::jsonb
)
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
    proof_documents = proof_docs_param,
    updated_at = NOW()
  WHERE id = business_id_param;

  RETURN jsonb_build_object('success', true, 'message', 'Business claimed successfully');
END;
$$;
