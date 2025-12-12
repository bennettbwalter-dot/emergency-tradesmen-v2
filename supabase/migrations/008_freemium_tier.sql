-- Migration: Add Freemium Tier Support
-- Run this AFTER 001_business_tables.sql

ALTER TABLE businesses 
ADD COLUMN IF NOT EXISTS tier TEXT DEFAULT 'free' CHECK (tier IN ('free', 'paid')),
ADD COLUMN IF NOT EXISTS priority_score INTEGER DEFAULT 0;

-- Index for efficient sorting of premium listings
CREATE INDEX IF NOT EXISTS idx_businesses_tier_priority ON businesses(tier, priority_score DESC);

-- Comment:
-- 'tier' defines the subscription level. 'paid' listings get priority.
-- 'priority_score' can be used for fine-grained ranking within the paid tier (e.g. ad spend, reputation).
