-- =====================================================
-- Add Features System
-- =====================================================
-- This SQL script adds:
-- 1. features table for managing available features
-- 2. plan_features table for mapping plans (enum) to features
-- 3. Seed data for features and plan_features
--
-- This builds on the existing plan_type enum and salons.plan column
-- Run this in Supabase SQL Editor
-- =====================================================

-- Step 1: Create features table
-- =====================================================
CREATE TABLE IF NOT EXISTS features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add comments
COMMENT ON TABLE features IS 
  'Available features in the system. Features represent modules/areas like BOOKINGS, CALENDAR, SHIFTS, etc.';

COMMENT ON COLUMN features.key IS 
  'Unique feature identifier (e.g., "BOOKINGS", "CALENDAR", "SHIFTS", "ADVANCED_REPORTS")';

COMMENT ON COLUMN features.name IS 
  'Display name for the feature (e.g., "Bookings", "Calendar View")';

COMMENT ON COLUMN features.description IS 
  'Description of what this feature provides';

-- Create index on key for faster lookups
CREATE INDEX IF NOT EXISTS idx_features_key ON features(key);

-- Step 2: Create plan_features table
-- =====================================================
-- This table maps plan_type enum values to features
-- We use plan_type (text) instead of FK to plans table since we use enum
CREATE TABLE IF NOT EXISTS plan_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_type plan_type NOT NULL,
  feature_id UUID NOT NULL REFERENCES features(id) ON DELETE CASCADE,
  limit_value NUMERIC, -- Optional limit (e.g., max employees, max languages)
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(plan_type, feature_id)
);

-- Add comments
COMMENT ON TABLE plan_features IS 
  'Maps plan types (starter, pro, business) to features. Determines which features are available in each plan.';

COMMENT ON COLUMN plan_features.plan_type IS 
  'Plan type enum value (starter, pro, business)';

COMMENT ON COLUMN plan_features.feature_id IS 
  'Reference to the feature';

COMMENT ON COLUMN plan_features.limit_value IS 
  'Optional limit for this feature in this plan (e.g., max employees, max languages). NULL means unlimited or no limit.';

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_plan_features_plan_type ON plan_features(plan_type);
CREATE INDEX IF NOT EXISTS idx_plan_features_feature_id ON plan_features(feature_id);

-- Step 3: Enable RLS on both tables
-- =====================================================
ALTER TABLE features ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_features ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Everyone can read features (they're public metadata)
CREATE POLICY "Anyone can view features"
  ON features
  FOR SELECT
  USING (true);

-- RLS Policy: Only superadmins can modify features
CREATE POLICY "Only superadmins can modify features"
  ON features
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE user_id = auth.uid() 
      AND is_superadmin = true
    )
  );

-- RLS Policy: Everyone can read plan_features (they're public metadata)
CREATE POLICY "Anyone can view plan_features"
  ON plan_features
  FOR SELECT
  USING (true);

-- RLS Policy: Only superadmins can modify plan_features
CREATE POLICY "Only superadmins can modify plan_features"
  ON plan_features
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE user_id = auth.uid() 
      AND is_superadmin = true
    )
  );

-- Step 4: Create updated_at trigger for features
-- =====================================================
CREATE OR REPLACE FUNCTION update_features_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_features_updated_at ON features;
CREATE TRIGGER trigger_update_features_updated_at
  BEFORE UPDATE ON features
  FOR EACH ROW
  EXECUTE FUNCTION update_features_updated_at();

-- Step 5: Seed features (idempotent)
-- =====================================================
INSERT INTO features (key, name, description)
VALUES
  ('BOOKINGS', 'Bookings', 'Create and manage customer bookings'),
  ('CALENDAR', 'Calendar View', 'View bookings in calendar format'),
  ('SHIFTS', 'Shift Planning', 'Plan and manage employee shifts'),
  ('ADVANCED_REPORTS', 'Advanced Reports', 'Detailed revenue and capacity reports'),
  ('MULTILINGUAL', 'Multilingual Interface', 'Support for multiple languages'),
  ('SMS_NOTIFICATIONS', 'SMS Notifications', 'Send SMS reminders and notifications'),
  ('EMAIL_NOTIFICATIONS', 'Email Notifications', 'Send email reminders and notifications'),
  ('WHATSAPP', 'WhatsApp Integration', 'WhatsApp support and notifications'),
  ('INVENTORY', 'Inventory Management', 'Lightweight inventory for products'),
  ('BRANDING', 'Branded Booking Page', 'Customize booking page with branding'),
  ('ROLES_ACCESS', 'Roles & Access Control', 'Advanced role-based access control'),
  ('EXPORTS', 'Data Exports', 'Export data to CSV and other formats'),
  ('CUSTOMER_HISTORY', 'Customer History', 'View customer booking history'),
  ('ONLINE_PAYMENTS', 'Online Payments', 'Accept online payments from customers')
