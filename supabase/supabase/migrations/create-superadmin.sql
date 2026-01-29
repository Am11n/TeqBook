-- =====================================================
-- Create Super Admin User
-- =====================================================
-- This SQL script sets a user as superadmin.
-- 
-- IMPORTANT: The user must already exist in Supabase Auth.
-- To create the user first, you can either:
-- 
-- Option 1: Use Supabase Dashboard
-- 1. Go to Authentication > Users in your Supabase dashboard
-- 2. Click "Add user" > "Create new user"
-- 3. Enter email: admin@teqbook.com
-- 4. Enter password: Test123
-- 5. Click "Create user"
-- 
-- Option 2: Use Supabase CLI (if you have it installed)
-- supabase auth users create admin@teqbook.com --password Test123
--
-- Then run this SQL script to set the user as superadmin.
-- =====================================================

-- Step 1: Find the user by email and get their user_id
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
    RAISE EXCEPTION 'User with email admin@teqbook.com does not exist. Please create the user first in Supabase Auth (Authentication > Users).';
  END IF;

  -- Step 2: Ensure profile exists for this user
  -- =====================================================
  -- Ensure profile exists for this user
  INSERT INTO profiles (user_id, salon_id, role, is_superadmin)
  VALUES (target_user_id, NULL, 'superadmin', TRUE)
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    is_superadmin = TRUE,
    salon_id = NULL, -- Superadmins don't need a salon_id
    role = 'superadmin'; -- Superadmins should have role 'superadmin', not 'owner'
END $$;

-- =====================================================
-- Verification
-- =====================================================
-- To verify the user is now a superadmin, run:
-- SELECT 
--   u.email,
--   p.is_superadmin,
--   p.role,
--   p.salon_id
-- FROM auth.users u
-- LEFT JOIN profiles p ON u.id = p.user_id
-- WHERE u.email = 'admin@teqbook.com';

