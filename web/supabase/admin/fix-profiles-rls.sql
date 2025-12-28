-- =====================================================
-- Fix Profiles RLS Policies
-- =====================================================
-- This script ensures that users can read their own profile
-- and that superadmins can read all profiles.
--
-- Run this in Supabase SQL Editor
-- =====================================================

-- Step 1: Ensure is_superadmin column exists
-- =====================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'is_superadmin'
  ) THEN
    ALTER TABLE profiles ADD COLUMN is_superadmin BOOLEAN DEFAULT FALSE NOT NULL;
    RAISE NOTICE 'Added is_superadmin column to profiles table';
  END IF;
END $$;

-- Step 2: Ensure RLS is enabled on profiles table
-- =====================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Step 3: Drop existing policies that might cause issues
-- =====================================================
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Super admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP FUNCTION IF EXISTS is_superadmin();

-- Step 4: Create policy for users to view their own profile
-- =====================================================
CREATE POLICY "Users can view their own profile"
  ON profiles
  FOR SELECT
  USING (user_id = auth.uid());

-- Step 5: Create policy for superadmins to view all profiles
-- =====================================================
-- This policy allows superadmins to view all profiles
-- Note: We use a function to avoid circular references
CREATE OR REPLACE FUNCTION is_superadmin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM profiles
    WHERE user_id = auth.uid() 
    AND is_superadmin = TRUE
  );
END;
$$;

CREATE POLICY "Super admins can view all profiles"
  ON profiles
  FOR SELECT
  USING (is_superadmin());

-- Step 6: Create policy for users to update their own profile
-- =====================================================
CREATE POLICY "Users can update their own profile"
  ON profiles
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Step 7: Create policy for users to insert their own profile
-- =====================================================
CREATE POLICY "Users can insert their own profile"
  ON profiles
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- =====================================================
-- Verification
-- =====================================================
-- Check that policies are created:
-- SELECT 
--   policyname,
--   cmd,
--   qual
-- FROM pg_policies
-- WHERE tablename = 'profiles';

-- Test query (should work for authenticated users):
-- SELECT user_id, salon_id, is_superadmin 
-- FROM profiles 
-- WHERE user_id = auth.uid();

