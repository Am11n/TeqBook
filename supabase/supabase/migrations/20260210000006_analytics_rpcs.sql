-- =====================================================
-- Migration: Analytics RPCs (time series, cohorts, funnel)
-- =====================================================

-- Daily activity time series
CREATE OR REPLACE FUNCTION get_admin_activity_timeseries(
  metric TEXT DEFAULT 'bookings',
  period_days INT DEFAULT 30
)
RETURNS TABLE(day DATE, value BIGINT) AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND is_superadmin = true) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  IF metric = 'bookings' THEN
    RETURN QUERY
      SELECT d::DATE, COALESCE(COUNT(b.id), 0)::BIGINT
      FROM generate_series(CURRENT_DATE - (period_days || ' days')::INTERVAL, CURRENT_DATE, '1 day') d
      LEFT JOIN bookings b ON b.created_at::DATE = d::DATE
      GROUP BY d ORDER BY d;
  ELSIF metric = 'new_salons' THEN
    RETURN QUERY
      SELECT d::DATE, COALESCE(COUNT(s.id), 0)::BIGINT
      FROM generate_series(CURRENT_DATE - (period_days || ' days')::INTERVAL, CURRENT_DATE, '1 day') d
      LEFT JOIN salons s ON s.created_at::DATE = d::DATE
      GROUP BY d ORDER BY d;
  ELSIF metric = 'active_salons' THEN
    RETURN QUERY
      SELECT d::DATE, COALESCE(COUNT(DISTINCT b.salon_id), 0)::BIGINT
      FROM generate_series(CURRENT_DATE - (period_days || ' days')::INTERVAL, CURRENT_DATE, '1 day') d
      LEFT JOIN bookings b ON b.created_at::DATE = d::DATE
      GROUP BY d ORDER BY d;
  ELSE
    RAISE EXCEPTION 'Unknown metric: %', metric;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Activation funnel
CREATE OR REPLACE FUNCTION get_admin_activation_funnel(period_days INT DEFAULT 90)
RETURNS TABLE(step TEXT, count BIGINT) AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND is_superadmin = true) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  -- Step 1: Total salons created
  RETURN QUERY SELECT 'Created salon'::TEXT, COUNT(*)::BIGINT FROM salons WHERE created_at >= CURRENT_DATE - (period_days || ' days')::INTERVAL;
  -- Step 2: Added at least 1 employee
  RETURN QUERY SELECT 'Added employee'::TEXT, COUNT(DISTINCT e.salon_id)::BIGINT FROM employees e JOIN salons s ON s.id = e.salon_id WHERE s.created_at >= CURRENT_DATE - (period_days || ' days')::INTERVAL;
  -- Step 3: Added at least 1 service
  RETURN QUERY SELECT 'Added service'::TEXT, COUNT(DISTINCT sv.salon_id)::BIGINT FROM services sv JOIN salons s ON s.id = sv.salon_id WHERE s.created_at >= CURRENT_DATE - (period_days || ' days')::INTERVAL;
  -- Step 4: Got first booking
  RETURN QUERY SELECT 'First booking'::TEXT, COUNT(DISTINCT b.salon_id)::BIGINT FROM bookings b JOIN salons s ON s.id = b.salon_id WHERE s.created_at >= CURRENT_DATE - (period_days || ' days')::INTERVAL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Top salons by bookings
CREATE OR REPLACE FUNCTION get_admin_top_salons(period_days INT DEFAULT 30, lim INT DEFAULT 10)
RETURNS TABLE(salon_id UUID, salon_name TEXT, booking_count BIGINT, growth_pct NUMERIC) AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND is_superadmin = true) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  RETURN QUERY
    WITH current_period AS (
      SELECT b.salon_id, COUNT(*)::BIGINT AS cnt
      FROM bookings b
      WHERE b.created_at >= CURRENT_DATE - (period_days || ' days')::INTERVAL
      GROUP BY b.salon_id
    ),
    prev_period AS (
      SELECT b.salon_id, COUNT(*)::BIGINT AS cnt
      FROM bookings b
      WHERE b.created_at >= CURRENT_DATE - (2 * period_days || ' days')::INTERVAL
        AND b.created_at < CURRENT_DATE - (period_days || ' days')::INTERVAL
      GROUP BY b.salon_id
    )
    SELECT
      c.salon_id,
      s.name::TEXT,
      c.cnt,
      CASE WHEN COALESCE(p.cnt, 0) = 0 THEN 100.0
           ELSE ROUND(((c.cnt - p.cnt)::NUMERIC / p.cnt::NUMERIC) * 100, 1)
      END
    FROM current_period c
    JOIN salons s ON s.id = c.salon_id
    LEFT JOIN prev_period p ON p.salon_id = c.salon_id
    ORDER BY c.cnt DESC
    LIMIT lim;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Plan distribution
CREATE OR REPLACE FUNCTION get_admin_plan_distribution()
RETURNS TABLE(plan TEXT, count BIGINT) AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND is_superadmin = true) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;
  RETURN QUERY SELECT COALESCE(s.plan, 'starter')::TEXT, COUNT(*)::BIGINT FROM salons s GROUP BY COALESCE(s.plan, 'starter') ORDER BY count DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Salon cohort retention (week over week)
CREATE OR REPLACE FUNCTION get_admin_cohort_retention(period_weeks INT DEFAULT 8)
RETURNS TABLE(cohort_week DATE, week_offset INT, retention_pct NUMERIC) AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND is_superadmin = true) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  RETURN QUERY
    WITH salon_cohorts AS (
      SELECT id, DATE_TRUNC('week', created_at)::DATE AS cohort
      FROM salons
      WHERE created_at >= CURRENT_DATE - (period_weeks * 7 || ' days')::INTERVAL
    ),
    activity AS (
      SELECT DISTINCT b.salon_id, DATE_TRUNC('week', b.created_at)::DATE AS activity_week
      FROM bookings b
      WHERE b.created_at >= CURRENT_DATE - (period_weeks * 7 || ' days')::INTERVAL
    )
    SELECT
      sc.cohort,
      EXTRACT(WEEK FROM (a.activity_week - sc.cohort))::INT AS w_offset,
      ROUND(COUNT(DISTINCT a.salon_id)::NUMERIC / NULLIF(COUNT(DISTINCT sc.id), 0)::NUMERIC * 100, 1)
    FROM salon_cohorts sc
    LEFT JOIN activity a ON a.salon_id = sc.id AND a.activity_week >= sc.cohort
    GROUP BY sc.cohort, w_offset
    ORDER BY sc.cohort, w_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
