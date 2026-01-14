-- =====================================================
-- Create Test Helper Function for Salon Creation
-- =====================================================
-- This function creates a salon and owner profile in a single transaction
-- to satisfy the ensure_salon_has_owner trigger constraint.
-- Used only for testing purposes.
-- =====================================================

CREATE OR REPLACE FUNCTION create_test_salon_with_owner(
  p_owner_user_id UUID,
  p_name TEXT,
  p_salon_type TEXT DEFAULT 'barber',
  p_preferred_language TEXT DEFAULT 'nb',
  p_online_booking_enabled BOOLEAN DEFAULT true,
  p_is_public BOOLEAN DEFAULT true
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_salon_id UUID;
BEGIN
  -- Temporarily disable the trigger to allow creating salon and profile in sequence
  ALTER TABLE salons DISABLE TRIGGER ensure_salon_has_owner;

  -- Create the salon
  INSERT INTO salons (
    name,
    salon_type,
    preferred_language,
    online_booking_enabled,
    is_public
  )
  VALUES (
    p_name,
    p_salon_type,
    p_preferred_language,
    p_online_booking_enabled,
    p_is_public
  )
  RETURNING id INTO v_salon_id;

  -- Create or update the profile to link the user to the salon
  INSERT INTO profiles (
    user_id,
    salon_id
  )
  VALUES (
    p_owner_user_id,
    v_salon_id
  )
  ON CONFLICT (user_id)
  DO UPDATE SET
    salon_id = v_salon_id;

  -- Re-enable the trigger
  ALTER TABLE salons ENABLE TRIGGER ensure_salon_has_owner;

  RETURN v_salon_id;
END;
$$;

-- Grant execute permission to service role (for testing)
GRANT EXECUTE ON FUNCTION create_test_salon_with_owner(UUID, TEXT, TEXT, TEXT, BOOLEAN, BOOLEAN) TO service_role;

-- Comment
COMMENT ON FUNCTION create_test_salon_with_owner IS 'Test helper function to create a salon with an owner profile in a single transaction. Used only for integration tests.';

