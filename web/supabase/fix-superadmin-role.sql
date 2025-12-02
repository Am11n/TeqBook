-- =====================================================
-- Fix Super Admin Role
-- =====================================================
-- This SQL script updates an existing superadmin user
-- to have role = 'superadmin' instead of 'owner'.
--
-- Run this in Supabase SQL Editor
-- =====================================================

-- Update the superadmin user's role
UPDATE profiles
SET 
  role = 'superadmin',
  salon_id = NULL, -- Ensure salon_id is NULL for superadmins
  is_superadmin = TRUE
WHERE 
  is_superadmin = TRUE
  AND role != 'superadmin';

-- =====================================================
-- Verification
-- =====================================================
-- To verify the update, run:
-- SELECT 
--   u.email,
--   p.role,
--   p.is_superadmin,
--   p.salon_id
-- FROM auth.users u
-- LEFT JOIN profiles p ON u.id = p.user_id
-- WHERE p.is_superadmin = TRUE;

