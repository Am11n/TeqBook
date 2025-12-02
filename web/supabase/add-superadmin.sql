-- =====================================================
-- Add Super Admin Support to Profiles
-- =====================================================
-- This SQL script adds the is_superadmin column to
-- the profiles table for SaaS admin functionality.
--
-- Run this in Supabase SQL Editor
-- =====================================================

-- Step 1: Add is_superadmin column to profiles table
-- =====================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'is_superadmin'
  ) THEN
    ALTER TABLE profiles ADD COLUMN is_superadmin BOOLEAN DEFAULT FALSE NOT NULL;
    
    -- Add comment to document the column
    COMMENT ON COLUMN profiles.is_superadmin IS 
      'Whether this user is a super admin with access to the admin dashboard and all salons.';
  END IF;
END $$;

-- Step 2: Create index for faster queries
-- =====================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'profiles' AND indexname = 'profiles_is_superadmin_idx'
  ) THEN
    CREATE INDEX profiles_is_superadmin_idx ON profiles(is_superadmin) 
    WHERE is_superadmin = TRUE;
  END IF;
END $$;

-- Step 3: Add RLS policy for super admins
-- =====================================================
-- Super admins should be able to view all profiles
-- (This is a basic policy - adjust based on your security requirements)

DO $$
BEGIN
  -- Drop existing policy if it exists
  DROP POLICY IF EXISTS "Super admins can view all profiles" ON profiles;
  
  -- Create policy for super admins
  CREATE POLICY "Super admins can view all profiles"
    ON profiles
    FOR SELECT
    USING (
      EXISTS (
        SELECT 1 FROM profiles 
        WHERE user_id = auth.uid() 
        AND is_superadmin = TRUE
      )
    );
END $$;

-- =====================================================
-- Verification
-- =====================================================
-- To verify the column was added, run:
-- SELECT column_name, data_type, is_nullable, column_default
-- FROM information_schema.columns 
-- WHERE table_name = 'profiles' AND column_name = 'is_superadmin';
--
-- To set a user as super admin (replace 'user-id-here' with actual user ID):
-- UPDATE profiles SET is_superadmin = TRUE WHERE user_id = 'user-id-here';

