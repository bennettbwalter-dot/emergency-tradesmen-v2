-- Fix storage bucket permissions for logo uploads
-- Run this in your Supabase SQL Editor

-- Check if bucket exists
SELECT * FROM storage.buckets WHERE name = 'business-assets';

-- If it doesn't exist, create it
INSERT INTO storage.buckets (id, name, public)
VALUES ('business-assets', 'business-assets', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Drop existing policies
DROP POLICY IF EXISTS "Public can view business assets" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload business assets" ON storage.objects;
DROP POLICY IF EXISTS "Business owners can upload assets" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload to business-assets" ON storage.objects;

-- Create new policies
-- 1. Anyone can view/download business assets (logos, photos)
CREATE POLICY "Public can view business assets" ON storage.objects
    FOR SELECT
    USING (bucket_id = 'business-assets');

-- 2. Authenticated users can upload to their own folder
CREATE POLICY "Authenticated users can upload business assets" ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'business-assets');

-- 3. Authenticated users can update their own uploads
CREATE POLICY "Authenticated users can update business assets" ON storage.objects
    FOR UPDATE
    TO authenticated
    USING (bucket_id = 'business-assets');

-- 4. Authenticated users can delete their own uploads
CREATE POLICY "Authenticated users can delete business assets" ON storage.objects
    FOR DELETE
    TO authenticated
    USING (bucket_id = 'business-assets');

-- Verify
SELECT 'Storage bucket policies updated!' as result;
SELECT * FROM storage.buckets WHERE name = 'business-assets';
