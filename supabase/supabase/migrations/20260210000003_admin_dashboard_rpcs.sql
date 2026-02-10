-- =====================================================
-- Admin Dashboard RPC Functions
-- =====================================================
-- Server-side aggregation functions for the admin dashboard.
-- All functions verify superadmin access via SECURITY DEFINER.
-- =====================================================

-- =====================================================
-- 1. get_admin_dashboard_kpis
-- =====================================================
-- Returns all KPI values + deltas for the dashboard in a single call.
-- period_days: 7 or 30

CREATE OR REPLACE FUNCTION get_admin_dashboard_kpis(period_days INTEGER DEFAULT 7)
RETURNS TABLE(
  active_salons BIGINT,
  active_salons_prev BIGINT,
  new_salons BIGINT,
  new_salons_prev BIGINT,
  activated_salons BIGINT,
  total_bookings BIGINT,
  total_bookings_prev BIGINT,
  open_support_cases BIGINT,
  total_users BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  period_start TIMESTAMPTZ := NOW() - (period_days || ' days')::INTERVAL;
  prev_period_start TIMESTAMPTZ := NOW() - (period_days * 2 || ' days')::INTERVAL;
BEGIN
  -- Verify superadmin
  IF NOT EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.user_id = auth.uid() AND p.is_superadmin = true
  ) THEN
    RAISE EXCEPTION 'Only superadmins can call this function';
  END IF;

  RETURN QUERY
  SELECT
    -- Active salons (have bookings in the period)
    (SELECT COUNT(DISTINCT b.salon_id)
     FROM bookings b
     WHERE b.created_at >= period_start)::BIGINT AS active_salons,

    -- Active salons previous period
    (SELECT COUNT(DISTINCT b.salon_id)
     FROM bookings b
     WHERE b.created_at >= prev_period_start
       AND b.created_at < period_start)::BIGINT AS active_salons_prev,

    -- New salons in period
    (SELECT COUNT(*)
     FROM salons s
     WHERE s.created_at >= period_start)::BIGINT AS new_salons,

    -- New salons previous period
    (SELECT COUNT(*)
     FROM salons s
     WHERE s.created_at >= prev_period_start
       AND s.created_at < period_start)::BIGINT AS new_salons_prev,

    -- Activated salons (have >= 1 employee + >= 1 service + >= 1 booking)
    (SELECT COUNT(*)
     FROM salons s
     WHERE EXISTS (SELECT 1 FROM employees e WHERE e.salon_id = s.id)
       AND EXISTS (SELECT 1 FROM services sv WHERE sv.salon_id = s.id)
       AND EXISTS (SELECT 1 FROM bookings b WHERE b.salon_id = s.id))::BIGINT AS activated_salons,

    -- Total bookings in period
    (SELECT COUNT(*)
     FROM bookings b
     WHERE b.created_at >= period_start)::BIGINT AS total_bookings,

    -- Total bookings previous period
    (SELECT COUNT(*)
     FROM bookings b
     WHERE b.created_at >= prev_period_start
       AND b.created_at < period_start)::BIGINT AS total_bookings_prev,

    -- Open support cases
    (SELECT COUNT(*)
     FROM support_cases sc
     WHERE sc.status IN ('open', 'in_progress'))::BIGINT AS open_support_cases,

    -- Total users
    (SELECT COUNT(DISTINCT user_id)
     FROM profiles)::BIGINT AS total_users;
END;
$$;

GRANT EXECUTE ON FUNCTION get_admin_dashboard_kpis(INTEGER) TO authenticated;

-- =====================================================
-- 2. get_admin_kpi_trend
-- =====================================================
-- Returns daily values for a specific metric over a period.
-- Used for sparklines.
-- metric: 'active_salons', 'new_salons', 'bookings'

