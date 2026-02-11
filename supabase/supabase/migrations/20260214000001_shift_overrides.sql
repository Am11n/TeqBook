-- =====================================================
-- Shift Overrides: week-specific schedule overrides
-- =====================================================
-- The `shifts` table holds recurring templates (weekday-based).
-- This table holds date-specific overrides that take precedence.

CREATE TABLE IF NOT EXISTS shift_overrides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  override_date DATE NOT NULL,
  start_time TIME,          -- NULL = day off override
  end_time TIME,            -- NULL = day off override
  source TEXT NOT NULL DEFAULT 'manual',  -- 'manual', 'copied', 'template'
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT shift_overrides_valid_times CHECK (
    (start_time IS NULL AND end_time IS NULL) OR
    (start_time IS NOT NULL AND end_time IS NOT NULL AND end_time > start_time)
  ),
  CONSTRAINT shift_overrides_unique UNIQUE (salon_id, employee_id, override_date, start_time)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_shift_overrides_salon_date
  ON shift_overrides (salon_id, override_date);
CREATE INDEX IF NOT EXISTS idx_shift_overrides_employee
  ON shift_overrides (employee_id, override_date);

-- Enable RLS
ALTER TABLE shift_overrides ENABLE ROW LEVEL SECURITY;

-- RLS policies (mirror shifts table pattern)
CREATE POLICY "Users can view shift_overrides for their salon"
  ON shift_overrides FOR SELECT
  USING (
    salon_id IN (
      SELECT salon_id FROM profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert shift_overrides for their salon"
  ON shift_overrides FOR INSERT
  WITH CHECK (
    salon_id IN (
      SELECT salon_id FROM profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update shift_overrides for their salon"
  ON shift_overrides FOR UPDATE
  USING (
    salon_id IN (
      SELECT salon_id FROM profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete shift_overrides for their salon"
  ON shift_overrides FOR DELETE
  USING (
    salon_id IN (
      SELECT salon_id FROM profiles WHERE user_id = auth.uid()
    )
  );
