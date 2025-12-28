-- =====================================================
-- Opening Hours Schema
-- =====================================================
-- This SQL script creates the opening_hours table
-- to store salon opening hours per day of the week.
--
-- Run this in Supabase SQL Editor
-- =====================================================

-- Create opening_hours table
CREATE TABLE IF NOT EXISTS opening_hours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0 = Monday, 6 = Sunday
  open_time TIME NOT NULL,
  close_time TIME NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(salon_id, day_of_week)
);

-- Add comments
COMMENT ON TABLE opening_hours IS 'Stores opening hours for each salon per day of the week';
COMMENT ON COLUMN opening_hours.day_of_week IS 'Day of week: 0 = Monday, 1 = Tuesday, ..., 6 = Sunday';
COMMENT ON COLUMN opening_hours.open_time IS 'Opening time in HH:MM format';
COMMENT ON COLUMN opening_hours.close_time IS 'Closing time in HH:MM format';

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION update_opening_hours_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS opening_hours_updated_at ON opening_hours;
CREATE TRIGGER opening_hours_updated_at
  BEFORE UPDATE ON opening_hours
  FOR EACH ROW
  EXECUTE FUNCTION update_opening_hours_updated_at();

-- Enable Row Level Security
ALTER TABLE opening_hours ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view opening_hours for their salon" ON opening_hours;
DROP POLICY IF EXISTS "Users can insert opening_hours for their salon" ON opening_hours;
DROP POLICY IF EXISTS "Users can update opening_hours for their salon" ON opening_hours;
DROP POLICY IF EXISTS "Users can delete opening_hours for their salon" ON opening_hours;

-- Create RLS policies
CREATE POLICY "Users can view opening_hours for their salon"
  ON opening_hours
  FOR SELECT
  USING (
    salon_id IN (
      SELECT salon_id FROM profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert opening_hours for their salon"
  ON opening_hours
  FOR INSERT
  WITH CHECK (
    salon_id IN (
      SELECT salon_id FROM profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update opening_hours for their salon"
  ON opening_hours
  FOR UPDATE
  USING (
    salon_id IN (
      SELECT salon_id FROM profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete opening_hours for their salon"
  ON opening_hours
  FOR DELETE
  USING (
    salon_id IN (
      SELECT salon_id FROM profiles WHERE user_id = auth.uid()
    )
  );

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON opening_hours TO authenticated;

