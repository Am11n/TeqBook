-- =====================================================
-- Create Test Cleanup Function
-- =====================================================
-- This function cleans up test salon and related data
-- by temporarily disabling the trigger constraint.
-- Used only for testing purposes.
-- =====================================================

CREATE OR REPLACE FUNCTION cleanup_test_salon_data(
  p_salon_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Delete related data first
  DELETE FROM bookings WHERE salon_id = p_salon_id;
  DELETE FROM customers WHERE salon_id = p_salon_id;
  DELETE FROM shifts WHERE salon_id = p_salon_id;
  DELETE FROM employees WHERE salon_id = p_salon_id;
  DELETE FROM services WHERE salon_id = p_salon_id;
  DELETE FROM products WHERE salon_id = p_salon_id;
  DELETE FROM opening_hours WHERE salon_id = p_salon_id;
  
  -- Temporarily disable triggers to allow profile/salon deletion
  ALTER TABLE profiles DISABLE TRIGGER ALL;
  ALTER TABLE salons DISABLE TRIGGER ALL;
  
  -- Delete profiles linked to this salon
  DELETE FROM profiles WHERE salon_id = p_salon_id;
  
  -- Delete the salon
  DELETE FROM salons WHERE id = p_salon_id;
  
  -- Re-enable triggers
  ALTER TABLE profiles ENABLE TRIGGER ALL;
  ALTER TABLE salons ENABLE TRIGGER ALL;
END;
$$;

-- Grant execute permission to service role (for testing)
GRANT EXECUTE ON FUNCTION cleanup_test_salon_data(UUID) TO service_role;

-- Comment
COMMENT ON FUNCTION cleanup_test_salon_data IS 'Test helper function to clean up a test salon and all related data. Used only for integration tests.';
