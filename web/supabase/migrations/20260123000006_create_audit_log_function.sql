-- =====================================================
-- Create Audit Log Function (Bypasses RLS)
-- =====================================================
-- This function allows authenticated users to log audit events
-- without RLS restrictions, as long as they have access to the salon
-- =====================================================

-- Drop existing function if it exists (needed if return type changed)
DROP FUNCTION IF EXISTS create_audit_log_entry(UUID, UUID, TEXT, TEXT, TEXT, JSONB, TEXT, TEXT);

CREATE OR REPLACE FUNCTION create_audit_log_entry(
  p_user_id UUID,
  p_salon_id UUID,
  p_action TEXT,
  p_resource_type TEXT,
  p_resource_id TEXT,
  p_metadata JSONB DEFAULT NULL,
  p_ip_address TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  salon_id UUID,
  action TEXT,
  resource_type TEXT,
  resource_id TEXT,
  metadata JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_user_id UUID;
  v_audit_log security_audit_log;
BEGIN
  -- Get current authenticated user
  v_current_user_id := auth.uid();
  
  -- Verify user is authenticated
  IF v_current_user_id IS NULL THEN
    RAISE EXCEPTION 'User must be authenticated to create audit log';
  END IF;
  
  -- Verify user has access to salon (if salon_id is provided)
  IF p_salon_id IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = v_current_user_id
        AND profiles.salon_id = p_salon_id
    ) THEN
      RAISE EXCEPTION 'User does not have access to salon %', p_salon_id;
    END IF;
  END IF;
  
  -- Insert audit log entry and return the full row
  INSERT INTO security_audit_log (
    user_id,
    salon_id,
    action,
    resource_type,
    resource_id,
    metadata,
    ip_address,
    user_agent
  ) VALUES (
    p_user_id,
    p_salon_id,
    p_action,
    p_resource_type,
    p_resource_id,
    p_metadata,
    p_ip_address,
    p_user_agent
  )
  RETURNING * INTO v_audit_log;
  
  -- Return the created audit log entry
  RETURN QUERY SELECT
    v_audit_log.id,
    v_audit_log.user_id,
    v_audit_log.salon_id,
    v_audit_log.action,
    v_audit_log.resource_type,
    v_audit_log.resource_id,
    v_audit_log.metadata,
    v_audit_log.ip_address,
    v_audit_log.user_agent,
    v_audit_log.created_at;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION create_audit_log_entry(UUID, UUID, TEXT, TEXT, TEXT, JSONB, TEXT, TEXT) TO authenticated;

-- Note: Function returns a table, so Supabase will return an array
-- The client code should access the first element: data[0]

COMMENT ON FUNCTION create_audit_log_entry IS 
  'Creates an audit log entry. Bypasses RLS but verifies user has access to salon.';
