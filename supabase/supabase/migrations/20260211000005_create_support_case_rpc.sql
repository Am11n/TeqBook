-- =====================================================
-- RPC: create_support_case_for_salon
-- =====================================================
-- Salon owners call this to create a support case.
-- Logic:
--   1. Resolve caller's salon_id from profiles
--   2. Rate limit: max 5 cases per hour per salon
--   3. Lookup salon.plan → priority mapping
--   4. INSERT support_cases with type='salon_request'
--   5. INSERT audit log entry
--   6. Return the new case
-- =====================================================

CREATE OR REPLACE FUNCTION create_support_case_for_salon(
  p_title TEXT,
  p_description TEXT,
  p_category TEXT DEFAULT 'general',
  p_attachment_paths JSONB DEFAULT '[]'::jsonb
)
RETURNS support_cases
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_caller_id UUID;
  v_salon_id UUID;
  v_salon_name TEXT;
  v_salon_plan TEXT;
  v_priority TEXT;
  v_recent_count INTEGER;
  v_new_case support_cases;
BEGIN
  -- 1. Get caller info
  v_caller_id := auth.uid();
  IF v_caller_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Get salon_id from profiles (must be an owner)
  SELECT p.salon_id INTO v_salon_id
  FROM profiles p
  WHERE p.user_id = v_caller_id
    AND p.salon_id IS NOT NULL
    AND p.role = 'owner';

  IF v_salon_id IS NULL THEN
    RAISE EXCEPTION 'No salon found for this user or user is not a salon owner';
  END IF;

  -- 2. Rate limiting: max 5 cases per hour per salon
  SELECT COUNT(*) INTO v_recent_count
  FROM support_cases sc
  WHERE sc.salon_id = v_salon_id
    AND sc.type = 'salon_request'
    AND sc.created_at > NOW() - INTERVAL '1 hour';

  IF v_recent_count >= 5 THEN
    RAISE EXCEPTION 'Rate limit exceeded. You can create up to 5 support cases per hour. Please try again later.'
      USING ERRCODE = 'P0002';
  END IF;

  -- 3. Lookup salon plan and map to priority
  SELECT s.name, s.plan::TEXT INTO v_salon_name, v_salon_plan
  FROM salons s
  WHERE s.id = v_salon_id;

  CASE v_salon_plan
    WHEN 'business' THEN v_priority := 'high';
    WHEN 'pro'      THEN v_priority := 'medium';
    ELSE                  v_priority := 'low';
  END CASE;

  -- 4. Insert the support case
  INSERT INTO support_cases (
    salon_id, user_id, type, status, priority,
    title, description, category, metadata
  )
  VALUES (
    v_salon_id,
    v_caller_id,
    'salon_request',
    'open',
    v_priority,
    p_title,
    p_description,
    p_category,
    jsonb_build_object(
      'source', 'dashboard',
      'salon_name', v_salon_name,
      'salon_plan', v_salon_plan,
      'attachments', p_attachment_paths
    )
  )
  RETURNING * INTO v_new_case;

  -- 5. Audit log
  INSERT INTO security_audit_log (
    user_id, action, resource_type, resource_id,
    metadata, ip_address
  )
  VALUES (
    v_caller_id,
    'support_case_created',
    'support_case',
    v_new_case.id::TEXT,
    jsonb_build_object(
      'title', p_title,
      'category', p_category,
      'priority', v_priority,
      'salon_id', v_salon_id,
      'salon_plan', v_salon_plan
    ),
    '0.0.0.0'
  );

  -- 6. Return
  RETURN v_new_case;
END;
$$;

-- Grant execute to authenticated users (RPC handles authorization internally)
GRANT EXECUTE ON FUNCTION create_support_case_for_salon(TEXT, TEXT, TEXT, JSONB) TO authenticated;

COMMENT ON FUNCTION create_support_case_for_salon(TEXT, TEXT, TEXT, JSONB)
  IS 'Salon owners create a support case. Auto-sets priority from plan, enforces rate limit (5/hour), logs to audit.';
