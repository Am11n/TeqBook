-- =====================================================
-- Reports & Analytics RPC Functions
-- =====================================================
-- This SQL script creates RPC functions for reports and analytics
-- These functions provide aggregated data for the reports dashboard
--
-- Run this in Supabase SQL Editor
-- =====================================================

-- =====================================================
-- 1. Total Bookings
-- =====================================================
-- Returns total count of bookings for a salon
-- Can filter by status, date range, and employee
DROP FUNCTION IF EXISTS rpc_total_bookings(UUID, TEXT, TIMESTAMPTZ, TIMESTAMPTZ, UUID);

CREATE OR REPLACE FUNCTION rpc_total_bookings(
  p_salon_id UUID,
  p_status TEXT DEFAULT NULL,
  p_start_date TIMESTAMPTZ DEFAULT NULL,
  p_end_date TIMESTAMPTZ DEFAULT NULL,
  p_employee_id UUID DEFAULT NULL
)
RETURNS TABLE(total_count BIGINT)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verify user has access to this salon
  IF NOT EXISTS (
    SELECT 1 FROM profiles
    WHERE user_id = auth.uid()
    AND (salon_id = p_salon_id OR is_superadmin = TRUE)
  ) THEN
    RAISE EXCEPTION 'Access denied to salon';
  END IF;

  RETURN QUERY
  SELECT COUNT(*)::BIGINT as total_count
  FROM bookings b
  WHERE b.salon_id = p_salon_id
    AND (p_status IS NULL OR b.status = p_status)
    AND (p_start_date IS NULL OR b.start_time >= p_start_date)
    AND (p_end_date IS NULL OR b.start_time <= p_end_date)
    AND (p_employee_id IS NULL OR b.employee_id = p_employee_id);
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION rpc_total_bookings(UUID, TEXT, TIMESTAMPTZ, TIMESTAMPTZ, UUID) TO authenticated;

-- =====================================================
-- 2. Revenue by Month
-- =====================================================
-- Returns revenue grouped by month
-- Only counts completed bookings
DROP FUNCTION IF EXISTS rpc_revenue_by_month(UUID, TIMESTAMPTZ, TIMESTAMPTZ, UUID);

