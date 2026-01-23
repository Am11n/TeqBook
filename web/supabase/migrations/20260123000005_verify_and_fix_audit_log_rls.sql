-- =====================================================
-- Verify and Fix Security Audit Log RLS Policy
-- =====================================================
-- This migration verifies current policies and ensures they work correctly
-- Run this to fix the RLS policy issue
-- =====================================================

-- Step 1: Drop ALL existing insert policies to start fresh
DROP POLICY IF EXISTS "Users can insert audit logs" ON security_audit_log;
DROP POLICY IF EXISTS "Anonymous audit logs allowed" ON security_audit_log;
DROP POLICY IF EXISTS "Service role can insert audit logs" ON security_audit_log;

-- Step 2: Recreate service role policy (needed for server-side operations)
CREATE POLICY "Service role can insert audit logs"
  ON security_audit_log
  FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

-- Step 3: Create the main policy for authenticated users
-- This policy allows any authenticated user with salon access to log
-- IMPORTANT: In WITH CHECK, we use salon_id directly (not security_audit_log.salon_id)
CREATE POLICY "Users can insert audit logs"
  ON security_audit_log
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND salon_id IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
        AND profiles.salon_id = salon_id
    )
  );

-- Step 4: Anonymous policy for public booking pages
CREATE POLICY "Anonymous audit logs allowed"
  ON security_audit_log
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NULL 
    AND user_id IS NULL 
    AND salon_id IS NOT NULL
  );

-- Step 5: Add comments
COMMENT ON POLICY "Users can insert audit logs" ON security_audit_log IS 
  'Allows authenticated users to insert audit logs for salons they have access to.';

COMMENT ON POLICY "Anonymous audit logs allowed" ON security_audit_log IS 
  'Allows anonymous users to insert audit logs for public booking pages.';
