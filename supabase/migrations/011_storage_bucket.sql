-- Migration: Create storage bucket for business assets
-- Run this in Supabase SQL Editor

-- Create the storage bucket for business assets (logos, photos)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'business-assets',
    'business-assets',
    true,  -- Public bucket so images can be displayed
    5242880,  -- 5MB limit per file
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for business-assets bucket

-- Allow anyone to view files (public bucket)
DROP POLICY IF EXISTS "Public can view business assets" ON storage.objects;
CREATE POLICY "Public can view business assets" ON storage.objects 
    FOR SELECT USING (bucket_id = 'business-assets');

-- Allow authenticated users to upload to their business folder
DROP POLICY IF EXISTS "Users can upload business assets" ON storage.objects;
CREATE POLICY "Users can upload business assets" ON storage.objects 
    FOR INSERT WITH CHECK (
        bucket_id = 'business-assets' 
        AND auth.role() = 'authenticated'
    );

-- Allow users to update their uploads
DROP POLICY IF EXISTS "Users can update own assets" ON storage.objects;
CREATE POLICY "Users can update own assets" ON storage.objects 
    FOR UPDATE USING (
        bucket_id = 'business-assets' 
        AND auth.role() = 'authenticated'
    );

-- Allow users to delete their uploads
DROP POLICY IF EXISTS "Users can delete own assets" ON storage.objects;
CREATE POLICY "Users can delete own assets" ON storage.objects 
    FOR DELETE USING (
        bucket_id = 'business-assets' 
        AND auth.role() = 'authenticated'
    );

SELECT 'Storage bucket business-assets created!' as result;
