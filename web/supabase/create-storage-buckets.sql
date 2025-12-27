-- =====================================================
-- Create Storage Buckets for TeqBook
-- =====================================================
-- This script creates the required storage buckets for
-- salon assets (logos) and user assets (avatars)
--
-- Run this in Supabase SQL Editor
-- =====================================================

-- Create user-assets bucket (for avatars)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'user-assets',
  'user-assets',
  true,
  2097152, -- 2 MB in bytes
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- Storage Policies (RLS) for user-assets (Avatar focus)
-- =====================================================

-- Drop existing policies if they exist (for idempotency)
DROP POLICY IF EXISTS "Users can upload their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can read avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatars" ON storage.objects;

-- Allow authenticated users to upload their own avatars
-- File path format: avatars/{userId}/{filename}
CREATE POLICY "Users can upload their own avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'user-assets' AND
  (storage.foldername(name))[1] = 'avatars' AND
  (storage.foldername(name))[2] = auth.uid()::text
);

-- Allow authenticated users to read avatars
CREATE POLICY "Users can read avatars"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'user-assets');

-- Allow authenticated users to delete their own avatars
-- File path format: avatars/{userId}/{filename}
CREATE POLICY "Users can delete their own avatars"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'user-assets' AND
  (storage.foldername(name))[1] = 'avatars' AND
  (storage.foldername(name))[2] = auth.uid()::text
);

-- =====================================================
-- Verification
-- =====================================================
-- After running this script, verify bucket exists:
-- SELECT id, name, public FROM storage.buckets WHERE id = 'user-assets';

