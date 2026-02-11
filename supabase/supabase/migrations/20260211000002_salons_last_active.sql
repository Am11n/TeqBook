-- =====================================================
-- Add last_active to get_salons_paginated
-- =====================================================
-- last_active = most recent booking created_at for the salon.
-- Also adds sorting support for last_active.
-- =====================================================

CREATE OR REPLACE FUNCTION get_salons_paginated(
  filters JSONB DEFAULT '{}',
  sort_col TEXT DEFAULT 'created_at',
  sort_dir TEXT DEFAULT 'desc',
  lim INTEGER DEFAULT 25,
  off INTEGER DEFAULT 0
)
RETURNS TABLE(
  id UUID,
  name TEXT,
  slug TEXT,
  plan TEXT,
  is_public BOOLEAN,
  salon_type TEXT,
  preferred_language TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  owner_email TEXT,
  employee_count BIGINT,
  booking_count_7d BIGINT,
  last_active TIMESTAMPTZ,
  total_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  total BIGINT;
BEGIN
  -- Verify superadmin
  IF NOT EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.user_id = auth.uid() AND p.is_superadmin = true
  ) THEN
    RAISE EXCEPTION 'Only superadmins can call this function';
  END IF;

  -- Get total count (with filters)
  SELECT COUNT(*) INTO total
  FROM salons s
  WHERE (filters->>'plan' IS NULL OR s.plan::TEXT = filters->>'plan')
    AND (filters->>'is_public' IS NULL OR s.is_public = (filters->>'is_public')::BOOLEAN)
    AND (filters->>'salon_type' IS NULL OR s.salon_type = filters->>'salon_type')
    AND (filters->>'search' IS NULL OR s.name ILIKE '%' || (filters->>'search') || '%')
    AND (filters->>'created_after' IS NULL OR s.created_at >= (filters->>'created_after')::TIMESTAMPTZ)
    AND (filters->>'created_before' IS NULL OR s.created_at <= (filters->>'created_before')::TIMESTAMPTZ);

  -- Return paginated results
  RETURN QUERY
  SELECT
    s.id,
    s.name,
    s.slug,
    s.plan::TEXT,
    s.is_public,
    s.salon_type,
    s.preferred_language,
    s.created_at,
    s.updated_at,
    -- Owner email
    (SELECT u.email::TEXT
     FROM profiles pr
     JOIN auth.users u ON u.id = pr.user_id
     WHERE pr.salon_id = s.id
     LIMIT 1) AS owner_email,
    -- Employee count
    (SELECT COUNT(*)
     FROM employees e
     WHERE e.salon_id = s.id)::BIGINT AS employee_count,
    -- Bookings last 7 days
    (SELECT COUNT(*)
     FROM bookings b
     WHERE b.salon_id = s.id
       AND b.created_at >= NOW() - INTERVAL '7 days')::BIGINT AS booking_count_7d,
    -- Last active: most recent booking
    (SELECT MAX(b.created_at)
     FROM bookings b
     WHERE b.salon_id = s.id) AS last_active,
    total AS total_count
  FROM salons s
  WHERE (filters->>'plan' IS NULL OR s.plan::TEXT = filters->>'plan')
    AND (filters->>'is_public' IS NULL OR s.is_public = (filters->>'is_public')::BOOLEAN)
    AND (filters->>'salon_type' IS NULL OR s.salon_type = filters->>'salon_type')
    AND (filters->>'search' IS NULL OR s.name ILIKE '%' || (filters->>'search') || '%')
    AND (filters->>'created_after' IS NULL OR s.created_at >= (filters->>'created_after')::TIMESTAMPTZ)
    AND (filters->>'created_before' IS NULL OR s.created_at <= (filters->>'created_before')::TIMESTAMPTZ)
  ORDER BY
    CASE WHEN sort_col = 'name' AND sort_dir = 'asc' THEN s.name END ASC,
    CASE WHEN sort_col = 'name' AND sort_dir = 'desc' THEN s.name END DESC,
    CASE WHEN sort_col = 'created_at' AND sort_dir = 'asc' THEN s.created_at END ASC,
    CASE WHEN sort_col = 'created_at' AND sort_dir = 'desc' THEN s.created_at END DESC,
    CASE WHEN sort_col = 'plan' AND sort_dir = 'asc' THEN s.plan::TEXT END ASC,
    CASE WHEN sort_col = 'plan' AND sort_dir = 'desc' THEN s.plan::TEXT END DESC,
    s.created_at DESC
  LIMIT lim
  OFFSET off;
END;
$$;

COMMENT ON FUNCTION get_salons_paginated(JSONB, TEXT, TEXT, INTEGER, INTEGER) IS 'Paginated salon list with stats and last_active. Superadmin only.';
