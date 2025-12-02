-- =====================================================
-- Verify Admin Function Exists
-- =====================================================
-- This script verifies that the get_user_emails function
-- exists and can be called.
--
-- Run this in Supabase SQL Editor
-- =====================================================

-- Step 1: Check if function exists
-- =====================================================
SELECT 
  routine_name,
  routine_type,
  data_type as return_type
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name = 'get_user_emails';

-- Step 2: Test the function (replace with actual user IDs from your database)
-- =====================================================
-- First, get some user IDs to test with:
SELECT user_id 
FROM profiles 
LIMIT 5;

-- Then test the function (replace the UUIDs with actual ones from above):
-- SELECT * FROM get_user_emails(ARRAY[
--   'user-id-1'::UUID,
--   'user-id-2'::UUID
-- ]);

-- Step 3: Check permissions
-- =====================================================
SELECT 
  grantee,
  privilege_type
FROM information_schema.routine_privileges
WHERE routine_name = 'get_user_emails';