CREATE OR REPLACE FUNCTION get_admin_kpi_trend(
  metric TEXT DEFAULT 'bookings',
  period_days INTEGER DEFAULT 7
)
RETURNS TABLE(
  day DATE,
  value BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verify superadmin
  IF NOT EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.user_id = auth.uid() AND p.is_superadmin = true
  ) THEN
    RAISE EXCEPTION 'Only superadmins can call this function';
  END IF;

  IF metric = 'bookings' THEN
    RETURN QUERY
    SELECT
      d.day::DATE,
      COALESCE(COUNT(b.id), 0)::BIGINT AS value
    FROM generate_series(
      (NOW() - (period_days || ' days')::INTERVAL)::DATE,
      NOW()::DATE,
      '1 day'::INTERVAL
    ) AS d(day)
    LEFT JOIN bookings b ON b.created_at::DATE = d.day::DATE
    GROUP BY d.day
    ORDER BY d.day;

  ELSIF metric = 'new_salons' THEN
    RETURN QUERY
    SELECT
      d.day::DATE,
      COALESCE(COUNT(s.id), 0)::BIGINT AS value
    FROM generate_series(
      (NOW() - (period_days || ' days')::INTERVAL)::DATE,
      NOW()::DATE,
      '1 day'::INTERVAL
    ) AS d(day)
    LEFT JOIN salons s ON s.created_at::DATE = d.day::DATE
    GROUP BY d.day
    ORDER BY d.day;

  ELSIF metric = 'active_salons' THEN
    RETURN QUERY
    SELECT
      d.day::DATE,
      COALESCE(COUNT(DISTINCT b.salon_id), 0)::BIGINT AS value
    FROM generate_series(
      (NOW() - (period_days || ' days')::INTERVAL)::DATE,
      NOW()::DATE,
      '1 day'::INTERVAL
    ) AS d(day)
    LEFT JOIN bookings b ON b.created_at::DATE = d.day::DATE
    GROUP BY d.day
    ORDER BY d.day;

  ELSE
    RAISE EXCEPTION 'Unknown metric: %', metric;
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION get_admin_kpi_trend(TEXT, INTEGER) TO authenticated;

-- =====================================================
-- 3. get_salons_paginated
-- =====================================================
-- Server-side filtered, sorted, paginated salon list.

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
    -- Get owner email (first profile linked to this salon)
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
    s.created_at DESC  -- fallback
  LIMIT lim
  OFFSET off;
END;
$$;

GRANT EXECUTE ON FUNCTION get_salons_paginated(JSONB, TEXT, TEXT, INTEGER, INTEGER) TO authenticated;

-- =====================================================
-- 4. get_users_paginated
-- =====================================================
-- Server-side filtered, sorted, paginated user list.

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
  FROM profiles pr
  JOIN auth.users u ON u.id = pr.user_id
  LEFT JOIN salons s ON s.id = pr.salon_id
  WHERE (filters->>'is_superadmin' IS NULL OR pr.is_superadmin = (filters->>'is_superadmin')::BOOLEAN)
    AND (filters->>'salon_id' IS NULL OR pr.salon_id = (filters->>'salon_id')::UUID)
    AND (filters->>'search' IS NULL OR u.email ILIKE '%' || (filters->>'search') || '%');

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
    AND (filters->>'search' IS NULL OR u.email ILIKE '%' || (filters->>'search') || '%')
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

-- =====================================================
-- 5. get_needs_attention_items
-- =====================================================
-- Returns items that need admin attention for the dashboard feed.

CREATE OR REPLACE FUNCTION get_needs_attention_items(lim INTEGER DEFAULT 10)
RETURNS TABLE(
  item_id TEXT,
  item_type TEXT,
  entity_type TEXT,
  entity_id UUID,
  entity_name TEXT,
  severity TEXT,
  title TEXT,
  description TEXT,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verify superadmin
  IF NOT EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.user_id = auth.uid() AND p.is_superadmin = true
  ) THEN
    RAISE EXCEPTION 'Only superadmins can call this function';
  END IF;

  RETURN QUERY

  -- Open support cases
  SELECT
    'case-' || sc.id::TEXT AS item_id,
    sc.type AS item_type,
    CASE WHEN sc.salon_id IS NOT NULL THEN 'salon' ELSE 'user' END AS entity_type,
    COALESCE(sc.salon_id, sc.user_id) AS entity_id,
    COALESCE(s.name, 'User ' || LEFT(sc.user_id::TEXT, 8)) AS entity_name,
    sc.priority AS severity,
    sc.title,
    COALESCE(sc.description, '') AS description,
    sc.created_at
  FROM support_cases sc
  LEFT JOIN salons s ON s.id = sc.salon_id
  WHERE sc.status IN ('open', 'in_progress')
  ORDER BY
    CASE sc.priority
      WHEN 'critical' THEN 1
      WHEN 'high' THEN 2
      WHEN 'medium' THEN 3
      WHEN 'low' THEN 4
    END,
    sc.created_at DESC
  LIMIT lim;
