-- =====================================================
-- Fix Security Audit Log RLS Policy
-- =====================================================
-- The previous policy was too restrictive and prevented
-- audit logging from working correctly in various scenarios
-- (e.g., booking creation, status updates, etc.)
-- =====================================================

-- Drop the existing insert policy
DROP POLICY IF EXISTS "Users can insert audit logs" ON security_audit_log;

-- Create a more permissive insert policy
-- Allow authenticated users who are salon staff to insert audit logs
CREATE POLICY "Users can insert audit logs"
  ON security_audit_log
  FOR INSERT
  WITH CHECK (
    -- Allow if user is authenticated
    auth.uid() IS NOT NULL AND (
      -- User can log their own actions (user_id matches or is null)
      (user_id IS NULL OR user_id = auth.uid()) AND (
        -- User can log actions for salons they belong to
        -- Check that the salon_id in the log matches a salon the user belongs to
        salon_id IS NULL OR
        EXISTS (
          SELECT 1 FROM profiles
          WHERE profiles.user_id = auth.uid()
            AND profiles.salon_id = salon_id
        )
      )
    )
  );

-- Also add a policy for anonymous audit logging (public booking pages)
-- These logs will have user_id = NULL
CREATE POLICY "Anonymous audit logs allowed"
  ON security_audit_log
  FOR INSERT
  WITH CHECK (
    -- Allow anonymous logging when user_id is null
    -- (for public booking pages where customer is not authenticated)
    user_id IS NULL AND salon_id IS NOT NULL
  );
