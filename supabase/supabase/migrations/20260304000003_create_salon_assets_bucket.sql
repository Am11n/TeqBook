-- =====================================================
-- Create salon-assets bucket for branding logos
-- =====================================================
-- Required by dashboard branding logo upload flow.

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'salon-assets',
  'salon-assets',
  true,
  5242880, -- 5 MB
  ARRAY['image/*']
)
ON CONFLICT (id) DO NOTHING;

-- Idempotent policy creation
DROP POLICY IF EXISTS "Salon members can upload salon logos" ON storage.objects;
DROP POLICY IF EXISTS "Public can read salon logos" ON storage.objects;
DROP POLICY IF EXISTS "Salon members can delete salon logos" ON storage.objects;

-- Upload path format: logos/{salonId}/{filename}
CREATE POLICY "Salon members can upload salon logos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'salon-assets'
  AND (storage.foldername(name))[1] = 'logos'
  AND (storage.foldername(name))[2] IN (
    SELECT p.salon_id::text
    FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.salon_id IS NOT NULL
  )
);

CREATE POLICY "Public can read salon logos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'salon-assets');

CREATE POLICY "Salon members can delete salon logos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'salon-assets'
  AND (storage.foldername(name))[1] = 'logos'
  AND (storage.foldername(name))[2] IN (
    SELECT p.salon_id::text
    FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.salon_id IS NOT NULL
  )
);
