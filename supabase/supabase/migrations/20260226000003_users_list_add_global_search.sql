-- =====================================================
-- Extend get_users_paginated with broader search
-- =====================================================
-- Users table search should match relevant table fields,
-- including salon name, not only email.
-- =====================================================

DROP FUNCTION IF EXISTS get_users_paginated(JSONB, TEXT, TEXT, INTEGER, INTEGER);

CREATE OR REPLACE FUNCTION get_users_paginated(
  filters JSONB DEFAULT '{}',
  sort_col TEXT DEFAULT 'created_at',
  sort_dir TEXT DEFAULT 'desc',
  lim INTEGER DEFAULT 25,
  off INTEGER DEFAULT 0
)
RETURNS TABLE(
  user_id UUID,
  email TEXT,
  is_superadmin BOOLEAN,
  salon_id UUID,
  salon_name TEXT,
  user_created_at TIMESTAMPTZ,
  last_sign_in_at TIMESTAMPTZ,
  total_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  total BIGINT;
  q TEXT;
BEGIN
  -- Verify superadmin
  IF NOT EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.user_id = auth.uid() AND p.is_superadmin = true
  ) THEN
    RAISE EXCEPTION 'Only superadmins can call this function';
  END IF;

  q := NULLIF(trim(filters->>'search'), '');

  -- Get total count (with filters)
  SELECT COUNT(*) INTO total
  FROM profiles pr
  JOIN auth.users u ON u.id = pr.user_id
  LEFT JOIN salons s ON s.id = pr.salon_id
  WHERE (filters->>'is_superadmin' IS NULL OR pr.is_superadmin = (filters->>'is_superadmin')::BOOLEAN)
    AND (filters->>'salon_id' IS NULL OR pr.salon_id = (filters->>'salon_id')::UUID)
    AND (
      q IS NULL
      OR u.email ILIKE '%' || q || '%'
      OR COALESCE(s.name, '') ILIKE '%' || q || '%'
      OR COALESCE(pr.role::TEXT, '') ILIKE '%' || q || '%'
      OR COALESCE(pr.first_name, '') ILIKE '%' || q || '%'
      OR COALESCE(pr.last_name, '') ILIKE '%' || q || '%'
      OR CONCAT_WS(' ', COALESCE(pr.first_name, ''), COALESCE(pr.last_name, '')) ILIKE '%' || q || '%'
      OR CASE WHEN pr.is_superadmin THEN 'super admin' ELSE 'user' END ILIKE '%' || q || '%'
      OR TO_CHAR(u.created_at, 'YYYY-MM-DD HH24:MI') ILIKE '%' || q || '%'
      OR TO_CHAR(COALESCE(u.last_sign_in_at, u.created_at), 'YYYY-MM-DD HH24:MI') ILIKE '%' || q || '%'
      OR pr.user_id::TEXT ILIKE '%' || q || '%'
    );

  RETURN QUERY
  SELECT
    pr.user_id,
    u.email::TEXT,
    pr.is_superadmin,
    pr.salon_id,
    s.name AS salon_name,
    u.created_at AS user_created_at,
    u.last_sign_in_at,
    total AS total_count
  FROM profiles pr
  JOIN auth.users u ON u.id = pr.user_id
  LEFT JOIN salons s ON s.id = pr.salon_id
  WHERE (filters->>'is_superadmin' IS NULL OR pr.is_superadmin = (filters->>'is_superadmin')::BOOLEAN)
    AND (filters->>'salon_id' IS NULL OR pr.salon_id = (filters->>'salon_id')::UUID)
    AND (
      q IS NULL
      OR u.email ILIKE '%' || q || '%'
      OR COALESCE(s.name, '') ILIKE '%' || q || '%'
      OR COALESCE(pr.role::TEXT, '') ILIKE '%' || q || '%'
      OR COALESCE(pr.first_name, '') ILIKE '%' || q || '%'
      OR COALESCE(pr.last_name, '') ILIKE '%' || q || '%'
      OR CONCAT_WS(' ', COALESCE(pr.first_name, ''), COALESCE(pr.last_name, '')) ILIKE '%' || q || '%'
      OR CASE WHEN pr.is_superadmin THEN 'super admin' ELSE 'user' END ILIKE '%' || q || '%'
      OR TO_CHAR(u.created_at, 'YYYY-MM-DD HH24:MI') ILIKE '%' || q || '%'
      OR TO_CHAR(COALESCE(u.last_sign_in_at, u.created_at), 'YYYY-MM-DD HH24:MI') ILIKE '%' || q || '%'
      OR pr.user_id::TEXT ILIKE '%' || q || '%'
    )
  ORDER BY
    CASE WHEN sort_col = 'email' AND sort_dir = 'asc' THEN u.email END ASC,
    CASE WHEN sort_col = 'email' AND sort_dir = 'desc' THEN u.email END DESC,
    CASE WHEN sort_col = 'created_at' AND sort_dir = 'asc' THEN u.created_at END ASC,
    CASE WHEN sort_col = 'created_at' AND sort_dir = 'desc' THEN u.created_at END DESC,
    u.created_at DESC  -- fallback
  LIMIT lim
  OFFSET off;
END;
$$;

GRANT EXECUTE ON FUNCTION get_users_paginated(JSONB, TEXT, TEXT, INTEGER, INTEGER) TO authenticated;
