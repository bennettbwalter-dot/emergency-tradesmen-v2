-- Migration: Enable Row Level Security (RLS) for missing tables
-- Fixes security audit findings for tables exposed to PostgREST

-- 1. regional_cities
ALTER TABLE "public"."regional_cities" ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access for regional_cities"
ON "public"."regional_cities"
FOR SELECT
TO public
USING (true);

-- Allow admins (service_role) full access (implicitly allowed by default, but good to be explicit for RLS docs)
-- Supabase service_role bypasses RLS by default.

-- 2. trade_knowledge_base
ALTER TABLE "public"."trade_knowledge_base" ENABLE ROW LEVEL SECURITY;

-- Allow public read access (for similarity search)
CREATE POLICY "Allow public read access for trade_knowledge_base"
ON "public"."trade_knowledge_base"
FOR SELECT
TO public
USING (true);

-- Ensure there are no other tables in public without RLS
-- This migration ensures the specific tables identified in the audit are secured.

SELECT 'RLS enabled for regional_cities and trade_knowledge_base' as result;
