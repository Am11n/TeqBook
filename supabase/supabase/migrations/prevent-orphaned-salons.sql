-- =====================================================
-- Prevent Orphaned Salons
-- =====================================================
-- This script adds constraints and triggers to ensure
-- that all salons always have an owner (profile with salon_id).
--
-- Run this in Supabase SQL Editor
-- =====================================================

-- Step 1: Create a function to check if salon has owner
-- =====================================================
CREATE OR REPLACE FUNCTION check_salon_has_owner()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Check if there's at least one profile with this salon_id
  IF NOT EXISTS (
    SELECT 1 
    FROM profiles 
    WHERE salon_id = NEW.id
  ) THEN
    RAISE EXCEPTION 'Salon must have at least one owner. A profile with salon_id must be created when salon is created.';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Step 2: Create trigger to check after salon is created
-- =====================================================
DROP TRIGGER IF EXISTS ensure_salon_has_owner ON salons;
CREATE TRIGGER ensure_salon_has_owner
  AFTER INSERT ON salons
  FOR EACH ROW
  EXECUTE FUNCTION check_salon_has_owner();

-- Step 3: Create a function to prevent deleting the last owner
-- =====================================================
CREATE OR REPLACE FUNCTION prevent_delete_last_owner()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  owner_count INTEGER;
BEGIN
  -- Count remaining owners for this salon
  SELECT COUNT(*) INTO owner_count
  FROM profiles
  WHERE salon_id = OLD.salon_id
  AND user_id != OLD.user_id;
  
  -- If this is the last owner, prevent deletion
  IF owner_count = 0 THEN
    RAISE EXCEPTION 'Cannot delete the last owner of a salon. Salon must have at least one owner.';
  END IF;
  
  RETURN OLD;
END;
$$;

-- Step 4: Create trigger to prevent deleting last owner
-- =====================================================
DROP TRIGGER IF EXISTS prevent_delete_last_salon_owner ON profiles;
CREATE TRIGGER prevent_delete_last_salon_owner
  BEFORE DELETE ON profiles
  FOR EACH ROW
  WHEN (OLD.salon_id IS NOT NULL)
  EXECUTE FUNCTION prevent_delete_last_owner();

-- Step 5: Create a function to prevent setting salon_id to NULL if it's the only owner
-- =====================================================
CREATE OR REPLACE FUNCTION prevent_nullify_last_owner()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  owner_count INTEGER;
BEGIN
  -- Only check if salon_id is being set to NULL
  IF NEW.salon_id IS NULL AND OLD.salon_id IS NOT NULL THEN
    -- Count remaining owners for this salon
    SELECT COUNT(*) INTO owner_count
    FROM profiles
    WHERE salon_id = OLD.salon_id
    AND user_id != OLD.user_id;
    
    -- If this is the last owner, prevent nullification
    IF owner_count = 0 THEN
      RAISE EXCEPTION 'Cannot remove the last owner of a salon. Salon must have at least one owner.';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Step 6: Create trigger to prevent nullifying last owner
-- =====================================================
DROP TRIGGER IF EXISTS prevent_nullify_last_salon_owner ON profiles;
CREATE TRIGGER prevent_nullify_last_salon_owner
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  WHEN (OLD.salon_id IS NOT NULL)
  EXECUTE FUNCTION prevent_nullify_last_owner();

-- =====================================================
-- Verification
-- =====================================================
-- Check that triggers are created:
-- SELECT 
--   trigger_name,
--   event_manipulation,
--   event_object_table
-- FROM information_schema.triggers
-- WHERE trigger_name IN (
--   'ensure_salon_has_owner',
--   'prevent_delete_last_salon_owner',
--   'prevent_nullify_last_salon_owner'
-- );

