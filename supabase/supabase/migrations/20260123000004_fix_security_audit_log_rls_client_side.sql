-- =====================================================
-- Fix Security Audit Log RLS Policy for Client-Side Logging
-- =====================================================
-- ULTRA SIMPLE POLICY: Authenticated users with salon access can log
-- =====================================================

-- Drop ALL existing insert policies
DROP POLICY IF EXISTS "Users can insert audit logs" ON security_audit_log;
DROP POLICY IF EXISTS "Anonymous audit logs allowed" ON security_audit_log;
DROP POLICY IF EXISTS "Service role can insert audit logs" ON security_audit_log;

-- Recreate service role policy (needed for server-side operations)
CREATE POLICY "Service role can insert audit logs"
  ON security_audit_log
  FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

-- ULTRA SIMPLE: If user is authenticated AND has access to salon_id, allow insert
-- No restrictions on user_id - can be null, auth.uid(), or anything
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

-- Anonymous policy for public booking pages (unauthenticated)
CREATE POLICY "Anonymous audit logs allowed"
  ON security_audit_log
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NULL 
    AND user_id IS NULL 
    AND salon_id IS NOT NULL
  );

COMMENT ON POLICY "Users can insert audit logs" ON security_audit_log IS 
  'Allows authenticated users to insert audit logs for salons they have access to.';

COMMENT ON POLICY "Anonymous audit logs allowed" ON security_audit_log IS 
  'Allows anonymous users to insert audit logs for public booking pages.';
