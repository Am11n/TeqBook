# Supabase Storage Setup Guide

This guide explains how to set up Supabase Storage buckets for TeqBook.

## Required Buckets

TeqBook requires two storage buckets:

1. **`salon-assets`** - For salon logos and branding assets
2. **`user-assets`** - For user avatars

## Setup Instructions

### Option 1: Via Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **Storage** in the left sidebar
3. Click **"New bucket"**
4. Create the following buckets:

#### Bucket 1: `salon-assets`
- **Name**: `salon-assets`
- **Public bucket**: ✅ Yes (checked)
- **File size limit**: 5 MB
- **Allowed MIME types**: `image/*`

#### Bucket 2: `user-assets`
- **Name**: `user-assets`
- **Public bucket**: ✅ Yes (checked)
- **File size limit**: 2 MB
- **Allowed MIME types**: `image/jpeg,image/jpg,image/png,image/webp`

### Option 2: Via SQL (Alternative)

You can also create buckets using SQL in the Supabase SQL Editor:

```sql
-- Create salon-assets bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'salon-assets',
  'salon-assets',
  true,
  5242880, -- 5 MB in bytes
  ARRAY['image/*']
)
ON CONFLICT (id) DO NOTHING;

-- Create user-assets bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'user-assets',
  'user-assets',
  true,
  2097152, -- 2 MB in bytes
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;
```

## Storage Policies (RLS)

After creating the buckets, you need to set up Row Level Security (RLS) policies to control access.

### For `salon-assets` bucket:

```sql
-- Allow authenticated users to upload logos for their salon
CREATE POLICY "Users can upload salon logos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'salon-assets' AND
  (storage.foldername(name))[1] = (SELECT salon_id::text FROM profiles WHERE user_id = auth.uid())
);

-- Allow authenticated users to read salon logos
CREATE POLICY "Users can read salon logos"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'salon-assets');

-- Allow authenticated users to delete their salon logos
CREATE POLICY "Users can delete salon logos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'salon-assets' AND
  (storage.foldername(name))[1] = (SELECT salon_id::text FROM profiles WHERE user_id = auth.uid())
);
```

### For `user-assets` bucket:

```sql
-- Allow authenticated users to upload their own avatars
CREATE POLICY "Users can upload their own avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'user-assets' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to read avatars
CREATE POLICY "Users can read avatars"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'user-assets');

-- Allow authenticated users to delete their own avatars
CREATE POLICY "Users can delete their own avatars"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'user-assets' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

## Verification

After setting up the buckets, verify they exist:

1. Go to **Storage** in Supabase Dashboard
2. You should see both `salon-assets` and `user-assets` buckets listed
3. Try uploading an avatar in the profile page to test

## Troubleshooting

### "Bucket not found" error

- Make sure both buckets are created
- Verify bucket names match exactly: `salon-assets` and `user-assets`
- Check that buckets are set to **Public**

### "Permission denied" error

- Make sure RLS policies are created
- Verify the user is authenticated
- Check that policies allow the specific operation (INSERT, SELECT, DELETE)

### Files not accessible via URL

- Ensure buckets are set to **Public**
- Check that the file path matches the expected structure:
  - Salon logos: `logos/{salonId}/{filename}`
  - User avatars: `avatars/{userId}/{filename}`

