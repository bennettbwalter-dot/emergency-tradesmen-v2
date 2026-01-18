-- Migration: Add data enrichment fields to businesses table
-- Created: 2026-01-02
-- Purpose: Support logos, reviews, and SEO metadata for enhanced contractor profiles

-- Add logo URL field
ALTER TABLE businesses 
ADD COLUMN IF NOT EXISTS logo_url TEXT;

-- Add reviews field (JSONB array for structured review data)
ALTER TABLE businesses 
ADD COLUMN IF NOT EXISTS reviews JSONB DEFAULT '[]'::jsonb;

-- Add SEO description field
ALTER TABLE businesses 
ADD COLUMN IF NOT EXISTS seo_description TEXT;

-- Add SEO keywords field (array of keywords)
ALTER TABLE businesses 
ADD COLUMN IF NOT EXISTS seo_keywords TEXT[];

-- Create GIN index on reviews for efficient querying
CREATE INDEX IF NOT EXISTS idx_businesses_reviews ON businesses USING GIN (reviews);

-- Create index on seo_keywords for search optimization
CREATE INDEX IF NOT EXISTS idx_businesses_seo_keywords ON businesses USING GIN (seo_keywords);

-- Add comment for documentation
COMMENT ON COLUMN businesses.logo_url IS 'URL to business logo image (from website or Google Maps)';
COMMENT ON COLUMN businesses.reviews IS 'Array of review objects from Google Maps with reviewer names and ratings';
COMMENT ON COLUMN businesses.seo_description IS 'Auto-generated SEO-optimized description for search engines';
COMMENT ON COLUMN businesses.seo_keywords IS 'Array of SEO keywords based on trade, city, and services';