CREATE OR REPLACE FUNCTION rpc_revenue_by_month(
  p_salon_id UUID,
  p_start_date TIMESTAMPTZ DEFAULT NULL,
  p_end_date TIMESTAMPTZ DEFAULT NULL,
  p_employee_id UUID DEFAULT NULL
)
RETURNS TABLE(
  month DATE,
  revenue_cents BIGINT,
  booking_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verify user has access to this salon
  IF NOT EXISTS (
    SELECT 1 FROM profiles
    WHERE user_id = auth.uid()
    AND (salon_id = p_salon_id OR is_superadmin = TRUE)
  ) THEN
    RAISE EXCEPTION 'Access denied to salon';
  END IF;

  RETURN QUERY
  SELECT 
    DATE_TRUNC('month', b.start_time)::DATE as month,
    COALESCE(SUM(s.price_cents), 0)::BIGINT as revenue_cents,
    COUNT(*)::BIGINT as booking_count
  FROM bookings b
  INNER JOIN services s ON b.service_id = s.id
  WHERE b.salon_id = p_salon_id
    AND b.status = 'completed'
    AND (p_start_date IS NULL OR b.start_time >= p_start_date)
    AND (p_end_date IS NULL OR b.start_time <= p_end_date)
    AND (p_employee_id IS NULL OR b.employee_id = p_employee_id)
  GROUP BY DATE_TRUNC('month', b.start_time)
  ORDER BY month ASC;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION rpc_revenue_by_month(UUID, TIMESTAMPTZ, TIMESTAMPTZ, UUID) TO authenticated;

-- =====================================================
-- 3. Bookings per Service
-- =====================================================
-- Returns booking count and revenue per service
DROP FUNCTION IF EXISTS rpc_bookings_per_service(UUID, TIMESTAMPTZ, TIMESTAMPTZ, UUID);

CREATE OR REPLACE FUNCTION rpc_bookings_per_service(
  p_salon_id UUID,
  p_start_date TIMESTAMPTZ DEFAULT NULL,
  p_end_date TIMESTAMPTZ DEFAULT NULL,
  p_employee_id UUID DEFAULT NULL
)
RETURNS TABLE(
  service_id UUID,
  service_name TEXT,
  booking_count BIGINT,
  revenue_cents BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verify user has access to this salon
  IF NOT EXISTS (
    SELECT 1 FROM profiles
    WHERE user_id = auth.uid()
    AND (salon_id = p_salon_id OR is_superadmin = TRUE)
  ) THEN
    RAISE EXCEPTION 'Access denied to salon';
  END IF;

  RETURN QUERY
  SELECT 
    s.id as service_id,
    s.name as service_name,
    COUNT(*)::BIGINT as booking_count,
    COALESCE(SUM(CASE WHEN b.status = 'completed' THEN s.price_cents ELSE 0 END), 0)::BIGINT as revenue_cents
  FROM bookings b
  INNER JOIN services s ON b.service_id = s.id
  WHERE b.salon_id = p_salon_id
    AND (p_start_date IS NULL OR b.start_time >= p_start_date)
    AND (p_end_date IS NULL OR b.start_time <= p_end_date)
    AND (p_employee_id IS NULL OR b.employee_id = p_employee_id)
  GROUP BY s.id, s.name
  ORDER BY booking_count DESC;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION rpc_bookings_per_service(UUID, TIMESTAMPTZ, TIMESTAMPTZ, UUID) TO authenticated;

-- =====================================================
-- 4. Capacity Utilisation
-- =====================================================
-- Returns capacity utilisation metrics
-- Compares booked time slots vs available time slots
DROP FUNCTION IF EXISTS rpc_capacity_utilisation(UUID, TIMESTAMPTZ, TIMESTAMPTZ, UUID);

CREATE OR REPLACE FUNCTION rpc_capacity_utilisation(
  p_salon_id UUID,
  p_start_date TIMESTAMPTZ DEFAULT NULL,
  p_end_date TIMESTAMPTZ DEFAULT NULL,
  p_employee_id UUID DEFAULT NULL
)
RETURNS TABLE(
  total_hours_booked NUMERIC,
  total_hours_available NUMERIC,
  utilisation_percentage NUMERIC,
  total_bookings BIGINT,
  average_booking_duration_minutes NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_start_date TIMESTAMPTZ;
  v_end_date TIMESTAMPTZ;
  v_total_hours_booked NUMERIC;
  v_total_hours_available NUMERIC;
  v_total_bookings BIGINT;
  v_avg_duration NUMERIC;
BEGIN
  -- Verify user has access to this salon
  IF NOT EXISTS (
    SELECT 1 FROM profiles
    WHERE user_id = auth.uid()
    AND (salon_id = p_salon_id OR is_superadmin = TRUE)
  ) THEN
    RAISE EXCEPTION 'Access denied to salon';
  END IF;

  -- Set default date range to last 30 days if not provided
  v_start_date := COALESCE(p_start_date, NOW() - INTERVAL '30 days');
  v_end_date := COALESCE(p_end_date, NOW());

  -- Calculate total hours booked (only confirmed/completed bookings)
  SELECT 
    COALESCE(SUM(EXTRACT(EPOCH FROM (end_time - start_time)) / 3600.0), 0),
    COUNT(*),
    COALESCE(AVG(EXTRACT(EPOCH FROM (end_time - start_time)) / 60.0), 0)
  INTO v_total_hours_booked, v_total_bookings, v_avg_duration
  FROM bookings
  WHERE salon_id = p_salon_id
    AND status IN ('confirmed', 'completed', 'scheduled')
    AND start_time >= v_start_date
    AND start_time <= v_end_date
    AND (p_employee_id IS NULL OR employee_id = p_employee_id);

  -- Calculate total available hours
  -- This is a simplified calculation: assumes 8 hours per day for all active employees
  -- In a real scenario, this would consider opening hours and employee shifts
  SELECT 
    COALESCE(
      COUNT(DISTINCT DATE(start_time)) * 
      COUNT(DISTINCT employee_id) * 
      8.0, -- 8 hours per day per employee
      0
    )
  INTO v_total_hours_available
  FROM bookings
  WHERE salon_id = p_salon_id
    AND start_time >= v_start_date
    AND start_time <= v_end_date
    AND (p_employee_id IS NULL OR employee_id = p_employee_id);

  -- If no bookings, use employee count * days * 8 hours
  IF v_total_hours_available = 0 THEN
    SELECT 
      COALESCE(
        (v_end_date::DATE - v_start_date::DATE + 1) * 
        COUNT(*) * 
        8.0,
        0
      )
    INTO v_total_hours_available
    FROM employees
    WHERE salon_id = p_salon_id
      AND is_active = TRUE
      AND (p_employee_id IS NULL OR id = p_employee_id);
  END IF;

  -- Calculate utilisation percentage
  RETURN QUERY
  SELECT 
    v_total_hours_booked,
    v_total_hours_available,
    CASE 
      WHEN v_total_hours_available > 0 
      THEN (v_total_hours_booked / v_total_hours_available * 100.0)
      ELSE 0
    END as utilisation_percentage,
    v_total_bookings,
    v_avg_duration;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION rpc_capacity_utilisation(UUID, TIMESTAMPTZ, TIMESTAMPTZ, UUID) TO authenticated;

-- =====================================================
-- Usage Examples:
-- =====================================================
-- -- Total bookings
-- SELECT * FROM rpc_total_bookings('salon-id'::UUID);
-- SELECT * FROM rpc_total_bookings('salon-id'::UUID, 'completed');
-- SELECT * FROM rpc_total_bookings('salon-id'::UUID, NULL, '2024-01-01'::TIMESTAMPTZ, '2024-12-31'::TIMESTAMPTZ);
-- SELECT * FROM rpc_total_bookings('salon-id'::UUID, NULL, '2024-01-01'::TIMESTAMPTZ, '2024-12-31'::TIMESTAMPTZ, 'employee-id'::UUID);
--
-- -- Revenue by month
-- SELECT * FROM rpc_revenue_by_month('salon-id'::UUID);
-- SELECT * FROM rpc_revenue_by_month('salon-id'::UUID, '2024-01-01'::TIMESTAMPTZ, '2024-12-31'::TIMESTAMPTZ);
-- SELECT * FROM rpc_revenue_by_month('salon-id'::UUID, '2024-01-01'::TIMESTAMPTZ, '2024-12-31'::TIMESTAMPTZ, 'employee-id'::UUID);
--
-- -- Bookings per service
-- SELECT * FROM rpc_bookings_per_service('salon-id'::UUID);
-- SELECT * FROM rpc_bookings_per_service('salon-id'::UUID, '2024-01-01'::TIMESTAMPTZ, '2024-12-31'::TIMESTAMPTZ);
-- SELECT * FROM rpc_bookings_per_service('salon-id'::UUID, '2024-01-01'::TIMESTAMPTZ, '2024-12-31'::TIMESTAMPTZ, 'employee-id'::UUID);
--
-- -- Capacity utilisation
-- SELECT * FROM rpc_capacity_utilisation('salon-id'::UUID);
-- SELECT * FROM rpc_capacity_utilisation('salon-id'::UUID, '2024-01-01'::TIMESTAMPTZ, '2024-12-31'::TIMESTAMPTZ);
-- SELECT * FROM rpc_capacity_utilisation('salon-id'::UUID, '2024-01-01'::TIMESTAMPTZ, '2024-12-31'::TIMESTAMPTZ, 'employee-id'::UUID);

