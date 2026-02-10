-- =====================================================
-- Migration: Add correlation_id + before/after to audit log
-- =====================================================

ALTER TABLE public.security_audit_log
  ADD COLUMN IF NOT EXISTS correlation_id UUID,
  ADD COLUMN IF NOT EXISTS before_state JSONB,
  ADD COLUMN IF NOT EXISTS after_state JSONB,
  ADD COLUMN IF NOT EXISTS ip_address TEXT,
  ADD COLUMN IF NOT EXISTS user_agent TEXT;

CREATE INDEX IF NOT EXISTS idx_audit_correlation ON public.security_audit_log(correlation_id)
  WHERE correlation_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_audit_action ON public.security_audit_log(action);
CREATE INDEX IF NOT EXISTS idx_audit_resource ON public.security_audit_log(resource_type);
