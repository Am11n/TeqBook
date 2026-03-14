-- =====================================================
-- Public profile portfolio + reviews (Phase 2/3 baseline)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.portfolio (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id UUID NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  caption TEXT,
  sort_order INTEGER,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_published BOOLEAN NOT NULL DEFAULT true,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_portfolio_salon_published
  ON public.portfolio (salon_id, is_published, is_featured, sort_order, created_at DESC)
  WHERE deleted_at IS NULL;

ALTER TABLE public.portfolio ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read published portfolio" ON public.portfolio;
CREATE POLICY "Public can read published portfolio"
ON public.portfolio
FOR SELECT
TO public
USING (is_published = true AND deleted_at IS NULL);

DROP POLICY IF EXISTS "Salon members manage portfolio" ON public.portfolio;
CREATE POLICY "Salon members manage portfolio"
ON public.portfolio
FOR ALL
TO authenticated
USING (
  salon_id IN (
    SELECT p.salon_id
    FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.salon_id IS NOT NULL
  )
)
WITH CHECK (
  salon_id IN (
    SELECT p.salon_id
    FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.salon_id IS NOT NULL
  )
);

CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id UUID NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  is_approved BOOLEAN NOT NULL DEFAULT true,
  source TEXT NOT NULL DEFAULT 'manual',
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reviews_salon_approved_created
  ON public.reviews (salon_id, is_approved, created_at DESC)
  WHERE deleted_at IS NULL;

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read approved reviews" ON public.reviews;
CREATE POLICY "Public can read approved reviews"
ON public.reviews
FOR SELECT
TO public
USING (is_approved = true AND deleted_at IS NULL);

DROP POLICY IF EXISTS "Salon members manage reviews" ON public.reviews;
CREATE POLICY "Salon members manage reviews"
ON public.reviews
FOR ALL
TO authenticated
USING (
  salon_id IN (
    SELECT p.salon_id
    FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.salon_id IS NOT NULL
  )
)
WITH CHECK (
  salon_id IN (
    SELECT p.salon_id
    FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.salon_id IS NOT NULL
  )
);

CREATE OR REPLACE FUNCTION public.create_salon_review(
  p_salon_id UUID,
  p_customer_name TEXT,
  p_rating INTEGER,
  p_comment TEXT DEFAULT NULL,
  p_booking_id UUID DEFAULT NULL
)
RETURNS public.reviews
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_review public.reviews;
BEGIN
  IF p_rating < 1 OR p_rating > 5 THEN
    RAISE EXCEPTION 'rating must be between 1 and 5';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.salon_id = p_salon_id
      AND p.salon_id IS NOT NULL
  ) THEN
    RAISE EXCEPTION 'Not allowed to create review for this salon';
  END IF;

  INSERT INTO public.reviews (
    salon_id,
    booking_id,
    customer_name,
    rating,
    comment,
    is_approved,
    source
  )
  VALUES (
    p_salon_id,
    p_booking_id,
    p_customer_name,
    p_rating,
    NULLIF(TRIM(COALESCE(p_comment, '')), ''),
    true,
    'manual'
  )
  RETURNING * INTO v_review;

  RETURN v_review;
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_salon_review(UUID, TEXT, INTEGER, TEXT, UUID) TO authenticated;

-- Storage policies for portfolio/covers in existing salon-assets bucket
DROP POLICY IF EXISTS "Salon members can upload portfolio images" ON storage.objects;
DROP POLICY IF EXISTS "Salon members can delete portfolio images" ON storage.objects;
DROP POLICY IF EXISTS "Salon members can upload cover images" ON storage.objects;
DROP POLICY IF EXISTS "Salon members can delete cover images" ON storage.objects;

CREATE POLICY "Salon members can upload portfolio images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'salon-assets'
  AND (storage.foldername(name))[1] = 'portfolio'
  AND (storage.foldername(name))[2] IN (
    SELECT p.salon_id::text
    FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.salon_id IS NOT NULL
  )
);

CREATE POLICY "Salon members can delete portfolio images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'salon-assets'
  AND (storage.foldername(name))[1] = 'portfolio'
  AND (storage.foldername(name))[2] IN (
    SELECT p.salon_id::text
    FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.salon_id IS NOT NULL
  )
);

CREATE POLICY "Salon members can upload cover images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'salon-assets'
  AND (storage.foldername(name))[1] = 'covers'
  AND (storage.foldername(name))[2] IN (
    SELECT p.salon_id::text
    FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.salon_id IS NOT NULL
  )
);

CREATE POLICY "Salon members can delete cover images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'salon-assets'
  AND (storage.foldername(name))[1] = 'covers'
  AND (storage.foldername(name))[2] IN (
    SELECT p.salon_id::text
    FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.salon_id IS NOT NULL
  )
);
