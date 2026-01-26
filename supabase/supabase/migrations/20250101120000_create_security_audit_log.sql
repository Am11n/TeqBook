-- =====================================================
-- Create Security Audit Log Table
-- =====================================================
-- This table stores security audit logs for compliance
-- and security monitoring
-- =====================================================

CREATE TABLE IF NOT EXISTS security_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  salon_id UUID REFERENCES salons(id) ON DELETE SET NULL,
  action TEXT NOT NULL, -- e.g., 'login_failed', 'plan_changed', 'user_deleted'
  resource_type TEXT NOT NULL, -- e.g., 'auth', 'billing', 'admin', 'booking'
  resource_id TEXT, -- ID of the resource affected (e.g., booking_id, subscription_id)
  metadata JSONB, -- Additional context data
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_security_audit_log_user_id ON security_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_security_audit_log_salon_id ON security_audit_log(salon_id);
CREATE INDEX IF NOT EXISTS idx_security_audit_log_action ON security_audit_log(action);
CREATE INDEX IF NOT EXISTS idx_security_audit_log_resource_type ON security_audit_log(resource_type);
CREATE INDEX IF NOT EXISTS idx_security_audit_log_created_at ON security_audit_log(created_at);
CREATE INDEX IF NOT EXISTS idx_security_audit_log_resource_id ON security_audit_log(resource_id) WHERE resource_id IS NOT NULL;

-- Composite index for common queries
CREATE INDEX IF NOT EXISTS idx_security_audit_log_salon_action ON security_audit_log(salon_id, action) WHERE salon_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_security_audit_log_user_action ON security_audit_log(user_id, action) WHERE user_id IS NOT NULL;

-- Function to automatically update timestamps (if needed in future)
-- Note: created_at is set by DEFAULT, so no trigger needed

-- RLS Policies
-- Only superadmins can read audit logs
ALTER TABLE security_audit_log ENABLE ROW LEVEL SECURITY;

-- Policy: Only superadmins can read audit logs
CREATE POLICY "Superadmins can read audit logs"
  ON security_audit_log
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
        AND profiles.is_superadmin = true
    )
  );

-- Policy: Service role can insert audit logs (for Edge Functions)
CREATE POLICY "Service role can insert audit logs"
  ON security_audit_log
  FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

-- Policy: Authenticated users can insert their own audit logs (for client-side logging)
-- This allows services to log events on behalf of users
CREATE POLICY "Users can insert audit logs"
  ON security_audit_log
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL AND (
      -- User can log their own actions
      user_id = auth.uid() OR
      -- User can log actions for their salon
      EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.user_id = auth.uid()
          AND profiles.salon_id = security_audit_log.salon_id
      )
    )
  );

-- Policy: No updates or deletes allowed (immutable audit log)
CREATE POLICY "No updates to audit logs"
  ON security_audit_log
  FOR UPDATE
  USING (false);

CREATE POLICY "No deletes to audit logs"
  ON security_audit_log
  FOR DELETE
  USING (false);

-- Function to clean up old audit logs (optional, for retention policy)
-- Note: This should be run carefully based on compliance requirements
CREATE OR REPLACE FUNCTION cleanup_old_audit_logs(retention_days INTEGER DEFAULT 365)
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM security_audit_log
  WHERE created_at < NOW() - (retention_days || ' days')::INTERVAL;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comments for documentation
COMMENT ON TABLE security_audit_log IS 'Security audit log for compliance and security monitoring. Immutable log of all sensitive operations.';
COMMENT ON COLUMN security_audit_log.user_id IS 'User who performed the action (NULL for system actions)';
COMMENT ON COLUMN security_audit_log.salon_id IS 'Salon context for the action (NULL for global actions)';
COMMENT ON COLUMN security_audit_log.action IS 'Action performed (e.g., login_failed, plan_changed, user_deleted)';
COMMENT ON COLUMN security_audit_log.resource_type IS 'Type of resource affected (e.g., auth, billing, admin, booking)';
COMMENT ON COLUMN security_audit_log.resource_id IS 'ID of the specific resource affected (e.g., booking_id, subscription_id)';
COMMENT ON COLUMN security_audit_log.metadata IS 'Additional context data as JSON (e.g., {email: "user@example.com", reason: "Invalid password"})';
COMMENT ON COLUMN security_audit_log.ip_address IS 'IP address of the request';
COMMENT ON COLUMN security_audit_log.user_agent IS 'User agent string from the request';
COMMENT ON COLUMN security_audit_log.created_at IS 'Timestamp when the action occurred (immutable)';

