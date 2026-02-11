-- =====================================================
-- RPC: create_feedback_entry_for_salon
-- =====================================================
-- Salon owners call this to submit feedback.
-- Logic:
--   1. Resolve caller's salon_id from profiles
--   2. Rate limit: max 10/day per user, max 20/week per salon
--   3. Dupe check: same title+type within last 7 days
--   4. Lookup salon.plan → priority mapping
--   5. INSERT feedback_entries with status='new'
--   6. INSERT audit log entry
--   7. Return the new entry (or existing dupe)
-- =====================================================

CREATE OR REPLACE FUNCTION create_feedback_entry_for_salon(
  p_title TEXT,
  p_description TEXT DEFAULT NULL,
  p_type TEXT DEFAULT 'feature_request',
  p_attachment_paths JSONB DEFAULT '[]'::jsonb,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS feedback_entries
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_caller_id UUID;
  v_salon_id UUID;
  v_salon_name TEXT;
  v_salon_plan TEXT;
  v_priority TEXT;
  v_recent_user_count INTEGER;
  v_recent_salon_count INTEGER;
  v_existing feedback_entries;
  v_new_entry feedback_entries;
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

  -- Validate type
  IF p_type NOT IN ('feature_request', 'bug_report', 'improvement', 'other') THEN
    RAISE EXCEPTION 'Invalid feedback type: %', p_type;
  END IF;

  -- 2. Rate limiting
  -- Max 10 per day per user
  SELECT COUNT(*) INTO v_recent_user_count
  FROM feedback_entries fe
  WHERE fe.user_id = v_caller_id
    AND fe.created_at > NOW() - INTERVAL '1 day';

  IF v_recent_user_count >= 10 THEN
    RAISE EXCEPTION 'Rate limit exceeded. You can submit up to 10 feedback entries per day. Please try again later.'
      USING ERRCODE = 'P0002';
  END IF;

  -- Max 20 per week per salon
  SELECT COUNT(*) INTO v_recent_salon_count
  FROM feedback_entries fe
  WHERE fe.salon_id = v_salon_id
    AND fe.created_at > NOW() - INTERVAL '7 days';

  IF v_recent_salon_count >= 20 THEN
    RAISE EXCEPTION 'Rate limit exceeded. Your salon can submit up to 20 feedback entries per week. Please try again later.'
      USING ERRCODE = 'P0002';
  END IF;

  -- 3. Dupe check: same title (case-insensitive) + type within last 7 days for this salon
  SELECT * INTO v_existing
  FROM feedback_entries fe
  WHERE fe.salon_id = v_salon_id
    AND LOWER(TRIM(fe.title)) = LOWER(TRIM(p_title))
    AND fe.type = p_type
    AND fe.created_at > NOW() - INTERVAL '7 days'
  LIMIT 1;

  IF v_existing.id IS NOT NULL THEN
    -- Return existing entry so the client can show "already tracking this"
    RETURN v_existing;
  END IF;

  -- 4. Lookup salon plan and map to priority
  SELECT s.name, s.plan::TEXT INTO v_salon_name, v_salon_plan
  FROM salons s
  WHERE s.id = v_salon_id;

  CASE v_salon_plan
    WHEN 'business' THEN v_priority := 'high';
    WHEN 'pro'      THEN v_priority := 'medium';
    ELSE                  v_priority := 'low';
  END CASE;

  -- 5. Insert the feedback entry
  INSERT INTO feedback_entries (
    salon_id, user_id, type, status, priority,
    title, description, metadata
  )
  VALUES (
    v_salon_id,
    v_caller_id,
    p_type,
    'new',
    v_priority,
    TRIM(p_title),
    NULLIF(TRIM(COALESCE(p_description, '')), ''),
    jsonb_build_object(
      'source', 'dashboard',
      'salon_name', v_salon_name,
      'salon_plan', v_salon_plan,
      'attachments', p_attachment_paths
    ) || p_metadata
  )
  RETURNING * INTO v_new_entry;

  -- 6. Audit log
  INSERT INTO security_audit_log (
    user_id, action, resource_type, resource_id,
    metadata, ip_address
  )
  VALUES (
    v_caller_id,
    'feedback_entry_created',
    'feedback_entry',
    v_new_entry.id::TEXT,
    jsonb_build_object(
      'title', p_title,
      'type', p_type,
      'priority', v_priority,
      'salon_id', v_salon_id,
      'salon_plan', v_salon_plan
    ),
    '0.0.0.0'
  );

  -- 7. Return
  RETURN v_new_entry;
END;
$$;

-- Grant execute to authenticated users (RPC handles authorization internally)
GRANT EXECUTE ON FUNCTION create_feedback_entry_for_salon(TEXT, TEXT, TEXT, JSONB, JSONB) TO authenticated;

COMMENT ON FUNCTION create_feedback_entry_for_salon(TEXT, TEXT, TEXT, JSONB, JSONB)
  IS 'Salon owners submit feedback. Auto-sets salon_id/priority from profile/plan, enforces rate limit (10/day user, 20/week salon), detects duplicates, logs to audit.';
