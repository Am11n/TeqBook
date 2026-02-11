-- =====================================================
-- Update get_support_cases_list to include category
-- =====================================================
-- Adds category column to the return type.
-- Must DROP first because return type changes.
-- =====================================================

DROP FUNCTION IF EXISTS get_support_cases_list(JSONB, INTEGER, INTEGER);

CREATE OR REPLACE FUNCTION get_support_cases_list(
  filters JSONB DEFAULT '{}',
  lim INTEGER DEFAULT 25,
  off INTEGER DEFAULT 0
)
RETURNS TABLE(
  id UUID,
  salon_id UUID,
  salon_name TEXT,
  user_id UUID,
  type TEXT,
  status TEXT,
  priority TEXT,
  title TEXT,
  description TEXT,
  category TEXT,
  assignee_id UUID,
  assignee_email TEXT,
  metadata JSONB,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  total_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  total BIGINT;
BEGIN
  -- Verify superadmin
  IF NOT EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.user_id = auth.uid() AND p.is_superadmin = true
  ) THEN
    RAISE EXCEPTION 'Only superadmins can call this function';
  END IF;

  -- Count
  SELECT COUNT(*) INTO total
  FROM support_cases sc
  WHERE (filters->>'type' IS NULL OR sc.type = filters->>'type')
    AND (filters->>'status' IS NULL OR sc.status = filters->>'status')
    AND (filters->>'priority' IS NULL OR sc.priority = filters->>'priority')
    AND (filters->>'assignee_id' IS NULL OR sc.assignee_id = (filters->>'assignee_id')::UUID);

  RETURN QUERY
  SELECT
    sc.id,
    sc.salon_id,
    s.name AS salon_name,
    sc.user_id,
    sc.type,
    sc.status,
    sc.priority,
    sc.title,
    sc.description,
    sc.category,
    sc.assignee_id,
    (SELECT u.email::TEXT FROM auth.users u WHERE u.id = sc.assignee_id) AS assignee_email,
    sc.metadata,
    sc.resolved_at,
    sc.created_at,
    sc.updated_at,
    total AS total_count
  FROM support_cases sc
  LEFT JOIN salons s ON s.id = sc.salon_id
  WHERE (filters->>'type' IS NULL OR sc.type = filters->>'type')
    AND (filters->>'status' IS NULL OR sc.status = filters->>'status')
    AND (filters->>'priority' IS NULL OR sc.priority = filters->>'priority')
    AND (filters->>'assignee_id' IS NULL OR sc.assignee_id = (filters->>'assignee_id')::UUID)
  ORDER BY
    CASE sc.priority
      WHEN 'critical' THEN 1
      WHEN 'high' THEN 2
      WHEN 'medium' THEN 3
      WHEN 'low' THEN 4
    END,
    sc.created_at DESC
  LIMIT lim
  OFFSET off;
END;
$$;

GRANT EXECUTE ON FUNCTION get_support_cases_list(JSONB, INTEGER, INTEGER) TO authenticated;
