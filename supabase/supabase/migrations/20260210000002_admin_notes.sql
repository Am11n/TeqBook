-- =====================================================
-- Admin Notes Table
-- =====================================================
-- Internal notes visible only to super admins.
-- Polymorphic: entity_type + entity_id can reference
-- salons, users, or support cases.
-- =====================================================

-- Step 1: Create admin_notes table
-- =====================================================
CREATE TABLE IF NOT EXISTS admin_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL CHECK (entity_type IN ('salon', 'user', 'case')),
  entity_id UUID NOT NULL,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  tags TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Step 2: Indexes
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_admin_notes_entity
  ON admin_notes(entity_type, entity_id);

CREATE INDEX IF NOT EXISTS idx_admin_notes_author
  ON admin_notes(author_id);

CREATE INDEX IF NOT EXISTS idx_admin_notes_created_at
  ON admin_notes(created_at);

-- GIN index for tag-based queries
CREATE INDEX IF NOT EXISTS idx_admin_notes_tags
  ON admin_notes USING GIN(tags);

-- Step 3: RLS Policies
-- =====================================================
ALTER TABLE admin_notes ENABLE ROW LEVEL SECURITY;

-- Only superadmins can read notes
CREATE POLICY "Superadmins can read admin notes"
  ON admin_notes
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
        AND profiles.is_superadmin = true
    )
  );

-- Only superadmins can insert notes
CREATE POLICY "Superadmins can insert admin notes"
  ON admin_notes
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
        AND profiles.is_superadmin = true
    )
    AND author_id = auth.uid()
  );

-- Notes are immutable (no updates)
CREATE POLICY "No updates to admin notes"
  ON admin_notes
  FOR UPDATE
  USING (false);

-- No deletes
CREATE POLICY "No deletes on admin notes"
  ON admin_notes
  FOR DELETE
  USING (false);

-- Step 4: Helper function to get notes for an entity
-- =====================================================
CREATE OR REPLACE FUNCTION get_admin_notes(
  p_entity_type TEXT,
  p_entity_id UUID
)
RETURNS TABLE(
  id UUID,
  entity_type TEXT,
  entity_id UUID,
  author_id UUID,
  author_email TEXT,
  content TEXT,
  tags TEXT[],
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verify caller is superadmin
  IF NOT EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.user_id = auth.uid()
      AND p.is_superadmin = true
  ) THEN
    RAISE EXCEPTION 'Only superadmins can read admin notes';
  END IF;

  RETURN QUERY
  SELECT
    n.id,
    n.entity_type,
    n.entity_id,
    n.author_id,
    u.email::TEXT AS author_email,
    n.content,
    n.tags,
    n.created_at
  FROM admin_notes n
  LEFT JOIN auth.users u ON u.id = n.author_id
  WHERE n.entity_type = p_entity_type
    AND n.entity_id = p_entity_id
  ORDER BY n.created_at DESC;
END;
$$;

GRANT EXECUTE ON FUNCTION get_admin_notes(TEXT, UUID) TO authenticated;

-- Comments
-- =====================================================
COMMENT ON TABLE admin_notes IS 'Internal admin notes on salons, users, or support cases. Visible only to super admins. Immutable.';
COMMENT ON COLUMN admin_notes.entity_type IS 'Target entity type: salon, user, or case';
COMMENT ON COLUMN admin_notes.entity_id IS 'UUID of the target entity';
COMMENT ON COLUMN admin_notes.tags IS 'Tags array: vip, high_risk, needs_follow_up';
COMMENT ON FUNCTION get_admin_notes(TEXT, UUID) IS 'Get all admin notes for an entity, including author email. Superadmin only.';
