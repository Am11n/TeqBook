-- =====================================================
-- Salon Closures Table
-- =====================================================
-- Stores holidays / closed days per salon.
-- Used by generate_availability to skip closed dates.
-- Works for all plans.
-- =====================================================

CREATE TABLE IF NOT EXISTS salon_closures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  closed_date DATE NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(salon_id, closed_date)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_salon_closures_salon_date
  ON salon_closures(salon_id, closed_date);

-- RLS
ALTER TABLE salon_closures ENABLE ROW LEVEL SECURITY;

-- Salon owners can read their own closures
CREATE POLICY "Salon owners can read own closures"
  ON salon_closures
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.user_id = auth.uid()
        AND p.salon_id = salon_closures.salon_id
        AND p.role IN ('owner', 'manager')
    )
    OR EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.user_id = auth.uid() AND p.is_superadmin = true
    )
  );

-- Salon owners can insert closures for their salon
CREATE POLICY "Salon owners can insert closures"
  ON salon_closures
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.user_id = auth.uid()
        AND p.salon_id = salon_closures.salon_id
        AND p.role IN ('owner', 'manager')
    )
    OR EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.user_id = auth.uid() AND p.is_superadmin = true
    )
  );

-- Salon owners can update closures for their salon
CREATE POLICY "Salon owners can update closures"
  ON salon_closures
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.user_id = auth.uid()
        AND p.salon_id = salon_closures.salon_id
        AND p.role IN ('owner', 'manager')
    )
    OR EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.user_id = auth.uid() AND p.is_superadmin = true
    )
  );

-- Salon owners can delete closures for their salon
CREATE POLICY "Salon owners can delete closures"
  ON salon_closures
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.user_id = auth.uid()
        AND p.salon_id = salon_closures.salon_id
        AND p.role IN ('owner', 'manager')
    )
    OR EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.user_id = auth.uid() AND p.is_superadmin = true
    )
  );

COMMENT ON TABLE salon_closures IS 'Holidays and closed days per salon. Prevents bookings on these dates.';
COMMENT ON COLUMN salon_closures.closed_date IS 'The date the salon is closed';
COMMENT ON COLUMN salon_closures.reason IS 'Optional reason (e.g. "17. mai", "Christmas", "Staff training")';
