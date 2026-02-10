-- =====================================================
-- Onboarding Status RPC
-- =====================================================
-- Returns onboarding completion status for a batch of salons
-- in a single query (replaces N+1 individual requests)

CREATE OR REPLACE FUNCTION get_salon_onboarding_status(salon_ids UUID[])
RETURNS TABLE(
  salon_id UUID,
  has_employee BOOLEAN,
  has_service BOOLEAN,
  has_booking BOOLEAN
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
    sid AS salon_id,
    EXISTS(SELECT 1 FROM employees e WHERE e.salon_id = sid) AS has_employee,
    EXISTS(SELECT 1 FROM services sv WHERE sv.salon_id = sid) AS has_service,
    EXISTS(SELECT 1 FROM bookings b WHERE b.salon_id = sid) AS has_booking
  FROM unnest(salon_ids) AS sid;
END;
$$;

COMMENT ON FUNCTION get_salon_onboarding_status(UUID[]) IS
  'Returns onboarding completion flags (has employee/service/booking) for a batch of salons. Superadmin only.';
