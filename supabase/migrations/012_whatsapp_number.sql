-- Migration: Add WhatsApp number field for premium subscribers
-- Run this in Supabase SQL Editor

-- Add WhatsApp number column to businesses
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS whatsapp_number TEXT;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_businesses_whatsapp ON businesses(whatsapp_number) WHERE whatsapp_number IS NOT NULL;

SELECT 'WhatsApp number field added!' as result;
