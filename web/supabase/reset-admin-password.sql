-- =====================================================
-- Reset Admin Password - Instructions
-- =====================================================
-- This script verifies the admin user exists and provides
-- instructions for resetting the password.
--
-- IMPORTANT: You cannot directly set passwords via SQL in Supabase.
-- You must use one of the methods below.
-- =====================================================

-- Step 1: Verify user exists
-- =====================================================
SELECT 
  id,
  email,
  encrypted_password IS NOT NULL as has_password,
  email_confirmed_at IS NOT NULL as email_confirmed,
  email_confirmed_at,
  created_at
FROM auth.users
WHERE email = 'admin@teqbook.com';

-- Step 2: Check profile
-- =====================================================
SELECT 
  p.user_id,
  p.role,
  p.is_superadmin,
  p.salon_id,
  u.email
FROM profiles p
JOIN auth.users u ON p.user_id = u.id
WHERE u.email = 'admin@teqbook.com';

-- =====================================================
-- HOW TO RESET PASSWORD:
-- =====================================================
-- 
-- Method 1: Via Supabase Dashboard (RECOMMENDED)
-- ----------------------------------------------
-- 1. Go to Supabase Dashboard > Authentication > Users
-- 2. Find the user "admin@teqbook.com"
-- 3. Click the "..." menu (three dots) next to the user
-- 4. Click "Reset password"
-- 5. Enter new password: Test123
-- 6. Click "Update user"
--
-- Method 2: Delete and Recreate User
-- -----------------------------------
-- 1. Go to Supabase Dashboard > Authentication > Users
-- 2. Find the user "admin@teqbook.com"
-- 3. Click the "..." menu > "Delete user"
-- 4. Click "Add user" > "Create new user"
-- 5. Email: admin@teqbook.com
-- 6. Password: Test123
-- 7. Click "Create user"
-- 8. Then run create-superadmin.sql to set up the profile
--
-- Method 3: Use Supabase CLI (if installed)
-- -----------------------------------------
-- supabase auth users update admin@teqbook.com --password Test123
--
-- =====================================================
-- After resetting password, verify with:
-- =====================================================
-- SELECT 
--   u.email,
--   u.email_confirmed_at IS NOT NULL as email_confirmed,
--   u.encrypted_password IS NOT NULL as has_password,
--   p.is_superadmin,
--   p.role
-- FROM auth.users u
-- LEFT JOIN profiles p ON u.id = p.user_id
-- WHERE u.email = 'admin@teqbook.com';

