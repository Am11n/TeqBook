-- =====================================================
-- Query budget observability helpers
-- =====================================================

CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

DROP FUNCTION IF EXISTS public.get_query_budget_violations(INTEGER, INTEGER, INTEGER);

CREATE OR REPLACE FUNCTION public.get_query_budget_violations(
  p_min_calls INTEGER DEFAULT 20,
  p_booking_budget_ms INTEGER DEFAULT 20,
  p_dashboard_budget_ms INTEGER DEFAULT 50
)
RETURNS TABLE (
  queryid BIGINT,
  calls BIGINT,
  mean_exec_time DOUBLE PRECISION,
  budget_ms INTEGER,
  query TEXT
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
  SELECT
    s.queryid,
    s.calls,
    s.mean_exec_time,
    CASE
      WHEN s.query ILIKE '%bookings%' THEN p_booking_budget_ms
      ELSE p_dashboard_budget_ms
    END AS budget_ms,
    LEFT(s.query, 240) AS query
  FROM pg_stat_statements s
  WHERE s.calls >= p_min_calls
    AND (
      (s.query ILIKE '%bookings%' AND s.mean_exec_time > p_booking_budget_ms)
      OR
      (s.query NOT ILIKE '%bookings%' AND s.mean_exec_time > p_dashboard_budget_ms)
    )
  ORDER BY s.mean_exec_time DESC;
$$;

REVOKE ALL ON FUNCTION public.get_query_budget_violations(INTEGER, INTEGER, INTEGER) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_query_budget_violations(INTEGER, INTEGER, INTEGER) TO service_role;

