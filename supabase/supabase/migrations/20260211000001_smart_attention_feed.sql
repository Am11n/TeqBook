-- =====================================================
-- Smart Needs Attention Feed (v2 – safer UNION ALL)
-- =====================================================

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
  SELECT
    sub.item_id,
    sub.item_type,
    sub.entity_type,
    sub.entity_id,
    sub.entity_name,
    sub.severity,
    sub.title,
    sub.description,
    sub.created_at
  FROM (

    -- ── 1. Open support cases ─────────────────────────────
    SELECT
      'case-' || sc.id::TEXT        AS item_id,
      sc.type                       AS item_type,
      CASE WHEN sc.salon_id IS NOT NULL
        THEN 'salon'::TEXT
        ELSE 'user'::TEXT
      END                           AS entity_type,
      COALESCE(sc.salon_id, sc.user_id) AS entity_id,
      COALESCE(s.name, 'User ' || LEFT(sc.user_id::TEXT, 8)) AS entity_name,
      sc.priority                   AS severity,
      sc.title                      AS title,
      COALESCE(sc.description, '')  AS description,
      sc.created_at                 AS created_at
    FROM support_cases sc
    LEFT JOIN salons s ON s.id = sc.salon_id
    WHERE sc.status IN ('open', 'in_progress')

    UNION ALL

    -- ── 2. Inactive salons (14+ days no bookings) ────────
    SELECT
      'inactive-' || sa.id::TEXT,
      'onboarding_stuck'::TEXT,
      'salon'::TEXT,
      sa.id,
      sa.name,
      'medium'::TEXT,
      sa.name || ' inactive for 14+ days',
      'No bookings in the last 14 days'::TEXT,
      sa.created_at
    FROM salons sa
    WHERE sa.is_public = true
      AND NOT EXISTS (
        SELECT 1 FROM bookings b
        WHERE b.salon_id = sa.id
          AND b.created_at > NOW() - INTERVAL '14 days'
      )
      AND EXISTS (
        SELECT 1 FROM bookings b WHERE b.salon_id = sa.id
      )

    UNION ALL

    -- ── 3. Stuck onboarding (48h+ missing employees or services)
    SELECT
      'stuck-' || sa.id::TEXT,
      'onboarding_stuck'::TEXT,
      'salon'::TEXT,
      sa.id,
      sa.name,
      'high'::TEXT,
      sa.name || ' stuck on onboarding',
      CASE
        WHEN NOT EXISTS (SELECT 1 FROM employees e WHERE e.salon_id = sa.id)
          THEN 'No employees added after ' || EXTRACT(DAY FROM NOW() - sa.created_at)::INT::TEXT || ' days'
        WHEN NOT EXISTS (SELECT 1 FROM services sv WHERE sv.salon_id = sa.id)
          THEN 'No services added after ' || EXTRACT(DAY FROM NOW() - sa.created_at)::INT::TEXT || ' days'
        ELSE 'Onboarding incomplete after ' || EXTRACT(DAY FROM NOW() - sa.created_at)::INT::TEXT || ' days'
      END::TEXT,
      sa.created_at
    FROM salons sa
    WHERE sa.created_at < NOW() - INTERVAL '48 hours'
      AND (
        NOT EXISTS (SELECT 1 FROM employees e WHERE e.salon_id = sa.id)
        OR NOT EXISTS (SELECT 1 FROM services sv WHERE sv.salon_id = sa.id)
      )

    UNION ALL

    -- ── 4. Booking drop alerts (50%+ drop week-over-week) ─
    SELECT
      'drop-' || tw.sid::TEXT,
      'high_cancellation'::TEXT,
      'salon'::TEXT,
      tw.sid,
      sa.name,
      'high'::TEXT,
      sa.name || ' sudden booking drop',
      'Bookings dropped ' || ROUND((1.0 - tw.cnt::NUMERIC / GREATEST(lw.cnt, 1)) * 100)::TEXT || '% vs previous week',
      NOW()
    FROM (
      SELECT b.salon_id AS sid, COUNT(*)::INT AS cnt
      FROM bookings b
      WHERE b.created_at >= NOW() - INTERVAL '7 days'
      GROUP BY b.salon_id
    ) tw
    JOIN (
      SELECT b.salon_id AS sid, COUNT(*)::INT AS cnt
      FROM bookings b
      WHERE b.created_at >= NOW() - INTERVAL '14 days'
        AND b.created_at < NOW() - INTERVAL '7 days'
      GROUP BY b.salon_id
    ) lw ON lw.sid = tw.sid
    JOIN salons sa ON sa.id = tw.sid
    WHERE lw.cnt >= 5
      AND tw.cnt::NUMERIC / GREATEST(lw.cnt, 1) < 0.5

  ) sub
  ORDER BY
    CASE sub.severity
      WHEN 'critical' THEN 1
      WHEN 'high'     THEN 2
      WHEN 'medium'   THEN 3
      WHEN 'low'      THEN 4
      ELSE 5
    END,
    sub.created_at DESC
  LIMIT lim;
END;
$$;

COMMENT ON FUNCTION get_needs_attention_items(INTEGER) IS 'Smart attention feed: open cases, inactive salons, stuck onboarding, booking drops. Superadmin only.';
