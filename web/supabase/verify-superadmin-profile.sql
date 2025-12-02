-- =====================================================
-- Verify and Fix Super Admin Profile
-- =====================================================
-- This SQL script verifies that the superadmin user
-- has a profile and fixes any issues.
--
-- Run this in Supabase SQL Editor
-- =====================================================

-- Step 1: Check if the user exists in auth.users
-- =====================================================
SELECT 
  id,
  email,
  email_confirmed_at,
  created_at
FROM auth.users
WHERE email = 'admin@teqbook.com';

-- Step 2: Check if the profile exists
-- =====================================================
SELECT 
  p.user_id,
  p.salon_id,
  p.role,
  p.is_superadmin,
  p.created_at,
  u.email
FROM profiles p
JOIN auth.users u ON p.user_id = u.id
WHERE u.email = 'admin@teqbook.com';

-- Step 3: If profile doesn't exist, create it
-- =====================================================
DO $$
DECLARE
  target_user_id UUID;
BEGIN
  -- Get user_id from auth.users table
  SELECT id INTO target_user_id
  FROM auth.users
  WHERE email = 'admin@teqbook.com'
  LIMIT 1;

  -- If user doesn't exist, raise an error
  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'User with email admin@teqbook.com does not exist in auth.users. Please create the user first in Supabase Auth (Authentication > Users).';
  END IF;

  -- Create or update profile
  INSERT INTO profiles (user_id, salon_id, role, is_superadmin)
  VALUES (target_user_id, NULL, 'superadmin', TRUE)
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    is_superadmin = TRUE,
    salon_id = NULL,
    role = 'superadmin';

  RAISE NOTICE 'Profile for admin@teqbook.com has been created/updated.';
END $$;

-- Step 4: Verify RLS policies allow the user to read their own profile
-- =====================================================
-- Check existing policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'profiles';

-- =====================================================
-- Verification Query
-- =====================================================
-- After running this script, verify with:
-- SELECT 
--   u.email,
--   u.email_confirmed_at,
--   p.role,
--   p.is_superadmin,
--   p.salon_id
-- FROM auth.users u
-- LEFT JOIN profiles p ON u.id = p.user_id
-- WHERE u.email = 'admin@teqbook.com';

