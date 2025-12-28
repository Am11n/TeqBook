-- =====================================================
-- Add Add-ons System and Plan Limits
-- =====================================================
-- This SQL script adds:
-- 1. plan field to salons table (using plan_type enum)
-- 2. addons table for managing add-ons per salon
--
-- Run this in Supabase SQL Editor
-- =====================================================

-- Step 1: Ensure plan_type enum exists
-- =====================================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'plan_type') THEN
    CREATE TYPE plan_type AS ENUM ('starter', 'pro', 'business');
  END IF;
END $$;

-- Step 2: Add plan column to salons table
-- =====================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'salons' AND column_name = 'plan'
  ) THEN
    ALTER TABLE salons ADD COLUMN plan plan_type DEFAULT 'starter';
    
    -- Add comment to document the column
    COMMENT ON COLUMN salons.plan IS 
      'Subscription plan for this salon. Determines feature limits (employees, languages, etc.).';
  END IF;
END $$;

-- Step 3: Create addons table
-- =====================================================
CREATE TABLE IF NOT EXISTS addons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('extra_staff', 'extra_languages')),
  qty INTEGER NOT NULL CHECK (qty > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(salon_id, type)
);

-- Add comment to document the table
COMMENT ON TABLE addons IS 
  'Add-ons purchased by salons to extend plan limits. Types: extra_staff (additional employees), extra_languages (additional languages).';

COMMENT ON COLUMN addons.type IS 
  'Type of add-on: extra_staff (additional employees beyond plan limit) or extra_languages (additional languages beyond plan limit).';

COMMENT ON COLUMN addons.qty IS 
  'Quantity of the add-on (e.g., number of extra staff members or extra languages).';

-- Step 4: Create index on salon_id for faster lookups
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_addons_salon_id ON addons(salon_id);

-- Step 5: Create updated_at trigger for addons
-- =====================================================
CREATE OR REPLACE FUNCTION update_addons_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_addons_updated_at ON addons;
CREATE TRIGGER trigger_update_addons_updated_at
  BEFORE UPDATE ON addons
  FOR EACH ROW
  EXECUTE FUNCTION update_addons_updated_at();

-- Step 6: Set default plan for existing salons
-- =====================================================
UPDATE salons
SET plan = 'starter'
WHERE plan IS NULL;

-- Step 7: Enable RLS on addons table
-- =====================================================
ALTER TABLE addons ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only see addons for their own salon
CREATE POLICY "Users can view addons for their salon"
  ON addons
  FOR SELECT
  USING (
    salon_id IN (
      SELECT salon_id FROM profiles WHERE user_id = auth.uid()
    )
  );

-- RLS Policy: Users can insert addons for their own salon
CREATE POLICY "Users can insert addons for their salon"
  ON addons
  FOR INSERT
  WITH CHECK (
    salon_id IN (
      SELECT salon_id FROM profiles WHERE user_id = auth.uid()
    )
  );

-- RLS Policy: Users can update addons for their own salon
CREATE POLICY "Users can update addons for their salon"
  ON addons
  FOR UPDATE
  USING (
    salon_id IN (
      SELECT salon_id FROM profiles WHERE user_id = auth.uid()
    )
  );

-- RLS Policy: Users can delete addons for their own salon
CREATE POLICY "Users can delete addons for their salon"
  ON addons
  FOR DELETE
  USING (
    salon_id IN (
      SELECT salon_id FROM profiles WHERE user_id = auth.uid()
    )
  );

-- =====================================================
-- Verification
-- =====================================================
-- To verify the changes, run:
-- SELECT column_name, data_type, column_default
-- FROM information_schema.columns
-- WHERE table_name = 'salons' AND column_name = 'plan';
--
-- SELECT table_name, column_name, data_type
-- FROM information_schema.columns
-- WHERE table_name = 'addons'
-- ORDER BY ordinal_position;

