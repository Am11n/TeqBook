-- =====================================================
-- Time Blocks + Service Timing + Breaks Extension
-- =====================================================
-- Phase 0+1: Foundation for the calendar booking machine.
--   1. time_blocks table (meetings, vacation, training, etc.)
--   2. services: prep_minutes + cleanup_minutes
--   3. opening_hours_breaks: multiple per day + per employee
-- =====================================================

-- ─── 1. Create time_blocks table ─────────────────────

CREATE TABLE IF NOT EXISTS time_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,  -- NULL = entire salon
  title TEXT NOT NULL,
  block_type TEXT NOT NULL DEFAULT 'other',  -- meeting, vacation, training, private, lunch, other
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  is_all_day BOOLEAN NOT NULL DEFAULT false,
  recurrence_rule TEXT,  -- NULL = one-off, Pro/Business: 'WEEKLY:1,3,5' etc.
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (end_time > start_time OR is_all_day)
);

COMMENT ON TABLE time_blocks IS 'Blocked time slots: meetings, vacation, training, private, etc. Per salon or per employee.';
COMMENT ON COLUMN time_blocks.employee_id IS 'NULL means the block applies to the entire salon';
COMMENT ON COLUMN time_blocks.block_type IS 'meeting, vacation, training, private, lunch, other';
COMMENT ON COLUMN time_blocks.is_all_day IS 'If true, blocks the entire day regardless of start/end times';
COMMENT ON COLUMN time_blocks.recurrence_rule IS 'NULL = one-off event. Pro/Business plans can use WEEKLY:0,1,2 etc.';

-- Indexes
CREATE INDEX IF NOT EXISTS idx_time_blocks_salon_start ON time_blocks(salon_id, start_time);
CREATE INDEX IF NOT EXISTS idx_time_blocks_salon_emp_start ON time_blocks(salon_id, employee_id, start_time);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_time_blocks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS time_blocks_updated_at ON time_blocks;
CREATE TRIGGER time_blocks_updated_at
  BEFORE UPDATE ON time_blocks
  FOR EACH ROW
  EXECUTE FUNCTION update_time_blocks_updated_at();

-- ─── 2. RLS for time_blocks ─────────────────────────

ALTER TABLE time_blocks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view time_blocks for their salon" ON time_blocks;
CREATE POLICY "Users can view time_blocks for their salon"
  ON time_blocks FOR SELECT
  USING (
    salon_id IN (SELECT p.salon_id FROM profiles p WHERE p.user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM profiles p WHERE p.user_id = auth.uid() AND p.is_superadmin = true)
  );

DROP POLICY IF EXISTS "Users can insert time_blocks for their salon" ON time_blocks;
CREATE POLICY "Users can insert time_blocks for their salon"
  ON time_blocks FOR INSERT
  WITH CHECK (
    salon_id IN (SELECT p.salon_id FROM profiles p WHERE p.user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM profiles p WHERE p.user_id = auth.uid() AND p.is_superadmin = true)
  );

DROP POLICY IF EXISTS "Users can update time_blocks for their salon" ON time_blocks;
CREATE POLICY "Users can update time_blocks for their salon"
  ON time_blocks FOR UPDATE
  USING (
    salon_id IN (SELECT p.salon_id FROM profiles p WHERE p.user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM profiles p WHERE p.user_id = auth.uid() AND p.is_superadmin = true)
  );

DROP POLICY IF EXISTS "Users can delete time_blocks for their salon" ON time_blocks;
CREATE POLICY "Users can delete time_blocks for their salon"
  ON time_blocks FOR DELETE
  USING (
    salon_id IN (SELECT p.salon_id FROM profiles p WHERE p.user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM profiles p WHERE p.user_id = auth.uid() AND p.is_superadmin = true)
  );

GRANT SELECT, INSERT, UPDATE, DELETE ON time_blocks TO authenticated;

-- ─── 3. Services: prep_minutes + cleanup_minutes ────

ALTER TABLE services ADD COLUMN IF NOT EXISTS prep_minutes INTEGER NOT NULL DEFAULT 0;
ALTER TABLE services ADD COLUMN IF NOT EXISTS cleanup_minutes INTEGER NOT NULL DEFAULT 0;

COMMENT ON COLUMN services.prep_minutes IS 'Setup/preparation time before service starts (blocks calendar, minutes)';
COMMENT ON COLUMN services.cleanup_minutes IS 'Cleanup time after service ends (blocks calendar, minutes)';

-- ─── 4. Breaks: multiple per day + per employee ─────

-- Drop the UNIQUE constraint that limits to 1 break per day per salon
ALTER TABLE opening_hours_breaks DROP CONSTRAINT IF EXISTS opening_hours_breaks_salon_id_day_of_week_key;

-- Add per-employee support
ALTER TABLE opening_hours_breaks ADD COLUMN IF NOT EXISTS employee_id UUID REFERENCES employees(id) ON DELETE CASCADE;
ALTER TABLE opening_hours_breaks ADD COLUMN IF NOT EXISTS applies_to_all_employees BOOLEAN NOT NULL DEFAULT true;

-- Update existing rows
UPDATE opening_hours_breaks SET applies_to_all_employees = true WHERE employee_id IS NULL;

-- New composite index for lookups
CREATE INDEX IF NOT EXISTS idx_ohb_salon_emp_day ON opening_hours_breaks(salon_id, employee_id, day_of_week);

-- ─── 5. Anon access for public booking page ─────────

GRANT SELECT ON time_blocks TO anon;
