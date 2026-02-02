-- =====================================================
-- Personalliste (Staff Register) - Compliance Table
-- =====================================================
-- Legal documentation: who was at work, check-in/check-out.
-- Separate from employees (operational); personalliste is factual, historical, locked.
-- =====================================================

-- Create personalliste_entries table
CREATE TABLE IF NOT EXISTS personalliste_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE RESTRICT,
  date DATE NOT NULL,
  check_in TIMESTAMPTZ NOT NULL,
  check_out TIMESTAMPTZ,
  duration_minutes INTEGER,
  status TEXT NOT NULL DEFAULT 'ok' CHECK (status IN ('ok', 'edited')),
  changed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  changed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- One row per employee per day per salon
CREATE UNIQUE INDEX IF NOT EXISTS idx_personalliste_entries_salon_employee_date
  ON personalliste_entries(salon_id, employee_id, date);

-- Lookup by salon and date range
CREATE INDEX IF NOT EXISTS idx_personalliste_entries_salon_date
  ON personalliste_entries(salon_id, date);

CREATE INDEX IF NOT EXISTS idx_personalliste_entries_salon_id
  ON personalliste_entries(salon_id);

COMMENT ON TABLE personalliste_entries IS 'Staff register (personalliste): legal record of who was at work, check-in/check-out. Compliance documentation, not operational config.';

-- =====================================================
-- RLS
-- =====================================================
ALTER TABLE personalliste_entries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view personalliste for their salon" ON personalliste_entries;
DROP POLICY IF EXISTS "Users can insert personalliste for their salon" ON personalliste_entries;
DROP POLICY IF EXISTS "Users can update personalliste for their salon" ON personalliste_entries;
DROP POLICY IF EXISTS "Superadmins can view all personalliste" ON personalliste_entries;

CREATE POLICY "Users can view personalliste for their salon"
  ON personalliste_entries FOR SELECT
  USING (
    salon_id IN (
      SELECT salon_id FROM profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert personalliste for their salon"
  ON personalliste_entries FOR INSERT
  WITH CHECK (
    salon_id IN (
      SELECT salon_id FROM profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update personalliste for their salon"
  ON personalliste_entries FOR UPDATE
  USING (
    salon_id IN (
      SELECT salon_id FROM profiles WHERE user_id = auth.uid()
    )
  );

-- No DELETE policy for regular users: preserve history for compliance.
-- Superadmins can delete if needed via service role.

CREATE POLICY "Superadmins can view all personalliste"
  ON personalliste_entries FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid() AND is_superadmin = TRUE
    )
  );