ON CONFLICT (key) DO NOTHING;

-- Step 6: Seed plan_features (idempotent)
-- =====================================================
-- Starter plan features
INSERT INTO plan_features (plan_type, feature_id, limit_value)
SELECT 
  'starter'::plan_type,
  f.id,
  CASE 
    WHEN f.key = 'BOOKINGS' THEN NULL::NUMERIC -- No limit
    WHEN f.key = 'CALENDAR' THEN NULL::NUMERIC
    WHEN f.key = 'MULTILINGUAL' THEN 2::NUMERIC -- 2 languages
    WHEN f.key = 'WHATSAPP' THEN NULL::NUMERIC
    ELSE NULL::NUMERIC
  END
FROM features f
WHERE f.key IN ('BOOKINGS', 'CALENDAR', 'MULTILINGUAL', 'WHATSAPP')
ON CONFLICT (plan_type, feature_id) DO NOTHING;

-- Pro plan features (includes all starter features + more)
INSERT INTO plan_features (plan_type, feature_id, limit_value)
SELECT 
  'pro'::plan_type,
  f.id,
  CASE 
    WHEN f.key = 'MULTILINGUAL' THEN 5::NUMERIC -- 5 languages
    WHEN f.key = 'SHIFTS' THEN NULL::NUMERIC
    WHEN f.key = 'ADVANCED_REPORTS' THEN NULL::NUMERIC
    WHEN f.key = 'EMAIL_NOTIFICATIONS' THEN NULL::NUMERIC
    WHEN f.key = 'SMS_NOTIFICATIONS' THEN NULL::NUMERIC
    WHEN f.key = 'INVENTORY' THEN NULL::NUMERIC
    WHEN f.key = 'BRANDING' THEN NULL::NUMERIC
    WHEN f.key = 'BOOKINGS' THEN NULL::NUMERIC
    WHEN f.key = 'CALENDAR' THEN NULL::NUMERIC
    WHEN f.key = 'WHATSAPP' THEN NULL::NUMERIC
    ELSE NULL::NUMERIC
  END
FROM features f
WHERE f.key IN (
  'BOOKINGS', 'CALENDAR', 'MULTILINGUAL', 'WHATSAPP', -- From starter
  'SHIFTS', 'ADVANCED_REPORTS', 'EMAIL_NOTIFICATIONS', 
  'SMS_NOTIFICATIONS', 'INVENTORY', 'BRANDING'
)
ON CONFLICT (plan_type, feature_id) DO NOTHING;

-- Business plan features (includes all pro features + more)
INSERT INTO plan_features (plan_type, feature_id, limit_value)
SELECT 
  'business'::plan_type,
  f.id,
  CASE 
    WHEN f.key = 'MULTILINGUAL' THEN NULL::NUMERIC -- Unlimited languages
    WHEN f.key = 'ROLES_ACCESS' THEN NULL::NUMERIC
    WHEN f.key = 'EXPORTS' THEN NULL::NUMERIC
    WHEN f.key = 'CUSTOMER_HISTORY' THEN NULL::NUMERIC
    WHEN f.key = 'BOOKINGS' THEN NULL::NUMERIC
    WHEN f.key = 'CALENDAR' THEN NULL::NUMERIC
    WHEN f.key = 'WHATSAPP' THEN NULL::NUMERIC
    WHEN f.key = 'SHIFTS' THEN NULL::NUMERIC
    WHEN f.key = 'ADVANCED_REPORTS' THEN NULL::NUMERIC
    WHEN f.key = 'EMAIL_NOTIFICATIONS' THEN NULL::NUMERIC
    WHEN f.key = 'SMS_NOTIFICATIONS' THEN NULL::NUMERIC
    WHEN f.key = 'INVENTORY' THEN NULL::NUMERIC
    WHEN f.key = 'BRANDING' THEN NULL::NUMERIC
    ELSE NULL::NUMERIC
  END
FROM features f
WHERE f.key IN (
  'BOOKINGS', 'CALENDAR', 'MULTILINGUAL', 'WHATSAPP', -- From starter
  'SHIFTS', 'ADVANCED_REPORTS', 'EMAIL_NOTIFICATIONS', 
  'SMS_NOTIFICATIONS', 'INVENTORY', 'BRANDING', -- From pro
  'ROLES_ACCESS', 'EXPORTS', 'CUSTOMER_HISTORY' -- Business only
)
ON CONFLICT (plan_type, feature_id) DO NOTHING;

-- =====================================================
-- Verification
-- =====================================================
-- To verify the changes, run:
-- SELECT * FROM features ORDER BY key;
-- SELECT pf.plan_type, f.key, f.name, pf.limit_value 
-- FROM plan_features pf
-- JOIN features f ON pf.feature_id = f.id
-- ORDER BY pf.plan_type, f.key;

