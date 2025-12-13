-- Migration: Add Premium Profile Location Support
-- Adds columns for multi-location support and plan type tracking

-- Add selected_locations array for storing user's chosen locations
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS selected_locations TEXT[] DEFAULT '{}';

-- Add plan_type to track which pricing tier: 'basic' (£29) or 'pro' (£99)
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS plan_type TEXT DEFAULT 'basic';

-- Create index for efficient location queries
CREATE INDEX IF NOT EXISTS idx_businesses_selected_locations ON businesses USING GIN(selected_locations);

-- Update RLS policy to allow owners to select locations
DROP POLICY IF EXISTS "Owners can update selected_locations" ON businesses;
CREATE POLICY "Owners can update selected_locations" ON businesses
  FOR UPDATE
  TO authenticated
  USING (owner_user_id = auth.uid())
  WITH CHECK (owner_user_id = auth.uid());

SELECT 'Migration 016 completed: Added selected_locations and plan_type columns' AS status;
