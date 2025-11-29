-- =====================================================
-- Onboarding Schema Update
-- =====================================================
-- This SQL script adds new columns to the salons table
-- and updates the create_salon_for_current_user function
-- to support the new onboarding wizard fields.
--
-- Run this in Supabase SQL Editor
-- =====================================================

-- Step 1: Add new columns to salons table
-- =====================================================

-- Add salon_type column (text, nullable, default 'barber')
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'salons' AND column_name = 'salon_type'
  ) THEN
    ALTER TABLE salons ADD COLUMN salon_type TEXT DEFAULT 'barber';
  END IF;
  
  -- Add constraint if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_name = 'salons' AND constraint_name = 'salon_type_check'
  ) THEN
    ALTER TABLE salons ADD CONSTRAINT salon_type_check 
      CHECK (salon_type IS NULL OR salon_type IN ('barber', 'nails', 'massage', 'other'));
  END IF;
END $$;

-- Add preferred_language column (text, nullable, default 'nb')
-- This should match the AppLocale type from translations.ts
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'salons' AND column_name = 'preferred_language'
  ) THEN
    ALTER TABLE salons ADD COLUMN preferred_language TEXT DEFAULT 'nb';
  END IF;
  
  -- Add constraint if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_name = 'salons' AND constraint_name = 'preferred_language_check'
  ) THEN
    ALTER TABLE salons ADD CONSTRAINT preferred_language_check 
      CHECK (preferred_language IS NULL OR preferred_language IN ('nb', 'en', 'ar', 'so', 'ti', 'am', 'tr', 'pl', 'vi', 'tl', 'zh', 'fa', 'dar', 'ur', 'hi'));
  END IF;
END $$;

-- Add online_booking_enabled column (boolean, default false)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'salons' AND column_name = 'online_booking_enabled'
  ) THEN
    ALTER TABLE salons ADD COLUMN online_booking_enabled BOOLEAN DEFAULT false;
  END IF;
END $$;

-- Ensure is_public column exists and has a default
-- (This column should already exist, but we'll ensure it has a default)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'salons' AND column_name = 'is_public'
  ) THEN
    ALTER TABLE salons ALTER COLUMN is_public SET DEFAULT true;
  ELSE
    ALTER TABLE salons ADD COLUMN is_public BOOLEAN DEFAULT true;
  END IF;
END $$;

-- Add comments to columns for documentation
COMMENT ON COLUMN salons.salon_type IS 'Type of salon: barber, nails, massage, or other';
COMMENT ON COLUMN salons.preferred_language IS 'Preferred language for staff interface (matches AppLocale)';
COMMENT ON COLUMN salons.online_booking_enabled IS 'Whether online booking is enabled for this salon';
COMMENT ON COLUMN salons.is_public IS 'Whether the public booking page is active for this salon';

-- =====================================================
-- Step 2: Update create_salon_for_current_user function
-- =====================================================

-- Drop the existing function if it exists (handles both old and new signatures)
DROP FUNCTION IF EXISTS create_salon_for_current_user(TEXT);
DROP FUNCTION IF EXISTS create_salon_for_current_user(TEXT, TEXT, TEXT, BOOLEAN, BOOLEAN);

-- Create the updated function with all new parameters
CREATE OR REPLACE FUNCTION create_salon_for_current_user(
  salon_name TEXT,
  salon_type_param TEXT DEFAULT 'barber',
  preferred_language_param TEXT DEFAULT 'nb',
  online_booking_enabled_param BOOLEAN DEFAULT false,
  is_public_param BOOLEAN DEFAULT true
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_salon_id UUID;
  v_slug TEXT;
BEGIN
  -- Get the current authenticated user
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User must be authenticated';
  END IF;

  -- Generate a slug from the salon name
  -- Simple slug generation: lowercase, replace spaces with hyphens, remove special chars
  v_slug := lower(regexp_replace(regexp_replace(salon_name, '[^a-zA-Z0-9\s-]', '', 'g'), '\s+', '-', 'g'));
  
  -- Ensure slug is unique by appending a number if needed
  WHILE EXISTS (SELECT 1 FROM salons WHERE slug = v_slug) LOOP
    v_slug := v_slug || '-' || floor(random() * 1000)::TEXT;
  END LOOP;

  -- Create the salon
  INSERT INTO salons (
    name,
    slug,
    salon_type,
    preferred_language,
    online_booking_enabled,
    is_public,
    created_at,
    updated_at
  )
  VALUES (
    salon_name,
    v_slug,
    COALESCE(salon_type_param, 'barber'),
    COALESCE(preferred_language_param, 'nb'),
    COALESCE(online_booking_enabled_param, false),
    COALESCE(is_public_param, true),
    NOW(),
    NOW()
  )
  RETURNING id INTO v_salon_id;

  -- Create or update the profile to link the user to the salon
  INSERT INTO profiles (
    user_id,
    salon_id,
    updated_at
  )
  VALUES (
    v_user_id,
    v_salon_id,
    NOW()
  )
  ON CONFLICT (user_id)
  DO UPDATE SET
    salon_id = v_salon_id,
    updated_at = NOW();

  RETURN v_salon_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION create_salon_for_current_user(TEXT, TEXT, TEXT, BOOLEAN, BOOLEAN) TO authenticated;

-- =====================================================
-- Step 3: Update RLS policies if needed
-- =====================================================
-- The existing RLS policies should still work, but we ensure
-- that users can read the new columns on their own salon

-- Verify that salons table has proper RLS enabled
ALTER TABLE salons ENABLE ROW LEVEL SECURITY;

-- Note: If you have existing RLS policies, they should already cover
-- the new columns. If not, you may need to update them.
-- Example policy (adjust based on your existing policies):
-- 
-- CREATE POLICY "Users can view their own salon"
-- ON salons FOR SELECT
-- USING (
--   id IN (
--     SELECT salon_id FROM profiles WHERE user_id = auth.uid()
--   )
-- );

-- =====================================================
-- Verification queries (optional - run these to verify)
-- =====================================================

-- Check that columns were added
-- SELECT column_name, data_type, column_default
-- FROM information_schema.columns
-- WHERE table_name = 'salons'
-- AND column_name IN ('salon_type', 'preferred_language', 'online_booking_enabled', 'is_public')
-- ORDER BY column_name;

-- Check that function was created
-- SELECT routine_name, routine_type
-- FROM information_schema.routines
-- WHERE routine_schema = 'public'
-- AND routine_name = 'create_salon_for_current_user';