END;
$$;

GRANT EXECUTE ON FUNCTION get_needs_attention_items(INTEGER) TO authenticated;

-- =====================================================
-- 6. get_support_cases_list
-- =====================================================
-- Paginated support cases list for the Support Inbox.

CREATE OR REPLACE FUNCTION get_support_cases_list(
  filters JSONB DEFAULT '{}',
  lim INTEGER DEFAULT 25,
  off INTEGER DEFAULT 0
)
RETURNS TABLE(
  id UUID,
  salon_id UUID,
  salon_name TEXT,
  user_id UUID,
  type TEXT,
  status TEXT,
  priority TEXT,
  title TEXT,
  description TEXT,
  assignee_id UUID,
  assignee_email TEXT,
  metadata JSONB,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
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

  -- Count
  SELECT COUNT(*) INTO total
  FROM support_cases sc
  WHERE (filters->>'type' IS NULL OR sc.type = filters->>'type')
    AND (filters->>'status' IS NULL OR sc.status = filters->>'status')
    AND (filters->>'priority' IS NULL OR sc.priority = filters->>'priority')
    AND (filters->>'assignee_id' IS NULL OR sc.assignee_id = (filters->>'assignee_id')::UUID);

  RETURN QUERY
  SELECT
    sc.id,
    sc.salon_id,
    s.name AS salon_name,
    sc.user_id,
    sc.type,
    sc.status,
    sc.priority,
    sc.title,
    sc.description,
    sc.assignee_id,
    (SELECT u.email::TEXT FROM auth.users u WHERE u.id = sc.assignee_id) AS assignee_email,
    sc.metadata,
    sc.resolved_at,
    sc.created_at,
    sc.updated_at,
    total AS total_count
  FROM support_cases sc
  LEFT JOIN salons s ON s.id = sc.salon_id
  WHERE (filters->>'type' IS NULL OR sc.type = filters->>'type')
    AND (filters->>'status' IS NULL OR sc.status = filters->>'status')
    AND (filters->>'priority' IS NULL OR sc.priority = filters->>'priority')
    AND (filters->>'assignee_id' IS NULL OR sc.assignee_id = (filters->>'assignee_id')::UUID)
  ORDER BY
    CASE sc.priority
      WHEN 'critical' THEN 1
      WHEN 'high' THEN 2
      WHEN 'medium' THEN 3
      WHEN 'low' THEN 4
    END,
    sc.created_at DESC
  LIMIT lim
  OFFSET off;
END;
$$;

GRANT EXECUTE ON FUNCTION get_support_cases_list(JSONB, INTEGER, INTEGER) TO authenticated;

-- =====================================================
-- Comments
-- =====================================================
COMMENT ON FUNCTION get_admin_dashboard_kpis(INTEGER) IS 'Returns all dashboard KPI values + previous period for delta calculation. Superadmin only.';
COMMENT ON FUNCTION get_admin_kpi_trend(TEXT, INTEGER) IS 'Returns daily data points for sparkline charts. Metrics: bookings, new_salons, active_salons. Superadmin only.';
COMMENT ON FUNCTION get_salons_paginated(JSONB, TEXT, TEXT, INTEGER, INTEGER) IS 'Server-side paginated, filtered, sorted salon list with stats. Superadmin only.';
COMMENT ON FUNCTION get_users_paginated(JSONB, TEXT, TEXT, INTEGER, INTEGER) IS 'Server-side paginated, filtered, sorted user list. Superadmin only.';
COMMENT ON FUNCTION get_needs_attention_items(INTEGER) IS 'Returns items needing admin attention, ordered by severity. Superadmin only.';
COMMENT ON FUNCTION get_support_cases_list(JSONB, INTEGER, INTEGER) IS 'Paginated support cases list for the Support Inbox. Superadmin only.';
