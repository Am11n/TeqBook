-- =====================================================
-- Fix: Correct the prevent_nullify_last_salon_owner trigger
-- =====================================================
-- This migration fixes a bug where the UPDATE trigger was calling
-- the wrong function (prevent_delete_last_owner instead of 
-- prevent_nullify_last_owner).
--
-- Run this in Supabase SQL Editor
-- =====================================================

-- Drop the incorrectly configured trigger
DROP TRIGGER IF EXISTS prevent_nullify_last_salon_owner ON profiles;

-- Recreate the trigger with the correct function
CREATE TRIGGER prevent_nullify_last_salon_owner
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  WHEN (OLD.salon_id IS NOT NULL)
  EXECUTE FUNCTION prevent_nullify_last_owner();

-- =====================================================
-- Verification
-- =====================================================
-- Run this to verify the fix:
-- SELECT 
--   trigger_name,
--   event_manipulation,
--   action_statement
-- FROM information_schema.triggers
-- WHERE trigger_schema = 'public'
-- AND event_object_table = 'profiles';
--
-- Expected result for prevent_nullify_last_salon_owner:
-- action_statement should be: EXECUTE FUNCTION prevent_nullify_last_owner()
