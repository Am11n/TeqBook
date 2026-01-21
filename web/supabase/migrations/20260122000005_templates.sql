-- =====================================================
-- Templates Migration
-- =====================================================
-- Task Group 37: Shared Staff Templates
-- Creates tables for staff and service templates

-- =====================================================
-- Template Type Enums
-- =====================================================

DO $$ BEGIN
  CREATE TYPE template_type AS ENUM ('staff', 'service', 'shift_schedule');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE template_visibility AS ENUM ('private', 'shared', 'public');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- =====================================================
-- Templates Table
-- =====================================================

CREATE TABLE IF NOT EXISTS templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  type template_type NOT NULL,
  visibility template_visibility NOT NULL DEFAULT 'private',
  data JSONB NOT NULL,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_templates_salon_id ON templates(salon_id);
CREATE INDEX IF NOT EXISTS idx_templates_type ON templates(type);
CREATE INDEX IF NOT EXISTS idx_templates_visibility ON templates(visibility);
CREATE INDEX IF NOT EXISTS idx_templates_created_by ON templates(created_by);

-- =====================================================
-- Template Shares Table
-- =====================================================

CREATE TABLE IF NOT EXISTS template_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES templates(id) ON DELETE CASCADE,
  shared_with_salon_id UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  shared_by UUID NOT NULL REFERENCES auth.users(id),
  can_edit BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Each template can only be shared once with each salon
  CONSTRAINT template_shares_unique UNIQUE (template_id, shared_with_salon_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_template_shares_template_id ON template_shares(template_id);
CREATE INDEX IF NOT EXISTS idx_template_shares_shared_with ON template_shares(shared_with_salon_id);

-- =====================================================
-- Row Level Security
-- =====================================================

ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_shares ENABLE ROW LEVEL SECURITY;

-- Templates: users can see their own salon's templates
CREATE POLICY "Users can view their salon templates"
  ON templates FOR SELECT
  USING (
    salon_id IN (
      SELECT salon_id FROM salon_ownerships WHERE user_id = auth.uid()
    )
  );

-- Users can see public templates
CREATE POLICY "Users can view public templates"
  ON templates FOR SELECT
  USING (visibility = 'public');

-- Users can see templates shared with their salons
CREATE POLICY "Users can view shared templates"
  ON templates FOR SELECT
  USING (
    id IN (
      SELECT template_id FROM template_shares 
      WHERE shared_with_salon_id IN (
        SELECT salon_id FROM salon_ownerships WHERE user_id = auth.uid()
      )
    )
  );

-- Users can create templates for their salons
CREATE POLICY "Users can create templates"
  ON templates FOR INSERT
  WITH CHECK (
    salon_id IN (
      SELECT salon_id FROM salon_ownerships WHERE user_id = auth.uid()
    )
    AND created_by = auth.uid()
  );

-- Users can update their own templates
CREATE POLICY "Users can update their templates"
  ON templates FOR UPDATE
  USING (
    created_by = auth.uid()
    OR salon_id IN (
      SELECT salon_id FROM salon_ownerships 
      WHERE user_id = auth.uid() AND role = 'owner'
    )
  );

-- Users can delete their own templates
CREATE POLICY "Users can delete their templates"
  ON templates FOR DELETE
  USING (
    created_by = auth.uid()
    OR salon_id IN (
      SELECT salon_id FROM salon_ownerships 
      WHERE user_id = auth.uid() AND role = 'owner'
    )
  );

-- Template shares: users can see shares for their templates
CREATE POLICY "Users can view shares for their templates"
  ON template_shares FOR SELECT
  USING (
    template_id IN (
      SELECT id FROM templates WHERE created_by = auth.uid()
    )
    OR shared_with_salon_id IN (
      SELECT salon_id FROM salon_ownerships WHERE user_id = auth.uid()
    )
  );

-- Users can create shares for their templates
CREATE POLICY "Users can create shares"
  ON template_shares FOR INSERT
  WITH CHECK (
    template_id IN (
      SELECT id FROM templates WHERE created_by = auth.uid()
    )
    AND shared_by = auth.uid()
  );

-- Users can delete shares they created
CREATE POLICY "Users can delete shares they created"
  ON template_shares FOR DELETE
  USING (shared_by = auth.uid());

-- Service role can access all
CREATE POLICY "Service role can access all templates"
  ON templates FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role can access all template shares"
  ON template_shares FOR ALL
  USING (auth.role() = 'service_role');

-- =====================================================
-- Updated At Trigger
-- =====================================================

CREATE OR REPLACE FUNCTION update_templates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER templates_updated_at
  BEFORE UPDATE ON templates
  FOR EACH ROW
  EXECUTE FUNCTION update_templates_updated_at();

-- =====================================================
-- Sample Templates (Optional - for new salons)
-- =====================================================

-- These could be inserted as public templates owned by a system user
-- For now, we'll just add comments about the structure

COMMENT ON TABLE templates IS 'Stores reusable templates for staff, services, and schedules';
COMMENT ON TABLE template_shares IS 'Tracks which templates are shared with which salons';
COMMENT ON COLUMN templates.data IS 'JSON structure varies by type: staff has roles[], service has services[], shift_schedule has shifts[]';
