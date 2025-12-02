-- =====================================================
-- Check Profiles Table Errors
-- =====================================================
-- This script helps diagnose why profiles queries are failing
-- with 500 errors.
--
-- Run this in Supabase SQL Editor
-- =====================================================

-- Step 1: Check if is_superadmin column exists
-- =====================================================
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'profiles'
AND column_name = 'is_superadmin';

-- Step 2: Check RLS status
-- =====================================================
SELECT 
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename = 'profiles';

-- Step 3: List all RLS policies on profiles
-- =====================================================
SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'profiles';

-- Step 4: Test if we can query profiles directly (bypassing RLS)
-- =====================================================
-- This should work if RLS is the issue
SET row_security = off;
SELECT user_id, salon_id, is_superadmin 
FROM profiles 
LIMIT 5;
SET row_security = on;

-- Step 5: Check if there are any triggers that might cause issues
-- =====================================================
SELECT 
  trigger_name,
  event_manipulation,
  action_statement
FROM information_schema.triggers
WHERE event_object_table = 'profiles';

-- Step 6: Check for any constraints that might fail
-- =====================================================
SELECT 
  constraint_name,
  constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'profiles';

-- =====================================================
-- Common Issues and Solutions:
-- =====================================================
-- 1. If is_superadmin column doesn't exist:
--    Run: add-superadmin.sql
--
-- 2. If RLS policies have circular references:
--    Run: fix-profiles-rls.sql (updated version)
--
-- 3. If there are constraint violations:
--    Check the constraint_name and fix the data
--
-- 4. If triggers are causing issues:
--    Check the trigger action_statement

