-- =====================================================
-- Fix Admin User Authentication Issues
-- =====================================================
-- This SQL script helps diagnose and fix authentication
-- issues for the admin@teqbook.com user.
--
-- Run this in Supabase SQL Editor
-- =====================================================

-- Step 1: Check if user exists and their status
-- =====================================================
SELECT 
  id,
  email,
  encrypted_password IS NOT NULL as has_password,
  email_confirmed_at IS NOT NULL as email_confirmed,
  email_confirmed_at,
  created_at,
  updated_at,
  last_sign_in_at
FROM auth.users
WHERE email = 'admin@teqbook.com';

-- Step 2: If user doesn't exist or email is not confirmed, fix it
-- =====================================================
DO $$
DECLARE
  target_user_id UUID;
BEGIN
  -- Get user_id
  SELECT id INTO target_user_id
  FROM auth.users
  WHERE email = 'admin@teqbook.com'
  LIMIT 1;

  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'User admin@teqbook.com does not exist. Please create the user first in Supabase Dashboard (Authentication > Users > Add user).';
  END IF;

  -- Confirm the email if not already confirmed
  -- Note: confirmed_at is a generated column and cannot be updated directly
  UPDATE auth.users
  SET 
    email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
    updated_at = NOW()
  WHERE id = target_user_id
    AND email_confirmed_at IS NULL;

  IF FOUND THEN
    RAISE NOTICE 'Email confirmation status updated for admin@teqbook.com';
  ELSE
    RAISE NOTICE 'User admin@teqbook.com is already confirmed.';
  END IF;

  -- Ensure profile exists
  INSERT INTO profiles (user_id, salon_id, role, is_superadmin)
  VALUES (target_user_id, NULL, 'superadmin', TRUE)
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    is_superadmin = TRUE,
    salon_id = NULL,
    role = 'superadmin';

  RAISE NOTICE 'Profile verified/created for admin@teqbook.com';
END $$;

-- Step 3: Verify the fix
-- =====================================================
SELECT 
  u.id,
  u.email,
  u.email_confirmed_at IS NOT NULL as email_confirmed,
  u.email_confirmed_at,
  p.is_superadmin,
  p.role,
  p.salon_id
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.user_id
WHERE u.email = 'admin@teqbook.com';

-- =====================================================
-- IMPORTANT NOTES:
-- =====================================================
-- 1. If the user still can't log in after running this script:
--    - Check that the password is correct (Test123)
--    - Try resetting the password in Supabase Dashboard
--    - Make sure email confirmation is disabled in Auth settings
--      (Authentication > Settings > Email > "Enable email confirmations" = OFF)
--
-- 2. To reset the password manually:
--    - Go to Supabase Dashboard > Authentication > Users
--    - Find admin@teqbook.com
--    - Click "..." menu > "Reset password"
--    - Or use: UPDATE auth.users SET encrypted_password = crypt('Test123', gen_salt('bf')) WHERE email = 'admin@teqbook.com';
--
-- 3. To disable email confirmation temporarily:
--    - Go to Supabase Dashboard > Authentication > Settings > Email
--    - Turn OFF "Enable email confirmations"
--    - This allows users to log in without confirming their email

